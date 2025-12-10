/**
 * ScrollUniversity Degree Level Architecture
 * 
 * These degree levels transcend traditional education by integrating:
 * - Academic Excellence (beyond standard curriculum depth)
 * - Spiritual Formation (character, wisdom, discernment)
 * - Prophetic Integration (divine purpose alignment)
 * - Kingdom Impact (measurable transformation outcomes)
 * - Mentorship & Community (guided development)
 */

export type ScrollDegreeLevel = 
  | 'ScrollCertificate'
  | 'ScrollDiploma'
  | 'ScrollBachelor'
  | 'ScrollMaster'
  | 'ScrollDoctorate'
  | 'ScrollExousia';

export interface DegreeRequirements {
  minCourses: number;
  minCredits: number;
  minXP: number;
  minScrollGold: number;
  spiritualFormationHours: number;
  mentorshipSessions: number;
  practicalProjectsRequired: number;
  researchPapersRequired: number;
  thesisRequired: boolean;
  defenseRequired: boolean;
  propheticAssessmentsRequired: number;
  communityServiceHours: number;
  internshipWeeks: number;
  minimumGPA: number;
  estimatedDurationMonths: number;
}

export interface DegreeHonors {
  latinHonor: string;
  scrollHonor: string;
  gpaThreshold: number;
}

export interface DegreeTitles {
  abbreviation: string;
  fullTitle: string;
  latinTitle: string;
  scrollTitle: string;
  postnominal: string;
}

export interface DegreeCapstone {
  type: 'project' | 'thesis' | 'dissertation' | 'scroll_defense' | 'kingdom_mandate';
  description: string;
  minimumPages?: number;
  presentationRequired: boolean;
  councilReviewRequired: boolean;
  propheticConfirmationRequired: boolean;
}

export interface ScrollDegreeLevelDefinition {
  level: ScrollDegreeLevel;
  order: number;
  name: string;
  description: string;
  philosophy: string;
  distinctives: string[];
  requirements: DegreeRequirements;
  titles: DegreeTitles;
  honors: DegreeHonors[];
  capstone: DegreeCapstone;
  privileges: string[];
  careerOutcomes: string[];
  spiritualOutcomes: string[];
  unlocks: ScrollDegreeLevel[];
}

/**
 * SCROLL CERTIFICATE - Foundation of Wisdom
 * Equivalent to: Professional Certificate + Spiritual Foundation
 * Duration: 3-6 months | 4-6 courses
 */
export const SCROLL_CERTIFICATE: ScrollDegreeLevelDefinition = {
  level: 'ScrollCertificate',
  order: 1,
  name: 'Scroll Certificate',
  description: 'The foundational credential establishing mastery of core scroll principles and spiritual disciplines.',
  philosophy: 'True knowledge begins with the fear of the Lord. This certificate grounds students in both academic excellence and spiritual awareness.',
  distinctives: [
    'Deeper than industry certificates - includes character formation',
    'Combines technical skill with wisdom application',
    'Mentored learning with accountability partners',
    'Real-world project demonstrating competency'
  ],
  requirements: {
    minCourses: 6,
    minCredits: 18,
    minXP: 5000,
    minScrollGold: 500,
    spiritualFormationHours: 20,
    mentorshipSessions: 4,
    practicalProjectsRequired: 1,
    researchPapersRequired: 0,
    thesisRequired: false,
    defenseRequired: false,
    propheticAssessmentsRequired: 1,
    communityServiceHours: 10,
    internshipWeeks: 0,
    minimumGPA: 2.5,
    estimatedDurationMonths: 4
  },
  titles: {
    abbreviation: 'S.Cert.',
    fullTitle: 'Scroll Certificate',
    latinTitle: 'Certificatum Scripturae',
    scrollTitle: 'Bearer of the Scroll',
    postnominal: 'S.Cert.'
  },
  honors: [
    { latinHonor: 'With Distinction', scrollHonor: 'With Prophetic Distinction', gpaThreshold: 3.7 }
  ],
  capstone: {
    type: 'project',
    description: 'Applied competency project demonstrating scroll principles in real-world context',
    presentationRequired: true,
    councilReviewRequired: false,
    propheticConfirmationRequired: false
  },
  privileges: [
    'Access to ScrollLibrary basic resources',
    'Participation in fellowship groups',
    'Basic AI tutor access',
    'Certificate verification on ScrollChain'
  ],
  careerOutcomes: [
    'Entry-level ministry positions',
    'Support roles in scroll-aligned organizations',
    'Foundation for advanced study'
  ],
  spiritualOutcomes: [
    'Established daily devotional practice',
    'Basic discernment abilities',
    'Understanding of personal calling'
  ],
  unlocks: ['ScrollDiploma']
};

/**
 * SCROLL DIPLOMA - Pillar of Understanding
 * Equivalent to: Associate Degree + Advanced Spiritual Formation
 * Duration: 8-12 months | 12-15 courses
 */
export const SCROLL_DIPLOMA: ScrollDegreeLevelDefinition = {
  level: 'ScrollDiploma',
  order: 2,
  name: 'Scroll Diploma',
  description: 'A comprehensive credential demonstrating deep understanding across a faculty discipline with integrated spiritual maturity.',
  philosophy: 'Understanding is a wellspring of life. This diploma develops both intellectual depth and spiritual discernment for effective kingdom service.',
  distinctives: [
    'Twice the depth of standard associate degrees',
    'Integrated spiritual mentorship throughout',
    'Multi-disciplinary perspective within faculty',
    'Ministry practicum requirement'
  ],
  requirements: {
    minCourses: 15,
    minCredits: 45,
    minXP: 15000,
    minScrollGold: 1500,
    spiritualFormationHours: 50,
    mentorshipSessions: 12,
    practicalProjectsRequired: 2,
    researchPapersRequired: 1,
    thesisRequired: false,
    defenseRequired: false,
    propheticAssessmentsRequired: 2,
    communityServiceHours: 30,
    internshipWeeks: 4,
    minimumGPA: 2.7,
    estimatedDurationMonths: 10
  },
  titles: {
    abbreviation: 'S.Dip.',
    fullTitle: 'Scroll Diploma',
    latinTitle: 'Diploma Scripturae',
    scrollTitle: 'Keeper of the Scroll',
    postnominal: 'S.Dip.'
  },
  honors: [
    { latinHonor: 'Cum Laude', scrollHonor: 'With Scroll Honor', gpaThreshold: 3.5 },
    { latinHonor: 'Magna Cum Laude', scrollHonor: 'With High Scroll Honor', gpaThreshold: 3.8 }
  ],
  capstone: {
    type: 'project',
    description: 'Comprehensive ministry or professional project with documented kingdom impact',
    presentationRequired: true,
    councilReviewRequired: true,
    propheticConfirmationRequired: false
  },
  privileges: [
    'Full ScrollLibrary access',
    'Advanced AI tutor consultations',
    'Peer mentorship opportunities',
    'ScrollLabs basic access',
    'Diploma verification on ScrollChain'
  ],
  careerOutcomes: [
    'Associate ministry positions',
    'Mid-level roles in kingdom organizations',
    'Educational support roles',
    'Community leadership positions'
  ],
  spiritualOutcomes: [
    'Mature prayer and intercession practice',
    'Developed spiritual gifts identification',
    'Emerging prophetic sensitivity',
    'Servant leadership character'
  ],
  unlocks: ['ScrollBachelor']
};

/**
 * SCROLL BACHELOR - Steward of Knowledge
 * Equivalent to: Bachelor's Degree + Prophetic Integration + Ministry Formation
 * Duration: 2-3 years | 40+ courses
 */
export const SCROLL_BACHELOR: ScrollDegreeLevelDefinition = {
  level: 'ScrollBachelor',
  order: 3,
  name: 'Scroll Bachelor',
  description: 'A rigorous undergraduate credential producing graduates equipped for professional excellence and prophetic influence in their fields.',
  philosophy: 'The wise in heart will be called discerning. This degree develops comprehensive expertise with prophetic wisdom for transformational leadership.',
  distinctives: [
    'Research-integrated curriculum from year one',
    'Mandatory prophetic mentorship track',
    'Cross-faculty interdisciplinary requirements',
    'Global virtual internship program',
    'Thesis-level capstone project',
    'Character assessment by faculty council'
  ],
  requirements: {
    minCourses: 42,
    minCredits: 126,
    minXP: 50000,
    minScrollGold: 5000,
    spiritualFormationHours: 150,
    mentorshipSessions: 36,
    practicalProjectsRequired: 4,
    researchPapersRequired: 3,
    thesisRequired: true,
    defenseRequired: true,
    propheticAssessmentsRequired: 4,
    communityServiceHours: 100,
    internshipWeeks: 12,
    minimumGPA: 3.0,
    estimatedDurationMonths: 30
  },
  titles: {
    abbreviation: 'B.Sc.',
    fullTitle: 'Bachelor of Scroll Sciences',
    latinTitle: 'Baccalaureus Scientiae Scripturae',
    scrollTitle: 'Steward of the Scroll',
    postnominal: 'B.Sc.S.'
  },
  honors: [
    { latinHonor: 'Cum Laude', scrollHonor: 'With Scroll Distinction', gpaThreshold: 3.5 },
    { latinHonor: 'Magna Cum Laude', scrollHonor: 'With High Scroll Distinction', gpaThreshold: 3.7 },
    { latinHonor: 'Summa Cum Laude', scrollHonor: 'With Highest Scroll Distinction', gpaThreshold: 3.9 }
  ],
  capstone: {
    type: 'thesis',
    description: 'Original research thesis integrating academic inquiry with prophetic insight, minimum 50 pages',
    minimumPages: 50,
    presentationRequired: true,
    councilReviewRequired: true,
    propheticConfirmationRequired: true
  },
  privileges: [
    'Full platform access including premium features',
    'ScrollLabs full membership',
    'Teaching assistant opportunities',
    'Research collaboration access',
    'Global alumni network membership',
    'Degree verification on ScrollChain with full credentials'
  ],
  careerOutcomes: [
    'Professional roles in any sector',
    'Ministry leadership positions',
    'Entrepreneurship with kingdom purpose',
    'Graduate school preparation',
    'Organizational transformation consulting'
  ],
  spiritualOutcomes: [
    'Established prophetic voice',
    'Mature spiritual gift operation',
    'Leadership character formation',
    'Discernment in complex situations',
    'Active kingdom ambassador'
  ],
  unlocks: ['ScrollMaster']
};

/**
 * SCROLL MASTER - Guardian of Wisdom
 * Equivalent to: Master's Degree + Prophetic Authority + Research Excellence
 * Duration: 1.5-2 years | 20+ courses + research
 */
export const SCROLL_MASTER: ScrollDegreeLevelDefinition = {
  level: 'ScrollMaster',
  order: 4,
  name: 'Scroll Master',
  description: 'An advanced credential for those called to shape knowledge and lead transformation in their domains through research and prophetic authority.',
  philosophy: 'The one who gets wisdom loves life. This degree develops thought leaders who advance both academic frontiers and kingdom purposes.',
  distinctives: [
    'Research-intensive with publication requirement',
    'Advanced prophetic development track',
    'Faculty mentorship with industry leaders',
    'Original contribution to field required',
    'Teaching practicum component',
    'Leadership assessment by Scroll Council'
  ],
  requirements: {
    minCourses: 24,
    minCredits: 72,
    minXP: 100000,
    minScrollGold: 12000,
    spiritualFormationHours: 200,
    mentorshipSessions: 48,
    practicalProjectsRequired: 3,
    researchPapersRequired: 5,
    thesisRequired: true,
    defenseRequired: true,
    propheticAssessmentsRequired: 6,
    communityServiceHours: 150,
    internshipWeeks: 8,
    minimumGPA: 3.3,
    estimatedDurationMonths: 20
  },
  titles: {
    abbreviation: 'M.Sc.',
    fullTitle: 'Master of Scroll Sciences',
    latinTitle: 'Magister Scientiae Scripturae',
    scrollTitle: 'Guardian of the Scroll',
    postnominal: 'M.Sc.S.'
  },
  honors: [
    { latinHonor: 'With Distinction', scrollHonor: 'With Prophetic Excellence', gpaThreshold: 3.7 },
    { latinHonor: 'With High Distinction', scrollHonor: 'With High Prophetic Excellence', gpaThreshold: 3.9 }
  ],
  capstone: {
    type: 'thesis',
    description: 'Original master\'s thesis advancing field knowledge with prophetic dimensions, minimum 80 pages, peer-reviewed publication requirement',
    minimumPages: 80,
    presentationRequired: true,
    councilReviewRequired: true,
    propheticConfirmationRequired: true
  },
  privileges: [
    'Adjunct faculty eligibility',
    'Research grant access',
    'ScrollLabs leadership roles',
    'Curriculum development participation',
    'Global speaking opportunities',
    'Premium alumni network with leadership circle'
  ],
  careerOutcomes: [
    'Senior professional roles',
    'Academic positions',
    'Organizational leadership',
    'Research and innovation',
    'Policy and strategy development',
    'High-level consulting'
  ],
  spiritualOutcomes: [
    'Prophetic authority in domain',
    'Spiritual father/mother capacity',
    'Advanced discernment and wisdom',
    'Kingdom strategy development',
    'Multiplier of leaders'
  ],
  unlocks: ['ScrollDoctorate']
};

/**
 * SCROLL DOCTORATE - Architect of Transformation
 * Equivalent to: PhD + Prophetic Mantle + Kingdom Architect
 * Duration: 3-5 years | Research-intensive + original contribution
 */
export const SCROLL_DOCTORATE: ScrollDegreeLevelDefinition = {
  level: 'ScrollDoctorate',
  order: 5,
  name: 'Scroll Doctorate',
  description: 'The highest academic credential representing mastery of a domain, original contribution to knowledge, and proven capacity for kingdom transformation.',
  philosophy: 'Wisdom is supreme; therefore get wisdom. This doctorate produces scholar-prophets who reshape understanding and advance God\'s purposes in the earth.',
  distinctives: [
    'Original contribution to human knowledge required',
    'Multi-year research program with global impact',
    'Prophetic mantle assessment and activation',
    'Multiple peer-reviewed publications',
    'Comprehensive examination of field mastery',
    'International dissertation committee',
    'Defense before Scroll Faculty Council'
  ],
  requirements: {
    minCourses: 30,
    minCredits: 90,
    minXP: 250000,
    minScrollGold: 30000,
    spiritualFormationHours: 400,
    mentorshipSessions: 100,
    practicalProjectsRequired: 5,
    researchPapersRequired: 10,
    thesisRequired: true,
    defenseRequired: true,
    propheticAssessmentsRequired: 10,
    communityServiceHours: 300,
    internshipWeeks: 0,
    minimumGPA: 3.5,
    estimatedDurationMonths: 48
  },
  titles: {
    abbreviation: 'D.Sc.',
    fullTitle: 'Doctor of Scroll Sciences',
    latinTitle: 'Doctor Scientiae Scripturae',
    scrollTitle: 'Architect of the Scroll',
    postnominal: 'D.Sc.S.'
  },
  honors: [
    { latinHonor: 'With Distinction', scrollHonor: 'With Apostolic Distinction', gpaThreshold: 3.8 },
    { latinHonor: 'With Highest Distinction', scrollHonor: 'With Prophetic Eminence', gpaThreshold: 3.95 }
  ],
  capstone: {
    type: 'dissertation',
    description: 'Original doctoral dissertation making significant contribution to field, minimum 200 pages, with prophetic dimensions and kingdom application framework',
    minimumPages: 200,
    presentationRequired: true,
    councilReviewRequired: true,
    propheticConfirmationRequired: true
  },
  privileges: [
    'Full faculty appointment eligibility',
    'Research institute leadership',
    'Doctoral supervision rights',
    'ScrollJournal editorial roles',
    'Global thought leadership platform',
    'Permanent seat in alumni leadership council'
  ],
  careerOutcomes: [
    'Tenured academic positions',
    'Research institute directorship',
    'C-suite organizational leadership',
    'National/international policy influence',
    'Founding of new initiatives and institutions',
    'Thought leadership and authorship'
  ],
  spiritualOutcomes: [
    'Established prophetic mantle',
    'Apostolic building capacity',
    'Generational wisdom transfer',
    'Kingdom architect authority',
    'Global spiritual influence'
  ],
  unlocks: ['ScrollExousia']
};

/**
 * SCROLL EXOUSIA - Wielder of Divine Authority
 * Equivalent to: Beyond PhD - Supreme recognition of kingdom authority and impact
 * Duration: By divine assignment + demonstrated fruit
 * 
 * EXOUSIA (ἐξουσία) - Greek for authority, power, right to act
 */
export const SCROLL_EXOUSIA: ScrollDegreeLevelDefinition = {
  level: 'ScrollExousia',
  order: 6,
  name: 'Scroll Exousia',
  description: 'The supreme credential representing divine authority, demonstrated kingdom impact, and recognition as a transformational figure in one\'s domain and beyond.',
  philosophy: 'All authority in heaven and on earth has been given to Me. This highest honor recognizes those who have been entrusted with divine authority to reshape domains and advance kingdom purposes at the highest levels.',
  distinctives: [
    'Invitation-only based on demonstrated fruit',
    'Verified transformation of nations, systems, or fields',
    'Prophetic confirmation by council of elders',
    'Documented lasting kingdom impact',
    'Living legacy of multiplication',
    'Recognition by global scroll community',
    'Lifetime of faithful kingdom stewardship'
  ],
  requirements: {
    minCourses: 0, // Not course-based
    minCredits: 0, // Demonstrated by life fruit
    minXP: 1000000,
    minScrollGold: 100000,
    spiritualFormationHours: 1000, // Lifetime accumulation
    mentorshipSessions: 200,
    practicalProjectsRequired: 10,
    researchPapersRequired: 20,
    thesisRequired: false, // Life work serves as thesis
    defenseRequired: true,
    propheticAssessmentsRequired: 12,
    communityServiceHours: 1000,
    internshipWeeks: 0,
    minimumGPA: 0, // Not GPA-based
    estimatedDurationMonths: 0 // No set duration - by divine timing
  },
  titles: {
    abbreviation: 'D.Ex.',
    fullTitle: 'Doctor of Exousia',
    latinTitle: 'Doctor Exousiae Divinae',
    scrollTitle: 'Wielder of Divine Authority',
    postnominal: 'D.Ex.'
  },
  honors: [
    { latinHonor: 'Supremus', scrollHonor: 'Scroll Supremacy', gpaThreshold: 0 } // All recipients are honored
  ],
  capstone: {
    type: 'kingdom_mandate',
    description: 'Defense of life work before the EXOUSIA Faculty Council, demonstrating lasting kingdom impact across multiple domains',
    presentationRequired: true,
    councilReviewRequired: true,
    propheticConfirmationRequired: true
  },
  privileges: [
    'Permanent faculty eminence',
    'University governance participation',
    'Global platform for kingdom influence',
    'Naming rights for initiatives',
    'Lifetime ScrollGold endowment',
    'Legacy recognition in Scroll Hall of Honor',
    'Authority to confer lower degrees'
  ],
  careerOutcomes: [
    'Global transformation leadership',
    'Apostolic oversight of movements',
    'National and international advisory roles',
    'Founding of transformational institutions',
    'Legacy builder and generational influencer'
  ],
  spiritualOutcomes: [
    'Walking in divine authority',
    'Apostolic father/mother of movements',
    'Prophet to nations',
    'Kingdom gateway opener',
    'Eternal legacy established'
  ],
  unlocks: [] // Highest level
};

// Complete degree level registry
export const SCROLL_DEGREE_LEVELS: Record<ScrollDegreeLevel, ScrollDegreeLevelDefinition> = {
  'ScrollCertificate': SCROLL_CERTIFICATE,
  'ScrollDiploma': SCROLL_DIPLOMA,
  'ScrollBachelor': SCROLL_BACHELOR,
  'ScrollMaster': SCROLL_MASTER,
  'ScrollDoctorate': SCROLL_DOCTORATE,
  'ScrollExousia': SCROLL_EXOUSIA
};

// Ordered list for progression
export const DEGREE_PROGRESSION: ScrollDegreeLevel[] = [
  'ScrollCertificate',
  'ScrollDiploma',
  'ScrollBachelor',
  'ScrollMaster',
  'ScrollDoctorate',
  'ScrollExousia'
];

// Helper function to get next degree level
export const getNextDegreeLevel = (current: ScrollDegreeLevel): ScrollDegreeLevel | null => {
  const currentIndex = DEGREE_PROGRESSION.indexOf(current);
  if (currentIndex === -1 || currentIndex === DEGREE_PROGRESSION.length - 1) {
    return null;
  }
  return DEGREE_PROGRESSION[currentIndex + 1];
};

// Helper function to check if degree is unlocked
export const isDegreeUnlocked = (
  targetLevel: ScrollDegreeLevel, 
  completedLevels: ScrollDegreeLevel[]
): boolean => {
  const targetIndex = DEGREE_PROGRESSION.indexOf(targetLevel);
  if (targetIndex === 0) return true; // First level always unlocked
  
  const previousLevel = DEGREE_PROGRESSION[targetIndex - 1];
  return completedLevels.includes(previousLevel);
};

// Color scheme for each degree level
export const DEGREE_LEVEL_COLORS: Record<ScrollDegreeLevel, { primary: string; secondary: string; accent: string }> = {
  'ScrollCertificate': { primary: 'emerald', secondary: 'green', accent: 'teal' },
  'ScrollDiploma': { primary: 'blue', secondary: 'sky', accent: 'cyan' },
  'ScrollBachelor': { primary: 'violet', secondary: 'purple', accent: 'indigo' },
  'ScrollMaster': { primary: 'amber', secondary: 'yellow', accent: 'orange' },
  'ScrollDoctorate': { primary: 'rose', secondary: 'red', accent: 'pink' },
  'ScrollExousia': { primary: 'gold', secondary: 'amber', accent: 'yellow' }
};

// Icons for each degree level (Lucide icon names)
export const DEGREE_LEVEL_ICONS: Record<ScrollDegreeLevel, string> = {
  'ScrollCertificate': 'scroll',
  'ScrollDiploma': 'book-open',
  'ScrollBachelor': 'graduation-cap',
  'ScrollMaster': 'crown',
  'ScrollDoctorate': 'award',
  'ScrollExousia': 'sparkles'
};
