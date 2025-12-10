#!/usr/bin/env ts-node
/**
 * PHASE 1 BATCH RUNNER
 * Uses the proven generate-complete-course.ts script to generate all 50 foundation courses
 * This approach guarantees quality since it uses working, tested code
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Phase 1 course list - 50 foundation courses
const PHASE1_COURSES = [
  // SCROLLMED (4 courses)
  { code: 'SCROLLMED_101', title: 'Foundations of Biblical Healing', faculty: 'SCROLLMED' },
  { code: 'SCROLLMED_201', title: 'Prophetic Medicine & Healing Ministry', faculty: 'SCROLLMED' },
  { code: 'SCROLLMED_301', title: 'Holistic Health & Spirit-Soul-Body Integration', faculty: 'SCROLLMED' },
  { code: 'SCROLLMED_401', title: 'Medical Missions & Global Health', faculty: 'SCROLLMED' },
  
  // LAWGOV (4 courses)
  { code: 'LAWGOV_101', title: 'Biblical Foundations of Law & Justice', faculty: 'LAWGOV' },
  { code: 'LAWGOV_201', title: 'Kingdom Governance & Theocratic Principles', faculty: 'LAWGOV' },
  { code: 'LAWGOV_301', title: 'Prophetic Intercession for Nations', faculty: 'LAWGOV' },
  { code: 'LAWGOV_401', title: 'Constitutional Law & Religious Liberty', faculty: 'LAWGOV' },
  
  // SCROLLECON (5 courses)
  { code: 'SCROLLECON_101', title: 'Biblical Economics & Stewardship', faculty: 'SCROLLECON' },
  { code: 'SCROLLECON_201', title: 'ScrollGold & Digital Currency Systems', faculty: 'SCROLLECON' },
  { code: 'SCROLLECON_301', title: 'Entrepreneurship & Business as Ministry', faculty: 'SCROLLECON' },
  { code: 'SCROLLECON_401', title: 'Global Economics & Financial Reformation', faculty: 'SCROLLECON' },
  { code: 'SCROLLECON_501', title: 'Wealth Transfer & Kingdom Investment', faculty: 'SCROLLECON' },
  
  // ETHICSCI (4 courses)
  { code: 'ETHICSCI_101', title: 'Creation Science & Biblical Cosmology', faculty: 'ETHICSCI' },
  { code: 'ETHICSCI_201', title: 'Christian Ethics & Moral Philosophy', faculty: 'ETHICSCI' },
  { code: 'ETHICSCI_301', title: 'Bioethics & Medical Ethics', faculty: 'ETHICSCI' },
  { code: 'ETHICSCI_401', title: 'Environmental Stewardship & Creation Care', faculty: 'ETHICSCI' },
  
  // PROPHINTEL (4 courses)
  { code: 'PROPHINTEL_101', title: 'Introduction to Prophetic Ministry', faculty: 'PROPHINTEL' },
  { code: 'PROPHINTEL_201', title: 'Spiritual Warfare & Intercession', faculty: 'PROPHINTEL' },
  { code: 'PROPHINTEL_301', title: 'Strategic Intelligence & Prophetic Insight', faculty: 'PROPHINTEL' },
  { code: 'PROPHINTEL_401', title: 'Deliverance Ministry & Inner Healing', faculty: 'PROPHINTEL' },
  
  // SACREDARTS (4 courses)
  { code: 'SACREDARTS_101', title: 'Worship & Creative Expression', faculty: 'SACREDARTS' },
  { code: 'SACREDARTS_201', title: 'Digital Media & Content Creation', faculty: 'SACREDARTS' },
  { code: 'SACREDARTS_301', title: 'Prophetic Worship & Spontaneous Song', faculty: 'SACREDARTS' },
  { code: 'SACREDARTS_401', title: 'Arts in Ministry & Cultural Transformation', faculty: 'SACREDARTS' },
  
  // KINGARCH (4 courses)
  { code: 'KINGARCH_101', title: 'Biblical Foundations of Building & Design', faculty: 'KINGARCH' },
  { code: 'KINGARCH_201', title: 'Sustainable Design & Green Building', faculty: 'KINGARCH' },
  { code: 'KINGARCH_301', title: 'Urban Planning & City Transformation', faculty: 'KINGARCH' },
  { code: 'KINGARCH_401', title: 'Engineering Excellence & Innovation', faculty: 'KINGARCH' },
  
  // GEOPROPHET (4 courses)
  { code: 'GEOPROPHET_101', title: 'Introduction to Prophetic Geopolitics', faculty: 'GEOPROPHET' },
  { code: 'GEOPROPHET_201', title: 'International Relations & Diplomacy', faculty: 'GEOPROPHET' },
  { code: 'GEOPROPHET_301', title: 'Territorial Spirits & National Strongholds', faculty: 'GEOPROPHET' },
  { code: 'GEOPROPHET_401', title: 'Prophetic Intercession for Nations', faculty: 'GEOPROPHET' },
  
  // DIVINETECH (5 courses)
  { code: 'DIVINETECH_101', title: 'Sacred AI & Ethical Technology', faculty: 'DIVINETECH' },
  { code: 'DIVINETECH_201', title: 'Software Engineering & Code Excellence', faculty: 'DIVINETECH' },
  { code: 'DIVINETECH_301', title: 'Blockchain & Decentralized Systems', faculty: 'DIVINETECH' },
  { code: 'DIVINETECH_401', title: 'Innovation & Prophetic Technology', faculty: 'DIVINETECH' },
  { code: 'DIVINETECH_501', title: 'Cybersecurity & Digital Stewardship', faculty: 'DIVINETECH' },
  
  // SCROLLMEDIA (4 courses)
  { code: 'SCROLLMEDIA_101', title: 'Foundations of Kingdom Communication', faculty: 'SCROLLMEDIA' },
  { code: 'SCROLLMEDIA_201', title: 'Digital Marketing & Social Media Ministry', faculty: 'SCROLLMEDIA' },
  { code: 'SCROLLMEDIA_301', title: 'Content Strategy & Storytelling', faculty: 'SCROLLMEDIA' },
  { code: 'SCROLLMEDIA_401', title: 'Media Production & Broadcasting', faculty: 'SCROLLMEDIA' },
  
  // KINGGOV (4 courses)
  { code: 'KINGGOV_101', title: 'Biblical Governance Principles', faculty: 'KINGGOV' },
  { code: 'KINGGOV_201', title: 'Public Policy & Legislative Process', faculty: 'KINGGOV' },
  { code: 'KINGGOV_301', title: 'Leadership & Organizational Management', faculty: 'KINGGOV' },
  { code: 'KINGGOV_401', title: 'Strategic Planning & Vision Casting', faculty: 'KINGGOV' },
  
  // SPIRITFORM (5 courses)
  { code: 'SPIRITFORM_101', title: 'Foundations of Spiritual Formation', faculty: 'SPIRITFORM' },
  { code: 'SPIRITFORM_201', title: 'Discipleship & Mentoring', faculty: 'SPIRITFORM' },
  { code: 'SPIRITFORM_301', title: 'Prayer & Intercession', faculty: 'SPIRITFORM' },
  { code: 'SPIRITFORM_401', title: 'Spiritual Direction & Soul Care', faculty: 'SPIRITFORM' },
  { code: 'SPIRITFORM_501', title: 'Contemplative Prayer & Mystical Theology', faculty: 'SPIRITFORM' }
];

interface Progress {
  total: number;
  completed: number;
  failed: string[];
  startTime: Date;
}

const progress: Progress = {
  total: PHASE1_COURSES.length,
  completed: 0,
  failed: [],
  startTime: new Date()
};

const logFile = path.join(process.cwd(), '..', 'phase1-batch-log.txt');

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(logFile, logMessage);
}

async function generateCourse(course: typeof PHASE1_COURSES[0]): Promise<boolean> {
  log(`\n🚀 Generating: ${course.code} - ${course.title}`);
  
  try {
    // Use the proven generate-complete-course.ts script
    const command = `npx ts-node scripts/generate-complete-course.ts "${course.code}"`;
    
    execSync(command, {
      cwd: process.cwd(),
      stdio: 'inherit',
      timeout: 1800000 // 30 minute timeout per course
    });
    
    progress.completed++;
    log(`✅ SUCCESS: ${course.code}`);
    return true;
    
  } catch (error) {
    progress.failed.push(course.code);
    log(`❌ FAILED: ${course.code} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function main(): Promise<void> {
  log('='.repeat(80));
  log('🎓 PHASE 1: FOUNDATION COURSES BATCH GENERATION');
  log('='.repeat(80));
  log(`Total Courses: ${progress.total}`);
  log(`Start Time: ${progress.startTime.toLocaleString()}`);
  log('='.repeat(80));
  
  for (let i = 0; i < PHASE1_COURSES.length; i++) {
    const course = PHASE1_COURSES[i];
    const percentage = ((i / progress.total) * 100).toFixed(1);
    
    log(`\n[${i + 1}/${progress.total}] (${percentage}%) - ${course.faculty}`);
    await generateCourse(course);
    
    // Progress update every 5 courses
    if ((i + 1) % 5 === 0) {
      const successRate = ((progress.completed / (i + 1)) * 100).toFixed(1);
      log(`\n📊 Progress: ${i + 1}/${progress.total} | Success Rate: ${successRate}%`);
    }
  }
  
  // Final report
  const duration = Date.now() - progress.startTime.getTime();
  const hours = (duration / 1000 / 60 / 60).toFixed(2);
  
  log('\n' + '='.repeat(80));
  log('🎉 PHASE 1 GENERATION COMPLETE!');
  log('='.repeat(80));
  log(`Completed: ${progress.completed}/${progress.total}`);
  log(`Failed: ${progress.failed.length}`);
  log(`Success Rate: ${((progress.completed / progress.total) * 100).toFixed(1)}%`);
  log(`Duration: ${hours} hours`);
  
  if (progress.failed.length > 0) {
    log(`\nFailed Courses:`);
    progress.failed.forEach(code => log(`  - ${code}`));
  }
  
  log('='.repeat(80));
  
  // Save final report
  const report = {
    phase: 'Phase 1: Foundation Courses',
    completed: progress.completed,
    failed: progress.failed.length,
    total: progress.total,
    successRate: `${((progress.completed / progress.total) * 100).toFixed(1)}%`,
    duration: `${hours} hours`,
    failedCourses: progress.failed,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), '..', 'PHASE1_COMPLETE.json'),
    JSON.stringify(report, null, 2)
  );
}

main().catch(error => {
  log(`\n❌ FATAL ERROR: ${error.message}`);
  process.exit(1);
});
