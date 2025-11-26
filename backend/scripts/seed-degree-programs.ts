/**
 * Seed Degree Programs
 * Creates comprehensive degree programs from Certificate to Doctorate
 * across all faculties
 */

import { PrismaClient, DegreeType, RequirementCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface DegreeProgramSeed {
  name: string;
  code: string;
  degreeType: DegreeType;
  facultyCode: string;
  description: string;
  totalCredits: number;
  minimumGpa: number;
  estimatedDurationMonths: number;
  requirements: {
    category: RequirementCategory;
    name: string;
    description: string;
    creditHours: number;
    minimumGrade?: string;
  }[];
  spiritualRequirements: {
    name: string;
    description: string;
    type: string;
    minimumScore?: number;
  }[];
}

const degreeProgramSeeds: DegreeProgramSeed[] = [
  // ScrollAI Faculty - All Degree Levels
  {
    name: 'Certificate in AI Foundations',
    code: 'CERT-AI-FOUND',
    degreeType: 'CERTIFICATE',
    facultyCode: 'SCROLLAI',
    description: 'Foundational certificate in AI principles with kingdom ethics',
    totalCredits: 18,
    minimumGpa: 2.0,
    estimatedDurationMonths: 6,
    requirements: [
      {
        category: 'CORE',
        name: 'AI Core Courses',
        description: 'Foundational AI courses',
        creditHours: 12,
        minimumGrade: 'C',
      },
      {
        category: 'SPIRITUAL_FORMATION',
        name: 'Spiritual Formation',
        description: 'Biblical foundations for AI ethics',
        creditHours: 3,
      },
      {
        category: 'ELECTIVE',
        name: 'Technical Electives',
        description: 'Choose from approved AI electives',
        creditHours: 3,
      },
    ],
    spiritualRequirements: [
      {
        name: 'Daily Devotions',
        description: 'Complete 90 days of devotional practice',
        type: 'DAILY_DEVOTIONS',
        minimumScore: 90,
      },
    ],
  },
  {
    name: 'Associate of Science in Artificial Intelligence',
    code: 'AS-AI',
    degreeType: 'ASSOCIATE',
    facultyCode: 'SCROLLAI',
    description: 'Two-year associate degree in AI with prophetic wisdom integration',
    totalCredits: 60,
    minimumGpa: 2.5,
    estimatedDurationMonths: 24,
    requirements: [
      {
        category: 'GENERAL_EDUCATION',
        name: 'General Education',
        description: 'Core general education requirements',
        creditHours: 18,
      },
      {
        category: 'MAJOR',
        name: 'AI Major Courses',
        description: 'Core AI and machine learning courses',
        creditHours: 30,
        minimumGrade: 'C',
      },
      {
        category: 'SPIRITUAL_FORMATION',
        name: 'Spiritual Formation',
        description: 'Biblical worldview and spiritual development',
        creditHours: 6,
      },
      {
        category: 'ELECTIVE',
        name: 'Electives',
        description: 'Choose from approved electives',
        creditHours: 6,
      },
    ],
    spiritualRequirements: [
      {
        name: 'Daily Devotions',
        description: 'Complete 180 days of devotional practice',
        type: 'DAILY_DEVOTIONS',
        minimumScore: 180,
      },
      {
        name: 'Scripture Memory',
        description: 'Memorize 20 key verses',
        type: 'SCRIPTURE_MEMORY',
        minimumScore: 20,
      },
    ],
  },
  {
    name: 'Bachelor of Science in Artificial Intelligence',
    code: 'BS-AI',
    degreeType: 'BACHELOR',
    facultyCode: 'SCROLLAI',
    description: 'Comprehensive four-year degree in AI with kingdom ethics and prophetic intelligence',
    totalCredits: 120,
    minimumGpa: 2.5,
    estimatedDurationMonths: 48,
    requirements: [
      {
        category: 'GENERAL_EDUCATION',
        name: 'General Education',
        description: 'Liberal arts foundation',
        creditHours: 36,
      },
      {
        category: 'MAJOR',
        name: 'AI Major Courses',
        description: 'Comprehensive AI curriculum',
        creditHours: 54,
        minimumGrade: 'C',
      },
      {
        category: 'SPIRITUAL_FORMATION',
        name: 'Spiritual Formation',
        description: 'Biblical worldview and ministry preparation',
        creditHours: 12,
      },
      {
        category: 'CAPSTONE',
        name: 'Senior Capstone Project',
        description: 'Real-world AI project with kingdom impact',
        creditHours: 6,
        minimumGrade: 'B',
      },
      {
        category: 'ELECTIVE',
        name: 'Electives',
        description: 'Choose from approved electives',
        creditHours: 12,
      },
    ],
    spiritualRequirements: [
      {
        name: 'Daily Devotions',
        description: 'Complete 365 days of devotional practice',
        type: 'DAILY_DEVOTIONS',
        minimumScore: 365,
      },
      {
        name: 'Scripture Memory',
        description: 'Memorize 50 key verses',
        type: 'SCRIPTURE_MEMORY',
        minimumScore: 50,
      },
      {
        name: 'Ministry Service',
        description: 'Complete 100 hours of ministry service',
        type: 'MINISTRY_SERVICE',
        minimumScore: 100,
      },
    ],
  },
  {
    name: 'Master of Science in Artificial Intelligence',
    code: 'MS-AI',
    degreeType: 'MASTER',
    facultyCode: 'SCROLLAI',
    description: 'Advanced graduate degree in AI with research focus and prophetic application',
    totalCredits: 36,
    minimumGpa: 3.0,
    estimatedDurationMonths: 24,
    requirements: [
      {
        category: 'CORE',
        name: 'Advanced AI Core',
        description: 'Graduate-level AI courses',
        creditHours: 18,
        minimumGrade: 'B',
      },
      {
        category: 'MAJOR',
        name: 'Specialization Courses',
        description: 'Focus area specialization',
        creditHours: 9,
        minimumGrade: 'B',
      },
      {
        category: 'SPIRITUAL_FORMATION',
        name: 'Advanced Spiritual Formation',
        description: 'Leadership and prophetic intelligence',
        creditHours: 3,
      },
      {
        category: 'CAPSTONE',
        name: 'Master\'s Thesis',
        description: 'Original research with kingdom application',
        creditHours: 6,
        minimumGrade: 'B',
      },
    ],
    spiritualRequirements: [
      {
        name: 'Prophetic Check-ins',
        description: 'Complete 24 prophetic check-ins',
        type: 'PROPHETIC_CHECKIN',
        minimumScore: 24,
      },
      {
        name: 'Spiritual Mentorship',
        description: 'Mentor 3 undergraduate students',
        type: 'SPIRITUAL_MENTORSHIP',
        minimumScore: 3,
      },
    ],
  },
  {
    name: 'Doctor of Philosophy in Artificial Intelligence',
    code: 'PHD-AI',
    degreeType: 'DOCTORATE',
    facultyCode: 'SCROLLAI',
    description: 'Terminal doctoral degree in AI with original research and kingdom transformation focus',
    totalCredits: 72,
    minimumGpa: 3.5,
    estimatedDurationMonths: 60,
    requirements: [
      {
        category: 'CORE',
        name: 'Doctoral Seminars',
        description: 'Advanced doctoral-level seminars',
        creditHours: 24,
        minimumGrade: 'B',
      },
      {
        category: 'MAJOR',
        name: 'Research Methods',
        description: 'Advanced research methodology',
        creditHours: 12,
        minimumGrade: 'B',
      },
      {
        category: 'SPIRITUAL_FORMATION',
        name: 'Doctoral Spiritual Formation',
        description: 'Advanced leadership and prophetic ministry',
        creditHours: 6,
      },
      {
        category: 'CAPSTONE',
        name: 'Doctoral Dissertation',
        description: 'Original research contributing to kingdom advancement',
        creditHours: 30,
        minimumGrade: 'B',
      },
    ],
    spiritualRequirements: [
      {
        name: 'Prophetic Check-ins',
        description: 'Complete 60 prophetic check-ins',
        type: 'PROPHETIC_CHECKIN',
        minimumScore: 60,
      },
      {
        name: 'Spiritual Mentorship',
        description: 'Mentor 10 students',
        type: 'SPIRITUAL_MENTORSHIP',
        minimumScore: 10,
      },
      {
        name: 'Ministry Service',
        description: 'Complete 200 hours of advanced ministry',
        type: 'MINISTRY_SERVICE',
        minimumScore: 200,
      },
    ],
  },
  // Theology Faculty - All Degree Levels
  {
    name: 'Certificate in Biblical Studies',
    code: 'CERT-THEO-BIB',
    degreeType: 'CERTIFICATE',
    facultyCode: 'THEO',
    description: 'Foundational certificate in biblical interpretation and theology',
    totalCredits: 18,
    minimumGpa: 2.0,
    estimatedDurationMonths: 6,
    requirements: [
      {
        category: 'CORE',
        name: 'Biblical Studies Core',
        description: 'Foundational biblical courses',
        creditHours: 15,
        minimumGrade: 'C',
      },
      {
        category: 'SPIRITUAL_FORMATION',
        name: 'Spiritual Formation',
        description: 'Personal spiritual development',
        creditHours: 3,
      },
    ],
    spiritualRequirements: [
      {
        name: 'Daily Devotions',
        description: 'Complete 90 days of devotional practice',
        type: 'DAILY_DEVOTIONS',
        minimumScore: 90,
      },
      {
        name: 'Scripture Memory',
        description: 'Memorize 25 key verses',
        type: 'SCRIPTURE_MEMORY',
        minimumScore: 25,
      },
    ],
  },
  {
    name: 'Bachelor of Arts in Theology',
    code: 'BA-THEO',
    degreeType: 'BACHELOR',
    facultyCode: 'THEO',
    description: 'Comprehensive theological education with biblical languages and ministry preparation',
    totalCredits: 120,
    minimumGpa: 2.5,
    estimatedDurationMonths: 48,
    requirements: [
      {
        category: 'GENERAL_EDUCATION',
        name: 'General Education',
        description: 'Liberal arts foundation',
        creditHours: 36,
      },
      {
        category: 'MAJOR',
        name: 'Theology Major',
        description: 'Comprehensive theological curriculum',
        creditHours: 54,
        minimumGrade: 'C',
      },
      {
        category: 'SPIRITUAL_FORMATION',
        name: 'Spiritual Formation',
        description: 'Ministry and spiritual development',
        creditHours: 12,
      },
      {
        category: 'CAPSTONE',
        name: 'Senior Thesis',
        description: 'Theological research project',
        creditHours: 6,
        minimumGrade: 'B',
      },
      {
        category: 'ELECTIVE',
        name: 'Electives',
        description: 'Choose from approved electives',
        creditHours: 12,
      },
    ],
    spiritualRequirements: [
      {
        name: 'Daily Devotions',
        description: 'Complete 365 days of devotional practice',
        type: 'DAILY_DEVOTIONS',
        minimumScore: 365,
      },
      {
        name: 'Scripture Memory',
        description: 'Memorize 100 key verses',
        type: 'SCRIPTURE_MEMORY',
        minimumScore: 100,
      },
      {
        name: 'Ministry Service',
        description: 'Complete 150 hours of ministry service',
        type: 'MINISTRY_SERVICE',
        minimumScore: 150,
      },
    ],
  },
  {
    name: 'Master of Divinity',
    code: 'MDIV',
    degreeType: 'MASTER',
    facultyCode: 'THEO',
    description: 'Professional degree for pastoral ministry and theological leadership',
    totalCredits: 90,
    minimumGpa: 3.0,
    estimatedDurationMonths: 36,
    requirements: [
      {
        category: 'CORE',
        name: 'Biblical Studies',
        description: 'Advanced biblical interpretation',
        creditHours: 30,
        minimumGrade: 'B',
      },
      {
        category: 'MAJOR',
        name: 'Systematic Theology',
        description: 'Theological foundations',
        creditHours: 24,
        minimumGrade: 'B',
      },
      {
        category: 'MAJOR',
        name: 'Practical Ministry',
        description: 'Ministry skills and leadership',
        creditHours: 24,
        minimumGrade: 'B',
      },
      {
        category: 'SPIRITUAL_FORMATION',
        name: 'Spiritual Formation',
        description: 'Advanced spiritual development',
        creditHours: 6,
      },
      {
        category: 'CAPSTONE',
        name: 'Ministry Internship',
        description: 'Supervised ministry experience',
        creditHours: 6,
        minimumGrade: 'B',
      },
    ],
    spiritualRequirements: [
      {
        name: 'Prophetic Check-ins',
        description: 'Complete 36 prophetic check-ins',
        type: 'PROPHETIC_CHECKIN',
        minimumScore: 36,
      },
      {
        name: 'Ministry Service',
        description: 'Complete 300 hours of ministry',
        type: 'MINISTRY_SERVICE',
        minimumScore: 300,
      },
      {
        name: 'Spiritual Mentorship',
        description: 'Mentor 5 students',
        type: 'SPIRITUAL_MENTORSHIP',
        minimumScore: 5,
      },
    ],
  },
  {
    name: 'Doctor of Theology',
    code: 'THD',
    degreeType: 'DOCTORATE',
    facultyCode: 'THEO',
    description: 'Terminal academic degree in theology with original research',
    totalCredits: 72,
    minimumGpa: 3.5,
    estimatedDurationMonths: 60,
    requirements: [
      {
        category: 'CORE',
        name: 'Doctoral Seminars',
        description: 'Advanced theological seminars',
        creditHours: 24,
        minimumGrade: 'B',
      },
      {
        category: 'MAJOR',
        name: 'Research Methods',
        description: 'Theological research methodology',
        creditHours: 12,
        minimumGrade: 'B',
      },
      {
        category: 'SPIRITUAL_FORMATION',
        name: 'Doctoral Spiritual Formation',
        description: 'Advanced spiritual leadership',
        creditHours: 6,
      },
      {
        category: 'CAPSTONE',
        name: 'Doctoral Dissertation',
        description: 'Original theological research',
        creditHours: 30,
        minimumGrade: 'B',
      },
    ],
    spiritualRequirements: [
      {
        name: 'Prophetic Check-ins',
        description: 'Complete 60 prophetic check-ins',
        type: 'PROPHETIC_CHECKIN',
        minimumScore: 60,
      },
      {
        name: 'Spiritual Mentorship',
        description: 'Mentor 15 students',
        type: 'SPIRITUAL_MENTORSHIP',
        minimumScore: 15,
      },
      {
        name: 'Ministry Service',
        description: 'Complete 400 hours of advanced ministry',
        type: 'MINISTRY_SERVICE',
        minimumScore: 400,
      },
    ],
  },
];

async function seedDegreePrograms() {
  console.log('🎓 Starting degree program seeding...\n');

  try {
    // Get all faculties
    const faculties = await prisma.faculty.findMany();
    const facultyMap = new Map(faculties.map(f => [f.name.includes('AI') ? 'SCROLLAI' : 'THEO', f.id]));

    let created = 0;
    let skipped = 0;

    for (const seed of degreeProgramSeeds) {
      // Check if program already exists
      const existing = await prisma.degreeProgram.findUnique({
        where: { code: seed.code },
      });

      if (existing) {
        console.log(`⏭️  Skipping ${seed.name} (already exists)`);
        skipped++;
        continue;
      }

      // Get faculty ID
      const facultyId = facultyMap.get(seed.facultyCode);
      if (!facultyId) {
        console.log(`❌ Faculty not found for ${seed.facultyCode}`);
        continue;
      }

      // Create degree program
      const program = await prisma.degreeProgram.create({
        data: {
          name: seed.name,
          code: seed.code,
          degreeType: seed.degreeType,
          facultyId,
          description: seed.description,
          totalCredits: seed.totalCredits,
          minimumGpa: seed.minimumGpa,
          estimatedDurationMonths: seed.estimatedDurationMonths,
        },
      });

      // Create requirements
      for (let i = 0; i < seed.requirements.length; i++) {
        const req = seed.requirements[i];
        await prisma.degreeRequirement.create({
          data: {
            degreeProgramId: program.id,
            category: req.category,
            name: req.name,
            description: req.description,
            creditHours: req.creditHours,
            minimumGrade: req.minimumGrade,
            orderIndex: i,
            requiredCourses: [],
            electiveOptions: [],
          },
        });
      }

      // Create spiritual requirements
      for (let i = 0; i < seed.spiritualRequirements.length; i++) {
        const req = seed.spiritualRequirements[i];
        await prisma.spiritualFormationRequirement.create({
          data: {
            degreeProgramId: program.id,
            name: req.name,
            description: req.description,
            type: req.type,
            minimumScore: req.minimumScore,
            orderIndex: i,
          },
        });
      }

      console.log(`✅ Created ${seed.name} (${seed.degreeType})`);
      created++;
    }

    console.log(`\n🎉 Degree program seeding complete!`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${created + skipped}`);

  } catch (error) {
    console.error('❌ Error seeding degree programs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedDegreePrograms()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedDegreePrograms;
