from services.pdf_extractor import parse_pdf
from services.llm_analyzer import process_exam_text
from services.db import supabase_client
from services.vector_store import index_questions

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
    - Sends to Groq for analysis
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

        # Prepare diagram context for LLM
        diagram_context = ""
        if diagram_map:
            diagram_context = "\nAvailable Visual Assets (Diagrams/Images):\n"
            for d_id, d_url in diagram_map.items():
                diagram_context += f"- [ID: {d_id}] Location: {d_id} (refer to this ID if question depends on it)\n"

        # Simulate fetching syllabus topics from the DB
        dummy_syllabus = "Thevenin's Theorem, Fourier Transform, Op-Amp Circuits, Bode Plots, Lapalce Transforms"
        
        # 3. Analyze Text using LLM
        supabase_client.table('exam_papers').update({'processing_status': 'analyzing'}).eq('id', upload_id).execute()
        print("Sending to LLM for structural analysis...")
        analysis_result = process_exam_text(
            exam_text=extracted_text + diagram_context,
            course_code=course_code,
            course_name=course_name,
            department=department,
            syllabus_topics=dummy_syllabus
        )
        
        if not analysis_result:
             raise Exception("LLM Analysis returned None.")

        print(f"Successfully analyzed {len(analysis_result.questions)} questions.")

        # 4. Index into Vector Store for RAG
        supabase_client.table('exam_papers').update({'processing_status': 'indexing'}).eq('id', upload_id).execute()
        print("Indexing questions into vector database...")
        paper_metadata = {
            "upload_id": upload_id,
            "course_id": course_id,
            "course_code": course_code,
            "year": year,
            "semester": semester
        }
        index_questions(analysis_result.questions, paper_metadata)

        # 5. Store Questions into Supabase — batched into ONE round trip.
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

        # 6. Update parent exam_paper record to completed
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
