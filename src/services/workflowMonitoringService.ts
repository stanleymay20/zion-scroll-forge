/**
 * Workflow Monitoring Service
 * "For God is not a God of disorder but of peace" - 1 Corinthians 14:33
 * 
 * Service for managing workflow monitoring and orchestration
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export interface WorkflowContextData {
  applicantName?: string;
  studentId?: string;
  studentName?: string;
  courseId?: string;
  [key: string]: string | number | boolean | undefined;
}
