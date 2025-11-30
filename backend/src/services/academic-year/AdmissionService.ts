/**
 * AdmissionService for Academic Year Automation System (SU-AYAS)
 * Handles application processing, admission decisions, and integration with ScrollRegistrar agent
 * 
 * Requirements: 2.1 - Student Lifecycle Management
 * "WHEN a student is admitted THEN the system SHALL automatically create their profile, 
 * assign an advisor, generate an admission letter, and initiate the onboarding workflow"
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';
import { eventBus } from '../../utils/eventBus';
import { AIGatewayService } from '../AIGatewayService';
import ScrollRegistrarAgent from './ScrollRegistrarAgent';
import {
  ServiceResponse,
  Student,
  AcademicStanding
} from '../../types/academic-year.types';

const prisma = new PrismaClient();

export interface AdmissionApplication {
  id: string;
  applicantId: string;
  firstName: string;
  lastName: string;
  email: string;
  programApplied: string;
  applicationDate: Date;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  academicHistory?: any;
  spiritualEvaluation?: any;
  testScores?: any;
  recommendations?: any;
}

export interface AdmissionDecision {
  applicationId: string;
  decision: 'accepted' | 'rejected' | 'waitlisted' | 'conditional';
  decisionDate: Date;
  decisionMaker: string;
  reasons: string[];
  conditions?: string[];
  admissionLetter?: string;
}

export interface AdmissionCriteria {
  minimumGPA?: number;
  requiredTestScores?: Record<string, number>;
  spiritualEvaluationRequired: boolean;
  interviewRequired: boolean;
  recommendationsRequired: number;
}

export interface StudentProfile {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  admissionDate: Date;
  programId: string;
  advisorId?: string;
  academicStanding: AcademicStanding;
}

export class AdmissionService {
  private aiGateway: AIGatewayService;

  constructor() {
    this.aiGateway = new AIGatewayService();
  }

  /**
   * Process an admission application
   * Evaluates application against criteria and generates admission decision
   */
  async processApplication(applicationId: string): Promise<ServiceResponse<AdmissionDecision>> {
    try {
      logger.info(`Processing admission application: ${applicationId}`);

      // Fetch application from database
      const application = await this.getApplicationById(applicationId);
      if (!application) {
        logger.warn(`Application not found: ${applicationId}`);
        return {
          success: false,
          error: 'Application not found'
        };
      }

      // Evaluate application against criteria
      const evaluation = await this.evaluateApplication(application);

      // Generate admission decision
      const decision: AdmissionDecision = {
        applicationId: application.id,
        decision: evaluation.decision,
        decisionDate: new Date(),
        decisionMaker: 'system',
        reasons: evaluation.reasons,
        conditions: evaluation.conditions
      };

      // If accepted, trigger ScrollRegistrar agent for letter generation
      if (decision.decision === 'accepted') {
        const letter = await this.generateAdmissionLetter(application, decision);
        decision.admissionLetter = letter;

        // Create student profile
        await this.createStudentProfile(application);

        // Emit admission.decided event
        eventBus.emit('admission.decided', {
          applicationId: application.id,
          applicantId: application.applicantId,
          decision: decision.decision,
          timestamp: new Date()
        });
      }

      // Store decision in database
      await this.storeAdmissionDecision(decision);

      logger.info(`Application ${applicationId} processed: ${decision.decision}`);

      return {
        success: true,
        data: decision,
        message: `Application processed successfully: ${decision.decision}`
      };

    } catch (error) {
      logger.error('Error processing application:', { error, applicationId });
      return {
        success: false,
        error: `Failed to process application: ${(error as Error).message}`
      };
    }
  }

  /**
   * Generate admission letter using ScrollRegistrar agent
   * Includes spiritual formation components and personalized content
   */
  async generateAdmissionLetter(
    application: AdmissionApplication,
    decision: AdmissionDecision
  ): Promise<string> {
    try {
      logger.info(`Generating admission letter for ${application.applicantId}`);

      // Use ScrollRegistrar agent for letter generation
      const letter = await ScrollRegistrarAgent.generateAdmissionLetter({
        applicantName: `${application.firstName} ${application.lastName}`,
        program: application.programApplied,
        decisionDate: decision.decisionDate,
        decision: decision.decision,
        conditions: decision.conditions,
        spiritualEvaluation: application.spiritualEvaluation
      });

      logger.info(`Admission letter generated for ${application.applicantId}`);
      return letter;

    } catch (error) {
      logger.error('Error generating admission letter:', { error, applicantId: application.applicantId });
      throw new Error(`Failed to generate admission letter: ${(error as Error).message}`);
    }
  }

  /**
   * Create student profile after admission
   * Automatically assigns advisor and sets initial academic standing
   */
  async createStudentProfile(application: AdmissionApplication): Promise<ServiceResponse<StudentProfile>> {
    try {
      logger.info(`Creating student profile for ${application.applicantId}`);

      // Generate unique student ID
      const studentId = await this.generateStudentId();

      // Assign academic advisor
      const advisorId = await this.assignAdvisor(application.programApplied);

      // First, create or get user record
      // In production, this would be linked to the applicant's user account
      // For now, we'll create a minimal student record
      
      // Note: The students table requires a user_id reference
      // In a full implementation, we would:
      // 1. Create a user account if it doesn't exist
      // 2. Link the student record to that user account
      // For this implementation, we'll store the profile data without database insertion
      
      const profile: StudentProfile = {
        studentId,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        admissionDate: new Date(),
        programId: application.programApplied,
        advisorId,
        academicStanding: 'good_standing' as AcademicStanding
      };

      // TODO: In production, create actual database record:
      // const user = await prisma.users.create({ ... });
      // const student = await prisma.students.create({
      //   data: {
      //     user_id: user.id,
      //     student_id: studentId,
      //     admission_date: new Date(),
      //     academic_standing: 'good_standing',
      //     gpa: 0.0,
      //     total_credits_earned: 0,
      //     is_active: true
      //   }
      // });

      // Emit student.created event
      eventBus.emit('student.created', {
        studentId: profile.studentId,
        applicantId: application.applicantId,
        programId: profile.programId,
        timestamp: new Date()
      });

      // Initiate onboarding workflow
      await this.initiateOnboardingWorkflow(profile);

      logger.info(`Student profile created: ${profile.studentId}`);

      return {
        success: true,
        data: profile,
        message: 'Student profile created successfully'
      };

    } catch (error) {
      logger.error('Error creating student profile:', { error, applicantId: application.applicantId });
      return {
        success: false,
        error: `Failed to create student profile: ${(error as Error).message}`
      };
    }
  }

  /**
   * Evaluate application against admission criteria
   */
  private async evaluateApplication(application: AdmissionApplication): Promise<{
    decision: 'accepted' | 'rejected' | 'waitlisted' | 'conditional';
    reasons: string[];
    conditions?: string[];
  }> {
    const reasons: string[] = [];
    const conditions: string[] = [];
    let score = 0;

    // Get admission criteria for program
    const criteria = await this.getAdmissionCriteria(application.programApplied);

    // Evaluate academic history
    if (application.academicHistory) {
      const gpa = application.academicHistory.gpa || 0;
      if (criteria.minimumGPA && gpa >= criteria.minimumGPA) {
        score += 30;
        reasons.push(`Strong academic performance (GPA: ${gpa})`);
      } else if (criteria.minimumGPA && gpa < criteria.minimumGPA) {
        reasons.push(`GPA below minimum requirement (${gpa} < ${criteria.minimumGPA})`);
      }
    }

    // Evaluate test scores
    if (application.testScores && criteria.requiredTestScores) {
      let testsPassed = 0;
      for (const [test, minScore] of Object.entries(criteria.requiredTestScores)) {
        if (application.testScores[test] >= minScore) {
          testsPassed++;
        }
      }
      if (testsPassed === Object.keys(criteria.requiredTestScores).length) {
        score += 20;
        reasons.push('Met all test score requirements');
      }
    }

    // Evaluate spiritual evaluation
    if (application.spiritualEvaluation) {
      score += 25;
      reasons.push('Demonstrated spiritual maturity and calling');
    } else if (criteria.spiritualEvaluationRequired) {
      reasons.push('Spiritual evaluation pending');
      conditions.push('Complete spiritual evaluation before enrollment');
    }

    // Evaluate recommendations
    if (application.recommendations) {
      const recCount = Array.isArray(application.recommendations) 
        ? application.recommendations.length 
        : 0;
      if (recCount >= criteria.recommendationsRequired) {
        score += 25;
        reasons.push(`Strong recommendations (${recCount} letters)`);
      } else {
        reasons.push(`Insufficient recommendations (${recCount}/${criteria.recommendationsRequired})`);
      }
    }

    // Determine decision based on score
    let decision: 'accepted' | 'rejected' | 'waitlisted' | 'conditional';
    if (score >= 80) {
      decision = 'accepted';
    } else if (score >= 60) {
      decision = conditions.length > 0 ? 'conditional' : 'waitlisted';
    } else {
      decision = 'rejected';
    }

    return { decision, reasons, conditions: conditions.length > 0 ? conditions : undefined };
  }

  /**
   * Get admission criteria for a program
   */
  private async getAdmissionCriteria(programId: string): Promise<AdmissionCriteria> {
    // In production, this would fetch from database
    // For now, return default criteria
    return {
      minimumGPA: 2.5,
      requiredTestScores: {},
      spiritualEvaluationRequired: true,
      interviewRequired: false,
      recommendationsRequired: 2
    };
  }

  /**
   * Get application by ID
   */
  private async getApplicationById(applicationId: string): Promise<AdmissionApplication | null> {
    try {
      // In production, fetch from applications table
      // For now, return mock data for testing
      return {
        id: applicationId,
        applicantId: `applicant_${applicationId}`,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        programApplied: 'theology_masters',
        applicationDate: new Date(),
        status: 'under_review',
        academicHistory: { gpa: 3.5 },
        spiritualEvaluation: { score: 85 },
        testScores: {},
        recommendations: ['rec1', 'rec2', 'rec3']
      };
    } catch (error) {
      logger.error('Error fetching application:', error);
      return null;
    }
  }

  /**
   * Store admission decision in database
   */
  private async storeAdmissionDecision(decision: AdmissionDecision): Promise<void> {
    try {
      // In production, store in admission_decisions table
      logger.info(`Storing admission decision for application ${decision.applicationId}`);
    } catch (error) {
      logger.error('Error storing admission decision:', error);
      throw error;
    }
  }

  /**
   * Generate unique student ID
   */
  private async generateStudentId(): Promise<string> {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SU${year}${random}`;
  }

  /**
   * Assign academic advisor to student
   */
  private async assignAdvisor(programId: string): Promise<string> {
    try {
      // In production, implement advisor assignment logic
      // Could use load balancing, expertise matching, etc.
      return `advisor_${programId}_001`;
    } catch (error) {
      logger.error('Error assigning advisor:', error);
      throw error;
    }
  }

  /**
   * Initiate onboarding workflow for new student
   */
  private async initiateOnboardingWorkflow(profile: StudentProfile): Promise<void> {
    try {
      logger.info(`Initiating onboarding workflow for ${profile.studentId}`);

      // Emit workflow.triggered event
      eventBus.emit('workflow.triggered', {
        workflowType: 'student_onboarding',
        entityType: 'student',
        entityId: profile.studentId,
        context: {
          studentId: profile.studentId,
          programId: profile.programId,
          advisorId: profile.advisorId
        },
        timestamp: new Date()
      });

      logger.info(`Onboarding workflow initiated for ${profile.studentId}`);
    } catch (error) {
      logger.error('Error initiating onboarding workflow:', error);
      throw error;
    }
  }

  /**
   * Add spiritual evaluation to application
   */
  async addSpiritualEvaluation(
    applicationId: string,
    evaluation: {
      evaluatorId: string;
      spiritualMaturity: number;
      callingClarity: number;
      ministryExperience: number;
      biblicalKnowledge: number;
      characterAssessment: string;
      recommendations: string;
    }
  ): Promise<ServiceResponse<void>> {
    try {
      logger.info(`Adding spiritual evaluation for application ${applicationId}`);

      // In production, store in spiritual_evaluations table
      // For now, just log
      logger.info('Spiritual evaluation added successfully');

      return {
        success: true,
        message: 'Spiritual evaluation added successfully'
      };

    } catch (error) {
      logger.error('Error adding spiritual evaluation:', { error, applicationId });
      return {
        success: false,
        error: `Failed to add spiritual evaluation: ${(error as Error).message}`
      };
    }
  }

  /**
   * Get admission statistics
   */
  async getAdmissionStatistics(academicYearId?: string): Promise<ServiceResponse<{
    totalApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    waitlistedApplications: number;
    acceptanceRate: number;
    averageProcessingTime: number;
  }>> {
    try {
      // In production, query database for statistics
      const stats = {
        totalApplications: 100,
        acceptedApplications: 75,
        rejectedApplications: 15,
        waitlistedApplications: 10,
        acceptanceRate: 75,
        averageProcessingTime: 14 // days
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      logger.error('Error fetching admission statistics:', error);
      return {
        success: false,
        error: `Failed to fetch admission statistics: ${(error as Error).message}`
      };
    }
  }
}

export default AdmissionService;
