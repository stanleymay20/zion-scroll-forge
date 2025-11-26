#!/usr/bin/env node
/**
 * Parallel Course Generator - Generates multiple courses simultaneously
 * Scales up to 10,000+ courses with distributed generation
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

interface CourseDefinition {
  code: string;
  title: string;
  description: string;
  credits: number;
  level: string;
  moduleCount: number;
  lecturesPerModule: number;
  spiritualFocus: string;
  realWorldApplication: string;
  domainExpertise: string;
}

interface GenerationWorker {
  id: number;
  process: any;
  courseCode: string;
  status: 'idle' | 'running' | 'complete' | 'failed';
  startTime?: number;
  endTime?: number;
}

class ParallelCourseGenerator {
  private workers: GenerationWorker[] = [];
  private maxWorkers: number;
  private courseQueue: CourseDefinition[] = [];
  private completed: string[] = [];
  private failed: string[] = [];
  private logPath: string;

  constructor(maxWorkers: number = 5) {
    this.maxWorkers = maxWorkers;
    this.logPath = path.join(__dirname, '../../courses/parallel-generation-log.json');
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🚀 PARALLEL COURSE GENERATOR`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Max parallel workers: ${this.maxWorkers}`);
    console.log(`${'='.repeat(80)}\n`);
  }

  async generateAllCourses(): Promise<void> {
    const catalogPath = path.join(__dirname, '../data/full-course-catalog.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    
    this.courseQueue = [...catalog.courses];
    
    console.log(`📚 Total courses to generate: ${this.courseQueue.length}`);
    console.log(`⚡ Parallel workers: ${this.maxWorkers}`);
    console.log(`⏱️  Estimated time: ${this.estimateTime(this.courseQueue.length)} minutes\n`);

    // Initialize workers
    for (let i = 0; i < this.maxWorkers; i++) {
      this.workers.push({
        id: i + 1,
        process: null,
        courseCode: '',
        status: 'idle'
      });
    }

    // Start generation
    const startTime = Date.now();
    await this.runGenerationLoop();
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);

    // Final report
    console.log(`\n${'='.repeat(80)}`);
    console.log(`PARALLEL GENERATION COMPLETE`);
    console.log(`${'='.repeat(80)}`);
    console.log(`✅ Completed: ${this.completed.length}`);
    console.log(`❌ Failed: ${this.failed.length}`);
    console.log(`⏱️  Total time: ${duration} minutes`);
    console.log(`📄 Log: ${this.logPath}`);
    console.log(`${'='.repeat(80)}\n`);

    this.saveLog();
  }

  private async runGenerationLoop(): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        // Assign courses to idle workers
        for (const worker of this.workers) {
          if (worker.status === 'idle' && this.courseQueue.length > 0) {
            const course = this.courseQueue.shift()!;
            this.startWorker(worker, course);
          }
        }

        // Check if all done
        const allIdle = this.workers.every(w => w.status === 'idle');
        const queueEmpty = this.courseQueue.length === 0;
        
        if (allIdle && queueEmpty) {
          clearInterval(checkInterval);
          resolve();
        }

        // Progress update
        this.printProgress();
      }, 2000);
    });
  }

  private startWorker(worker: GenerationWorker, course: CourseDefinition): void {
    worker.courseCode = course.code;
    worker.status = 'running';
    worker.startTime = Date.now();

    console.log(`[Worker ${worker.id}] 🚀 Starting: ${course.code}`);

    const scriptPath = path.join(__dirname, 'generate-full-course-standalone.ts');
    
    worker.process = spawn('npx', ['tsx', scriptPath, course.code], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env },
      stdio: 'pipe'
    });

    let output = '';

    worker.process.stdout?.on('data', (data: Buffer) => {
      output += data.toString();
    });

    worker.process.stderr?.on('data', (data: Buffer) => {
      output += data.toString();
    });

    worker.process.on('close', (code: number) => {
      worker.endTime = Date.now();
      const duration = ((worker.endTime - worker.startTime!) / 1000 / 60).toFixed(2);

      if (code === 0) {
        worker.status = 'complete';
        this.completed.push(course.code);
        console.log(`[Worker ${worker.id}] ✅ ${course.code} COMPLETE (${duration} min)`);
      } else {
        worker.status = 'failed';
        this.failed.push(course.code);
        console.log(`[Worker ${worker.id}] ❌ ${course.code} FAILED (${duration} min)`);
        
        // Log error
        const errorLog = path.join(__dirname, `../../courses/error-${course.code}.log`);
        fs.writeFileSync(errorLog, output);
      }

      worker.status = 'idle';
      worker.process = null;
    });
  }

  private printProgress(): void {
    const total = this.completed.length + this.failed.length + this.courseQueue.length + 
                  this.workers.filter(w => w.status === 'running').length;
    const done = this.completed.length + this.failed.length;
    const progress = ((done / total) * 100).toFixed(1);

    const running = this.workers.filter(w => w.status === 'running');
    
    process.stdout.write(`\r📊 Progress: ${done}/${total} (${progress}%) | ` +
                        `✅ ${this.completed.length} | ❌ ${this.failed.length} | ` +
                        `⚡ ${running.length} active`);
  }

  private estimateTime(courseCount: number): number {
    const avgTimePerCourse = 2.5; // minutes
    const parallelTime = (courseCount / this.maxWorkers) * avgTimePerCourse;
    return Math.ceil(parallelTime);
  }

  private saveLog(): void {
    const log = {
      timestamp: new Date().toISOString(),
      maxWorkers: this.maxWorkers,
      completed: this.completed,
      failed: this.failed,
      stats: {
        total: this.completed.length + this.failed.length,
        successRate: ((this.completed.length / (this.completed.length + this.failed.length)) * 100).toFixed(2) + '%'
      }
    };

    fs.writeFileSync(this.logPath, JSON.stringify(log, null, 2));
  }
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const maxWorkers = args[0] ? parseInt(args[0]) : 5;

  if (isNaN(maxWorkers) || maxWorkers < 1 || maxWorkers > 20) {
    console.error('❌ Invalid worker count. Use 1-20 workers.');
    process.exit(1);
  }

  const generator = new ParallelCourseGenerator(maxWorkers);
  
  try {
    await generator.generateAllCourses();
    console.log('\n✅ ALL PARALLEL GENERATION COMPLETE!');
  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:', error.message);
    process.exit(1);
  }
}

main();
