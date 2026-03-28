-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store question embeddings
CREATE TABLE IF NOT EXISTS question_embeddings (
  id BIGSERIAL PRIMARY KEY,
  question_id TEXT NOT NULL,
  paper_id UUID REFERENCES exam_papers(id) ON DELETE CASCADE,
  course_id TEXT,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(384) -- 384 dimensions for all-MiniLM-L6-v2
);

-- Index for faster similarity search
CREATE INDEX ON question_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function for similarity search via RPC
CREATE OR REPLACE FUNCTION match_questions (
  query_embedding VECTOR(384),
  match_threshold FLOAT,
  match_count INT,
  filter_course_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  question_id TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    qe.id,
    qe.question_id,
    qe.content,
    qe.metadata,
    1 - (qe.embedding <=> query_embedding) AS similarity
  FROM question_embeddings qe
  WHERE (filter_course_id IS NULL OR qe.course_id = filter_course_id)
    AND 1 - (qe.embedding <=> query_embedding) > match_threshold
  ORDER BY qe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
