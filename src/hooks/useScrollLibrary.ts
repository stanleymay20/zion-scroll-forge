import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollLibrary — Christ governs all knowledge and wisdom");

// Types for ScrollLibrary
export interface ScrollBook {
  id: string;
  title: string;
  subtitle?: string;
  subject: string;
  faculty: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  course_reference?: string;
  integrity_hash?: string;
  quality_score?: number;
  theological_alignment?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  chapters?: number;
  pages?: number;
}

export interface ScrollChapter {
  id: string;
  book_id: string;
  title: string;
  order_index: number;
  content: string;
  reading_time: number;
  created_at: string;
}

export interface StudyPack {
  id: string;
  course_id: string;
  title: string;
  faculty: string;
  summary_content?: string;
  flashcard_count: number;
  quiz_count: number;
  created_at: string;
}

export interface LibrarySearchResult {
  book_id: string;
  chapter_id?: string;
  title: string;
  excerpt: string;
  relevance_score: number;
  content_type: 'book' | 'chapter' | 'study-pack';
}

// Comprehensive ScrollLibrary Books covering all faculties
const scrollBooks: ScrollBook[] = [
  // Divine Technology Faculty
  {
    id: 'book-dt-001',
    title: 'Divine Algorithm: Foundations of Christ-Centered AI',
    subtitle: 'Ethical Artificial Intelligence Through Biblical Principles',
    subject: 'Artificial Intelligence Ethics',
    faculty: 'Divine Technology',
    level: 'intermediate',
    quality_score: 0.96,
    theological_alignment: 0.98,
    chapters: 12,
    pages: 340,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-dt-002',
    title: 'Digital Stewardship in the Information Age',
    subtitle: 'Technology Governance Under Divine Authority',
    subject: 'Digital Ethics',
    faculty: 'Divine Technology',
    level: 'beginner',
    quality_score: 0.94,
    theological_alignment: 0.97,
    chapters: 10,
    pages: 280,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-dt-003',
    title: 'Quantum Computing and Divine Order',
    subtitle: 'Understanding Gods Design in Computational Physics',
    subject: 'Quantum Computing',
    faculty: 'Divine Technology',
    level: 'advanced',
    quality_score: 0.92,
    theological_alignment: 0.95,
    chapters: 15,
    pages: 420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Scroll Theology Faculty
  {
    id: 'book-st-001',
    title: 'Foundations of Biblical Theology',
    subtitle: 'A Comprehensive Guide to Understanding Scripture',
    subject: 'Systematic Theology',
    faculty: 'Scroll Theology',
    level: 'beginner',
    quality_score: 0.98,
    theological_alignment: 0.99,
    chapters: 20,
    pages: 560,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-st-002',
    title: 'Advanced Prophetic Studies',
    subtitle: 'Understanding Divine Revelation and Eschatology',
    subject: 'Prophetic Studies',
    faculty: 'Scroll Theology',
    level: 'advanced',
    quality_score: 0.95,
    theological_alignment: 0.98,
    chapters: 18,
    pages: 490,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-st-003',
    title: 'New Testament Greek Foundations',
    subtitle: 'Original Language Study for Scripture Understanding',
    subject: 'Biblical Languages',
    faculty: 'Scroll Theology',
    level: 'intermediate',
    quality_score: 0.94,
    theological_alignment: 0.97,
    chapters: 24,
    pages: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-st-004',
    title: 'The Doctrine of Christ',
    subtitle: 'Christology for the Modern Believer',
    subject: 'Christology',
    faculty: 'Scroll Theology',
    level: 'intermediate',
    quality_score: 0.97,
    theological_alignment: 0.99,
    chapters: 16,
    pages: 420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Kingdom Economics Faculty
  {
    id: 'book-ke-001',
    title: 'Kingdom Economics: Biblical Wealth Principles',
    subtitle: 'Stewarding Resources for Gods Glory',
    subject: 'Biblical Economics',
    faculty: 'Kingdom Economics',
    level: 'beginner',
    quality_score: 0.93,
    theological_alignment: 0.96,
    chapters: 14,
    pages: 320,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-ke-002',
    title: 'ScrollCoin and Blockchain Stewardship',
    subtitle: 'Cryptocurrency Through a Biblical Lens',
    subject: 'Digital Currency',
    faculty: 'Kingdom Economics',
    level: 'intermediate',
    quality_score: 0.91,
    theological_alignment: 0.94,
    chapters: 12,
    pages: 290,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-ke-003',
    title: 'Kingdom Business Administration',
    subtitle: 'Running Enterprise Under Divine Principles',
    subject: 'Business Administration',
    faculty: 'Kingdom Economics',
    level: 'advanced',
    quality_score: 0.92,
    theological_alignment: 0.95,
    chapters: 16,
    pages: 410,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Prophetic Intelligence Faculty
  {
    id: 'book-pi-001',
    title: 'Prophetic Intelligence Analysis',
    subtitle: 'Discerning Times and Seasons Through Scripture',
    subject: 'Prophetic Analysis',
    faculty: 'Prophetic Intelligence',
    level: 'advanced',
    quality_score: 0.94,
    theological_alignment: 0.97,
    chapters: 15,
    pages: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-pi-002',
    title: 'Dreams, Visions, and Divine Communication',
    subtitle: 'Understanding Gods Revelatory Methods',
    subject: 'Divine Revelation',
    faculty: 'Prophetic Intelligence',
    level: 'intermediate',
    quality_score: 0.93,
    theological_alignment: 0.96,
    chapters: 12,
    pages: 310,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Scroll Medicine Faculty
  {
    id: 'book-sm-001',
    title: 'Holistic Health: Body, Soul, and Spirit',
    subtitle: 'Biblical Foundations for Complete Wellness',
    subject: 'Holistic Health',
    faculty: 'ScrollMedicine',
    level: 'beginner',
    quality_score: 0.95,
    theological_alignment: 0.97,
    chapters: 18,
    pages: 440,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-sm-002',
    title: 'Divine Healing and Modern Medicine',
    subtitle: 'Integrating Faith with Healthcare Practice',
    subject: 'Faith and Medicine',
    faculty: 'ScrollMedicine',
    level: 'intermediate',
    quality_score: 0.94,
    theological_alignment: 0.96,
    chapters: 16,
    pages: 390,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-sm-003',
    title: 'Bioethics from a Kingdom Perspective',
    subtitle: 'Navigating Medical Ethics Through Scripture',
    subject: 'Bioethics',
    faculty: 'ScrollMedicine',
    level: 'advanced',
    quality_score: 0.96,
    theological_alignment: 0.98,
    chapters: 14,
    pages: 360,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Scroll Law Faculty
  {
    id: 'book-sl-001',
    title: 'Biblical Jurisprudence',
    subtitle: 'Divine Principles for Legal Systems',
    subject: 'Legal Foundations',
    faculty: 'Scroll Law',
    level: 'beginner',
    quality_score: 0.94,
    theological_alignment: 0.97,
    chapters: 16,
    pages: 400,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-sl-002',
    title: 'Kingdom Constitutional Law',
    subtitle: 'Governance Under Divine Authority',
    subject: 'Constitutional Law',
    faculty: 'Scroll Law',
    level: 'intermediate',
    quality_score: 0.93,
    theological_alignment: 0.96,
    chapters: 18,
    pages: 450,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-sl-003',
    title: 'International Law and Divine Justice',
    subtitle: 'Global Governance Through Biblical Principles',
    subject: 'International Law',
    faculty: 'Scroll Law',
    level: 'advanced',
    quality_score: 0.92,
    theological_alignment: 0.95,
    chapters: 20,
    pages: 520,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Sacred Arts & Worship Faculty
  {
    id: 'book-sa-001',
    title: 'Theology of Worship',
    subtitle: 'Understanding Divine Encounter Through Praise',
    subject: 'Worship Studies',
    faculty: 'Sacred Arts & Worship',
    level: 'beginner',
    quality_score: 0.96,
    theological_alignment: 0.98,
    chapters: 14,
    pages: 320,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-sa-002',
    title: 'Sacred Music Composition',
    subtitle: 'Creating Songs for the King',
    subject: 'Music Ministry',
    faculty: 'Sacred Arts & Worship',
    level: 'intermediate',
    quality_score: 0.94,
    theological_alignment: 0.96,
    chapters: 16,
    pages: 340,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-sa-003',
    title: 'Visual Arts in Kingdom Service',
    subtitle: 'Expressing Divine Beauty Through Creativity',
    subject: 'Visual Arts',
    faculty: 'Sacred Arts & Worship',
    level: 'intermediate',
    quality_score: 0.93,
    theological_alignment: 0.95,
    chapters: 12,
    pages: 280,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Scroll Education & Leadership Faculty
  {
    id: 'book-el-001',
    title: 'Servant Leadership Principles',
    subtitle: 'Leading Like Christ in Every Context',
    subject: 'Leadership',
    faculty: 'Scroll Education & Leadership',
    level: 'beginner',
    quality_score: 0.95,
    theological_alignment: 0.98,
    chapters: 15,
    pages: 350,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-el-002',
    title: 'Kingdom Educational Philosophy',
    subtitle: 'Teaching and Learning Under Divine Authority',
    subject: 'Education',
    faculty: 'Scroll Education & Leadership',
    level: 'intermediate',
    quality_score: 0.94,
    theological_alignment: 0.97,
    chapters: 18,
    pages: 420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-el-003',
    title: 'Organizational Development in Ministry',
    subtitle: 'Building Effective Kingdom Organizations',
    subject: 'Organizational Leadership',
    faculty: 'Scroll Education & Leadership',
    level: 'advanced',
    quality_score: 0.93,
    theological_alignment: 0.96,
    chapters: 16,
    pages: 390,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Scroll Engineering & AI Faculty
  {
    id: 'book-ea-001',
    title: 'Engineering for Kingdom Impact',
    subtitle: 'Technical Excellence for Gods Glory',
    subject: 'Engineering Ethics',
    faculty: 'Scroll Engineering & AI',
    level: 'beginner',
    quality_score: 0.93,
    theological_alignment: 0.95,
    chapters: 14,
    pages: 340,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-ea-002',
    title: 'Machine Learning with Divine Wisdom',
    subtitle: 'AI Development Through Biblical Principles',
    subject: 'Machine Learning',
    faculty: 'Scroll Engineering & AI',
    level: 'advanced',
    quality_score: 0.92,
    theological_alignment: 0.94,
    chapters: 20,
    pages: 480,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-ea-003',
    title: 'Software Architecture for the Kingdom',
    subtitle: 'Building Scalable Systems Under Divine Order',
    subject: 'Software Engineering',
    faculty: 'Scroll Engineering & AI',
    level: 'intermediate',
    quality_score: 0.91,
    theological_alignment: 0.93,
    chapters: 16,
    pages: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // ScrollMedia & Communication Faculty
  {
    id: 'book-mc-001',
    title: 'Kingdom Communication Principles',
    subtitle: 'Speaking Truth in a Digital Age',
    subject: 'Communication',
    faculty: 'ScrollMedia & Communication',
    level: 'beginner',
    quality_score: 0.94,
    theological_alignment: 0.97,
    chapters: 12,
    pages: 290,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-mc-002',
    title: 'Digital Media for Ministry',
    subtitle: 'Leveraging Technology for Gospel Proclamation',
    subject: 'Digital Media',
    faculty: 'ScrollMedia & Communication',
    level: 'intermediate',
    quality_score: 0.93,
    theological_alignment: 0.96,
    chapters: 14,
    pages: 320,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-mc-003',
    title: 'Prophetic Journalism',
    subtitle: 'Truth-Telling in Media and Reporting',
    subject: 'Journalism',
    faculty: 'ScrollMedia & Communication',
    level: 'advanced',
    quality_score: 0.92,
    theological_alignment: 0.95,
    chapters: 16,
    pages: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Kingdom Architecture Faculty
  {
    id: 'book-ka-001',
    title: 'Sacred Space Design',
    subtitle: 'Architecture for Divine Encounter',
    subject: 'Sacred Architecture',
    faculty: 'Kingdom Architecture',
    level: 'beginner',
    quality_score: 0.95,
    theological_alignment: 0.97,
    chapters: 14,
    pages: 360,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-ka-002',
    title: 'Urban Planning for Kingdom Communities',
    subtitle: 'Designing Cities that Glorify God',
    subject: 'Urban Planning',
    faculty: 'Kingdom Architecture',
    level: 'intermediate',
    quality_score: 0.93,
    theological_alignment: 0.95,
    chapters: 16,
    pages: 400,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-ka-003',
    title: 'Sustainable Design and Creation Care',
    subtitle: 'Environmental Stewardship in Architecture',
    subject: 'Sustainable Architecture',
    faculty: 'Kingdom Architecture',
    level: 'advanced',
    quality_score: 0.94,
    theological_alignment: 0.96,
    chapters: 18,
    pages: 440,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Edenic Science Faculty
  {
    id: 'book-es-001',
    title: 'Creation Science Foundations',
    subtitle: 'Understanding Gods Design in Nature',
    subject: 'Creation Science',
    faculty: 'Edenic Science',
    level: 'beginner',
    quality_score: 0.94,
    theological_alignment: 0.98,
    chapters: 16,
    pages: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-es-002',
    title: 'Biology Through the Lens of Scripture',
    subtitle: 'Life Sciences and Divine Design',
    subject: 'Biblical Biology',
    faculty: 'Edenic Science',
    level: 'intermediate',
    quality_score: 0.93,
    theological_alignment: 0.96,
    chapters: 20,
    pages: 460,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-es-003',
    title: 'Environmental Stewardship',
    subtitle: 'Caring for Creation as Divine Mandate',
    subject: 'Environmental Science',
    faculty: 'Edenic Science',
    level: 'intermediate',
    quality_score: 0.95,
    theological_alignment: 0.97,
    chapters: 14,
    pages: 340,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // GeoProphetic Intelligence Faculty
  {
    id: 'book-gi-001',
    title: 'Biblical Geography and Prophecy',
    subtitle: 'Understanding Sacred Lands and End Times',
    subject: 'Biblical Geography',
    faculty: 'GeoProphetic Intelligence',
    level: 'beginner',
    quality_score: 0.94,
    theological_alignment: 0.97,
    chapters: 15,
    pages: 370,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-gi-002',
    title: 'Geopolitical Analysis for Kingdom Watchers',
    subtitle: 'Discerning World Events Through Scripture',
    subject: 'Geopolitical Analysis',
    faculty: 'GeoProphetic Intelligence',
    level: 'advanced',
    quality_score: 0.93,
    theological_alignment: 0.96,
    chapters: 18,
    pages: 420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Prophetic Law & Governance Faculty
  {
    id: 'book-pl-001',
    title: 'Divine Governance Principles',
    subtitle: 'Gods Blueprint for Civil Society',
    subject: 'Governance',
    faculty: 'Prophetic Law & Governance',
    level: 'beginner',
    quality_score: 0.95,
    theological_alignment: 0.98,
    chapters: 14,
    pages: 350,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-pl-002',
    title: 'Prophetic Advocacy and Justice',
    subtitle: 'Speaking Truth to Power',
    subject: 'Social Justice',
    faculty: 'Prophetic Law & Governance',
    level: 'intermediate',
    quality_score: 0.94,
    theological_alignment: 0.97,
    chapters: 16,
    pages: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Scroll AI Faculty
  {
    id: 'book-ai-001',
    title: 'Introduction to Scroll AI Systems',
    subtitle: 'AI Foundations for Kingdom Purposes',
    subject: 'AI Fundamentals',
    faculty: 'Scroll AI',
    level: 'beginner',
    quality_score: 0.93,
    theological_alignment: 0.95,
    chapters: 16,
    pages: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-ai-002',
    title: 'Natural Language Processing for Ministry',
    subtitle: 'AI-Powered Communication Tools',
    subject: 'NLP',
    faculty: 'Scroll AI',
    level: 'advanced',
    quality_score: 0.91,
    theological_alignment: 0.93,
    chapters: 18,
    pages: 440,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Scroll Culture & Arts Faculty
  {
    id: 'book-ca-001',
    title: 'Cultural Apologetics',
    subtitle: 'Engaging Society Through Kingdom Lens',
    subject: 'Apologetics',
    faculty: 'Scroll Culture & Arts',
    level: 'intermediate',
    quality_score: 0.95,
    theological_alignment: 0.97,
    chapters: 14,
    pages: 340,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-ca-002',
    title: 'Kingdom Creativity',
    subtitle: 'Artistic Expression for Gods Glory',
    subject: 'Creative Arts',
    faculty: 'Scroll Culture & Arts',
    level: 'beginner',
    quality_score: 0.94,
    theological_alignment: 0.96,
    chapters: 12,
    pages: 280,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Scroll Economy Faculty
  {
    id: 'book-se-001',
    title: 'Biblical Financial Principles',
    subtitle: 'Stewarding Wealth for Kingdom Impact',
    subject: 'Finance',
    faculty: 'Scroll Economy',
    level: 'beginner',
    quality_score: 0.94,
    theological_alignment: 0.97,
    chapters: 14,
    pages: 320,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-se-002',
    title: 'Kingdom Investment Strategies',
    subtitle: 'Growing Resources for Eternal Returns',
    subject: 'Investment',
    faculty: 'Scroll Economy',
    level: 'intermediate',
    quality_score: 0.93,
    theological_alignment: 0.95,
    chapters: 16,
    pages: 370,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Health Faculty
  {
    id: 'book-hf-001',
    title: 'Biblical Nutrition',
    subtitle: 'Eating According to Divine Design',
    subject: 'Nutrition',
    faculty: 'Health',
    level: 'beginner',
    quality_score: 0.93,
    theological_alignment: 0.96,
    chapters: 12,
    pages: 280,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-hf-002',
    title: 'Mental Health and Spiritual Wellness',
    subtitle: 'Wholeness Through Christ',
    subject: 'Mental Health',
    faculty: 'Health',
    level: 'intermediate',
    quality_score: 0.95,
    theological_alignment: 0.98,
    chapters: 16,
    pages: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Finance Faculty
  {
    id: 'book-ff-001',
    title: 'Kingdom Accounting Principles',
    subtitle: 'Financial Stewardship for Ministry',
    subject: 'Accounting',
    faculty: 'Finance',
    level: 'beginner',
    quality_score: 0.92,
    theological_alignment: 0.94,
    chapters: 14,
    pages: 340,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Leadership Faculty
  {
    id: 'book-lf-001',
    title: 'The Heart of a Leader',
    subtitle: 'Character Formation for Kingdom Impact',
    subject: 'Leadership Character',
    faculty: 'Leadership',
    level: 'beginner',
    quality_score: 0.96,
    theological_alignment: 0.98,
    chapters: 15,
    pages: 350,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-lf-002',
    title: 'Strategic Leadership in Ministry',
    subtitle: 'Vision, Planning, and Execution',
    subject: 'Strategic Leadership',
    faculty: 'Leadership',
    level: 'advanced',
    quality_score: 0.94,
    theological_alignment: 0.96,
    chapters: 18,
    pages: 420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Prophetic Technology Faculty
  {
    id: 'book-pt-001',
    title: 'Technology and the Prophetic',
    subtitle: 'Digital Tools for Kingdom Advancement',
    subject: 'Prophetic Technology',
    faculty: 'Prophetic Technology',
    level: 'intermediate',
    quality_score: 0.92,
    theological_alignment: 0.95,
    chapters: 14,
    pages: 330,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Ethic Science Faculty
  {
    id: 'book-esc-001',
    title: 'Christian Ethics in Modern Society',
    subtitle: 'Navigating Moral Challenges with Biblical Wisdom',
    subject: 'Ethics',
    faculty: 'Ethic Science',
    level: 'beginner',
    quality_score: 0.96,
    theological_alignment: 0.98,
    chapters: 16,
    pages: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-esc-002',
    title: 'Applied Ethics in Professional Life',
    subtitle: 'Living Out Faith in the Workplace',
    subject: 'Professional Ethics',
    faculty: 'Ethic Science',
    level: 'intermediate',
    quality_score: 0.94,
    theological_alignment: 0.96,
    chapters: 14,
    pages: 340,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Comprehensive Study Packs
const scrollStudyPacks: StudyPack[] = [
  // Theology Study Packs
  {
    id: 'pack-st-001',
    course_id: 'course-theology-1',
    title: 'Systematic Theology Complete Study Pack',
    faculty: 'Scroll Theology',
    summary_content: 'Comprehensive flashcards, quizzes, and summaries covering all major theological doctrines',
    flashcard_count: 200,
    quiz_count: 20,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pack-st-002',
    course_id: 'course-theology-2',
    title: 'New Testament Survey Study Pack',
    faculty: 'Scroll Theology',
    summary_content: 'Book-by-book analysis with key themes and memory verses',
    flashcard_count: 150,
    quiz_count: 15,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pack-st-003',
    course_id: 'course-theology-3',
    title: 'Old Testament History Study Pack',
    faculty: 'Scroll Theology',
    summary_content: 'Timeline, key events, and prophetic connections',
    flashcard_count: 175,
    quiz_count: 18,
    created_at: new Date().toISOString(),
  },

  // Divine Technology Study Packs
  {
    id: 'pack-dt-001',
    course_id: 'course-tech-1',
    title: 'AI Ethics Essentials Study Pack',
    faculty: 'Divine Technology',
    summary_content: 'Key concepts in ethical AI development and biblical principles',
    flashcard_count: 100,
    quiz_count: 10,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pack-dt-002',
    course_id: 'course-tech-2',
    title: 'Digital Stewardship Study Pack',
    faculty: 'Divine Technology',
    summary_content: 'Technology governance and responsible digital citizenship',
    flashcard_count: 80,
    quiz_count: 8,
    created_at: new Date().toISOString(),
  },

  // Kingdom Economics Study Packs
  {
    id: 'pack-ke-001',
    course_id: 'course-econ-1',
    title: 'Biblical Finance Study Pack',
    faculty: 'Kingdom Economics',
    summary_content: 'Financial principles from Scripture with practical applications',
    flashcard_count: 120,
    quiz_count: 12,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pack-ke-002',
    course_id: 'course-econ-2',
    title: 'Kingdom Business Administration Study Pack',
    faculty: 'Kingdom Economics',
    summary_content: 'Business management through biblical wisdom',
    flashcard_count: 110,
    quiz_count: 11,
    created_at: new Date().toISOString(),
  },

  // ScrollMedicine Study Packs
  {
    id: 'pack-sm-001',
    course_id: 'course-med-1',
    title: 'Holistic Health Study Pack',
    faculty: 'ScrollMedicine',
    summary_content: 'Body, soul, and spirit wellness concepts',
    flashcard_count: 90,
    quiz_count: 9,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pack-sm-002',
    course_id: 'course-med-2',
    title: 'Bioethics Study Pack',
    faculty: 'ScrollMedicine',
    summary_content: 'Medical ethics case studies and biblical principles',
    flashcard_count: 85,
    quiz_count: 10,
    created_at: new Date().toISOString(),
  },

  // Leadership Study Packs
  {
    id: 'pack-el-001',
    course_id: 'course-lead-1',
    title: 'Servant Leadership Study Pack',
    faculty: 'Scroll Education & Leadership',
    summary_content: 'Christ-centered leadership principles and practices',
    flashcard_count: 100,
    quiz_count: 10,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pack-el-002',
    course_id: 'course-lead-2',
    title: 'Organizational Development Study Pack',
    faculty: 'Scroll Education & Leadership',
    summary_content: 'Building effective ministry organizations',
    flashcard_count: 95,
    quiz_count: 10,
    created_at: new Date().toISOString(),
  },

  // Sacred Arts Study Packs
  {
    id: 'pack-sa-001',
    course_id: 'course-arts-1',
    title: 'Worship Theology Study Pack',
    faculty: 'Sacred Arts & Worship',
    summary_content: 'Biblical foundations of worship and praise',
    flashcard_count: 80,
    quiz_count: 8,
    created_at: new Date().toISOString(),
  },

  // Law Study Packs
  {
    id: 'pack-sl-001',
    course_id: 'course-law-1',
    title: 'Biblical Jurisprudence Study Pack',
    faculty: 'Scroll Law',
    summary_content: 'Divine principles for legal systems and justice',
    flashcard_count: 130,
    quiz_count: 13,
    created_at: new Date().toISOString(),
  },

  // Engineering Study Packs
  {
    id: 'pack-ea-001',
    course_id: 'course-eng-1',
    title: 'Engineering Ethics Study Pack',
    faculty: 'Scroll Engineering & AI',
    summary_content: 'Technical excellence with kingdom values',
    flashcard_count: 75,
    quiz_count: 8,
    created_at: new Date().toISOString(),
  },

  // Prophetic Intelligence Study Packs
  {
    id: 'pack-pi-001',
    course_id: 'course-proph-1',
    title: 'Prophetic Analysis Study Pack',
    faculty: 'Prophetic Intelligence',
    summary_content: 'Discerning times and seasons through Scripture',
    flashcard_count: 90,
    quiz_count: 9,
    created_at: new Date().toISOString(),
  },

  // Creation Science Study Packs
  {
    id: 'pack-es-001',
    course_id: 'course-sci-1',
    title: 'Creation Science Study Pack',
    faculty: 'Edenic Science',
    summary_content: 'Scientific evidence for biblical creation',
    flashcard_count: 110,
    quiz_count: 11,
    created_at: new Date().toISOString(),
  },

  // Communication Study Packs
  {
    id: 'pack-mc-001',
    course_id: 'course-media-1',
    title: 'Kingdom Communication Study Pack',
    faculty: 'ScrollMedia & Communication',
    summary_content: 'Effective communication for ministry impact',
    flashcard_count: 70,
    quiz_count: 7,
    created_at: new Date().toISOString(),
  },

  // Architecture Study Packs
  {
    id: 'pack-ka-001',
    course_id: 'course-arch-1',
    title: 'Sacred Space Design Study Pack',
    faculty: 'Kingdom Architecture',
    summary_content: 'Principles of designing spaces for divine encounter',
    flashcard_count: 85,
    quiz_count: 8,
    created_at: new Date().toISOString(),
  },

  // Ethics Study Packs
  {
    id: 'pack-esc-001',
    course_id: 'course-ethics-1',
    title: 'Christian Ethics Study Pack',
    faculty: 'Ethic Science',
    summary_content: 'Navigating moral challenges with biblical wisdom',
    flashcard_count: 100,
    quiz_count: 10,
    created_at: new Date().toISOString(),
  },
];

// Fetchers
export async function getScrollBooks(): Promise<ScrollBook[]> {
  return scrollBooks;
}

export async function getScrollBook(bookId: string): Promise<ScrollBook | null> {
  return scrollBooks.find(b => b.id === bookId) || null;
}

export async function getBookChapters(bookId: string): Promise<ScrollChapter[]> {
  // Generate sample chapters for any book
  const book = scrollBooks.find(b => b.id === bookId);
  if (!book) return [];
  
  const chapterCount = book.chapters || 10;
  return Array.from({ length: chapterCount }, (_, i) => ({
    id: `${bookId}-chapter-${i + 1}`,
    book_id: bookId,
    title: `Chapter ${i + 1}: ${getChapterTitle(book.subject, i + 1)}`,
    order_index: i + 1,
    content: `Content for chapter ${i + 1} of ${book.title}`,
    reading_time: 15 + Math.floor(Math.random() * 20),
    created_at: new Date().toISOString(),
  }));
}

function getChapterTitle(subject: string, index: number): string {
  const titles: Record<string, string[]> = {
    'Systematic Theology': ['Introduction to Theology', 'The Doctrine of God', 'Christology', 'Pneumatology', 'Anthropology', 'Soteriology', 'Ecclesiology', 'Eschatology'],
    'Prophetic Studies': ['Understanding Prophecy', 'Old Testament Prophets', 'Apocalyptic Literature', 'End Times Overview', 'The Rapture', 'The Tribulation', 'The Millennium', 'Eternal State'],
    'default': ['Foundations', 'Core Concepts', 'Historical Context', 'Practical Applications', 'Case Studies', 'Advanced Topics', 'Integration', 'Future Directions'],
  };
  const titleList = titles[subject] || titles['default'];
  return titleList[index % titleList.length] || `Topic ${index}`;
}

export async function getStudyPacks(): Promise<StudyPack[]> {
  return scrollStudyPacks;
}

export async function getCourseStudyPack(courseId: string): Promise<StudyPack | null> {
  return scrollStudyPacks.find(p => p.course_id === courseId) || null;
}

export async function searchLibrary(query: string): Promise<LibrarySearchResult[]> {
  const results: LibrarySearchResult[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Search books
  scrollBooks.forEach(book => {
    const matchScore = calculateMatchScore(book, lowerQuery);
    if (matchScore > 0) {
      results.push({
        book_id: book.id,
        title: book.title,
        excerpt: book.subtitle || `${book.subject} - ${book.faculty}`,
        relevance_score: matchScore,
        content_type: 'book',
      });
    }
  });
  
  // Search study packs
  scrollStudyPacks.forEach(pack => {
    if (pack.title.toLowerCase().includes(lowerQuery) ||
        pack.faculty.toLowerCase().includes(lowerQuery) ||
        (pack.summary_content && pack.summary_content.toLowerCase().includes(lowerQuery))) {
      results.push({
        book_id: pack.id,
        title: pack.title,
        excerpt: pack.summary_content || pack.faculty,
        relevance_score: 0.8,
        content_type: 'study-pack',
      });
    }
  });
  
  return results.sort((a, b) => b.relevance_score - a.relevance_score);
}

function calculateMatchScore(book: ScrollBook, query: string): number {
  let score = 0;
  if (book.title.toLowerCase().includes(query)) score += 1;
  if (book.subtitle?.toLowerCase().includes(query)) score += 0.8;
  if (book.subject.toLowerCase().includes(query)) score += 0.7;
  if (book.faculty.toLowerCase().includes(query)) score += 0.6;
  return score;
}

export async function getBooksByFaculty(faculty: string): Promise<ScrollBook[]> {
  return scrollBooks.filter(b => b.faculty === faculty);
}

export async function getStudyPacksByFaculty(faculty: string): Promise<StudyPack[]> {
  return scrollStudyPacks.filter(p => p.faculty === faculty);
}

// Hooks
export const useScrollBooks = () =>
  useQuery({ 
    queryKey: ["scroll-books"], 
    queryFn: getScrollBooks 
  });

export const useScrollBook = (bookId: string) =>
  useQuery({ 
    queryKey: ["scroll-book", bookId], 
    queryFn: () => getScrollBook(bookId),
    enabled: !!bookId 
  });

export const useBookChapters = (bookId: string) =>
  useQuery({ 
    queryKey: ["book-chapters", bookId], 
    queryFn: () => getBookChapters(bookId),
    enabled: !!bookId 
  });

export const useStudyPacks = () =>
  useQuery({ 
    queryKey: ["study-packs"], 
    queryFn: getStudyPacks 
  });

export const useCourseStudyPack = (courseId: string) =>
  useQuery({ 
    queryKey: ["course-study-pack", courseId], 
    queryFn: () => getCourseStudyPack(courseId),
    enabled: !!courseId 
  });

export const useLibrarySearch = (query: string) =>
  useQuery({ 
    queryKey: ["library-search", query], 
    queryFn: () => searchLibrary(query),
    enabled: query.length >= 2 
  });

export const useBooksByFaculty = (faculty: string) =>
  useQuery({
    queryKey: ["scroll-books-faculty", faculty],
    queryFn: () => getBooksByFaculty(faculty),
    enabled: !!faculty
  });

export const useStudyPacksByFaculty = (faculty: string) =>
  useQuery({
    queryKey: ["study-packs-faculty", faculty],
    queryFn: () => getStudyPacksByFaculty(faculty),
    enabled: !!faculty
  });