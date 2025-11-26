/**
 * ToolContainer Service
 * 
 * Provides standardized containers for all academic tools with consistent
 * UI, security, and integration capabilities.
 */

import { 
  ToolManifest, 
  ToolInstance, 
  ToolState, 
  ToolMessage, 
  ToolResponse,
  UserContext,
  ToolIntegrationError,
  PermissionError,
  WindowState,
  FileState,
  ToolEvent
} from '../../types/scrollos-tools';

export interface ToolContainerOptions {
  manifest: ToolManifest;
  userContext: UserContext;
  projectId?: string;
  initialState?: Partial<ToolState>;
  parentElement?: HTMLElement;
}

export interface ToolContainerEvents {
  onLaunched?: (instance: ToolInstance) => void;
  onClosed?: (instance: ToolInstance) => void;
  onStateChanged?: (instance: ToolInstance, newState: ToolState) => void;
  onError?: (error: Error) => void;
  onMessage?: (message: ToolMessage) => void;
}

export class ToolContainer {
  private instance: ToolInstance;
  private manifest: ToolManifest;
  private userContext: UserContext;
  private containerElement: HTMLElement | null = null;
  private toolFrame: HTMLIFrameElement | null = null;
  private messageHandlers: Map<string, (message: ToolMessage) => Promise<ToolResponse>> = new Map();
  private eventListeners: ToolContainerEvents = {};
  private isInitialized = false;
  private lastHeartbeat = new Date();

  constructor(options: ToolContainerOptions, events?: ToolContainerEvents) {
    this.manifest = options.manifest;
    this.userContext = options.userContext;
    this.eventListeners = events || {};

    // Create tool instance
    this.instance = {
      id: this.generateInstanceId(),
      manifestId: this.manifest.id,
      userId: this.userContext.userId,
      projectId: options.projectId,
      state: this.createInitialState(options.initialState),
      isActive: false,
      lastAccessed: new Date(),
      permissions: this.calculatePermissions(),
      customSettings: {},
      aiAgents: [],
      contextData: {
        currentTool: this.manifest.id,
        currentProject: options.projectId,
        currentCourse: this.getCurrentCourse(),
        recentActions: []
      },
      collaborators: [],
      sharedWith: []
    };

    this.setupMessageHandlers();
  }

  /**
   * Launch the tool in its container
   */
  async launch(parentElement?: HTMLElement): Promise<ToolInstance> {
    try {
      // Validate permissions
      this.validatePermissions();

      // Create container element
      this.createContainer(parentElement);

      // Initialize based on integration method
      switch (this.manifest.integrationMethod) {
        case 'iframe':
          await this.initializeIframe();
          break;
        case 'api':
          await this.initializeAPI();
          break;
        case 'rpc':
          await this.initializeRPC();
          break;
        case 'embed':
          await this.initializeEmbed();
          break;
        default:
          throw new ToolIntegrationError(
            `Unsupported integration method: ${this.manifest.integrationMethod}`,
            this.manifest.id,
            'UNSUPPORTED_INTEGRATION_METHOD'
          );
      }

      // Mark as active and initialized
      this.instance.isActive = true;
      this.instance.lastAccessed = new Date();
      this.isInitialized = true;

      // Start heartbeat monitoring
      this.startHeartbeat();

      // Emit launched event
      this.eventListeners.onLaunched?.(this.instance);

      // Log tool launch event
      this.logEvent('tool-launched', {
        toolId: this.manifest.id,
        integrationMethod: this.manifest.integrationMethod
      });

      return this.instance;

    } catch (error) {
      console.error(`Failed to launch tool ${this.manifest.id}:`, error);
      this.eventListeners.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Close the tool and cleanup resources
   */
  async close(): Promise<void> {
    try {
      // Save current state
      await this.saveState();

      // Stop heartbeat
      this.stopHeartbeat();

      // Cleanup based on integration method
      if (this.toolFrame) {
        this.toolFrame.remove();
        this.toolFrame = null;
      }

      if (this.containerElement) {
        this.containerElement.remove();
        this.containerElement = null;
      }

      // Mark as inactive
      this.instance.isActive = false;
      this.isInitialized = false;

      // Emit closed event
      this.eventListeners.onClosed?.(this.instance);

      // Log tool close event
      this.logEvent('tool-closed', {
        toolId: this.manifest.id,
        sessionDuration: Date.now() - this.instance.lastAccessed.getTime()
      });

    } catch (error) {
      console.error(`Failed to close tool ${this.manifest.id}:`, error);
      this.eventListeners.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Send a message to the tool
   */
  async sendMessage(message: ToolMessage): Promise<ToolResponse> {
    if (!this.isInitialized) {
      throw new ToolIntegrationError(
        'Tool not initialized',
        this.manifest.id,
        'TOOL_NOT_INITIALIZED'
      );
    }

    try {
      // Handle message based on integration method
      switch (this.manifest.integrationMethod) {
        case 'iframe':
          return await this.sendIframeMessage(message);
        case 'api':
          return await this.sendAPIMessage(message);
        case 'rpc':
          return await this.sendRPCMessage(message);
        default:
          throw new ToolIntegrationError(
            `Message sending not supported for integration method: ${this.manifest.integrationMethod}`,
            this.manifest.id,
            'MESSAGE_NOT_SUPPORTED'
          );
      }
    } catch (error) {
      console.error(`Failed to send message to tool ${this.manifest.id}:`, error);
      throw error;
    }
  }

  /**
   * Get current tool state
   */
  getState(): ToolState {
    return { ...this.instance.state };
  }

  /**
   * Update tool state
   */
  async setState(newState: Partial<ToolState>): Promise<void> {
    const previousState = { ...this.instance.state };
    this.instance.state = { ...this.instance.state, ...newState };
    
    // Emit state changed event
    this.eventListeners.onStateChanged?.(this.instance, this.instance.state);

    // Auto-save state if configured
    if (this.userContext.preferences.collaborationSettings.shareByDefault) {
      await this.saveState();
    }
  }

  /**
   * Save current state to storage
   */
  async saveState(): Promise<void> {
    try {
      const response = await fetch('/api/scrollos/tool-instances/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          instanceId: this.instance.id,
          state: this.instance.state
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save state: ${response.statusText}`);
      }

    } catch (error) {
      console.error(`Failed to save state for tool ${this.manifest.id}:`, error);
      // Don't throw - state saving should be non-blocking
    }
  }

  /**
   * Restore state from storage
   */
  async restoreState(state: ToolState): Promise<void> {
    this.instance.state = state;
    
    // Apply window state if container exists
    if (this.containerElement && state.windowState) {
      this.applyWindowState(state.windowState);
    }

    // Notify tool of state restoration
    if (this.isInitialized) {
      await this.sendMessage({
        id: this.generateMessageId(),
        type: 'command',
        source: 'container',
        target: this.manifest.id,
        payload: { command: 'restoreState', state },
        timestamp: new Date(),
        requiresResponse: false
      });
    }
  }

  /**
   * Get tool instance information
   */
  getInstance(): ToolInstance {
    return { ...this.instance };
  }

  /**
   * Check if tool is active
   */
  isActive(): boolean {
    return this.instance.isActive && this.isInitialized;
  }

  /**
   * Resize the tool container
   */
  resize(width: number, height: number): void {
    if (this.containerElement) {
      this.containerElement.style.width = `${width}px`;
      this.containerElement.style.height = `${height}px`;
      
      // Update state
      this.instance.state.windowState.width = width;
      this.instance.state.windowState.height = height;
    }
  }

  /**
   * Maximize the tool container
   */
  maximize(): void {
    if (this.containerElement) {
      this.containerElement.style.width = '100%';
      this.containerElement.style.height = '100%';
      this.instance.state.windowState.isMaximized = true;
    }
  }

  /**
   * Minimize the tool container
   */
  minimize(): void {
    if (this.containerElement) {
      this.containerElement.style.display = 'none';
      this.instance.state.windowState.isMinimized = true;
    }
  }

  /**
   * Restore from minimized state
   */
  restore(): void {
    if (this.containerElement) {
      this.containerElement.style.display = 'block';
      this.instance.state.windowState.isMinimized = false;
      this.instance.state.windowState.isMaximized = false;
    }
  }

  // Private methods

  private generateInstanceId(): string {
    return `${this.manifest.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createInitialState(initialState?: Partial<ToolState>): ToolState {
    const defaultWindowState: WindowState = {
      width: this.manifest.minWidth || 800,
      height: this.manifest.minHeight || 600,
      x: 100,
      y: 100,
      isMaximized: this.manifest.fullscreen || false,
      isMinimized: false,
      zIndex: 1000
    };

    return {
      windowState: initialState?.windowState || defaultWindowState,
      applicationState: initialState?.applicationState || {},
      fileStates: initialState?.fileStates || [],
      sessionData: initialState?.sessionData || {}
    };
  }

  private calculatePermissions() {
    // Filter manifest permissions based on user permissions
    return this.manifest.permissions.filter(manifestPerm => {
      return this.userContext.permissions.some(userPerm => 
        userPerm.action === manifestPerm.action && 
        userPerm.resource === manifestPerm.resource
      );
    });
  }

  private validatePermissions(): void {
    const requiredPermissions = this.manifest.permissions;
    const userPermissions = this.userContext.permissions;

    for (const required of requiredPermissions) {
      const hasPermission = userPermissions.some(userPerm => 
        userPerm.action === required.action && 
        userPerm.resource === required.resource
      );

      if (!hasPermission) {
        throw new PermissionError(
          `User lacks required permission: ${required.action} on ${required.resource}`,
          this.userContext.userId,
          required.resource,
          required.action
        );
      }
    }
  }

  private createContainer(parentElement?: HTMLElement): void {
    const parent = parentElement || document.body;
    
    this.containerElement = document.createElement('div');
    this.containerElement.className = 'scrollos-tool-container';
    this.containerElement.id = `tool-container-${this.instance.id}`;
    
    // Apply styling
    Object.assign(this.containerElement.style, {
      position: 'absolute',
      width: `${this.instance.state.windowState.width}px`,
      height: `${this.instance.state.windowState.height}px`,
      left: `${this.instance.state.windowState.x}px`,
      top: `${this.instance.state.windowState.y}px`,
      zIndex: this.instance.state.windowState.zIndex.toString(),
      border: '1px solid #ccc',
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      display: this.instance.state.windowState.isMinimized ? 'none' : 'block'
    });

    // Add tool header
    this.createToolHeader();

    parent.appendChild(this.containerElement);
  }

  private createToolHeader(): void {
    if (!this.containerElement) return;

    const header = document.createElement('div');
    header.className = 'scrollos-tool-header';
    Object.assign(header.style, {
      height: '40px',
      backgroundColor: this.manifest.color || '#f5f5f5',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      cursor: 'move'
    });

    // Tool title and icon
    const titleSection = document.createElement('div');
    titleSection.style.display = 'flex';
    titleSection.style.alignItems = 'center';

    if (this.manifest.icon) {
      const icon = document.createElement('img');
      icon.src = this.manifest.icon;
      icon.style.width = '20px';
      icon.style.height = '20px';
      icon.style.marginRight = '8px';
      titleSection.appendChild(icon);
    }

    const title = document.createElement('span');
    title.textContent = this.manifest.displayName;
    title.style.fontWeight = '500';
    title.style.fontSize = '14px';
    titleSection.appendChild(title);

    // Control buttons
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '4px';

    // Minimize button
    const minimizeBtn = this.createControlButton('−', () => this.minimize());
    controls.appendChild(minimizeBtn);

    // Maximize button
    const maximizeBtn = this.createControlButton('□', () => {
      if (this.instance.state.windowState.isMaximized) {
        this.restore();
      } else {
        this.maximize();
      }
    });
    controls.appendChild(maximizeBtn);

    // Close button
    const closeBtn = this.createControlButton('×', () => this.close());
    closeBtn.style.color = '#ff4444';
    controls.appendChild(closeBtn);

    header.appendChild(titleSection);
    header.appendChild(controls);
    this.containerElement.appendChild(header);

    // Make header draggable
    this.makeDraggable(header);
  }

  private createControlButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    Object.assign(button.style, {
      width: '24px',
      height: '24px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      borderRadius: '4px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
    
    button.onmouseenter = () => button.style.backgroundColor = 'rgba(0,0,0,0.1)';
    button.onmouseleave = () => button.style.backgroundColor = 'transparent';
    
    return button;
  }

  private makeDraggable(header: HTMLElement): void {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    header.onmousedown = (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = this.instance.state.windowState.x;
      startTop = this.instance.state.windowState.y;
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !this.containerElement) return;
      
      const newX = startLeft + (e.clientX - startX);
      const newY = startTop + (e.clientY - startY);
      
      this.containerElement.style.left = `${newX}px`;
      this.containerElement.style.top = `${newY}px`;
      
      this.instance.state.windowState.x = newX;
      this.instance.state.windowState.y = newY;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }

  private async initializeIframe(): Promise<void> {
    if (!this.containerElement || !this.manifest.url) {
      throw new ToolIntegrationError(
        'Container element or URL missing for iframe initialization',
        this.manifest.id,
        'IFRAME_INIT_FAILED'
      );
    }

    this.toolFrame = document.createElement('iframe');
    this.toolFrame.src = this.buildToolURL();
    this.toolFrame.style.width = '100%';
    this.toolFrame.style.height = 'calc(100% - 40px)'; // Account for header
    this.toolFrame.style.border = 'none';
    this.toolFrame.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';

    // Add message listener for iframe communication
    window.addEventListener('message', this.handleIframeMessage.bind(this));

    this.containerElement.appendChild(this.toolFrame);

    // Wait for iframe to load
    return new Promise((resolve, reject) => {
      this.toolFrame!.onload = () => resolve();
      this.toolFrame!.onerror = () => reject(new Error('Failed to load tool iframe'));
    });
  }

  private async initializeAPI(): Promise<void> {
    // API integration would initialize HTTP client and test connection
    // Implementation depends on specific API requirements
    console.log(`Initializing API integration for ${this.manifest.id}`);
  }

  private async initializeRPC(): Promise<void> {
    if (!this.containerElement || !this.manifest.rpcInterface) {
      throw new ToolIntegrationError(
        'Container element or RPC interface missing',
        this.manifest.id,
        'RPC_INIT_FAILED'
      );
    }

    try {
      // Create RPC communication channel
      const rpcChannel = new MessageChannel();
      const port1 = rpcChannel.port1;
      const port2 = rpcChannel.port2;

      // Set up message handling for RPC
      port1.onmessage = (event) => {
        this.handleRPCMessage(event.data);
      };

      // Store RPC port for communication
      (this as any).rpcPort = port1;

      // Create RPC container
      const rpcContainer = document.createElement('div');
      rpcContainer.className = 'scrollos-rpc-container';
      rpcContainer.style.width = '100%';
      rpcContainer.style.height = 'calc(100% - 40px)';
      rpcContainer.style.display = 'flex';
      rpcContainer.style.alignItems = 'center';
      rpcContainer.style.justifyContent = 'center';
      rpcContainer.style.backgroundColor = '#f8f9fa';
      rpcContainer.style.border = '2px dashed #dee2e6';
      rpcContainer.style.borderRadius = '8px';

      // Add RPC status indicator
      const statusIndicator = document.createElement('div');
      statusIndicator.innerHTML = `
        <div style="text-align: center; color: #6c757d;">
          <div style="font-size: 24px; margin-bottom: 8px;">🔗</div>
          <div style="font-weight: 500;">RPC Tool Connected</div>
          <div style="font-size: 14px; margin-top: 4px;">${this.manifest.displayName}</div>
        </div>
      `;
      rpcContainer.appendChild(statusIndicator);

      this.containerElement.appendChild(rpcContainer);

      // Initialize RPC connection
      await this.establishRPCConnection();

      logger.info(`RPC integration initialized for ${this.manifest.id}`);

    } catch (error) {
      logger.error(`RPC initialization failed for ${this.manifest.id}:`, error);
      throw error;
    }
  }

  private async initializeEmbed(): Promise<void> {
    if (!this.containerElement || !this.manifest.embedCode) {
      throw new ToolIntegrationError(
        'Container element or embed code missing',
        this.manifest.id,
        'EMBED_INIT_FAILED'
      );
    }

    // Create embed container
    const embedContainer = document.createElement('div');
    embedContainer.innerHTML = this.manifest.embedCode;
    embedContainer.style.width = '100%';
    embedContainer.style.height = 'calc(100% - 40px)';
    
    this.containerElement.appendChild(embedContainer);
  }

  private buildToolURL(): string {
    if (!this.manifest.url) return '';

    const url = new URL(this.manifest.url);
    
    // Add authentication and context parameters
    url.searchParams.set('userId', this.userContext.userId);
    url.searchParams.set('toolId', this.manifest.id);
    url.searchParams.set('instanceId', this.instance.id);
    
    if (this.instance.projectId) {
      url.searchParams.set('projectId', this.instance.projectId);
    }

    return url.toString();
  }

  private handleIframeMessage(event: MessageEvent): void {
    // Validate origin for security
    if (!this.isValidOrigin(event.origin)) {
      return;
    }

    const message: ToolMessage = event.data;
    if (message.target === this.manifest.id) {
      this.eventListeners.onMessage?.(message);
    }
  }

  private isValidOrigin(origin: string): boolean {
    if (!this.manifest.url) return false;
    
    try {
      const toolOrigin = new URL(this.manifest.url).origin;
      return origin === toolOrigin;
    } catch {
      return false;
    }
  }

  private async sendIframeMessage(message: ToolMessage): Promise<ToolResponse> {
    if (!this.toolFrame?.contentWindow) {
      throw new ToolIntegrationError(
        'Iframe not available for message sending',
        this.manifest.id,
        'IFRAME_NOT_AVAILABLE'
      );
    }

    // Send message to iframe
    this.toolFrame.contentWindow.postMessage(message, '*');

    // If response is required, wait for it
    if (message.requiresResponse) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Message timeout'));
        }, 5000);

        const responseHandler = (event: MessageEvent) => {
          const response: ToolResponse = event.data;
          if (response.messageId === message.id) {
            clearTimeout(timeout);
            window.removeEventListener('message', responseHandler);
            resolve(response);
          }
        };

        window.addEventListener('message', responseHandler);
      });
    }

    // Return immediate response for non-blocking messages
    return {
      id: this.generateMessageId(),
      messageId: message.id,
      success: true,
      timestamp: new Date()
    };
  }

  private async sendAPIMessage(message: ToolMessage): Promise<ToolResponse> {
    // Implementation for API-based message sending
    throw new Error('API message sending not yet implemented');
  }

  private async sendRPCMessage(message: ToolMessage): Promise<ToolResponse> {
    const rpcPort = (this as any).rpcPort;
    if (!rpcPort) {
      throw new ToolIntegrationError(
        'RPC port not available for message sending',
        this.manifest.id,
        'RPC_NOT_AVAILABLE'
      );
    }

    try {
      // Send message through RPC port
      rpcPort.postMessage(message);

      // If response is required, wait for it
      if (message.requiresResponse) {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('RPC message timeout'));
          }, 10000); // 10 second timeout for RPC

          const responseHandler = (event: MessageEvent) => {
            const response: ToolResponse = event.data;
            if (response.messageId === message.id) {
              clearTimeout(timeout);
              rpcPort.removeEventListener('message', responseHandler);
              resolve(response);
            }
          };

          rpcPort.addEventListener('message', responseHandler);
        });
      }

      // Return immediate response for non-blocking messages
      return {
        id: this.generateMessageId(),
        messageId: message.id,
        success: true,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error(`RPC message sending failed for ${this.manifest.id}:`, error);
      throw error;
    }
  }

  private setupMessageHandlers(): void {
    // Set up standard message handlers
    this.messageHandlers.set('getState', async () => ({
      id: this.generateMessageId(),
      messageId: '',
      success: true,
      data: this.instance.state,
      timestamp: new Date()
    }));

    this.messageHandlers.set('setState', async (message) => {
      await this.setState(message.payload.state);
      return {
        id: this.generateMessageId(),
        messageId: message.id,
        success: true,
        timestamp: new Date()
      };
    });
  }

  private applyWindowState(windowState: WindowState): void {
    if (!this.containerElement) return;

    Object.assign(this.containerElement.style, {
      width: `${windowState.width}px`,
      height: `${windowState.height}px`,
      left: `${windowState.x}px`,
      top: `${windowState.y}px`,
      zIndex: windowState.zIndex.toString(),
      display: windowState.isMinimized ? 'none' : 'block'
    });

    if (windowState.isMaximized) {
      this.maximize();
    }
  }

  private getCurrentCourse(): string | undefined {
    // Get current course from user context or URL
    return this.userContext.enrolledCourses[0]; // Simplified
  }

  private getAuthToken(): string {
    return process.env.SCROLLOS_API_TOKEN || 'placeholder-token';
  }

  private startHeartbeat(): void {
    setInterval(() => {
      this.lastHeartbeat = new Date();
      // Could send heartbeat to server here
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    // Cleanup heartbeat interval
  }

  private async establishRPCConnection(): Promise<void> {
    try {
      // Send initial handshake message
      const handshakeMessage: ToolMessage = {
        id: this.generateMessageId(),
        type: 'command',
        source: 'container',
        target: this.manifest.id,
        payload: { 
          command: 'handshake',
          instanceId: this.instance.id,
          userId: this.userContext.userId,
          permissions: this.instance.permissions
        },
        timestamp: new Date(),
        requiresResponse: true
      };

      const response = await this.sendRPCMessage(handshakeMessage);
      
      if (!response.success) {
        throw new Error(`RPC handshake failed: ${response.error}`);
      }

      logger.info(`RPC connection established for ${this.manifest.id}`);

    } catch (error) {
      logger.error(`RPC connection failed for ${this.manifest.id}:`, error);
      throw error;
    }
  }

  private handleRPCMessage(message: any): void {
    try {
      // Validate message format
      if (!message.id || !message.type || !message.source) {
        logger.warn(`Invalid RPC message received from ${this.manifest.id}:`, message);
        return;
      }

      // Process different message types
      switch (message.type) {
        case 'event':
          this.handleRPCEvent(message);
          break;
        case 'data':
          this.handleRPCData(message);
          break;
        case 'query':
          this.handleRPCQuery(message);
          break;
        default:
          logger.warn(`Unknown RPC message type: ${message.type}`);
      }

      // Emit message event
      this.eventListeners.onMessage?.(message);

    } catch (error) {
      logger.error(`RPC message handling failed for ${this.manifest.id}:`, error);
    }
  }

  private handleRPCEvent(message: any): void {
    // Handle RPC events (e.g., tool state changes, user actions)
    logger.debug(`RPC event received from ${this.manifest.id}:`, message.payload);
    
    // Update instance context if needed
    if (message.payload.contextUpdate) {
      this.instance.contextData = {
        ...this.instance.contextData,
        ...message.payload.contextUpdate
      };
    }
  }

  private handleRPCData(message: any): void {
    // Handle RPC data messages (e.g., file saves, state updates)
    logger.debug(`RPC data received from ${this.manifest.id}:`, message.payload);
    
    // Auto-save state if data contains state update
    if (message.payload.stateUpdate) {
      this.setState(message.payload.stateUpdate);
    }
  }

  private async handleRPCQuery(message: any): Promise<void> {
    // Handle RPC queries (e.g., permission checks, context requests)
    logger.debug(`RPC query received from ${this.manifest.id}:`, message.payload);
    
    let response: any = {
      id: this.generateMessageId(),
      messageId: message.id,
      success: true,
      timestamp: new Date()
    };

    try {
      switch (message.payload.query) {
        case 'getPermissions':
          response.data = this.instance.permissions;
          break;
        case 'getContext':
          response.data = this.instance.contextData;
          break;
        case 'getUserInfo':
          response.data = {
            userId: this.userContext.userId,
            role: this.userContext.role,
            preferences: this.userContext.preferences
          };
          break;
        default:
          response.success = false;
          response.error = `Unknown query: ${message.payload.query}`;
      }
    } catch (error) {
      response.success = false;
      response.error = error instanceof Error ? error.message : 'Query processing failed';
    }

    // Send response back through RPC
    const rpcPort = (this as any).rpcPort;
    if (rpcPort) {
      rpcPort.postMessage(response);
    }
  }

  private logEvent(type: string, data: Record<string, any>): void {
    const event: ToolEvent = {
      type: type as any,
      toolId: this.manifest.id,
      userId: this.userContext.userId,
      projectId: this.instance.projectId,
      data,
      timestamp: new Date()
    };

    // Send to analytics service
    console.log('Tool event:', event);
    
    // Also send to backend API for persistence
    this.sendEventToBackend(event).catch(error => {
      logger.warn('Failed to send event to backend:', error);
    });
  }

  private async sendEventToBackend(event: ToolEvent): Promise<void> {
    try {
      await fetch('/api/scrollos/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      // Non-blocking - events are for analytics, not critical functionality
      logger.debug('Event logging to backend failed:', error);
    }
  }
}