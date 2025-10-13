/**
 * XR Integration System Component
 * Main component that orchestrates all XR functionality
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  XRScene,
  XRSession,
  XRDeviceType,
  AngelicTutor,
  TutorInteractionType,
  XRSceneType,
  XRCategory
} from '../../types/xr';
import XRContentManagementService from '../../services/XRContentManagementService';
import WebXRIntegrationService from '../../services/WebXRIntegrationService';
import XRClassroomService from '../../services/XRClassroomService';
import AngelicTutorService from '../../services/AngelicTutorService';

interface XRIntegrationSystemProps {
  userId: string;
  courseId?: string;
  initialSceneId?: string;
  onSessionStart?: (session: XRSession) => void;
  onSessionEnd?: (session: XRSession) => void;
  onSpiritualInsight?: (insight: any) => void;
}

interface XRSystemState {
  isInitialized: boolean;
  isSessionActive: boolean;
  currentSession: XRSession | null;
  currentScene: XRScene | null;
  angelicTutor: AngelicTutor | null;
  deviceCapabilities: any;
  error: string | null;
  loading: boolean;
}

export const XRIntegrationSystem: React.FC<XRIntegrationSystemProps> = ({
  userId,
  courseId,
  initialSceneId,
  onSessionStart,
  onSessionEnd,
  onSpiritualInsight
}) => {
  const [state, setState] = useState<XRSystemState>({
    isInitialized: false,
    isSessionActive: false,
    currentSession: null,
    currentScene: null,
    angelicTutor: null,
    deviceCapabilities: null,
    error: null,
    loading: true
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentService = useRef<XRContentManagementService>(new XRContentManagementService());
  const webxrService = useRef<WebXRIntegrationService>(new WebXRIntegrationService());
  const classroomService = useRef<XRClassroomService>(new XRClassroomService());
  const tutorService = useRef<AngelicTutorService>(new AngelicTutorService());

  /**
   * Initialize XR system
   */
  useEffect(() => {
    const initializeXR = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Check WebXR support
        const capabilities = webxrService.current.getCapabilities();
        const deviceInfo = webxrService.current.getDeviceInfo();

        if (!webxrService.current.isSupported()) {
          throw new Error('WebXR is not supported on this device');
        }

        setState(prev => ({
          ...prev,
          isInitialized: true,
          deviceCapabilities: { capabilities, deviceInfo },
          loading: false
        }));

        // Load initial scene if provided
        if (initialSceneId) {
          await loadScene(initialSceneId);
        }

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize XR system',
          loading: false
        }));
      }
    };

    initializeXR();
  }, [initialSceneId]);

  /**
   * Load an XR scene
   */
  const loadScene = useCallback(async (sceneId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const scene = contentService.current.getScene(sceneId);
      if (!scene) {
        throw new Error(`Scene not found: ${sceneId}`);
      }

      // Optimize scene for current device
      const optimizedScene = webxrService.current.optimizeSceneForDevice(scene);

      // Assign angelic tutor if scene has one or get default
      let angelicTutor: AngelicTutor | null = null;
      if (scene.angelicTutor) {
        angelicTutor = contentService.current.getAngelicTutor(scene.angelicTutor.id);
      } else {
        const availableTutors = tutorService.current.getAvailableTutors();
        angelicTutor = availableTutors[0] || null;
      }

      setState(prev => ({
        ...prev,
        currentScene: optimizedScene,
        angelicTutor,
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load scene',
        loading: false
      }));
    }
  }, []);

  /**
   * Start XR session
   */
  const startXRSession = useCallback(async (mode: 'immersive-vr' | 'immersive-ar' | 'inline' = 'immersive-vr') => {
    if (!state.currentScene || !canvasRef.current) {
      setState(prev => ({ ...prev, error: 'Scene or canvas not ready' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      let session: XRSession;

      if (mode === 'inline') {
        session = await webxrService.current.startInlineSession(state.currentScene, canvasRef.current);
      } else {
        session = await webxrService.current.startImmersiveSession(state.currentScene, canvasRef.current, mode);
      }

      // Assign angelic tutor to session
      if (state.angelicTutor) {
        tutorService.current.assignTutorToSession(session.id, state.angelicTutor.id);
      }

      setState(prev => ({
        ...prev,
        isSessionActive: true,
        currentSession: session,
        loading: false
      }));

      onSessionStart?.(session);

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start XR session',
        loading: false
      }));
    }
  }, [state.currentScene, state.angelicTutor, onSessionStart]);

  /**
   * End XR session
   */
  const endXRSession = useCallback(async () => {
    if (!state.currentSession) return;

    try {
      await webxrService.current.endSession();
      
      if (state.angelicTutor) {
        tutorService.current.endTutorSession(state.currentSession.id);
      }

      const endedSession = state.currentSession;
      setState(prev => ({
        ...prev,
        isSessionActive: false,
        currentSession: null
      }));

      onSessionEnd?.(endedSession);

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to end XR session'
      }));
    }
  }, [state.currentSession, state.angelicTutor, onSessionEnd]);

  /**
   * Interact with angelic tutor
   */
  const interactWithTutor = useCallback(async (
    message: string,
    interactionType: TutorInteractionType = TutorInteractionType.QUESTION
  ) => {
    if (!state.currentSession || !state.angelicTutor) {
      setState(prev => ({ ...prev, error: 'No active session or tutor available' }));
      return;
    }

    try {
      const interaction = await tutorService.current.processInteraction(
        state.currentSession.id,
        userId,
        message,
        interactionType
      );

      // Generate spiritual insight from interaction
      const insight = tutorService.current.generateSpiritualInsight(interaction);
      onSpiritualInsight?.(insight);

      return interaction;

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to interact with tutor'
      }));
    }
  }, [state.currentSession, state.angelicTutor, userId, onSpiritualInsight]);

  /**
   * Get available scenes
   */
  const getAvailableScenes = useCallback((filter?: {
    type?: XRSceneType;
    category?: XRCategory;
  }) => {
    return contentService.current.getScenes(filter);
  }, []);

  /**
   * Get classroom layouts
   */
  const getClassroomLayouts = useCallback(() => {
    return classroomService.current.getClassroomLayouts();
  }, []);

  /**
   * Create virtual classroom
   */
  const createVirtualClassroom = useCallback(async (layoutId: string) => {
    try {
      const classroomScene = classroomService.current.createClassroomScene(layoutId);
      await loadScene(classroomScene.id);
      return classroomScene;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create virtual classroom'
      }));
    }
  }, [loadScene]);

  /**
   * Get recommended session mode
   */
  const getRecommendedMode = useCallback(() => {
    return webxrService.current.getRecommendedSessionMode();
  }, []);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Initializing XR System...</span>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">XR System Error</h3>
            <p className="mt-1 text-sm text-red-700">{state.error}</p>
            <button
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!state.isInitialized) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">XR System Not Available</h3>
        <p className="mt-2 text-sm text-gray-600">
          Your device does not support WebXR or the system failed to initialize.
        </p>
      </div>
    );
  }

  return (
    <div className="xr-integration-system">
      {/* XR Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-96 bg-black rounded-lg"
          style={{ display: state.isSessionActive ? 'block' : 'none' }}
        />
        
        {!state.isSessionActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-4">ScrollUniversity XR Experience</h3>
              <p className="mb-6">Enter immersive biblical and scientific learning</p>
              
              {state.currentScene && (
                <div className="mb-6">
                  <h4 className="font-semibold">{state.currentScene.title}</h4>
                  <p className="text-sm opacity-90">{state.currentScene.description}</p>
                </div>
              )}
              
              <div className="space-x-4">
                <button
                  onClick={() => startXRSession('immersive-vr')}
                  disabled={!state.deviceCapabilities?.capabilities?.immersiveVR}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  Enter VR
                </button>
                <button
                  onClick={() => startXRSession('immersive-ar')}
                  disabled={!state.deviceCapabilities?.capabilities?.immersiveAR}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  Enter AR
                </button>
                <button
                  onClick={() => startXRSession('inline')}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                >
                  3D View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Controls */}
      {state.isSessionActive && (
        <div className="mt-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium">XR Session Active</span>
            </div>
            
            {state.angelicTutor && (
              <div className="flex items-center">
                <span className="text-sm text-gray-600">Tutor:</span>
                <span className="ml-1 text-sm font-medium">{state.angelicTutor.name}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={endXRSession}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            End Session
          </button>
        </div>
      )}

      {/* Tutor Interaction Panel */}
      {state.isSessionActive && state.angelicTutor && (
        <TutorInteractionPanel
          tutor={state.angelicTutor}
          onInteract={interactWithTutor}
        />
      )}

      {/* Scene Selection */}
      {!state.isSessionActive && (
        <SceneSelectionPanel
          scenes={getAvailableScenes()}
          onSceneSelect={loadScene}
          currentSceneId={state.currentScene?.id}
        />
      )}

      {/* Device Capabilities Info */}
      {state.deviceCapabilities && (
        <DeviceCapabilitiesPanel capabilities={state.deviceCapabilities} />
      )}
    </div>
  );
};

/**
 * Tutor Interaction Panel Component
 */
interface TutorInteractionPanelProps {
  tutor: AngelicTutor;
  onInteract: (message: string, type: TutorInteractionType) => Promise<any>;
}

const TutorInteractionPanel: React.FC<TutorInteractionPanelProps> = ({ tutor, onInteract }) => {
  const [message, setMessage] = useState('');
  const [isInteracting, setIsInteracting] = useState(false);

  const handleInteraction = async (type: TutorInteractionType) => {
    if (!message.trim() && type === TutorInteractionType.QUESTION) return;
    
    setIsInteracting(true);
    try {
      await onInteract(message, type);
      if (type === TutorInteractionType.QUESTION) {
        setMessage('');
      }
    } finally {
      setIsInteracting(false);
    }
  };

  return (
    <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">👼</span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{tutor.name}</h4>
          <p className="text-sm text-gray-600">Angelic Tutor</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask your angelic tutor a question..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleInteraction(TutorInteractionType.QUESTION)}
          />
          <button
            onClick={() => handleInteraction(TutorInteractionType.QUESTION)}
            disabled={!message.trim() || isInteracting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            Ask
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleInteraction(TutorInteractionType.PRAYER)}
            disabled={isInteracting}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
          >
            Pray Together
          </button>
          <button
            onClick={() => handleInteraction(TutorInteractionType.ENCOURAGEMENT)}
            disabled={isInteracting}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            Encouragement
          </button>
          <button
            onClick={() => handleInteraction(TutorInteractionType.GUIDANCE)}
            disabled={isInteracting}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
          >
            Guidance
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Scene Selection Panel Component
 */
interface SceneSelectionPanelProps {
  scenes: XRScene[];
  onSceneSelect: (sceneId: string) => void;
  currentSceneId?: string;
}

const SceneSelectionPanel: React.FC<SceneSelectionPanelProps> = ({ scenes, onSceneSelect, currentSceneId }) => {
  const [filter, setFilter] = useState<XRSceneType | 'all'>('all');

  const filteredScenes = scenes.filter(scene => 
    filter === 'all' || scene.type === filter
  );

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Available XR Experiences</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as XRSceneType | 'all')}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value={XRSceneType.BIBLICAL}>Biblical</option>
          <option value={XRSceneType.SCIENTIFIC}>Scientific</option>
          <option value={XRSceneType.CLASSROOM}>Classroom</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenes.map(scene => (
          <div
            key={scene.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              scene.id === currentSceneId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => onSceneSelect(scene.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{scene.title}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                scene.type === XRSceneType.BIBLICAL ? 'bg-purple-100 text-purple-800' :
                scene.type === XRSceneType.SCIENTIFIC ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {scene.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{scene.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{Math.floor(scene.metadata.duration / 60)} min</span>
              <span className="capitalize">{scene.metadata.difficulty}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Device Capabilities Panel Component
 */
interface DeviceCapabilitiesPanelProps {
  capabilities: any;
}

const DeviceCapabilitiesPanel: React.FC<DeviceCapabilitiesPanelProps> = ({ capabilities }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-6 border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
      >
        <span className="font-medium">Device Capabilities</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <h5 className="font-medium mb-2">WebXR Support</h5>
              <ul className="space-y-1 text-sm">
                <li className={capabilities.capabilities?.immersiveVR ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.capabilities?.immersiveVR ? '✓' : '✗'} Immersive VR
                </li>
                <li className={capabilities.capabilities?.immersiveAR ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.capabilities?.immersiveAR ? '✓' : '✗'} Immersive AR
                </li>
                <li className={capabilities.capabilities?.inline ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.capabilities?.inline ? '✓' : '✗'} Inline 3D
                </li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Advanced Features</h5>
              <ul className="space-y-1 text-sm">
                <li className={capabilities.capabilities?.handTracking ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.capabilities?.handTracking ? '✓' : '✗'} Hand Tracking
                </li>
                <li className={capabilities.capabilities?.spatialAudio ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.capabilities?.spatialAudio ? '✓' : '✗'} Spatial Audio
                </li>
                <li className={capabilities.capabilities?.depthSensing ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.capabilities?.depthSensing ? '✓' : '✗'} Depth Sensing
                </li>
              </ul>
            </div>
          </div>
          
          {capabilities.deviceInfo && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Device Type: <span className="font-medium">{capabilities.deviceInfo.type}</span>
              </p>
              <p className="text-sm text-gray-600">
                Performance: <span className="font-medium capitalize">{capabilities.deviceInfo.performance}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default XRIntegrationSystem;