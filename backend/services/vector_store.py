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
    
    # Build all content strings first
    contents = []
    for q in questions:
        contents.append(
            f"Question Text: {q.raw_text}\nTopic: {q.topic}\nSub-topic: {q.sub_topic}\nBloom's Level: {q.blooms_level}\nKeywords: {', '.join(q.keywords)}"
        )
    
    # Generate ALL embeddings in ONE batched call (model-level parallelism).
    # Previously each question ran a separate embed_query() — a 40-question
    # paper meant 40 sequential encode passes through the transformer.
    # embed_documents batches them (batch_size=32 internally), which is
    # several times faster on CPU.
    try:
        embeddings = embeddings_model.embed_documents(contents, batch_size=32)
    except Exception as e:
        logger.error(f"Batched embedding failed ({e}), falling back to per-question embedding...")
        embeddings = [embeddings_model.embed_query(c) for c in contents]
    
    rows = []
    for idx, q in enumerate(questions):
        metadata = {
            "topic": q.topic,
            "blooms_level": q.blooms_level,
            "course_code": paper_metadata.get("course_code"),
            "year": paper_metadata.get("year")
        }
        
        rows.append({
            "question_id": str(q.question_id),
            "paper_id": paper_metadata.get("upload_id"),
            "course_id": paper_metadata.get("course_id"),
            "content": contents[idx],
            "metadata": metadata,
            "embedding": embeddings[idx]
        })
    
    # Batch insert — one round trip instead of one HTTP request per question (N+1)
    if rows:
        try:
            supabase_client.table('question_embeddings').insert(rows).execute()
        except Exception as e:
            logger.error(f"Batch embedding insert failed ({e}), falling back to individual inserts...")
            for data in rows:
                try:
                    supabase_client.table('question_embeddings').insert(data).execute()
                except Exception as row_err:
                    logger.error(f"Failed to insert embedding for question {data['question_id']}: {row_err}")

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
