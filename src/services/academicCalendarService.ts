/**
 * Academic Calendar Service
 * Client-side service for academic calendar operations
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import type {
  AcademicYear,
  Semester,
  AcademicEvent,
  CreateAcademicYearParams,
  CreateAcademicEventParams,
  CalendarType,
} from '@/types/academic-calendar';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AcademicCalendarService {
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('auth_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return response;
  }

  /**
   * Create a new academic year
   */
  async createAcademicYear(params: CreateAcademicYearParams): Promise<AcademicYear> {
    const response = await this.fetchWithAuth('/api/academic-calendar/years', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return data.data;
  }

  /**
   * Get all academic years
   */
  async getAllAcademicYears(): Promise<AcademicYear[]> {
    const response = await this.fetchWithAuth('/api/academic-calendar/years');
    const data = await response.json();
    return data.data || [];
  }

  /**
   * Get academic year by ID
   */
  async getAcademicYearById(id: string): Promise<AcademicYear> {
    const response = await this.fetchWithAuth(`/api/academic-calendar/years/${id}`);
    const data = await response.json();
    return data.data;
  }

  /**
   * Generate semester schedule for an academic year
   */
  async generateSemesterSchedule(
    academicYearId: string,
    calendarType: CalendarType
  ): Promise<Semester[]> {
    const response = await this.fetchWithAuth('/api/academic-calendar/semesters', {
      method: 'POST',
      body: JSON.stringify({ academicYearId, calendarType }),
    });

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Get semesters for an academic year
   */
  async getSemestersByAcademicYear(academicYearId: string): Promise<Semester[]> {
    const response = await this.fetchWithAuth(
      `/api/academic-calendar/semesters/${academicYearId}`
    );
    const data = await response.json();
    return data.data || [];
  }

  /**
   * Schedule a new academic event
   */
  async scheduleEvent(params: CreateAcademicEventParams): Promise<AcademicEvent> {
    const response = await this.fetchWithAuth('/api/academic-calendar/events', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return data.data;
  }

  /**
   * Get events for an academic year
   */
  async getEventsByAcademicYear(academicYearId: string): Promise<AcademicEvent[]> {
    const response = await this.fetchWithAuth(
      `/api/academic-calendar/events/${academicYearId}`
    );
    const data = await response.json();
    return data.data || [];
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(
    entityType: string,
    entityId: string,
    daysAhead: number = 30
  ): Promise<any[]> {
    const params = new URLSearchParams({
      entityType,
      entityId,
      daysAhead: daysAhead.toString(),
    });

    const response = await this.fetchWithAuth(
      `/api/academic-calendar/deadlines?${params}`
    );
    const data = await response.json();
    return data.data || [];
  }
}

export default new AcademicCalendarService();
