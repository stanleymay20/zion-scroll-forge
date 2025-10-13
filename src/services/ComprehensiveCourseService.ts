/**
 * Comprehensive Course Service for ScrollUniversity
 * Implements all mandatory course components and integrations
 * Following zero hardcoding policy and production-ready patterns
 */

import { 
  ComprehensiveCourse, 
  StudentEnrollment, 
  CourseModule, 
  Lecture, 
  Assessment,
  CourseListResponse,
  CourseFilters,
  EnrollmentResponse,
  ProgressUpdateResponse,
  ScrollField,
  DifficultyLevel,
  CourseStatus,
  EnrollmentStatus,
  TutoringSession,
  SpiritualGrowthMetrics,
  MilestoneReward,
  AssessmentCompletion
} from '../types/course-comprehensive';

export class ComprehensiveCourseService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3001';
    this.apiKey = process.env.VITE_API_KEY || '';
  }

  // Course Management Methods

  /**
   * Create a new comprehensive course with all required components
   */
  async createCourse(courseData: Partial<ComprehensiveCourse>): Promise<ComprehensiveCourse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          ...courseData,
          // Ensure all mandatory components are present
          modules: courseData.modules || [],
          spiritual_formation_track: courseData.spiritual_formation_track || this.getDefaultSpiritualTrack(),
          milestone_rewards: courseData.milestone_rewards || this.getDefaultMilestoneRewards(),
          completion_certificate: courseData.completion_certificate || this.getDefaultCertificate(),
          gpt_tutor_enabled: courseData.gpt_tutor_enabled ?? true,
          audit_trail_enabled: true,
          transcript_integration: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create course: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive course list with filtering and pagination
   */
  async getCourses(
    page: number = 1, 
    limit: number = 20, 
    filters?: CourseFilters
  ): Promise<CourseListResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...this.buildFilterParams(filters),
      });

      const response = await fetch(`${this.baseUrl}/api/courses?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Get detailed course information including all modules, lectures, and assessments
   */
  async getCourseDetails(courseId: string): Promise<ComprehensiveCourse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch course details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }
  }

  // Student Enrollment Methods

  /**
   * Enroll student in course with comprehensive setup
   */
  async enrollStudent(courseId: string, studentId: string): Promise<EnrollmentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          student_id: studentId,
          enrollment_date: new Date().toISOString(),
          spiritual_formation_enabled: true,
          ai_tutoring_enabled: true,
          mentor_assignment_requested: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to enroll student: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  }

  /**
   * Get student's enrollment and progress details
   */
  async getStudentEnrollment(courseId: string, studentId: string): Promise<StudentEnrollment> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch enrollment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching student enrollment:', error);
      throw error;
    }
  }

  // Progress Tracking Methods

  /**
   * Update student progress after lecture completion
   */
  async completeLecture(
    courseId: string, 
    studentId: string, 
    lectureId: string,
    studyTime: number
  ): Promise<ProgressUpdateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}/lectures/${lectureId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          student_id: studentId,
          study_time: studyTime,
          completed_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to complete lecture: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error completing lecture:', error);
      throw error;
    }
  }

  /**
   * Submit assessment and get immediate feedback
   */
  async submitAssessment(
    courseId: string,
    assessmentId: string,
    studentId: string,
    answers: any,
    spiritualReflection?: string
  ): Promise<AssessmentCompletion> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}/assessments/${assessmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          student_id: studentId,
          answers,
          spiritual_reflection: spiritualReflection,
          submitted_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit assessment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  }

  // AI Tutoring Methods

  /**
   * Start AI tutoring session
   */
  async startTutoringSession(
    courseId: string,
    studentId: string,
    question: string,
    context?: any
  ): Promise<TutoringSession> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}/tutoring/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          student_id: studentId,
          question,
          context: {
            ...context,
            course_id: courseId,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start tutoring session: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting tutoring session:', error);
      throw error;
    }
  }

  /**
   * Get AI tutor response with course context
   */
  async getTutorResponse(
    sessionId: string,
    question: string
  ): Promise<{ answer: string; resources: string[]; escalate: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tutoring/sessions/${sessionId}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          question,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get tutor response: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting tutor response:', error);
      throw error;
    }
  }

  // Spiritual Formation Methods

  /**
   * Update spiritual growth metrics
   */
  async updateSpiritualGrowth(
    courseId: string,
    studentId: string,
    metrics: Partial<SpiritualGrowthMetrics>
  ): Promise<SpiritualGrowthMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}/spiritual-growth`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          student_id: studentId,
          metrics,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update spiritual growth: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating spiritual growth:', error);
      throw error;
    }
  }

  /**
   * Record prophetic check-in
   */
  async recordPropheticCheckin(
    courseId: string,
    studentId: string,
    checkinData: {
      prophetic_word?: string;
      spiritual_insights: string[];
      prayer_requests: string[];
      course_application: string;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}/prophetic-checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          student_id: studentId,
          ...checkinData,
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to record prophetic check-in: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error recording prophetic check-in:', error);
      throw error;
    }
  }

  // Analytics and Reporting Methods

  /**
   * Get course analytics and performance metrics
   */
  async getCourseAnalytics(courseId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch course analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw error;
    }
  }

  /**
   * Get student progress report
   */
  async getStudentProgressReport(courseId: string, studentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/courses/${courseId}/students/${studentId}/report`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch progress report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching progress report:', error);
      throw error;
    }
  }

  // Integration Methods

  /**
   * Sync with ScrollCoin system for rewards
   */
  async syncScrollCoinRewards(studentId: string, courseId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/scrollcoin/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          student_id: studentId,
          course_id: courseId,
          sync_timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync ScrollCoin rewards: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error syncing ScrollCoin rewards:', error);
      throw error;
    }
  }

  /**
   * Update transcript with course completion
   */
  async updateTranscript(studentId: string, courseId: string, completionData: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/transcript/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          student_id: studentId,
          course_id: courseId,
          completion_data: completionData,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update transcript: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating transcript:', error);
      throw error;
    }
  }

  // Private Helper Methods

  private buildFilterParams(filters?: CourseFilters): Record<string, string> {
    if (!filters) return {};

    const params: Record<string, string> = {};

    if (filters.scroll_field?.length) {
      params.scroll_field = filters.scroll_field.join(',');
    }
    if (filters.difficulty_level?.length) {
      params.difficulty_level = filters.difficulty_level.join(',');
    }
    if (filters.status?.length) {
      params.status = filters.status.join(',');
    }
    if (filters.has_ai_tutor !== undefined) {
      params.has_ai_tutor = filters.has_ai_tutor.toString();
    }
    if (filters.spiritual_formation_required !== undefined) {
      params.spiritual_formation_required = filters.spiritual_formation_required.toString();
    }
    if (filters.estimated_hours_min !== undefined) {
      params.estimated_hours_min = filters.estimated_hours_min.toString();
    }
    if (filters.estimated_hours_max !== undefined) {
      params.estimated_hours_max = filters.estimated_hours_max.toString();
    }

    return params;
  }

  private getDefaultSpiritualTrack() {
    return {
      track_id: 'default-spiritual-track',
      name: 'Foundational Spiritual Formation',
      description: 'Basic spiritual formation integrated with academic learning',
      divine_scorecard_integration: true,
      prophetic_checkins_required: true,
      intercession_prayer_component: true,
      character_development_milestones: [
        'Integrity in Learning',
        'Servant Leadership',
        'Kingdom Mindset',
        'Prophetic Sensitivity'
      ],
      ministry_readiness_indicators: [
        'Biblical Foundation',
        'Character Maturity',
        'Practical Skills',
        'Spiritual Discernment'
      ]
    };
  }

  private getDefaultMilestoneRewards(): MilestoneReward[] {
    return [
      {
        milestone_id: 'milestone-25',
        percentage: 25,
        xp_reward: 100,
        scrollcoin_reward: 50,
        spiritual_milestone: 'Foundation Established'
      },
      {
        milestone_id: 'milestone-50',
        percentage: 50,
        xp_reward: 200,
        scrollcoin_reward: 100,
        spiritual_milestone: 'Growth Evident'
      },
      {
        milestone_id: 'milestone-75',
        percentage: 75,
        xp_reward: 300,
        scrollcoin_reward: 150,
        spiritual_milestone: 'Maturity Developing'
      },
      {
        milestone_id: 'milestone-100',
        percentage: 100,
        xp_reward: 500,
        scrollcoin_reward: 250,
        badge_unlock: 'Course Completion Badge',
        spiritual_milestone: 'Transformation Complete'
      }
    ];
  }

  private getDefaultCertificate() {
    return {
      certificate_id: 'default-certificate',
      template_type: 'verified' as const,
      blockchain_verification: true,
      nft_badge_creation: true,
      ministry_endorsement: true,
      accreditation_value: 3
    };
  }
}

export default ComprehensiveCourseService;