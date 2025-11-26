/**
 * ScrollOS App Component
 * 
 * Main application component that orchestrates the entire ScrollOS
 * academic tools integration system.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScrollOSDesktop } from './ScrollOSDesktop';
import { 
  UserContext, 
  AcademicWorkspace, 
  AcademicDiscipline,
  ToolGroup,
  CourseInfo,
  AgentConfiguration,
  WorkspacePreferences
} from '../../types/scrollos-tools';

interface ScrollOSAppProps {
  initialUserContext?: Partial<UserContext>;
}

// Default tool groups for different disciplines
const createDefaultToolGroups = (disciplines: AcademicDiscipline[]): ToolGroup[] => {
  const groups: ToolGroup[] = [];

  if (disciplines.includes('computer-science') || disciplines.includes('artificial-intelligence')) {
    groups.push({
      id: 'cs-development',
      name: 'Development Tools',
      description: 'Code editors, terminals, and development environments',
      tools: ['vscode-web', 'cloud-terminal', 'github-integration', 'api-tester', 'sql-playground'],
      color: '#2196f3',
      icon: '💻',
      isCustom: false
    });

    groups.push({
      id: 'ai-ml',
      name: 'AI & Machine Learning',
      description: 'AI model exploration and machine learning tools',
      tools: ['huggingface-explorer', 'jupyter-lab', 'tensorflow-playground', 'scrollcoder-ai'],
      color: '#ff9800',
      icon: '🤖',
      isCustom: false
    });
  }

  if (disciplines.some(d => d.includes('engineering'))) {
    groups.push({
      id: 'engineering-design',
      name: 'Engineering Design',
      description: 'CAD, simulation, and circuit design tools',
      tools: ['onshape-cad', 'simscale-simulation', 'circuitverse', 'phet-physics'],
      color: '#4caf50',
      icon: '⚙️',
      isCustom: false
    });
  }

  if (disciplines.includes('data-science') || disciplines.includes('statistics')) {
    groups.push({
      id: 'data-analytics',
      name: 'Data Analytics',
      description: 'Statistical analysis and data visualization tools',
      tools: ['jasp-statistics', 'rstudio-web', 'tableau-public', 'scrollquant-ai'],
      color: '#9c27b0',
      icon: '📊',
      isCustom: false
    });
  }

  if (disciplines.includes('creative-design') || disciplines.includes('architecture')) {
    groups.push({
      id: 'creative-design',
      name: 'Creative Design',
      description: 'Design, modeling, and creative tools',
      tools: ['figma-design', 'blender-web', 'sketchup-web', 'scrolldesign-ai'],
      color: '#e91e63',
      icon: '🎨',
      isCustom: false
    });
  }

  if (disciplines.includes('medicine') || disciplines.includes('health-sciences')) {
    groups.push({
      id: 'medical-tools',
      name: 'Medical Education',
      description: 'Anatomy, physiology, and medical imaging tools',
      tools: ['biodigital-human', 'dicom-viewer', 'physiology-simulator', 'scrollmed-ai'],
      color: '#f44336',
      icon: '🏥',
      isCustom: false
    });
  }

  if (disciplines.includes('theology') || disciplines.includes('biblical-studies')) {
    groups.push({
      id: 'theology-research',
      name: 'Theology Research',
      description: 'Biblical research and hermeneutical tools',
      tools: ['bible-api', 'greek-hebrew-lexicon', 'interlinear-viewer', 'scrollhermeneutics-ai'],
      color: '#795548',
      icon: '📖',
      isCustom: false
    });
  }

  // Always include general tools
  groups.push({
    id: 'general-tools',
    name: 'General Tools',
    description: 'Productivity and collaboration tools',
    tools: ['document-editor', 'presentation-maker', 'collaboration-hub', 'file-manager'],
    color: '#607d8b',
    icon: '🛠️',
    isCustom: false
  });

  return groups;
};

// Create default workspace
const createDefaultWorkspace = (userContext: UserContext): AcademicWorkspace => {
  const disciplines = [
    userContext.declaredMajor,
    ...(userContext.minors || [])
  ].filter(Boolean) as AcademicDiscipline[];

  return {
    userId: userContext.userId,
    disciplines,
    currentSemester: 'Fall 2024', // This would come from enrollment data
    enrolledCourses: userContext.enrolledCourses.map(courseId => ({
      courseId,
      courseName: `Course ${courseId}`, // This would come from course data
      courseCode: courseId.toUpperCase(),
      discipline: disciplines[0] || 'computer-science',
      instructor: 'Dr. Smith', // This would come from course data
      semester: 'Fall 2024',
      requiredTools: [],
      recommendedTools: []
    })),
    availableTools: [], // Will be populated by manifest loader
    favoriteTools: [],
    recentTools: [],
    customToolGroups: createDefaultToolGroups(disciplines),
    projects: [],
    recentFiles: [],
    aiAgentSettings: [
      {
        agentType: 'ScrollTutor',
        isEnabled: true,
        assistanceLevel: 'moderate',
        contextScope: 'course',
        spiritualGuidanceEnabled: true
      },
      {
        agentType: 'ScrollResearcher',
        isEnabled: true,
        assistanceLevel: 'comprehensive',
        contextScope: 'project',
        spiritualGuidanceEnabled: true
      },
      {
        agentType: 'ScrollBuilder',
        isEnabled: true,
        assistanceLevel: 'moderate',
        contextScope: 'tool',
        spiritualGuidanceEnabled: false
      },
      {
        agentType: 'ScrollProfessor',
        isEnabled: false,
        assistanceLevel: 'minimal',
        contextScope: 'global',
        spiritualGuidanceEnabled: true
      }
    ],
    preferences: {
      layout: 'grid',
      theme: 'light',
      showToolDescriptions: true,
      groupByDiscipline: true,
      autoLaunchTools: false,
      saveWindowStates: true,
      enableNotifications: true,
      collaborationDefaults: {
        shareByDefault: false,
        allowRealTimeEditing: true,
        notifyOnChanges: true,
        maxCollaborators: 5
      }
    },
    createdAt: new Date(),
    lastAccessed: new Date()
  };
};

export const ScrollOSApp: React.FC<ScrollOSAppProps> = ({ initialUserContext }) => {
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [workspace, setWorkspace] = useState<AcademicWorkspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user context and workspace
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);

        // In a real app, this would come from authentication service
        const defaultUserContext: UserContext = {
          userId: 'user-123',
          email: 'student@scrolluniversity.edu',
          role: 'student',
          enrolledCourses: ['cs101', 'theo201', 'eng301'],
          declaredMajor: 'computer-science',
          minors: ['theology'],
          permissions: [
            { action: 'read', resource: 'tools' },
            { action: 'write', resource: 'projects' },
            { action: 'execute', resource: 'development-tools' }
          ],
          preferences: {
            theme: 'light',
            language: 'en',
            timezone: 'America/New_York',
            defaultTools: {
              'computer-science': ['vscode-web', 'github-integration'],
              'theology': ['bible-api', 'scrollhermeneutics-ai']
            },
            aiAssistanceLevel: 'moderate',
            collaborationSettings: {
              shareByDefault: false,
              allowRealTimeEditing: true,
              notifyOnChanges: true,
              maxCollaborators: 5
            }
          },
          ...initialUserContext
        };

        setUserContext(defaultUserContext);

        // Create or load workspace
        const userWorkspace = createDefaultWorkspace(defaultUserContext);
        setWorkspace(userWorkspace);

        setError(null);
      } catch (err) {
        console.error('Failed to initialize ScrollOS:', err);
        setError('Failed to initialize ScrollOS. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [initialUserContext]);

  // Handle workspace updates
  const handleWorkspaceUpdate = useCallback(async (updatedWorkspace: AcademicWorkspace) => {
    try {
      setWorkspace(updatedWorkspace);

      // In a real app, this would save to the backend
      console.log('Workspace updated:', updatedWorkspace);

      // Could implement auto-save here
      // await saveWorkspaceToServer(updatedWorkspace);
    } catch (err) {
      console.error('Failed to update workspace:', err);
      setError('Failed to save workspace changes.');
    }
  }, []);

  // Handle user context updates
  const handleUserContextUpdate = useCallback(async (updatedContext: UserContext) => {
    try {
      setUserContext(updatedContext);

      // Update workspace if disciplines changed
      if (workspace) {
        const newDisciplines = [
          updatedContext.declaredMajor,
          ...(updatedContext.minors || [])
        ].filter(Boolean) as AcademicDiscipline[];

        if (JSON.stringify(newDisciplines) !== JSON.stringify(workspace.disciplines)) {
          const updatedWorkspace = {
            ...workspace,
            disciplines: newDisciplines,
            customToolGroups: createDefaultToolGroups(newDisciplines)
          };
          setWorkspace(updatedWorkspace);
        }
      }

      // In a real app, this would save to the backend
      console.log('User context updated:', updatedContext);
    } catch (err) {
      console.error('Failed to update user context:', err);
      setError('Failed to save user preferences.');
    }
  }, [workspace]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#fafafa',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '4px solid #e3f2fd',
          borderTop: '4px solid #1976d2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px'
        }} />
        <h2 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#1976d2',
          marginBottom: '8px'
        }}>
          ScrollOS
        </h2>
        <p style={{ 
          margin: 0, 
          fontSize: '16px', 
          color: '#666'
        }}>
          Initializing Academic Tools Platform...
        </p>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error || !userContext || !workspace) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#fafafa',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #ffcdd2',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>
            ScrollOS Initialization Error
          </h2>
          <p style={{ margin: '0 0 16px 0' }}>
            {error || 'Failed to initialize the application.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  // Main application
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#fafafa'
    }}>
      <ScrollOSDesktop
        userContext={userContext}
        workspace={workspace}
        onWorkspaceUpdate={handleWorkspaceUpdate}
      />
      
      {/* Global styles */}
      <style>{`
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, sans-serif;
          background-color: #fafafa;
        }
        
        .tool-launcher {
          transition: all 0.2s ease;
        }
        
        .tool-launcher:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .tool-launcher.launched {
          background-color: #e3f2fd !important;
          border-color: #2196f3 !important;
        }
        
        .scrollos-tool-container {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .scrollos-tool-header {
          user-select: none;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};