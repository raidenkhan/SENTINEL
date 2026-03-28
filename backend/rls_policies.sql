-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'users' table
-- Users can only see/edit their own profile
CREATE POLICY user_self_access ON users
    FOR ALL
    USING (auth.uid() = id);

-- 2. Policies for 'courses' table
-- For now, courses can be viewed by all authenticated users (community shared)
-- But only owners can edit if we add owner_id later
CREATE POLICY public_course_read ON courses
    FOR SELECT
    TO authenticated
    USING (true);

-- 3. Policies for 'exam_papers' table
-- Users can only access papers they uploaded. 
CREATE POLICY user_paper_access ON exam_papers
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- 4. Policies for 'questions' table
-- Access to questions is derived from access to the parent paper
CREATE POLICY user_question_access ON questions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM exam_papers
            WHERE exam_papers.id = questions.paper_id
            AND exam_papers.user_id = auth.uid()
        )
    );

-- 5. Storage Policies (Standard Supabase Storage)
-- Allow users to upload to their own folder in the 'papers' bucket
-- Bucket: 'papers', Path: '{auth.uid()}/...'
CREATE POLICY "Users can upload their own papers" ON storage.objects
    FOR INSERT 
    TO authenticated
    WITH CHECK (bucket_id = 'papers' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own papers" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'papers' AND (storage.foldername(name))[1] = auth.uid()::text);
