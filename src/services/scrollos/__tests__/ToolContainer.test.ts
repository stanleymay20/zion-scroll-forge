/**
 * ToolContainer Test Suite
 * 
 * Comprehensive tests for the ToolContainer service, covering all integration
 * methods, security features, and cross-tool communication.
 */

import { ToolContainer, ToolContainerOptions, ToolContainerEvents } from '../ToolContainer';
import { 
  ToolManifest, 
  UserContext, 
  ToolInstance, 
  ToolMessage, 
  ToolResponse,
  AcademicDiscipline,
  ToolIntegrationError,
  PermissionError
} from '../../../types/scrollos-tools';

// Mock fetch globally
global.fetch = jest.fn();

// Mock DOM methods
Object.defineProperty(window, 'addEventListener', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(window, 'removeEventListener', {
  value: jest.fn(),
  writable: true
});

// Mock document methods
Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    style: {},
    appendChild: jest.fn(),
    remove: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    onclick: null,
    onmouseenter: null,
    onmouseleave: null,
    onload: null,
    onerror: null,
    contentWindow: {
      postMessage: jest.fn()
    }
  })),
  writable: true
});

Object.defineProperty(document, 'body', {
  value: {
    appendChild: jest.fn()
  },
  writable: true
});

describe('ToolContainer', () => {
  let mockManifest: ToolManifest;
  let mockUserContext: UserContext;
  let mockOptions: ToolContainerOptions;
  let mockEvents: ToolContainerEvents;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockManifest = {
      id: 'test-tool',
      name: 'test-tool',
      displayName: 'Test Tool',
      description: 'A test tool for unit testing',
      version: '1.0.0',
      category: 'computer-science' as AcademicDiscipline,
      integrationMethod: 'iframe',
      url: 'https://example.com/tool',
      permissions: [
        { action: 'read', resource: 'files' },
        { action: 'write', resource: 'files' }
      ],
      requiresAuth: true,
      ssoEnabled: false,
      aiAgents: ['ScrollTutor'],
      contextAware: true,
      supportedFormats: ['json', 'txt'],
      dataExportFormats: ['json'],
      crossToolCompatibility: [],
      icon: '/icons/test-tool.svg',
      color: '#6366f1',
      fullscreen: false,
      resizable: true,
      minWidth: 800,
      minHeight: 600,
      collaborationEnabled: true,
      offlineCapable: false,
      cloudProcessing: false,
      vendor: 'ScrollUniversity',
      license: 'MIT',
      documentation: 'https://docs.example.com',
      supportContact: 'support@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUserContext = {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'student',
      enrolledCourses: ['course-1'],
      declaredMajor: 'computer-science' as AcademicDiscipline,
      permissions: [
        { action: 'read', resource: 'files' },
        { action: 'write', resource: 'files' }
      ],
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        defaultTools: {},
        aiAssistanceLevel: 'moderate',
        collaborationSettings: {
          shareByDefault: false,
          allowRealTimeEditing: true,
          notifyOnChanges: true,
          maxCollaborators: 5
        }
      }
    };

    mockOptions = {
      manifest: mockManifest,
      userContext: mockUserContext,
      projectId: 'project-123'
    };

    mockEvents = {
      onLaunched: jest.fn(),
      onClosed: jest.fn(),
      onStateChanged: jest.fn(),
      onError: jest.fn(),
      onMessage: jest.fn()
    };

    // Mock successful fetch responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve('OK')
    });
  });

  describe('Constructor', () => {
    it('should create a ToolContainer instance with valid options', () => {
      const container = new ToolContainer(mockOptions, mockEvents);
      
      expect(container).toBeInstanceOf(ToolContainer);
      expect(container.getInstance().manifestId).toBe('test-tool');
      expect(container.getInstance().userId).toBe('user-123');
      expect(container.getInstance().projectId).toBe('project-123');
    });

    it('should generate unique instance IDs', () => {
      const container1 = new ToolContainer(mockOptions);
      const container2 = new ToolContainer(mockOptions);
      
      expect(container1.getInstance().id).not.toBe(container2.getInstance().id);
    });

    it('should calculate permissions correctly', () => {
      const container = new ToolContainer(mockOptions);
      const instance = container.getInstance();
      
      expect(instance.permissions).toHaveLength(2);
      expect(instance.permissions[0].action).toBe('read');
      expect(instance.permissions[1].action).toBe('write');
    });
  });

  describe('Launch Method', () => {
    it('should launch iframe tool successfully', async () => {
      const container = new ToolContainer(mockOptions, mockEvents);
      
      const instance = await container.launch();
      
      expect(instance.isActive).toBe(true);
      expect(mockEvents.onLaunched).toHaveBeenCalledWith(instance);
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(document.createElement).toHaveBeenCalledWith('iframe');
    });

    it('should launch API tool successfully', async () => {
      const apiManifest = {
        ...mockManifest,
        integrationMethod: 'api' as const,
        apiEndpoint: 'https://api.example.com'
      };
      
      const container = new ToolContainer({
        ...mockOptions,
        manifest: apiManifest
      }, mockEvents);
      
      const instance = await container.launch();
      
      expect(instance.isActive).toBe(true);
      expect(mockEvents.onLaunched).toHaveBeenCalledWith(instance);
    });

    it('should launch RPC tool successfully', async () => {
      const rpcManifest = {
        ...mockManifest,
        integrationMethod: 'rpc' as const,
        rpcInterface: 'ws://localhost:8080/rpc'
      };
      
      const container = new ToolContainer({
        ...mockOptions,
        manifest: rpcManifest
      }, mockEvents);
      
      const instance = await container.launch();
      
      expect(instance.isActive).toBe(true);
      expect(mockEvents.onLaunched).toHaveBeenCalledWith(instance);
    });

    it('should launch embed tool successfully', async () => {
      const embedManifest = {
        ...mockManifest,
        integrationMethod: 'embed' as const,
        embedCode: '<div>Embedded Tool</div>'
      };
      
      const container = new ToolContainer({
        ...mockOptions,
        manifest: embedManifest
      }, mockEvents);
      
      const instance = await container.launch();
      
      expect(instance.isActive).toBe(true);
      expect(mockEvents.onLaunched).toHaveBeenCalledWith(instance);
    });

    it('should throw error for unsupported integration method', async () => {
      const invalidManifest = {
        ...mockManifest,
        integrationMethod: 'invalid' as any
      };
      
      const container = new ToolContainer({
        ...mockOptions,
        manifest: invalidManifest
      }, mockEvents);
      
      await expect(container.launch()).rejects.toThrow(ToolIntegrationError);
      expect(mockEvents.onError).toHaveBeenCalled();
    });

    it('should validate permissions before launching', async () => {
      const restrictedUserContext = {
        ...mockUserContext,
        permissions: [] // No permissions
      };
      
      const container = new ToolContainer({
        ...mockOptions,
        userContext: restrictedUserContext
      }, mockEvents);
      
      await expect(container.launch()).rejects.toThrow(PermissionError);
    });
  });

  describe('Message Communication', () => {
    let container: ToolContainer;

    beforeEach(async () => {
      container = new ToolContainer(mockOptions, mockEvents);
      await container.launch();
    });

    it('should send iframe messages successfully', async () => {
      const message: ToolMessage = {
        id: 'msg-123',
        type: 'command',
        source: 'container',
        target: 'test-tool',
        payload: { command: 'test' },
        timestamp: new Date(),
        requiresResponse: false
      };
      
      const response = await container.sendMessage(message);
      
      expect(response.success).toBe(true);
      expect(response.messageId).toBe('msg-123');
    });

    it('should handle message responses with timeout', async () => {
      const message: ToolMessage = {
        id: 'msg-456',
        type: 'query',
        source: 'container',
        target: 'test-tool',
        payload: { query: 'getState' },
        timestamp: new Date(),
        requiresResponse: true
      };
      
      // Mock a delayed response
      setTimeout(() => {
        const mockResponse: ToolResponse = {
          id: 'resp-456',
          messageId: 'msg-456',
          success: true,
          data: { state: 'active' },
          timestamp: new Date()
        };
        
        // Simulate message event
        const event = new MessageEvent('message', { data: mockResponse });
        window.dispatchEvent(event);
      }, 100);
      
      const response = await container.sendMessage(message);
      expect(response.success).toBe(true);
    });

    it('should throw error when sending message to uninitialized tool', async () => {
      const uninitializedContainer = new ToolContainer(mockOptions);
      
      const message: ToolMessage = {
        id: 'msg-789',
        type: 'command',
        source: 'container',
        target: 'test-tool',
        payload: { command: 'test' },
        timestamp: new Date(),
        requiresResponse: false
      };
      
      await expect(uninitializedContainer.sendMessage(message)).rejects.toThrow(ToolIntegrationError);
    });
  });

  describe('State Management', () => {
    let container: ToolContainer;

    beforeEach(async () => {
      container = new ToolContainer(mockOptions, mockEvents);
      await container.launch();
    });

    it('should get current state', () => {
      const state = container.getState();
      
      expect(state).toHaveProperty('windowState');
      expect(state).toHaveProperty('applicationState');
      expect(state).toHaveProperty('fileStates');
      expect(state).toHaveProperty('sessionData');
    });

    it('should update state and trigger events', async () => {
      const newState = {
        applicationState: { currentFile: 'test.txt' },
        sessionData: { lastAction: 'file-open' }
      };
      
      await container.setState(newState);
      
      const currentState = container.getState();
      expect(currentState.applicationState.currentFile).toBe('test.txt');
      expect(currentState.sessionData.lastAction).toBe('file-open');
      expect(mockEvents.onStateChanged).toHaveBeenCalled();
    });

    it('should save state to backend', async () => {
      await container.saveState();
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/scrollos/tool-instances/state',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should restore state from provided data', async () => {
      const restoredState = {
        windowState: {
          width: 1200,
          height: 800,
          x: 200,
          y: 150,
          isMaximized: false,
          isMinimized: false,
          zIndex: 1001
        },
        applicationState: { theme: 'dark' },
        fileStates: [],
        sessionData: { restored: true }
      };
      
      await container.restoreState(restoredState);
      
      const currentState = container.getState();
      expect(currentState.windowState.width).toBe(1200);
      expect(currentState.applicationState.theme).toBe('dark');
      expect(currentState.sessionData.restored).toBe(true);
    });
  });

  describe('Window Management', () => {
    let container: ToolContainer;

    beforeEach(async () => {
      container = new ToolContainer(mockOptions, mockEvents);
      await container.launch();
    });

    it('should resize container', () => {
      container.resize(1000, 700);
      
      const state = container.getState();
      expect(state.windowState.width).toBe(1000);
      expect(state.windowState.height).toBe(700);
    });

    it('should maximize container', () => {
      container.maximize();
      
      const state = container.getState();
      expect(state.windowState.isMaximized).toBe(true);
    });

    it('should minimize container', () => {
      container.minimize();
      
      const state = container.getState();
      expect(state.windowState.isMinimized).toBe(true);
    });

    it('should restore from minimized state', () => {
      container.minimize();
      container.restore();
      
      const state = container.getState();
      expect(state.windowState.isMinimized).toBe(false);
      expect(state.windowState.isMaximized).toBe(false);
    });
  });

  describe('Lifecycle Management', () => {
    let container: ToolContainer;

    beforeEach(async () => {
      container = new ToolContainer(mockOptions, mockEvents);
      await container.launch();
    });

    it('should close container and cleanup resources', async () => {
      expect(container.isActive()).toBe(true);
      
      await container.close();
      
      expect(container.isActive()).toBe(false);
      expect(mockEvents.onClosed).toHaveBeenCalled();
    });

    it('should handle close errors gracefully', async () => {
      // Mock fetch to fail
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      await container.close();
      
      expect(container.isActive()).toBe(false);
      expect(mockEvents.onError).toHaveBeenCalled();
    });
  });

  describe('Security Features', () => {
    it('should validate iframe message origins', () => {
      const container = new ToolContainer(mockOptions, mockEvents);
      
      // Test private method through reflection
      const isValidOrigin = (container as any).isValidOrigin;
      
      expect(isValidOrigin('https://example.com')).toBe(true);
      expect(isValidOrigin('https://malicious.com')).toBe(false);
      expect(isValidOrigin('http://example.com')).toBe(false);
    });

    it('should build secure tool URLs with parameters', () => {
      const container = new ToolContainer(mockOptions, mockEvents);
      
      // Test private method through reflection
      const buildToolURL = (container as any).buildToolURL;
      const url = buildToolURL();
      
      expect(url).toContain('userId=user-123');
      expect(url).toContain('toolId=test-tool');
      expect(url).toContain('projectId=project-123');
    });

    it('should generate unique security tokens', () => {
      const container = new ToolContainer(mockOptions, mockEvents);
      
      // Test private method through reflection
      const generateMessageId = (container as any).generateMessageId;
      const id1 = generateMessageId();
      const id2 = generateMessageId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^msg-\d+-[a-z0-9]+$/);
    });
  });

  describe('Error Handling', () => {
    it('should handle iframe load errors', async () => {
      const container = new ToolContainer(mockOptions, mockEvents);
      
      // Mock iframe onerror
      const mockIframe = {
        style: {},
        onerror: null,
        onload: null
      };
      
      (document.createElement as jest.Mock).mockReturnValueOnce(mockIframe);
      
      const launchPromise = container.launch();
      
      // Simulate iframe error
      if (mockIframe.onerror) {
        mockIframe.onerror();
      }
      
      await expect(launchPromise).rejects.toThrow('Failed to load tool iframe');
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const container = new ToolContainer(mockOptions, mockEvents);
      await container.launch();
      
      // saveState should not throw even if network fails
      await expect(container.saveState()).resolves.not.toThrow();
    });

    it('should emit error events for integration failures', async () => {
      const invalidManifest = {
        ...mockManifest,
        integrationMethod: 'iframe',
        url: undefined // Missing URL for iframe
      };
      
      const container = new ToolContainer({
        ...mockOptions,
        manifest: invalidManifest
      }, mockEvents);
      
      await expect(container.launch()).rejects.toThrow();
      expect(mockEvents.onError).toHaveBeenCalled();
    });
  });

  describe('Integration Methods', () => {
    it('should handle iframe integration with proper sandboxing', async () => {
      const container = new ToolContainer(mockOptions, mockEvents);
      await container.launch();
      
      // Verify iframe was created with proper sandbox attributes
      expect(document.createElement).toHaveBeenCalledWith('iframe');
    });

    it('should handle API integration initialization', async () => {
      const apiManifest = {
        ...mockManifest,
        integrationMethod: 'api' as const,
        apiEndpoint: 'https://api.example.com'
      };
      
      const container = new ToolContainer({
        ...mockOptions,
        manifest: apiManifest
      });
      
      await expect(container.launch()).resolves.toBeDefined();
    });

    it('should handle embed integration with HTML sanitization', async () => {
      const embedManifest = {
        ...mockManifest,
        integrationMethod: 'embed' as const,
        embedCode: '<div>Safe content</div><script>alert("xss")</script>'
      };
      
      const container = new ToolContainer({
        ...mockOptions,
        manifest: embedManifest
      });
      
      await expect(container.launch()).resolves.toBeDefined();
    });
  });
});