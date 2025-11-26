/**
 * ScrollOS Demo Component
 * 
 * Demonstrates the ScrollOS academic tools integration system
 * with sample tool manifests and user context.
 */

import React from 'react';
import { ScrollOSApp } from '../components/scrollos';
import { ToolManifest, UserContext } from '../types/scrollos-tools';

// Sample tool manifests for demonstration
export const sampleToolManifests: ToolManifest[] = [
  {
    id: 'vscode-web',
    name: 'VS Code Web',
    displayName: 'Visual Studio Code',
    description: 'Professional code editor with IntelliSense, debugging, and Git integration',
    version: '1.85.0',
    category: 'computer-science',
    subcategories: ['artificial-intelligence'],
    integrationMethod: 'iframe',
    url: 'https://vscode.dev',
    permissions: [
      { action: 'read', resource: 'files' },
      { action: 'write', resource: 'files' },
      { action: 'execute', resource: 'terminal' }
    ],
    requiresAuth: true,
    ssoEnabled: true,
    aiAgents: ['ScrollTutor', 'ScrollBuilder'],
    contextAware: true,
    supportedFormats: ['js', 'ts', 'py', 'java', 'cpp', 'html', 'css', 'json'],
    dataExportFormats: ['zip', 'tar'],
    crossToolCompatibility: ['github-integration', 'cloud-terminal'],
    icon: '💻',
    color: '#007acc',
    fullscreen: false,
    resizable: true,
    minWidth: 800,
    minHeight: 600,
    collaborationEnabled: true,
    offlineCapable: false,
    cloudProcessing: false,
    vendor: 'Microsoft',
    license: 'MIT',
    documentation: 'https://code.visualstudio.com/docs',
    supportContact: 'support@scrolluniversity.edu',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'figma-design',
    name: 'Figma',
    displayName: 'Figma Design',
    description: 'Collaborative interface design tool with real-time collaboration',
    version: '2024.1.0',
    category: 'creative-design',
    integrationMethod: 'iframe',
    url: 'https://www.figma.com/embed',
    permissions: [
      { action: 'read', resource: 'designs' },
      { action: 'write', resource: 'designs' },
      { action: 'share', resource: 'designs' }
    ],
    requiresAuth: true,
    ssoEnabled: true,
    aiAgents: ['ScrollDesign', 'ScrollTutor'],
    contextAware: true,
    supportedFormats: ['fig', 'svg', 'png', 'jpg'],
    dataExportFormats: ['svg', 'png', 'jpg', 'pdf'],
    crossToolCompatibility: ['blender-web', 'presentation-maker'],
    icon: '🎨',
    color: '#f24e1e',
    fullscreen: false,
    resizable: true,
    minWidth: 1000,
    minHeight: 700,
    collaborationEnabled: true,
    offlineCapable: false,
    cloudProcessing: true,
    vendor: 'Figma Inc.',
    license: 'Commercial',
    documentation: 'https://help.figma.com',
    supportContact: 'support@scrolluniversity.edu',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'bible-api',
    name: 'Bible Research',
    displayName: 'Scripture Study',
    description: 'Comprehensive Bible study tool with multiple translations and cross-references',
    version: '3.2.1',
    category: 'theology',
    subcategories: ['biblical-studies'],
    integrationMethod: 'api',
    apiEndpoint: 'https://api.scripture.api.bible/v1',
    permissions: [
      { action: 'read', resource: 'scriptures' },
      { action: 'read', resource: 'commentaries' }
    ],
    requiresAuth: false,
    ssoEnabled: false,
    aiAgents: ['ScrollHermeneutics', 'ScrollTutor'],
    contextAware: true,
    supportedFormats: ['json', 'xml', 'txt'],
    dataExportFormats: ['pdf', 'docx', 'txt'],
    crossToolCompatibility: ['greek-hebrew-lexicon', 'document-editor'],
    icon: '📖',
    color: '#8b4513',
    fullscreen: false,
    resizable: true,
    minWidth: 600,
    minHeight: 500,
    collaborationEnabled: true,
    offlineCapable: true,
    cloudProcessing: false,
    vendor: 'American Bible Society',
    license: 'Open Source',
    documentation: 'https://scripture.api.bible/docs',
    supportContact: 'support@scrolluniversity.edu',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'onshape-cad',
    name: 'Onshape CAD',
    displayName: 'Onshape 3D CAD',
    description: 'Professional cloud-based CAD software for mechanical engineering',
    version: '2024.1',
    category: 'mechanical-engineering',
    integrationMethod: 'iframe',
    url: 'https://cad.onshape.com/embed',
    permissions: [
      { action: 'read', resource: 'cad-models' },
      { action: 'write', resource: 'cad-models' },
      { action: 'share', resource: 'cad-models' }
    ],
    requiresAuth: true,
    ssoEnabled: true,
    aiAgents: ['ScrollBuilder', 'ScrollTutor'],
    contextAware: true,
    supportedFormats: ['step', 'stl', 'obj', 'dwg'],
    dataExportFormats: ['step', 'stl', 'obj', 'pdf'],
    crossToolCompatibility: ['simscale-simulation', 'blender-web'],
    icon: '⚙️',
    color: '#4caf50',
    fullscreen: true,
    resizable: true,
    minWidth: 1200,
    minHeight: 800,
    collaborationEnabled: true,
    offlineCapable: false,
    cloudProcessing: true,
    vendor: 'PTC Inc.',
    license: 'Commercial',
    documentation: 'https://cad.onshape.com/help',
    supportContact: 'support@scrolluniversity.edu',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'jasp-statistics',
    name: 'JASP',
    displayName: 'JASP Statistics',
    description: 'Open-source statistical software with intuitive interface',
    version: '0.18.3',
    category: 'data-science',
    subcategories: ['statistics'],
    integrationMethod: 'iframe',
    url: 'https://jasp-stats.org/web',
    permissions: [
      { action: 'read', resource: 'datasets' },
      { action: 'write', resource: 'analyses' },
      { action: 'execute', resource: 'statistical-tests' }
    ],
    requiresAuth: false,
    ssoEnabled: false,
    aiAgents: ['ScrollQuant', 'ScrollTutor'],
    contextAware: true,
    supportedFormats: ['csv', 'xlsx', 'sav', 'json'],
    dataExportFormats: ['pdf', 'html', 'csv'],
    crossToolCompatibility: ['rstudio-web', 'tableau-public'],
    icon: '📊',
    color: '#9c27b0',
    fullscreen: false,
    resizable: true,
    minWidth: 900,
    minHeight: 650,
    collaborationEnabled: false,
    offlineCapable: true,
    cloudProcessing: false,
    vendor: 'JASP Team',
    license: 'Open Source',
    documentation: 'https://jasp-stats.org/documentation',
    supportContact: 'support@scrolluniversity.edu',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'biodigital-human',
    name: 'BioDigital Human',
    displayName: '3D Anatomy Atlas',
    description: 'Interactive 3D human anatomy visualization platform',
    version: '7.2.1',
    category: 'medicine',
    subcategories: ['anatomy', 'health-sciences'],
    integrationMethod: 'iframe',
    url: 'https://human.biodigital.com/embed',
    permissions: [
      { action: 'read', resource: 'anatomy-models' },
      { action: 'read', resource: 'medical-content' }
    ],
    requiresAuth: true,
    ssoEnabled: true,
    aiAgents: ['ScrollMed', 'ScrollTutor'],
    contextAware: true,
    supportedFormats: ['obj', 'fbx', 'gltf'],
    dataExportFormats: ['png', 'jpg', 'pdf'],
    crossToolCompatibility: ['dicom-viewer', 'physiology-simulator'],
    icon: '🏥',
    color: '#f44336',
    fullscreen: true,
    resizable: true,
    minWidth: 800,
    minHeight: 600,
    collaborationEnabled: true,
    offlineCapable: false,
    cloudProcessing: true,
    vendor: 'BioDigital Inc.',
    license: 'Commercial',
    documentation: 'https://help.biodigital.com',
    supportContact: 'support@scrolluniversity.edu',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  }
];

// Sample user context for demonstration
export const sampleUserContext: Partial<UserContext> = {
  userId: 'demo-user-123',
  email: 'demo@scrolluniversity.edu',
  role: 'student',
  enrolledCourses: ['CS101', 'THEO201', 'ENG301', 'STAT205', 'MED101'],
  declaredMajor: 'computer-science',
  minors: ['theology', 'data-science'],
  permissions: [
    { action: 'read', resource: 'tools' },
    { action: 'write', resource: 'projects' },
    { action: 'execute', resource: 'development-tools' },
    { action: 'read', resource: 'scriptures' },
    { action: 'read', resource: 'anatomy-models' },
    { action: 'write', resource: 'designs' },
    { action: 'execute', resource: 'statistical-tests' }
  ],
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    defaultTools: {
      'computer-science': ['vscode-web', 'github-integration'],
      'theology': ['bible-api', 'scrollhermeneutics-ai'],
      'data-science': ['jasp-statistics', 'rstudio-web'],
      'medicine': ['biodigital-human', 'scrollmed-ai'],
      'creative-design': ['figma-design', 'scrolldesign-ai'],
      'mechanical-engineering': ['onshape-cad', 'simscale-simulation']
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

export const ScrollOSDemo: React.FC = () => {
  return (
    <div>
      <ScrollOSApp initialUserContext={sampleUserContext} />
    </div>
  );
};

export default ScrollOSDemo;