#!/usr/bin/env ts-node
/**
 * BATCH MASTER GENERATOR
 * 
 * Generates content in manageable batches to avoid overwhelming the system
 * Allows resuming from where it left off
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const BATCH_SIZE = 50; // Generate 50 items per batch
const CHECKPOINT_FILE = path.join(process.cwd(), 'generation-checkpoint.json');

interface Checkpoint {
  lastCompletedCourse: string | null;
  lastCompletedBook: string | null;
  completedCourses: string[];
  completedBooks: string[];
  timestamp: string;
}

function loadCheckpoint(): Checkpoint {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
  }
  
  return {
    lastCompletedCourse: null,
    lastCompletedBook: null,
    completedCourses: [],
    completedBooks: [],
    timestamp: new Date().toISOString()
  };
}

function saveCheckpoint(checkpoint: Checkpoint): void {
  checkpoint.timestamp = new Date().toISOString();
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

async function generateBatch(batchNumber: number): Promise<void> {
  console.log(`\n🚀 Starting Batch ${batchNumber} (${BATCH_SIZE} items)...`);
  
  const checkpoint = loadCheckpoint();
  
  // Generate courses in this batch
  for (let i = 0; i < BATCH_SIZE; i++) {
    const courseIndex = checkpoint.completedCourses.length + i;
    const courseCode = `BATCH_${batchNumber}_COURSE_${String(courseIndex).padStart(5, '0')}`;
    
    try {
      console.log(`  Generating ${courseCode}...`);
      execSync(`npx ts-node scripts/simple-course-generator.ts ${courseCode}`, {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      
      checkpoint.completedCourses.push(courseCode);
      checkpoint.lastCompletedCourse = courseCode;
      saveCheckpoint(checkpoint);
      
      console.log(`  ✅ ${courseCode} complete`);
    } catch (error) {
      console.error(`  ❌ Failed: ${courseCode}`);
    }
  }
  
  console.log(`\n✅ Batch ${batchNumber} complete!`);
  console.log(`📊 Total completed: ${checkpoint.completedCourses.length} courses`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const batchNumber = args[0] ? parseInt(args[0]) : 1;
  
  console.log('\n' + '='.repeat(80));
  console.log('📦 BATCH MASTER GENERATOR');
  console.log('='.repeat(80));
  console.log(`\nBatch Size: ${BATCH_SIZE} items`);
  console.log(`Starting Batch: ${batchNumber}\n`);
  
  await generateBatch(batchNumber);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ BATCH COMPLETE!');
  console.log('='.repeat(80));
  console.log('\nTo continue, run:');
  console.log(`npx ts-node scripts/batch-master-generator.ts ${batchNumber + 1}\n`);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
