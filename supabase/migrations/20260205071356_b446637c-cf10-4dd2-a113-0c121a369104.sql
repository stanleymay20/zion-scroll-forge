-- Add program_status enum type for degree programs
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'degree_program_status') THEN
    CREATE TYPE degree_program_status AS ENUM ('active_public', 'pilot_private', 'internal_development');
  END IF;
END $$;

-- Add status column to degree_programs
ALTER TABLE public.degree_programs 
ADD COLUMN IF NOT EXISTS program_status text DEFAULT 'active_public';

-- Update existing programs: Set all ScrollCertificate and ScrollDiploma to active_public
-- Set ScrollBachelor and ScrollMaster to pilot_private
-- Set ScrollDoctorate and ScrollExousia to internal_development
UPDATE public.degree_programs 
SET program_status = CASE 
  WHEN scroll_level IN ('ScrollCertificate', 'ScrollDiploma') THEN 'active_public'
  WHEN scroll_level IN ('ScrollBachelor', 'ScrollMaster') THEN 'pilot_private'
  WHEN scroll_level IN ('ScrollDoctorate', 'ScrollExousia') THEN 'internal_development'
  ELSE 'active_public'
END;

-- Add comment for documentation
COMMENT ON COLUMN public.degree_programs.program_status IS 'Program visibility: active_public (visible to all), pilot_private (admin enrollment only), internal_development (hidden but preserved)';