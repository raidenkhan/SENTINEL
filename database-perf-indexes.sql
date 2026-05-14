-- Performance indexes for SENTINEL-EXAM
-- Run this in Supabase SQL Editor

-- Composite index for topic analytics (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_questions_analytics 
ON questions(paper_id, topic, blooms_level);

-- Index for year-based filtering
CREATE INDEX IF NOT EXISTS idx_papers_course_year ON exam_papers(course_id, year DESC);

-- Index for chat similarity search (vector lookups)
CREATE INDEX IF NOT EXISTS idx_questions_topic_search ON questions(topic, paper_id);

-- Partial index for only completed papers
CREATE INDEX IF NOT EXISTS idx_papers_completed 
ON exam_papers(course_id, year) 
WHERE processing_status = 'completed';

-- Analyze tables to update statistics
ANALYZE questions;
ANALYZE exam_papers;