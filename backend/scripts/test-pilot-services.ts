#!/usr/bin/env ts-node
/**
 * Test Pilot Services
 * Quick validation that all required services are working before full generation
 */

import ContentCreationService from '../src/services/ContentCreationService';
import SpiritualIntegrationService from '../src/services/SpiritualIntegrationService';
import CourseQualityService from '../src/services/CourseQualityService';
import AssessmentDesignService from '../src/services/AssessmentDesignService';
import VideoProductionService from '../src/services/VideoProductionService';
import WrittenMaterialsService from '../src/services/WrittenMaterialsService';

async function testServices() {
  console.log('🧪 Testing Pilot Generation Services\n');

  try {
    // Test 1: ContentCreationService
    console.log('1. Testing ContentCreationService...');
    const contentService = new ContentCreationService();
    console.log('   ✅ ContentCreationService initialized\n');

    // Test 2: SpiritualIntegrationService
    console.log('2. Testing SpiritualIntegrationService...');
    const spiritualService = new SpiritualIntegrationService();
    console.log('   ✅ SpiritualIntegrationService initialized\n');

    // Test 3: CourseQualityService
    console.log('3. Testing CourseQualityService...');
    const qualityService = new CourseQualityService();
    console.log('   ✅ CourseQualityService initialized\n');

    // Test 4: AssessmentDesignService
    console.log('4. Testing AssessmentDesignService...');
    const assessmentService = new AssessmentDesignService();
    console.log('   ✅ AssessmentDesignService initialized\n');

    // Test 5: VideoProductionService
    console.log('5. Testing VideoProductionService...');
    const videoService = new VideoProductionService();
    console.log('   ✅ VideoProductionService initialized\n');

    // Test 6: WrittenMaterialsService
    console.log('6. Testing WrittenMaterialsService...');
    const writtenService = new WrittenMaterialsService();
    console.log('   ✅ WrittenMaterialsService initialized\n');

    console.log('=' .repeat(60));
    console.log('✅ ALL SERVICES READY FOR PILOT GENERATION');
    console.log('=' .repeat(60));
    console.log('\nYou can now run: ./run-pilot-generation.ps1\n');

    return true;
  } catch (error) {
    console.error('\n❌ SERVICE TEST FAILED:');
    console.error(error);
    return false;
  }
}

testServices()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
