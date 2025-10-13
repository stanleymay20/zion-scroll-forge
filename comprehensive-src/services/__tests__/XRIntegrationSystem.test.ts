/**
 * XR Integration System Tests
 * Tests for XR content management, WebXR integration, classroom environments, and angelic tutors
 */

import XRContentManagementService from '../XRContentManagementService';
import WebXRIntegrationService from '../WebXRIntegrationService';
import XRClassroomService from '../XRClassroomService';
import AngelicTutorService from '../AngelicTutorService';
import {
  XRSceneType,
  XRCategory,
  XRDeviceType,
  TutorInteractionType,
  ClassroomLayoutType
} from '../../types/xr';

// Mock WebXR API
const mockXRSystem = {
  isSessionSupported: jest.fn(),
  requestSession: jest.fn()
};

// Mock navigator.xr
Object.defineProperty(global.navigator, 'xr', {
  value: mockXRSystem,
  writable: true
});

describe('XRContentManagementService', () => {
  let contentService: XRContentManagementService;

  beforeEach(() => {
    contentService = new XRContentManagementService();
  });

  describe('Scene Management', () => {
    test('should initialize with default scenes', () => {
      const scenes = contentService.getScenes();
      expect(scenes.length).toBeGreaterThan(0);
      
      // Check for biblical scenes
      const biblicalScenes = scenes.filter(scene => scene.type === XRSceneType.BIBLICAL);
      expect(biblicalScenes.length).toBeGreaterThan(0);
      
      // Check for scientific scenes
      const scientificScenes = scenes.filter(scene => scene.type === XRSceneType.SCIENTIFIC);
      expect(scientificScenes.length).toBeGreaterThan(0);
      
      // Check for classroom scenes
      const classroomScenes = scenes.filter(scene => scene.type === XRSceneType.CLASSROOM);
      expect(classroomScenes.length).toBeGreaterThan(0);
    });

    test('should filter scenes by type', () => {
      const biblicalScenes = contentService.getScenes({ type: XRSceneType.BIBLICAL });
      expect(biblicalScenes.every(scene => scene.type === XRSceneType.BIBLICAL)).toBe(true);
    });

    test('should filter scenes by category', () => {
      const immersiveScenes = contentService.getScenes({ category: XRCategory.IMMERSIVE_EXPERIENCE });
      expect(immersiveScenes.every(scene => scene.category === XRCategory.IMMERSIVE_EXPERIENCE)).toBe(true);
    });

    test('should get specific scene by ID', () => {
      const scenes = contentService.getScenes();
      const firstScene = scenes[0];
      const retrievedScene = contentService.getScene(firstScene.id);
      
      expect(retrievedScene).toBeDefined();
      expect(retrievedScene?.id).toBe(firstScene.id);
    });

    test('should return null for non-existent scene', () => {
      const scene = contentService.getScene('non-existent-id');
      expect(scene).toBeNull();
    });
  });

  describe('Angelic Tutor Management', () => {
    test('should initialize with default angelic tutors', () => {
      const tutors = contentService.getAngelicTutors();
      expect(tutors.length).toBeGreaterThan(0);
      
      // Check for Gabriel
      const gabriel = tutors.find(tutor => tutor.name === 'Gabriel');
      expect(gabriel).toBeDefined();
      expect(gabriel?.personality.primaryTrait).toBe('Wisdom');
    });

    test('should get specific tutor by ID', () => {
      const tutors = contentService.getAngelicTutors();
      const firstTutor = tutors[0];
      const retrievedTutor = contentService.getAngelicTutor(firstTutor.id);
      
      expect(retrievedTutor).toBeDefined();
      expect(retrievedTutor?.id).toBe(firstTutor.id);
    });
  });

  describe('XR Session Management', () => {
    test('should start XR session successfully', async () => {
      const scenes = contentService.getScenes();
      const firstScene = scenes[0];
      
      const sessionResponse = await contentService.startXRSession(
        'test-user',
        firstScene.id,
        XRDeviceType.WEB_XR
      );
      
      expect(sessionResponse.sessionId).toBeDefined();
      expect(sessionResponse.sceneData.id).toBe(firstScene.id);
      expect(sessionResponse.userProgress).toBeDefined();
      expect(sessionResponse.recommendations).toBeDefined();
    });

    test('should throw error for non-existent scene', async () => {
      await expect(
        contentService.startXRSession('test-user', 'non-existent-scene', XRDeviceType.WEB_XR)
      ).rejects.toThrow('Scene not found');
    });

    test('should update session progress', async () => {
      const scenes = contentService.getScenes();
      const sessionResponse = await contentService.startXRSession(
        'test-user',
        scenes[0].id,
        XRDeviceType.WEB_XR
      );
      
      expect(() => {
        contentService.updateSessionProgress(sessionResponse.sessionId, {
          currentStep: 1,
          engagementScore: 0.8
        });
      }).not.toThrow();
    });

    test('should add spiritual insight to session', async () => {
      const scenes = contentService.getScenes();
      const sessionResponse = await contentService.startXRSession(
        'test-user',
        scenes[0].id,
        XRDeviceType.WEB_XR
      );
      
      expect(() => {
        contentService.addSpiritualInsight(sessionResponse.sessionId, {
          insight: 'God reveals His nature through creation',
          biblicalReference: 'Romans 1:20',
          personalApplication: 'Look for God in everyday moments',
          prayerPoint: 'Thank God for His creative power'
        });
      }).not.toThrow();
    });
  });
});

describe('WebXRIntegrationService', () => {
  let webxrService: WebXRIntegrationService;

  beforeEach(() => {
    webxrService = new WebXRIntegrationService();
    
    // Reset mocks
    mockXRSystem.isSessionSupported.mockReset();
    mockXRSystem.requestSession.mockReset();
  });

  describe('Capability Detection', () => {
    test('should detect WebXR support', () => {
      mockXRSystem.isSessionSupported.mockResolvedValue(true);
      
      const capabilities = webxrService.getCapabilities();
      expect(capabilities).toBeDefined();
    });

    test('should handle lack of WebXR support', () => {
      // Remove WebXR from navigator
      Object.defineProperty(global.navigator, 'xr', {
        value: undefined,
        writable: true
      });
      
      const newService = new WebXRIntegrationService();
      expect(newService.isSupported()).toBe(false);
      
      // Restore for other tests
      Object.defineProperty(global.navigator, 'xr', {
        value: mockXRSystem,
        writable: true
      });
    });

    test('should get device information', () => {
      const deviceInfo = webxrService.getDeviceInfo();
      expect(deviceInfo).toBeDefined();
      expect(deviceInfo?.type).toBeDefined();
      expect(deviceInfo?.capabilities).toBeDefined();
    });
  });

  describe('Session Management', () => {
    test('should recommend appropriate session mode', () => {
      const mode = webxrService.getRecommendedSessionMode();
      expect(['immersive-vr', 'immersive-ar', 'inline']).toContain(mode);
    });

    test('should optimize scene for device', () => {
      const mockScene = {
        id: 'test-scene',
        title: 'Test Scene',
        description: 'Test description',
        type: XRSceneType.BIBLICAL,
        category: XRCategory.IMMERSIVE_EXPERIENCE,
        content: {
          assets: [],
          environment: {
            skybox: 'test-skybox',
            lighting: {
              type: 'directional' as const,
              intensity: 0.8,
              color: '#FFFFFF',
              shadows: true
            },
            physics: {
              enabled: true,
              gravity: 9.81,
              collisionDetection: true
            },
            boundaries: []
          },
          characters: [],
          narrativeFlow: [],
          learningObjectives: [],
          spiritualObjectives: []
        },
        interactions: [],
        metadata: {
          duration: 1800,
          difficulty: 'beginner' as const,
          prerequisites: [],
          tags: [],
          spiritualThemes: [],
          biblicalReferences: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0'
        },
        accessibility: {
          subtitles: true,
          audioDescription: true,
          signLanguage: false,
          colorBlindSupport: true,
          motionSensitivity: 'low' as const,
          alternativeInputs: []
        }
      };

      const optimizedScene = webxrService.optimizeSceneForDevice(mockScene);
      expect(optimizedScene).toBeDefined();
      expect(optimizedScene.id).toBe(mockScene.id);
    });
  });
});

describe('XRClassroomService', () => {
  let classroomService: XRClassroomService;

  beforeEach(() => {
    classroomService = new XRClassroomService();
  });

  describe('Classroom Layout Management', () => {
    test('should initialize with default classroom layouts', () => {
      const layouts = classroomService.getClassroomLayouts();
      expect(layouts.length).toBeGreaterThan(0);
      
      // Check for amphitheater layout
      const amphitheater = layouts.find(layout => layout.layout === ClassroomLayoutType.AMPHITHEATER);
      expect(amphitheater).toBeDefined();
      expect(amphitheater?.capacity).toBeGreaterThan(0);
    });

    test('should create classroom scene from layout', () => {
      const layouts = classroomService.getClassroomLayouts();
      const firstLayout = layouts[0];
      
      const scene = classroomService.createClassroomScene(firstLayout.id);
      expect(scene).toBeDefined();
      expect(scene.type).toBe(XRSceneType.CLASSROOM);
      expect(scene.category).toBe(XRCategory.VIRTUAL_LECTURE);
    });

    test('should throw error for non-existent layout', () => {
      expect(() => {
        classroomService.createClassroomScene('non-existent-layout');
      }).toThrow('Classroom layout not found');
    });
  });

  describe('Virtual Lecture Management', () => {
    test('should start virtual lecture', async () => {
      const layouts = classroomService.getClassroomLayouts();
      const mockLecture = {
        title: 'Test Lecture',
        instructor: {
          id: 'test-instructor',
          name: 'Test Instructor',
          type: 'ai_professor' as const,
          model: 'professor-model',
          animations: [],
          voiceProfile: {
            language: 'en',
            accent: 'neutral',
            tone: 'authoritative' as const,
            speed: 1.0,
            pitch: 1.0
          },
          personality: {
            traits: ['knowledgeable'],
            teachingStyle: 'expository',
            spiritualGifts: [],
            culturalBackground: 'academic',
            expertise: ['theology']
          },
          interactions: []
        },
        classroom: layouts[0],
        duration: 3600,
        maxParticipants: 50,
        content: {
          slides: [],
          demonstrations: [],
          discussions: [],
          assessments: []
        },
        interactiveElements: [],
        spiritualComponents: []
      };

      const lecture = await classroomService.startVirtualLecture(mockLecture);
      expect(lecture).toBeDefined();
      expect(lecture.id).toBeDefined();
      expect(lecture.currentParticipants).toEqual([]);
    });

    test('should allow students to join lecture', async () => {
      const layouts = classroomService.getClassroomLayouts();
      const mockLecture = {
        title: 'Test Lecture',
        instructor: {
          id: 'test-instructor',
          name: 'Test Instructor',
          type: 'ai_professor' as const,
          model: 'professor-model',
          animations: [],
          voiceProfile: {
            language: 'en',
            accent: 'neutral',
            tone: 'authoritative' as const,
            speed: 1.0,
            pitch: 1.0
          },
          personality: {
            traits: ['knowledgeable'],
            teachingStyle: 'expository',
            spiritualGifts: [],
            culturalBackground: 'academic',
            expertise: ['theology']
          },
          interactions: []
        },
        classroom: layouts[0],
        duration: 3600,
        maxParticipants: 50,
        content: {
          slides: [],
          demonstrations: [],
          discussions: [],
          assessments: []
        },
        interactiveElements: [],
        spiritualComponents: []
      };

      const lecture = await classroomService.startVirtualLecture(mockLecture);
      
      const mockAvatar = {
        model: 'student-avatar',
        customization: {
          skinTone: 'medium',
          hairColor: 'brown',
          clothing: 'casual',
          accessories: [],
          culturalElements: []
        },
        animations: [],
        expressions: []
      };

      const student = await classroomService.joinVirtualLecture(
        lecture.id,
        'test-user',
        mockAvatar
      );

      expect(student).toBeDefined();
      expect(student.userId).toBe('test-user');
      expect(student.position).toBeDefined();
    });
  });
});

describe('AngelicTutorService', () => {
  let tutorService: AngelicTutorService;

  beforeEach(() => {
    tutorService = new AngelicTutorService();
  });

  describe('Tutor Management', () => {
    test('should initialize with default angelic tutors', () => {
      const tutors = tutorService.getAvailableTutors();
      expect(tutors.length).toBeGreaterThan(0);
      
      // Check for Gabriel
      const gabriel = tutors.find(tutor => tutor.name === 'Gabriel');
      expect(gabriel).toBeDefined();
      expect(gabriel?.spiritualGifts.length).toBeGreaterThan(0);
    });

    test('should assign tutor to session', () => {
      const tutors = tutorService.getAvailableTutors();
      const firstTutor = tutors[0];
      
      const assignedTutor = tutorService.assignTutorToSession('test-session', firstTutor.id);
      expect(assignedTutor).toBeDefined();
      expect(assignedTutor.id).toBe(firstTutor.id);
    });

    test('should auto-assign tutor when none specified', () => {
      const assignedTutor = tutorService.assignTutorToSession('test-session');
      expect(assignedTutor).toBeDefined();
    });
  });

  describe('Tutor Interactions', () => {
    test('should process greeting interaction', async () => {
      const tutors = tutorService.getAvailableTutors();
      const tutor = tutorService.assignTutorToSession('test-session', tutors[0].id);
      
      const interaction = await tutorService.processInteraction(
        'test-session',
        'test-user',
        'Hello',
        TutorInteractionType.GREETING
      );

      expect(interaction).toBeDefined();
      expect(interaction.type).toBe(TutorInteractionType.GREETING);
      expect(interaction.tutorResponse.text).toBeDefined();
      expect(interaction.effectiveness).toBeGreaterThan(0);
    });

    test('should process question interaction', async () => {
      const tutors = tutorService.getAvailableTutors();
      tutorService.assignTutorToSession('test-session', tutors[0].id);
      
      const interaction = await tutorService.processInteraction(
        'test-session',
        'test-user',
        'What does the Bible say about wisdom?',
        TutorInteractionType.QUESTION
      );

      expect(interaction).toBeDefined();
      expect(interaction.type).toBe(TutorInteractionType.QUESTION);
      expect(interaction.tutorResponse.biblicalReferences.length).toBeGreaterThan(0);
      expect(interaction.tutorResponse.spiritualApplication).toBeDefined();
    });

    test('should process prayer interaction', async () => {
      const tutors = tutorService.getAvailableTutors();
      tutorService.assignTutorToSession('test-session', tutors[0].id);
      
      const interaction = await tutorService.processInteraction(
        'test-session',
        'test-user',
        'Can we pray together?',
        TutorInteractionType.PRAYER
      );

      expect(interaction).toBeDefined();
      expect(interaction.type).toBe(TutorInteractionType.PRAYER);
      expect(interaction.tutorResponse.text).toContain('prayer');
    });

    test('should generate spiritual insight from interaction', async () => {
      const tutors = tutorService.getAvailableTutors();
      tutorService.assignTutorToSession('test-session', tutors[0].id);
      
      const interaction = await tutorService.processInteraction(
        'test-session',
        'test-user',
        'How can I grow spiritually?',
        TutorInteractionType.GUIDANCE
      );

      const insight = tutorService.generateSpiritualInsight(interaction);
      expect(insight).toBeDefined();
      expect(insight.insight).toBeDefined();
      expect(insight.personalApplication).toBeDefined();
    });
  });

  describe('Session Management', () => {
    test('should track session interactions', async () => {
      const tutors = tutorService.getAvailableTutors();
      tutorService.assignTutorToSession('test-session', tutors[0].id);
      
      await tutorService.processInteraction(
        'test-session',
        'test-user',
        'Hello',
        TutorInteractionType.GREETING
      );

      await tutorService.processInteraction(
        'test-session',
        'test-user',
        'What is faith?',
        TutorInteractionType.QUESTION
      );

      const interactions = tutorService.getSessionInteractions('test-session');
      expect(interactions.length).toBe(2);
    });

    test('should end tutor session', () => {
      const tutors = tutorService.getAvailableTutors();
      tutorService.assignTutorToSession('test-session', tutors[0].id);
      
      expect(() => {
        tutorService.endTutorSession('test-session');
      }).not.toThrow();
    });
  });
});

describe('XR Integration System', () => {
  test('should integrate all XR services', () => {
    const contentService = new XRContentManagementService();
    const webxrService = new WebXRIntegrationService();
    const classroomService = new XRClassroomService();
    const tutorService = new AngelicTutorService();

    // Test that all services are properly initialized
    expect(contentService.getScenes().length).toBeGreaterThan(0);
    expect(webxrService.getCapabilities()).toBeDefined();
    expect(classroomService.getClassroomLayouts().length).toBeGreaterThan(0);
    expect(tutorService.getAvailableTutors().length).toBeGreaterThan(0);
  });

  test('should support end-to-end XR experience flow', async () => {
    const contentService = new XRContentManagementService();
    const tutorService = new AngelicTutorService();

    // 1. Get available scenes
    const scenes = contentService.getScenes({ type: XRSceneType.BIBLICAL });
    expect(scenes.length).toBeGreaterThan(0);

    // 2. Start XR session
    const sessionResponse = await contentService.startXRSession(
      'test-user',
      scenes[0].id,
      XRDeviceType.WEB_XR
    );
    expect(sessionResponse.sessionId).toBeDefined();

    // 3. Assign angelic tutor
    const tutors = tutorService.getAvailableTutors();
    const assignedTutor = tutorService.assignTutorToSession(
      sessionResponse.sessionId,
      tutors[0].id
    );
    expect(assignedTutor).toBeDefined();

    // 4. Process tutor interaction
    const interaction = await tutorService.processInteraction(
      sessionResponse.sessionId,
      'test-user',
      'Help me understand this biblical scene',
      TutorInteractionType.QUESTION
    );
    expect(interaction).toBeDefined();

    // 5. Update session progress
    contentService.updateSessionProgress(sessionResponse.sessionId, {
      currentStep: 1,
      engagementScore: 0.9
    });

    // 6. Add spiritual insight
    contentService.addSpiritualInsight(sessionResponse.sessionId, {
      insight: 'God\'s presence is evident in this biblical narrative',
      biblicalReference: 'Psalm 139:7-10',
      personalApplication: 'Recognize God\'s presence in daily life'
    });

    // 7. End session
    const endedSession = await contentService.endXRSession(sessionResponse.sessionId);
    expect(endedSession.endTime).toBeDefined();
  });
});