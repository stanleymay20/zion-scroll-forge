/**
 * ScrollOS Desktop Component
 * 
 * Main workspace interface for the ScrollOS academic tools integration system.
 * Provides a unified desktop environment for launching and managing academic tools.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ToolManifest, 
  AcademicWorkspace, 
  UserContext, 
  ToolInstance,
  AcademicDiscipline,
  ToolGroup
} from '../../types/scrollos-tools';
import { AppManifestLoader } from '../../services/scrollos/AppManifestLoader';
import { ToolContainer } from '../../services/scrollos/ToolContainer';

interface ScrollOSDesktopProps {
  userContext: UserContext;
  workspace: AcademicWorkspace;
  onWorkspaceUpdate: (workspace: AcademicWorkspace) => void;
}

interface ToolLauncherProps {
  manifest: ToolManifest;
  onLaunch: (manifest: ToolManifest) => void;
  isLaunched: boolean;
}

interface ToolGroupProps {
  group: ToolGroup;
  manifests: ToolManifest[];
  onLaunch: (manifest: ToolManifest) => void;
  launchedTools: Set<string>;
}

const ToolLauncher: React.FC<ToolLauncherProps> = ({ manifest, onLaunch, isLaunched }) => {
  return (
    <div 
      className={`tool-launcher ${isLaunched ? 'launched' : ''}`}
      onClick={() => !isLaunched && onLaunch(manifest)}
      style={{
        width: '120px',
        height: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        margin: '8px',
        borderRadius: '12px',
        backgroundColor: isLaunched ? '#e3f2fd' : '#f8f9fa',
        border: `2px solid ${isLaunched ? '#2196f3' : '#e0e0e0'}`,
        cursor: isLaunched ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (!isLaunched) {
          e.currentTarget.style.backgroundColor = '#f0f0f0';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLaunched) {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Tool Icon */}
      <div style={{ marginBottom: '8px' }}>
        {manifest.icon ? (
          <img 
            src={manifest.icon} 
            alt={manifest.displayName}
            style={{ width: '32px', height: '32px' }}
          />
        ) : (
          <div 
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: manifest.color || '#666',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {manifest.displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Tool Name */}
      <div 
        style={{
          fontSize: '12px',
          fontWeight: '500',
          textAlign: 'center',
          color: '#333',
          lineHeight: '1.2',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        title={manifest.displayName}
      >
        {manifest.displayName}
      </div>

      {/* Launched Indicator */}
      {isLaunched && (
        <div 
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            backgroundColor: '#4caf50',
            borderRadius: '50%'
          }}
        />
      )}

      {/* Category Badge */}
      <div 
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '4px',
          fontSize: '8px',
          backgroundColor: manifest.color || '#666',
          color: 'white',
          padding: '2px 4px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }}
      >
        {manifest.category.split('-')[0]}
      </div>
    </div>
  );
};

const ToolGroupComponent: React.FC<ToolGroupProps> = ({ group, manifests, onLaunch, launchedTools }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const groupManifests = manifests.filter(m => group.tools.includes(m.id));

  if (groupManifests.length === 0) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Group Header */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {group.icon && (
          <span style={{ marginRight: '8px', fontSize: '16px' }}>{group.icon}</span>
        )}
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: '600',
          color: group.color || '#333',
          flex: 1
        }}>
          {group.name}
        </h3>
        <span style={{ 
          fontSize: '12px', 
          color: '#666',
          marginRight: '8px'
        }}>
          {groupManifests.length} tools
        </span>
        <span style={{ 
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▶
        </span>
      </div>

      {/* Group Description */}
      {group.description && (
        <p style={{ 
          margin: '0 0 12px 0', 
          fontSize: '14px', 
          color: '#666',
          paddingLeft: '12px'
        }}>
          {group.description}
        </p>
      )}

      {/* Tools Grid */}
      {isExpanded && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          paddingLeft: '12px'
        }}>
          {groupManifests.map(manifest => (
            <ToolLauncher
              key={manifest.id}
              manifest={manifest}
              onLaunch={onLaunch}
              isLaunched={launchedTools.has(manifest.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ScrollOSDesktop: React.FC<ScrollOSDesktopProps> = ({
  userContext,
  workspace,
  onWorkspaceUpdate
}) => {
  const [manifests, setManifests] = useState<ToolManifest[]>([]);
  const [launchedTools, setLaunchedTools] = useState<Map<string, ToolContainer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<AcademicDiscipline | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'groups'>('groups');

  // Initialize manifest loader
  const manifestLoader = useMemo(() => {
    return new AppManifestLoader({
      environment: 'development',
      apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
      storageBaseUrl: process.env.REACT_APP_STORAGE_BASE_URL || 'http://localhost:3001',
      toolManifestUrl: process.env.REACT_APP_TOOL_MANIFEST_URL || 'http://localhost:3001/api/tools',
      maxConcurrentTools: 10,
      toolTimeoutMs: 30000,
      aiServiceUrl: process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:3001/api/ai',
      aiModels: {
        ScrollTutor: 'gpt-4',
        ScrollResearcher: 'gpt-4',
        ScrollBuilder: 'gpt-4',
        ScrollProfessor: 'gpt-4'
      },
      maxAIContextLength: 4000,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxProjectSize: 1024 * 1024 * 1024, // 1GB
      versionRetentionDays: 30,
      jwtSecret: 'placeholder',
      encryptionKey: 'placeholder',
      sessionTimeoutMs: 3600000, // 1 hour
      cacheTimeoutMs: 300000, // 5 minutes
      maxConcurrentUsers: 1000,
      autoScalingEnabled: true,
      offlineEnabled: true,
      collaborationEnabled: true,
      academicIntegrityEnabled: true,
      spiritualAlignmentEnabled: true
    });
  }, []);

  // Load available tools
  useEffect(() => {
    const loadTools = async () => {
      try {
        setLoading(true);
        const availableManifests = await manifestLoader.getManifestsForUser(userContext);
        setManifests(availableManifests);
        setError(null);
      } catch (err) {
        console.error('Failed to load tools:', err);
        setError('Failed to load available tools. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, [manifestLoader, userContext]);

  // Filter manifests based on search and discipline
  const filteredManifests = useMemo(() => {
    return manifests.filter(manifest => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchableText = [
          manifest.name,
          manifest.displayName,
          manifest.description,
          manifest.category
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      // Discipline filter
      if (selectedDiscipline !== 'all') {
        const manifestDisciplines = [manifest.category, ...(manifest.subcategories || [])];
        if (!manifestDisciplines.includes(selectedDiscipline)) {
          return false;
        }
      }

      return true;
    });
  }, [manifests, searchTerm, selectedDiscipline]);

  // Get unique disciplines for filter
  const availableDisciplines = useMemo(() => {
    const disciplines = new Set<AcademicDiscipline>();
    manifests.forEach(manifest => {
      disciplines.add(manifest.category);
      manifest.subcategories?.forEach(sub => disciplines.add(sub));
    });
    return Array.from(disciplines).sort();
  }, [manifests]);

  // Launch a tool
  const launchTool = useCallback(async (manifest: ToolManifest) => {
    try {
      // Check if tool is already launched
      if (launchedTools.has(manifest.id)) {
        console.log(`Tool ${manifest.id} is already launched`);
        return;
      }

      // Create tool container
      const container = new ToolContainer(
        {
          manifest,
          userContext,
          projectId: workspace.projects[0]?.id // Use first project if available
        },
        {
          onLaunched: (instance) => {
            console.log(`Tool ${manifest.id} launched:`, instance);
          },
          onClosed: (instance) => {
            console.log(`Tool ${manifest.id} closed:`, instance);
            setLaunchedTools(prev => {
              const updated = new Map(prev);
              updated.delete(manifest.id);
              return updated;
            });
          },
          onError: (error) => {
            console.error(`Tool ${manifest.id} error:`, error);
            setError(`Failed to launch ${manifest.displayName}: ${error.message}`);
          }
        }
      );

      // Launch the tool
      await container.launch();

      // Add to launched tools
      setLaunchedTools(prev => new Map(prev).set(manifest.id, container));

      // Update workspace recent tools
      const updatedWorkspace = {
        ...workspace,
        recentTools: [manifest.id, ...workspace.recentTools.filter(id => id !== manifest.id)].slice(0, 10)
      };
      onWorkspaceUpdate(updatedWorkspace);

    } catch (err) {
      console.error(`Failed to launch tool ${manifest.id}:`, err);
      setError(`Failed to launch ${manifest.displayName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [launchedTools, userContext, workspace, onWorkspaceUpdate]);

  // Render tools based on view mode
  const renderTools = () => {
    if (viewMode === 'groups') {
      return workspace.customToolGroups.map(group => (
        <ToolGroupComponent
          key={group.id}
          group={group}
          manifests={filteredManifests}
          onLaunch={launchTool}
          launchedTools={new Set(launchedTools.keys())}
        />
      ));
    }

    // Grid or list view
    return (
      <div style={{
        display: viewMode === 'grid' ? 'flex' : 'block',
        flexWrap: 'wrap',
        gap: viewMode === 'grid' ? '8px' : '0'
      }}>
        {filteredManifests.map(manifest => (
          <ToolLauncher
            key={manifest.id}
            manifest={manifest}
            onLaunch={launchTool}
            isLaunched={launchedTools.has(manifest.id)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading ScrollOS Desktop...
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#fafafa',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Desktop Header */}
      <div style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '700',
            color: '#1976d2'
          }}>
            ScrollOS
          </h1>
          <span style={{ 
            marginLeft: '12px', 
            fontSize: '14px', 
            color: '#666',
            backgroundColor: '#e3f2fd',
            padding: '4px 8px',
            borderRadius: '12px'
          }}>
            Academic Tools Platform
          </span>
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Welcome, {userContext.email}
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#1976d2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {userContext.email.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '200px'
          }}
        />

        {/* Discipline Filter */}
        <select
          value={selectedDiscipline}
          onChange={(e) => setSelectedDiscipline(e.target.value as AcademicDiscipline | 'all')}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="all">All Disciplines</option>
          {availableDisciplines.map(discipline => (
            <option key={discipline} value={discipline}>
              {discipline.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </option>
          ))}
        </select>

        {/* View Mode */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['grid', 'list', 'groups'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: viewMode === mode ? '#1976d2' : '#fff',
                color: viewMode === mode ? '#fff' : '#333',
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
          {filteredManifests.length} tools available • {launchedTools.size} running
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '12px 24px',
          borderBottom: '1px solid #ffcdd2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#c62828',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflow: 'auto'
      }}>
        {filteredManifests.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: '#666'
          }}>
            <h3>No tools found</h3>
            <p>Try adjusting your search or discipline filter.</p>
          </div>
        ) : (
          renderTools()
        )}
      </div>
    </div>
  );
};