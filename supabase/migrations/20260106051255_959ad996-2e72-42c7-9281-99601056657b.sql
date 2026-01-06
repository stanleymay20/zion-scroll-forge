-- Create comprehensive degree programs for all faculties across all 6 scroll levels
-- Each faculty will have Certificate, Diploma, Bachelor, Master, Doctorate, and Exousia levels

INSERT INTO degree_programs (title, description, faculty, level, duration, total_credits, is_active, institution_id, scroll_level) VALUES
-- Scroll Theology (4fd52143-5b66-4f47-91c4-2ef9530a4b19)
('ScrollCertificate in Biblical Foundations', 'Foundational study of prophetic wisdom and divine revelation', 'Scroll Theology', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Theological Studies', 'Intermediate prophetic training and biblical interpretation', 'Scroll Theology', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Theology', 'Comprehensive theological education with prophetic emphasis', 'Scroll Theology', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Divinity', 'Advanced theological study and ministry preparation', 'Scroll Theology', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Prophetic Theology', 'Research-intensive doctoral program in prophetic revelation', 'Scroll Theology', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Divine Revelation', 'Supreme authority credential for prophetic leadership', 'Scroll Theology', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Scroll Medicine (ade1a712-d0c7-4410-926c-c114de55131b)
('ScrollCertificate in Divine Health', 'Introduction to healing principles and wellness', 'Scroll Medicine', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Healing Ministry', 'Intermediate training in divine healing practices', 'Scroll Medicine', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Medicine', 'Comprehensive study of kingdom health and restoration', 'Scroll Medicine', 'Undergraduate', '4 years', 150, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Divine Medicine', 'Advanced healing methodologies and health leadership', 'Scroll Medicine', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('D.E.H.S.M. - Doctor of Edenic Health', 'Doctoral credential in ScrollMedicine and divine healing', 'Scroll Medicine', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Healing Authority', 'Supreme healing authority for nation-scale health reform', 'Scroll Medicine', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Scroll Governance (75e68049-fc47-41de-bb66-e6a9ea133b99)
('ScrollCertificate in Kingdom Administration', 'Foundational governance and kingdom law principles', 'Scroll Governance', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Prophetic Governance', 'Intermediate study of righteous administration', 'Scroll Governance', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Governance', 'Comprehensive training in kingdom law and administration', 'Scroll Governance', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Public Administration', 'Advanced governance leadership and policy development', 'Scroll Governance', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('D.S.G.E.I. - Doctor of ScrollGovernance', 'Doctoral credential for nation reformers and scroll architects', 'Scroll Governance', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Governmental Authority', 'Supreme governance authority for kingdom nation-building', 'Scroll Governance', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Scroll Economy (535fc1e5-e076-4467-b9a6-e1b5314f6329)
('ScrollCertificate in Kingdom Stewardship', 'Introduction to biblical finance and wealth principles', 'Scroll Economy', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Kingdom Finance', 'Intermediate training in wealth stewardship and enterprise', 'Scroll Economy', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Economics', 'Comprehensive study of kingdom economics and business', 'Scroll Economy', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Kingdom Finance', 'Advanced financial leadership and enterprise development', 'Scroll Economy', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Economic Reformation', 'Doctoral research in kingdom economic systems', 'Scroll Economy', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Financial Authority', 'Supreme credential for kingdom wealth architects', 'Scroll Economy', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Scroll Education (01a93275-3c4a-436e-9d47-81ab0611bd45)
('ScrollCertificate in Discipleship', 'Foundational teaching and mentorship principles', 'Scroll Education', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Kingdom Pedagogy', 'Intermediate training in prophetic education methods', 'Scroll Education', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Education', 'Comprehensive study in teaching and discipleship', 'Scroll Education', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Educational Leadership', 'Advanced educational administration and curriculum design', 'Scroll Education', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Kingdom Education', 'Doctoral research in prophetic educational systems', 'Scroll Education', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Educational Authority', 'Supreme credential for kingdom education reformers', 'Scroll Education', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Scroll Technology (bbfe3a18-3244-496a-aa7e-bd4670f67699)
('ScrollCertificate in AI Foundations', 'Introduction to divine intelligence and AI alignment', 'Scroll Technology', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Prophetic Tech', 'Intermediate training in kingdom technology development', 'Scroll Technology', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Technology', 'Comprehensive study in AI and divine technology systems', 'Scroll Technology', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of AI Engineering', 'Advanced AI development with prophetic alignment', 'Scroll Technology', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('D.P.T. - Doctor of Prophetic Technologies', 'Doctoral credential for scroll-governed AI/XR invention', 'Scroll Technology', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Technological Authority', 'Supreme credential for divine technology architects', 'Scroll Technology', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Divine Technology (3be9c0bd-b1be-4cf0-8947-e45e507ec4bc)
('ScrollCertificate in Divine Innovation', 'Foundational divine technology principles', 'Divine Technology', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Kingdom Tech', 'Intermediate divine technology implementation', 'Divine Technology', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Divine Technology', 'Comprehensive study in technology guided by divine wisdom', 'Divine Technology', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Divine Engineering', 'Advanced divine technology development', 'Divine Technology', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Divine Systems', 'Doctoral research in kingdom technology systems', 'Divine Technology', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Divine Tech Authority', 'Supreme credential for divine technology leaders', 'Divine Technology', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Prophetic Intelligence (fcd0c157-35b8-44c4-b82b-9860ec7db24e)
('ScrollCertificate in Prophetic Discernment', 'Foundational prophetic intelligence principles', 'Prophetic Intelligence', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Strategic Prophecy', 'Intermediate prophetic intelligence training', 'Prophetic Intelligence', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Prophetic Intelligence', 'Comprehensive study in discernment and kingdom advancement', 'Prophetic Intelligence', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Strategic Intelligence', 'Advanced prophetic strategy and kingdom advancement', 'Prophetic Intelligence', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Prophetic Strategy', 'Doctoral research in prophetic intelligence systems', 'Prophetic Intelligence', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Prophetic Authority', 'Supreme credential for prophetic leaders', 'Prophetic Intelligence', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Sacred Arts & Worship (c98a1b9d-d160-43b8-a273-2807c400c893)
('ScrollCertificate in Worship Arts', 'Foundational worship and creative expression', 'Sacred Arts & Worship', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Creative Ministry', 'Intermediate training in sacred arts and worship', 'Sacred Arts & Worship', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Sacred Arts', 'Comprehensive study in worship and creative expression', 'Sacred Arts & Worship', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Worship Leadership', 'Advanced worship leadership and arts ministry', 'Sacred Arts & Worship', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Sacred Arts', 'Doctoral research in worship and creative ministry', 'Sacred Arts & Worship', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Artistic Authority', 'Supreme credential for kingdom arts reformers', 'Sacred Arts & Worship', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Prophetic Law & Governance (996f9557-22de-4eec-8c0a-d7f44e436179)
('ScrollCertificate in Kingdom Law', 'Introduction to biblical jurisprudence', 'Prophetic Law & Governance', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Righteous Governance', 'Intermediate study in prophetic law', 'Prophetic Law & Governance', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Prophetic Law', 'Comprehensive study in biblical jurisprudence and governance', 'Prophetic Law & Governance', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Kingdom Jurisprudence', 'Advanced prophetic law and governance leadership', 'Prophetic Law & Governance', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('D.S.H.R. - Doctor of ScrollHermeneutics', 'Doctoral credential for unlocking sealed scrolls', 'Prophetic Law & Governance', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Judicial Authority', 'Supreme credential for kingdom justice reformers', 'Prophetic Law & Governance', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Kingdom Architecture (7a4ddc4b-3087-44db-952f-9368d011f004)
('ScrollCertificate in Kingdom Design', 'Foundational principles of sacred architecture', 'Kingdom Architecture', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Sacred Spaces', 'Intermediate training in kingdom architecture', 'Kingdom Architecture', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Architecture', 'Comprehensive study in designing kingdom spaces', 'Kingdom Architecture', 'Undergraduate', '4 years', 150, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Sacred Architecture', 'Advanced kingdom design and city planning', 'Kingdom Architecture', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('S.M.A.N. - ScrollMaster Architect of Nations', 'Doctoral credential for builders of kingdom cities', 'Kingdom Architecture', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Architectural Authority', 'Supreme credential for kingdom builders', 'Kingdom Architecture', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- GeoProphetic Intelligence (30b79c91-c5ac-41ac-a9e4-931e916d9348)
('ScrollCertificate in Territorial Mapping', 'Introduction to understanding nations and territories', 'GeoProphetic Intelligence', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Regional Prophecy', 'Intermediate territorial dynamics and discernment', 'GeoProphetic Intelligence', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of GeoProphetic Studies', 'Comprehensive study in territorial and national dynamics', 'GeoProphetic Intelligence', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Nations', 'Advanced study in God''s purposes for nations', 'GeoProphetic Intelligence', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in National Transformation', 'Doctoral research in nation reformation', 'GeoProphetic Intelligence', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in National Authority', 'Supreme credential for kingdom nation reformers', 'GeoProphetic Intelligence', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- ScrollMedia & Communication (609d0fb7-cb4f-4274-89b0-2a027d840b0f)
('ScrollCertificate in Kingdom Media', 'Foundational media and communication principles', 'ScrollMedia & Communication', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Gospel Communication', 'Intermediate training in kingdom media production', 'ScrollMedia & Communication', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Media Arts', 'Comprehensive study in kingdom communication', 'ScrollMedia & Communication', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Media Leadership', 'Advanced media production and communication leadership', 'ScrollMedia & Communication', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Kingdom Communications', 'Doctoral research in prophetic media systems', 'ScrollMedia & Communication', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Media Authority', 'Supreme credential for kingdom media reformers', 'ScrollMedia & Communication', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Ethic Science (a226f753-c747-46db-9bb1-5d5bf349707d)
('ScrollCertificate in Biblical Ethics', 'Foundational ethical principles and moral truth', 'Ethic Science', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Moral Philosophy', 'Intermediate study in ethical inquiry', 'Ethic Science', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Ethic Science', 'Comprehensive study in biblical ethics and science', 'Ethic Science', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Ethical Leadership', 'Advanced ethical leadership and moral inquiry', 'Ethic Science', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Ethical Systems', 'Doctoral research in kingdom ethical frameworks', 'Ethic Science', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Ethical Authority', 'Supreme credential for kingdom ethics reformers', 'Ethic Science', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Scroll Science (a4afb7c7-b70b-4bbb-ac8d-a368ddde4476)
('ScrollCertificate in Creation Science', 'Foundational study of discovery through obedience', 'Scroll Science', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Kingdom Science', 'Intermediate scientific inquiry with prophetic alignment', 'Scroll Science', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Science', 'Comprehensive study in kingdom scientific methodology', 'Scroll Science', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Scientific Leadership', 'Advanced scientific research and kingdom innovation', 'Scroll Science', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Kingdom Science', 'Doctoral research in prophetic scientific discovery', 'Scroll Science', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Scientific Authority', 'Supreme credential for kingdom scientists', 'Scroll Science', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Scroll Justice (e663a22b-f733-480b-a34d-e25ad1f0a00d)
('ScrollCertificate in Righteous Judgment', 'Foundational principles of kingdom justice', 'Scroll Justice', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Kingdom Justice', 'Intermediate training in righteous judgment', 'Scroll Justice', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Justice', 'Comprehensive study in kingdom judicial systems', 'Scroll Justice', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Judicial Leadership', 'Advanced justice administration and reform', 'Scroll Justice', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Kingdom Justice', 'Doctoral research in prophetic judicial systems', 'Scroll Justice', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Judicial Authority', 'Supreme credential for kingdom justice architects', 'Scroll Justice', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Scroll Diplomacy (e1b09823-f9ef-4eb2-914b-ffa8fc65e95d)
('ScrollCertificate in Kingdom Diplomacy', 'Foundational peace and nations principles', 'Scroll Diplomacy', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in International Relations', 'Intermediate training in kingdom diplomacy', 'Scroll Diplomacy', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Diplomacy', 'Comprehensive study in peace and international affairs', 'Scroll Diplomacy', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Diplomatic Leadership', 'Advanced international relations and peacemaking', 'Scroll Diplomacy', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in International Affairs', 'Doctoral research in kingdom diplomacy systems', 'Scroll Diplomacy', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('S.E.F. - ScrollExousia Fellowship', 'Supreme credential for ScrollSons completing scroll assignments across nations', 'Scroll Diplomacy', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Scroll Agriculture (ed8e4d6b-0184-4d65-b7dd-6840c11b333e)
('ScrollCertificate in Dominion Stewardship', 'Foundational principles of earth dominion', 'Scroll Agriculture', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Kingdom Farming', 'Intermediate training in agricultural stewardship', 'Scroll Agriculture', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Agriculture', 'Comprehensive study in dominion and earth stewardship', 'Scroll Agriculture', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Agricultural Leadership', 'Advanced agricultural systems and food security', 'Scroll Agriculture', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Dominion Sciences', 'Doctoral research in kingdom agricultural systems', 'Scroll Agriculture', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Agricultural Authority', 'Supreme credential for kingdom agricultural reformers', 'Scroll Agriculture', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Scroll Arts (dedc194a-4381-416a-acb3-d72545ca91ef)
('ScrollCertificate in Creative Worship', 'Foundational worship and creativity principles', 'Scroll Arts', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Kingdom Arts', 'Intermediate training in creative expression', 'Scroll Arts', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Fine Arts', 'Comprehensive study in worship and creative arts', 'Scroll Arts', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Creative Leadership', 'Advanced creative arts ministry and leadership', 'Scroll Arts', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Creative Ministry', 'Doctoral research in kingdom arts and culture', 'Scroll Arts', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Creative Authority', 'Supreme credential for kingdom arts reformers', 'Scroll Arts', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- Scroll Energy (344fb110-3e85-4899-84b6-11d42c0c6635)
('ScrollCertificate in Creation Power', 'Foundational energy stewardship principles', 'Scroll Energy', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Kingdom Energy', 'Intermediate training in energy systems', 'Scroll Energy', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Energy Science', 'Comprehensive study in creation power stewardship', 'Scroll Energy', 'Undergraduate', '3 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Energy Leadership', 'Advanced energy systems and sustainability', 'Scroll Energy', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Energy Systems', 'Doctoral research in kingdom energy innovation', 'Scroll Energy', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Energy Authority', 'Supreme credential for kingdom energy architects', 'Scroll Energy', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia'),

-- ScrollMedicine Faculty (569f9499-647c-4884-85e0-a3daf5a92cd6) - Additional specialized faculty
('ScrollCertificate in Holistic Health', 'Introduction to divine healing and medical science integration', 'ScrollMedicine Faculty', 'Certificate', '3 months', 12, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollCertificate'),
('ScrollDiploma in Wellness Ministry', 'Intermediate training in holistic health practices', 'ScrollMedicine Faculty', 'Diploma', '6 months', 24, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDiploma'),
('ScrollBachelor of Health Sciences', 'Comprehensive study in kingdom health and wellness', 'ScrollMedicine Faculty', 'Undergraduate', '4 years', 150, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollBachelor'),
('ScrollMaster of Health Leadership', 'Advanced health systems leadership', 'ScrollMedicine Faculty', 'Graduate', '2 years', 60, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollMaster'),
('ScrollDoctorate in Holistic Medicine', 'Doctoral research in kingdom health systems', 'ScrollMedicine Faculty', 'Doctoral', '4 years', 90, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollDoctorate'),
('ScrollExousia in Health Authority', 'Supreme credential for kingdom health reformers', 'ScrollMedicine Faculty', 'Exousia', '5 years', 120, true, 'ae42441f-8815-48a6-a9a4-1019ad382c2e', 'ScrollExousia')
ON CONFLICT DO NOTHING;