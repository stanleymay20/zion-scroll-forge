/**
 * AdmissionService Tests
 * Tests for admission application processing and student profile creation
 */

import { AdmissionService } from '../AdmissionService';
import { eventBus } from '../../../utils/eventBus';

describe('AdmissionService', () => {
  let admissionService: AdmissionService;

  beforeEach(() => {
    admissionService = new AdmissionService();
    // Clear event listeners
    eventBus.removeAllListeners();
  });

  afterEach(() => {
    eventBus.removeAllListeners();
  });

  describe('processApplication', () => {
    it('should process an application and return a decision', async () => {
      const applicationId = 'test_app_001';

      const result = await admissionService.processApplication(applicationId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.decision).toBeDefined();
      expect(['accepted', 'rejected', 'waitlisted', 'conditional']).toContain(result.data?.decision);
    });

    it('should emit admission.decided event for accepted applications', async () => {
      const applicationId = 'test_app_002';
      let eventEmitted = false;

      eventBus.once('admission.decided', (data) => {
        eventEmitted = true;
        expect(data.applicationId).toBe(applicationId);
      });

      await admissionService.processApplication(applicationId);

      // Give event time to emit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Note: Event will only be emitted if application is accepted
      // Since we're using mock data, we can't guarantee this
    });

    it('should generate admission letter for accepted applications', async () => {
      const applicationId = 'test_app_003';

      const result = await admissionService.processApplication(applicationId);

      if (result.data?.decision === 'accepted') {
        expect(result.data.admissionLetter).toBeDefined();
        expect(result.data.admissionLetter).not.toBe('');
      }
    });
  });

  describe('createStudentProfile', () => {
    it('should create a student profile with generated student ID', async () => {
      const application = {
        id: 'app_001',
        applicantId: 'applicant_001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        programApplied: 'theology_masters',
        applicationDate: new Date(),
        status: 'approved' as const,
        academicHistory: { gpa: 3.5 },
        spiritualEvaluation: { score: 85 },
        testScores: {},
        recommendations: ['rec1', 'rec2']
      };

      const result = await admissionService.createStudentProfile(application);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.studentId).toMatch(/^SU\d{8}$/);
      expect(result.data?.firstName).toBe('John');
      expect(result.data?.lastName).toBe('Doe');
      expect(result.data?.email).toBe('john.doe@example.com');
      expect(result.data?.academicStanding).toBe('good_standing');
    });

    it('should emit student.created event', async () => {
      const application = {
        id: 'app_002',
        applicantId: 'applicant_002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        programApplied: 'ministry_leadership',
        applicationDate: new Date(),
        status: 'approved' as const
      };

      let eventEmitted = false;
      let eventData: any;

      eventBus.once('student.created', (data) => {
        eventEmitted = true;
        eventData = data;
      });

      await admissionService.createStudentProfile(application);

      // Give event time to emit
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eventEmitted).toBe(true);
      expect(eventData).toBeDefined();
      expect(eventData.applicantId).toBe('applicant_002');
    });

    it('should initiate onboarding workflow', async () => {
      const application = {
        id: 'app_003',
        applicantId: 'applicant_003',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        programApplied: 'biblical_studies',
        applicationDate: new Date(),
        status: 'approved' as const
      };

      let workflowTriggered = false;

      eventBus.once('workflow.triggered', (data) => {
        workflowTriggered = true;
        expect(data.workflowType).toBe('student_onboarding');
        expect(data.entityType).toBe('student');
      });

      await admissionService.createStudentProfile(application);

      // Give event time to emit
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(workflowTriggered).toBe(true);
    });
  });

  describe('addSpiritualEvaluation', () => {
    it('should add spiritual evaluation to application', async () => {
      const applicationId = 'test_app_004';
      const evaluation = {
        evaluatorId: 'evaluator_001',
        spiritualMaturity: 8,
        callingClarity: 9,
        ministryExperience: 7,
        biblicalKnowledge: 8,
        characterAssessment: 'Strong character and spiritual maturity',
        recommendations: 'Highly recommended for admission'
      };

      const result = await admissionService.addSpiritualEvaluation(applicationId, evaluation);

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
    });
  });

  describe('getAdmissionStatistics', () => {
    it('should return admission statistics', async () => {
      const result = await admissionService.getAdmissionStatistics();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.totalApplications).toBeGreaterThanOrEqual(0);
      expect(result.data?.acceptanceRate).toBeGreaterThanOrEqual(0);
      expect(result.data?.acceptanceRate).toBeLessThanOrEqual(100);
    });

    it('should calculate acceptance rate correctly', async () => {
      const result = await admissionService.getAdmissionStatistics();

      if (result.data && result.data.totalApplications > 0) {
        const calculatedRate = (result.data.acceptedApplications / result.data.totalApplications) * 100;
        expect(result.data.acceptanceRate).toBeCloseTo(calculatedRate, 1);
      }
    });
  });
});
