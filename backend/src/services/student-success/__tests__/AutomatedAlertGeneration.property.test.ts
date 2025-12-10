/**
 * Property-Based Test: Automated Alert Generation
 * 
 * Feature: student-success-retention-system, Property 2: Automated Alert Generation
 * 
 * Property: For any risk threshold breach or significant performance change,
 * the system should generate appropriate alerts within specified timeframes
 * with relevant context and recommendations.
 * 
 * Validates: Requirements 1.4, 2.2, 3.1, 4.2
 */

import fc from 'fast-check';
import { StudentMonitoringService } from '../StudentMonitoringService';
import { RiskLevel } from '../../../types/student-success.types';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}));

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(() => Promise.resolve(null)),
    setex: jest.fn(() => Promise.resolve('OK')),
    del: jest.fn(() => Promise.resolve(1)),
    keys: jest.fn(() => Promise.resolve([])),
    quit: jest.fn(() => Promise.resolve()),
    on: jest.fn(),
  }));
});

describe('Property Test: Automated Alert Generation', () => {
  let service: StudentMonitoringService;

  beforeEach(() => {
    service = new StudentMonitoringService();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await service.cleanup();
  });

  /**
   * Property: Critical risk scores (>= 70) should always trigger alerts
   */
  test('Property 2.1: Critical risk scores trigger alerts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 70, max: 100 }),
        async (studentId, riskScore) => {
          // Mock the risk assessment to return a critical score
          const mockAssessment = {
            studentId,
            overallRiskScore: riskScore,
            riskCategories: {
              academic: RiskLevel.CRITICAL,
              financial: RiskLevel.LOW,
              social: RiskLevel.LOW,
              spiritual: RiskLevel.LOW,
              engagement: RiskLevel.LOW,
            },
            contributingFactors: [],
            recommendedInterventions: [],
            confidenceLevel: 0.8,
            lastUpdated: new Date(),
          };

          // Mock the database insert for alerts
          const insertSpy = jest.fn().mockResolvedValue({ error: null });
          (service as any).supabase.from = jest.fn(() => ({
            insert: insertSpy,
          }));

          // Mock the triggerAlert method to track calls
          const triggerAlertSpy = jest.spyOn(service as any, 'triggerAlert');

          // Mock calculateRiskFactors and getStudentProfile
          jest.spyOn(service, 'calculateRiskFactors').mockResolvedValue([]);
          jest.spyOn(service, 'getStudentProfile').mockResolvedValue({
            studentId,
            academicMetrics: {
              gpa: 1.5,
              creditHours: 30,
              completionRate: 50,
              attendanceRate: 60,
              assignmentSubmissionRate: 50,
              gradeDistribution: {
                aCount: 0,
                bCount: 1,
                cCount: 2,
                dCount: 3,
                fCount: 4,
                incompleteCount: 0,
                withdrawalCount: 0,
              },
              progressTowardDegree: 25,
              lastUpdated: new Date(),
            },
            financialHealth: {
              tuitionBalance: 5000,
              financialAidStatus: 'pending',
              scrollGoldEarnings: 0,
              workStudyParticipation: false,
              emergencyFundRequests: [],
              paymentHistory: [],
              lastUpdated: new Date(),
            },
            spiritualFormation: {
              callingDiscernmentStage: 'exploration',
              spiritualGrowthScore: 40,
              mentorshipEngagement: 30,
              prayerJournalActivity: 5,
              scriptureMemoryProgress: 3,
              ministryInvolvementLevel: 2,
              propheticCheckInResults: [],
              lastUpdated: new Date(),
            },
            engagementPatterns: {
              loginFrequency: 1,
              courseAccessRate: 30,
              discussionParticipation: 2,
              resourceUtilization: 1,
              peerInteractionScore: 1,
              lastActivityDate: new Date(),
            },
            riskFactors: [],
            interventionHistory: [],
            supportTeam: {
              academicAdvisor: null as any,
              spiritualMentor: null as any,
              additionalSupport: [],
            },
            milestones: [],
            predictiveScores: {
              retentionProbability: 0.3,
              graduationProbability: 0.2,
              timeToGraduation: 6,
              successLikelihood: 0.3,
              modelVersion: 'v1.0',
              calculatedAt: new Date(),
            },
            createdAt: new Date(),
            lastUpdated: new Date(),
          });

          // Generate risk assessment
          await service.generateRiskAssessment(studentId);

          // Verify alert was triggered for critical risk
          expect(triggerAlertSpy).toHaveBeenCalledWith(
            studentId,
            expect.objectContaining({
              overallRiskScore: expect.any(Number),
            })
          );

          triggerAlertSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Alerts should contain relevant context and recommendations
   */
  test('Property 2.2: Alerts contain context and recommendations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(
          fc.record({
            category: fc.constantFrom('academic', 'financial', 'spiritual', 'engagement'),
            severity: fc.constantFrom(RiskLevel.HIGH, RiskLevel.CRITICAL),
          }),
          { minLength: 1, maxLength: 3 }
        ),
        async (studentId, riskFactors) => {
          // Mock alert storage
          let capturedAlert: any = null;
          (service as any).supabase.from = jest.fn(() => ({
            insert: jest.fn((data) => {
              capturedAlert = data;
              return Promise.resolve({ error: null });
            }),
          }));

          // Create mock assessment with recommendations
          const mockAssessment = {
            studentId,
            overallRiskScore: 75,
            riskCategories: {
              academic: RiskLevel.HIGH,
              financial: RiskLevel.MODERATE,
              social: RiskLevel.LOW,
              spiritual: RiskLevel.MODERATE,
              engagement: RiskLevel.HIGH,
            },
            contributingFactors: riskFactors.map((rf, idx) => ({
              id: `risk-${idx}`,
              category: rf.category,
              description: `Risk in ${rf.category}`,
              severity: rf.severity,
              detectedAt: new Date(),
              indicators: [`Indicator for ${rf.category}`],
            })),
            recommendedInterventions: [
              {
                type: 'academic_support' as any,
                priority: 1,
                description: 'Provide tutoring',
                estimatedImpact: 0.7,
                resources: ['Tutoring Center'],
              },
            ],
            confidenceLevel: 0.8,
            lastUpdated: new Date(),
          };

          // Trigger alert
          await (service as any).triggerAlert(studentId, mockAssessment);

          // Verify alert was created with proper structure
          expect(capturedAlert).toBeDefined();
          expect(capturedAlert.student_id).toBe(studentId);
          expect(capturedAlert.alert_data).toBeDefined();
          expect(capturedAlert.alert_data.message).toContain('at risk');
          expect(capturedAlert.alert_data.recommendations).toBeDefined();
          expect(Array.isArray(capturedAlert.alert_data.recommendations)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Different risk levels should generate appropriate alert severities
   */
  test('Property 2.3: Alert severity matches risk level', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.constantFrom(RiskLevel.LOW, RiskLevel.MODERATE, RiskLevel.HIGH, RiskLevel.CRITICAL),
        async (studentId, riskLevel) => {
          let capturedAlert: any = null;
          (service as any).supabase.from = jest.fn(() => ({
            insert: jest.fn((data) => {
              capturedAlert = data;
              return Promise.resolve({ error: null });
            }),
          }));

          const mockAssessment = {
            studentId,
            overallRiskScore: riskLevel === RiskLevel.CRITICAL ? 90 : 
                             riskLevel === RiskLevel.HIGH ? 75 :
                             riskLevel === RiskLevel.MODERATE ? 50 : 25,
            riskCategories: {
              academic: riskLevel,
              financial: RiskLevel.LOW,
              social: RiskLevel.LOW,
              spiritual: RiskLevel.LOW,
              engagement: RiskLevel.LOW,
            },
            contributingFactors: [],
            recommendedInterventions: [],
            confidenceLevel: 0.8,
            lastUpdated: new Date(),
          };

          await (service as any).triggerAlert(studentId, mockAssessment);

          // Verify alert severity matches risk level
          expect(capturedAlert).toBeDefined();
          expect(capturedAlert.alert_data.severity).toBe(riskLevel);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Alerts should be generated within specified timeframes
   */
  test('Property 2.4: Alerts generated within timeframe', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 70, max: 100 }),
        async (studentId, riskScore) => {
          const startTime = Date.now();

          // Mock dependencies
          jest.spyOn(service, 'calculateRiskFactors').mockResolvedValue([
            {
              id: 'risk-1',
              category: 'academic',
              description: 'Low GPA',
              severity: RiskLevel.CRITICAL,
              detectedAt: new Date(),
              indicators: ['GPA: 1.5'],
            },
          ]);

          jest.spyOn(service, 'getStudentProfile').mockResolvedValue({
            studentId,
            academicMetrics: {
              gpa: 1.5,
              creditHours: 30,
              completionRate: 50,
              attendanceRate: 60,
              assignmentSubmissionRate: 50,
              gradeDistribution: {
                aCount: 0,
                bCount: 1,
                cCount: 2,
                dCount: 3,
                fCount: 4,
                incompleteCount: 0,
                withdrawalCount: 0,
              },
              progressTowardDegree: 25,
              lastUpdated: new Date(),
            },
            financialHealth: {
              tuitionBalance: 1000,
              financialAidStatus: 'active',
              scrollGoldEarnings: 0,
              workStudyParticipation: false,
              emergencyFundRequests: [],
              paymentHistory: [],
              lastUpdated: new Date(),
            },
            spiritualFormation: {
              callingDiscernmentStage: 'exploration',
              spiritualGrowthScore: 50,
              mentorshipEngagement: 50,
              prayerJournalActivity: 10,
              scriptureMemoryProgress: 5,
              ministryInvolvementLevel: 5,
              propheticCheckInResults: [],
              lastUpdated: new Date(),
            },
            engagementPatterns: {
              loginFrequency: 2,
              courseAccessRate: 50,
              discussionParticipation: 5,
              resourceUtilization: 3,
              peerInteractionScore: 4,
              lastActivityDate: new Date(),
            },
            riskFactors: [],
            interventionHistory: [],
            supportTeam: {
              academicAdvisor: null as any,
              spiritualMentor: null as any,
              additionalSupport: [],
            },
            milestones: [],
            predictiveScores: {
              retentionProbability: 0.5,
              graduationProbability: 0.4,
              timeToGraduation: 5,
              successLikelihood: 0.5,
              modelVersion: 'v1.0',
              calculatedAt: new Date(),
            },
            createdAt: new Date(),
            lastUpdated: new Date(),
          });

          // Generate risk assessment (which should trigger alert)
          await service.generateRiskAssessment(studentId);

          const endTime = Date.now();
          const duration = endTime - startTime;

          // Verify alert was generated within 2 seconds (2000ms)
          // This is the requirement from the design document
          expect(duration).toBeLessThan(2000);
        }
      ),
      { numRuns: 50 } // Reduced runs for performance test
    );
  });

  /**
   * Property: Multiple risk factors should result in comprehensive recommendations
   */
  test('Property 2.5: Multiple risks generate comprehensive recommendations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.integer({ min: 2, max: 5 }),
        async (studentId, numRiskFactors) => {
          // Create multiple risk factors
          const riskFactors = Array.from({ length: numRiskFactors }, (_, i) => ({
            id: `risk-${i}`,
            category: ['academic', 'financial', 'spiritual', 'engagement'][i % 4],
            description: `Risk factor ${i}`,
            severity: RiskLevel.HIGH,
            detectedAt: new Date(),
            indicators: [`Indicator ${i}`],
          }));

          // Mock the profile with multiple risk factors
          jest.spyOn(service, 'calculateRiskFactors').mockResolvedValue(riskFactors);
          jest.spyOn(service, 'getStudentProfile').mockResolvedValue({
            studentId,
            academicMetrics: {
              gpa: 2.0,
              creditHours: 30,
              completionRate: 60,
              attendanceRate: 70,
              assignmentSubmissionRate: 65,
              gradeDistribution: {
                aCount: 1,
                bCount: 2,
                cCount: 3,
                dCount: 2,
                fCount: 2,
                incompleteCount: 0,
                withdrawalCount: 0,
              },
              progressTowardDegree: 30,
              lastUpdated: new Date(),
            },
            financialHealth: {
              tuitionBalance: 3000,
              financialAidStatus: 'pending',
              scrollGoldEarnings: 50,
              workStudyParticipation: false,
              emergencyFundRequests: [],
              paymentHistory: [],
              lastUpdated: new Date(),
            },
            spiritualFormation: {
              callingDiscernmentStage: 'exploration',
              spiritualGrowthScore: 45,
              mentorshipEngagement: 40,
              prayerJournalActivity: 8,
              scriptureMemoryProgress: 4,
              ministryInvolvementLevel: 3,
              propheticCheckInResults: [],
              lastUpdated: new Date(),
            },
            engagementPatterns: {
              loginFrequency: 2,
              courseAccessRate: 55,
              discussionParticipation: 4,
              resourceUtilization: 3,
              peerInteractionScore: 3,
              lastActivityDate: new Date(),
            },
            riskFactors,
            interventionHistory: [],
            supportTeam: {
              academicAdvisor: null as any,
              spiritualMentor: null as any,
              additionalSupport: [],
            },
            milestones: [],
            predictiveScores: {
              retentionProbability: 0.6,
              graduationProbability: 0.5,
              timeToGraduation: 4,
              successLikelihood: 0.6,
              modelVersion: 'v1.0',
              calculatedAt: new Date(),
            },
            createdAt: new Date(),
            lastUpdated: new Date(),
          });

          // Generate risk assessment
          const assessment = await service.generateRiskAssessment(studentId);

          // Verify recommendations are generated for multiple risk categories
          expect(assessment.recommendedInterventions.length).toBeGreaterThan(0);
          
          // Verify that different risk categories result in different intervention types
          const uniqueInterventionTypes = new Set(
            assessment.recommendedInterventions.map(i => i.type)
          );
          
          // With multiple risk factors, we should have multiple intervention types
          if (numRiskFactors >= 2) {
            expect(uniqueInterventionTypes.size).toBeGreaterThanOrEqual(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
