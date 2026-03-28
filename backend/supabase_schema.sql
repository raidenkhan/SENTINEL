-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    course_of_study VARCHAR(100),
    academic_year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department VARCHAR(100),
    level INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Papers Table
CREATE TABLE IF NOT EXISTS exam_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    year INT NOT NULL,
    semester VARCHAR(20),
    file_url TEXT NOT NULL,
    file_hash VARCHAR(64) UNIQUE, -- MD5 hash
    user_id UUID REFERENCES users(id),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_status VARCHAR(20) DEFAULT 'pending',
    ocr_accuracy FLOAT
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES exam_papers(id),
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
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    cache_key VARCHAR(100) UNIQUE,
    result_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_paper_year ON questions(paper_id);
CREATE INDEX IF NOT EXISTS idx_papers_course_year ON exam_papers(course_id, year);
