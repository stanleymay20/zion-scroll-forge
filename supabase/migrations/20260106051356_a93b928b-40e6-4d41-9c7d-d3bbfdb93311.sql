-- Link courses to degree programs by matching faculty and level
-- ScrollCertificate degrees get beginner/certificate courses
-- ScrollDiploma degrees get diploma courses
-- ScrollBachelor degrees get undergraduate/bachelor courses
-- ScrollMaster degrees get graduate/master courses
-- ScrollDoctorate/ScrollExousia degrees get doctoral/advanced courses

-- Insert course requirements for Divine Technology degrees
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT 
  dp.id as degree_id,
  c.id as course_id,
  true as is_required,
  3 as credits,
  1 as semester_recommended
FROM degree_programs dp
CROSS JOIN courses c
WHERE dp.faculty = 'Divine Technology' 
  AND c.faculty = 'Divine Technology'
  AND dp.scroll_level = 'ScrollCertificate' AND c.level = 'ScrollCertificate'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 2
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Divine Technology' AND c.faculty = 'Divine Technology'
  AND dp.scroll_level = 'ScrollDiploma' AND c.level = 'ScrollDiploma'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 3
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Divine Technology' AND c.faculty = 'Divine Technology'
  AND dp.scroll_level = 'ScrollDoctorate' AND c.level = 'ScrollDoctorate'
ON CONFLICT DO NOTHING;

-- Insert for Ethic Science
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Ethic Science' AND c.faculty = 'Ethic Science'
  AND dp.scroll_level = 'ScrollCertificate' AND c.level = 'ScrollCertificate'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 2
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Ethic Science' AND c.faculty = 'Ethic Science'
  AND dp.scroll_level = 'ScrollDiploma' AND c.level = 'ScrollDiploma'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 4
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Ethic Science' AND c.faculty = 'Ethic Science'
  AND dp.scroll_level = 'ScrollMaster' AND c.level = 'ScrollMaster'
ON CONFLICT DO NOTHING;

-- Insert for GeoProphetic Intelligence
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'GeoProphetic Intelligence' AND c.faculty = 'GeoProphetic Intelligence'
  AND dp.scroll_level = 'ScrollCertificate' AND c.level = 'ScrollCertificate'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 2
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'GeoProphetic Intelligence' AND c.faculty = 'GeoProphetic Intelligence'
  AND dp.scroll_level = 'ScrollDiploma' AND c.level = 'ScrollDiploma'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 3
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'GeoProphetic Intelligence' AND c.faculty = 'GeoProphetic Intelligence'
  AND dp.scroll_level = 'ScrollBachelor' AND c.level = 'ScrollBachelor'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 5
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'GeoProphetic Intelligence' AND c.faculty = 'GeoProphetic Intelligence'
  AND dp.scroll_level = 'ScrollDoctorate' AND c.level = 'ScrollDoctorate'
ON CONFLICT DO NOTHING;

-- Insert for Kingdom Architecture
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 2
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Kingdom Architecture' AND c.faculty = 'Kingdom Architecture'
  AND dp.scroll_level = 'ScrollDiploma' AND c.level = 'ScrollDiploma'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 4
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Kingdom Architecture' AND c.faculty = 'Kingdom Architecture'
  AND dp.scroll_level = 'ScrollMaster' AND c.level = 'ScrollMaster'
ON CONFLICT DO NOTHING;

-- Insert for Scroll Theology related courses
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Scroll Theology' AND c.faculty = 'Scroll Theology'
  AND dp.scroll_level = 'ScrollCertificate' AND c.level = 'ScrollCertificate'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 2
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Scroll Theology' AND c.faculty = 'Scroll Theology'
  AND dp.scroll_level = 'ScrollDiploma' AND c.level = 'ScrollDiploma'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 3
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Scroll Theology' AND c.faculty = 'Scroll Theology'
  AND dp.scroll_level = 'ScrollBachelor' AND c.level = 'ScrollBachelor'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 4
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Scroll Theology' AND c.faculty = 'Scroll Theology'
  AND dp.scroll_level = 'ScrollMaster' AND c.level = 'ScrollMaster'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 5
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Scroll Theology' AND c.faculty = 'Scroll Theology'
  AND dp.scroll_level = 'ScrollDoctorate' AND c.level = 'ScrollDoctorate'
ON CONFLICT DO NOTHING;

-- Insert for ScrollMedia & Communication
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'ScrollMedia & Communication' AND c.faculty = 'ScrollMedia & Communication'
  AND dp.scroll_level = 'ScrollCertificate' AND c.level = 'ScrollCertificate'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 2
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'ScrollMedia & Communication' AND c.faculty = 'ScrollMedia & Communication'
  AND dp.scroll_level = 'ScrollDiploma' AND c.level = 'ScrollDiploma'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 3
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'ScrollMedia & Communication' AND c.faculty = 'ScrollMedia & Communication'
  AND dp.scroll_level = 'ScrollBachelor' AND c.level = 'ScrollBachelor'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 4
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'ScrollMedia & Communication' AND c.faculty = 'ScrollMedia & Communication'
  AND dp.scroll_level = 'ScrollMaster' AND c.level = 'ScrollMaster'
ON CONFLICT DO NOTHING;

INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 5
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'ScrollMedia & Communication' AND c.faculty = 'ScrollMedia & Communication'
  AND dp.scroll_level = 'ScrollDoctorate' AND c.level = 'ScrollDoctorate'
ON CONFLICT DO NOTHING;

-- Insert for ScrollMedicine Faculty 
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'ScrollMedicine Faculty' AND c.faculty = 'ScrollMedicine Faculty'
ON CONFLICT DO NOTHING;

-- Also link courses with similar faculty names (partial matches)
-- Link "Scroll Medicine" courses to "Scroll Medicine" degrees
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Scroll Medicine' AND (c.faculty LIKE '%Medicine%' OR c.faculty LIKE '%Health%')
  AND NOT EXISTS (SELECT 1 FROM degree_course_requirements dcr WHERE dcr.degree_id = dp.id AND dcr.course_id = c.id)
ON CONFLICT DO NOTHING;

-- Link Finance courses to Scroll Economy degrees
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Scroll Economy' AND (c.faculty LIKE '%Finance%' OR c.faculty LIKE '%Kingdom Economics%')
  AND NOT EXISTS (SELECT 1 FROM degree_course_requirements dcr WHERE dcr.degree_id = dp.id AND dcr.course_id = c.id)
ON CONFLICT DO NOTHING;

-- Link Leadership courses to Scroll Education degrees
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Scroll Education' AND (c.faculty LIKE '%Leadership%' OR c.faculty LIKE '%Education%')
  AND NOT EXISTS (SELECT 1 FROM degree_course_requirements dcr WHERE dcr.degree_id = dp.id AND dcr.course_id = c.id)
ON CONFLICT DO NOTHING;

-- Link Prophetic Technology courses to Scroll Technology degrees
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp CROSS JOIN courses c
WHERE dp.faculty = 'Scroll Technology' AND (c.faculty LIKE '%Prophetic Technology%' OR c.faculty LIKE '%Scroll AI%' OR c.faculty LIKE '%Scroll Engineering%')
  AND NOT EXISTS (SELECT 1 FROM degree_course_requirements dcr WHERE dcr.degree_id = dp.id AND dcr.course_id = c.id)
ON CONFLICT DO NOTHING;

-- Link Law courses to Scroll Governance and Prophetic Law degrees
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp CROSS JOIN courses c
WHERE (dp.faculty = 'Scroll Governance' OR dp.faculty = 'Prophetic Law & Governance') 
  AND (c.faculty LIKE '%Scroll Law%' OR c.faculty LIKE '%Governance%')
  AND NOT EXISTS (SELECT 1 FROM degree_course_requirements dcr WHERE dcr.degree_id = dp.id AND dcr.course_id = c.id)
ON CONFLICT DO NOTHING;

-- Link Arts courses to Sacred Arts & Worship and Scroll Arts degrees
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp CROSS JOIN courses c
WHERE (dp.faculty = 'Sacred Arts & Worship' OR dp.faculty = 'Scroll Arts') 
  AND (c.faculty LIKE '%Arts%' OR c.faculty LIKE '%Culture%')
  AND NOT EXISTS (SELECT 1 FROM degree_course_requirements dcr WHERE dcr.degree_id = dp.id AND dcr.course_id = c.id)
ON CONFLICT DO NOTHING;