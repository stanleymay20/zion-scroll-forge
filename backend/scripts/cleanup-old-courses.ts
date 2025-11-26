#!/usr/bin/env ts-node
/**
 * Cleanup Old Course Content
 * 
 * Removes old template-based course content that doesn't meet
 * comprehensive standards.
 */

import * as fs from 'fs';
import * as path from 'path';

const coursesDir = path.join(process.cwd(), '..', 'courses');

console.log('\n🧹 Cleaning up old course content...\n');

// Courses with template content to remove
const oldCourses = [
  'COURSE_THEO101',
  'COURSE_THEO201',
  'COURSE_THEO301',
  'COURSE_THEO401',
  'COURSE_THEO501',
  'COURSE_ECON101',
  'COURSE_ECON201',
  'COURSE_ECON301',
  'COURSE_ECON401',
  'COURSE_SCROLLFOUND_101'
];

// Keep this one - it's manually created and high quality
const keepCourses = [
  'COURSE_001_Sacred_AI_Engineering'
];

let removedCount = 0;
let keptCount = 0;

if (fs.existsSync(coursesDir)) {
  const entries = fs.readdirSync(coursesDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const courseName = entry.name;
      const coursePath = path.join(coursesDir, courseName);
      
      if (keepCourses.includes(courseName)) {
        console.log(`✅ Keeping: ${courseName} (manually created, high quality)`);
        keptCount++;
        continue;
      }
      
      if (oldCourses.includes(courseName)) {
        console.log(`🗑️  Removing: ${courseName} (template content)`);
        
        // Remove directory recursively
        fs.rmSync(coursePath, { recursive: true, force: true });
        removedCount++;
      } else {
        console.log(`⚠️  Unknown course: ${courseName} (leaving as-is)`);
      }
    }
  }
} else {
  console.log('📁 Courses directory does not exist yet');
}

console.log('\n' + '='.repeat(60));
console.log('✅ Cleanup Complete');
console.log('='.repeat(60));
console.log(`Removed: ${removedCount} old courses`);
console.log(`Kept: ${keptCount} high-quality courses`);
console.log('');
console.log('Ready for fresh course generation!');
console.log('');
