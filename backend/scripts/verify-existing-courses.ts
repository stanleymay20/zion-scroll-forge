/**
 * Verify Existing Course Content
 * "By wisdom a house is built, and through understanding it is established" - Proverbs 24:3
 * 
 * Check what courses and content already exist in the database
 */

import { PrismaClient, CourseProject, CourseModule, Lecture } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

interface CourseWithCount extends CourseProject {
  _count: {
    CourseModule: number;
  };
}

interface ModuleWithCount extends CourseModule {
  _count: {
    Lecture: number;
  };
}

interface VerificationSummary {
  totalCourses: number;
  totalModules: number;
  totalLectures: number;
  courseDetails: Array<{
    code: string;
    title: string;
    modules: number;
    lectures: number;
  }>;
}

/**
 * Verify existing course content in database
 */
async function verifyExistingCourses(): Promise<VerificationSummary> {
  console.log('\n🔍 Checking Existing Course Content\n');
  console.log('='.repeat(70));

  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connection established\n');

    // Check courses
    const courses: CourseWithCount[] = await prisma.courseProject.findMany({
      include: {
        _count: {
          select: {
            CourseModule: true
          }
        }
      }
    });

    console.log(`\n📚 Found ${courses.length} courses in database:\n`);
    
    for (const course of courses) {
      console.log(`   ✅ ${course.code}: ${course.title}`);
      console.log(`      - Modules: ${course._count.CourseModule}`);
      console.log(`      - Credits: ${course.credits}`);
      console.log(`      - Level: ${course.level}`);
    }

    // Check modules
    const modules: ModuleWithCount[] = await prisma.courseModule.findMany({
      include: {
        _count: {
          select: {
            Lecture: true
          }
        }
      }
    });

    console.log(`\n📖 Found ${modules.length} total modules`);

    // Check lectures
    const lectures: Lecture[] = await prisma.lecture.findMany();
    console.log(`📝 Found ${lectures.length} total lectures`);

    // Detailed breakdown by course
    console.log('\n' + '='.repeat(70));
    console.log('📊 Detailed Course Breakdown:\n');

    const courseDetails: VerificationSummary['courseDetails'] = [];

    for (const course of courses) {
      const courseModules: ModuleWithCount[] = await prisma.courseModule.findMany({
        where: { course_project_id: course.id },
        include: {
          _count: {
            select: {
              Lecture: true
            }
          }
        }
      });

      console.log(`\n${course.code} - ${course.title}`);
      console.log(`   Modules: ${courseModules.length}`);
      
      let totalLectures = 0;
      for (const module of courseModules) {
        totalLectures += module._count.Lecture;
        console.log(`   - ${module.title}: ${module._count.Lecture} lectures`);
      }
      
      console.log(`   Total Lectures: ${totalLectures}`);

      courseDetails.push({
        code: course.code,
        title: course.title,
        modules: courseModules.length,
        lectures: totalLectures
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Verification Complete!\n');

    const summary: VerificationSummary = {
      totalCourses: courses.length,
      totalModules: modules.length,
      totalLectures: lectures.length,
      courseDetails
    };

    return summary;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Verification failed:', errorMessage);
    
    if (error instanceof Error && error.message.includes('connect')) {
      console.error('\n💡 Database connection failed. Please ensure:');
      console.error('   1. PostgreSQL is running');
      console.error('   2. DATABASE_URL is correctly set in .env');
      console.error('   3. Database migrations have been applied\n');
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    const summary = await verifyExistingCourses();
    
    console.log('\n✨ Course verification completed successfully');
    console.log(`\n📊 Summary:`);
    console.log(`   - Total Courses: ${summary.totalCourses}`);
    console.log(`   - Total Modules: ${summary.totalModules}`);
    console.log(`   - Total Lectures: ${summary.totalLectures}\n`);
    
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n💥 Course verification failed:', errorMessage);
    process.exit(1);
  }
}

// Execute main function
main();
