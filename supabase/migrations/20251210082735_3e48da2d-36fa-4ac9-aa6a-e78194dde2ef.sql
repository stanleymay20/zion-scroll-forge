-- Drop the existing check constraint on courses.level
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_level_check;

-- Add new check constraint with scroll-based progression levels
ALTER TABLE courses ADD CONSTRAINT courses_level_check CHECK (
  level IN ('ScrollCertificate', 'ScrollDiploma', 'ScrollBachelor', 'ScrollMaster', 'ScrollDoctorate', 'ScrollExousia', 'Beginner', 'Intermediate', 'Advanced')
);