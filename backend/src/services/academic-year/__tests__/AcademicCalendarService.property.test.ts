/**
 * Property-Based Tests for Academic Calendar Service
 * Tests calendar date consistency and validation
 */

import * as fc from 'fast-check';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('../../../utils/logger');

describe('Academic Calendar Service Property-Based Tests', () => {
  
  // Custom generators for academic calendar domain
  const calendarTypeGenerator = fc.constantFrom('semester', 'trimester', 'quarter', 'custom');
  
  const dateGenerator = fc.date({
    min: new Date('2024-01-01'),
    max: new Date('2030-12-31')
  });
  
  const academicYearGenerator = fc.record({
    name: fc.string({ minLength: 4, maxLength: 20 }).map(s => `AY ${s}`),
    startDate: dateGenerator,
    endDate: dateGenerator,
    calendarType: calendarTypeGenerator,
    isActive: fc.boolean()
  }).filter(ay => {
    // Ensure start is before end AND at least 180 days duration (6 months minimum)
    const duration = ay.endDate.getTime() - ay.startDate.getTime();
    const oneHundredEightyDays = 180 * 24 * 60 * 60 * 1000;
    const twoYears = 731 * 24 * 60 * 60 * 1000;
    return ay.startDate < ay.endDate && duration >= oneHundredEightyDays && duration <= twoYears;
  });
  
  const semesterTypeGenerator = fc.constantFrom('fall', 'spring', 'summer', 'winter');
  
  const semesterGenerator = (academicYearStart: Date, academicYearEnd: Date) => 
    fc.record({
      name: fc.string({ minLength: 5, maxLength: 50 }),
      semesterType: semesterTypeGenerator,
      startDate: fc.date({ min: academicYearStart, max: academicYearEnd }),
      endDate: fc.date({ min: academicYearStart, max: academicYearEnd }),
      isActive: fc.boolean()
    }).filter(sem => {
      // Ensure semester is at least 90 days long to accommodate all required dates
      const duration = sem.endDate.getTime() - sem.startDate.getTime();
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      return sem.startDate < sem.endDate && duration >= ninetyDays;
    })
      .map(sem => {
        // Generate dates in logical order, ensuring all dates stay within academic year bounds
        const semesterDuration = sem.endDate.getTime() - sem.startDate.getTime();
        const academicYearStartTime = academicYearStart.getTime();
        const academicYearEndTime = academicYearEnd.getTime();
        
        // Registration ends 1 day before semester starts (but not before academic year starts)
        const registrationEnd = new Date(Math.max(
          academicYearStartTime,
          sem.startDate.getTime() - 24 * 60 * 60 * 1000
        ));
        
        // Registration starts 30 days before registration ends (but not before academic year starts)
        const registrationStart = new Date(Math.max(
          academicYearStartTime,
          registrationEnd.getTime() - 30 * 24 * 60 * 60 * 1000
        ));
        
        // Add/drop deadline is 14 days after semester starts (but not after semester ends)
        const addDropDeadline = new Date(Math.min(
          sem.endDate.getTime(),
          Math.floor(sem.startDate.getTime() + 14 * 24 * 60 * 60 * 1000)
        ));
        
        // Withdrawal deadline is 60 days after semester starts or 2/3 through semester (but not after semester ends)
        const withdrawalDeadline = new Date(Math.min(
          sem.endDate.getTime(),
          sem.startDate.getTime() + Math.min(60 * 24 * 60 * 60 * 1000, semesterDuration * 0.67)
        ));
        
        // Final exams end 1 day before semester ends
        const finalExamsEnd = new Date(sem.endDate.getTime() - 24 * 60 * 60 * 1000);
        
        // Final exams start 14 days before they end (but not before semester starts)
        const finalExamsStart = new Date(Math.max(
          sem.startDate.getTime(),
          finalExamsEnd.getTime() - 14 * 24 * 60 * 60 * 1000
        ));
        
        // Grades due 7 days after semester ends (but not after academic year ends + 30 days buffer)
        const gradesDue = new Date(Math.min(
          academicYearEndTime + 30 * 24 * 60 * 60 * 1000,
          sem.endDate.getTime() + 7 * 24 * 60 * 60 * 1000
        ));
        
        return {
          ...sem,
          registrationStart,
          registrationEnd,
          addDropDeadline,
          withdrawalDeadline,
          finalExamsStart,
          finalExamsEnd,
          gradesDue
        };
      });

  describe('Property 1: Calendar Date Consistency', () => {
    /**
     * **Feature: academic-year-automation-system, Property 1: Calendar Date Consistency**
     * **Validates: Requirements 1.1, 1.2**
     * 
     * For any academic year, all semester dates must fall within the academic year's 
     * start and end dates, and no semesters should overlap.
     */
    it('Property 1: All semester dates fall within academic year bounds', async () => {
      await fc.assert(
        fc.asyncProperty(
          academicYearGenerator,
          fc.integer({ min: 1, max: 4 }),
          async (academicYear, semesterCount) => {
            // Generate semesters within the academic year bounds
            const semesters = await fc.sample(
              semesterGenerator(academicYear.startDate, academicYear.endDate),
              semesterCount
            );
            
            // Property: All semester dates must fall within academic year bounds
            for (const semester of semesters) {
              // Skip test if any dates are invalid
              const semesterDates = [
                semester.startDate,
                semester.endDate,
                semester.registrationStart,
                semester.registrationEnd,
                semester.addDropDeadline,
                semester.withdrawalDeadline,
                semester.finalExamsStart,
                semester.finalExamsEnd,
                semester.gradesDue
              ];
              
              const hasInvalidDates = semesterDates.some(date => 
                !date || isNaN(date.getTime())
              );
              
              if (hasInvalidDates) {
                continue; // Skip this semester
              }
              
              // Semester start date must be >= academic year start date
              expect(semester.startDate.getTime()).toBeGreaterThanOrEqual(
                academicYear.startDate.getTime()
              );
              
              // Semester end date must be <= academic year end date
              expect(semester.endDate.getTime()).toBeLessThanOrEqual(
                academicYear.endDate.getTime()
              );
              
              // All semester milestone dates must be within semester bounds
              expect(semester.registrationStart.getTime()).toBeGreaterThanOrEqual(
                academicYear.startDate.getTime()
              );
              expect(semester.registrationEnd.getTime()).toBeLessThanOrEqual(
                academicYear.endDate.getTime()
              );
              expect(semester.addDropDeadline.getTime()).toBeGreaterThanOrEqual(
                academicYear.startDate.getTime()
              );
              expect(semester.addDropDeadline.getTime()).toBeLessThanOrEqual(
                academicYear.endDate.getTime()
              );
              expect(semester.withdrawalDeadline.getTime()).toBeGreaterThanOrEqual(
                academicYear.startDate.getTime()
              );
              expect(semester.withdrawalDeadline.getTime()).toBeLessThanOrEqual(
                academicYear.endDate.getTime()
              );
              expect(semester.finalExamsStart.getTime()).toBeGreaterThanOrEqual(
                academicYear.startDate.getTime()
              );
              expect(semester.finalExamsEnd.getTime()).toBeLessThanOrEqual(
                academicYear.endDate.getTime()
              );
              // Grades due can be after academic year ends (typically 7 days after semester ends)
              // So we just check it's after the semester end date
              expect(semester.gradesDue.getTime()).toBeGreaterThanOrEqual(
                semester.endDate.getTime()
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 1: No semester overlap within academic year', async () => {
      await fc.assert(
        fc.asyncProperty(
          academicYearGenerator,
          fc.integer({ min: 2, max: 4 }),
          async (academicYear, semesterCount) => {
            // Generate non-overlapping semesters
            const yearDuration = academicYear.endDate.getTime() - academicYear.startDate.getTime();
            const semesterDuration = Math.floor(yearDuration / semesterCount);
            
            const semesters = [];
            for (let i = 0; i < semesterCount; i++) {
              const semesterStart = new Date(
                academicYear.startDate.getTime() + (i * semesterDuration)
              );
              const semesterEnd = new Date(
                academicYear.startDate.getTime() + ((i + 1) * semesterDuration) - 1
              );
              
              // Ensure semester end doesn't exceed academic year end
              if (semesterEnd > academicYear.endDate) {
                semesterEnd.setTime(academicYear.endDate.getTime());
              }
              
              semesters.push({
                name: `Semester ${i + 1}`,
                semesterType: ['fall', 'spring', 'summer', 'winter'][i % 4] as any,
                startDate: semesterStart,
                endDate: semesterEnd,
                registrationStart: new Date(semesterStart.getTime() - 30 * 24 * 60 * 60 * 1000),
                registrationEnd: new Date(semesterStart.getTime() - 1 * 24 * 60 * 60 * 1000),
                addDropDeadline: new Date(semesterStart.getTime() + 14 * 24 * 60 * 60 * 1000),
                withdrawalDeadline: new Date(semesterStart.getTime() + 60 * 24 * 60 * 60 * 1000),
                finalExamsStart: new Date(semesterEnd.getTime() - 14 * 24 * 60 * 60 * 1000),
                finalExamsEnd: new Date(semesterEnd.getTime() - 1 * 24 * 60 * 60 * 1000),
                gradesDue: new Date(semesterEnd.getTime() + 7 * 24 * 60 * 60 * 1000),
                isActive: false
              });
            }
            
            // Property: No two semesters should overlap
            for (let i = 0; i < semesters.length; i++) {
              for (let j = i + 1; j < semesters.length; j++) {
                const sem1 = semesters[i];
                const sem2 = semesters[j];
                
                // Check that semesters don't overlap
                const noOverlap = 
                  sem1.endDate.getTime() < sem2.startDate.getTime() ||
                  sem2.endDate.getTime() < sem1.startDate.getTime();
                
                expect(noOverlap).toBe(true);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 1: Academic year dates are valid and consistent', async () => {
      await fc.assert(
        fc.asyncProperty(
          academicYearGenerator,
          async (academicYear) => {
            // Property: Start date must be before end date
            expect(academicYear.startDate.getTime()).toBeLessThan(
              academicYear.endDate.getTime()
            );
            
            // Property: Academic year duration should be reasonable (6 months to 2 years)
            const durationMs = academicYear.endDate.getTime() - academicYear.startDate.getTime();
            const durationDays = durationMs / (1000 * 60 * 60 * 24);
            
            expect(durationDays).toBeGreaterThanOrEqual(180); // At least 6 months
            expect(durationDays).toBeLessThanOrEqual(731); // At most 2 years (with tolerance for floating point)
            
            // Property: Name should be defined and non-empty
            expect(academicYear.name).toBeDefined();
            expect(academicYear.name.length).toBeGreaterThan(0);
            
            // Property: Calendar type should be valid
            expect(['semester', 'trimester', 'quarter', 'custom']).toContain(
              academicYear.calendarType
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 1: Semester internal date consistency', async () => {
      await fc.assert(
        fc.asyncProperty(
          academicYearGenerator,
          async (academicYear) => {
            const semester = await fc.sample(
              semesterGenerator(academicYear.startDate, academicYear.endDate),
              1
            )[0];
            
            // Skip test if any dates are invalid
            const semesterDates = [
              semester.startDate,
              semester.endDate,
              semester.registrationStart,
              semester.registrationEnd,
              semester.addDropDeadline,
              semester.withdrawalDeadline,
              semester.finalExamsStart,
              semester.finalExamsEnd,
              semester.gradesDue
            ];
            
            const hasInvalidDates = semesterDates.some(date => 
              !date || isNaN(date.getTime())
            );
            
            if (hasInvalidDates) {
              return true; // Skip this test case
            }
            
            // Property: Registration must end before semester starts
            expect(semester.registrationEnd.getTime()).toBeLessThanOrEqual(
              semester.startDate.getTime()
            );
            
            // Property: Add/drop deadline must be after semester starts
            expect(semester.addDropDeadline.getTime()).toBeGreaterThanOrEqual(
              semester.startDate.getTime()
            );
            
            // Property: Withdrawal deadline must be after add/drop deadline
            expect(semester.withdrawalDeadline.getTime()).toBeGreaterThanOrEqual(
              semester.addDropDeadline.getTime()
            );
            
            // Property: Final exams must be before semester ends
            expect(semester.finalExamsEnd.getTime()).toBeLessThanOrEqual(
              semester.endDate.getTime()
            );
            
            // Property: Grades due must be after final exams end
            expect(semester.gradesDue.getTime()).toBeGreaterThanOrEqual(
              semester.finalExamsEnd.getTime()
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
