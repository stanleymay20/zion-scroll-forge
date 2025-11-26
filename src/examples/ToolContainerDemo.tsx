/**
 * ToolContainer Demo Component
 * 
 * Demonstrates the ToolContainer functionality with various integration methods
 * and provides a testing interface for the ScrollOS academic tools system.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ToolContainer, ToolContainerOptions, ToolContainerEvents } from '../services/scrollos/ToolContainer';
import { 
  ToolManifest, 
  UserContext, 
  ToolInstance, 
  AcademicDiscipline,
  ToolMessage,
  ToolResponse
} from '../types/scrollos-tools';

interface DemoState {
  container: ToolContainer | null;
  instance: ToolInstance | null;
  isLaunched: boolean;
  messages: string[];
  error: string | null;
}

const ToolContainerDemo: React.FC = () => {
  const [state, setState] = useState<DemoState>({
    container: null,
    instance: null,
    isLaunched: false,
    messages: [],
    error: null
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Sample tool manifests for testing
  const sampleManifests: ToolManifest[] = [
    {
      id: 'vscode-web',
      name: 'vscode-web',
      displayName: 'VS Code Web',
      description: 'Web-based code editor for programming courses',
      version: '1.0.0',
      category: 'computer-science' as AcademicDiscipline,
      integrationMethod: 'iframe',
      url: 'https://vscode.dev',
      permissions: [
        { action: 'read', resource: 'files' },
        { action: 'write', resource: 'files' }
      ],
      requiresAuth: true,
      ssoEnabled: false,
      aiAgents: ['ScrollTutor', 'ScrollBuilder'],
      contextAware: true,
      supportedFormats: ['js', 'ts', 'py', 'java', 'cpp'],
      dataExportFormats: ['zip', 'tar'],
      crossToolCompatibility: ['github-integration'],
      icon: '/icons/vscode.svg',
      color: '#007ACC',
      fullscreen: false,
      resizable: true,
      minWidth: 1000,
      minHeight: 700,
      collaborationEnabled: true,
      offlineCapable: false,
      cloudProcessing: true,
      vendor: 'Microsoft',
      license: 'MIT',
      documentation: 'https://code.visualstudio.com/docs',
      supportContact: 'support@scrolluniversity.com',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'figma-embed',
      name: 'figma-embed',
      displayName: 'Figma Design',
      description: 'Collaborative design tool for creative courses',
      version: '1.0.0',
      category: 'creative-design' as AcademicDiscipline,
      integrationMethod: 'embed',
      embedCode: '<iframe src="https://www.figma.com/embed" width="100%" height="100%" frameborder="0"></iframe>',
      permissions: [
        { action: 'read', resource: 'designs' },
        { action: 'write', resource: 'designs' },
        { action: 'share', resource: 'designs' }
      ],
      requiresAuth: true,
      ssoEnabled: true,
      aiAgents: ['ScrollDesign'],
      contextAware: true,
      supportedFormats: ['fig', 'svg', 'png', 'jpg'],
      dataExportFormats: ['svg', 'png', 'jpg', 'pdf'],
      crossToolCompatibility: ['adobe-creative'],
      icon: '/icons/figma.svg',
      color: '#F24E1E',
      fullscreen: true,
      resizable: true,
      minWidth: 800,
      minHeight: 600,
      collaborationEnabled: true,
      offlineCapable: false,
      cloudProcessing: true,
      vendor: 'Figma',
      license: 'Commercial',
      documentation: 'https://help.figma.com',
      supportContact: 'support@scrolluniversity.com',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'rpc-calculator',
      name: 'rpc-calculator',
      displayName: 'RPC Calculator',
      description: 'Sample RPC tool for testing RPC integration',
      version: '1.0.0',
      category: 'computer-science' as AcademicDiscipline,
      integrationMethod: 'rpc',
      rpcInterface: 'ws://localhost:8080/calculator',
      permissions: [
        { action: 'execute', resource: 'calculations' }
      ],
      requiresAuth: false,
      ssoEnabled: false,
      aiAgents: [],
      contextAware: false,
      supportedFormats: ['json'],
      dataExportFormats: ['json'],
      crossToolCompatibility: [],
      icon: '/icons/calculator.svg',
      color: '#4CAF50',
      fullscreen: false,
      resizable: true,
      minWidth: 400,
      minHeight: 300,
      collaborationEnabled: false,
      offlineCapable: true,
      cloudProcessing: false,
      vendor: 'ScrollUniversity',
      license: 'MIT',
      documentation: 'https://docs.scrolluniversity.com/calculator',
      supportContact: 'support@scrolluniversity.com',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Sample user context
  const userContext: UserContext = {
    userId: 'demo-user-123',
    email: 'demo@scrolluniversity.com',
    role: 'student',
    enrolledCourses: ['CS101', 'DESIGN201'],
    declaredMajor: 'computer-science' as AcademicDiscipline,
    permissions: [
      { action: 'read', resource: 'files' },
      { action: 'write', resource: 'files' },
      { action: 'read', resource: 'designs' },
      { action: 'write', resource: 'designs' },
      { action: 'share', resource: 'designs' },
      { action: 'execute', resource: 'calculations' }
    ],
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      defaultTools: {
        'computer-science': ['vscode-web'],
        'creative-design': ['figma-embed']
      },
      aiAssistanceLevel: 'moderate',
      collaborationSettings: {
        shareByDefault: false,
        allowRealTimeEditing: true,
        notifyOnChanges: true,
        maxCollaborators: 5
      }
    }
  };

  const addMessage = (message: string) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, `${new Date().toLocaleTimeString()}: ${message}`]
    }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const launchTool = async (manifest: ToolManifest) => {
    try {
      setError(null);
      addMessage(`Launching tool: ${manifest.displayName}`);

      const options: ToolContainerOptions = {
        manifest,
        userContext,
        projectId: 'demo-project-456',
        parentElement: containerRef.current || undefined
      };

      const events: ToolContainerEvents = {
        onLaunched: (instance: ToolInstance) => {
          addMessage(`Tool launched successfully: ${instance.id}`);
          setState(prev => ({ ...prev, instance, isLaunched: true }));
        },
        onClosed: (instance: ToolInstance) => {
          addMessage(`Tool closed: ${instance.id}`);
          setState(prev => ({ 
            ...prev, 
            container: null, 
            instance: null, 
            isLaunched: false 
          }));
        },
        onStateChanged: (instance: ToolInstance, newState: any) => {
          addMessage(`State changed for ${instance.id}`);
        },
        onError: (error: Error) => {
          addMessage(`Error: ${error.message}`);
          setError(error.message);
        },
        onMessage: (message: ToolMessage) => {
          addMessage(`Message received: ${message.type} from ${message.source}`);
        }
      };

      const container = new ToolContainer(options, events);
      const instance = await container.launch();

      setState(prev => ({ ...prev, container }));
      addMessage(`Tool container created and launched`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      addMessage(`Launch failed: ${errorMessage}`);
    }
  };

  const closeTool = async () => {
    if (state.container) {
      try {
        await state.container.close();
        addMessage('Tool closed successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        addMessage(`Close failed: ${errorMessage}`);
      }
    }
  };

  const sendTestMessage = async () => {
    if (state.container && state.isLaunched) {
      try {
        const message: ToolMessage = {
          id: `msg-${Date.now()}`,
          type: 'command',
          source: 'demo',
          target: state.instance?.manifestId || 'unknown',
          payload: { command: 'ping', data: 'Hello from demo!' },
          timestamp: new Date(),
          requiresResponse: true
        };

        addMessage(`Sending test message: ${message.id}`);
        const response = await state.container.sendMessage(message);
        addMessage(`Response received: ${response.success ? 'Success' : 'Failed'}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        addMessage(`Message failed: ${errorMessage}`);
      }
    }
  };

  const resizeTool = () => {
    if (state.container && state.isLaunched) {
      const newWidth = 1200;
      const newHeight = 800;
      state.container.resize(newWidth, newHeight);
      addMessage(`Resized tool to ${newWidth}x${newHeight}`);
    }
  };

  const maximizeTool = () => {
    if (state.container && state.isLaunched) {
      state.container.maximize();
      addMessage('Tool maximized');
    }
  };

  const minimizeTool = () => {
    if (state.container && state.isLaunched) {
      state.container.minimize();
      addMessage('Tool minimized');
    }
  };

  const restoreTool = () => {
    if (state.container && state.isLaunched) {
      state.container.restore();
      addMessage('Tool restored');
    }
  };

  const clearMessages = () => {
    setState(prev => ({ ...prev, messages: [], error: null }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ScrollOS ToolContainer Demo
        </h1>
        <p className="text-gray-600">
          Test the ToolContainer functionality with various integration methods
        </p>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-700">{state.error}</p>
        </div>
      )}

      {/* Tool Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleManifests.map((manifest) => (
            <div
              key={manifest.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center mb-2">
                <div
                  className="w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: manifest.color }}
                />
                <h3 className="font-semibold">{manifest.displayName}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{manifest.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {manifest.integrationMethod}
                </span>
                <button
                  onClick={() => launchTool(manifest)}
                  disabled={state.isLaunched}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Launch
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Controls */}
      {state.isLaunched && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Tool Controls</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={sendTestMessage}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Send Test Message
            </button>
            <button
              onClick={resizeTool}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Resize (1200x800)
            </button>
            <button
              onClick={maximizeTool}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Maximize
            </button>
            <button
              onClick={minimizeTool}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Minimize
            </button>
            <button
              onClick={restoreTool}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            >
              Restore
            </button>
            <button
              onClick={closeTool}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close Tool
            </button>
          </div>
        </div>
      )}

      {/* Tool Container */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Tool Container</h2>
        <div
          ref={containerRef}
          className="min-h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative"
          style={{ minHeight: '400px' }}
        >
          {!state.isLaunched && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🚀</div>
                <p>Launch a tool to see it here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instance Information */}
      {state.instance && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Instance Information</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Instance ID:</strong> {state.instance.id}
              </div>
              <div>
                <strong>Tool ID:</strong> {state.instance.manifestId}
              </div>
              <div>
                <strong>User ID:</strong> {state.instance.userId}
              </div>
              <div>
                <strong>Project ID:</strong> {state.instance.projectId}
              </div>
              <div>
                <strong>Active:</strong> {state.instance.isActive ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Last Accessed:</strong> {state.instance.lastAccessed.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Log */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Message Log</h2>
          <button
            onClick={clearMessages}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          {state.messages.length === 0 ? (
            <div className="text-gray-500">No messages yet...</div>
          ) : (
            state.messages.map((message, index) => (
              <div key={index} className="mb-1">
                {message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Technical Information */}
      <div className="text-sm text-gray-500">
        <h3 className="font-semibold mb-2">Technical Notes:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>This demo showcases iframe, embed, and RPC integration methods</li>
          <li>Real tools would require proper authentication and CORS configuration</li>
          <li>RPC integration requires a WebSocket server for full functionality</li>
          <li>State persistence and collaboration features are demonstrated</li>
          <li>Security sandboxing and permission enforcement are active</li>
        </ul>
      </div>
    </div>
  );
};

export default ToolContainerDemo;