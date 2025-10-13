-- Sample Course Data for ScrollUniversity
-- Comprehensive course content following all requirements

-- Insert sample faculties first
INSERT INTO faculties (id, name, description, dean, established_year) VALUES
  ('f1', 'GeoProphetic Intelligence', 'Developing prophetic intelligence for global transformation', 'Dr. Samuel Scroll', 2024),
  ('f2', 'Kingdom Economics', 'Biblical principles for economic transformation', 'Dr. David Kingdom', 2024),
  ('f3', 'Scroll Medicine', 'Healing ministry and medical missions', 'Dr. Sarah Healing', 2024),
  ('f4', 'Scroll Law & Governance', 'Prophetic law and righteous governance', 'Dr. Justice Scroll', 2024),
  ('f5', 'Edenic Science & ScrollBiotech', 'Creation science and biotechnology', 'Dr. Eden Research', 2024)
ON CONFLICT (id) DO NOTHING;

-- Insert comprehensive sample courses
INSERT INTO courses (id, title, description, faculty_id, faculty, level, price_cents, rating, students_count, duration, tags, xr_enabled, created_at) VALUES
  (
    'course-1',
    'Prophetic Intelligence Fundamentals',
    'Master the art of receiving and interpreting divine insights for global transformation. This comprehensive course covers prophetic principles, discernment skills, and practical application in ministry and marketplace.',
    'f1',
    'GeoProphetic Intelligence',
    'Beginner',
    25000, -- 250 SC
    4.9,
    2847,
    '8 weeks',
    '["prophetic", "intelligence", "discernment", "ministry"]',
    true,
    NOW()
  ),
  (
    'course-2',
    'Kingdom Economics & ScrollCoin Mastery',
    'Learn biblical principles of wealth creation, stewardship, and the revolutionary ScrollCoin economy. Understand how to build kingdom businesses and manage resources for maximum kingdom impact.',
    'f2',
    'Kingdom Economics',
    'Intermediate',
    35000, -- 350 SC
    4.8,
    1923,
    '10 weeks',
    '["economics", "scrollcoin", "business", "stewardship"]',
    false,
    NOW()
  ),
  (
    'course-3',
    'Divine Healing & Medical Missions',
    'Comprehensive training in supernatural healing, medical missions, and integrating faith with healthcare. Learn to minister healing in hospitals, clinics, and mission fields.',
    'f3',
    'Scroll Medicine',
    'Advanced',
    45000, -- 450 SC
    4.7,
    1456,
    '12 weeks',
    '["healing", "medical", "missions", "supernatural"]',
    true,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert course modules for Prophetic Intelligence course
INSERT INTO course_modules (id, course_id, title, description, order_index, learning_objectives, spiritual_alignment, estimated_duration, prerequisites) VALUES
  (
    'mod-1-1',
    'course-1',
    'Introduction to Prophetic Intelligence',
    'Foundation principles of hearing God''s voice and understanding prophetic ministry in the modern context.',
    1,
    '["Understand the biblical basis for prophetic ministry", "Recognize different types of prophetic revelation", "Develop spiritual sensitivity", "Learn safety protocols for prophetic ministry"]',
    '{"kingdom_focus": "Advancing God''s Kingdom through accurate prophetic ministry", "biblical_foundation": ["1 Corinthians 14:1", "Numbers 12:6", "Amos 3:7"], "character_development": ["Humility", "Faithfulness", "Love"], "ministry_application": "Serving the local church with prophetic insights"}',
    90,
    '[]'
  ),
  (
    'mod-1-2',
    'course-1',
    'Hearing God''s Voice Clearly',
    'Practical training in discerning God''s voice from other voices, developing spiritual ears, and maintaining clear communication with Heaven.',
    2,
    '["Distinguish God''s voice from other voices", "Develop consistent prayer life", "Practice listening prayer", "Understand different ways God speaks"]',
    '{"kingdom_focus": "Intimate relationship with God for effective ministry", "biblical_foundation": ["John 10:27", "1 Kings 19:12", "Isaiah 30:21"], "character_development": ["Intimacy", "Discernment", "Patience"], "ministry_application": "Hearing God for personal guidance and ministry direction"}',
    120,
    '["mod-1-1"]'
  ),
  (
    'mod-1-3',
    'course-1',
    'Prophetic Discernment & Interpretation',
    'Advanced skills in interpreting prophetic revelation, understanding symbolic language, and applying prophetic insights practically.',
    3,
    '["Interpret symbolic and metaphorical revelation", "Understand timing in prophetic ministry", "Apply hermeneutical principles to prophecy", "Develop accuracy in interpretation"]',
    '{"kingdom_focus": "Accurate representation of God''s heart and mind", "biblical_foundation": ["1 Corinthians 2:10-16", "Daniel 2:28", "2 Peter 1:20-21"], "character_development": ["Wisdom", "Accuracy", "Responsibility"], "ministry_application": "Providing clear and actionable prophetic guidance"}',
    150,
    '["mod-1-1", "mod-1-2"]'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert lectures for Module 1
INSERT INTO lectures (id, module_id, title, description, order_index, video_url, video_duration, transcript, spiritual_elements, scripture_references, prayer_moments, interactive_elements) VALUES
  (
    'lec-1-1-1',
    'mod-1-1',
    'Biblical Foundation of Prophetic Ministry',
    'Exploring the scriptural basis for prophetic ministry and its role in the New Testament church.',
    1,
    'https://example.com/videos/prophetic-foundation.mp4',
    2700, -- 45 minutes
    'Welcome to Prophetic Intelligence Fundamentals. Today we begin our journey into understanding how God speaks to His people...',
    '{"prayer_integration": true, "scripture_study": true, "character_focus": ["Humility", "Reverence"], "ministry_application": "Understanding your prophetic calling", "prophetic_insights": ["God desires to speak to all His children", "Prophecy builds up the church"]}',
    '[{"book": "1 Corinthians", "chapter": 14, "verse": "1", "version": "NKJV", "context": "Pursue love and desire spiritual gifts, especially prophecy"}, {"book": "Numbers", "chapter": 12, "verse": "6", "version": "NKJV", "context": "God speaks through visions and dreams"}]',
    '[{"timestamp": 0, "type": "opening", "prompt": "Let us pray for open hearts to receive God''s word", "duration": 60}, {"timestamp": 1350, "type": "reflection", "prompt": "Pause and ask God to reveal His heart for prophetic ministry", "duration": 120}, {"timestamp": 2640, "type": "closing", "prompt": "Pray for wisdom and humility in prophetic ministry", "duration": 60}]',
    '[{"timestamp": 900, "type": "quiz", "content": {"question": "What is the primary purpose of prophecy according to 1 Corinthians 14:3?", "options": ["To predict the future", "To edify, exhort, and comfort", "To judge others", "To gain authority"], "correct": 1}, "required": true}]'
  ),
  (
    'lec-1-1-2',
    'mod-1-1',
    'Types of Prophetic Revelation',
    'Understanding the different ways God communicates prophetically - visions, dreams, words of knowledge, and impressions.',
    2,
    'https://example.com/videos/types-revelation.mp4',
    3600, -- 60 minutes
    'In this session, we explore the various ways the Holy Spirit communicates prophetic revelation...',
    '{"prayer_integration": true, "scripture_study": true, "character_focus": ["Discernment", "Sensitivity"], "ministry_application": "Recognizing different types of revelation", "prophetic_insights": ["God uses multiple communication methods", "Each person may receive differently"]}',
    '[{"book": "Joel", "chapter": 2, "verse": "28", "version": "NKJV", "context": "God will pour out His Spirit and give dreams and visions"}, {"book": "Acts", "chapter": 2, "verse": "17", "version": "NKJV", "context": "In the last days, God will pour out His Spirit"}]',
    '[{"timestamp": 0, "type": "opening", "prompt": "Ask the Holy Spirit to teach you His ways of communication", "duration": 90}, {"timestamp": 1800, "type": "reflection", "prompt": "Reflect on how God has spoken to you in the past", "duration": 180}, {"timestamp": 3540, "type": "closing", "prompt": "Thank God for His desire to communicate with you", "duration": 60}]',
    '[{"timestamp": 1200, "type": "reflection", "content": {"prompt": "Think of a time when you sensed God speaking to you. What form did it take?"}, "required": false}, {"timestamp": 2400, "type": "knowledge_check", "content": {"question": "Name three ways God gives prophetic revelation", "type": "short_answer"}, "required": true}]'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert lecture notes
INSERT INTO lecture_notes (id, lecture_id, title, content, note_type, study_questions, reflection_prompts, scripture_study) VALUES
  (
    'note-1-1-1',
    'lec-1-1-1',
    'Biblical Foundation Study Guide',
    '<h2>Biblical Foundation of Prophetic Ministry</h2>
    <h3>Key Principles</h3>
    <ul>
      <li><strong>Prophecy is for edification</strong> - 1 Corinthians 14:3 teaches that prophecy should build up, encourage, and comfort.</li>
      <li><strong>All may prophesy</strong> - 1 Corinthians 14:31 indicates that all believers can learn to prophesy.</li>
      <li><strong>Prophecy reveals God''s secrets</strong> - Amos 3:7 shows God''s desire to reveal His plans to His servants.</li>
    </ul>
    
    <h3>Historical Context</h3>
    <p>Prophetic ministry has been central to God''s communication with humanity throughout history. From the Old Testament prophets to the New Testament church, God has consistently used prophetic voices to guide, warn, encourage, and reveal His heart.</p>
    
    <h3>Modern Application</h3>
    <p>In today''s church, prophetic ministry serves to:</p>
    <ul>
      <li>Encourage believers in their faith journey</li>
      <li>Provide direction for individuals and churches</li>
      <li>Reveal God''s heart for specific situations</li>
      <li>Bring comfort in times of difficulty</li>
      <li>Confirm God''s calling and purposes</li>
    </ul>',
    'main',
    '["What does 1 Corinthians 14:3 teach about the purpose of prophecy?", "How does Amos 3:7 relate to modern prophetic ministry?", "What are the key characteristics of biblical prophecy?", "How can we ensure our prophetic ministry aligns with Scripture?"]',
    '["How has God spoken to you in your life?", "What fears or concerns do you have about prophetic ministry?", "How can you cultivate a heart that hears God clearly?", "What character qualities are essential for prophetic ministry?"]',
    '{"passages": [{"book": "1 Corinthians", "chapter": 14, "verse": "1-5", "version": "NKJV", "context": "Paul''s teaching on prophecy"}, {"book": "Amos", "chapter": 3, "verse": "7", "version": "NKJV", "context": "God reveals His secrets"}], "study_questions": ["What is the relationship between love and prophecy in 1 Corinthians 14:1?", "How does prophecy compare to other spiritual gifts?"], "application_points": ["Pursue prophecy with love as the motivation", "Seek to build up others through prophetic ministry"], "cross_references": ["Ephesians 4:11-12", "Romans 12:6", "1 Peter 4:10-11"]}'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert assessments
INSERT INTO assessments (id, module_id, title, description, assessment_type, questions, rubric, max_score, passing_score, time_limit, attempts_allowed, spiritual_reflection) VALUES
  (
    'assess-1-1',
    'mod-1-1',
    'Prophetic Foundations Quiz',
    'Test your understanding of the biblical foundations of prophetic ministry.',
    'quiz',
    '[
      {
        "id": "q1",
        "type": "multiple_choice",
        "question": "According to 1 Corinthians 14:3, prophecy serves to:",
        "options": ["Predict the future", "Edify, exhort, and comfort", "Judge and condemn", "Establish authority"],
        "correct_answer": "Edify, exhort, and comfort",
        "points": 10,
        "explanation": "Paul clearly states that prophecy is for building up (edification), encouraging (exhortation), and comforting the church.",
        "scripture_basis": [{"book": "1 Corinthians", "chapter": 14, "verse": "3", "version": "NKJV"}]
      },
      {
        "id": "q2",
        "type": "true_false",
        "question": "Only specially called prophets can receive prophetic revelation.",
        "correct_answer": "false",
        "points": 10,
        "explanation": "1 Corinthians 14:31 indicates that all believers can learn to prophesy, though not all are called to the office of prophet.",
        "scripture_basis": [{"book": "1 Corinthians", "chapter": 14, "verse": "31", "version": "NKJV"}]
      },
      {
        "id": "q3",
        "type": "short_answer",
        "question": "Explain the difference between the gift of prophecy and the office of prophet.",
        "points": 15,
        "explanation": "The gift of prophecy can operate through any believer for edification, while the office of prophet is a specific calling with greater authority and responsibility for direction and correction."
      }
    ]',
    '{"criteria": [{"name": "Biblical Understanding", "description": "Demonstrates clear understanding of biblical principles", "levels": [{"name": "Excellent", "description": "Shows deep biblical insight", "points": 90}, {"name": "Good", "description": "Shows solid biblical understanding", "points": 80}, {"name": "Satisfactory", "description": "Shows basic biblical knowledge", "points": 70}], "weight": 60}, {"name": "Practical Application", "description": "Applies biblical principles to modern ministry", "levels": [{"name": "Excellent", "description": "Makes clear practical connections", "points": 90}, {"name": "Good", "description": "Shows good practical understanding", "points": 80}, {"name": "Satisfactory", "description": "Shows basic practical awareness", "points": 70}], "weight": 40}], "spiritual_dimensions": [{"aspect": "Humility", "description": "Demonstrates humble approach to prophetic ministry", "evaluation_criteria": ["Acknowledges need for growth", "Shows respect for Scripture", "Demonstrates teachable spirit"]}, {"aspect": "Love", "description": "Shows love as motivation for ministry", "evaluation_criteria": ["Focuses on building others up", "Shows concern for church unity", "Demonstrates Christ-like character"]}], "ministry_application": {"practical_skills": ["Biblical interpretation", "Discernment", "Communication"], "character_qualities": ["Humility", "Love", "Faithfulness"], "spiritual_maturity": ["Prayer life", "Scripture knowledge", "Spiritual sensitivity"], "leadership_readiness": ["Teachability", "Accountability", "Servant heart"]}}',
    100,
    70,
    30,
    3,
    '{"prompts": ["How has this study impacted your understanding of God''s desire to speak to His people?", "What areas of character development do you sense God highlighting for your prophetic ministry?", "How can you apply these biblical principles in your current ministry context?"], "scripture_meditation": [{"book": "1 Corinthians", "chapter": 14, "verse": "1", "version": "NKJV", "context": "Pursue love and desire spiritual gifts"}], "prayer_focus": ["Pray for a heart that loves God and others", "Ask for wisdom in prophetic ministry", "Seek God for opportunities to encourage others"], "character_development": ["Develop humility in ministry", "Cultivate love as primary motivation", "Grow in biblical understanding"]}'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert assignments
INSERT INTO assignments (id, module_id, title, description, assignment_type, instructions, deliverables, evaluation_criteria, ministry_application, community_impact) VALUES
  (
    'assign-1-1',
    'mod-1-1',
    'Prophetic Ministry Reflection Paper',
    'Write a comprehensive reflection on your understanding of prophetic ministry and its biblical foundations.',
    'practical',
    '{"overview": "This assignment helps you integrate biblical principles with personal reflection and practical application.", "steps": ["Study the provided Scripture passages", "Reflect on your personal experience with prophetic ministry", "Research additional biblical examples", "Write a 1000-word reflection paper", "Include practical applications for your ministry context"], "resources": ["Course lecture notes", "Bible study tools", "Recommended reading list"], "spiritual_preparation": ["Spend time in prayer before writing", "Ask the Holy Spirit for insight", "Meditate on the Scripture passages"], "submission_format": "PDF document with proper citations"}',
    '[{"name": "Reflection Paper", "description": "1000-word paper on prophetic ministry foundations", "format": "PDF", "required": true, "spiritual_component": true}, {"name": "Scripture Study", "description": "Analysis of 5 key prophetic passages", "format": "Written analysis", "required": true, "spiritual_component": true}, {"name": "Personal Application Plan", "description": "Practical steps for implementing prophetic ministry", "format": "Action plan", "required": true, "spiritual_component": true}]',
    '{"academic_excellence": 30, "spiritual_integration": 25, "practical_application": 25, "character_demonstration": 10, "ministry_readiness": 10}',
    '{"practical_skills": ["Biblical exegesis", "Reflective writing", "Ministry planning"], "character_qualities": ["Humility", "Teachability", "Wisdom"], "spiritual_maturity": ["Scripture meditation", "Prayer integration", "Spiritual discernment"], "leadership_readiness": ["Self-awareness", "Ministry vision", "Practical planning"]}',
    '{"target_audience": "Local church community", "expected_outcomes": ["Increased understanding of prophetic ministry", "Encouragement for believers to seek spiritual gifts", "Practical framework for prophetic ministry"], "measurement_methods": ["Peer feedback", "Ministry implementation", "Community response"], "kingdom_advancement": "Equipping believers for effective prophetic ministry that builds up the church"}'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert discussion forums
INSERT INTO discussion_forums (id, module_id, title, description, forum_type, moderated) VALUES
  (
    'forum-1-1',
    'mod-1-1',
    'Prophetic Ministry Experiences',
    'Share your experiences with prophetic ministry and learn from others in the community.',
    'reflection',
    true
  ),
  (
    'forum-1-2',
    'mod-1-1',
    'Prayer Requests & Prophetic Intercession',
    'A space for prayer requests and prophetic intercession for the class community.',
    'prayer',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Insert course resources
INSERT INTO course_resources (id, course_id, module_id, title, description, resource_type, resource_url, tags, spiritual_category) VALUES
  (
    'res-1-1',
    'course-1',
    'mod-1-1',
    'Prophetic Ministry Reading List',
    'Essential books and articles on prophetic ministry foundations.',
    'document',
    'https://example.com/resources/prophetic-reading-list.pdf',
    '["reading", "books", "prophetic", "ministry"]',
    'study_materials'
  ),
  (
    'res-1-2',
    'course-1',
    'mod-1-1',
    'Scripture Memory Cards - Prophetic Verses',
    'Key Bible verses about prophetic ministry for memorization and meditation.',
    'document',
    'https://example.com/resources/prophetic-scripture-cards.pdf',
    '["scripture", "memory", "verses", "meditation"]',
    'spiritual_formation'
  ),
  (
    'res-1-3',
    'course-1',
    'mod-1-1',
    'Prophetic Ministry Safety Guidelines',
    'Important guidelines for safe and biblical prophetic ministry practice.',
    'document',
    'https://example.com/resources/prophetic-safety-guidelines.pdf',
    '["safety", "guidelines", "accountability", "ministry"]',
    'ministry_tools'
  )
ON CONFLICT (id) DO NOTHING;

-- Integrity verification
INSERT INTO scroll_integrity_logs (module, hash, verified, verified_at)
VALUES ('Sample Course Data', 'Jesus-Christ-is-Lord-SampleData', true, NOW());