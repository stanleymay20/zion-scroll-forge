/**
 * Optimized ScrollLibrary Generator - BEST OPTION
 * 
 * Features:
 * - 50 parallel workers (optimal balance)
 * - DeepSeek AI (cost-optimized)
 * - Enrollment-based priority
 * - Real-time monitoring
 * - Automatic retry
 * - Quality validation
 * - Progress persistence
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';
import { AgentOrchestrationService } from '../src/services/scroll-library/AgentOrchestrationService';
import { LibraryManagementService } from '../src/services/scroll-library/LibraryManagementService';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface OptimizedConfig {
  workerCount: number;
  priorityMode: 'enrollment' | 'creation-date' | 'alphabetical';
  aiModel: 'deepseek' | 'gpt-4' | 'claude';
  qualityThreshold: number;
  maxRetries: number;
  batchSize: number;
}

interface GenerationMetrics {
  totalBooks: number;
  completed: number;
  failed: number;
  inProgress: number;
  totalCost: number;
  averageQuality: number;
  startTime: Date;
  estimatedCompletion?: Date;
}

const OPTIMAL_CONFIG: OptimizedConfig = {
  workerCount: 50,
  priorityMode: 'enrollment',
  aiModel: 'deepseek',
  qualityThreshold: 0.90,
  maxRetries: 3,
  batchSize: 10
};

const PROGRESS_FILE = path.join(__dirname, '../data/enterprise-generation/optimized-progress.json');
const METRICS_FILE = path.join(__dirname, '../data/enterprise-generation/metrics.json');

/**
 * Main optimized generation function
 */
async function generateOptimized(targetCount?: number): Promise<void> {
  logger.info('Starting optimized library generation', { config: OPTIMAL_CONFIG });

  const metrics: GenerationMetrics = {
    totalBooks: 0,
    completed: 0,
    failed: 0,
    inProgress: 0,
    totalCost: 0,
    averageQuality: 0,
    startTime: new Date()
  };

  try {
    // Fetch courses with priority
    const courses = await fetchPrioritizedCourses(targetCount);
    metrics.totalBooks = courses.length;

    logger.info(`Fetched ${courses.length} courses for generation`);

    // Initialize services
    const orchestrator = new AgentOrchestrationService();
    const libraryService = new LibraryManagementService();

    // Distribute work across workers
    const coursesPerWorker = Math.ceil(courses.length / OPTIMAL_CONFIG.workerCount);
    const workers: Promise<void>[] = [];

    for (let i = 0; i < OPTIMAL_CONFIG.workerCount; i++) {
      const start = i * coursesPerWorker;
      const end = Math.min(start + coursesPerWorker, courses.length);
      const workerCourses = courses.slice(start, end);

      if (workerCourses.length > 0) {
        workers.push(
          optimizedWorker(i, workerCourses, orchestrator, libraryService, metrics)
        );
      }
    }

    // Monitor progress
    const progressMonitor = setInterval(() => {
      updateMetrics(metrics);
      saveProgress(metrics);
    }, 30000); // Every 30 seconds

    // Wait for completion
    await Promise.all(workers);

    clearInterval(progressMonitor);

    // Final report
    generateFinalReport(metrics);

  } catch (error) {
    logger.error('Optimized generation failed', { error });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetch courses with priority sorting
 */
async function fetchPrioritizedCourses(limit?: number): Promise<any[]> {
  const orderBy = OPTIMAL_CONFIG.priorityMode === 'enrollment'
    ? { enrollments: { _count: 'desc' } }
    : OPTIMAL_CONFIG.priorityMode === 'creation-date'
    ? { createdAt: 'desc' }
    : { title: 'asc' };

  const courses = await prisma.courseProject.findMany({
    take: limit,
    orderBy,
    where: {
      // Only courses without textbooks
      textbookId: null
    },
    include: {
      CourseModule: {
        include: {
          Lecture: true
        }
      },
      _count: {
        select: {
          enrollments: true
        }
      }
    }
  });

  return courses;
}

/**
 * Optimized worker with retry logic
 */
async function optimizedWorker(
  workerId: number,
  courses: any[],
  orchestrator: AgentOrchestrationService,
  libraryService: LibraryManagementService,
  metrics: GenerationMetrics
): Promise<void> {
  logger.info(`Worker ${workerId} started with ${courses.length} courses`);

  for (const course of courses) {
    let attempts = 0;
    let success = false;

    while (attempts < OPTIMAL_CONFIG.maxRetries && !success) {
      try {
        attempts++;
        metrics.inProgress++;

        logger.info(`Worker ${workerId}: Generating book for ${course.title} (attempt ${attempts})`);

        // Generate book outline from course
        const outline = courseToOutline(course);

        // Generate book with optimized settings
        const book = await orchestrator.orchestrateBookGeneration(
          course.title,
          outline,
          {
            model: OPTIMAL_CONFIG.aiModel,
            qualityThreshold: OPTIMAL_CONFIG.qualityThreshold
          }
        );

        // Validate quality
        if (book.metadata.qualityScore < OPTIMAL_CONFIG.qualityThreshold) {
          throw new Error(`Quality score ${book.metadata.qualityScore} below threshold`);
        }

        // Link to course
        await prisma.courseProject.update({
          where: { id: course.id },
          data: {
            // Note: textbookId field needs to be added to schema
            // For now, book is linked via courseReference in scroll_books table
          }
        });

        // Update metrics
        metrics.completed++;
        metrics.inProgress--;
        metrics.totalCost += estimateBookCost(book);
        metrics.averageQuality = 
          (metrics.averageQuality * (metrics.completed - 1) + book.metadata.qualityScore) / 
          metrics.completed;

        success = true;

        logger.info(`Worker ${workerId}: Completed ${course.title}`, {
          quality: book.metadata.qualityScore,
          attempts
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Worker ${workerId}: Failed ${course.title} (attempt ${attempts})`, {
          error: errorMessage
        });

        if (attempts >= OPTIMAL_CONFIG.maxRetries) {
          metrics.failed++;
          metrics.inProgress--;
          logger.error(`Worker ${workerId}: Giving up on ${course.title} after ${attempts} attempts`);
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 5000 * attempts));
        }
      }
    }

    // Small delay between books
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  logger.info(`Worker ${workerId} completed all assigned courses`);
}

/**
 * Convert course to book outline
 */
function courseToOutline(course: any): any {
  const chapters = course.CourseModule?.map((module: any, index: number) => ({
    title: module.title,
    orderIndex: index + 1,
    topics: module.Lecture?.map((l: any) => l.title) || [
      `Introduction to ${module.title}`,
      'Core Concepts',
      'Practical Applications',
      'Advanced Topics'
    ],
    learningObjectives: [
      `Master ${module.title}`,
      'Apply concepts practically',
      'Integrate biblical principles',
      'Develop kingdom perspective'
    ]
  })) || generateDefaultChapters();

  return {
    title: `${course.title} - Comprehensive Textbook`,
    subject: course.subject || 'General Studies',
    level: course.level || 'intermediate',
    chapters,
    courseReference: course.id
  };
}

/**
 * Generate default chapters if none exist
 */
function generateDefaultChapters(): any[] {
  const titles = [
    'Introduction and Foundations',
    'Core Principles',
    'Biblical Integration',
    'Practical Applications',
    'Advanced Topics',
    'Case Studies',
    'Kingdom Perspective',
    'Implementation',
    'Assessment',
    'Conclusion'
  ];

  return titles.map((title, index) => ({
    title,
    orderIndex: index + 1,
    topics: [
      `Overview of ${title}`,
      'Key concepts',
      'Practical applications',
      'Spiritual integration'
    ],
    learningObjectives: [
      `Understand ${title}`,
      'Apply knowledge',
      'Integrate with faith',
      'Serve kingdom purposes'
    ]
  }));
}

/**
 * Estimate book generation cost
 */
function estimateBookCost(book: any): number {
  // DeepSeek pricing: ~$0.14 per 1M tokens
  // Average book: ~200K tokens
  // Cost per book: ~$3
  return 3.0;
}

/**
 * Update metrics with time estimates
 */
function updateMetrics(metrics: GenerationMetrics): void {
  const elapsed = Date.now() - metrics.startTime.getTime();
  const completionRate = metrics.completed / metrics.totalBooks;

  if (completionRate > 0) {
    const estimatedTotal = elapsed / completionRate;
    const estimatedRemaining = estimatedTotal - elapsed;
    metrics.estimatedCompletion = new Date(Date.now() + estimatedRemaining);
  }
}

/**
 * Save progress to file
 */
function saveProgress(metrics: GenerationMetrics): void {
  try {
    const dir = path.dirname(PROGRESS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(metrics, null, 2));
    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  } catch (error) {
    logger.error('Failed to save progress', { error });
  }
}

/**
 * Generate final report
 */
function generateFinalReport(metrics: GenerationMetrics): void {
  const duration = Date.now() - metrics.startTime.getTime();
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);

  console.log('\n' + '='.repeat(80));
  console.log('GENERATION COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Total Books: ${metrics.totalBooks}`);
  console.log(`Completed: ${metrics.completed} (${((metrics.completed / metrics.totalBooks) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${metrics.failed}`);
  console.log(`Average Quality: ${(metrics.averageQuality * 100).toFixed(1)}%`);
  console.log(`Total Cost: $${metrics.totalCost.toFixed(2)}`);
  console.log(`Duration: ${hours}h ${minutes}m`);
  console.log('='.repeat(80) + '\n');
}

// CLI interface
if (require.main === module) {
  const targetCount = process.argv[2] ? parseInt(process.argv[2]) : undefined;

  generateOptimized(targetCount)
    .then(() => {
      logger.info('Generation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Generation failed', { error });
      process.exit(1);
    });
}

export { generateOptimized, OPTIMAL_CONFIG };
