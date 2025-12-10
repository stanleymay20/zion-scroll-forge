/**
 * Student Portal Service
 * "Trust in the Lord with all your heart and lean not on your own understanding" - Proverbs 3:5
 * 
 * Service for student portal operations including registration, degree audit, and graduation planning
 */

import { supabase } from '@/lib/supabase';
import type {
  CourseOffering,
  CourseSearchFilters,
  EnrollmentValidation,
  RegistrationResult,
  WaitlistEntry,
  StudentSchedule,
  DegreeAudit,
  GraduationEvaluation,
  GraduationTimeline,
  StudentProfile,
  ApiResponse,
  PaginatedResponse
} from '@/types/student-portal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class StudentPortalService {
  /**
   * Get student profile
   */
  async getStudentProfile(studentId: string): Promise<ApiResponse<StudentProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/profile`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student profile');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  // =====================================================
  // REGISTRATION METHODS
  // =====================================================

  /**
   * Search for available courses
   */
  async searchCourses(
    semesterId: string,
    filters?: CourseSearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<CourseOffering>>> {
    try {
      const params = new URLSearchParams({
        semesterId,
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.searchTerm && { searchTerm: filters.searchTerm }),
        ...(filters?.department && { department: filters.department }),
        ...(filters?.level && { level: filters.level }),
        ...(filters?.credits && { credits: filters.credits.toString() }),
        ...(filters?.instructor && { instructor: filters.instructor }),
        ...(filters?.hasAvailableSeats !== undefined && { hasAvailableSeats: filters.hasAvailableSeats.toString() })
      });

      const response = await fetch(`${API_BASE_URL}/api/registration/courses/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search courses');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Validate registration eligibility
   */
  async validateRegistration(
    studentId: string,
    courseId: string,
    semesterId: string
  ): Promise<ApiResponse<EnrollmentValidation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/registration/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId, courseId, semesterId })
      });

      if (!response.ok) {
        throw new Error('Failed to validate registration');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Register for courses
   */
  async registerForCourses(
    studentId: string,
    courseIds: string[],
    semesterId: string
  ): Promise<ApiResponse<RegistrationResult[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/registration/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId, courseIds, semesterId })
      });

      if (!response.ok) {
        throw new Error('Failed to register for courses');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Get student schedule
   */
  async getStudentSchedule(
    studentId: string,
    semesterId: string
  ): Promise<ApiResponse<StudentSchedule>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/students/${studentId}/schedule?semesterId=${semesterId}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch student schedule');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Get waitlist information
   */
  async getWaitlistInfo(
    studentId: string,
    courseId: string,
    semesterId: string
  ): Promise<ApiResponse<WaitlistEntry | null>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/registration/waitlist?studentId=${studentId}&courseId=${courseId}&semesterId=${semesterId}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch waitlist info');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Drop a course
   */
  async dropCourse(
    studentId: string,
    enrollmentId: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/registration/drop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId, enrollmentId })
      });

      if (!response.ok) {
        throw new Error('Failed to drop course');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  // =====================================================
  // DEGREE AUDIT METHODS
  // =====================================================

  /**
   * Get degree audit
   */
  async getDegreeAudit(studentId: string): Promise<ApiResponse<DegreeAudit>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/degree-audit`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch degree audit');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Refresh degree audit
   */
  async refreshDegreeAudit(studentId: string): Promise<ApiResponse<DegreeAudit>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/students/${studentId}/degree-audit/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh degree audit');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  // =====================================================
  // GRADUATION PLANNING METHODS
  // =====================================================

  /**
   * Evaluate graduation eligibility
   */
  async evaluateGraduationEligibility(studentId: string): Promise<ApiResponse<GraduationEvaluation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/graduation/evaluate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate graduation eligibility');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Get graduation timeline
   */
  async getGraduationTimeline(studentId: string): Promise<ApiResponse<GraduationTimeline>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/graduation/timeline?studentId=${studentId}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch graduation timeline');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Submit graduation application
   */
  async submitGraduationApplication(
    studentId: string,
    applicationData: {
      ceremonyDate?: Date;
      diplomaMailingAddress: string;
      notes?: string;
    }
  ): Promise<ApiResponse<{ applicationId: string; message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/graduation/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId, ...applicationData })
      });

      if (!response.ok) {
        throw new Error('Failed to submit graduation application');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }
}

export const studentPortalService = new StudentPortalService();
export default studentPortalService;
