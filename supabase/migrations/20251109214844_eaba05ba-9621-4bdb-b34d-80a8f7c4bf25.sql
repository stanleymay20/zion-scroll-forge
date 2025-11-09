-- Seed sample modules and learning materials for Biblical Aesthetics & Beauty course
INSERT INTO course_modules (course_id, title, content_md, order_index, duration_minutes) VALUES
('3a9972f0-82a3-4594-a654-d9b87bdacedb', 'Introduction to Divine Beauty', 
'# Introduction to Divine Beauty

## Understanding God as the Source of Beauty

In this foundational module, we explore how beauty originates from God''s nature and character. All true beauty reflects the glory of Christ, who is described as "the radiance of God''s glory" (Hebrews 1:3).

### Key Concepts

1. **Beauty as a Divine Attribute**: God is not only good and true, but also beautiful
2. **Creation as Art**: The universe as God''s masterpiece
3. **Christ-Centered Aesthetics**: How Jesus transforms our understanding of beauty

### Learning Objectives

By the end of this module, you will:
- Understand biblical foundations of beauty
- Recognize God''s creative signature in nature and art
- Develop a Christ-centered aesthetic framework

> "He has made everything beautiful in its time" - Ecclesiastes 3:11', 0, 45),

('3a9972f0-82a3-4594-a654-d9b87bdacedb', 'Beauty in Scripture', 
'# Beauty in Scripture

## Exploring Biblical Perspectives on Aesthetics

This module examines how Scripture describes and values beauty, from the Tabernacle''s intricate design to the New Jerusalem''s splendor.

### Topics Covered

1. The Beauty of Holiness (Psalm 29:2)
2. Solomon''s Temple - Architecture for God''s Glory
3. The Bride of Christ - Ultimate Beauty
4. Worship as Aesthetic Experience

### Practical Application

Learn to integrate biblical beauty principles into:
- Personal spiritual formation
- Creative expression
- Church worship design
- Cultural engagement

> "One thing I ask from the LORD, this only do I seek: that I may dwell in the house of the LORD all the days of my life, to gaze on the beauty of the LORD" - Psalm 27:4', 1, 60),

('3a9972f0-82a3-4594-a654-d9b87bdacedb', 'Creating Kingdom Art', 
'# Creating Kingdom Art

## Practical Application of Aesthetic Theology

In this hands-on module, we explore how to create art that reflects God''s beauty and advances His Kingdom.

### Creative Disciplines Covered

1. **Visual Arts**: Painting, sculpture, design
2. **Performance Arts**: Music, dance, drama
3. **Literary Arts**: Poetry, storytelling, writing
4. **Digital Arts**: Media, film, interactive experiences

### Kingdom Principles for Creators

- Excellence as worship
- Prophetic creativity
- Beauty that heals and transforms
- Art as evangelism and discipleship

### Assignment

Create an original work that:
1. Reflects biblical truth
2. Demonstrates technical skill
3. Ministers to others
4. Glorifies Christ

> "Whatever you do, work at it with all your heart, as working for the Lord" - Colossians 3:23', 2, 90);

-- Insert learning materials for each module
INSERT INTO learning_materials (module_id, kind, title, url)
SELECT 
  id, 
  'pdf', 
  title || ' - Study Guide',
  'https://scrolluniversity.org/materials/' || id || '.pdf'
FROM course_modules 
WHERE course_id = '3a9972f0-82a3-4594-a654-d9b87bdacedb';