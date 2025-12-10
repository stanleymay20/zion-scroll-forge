/**
 * Faculty Dashboard Service
 * Handles API calls for faculty operations
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  TeachingLoadAnalysis,
  CourseAssignment,
  LecturePlan,
  Assessment,
  GradingSubmission,
  GradingResult,
  StudentAnalytics,
  CourseAnalytics,
  ServiceResponse
} from '@/types/faculty-dashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class FacultyDashboardService {
  // =====================================================
  // TEACHING LOAD MANAGEMENT
  // =====================================================

  async getTeachingLoad(facultyId: string, semesterId?: string): Promise<ServiceResponse<TeachingLoadAnalysis>> {
    try {
      const params = new URLSearchParams();
      if (semesterId) params.append('semesterId', semesterId);

      const response = await fetch(
        `${API_BASE_URL}/api/faculty/teaching-load/${facultyId}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch teaching load');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getCourseAssignments(facultyId: string, semesterId?: string): Promise<ServiceResponse<CourseAssignment[]>> {
    try {
      const params = new URLSearchParams();
      if (semesterId) params.append('semesterId', semesterId);

      const response = await fetch(
        `${API_BASE_URL}/api/faculty/assignments/${facultyId}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch course assignments');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // =====================================================
  // CONTENT GENERATION
  // =====================================================

  async generateLecturePlan(request: {
    courseId: string;
    moduleId: string;
    moduleTitle: string;
    learningObjectives: string[];
    targetAudience: string;
    duration: number;
    courseContext?: string;
    spiritualFocus?: string;
  }): Promise<ServiceResponse<LecturePlan>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/faculty/content/generate-lecture-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify(request)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate lecture plan');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateAssessment(request: {
    courseId: string;
    moduleId?: string;
    assessmentType: 'quiz' | 'exam' | 'assignment' | 'project' | 'discussion';
    topics: string[];
    learningObjectives: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    numberOfQuestions: number;
    timeLimit?: number;
    includeSpiritual: boolean;
  }): Promise<ServiceResponse<Assessment>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/faculty/content/generate-assessment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify(request)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate assessment');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateTeachingMaterials(
    courseId: string,
    moduleId: string,
    materialType: 'slides' | 'handout' | 'activity' | 'guide'
  ): Promise<ServiceResponse<string>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/faculty/content/generate-materials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({ courseId, moduleId, materialType })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate teaching materials');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // =====================================================
  // GRADING AUTOMATION
  // =====================================================

  async getPendingSubmissions(facultyId: string, courseId?: string): Promise<ServiceResponse<GradingSubmission[]>> {
    try {
      const params = new URLSearchParams();
      if (courseId) params.append('courseId', courseId);

      const response = await fetch(
        `${API_BASE_URL}/api/faculty/grading/pending/${facultyId}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch pending submissions');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async gradeSubmission(submissionId: string): Promise<ServiceResponse<GradingResult>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/faculty/grading/automate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({ submissionId })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to grade submission');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async batchGradeSubmissions(submissionIds: string[]): Promise<ServiceResponse<GradingResult[]>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/faculty/grading/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({ submissionIds })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to batch grade submissions');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // =====================================================
  // STUDENT ANALYTICS
  // =====================================================

  async getStudentAnalytics(studentId: string, courseId: string): Promise<ServiceResponse<StudentAnalytics>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/faculty/analytics/student/${studentId}?courseId=${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch student analytics');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getCourseAnalytics(courseId: string): Promise<ServiceResponse<CourseAnalytics>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/faculty/analytics/course/${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch course analytics');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAtRiskStudents(courseId: string): Promise<ServiceResponse<StudentAnalytics[]>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/faculty/analytics/at-risk/${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch at-risk students');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const facultyDashboardService = new FacultyDashboardService();
