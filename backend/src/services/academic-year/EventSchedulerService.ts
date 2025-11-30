/**
 * Event Scheduler Service
 * Part of: Scroll University Academic Year Automation System (SU-AYAS)
 * Purpose: Manages academic event scheduling, conflict checking, and deadline tracking
 * 
 * This service handles:
 * - Event scheduling logic
 * - Conflict checking between events
 * - Holiday management
 * - Deadline tracking and notifications
 */

import { createClient } from '@supabase/supabase-js';
import {
  AcademicEvent,
  CreateAcademicEventParams,
  Deadline,
  CreateDeadlineParams,
  CalendarConflict,
  ServiceResponse,
  ValidationResult,
  ConflictDetectionResult
} from '../../types/academic-year.types';

export default class EventSchedulerService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Schedule a new academic event
   * Creates academic event with conflict checking
   * Emits 'event.scheduled' event
   * 
   * @param params - Event creation parameters
   * @returns Created academic event
   */
  async scheduleEvent(params: CreateAcademicEventParams): Promise<ServiceResponse<AcademicEvent>> {
    try {
      // Validate input parameters
      const validation = this.validateEventParams(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check for conflicts with existing events
      const conflictCheck = await this.checkEventConflicts(params);
      if (conflictCheck.hasConflicts) {
        return {
          success: false,
          error: `Event conflicts detected: ${conflictCheck.conflicts.map(c => c.conflictDescription).join(', ')}`
        };
      }

      // Create the event
      const { data, error } = await this.supabase
        .from('academic_events')
        .insert({
          academic_year_id: params.academicYearId,
          semester_id: params.semesterId,
          event_type: params.eventType,
          name: params.name,
          description: params.description,
          start_date: params.startDate.toISOString().split('T')[0],
          end_date: params.endDate?.toISOString().split('T')[0],
          start_time: params.startTime,
          end_time: params.endTime,
          location: params.location,
          is_holiday: params.isHoliday || false,
          affects_classes: params.affectsClasses || false,
          is_recurring: params.isRecurring || false,
          recurrence_pattern: params.recurrencePattern
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: `Failed to schedule event: ${error.message}`
        };
      }

      const event: AcademicEvent = {
        id: data.id,
        academicYearId: data.academic_year_id,
        semesterId: data.semester_id,
        eventType: data.event_type,
        name: data.name,
        description: data.description,
        startDate: new Date(data.start_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        startTime: data.start_time,
        endTime: data.end_time,
        location: data.location,
        isHoliday: data.is_holiday,
        affectsClasses: data.affects_classes,
        isRecurring: data.is_recurring,
        recurrencePattern: data.recurrence_pattern,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by
      };

      // TODO: Emit 'event.scheduled' event via event bus

      return {
        success: true,
        data: event,
        message: 'Event scheduled successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error scheduling event: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create a deadline with notification intervals
   * 
   * @param params - Deadline creation parameters
   * @returns Created deadline
   */
  async createDeadline(params: CreateDeadlineParams): Promise<ServiceResponse<Deadline>> {
    try {
      // Validate input parameters
      const validation = this.validateDeadlineParams(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Default notification intervals: 7 days, 3 days, 1 day, 1 hour before
      const defaultIntervals = [10080, 4320, 1440, 60]; // in minutes

      // Create the deadline
      const { data, error } = await this.supabase
        .from('academic_deadlines')
        .insert({
          academic_year_id: params.academicYearId,
          semester_id: params.semesterId,
          entity_type: params.entityType,
          entity_id: params.entityId,
          deadline_type: params.deadlineType,
          title: params.title,
          description: params.description,
          deadline_date: params.deadlineDate.toISOString().split('T')[0],
          deadline_time: params.deadlineTime,
          notification_intervals: params.notificationIntervals || defaultIntervals,
          is_hard_deadline: params.isHardDeadline !== undefined ? params.isHardDeadline : true,
          grace_period_days: params.gracePeriodDays || 0
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: `Failed to create deadline: ${error.message}`
        };
      }

      const deadline: Deadline = {
        id: data.id,
        academicYearId: data.academic_year_id,
        semesterId: data.semester_id,
        entityType: data.entity_type,
        entityId: data.entity_id,
        deadlineType: data.deadline_type,
        title: data.title,
        description: data.description,
        deadlineDate: new Date(data.deadline_date),
        deadlineTime: data.deadline_time,
        notificationIntervals: data.notification_intervals,
        isHardDeadline: data.is_hard_deadline,
        gracePeriodDays: data.grace_period_days,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by
      };

      return {
        success: true,
        data: deadline,
        message: 'Deadline created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error creating deadline: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Trigger deadline notifications for approaching deadlines
   * Cron job to check approaching deadlines
   * Emits 'deadline.approaching' events
   * 
   * @returns Number of notifications triggered
   */
  async triggerDeadlineNotifications(): Promise<ServiceResponse<number>> {
    try {
      const now = new Date();
      
      // Fetch all active deadlines
      const { data: deadlines, error } = await this.supabase
        .from('academic_deadlines')
        .select('*')
        .gte('deadline_date', now.toISOString().split('T')[0]);

      if (error) {
        return {
          success: false,
          error: `Failed to fetch deadlines: ${error.message}`
        };
      }

      if (!deadlines || deadlines.length === 0) {
        return {
          success: true,
          data: 0,
          message: 'No active deadlines found'
        };
      }

      let notificationCount = 0;

      for (const deadlineData of deadlines) {
        const deadline: Deadline = {
          id: deadlineData.id,
          academicYearId: deadlineData.academic_year_id,
          semesterId: deadlineData.semester_id,
          entityType: deadlineData.entity_type,
          entityId: deadlineData.entity_id,
          deadlineType: deadlineData.deadline_type,
          title: deadlineData.title,
          description: deadlineData.description,
          deadlineDate: new Date(deadlineData.deadline_date),
          deadlineTime: deadlineData.deadline_time,
          notificationIntervals: deadlineData.notification_intervals,
          isHardDeadline: deadlineData.is_hard_deadline,
          gracePeriodDays: deadlineData.grace_period_days,
          createdAt: new Date(deadlineData.created_at),
          updatedAt: new Date(deadlineData.updated_at),
          createdBy: deadlineData.created_by
        };

        // Check if any notification interval matches current time
        const shouldNotify = this.shouldTriggerNotification(deadline, now);
        
        if (shouldNotify) {
          // TODO: Emit 'deadline.approaching' event via event bus
          // For now, we'll log it
          console.log(`Notification triggered for deadline: ${deadline.title}`);
          notificationCount++;
        }
      }

      return {
        success: true,
        data: notificationCount,
        message: `Triggered ${notificationCount} deadline notifications`
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error triggering notifications: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get all holidays for a specific academic year
   * 
   * @param academicYearId - ID of the academic year
   * @returns Array of holiday events
   */
  async getHolidays(academicYearId: string): Promise<ServiceResponse<AcademicEvent[]>> {
    try {
      const { data, error } = await this.supabase
        .from('academic_events')
        .select('*')
        .eq('academic_year_id', academicYearId)
        .eq('is_holiday', true)
        .order('start_date', { ascending: true });

      if (error) {
        return {
          success: false,
          error: `Failed to fetch holidays: ${error.message}`
        };
      }

      const holidays: AcademicEvent[] = data.map(h => ({
        id: h.id,
        academicYearId: h.academic_year_id,
        semesterId: h.semester_id,
        eventType: h.event_type,
        name: h.name,
        description: h.description,
        startDate: new Date(h.start_date),
        endDate: h.end_date ? new Date(h.end_date) : undefined,
        startTime: h.start_time,
        endTime: h.end_time,
        location: h.location,
        isHoliday: h.is_holiday,
        affectsClasses: h.affects_classes,
        isRecurring: h.is_recurring,
        recurrencePattern: h.recurrence_pattern,
        createdAt: new Date(h.created_at),
        updatedAt: new Date(h.updated_at),
        createdBy: h.created_by
      }));

      return {
        success: true,
        data: holidays,
        message: `Found ${holidays.length} holidays`
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error fetching holidays: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get all events for an academic year
   * 
   * @param academicYearId - ID of the academic year
   * @returns Array of academic events
   */
  async getEventsByAcademicYear(academicYearId: string): Promise<ServiceResponse<AcademicEvent[]>> {
    try {
      const { data, error } = await this.supabase
        .from('academic_events')
        .select('*')
        .eq('academic_year_id', academicYearId)
        .order('start_date', { ascending: true });

      if (error) {
        return {
          success: false,
          error: `Failed to fetch events: ${error.message}`
        };
      }

      const events: AcademicEvent[] = data.map(e => ({
        id: e.id,
        academicYearId: e.academic_year_id,
        semesterId: e.semester_id,
        eventType: e.event_type,
        name: e.name,
        description: e.description,
        startDate: new Date(e.start_date),
        endDate: e.end_date ? new Date(e.end_date) : undefined,
        startTime: e.start_time,
        endTime: e.end_time,
        location: e.location,
        isHoliday: e.is_holiday,
        affectsClasses: e.affects_classes,
        isRecurring: e.is_recurring,
        recurrencePattern: e.recurrence_pattern,
        createdAt: new Date(e.created_at),
        updatedAt: new Date(e.updated_at),
        createdBy: e.created_by
      }));

      return {
        success: true,
        data: events,
        message: `Found ${events.length} events`
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error fetching events: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check for event conflicts
   * 
   * @param params - Event parameters to check
   * @returns Conflict detection result
   */
  async checkEventConflicts(params: CreateAcademicEventParams): Promise<ConflictDetectionResult> {
    try {
      const conflicts: CalendarConflict[] = [];

      // Check for overlapping events on the same date
      const { data, error } = await this.supabase
        .from('academic_events')
        .select('*')
        .eq('academic_year_id', params.academicYearId)
        .lte('start_date', params.endDate?.toISOString().split('T')[0] || params.startDate.toISOString().split('T')[0])
        .gte('end_date', params.startDate.toISOString().split('T')[0]);

      if (error) {
        console.error('Error checking event conflicts:', error);
        return {
          hasConflicts: false,
          conflicts: []
        };
      }

      if (data && data.length > 0) {
        for (const existingEvent of data) {
          // Check if events affect classes and overlap
          if (params.affectsClasses && existingEvent.affects_classes) {
            conflicts.push({
              id: '',
              conflictType: 'event_overlap',
              entity1Type: 'event',
              entity1Id: 'new',
              entity2Type: 'event',
              entity2Id: existingEvent.id,
              conflictDescription: `Overlaps with existing event: ${existingEvent.name}`,
              severity: 'medium',
              status: 'detected',
              createdAt: new Date()
            });
          }
        }
      }

      return {
        hasConflicts: conflicts.length > 0,
        conflicts
      };
    } catch (error) {
      console.error('Unexpected error checking event conflicts:', error);
      return {
        hasConflicts: false,
        conflicts: []
      };
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  /**
   * Validate event parameters
   */
  private validateEventParams(params: CreateAcademicEventParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!params.academicYearId) {
      errors.push('Academic year ID is required');
    }

    if (!params.eventType || params.eventType.trim().length === 0) {
      errors.push('Event type is required');
    }

    if (!params.name || params.name.trim().length === 0) {
      errors.push('Event name is required');
    }

    if (!params.startDate) {
      errors.push('Start date is required');
    }

    // Validate date logic
    if (params.startDate && params.endDate && params.startDate > params.endDate) {
      errors.push('Start date must be before or equal to end date');
    }

    // Validate time logic if both provided
    if (params.startTime && params.endTime) {
      const startTime = this.parseTime(params.startTime);
      const endTime = this.parseTime(params.endTime);
      
      if (startTime >= endTime && (!params.endDate || params.startDate.getTime() === params.endDate.getTime())) {
        warnings.push('Start time should be before end time for same-day events');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate deadline parameters
   */
  private validateDeadlineParams(params: CreateDeadlineParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!params.entityType || params.entityType.trim().length === 0) {
      errors.push('Entity type is required');
    }

    if (!params.deadlineType || params.deadlineType.trim().length === 0) {
      errors.push('Deadline type is required');
    }

    if (!params.title || params.title.trim().length === 0) {
      errors.push('Deadline title is required');
    }

    if (!params.deadlineDate) {
      errors.push('Deadline date is required');
    }

    // Validate deadline is in the future
    if (params.deadlineDate && params.deadlineDate < new Date()) {
      warnings.push('Deadline date is in the past');
    }

    // Validate notification intervals
    if (params.notificationIntervals) {
      if (!Array.isArray(params.notificationIntervals)) {
        errors.push('Notification intervals must be an array');
      } else if (params.notificationIntervals.some(interval => interval <= 0)) {
        errors.push('Notification intervals must be positive numbers');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if a notification should be triggered for a deadline
   */
  private shouldTriggerNotification(deadline: Deadline, now: Date): boolean {
    // Combine deadline date and time
    let deadlineDateTime = new Date(deadline.deadlineDate);
    
    if (deadline.deadlineTime) {
      const [hours, minutes] = deadline.deadlineTime.split(':').map(Number);
      deadlineDateTime.setHours(hours, minutes, 0, 0);
    } else {
      // Default to end of day if no time specified
      deadlineDateTime.setHours(23, 59, 59, 999);
    }

    // Calculate time until deadline in minutes
    const minutesUntilDeadline = Math.floor((deadlineDateTime.getTime() - now.getTime()) / (1000 * 60));

    // Check if current time matches any notification interval
    for (const interval of deadline.notificationIntervals) {
      // Allow 5-minute window for notification trigger
      if (Math.abs(minutesUntilDeadline - interval) <= 5) {
        return true;
      }
    }

    return false;
  }

  /**
   * Parse time string to minutes since midnight
   */
  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
