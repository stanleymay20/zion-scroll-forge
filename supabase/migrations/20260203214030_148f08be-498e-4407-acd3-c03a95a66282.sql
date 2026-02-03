
-- Link 'Scroll Culture & Arts' courses to 'Scroll Arts' or 'Sacred Arts & Worship' degrees
INSERT INTO degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT dp.id, c.id, true, 3, 1
FROM degree_programs dp
JOIN courses c ON c.level = dp.scroll_level
WHERE dp.faculty IN ('Scroll Arts', 'Sacred Arts & Worship') 
AND c.faculty = 'Scroll Culture & Arts'
AND dp.is_active = true AND dp.scroll_level IS NOT NULL
ON CONFLICT DO NOTHING;
