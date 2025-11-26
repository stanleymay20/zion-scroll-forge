#!/usr/bin/env ts-node
/**
 * Test Comprehensive Course Generation
 * 
 * Quick test to verify the new generation system works correctly
 */

import * as dotenv from 'dotenv';
dotenv.config();

import ComprehensiveCourseGenerator from '../src/services/ComprehensiveCourseGenerator';

async function testGeneration() {
  console.log('\n🧪 Testing Comprehensive Course Generation\n');
  console.log('This will test the new generation system with a minimal course spec.\n');
  
  const testSpec = {
    code: 'TEST101',
    title: 'Test Course for Validation',
    faculty: 'Test Faculty',
    level: 100,
    credits: 3,
    description: 'A test course to verify the comprehensive generation system works correctly.',
    prerequisites: [],
    learningOutcomes: [
      'Understand test concept 1',
      'Apply test concept 2',
      'Integrate test concept 3'
    ],
    spiritualFormationOutcomes: [
      'Grow in test spiritual area 1',
      'Develop test spiritual area 2'
    ],
    scrollAlignment: {
      kingdomPurpose: 'Test kingdom purpose',
      transformationGoals: ['Goal 1', 'Goal 2'],
      callingIntegration: 'Test calling integration'
    }
  };
  
  try {
    console.log('📋 Test Spec:');
    console.log(`   Title: ${testSpec.title}`);
    console.log(`   Code: ${testSpec.code}`);
    console.log('');
    
    console.log('🚀 Starting generation...\n');
    
    const generator = new ComprehensiveCourseGenerator();
    
    // Test just the curriculum structure generation
    console.log('Step 1: Testing curriculum structure generation...');
    const curriculum = await (generator as any).generateCurriculumStructure(testSpec);
    
    console.log(`✅ Curriculum generated:`);
    console.log(`   Modules: ${curriculum.modules.length}`);
    console.log(`   First module: ${curriculum.modules[0].title}`);
    console.log('');
    
    // Validate no template violations
    const firstModule = curriculum.modules[0];
    const hasTemplates = JSON.stringify(firstModule).match(/concept \d+-\d+/i);
    
    if (hasTemplates) {
      console.log('❌ FAILED: Template violations found!');
      console.log('   Found placeholder concepts in generated content');
      process.exit(1);
    }
    
    console.log('✅ No template violations detected');
    console.log('');
    
    // Test lecture generation (just one)
    console.log('Step 2: Testing single lecture generation...');
    const lecture = await (generator as any).generateCompleteLecture(
      testSpec,
      firstModule,
      1,
      1
    );
    
    console.log(`✅ Lecture generated:`);
    console.log(`   Title: ${lecture.title}`);
    console.log(`   Has ignition: ${!!lecture.ignition}`);
    console.log(`   Has download: ${!!lecture.download}`);
    console.log(`   Has demonstration: ${!!lecture.demonstration}`);
    console.log(`   Has activation: ${!!lecture.activation}`);
    console.log(`   Has reflection: ${!!lecture.reflection}`);
    console.log(`   Has commission: ${!!lecture.commission}`);
    console.log(`   Notes length: ${lecture.fullNotes?.length || 0} chars`);
    console.log(`   Script length: ${lecture.videoScript?.length || 0} chars`);
    console.log('');
    
    // Validate pedagogy model
    const hasPedagogyModel = 
      lecture.ignition &&
      lecture.download &&
      lecture.demonstration &&
      lecture.activation &&
      lecture.reflection &&
      lecture.commission;
    
    if (!hasPedagogyModel) {
      console.log('❌ FAILED: Missing pedagogy model components!');
      process.exit(1);
    }
    
    console.log('✅ 6-step pedagogy model present');
    console.log('');
    
    // Validate content depth
    if (!lecture.fullNotes || lecture.fullNotes.length < 2000) {
      console.log(`❌ FAILED: Lecture notes too short (${lecture.fullNotes?.length || 0} chars, need 2000+)`);
      process.exit(1);
    }
    
    if (!lecture.videoScript || lecture.videoScript.length < 1500) {
      console.log(`❌ FAILED: Video script too short (${lecture.videoScript?.length || 0} chars, need 1500+)`);
      process.exit(1);
    }
    
    console.log('✅ Content depth requirements met');
    console.log('');
    
    console.log('═'.repeat(60));
    console.log('✅ ALL TESTS PASSED');
    console.log('═'.repeat(60));
    console.log('');
    console.log('The comprehensive generation system is working correctly!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Generate a full course: npx ts-node --transpile-only scripts/generate-real-course.ts THEO101');
    console.log('2. Review the output in ../courses/COURSE_THEO101/');
    console.log('3. Check course_overview.md for human-readable summary');
    console.log('');
    
  } catch (error) {
    console.log('');
    console.log('═'.repeat(60));
    console.log('❌ TEST FAILED');
    console.log('═'.repeat(60));
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    console.log('This is expected behavior per steering rules:');
    console.log('The system halts on error instead of falling back to simplified output.');
    console.log('');
    console.log('Check the error above and fix the issue before proceeding.');
    console.log('');
    process.exit(1);
  }
}

testGeneration();
