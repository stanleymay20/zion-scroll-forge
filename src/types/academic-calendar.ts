/**
 * Academic Calendar Type Definitions
 * Frontend types for academic calendar components
 */

export type CalendarType = 'semester' | 'trimester' | 'quarter' | 'custom';
export type SemesterType = 'fall' | 'spring' | 'summer' | 'winter' | 'term1' | 'term2' | 'term3' | 'term4' | 'custom';

export interface AcademicYear {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  calendarType: CalendarType;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
}

export interface CreateAcademicYearParams {
  name: string;
  startDate: Date;
  endDate: Date;
  calendarType: CalendarType;
  isActive?: boolean;
}

export interface Semester {
  id: string;
  academicYearId: string;
  name: string;
  semesterType: SemesterType;
  startDate: Date | string;
  endDate: Date | string;
  registrationStart: Date | string;
  registrationEnd: Date | string;
  addDropDeadline: Date | string;
  withdrawalDeadline: Date | string;
  finalExamsStart: Date | string;
  finalExamsEnd: Date | string;
  gradesDue: Date | string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AcademicEvent {
  id: string;
  academicYearId: string;
  semesterId?: string;
  eventType: string;
  name: string;
  description?: string;
  startDate: Date | string;
  endDate?: Date | string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isHoliday: boolean;
  affectsClasses: boolean;
  isRecurring: boolean;
  recurrencePattern?: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
}

export interface CreateAcademicEventParams {
  academicYearId: string;
  semesterId?: string;
  eventType: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  isHoliday?: boolean;
  affectsClasses?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: Record<string, any>;
}

export interface Deadline {
  id: string;
  academicYearId?: string;
  semesterId?: string;
  entityType: string;
  entityId?: string;
  deadlineType: string;
  title: string;
  description?: string;
  deadlineDate: Date | string;
  deadlineTime?: string;
  notificationIntervals: number[];
  isHardDeadline: boolean;
  gracePeriodDays: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
}
