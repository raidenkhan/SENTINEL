from services.pdf_extractor import parse_pdf
from services.llm_analyzer import process_exam_text, detect_course
from services.db import supabase_client
from services.vector_store import index_questions

# Fallback syllabus context when a course has no syllabus stored yet.
# Generic on purpose — the old hardcoded EE-only list forced every paper
# (even Calculus or Programming) into electrical-engineering topics.
GENERIC_SYLLABUS_HINT = (
    "General engineering discipline fundamentals, core concepts, and "
    "problem-solving methods relevant to the course."
)

# A real course code looks like EE357 / MATH101 / CS205: 2-6 letters + 3-4 digits.
# Auto-CREATING a course is gated on this pattern so OCR noise or a generic
# faculty header ("Faculty of Engineering") can't spawn junk course records.
COURSE_CODE_PATTERN = r"^[A-Z]{2,6}\d{3,4}$"

import re


def _match_or_create_course(detected_code: str, detected_name: str,
                            department: str, level):
    """
    Looks up a course by code (case-insensitive) in Supabase and returns its row.
    If it doesn't exist and we have a solid code+name, creates it so papers
    uploaded before the course was added get categorized correctly.
    Returns (course_row | None, created: bool).
    """
    # Normalize: strip, uppercase, drop spaces ("MATH 101" -> "MATH101")
    code = "".join(detected_code.strip().upper().split())
    if not code:
        return None, False

    # 1) Try to match an existing course by code
    try:
        resp = supabase_client.table('courses').select('*').ilike('code', code).execute()
    except Exception as e:
        print(f"Course lookup failed ({e}); will try exact match...")
        resp = supabase_client.table('courses').select('*').eq('code', code).execute()

    if resp.data:
        return resp.data[0], False

    # 2) Not found — create it only when we have a real name AND the code
    #    looks like an actual course code (not a faculty/department header).
    name = (detected_name or "").strip()
    if not name:
        print(f"Detected code '{code}' but no name — skipping course creation.")
        return None, False
    if not re.match(COURSE_CODE_PATTERN, code):
        print(f"Detected code '{code}' doesn't look like a course code — "
              f"skipping auto-create (paper stays on its selected course).")
        return None, False

    try:
        insert_resp = supabase_client.table('courses').insert({
            'code': code,
            'name': name,
            'department': department or None,
            'level': level if level and level > 0 else None,
        }).execute()
        created = insert_resp.data[0]
        print(f"Created new course record: {code} - {name}")
        return created, True
    except Exception as e:
        print(f"Failed to create course {code}: {e}")
        # Race: another process may have created it between lookup and insert
        try:
            resp2 = supabase_client.table('courses').select('*').eq('code', code).execute()
            if resp2.data:
                return resp2.data[0], False
        except Exception:
            pass
        return None, False


def reclassify_paper(paper_id: str) -> dict:
    """
    Re-runs course detection on an EXISTING paper (downloads its PDF from
    storage, re-extracts the header, detects the course, retags it).

    Used to backfill papers that were mis-categorized before auto-detection
    existed (e.g. everything stuck on the single default course).
    Returns a dict describing what happened.
    """
    import urllib.request

    try:
        paper = supabase_client.table('exam_papers').select('id, file_url, course_id').eq('id', paper_id).single().execute()
        if not paper.data:
            return {"paper_id": paper_id, "status": "not_found"}

        file_url = paper.data.get('file_url')
        if not file_url:
            return {"paper_id": paper_id, "status": "no_file_url"}

        # Download the PDF bytes from storage
        req = urllib.request.Request(file_url, headers={'User-Agent': 'sentinel-reclassify'})
        with urllib.request.urlopen(req, timeout=60) as resp:
            file_bytes = resp.read()

        extracted_text, _ = parse_pdf(file_bytes)
        if not extracted_text:
            return {"paper_id": paper_id, "status": "no_text"}

        detected = detect_course(extracted_text)
        if not detected or detected.confidence not in ("high", "medium") or not detected.code:
            return {
                "paper_id": paper_id,
                "status": "no_detection",
                "detected": detected.code if detected else None,
                "confidence": detected.confidence if detected else None,
            }

        course_row, created = _match_or_create_course(
            detected.code, detected.name, detected.department, detected.level
        )
        if not course_row:
            return {
                "paper_id": paper_id,
                "status": "no_course_match",
                "detected_code": detected.code,
            }

        supabase_client.table('exam_papers').update({'course_id': course_row['id']}).eq('id', paper_id).execute()
        return {
            "paper_id": paper_id,
            "status": "reclassified",
            "from_course_id": paper.data.get('course_id'),
            "to_course": course_row.get('code'),
            "course_created": created,
        }
    except Exception as e:
        print(f"Reclassify failed for {paper_id}: {e}")
        return {"paper_id": paper_id, "status": "error", "error": str(e)}


def process_document_pipeline(
    file_bytes: bytes,
    file_name: str,
    course_id: str,
    course_code: str,
    course_name: str,
    department: str,
    year: int,
    semester: str,
    upload_id: str # Supabase exam_papers ID
):
    """
    Background task to process an uploaded PDF.
    - Extracts text
    - Auto-detects the course from the paper header (fixes mis-categorization)
    - Sends to DeepSeek for analysis
    - Saves structured questions to Supabase
    - Updates status to 'completed'

    NOTE: This is intentionally a *sync* function (no async/await).
    FastAPI/Starlette runs sync background tasks in a threadpool worker,
    so the heavy CPU/network work (PyMuPDF, OCR, LLM, embeddings) no longer
    blocks the event loop — otherwise every other request (status polls,
    chat, paper list) freezes while a paper is processing.
    """
    print(f"Starting background processing for upload_id: {upload_id}")
    
    try:
        # 1. Update status to 'processing'
        # 2. Extract Text & Diagrams (single-pass PDF parse)
        supabase_client.table('exam_papers').update({'processing_status': 'extracting'}).eq('id', upload_id).execute()
        print("Extracting text and diagrams from PDF...")
        extracted_text, diagram_data = parse_pdf(file_bytes)
        
        diagram_map = {} # local_id -> supabase_url
        
        if diagram_data:
            print(f"Found {len(diagram_data)} potential diagrams/assets. Uploading...")
            bucket_name = "exam-papers"
            for diag in diagram_data:
                try:
                    diag_path = f"diagrams/{upload_id}/{diag['id']}.{diag['extension']}"
                    supabase_client.storage.from_(bucket_name).upload(
                        path=diag_path,
                        file=diag['bytes'],
                        file_options={"content-type": f"image/{diag['extension']}"}
                    )
                    public_url = supabase_client.storage.from_(bucket_name).get_public_url(diag_path)
                    diagram_map[diag['id']] = public_url
                except Exception as upload_err:
                    print(f"Failed to upload diagram {diag['id']}: {upload_err}")

        if not extracted_text:
            raise Exception("No text found or OCR failed.")

        # ---------------------------------------------------------
        # 3. AUTO-CATEGORIZATION: detect the real course from the paper
        # ---------------------------------------------------------
        detected = detect_course(extracted_text)
        final_course_id = course_id          # uploaded course_id (fallback)
        final_code = course_code
        final_name = course_name
        final_department = department

        if detected and detected.confidence in ("high", "medium") and detected.code:
            course_row, created = _match_or_create_course(
                detected.code, detected.name, detected.department, detected.level
            )
            if course_row:
                final_course_id = course_row['id']
                final_code = course_row.get('code') or detected.code
                final_name = course_row.get('name') or detected.name
                final_department = course_row.get('department') or detected.department or department
                # Retag the paper row to the correct course
                try:
                    supabase_client.table('exam_papers').update(
                        {'course_id': final_course_id}
                    ).eq('id', upload_id).execute()
                    print(f"Paper retagged to course {final_code} ({final_name})")
                except Exception as tag_err:
                    print(f"Failed to retag paper course_id: {tag_err}")
            elif not created and not course_row:
                print("Course detection found nothing to match/create — keeping uploaded course.")

        # Syllabus context: prefer a stored syllabus if we have one,
        # otherwise fall back to a generic hint (no more EE-only bias).
        syllabus_topics = GENERIC_SYLLABUS_HINT
        if detected and detected.code:
            try:
                course_full = supabase_client.table('courses').select('*').eq('id', final_course_id).single().execute()
                stored = (course_full.data or {}).get('syllabus')
                if stored:
                    syllabus_topics = stored
            except Exception as e:
                print(f"Could not load syllabus for {final_code}: {e}")

        # Prepare diagram context for LLM
        diagram_context = ""
        if diagram_map:
            diagram_context = "\nAvailable Visual Assets (Diagrams/Images):\n"
            for d_id, d_url in diagram_map.items():
                diagram_context += f"- [ID: {d_id}] Location: {d_id} (refer to this ID if question depends on it)\n"

        # 4. Analyze Text using LLM
        supabase_client.table('exam_papers').update({'processing_status': 'analyzing'}).eq('id', upload_id).execute()
        print("Sending to LLM for structural analysis...")
        analysis_result = process_exam_text(
            exam_text=extracted_text + diagram_context,
            course_code=final_code,
            course_name=final_name,
            department=final_department,
            syllabus_topics=syllabus_topics
        )
        
        if not analysis_result:
             raise Exception("LLM Analysis returned None.")

        print(f"Successfully analyzed {len(analysis_result.questions)} questions.")

        # 5. Index into Vector Store for RAG
        supabase_client.table('exam_papers').update({'processing_status': 'indexing'}).eq('id', upload_id).execute()
        print("Indexing questions into vector database...")
        paper_metadata = {
            "upload_id": upload_id,
            "course_id": final_course_id,
            "course_code": final_code,
            "year": year,
            "semester": semester
        }
        index_questions(analysis_result.questions, paper_metadata)

        # 6. Store Questions into Supabase — batched into ONE round trip.
        #    Previously each question was a separate HTTPS request (N+1).
        question_rows = []
        for q in analysis_result.questions:
            question_rows.append({
                'paper_id': upload_id,
                'question_number': q.question_id,
                'raw_text': q.raw_text, 
                'topic': q.topic,
                'sub_topic': q.sub_topic,
                'blooms_level': q.blooms_level,
                'is_calculation_heavy': q.is_calculation_heavy,
                'weight': q.weight,
                'keywords': q.keywords,
                'diagram_url': diagram_map.get(q.diagram_id) if hasattr(q, 'diagram_id') and q.diagram_id else None
            })

        if question_rows:
            try:
                supabase_client.table('questions').insert(question_rows).execute()
            except Exception as e:
                print(f"Batch insert failed ({e}), falling back to individual inserts...")
                for row in question_rows:
                    try:
                        supabase_client.table('questions').insert(row).execute()
                    except Exception as row_err:
                        print(f"Failed to insert question {row['question_number']}: {row_err}")

        # 7. Update parent exam_paper record to completed
        supabase_client.table('exam_papers').update({
            'processing_status': 'completed',
            # 'ocr_accuracy': could be calculated here
        }).eq('id', upload_id).execute()
        
        print(f"Processing complete for upload_id: {upload_id}")

    except Exception as e:
        print(f"Error in processing pipeline: {e}")
         # Update status to 'failed'
        try:
             supabase_client.table('exam_papers').update({'processing_status': 'failed'}).eq('id', upload_id).execute()
        except Exception as db_err:
             print(f"Failed to update error status: {db_err}")
