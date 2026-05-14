-- SENTINEL-EXAM Database Setup
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    course_of_study VARCHAR(100),
    academic_year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses Table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department VARCHAR(100),
    level INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Papers Table
CREATE TABLE public.exam_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    year INT NOT NULL,
    semester VARCHAR(20),
    file_url TEXT NOT NULL,
    file_hash VARCHAR(64) UNIQUE,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_status VARCHAR(20) DEFAULT 'pending',
    ocr_accuracy FLOAT
);

-- Questions Table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID REFERENCES public.exam_papers(id) ON DELETE CASCADE,
    question_number VARCHAR(10),
    raw_text TEXT,
    topic VARCHAR(100),
    sub_topic VARCHAR(100),
    blooms_level VARCHAR(20),
    is_calculation_heavy BOOLEAN,
    weight FLOAT DEFAULT 1.0,
    keywords TEXT[],
    diagram_url TEXT,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Cache Table
CREATE TABLE public.analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    cache_key VARCHAR(100) UNIQUE,
    result_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create Indexes
CREATE INDEX idx_questions_topic ON public.questions(topic);
CREATE INDEX idx_questions_paper_year ON public.questions(paper_id, year);
CREATE INDEX idx_papers_course_year ON public.exam_papers(course_id, year);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Public Access (for now - tighten in production)

-- Users: Allow read, only users can update their own
CREATE POLICY "Users can view all" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Courses: Public read
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Courses are insertable" ON public.courses FOR INSERT WITH CHECK (true);

-- Exam Papers: Public read
CREATE POLICY "Exam papers are viewable by everyone" ON public.exam_papers FOR SELECT USING (true);
CREATE POLICY "Exam papers are insertable" ON public.exam_papers FOR INSERT WITH CHECK (true);

-- Questions: Public read
CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Questions are insertable" ON public.questions FOR INSERT WITH CHECK (true);

-- Analytics Cache: Public read/write
CREATE POLICY "Cache is viewable by everyone" ON public.analytics_cache FOR SELECT USING (true);
CREATE POLICY "Cache is insertable" ON public.analytics_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Cache is updatable" ON public.analytics_cache FOR UPDATE USING (true);

-- Create a service role key (for backend operations)
-- Note: In Supabase dashboard, go to Settings > API to find your service_role key
-- Use service_role key in backend .env for admin operations