/**
 * End-to-End Onboarding Flow Test Script
 * Tests the complete student journey from application to first course
 */

import { PrismaClient } from '@prisma/client';
import AdmissionsService from '../src/services/AdmissionsService';
import EnrollmentService from '../src/services/EnrollmentService';
import OnboardingWorkflowService from '../src/services/OnboardingWorkflowService';
import StudentProfileService from '../src/services/StudentProfileService';
import AcademicAdvisorService from '../src/services/AcademicAdvisorService';
import OrientationModuleService from '../src/services/OrientationModuleService';
import logger from '../src/utils/logger';

const prisma = new PrismaClient();

interface TestResult {
  step: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

class OnboardingFlowTester {
  private results: TestResult[] = [];
  private testUserId: string | null = null;
  private testCourseId: string | null = null;

  async runFullTest(): Promise<void> {
    console.log('\n🚀 Starting End-to-End Onboarding Flow Test\n');
    console.log('=' .repeat(60));

    try {
      // Step 1: Setup test data
      await this.setupTestData();

      // Step 2: Test admissions application
      await this.testAdmissionsApplication();

      // Step 3: Test application decision
      await this.testApplicationDecision();

      // Step 4: Test enrollment
      await this.testEnrollment();

      // Step 5: Test student profile creation
      await this.testProfileCreation();

      // Step 6: Test onboarding initialization
      await this.testOnboardingInitialization();

      // Step 7: Test onboarding step completion
      await this.testOnboardingStepCompletion();

      // Step 8: Test advisor assignment
      await this.testAdvisorAssignment();

      // Step 9: Test orientation
      await this.testOrientation();

      // Step 10: Test first course access
      await this.testFirstCourseAccess();

      // Print results
      this.printResults();

      // Cleanup
      await this.cleanup();

    } catch (error) {
      console.error('\n❌ Test suite failed:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  private async setupTestData(): Promise<void> {
    const start = Date.now();
    try {
      console.log('\n📋 Step 1: Setting up test data...');

      // Create test user
      const testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@scrolluniversity.test`,
          firstName: 'Test',
          lastName: 'Student',
          role: 'STUDENT',
          scrollCoinBalance: 1000,
          workTradeCredits: 500,
          isActive: true
        }
      });

      this.testUserId = testUser.id;

      // Find or create test course
      let testCourse = await prisma.course.findFirst({
        where: { isActive: true }
      });

      if (!testCourse) {
        testCourse = await prisma.course.create({
          data: {
            title: 'Introduction to Kingdom Education',
            code: 'SCROLL101',
            description: 'Foundation course for new students',
            credits: 3,
            scrollCoinCost: 100,
            scrollXPReward: 50,
            isActive: true,
            level: 'SCROLL_FOUNDATION'
          }
        });
      }

      this.testCourseId = testCourse.id;

      this.recordResult('Setup Test Data', true, Date.now() - start, {
        userId: this.testUserId,
        courseId: this.testCourseId
      });

      console.log(`✅ Test user created: ${testUser.email}`);
      console.log(`✅ Test course ready: ${testCourse.title}`);

    } catch (error) {
      this.recordResult('Setup Test Data', false, Date.now() - start, undefined, error);
      throw error;
    }
  }

  private async testAdmissionsApplication(): Promise<void> {
    const start = Date.now();
    try {
      console.log('\n📝 Step 2: Testing admissions application...');

      const application = await AdmissionsService.submitApplication({
        personalInfo: {
          firstName: 'Test',
          lastName: 'Student',
          email: `test-${Date.now()}@scrolluniversity.test`,
          phone: '+1234567890',
          dateOfBirth: new Date('2000-01-01'),
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'USA'
          }
        },
        academicInfo: {
          highestEducation: 'HIGH_SCHOOL',
          gpa: 3.5,
          transcripts: []
        },
        spiritualInfo: {
          salvationTestimony: 'Test testimony',
          churchAffiliation: 'Test Church',
          spiritualGifts: ['Teaching', 'Leadership'],
          ministryExperience: 'Test ministry experience'
        },
        programInfo: {
          programType: 'SCROLL_DEGREE',
          startTerm: 'FALL_2025',
          studyMode: 'FULL_TIME'
        },
        essays: {
          personalStatement: 'Test personal statement',
          whyScrollUniversity: 'Test why ScrollUniversity',
          kingdomVision: 'Test kingdom vision'
        }
      });

      this.recordResult('Admissions Application', true, Date.now() - start, {
        applicationId: application.applicationId
      });

      console.log(`✅ Application submitted: ${application.applicationId}`);

    } catch (error) {
      this.recordResult('Admissions Application', false, Date.now() - start, undefined, error);
      throw error;
    }
  }

  private async testApplicationDecision(): Promise<void> {
    const start = Date.now();
    try {
      console.log('\n✅ Step 3: Testing application decision...');

      // In a real scenario, this would be done by admissions staff
      // For testing, we'll simulate acceptance

      console.log('✅ Application accepted (simulated)');
      this.recordResult('Application Decision', true, Date.now() - start);

    } catch (error) {
      this.recordResult('Application Decision', false, Date.now() - start, undefined, error);
      throw error;
    }
  }

  private async testEnrollment(): Promise<void> {
    const start = Date.now();
    try {
      console.log('\n🎓 Step 4: Testing course enrollment...');

      if (!this.testUserId || !this.testCourseId) {
        throw new Error('Test user or course not initialized');
      }

      const enrollment = await EnrollmentService.createEnrollment({
        userId: this.testUserId,
        courseId: this.testCourseId,
        paymentMethod: 'scroll_coin'
      });

      this.recordResult('Course Enrollment', true, Date.now() - start, {
        enrollmentId: enrollment.enrollmentId
      });

      console.log(`✅ Enrolled in course: ${enrollment.enrollmentId}`);

    } catch (error) {
      this.recordResult('Course Enrollment', false, Date.now() - start, undefined, error);
      throw error;
    }
  }

  private async testProfileCreation(): Promise<void> {
    const start = Date.now();
    try {
      console.log('\n👤 Step 5: Testing student profile creation...');

      if (!this.testUserId) {
        throw new Error('Test user not initialized');
      }

      const profile = await StudentProfileService.createProfile({
        userId: this.testUserId,
        bio: 'Test student bio',
        scrollCalling: 'Technology and Ministry',
        spiritualGifts: ['Teaching', 'Leadership'],
        kingdomVision: 'To use technology for kingdom advancement',
        interests: ['AI', 'Theology', 'Ministry'],
        careerGoals: ['Software Development', 'Ministry Leadership']
      });

      this.recordResult('Profile Creation', true, Date.now() - start, {
        profileId: profile.userId
      });

      console.log('✅ Student profile created');

    } catch (error) {
      this.recordResult('Profile Creation', false, Date.now() - start, undefined, error);
      throw error;
    }
  }

  private async testOnboardingInitialization(): Promise<void> {
    const start = Date.now();
    try {
      console.log('\n🎯 Step 6: Testing onboarding initialization...');

      if (!this.testUserId) {
        throw new Error('Test user not initialized');
      }

      const progress = await OnboardingWorkflowService.initializeOnboarding(this.testUserId);

      this.recordResult('Onboarding Initialization', true, Date.now() - start, {
        totalSteps: progress.totalSteps,
        completionPercentage: progress.completionPercentage
      });

      console.log(`✅ Onboarding initialized: ${progress.totalSteps} steps`);

    } catch (error) {
      this.recordResult('Onboarding Initialization', false, Date.now() - start, undefined, error);
      throw error;
    }
  }

  private async testOnboardingStepCompletion(): Promise<void> {
    const start = Date.now();
    try {
      console.log('\n✨ Step 7: Testing onboarding step completion...');

      if (!this.testUserId) {
        throw new Error('Test user not initialized');
      }

      // Complete first 3 steps
      const stepsToComplete = ['welcome', 'profile_setup', 'spiritual_assessment'];

      for (const stepId of stepsToComplete) {
        await OnboardingWorkflowService.completeStep(this.testUserId, stepId);
        console.log(`  ✓ Completed: ${stepId}`);
      }

      const progress = await OnboardingWorkflowService.getOnboardingProgress(this.testUserId);

      this.recordResult('Onboarding Step Completion', true, Date.now() - start, {
        completedSteps: progress?.completedSteps,
        completionPercentage: progress?.completionPercentage
      });

      console.log(`✅ Completed ${progress?.completedSteps} steps (${progress?.completionPercentage}%)`);

    } catch (error) {
      this.recordResult('Onboarding Step Completion', false, Date.now() - start, undefined, error);
      throw error;
    }
  }

  private async testAdvisorAssignment(): Promise<void> {
    const start = Date.now();
    try {
      console.log('\n👨‍🏫 Step 8: Testing advisor assignment...');

      if (!this.testUserId) {
        throw new Error('Test user not initialized');
      }

      // Create test advisor if needed
      let advisor = await prisma.user.findFirst({
        where: { role: 'FACULTY' }
      });

      if (!advisor) {
        advisor = await prisma.user.create({
          data: {
            email: `advisor-${Date.now()}@scrolluniversity.test`,
            firstName: 'Test',
            lastName: 'Advisor',
            role: 'FACULTY',
            isActive: true
          }
        });
      }

      const assignment = await AcademicAdvisorService.assignAdvisor({
        studentId: this.testUserId,
        programType: 'SCROLL_DEGREE',
        interests: ['Technology', 'Ministry']
      });

      this.recordResult('Advisor Assignment', true, Date.now() - start, {
        advisorId: assignment.advisorId
      });

      console.log(`✅ Advisor assigned: ${assignment.advisorId}`);

    } catch (error) {
      this.recordResult('Advisor Assignment', false, Date.now() - start, undefined, error);
      // Don't throw - advisor assignment is optional
      console.log('⚠️  Advisor assignment skipped (optional)');
    }
  }

  private async testOrientation(): Promise<void> {
    const start = Date.now();
    try {
      console.log('\n📚 Step 9: Testing orientation...');

      if (!this.testUserId) {
        throw new Error('Test user not initialized');
      }

      const orientation = await OrientationModuleService.initializeOrientation(this.testUserId);

      // Complete first module
      await OrientationModuleService.completeModule(this.testUserId, 'welcome_video');

      const progress = await OrientationModuleService.getOrientationProgress(this.testUserId);

      this.recordResult('Orientation', true, Date.now() - start, {
        totalModules: progress?.totalModules,
        completedModules: progress?.completedModules
      });

      console.log(`✅ Orientation started: ${progress?.completedModules}/${progress?.totalModules} modules completed`);

    } catch (error) {
      this.recordResult('Orientation', false, Date.now() - start, undefined, error);
      throw error;
    }
  }

  private async testFirstCourseAccess(): Promise<void> {
    const start = Date.now();
    try {
      console.log('\n🎓 Step 10: Testing first course access...');

      if (!this.testUserId || !this.testCourseId) {
        throw new Error('Test user or course not initialized');
      }

      const enrollments = await EnrollmentService.getUserEnrollments(this.testUserId);

      if (enrollments.length === 0) {
        throw new Error('No enrollments found');
      }

      const enrollment = enrollments[0];

      this.recordResult('First Course Access', true, Date.now() - start, {
        enrollmentId: enrollment.enrollmentId,
        courseId: enrollment.courseId,
        status: enrollment.status
      });

      console.log(`✅ Course accessible: ${enrollment.courseId}`);

    } catch (error) {
      this.recordResult('First Course Access', false, Date.now() - start, undefined, error);
      throw error;
    }
  }

  private recordResult(
    step: string,
    success: boolean,
    duration: number,
    data?: any,
    error?: any
  ): void {
    this.results.push({
      step,
      success,
      duration,
      data,
      error: error ? (error.message || String(error)) : undefined
    });
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`\nTotal Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    console.log('\n' + '-'.repeat(60));
    console.log('DETAILED RESULTS:');
    console.log('-'.repeat(60));

    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`\n${index + 1}. ${status} ${result.step}`);
      console.log(`   Duration: ${result.duration}ms`);
      
      if (result.data) {
        console.log(`   Data:`, JSON.stringify(result.data, null, 2));
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log('\n' + '='.repeat(60));

    if (failedTests === 0) {
      console.log('🎉 ALL TESTS PASSED! Onboarding flow is working correctly.');
    } else {
      console.log(`⚠️  ${failedTests} test(s) failed. Please review the errors above.`);
    }

    console.log('='.repeat(60) + '\n');
  }

  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up test data...');

    try {
      if (this.testUserId) {
        // Delete test user and related data
        await prisma.enrollment.deleteMany({
          where: { userId: this.testUserId }
        });

        await prisma.userPreferences.deleteMany({
          where: { userId: this.testUserId }
        });

        await prisma.user.delete({
          where: { id: this.testUserId }
        });

        console.log('✅ Test data cleaned up');
      }
    } catch (error) {
      console.log('⚠️  Cleanup warning:', error);
    }
  }
}

// Run the test
const tester = new OnboardingFlowTester();
tester.runFullTest()
  .then(() => {
    console.log('\n✨ Test suite completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  });
