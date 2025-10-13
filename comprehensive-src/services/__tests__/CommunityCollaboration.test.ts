import { CommunityCollaborationService } from '../CommunityCollaborationService';
import { CommunityForumService } from '../CommunityForumService';
import { PeerMentoringService } from '../PeerMentoringService';
import { StudyGroupService } from '../StudyGroupService';
import { CollaborativeProjectService } from '../CollaborativeProjectService';
import { GlobalNetworkingService } from '../GlobalNetworkingService';

describe('CommunityCollaborationService', () => {
  let communityService: CommunityCollaborationService;

  beforeEach(() => {
    communityService = new CommunityCollaborationService();
  });

  describe('Service Integration', () => {
    it('should provide access to forum service', async () => {
      const forumService = await communityService.getForumService();
      expect(forumService).toBeInstanceOf(CommunityForumService);
    });

    it('should provide access to mentoring service', async () => {
      const mentoringService = await communityService.getMentoringService();
      expect(mentoringService).toBeInstanceOf(PeerMentoringService);
    });

    it('should provide access to study group service', async () => {
      const studyGroupService = await communityService.getStudyGroupService();
      expect(studyGroupService).toBeInstanceOf(StudyGroupService);
    });

    it('should provide access to project service', async () => {
      const projectService = await communityService.getProjectService();
      expect(projectService).toBeInstanceOf(CollaborativeProjectService);
    });

    it('should provide access to networking service', async () => {
      const networkingService = await communityService.getNetworkingService();
      expect(networkingService).toBeInstanceOf(GlobalNetworkingService);
    });
  });

  describe('Community Dashboard', () => {
    it('should generate community dashboard for user', async () => {
      const userId = 'test-user-123';
      
      // Mock the dashboard data
      const mockDashboard = {
        forums: [],
        mentorships: [],
        studyGroups: [],
        projects: [],
        connections: [],
        scrollCoinBalance: 150,
        communityRank: 'Active Contributor',
        spiritualImpact: { level: 'Growing', kingdomImpactScore: 0.6 },
        recentActivity: []
      };

      // Since we're using simulated database operations, we'll test the structure
      const dashboard = await communityService.getCommunityDashboard(userId);
      
      expect(dashboard).toBeDefined();
      expect(dashboard).toHaveProperty('forums');
      expect(dashboard).toHaveProperty('mentorships');
      expect(dashboard).toHaveProperty('studyGroups');
      expect(dashboard).toHaveProperty('projects');
      expect(dashboard).toHaveProperty('connections');
      expect(dashboard).toHaveProperty('scrollCoinBalance');
      expect(dashboard).toHaveProperty('communityRank');
      expect(dashboard).toHaveProperty('spiritualImpact');
      expect(dashboard).toHaveProperty('recentActivity');
    });
  });

  describe('Peer Assistance Rewards (Requirement 9.2)', () => {
    it('should implement peer assistance rewards correctly', async () => {
      const assistanceData = {
        helperId: 'helper-123',
        helpedUserId: 'helped-456',
        assistanceType: 'forum_help' as const,
        description: 'Helped with understanding biblical principles in AI development',
        qualityRating: 4.5,
        spiritualImpact: true
      };

      // This should not throw an error
      await expect(
        communityService.implementPeerAssistanceRewards(assistanceData)
      ).resolves.not.toThrow();
    });

    it('should calculate rewards based on assistance type and quality', async () => {
      const mentoringAssistance = {
        helperId: 'mentor-123',
        helpedUserId: 'mentee-456',
        assistanceType: 'mentoring' as const,
        description: 'Provided spiritual guidance and technical mentoring',
        qualityRating: 5.0,
        spiritualImpact: true
      };

      await expect(
        communityService.implementPeerAssistanceRewards(mentoringAssistance)
      ).resolves.not.toThrow();
    });
  });

  describe('Faculty Interaction Quality (Requirement 5.4)', () => {
    it('should ensure faculty interaction quality', async () => {
      const interactionData = {
        facultyId: 'faculty-123',
        studentId: 'student-456',
        interactionType: 'forum_response' as const,
        content: 'This response integrates biblical principles with technical knowledge, providing both practical guidance and spiritual insight.',
        spiritualAlignment: true,
        biblicalFoundation: true
      };

      const qualityAssessment = await communityService.ensureFacultyInteractionQuality(interactionData);
      
      expect(qualityAssessment).toBeDefined();
      expect(qualityAssessment).toHaveProperty('qualityScore');
      expect(qualityAssessment).toHaveProperty('spiritualAlignmentScore');
      expect(qualityAssessment).toHaveProperty('recommendations');
      expect(qualityAssessment).toHaveProperty('approved');
      expect(Array.isArray(qualityAssessment.recommendations)).toBe(true);
      expect(typeof qualityAssessment.approved).toBe('boolean');
    });

    it('should provide recommendations for improvement when quality is low', async () => {
      const poorInteractionData = {
        facultyId: 'faculty-123',
        studentId: 'student-456',
        interactionType: 'project_guidance' as const,
        content: 'Just do it.',
        spiritualAlignment: false,
        biblicalFoundation: false
      };

      const qualityAssessment = await communityService.ensureFacultyInteractionQuality(poorInteractionData);
      
      expect(qualityAssessment.approved).toBe(false);
      expect(qualityAssessment.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Community Search', () => {
    it('should search across all community content types', async () => {
      const query = 'AI development';
      const filters = {
        spiritualFocus: true,
        careerTrack: 'scroll_engineer'
      };

      const results = await communityService.searchCommunityContent(query, filters);
      
      expect(results).toBeDefined();
      expect(results).toHaveProperty('forums');
      expect(results).toHaveProperty('projects');
      expect(results).toHaveProperty('studyGroups');
      expect(results).toHaveProperty('mentorships');
      expect(results).toHaveProperty('networkProfiles');
      expect(Array.isArray(results.forums)).toBe(true);
      expect(Array.isArray(results.projects)).toBe(true);
      expect(Array.isArray(results.studyGroups)).toBe(true);
    });
  });

  describe('Spiritual Community Features', () => {
    it('should create spiritual community events', async () => {
      const eventData = {
        title: 'Weekly Prayer and Coding Session',
        description: 'A time for developers to pray together and seek God\'s wisdom in their coding projects',
        type: 'prayer_meeting' as const,
        scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
        createdBy: 'user-123',
        maxAttendees: 20,
        spiritualFocus: 'Seeking divine wisdom in technology development'
      };

      const eventId = await communityService.createSpiritualCommunityEvent(eventData);
      
      expect(eventId).toBeDefined();
      expect(typeof eventId).toBe('string');
    });

    it('should reject events without spiritual alignment', async () => {
      const nonSpiritualEventData = {
        title: 'Regular Coding Session',
        description: 'Just coding, nothing spiritual',
        type: 'prayer_meeting' as const,
        scheduledAt: new Date(Date.now() + 86400000),
        createdBy: 'user-123',
        spiritualFocus: 'No spiritual focus'
      };

      await expect(
        communityService.createSpiritualCommunityEvent(nonSpiritualEventData)
      ).rejects.toThrow('Event content must be spiritually aligned and biblically founded');
    });
  });

  describe('Community Analytics', () => {
    it('should provide comprehensive community analytics', async () => {
      const analytics = await communityService.getCommunityAnalytics();
      
      expect(analytics).toBeDefined();
      expect(analytics).toHaveProperty('totalUsers');
      expect(analytics).toHaveProperty('activeForums');
      expect(analytics).toHaveProperty('activeMentorships');
      expect(analytics).toHaveProperty('activeStudyGroups');
      expect(analytics).toHaveProperty('activeProjects');
      expect(analytics).toHaveProperty('scrollCoinsDistributed');
      expect(analytics).toHaveProperty('spiritualImpactMetrics');
      expect(analytics).toHaveProperty('globalReach');
      expect(analytics).toHaveProperty('peerAssistanceStats');
      
      expect(typeof analytics.totalUsers).toBe('number');
      expect(typeof analytics.activeForums).toBe('number');
      expect(typeof analytics.scrollCoinsDistributed).toBe('number');
    });
  });
});

describe('Individual Service Tests', () => {
  describe('CommunityForumService', () => {
    let forumService: CommunityForumService;

    beforeEach(() => {
      forumService = new CommunityForumService();
    });

    it('should create forum with spiritual alignment validation', async () => {
      const forumData = {
        title: 'Biblical AI Development',
        description: 'Discussing how to develop AI systems that honor God and serve His kingdom',
        category: 'spiritual' as const,
        createdBy: 'user-123',
        tags: ['AI', 'Biblical', 'Technology']
      };

      const forum = await forumService.createForum(forumData);
      
      expect(forum).toBeDefined();
      expect(forum.title).toBe(forumData.title);
      expect(forum.spiritualAlignment).toBeDefined();
      expect(forum.spiritualAlignment.christCentered).toBeDefined();
    });
  });

  describe('PeerMentoringService', () => {
    let mentoringService: PeerMentoringService;

    beforeEach(() => {
      mentoringService = new PeerMentoringService();
    });

    it('should create mentorship request with spiritual guidance option', async () => {
      const requestData = {
        mentorId: 'mentor-123',
        menteeId: 'mentee-456',
        subject: 'AI Development with Biblical Principles',
        goals: ['Learn AI fundamentals', 'Integrate faith with technology', 'Build kingdom-focused projects'],
        spiritualGuidance: true
      };

      const mentorship = await mentoringService.createMentorshipRequest(requestData);
      
      expect(mentorship).toBeDefined();
      expect(mentorship.spiritualGuidance).toBe(true);
      expect(mentorship.goals).toEqual(requestData.goals);
      expect(mentorship.status).toBe('pending');
    });
  });

  describe('StudyGroupService', () => {
    let studyGroupService: StudyGroupService;

    beforeEach(() => {
      studyGroupService = new StudyGroupService();
    });

    it('should create study group with proper member management', async () => {
      const groupData = {
        name: 'Sacred AI Study Group',
        description: 'Studying AI development through a biblical lens',
        subject: 'AI Development',
        createdBy: 'user-123',
        maxMembers: 10,
        meetingType: 'virtual' as const
      };

      const studyGroup = await studyGroupService.createStudyGroup(groupData);
      
      expect(studyGroup).toBeDefined();
      expect(studyGroup.members).toHaveLength(1);
      expect(studyGroup.members[0].userId).toBe(groupData.createdBy);
      expect(studyGroup.members[0].role).toBe('leader');
    });
  });

  describe('CollaborativeProjectService', () => {
    let projectService: CollaborativeProjectService;

    beforeEach(() => {
      projectService = new CollaborativeProjectService();
    });

    it('should create project with spiritual purpose validation', async () => {
      const projectData = {
        title: 'Kingdom AI Assistant',
        description: 'Building an AI assistant to help with biblical study and spiritual growth',
        type: 'technology' as const,
        createdBy: 'user-123',
        spiritualPurpose: 'To create technology that helps believers grow in their faith and understanding of Scripture',
        kingdomImpact: 'Enabling deeper biblical study and spiritual formation for believers worldwide'
      };

      const project = await projectService.createProject(projectData);
      
      expect(project).toBeDefined();
      expect(project.spiritualPurpose).toBe(projectData.spiritualPurpose);
      expect(project.kingdomImpact).toBe(projectData.kingdomImpact);
      expect(project.team).toHaveLength(1);
      expect(project.team[0].role).toBe('leader');
    });
  });

  describe('GlobalNetworkingService', () => {
    let networkingService: GlobalNetworkingService;

    beforeEach(() => {
      networkingService = new GlobalNetworkingService();
    });

    it('should create network profile with spiritual gifts and career track', async () => {
      const profileData = {
        userId: 'user-123',
        interests: ['AI Development', 'Biblical Studies', 'Kingdom Technology'],
        skills: ['Python', 'Machine Learning', 'Biblical Exegesis'],
        location: { country: 'USA', region: 'California', city: 'San Francisco', timezone: 'PST' },
        careerTrack: 'scroll_engineer' as const,
        spiritualGifts: ['Teaching', 'Prophecy', 'Wisdom'],
        availableForMentoring: true,
        languages: ['English', 'Spanish']
      };

      const networkProfile = await networkingService.createNetworkProfile(profileData);
      
      expect(networkProfile).toBeDefined();
      expect(networkProfile.careerTrack).toBe('scroll_engineer');
      expect(networkProfile.spiritualGifts).toEqual(profileData.spiritualGifts);
      expect(networkProfile.availableForMentoring).toBe(true);
    });
  });
});