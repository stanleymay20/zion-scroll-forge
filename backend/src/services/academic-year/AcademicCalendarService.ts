/**
 * Academic Calendar Service
 * Part of: Scroll University Academic Year Automation System (SU-AYAS)
 * Purpose: Manages all time-based academic events with zero hardcoded dates
 * 
 * This service handles:
 * - Academic year creation and management
 * - Semester schedule generation
 * - Calendar type support (semester/trimester/quarter/custom)
 * - Conflict detection and resolution
 * - Deadline tracking
 */

import { createClient } from '@supabase/supabase-js';
import {
  AcademicYear,
  CreateAcademicYearParams,
  Semester,
  CreateSemesterParams,
  CalendarType,
  SemesterType,
  Deadline,
  CalendarConflict,
  ServiceResponse,
  ValidationResult,
  ConflictDetectionResult
} from '../../types/academic-year.types';

export default class AcademicCalendarService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new academic year with configurable calendar type
   * Validates no conflicts with existing calendars
   * Emits 'academic_year.created' event
   * 
   * @param params - Academic year creation parameters
   * @returns Created academic year
   */
  async createAcademicYear(params: CreateAcademicYearParams): Promise<ServiceResponse<AcademicYear>> {
    try {
      // Validate input parameters
      const validation = this.validateAcademicYearParams(params);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check for conflicts with existing academic years
      const conflictCheck = await this.checkAcademicYearConflicts(params);
      if (conflictCheck.hasConflicts) {
        return {
          success: false,
          error: `Conflicts detected: ${conflictCheck.conflicts.map(c => c.conflictDescription).join(', ')}`
        };
      }

      // If setting as active, deactivate other active years
      if (params.isActive) {
        await this.supabase
          .from('academic_years')
          .update({ is_active: false })
          .eq('is_active', true);
      }

      // Create the academic year
      const { data, error } = await this.supabase
        .from('academic_years')
        .insert({
          name: params.name,
          start_date: params.startDate.toISOString().split('T')[0],
          end_date: params.endDate.toISOString().split('T')[0],
          calendar_type: params.calendarType,
          is_active: params.isActive || false
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: `Failed to create academic year: ${error.message}`
        };
      }

      const academicYear: AcademicYear = {
        id: data.id,
        name: data.name,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        calendarType: data.calendar_type,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by
      };

      // TODO: Emit 'academic_year.created' event via event bus

      return {
        success: true,
        data: academicYear,
        message: 'Academic year created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error creating academic year: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generate semester schedule based on calendar type
   * Creates semester structure (semester/trimester/quarter/custom)
   * Generates all key dates automatically
   * Emits 'semester.created' events
   * 
   * @param academicYearId - ID of the academic year
   * @param calendarType - Type of calendar system
   * @returns Array of created semesters
   */
  async generateSemesterSchedule(
    academicYearId: string,
    calendarType: CalendarType
  ): Promise<ServiceResponse<Semester[]>> {
    try {
      // Fetch the academic year
      const { data: academicYearData, error: fetchError } = await this.supabase
        .from('academic_years')
        .select('*')
        .eq('id', academicYearId)
        .single();

      if (fetchError || !academicYearData) {
        return {
          success: false,
          error: 'Academic year not found'
        };
      }

      const academicYear: AcademicYear = {
        id: academicYearData.id,
        name: academicYearData.name,
        startDate: new Date(academicYearData.start_date),
        endDate: new Date(academicYearData.end_date),
        calendarType: academicYearData.calendar_type,
        isActive: academicYearData.is_active,
        createdAt: new Date(academicYearData.created_at),
        updatedAt: new Date(academicYearData.updated_at),
        createdBy: academicYearData.created_by
      };

      // Generate semester parameters based on calendar type
      const semesterParams = this.generateSemesterParams(academicYear, calendarType);

      // Create semesters in database
      const createdSemesters: Semester[] = [];
      for (const params of semesterParams) {
        const { data, error } = await this.supabase
          .from('semesters')
          .insert({
            academic_year_id: params.academicYearId,
            name: params.name,
            semester_type: params.semesterType,
            start_date: params.startDate.toISOString().split('T')[0],
            end_date: params.endDate.toISOString().split('T')[0],
            registration_start: params.registrationStart.toISOString().split('T')[0],
            registration_end: params.registrationEnd.toISOString().split('T')[0],
            add_drop_deadline: params.addDropDeadline.toISOString().split('T')[0],
            withdrawal_deadline: params.withdrawalDeadline.toISOString().split('T')[0],
            final_exams_start: params.finalExamsStart.toISOString().split('T')[0],
            final_exams_end: params.finalExamsEnd.toISOString().split('T')[0],
            grades_due: params.gradesDue.toISOString().split('T')[0],
            is_active: params.isActive || false
          })
          .select()
          .single();

        if (error) {
          console.error(`Failed to create semester ${params.name}:`, error);
          continue;
        }

        const semester: Semester = {
          id: data.id,
          academicYearId: data.academic_year_id,
          name: data.name,
          semesterType: data.semester_type,
          startDate: new Date(data.start_date),
          endDate: new Date(data.end_date),
          registrationStart: new Date(data.registration_start),
          registrationEnd: new Date(data.registration_end),
          addDropDeadline: new Date(data.add_drop_deadline),
          withdrawalDeadline: new Date(data.withdrawal_deadline),
          finalExamsStart: new Date(data.final_exams_start),
          finalExamsEnd: new Date(data.final_exams_end),
          gradesDue: new Date(data.grades_due),
          isActive: data.is_active,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };

        createdSemesters.push(semester);

        // TODO: Emit 'semester.created' event via event bus
      }

      return {
        success: true,
        data: createdSemesters,
        message: `Generated ${createdSemesters.length} semesters for ${calendarType} calendar`
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error generating semester schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get upcoming deadlines for a specific entity
   * Query deadlines for specific entity
   * Return sorted by urgency
   * 
   * @param entityType - Type of entity (student, faculty, admin, all)
   * @param entityId - ID of the entity
   * @param daysAhead - Number of days to look ahead (default: 30)
   * @returns Array of upcoming deadlines
   */
  async getUpcomingDeadlines(
    entityType: string,
    entityId: string,
    daysAhead: number = 30
  ): Promise<ServiceResponse<Deadline[]>> {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysAhead);

      const { data, error } = await this.supabase
        .from('academic_deadlines')
        .select('*')
        .gte('deadline_date', today.toISOString().split('T')[0])
        .lte('deadline_date', futureDate.toISOString().split('T')[0])
        .or(`entity_type.eq.${entityType},entity_type.eq.all`)
        .or(`entity_id.eq.${entityId},entity_id.is.null`)
        .order('deadline_date', { ascending: true });

      if (error) {
        return {
          success: false,
          error: `Failed to fetch deadlines: ${error.message}`
        };
      }

      const deadlines: Deadline[] = data.map(d => ({
        id: d.id,
        academicYearId: d.academic_year_id,
        semesterId: d.semester_id,
        entityType: d.entity_type,
        entityId: d.entity_id,
        deadlineType: d.deadline_type,
        title: d.title,
        description: d.description,
        deadlineDate: new Date(d.deadline_date),
        deadlineTime: d.deadline_time,
        notificationIntervals: d.notification_intervals,
        isHardDeadline: d.is_hard_deadline,
        gracePeriodDays: d.grace_period_days,
        createdAt: new Date(d.created_at),
        updatedAt: new Date(d.updated_at),
        createdBy: d.created_by
      }));

      return {
        success: true,
        data: deadlines,
        message: `Found ${deadlines.length} upcoming deadlines`
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error fetching deadlines: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get all academic years
   * 
   * @returns Array of all academic years
   */
  async getAllAcademicYears(): Promise<ServiceResponse<AcademicYear[]>> {
    try {
      const { data, error } = await this.supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        return {
          success: false,
          error: `Failed to fetch academic years: ${error.message}`
        };
      }

      const academicYears: AcademicYear[] = data.map(ay => ({
        id: ay.id,
        name: ay.name,
        startDate: new Date(ay.start_date),
        endDate: new Date(ay.end_date),
        calendarType: ay.calendar_type,
        isActive: ay.is_active,
        createdAt: new Date(ay.created_at),
        updatedAt: new Date(ay.updated_at),
        createdBy: ay.created_by
      }));

      return {
        success: true,
        data: academicYears,
        message: `Found ${academicYears.length} academic years`
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error fetching academic years: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get academic year by ID
   * 
   * @param id - Academic year ID
   * @returns Academic year details
   */
  async getAcademicYearById(id: string): Promise<ServiceResponse<AcademicYear>> {
    try {
      const { data, error } = await this.supabase
        .from('academic_years')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'Academic year not found'
        };
      }

      const academicYear: AcademicYear = {
        id: data.id,
        name: data.name,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        calendarType: data.calendar_type,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by
      };

      return {
        success: true,
        data: academicYear,
        message: 'Academic year retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error fetching academic year: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get all semesters for an academic year
   * 
   * @param academicYearId - ID of the academic year
   * @returns Array of semesters
   */
  async getSemestersByAcademicYear(academicYearId: string): Promise<ServiceResponse<Semester[]>> {
    try {
      const { data, error } = await this.supabase
        .from('semesters')
        .select('*')
        .eq('academic_year_id', academicYearId)
        .order('start_date', { ascending: true });

      if (error) {
        return {
          success: false,
          error: `Failed to fetch semesters: ${error.message}`
        };
      }

      const semesters: Semester[] = data.map(s => ({
        id: s.id,
        academicYearId: s.academic_year_id,
        name: s.name,
        semesterType: s.semester_type,
        startDate: new Date(s.start_date),
        endDate: new Date(s.end_date),
        registrationStart: new Date(s.registration_start),
        registrationEnd: new Date(s.registration_end),
        addDropDeadline: new Date(s.add_drop_deadline),
        withdrawalDeadline: new Date(s.withdrawal_deadline),
        finalExamsStart: new Date(s.final_exams_start),
        finalExamsEnd: new Date(s.final_exams_end),
        gradesDue: new Date(s.grades_due),
        isActive: s.is_active,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at)
      }));

      return {
        success: true,
        data: semesters,
        message: `Found ${semesters.length} semesters`
      };
    } catch (error) {
      return {
        success: false,
        error: `Unexpected error fetching semesters: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Detect conflicts in calendar dates
   * 
   * @param semesterId - ID of semester to check
   * @returns Conflict detection result
   */
  async detectConflicts(semesterId: string): Promise<ConflictDetectionResult> {
    try {
      const { data, error } = await this.supabase
        .rpc('detect_semester_conflicts', { p_semester_id: semesterId });

      if (error) {
        console.error('Error detecting conflicts:', error);
        return {
          hasConflicts: false,
          conflicts: []
        };
      }

      const conflicts: CalendarConflict[] = data.map((c: any) => ({
        id: '',
        conflictType: 'semester_conflict',
        entity1Type: 'semester',
        entity1Id: semesterId,
        entity2Type: 'semester',
        entity2Id: semesterId,
        conflictDescription: c.conflict_description,
        severity: c.severity,
        status: 'detected',
        createdAt: new Date()
      }));

      return {
        hasConflicts: conflicts.length > 0,
        conflicts
      };
    } catch (error) {
      console.error('Unexpected error detecting conflicts:', error);
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
   * Validate academic year parameters
   */
  private validateAcademicYearParams(params: CreateAcademicYearParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate name
    if (!params.name || params.name.trim().length === 0) {
      errors.push('Academic year name is required');
    }

    // Validate dates
    if (!params.startDate || !params.endDate) {
      errors.push('Start date and end date are required');
    } else if (params.startDate >= params.endDate) {
      errors.push('Start date must be before end date');
    } else {
      // Check duration is reasonable (90 days minimum to 2 years)
      const durationMs = params.endDate.getTime() - params.startDate.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);

      // Enforce minimum 90-day duration
      if (durationDays < 90) {
        errors.push('Academic year duration must be at least 90 days');
      } else if (durationDays < 180) {
        warnings.push('Academic year duration is less than 6 months');
      }
      // Use >= to handle floating point precision issues
      if (durationDays >= 730.5) {
        warnings.push('Academic year duration is more than 2 years');
      }
    }

    // Validate calendar type
    const validCalendarTypes: CalendarType[] = ['semester', 'trimester', 'quarter', 'custom'];
    if (!validCalendarTypes.includes(params.calendarType)) {
      errors.push('Invalid calendar type');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check for conflicts with existing academic years
   */
  private async checkAcademicYearConflicts(
    params: CreateAcademicYearParams
  ): Promise<ConflictDetectionResult> {
    try {
      // Check for overlapping academic years
      const { data, error } = await this.supabase
        .from('academic_years')
        .select('*')
        .or(`and(start_date.lte.${params.endDate.toISOString().split('T')[0]},end_date.gte.${params.startDate.toISOString().split('T')[0]})`);

      if (error) {
        console.error('Error checking conflicts:', error);
        return {
          hasConflicts: false,
          conflicts: []
        };
      }

      if (data && data.length > 0) {
        const conflicts: CalendarConflict[] = data.map(ay => ({
          id: '',
          conflictType: 'academic_year_overlap',
          entity1Type: 'academic_year',
          entity1Id: 'new',
          entity2Type: 'academic_year',
          entity2Id: ay.id,
          conflictDescription: `Overlaps with existing academic year: ${ay.name}`,
          severity: 'high',
          status: 'detected',
          createdAt: new Date()
        }));

        return {
          hasConflicts: true,
          conflicts
        };
      }

      return {
        hasConflicts: false,
        conflicts: []
      };
    } catch (error) {
      console.error('Unexpected error checking conflicts:', error);
      return {
        hasConflicts: false,
        conflicts: []
      };
    }
  }

  /**
   * Generate semester parameters based on calendar type
   */
  private generateSemesterParams(
    academicYear: AcademicYear,
    calendarType: CalendarType
  ): CreateSemesterParams[] {
    const params: CreateSemesterParams[] = [];
    const yearStart = academicYear.startDate;
    const yearEnd = academicYear.endDate;
    const yearDuration = yearEnd.getTime() - yearStart.getTime();

    switch (calendarType) {
      case 'semester':
        // Two semesters: Fall and Spring
        params.push(
          this.createSemesterParams(
            academicYear.id,
            'Fall Semester',
            'fall',
            yearStart,
            new Date(yearStart.getTime() + yearDuration * 0.5)
          ),
          this.createSemesterParams(
            academicYear.id,
            'Spring Semester',
            'spring',
            new Date(yearStart.getTime() + yearDuration * 0.5),
            yearEnd
          )
        );
        break;

      case 'trimester':
        // Three trimesters
        params.push(
          this.createSemesterParams(
            academicYear.id,
            'Trimester 1',
            'term1',
            yearStart,
            new Date(yearStart.getTime() + yearDuration / 3)
          ),
          this.createSemesterParams(
            academicYear.id,
            'Trimester 2',
            'term2',
            new Date(yearStart.getTime() + yearDuration / 3),
            new Date(yearStart.getTime() + (yearDuration * 2) / 3)
          ),
          this.createSemesterParams(
            academicYear.id,
            'Trimester 3',
            'term3',
            new Date(yearStart.getTime() + (yearDuration * 2) / 3),
            yearEnd
          )
        );
        break;

      case 'quarter':
        // Four quarters
        params.push(
          this.createSemesterParams(
            academicYear.id,
            'Quarter 1',
            'term1',
            yearStart,
            new Date(yearStart.getTime() + yearDuration * 0.25)
          ),
          this.createSemesterParams(
            academicYear.id,
            'Quarter 2',
            'term2',
            new Date(yearStart.getTime() + yearDuration * 0.25),
            new Date(yearStart.getTime() + yearDuration * 0.5)
          ),
          this.createSemesterParams(
            academicYear.id,
            'Quarter 3',
            'term3',
            new Date(yearStart.getTime() + yearDuration * 0.5),
            new Date(yearStart.getTime() + yearDuration * 0.75)
          ),
          this.createSemesterParams(
            academicYear.id,
            'Quarter 4',
            'term4',
            new Date(yearStart.getTime() + yearDuration * 0.75),
            yearEnd
          )
        );
        break;

      case 'custom':
        // Single custom term
        params.push(
          this.createSemesterParams(
            academicYear.id,
            'Custom Term',
            'custom',
            yearStart,
            yearEnd
          )
        );
        break;
    }

    return params;
  }

  /**
   * Create semester parameters with calculated dates
   */
  private createSemesterParams(
    academicYearId: string,
    name: string,
    semesterType: SemesterType,
    startDate: Date,
    endDate: Date
  ): CreateSemesterParams {
    const semesterDuration = endDate.getTime() - startDate.getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    // Ensure registration end is strictly before semester start (not equal)
    const registrationEnd = new Date(startDate.getTime() - 1 * dayMs);

    // Ensure gradesDue is the end date (not after) to keep within academic year bounds
    const gradesDue = new Date(endDate.getTime());

    return {
      academicYearId,
      name,
      semesterType,
      startDate,
      endDate,
      registrationStart: new Date(startDate.getTime() - 30 * dayMs), // 30 days before
      registrationEnd, // 1 day before semester start
      addDropDeadline: new Date(startDate.getTime() + 14 * dayMs), // 2 weeks after start
      withdrawalDeadline: new Date(startDate.getTime() + semesterDuration * 0.6), // 60% through
      finalExamsStart: new Date(endDate.getTime() - 14 * dayMs), // 2 weeks before end
      finalExamsEnd: new Date(endDate.getTime() - 1 * dayMs), // 1 day before end
      gradesDue, // Same as end date to stay within bounds
      isActive: false
    };
  }
}
