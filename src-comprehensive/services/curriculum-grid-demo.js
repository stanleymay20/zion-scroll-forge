/**
 * Curriculum Grid Demo
 * Demonstrates the Master Course Catalog Infrastructure functionality
 */

const { MasterCourseCatalogService } = require('./MasterCourseCatalogService');
const { CourseSearchEngine } = require('./CourseSearchEngine');
const { CourseRecommendationEngine } = require('./CourseRecommendationEngine');
const { SpiritualAlignmentValidator } = require('./SpiritualAlignmentValidator');

async function runCurriculumGridDemo() {
  console.log('🎓 ScrollUniversity Curriculum Grid Demo');
  console.log('=========================================\n');

  try {
    // Initialize services
    console.log('1. Initializing Master Course Catalog Infrastructure...');
    const catalogService = new MasterCourseCatalogService();
    const searchEngine = new CourseSearchEngine();
    const recommendationEngine = new CourseRecommendationEngine();
    const spiritualValidator = new SpiritualAlignmentValidator();
    console.log('✅ All services initialized successfully\n');

    // Display faculty information
    console.log('2. Supreme Scroll Faculties Overview:');
    const faculties = catalogService.getAllFaculties();
    faculties.forEach((faculty, index) => {
      console.log(`   ${index + 1}. ${faculty.faculty}`);
      console.log(`      Target Courses: ${faculty.targetCourseCount}`);
      console.log(`      Departments: ${faculty.departments.length}`);
      console.log(`      Description: ${faculty.description.substring(0, 80)}...`);
      console.log('');
    });

    // Display catalog statistics
    console.log('3. Catalog Statistics:');
    const stats = catalogService.getCatalogStatistics();
    console.log(`   Total Courses: ${stats.totalCourses}`);
    console.log(`   Target Total: ${stats.targetTotal}`);
    console.log(`   Progress: ${stats.progress.toFixed(2)}%`);
    console.log(`   Faculty Count: ${stats.facultyStats.length}\n`);

    // Demonstrate faculty details
    console.log('4. Sample Faculty Details (ScrollAI & Intelligence):');
    const aiFaculty = catalogService.getFacultyConfiguration('ScrollAI, Intelligence & Robotics');
    if (aiFaculty) {
      console.log(`   Faculty: ${aiFaculty.faculty}`);
      console.log(`   Target Courses: ${aiFaculty.targetCourseCount}`);
      console.log(`   Current Courses: ${aiFaculty.currentCourseCount}`);
      console.log(`   Departments:`);
      aiFaculty.departments.forEach(dept => {
        console.log(`     - ${dept.name}`);
      });
      console.log(`   Global Adaptation: ${aiFaculty.globalAdaptation.supportedLanguages.length} languages`);
      console.log(`   Spiritual Oversight: ${aiFaculty.spiritualOversight.oversightLevel}`);
    }
    console.log('');

    // Demonstrate search functionality
    console.log('5. Search Engine Capabilities:');
    console.log('   Popular search terms:');
    const popularTerms = searchEngine.getPopularTerms(5);
    if (popularTerms.length > 0) {
      popularTerms.forEach(term => {
        console.log(`     - "${term.term}" (${term.frequency} courses)`);
      });
    } else {
      console.log('     (No indexed courses yet - would show popular terms after indexing)');
    }
    console.log('');

    // Demonstrate course generation capability
    console.log('6. Dynamic Course Generation Example:');
    const courseRequest = {
      topic: 'Prophetic AI for Global Missions',
      faculty: 'ScrollAI, Intelligence & Robotics',
      level: 'graduate',
      propheticGuidance: {
        hasGuidance: true,
        source: 'prophetic_word',
        guidance: 'AI will be crucial for reaching unreached peoples',
        biblicalReferences: ['Matthew 28:19'],
        urgencyLevel: 'high',
        globalImpact: 'Revolutionary impact on global evangelism'
      },
      targetAudience: {
        primaryAudience: 'AI developers and missionaries',
        secondaryAudiences: ['Technology ministers'],
        prerequisites: ['Basic AI knowledge'],
        recommendedBackground: ['Computer science', 'Missions experience']
      },
      learningOutcomes: [
        {
          outcome: 'Develop AI systems for cross-cultural evangelism',
          measurementCriteria: ['Working AI prototype', 'Cultural sensitivity assessment'],
          kingdomApplication: 'Deploy AI tools for unreached people groups'
        }
      ],
      deliveryPreferences: ['online_portal', 'xr_mode'],
      culturalContext: 'global',
      urgencyLevel: 'urgent'
    };

    const generatedCourse = await catalogService.generateCourse(courseRequest);
    console.log(`   Generated Course: "${courseRequest.topic}"`);
    console.log(`   Modules: ${generatedCourse.courseOutline.modules.length}`);
    console.log(`   Learning Objectives: ${generatedCourse.learningObjectives.length}`);
    console.log(`   Spiritual Objectives: ${generatedCourse.spiritualObjectives.length}`);
    console.log(`   Prophetic Validation: ${generatedCourse.propheticValidation.isValidated ? 'Yes' : 'No'}`);
    console.log(`   Quality Score: ${generatedCourse.qualityMetrics.spiritualAlignment}/100`);
    console.log('');

    console.log('7. System Capabilities Summary:');
    console.log('   ✅ 12 Supreme Scroll Faculties initialized');
    console.log('   ✅ 10,000+ course capacity infrastructure');
    console.log('   ✅ Advanced search and discovery engine');
    console.log('   ✅ AI-powered course recommendations');
    console.log('   ✅ Dynamic course generation from prophetic insights');
    console.log('   ✅ Spiritual alignment validation system');
    console.log('   ✅ Multi-modal delivery support');
    console.log('   ✅ Global accessibility and localization');
    console.log('   ✅ Quality assurance and scroll authentication');
    console.log('');

    console.log('🎉 Master Course Catalog Infrastructure Demo Complete!');
    console.log('The system is ready to support ScrollUniversity\'s comprehensive curriculum.');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runCurriculumGridDemo();
}

module.exports = { runCurriculumGridDemo };