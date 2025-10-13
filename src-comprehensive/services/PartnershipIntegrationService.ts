/**
 * Partnership Integration Service
 * Main service that coordinates partner institution integrations
 * Requirements 5.2 and 6.3: Complete partner institution integration system
 */

import PartnerAPIIntegrationService from './PartnerAPIIntegrationService';
import CredentialRecognitionService from './CredentialRecognitionService';
import GuestLecturerSchedulingService from './GuestLecturerSchedulingService';
import {
  PartnerInstitution,
  GuestLecturer,
  LectureSession,
  CredentialRecognition,
  PartnershipMetrics,
  PartnerStatus,
  IntegrationLevel,
  SessionStatus,
  RecognitionStatus
} from '../types/partner-integration';

export class PartnershipIntegrationService {
  private apiService: PartnerAPIIntegrationService;
  private credentialService: CredentialRecognitionService;
  private schedulingService: GuestLecturerSchedulingService;

  constructor() {
    this.apiService = new PartnerAPIIntegrationService();
    this.credentialService = new CredentialRecognitionService();
    this.schedulingService = new GuestLecturerSchedulingService();
  }

  /**
   * Initialize partnership integration system
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Partnership Integration System...');
      
      // Test connections to all partner APIs
      await this.testAllPartnerConnections();
      
      // Sync initial data from partners
      await this.performInitialDataSync();
      
      console.log('Partnership Integration System initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Partnership Integration System:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive partnership dashboard data
   */
  async getDashboardData(): Promise<{
    partners: PartnerInstitution[];
    lecturers: GuestLecturer[];
    upcomingSessions: LectureSession[];
    recentCredentials: CredentialRecognition[];
    metrics: PartnershipMetrics[];
    systemHealth: SystemHealthStatus;
  }> {
    try {
      const [
        partners,
        lecturers,
        upcomingSessions,
        recentCredentials,
        metrics,
        systemHealth
      ] = await Promise.all([
        this.getAllPartners(),
        this.getAllAvailableLecturers(),
        this.schedulingService.getUpcomingSessions(30),
        this.getRecentCredentialRecognitions(),
        this.getAllPartnershipMetrics(),
        this.getSystemHealth()
      ]);

      return {
        partners,
        lecturers,
        upcomingSessions,
        recentCredentials,
        metrics,
        systemHealth
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  }

  /**
   * Partner Management Methods
   */
  async getAllPartners(): Promise<PartnerInstitution[]> {
    // In a real implementation, this would query the database
    return this.credentialService.getRecognitionPartners();
  }

  async getPartner(partnerId: string): Promise<PartnerInstitution | undefined> {
    return this.credentialService.getPartner(partnerId);
  }

  async testPartnerConnection(partnerId: string): Promise<boolean> {
    return this.apiService.testPartnerConnection(partnerId);
  }

  async syncPartnerData(partnerId: string): Promise<void> {
    await this.apiService.syncPartnerData(partnerId);
  }

  /**
   * Guest Lecturer Management Methods
   */
  async getAllAvailableLecturers(filters?: {
    partnerId?: string;
    expertise?: string[];
    spiritualAlignment?: boolean;
  }): Promise<GuestLecturer[]> {
    return this.schedulingService.getAvailableLecturers(filters);
  }

  async getLecturer(lecturerId: string): Promise<GuestLecturer | undefined> {
    return this.schedulingService.getLecturer(lecturerId);
  }

  async searchLecturersByExpertise(expertise: string[]): Promise<GuestLecturer[]> {
    return this.schedulingService.getAvailableLecturers({ expertise });
  }

  /**
   * Session Scheduling Methods
   */
  async scheduleGuestLecture(sessionDetails: {
    lecturerId: string;
    courseId: string;
    title: string;
    description: string;
    scheduledDate: Date;
    duration: number;
    format: any;
    maxAttendees: number;
  }): Promise<LectureSession> {
    // Schedule through the scheduling service
    const session = await this.schedulingService.scheduleSession(sessionDetails);

    // Also notify the partner through API if needed
    const lecturer = await this.schedulingService.getLecturer(sessionDetails.lecturerId);
    if (lecturer) {
      try {
        await this.apiService.scheduleGuestLecture(lecturer.partnerId, sessionDetails.lecturerId, session);
      } catch (error) {
        console.warn('Failed to notify partner API about session scheduling:', error);
        // Continue with local scheduling even if partner notification fails
      }
    }

    return session;
  }

  async cancelSession(sessionId: string, reason: string): Promise<void> {
    await this.schedulingService.cancelSession(sessionId, reason);
  }

  async rescheduleSession(sessionId: string, newDate: Date, reason: string): Promise<LectureSession> {
    return this.schedulingService.rescheduleSession(sessionId, newDate, reason);
  }

  async getUpcomingSessions(days: number = 7): Promise<LectureSession[]> {
    return this.schedulingService.getUpcomingSessions(days);
  }

  async getSessionAnalytics(): Promise<any> {
    return this.schedulingService.getSessionAnalytics();
  }

  /**
   * Credential Recognition Methods
   */
  async submitCredentialForRecognition(
    partnerId: string,
    scrollCredentialId: string,
    credentialType: string
  ): Promise<CredentialRecognition> {
    return this.credentialService.submitForRecognition(partnerId, scrollCredentialId, credentialType);
  }

  async checkCredentialRecognitionStatus(recognitionId: string): Promise<CredentialRecognition> {
    return this.credentialService.checkRecognitionStatus(recognitionId);
  }

  async getRecognitionRequirements(partnerId: string, credentialType: string): Promise<any[]> {
    return this.credentialService.getRecognitionRequirements(partnerId, credentialType);
  }

  async validateCredentialEligibility(scrollCredentialId: string, partnerId: string): Promise<any> {
    return this.credentialService.validateCredentialEligibility(scrollCredentialId, partnerId);
  }

  async getRecognitionAnalytics(): Promise<any> {
    return this.credentialService.getRecognitionAnalytics();
  }

  /**
   * Metrics and Analytics Methods
   */
  async getAllPartnershipMetrics(): Promise<PartnershipMetrics[]> {
    const partners = await this.getAllPartners();
    const metrics: PartnershipMetrics[] = [];

    for (const partner of partners) {
      try {
        const partnerMetrics = await this.apiService.getPartnershipMetrics(partner.id);
        metrics.push(partnerMetrics);
      } catch (error) {
        console.warn(`Failed to get metrics for partner ${partner.id}:`, error);
        // Add default metrics for failed partners
        metrics.push({
          partnerId: partner.id,
          totalLectures: 0,
          totalStudentsReached: 0,
          credentialsRecognized: 0,
          satisfactionRating: 0,
          collaborationProjects: 0,
          lastActivity: new Date(),
          performanceScore: 0
        });
      }
    }

    return metrics;
  }

  async getPartnershipMetrics(partnerId: string): Promise<PartnershipMetrics> {
    return this.apiService.getPartnershipMetrics(partnerId);
  }

  async getSystemHealth(): Promise<SystemHealthStatus> {
    const partners = await this.getAllPartners();
    const healthChecks = await Promise.allSettled(
      partners.map(partner => this.testPartnerConnection(partner.id))
    );

    const activeConnections = healthChecks.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length;

    const totalConnections = partners.length;
    const healthPercentage = totalConnections > 0 ? (activeConnections / totalConnections) * 100 : 100;

    return {
      overall: healthPercentage >= 80 ? 'healthy' : healthPercentage >= 50 ? 'warning' : 'critical',
      activeConnections,
      totalConnections,
      healthPercentage,
      lastChecked: new Date(),
      issues: healthChecks
        .map((result, index) => ({
          partnerId: partners[index].id,
          status: result.status === 'fulfilled' && result.value ? 'connected' : 'disconnected',
          error: result.status === 'rejected' ? result.reason : null
        }))
        .filter(issue => issue.status === 'disconnected')
    };
  }

  /**
   * Bulk Operations
   */
  async bulkSyncAllPartners(): Promise<{
    successful: string[];
    failed: { partnerId: string; error: string }[];
  }> {
    const partners = await this.getAllPartners();
    const results = await Promise.allSettled(
      partners.map(partner => this.syncPartnerData(partner.id))
    );

    const successful: string[] = [];
    const failed: { partnerId: string; error: string }[] = [];

    results.forEach((result, index) => {
      const partnerId = partners[index].id;
      if (result.status === 'fulfilled') {
        successful.push(partnerId);
      } else {
        failed.push({
          partnerId,
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    return { successful, failed };
  }

  async bulkTestConnections(): Promise<{
    connected: string[];
    disconnected: { partnerId: string; error: string }[];
  }> {
    const partners = await this.getAllPartners();
    const results = await Promise.allSettled(
      partners.map(partner => this.testPartnerConnection(partner.id))
    );

    const connected: string[] = [];
    const disconnected: { partnerId: string; error: string }[] = [];

    results.forEach((result, index) => {
      const partnerId = partners[index].id;
      if (result.status === 'fulfilled' && result.value) {
        connected.push(partnerId);
      } else {
        disconnected.push({
          partnerId,
          error: result.status === 'rejected' ? result.reason?.message : 'Connection failed'
        });
      }
    });

    return { connected, disconnected };
  }

  /**
   * Private helper methods
   */
  private async testAllPartnerConnections(): Promise<void> {
    const partners = await this.getAllPartners();
    const connectionTests = await Promise.allSettled(
      partners.map(partner => this.testPartnerConnection(partner.id))
    );

    const failedConnections = connectionTests
      .map((result, index) => ({ result, partnerId: partners[index].id }))
      .filter(({ result }) => result.status === 'rejected' || !result.value)
      .map(({ partnerId }) => partnerId);

    if (failedConnections.length > 0) {
      console.warn(`Failed to connect to partners: ${failedConnections.join(', ')}`);
    }
  }

  private async performInitialDataSync(): Promise<void> {
    const partners = await this.getAllPartners();
    const activePartners = partners.filter(p => p.status === PartnerStatus.ACTIVE);

    // Sync data from active partners only
    await Promise.allSettled(
      activePartners.map(partner => this.syncPartnerData(partner.id))
    );
  }

  private async getRecentCredentialRecognitions(): Promise<CredentialRecognition[]> {
    // In a real implementation, this would query recent credential recognitions
    return [];
  }
}

interface SystemHealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  activeConnections: number;
  totalConnections: number;
  healthPercentage: number;
  lastChecked: Date;
  issues: {
    partnerId: string;
    status: 'connected' | 'disconnected';
    error: any;
  }[];
}

export default PartnershipIntegrationService;