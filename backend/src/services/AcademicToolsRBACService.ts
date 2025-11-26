/**
 * Academic Tools Role-Based Access Control Service
 * "Every good gift and every perfect gift is from above" - James 1:17
 * 
 * Extends the core RBAC system with academic tool-specific permissions,
 * course-based access controls, and tool-specific authorization logic.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/productionLogger';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../middleware/rbac';
import { AcademicDiscipline, ToolPermission } from '../../src/types/scrollos-tools';

const prisma = new PrismaClient();

// Academic Tool-Specific Permissions
export enum AcademicToolPermission {
  // Computer Science Tools
  CODE_EDITOR_ACCESS = 'tool:code_editor:access',
  TERMINAL_ACCESS = 'tool:terminal:access',
  GITHUB_INTEGRATION = 'tool:github:access',
  AI_PAIR_PROGRAMMING = 'tool:ai_coding:access',
  API_TESTING = 'tool:api_testing:access',
  SQL_PLAYGROUND = 'tool:sql:access',
  
  // Engineering Tools
  CAD_SOFTWARE_ACCESS = 'tool:cad:access',
  SIMULATION_ACCESS = 'tool:simulation:access',
  CIRCUIT_DESIGN = 'tool:circuit_design:access',
  PHYSICS_SIMULATIONS = 'tool:physics_sim:access',
  
  // Data Science Tools
  STATISTICAL_SOFTWARE = 'tool:statistics:access',
  RSTUDIO_ACCESS = 'tool:rstudio:access',
  JUPYTER_ACCESS = 'tool:jupyter:access',
  TABLEAU_ACCESS = 'tool:tableau:access',
  ML_ACCELERATION = 'tool:ml_gpu:access',
  
  // Design Tools
  FIGMA_ACCESS = 'tool:figma:access',
  BLENDER_ACCESS = 'tool:blender:access',
  SKETCHUP_ACCESS = 'tool:sketchup:access',
  DESIGN_AI_ASSISTANT = 'tool:design_ai:access',
  
  // Medical Tools
  ANATOMY_VIEWER = 'tool:anatomy:access',
  DICOM_VIEWER = 'tool:dicom:access',
  PHYSIOLOGY_SIMS = 'tool:physiology:access',
  MEDICAL_AI_TUTOR = 'tool:medical_ai:access',
  
  // Theology Tools
  BIBLE_APIS = 'tool:bible:access',
  LEXICON_TOOLS = 'tool:lexicon:access',
  INTERLINEAR_VIEWER = 'tool:interlinear:access',
  HERMENEUTICS_AI = 'tool:hermeneutics_ai:access',
  
  // Universal Tool Features
  TOOL_COLLABORATION = 'tool:collaboration:access',
  TOOL_CLOUD_PROCESSING = 'tool:cloud_processing:access',
  TOOL_OFFLINE_MODE = 'tool:offline:access',
  TOOL_DATA_EXPORT = 'tool:data_export:access',
  TOOL_AI_ASSISTANCE = 'tool:ai_assistance:access',
  
  // Administrative Tool Permissions
  TOOL_MANIFEST_MANAGE = 'tool:manifest:manage',
  TOOL_USAGE_ANALYTICS = 'tool:analytics:view',
  TOOL_HEALTH_MONITORING = 'tool:health:monitor',
  TOOL_INSTANCE_MANAGE = 'tool:instances:manage'
}

// Course-Specific Tool Access
export interface CourseToolAccess {
  courseId: string;
  toolId: string;
  accessLevel: 'required' | 'recommended' | 'optional' | 'restricted';
  availableFrom?: Date;
  availableUntil?: Date;
  maxUsageHours?: number;
  requiresSupervision: boolean;
}

// Tool Permission Matrix by Role
const STUDENT_TOOL_PERMISSIONS: AcademicToolPermission[] = [
  // Basic tool access for enrolled courses
  AcademicToolPermission.CODE_EDITOR_ACCESS,
  AcademicToolPermission.STATISTICAL_SOFTWARE,
  AcademicToolPermission.FIGMA_ACCESS,
  AcademicToolPermission.ANATOMY_VIEWER,
  AcademicToolPermission.BIBLE_APIS,
  AcademicToolPermission.TOOL_COLLABORATION,
  AcademicToolPermission.TOOL_OFFLINE_MODE,
  AcademicToolPermission.TOOL_AI_ASSISTANCE
];

const FACULTY_TOOL_PERMISSIONS: AcademicToolPermission[] = [
  ...STUDENT_TOOL_PERMISSIONS,
  // Advanced tool access
  AcademicToolPermission.TERMINAL_ACCESS,
  AcademicToolPermission.SIMULATION_ACCESS,
  AcademicToolPermission.ML_ACCELERATION,
  AcademicToolPermission.DESIGN_AI_ASSISTANT,
  AcademicToolPermission.MEDICAL_AI_TUTOR,
  AcademicToolPermission.HERMENEUTICS_AI,
  AcademicToolPermission.TOOL_CLOUD_PROCESSING,
  AcademicToolPermission.TOOL_DATA_EXPORT,
  AcademicToolPermission.TOOL_USAGE_ANALYTICS
];

const ADMIN_TOOL_PERMISSIONS: AcademicToolPermission[] = [
  ...FACULTY_TOOL_PERMISSIONS,
  // Administrative access
  AcademicToolPermission.TOOL_MANIFEST_MANAGE,
  AcademicToolPermission.TOOL_HEALTH_MONITORING,
  AcademicToolPermission.TOOL_INSTANCE_MANAGE
];

export const ROLE_TOOL_PERMISSIONS: Record<UserRole, AcademicToolPermission[]> = {
  [UserRole.STUDENT]: STUDENT_TOOL_PERMISSIONS,
  [UserRole.FACULTY]: FACULTY_TOOL_PERMISSIONS,
  [UserRole.ADMIN]: ADMIN_TOOL_PERMISSIONS,
  [UserRole.SUPER_ADMIN]: ADMIN_TOOL_PERMISSIONS
};

// Discipline-specific tool mappings
export const DISCIPLINE_TOOL_MAPPING: Record<AcademicDiscipline, AcademicToolPermission[]> = {
  'computer-science': [
    AcademicToolPermission.CODE_EDITOR_ACCESS,
    AcademicToolPermission.TERMINAL_ACCESS,
    AcademicToolPermission.GITHUB_INTEGRATION,
    AcademicToolPermission.AI_PAIR_PROGRAMMING,
    AcademicToolPermission.API_TESTING,
    AcademicToolPermission.SQL_PLAYGROUND
  ],
  'artificial-intelligence': [
    AcademicToolPermission.CODE_EDITOR_ACCESS,
    AcademicToolPermission.JUPYTER_ACCESS,
    AcademicToolPermission.ML_ACCELERATION,
    AcademicToolPermission.STATISTICAL_SOFTWARE
  ],
  'cybersecurity': [
    AcademicToolPermission.CODE_EDITOR_ACCESS,
    AcademicToolPermission.TERMINAL_ACCESS,
    AcademicToolPermission.API_TESTING
  ],
  'mechanical-engineering': [
    AcademicToolPermission.CAD_SOFTWARE_ACCESS,
    AcademicToolPermission.SIMULATION_ACCESS,
    AcademicToolPermission.PHYSICS_SIMULATIONS
  ],
  'electrical-engineering': [
    AcademicToolPermission.CAD_SOFTWARE_ACCESS,
    AcademicToolPermission.CIRCUIT_DESIGN,
    AcademicToolPermission.SIMULATION_ACCESS
  ],
  'civil-engineering': [
    AcademicToolPermission.CAD_SOFTWARE_ACCESS,
    AcademicToolPermission.SIMULATION_ACCESS,
    AcademicToolPermission.SKETCHUP_ACCESS
  ],
  'data-science': [
    AcademicToolPermission.STATISTICAL_SOFTWARE,
    AcademicToolPermission.RSTUDIO_ACCESS,
    AcademicToolPermission.JUPYTER_ACCESS,
    AcademicToolPermission.TABLEAU_ACCESS,
    AcademicToolPermission.ML_ACCELERATION
  ],
  'statistics': [
    AcademicToolPermission.STATISTICAL_SOFTWARE,
    AcademicToolPermission.RSTUDIO_ACCESS,
    AcademicToolPermission.TABLEAU_ACCESS
  ],
  'finance': [
    AcademicToolPermission.STATISTICAL_SOFTWARE,
    AcademicToolPermission.TABLEAU_ACCESS,
    AcademicToolPermission.JUPYTER_ACCESS
  ],
  'economics': [
    AcademicToolPermission.STATISTICAL_SOFTWARE,
    AcademicToolPermission.TABLEAU_ACCESS
  ],
  'creative-design': [
    AcademicToolPermission.FIGMA_ACCESS,
    AcademicToolPermission.BLENDER_ACCESS,
    AcademicToolPermission.DESIGN_AI_ASSISTANT
  ],
  'architecture': [
    AcademicToolPermission.SKETCHUP_ACCESS,
    AcademicToolPermission.CAD_SOFTWARE_ACCESS,
    AcademicToolPermission.BLENDER_ACCESS
  ],
  'product-design': [
    AcademicToolPermission.FIGMA_ACCESS,
    AcademicToolPermission.CAD_SOFTWARE_ACCESS,
    AcademicToolPermission.DESIGN_AI_ASSISTANT
  ],
  'medicine': [
    AcademicToolPermission.ANATOMY_VIEWER,
    AcademicToolPermission.DICOM_VIEWER,
    AcademicToolPermission.PHYSIOLOGY_SIMS,
    AcademicToolPermission.MEDICAL_AI_TUTOR
  ],
  'health-sciences': [
    AcademicToolPermission.ANATOMY_VIEWER,
    AcademicToolPermission.PHYSIOLOGY_SIMS,
    AcademicToolPermission.MEDICAL_AI_TUTOR
  ],
  'anatomy': [
    AcademicToolPermission.ANATOMY_VIEWER,
    AcademicToolPermission.DICOM_VIEWER
  ],
  'physiology': [
    AcademicToolPermission.ANATOMY_VIEWER,
    AcademicToolPermission.PHYSIOLOGY_SIMS
  ],
  'theology': [
    AcademicToolPermission.BIBLE_APIS,
    AcademicToolPermission.LEXICON_TOOLS,
    AcademicToolPermission.INTERLINEAR_VIEWER,
    AcademicToolPermission.HERMENEUTICS_AI
  ],
  'biblical-studies': [
    AcademicToolPermission.BIBLE_APIS,
    AcademicToolPermission.LEXICON_TOOLS,
    AcademicToolPermission.INTERLINEAR_VIEWER
  ],
  'ministry': [
    AcademicToolPermission.BIBLE_APIS,
    AcademicToolPermission.HERMENEUTICS_AI
  ],
  'hermeneutics': [
    AcademicToolPermission.BIBLE_APIS,
    AcademicToolPermission.LEXICON_TOOLS,
    AcademicToolPermission.INTERLINEAR_VIEWER,
    AcademicToolPermission.HERMENEUTICS_AI
  ]
};

export class AcademicToolsRBACService {
  /**
   * Check if user has permission to access a specific academic tool
   */
  async hasToolPermission(
    userId: string,
    toolId: string,
    permission: AcademicToolPermission
  ): Promise<boolean> {
    try {
      // Get user information
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          enrollmentStatus: true,
          enrollments: {
            where: { status: 'ACTIVE' },
            include: {
              course: {
                select: {
                  id: true,
                  discipline: true,
                  requiredTools: true,
                  recommendedTools: true
                }
              }
            }
          }
        }
      });

      if (!user || user.enrollmentStatus !== 'ACTIVE') {
        return false;
      }

      const userRole = user.role as UserRole;
      const rolePermissions = ROLE_TOOL_PERMISSIONS[userRole] || [];

      // Check if user's role has the required permission
      if (!rolePermissions.includes(permission)) {
        return false;
      }

      // For students, check course-specific tool access
      if (userRole === UserRole.STUDENT) {
        return await this.checkCourseToolAccess(userId, toolId, user.enrollments);
      }

      // Faculty and admins have broader access
      return true;

    } catch (error) {
      logger.error('Error checking tool permission:', {
        error: error.message,
        userId,
        toolId,
        permission
      });
      return false;
    }
  }

  /**
   * Get all available tools for a user based on their role and enrollments
   */
  async getAvailableTools(userId: string): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          enrollmentStatus: true,
          enrollments: {
            where: { status: 'ACTIVE' },
            include: {
              course: {
                select: {
                  discipline: true,
                  requiredTools: true,
                  recommendedTools: true
                }
              }
            }
          }
        }
      });

      if (!user || user.enrollmentStatus !== 'ACTIVE') {
        return [];
      }

      const userRole = user.role as UserRole;
      const availableTools = new Set<string>();

      // Get tools based on enrolled courses
      for (const enrollment of user.enrollments) {
        const course = enrollment.course;
        
        // Add required and recommended tools
        if (course.requiredTools) {
          course.requiredTools.forEach(tool => availableTools.add(tool));
        }
        if (course.recommendedTools) {
          course.recommendedTools.forEach(tool => availableTools.add(tool));
        }

        // Add discipline-specific tools
        const disciplineTools = DISCIPLINE_TOOL_MAPPING[course.discipline as AcademicDiscipline] || [];
        disciplineTools.forEach(permission => {
          // Map permission to tool ID (simplified mapping)
          const toolId = this.permissionToToolId(permission);
          if (toolId) {
            availableTools.add(toolId);
          }
        });
      }

      // Faculty and admins get access to all tools
      if (userRole === UserRole.FACULTY || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) {
        const allTools = await this.getAllToolIds();
        allTools.forEach(tool => availableTools.add(tool));
      }

      return Array.from(availableTools);

    } catch (error) {
      logger.error('Error getting available tools:', {
        error: error.message,
        userId
      });
      return [];
    }
  }

  /**
   * Create course-specific tool access configuration
   */
  async configureCourseToolAccess(
    courseId: string,
    toolAccess: Omit<CourseToolAccess, 'courseId'>[]
  ): Promise<void> {
    try {
      // Remove existing configurations
      await prisma.courseToolAccess.deleteMany({
        where: { courseId }
      });

      // Create new configurations
      const accessConfigs = toolAccess.map(access => ({
        courseId,
        ...access
      }));

      await prisma.courseToolAccess.createMany({
        data: accessConfigs
      });

      logger.info(`Configured tool access for course ${courseId}`, {
        courseId,
        toolCount: toolAccess.length
      });

    } catch (error) {
      logger.error('Error configuring course tool access:', {
        error: error.message,
        courseId
      });
      throw error;
    }
  }

  /**
   * Get tool usage permissions for a specific course
   */
  async getCourseToolPermissions(courseId: string): Promise<CourseToolAccess[]> {
    try {
      const toolAccess = await prisma.courseToolAccess.findMany({
        where: { courseId }
      });

      return toolAccess.map(access => ({
        courseId: access.courseId,
        toolId: access.toolId,
        accessLevel: access.accessLevel as 'required' | 'recommended' | 'optional' | 'restricted',
        availableFrom: access.availableFrom,
        availableUntil: access.availableUntil,
        maxUsageHours: access.maxUsageHours,
        requiresSupervision: access.requiresSupervision
      }));

    } catch (error) {
      logger.error('Error getting course tool permissions:', {
        error: error.message,
        courseId
      });
      return [];
    }
  }

  /**
   * Check if user can access tool based on time restrictions
   */
  async checkTimeBasedAccess(
    userId: string,
    toolId: string,
    courseId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const toolAccess = await prisma.courseToolAccess.findFirst({
        where: {
          courseId,
          toolId
        }
      });

      if (!toolAccess) {
        return { allowed: true }; // No restrictions
      }

      const now = new Date();

      // Check availability window
      if (toolAccess.availableFrom && now < toolAccess.availableFrom) {
        return {
          allowed: false,
          reason: `Tool not available until ${toolAccess.availableFrom.toLocaleDateString()}`
        };
      }

      if (toolAccess.availableUntil && now > toolAccess.availableUntil) {
        return {
          allowed: false,
          reason: `Tool access expired on ${toolAccess.availableUntil.toLocaleDateString()}`
        };
      }

      // Check usage hours limit
      if (toolAccess.maxUsageHours) {
        const usageHours = await this.getUserToolUsageHours(userId, toolId, courseId);
        if (usageHours >= toolAccess.maxUsageHours) {
          return {
            allowed: false,
            reason: `Maximum usage hours (${toolAccess.maxUsageHours}) exceeded`
          };
        }
      }

      return { allowed: true };

    } catch (error) {
      logger.error('Error checking time-based access:', {
        error: error.message,
        userId,
        toolId,
        courseId
      });
      return { allowed: false, reason: 'Access check failed' };
    }
  }

  /**
   * Log tool access attempt for audit purposes
   */
  async logToolAccess(
    userId: string,
    toolId: string,
    action: 'access_granted' | 'access_denied',
    reason?: string,
    courseId?: string
  ): Promise<void> {
    try {
      await prisma.toolAccessLog.create({
        data: {
          userId,
          toolId,
          action,
          reason,
          courseId,
          timestamp: new Date(),
          ipAddress: '', // This would be passed from the request
          userAgent: ''  // This would be passed from the request
        }
      });

    } catch (error) {
      logger.error('Error logging tool access:', {
        error: error.message,
        userId,
        toolId,
        action
      });
    }
  }

  // Private helper methods

  private async checkCourseToolAccess(
    userId: string,
    toolId: string,
    enrollments: any[]
  ): Promise<boolean> {
    // Check if tool is required or recommended in any enrolled course
    for (const enrollment of enrollments) {
      const course = enrollment.course;
      
      if (course.requiredTools?.includes(toolId) || 
          course.recommendedTools?.includes(toolId)) {
        
        // Check time-based restrictions
        const timeAccess = await this.checkTimeBasedAccess(userId, toolId, course.id);
        if (timeAccess.allowed) {
          return true;
        }
      }
    }

    return false;
  }

  private permissionToToolId(permission: AcademicToolPermission): string | null {
    // Simplified mapping - in practice, this would be more sophisticated
    const permissionMap: Record<AcademicToolPermission, string> = {
      [AcademicToolPermission.CODE_EDITOR_ACCESS]: 'vscode-web',
      [AcademicToolPermission.TERMINAL_ACCESS]: 'cloud-terminal',
      [AcademicToolPermission.GITHUB_INTEGRATION]: 'github-integration',
      [AcademicToolPermission.AI_PAIR_PROGRAMMING]: 'scrollcoder-ai',
      [AcademicToolPermission.API_TESTING]: 'api-testing-tool',
      [AcademicToolPermission.SQL_PLAYGROUND]: 'sql-playground',
      [AcademicToolPermission.CAD_SOFTWARE_ACCESS]: 'onshape-cad',
      [AcademicToolPermission.SIMULATION_ACCESS]: 'simscale',
      [AcademicToolPermission.CIRCUIT_DESIGN]: 'circuitverse',
      [AcademicToolPermission.PHYSICS_SIMULATIONS]: 'phet-simulations',
      [AcademicToolPermission.STATISTICAL_SOFTWARE]: 'jasp',
      [AcademicToolPermission.RSTUDIO_ACCESS]: 'rstudio-web',
      [AcademicToolPermission.JUPYTER_ACCESS]: 'jupyterlab',
      [AcademicToolPermission.TABLEAU_ACCESS]: 'tableau-public',
      [AcademicToolPermission.ML_ACCELERATION]: 'ml-gpu-cluster',
      [AcademicToolPermission.FIGMA_ACCESS]: 'figma-embed',
      [AcademicToolPermission.BLENDER_ACCESS]: 'blender-web',
      [AcademicToolPermission.SKETCHUP_ACCESS]: 'sketchup-web',
      [AcademicToolPermission.DESIGN_AI_ASSISTANT]: 'scrolldesign-ai',
      [AcademicToolPermission.ANATOMY_VIEWER]: 'biodigital-human',
      [AcademicToolPermission.DICOM_VIEWER]: 'dicom-viewer',
      [AcademicToolPermission.PHYSIOLOGY_SIMS]: 'physiology-simulator',
      [AcademicToolPermission.MEDICAL_AI_TUTOR]: 'scrollmed-ai',
      [AcademicToolPermission.BIBLE_APIS]: 'bible-api-access',
      [AcademicToolPermission.LEXICON_TOOLS]: 'greek-hebrew-lexicon',
      [AcademicToolPermission.INTERLINEAR_VIEWER]: 'interlinear-bible',
      [AcademicToolPermission.HERMENEUTICS_AI]: 'scrollhermeneutics-ai',
      [AcademicToolPermission.TOOL_COLLABORATION]: 'collaboration-suite',
      [AcademicToolPermission.TOOL_CLOUD_PROCESSING]: 'cloud-processing',
      [AcademicToolPermission.TOOL_OFFLINE_MODE]: 'offline-sync',
      [AcademicToolPermission.TOOL_DATA_EXPORT]: 'data-export',
      [AcademicToolPermission.TOOL_AI_ASSISTANCE]: 'ai-assistance',
      [AcademicToolPermission.TOOL_MANIFEST_MANAGE]: 'manifest-manager',
      [AcademicToolPermission.TOOL_USAGE_ANALYTICS]: 'usage-analytics',
      [AcademicToolPermission.TOOL_HEALTH_MONITORING]: 'health-monitor',
      [AcademicToolPermission.TOOL_INSTANCE_MANAGE]: 'instance-manager'
    };

    return permissionMap[permission] || null;
  }

  private async getAllToolIds(): Promise<string[]> {
    try {
      const manifests = await prisma.toolManifest.findMany({
        select: { id: true }
      });
      return manifests.map(m => m.id);
    } catch (error) {
      logger.error('Error getting all tool IDs:', error);
      return [];
    }
  }

  private async getUserToolUsageHours(
    userId: string,
    toolId: string,
    courseId: string
  ): Promise<number> {
    try {
      // Calculate usage hours from tool instances and events
      const instances = await prisma.toolInstance.findMany({
        where: {
          userId,
          manifestId: toolId,
          projectId: courseId // Assuming projectId maps to courseId
        },
        select: {
          createdAt: true,
          lastAccessed: true
        }
      });

      const totalMs = instances.reduce((sum, instance) => {
        return sum + (instance.lastAccessed.getTime() - instance.createdAt.getTime());
      }, 0);

      return Math.round(totalMs / (1000 * 60 * 60)); // Convert to hours

    } catch (error) {
      logger.error('Error calculating tool usage hours:', {
        error: error.message,
        userId,
        toolId,
        courseId
      });
      return 0;
    }
  }
}

export const academicToolsRBACService = new AcademicToolsRBACService();