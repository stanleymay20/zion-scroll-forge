/**
 * FULL THROTTLE Library Generation
 * Uses existing scroll library services with actual database schema
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';
import { AgentOrchestrationService } from '../src/services/scroll-library/AgentOrchestrationService';

const prisma = new PrismaClient();

async function executeFullThrottle(): Promise<void> {
  console.log('🚀 FULL THROTTLE LIBRARY GENERATION');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Fetch all courses from database
    console.log('📚 Fetching courses from database...');
    const courses = await prisma.courseProject.findMany({
      include: {
        CourseModule: {
          include: {
            Lecture: true,
            LearningObjective: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✓ Found ${courses.length} courses`);
    console.log('');

    if (courses.length === 0) {
      console.log('⚠ No courses found in database');
      console.log('Creating sample course for demonstration...');
      
      // Create a sample course
      const sampleCourse = await prisma.courseProject.create({
        data: {
          title: 'Introduction to Biblical Theology',
          code: 'THEO-101',
          description: 'A comprehensive introduction to systematic theology from a biblical perspective',
          credits: 3,
          level: 'UNDERGRADUATE',
          prerequisites: [],
          currentPhase: 'PLANNING',
          status: 'ACTIVE'
        }
      });

      courses.push(sampleCourse);
      console.log(`✓ Created sample course: ${sampleCourse.title}`);
    }

    // Initialize orchestration service
    console.log('🤖 Initializing AI orchestration service...');
    const orchestrator = new AgentOrchestrationService();
    console.log('✓ Service ready');
    console.log('');

    // Generate books for first 3 courses (pilot)
    const pilotCourses = courses.slice(0, 3);
    console.log(`📖 Generating books for ${pilotCourses.length} courses (pilot run)...`);
    console.log('');

    let completed = 0;
    let failed = 0;

    for (const course of pilotCourses) {
      try {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`📚 Course: ${course.title}`);
        console.log(`   Code: ${course.code}`);
        console.log(`   Level: ${course.level}`);
        console.log(`   Modules: ${course.CourseModule?.length || 0}`);
        console.log('');

        // Build course outline
        const outline = {
          title: `${course.title} - Comprehensive Textbook`,
          subject: course.code.split('-')[0] || 'General Studies',
          level: course.level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
          chapters: course.CourseModule?.map((module, index) => ({
            title: module.title,
            orderIndex: index + 1,
            topics: module.Lecture?.map(l => l.title) || [
              `Introduction to ${module.title}`,
              'Core Concepts',
              'Biblical Integration',
              'Practical Applications'
            ],
            learningObjectives: module.LearningObjective?.map(lo => lo.description) || [
              `Master ${module.title}`,
              'Apply biblical principles',
              'Develop kingdom perspective',
              'Serve with excellence'
            ]
          })) || [
            {
              title: 'Introduction and Foundations',
              orderIndex: 1,
              topics: ['Overview', 'Key Concepts', 'Biblical Framework', 'Practical Applications'],
              learningObjectives: ['Understand foundations', 'Apply knowledge', 'Integrate faith', 'Serve kingdom']
            }
          ],
          courseReference: course.id
        };

        console.log('⚙️  Generating book with AI agents...');
        console.log(`   - ScrollAuthorGPT: Writing chapters`);
        console.log(`   - ScrollProfessorGPT: Adding academic content`);
        console.log(`   - ScrollScribeGPT: Formatting and diagrams`);
        console.log(`   - ScrollResearcherGPT: Validating sources`);
        console.log(`   - ScrollIntegritySeal: Theological alignment`);
        console.log('');

        const startTime = Date.now();
        const book = await orchestrator.orchestrateBookGeneration(
          course.title,
          outline
        );
        const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

        console.log('✅ BOOK GENERATED SUCCESSFULLY!');
        console.log(`   Book ID: ${book.id}`);
        console.log(`   Chapters: ${book.chapters.length}`);
        console.log(`   Quality Score: ${(book.metadata.qualityScore * 100).toFixed(1)}%`);
        console.log(`   Theological Alignment: ${(book.metadata.theologicalAlignment * 100).toFixed(1)}%`);
        console.log(`   Generation Time: ${duration} minutes`);
        console.log('');

        completed++;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ FAILED: ${course.title}`);
        console.error(`   Error: ${errorMessage}`);
        console.error('');
        failed++;
      }
    }

    // Final report
    console.log('\n' + '='.repeat(80));
    console.log('🎉 PILOT GENERATION COMPLETE!');
    console.log('='.repeat(80));
    console.log(`Total Courses: ${pilotCourses.length}`);
    console.log(`✅ Completed: ${completed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((completed / pilotCourses.length) * 100).toFixed(1)}%`);
    console.log('');
    console.log('Next Steps:');
    console.log('  1. Review generated books in database');
    console.log('  2. Check quality metrics');
    console.log('  3. Scale to all courses with: npm run generate:library:enterprise');
    console.log('='.repeat(80));

  } catch (error) {
    logger.error('Full throttle generation failed', { error });
    console.error('\n❌ GENERATION FAILED');
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute
if (require.main === module) {
  executeFullThrottle()
    .then(() => {
      console.log('\n✓ Generation session complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Generation session failed:', error);
      process.exit(1);
    });
}

export { executeFullThrottle };
