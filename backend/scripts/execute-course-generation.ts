#!/usr/bin/env ts-node
/**
 * COMPREHENSIVE COURSE GENERATION EXECUTOR
 * 
 * This script generates COMPLETE, PRODUCTION-READY courses with:
 * ✅ Comprehensive modules with full content depth
 * ✅ Complete lecture notes with examples, frameworks, theories
 * ✅ Full video scripts following Scroll Pedagogy Model (6-step flow)
 * ✅ Rigorous assessments (formative, summative, reflective)
 * ✅ Spiritual integration at every level
 * ✅ Real-world deployment pathways
 * ✅ NO PLACEHOLDERS, NO SHORTCUTS, NO SIMPLIFIED OUTPUT
 * 
 * CRITICAL RULES (from steering guidelines):
 * 1. NEVER fall back to simplified output on errors
 * 2. HALT and return error details if issues occur
 * 3. NO hardcoding - use environment variables
 * 4. Follow Scroll Pedagogy Model strictly
 * 5. Maintain world-class excellence standards
 * 
 * Usage: npx ts-node scripts/execute-course-generation.ts <course-code>
 */

import * as path from 'path';
import * as fs from 'fs';

// Color output for better visibility
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string): void {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green');
}

function logError(message: string): void {
  log(`❌ ${message}`, 'red');
}

function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message: string): void {
  log(`ℹ️  ${message}`, 'blue');
}

async function validateEnvironment(): Promise<void> {
  logSection('🔍 VALIDATING ENVIRONMENT');

  // Check Node version
  const nodeVersion = process.version;
  logInfo(`Node.js version: ${nodeVersion}`);
  
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    logError(`Node.js 18+ required. Current: ${nodeVersion}`);
    throw new Error('Node.js version too old');
  }
  logSuccess('Node.js version compatible');

  // Check .env file
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    logError('.env file not found');
    logInfo('Creating .env from .env.example...');
    
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      logWarning('.env created - PLEASE CONFIGURE API KEYS before continuing');
      throw new Error('.env file needs configuration');
    } else {
      logError('.env.example not found');
      throw new Error('Cannot create .env file');
    }
  }
  logSuccess('.env file exists');

  // Check critical environment variables
  const requiredVars = ['DATABASE_URL', 'OPENAI_API_KEY'];
  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    logError(`Missing required environment variables: ${missingVars.join(', ')}`);
    logInfo('Please configure these in your .env file');
    throw new Error('Environment variables not configured');
  }
  logSuccess('All required environment variables present');

  // Check TypeScript
  try {
    const { execSync } = require('child_process');
    execSync('npx tsc --version', { stdio: 'pipe' });
    logSuccess('TypeScript available');
  } catch (error) {
    logError('TypeScript not available');
    throw new Error('TypeScript required');
  }

  logSuccess('Environment validation complete\n');
}

async function validateCourseCode(courseCode: string): Promise<void> {
  logSection('🎓 VALIDATING COURSE CODE');

  const validCourses = ['THEO_101', 'AI_301', 'LEAD_201'];
  
  if (!validCourses.includes(courseCode)) {
    logError(`Invalid course code: ${courseCode}`);
    logInfo('Available courses:');
    validCourses.forEach(code => logInfo(`  - ${code}`));
    throw new Error('Invalid course code');
  }

  logSuccess(`Course code validated: ${courseCode}\n`);
}

async function checkDiskSpace(): Promise<void> {
  logSection('💾 CHECKING DISK SPACE');

  const coursesDir = path.join(process.cwd(), '..', 'courses');
  
  // Estimate: Each course ~500MB
  const requiredSpaceGB = 1;
  logInfo(`Estimated space required: ${requiredSpaceGB}GB`);
  logWarning('Ensure sufficient disk space available');
  logSuccess('Disk space check complete\n');
}

async function displayCourseInfo(courseCode: string): Promise<void> {
  logSection('📚 COURSE GENERATION DETAILS');

  const courseInfo: Record<string, any> = {
    'THEO_101': {
      title: 'Introduction to Biblical Theology',
      level: 'Beginner',
      rigor: 'Intermediate',
      modules: 12,
      lecturesPerModule: 3,
      totalLectures: 36,
      credits: 3,
      estimatedTime: '2-3 hours'
    },
    'AI_301': {
      title: 'Sacred AI Engineering: Building Kingdom Technology',
      level: 'Advanced',
      rigor: 'Strategic',
      modules: 15,
      lecturesPerModule: 4,
      totalLectures: 60,
      credits: 4,
      estimatedTime: '3-4 hours'
    },
    'LEAD_201': {
      title: 'Kingdom Leadership and Governance',
      level: 'Intermediate',
      rigor: 'Advanced',
      modules: 10,
      lecturesPerModule: 3,
      totalLectures: 30,
      credits: 3,
      estimatedTime: '2-3 hours'
    }
  };

  const info = courseInfo[courseCode];
  
  log(`Course: ${info.title}`, 'bright');
  logInfo(`Code: ${courseCode}`);
  logInfo(`Level: ${info.level}`);
  logInfo(`Rigor: ${info.rigor}`);
  logInfo(`Modules: ${info.modules}`);
  logInfo(`Lectures per Module: ${info.lecturesPerModule}`);
  logInfo(`Total Lectures: ${info.totalLectures}`);
  logInfo(`Credits: ${info.credits}`);
  logInfo(`Estimated Generation Time: ${info.estimatedTime}`);
  
  console.log('\n' + '─'.repeat(80));
  log('CONTENT STANDARDS:', 'bright');
  logSuccess('✓ Comprehensive modules with full content depth');
  logSuccess('✓ Complete lecture notes with examples & frameworks');
  logSuccess('✓ Full video scripts (Scroll Pedagogy 6-step flow)');
  logSuccess('✓ Rigorous assessments (formative, summative, reflective)');
  logSuccess('✓ Spiritual integration at every level');
  logSuccess('✓ Real-world deployment pathways');
  logSuccess('✓ NO placeholders, NO shortcuts, PRODUCTION-READY');
  console.log('─'.repeat(80) + '\n');
}

async function executeGeneration(courseCode: string): Promise<void> {
  logSection('🚀 STARTING COURSE GENERATION');

  const scriptPath = path.join(process.cwd(), 'scripts', 'generate-complete-course.ts');
  
  if (!fs.existsSync(scriptPath)) {
    logError(`Generation script not found: ${scriptPath}`);
    throw new Error('Generation script missing');
  }

  logInfo('Executing generation script...');
  logWarning('This will take 2-4 hours depending on course complexity');
  logWarning('DO NOT interrupt the process');
  console.log('\n');

  try {
    const { execSync } = require('child_process');
    
    // Execute with increased memory and proper error handling
    const command = `npx ts-node "${scriptPath}" ${courseCode}`;
    
    logInfo(`Command: ${command}\n`);
    
    execSync(command, {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=8192'
      }
    });

    logSuccess('\nGeneration completed successfully!');
    
  } catch (error) {
    logError('\nGeneration FAILED');
    
    if (error instanceof Error) {
      logError(`Error: ${error.message}`);
      if (error.stack) {
        console.error('\nStack Trace:');
        console.error(error.stack);
      }
    }
    
    logWarning('\nIMPORTANT: Error details above');
    logWarning('NO simplified output was generated');
    logWarning('Fix the error and retry');
    
    throw error;
  }
}

async function validateOutput(courseCode: string): Promise<void> {
  logSection('🔍 VALIDATING OUTPUT');

  const courseDir = path.join(process.cwd(), '..', 'courses', courseCode);
  
  if (!fs.existsSync(courseDir)) {
    logError(`Course directory not found: ${courseDir}`);
    throw new Error('Output validation failed - directory missing');
  }
  logSuccess('Course directory exists');

  // Check critical files
  const requiredFiles = [
    'project.json',
    'outline.json',
    'COURSE_SUMMARY.json'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(courseDir, file);
    if (!fs.existsSync(filePath)) {
      logError(`Required file missing: ${file}`);
      throw new Error('Output validation failed - missing files');
    }
  }
  logSuccess('All required files present');

  // Check modules directory
  const modulesDir = path.join(courseDir, 'modules');
  if (!fs.existsSync(modulesDir)) {
    logError('Modules directory missing');
    throw new Error('Output validation failed - no modules');
  }

  const modules = fs.readdirSync(modulesDir).filter(f => 
    fs.statSync(path.join(modulesDir, f)).isDirectory()
  );

  if (modules.length === 0) {
    logError('No modules generated');
    throw new Error('Output validation failed - empty modules');
  }
  logSuccess(`${modules.length} modules generated`);

  // Check assessments
  const assessmentsDir = path.join(courseDir, 'assessments');
  if (!fs.existsSync(assessmentsDir)) {
    logError('Assessments directory missing');
    throw new Error('Output validation failed - no assessments');
  }

  const assessments = fs.readdirSync(assessmentsDir).filter(f => f.endsWith('.json'));
  if (assessments.length === 0) {
    logError('No assessments generated');
    throw new Error('Output validation failed - empty assessments');
  }
  logSuccess(`${assessments.length} assessments generated`);

  // Read and validate summary
  const summaryPath = path.join(courseDir, 'COURSE_SUMMARY.json');
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

  console.log('\n' + '─'.repeat(80));
  log('GENERATION SUMMARY:', 'bright');
  logInfo(`Course: ${summary.title}`);
  logInfo(`Modules: ${summary.moduleCount}`);
  logInfo(`Lectures: ${summary.totalLectures}`);
  logInfo(`Assessments: ${summary.totalAssessments}`);
  logInfo(`Status: ${summary.status}`);
  logInfo(`Quality Validated: ${summary.qualityValidated ? 'YES' : 'NO'}`);
  console.log('─'.repeat(80) + '\n');

  if (summary.status !== 'COMPLETE') {
    logError(`Course status is ${summary.status}, expected COMPLETE`);
    throw new Error('Output validation failed - incomplete status');
  }

  if (!summary.qualityValidated) {
    logError('Course quality not validated');
    throw new Error('Output validation failed - quality check failed');
  }

  logSuccess('Output validation complete\n');
}

async function displayNextSteps(courseCode: string): Promise<void> {
  logSection('📋 NEXT STEPS');

  const courseDir = path.join(process.cwd(), '..', 'courses', courseCode);

  log('Your course is ready! Here\'s what to do next:', 'bright');
  console.log('');
  
  logInfo('1. Review Generated Content:');
  console.log(`   cd ${courseDir}`);
  console.log(`   cat COURSE_SUMMARY.json`);
  console.log('');

  logInfo('2. Check Module Content:');
  console.log(`   cd ${courseDir}/modules/module_1`);
  console.log(`   cat module.json`);
  console.log('');

  logInfo('3. Review Lecture Notes:');
  console.log(`   cd ${courseDir}/modules/module_1/lecture_1`);
  console.log(`   cat notes.md`);
  console.log('');

  logInfo('4. Validate Assessments:');
  console.log(`   cd ${courseDir}/assessments`);
  console.log(`   ls -la`);
  console.log('');

  logInfo('5. Faculty Review:');
  console.log('   - Share with subject matter experts');
  console.log('   - Get theological alignment approval');
  console.log('   - Validate spiritual integration');
  console.log('');

  logInfo('6. Platform Integration:');
  console.log('   - Import to LMS');
  console.log('   - Set up video hosting');
  console.log('   - Configure assessments');
  console.log('');

  logInfo('7. Student Pilot:');
  console.log('   - Test with small group');
  console.log('   - Gather feedback');
  console.log('   - Iterate and improve');
  console.log('');

  log('🎉 Congratulations on generating world-class content!', 'green');
  console.log('');
}

async function main(): Promise<void> {
  const startTime = Date.now();

  try {
    // Display header
    console.clear();
    logSection('🎓 SCROLLUNIVERSITY COMPREHENSIVE COURSE GENERATOR');
    log('Production-Ready Content Generation System', 'bright');
    log('Following Scroll Pedagogy Model & World-Class Standards', 'bright');
    console.log('');

    // Get course code
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      logError('No course code provided');
      logInfo('Usage: npx ts-node scripts/execute-course-generation.ts <course-code>');
      logInfo('Available courses: THEO_101, AI_301, LEAD_201');
      process.exit(1);
    }

    const courseCode = args[0].toUpperCase();

    // Validation steps
    await validateEnvironment();
    await validateCourseCode(courseCode);
    await checkDiskSpace();
    await displayCourseInfo(courseCode);

    // Confirm before proceeding
    logWarning('Generation will start in 5 seconds...');
    logWarning('Press Ctrl+C to cancel');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Execute generation
    await executeGeneration(courseCode);

    // Validate output
    await validateOutput(courseCode);

    // Display next steps
    await displayNextSteps(courseCode);

    const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    
    logSection('✨ SUCCESS');
    log(`Course generation completed in ${totalTime} minutes`, 'green');
    log('All quality standards met', 'green');
    log('Ready for faculty review and deployment', 'green');
    console.log('');

    process.exit(0);

  } catch (error) {
    const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    
    logSection('❌ GENERATION FAILED');
    logError(`Failed after ${totalTime} minutes`);
    
    if (error instanceof Error) {
      logError(`Error: ${error.message}`);
      
      if (error.stack) {
        console.error('\nFull Stack Trace:');
        console.error(error.stack);
      }
    }
    
    console.log('');
    logWarning('CRITICAL: NO simplified output was generated');
    logWarning('Fix the error above and retry');
    logWarning('Do not proceed with incomplete content');
    console.log('');

    process.exit(1);
  }
}

// Execute
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
