/**
 * Course Content Service
 * 
 * API integration service for Course Content Creation components
 * Handles all communication with backend course-content endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class CourseContentService {
  private async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    return response.json();
  }

  // ==================== Course Project Management ====================

  async createCourseProject(courseInfo: any): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/projects', {
      method: 'POST',
      body: JSON.stringify(courseInfo),
    });
  }

  async advancePhase(projectId: string, approvalData: any): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/api/course-content/projects/${projectId}/phase`, {
      method: 'PUT',
      body: JSON.stringify(approvalData),
    });
  }

  async getProjectStatus(projectId: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/api/course-content/projects/${projectId}/status`);
  }

  // ==================== Video Production ====================

  async uploadVideo(videoData: any): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/videos', {
      method: 'POST',
      body: JSON.stringify(videoData),
    });
  }

  async generateCaptions(videoId: string, language?: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/api/course-content/videos/${videoId}/captions`, {
      method: 'POST',
      body: JSON.stringify({ language: language || 'en' }),
    });
  }

  async optimizeVideo(videoId: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/api/course-content/videos/${videoId}/optimize`, {
      method: 'POST',
    });
  }

  async createMultilingualVersion(videoId: string, languages: string[]): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/api/course-content/videos/${videoId}/multilingual`, {
      method: 'POST',
      body: JSON.stringify({ languages }),
    });
  }

  // ==================== Written Materials ====================

  async generateMaterials(materialsData: any): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/materials', {
      method: 'POST',
      body: JSON.stringify(materialsData),
    });
  }

  async curateResources(moduleId: string, topic: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/api/course-content/materials/${moduleId}/resources`, {
      method: 'POST',
      body: JSON.stringify({ topic }),
    });
  }

  async validateCitations(documentId: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/api/course-content/materials/${documentId}/validate-citations`, {
      method: 'POST',
    });
  }

  // ==================== Assessment Design ====================

  async createAssessment(assessmentData: any): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  }

  // ==================== Quality Review ====================

  async submitForQualityReview(courseId: string, reviewType?: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/quality-review', {
      method: 'POST',
      body: JSON.stringify({ courseId, reviewType }),
    });
  }

  async approveCourse(courseId: string, reviewerId: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/api/course-content/quality-review/${courseId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reviewerId }),
    });
  }

  // ==================== Dashboard ====================

  async getDashboardData(filters?: any): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/api/course-content/dashboard${queryParams ? `?${queryParams}` : ''}`;
    return this.fetchWithAuth(endpoint);
  }

  // ==================== Real-World Deployment ====================

  async createDeploymentPathway(pathwayData: any): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/deployment-pathways', {
      method: 'POST',
      body: JSON.stringify(pathwayData),
    });
  }

  async connectStudentToProject(pathwayId: string, connectionData: any): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/api/course-content/deployment-pathways/${pathwayId}/connect-student`, {
      method: 'POST',
      body: JSON.stringify(connectionData),
    });
  }

  async assessDeploymentReadiness(studentId: string, assessmentId: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/deployment-pathways/assess-readiness', {
      method: 'POST',
      body: JSON.stringify({ studentId, assessmentId }),
    });
  }

  async generatePortfolioEvidence(studentId: string, courseId: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/deployment-pathways/generate-portfolio', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId }),
    });
  }

  // ==================== Validation Endpoints ====================

  async validateConstitution(courseId: string, validationType?: string, additionalData?: any): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/validate-constitution', {
      method: 'POST',
      body: JSON.stringify({ courseId, validationType, ...additionalData }),
    });
  }

  async validateRigor(courseId: string, declaredLevel: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/validate-rigor', {
      method: 'POST',
      body: JSON.stringify({ courseId, declaredLevel }),
    });
  }

  async validateSpiritualAlignment(contentId: string, strictnessProfile: string, attemptCorrection?: boolean): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/validate-spiritual-alignment', {
      method: 'POST',
      body: JSON.stringify({ contentId, strictnessProfile, attemptCorrection }),
    });
  }

  async validatePedagogy(validationData: any): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/api/course-content/validate-pedagogy', {
      method: 'POST',
      body: JSON.stringify(validationData),
    });
  }
}

export const courseContentService = new CourseContentService();
export default courseContentService;
