-- Add v3.0 fields to faculties table
ALTER TABLE faculties 
ADD COLUMN IF NOT EXISTS faculty_code TEXT,
ADD COLUMN IF NOT EXISTS mission TEXT,
ADD COLUMN IF NOT EXISTS key_scripture TEXT,
ADD COLUMN IF NOT EXISTS emblem_url TEXT;

-- Add faculty_id to ai_tutors table  
ALTER TABLE ai_tutors
ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id);

-- Add personality_prompt and voice_id fields to ai_tutors
ALTER TABLE ai_tutors
ADD COLUMN IF NOT EXISTS personality_prompt TEXT,
ADD COLUMN IF NOT EXISTS voice_id TEXT;

-- Rename avatar_url to avatar_image_url for consistency
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_tutors' AND column_name = 'avatar_url'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_tutors' AND column_name = 'avatar_image_url'
    ) THEN
        ALTER TABLE ai_tutors RENAME COLUMN avatar_url TO avatar_image_url;
    END IF;
END $$;

-- Update existing faculties with unique faculty codes if they're NULL
DO $$
DECLARE
    fac RECORD;
    counter INT := 1;
BEGIN
    FOR fac IN SELECT id FROM faculties WHERE faculty_code IS NULL
    LOOP
        UPDATE faculties SET faculty_code = 'FAC_' || counter WHERE id = fac.id;
        counter := counter + 1;
    END LOOP;
END $$;

-- Now add the unique constraint
ALTER TABLE faculties 
DROP CONSTRAINT IF EXISTS faculties_faculty_code_key;

ALTER TABLE faculties
ADD CONSTRAINT faculties_faculty_code_key UNIQUE (faculty_code);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_faculties_faculty_code ON faculties(faculty_code);
CREATE INDEX IF NOT EXISTS idx_ai_tutors_faculty_id ON ai_tutors(faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON courses(faculty_id);