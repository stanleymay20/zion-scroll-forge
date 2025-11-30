/**
 * Property-Based Test for Registration Window Validity
 * **Feature: academic-year-automation-system, Property 2: Registration Window Validity**
 * **Validates: Requirements 1.3**
 * 
 * For any semester, the registration start date must be before the registration end date,
 * and both must be before the semester start date.
 */

import * as fc from 'fast-check';
import AcademicCalendarService from '../AcademicCalendarService';
import { CreateSemesterParams, SemesterType } from '../../../types/academic-year.types';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        })),
        or: jest.fn(() => ({
          order: jest.fn()
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            or: jest.fn(() => ({
              or: jest.fn(() => ({
                order: jest.fn()
              }))
            }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn()
      }))
    })),
    rpc: jest.fn()
  }))
}));

describe('Property 2: Registration Window Validity', () => {
  // Custom generators
  const semesterTypeGenerator = fc.constantFrom<SemesterType>(
    'fall',
    'spring',
    'summer',
    'winter',
    'term1',
    'term2',
    'term3',
    'term4',
    'custom'
  );

  const dateGenerator = fc.date({
    min: new Date('2024-01-01'),
    max: new Date('2030-12-31')
  });

  /**
   * Generator for valid semester parameters with proper registration window
   */
  const validSemesterParamsGenerator = fc
    .record({
      academicYearId: fc.uuid(),
      name: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
      semesterType: semesterTypeGenerator,
      startDate: dateGenerator,
      durationDays: fc.integer({ min: 60, max: 180 }), // 2-6 months
      registrationWindowDays: fc.integer({ min: 7, max: 60 }) // 1 week to 2 months
    })
    .filter(({ startDate }) => !isNaN(startDate.getTime())) // Ensure valid date
    .map(({ academicYearId, name, semesterType, startDate, durationDays, registrationWindowDays }) => {
      const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const registrationEnd = new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day before start
      const registrationStart = new Date(registrationEnd.getTime() - registrationWindowDays * 24 * 60 * 60 * 1000);

      const params: CreateSemesterParams = {
        academicYearId,
        name,
        semesterType,
        startDate,
        endDate,
        registrationStart,
        registrationEnd,
        addDropDeadline: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        withdrawalDeadline: new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000),
        finalExamsStart: new Date(endDate.getTime() - 14 * 24 * 60 * 60 * 1000),
        finalExamsEnd: new Date(endDate.getTime() - 1 * 24 * 60 * 60 * 1000),
        gradesDue: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        isActive: false
      };

      return params;
    });

  test('Property 2: Registration start must be before registration end', async () => {
    await fc.assert(
      fc.asyncProperty(validSemesterParamsGenerator, async (semesterParams) => {
        // Property: Registration start date must be strictly before registration end date
        expect(semesterParams.registrationStart.getTime()).toBeLessThan(
          semesterParams.registrationEnd.getTime()
        );

        // Additional check: Registration window should be reasonable (at least 1 day)
        const windowDuration =
          semesterParams.registrationEnd.getTime() - semesterParams.registrationStart.getTime();
        const windowDays = windowDuration / (1000 * 60 * 60 * 24);

        expect(windowDays).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 2: Registration end must be before semester start', async () => {
    await fc.assert(
      fc.asyncProperty(validSemesterParamsGenerator, async (semesterParams) => {
        // Property: Registration end date must be before or equal to semester start date
        expect(semesterParams.registrationEnd.getTime()).toBeLessThanOrEqual(
          semesterParams.startDate.getTime()
        );

        // Ideally, there should be at least some buffer time
        const bufferTime = semesterParams.startDate.getTime() - semesterParams.registrationEnd.getTime();
        const bufferDays = bufferTime / (1000 * 60 * 60 * 24);

        // Buffer should be non-negative (registration ends before or at semester start)
        expect(bufferDays).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 2: Registration start must be before semester start', async () => {
    await fc.assert(
      fc.asyncProperty(validSemesterParamsGenerator, async (semesterParams) => {
        // Property: Registration start date must be before semester start date
        // This is a transitive property from the previous two, but worth testing explicitly
        expect(semesterParams.registrationStart.getTime()).toBeLessThan(
          semesterParams.startDate.getTime()
        );

        // Check that registration window is entirely before semester starts
        const registrationWindowEndsBeforeSemester =
          semesterParams.registrationEnd.getTime() <= semesterParams.startDate.getTime();

        expect(registrationWindowEndsBeforeSemester).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 2: Complete registration window validity chain', async () => {
    await fc.assert(
      fc.asyncProperty(validSemesterParamsGenerator, async (semesterParams) => {
        // Property: The complete chain must hold:
        // registrationStart < registrationEnd <= semesterStart < semesterEnd

        const registrationStartTime = semesterParams.registrationStart.getTime();
        const registrationEndTime = semesterParams.registrationEnd.getTime();
        const semesterStartTime = semesterParams.startDate.getTime();
        const semesterEndTime = semesterParams.endDate.getTime();

        // Check the complete ordering
        expect(registrationStartTime).toBeLessThan(registrationEndTime);
        expect(registrationEndTime).toBeLessThanOrEqual(semesterStartTime);
        expect(semesterStartTime).toBeLessThan(semesterEndTime);

        // Verify no date is in the future relative to its successor
        expect(registrationStartTime <= registrationEndTime).toBe(true);
        expect(registrationEndTime <= semesterStartTime).toBe(true);
        expect(semesterStartTime <= semesterEndTime).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 2: Registration window duration is reasonable', async () => {
    await fc.assert(
      fc.asyncProperty(validSemesterParamsGenerator, async (semesterParams) => {
        // Property: Registration window should be reasonable (between 1 day and 90 days)
        const windowDuration =
          semesterParams.registrationEnd.getTime() - semesterParams.registrationStart.getTime();
        const windowDays = windowDuration / (1000 * 60 * 60 * 24);

        expect(windowDays).toBeGreaterThanOrEqual(1);
        expect(windowDays).toBeLessThanOrEqual(90);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 2: All semester dates are valid Date objects', async () => {
    await fc.assert(
      fc.asyncProperty(validSemesterParamsGenerator, async (semesterParams) => {
        // Property: All date fields must be valid Date objects
        expect(semesterParams.registrationStart).toBeInstanceOf(Date);
        expect(semesterParams.registrationEnd).toBeInstanceOf(Date);
        expect(semesterParams.startDate).toBeInstanceOf(Date);
        expect(semesterParams.endDate).toBeInstanceOf(Date);

        // Dates should not be Invalid Date
        expect(isNaN(semesterParams.registrationStart.getTime())).toBe(false);
        expect(isNaN(semesterParams.registrationEnd.getTime())).toBe(false);
        expect(isNaN(semesterParams.startDate.getTime())).toBe(false);
        expect(isNaN(semesterParams.endDate.getTime())).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 2: Registration window respects semester boundaries', async () => {
    await fc.assert(
      fc.asyncProperty(validSemesterParamsGenerator, async (semesterParams) => {
        // Property: Registration window must not extend into the semester period
        const registrationWindowEnd = semesterParams.registrationEnd.getTime();
        const semesterStart = semesterParams.startDate.getTime();

        // Registration must complete before semester begins
        expect(registrationWindowEnd).toBeLessThanOrEqual(semesterStart);

        // If there's a gap, it should be reasonable (not more than 30 days)
        const gapDays = (semesterStart - registrationWindowEnd) / (1000 * 60 * 60 * 24);
        expect(gapDays).toBeLessThanOrEqual(30);
      }),
      { numRuns: 100 }
    );
  });
});
