-- Generate 8 comprehensive modules for each course that lacks modules
-- This covers all 66 courses without content

-- First, create a function to generate module content
CREATE OR REPLACE FUNCTION generate_course_modules_batch()
RETURNS void AS $$
DECLARE
  course_rec RECORD;
  mod_titles TEXT[] := ARRAY[
    'Week 1: Foundational Principles & Biblical Framework',
    'Week 2: Historical Context & Theological Foundations', 
    'Week 3: Core Concepts & Key Terminology',
    'Week 4: Practical Application & Case Studies',
    'Week 5: Advanced Theory & Critical Analysis',
    'Week 6: Research Methods & Scholarly Inquiry',
    'Week 7: Ministry Integration & Leadership Development',
    'Week 8: Capstone Project & Final Assessment'
  ];
  i INT;
  content_template TEXT;
BEGIN
  FOR course_rec IN 
    SELECT c.id, c.title, c.institution_id, c.faculty_id, COALESCE(f.name, 'General Studies') as faculty_name
    FROM courses c
    LEFT JOIN faculties f ON c.faculty_id = f.id
    WHERE c.id NOT IN (SELECT DISTINCT course_id FROM course_modules WHERE course_id IS NOT NULL)
  LOOP
    FOR i IN 1..8 LOOP
      content_template := '# ' || mod_titles[i] || E'\n\n' ||
        '## Introduction' || E'\n\n' ||
        'Welcome to ' || mod_titles[i] || ' of **' || course_rec.title || '**. This module is part of the ' || course_rec.faculty_name || ' faculty curriculum at ScrollUniversity.' || E'\n\n' ||
        '> "The fear of the LORD is the beginning of wisdom, and knowledge of the Holy One is understanding." - Proverbs 9:10' || E'\n\n' ||
        '## Learning Objectives' || E'\n\n' ||
        'By the end of this module, you will be able to:' || E'\n' ||
        '- Understand the foundational principles of this week''s topic' || E'\n' ||
        '- Apply biblical wisdom to practical scenarios' || E'\n' ||
        '- Integrate scholarly knowledge with Christ-centered living' || E'\n' ||
        '- Develop critical thinking skills from a Kingdom perspective' || E'\n\n' ||
        '## Core Content' || E'\n\n' ||
        '### Section 1: Theoretical Framework' || E'\n\n' ||
        'This section explores the theoretical underpinnings of our study. As Kingdom scholars, we approach every subject with the understanding that all truth is God''s truth. The integration of faith and learning is not merely an academic exercise but a sacred calling.' || E'\n\n' ||
        'The foundational concepts we explore this week build upon the rich heritage of Christian scholarship while engaging contemporary developments in the field. We recognize that Scripture provides the ultimate framework for understanding reality, while also appreciating the insights gained through careful study and observation.' || E'\n\n' ||
        '### Section 2: Biblical Integration' || E'\n\n' ||
        'Scripture provides our interpretive lens for all learning. In this section, we examine key biblical passages that inform our understanding:' || E'\n\n' ||
        '**Key Scripture Passages:**' || E'\n' ||
        '- Colossians 1:16-17 - "For in him all things were created..."' || E'\n' ||
        '- Proverbs 2:6 - "For the LORD gives wisdom..."' || E'\n' ||
        '- Romans 12:2 - "Do not conform to the pattern of this world..."' || E'\n\n' ||
        '### Section 3: Practical Application' || E'\n\n' ||
        'Theory without practice is incomplete. This week''s practical components include:' || E'\n\n' ||
        '1. **Reflection Exercise**: Journal your thoughts on how this week''s content applies to your calling' || E'\n' ||
        '2. **Case Study Analysis**: Examine real-world scenarios through a biblical lens' || E'\n' ||
        '3. **Group Discussion**: Engage with fellow students in collaborative learning' || E'\n' ||
        '4. **Ministry Application**: Identify ways to implement learnings in your sphere of influence' || E'\n\n' ||
        '## Study Resources' || E'\n\n' ||
        '### Required Reading' || E'\n' ||
        '- Primary course textbook chapters assigned for this week' || E'\n' ||
        '- Selected Scripture passages for devotional study' || E'\n' ||
        '- Scholarly articles provided in the resource library' || E'\n\n' ||
        '### Supplementary Materials' || E'\n' ||
        '- Video lectures and presentations' || E'\n' ||
        '- Interactive simulations and exercises' || E'\n' ||
        '- Recommended books for deeper study' || E'\n\n' ||
        '## Assessment' || E'\n\n' ||
        'This module includes the following assessments:' || E'\n' ||
        '- **Quiz**: Multiple-choice questions covering key concepts' || E'\n' ||
        '- **Reflection Paper**: 500-word essay integrating faith and learning' || E'\n' ||
        '- **Discussion Participation**: Active engagement in forums' || E'\n\n' ||
        '## Prayer & Devotion' || E'\n\n' ||
        '*Father God, we thank You for the opportunity to learn and grow in wisdom. Guide our minds as we study, and help us to honor You in all our intellectual pursuits. May our learning translate into faithful service in Your Kingdom. In Jesus'' name, Amen.*' || E'\n\n' ||
        '---' || E'\n' ||
        '*ScrollUniversity - Christ-Centered Education for Kingdom Leaders*';

      INSERT INTO course_modules (course_id, title, order_index, content_md, institution_id, duration_minutes, rewards_amount)
      VALUES (
        course_rec.id,
        mod_titles[i],
        i,
        content_template,
        course_rec.institution_id,
        45 + (i * 5),
        50 + (i * 10)
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Execute the function
SELECT generate_course_modules_batch();

-- Drop the function after use
DROP FUNCTION generate_course_modules_batch();