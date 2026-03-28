import os
import logging
from typing import List, Dict, Any
from langchain_huggingface import HuggingFaceEmbeddings
from services.db import supabase_client

logger = logging.getLogger(__name__)

# Initialize embeddings model (runs locally)
embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def index_questions(questions: List[Any], paper_metadata: Dict[str, Any]):
    """
    Indexes parsed questions into Supabase pgvector.
    """
    logger.info(f"Indexing {len(questions)} questions into Supabase pgvector...")
    
    for q in questions:
        content = f"Question Text: {q.raw_text}\nTopic: {q.topic}\nSub-topic: {q.sub_topic}\nBloom's Level: {q.blooms_level}\nKeywords: {', '.join(q.keywords)}"
        
        # Generate embedding locally
        embedding = embeddings_model.embed_query(content)
        
        metadata = {
            "topic": q.topic,
            "blooms_level": q.blooms_level,
            "course_code": paper_metadata.get("course_code"),
            "year": paper_metadata.get("year")
        }
        
        data = {
            "question_id": str(q.question_id),
            "paper_id": paper_metadata.get("upload_id"),
            "course_id": paper_metadata.get("course_id"),
            "content": content,
            "metadata": metadata,
            "embedding": embedding
        }
        
        try:
            supabase_client.table('question_embeddings').insert(data).execute()
        except Exception as e:
            logger.error(f"Failed to insert embedding for question {q.question_id}: {e}")

def similarity_search(query: str, course_id: str = None, limit: int = 5):
    """
    Performs similarity search using Supabase RPC (pgvector).
    """
    # 1. Generate query embedding
    query_embedding = embeddings_model.embed_query(query)
    
    # 2. Call Supabase RPC function
    try:
        rpc_params = {
            "query_embedding": query_embedding,
            "match_threshold": 0.3, # Adjust based on testing
            "match_count": limit,
            "filter_course_id": course_id
        }
        
        res = supabase_client.rpc("match_questions", rpc_params).execute()
        
        if not res.data and course_id:
            # Fallback to global search if no local results
            logger.info("No local matches found, performing global search...")
            rpc_params["filter_course_id"] = None
            res = supabase_client.rpc("match_questions", rpc_params).execute()
            
        return res.data
    except Exception as e:
        logger.error(f"Similarity search failed: {e}")
        return []
