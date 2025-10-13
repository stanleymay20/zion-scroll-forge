import AnalyticsService from '../AnalyticsService';
import { AnalyticsFilters, InterventionAlert } from '../../types/analytics';

// Mock fetch for testing
global.fetch = jest.fn();

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    analyticsService = new AnalyticsService('/api');
    mockFetch.mockClear();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('getDashboardData', () => {
    it('should fetch dashboard data successfully', async () => {
      const mockDashboardData = {
        overview: {
          totalActiveStudents: 15000,
          totalFaculty: 20,
          coursesOffered: 150,
          scrollBadgesIssued: 5000,
          graduationRate: 0.78,
          globalReachCountries: 10,
          averageSpiritualGrowth: 0.85,
          scrollCoinCirculation: 1500000
        },
        studentProgress: [],
        facultyPerformance: [],
        globalImpact: {
          totalStudents: 15000,
          globalReach: {},
          careerPathwayDistribution: {},
          scrollCoinEconomy: {
            totalCirculation: 1500000,
            dailyTransactions: 8000,
            rewardDistribution: {
              courseCompletion: 40,
              peerAssistance: 25,
              sacredTechnology: 20,
              communityBuilding: 15
            },
            economicHealth: 0.9
          },
          kingdomImpact: {
            graduatesInMinistry: 500,
            businessesLaunched: 200,
            nationsServed: 45,
            livesTransformed: 8000,
            socialImpactProjects: 150
          },
          partnershipMetrics: {
            activePartners: 35,
            credentialsRecognized: 800,
            guestLectures: 75,
            collaborativeProjects: 25
          },
          accessibilityMetrics: {
            offlineUsers: 3000,
            meshNetworkNodes: 120,
            solarMicrohubsConnected: 60,
            multilingualUsers: {
              'English': 8000,
              'French': 2000,
              'Twi': 1500
            }
          }
        },
        interventionAlerts: [],
        trends: {
          enrollmentTrends: [],
          completionTrends: [],
          spiritualGrowthTrends: [],
          careerPathwayTrends: [],
          globalExpansionTrends: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData,
      } as Response);

      const filters: AnalyticsFilters = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31')
        }
      };

      const result = await analyticsService.getDashboardData(filters);

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({ filters })
      });

      expect(result).toEqual(mockDashboardData);
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(analyticsService.getDashboardData()).rejects.toThrow('Failed to fetch dashboard data');
    });
  });

  describe('getStudentProgressMetrics', () => {
    it('should fetch student progress metrics', async () => {
      const mockStudentProgress = [
        {
          studentId: 'student_1',
          academicProgress: {
            overallGPA: 3.5,
            courseCompletionRate: 0.8,
            scrollBadgesEarned: 10,
            assessmentScores: [],
            learningVelocity: 85,
            strugglingSubjects: [],
            excelling: ['Prophetic Studies']
          },
          spiritualGrowth: {
            divineScorecard: {
              purpose: 0.9,
              skills: 0.8,
              scrollAlignment: 0.85
            },
            propheticCheckins: {
              frequency: 8,
              visionBoardUpdates: 3,
              intercessionPrompts: 15,
              propheticAccuracy: 0.7
            },
            prayerEngagement: 0.9,
            scriptureKnowledge: 0.8,
            characterDevelopment: {
              integrity: 0.9,
              humility: 0.8,
              faithfulness: 0.85,
              wisdom: 0.75,
              love: 0.9
            },
            kingdomImpact: 75
          },
          careerPathway: {
            selectedTrack: 'ScrollFounder' as any,
            progressPercentage: 65,
            competenciesAchieved: [],
            practicalProjects: [],
            mentorshipHours: 25,
            industryReadiness: 0.7
          },
          interventionAlerts: [],
          lastUpdated: new Date()
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStudentProgress,
      } as Response);

      const result = await analyticsService.getStudentProgressMetrics(['student_1']);

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/student-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({ studentIds: ['student_1'], filters: undefined })
      });

      expect(result).toEqual(mockStudentProgress);
    });
  });

  describe('getFacultyPerformanceMetrics', () => {
    it('should fetch faculty performance metrics', async () => {
      const mockFacultyPerformance = [
        {
          facultyId: 'faculty_1',
          facultyType: 'human' as any,
          studentEngagement: {
            averageSessionDuration: 45,
            responseRate: 0.9,
            studentInteractions: 150,
            feedbackScore: 4.5
          },
          teachingEffectiveness: 0.85,
          spiritualImpartation: 0.8,
          responseTime: 2.5,
          studentSatisfaction: 0.9,
          coursesManaged: 3,
          interventionsTriggered: 5
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFacultyPerformance,
      } as Response);

      const result = await analyticsService.getFacultyPerformanceMetrics(['faculty_1']);

      expect(result).toEqual(mockFacultyPerformance);
    });
  });

  describe('getInterventionAlerts', () => {
    it('should fetch intervention alerts with filters', async () => {
      const mockAlerts: InterventionAlert[] = [
        {
          id: 'alert_1',
          studentId: 'student_1',
          type: 'academic',
          severity: 'high',
          description: 'Student struggling with coursework',
          suggestedActions: ['Schedule tutoring', 'Provide resources'],
          status: 'open',
          createdAt: new Date()
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlerts,
      } as Response);

      const result = await analyticsService.getInterventionAlerts('high', 'open');

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/intervention-alerts?severity=high&status=open', {
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      });

      expect(result).toEqual(mockAlerts);
    });
  });

  describe('updateInterventionAlert', () => {
    it('should update intervention alert', async () => {
      const mockUpdatedAlert: InterventionAlert = {
        id: 'alert_1',
        studentId: 'student_1',
        type: 'academic',
        severity: 'high',
        description: 'Student struggling with coursework',
        suggestedActions: ['Schedule tutoring', 'Provide resources'],
        status: 'in_progress',
        createdAt: new Date(),
        assignedTo: 'faculty_1'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedAlert,
      } as Response);

      const updates = { status: 'in_progress' as const, assignedTo: 'faculty_1' };
      const result = await analyticsService.updateInterventionAlert('alert_1', updates);

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/intervention-alerts/alert_1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(updates)
      });

      expect(result).toEqual(mockUpdatedAlert);
    });
  });

  describe('getCareerPathwayAnalytics', () => {
    it('should fetch career pathway analytics', async () => {
      const mockCareerPathways = [
        {
          pathway: 'ScrollFounder' as any,
          enrollmentCount: 3000,
          completionRate: 75,
          employmentRate: 85,
          impactScore: 8.5
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCareerPathways,
      } as Response);

      const result = await analyticsService.getCareerPathwayAnalytics('ScrollFounder');

      expect(result).toEqual(mockCareerPathways);
    });
  });

  describe('getRealTimeMetrics', () => {
    it('should fetch real-time metrics', async () => {
      const mockRealTimeMetrics = {
        totalActiveStudents: 15000,
        totalFaculty: 20,
        coursesOffered: 150,
        scrollBadgesIssued: 5000,
        graduationRate: 0.78,
        globalReachCountries: 10,
        averageSpiritualGrowth: 0.85,
        scrollCoinCirculation: 1500000
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRealTimeMetrics,
      } as Response);

      const result = await analyticsService.getRealTimeMetrics();

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/realtime', {
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      });

      expect(result).toEqual(mockRealTimeMetrics);
    });
  });

  describe('exportData', () => {
    it('should export data as blob', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response);

      const result = await analyticsService.exportData('student_progress', 'csv');

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({ 
          dataType: 'student_progress', 
          format: 'csv', 
          filters: undefined 
        })
      });

      expect(result).toEqual(mockBlob);
    });
  });
});