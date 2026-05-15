-- Migration: Add user_id to exam_papers if not exists
-- This tracks who uploaded each paper for ownership-based permissions

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_papers' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE exam_papers ADD COLUMN user_id UUID REFERENCES users(id);
        
        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_papers_user_id ON exam_papers(user_id);
    END IF;
END $$;

-- Update existing papers to mark as community (no specific owner)
UPDATE exam_papers SET user_id = NULL WHERE user_id IS NULL;