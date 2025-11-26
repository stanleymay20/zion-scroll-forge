/**
 * ScrollOS Components Index
 * 
 * Exports all ScrollOS academic tools integration components
 */

export { ScrollOSApp } from './ScrollOSApp';
export { ScrollOSDesktop } from './ScrollOSDesktop';

// Re-export types for convenience
export type {
  ToolManifest,
  AcademicWorkspace,
  UserContext,
  ToolInstance,
  AcademicDiscipline,
  ToolGroup,
  ScrollOSConfig
} from '../../types/scrollos-tools';

// Re-export services
export { AppManifestLoader } from '../../services/scrollos/AppManifestLoader';
export { ToolContainer } from '../../services/scrollos/ToolContainer';