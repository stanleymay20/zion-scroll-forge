
-- Clear existing course requirements to rebuild properly
DELETE FROM degree_course_requirements;

-- Link courses to degree programs by matching faculty AND level
-- Divine Technology courses
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.faculty = dp.faculty AND c.level = dp.scroll_level
WHERE dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;

-- For degrees without exact faculty match, use similar faculty names
-- Map 'Scroll Theology' courses to 'Scroll Theology' degrees
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.level = dp.scroll_level
WHERE dp.faculty = 'Scroll Theology' AND c.faculty = 'Scroll Theology'
AND dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;

-- Map 'Sacred Arts & Worship' courses
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.level = dp.scroll_level
WHERE dp.faculty = 'Sacred Arts & Worship' AND c.faculty = 'Sacred Arts & Worship'
AND dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;

-- Map 'Scroll Medicine' courses (handle variations)
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.level = dp.scroll_level
WHERE dp.faculty = 'Scroll Medicine' AND c.faculty IN ('Scroll Medicine', 'ScrollMedicine', 'ScrollMedicine Faculty', 'Health')
AND dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;

-- Map 'Scroll Economy' courses
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.level = dp.scroll_level
WHERE dp.faculty = 'Scroll Economy' AND c.faculty IN ('Scroll Economy', 'Finance', 'Kingdom Economics')
AND dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;

-- Map 'ScrollMedia & Communication' courses
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.level = dp.scroll_level
WHERE dp.faculty = 'ScrollMedia & Communication' AND c.faculty = 'ScrollMedia & Communication'
AND dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;

-- Map 'Scroll Education' courses
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.level = dp.scroll_level
WHERE dp.faculty = 'Scroll Education' AND c.faculty IN ('Scroll Education', 'Scroll Education & Leadership', 'Leadership')
AND dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;

-- Map 'Scroll Science' courses
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.level = dp.scroll_level
WHERE dp.faculty = 'Scroll Science' AND c.faculty IN ('Scroll Science', 'Edenic Science')
AND dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;

-- Map 'Scroll Technology' courses
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.level = dp.scroll_level
WHERE dp.faculty = 'Scroll Technology' AND c.faculty IN ('Scroll Technology', 'Scroll AI', 'Scroll Engineering & AI', 'Prophetic Technology')
AND dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;

-- Map 'Scroll Justice' / 'Scroll Governance' courses
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.level = dp.scroll_level
WHERE dp.faculty IN ('Scroll Justice', 'Scroll Governance') AND c.faculty IN ('Scroll Law', 'Prophetic Law & Governance')
AND dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;

-- Map 'Scroll Diplomacy' courses
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.level = dp.scroll_level
WHERE dp.faculty = 'Scroll Diplomacy' AND c.faculty IN ('Scroll Diplomacy', 'GeoProphetic Intelligence')
AND dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;
