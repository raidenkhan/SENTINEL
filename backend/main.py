import os
import hashlib
import logging
from fastapi import FastAPI, BackgroundTasks, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
from postgrest.exceptions import APIError

from core.config import settings
from services.db import supabase_client
from services.pipeline import process_document_pipeline
from services.vector_store import similarity_search
from services.llm_analyzer import llm
from services.analytics_engine import AnalyticsEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for SENTINEL-EXAM",
    version=settings.VERSION,
)

from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache

@app.on_event("startup")
async def startup():
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")

# Robust CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Schemas
# ---------------------------------------------------------
class SearchResult(BaseModel):
    id: str
    title: str
    course_code: str
    year: int

class ChatRequest(BaseModel):
    message: str
    course_id: Optional[str] = None
    chat_history: Optional[List[Dict[str, str]]] = None

# ---------------------------------------------------------
# Utility Endpoints
# ---------------------------------------------------------

@app.get("/")
def read_root():
    return {"status": "ok", "message": f"{settings.PROJECT_NAME} API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# ---------------------------------------------------------
# Core Endpoints
# ---------------------------------------------------------

@app.post("/api/upload")
async def upload_exam_paper(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    course_id: str = Form(...),
    course_code: str = Form(...),
    course_name: str = Form(...),
    department: str = Form(...),
    year: int = Form(...),
    semester: str = Form(...)
):
    """
    Handles PDF upload. Validates format, checks MD5 duplication, 
    creates a DB record, and fires off the background LLM ingestion pipeline.
    """
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        file_bytes = await file.read()
        file_hash = hashlib.md5(file_bytes).hexdigest()

        # Check for duplicates
        existing = supabase_client.table('exam_papers').select('id').eq('file_hash', file_hash).execute()
        if existing.data:
            raise HTTPException(status_code=409, detail="This exact file has already been uploaded.")

        # 1. Upload to Supabase Storage
        storage_path = f"papers/{course_id}/{year}/{file.filename}"
        
        try:
            bucket_name = "exam-papers"
            # Ensure bucket exists (optional check if using anon key)
            supabase_client.storage.from_(bucket_name).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": "application/pdf"}
            )
            
            # Get public URL
            file_url_res = supabase_client.storage.from_(bucket_name).get_public_url(storage_path)
            file_url = file_url_res
        except Exception as storage_err:
            logger.error(f"Supabase Storage Error: {storage_err}")
            # Do NOT fallback, raise an error so the user knows upload failed
            raise HTTPException(
                status_code=500, 
                detail=f"Storage upload failed: {str(storage_err)}"
            )

        # Insert into database
        paper_data = {
            'course_id': course_id,
            'year': year,
            'semester': semester,
            'file_url': file_url,
            'file_hash': file_hash,
            'processing_status': 'pending'
        }

        insert_response = supabase_client.table('exam_papers').insert(paper_data).execute()
        
        if not insert_response.data:
            raise HTTPException(status_code=500, detail="Failed to create exam paper record")

        upload_id = insert_response.data[0]['id']

        # Trigger async background task
        background_tasks.add_task(
            process_document_pipeline,
            file_bytes=file_bytes,
            file_name=file.filename,
            course_id=course_id,
            course_code=course_code,
            course_name=course_name,
            department=department,
            year=year,
            semester=semester,
            upload_id=upload_id
        )

        return {"upload_id": upload_id, "status": "queued", "message": "File uploaded and queued for AI analysis."}
    except APIError as e:
        logger.error(f"Supabase API Error in upload: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e.message}")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/status/{upload_id}")
def get_processing_status(upload_id: str):
    """
    Polling endpoint for frontend to check text extraction + LLM status.
    """
    try:
        response = supabase_client.table('exam_papers').select('processing_status').eq('id', upload_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Upload ID not found")
        return {"upload_id": upload_id, "status": response.data[0]['processing_status']}
    except APIError as e:
        logger.error(f"Supabase API Error in status: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e.message}")
    except Exception as e:
        logger.error(f"Unexpected error in status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/papers")
def list_exam_papers():
    """
    Returns a list of all exam papers with their course info.
    """
    try:
        # Join with courses to get course name and code
        response = supabase_client.table('exam_papers').select('*, courses(name, code, department)').order('upload_date', desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Error listing papers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/papers/{paper_id}")
def get_paper_details(paper_id: str):
    """
    Returns details for a single paper including its questions.
    """
    try:
        paper = supabase_client.table('exam_papers').select('*, courses(*)').eq('id', paper_id).single().execute()
        questions = supabase_client.table('questions').select('*').eq('paper_id', paper_id).execute()
        return {
            "paper": paper.data,
            "questions": questions.data
        }
    except Exception as e:
        logger.error(f"Error getting paper details: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/papers/{paper_id}")
def delete_exam_paper(paper_id: str):
    """
    Deletes an exam paper and its associated questions.
    """
    try:
        # 1. Delete questions first (foreign key constraint)
        supabase_client.table('questions').delete().eq('paper_id', paper_id).execute()
        
        # 2. Delete the paper record
        supabase_client.table('exam_papers').delete().eq('id', paper_id).execute()
        
        # NOTE: In a full production app, we would also remove the file from Supabase Storage
        # and delete the corresponding embeddings from ChromaDB.
        
        return {"status": "success", "message": f"Paper {paper_id} deleted"}
    except Exception as e:
        logger.error(f"Error deleting paper: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/papers/{paper_id}/analytics")
def get_paper_analytics(paper_id: str):
    """
    Returns aggregated analytics for a specific paper.
    Useful for the Deep-Dive view.
    """
    try:
        # Get paper info and its questions
        paper_res = supabase_client.table('exam_papers').select('*, courses(*)').eq('id', paper_id).single().execute()
        questions_res = supabase_client.table('questions').select('*').eq('paper_id', paper_id).execute()
        
        if not paper_res.data:
            raise HTTPException(status_code=404, detail="Paper not found")
            
        questions = questions_res.data
        topic_counts = {}
        blooms_counts = {}
        calc_heavy_count = 0
        
        for q in questions:
            topic = q.get('topic')
            bloom = q.get('blooms_level')
            is_calc = q.get('is_calculation_heavy')
            
            if topic:
                topic_counts[topic] = topic_counts.get(topic, 0) + 1
            if bloom:
                blooms_counts[bloom] = blooms_counts.get(bloom, 0) + 1
            if is_calc:
                calc_heavy_count += 1
                
        return {
            "paper": paper_res.data,
            "stats": {
                "total_questions": len(questions),
                "topic_distribution": topic_counts,
                "blooms_distribution": blooms_counts,
                "calculation_heavy_percentage": (calc_heavy_count / len(questions) * 100) if questions else 0
            },
            "questions": questions
        }
    except Exception as e:
        logger.error(f"Error in paper analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class GradeRequest(BaseModel):
    paper_id: str
    question_id: str
    user_answer: str

class StudyPlanRequest(BaseModel):
    paper_id: Optional[str] = None
    course_id: Optional[str] = None

@app.post("/api/chat/grade")
async def grade_student_answer(request: GradeRequest):
    """
    Specialized RAG endpoint to grade a specific question answer.
    """
    try:
        # 1. Get the original question text
        question_res = supabase_client.table('questions').select('*').eq('id', request.question_id).single().execute()
        if not question_res.data:
            raise HTTPException(status_code=404, detail="Question not found")
            
        question_text = question_res.data.get('raw_text')
        
        # 2. Use RAG/LLM to grade
        prompt = f"""
        Role: You are an expert engineering professor.
        Task: Grade the student's answer based on the original question.
        
        Question: {question_text}
        Student Answer: {request.user_answer}
        
        Provide:
        1. A score out of 10.
        2. Constructive feedback.
        3. The correct/ideal answer key points.
        
        Return as JSON:
        {{
            "score": int,
            "feedback": "string",
            "ideal_points": ["string"]
        }}
        """
        
        response = llm.invoke(prompt)
        # Assuming llm.invoke returns a string that we need to clean/parse
        # In a real scenario, we'd use a structured output parser
        return {"result": response.content} # LangChain ChatGroq returns content
        
    except Exception as e:
        logger.error(f"Error in grading: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/study-plan")
async def generate_study_plan(request: StudyPlanRequest):
    """
    Generates a personalized study plan based on paper analytics.
    """
    try:
        if not request.paper_id and not request.course_id:
            raise HTTPException(status_code=400, detail="Either paper_id or course_id must be provided")

        analytics_data = None
        if request.paper_id:
            analytics_data = get_paper_analytics(request.paper_id)
        else:
            analytics_data = get_course_analytics(request.course_id)

        # Construct prompt for the Study Plan
        # We focus on weak topics (low frequency or complex Bloom's levels)
        topics = analytics_data.get("topic_frequencies", {})
        blooms = analytics_data.get("blooms_distribution", {})
        
        prompt = f"""
        Role: You are SENTINEL Intelligence Core.
        Task: Generate a high-intensity Study Plan based on these exam paper analytics:
        
        Analytics:
        - Topics Identified: {topics}
        - Bloom's Taxonomy Distribution: {blooms}
        
        Requirements:
        1. Identify the 'High-Yield' topics (most frequent).
        2. Identify 'Complex Areas' (Bloom's Level 4+).
        3. Provide a 3-step prioritized action plan.
        4. Recommend a mock session strategy.
        
        Tone: Professional, data-driven, and highly encouraging engineering coach.
        Format: Return as structured Markdown.
        """
        
        response = llm.invoke(prompt)
        return {"plan": response.content}
        
    except Exception as e:
        logger.error(f"Error generating study plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/{course_id}")
@cache(expire=60)
def get_course_analytics(course_id: str):
    """
    Fetches aggregated analytics for the Dashboard.
    Pulls calculated frequency counts of topics across years.
    """
    try:
        # Find all papers for this course
        papers_resp = supabase_client.table('exam_papers').select('id, year').eq('course_id', course_id).execute()
        
        if not papers_resp.data:
            return {
                "course_id": course_id, 
                "total_questions_parsed": 0,
                "topic_frequencies": {},
                "blooms_distribution": {},
                "message": "No data found for this course"
            }

        paper_ids = [p['id'] for p in papers_resp.data]
        paper_year_map = {p['id']: p['year'] for p in papers_resp.data}
        
        questions_resp = supabase_client.table('questions').select('*').in_('paper_id', paper_ids).execute()
        
        topics_count = {}
        blooms_count = {}
        year_trends = {} # year -> total_questions
        heatmap_data = {} # year -> topic -> count
        topic_year_history = {} # topic -> list of {"year": yr, "count": cnt}
        
        # Initialize heatmap with all years and 0s
        all_years = sorted(list(set(paper_year_map.values())))
        for yr in all_years:
            year_trends[yr] = 0
            heatmap_data[yr] = {}

        for q in questions_resp.data:
            pid = q.get('paper_id')
            year = paper_year_map.get(pid)
            topic = q.get('topic')
            bloom = q.get('blooms_level')
            
            if year:
                year_trends[year] = year_trends.get(year, 0) + 1
            
            if topic:
                topics_count[topic] = topics_count.get(topic, 0) + 1
                if year:
                    heatmap_data[year][topic] = heatmap_data[year].get(topic, 0) + 1
            
            if bloom:
                blooms_count[bloom] = blooms_count.get(bloom, 0) + 1

        # Transform trends into list for Recharts
        trends_list = [{"year": yr, "count": count} for yr, count in sorted(year_trends.items())]
        
        # Transform heatmap into matrix format for frontend
        unique_topics = sorted(list(topics_count.keys()), key=lambda x: topics_count[x], reverse=True)[:10]
        heatmap_matrix = []
        for topic in unique_topics:
            row = []
            for yr in all_years:
                # Intensity can be normalized later, for now raw count
                row.append(heatmap_data[yr].get(topic, 0))
            heatmap_matrix.append({"topic": topic, "values": row})
            
        # Calculate Academic Importance & Confidence
        topic_insights = []
        for topic in unique_topics:
            history = []
            for yr in all_years:
                count = heatmap_data[yr].get(topic, 0)
                if count > 0:
                    history.append({"year": yr, "count": count})
            
            weighted_score = AnalyticsEngine.calculate_weighted_score(history)
            confidence = AnalyticsEngine.calculate_prediction_confidence(history)
            
            topic_insights.append({
                "topic": topic,
                "importance": weighted_score,
                "confidence": confidence,
                "total_frequency": topics_count[topic]
            })

        return {
            "course_id": course_id,
            "total_questions_parsed": len(questions_resp.data),
            "topic_frequencies": topics_count,
            "blooms_distribution": blooms_count,
            "years": all_years,
            "trends": trends_list,
            "heatmap": heatmap_matrix,
            "topic_insights": topic_insights
        }
    except APIError as e:
        logger.error(f"Supabase API Error: {e}")
        return {
            "course_id": course_id,
            "total_questions_parsed": 0,
            "topic_frequencies": {},
            "blooms_distribution": {},
            "error": "Database error",
            "details": str(e)
        }
    except Exception as e:
        logger.error(f"Unexpected error in analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/community/trends")
@cache(expire=60)
def get_community_trends():
    """
    Returns global trending topics across all courses and uploads.
    """
    try:
        # Fetch a sample of recent questions to calculate global trends
        # In a massive DB, we'd use a view or a separate aggregation table
        resp = supabase_client.table('questions').select('topic').limit(1000).execute()
        
        if not resp.data:
            return {"trending_topics": [], "stats": {"total_papers": 0}}
            
        topics = {}
        for q in resp.data:
            t = q.get('topic')
            if t:
                topics[t] = topics.get(t, 0) + 1
        
        sorted_topics = sorted(topics.items(), key=lambda x: x[1], reverse=True)[:8]
        
        # Get total papers count
        papers_count = supabase_client.table('exam_papers').select('id', count='exact').execute()
        
        return {
            "trending_topics": [{"topic": k, "count": v} for k, v in sorted_topics],
            "stats": {
                "total_papers": papers_count.count if papers_count.count else 0,
                "active_subjects": len(set(topics.keys()))
            }
        }
    except Exception as e:
        logger.error(f"Community trends error: {e}")
        return {"trending_topics": [], "error": str(e)}


@app.post("/api/chat")
async def chat_with_assistant(request: ChatRequest):
    """
    RAG-powered chat endpoint with Community Fallback.
    """
    try:
        # 1. Similarity Search (with Fallback implemented in vector_store.py)
        context_docs = similarity_search(request.message, course_id=request.course_id, limit=4)
        
        context_text = ""
        has_community_sources = False
        
        if context_docs:
            context_text_parts = []
            for doc in context_docs:
                source_label = "INTERNAL" if doc.metadata.get("source_type") == "internal" else "COMMUNITY INSIGHT"
                if source_label == "COMMUNITY INSIGHT":
                    has_community_sources = True
                
                context_text_parts.append(
                    f"[{source_label}] Source: {doc.metadata.get('course_code')} ({doc.metadata.get('year')})\nContent: {doc.page_content}"
                )
            context_text = "\n\n".join(context_text_parts)
        else:
            context_text = "No direct question matches found in SENTINEL database."

        # 2. Construct Prompt (Dynamic based on source type)
        community_note = ""
        if has_community_sources:
            community_note = "\nNOTE: Some information was retrieved from external courses in the SENTINEL community database to provide broader insights."

        system_prompt = f"""
        Role: You are SENTINEL, an AI Study Assistant for Engineering students.
        Task: Answer the user's question using the provided context.{community_note}
        
        Context from Papers:
        {context_text}
        
        Guidelines:
        - If the context contains relevant information, use it. 
        - If using COMMUNITY INSIGHTS, mention that this point comes from related papers in the community database.
        - If the context doesn't have the answer, use your general engineering knowledge but label it as such.
        - Be technical, encouraging, and clear.
        """
        
        # 3. Call LLM
        messages = [
            ("system", system_prompt),
            ("user", request.message)
        ]
        
        response = llm.invoke(messages)
        return {
            "response": response.content, 
            "sources": [doc.metadata for doc in context_docs],
            "has_community_insights": has_community_sources
        }

    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
