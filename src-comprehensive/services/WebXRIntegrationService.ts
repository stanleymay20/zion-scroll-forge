/**
 * WebXR Integration Service
 * Handles WebXR capabilities, device detection, and immersive session management
 */

import {
  XRDevice,
  XRDeviceType,
  XRDeviceCapability,
  XRPerformanceLevel,
  XRScene,
  XRSession,
  XRVector3,
  XRInteraction,
  XRInteractionType
} from '../types/xr';

export interface WebXRCapabilities {
  immersiveVR: boolean;
  immersiveAR: boolean;
  inline: boolean;
  handTracking: boolean;
  eyeTracking: boolean;
  spatialAudio: boolean;
  depthSensing: boolean;
  lightEstimation: boolean;
}

export interface WebXRSessionConfig {
  mode: 'immersive-vr' | 'immersive-ar' | 'inline';
  requiredFeatures: string[];
  optionalFeatures: string[];
  depthSensing?: {
    usagePreference: string[];
    dataFormatPreference: string[];
  };
}

export class WebXRIntegrationService {
  private xrSystem: XRSystem | null = null;
  private currentSession: XRSession | null = null;
  private capabilities: WebXRCapabilities | null = null;
  private deviceInfo: XRDevice | null = null;
  private frameRequestId: number | null = null;

  constructor() {
    this.initializeWebXR();
  }

  /**
   * Initialize WebXR system and detect capabilities
   */
  private async initializeWebXR(): Promise<void> {
    if (!('xr' in navigator)) {
      console.warn('WebXR not supported in this browser');
      return;
    }

    this.xrSystem = (navigator as any).xr;
    await this.detectCapabilities();
    this.detectDeviceInfo();
  }

  /**
   * Detect WebXR capabilities
   */
  private async detectCapabilities(): Promise<void> {
    if (!this.xrSystem) {
      this.capabilities = {
        immersiveVR: false,
        immersiveAR: false,
        inline: false,
        handTracking: false,
        eyeTracking: false,
        spatialAudio: false,
        depthSensing: false,
        lightEstimation: false
      };
      return;
    }

    try {
      const [
        immersiveVR,
        immersiveAR,
        inline
      ] = await Promise.all([
        this.xrSystem.isSessionSupported('immersive-vr'),
        this.xrSystem.isSessionSupported('immersive-ar'),
        this.xrSystem.isSessionSupported('inline')
      ]);

      this.capabilities = {
        immersiveVR,
        immersiveAR,
        inline,
        handTracking: await this.checkFeatureSupport('hand-tracking'),
        eyeTracking: await this.checkFeatureSupport('eye-tracking'),
        spatialAudio: await this.checkFeatureSupport('spatial-audio'),
        depthSensing: await this.checkFeatureSupport('depth-sensing'),
        lightEstimation: await this.checkFeatureSupport('light-estimation')
      };
    } catch (error) {
      console.error('Error detecting WebXR capabilities:', error);
      this.capabilities = {
        immersiveVR: false,
        immersiveAR: false,
        inline: false,
        handTracking: false,
        eyeTracking: false,
        spatialAudio: false,
        depthSensing: false,
        lightEstimation: false
      };
    }
  }

  /**
   * Check if a specific WebXR feature is supported
   */
  private async checkFeatureSupport(feature: string): Promise<boolean> {
    if (!this.xrSystem) return false;

    try {
      // Try to create a session with the feature to test support
      const session = await this.xrSystem.requestSession('inline', {
        optionalFeatures: [feature]
      });
      session.end();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect device information
   */
  private detectDeviceInfo(): void {
    if (!this.capabilities) return;

    let deviceType: XRDeviceType;
    let performance: XRPerformanceLevel;

    // Determine device type based on capabilities and user agent
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (this.capabilities.immersiveVR) {
      if (userAgent.includes('oculus') || userAgent.includes('quest')) {
        deviceType = XRDeviceType.VR_HEADSET;
        performance = XRPerformanceLevel.HIGH;
      } else if (userAgent.includes('mobile')) {
        deviceType = XRDeviceType.MOBILE_AR;
        performance = XRPerformanceLevel.MEDIUM;
      } else {
        deviceType = XRDeviceType.DESKTOP_VR;
        performance = XRPerformanceLevel.HIGH;
      }
    } else if (this.capabilities.immersiveAR) {
      deviceType = XRDeviceType.AR_GLASSES;
      performance = XRPerformanceLevel.MEDIUM;
    } else {
      deviceType = XRDeviceType.WEB_XR;
      performance = XRPerformanceLevel.LOW;
    }

    const capabilities: XRDeviceCapability[] = [
      {
        name: 'Immersive VR',
        supported: this.capabilities.immersiveVR,
        quality: this.capabilities.immersiveVR ? 'high' : 'low'
      },
      {
        name: 'Immersive AR',
        supported: this.capabilities.immersiveAR,
        quality: this.capabilities.immersiveAR ? 'high' : 'low'
      },
      {
        name: 'Hand Tracking',
        supported: this.capabilities.handTracking,
        quality: this.capabilities.handTracking ? 'medium' : 'low'
      },
      {
        name: 'Eye Tracking',
        supported: this.capabilities.eyeTracking,
        quality: this.capabilities.eyeTracking ? 'high' : 'low'
      },
      {
        name: 'Spatial Audio',
        supported: this.capabilities.spatialAudio,
        quality: this.capabilities.spatialAudio ? 'high' : 'medium'
      },
      {
        name: 'Depth Sensing',
        supported: this.capabilities.depthSensing,
        quality: this.capabilities.depthSensing ? 'high' : 'low'
      }
    ];

    this.deviceInfo = {
      type: deviceType,
      capabilities,
      supported: this.capabilities.immersiveVR || this.capabilities.immersiveAR || this.capabilities.inline,
      performance
    };
  }

  /**
   * Get WebXR capabilities
   */
  public getCapabilities(): WebXRCapabilities | null {
    return this.capabilities;
  }

  /**
   * Get device information
   */
  public getDeviceInfo(): XRDevice | null {
    return this.deviceInfo;
  }

  /**
   * Check if WebXR is supported
   */
  public isSupported(): boolean {
    return this.capabilities !== null && (
      this.capabilities.immersiveVR || 
      this.capabilities.immersiveAR || 
      this.capabilities.inline
    );
  }

  /**
   * Start an immersive XR session
   */
  public async startImmersiveSession(
    scene: XRScene,
    canvas: HTMLCanvasElement,
    mode: 'immersive-vr' | 'immersive-ar' = 'immersive-vr'
  ): Promise<XRSession> {
    if (!this.xrSystem) {
      throw new Error('WebXR not supported');
    }

    if (!this.capabilities) {
      throw new Error('WebXR capabilities not detected');
    }

    if (mode === 'immersive-vr' && !this.capabilities.immersiveVR) {
      throw new Error('Immersive VR not supported');
    }

    if (mode === 'immersive-ar' && !this.capabilities.immersiveAR) {
      throw new Error('Immersive AR not supported');
    }

    const sessionConfig: WebXRSessionConfig = {
      mode,
      requiredFeatures: ['local'],
      optionalFeatures: []
    };

    // Add optional features based on scene requirements and device capabilities
    if (this.capabilities.handTracking) {
      sessionConfig.optionalFeatures.push('hand-tracking');
    }

    if (this.capabilities.spatialAudio) {
      sessionConfig.optionalFeatures.push('spatial-audio');
    }

    if (this.capabilities.depthSensing && mode === 'immersive-ar') {
      sessionConfig.optionalFeatures.push('depth-sensing');
      sessionConfig.depthSensing = {
        usagePreference: ['cpu-optimized', 'gpu-optimized'],
        dataFormatPreference: ['luminance-alpha', 'float32']
      };
    }

    try {
      const xrSession = await this.xrSystem.requestSession(mode, {
        requiredFeatures: sessionConfig.requiredFeatures,
        optionalFeatures: sessionConfig.optionalFeatures,
        depthSensing: sessionConfig.depthSensing
      });

      // Set up the WebGL context for XR
      const gl = canvas.getContext('webgl2', { xrCompatible: true });
      if (!gl) {
        throw new Error('WebGL2 not supported');
      }

      await gl.makeXRCompatible();
      const baseLayer = new XRWebGLLayer(xrSession, gl);
      
      await xrSession.updateRenderState({
        baseLayer: baseLayer
      });

      // Create our XR session wrapper
      const session: XRSession = {
        id: `webxr-${Date.now()}`,
        userId: 'current-user', // This would come from auth context
        sceneId: scene.id,
        startTime: new Date(),
        progress: {
          currentStep: 0,
          totalSteps: scene.content.narrativeFlow.length,
          completedObjectives: [],
          timeSpent: 0,
          engagementScore: 0
        },
        interactions: [],
        assessmentResults: [],
        spiritualInsights: []
      };

      this.currentSession = session;

      // Set up event listeners
      this.setupSessionEventListeners(xrSession);

      // Start the render loop
      this.startRenderLoop(xrSession, gl, scene);

      return session;
    } catch (error) {
      console.error('Failed to start XR session:', error);
      throw error;
    }
  }

  /**
   * Start an inline XR session (for devices without immersive capabilities)
   */
  public async startInlineSession(
    scene: XRScene,
    canvas: HTMLCanvasElement
  ): Promise<XRSession> {
    if (!this.xrSystem) {
      throw new Error('WebXR not supported');
    }

    if (!this.capabilities?.inline) {
      throw new Error('Inline XR not supported');
    }

    try {
      const xrSession = await this.xrSystem.requestSession('inline');

      const gl = canvas.getContext('webgl2', { xrCompatible: true });
      if (!gl) {
        throw new Error('WebGL2 not supported');
      }

      await gl.makeXRCompatible();
      const baseLayer = new XRWebGLLayer(xrSession, gl);
      
      await xrSession.updateRenderState({
        baseLayer: baseLayer
      });

      const session: XRSession = {
        id: `webxr-inline-${Date.now()}`,
        userId: 'current-user',
        sceneId: scene.id,
        startTime: new Date(),
        progress: {
          currentStep: 0,
          totalSteps: scene.content.narrativeFlow.length,
          completedObjectives: [],
          timeSpent: 0,
          engagementScore: 0
        },
        interactions: [],
        assessmentResults: [],
        spiritualInsights: []
      };

      this.currentSession = session;
      this.setupSessionEventListeners(xrSession);
      this.startRenderLoop(xrSession, gl, scene);

      return session;
    } catch (error) {
      console.error('Failed to start inline XR session:', error);
      throw error;
    }
  }

  /**
   * End the current XR session
   */
  public async endSession(): Promise<void> {
    if (this.frameRequestId) {
      cancelAnimationFrame(this.frameRequestId);
      this.frameRequestId = null;
    }

    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      this.currentSession = null;
    }
  }

  /**
   * Set up event listeners for XR session
   */
  private setupSessionEventListeners(xrSession: XRSession): void {
    xrSession.addEventListener('end', () => {
      this.endSession();
    });

    xrSession.addEventListener('inputsourceschange', (event) => {
      this.handleInputSourcesChange(event);
    });

    xrSession.addEventListener('select', (event) => {
      this.handleSelectEvent(event);
    });

    xrSession.addEventListener('selectstart', (event) => {
      this.handleSelectStartEvent(event);
    });

    xrSession.addEventListener('selectend', (event) => {
      this.handleSelectEndEvent(event);
    });
  }

  /**
   * Handle input sources change
   */
  private handleInputSourcesChange(event: XRInputSourceChangeEvent): void {
    console.log('Input sources changed:', event.added, event.removed);
    
    // Track new input sources
    event.added.forEach(inputSource => {
      console.log('New input source:', inputSource.handedness, inputSource.targetRayMode);
    });
  }

  /**
   * Handle select event (button press/release)
   */
  private handleSelectEvent(event: XRInputSourceEvent): void {
    if (!this.currentSession) return;

    const interaction: XRInteraction = {
      id: `interaction-${Date.now()}`,
      type: XRInteractionType.TOUCH,
      trigger: {
        type: XRInteractionType.TOUCH,
        target: 'controller'
      },
      response: {
        type: 'dialogue' as any,
        content: 'Selection detected'
      }
    };

    this.currentSession.interactions.push({
      timestamp: new Date(),
      type: XRInteractionType.TOUCH,
      target: 'controller',
      response: 'Selection detected',
      effectiveness: 1.0
    });
  }

  /**
   * Handle select start event
   */
  private handleSelectStartEvent(event: XRInputSourceEvent): void {
    console.log('Select start:', event.inputSource.handedness);
  }

  /**
   * Handle select end event
   */
  private handleSelectEndEvent(event: XRInputSourceEvent): void {
    console.log('Select end:', event.inputSource.handedness);
  }

  /**
   * Start the render loop
   */
  private startRenderLoop(
    xrSession: XRSession, 
    gl: WebGL2RenderingContext, 
    scene: XRScene
  ): void {
    const renderFrame = (time: number, frame: XRFrame) => {
      const session = frame.session;
      
      // Update session progress
      if (this.currentSession) {
        this.currentSession.progress.timeSpent = Date.now() - this.currentSession.startTime.getTime();
      }

      // Get the viewer pose
      const pose = frame.getViewerPose(session.renderState.baseLayer!.framebuffer);
      
      if (pose) {
        // Render the scene for each view (eye)
        pose.views.forEach((view, index) => {
          this.renderView(gl, view, scene, frame);
        });
      }

      // Continue the render loop
      this.frameRequestId = session.requestAnimationFrame(renderFrame);
    };

    this.frameRequestId = xrSession.requestAnimationFrame(renderFrame);
  }

  /**
   * Render a single view (eye)
   */
  private renderView(
    gl: WebGL2RenderingContext,
    view: XRView,
    scene: XRScene,
    frame: XRFrame
  ): void {
    // Set up the viewport
    const viewport = view.viewport;
    gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

    // Clear the framebuffer
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up view and projection matrices
    const viewMatrix = view.transform.inverse.matrix;
    const projectionMatrix = view.projectionMatrix;

    // Render the scene
    this.renderScene(gl, scene, viewMatrix, projectionMatrix, frame);
  }

  /**
   * Render the XR scene
   */
  private renderScene(
    gl: WebGL2RenderingContext,
    scene: XRScene,
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array,
    frame: XRFrame
  ): void {
    // This is a simplified render function
    // In a real implementation, this would render 3D models, environments, characters, etc.
    
    // Render environment
    this.renderEnvironment(gl, scene.content.environment, viewMatrix, projectionMatrix);
    
    // Render characters (including angelic tutors)
    scene.content.characters.forEach(character => {
      this.renderCharacter(gl, character, viewMatrix, projectionMatrix);
    });

    // Render interactive objects
    scene.interactions.forEach(interaction => {
      this.renderInteraction(gl, interaction, viewMatrix, projectionMatrix);
    });

    // Handle hand tracking if available
    if (frame.session.inputSources) {
      frame.session.inputSources.forEach(inputSource => {
        if (inputSource.hand) {
          this.renderHand(gl, inputSource.hand, frame, viewMatrix, projectionMatrix);
        }
      });
    }
  }

  /**
   * Render the environment
   */
  private renderEnvironment(
    gl: WebGL2RenderingContext,
    environment: any,
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array
  ): void {
    // Render skybox, lighting, and environment objects
    console.log('Rendering environment:', environment.skybox);
  }

  /**
   * Render a character
   */
  private renderCharacter(
    gl: WebGL2RenderingContext,
    character: any,
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array
  ): void {
    // Render 3D character model with animations
    console.log('Rendering character:', character.name);
  }

  /**
   * Render an interaction
   */
  private renderInteraction(
    gl: WebGL2RenderingContext,
    interaction: XRInteraction,
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array
  ): void {
    // Render interaction indicators and UI elements
    console.log('Rendering interaction:', interaction.type);
  }

  /**
   * Render hand tracking
   */
  private renderHand(
    gl: WebGL2RenderingContext,
    hand: XRHand,
    frame: XRFrame,
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array
  ): void {
    // Render hand joints and gestures
    hand.forEach((joint, jointName) => {
      const pose = frame.getJointPose(joint, frame.session.renderState.baseLayer!.framebuffer);
      if (pose) {
        // Render joint at pose.transform.position
        console.log(`Rendering joint ${jointName} at:`, pose.transform.position);
      }
    });
  }

  /**
   * Get current session
   */
  public getCurrentSession(): XRSession | null {
    return this.currentSession;
  }

  /**
   * Check if session is active
   */
  public isSessionActive(): boolean {
    return this.currentSession !== null;
  }

  /**
   * Get recommended session mode based on device capabilities
   */
  public getRecommendedSessionMode(): 'immersive-vr' | 'immersive-ar' | 'inline' {
    if (!this.capabilities) return 'inline';

    if (this.capabilities.immersiveVR) return 'immersive-vr';
    if (this.capabilities.immersiveAR) return 'immersive-ar';
    return 'inline';
  }

  /**
   * Optimize scene for device performance
   */
  public optimizeSceneForDevice(scene: XRScene): XRScene {
    if (!this.deviceInfo) return scene;

    const optimizedScene = { ...scene };

    // Adjust quality based on device performance
    switch (this.deviceInfo.performance) {
      case XRPerformanceLevel.LOW:
        // Reduce quality for low-end devices
        optimizedScene.content.environment.lighting.shadows = false;
        break;
      case XRPerformanceLevel.MEDIUM:
        // Medium quality settings
        break;
      case XRPerformanceLevel.HIGH:
      case XRPerformanceLevel.ULTRA:
        // High quality settings
        optimizedScene.content.environment.lighting.shadows = true;
        break;
    }

    return optimizedScene;
  }
}

export default WebXRIntegrationService;