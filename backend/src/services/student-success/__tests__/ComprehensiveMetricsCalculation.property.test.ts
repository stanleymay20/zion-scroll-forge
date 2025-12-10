import * as fc from 'fast-check';
import { AnalyticsAlertingService } from '../AnalyticsAlertingService';
import { RetentionMetrics, GraduationMetrics } from '../../../types/student-success.types';

/**
 * Property-Based Tests for Comprehensive Metrics Calculation
 * 
 * Feature: student-success-retention-system, Property 1: Comprehensive Metrics Calculation
 * 
 * Tests that for any student data set and metric type (retention, graduation, engagement, performance),
 * calculating metrics produces accurate results that match expected statistical formulas and include
 * all relevant data points.
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 5.1, 8.2, 9.5
 */

describe('AnalyticsAlertingService - Comprehensive Metrics Calculation Properties', () => {
  let service: AnalyticsAlertingService;

  beforeEach(() => {
    service = new AnalyticsAlertingService();
  });

  describe('Property 1: Comprehensive Metrics Calculation', () => {
    
    /**
     * Property: Retention rate calculation accuracy
     * For any cohort of students with known statuses, the calculated retention rate
     * should match the mathematical formula: (retained / total) * 100
     */
    it('should calculate retention rates accurately for any cohort composition', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              studentId: fc.uuid(),
              status: fc.constantFrom('active', 'graduated', 'dropped', 'transferred'),
              enrollmentDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2023-01-01') }),
              programId: fc.constantFrom('theology', 'ministry', 'education', 'business')
            }),
            { minLength: 1, maxLength: 100 }
          ),
          fc.date({ min: new Date('2020-01-01'), max: new Date('2023-01-01') }),
          fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') }),
          async (students, startDate, endDate) => {
            // Mock the getCohortStudents method
            const cohortId = 'test-cohort';
            jest.spyOn(service as any, 'getCohortStudents').mockResolvedValue(students);
            jest.spyOn(service as any, 'calculateRetentionBreakdown').mockResolvedValue({
              byProgram: {},
              byDemographic: {},
              byRiskLevel: {}
            });

            const result = await service.calculateRetentionRate(cohortId, startDate, endDate);

            // Verify mathematical accuracy
            const totalStudents = students.length;
            const retainedCount = students.filter(s => 
              s.status === 'active' || s.status === 'graduated'
            ).length;
            const droppedCount = students.filter(s => s.status === 'dropped').length;
            const transferredCount = students.filter(s => s.status === 'transferred').length;
            const graduatedCount = students.filter(s => s.status === 'graduated').length;

            const expectedRetentionRate = (retainedCount / totalStudents) * 100;
            const expectedDropoutRate = (droppedCount / totalStudents) * 100;
            const expectedTransferRate = (transferredCount / totalStudents) * 100;
            const expectedGraduationRate = (graduatedCount / totalStudents) * 100;

            // Assert mathematical correctness
            expect(result.totalStudents).toBe(totalStudents);
            expect(result.retainedStudents).toBe(retainedCount);
            expect(result.retentionRate).toBeCloseTo(expectedRetentionRate, 2);
            expect(result.dropoutRate).toBeCloseTo(expectedDropoutRate, 2);
            expect(result.transferRate).toBeCloseTo(expectedTransferRate, 2);
            expect(result.graduationRate).toBeCloseTo(expectedGraduationRate, 2);

            // Verify all rates sum to 100% (accounting for rounding)
            const totalRate = result.dropoutRate + result.transferRate + result.graduationRate + 
                            ((result.retainedStudents - graduatedCount) / totalStudents * 100);
            expect(totalRate).toBeCloseTo(100, 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Graduation rate calculation accuracy
     * For any cohort with graduation data, calculated rates should match expected formulas
     * and time-to-degree calculations should be accurate
     */
    it('should calculate graduation rates and time-to-degree accurately', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              studentId: fc.uuid(),
              status: fc.constantFrom('active', 'graduated', 'dropped', 'transferred'),
              enrollmentDate: fc.date({ min: new Date('2018-01-01'), max: new Date('2020-01-01') }),
              graduationDate: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }), { nil: null }),
              programId: fc.constantFrom('theology', 'ministry', 'education', 'business')
            }),
            { minLength: 1, maxLength: 100 }
          ),
          fc.integer({ min: 2, max: 6 }),
          async (students, expectedYears) => {
            // Ensure graduated students have graduation dates
            const processedStudents = students.map(s => ({
              ...s,
              graduationDate: s.status === 'graduated' && !s.graduationDate
                ? new Date(s.enrollmentDate.getTime() + (expectedYears * 365 * 24 * 60 * 60 * 1000))
                : s.graduationDate
            }));

            const cohortId = 'test-cohort';
            jest.spyOn(service as any, 'getCohortStudents').mockResolvedValue(processedStudents);
            jest.spyOn(service as any, 'calculateGraduationBreakdown').mockResolvedValue({
              byProgram: {},
              byCallingArea: {},
              byInitialRiskLevel: {}
            });

            const result = await service.calculateGraduationRate(cohortId, expectedYears);

            // Calculate expected values
            const totalStudents = processedStudents.length;
            const graduated = processedStudents.filter(s => s.status === 'graduated');
            
            const graduatedOnTimeCount = graduated.filter(s => {
              const enrollDate = new Date(s.enrollmentDate);
              const gradDate = s.graduationDate ? new Date(s.graduationDate) : new Date();
              const years = (gradDate.getTime() - enrollDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
              return years <= expectedYears;
            }).length;

            const expectedOnTimeRate = (graduatedOnTimeCount / totalStudents) * 100;
            const expectedOverallRate = (graduated.length / totalStudents) * 100;

            // Assert mathematical correctness
            expect(result.totalStudents).toBe(totalStudents);
            expect(result.graduatedOnTime).toBe(graduatedOnTimeCount);
            expect(result.onTimeGraduationRate).toBeCloseTo(expectedOnTimeRate, 2);
            expect(result.overallGraduationRate).toBeCloseTo(expectedOverallRate, 2);

            // Verify average time to graduation is within reasonable bounds
            if (graduated.length > 0) {
              expect(result.averageTimeToGraduation).toBeGreaterThan(0);
              expect(result.averageTimeToGraduation).toBeLessThan(10); // Reasonable upper bound
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Metrics completeness
     * All calculated metrics should include all relevant data points and breakdowns
     */
    it('should include all relevant data points in metric calculations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              studentId: fc.uuid(),
              status: fc.constantFrom('active', 'graduated', 'dropped', 'transferred'),
              enrollmentDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2023-01-01') }),
              programId: fc.constantFrom('theology', 'ministry', 'education', 'business'),
              demographic: fc.constantFrom('traditional', 'non-traditional', 'international'),
              initialRiskLevel: fc.constantFrom('low', 'moderate', 'high')
            }),
            { minLength: 1, maxLength: 50 }
          ),
          async (students) => {
            const cohortId = 'test-cohort';
            const startDate = new Date('2020-01-01');
            const endDate = new Date('2024-12-31');

            jest.spyOn(service as any, 'getCohortStudents').mockResolvedValue(students);
            jest.spyOn(service as any, 'calculateRetentionBreakdown').mockResolvedValue({
              byProgram: {},
              byDemographic: {},
              byRiskLevel: {}
            });

            const result = await service.calculateRetentionRate(cohortId, startDate, endDate);

            // Verify all required fields are present
            expect(result).toHaveProperty('cohortId');
            expect(result).toHaveProperty('period');
            expect(result).toHaveProperty('totalStudents');
            expect(result).toHaveProperty('retainedStudents');
            expect(result).toHaveProperty('retentionRate');
            expect(result).toHaveProperty('dropoutRate');
            expect(result).toHaveProperty('transferRate');
            expect(result).toHaveProperty('graduationRate');
            expect(result).toHaveProperty('breakdown');

            // Verify breakdown structure
            expect(result.breakdown).toHaveProperty('byProgram');
            expect(result.breakdown).toHaveProperty('byDemographic');
            expect(result.breakdown).toHaveProperty('byRiskLevel');

            // Verify period structure
            expect(result.period).toHaveProperty('startDate');
            expect(result.period).toHaveProperty('endDate');
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Benchmark comparison accuracy
     * Benchmark comparisons should correctly calculate gaps and percentile ranks
     */
    it('should calculate benchmark comparisons accurately', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: 0, max: 100 }),
          fc.float({ min: 50, max: 80 }),
          fc.float({ min: 70, max: 90 }),
          fc.float({ min: 85, max: 95 }),
          async (institutionValue, nationalAvg, christianAvg, topQuartile) => {
            // Create mock metrics
            const metrics: RetentionMetrics = {
              cohortId: 'test',
              period: { startDate: new Date(), endDate: new Date() },
              totalStudents: 100,
              retainedStudents: Math.floor(institutionValue),
              retentionRate: institutionValue,
              dropoutRate: 0,
              transferRate: 0,
              graduationRate: 0,
              breakdown: { byProgram: {}, byDemographic: {}, byRiskLevel: {} }
            };

            // Mock config
            jest.spyOn(service as any, 'studentSuccessConfig', 'get').mockReturnValue({
              benchmarks: {
                retention: {
                  nationalAverage: nationalAvg,
                  christianCollegeAverage: christianAvg,
                  topQuartile: topQuartile
                }
              }
            });

            const result = await service.generateBenchmarkComparison(metrics);

            // Verify gap calculation
            const expectedGap = institutionValue - christianAvg;
            expect(result.gap).toBeCloseTo(expectedGap, 2);

            // Verify percentile rank is within valid range
            expect(result.percentileRank).toBeGreaterThanOrEqual(0);
            expect(result.percentileRank).toBeLessThanOrEqual(100);

            // Verify recommendations are provided
            expect(Array.isArray(result.recommendations)).toBe(true);
            expect(result.recommendations.length).toBeGreaterThan(0);

            // Verify all required fields are present
            expect(result).toHaveProperty('institutionValue');
            expect(result).toHaveProperty('nationalAverage');
            expect(result).toHaveProperty('christianCollegeAverage');
            expect(result).toHaveProperty('topQuartile');
            expect(result).toHaveProperty('percentileRank');
            expect(result).toHaveProperty('gap');
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Empty cohort handling
     * Metrics calculations should handle empty cohorts gracefully
     */
    it('should handle empty cohorts gracefully', async () => {
      const cohortId = 'empty-cohort';
      const startDate = new Date('2020-01-01');
      const endDate = new Date('2024-12-31');

      jest.spyOn(service as any, 'getCohortStudents').mockResolvedValue([]);

      const retentionResult = await service.calculateRetentionRate(cohortId, startDate, endDate);
      const graduationResult = await service.calculateGraduationRate(cohortId, 4);

      // Verify zero values for empty cohort
      expect(retentionResult.totalStudents).toBe(0);
      expect(retentionResult.retentionRate).toBe(0);
      expect(graduationResult.totalStudents).toBe(0);
      expect(graduationResult.onTimeGraduationRate).toBe(0);

      // Verify structure is still complete
      expect(retentionResult).toHaveProperty('breakdown');
      expect(graduationResult).toHaveProperty('breakdown');
    });

    /**
     * Property: Metric consistency
     * Related metrics should maintain logical consistency
     */
    it('should maintain consistency between related metrics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              studentId: fc.uuid(),
              status: fc.constantFrom('active', 'graduated', 'dropped', 'transferred'),
              enrollmentDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2023-01-01') }),
              programId: fc.constantFrom('theology', 'ministry')
            }),
            { minLength: 10, maxLength: 100 }
          ),
          async (students) => {
            const cohortId = 'test-cohort';
            jest.spyOn(service as any, 'getCohortStudents').mockResolvedValue(students);
            jest.spyOn(service as any, 'calculateRetentionBreakdown').mockResolvedValue({
              byProgram: {},
              byDemographic: {},
              byRiskLevel: {}
            });

            const result = await service.calculateRetentionRate(
              cohortId,
              new Date('2020-01-01'),
              new Date('2024-12-31')
            );

            // Verify consistency: retained students should equal total minus dropped and transferred
            const expectedRetained = result.totalStudents - 
              Math.round((result.dropoutRate / 100) * result.totalStudents) -
              Math.round((result.transferRate / 100) * result.totalStudents);

            expect(result.retainedStudents).toBeCloseTo(expectedRetained, 0);

            // Verify all percentages are valid
            expect(result.retentionRate).toBeGreaterThanOrEqual(0);
            expect(result.retentionRate).toBeLessThanOrEqual(100);
            expect(result.dropoutRate).toBeGreaterThanOrEqual(0);
            expect(result.dropoutRate).toBeLessThanOrEqual(100);
            expect(result.transferRate).toBeGreaterThanOrEqual(0);
            expect(result.transferRate).toBeLessThanOrEqual(100);
            expect(result.graduationRate).toBeGreaterThanOrEqual(0);
            expect(result.graduationRate).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
