-- Migration: add syllabus column to courses (for existing databases)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS syllabus TEXT;
