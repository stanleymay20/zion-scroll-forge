/**
 * Partner Integration System Tests
 * Tests for Requirements 5.2 and 6.3: Partner institution integration and credential recognition
 */

import PartnershipIntegrationService from '../PartnershipIntegrationService';
import PartnerAPIIntegrationService from '../PartnerAPIIntegrationService';
import CredentialRecognitionService from '../CredentialRecognitionService';
import GuestLecturerSchedulingService from '../GuestLecturerSchedulingService';
import {
  PartnerStatus,
  IntegrationLevel,
  LectureFormat,
  RecognitionLevel,
  RecognitionStatus,
  SessionStatus
} from '../../types/partner-integration';

describe('Partner Integration System', () => {
  let partnershipService: PartnershipIntegrationService;
  let apiService: PartnerAPIIntegrationService;
  let credentialService: CredentialRecognitionService;
  let schedulingService: GuestLecturerSchedulingService;

  beforeEach(() => {
    partnershipService = new PartnershipIntegrationService();
    apiService = new PartnerAPIIntegrationService();
    credentialService = new CredentialRecognitionService();
    schedulingService = new GuestLecturerSchedulingService();
  });

  describe('Partner API Integration Service', () => {
    test('should initialize with default partners', () => {
      expect(apiService).toBeDefined();
    });

    test('should get available guest lecturers', async () => {
      const lecturers = await apiService.getAvailableGuestLecturers('mit-csail');
      expect(Array.isArray(lecturers)).toBe(true);
    });

    test('should filter lecturers by expertise', async () => {
      const lecturers = await apiService.getAvailableGuestLecturers('mit-csail', {
        expertise: ['Artificial Intelligence']
      });
      expect(Array.isArray(lecturers)).toBe(true);
    });

    test('should filter lecturers by spiritual alignment', async () => {
      const lecturers = await apiService.getAvailableGuestLecturers('mit-csail', {
        spiritualAlignment: true
      });
      expect(Array.isArray(lecturers)).toBe(true);
      // All returned lecturers should have spiritual alignment
      lecturers.forEach(lecturer => {
        expect(lecturer.spiritualAlignment.christianWorldview).toBe(true);
        expect(lecturer.spiritualAlignment.scrollPrinciplesAlignment).toBeGreaterThanOrEqual(7);
      });
    });

    test('should test partner connection', async () => {
      const isConnected = await apiService.testPartnerConnection('mit-csail');
      expect(typeof isConnected).toBe('boolean');
    });

    test('should get partnership metrics', async () => {
      const metrics = await apiService.getPartnershipMetrics('mit-csail');
      expect(metrics).toHaveProperty('partnerId');
      expect(metrics).toHaveProperty('totalLectures');
      expect(metrics).toHaveProperty('totalStudentsReached');
      expect(metrics).toHaveProperty('credentialsRecognized');
      expect(metrics).toHaveProperty('satisfactionRating');
      expect(metrics).toHaveProperty('performanceScore');
    });
  });

  describe('Credential Recognition Service', () => {
    test('should initialize with recognition partners', () => {
      const partners = credentialService.getRecognitionPartners();
      expect(Array.isArray(partners)).toBe(true);
      expect(partners.length).toBeGreaterThan(0);
    });

    test('should get partner by ID', () => {
      const partner = credentialService.getPartner('un-sdg-schools');
      expect(partner).toBeDefined();
      expect(partner?.name).toBe('UN Sustainable Development Goals Schools Network');
    });

    test('should submit credential for recognition', async () => {
      const recognition = await credentialService.submitForRecognition(
        'un-sdg-schools',
        'scroll-credential-123',
        'B.A. in Prophetic Governance'
      );
      
      expect(recognition).toHaveProperty('id');
      expect(recognition.partnerId).toBe('un-sdg-schools');
      expect(recognition.scrollCredentialId).toBe('scroll-credential-123');
      expect(recognition.status).toBe(RecognitionStatus.PENDING);
      expect(recognition.recognitionLevel).toBe(RecognitionLevel.FULL_RECOGNITION);
    });

    test('should get recognition requirements', () => {
      const requirements = credentialService.getRecognitionRequirements(
        'un-sdg-schools',
        'B.A. in Prophetic Governance'
      );
      
      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.length).toBeGreaterThan(0);
      expect(requirements[0]).toHaveProperty('type');
      expect(requirements[0]).toHaveProperty('description');
    });

    test('should validate credential eligibility', async () => {
      const validation = await credentialService.validateCredentialEligibility(
        'scroll-credential-123',
        'un-sdg-schools'
      );
      
      expect(validation).toHaveProperty('eligible');
      expect(validation).toHaveProperty('reasons');
      expect(validation).toHaveProperty('recommendedActions');
      expect(typeof validation.eligible).toBe('boolean');
    });

    test('should get recognition analytics', async () => {
      const analytics = await credentialService.getRecognitionAnalytics();
      
      expect(analytics).toHaveProperty('totalSubmissions');
      expect(analytics).toHaveProperty('approvalRate');
      expect(analytics).toHaveProperty('averageProcessingTime');
      expect(analytics).toHaveProperty('topCredentialTypes');
      expect(analytics).toHaveProperty('partnerPerformance');
    });
  });

  describe('Guest Lecturer Scheduling Service', () => {
    test('should get available lecturers', () => {
      const lecturers = schedulingService.getAvailableLecturers();
      expect(Array.isArray(lecturers)).toBe(true);
      expect(lecturers.length).toBeGreaterThan(0);
    });

    test('should filter lecturers by partner', () => {
      const lecturers = schedulingService.getAvailableLecturers({
        partnerId: 'mit-csail'
      });
      expect(Array.isArray(lecturers)).toBe(true);
      lecturers.forEach(lecturer => {
        expect(lecturer.partnerId).toBe('mit-csail');
      });
    });

    test('should filter lecturers by expertise', () => {
      const lecturers = schedulingService.getAvailableLecturers({
        expertise: ['Artificial Intelligence']
      });
      expect(Array.isArray(lecturers)).toBe(true);
      lecturers.forEach(lecturer => {
        expect(lecturer.expertise).toContain('Artificial Intelligence');
      });
    });

    test('should get lecturer by ID', () => {
      const lecturer = schedulingService.getLecturer('mit-prof-johnson');
      expect(lecturer).toBeDefined();
      expect(lecturer?.name).toBe('Dr. Sarah Johnson');
      expect(lecturer?.partnerId).toBe('mit-csail');
    });

    test('should schedule a session', async () => {
      const sessionDetails = {
        lecturerId: 'mit-prof-johnson',
        courseId: 'course-123',
        title: 'AI Ethics in Sacred Technology',
        description: 'Exploring ethical AI development through spiritual principles',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        duration: 90,
        format: LectureFormat.LIVE_VIRTUAL,
        maxAttendees: 50
      };

      const session = await schedulingService.scheduleSession(sessionDetails);
      
      expect(session).toHaveProperty('id');
      expect(session.lecturerId).toBe(sessionDetails.lecturerId);
      expect(session.courseId).toBe(sessionDetails.courseId);
      expect(session.title).toBe(sessionDetails.title);
      expect(session.status).toBe(SessionStatus.SCHEDULED);
      expect(session.registeredStudents).toEqual([]);
    });

    test('should register student for session', async () => {
      // First schedule a session
      const sessionDetails = {
        lecturerId: 'mit-prof-johnson',
        courseId: 'course-123',
        title: 'Test Session',
        description: 'Test description',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        duration: 60,
        format: LectureFormat.LIVE_VIRTUAL,
        maxAttendees: 10
      };

      const session = await schedulingService.scheduleSession(sessionDetails);
      
      // Register a student
      const success = await schedulingService.registerStudentForSession(session.id, 'student-123');
      expect(success).toBe(true);
    });

    test('should get upcoming sessions', () => {
      const upcomingSessions = schedulingService.getUpcomingSessions(7);
      expect(Array.isArray(upcomingSessions)).toBe(true);
    });

    test('should get session analytics', () => {
      const analytics = schedulingService.getSessionAnalytics();
      
      expect(analytics).toHaveProperty('totalSessions');
      expect(analytics).toHaveProperty('completedSessions');
      expect(analytics).toHaveProperty('cancelledSessions');
      expect(analytics).toHaveProperty('averageAttendance');
      expect(analytics).toHaveProperty('topLecturers');
      expect(analytics).toHaveProperty('formatDistribution');
    });
  });

  describe('Partnership Integration Service', () => {
    test('should initialize successfully', async () => {
      await expect(partnershipService.initialize()).resolves.not.toThrow();
    });

    test('should get dashboard data', async () => {
      const dashboardData = await partnershipService.getDashboardData();
      
      expect(dashboardData).toHaveProperty('partners');
      expect(dashboardData).toHaveProperty('lecturers');
      expect(dashboardData).toHaveProperty('upcomingSessions');
      expect(dashboardData).toHaveProperty('recentCredentials');
      expect(dashboardData).toHaveProperty('metrics');
      expect(dashboardData).toHaveProperty('systemHealth');
      
      expect(Array.isArray(dashboardData.partners)).toBe(true);
      expect(Array.isArray(dashboardData.lecturers)).toBe(true);
      expect(Array.isArray(dashboardData.upcomingSessions)).toBe(true);
    });

    test('should get all partners', async () => {
      const partners = await partnershipService.getAllPartners();
      expect(Array.isArray(partners)).toBe(true);
      expect(partners.length).toBeGreaterThan(0);
    });

    test('should get system health', async () => {
      const health = await partnershipService.getSystemHealth();
      
      expect(health).toHaveProperty('overall');
      expect(health).toHaveProperty('activeConnections');
      expect(health).toHaveProperty('totalConnections');
      expect(health).toHaveProperty('healthPercentage');
      expect(health).toHaveProperty('lastChecked');
      expect(health).toHaveProperty('issues');
      
      expect(['healthy', 'warning', 'critical']).toContain(health.overall);
      expect(typeof health.activeConnections).toBe('number');
      expect(typeof health.totalConnections).toBe('number');
      expect(typeof health.healthPercentage).toBe('number');
    });

    test('should schedule guest lecture through main service', async () => {
      const sessionDetails = {
        lecturerId: 'mit-prof-johnson',
        courseId: 'course-456',
        title: 'Sacred AI Development',
        description: 'Building AI systems aligned with kingdom principles',
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        duration: 120,
        format: LectureFormat.XR_IMMERSIVE,
        maxAttendees: 30
      };

      const session = await partnershipService.scheduleGuestLecture(sessionDetails);
      
      expect(session).toHaveProperty('id');
      expect(session.lecturerId).toBe(sessionDetails.lecturerId);
      expect(session.status).toBe(SessionStatus.SCHEDULED);
    });

    test('should submit credential for recognition through main service', async () => {
      const recognition = await partnershipService.submitCredentialForRecognition(
        'christian-ngos',
        'scroll-credential-456',
        'M.Div in Scroll Theology'
      );
      
      expect(recognition).toHaveProperty('id');
      expect(recognition.partnerId).toBe('christian-ngos');
      expect(recognition.status).toBe(RecognitionStatus.PENDING);
    });

    test('should get partnership metrics', async () => {
      const metrics = await partnershipService.getAllPartnershipMetrics();
      expect(Array.isArray(metrics)).toBe(true);
    });

    test('should perform bulk operations', async () => {
      const syncResults = await partnershipService.bulkSyncAllPartners();
      expect(syncResults).toHaveProperty('successful');
      expect(syncResults).toHaveProperty('failed');
      expect(Array.isArray(syncResults.successful)).toBe(true);
      expect(Array.isArray(syncResults.failed)).toBe(true);

      const connectionResults = await partnershipService.bulkTestConnections();
      expect(connectionResults).toHaveProperty('connected');
      expect(connectionResults).toHaveProperty('disconnected');
      expect(Array.isArray(connectionResults.connected)).toBe(true);
      expect(Array.isArray(connectionResults.disconnected)).toBe(true);
    });
  });

  describe('Integration Requirements Validation', () => {
    test('should meet Requirement 5.2: Partner institution integration', async () => {
      // Test API integration with MIT, Oxford, Ghana Tech Alliance
      const mitConnection = await apiService.testPartnerConnection('mit-csail');
      const oxfordConnection = await apiService.testPartnerConnection('oxford-university');
      const ghanaConnection = await apiService.testPartnerConnection('ghana-tech-alliance');
      
      expect(typeof mitConnection).toBe('boolean');
      expect(typeof oxfordConnection).toBe('boolean');
      expect(typeof ghanaConnection).toBe('boolean');

      // Test guest lecturer scheduling
      const lecturers = await apiService.getAvailableGuestLecturers('mit-csail');
      expect(Array.isArray(lecturers)).toBe(true);

      // Test content delivery capability
      const sessionDetails = {
        lecturerId: 'mit-prof-johnson',
        courseId: 'test-course',
        title: 'Test Lecture',
        description: 'Test description',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        duration: 60,
        format: LectureFormat.LIVE_VIRTUAL,
        maxAttendees: 25
      };

      const session = await schedulingService.scheduleSession(sessionDetails);
      expect(session.status).toBe(SessionStatus.SCHEDULED);
    });

    test('should meet Requirement 6.3: Credential recognition system', async () => {
      // Test integration with UN SDG Schools, Christian NGOs, Tech for Good Hubs, startup incubators
      const partners = credentialService.getRecognitionPartners();
      const partnerTypes = partners.map(p => p.name);
      
      expect(partnerTypes).toContain('UN Sustainable Development Goals Schools Network');
      expect(partnerTypes).toContain('Global Christian NGOs Alliance');
      expect(partnerTypes).toContain('Tech for Good Global Network');
      expect(partnerTypes).toContain('Global Startup Incubators Alliance');

      // Test credential submission and recognition
      const recognition = await credentialService.submitForRecognition(
        'un-sdg-schools',
        'test-credential',
        'B.A. in Prophetic Governance'
      );
      
      expect(recognition.status).toBe(RecognitionStatus.PENDING);
      expect(recognition.recognitionLevel).toBe(RecognitionLevel.FULL_RECOGNITION);

      // Test requirements system
      const requirements = credentialService.getRecognitionRequirements(
        'un-sdg-schools',
        'B.A. in Prophetic Governance'
      );
      
      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.length).toBeGreaterThan(0);
    });

    test('should provide partnership management dashboard functionality', async () => {
      const dashboardData = await partnershipService.getDashboardData();
      
      // Verify all required dashboard components are present
      expect(dashboardData.partners.length).toBeGreaterThan(0);
      expect(Array.isArray(dashboardData.lecturers)).toBe(true);
      expect(Array.isArray(dashboardData.upcomingSessions)).toBe(true);
      expect(Array.isArray(dashboardData.recentCredentials)).toBe(true);
      expect(Array.isArray(dashboardData.metrics)).toBe(true);
      expect(dashboardData.systemHealth).toHaveProperty('overall');
    });
  });
});