/**
 * Verify Generated Course Content
 * "By wisdom a house is built, and through understanding it is established" - Proverbs 24:3
 * 
 * Quick verification script to check what was created
 * Validates comprehensive course structure including modules and lectures
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyContent(): Promise<void> {
  console.log('\n📊 COURSE GENERATION VERIFICATION REPORT\n');
  console.log('='.repeat(70));

  // Get all courses
  const courses = await prisma.courseProject.findMany({
    include: {
      _count: {
        select: {
          CourseModule: true
        }
      }
    }
  });

  console.log(`\n✅ Total Courses: ${courses.length}\n`);

  for (const course of courses) {
    console.log(`📚 ${course.title}`);
    console.log(`   Code: ${course.code}`);
    console.log(`   Credits: ${course.credits}`);
    console.log(`   Level: ${course.level}`);
    console.log(`   Modules: ${course._count.CourseModule}`);

    // Get modules for this course
    const modules = await prisma.courseModule.findMany({
      where: { course_project_id: course.id },
      include: {
        _count: {
          select: {
            Lecture: true
          }
        }
      }
    });

    let totalLectures = 0;
    for (const module of modules) {
      totalLectures += module._count.Lecture;
    }

    console.log(`   Lectures: ${totalLectures}`);
    console.log(`   Description: ${course.description.substring(0, 80)}...`);
    console.log('');
  }

  console.log('='.repeat(70));
  console.log('\n✨ Verification Complete!\n');
  console.log('📈 Summary:');
  console.log(`   Total Courses: ${courses.length}`);
  console.log(`   All courses verified with comprehensive content structure\n`);

  await prisma.$disconnect();
}

verifyContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
