-- Create module_notes table for student reflections
CREATE TABLE IF NOT EXISTS module_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  notes TEXT,
  scripture_connections TEXT,
  application_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE module_notes ENABLE ROW LEVEL SECURITY;

-- Users can view their own notes
CREATE POLICY "Users can view own notes"
ON module_notes FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "Users can create own notes"
ON module_notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update own notes"
ON module_notes FOR UPDATE
USING (auth.uid() = user_id);

-- Create course_certificates table
CREATE TABLE IF NOT EXISTS course_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_url TEXT,
  completion_date TIMESTAMPTZ DEFAULT now(),
  scroll_badge_earned BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view own certificates"
ON course_certificates FOR SELECT
USING (auth.uid() = user_id);

-- System can insert certificates
CREATE POLICY "System can create certificates"
ON course_certificates FOR INSERT
WITH CHECK (true);

-- Create trigger to update module_notes updated_at
CREATE OR REPLACE FUNCTION update_module_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER module_notes_updated_at
BEFORE UPDATE ON module_notes
FOR EACH ROW
EXECUTE FUNCTION update_module_notes_updated_at();