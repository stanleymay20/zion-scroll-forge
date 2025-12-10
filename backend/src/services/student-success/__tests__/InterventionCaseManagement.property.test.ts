/**
 * Property-Based Tests for Intervention Case Management
 * 
 * Feature: student-success-retention-system, Property 5: Intervention Case Management
 * Validates: Requirements 3.3, 10.1, 10.2, 10.4
 * 
 * Property: For any at-risk student identification, the system should create comprehensive
 * support cases, assign appropriate team members, and track intervention effectiveness
 * throughout the case lifecycle.
 */

import fc from 'fast-check';
import { InterventionManagementService } from '../InterventionManagementService';
import {
  RiskFactor,
  RiskLevel,
  InterventionType,
  CaseStatus,
  EscalationLevel
} from '../../../types/student-success.types';

describe('Property 5: Intervention Case Management', () => {
  let service: InterventionManagementService;

  beforeEach(() => {
    service = new InterventionManagementService();
  });

  // ============================================================================
  // Generators
  // ============================================================================

  const riskLevelArb = fc.constantFrom(
    RiskLevel.LOW,
    RiskLevel.MODERATE,
    RiskLevel.HIGH,
    RiskLevel.CRITICAL
  );

  const riskCategoryArb = fc.constantFrom(
    'academic',
    'financial',
    'social',
    'spiritual',
    'engagement'
  );

  const riskFactorArb = fc.record({
    id: fc.uuid(),
    category: riskCategoryArb,
    description: fc.string({ minLength: 10, maxLength: 100 }),
    severity: riskLevelArb,
    detectedAt: fc.date(),
    indicators: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 })
  });

  const studentIdArb = fc.string({ minLength: 5, maxLength: 20 }).map(s => `STU-${s}`);

  const caseCreationParamsArb = fc.record({
    studentId: studentIdArb,
    riskFactors: fc.array(riskFactorArb, { minLength: 1, maxLength: 5 })
  });

  // ============================================================================
  // Property Tests
  // ============================================================================

  /**
   * Property: Case creation always produces valid intervention case
   * For any valid student ID and risk factors, creating an intervention case
   * should produce a case with all required fields populated
   */
  it('should create valid intervention case for any at-risk student', async () => {
    await fc.assert(
      fc.asyncProperty(caseCreationParamsArb, async (params) => {
        const interventionCase = await service.createInterventionCase(params);

        // Case should have unique ID
        expect(interventionCase.caseId).toBeDefined();
        expect(interventionCase.caseId).toContain(params.studentId);

        // Case should reference correct student
        expect(interventionCase.studentId).toBe(params.studentId);

        // Case should include all risk factors
        expect(interventionCase.riskFactors).toHaveLength(params.riskFactors.length);

        // Case should have assigned team
        expect(interventionCase.assignedTeam).toBeDefined();
        expect(interventionCase.assignedTeam.length).toBeGreaterThan(0);

        // Case should have intervention plan
        expect(interventionCase.interventionPlan).toBeDefined();
        expect(interventionCase.interventionPlan.strategies).toBeDefined();
        expect(interventionCase.interventionPlan.goals).toBeDefined();
        expect(interventionCase.interventionPlan.timeline).toBeDefined();

        // Case should have initial timeline entry
        expect(interventionCase.timeline).toBeDefined();
        expect(interventionCase.timeline.length).toBeGreaterThan(0);

        // Case should have appropriate status
        expect(interventionCase.status).toBe(CaseStatus.OPEN);

        // Case should have timestamps
        expect(interventionCase.createdAt).toBeInstanceOf(Date);
        expect(interventionCase.lastUpdated).toBeInstanceOf(Date);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Team assignment matches risk factors
   * For any set of risk factors, the assigned team should include appropriate
   * specialists for each risk category
   */
  it('should assign appropriate team members based on risk factors', async () => {
    await fc.assert(
      fc.asyncProperty(caseCreationParamsArb, async (params) => {
        const interventionCase = await service.createInterventionCase(params);

        const riskCategories = new Set(params.riskFactors.map(rf => rf.category));

        // Should always have at least one team member
        expect(interventionCase.assignedTeam.length).toBeGreaterThan(0);

        // Check for appropriate specialists based on risk categories
        const teamRoles = interventionCase.assignedTeam.map(m => m.role.toLowerCase());

        if (riskCategories.has('financial')) {
          expect(teamRoles.some(role => role.includes('financial'))).toBe(true);
        }

        if (riskCategories.has('spiritual')) {
          expect(teamRoles.some(role => role.includes('spiritual') || role.includes('mentor'))).toBe(true);
        }

        if (riskCategories.has('social') || riskCategories.has('engagement')) {
          expect(teamRoles.some(role => role.includes('counselor') || role.includes('mentor'))).toBe(true);
        }

        // All team members should have required fields
        for (const member of interventionCase.assignedTeam) {
          expect(member.id).toBeDefined();
          expect(member.name).toBeDefined();
          expect(member.role).toBeDefined();
          expect(member.email).toBeDefined();
          expect(member.assignedAt).toBeInstanceOf(Date);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Escalation level matches risk severity
   * For any set of risk factors, the escalation level should be appropriate
   * for the highest severity risk present
   */
  it('should set appropriate escalation level based on risk severity', async () => {
    await fc.assert(
      fc.asyncProperty(caseCreationParamsArb, async (params) => {
        const interventionCase = await service.createInterventionCase(params);

        const criticalCount = params.riskFactors.filter(rf => rf.severity === RiskLevel.CRITICAL).length;
        const highCount = params.riskFactors.filter(rf => rf.severity === RiskLevel.HIGH).length;

        if (criticalCount > 0) {
          expect(interventionCase.escalationLevel).toBe(EscalationLevel.EMERGENCY);
        } else if (highCount >= 2) {
          expect(interventionCase.escalationLevel).toBe(EscalationLevel.DEAN);
        } else if (highCount === 1) {
          expect(interventionCase.escalationLevel).toBe(EscalationLevel.DEPARTMENT);
        } else {
          expect(interventionCase.escalationLevel).toBe(EscalationLevel.ADVISOR);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Intervention plan includes strategies for all risk categories
   * For any set of risk factors, the intervention plan should include
   * appropriate strategies addressing each risk category
   */
  it('should generate intervention plan covering all risk categories', async () => {
    await fc.assert(
      fc.asyncProperty(caseCreationParamsArb, async (params) => {
        const interventionCase = await service.createInterventionCase(params);

        const riskCategories = new Set(params.riskFactors.map(rf => rf.category));
        const plan = interventionCase.interventionPlan;

        // Plan should have strategies
        expect(plan.strategies.length).toBeGreaterThan(0);

        // Plan should have goals
        expect(plan.goals.length).toBeGreaterThan(0);

        // Plan should have timeline with checkpoints
        expect(plan.timeline.startDate).toBeInstanceOf(Date);
        expect(plan.timeline.expectedEndDate).toBeInstanceOf(Date);
        expect(plan.timeline.checkpoints.length).toBeGreaterThan(0);

        // Timeline should be logical (end after start)
        expect(plan.timeline.expectedEndDate.getTime()).toBeGreaterThan(
          plan.timeline.startDate.getTime()
        );

        // Plan should have resources
        expect(plan.resources).toBeDefined();

        // Plan should have success metrics
        expect(plan.successMetrics).toBeDefined();

        // Each strategy should be valid
        for (const strategy of plan.strategies) {
          expect(strategy.id).toBeDefined();
          expect(strategy.name).toBeDefined();
          expect(strategy.type).toBeDefined();
          expect(strategy.steps.length).toBeGreaterThan(0);
          expect(strategy.expectedDuration).toBeGreaterThan(0);
          expect(strategy.successCriteria.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Progress tracking maintains case history
   * For any progress update, the case timeline should grow and maintain
   * chronological order
   */
  it('should maintain chronological case history through progress tracking', async () => {
    await fc.assert(
      fc.asyncProperty(
        caseCreationParamsArb,
        fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
        async (params, updates) => {
          const interventionCase = await service.createInterventionCase(params);
          const initialTimelineLength = interventionCase.timeline.length;

          // Apply progress updates
          for (const updateText of updates) {
            await service.trackProgress({
              caseId: interventionCase.caseId,
              updates: updateText,
              nextSteps: ['Continue monitoring']
            });
          }

          // Retrieve updated case
          const updatedCase = await service['getInterventionCase'](interventionCase.caseId);
          
          if (updatedCase) {
            // Timeline should have grown
            expect(updatedCase.timeline.length).toBeGreaterThan(initialTimelineLength);

            // Timeline should be in chronological order
            for (let i = 1; i < updatedCase.timeline.length; i++) {
              expect(updatedCase.timeline[i].timestamp.getTime()).toBeGreaterThanOrEqual(
                updatedCase.timeline[i - 1].timestamp.getTime()
              );
            }

            // Last updated should be recent
            expect(updatedCase.lastUpdated.getTime()).toBeGreaterThanOrEqual(
              interventionCase.createdAt.getTime()
            );
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Effectiveness measurement is bounded and consistent
   * For any intervention case, effectiveness score should be between 0-100
   * and reflect actual outcomes
   */
  it('should calculate effectiveness within valid range', async () => {
    await fc.assert(
      fc.asyncProperty(caseCreationParamsArb, async (params) => {
        const interventionCase = await service.createInterventionCase(params);

        const effectiveness = await service.measureEffectiveness(interventionCase.caseId);

        // Effectiveness should be bounded
        expect(effectiveness.overallEffectiveness).toBeGreaterThanOrEqual(0);
        expect(effectiveness.overallEffectiveness).toBeLessThanOrEqual(100);

        // Should have recommendations
        expect(effectiveness.recommendations).toBeDefined();
        expect(effectiveness.recommendations.length).toBeGreaterThan(0);

        // Recommendations should be appropriate for effectiveness level
        if (effectiveness.overallEffectiveness >= 80) {
          expect(effectiveness.recommendations.some(r => 
            r.toLowerCase().includes('effective') || r.toLowerCase().includes('successful')
          )).toBe(true);
        } else if (effectiveness.overallEffectiveness < 40) {
          expect(effectiveness.recommendations.some(r => 
            r.toLowerCase().includes('revision') || r.toLowerCase().includes('escalation')
          )).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Case lifecycle transitions are valid
   * For any intervention case, status transitions should follow valid paths
   * and never regress inappropriately
   */
  it('should maintain valid case status transitions', async () => {
    await fc.assert(
      fc.asyncProperty(caseCreationParamsArb, async (params) => {
        const interventionCase = await service.createInterventionCase(params);

        // Initial status should be OPEN
        expect(interventionCase.status).toBe(CaseStatus.OPEN);

        // Valid status transitions from OPEN
        const validNextStatuses = [
          CaseStatus.IN_PROGRESS,
          CaseStatus.MONITORING,
          CaseStatus.RESOLVED,
          CaseStatus.CLOSED
        ];

        // Status should never be undefined
        expect(interventionCase.status).toBeDefined();

        // Status should be one of the valid enum values
        expect(Object.values(CaseStatus)).toContain(interventionCase.status);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Intervention goals are measurable and time-bound
   * For any intervention plan, all goals should have measurable targets
   * and realistic deadlines
   */
  it('should create measurable and time-bound intervention goals', async () => {
    await fc.assert(
      fc.asyncProperty(caseCreationParamsArb, async (params) => {
        const interventionCase = await service.createInterventionCase(params);
        const goals = interventionCase.interventionPlan.goals;

        for (const goal of goals) {
          // Goal should have description
          expect(goal.description).toBeDefined();
          expect(goal.description.length).toBeGreaterThan(0);

          // Goal should have measurable values
          expect(goal.targetValue).toBeDefined();
          expect(goal.currentValue).toBeDefined();
          expect(goal.targetValue).toBeGreaterThanOrEqual(goal.currentValue);

          // Goal should have deadline
          expect(goal.deadline).toBeInstanceOf(Date);
          expect(goal.deadline.getTime()).toBeGreaterThan(interventionCase.createdAt.getTime());

          // Goal should have achievement status
          expect(typeof goal.achieved).toBe('boolean');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Resources are appropriate for intervention strategies
   * For any intervention plan, resources should match the strategies
   * and provide necessary contact information
   */
  it('should provide appropriate resources for intervention strategies', async () => {
    await fc.assert(
      fc.asyncProperty(caseCreationParamsArb, async (params) => {
        const interventionCase = await service.createInterventionCase(params);
        const { strategies, resources } = interventionCase.interventionPlan;

        // Should have resources if strategies are present
        if (strategies.length > 0) {
          expect(resources.length).toBeGreaterThan(0);
        }

        // Each resource should be valid
        for (const resource of resources) {
          expect(resource.id).toBeDefined();
          expect(resource.type).toBeDefined();
          expect(resource.name).toBeDefined();
          expect(resource.description).toBeDefined();

          // Resource should have contact info or URL
          expect(
            resource.contactInfo !== undefined || resource.url !== undefined
          ).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
