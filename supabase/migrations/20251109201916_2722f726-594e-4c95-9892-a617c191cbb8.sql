-- Add content fields to course_modules
ALTER TABLE course_modules
  ADD COLUMN IF NOT EXISTS content_md text,
  ADD COLUMN IF NOT EXISTS material_url text,
  ADD COLUMN IF NOT EXISTS quiz_data jsonb,
  ADD COLUMN IF NOT EXISTS duration_minutes int default 45;

-- Create learning_progress table to track student completion
CREATE TABLE IF NOT EXISTS learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid REFERENCES course_modules(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  quiz_score int,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS on learning_progress
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for learning_progress
CREATE POLICY "Users can view own progress"
  ON learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON learning_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create materials storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'materials',
  'materials',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for materials bucket
CREATE POLICY "Public can read materials"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'materials');

CREATE POLICY "Authenticated users can upload materials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Authenticated users can update materials"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'materials');

CREATE POLICY "Authenticated users can delete materials"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'materials');