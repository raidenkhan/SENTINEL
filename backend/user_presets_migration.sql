-- Update Users Table for Personalization
ALTER TABLE users ADD COLUMN IF NOT EXISTS tracked_courses JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_years INT[] DEFAULT '{}';

-- Seed initial courses for selection
INSERT INTO courses (code, name, department, level) VALUES
('COE', 'Computer Engineering', 'Computer Engineering', 100) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (code, name, department, level) VALUES
('EE', 'Electrical Engineering', 'Electrical Engineering', 100) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (code, name, department, level) VALUES
('ME', 'Mechanical Engineering', 'Mechanical Engineering', 100) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (code, name, department, level) VALUES
('CE', 'Civil Engineering', 'Civil Engineering', 100) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (code, name, department, level) VALUES
('TE', 'Telecommunications Engineering', 'Electrical Engineering', 100) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (code, name, department, level) VALUES
('ARE', 'Aerospace Engineering', 'Mechanical Engineering', 100) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (code, name, department, level) VALUES
('BME', 'Biomedical Engineering', 'Computer Engineering', 100) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (code, name, department, level) VALUES
('ChE', 'Chemical Engineering', 'Chemical Engineering', 100) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (code, name, department, level) VALUES
('GE', 'Geomatic Engineering', 'Civil Engineering', 100) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (code, name, department, level) VALUES
('MatE', 'Materials Engineering', 'Mechanical Engineering', 100) ON CONFLICT (code) DO NOTHING;
