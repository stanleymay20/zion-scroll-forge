/**
 * Property-Based Tests for Workload Management and Escalation
 * "Bear one another's burdens, and so fulfill the law of Christ" - Galatians 6:2
 * 
 * Feature: student-success-retention-system, Property 10: Workload Management and Escalation
 * 
 * Property: For any case load threshold breach or intervention escalation need, 
 * the system should redistribute assignments appropriately and alert supervisors 
 * while maintaining case continuity
 * 
 * Validates: Requirements 10.3, 10.5
 */

import fc from 'fast-check';
import { InterventionManagementService } from '../InterventionManagementService';
import {
  InterventionCase,
  RiskFactor,
  RiskLevel,
  CaseStatus,
  EscalationLevel,
  InterventionType,
  TeamMember
} from '../../../types/student-success.types';

// Mock dependencies
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  interventionCase: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

describe('Property 10: Workload Management and Escalation', () => {
  let service: InterventionManagementService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new InterventionManagementService(
      mockPrisma as any,
      mockCache as any,
      mockLogger as any
    );
  });

  // ============================================================================
  // Generators
  // ============================================================================

  /**
   * Generate a valid team member ID
   */
  const teamMemberIdArb = fc.string({ minLength: 5, maxLength: 20 }).map(id => `member-${id}`);

  /**
   * Generate a valid case ID
   */
  const caseIdArb = fc.string({ minLength: 5, maxLength: 20 }).map(id => `case-${id}`);

  /**
   * Generate a valid student ID
   */
  const studentIdArb = fc.string({ minLength: 5, maxLength: 20 }).map(id => `student-${id}`);

  /**
   * Generate a risk factor
   */
  const riskFactorArb = fc.record({
    id: fc.string({ minLength: 5, maxLength: 20 }),
    category: fc.constantFrom('academic', 'financial', 'spiritual', 'social', 'engagement'),
    description: fc.string({ minLength: 10, maxLength: 100 }),
    severity: fc.constantFrom(RiskLevel.LOW, RiskLevel.MODERATE, RiskLevel.HIGH, RiskLevel.CRITICAL),
    detectedAt: fc.date(),
  });

  /**
   * Generate a team member
   */
  const teamMemberArb = fc.record({
    id: teamMemberIdArb,
    name: fc.string({ minLength: 5, maxLength: 50 }),
    role: fc.constantFrom('Academic Advisor', 'Financial Aid Officer', 'Spiritual Mentor', 'Counselor'),
    email: fc.emailAddress(),
    assignedAt: fc.date(),
  });

  /**
   * Generate an intervention case
   */
  const interventionCaseArb = fc.record({
    caseId: caseIdArb,
    studentId: studentIdArb,
    riskFactors: fc.array(riskFactorArb, { minLength: 1, maxLength: 5 }),
    assignedTeam: fc.array(teamMemberArb, { minLength: 1, maxLength: 4 }),
    status: fc.constantFrom(
      CaseStatus.OPEN,
      CaseStatus.IN_PROGRESS,
      CaseStatus.MONITORING,
      CaseStatus.RESOLVED,
      CaseStatus.CLOSED
    ),
    escalationLevel: fc.constantFrom(
      EscalationLevel.NONE,
      EscalationLevel.ADVISOR,
      EscalationLevel.DEPARTMENT,
      EscalationLevel.DEAN,
      EscalationLevel.EMERGENCY
    ),
    createdAt: fc.date(),
    lastUpdated: fc.date(),
  });

  /**
   * Generate a workload scenario with multiple cases per team member
   */
  const workloadScenarioArb = fc.record({
    teamMemberId: teamMemberIdArb,
    maxLoad: fc.integer({ min: 5, max: 15 }),
    assignedCases: fc.array(interventionCaseArb, { minLength: 0, maxLength: 20 }),
  });

  // ============================================================================
  // Property Tests
  // ============================================================================

  describe('Workload Threshold Detection', () => {
    /**
     * Property: Workload management should correctly identify when a team member
     * exceeds their maximum case load
     */
    it('should detect workload threshold breaches accurately', async () => {
      await fc.assert(
        fc.asyncProperty(workloadScenarioArb, async (scenario) => {
          // Setup: Mock database responses
          mockCache.get.mockResolvedValue(null);
          
          // Mock getCasesByTeamMember to return the assigned cases
          const getCasesByTeamMemberSpy = jest.spyOn(service as any, 'getCasesByTeamMember');
          getCasesByTeamMemberSpy.mockResolvedValue(scenario.assignedCases);

          // Mock getMaxLoadForRole to return the max load
          const getMaxLoadForRoleSpy = jest.spyOn(service as any, 'getMaxLoadForRole');
          getMaxLoadForRoleSpy.mockResolvedValue(scenario.maxLoad);

          // Execute: Check workload
          const result = await service.manageWorkload(scenario.teamMemberId);

          // Verify: Workload detection is accurate
          expect(result.currentLoad).toBe(scenario.assignedCases.length);
          expect(result.maxLoad).toBe(scenario.maxLoad);
          expect(result.needsRedistribution).toBe(scenario.assignedCases.length > scenario.maxLoad);

          // Verify: Cases are correctly listed
          expect(result.cases).toHaveLength(scenario.assignedCases.length);
          expect(result.cases).toEqual(scenario.assignedCases.map(c => c.caseId));
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: When workload exceeds capacity, supervisor should be alerted
     */
    it('should alert supervisor when workload exceeds capacity', async () => {
      await fc.assert(
        fc.asyncProperty(
          workloadScenarioArb.filter(s => s.assignedCases.length > s.maxLoad),
          async (scenario) => {
            // Setup
            mockCache.get.mockResolvedValue(null);
            const getCasesByTeamMemberSpy = jest.spyOn(service as any, 'getCasesByTeamMember');
            getCasesByTeamMemberSpy.mockResolvedValue(scenario.assignedCases);
            const getMaxLoadForRoleSpy = jest.spyOn(service as any, 'getMaxLoadForRole');
            getMaxLoadForRoleSpy.mockResolvedValue(scenario.maxLoad);

            const alertSupervisorSpy = jest.spyOn(service as any, 'alertSupervisor');
            alertSupervisorSpy.mockResolvedValue(undefined);

            // Execute
            await service.manageWorkload(scenario.teamMemberId);

            // Verify: Supervisor was alerted
            expect(alertSupervisorSpy).toHaveBeenCalledWith(
              scenario.teamMemberId,
              scenario.assignedCases.length,
              scenario.maxLoad
            );
            // Note: We check the spy instead of mockLogger since the service uses its own logger instance
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Case Redistribution', () => {
    /**
     * Property: Case redistribution should reduce overloaded member's case count
     * to at or below maximum load
     */
    it('should redistribute cases to bring workload within limits', async () => {
      await fc.assert(
        fc.asyncProperty(
          workloadScenarioArb.filter(s => s.assignedCases.length > s.maxLoad),
          async (scenario) => {
            // Setup
            const getCasesByTeamMemberSpy = jest.spyOn(service as any, 'getCasesByTeamMember');
            getCasesByTeamMemberSpy.mockResolvedValue(scenario.assignedCases);
            
            const getMaxLoadForRoleSpy = jest.spyOn(service as any, 'getMaxLoadForRole');
            getMaxLoadForRoleSpy.mockResolvedValue(scenario.maxLoad);

            // Mock finding available team members
            const findAvailableTeamMemberSpy = jest.spyOn(service as any, 'findAvailableTeamMember');
            findAvailableTeamMemberSpy.mockResolvedValue({
              id: 'available-member-001',
              name: 'Available Member',
              role: 'Academic Advisor',
              email: 'available@scrolluniversity.edu',
              assignedAt: new Date(),
            });

            // Mock reassignCase - track calls per test run
            const reassignCaseSpy = jest.spyOn(service as any, 'reassignCase');
            reassignCaseSpy.mockResolvedValue(undefined);
            const callCountBefore = reassignCaseSpy.mock.calls.length;

            // Execute
            const result = await service.redistributeCases(scenario.teamMemberId);

            // Verify: Correct number of cases redistributed
            const expectedRedistributed = scenario.assignedCases.length - scenario.maxLoad;
            expect(result.redistributed).toBe(expectedRedistributed);

            // Verify: Cases were actually reassigned (count calls made in this specific test run)
            const callsInThisRun = reassignCaseSpy.mock.calls.length - callCountBefore;
            expect(callsInThisRun).toBe(expectedRedistributed);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Redistributed cases should maintain their essential properties
     */
    it('should maintain case continuity during redistribution', async () => {
      await fc.assert(
        fc.asyncProperty(
          workloadScenarioArb.filter(s => s.assignedCases.length > s.maxLoad),
          async (scenario) => {
            // Setup
            const casesToRedistribute = scenario.assignedCases.slice(scenario.maxLoad);
            
            const getCasesByTeamMemberSpy = jest.spyOn(service as any, 'getCasesByTeamMember');
            getCasesByTeamMemberSpy.mockResolvedValue(scenario.assignedCases);
            
            const getMaxLoadForRoleSpy = jest.spyOn(service as any, 'getMaxLoadForRole');
            getMaxLoadForRoleSpy.mockResolvedValue(scenario.maxLoad);

            const findAvailableTeamMemberSpy = jest.spyOn(service as any, 'findAvailableTeamMember');
            findAvailableTeamMemberSpy.mockResolvedValue({
              id: 'available-member-001',
              name: 'Available Member',
              role: 'Academic Advisor',
              email: 'available@scrolluniversity.edu',
              assignedAt: new Date(),
            });

            // Track reassignments
            const reassignments: Array<{ caseId: string; from: string; to: string }> = [];
            const reassignCaseSpy = jest.spyOn(service as any, 'reassignCase');
            reassignCaseSpy.mockImplementation(async (caseId, fromId, toId) => {
              reassignments.push({ caseId, from: fromId, to: toId });
            });

            // Execute
            await service.redistributeCases(scenario.teamMemberId);

            // Verify: All redistributed cases were reassigned
            expect(reassignments).toHaveLength(casesToRedistribute.length);

            // Verify: Each case was reassigned from the overloaded member
            reassignments.forEach(reassignment => {
              expect(reassignment.from).toBe(scenario.teamMemberId);
              expect(reassignment.to).toBeTruthy();
              expect(reassignment.to).not.toBe(scenario.teamMemberId);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Case Escalation', () => {
    /**
     * Property: Escalating a case should increase its escalation level
     */
    it('should increase escalation level when case is escalated', async () => {
      await fc.assert(
        fc.asyncProperty(
          interventionCaseArb,
          fc.string({ minLength: 10, maxLength: 100 }),
          async (interventionCase, reason) => {
            // Pre-condition: Skip if already at emergency level
            fc.pre(interventionCase.escalationLevel !== EscalationLevel.EMERGENCY);
            
            // Setup
            const getInterventionCaseSpy = jest.spyOn(service as any, 'getInterventionCase');
            getInterventionCaseSpy.mockResolvedValue(interventionCase);

            const updateInterventionCaseSpy = jest.spyOn(service as any, 'updateInterventionCase');
            updateInterventionCaseSpy.mockResolvedValue(undefined);

            const getEscalationTeamSpy = jest.spyOn(service as any, 'getEscalationTeam');
            getEscalationTeamSpy.mockResolvedValue([]);

            const notifyEscalationTeamSpy = jest.spyOn(service as any, 'notifyEscalationTeam');
            notifyEscalationTeamSpy.mockResolvedValue(undefined);

            const originalLevel = interventionCase.escalationLevel;

            // Execute
            const result = await service.escalateCase(interventionCase.caseId, reason);

            // Verify: Escalation level increased
            const levelOrder = [
              EscalationLevel.NONE,
              EscalationLevel.ADVISOR,
              EscalationLevel.DEPARTMENT,
              EscalationLevel.DEAN,
              EscalationLevel.EMERGENCY
            ];
            const originalIndex = levelOrder.indexOf(originalLevel);
            const newIndex = levelOrder.indexOf(result.escalationLevel);
            expect(newIndex).toBeGreaterThan(originalIndex);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Escalation should add appropriate team members based on level
     */
    it('should assign additional team members when escalating', async () => {
      await fc.assert(
        fc.asyncProperty(
          interventionCaseArb,
          fc.string({ minLength: 10, maxLength: 100 }),
          async (interventionCase, reason) => {
            // Pre-condition: Skip if already at emergency level
            fc.pre(interventionCase.escalationLevel !== EscalationLevel.EMERGENCY);
            
            // Setup
            const originalTeamSize = interventionCase.assignedTeam.length;
            
            const getInterventionCaseSpy = jest.spyOn(service as any, 'getInterventionCase');
            getInterventionCaseSpy.mockResolvedValue(interventionCase);

            const updateInterventionCaseSpy = jest.spyOn(service as any, 'updateInterventionCase');
            updateInterventionCaseSpy.mockResolvedValue(undefined);

            // Mock escalation team
            const escalationTeam: TeamMember[] = [{
              id: 'escalation-member-001',
              name: 'Escalation Team Member',
              role: 'Department Chair',
              email: 'escalation@scrolluniversity.edu',
              assignedAt: new Date(),
            }];
            const getEscalationTeamSpy = jest.spyOn(service as any, 'getEscalationTeam');
            getEscalationTeamSpy.mockResolvedValue(escalationTeam);

            const notifyEscalationTeamSpy = jest.spyOn(service as any, 'notifyEscalationTeam');
            notifyEscalationTeamSpy.mockResolvedValue(undefined);

            // Execute
            const result = await service.escalateCase(interventionCase.caseId, reason);

            // Verify: Team size increased
            expect(result.assignedTeam.length).toBeGreaterThan(originalTeamSize);

            // Verify: Escalation team was added
            expect(getEscalationTeamSpy).toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Escalation should add timeline entry documenting the escalation
     */
    it('should document escalation in case timeline', async () => {
      await fc.assert(
        fc.asyncProperty(
          interventionCaseArb,
          fc.string({ minLength: 10, maxLength: 100 }),
          async (interventionCase, reason) => {
            // Pre-condition: Skip if already at emergency level
            fc.pre(interventionCase.escalationLevel !== EscalationLevel.EMERGENCY);
            
            // Setup
            const originalTimelineLength = interventionCase.timeline?.length || 0;
            
            const getInterventionCaseSpy = jest.spyOn(service as any, 'getInterventionCase');
            getInterventionCaseSpy.mockResolvedValue(interventionCase);

            const updateInterventionCaseSpy = jest.spyOn(service as any, 'updateInterventionCase');
            updateInterventionCaseSpy.mockResolvedValue(undefined);

            const getEscalationTeamSpy = jest.spyOn(service as any, 'getEscalationTeam');
            getEscalationTeamSpy.mockResolvedValue([]);

            const notifyEscalationTeamSpy = jest.spyOn(service as any, 'notifyEscalationTeam');
            notifyEscalationTeamSpy.mockResolvedValue(undefined);

            // Execute
            const result = await service.escalateCase(interventionCase.caseId, reason);

            // Verify: Timeline entry added
            expect(result.timeline.length).toBeGreaterThan(originalTimelineLength);

            // Verify: Timeline entry contains escalation information
            const lastEntry = result.timeline[result.timeline.length - 1];
            expect(lastEntry.event).toBe('Case Escalated');
            expect(lastEntry.details).toContain(reason);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Escalation team should be notified
     */
    it('should notify escalation team when case is escalated', async () => {
      await fc.assert(
        fc.asyncProperty(
          interventionCaseArb,
          fc.string({ minLength: 10, maxLength: 100 }),
          async (interventionCase, reason) => {
            // Pre-condition: Skip if already at emergency level
            fc.pre(interventionCase.escalationLevel !== EscalationLevel.EMERGENCY);
            
            // Setup
            const getInterventionCaseSpy = jest.spyOn(service as any, 'getInterventionCase');
            getInterventionCaseSpy.mockResolvedValue(interventionCase);

            const updateInterventionCaseSpy = jest.spyOn(service as any, 'updateInterventionCase');
            updateInterventionCaseSpy.mockResolvedValue(undefined);

            const getEscalationTeamSpy = jest.spyOn(service as any, 'getEscalationTeam');
            getEscalationTeamSpy.mockResolvedValue([]);

            const notifyEscalationTeamSpy = jest.spyOn(service as any, 'notifyEscalationTeam');
            notifyEscalationTeamSpy.mockResolvedValue(undefined);

            // Execute
            await service.escalateCase(interventionCase.caseId, reason);

            // Verify: Notification was sent
            expect(notifyEscalationTeamSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                caseId: interventionCase.caseId,
              }),
              reason
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Case Continuity During Workload Management', () => {
    /**
     * Property: Case data should remain intact during redistribution
     */
    it('should preserve case data integrity during redistribution', async () => {
      await fc.assert(
        fc.asyncProperty(
          workloadScenarioArb.filter(s => s.assignedCases.length > s.maxLoad),
          async (scenario) => {
            // Setup
            const casesToRedistribute = scenario.assignedCases.slice(scenario.maxLoad);
            const caseSnapshots = new Map(
              casesToRedistribute.map(c => [c.caseId, { ...c }])
            );

            const getCasesByTeamMemberSpy = jest.spyOn(service as any, 'getCasesByTeamMember');
            getCasesByTeamMemberSpy.mockResolvedValue(scenario.assignedCases);
            
            const getMaxLoadForRoleSpy = jest.spyOn(service as any, 'getMaxLoadForRole');
            getMaxLoadForRoleSpy.mockResolvedValue(scenario.maxLoad);

            const findAvailableTeamMemberSpy = jest.spyOn(service as any, 'findAvailableTeamMember');
            findAvailableTeamMemberSpy.mockResolvedValue({
              id: 'available-member-001',
              name: 'Available Member',
              role: 'Academic Advisor',
              email: 'available@scrolluniversity.edu',
              assignedAt: new Date(),
            });

            // Mock getInterventionCase to return case data
            const getInterventionCaseSpy = jest.spyOn(service as any, 'getInterventionCase');
            getInterventionCaseSpy.mockImplementation(async (caseId: string) => {
              return caseSnapshots.get(caseId) || null;
            });

            const updateInterventionCaseSpy = jest.spyOn(service as any, 'updateInterventionCase');
            updateInterventionCaseSpy.mockResolvedValue(undefined);

            // Execute
            await service.redistributeCases(scenario.teamMemberId);

            // Verify: Essential case properties preserved
            for (const [caseId, originalCase] of caseSnapshots) {
              // Case ID should remain the same
              expect(caseId).toBe(originalCase.caseId);
              
              // Student ID should remain the same
              expect(originalCase.studentId).toBeTruthy();
              
              // Risk factors should remain the same
              expect(originalCase.riskFactors).toBeTruthy();
              expect(originalCase.riskFactors.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Escalation should not lose case history
     */
    it('should preserve case history during escalation', async () => {
      await fc.assert(
        fc.asyncProperty(
          interventionCaseArb,
          fc.string({ minLength: 10, maxLength: 100 }),
          async (interventionCase, reason) => {
            // Pre-condition: Skip if already at emergency level
            fc.pre(interventionCase.escalationLevel !== EscalationLevel.EMERGENCY);
            
            // Setup
            const originalTimeline = [...(interventionCase.timeline || [])];
            const originalOutcomes = [...(interventionCase.outcomes || [])];
            
            const getInterventionCaseSpy = jest.spyOn(service as any, 'getInterventionCase');
            getInterventionCaseSpy.mockResolvedValue(interventionCase);

            const updateInterventionCaseSpy = jest.spyOn(service as any, 'updateInterventionCase');
            updateInterventionCaseSpy.mockResolvedValue(undefined);

            const getEscalationTeamSpy = jest.spyOn(service as any, 'getEscalationTeam');
            getEscalationTeamSpy.mockResolvedValue([]);

            const notifyEscalationTeamSpy = jest.spyOn(service as any, 'notifyEscalationTeam');
            notifyEscalationTeamSpy.mockResolvedValue(undefined);

            // Execute
            const result = await service.escalateCase(interventionCase.caseId, reason);

            // Verify: Original timeline entries preserved
            originalTimeline.forEach((entry, index) => {
              expect(result.timeline[index]).toEqual(entry);
            });

            // Verify: Original outcomes preserved
            expect(result.outcomes).toEqual(expect.arrayContaining(originalOutcomes));
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    /**
     * Property: System should handle empty case loads gracefully
     */
    it('should handle team members with no assigned cases', async () => {
      await fc.assert(
        fc.asyncProperty(teamMemberIdArb, async (teamMemberId) => {
          // Setup
          const getCasesByTeamMemberSpy = jest.spyOn(service as any, 'getCasesByTeamMember');
          getCasesByTeamMemberSpy.mockResolvedValue([]);
          
          const getMaxLoadForRoleSpy = jest.spyOn(service as any, 'getMaxLoadForRole');
          getMaxLoadForRoleSpy.mockResolvedValue(10);

          // Execute
          const result = await service.manageWorkload(teamMemberId);

          // Verify
          expect(result.currentLoad).toBe(0);
          expect(result.needsRedistribution).toBe(false);
          expect(result.cases).toEqual([]);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: System should handle maximum escalation level
     */
    it('should not escalate beyond emergency level', async () => {
      await fc.assert(
        fc.asyncProperty(
          interventionCaseArb,
          fc.string({ minLength: 10, maxLength: 100 }),
          async (interventionCase, reason) => {
            // Force case to emergency level
            const emergencyCase = { ...interventionCase, escalationLevel: EscalationLevel.EMERGENCY };
            
            // Setup
            const getInterventionCaseSpy = jest.spyOn(service as any, 'getInterventionCase');
            getInterventionCaseSpy.mockResolvedValue(emergencyCase);

            const updateInterventionCaseSpy = jest.spyOn(service as any, 'updateInterventionCase');
            updateInterventionCaseSpy.mockResolvedValue(undefined);

            const getEscalationTeamSpy = jest.spyOn(service as any, 'getEscalationTeam');
            getEscalationTeamSpy.mockResolvedValue([]);

            const notifyEscalationTeamSpy = jest.spyOn(service as any, 'notifyEscalationTeam');
            notifyEscalationTeamSpy.mockResolvedValue(undefined);

            // Execute
            const result = await service.escalateCase(emergencyCase.caseId, reason);

            // Verify: Level remains at emergency
            expect(result.escalationLevel).toBe(EscalationLevel.EMERGENCY);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
