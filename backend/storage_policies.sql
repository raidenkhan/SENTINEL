-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-papers', 'exam-papers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for 'exam-papers'
-- Allow public/anon uploads for the SENTINEL-EXAM app
CREATE POLICY "Allow public upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'exam-papers');

-- Allow anyone to read the papers for the PDF previewer
CREATE POLICY "Allow public select" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'exam-papers');

-- 3. Database Table Policies
-- Enable RLS on core tables
ALTER TABLE exam_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for the demo/project environment
-- In production, these would be restricted to 'authenticated'
CREATE POLICY "Enable all for anon users on exam_papers" 
ON exam_papers FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for anon users on questions" 
ON questions FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for anon users on courses" 
ON courses FOR ALL 
USING (true) WITH CHECK (true);
