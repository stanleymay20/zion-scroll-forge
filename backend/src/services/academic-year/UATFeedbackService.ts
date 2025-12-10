/**
 * User Acceptance Testing Feedback Service
 * Manages UAT feedback collection, defect tracking, and reporting
 */

import {
  UATFeedback,
  UATDefect,
  UATSession,
  UATScenario,
  UATMetrics,
  UATReport,
  CreateFeedbackRequest,
  CreateSessionRequest,
  UpdateDefectRequest,
  GenerateReportRequest,
  FeedbackQueryParams,
  UATTestStatus,
  DefectSeverity,
  DefectStatus,
  SessionStatus,
  ReportType,
  SignOffStatus,
  UATUserRole
} from '../../types/uat-feedback.types';

export class UATFeedbackService {
  private feedbackStore: Map<string, UATFeedback> = new Map();
  private defectStore: Map<string, UATDefect> = new Map();
  private sessionStore: Map<string, UATSession> = new Map();
  private scenarioStore: Map<string, UATScenario> = new Map();

  constructor() {
    this.initializeScenarios();
  }

  /**
   * Create a new UAT session
   */
  async createSession(userId: string, request: CreateSessionRequest): Promise<UATSession> {
    const session: UATSession = {
      id: this.generateId('session'