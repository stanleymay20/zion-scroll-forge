/**
 * Partner API Integration Service
 * Handles API integrations with partner institutions (MIT, Oxford, Ghana Tech Alliance)
 * Requirement 5.2: Partner institution integration
 */

import {
  PartnerInstitution,
  APIIntegrationConfig,
  GuestLecturer,
  LectureSession,
  PartnershipMetrics,
  PartnerStatus,
  IntegrationLevel,
  AuthConfig
} from '../types/partner-integration';

export class PartnerAPIIntegrationService {
  private integrationConfigs: Map<string, APIIntegrationConfig> = new Map();
  private rateLimitTrackers: Map<string, RateLimitTracker> = new Map();

  constructor() {
    this.initializeDefaultPartners();
  }

  /**
   * Initialize default partner institutions
   */
  private initializeDefaultPartners(): void {
    // MIT Integration
    this.registerPartnerAPI({
      partnerId: 'mit-csail',
      baseUrl: 'https://api.mit.edu/v1',
      apiVersion: '1.0',
      authConfig: {
        type: 'api_key',
        credentials: { apiKey: process.env.MIT_API_KEY || '' }
      },
      endpoints: [
        {
          name: 'getFaculty',
          method: 'GET',
          path: '/faculty',
          description: 'Get available faculty for guest lectures'
        },
        {
          name: 'scheduleSession',
          method: 'POST',
          path: '/sessions',
          description: 'Schedule a guest lecture session'
        }
      ],
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        burstLimit: 10
      },
      dataMapping: {
        inbound: {
          'faculty_name': 'name',
          'faculty_title': 'title',
          'research_areas': 'expertise'
        },
        outbound: {
          'name': 'faculty_name',
          'title': 'faculty_title',
          'expertise': 'research_areas'
        },
        transformations: []
      }
    });

    // Oxford Integration
    this.registerPartnerAPI({
      partnerId: 'oxford-university',
      baseUrl: 'https://api.ox.ac.uk/v2',
      apiVersion: '2.0',
      authConfig: {
        type: 'oauth2',
        credentials: {
          clientId: process.env.OXFORD_CLIENT_ID || '',
          clientSecret: process.env.OXFORD_CLIENT_SECRET || ''
        }
      },
      endpoints: [
        {
          name: 'getAcademics',
          method: 'GET',
          path: '/academics',
          description: 'Get Oxford academics available for collaboration'
        },
        {
          name: 'createCollaboration',
          method: 'POST',
          path: '/collaborations',
          description: 'Create new collaboration project'
        }
      ],
      rateLimits: {
        requestsPerMinute: 30,
        requestsPerHour: 500,
        requestsPerDay: 5000,
        burstLimit: 5
      },
      dataMapping: {
        inbound: {
          'academic_name': 'name',
          'department': 'title',
          'specializations': 'expertise'
        },
        outbound: {
          'name': 'academic_name',
          'title': 'department',
          'expertise': 'specializations'
        },
        transformations: []
      }
    });

    // Ghana Tech Alliance Integration
    this.registerPartnerAPI({
      partnerId: 'ghana-tech-alliance',
      baseUrl: 'https://api.ghanatech.org/v1',
      apiVersion: '1.0',
      authConfig: {
        type: 'jwt',
        credentials: {
          secret: process.env.GHANA_TECH_JWT_SECRET || '',
          issuer: 'scrolluniversity.org'
        }
      },
      endpoints: [
        {
          name: 'getTechExperts',
          method: 'GET',
          path: '/experts',
          description: 'Get technology experts for guest sessions'
        },
        {
          name: 'scheduleWorkshop',
          method: 'POST',
          path: '/workshops',
          description: 'Schedule technology workshop'
        }
      ],
      rateLimits: {
        requestsPerMinute: 100,
        requestsPerHour: 2000,
        requestsPerDay: 20000,
        burstLimit: 20
      },
      dataMapping: {
        inbound: {
          'expert_name': 'name',
          'tech_focus': 'expertise',
          'years_experience': 'experience'
        },
        outbound: {
          'name': 'expert_name',
          'expertise': 'tech_focus',
          'experience': 'years_experience'
        },
        transformations: []
      }
    });
  }

  /**
   * Register a new partner API configuration
   */
  registerPartnerAPI(config: APIIntegrationConfig): void {
    this.integrationConfigs.set(config.partnerId, config);
    this.rateLimitTrackers.set(config.partnerId, new RateLimitTracker(config.rateLimits));
  }

  /**
   * Get available guest lecturers from partner institutions
   */
  async getAvailableGuestLecturers(partnerId: string, filters?: {
    expertise?: string[];
    availability?: Date;
    spiritualAlignment?: boolean;
  }): Promise<GuestLecturer[]> {
    const config = this.integrationConfigs.get(partnerId);
    if (!config) {
      throw new Error(`Partner configuration not found: ${partnerId}`);
    }

    await this.checkRateLimit(partnerId);

    try {
      const endpoint = config.endpoints.find(e => e.name === 'getFaculty' || e.name === 'getAcademics' || e.name === 'getTechExperts');
      if (!endpoint) {
        throw new Error(`No faculty endpoint found for partner: ${partnerId}`);
      }

      const response = await this.makeAPIRequest(config, endpoint, 'GET');
      const lecturers = this.transformInboundData(config, response.data);

      // Apply filters
      let filteredLecturers = lecturers;
      if (filters?.expertise) {
        filteredLecturers = filteredLecturers.filter(lecturer => 
          lecturer.expertise.some(exp => filters.expertise!.includes(exp))
        );
      }

      if (filters?.spiritualAlignment) {
        filteredLecturers = filteredLecturers.filter(lecturer => 
          lecturer.spiritualAlignment.christianWorldview && 
          lecturer.spiritualAlignment.scrollPrinciplesAlignment >= 7
        );
      }

      return filteredLecturers;
    } catch (error) {
      console.error(`Error fetching guest lecturers from ${partnerId}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a guest lecture session
   */
  async scheduleGuestLecture(
    partnerId: string,
    lecturerId: string,
    sessionDetails: Partial<LectureSession>
  ): Promise<LectureSession> {
    const config = this.integrationConfigs.get(partnerId);
    if (!config) {
      throw new Error(`Partner configuration not found: ${partnerId}`);
    }

    await this.checkRateLimit(partnerId);

    try {
      const endpoint = config.endpoints.find(e => e.name === 'scheduleSession' || e.name === 'createCollaboration' || e.name === 'scheduleWorkshop');
      if (!endpoint) {
        throw new Error(`No scheduling endpoint found for partner: ${partnerId}`);
      }

      const requestData = this.transformOutboundData(config, {
        lecturerId,
        ...sessionDetails
      });

      const response = await this.makeAPIRequest(config, endpoint, 'POST', requestData);
      return this.transformInboundData(config, response.data);
    } catch (error) {
      console.error(`Error scheduling guest lecture with ${partnerId}:`, error);
      throw error;
    }
  }

  /**
   * Sync partner data
   */
  async syncPartnerData(partnerId: string): Promise<void> {
    const config = this.integrationConfigs.get(partnerId);
    if (!config) {
      throw new Error(`Partner configuration not found: ${partnerId}`);
    }

    try {
      // Sync faculty/lecturer data
      const lecturers = await this.getAvailableGuestLecturers(partnerId);
      await this.updateLocalLecturerCache(partnerId, lecturers);

      // Sync session data
      await this.syncSessionData(partnerId);

      console.log(`Successfully synced data for partner: ${partnerId}`);
    } catch (error) {
      console.error(`Error syncing partner data for ${partnerId}:`, error);
      throw error;
    }
  }

  /**
   * Get partnership metrics
   */
  async getPartnershipMetrics(partnerId: string): Promise<PartnershipMetrics> {
    // This would typically query the database for metrics
    return {
      partnerId,
      totalLectures: 0,
      totalStudentsReached: 0,
      credentialsRecognized: 0,
      satisfactionRating: 0,
      collaborationProjects: 0,
      lastActivity: new Date(),
      performanceScore: 0
    };
  }

  /**
   * Test partner API connection
   */
  async testPartnerConnection(partnerId: string): Promise<boolean> {
    const config = this.integrationConfigs.get(partnerId);
    if (!config) {
      return false;
    }

    try {
      // Try a simple health check or basic endpoint
      const healthEndpoint = config.endpoints.find(e => e.name === 'health') || config.endpoints[0];
      await this.makeAPIRequest(config, healthEndpoint, 'GET');
      return true;
    } catch (error) {
      console.error(`Partner connection test failed for ${partnerId}:`, error);
      return false;
    }
  }

  /**
   * Make authenticated API request
   */
  private async makeAPIRequest(
    config: APIIntegrationConfig,
    endpoint: any,
    method: string,
    data?: any
  ): Promise<any> {
    const url = `${config.baseUrl}${endpoint.path}`;
    const headers = await this.buildAuthHeaders(config.authConfig);

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ScrollUniversity/1.0',
        ...headers
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Build authentication headers based on auth config
   */
  private async buildAuthHeaders(authConfig: AuthConfig): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    switch (authConfig.type) {
      case 'api_key':
        headers['X-API-Key'] = authConfig.credentials.apiKey;
        break;
      case 'oauth2':
        // In a real implementation, you'd handle OAuth2 token refresh here
        headers['Authorization'] = `Bearer ${authConfig.credentials.accessToken || ''}`;
        break;
      case 'jwt':
        // Generate JWT token
        const jwt = await this.generateJWT(authConfig.credentials);
        headers['Authorization'] = `Bearer ${jwt}`;
        break;
      case 'basic':
        const credentials = btoa(`${authConfig.credentials.username}:${authConfig.credentials.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
    }

    return headers;
  }

  /**
   * Generate JWT token for authentication
   */
  private async generateJWT(credentials: Record<string, string>): Promise<string> {
    // This is a simplified JWT generation - in production, use a proper JWT library
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      iss: credentials.issuer,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }));
    
    // In production, properly sign with the secret
    const signature = btoa(`${header}.${payload}.${credentials.secret}`);
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Check rate limits before making API calls
   */
  private async checkRateLimit(partnerId: string): Promise<void> {
    const tracker = this.rateLimitTrackers.get(partnerId);
    if (tracker && !tracker.canMakeRequest()) {
      throw new Error(`Rate limit exceeded for partner: ${partnerId}`);
    }
    tracker?.recordRequest();
  }

  /**
   * Transform inbound data according to mapping configuration
   */
  private transformInboundData(config: APIIntegrationConfig, data: any): any {
    if (!config.dataMapping.inbound) return data;

    const transformed = { ...data };
    for (const [partnerField, scrollField] of Object.entries(config.dataMapping.inbound)) {
      if (data[partnerField] !== undefined) {
        transformed[scrollField] = data[partnerField];
        delete transformed[partnerField];
      }
    }

    return transformed;
  }

  /**
   * Transform outbound data according to mapping configuration
   */
  private transformOutboundData(config: APIIntegrationConfig, data: any): any {
    if (!config.dataMapping.outbound) return data;

    const transformed = { ...data };
    for (const [scrollField, partnerField] of Object.entries(config.dataMapping.outbound)) {
      if (data[scrollField] !== undefined) {
        transformed[partnerField] = data[scrollField];
        delete transformed[scrollField];
      }
    }

    return transformed;
  }

  /**
   * Update local lecturer cache
   */
  private async updateLocalLecturerCache(partnerId: string, lecturers: GuestLecturer[]): Promise<void> {
    // In a real implementation, this would update the database
    console.log(`Updating lecturer cache for ${partnerId} with ${lecturers.length} lecturers`);
  }

  /**
   * Sync session data with partner
   */
  private async syncSessionData(partnerId: string): Promise<void> {
    // In a real implementation, this would sync session data
    console.log(`Syncing session data for partner: ${partnerId}`);
  }
}

/**
 * Rate limit tracker for API calls
 */
class RateLimitTracker {
  private requests: Date[] = [];
  private rateLimits: any;

  constructor(rateLimits: any) {
    this.rateLimits = rateLimits;
  }

  canMakeRequest(): boolean {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    // Clean old requests
    this.requests = this.requests.filter(req => req > oneMinuteAgo);
    
    return this.requests.length < this.rateLimits.requestsPerMinute;
  }

  recordRequest(): void {
    this.requests.push(new Date());
  }
}

export default PartnerAPIIntegrationService;