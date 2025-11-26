const fs = require('fs');
const path = require('path');

const coursesDir = path.join(__dirname, '..', '..', 'courses');
const courses = fs.readdirSync(coursesDir).filter(f => f.startsWith('COURSE_'));

console.log('=== COURSE CONTENT VERIFICATION REPORT ===\n');
console.log(`Total Courses Found: ${courses.length}\n`);

const results = {
  fullyComplete: [],
  partiallyComplete: [],
  minimal: [],
  empty: []
};

courses.forEach(courseDir => {
  const coursePath = path.join(coursesDir, courseDir);
  const stats = {
    courseCode: courseDir,
    hasOverview: false,
    moduleCount: 0,
    lectureCount: 0,
    assessmentCount: 0,
    hasVideoScripts: false,
    hasNotes: false,
    hasAssessments: false
  };

  // Check for course overview
  if (fs.existsSync(path.join(coursePath, 'course_overview.md'))) {
    stats.hasOverview = true;
  }

  // Count modules
  const items = fs.readdirSync(coursePath);
  const modules = items.filter(f => f.startsWith('module'));
  stats.moduleCount = modules.length;

  // Check module contents
  modules.forEach(moduleDir => {
    const modulePath = path.join(coursePath, moduleDir);
    if (!fs.statSync(modulePath).isDirectory()) return;
    
    const moduleFiles = fs.readdirSync(modulePath);
    
    // Count lectures
    const lectures = moduleFiles.filter(f => f.match(/lecture\d+\.md/));
    stats.lectureCount += lectures.length;
    
    // Check for assessments
    const assessments = moduleFiles.filter(f => 
      f.includes('assessment') || 
      f.includes('knowledge_check') || 
      f.includes('assignment') ||
      f.includes('reflection')
    );
    stats.assessmentCount += assessments.length;
    
    // Check for video scripts
    if (moduleFiles.some(f => f.includes('script') || lectures.length > 0)) {
      stats.hasVideoScripts = true;
    }
    
    // Check for notes
    if (moduleFiles.some(f => f.includes('notes') || lectures.length > 0)) {
      stats.hasNotes = true;
    }
    
    if (assessments.length > 0) {
      stats.hasAssessments = true;
    }
  });

  // Categorize course
  if (stats.moduleCount >= 4 && stats.lectureCount >= 10 && stats.assessmentCount >= 3) {
    results.fullyComplete.push(stats);
  } else if (stats.moduleCount >= 2 && stats.lectureCount >= 3) {
    results.partiallyComplete.push(stats);
  } else if (stats.moduleCount >= 1) {
    results.minimal.push(stats);
  } else {
    results.empty.push(stats);
  }
});

console.log('📊 SUMMARY BY COMPLETENESS LEVEL:\n');
console.log(`✅ Fully Complete (4+ modules, 10+ lectures, 3+ assessments): ${results.fullyComplete.length}`);
console.log(`⚠️  Partially Complete (2+ modules, 3+ lectures): ${results.partiallyComplete.length}`);
console.log(`⚡ Minimal Content (1+ module): ${results.minimal.length}`);
console.log(`❌ Empty/No Content: ${results.empty.length}\n`);

console.log('=== FULLY COMPLETE COURSES ===');
results.fullyComplete.forEach(c => {
  console.log(`\n${c.courseCode}:`);
  console.log(`  - Modules: ${c.moduleCount}`);
  console.log(`  - Lectures: ${c.lectureCount}`);
  console.log(`  - Assessments: ${c.assessmentCount}`);
  console.log(`  - Has Video Scripts: ${c.hasVideoScripts ? '✓' : '✗'}`);
  console.log(`  - Has Notes: ${c.hasNotes ? '✓' : '✗'}`);
});

console.log('\n\n=== PARTIALLY COMPLETE COURSES ===');
results.partiallyComplete.forEach(c => {
  console.log(`\n${c.courseCode}:`);
  console.log(`  - Modules: ${c.moduleCount}`);
  console.log(`  - Lectures: ${c.lectureCount}`);
  console.log(`  - Assessments: ${c.assessmentCount}`);
});

console.log('\n\n=== MINIMAL CONTENT COURSES ===');
results.minimal.forEach(c => {
  console.log(`\n${c.courseCode}:`);
  console.log(`  - Modules: ${c.moduleCount}`);
  console.log(`  - Lectures: ${c.lectureCount}`);
  console.log(`  - Assessments: ${c.assessmentCount}`);
});

console.log('\n\n=== READINESS ASSESSMENT ===');
const readyForStudents = results.fullyComplete.length;
const needsWork = results.partiallyComplete.length + results.minimal.length;
const notReady = results.empty.length;

console.log(`\n✅ Ready for Students: ${readyForStudents} courses`);
console.log(`⚠️  Needs Additional Content: ${needsWork} courses`);
console.log(`❌ Not Ready: ${notReady} courses`);

const readinessPercentage = ((readyForStudents / courses.length) * 100).toFixed(1);
console.log(`\n📈 Overall Readiness: ${readinessPercentage}%`);

console.log('\n\n=== MISSING COMPONENTS ANALYSIS ===');
const allCourses = [...results.fullyComplete, ...results.partiallyComplete, ...results.minimal];
const missingVideos = allCourses.filter(c => !c.hasVideoScripts).length;
const missingAssessments = allCourses.filter(c => !c.hasAssessments).length;

console.log(`\nCourses missing video scripts: ${missingVideos}`);
console.log(`Courses missing assessments: ${missingAssessments}`);

console.log('\n\n=== FINAL VERDICT ===');
if (readinessPercentage >= 80) {
  console.log('\n✅ EXCELLENT: Most courses are ready for students!');
} else if (readinessPercentage >= 50) {
  console.log('\n⚠️  GOOD: Many courses ready, but some need completion.');
} else if (readinessPercentage >= 25) {
  console.log('\n⚡ FAIR: Significant work needed before launch.');
} else {
  console.log('\n❌ NEEDS WORK: Most courses require substantial content development.');
}
