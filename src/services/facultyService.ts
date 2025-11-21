/**
 * Faculty Service
 * Frontend service for faculty dashboard API interactions
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  FacultyDashboardData,
  FacultyCourse,
  CourseManagementFilters,
  GradebookEntry,
  BulkGradingRequest,
  StudentRosterEntry,
  CommunicationMessage,
  StudentCommunicationHistory,
  AssignmentManagement,
  AssignmentSubmission,
  InstructorCourseAnalytics,
  OfficeHours,
  OfficeHoursAppointment,
  OfficeHoursSchedule,
  FacultyResource,
  ResourceCategory,
} from '@/types/faculty';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class FacultyService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  // ============================================================================
  // Dashboard
  // ============================================================================

  async getDashboardData(): Promise<FacultyDashboardData> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/faculty/dashboard`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch faculty dashboard data');
    }

    const data = await response.json();
    return data.dashboard;
  }

  // ============================================================================
  // Course Management
  // ============================================================================

  async getCourses(filters?: CourseManagementFilters): Promise<FacultyCourse[]> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch faculty courses');
    }

    const data = await response.json();
    return data.courses;
  }

  async getCourseDetails(courseId: string): Promise<FacultyCourse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch course details');
    }

    const data = await response.json();
    return data.course;
  }

  async updateCourse(courseId: string, updates: Partial<FacultyCourse>): Promise<FacultyCourse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update course');
    }

    const data = await response.json();
    return data.course;
  }

  // ============================================================================
  // Gradebook
  // ============================================================================

  async getGradebook(courseId: string): Promise<GradebookEntry[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/gradebook`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch gradebook');
    }

    const data = await response.json();
    return data.gradebook;
  }

  async updateGrade(
    courseId: string,
    studentId: string,
    assignmentId: string,
    grade: {
      score: number;
      feedback?: string;
      rubricScores?: Record<string, number>;
    }
  ): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/grades`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          studentId,
          assignmentId,
          ...grade,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update grade');
    }
  }

  async bulkGrade(
    courseId: string,
    request: BulkGradingRequest
  ): Promise<{ success: number; failed: number }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/grades/bulk`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to perform bulk grading');
    }

    const data = await response.json();
    return data.result;
  }

  async exportGradebook(courseId: string, format: 'csv' | 'excel'): Promise<Blob> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/gradebook/export?format=${format}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to export gradebook');
    }

    return response.blob();
  }

  // ============================================================================
  // Student Roster
  // ============================================================================

  async getStudentRoster(courseId: string): Promise<StudentRosterEntry[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/roster`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch student roster');
    }

    const data = await response.json();
    return data.roster;
  }

  async getStudentDetails(courseId: string, studentId: string): Promise<StudentRosterEntry> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/roster/${studentId}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch student details');
    }

    const data = await response.json();
    return data.student;
  }

  async sendMessage(courseId: string, message: CommunicationMessage): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/communications`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(message),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send message');
    }
  }

  async getCommunicationHistory(
    courseId: string,
    studentId: string
  ): Promise<StudentCommunicationHistory[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/communications/${studentId}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch communication history');
    }

    const data = await response.json();
    return data.history;
  }

  // ============================================================================
  // Assignment Management
  // ============================================================================

  async getAssignments(courseId: string): Promise<AssignmentManagement[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/assignments`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }

    const data = await response.json();
    return data.assignments;
  }

  async createAssignment(
    courseId: string,
    assignment: Partial<AssignmentManagement>
  ): Promise<AssignmentManagement> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/assignments`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(assignment),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create assignment');
    }

    const data = await response.json();
    return data.assignment;
  }

  async updateAssignment(
    courseId: string,
    assignmentId: string,
    updates: Partial<AssignmentManagement>
  ): Promise<AssignmentManagement> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/assignments/${assignmentId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update assignment');
    }

    const data = await response.json();
    return data.assignment;
  }

  async deleteAssignment(courseId: string, assignmentId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/assignments/${assignmentId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete assignment');
    }
  }

  async getSubmissions(
    courseId: string,
    assignmentId: string
  ): Promise<AssignmentSubmission[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/assignments/${assignmentId}/submissions`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }

    const data = await response.json();
    return data.submissions;
  }

  async gradeSubmission(
    courseId: string,
    submissionId: string,
    grading: {
      score: number;
      feedback: string;
      rubricScores?: Record<string, number>;
    }
  ): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/submissions/${submissionId}/grade`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(grading),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to grade submission');
    }
  }

  // ============================================================================
  // Course Analytics
  // ============================================================================

  async getCourseAnalytics(
    courseId: string,
    timeRange?: { startDate: Date; endDate: Date }
  ): Promise<InstructorCourseAnalytics> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams();
    
    if (timeRange) {
      params.append('startDate', timeRange.startDate.toISOString());
      params.append('endDate', timeRange.endDate.toISOString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/faculty/courses/${courseId}/analytics?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch course analytics');
    }

    const data = await response.json();
    return data.analytics;
  }

  // ============================================================================
  // Office Hours
  // ============================================================================

  async getOfficeHours(): Promise<OfficeHours[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/faculty/office-hours`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch office hours');
    }

    const data = await response.json();
    return data.officeHours;
  }

  async createOfficeHours(officeHours: Partial<OfficeHours>): Promise<OfficeHours> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/faculty/office-hours`, {
      method: 'POST',
      headers,
      body: JSON.stringify(officeHours),
    });

    if (!response.ok) {
      throw new Error('Failed to create office hours');
    }

    const data = await response.json();
    return data.officeHours;
  }

  async updateOfficeHours(
    officeHoursId: string,
    updates: Partial<OfficeHours>
  ): Promise<OfficeHours> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/office-hours/${officeHoursId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update office hours');
    }

    const data = await response.json();
    return data.officeHours;
  }

  async deleteOfficeHours(officeHoursId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/office-hours/${officeHoursId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete office hours');
    }
  }

  async getAppointments(date?: Date): Promise<OfficeHoursAppointment[]> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams();
    
    if (date) {
      params.append('date', date.toISOString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/faculty/office-hours/appointments?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }

    const data = await response.json();
    return data.appointments;
  }

  async getSchedule(startDate: Date, endDate: Date): Promise<OfficeHoursSchedule[]> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/faculty/office-hours/schedule?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch schedule');
    }

    const data = await response.json();
    return data.schedule;
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  ): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/office-hours/appointments/${appointmentId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update appointment status');
    }
  }

  // ============================================================================
  // Faculty Resources
  // ============================================================================

  async getResources(category?: string): Promise<FacultyResource[]> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams();
    
    if (category) {
      params.append('category', category);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/faculty/resources?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch faculty resources');
    }

    const data = await response.json();
    return data.resources;
  }

  async getResourceCategories(): Promise<ResourceCategory[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/resources/categories`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch resource categories');
    }

    const data = await response.json();
    return data.categories;
  }

  async downloadResource(resourceId: string): Promise<Blob> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/faculty/resources/${resourceId}/download`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to download resource');
    }

    return response.blob();
  }
}

export default new FacultyService();
