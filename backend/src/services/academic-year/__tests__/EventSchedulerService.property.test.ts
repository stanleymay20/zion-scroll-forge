/**
 * Property-Based Tests for EventSchedulerService
 * Feature: academic-year-automation-system
 * 
 * Tests correctness properties for event scheduling and deadline notifications
 */

import * as fc from 'fast-check';
import EventSchedulerService from '../EventSchedulerService';
import { CreateAcademicEventParams, CreateDeadlineParams, Deadline } from '../../../types/academic-year.types';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn()
          })),
          order: jest.fn(),
          lte: jest.fn(() => ({
            gte: jest.fn()
          }))
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            or: jest.fn(() => ({
              or: jest.fn(() => ({
                order: jest.fn()
              }))
            }))
          }))
        })),
        lte: jest.fn(() => ({
          gte: jest.fn()
        }))
      }))
    }))
  }))
}));

describe('EventSchedulerService - Property-Based Tests', () => {
  let service: EventSchedulerService;

  beforeEach(() => {
    service = new EventSchedulerService();
    jest.clearAllMocks();
  });

  /**
   * Property 3: Deadline Notification Timeliness
   * Feature: academic-year-automation-system, Property 3: Deadline Notification Timeliness
   * Validates: Requirements 1.4
   * 
   * For any deadline, notifications must be sent at configured intervals before the deadline,
   * and no notification should be sent after the deadline has passed.
   */
  describe('Property 3: Deadline Notification Timeliness', () => {
    // Arbitrary for generating valid deadlines
    const deadlineArbitrary = fc.record({
      id: fc.uuid(),
      academicYearId: fc.uuid(),
      semesterId: fc.option(fc.uuid(), { nil: undefined }),
      entityType: fc.constantFrom('student', 'faculty', 'admin', 'all'),
      entityId: fc.option(fc.uuid(), { nil: undefined }),
      deadlineType: fc.constantFrom('registration', 'payment', 'assignment', 'exam', 'withdrawal'),
      title: fc.string({ minLength: 5, maxLength: 100 }),
      description: fc.option(fc.string({ minLength: 10, maxLength: 500 }), { nil: undefined }),
      deadlineDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
      deadlineTime: fc.option(
        fc.tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
          .map(([h, m]) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`),
        { nil: undefined }
      ),
      notificationIntervals: fc.array(fc.integer({ min: 60, max: 10080 }), { minLength: 1, maxLength: 5 }),
      isHardDeadline: fc.boolean(),
      gracePeriodDays: fc.integer({ min: 0, max: 7 }),
      createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
      updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
      createdBy: fc.option(fc.uuid(), { nil: undefined })
    }).filter(d => {
      // Ensure deadlineDate is valid
      return !isNaN(d.deadlineDate.getTime()) && 
             !isNaN(d.createdAt.getTime()) && 
             !isNaN(d.updatedAt.getTime());
    });

    it('should never trigger notifications after the deadline has passed', () => {
      fc.assert(
        fc.property(deadlineArbitrary, (deadline) => {
          // Create a time that is after the deadline
          const deadlineDateTime = new Date(deadline.deadlineDate);
          if (deadline.deadlineTime) {
            const [hours, minutes] = deadline.deadlineTime.split(':').map(Number);
            deadlineDateTime.setHours(hours, minutes, 0, 0);
          } else {
            deadlineDateTime.setHours(23, 59, 59, 999);
          }

          // Test with a time 1 day after the deadline
          const afterDeadline = new Date(deadlineDateTime.getTime() + 24 * 60 * 60 * 1000);

          // Use private method via type assertion for testing
          const shouldNotify = (service as any).shouldTriggerNotification(deadline, afterDeadline);

          // Property: No notification should be triggered after deadline
          expect(shouldNotify).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should trigger notifications at configured intervals before deadline', () => {
      fc.assert(
        fc.property(deadlineArbitrary, (deadline) => {
          // For each notification interval, check if notification is triggered
          const deadlineDateTime = new Date(deadline.deadlineDate);
          if (deadline.deadlineTime) {
            const [hours, minutes] = deadline.deadlineTime.split(':').map(Number);
            deadlineDateTime.setHours(hours, minutes, 0, 0);
          } else {
            deadlineDateTime.setHours(23, 59, 59, 999);
          }

          // Test each notification interval
          for (const intervalMinutes of deadline.notificationIntervals) {
            // Calculate the exact time when notification should trigger
            const notificationTime = new Date(deadlineDateTime.getTime() - intervalMinutes * 60 * 1000);

            // Test at the exact notification time
            const shouldNotify = (service as any).shouldTriggerNotification(deadline, notificationTime);

            // Property: Notification should be triggered at configured interval
            expect(shouldNotify).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should not trigger notifications outside configured intervals', () => {
      fc.assert(
        fc.property(
          deadlineArbitrary,
          fc.integer({ min: 10, max: 20000 }), // Random time offset in minutes
          (deadline, randomOffset) => {
            const deadlineDateTime = new Date(deadline.deadlineDate);
            if (deadline.deadlineTime) {
              const [hours, minutes] = deadline.deadlineTime.split(':').map(Number);
              deadlineDateTime.setHours(hours, minutes, 0, 0);
            } else {
              deadlineDateTime.setHours(23, 59, 59, 999);
            }

            // Ensure randomOffset is not within 5 minutes of any configured interval
            const isNearInterval = deadline.notificationIntervals.some(
              interval => Math.abs(randomOffset - interval) <= 5
            );

            // Skip this test case if randomOffset is near a configured interval
            fc.pre(!isNearInterval);

            // Calculate a time that is NOT at a notification interval
            const testTime = new Date(deadlineDateTime.getTime() - randomOffset * 60 * 1000);

            const shouldNotify = (service as any).shouldTriggerNotification(deadline, testTime);

            // Property: No notification should be triggered outside configured intervals
            expect(shouldNotify).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle deadlines with multiple notification intervals correctly', () => {
      fc.assert(
        fc.property(
          deadlineArbitrary.chain(baseDeadline => 
            fc.array(
              fc.integer({ min: 60, max: 10080 }), // 1 hour to 7 days in minutes
              { minLength: 2, maxLength: 5 }
            ).map(intervals => {
              // Ensure intervals are unique and sorted
              const uniqueIntervals = Array.from(new Set(intervals)).sort((a, b) => b - a);
              return {
                ...baseDeadline,
                notificationIntervals: uniqueIntervals
              };
            })
          ),
          (deadline) => {
            const deadlineDateTime = new Date(deadline.deadlineDate);
            if (deadline.deadlineTime) {
              const [hours, minutes] = deadline.deadlineTime.split(':').map(Number);
              deadlineDateTime.setHours(hours, minutes, 0, 0);
            } else {
              deadlineDateTime.setHours(23, 59, 59, 999);
            }

            let notificationCount = 0;

            // Test each interval
            for (const intervalMinutes of deadline.notificationIntervals) {
              const notificationTime = new Date(deadlineDateTime.getTime() - intervalMinutes * 60 * 1000);
              const shouldNotify = (service as any).shouldTriggerNotification(deadline, notificationTime);

              if (shouldNotify) {
                notificationCount++;
              }
            }

            // Property: All configured intervals should trigger notifications
            expect(notificationCount).toBe(deadline.notificationIntervals.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect the 5-minute notification window', () => {
      fc.assert(
        fc.property(
          deadlineArbitrary,
          fc.integer({ min: -5, max: 5 }), // Offset within the 5-minute window
          (deadline, minuteOffset) => {
            // Ensure deadline date is valid and notificationIntervals exists
            fc.pre(!isNaN(deadline.deadlineDate.getTime()) && 
                   deadline.notificationIntervals && 
                   deadline.notificationIntervals.length > 0);

            const deadlineDateTime = new Date(deadline.deadlineDate);
            if (deadline.deadlineTime) {
              const [hours, minutes] = deadline.deadlineTime.split(':').map(Number);
              deadlineDateTime.setHours(hours, minutes, 0, 0);
            } else {
              deadlineDateTime.setHours(23, 59, 59, 999);
            }

            // Pick the first notification interval
            const intervalMinutes = deadline.notificationIntervals[0];

            // Calculate time within the 5-minute window
            const testTime = new Date(
              deadlineDateTime.getTime() - (intervalMinutes + minuteOffset) * 60 * 1000
            );

            const shouldNotify = (service as any).shouldTriggerNotification(deadline, testTime);

            // Property: Notification should trigger within 5-minute window
            expect(shouldNotify).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle deadlines without specific time (end of day default)', () => {
      fc.assert(
        fc.property(
          deadlineArbitrary.map(deadline => ({
            ...deadline,
            deadlineTime: undefined
          })),
          (deadline) => {
            // Ensure notificationIntervals exists and has at least one element
            fc.pre(deadline.notificationIntervals && deadline.notificationIntervals.length > 0);

            // When no time is specified, deadline should default to end of day
            const deadlineDateTime = new Date(deadline.deadlineDate);
            deadlineDateTime.setHours(23, 59, 59, 999);

            // Test at first notification interval
            const intervalMinutes = deadline.notificationIntervals[0];
            const notificationTime = new Date(deadlineDateTime.getTime() - intervalMinutes * 60 * 1000);

            const shouldNotify = (service as any).shouldTriggerNotification(deadline, notificationTime);

            // Property: Notification should still work with default end-of-day time
            expect(shouldNotify).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property tests for event scheduling
   */
  describe('Event Scheduling Properties', () => {
    const eventParamsArbitrary = fc.record({
      academicYearId: fc.uuid(),
      semesterId: fc.option(fc.uuid(), { nil: undefined }),
      eventType: fc.constantFrom('holiday', 'exam', 'break', 'orientation', 'graduation'),
      name: fc.string({ minLength: 5, maxLength: 100 }),
      description: fc.option(fc.string({ minLength: 10, maxLength: 500 }), { nil: undefined }),
      startDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
      endDate: fc.option(fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }), { nil: undefined }),
      startTime: fc.option(
        fc.tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
          .map(([h, m]) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`),
        { nil: undefined }
      ),
      endTime: fc.option(
        fc.tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
          .map(([h, m]) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`),
        { nil: undefined }
      ),
      location: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
      isHoliday: fc.boolean(),
      affectsClasses: fc.boolean(),
      isRecurring: fc.boolean(),
      recurrencePattern: fc.option(fc.object(), { nil: undefined })
    });

    it('should reject events where start date is after end date', () => {
      fc.assert(
        fc.property(
          eventParamsArbitrary.filter(params => 
            params.endDate !== undefined && params.startDate > params.endDate
          ),
          (params) => {
            const validation = (service as any).validateEventParams(params);

            // Property: Invalid date range should fail validation
            expect(validation.isValid).toBe(false);
            expect(validation.errors.some((e: string) => e.includes('before'))).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should accept events with valid date ranges', () => {
      fc.assert(
        fc.property(
          eventParamsArbitrary.filter(params => 
            params.endDate === undefined || params.startDate <= params.endDate
          ),
          (params) => {
            const validation = (service as any).validateEventParams(params);

            // Property: Valid date range should pass validation (or have other errors)
            const hasDateError = validation.errors.some((e: string) => 
              e.includes('before') || e.includes('after')
            );
            expect(hasDateError).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
