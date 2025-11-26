import { PrismaClient } from '@prisma/client';
import {
  CourseProject,
  CourseInfo,
  Phase,
  PhaseStatus,
  PhaseTransition,
  ProjectStatus,
  ApprovalData,
  Deliverable,
  PhaseProgress
} from '../types/course-content.types';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * CourseWorkflowService
 * 
 * Orchestrates the multi-phase course development process with approval gates.
 * Manages course project lifecycle from planning through launch.
 */
export default class CourseWorkflowService {
  /**
   * Creates a new course development project with all phases initialized
   * 
   * @param courseInfo - Basic course information
   * @returns CourseProject with all phases and milestones
   * 
   * Validates: Requirements 1.1
   * Property 1: Course Project Initialization Completeness
   */
  async createCourseProject(courseInfo: CourseInfo): Promise<CourseProject> {
    try {
      logger.info('Creating course project', { courseInfo });

      // Define all required phases in order
      const phases: Phase[] = [
        Phase.PLANNING,
        Phase.CONTENT_DEVELOPMENT,
        Phase.PRODUCTION,
        Phase.QUALITY_REVIEW,
        Phase.PILOT_TESTING,
        Phase.LAUNCH
      ];

      // Initialize phase progress for each phase
      const now = new Date();
      const phaseProgress: PhaseProgress[] = phases.map((phase, index) => ({
        phase,
        status: index === 0 ? PhaseStatus.IN_PROGRESS : PhaseStatus.NOT_STARTED,
        startDate: now,
        completionDate: undefined,
        approvals: [],
        deliverables: this.getPhaseDeliverables(phase)
      }));

      // Check if course project already exists
      let project = await prisma.courseProject.findUnique({
        where: { code: courseInfo.code }
      });

      if (!project) {
        // Create course project in database
        project = await prisma.courseProject.create({
          data: {
            id: `course_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            title: courseInfo.title,
            code: courseInfo.code,
            description: courseInfo.description,
            credits: courseInfo.credits,
            level: courseInfo.level,
            prerequisites: courseInfo.prerequisites,
            currentPhase: Phase.PLANNING,
            status: ProjectStatus.ACTIVE,
            updatedAt: new Date()
          }
        });
        logger.info('Course project created successfully', { projectId: project.id });
        
        // Create phase progress records (only for new projects)
        for (const pp of phaseProgress) {
        const phaseProgressRecord = await prisma.phaseProgress.create({
          data: {
            id: `phase_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            course_project_id: project.id,
            phase: pp.phase,
            status: pp.status,
            start_date: pp.startDate,
            updated_at: new Date()
          }
        });

        // Create deliverables for this phase
        for (const d of pp.deliverables) {
          await prisma.deliverable.create({
            data: {
              id: `deliverable_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
              phase_progress_id: phaseProgressRecord.id,
              name: d.name,
              description: d.description,
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              status: 'NOT_STARTED',
              assigned_to: 'TBD',
              updated_at: new Date()
            }
          });
        }
      }

      // Create team members
      for (const f of courseInfo.faculty) {
        await prisma.teamMember.create({
          data: {
            id: `team_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            course_project_id: project.id,
            user_id: f.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            name: f.name || 'Faculty Member',
            role: f.role || 'Faculty',
            responsibilities: [],
            assigned_date: new Date()
          }
        });
      }

      // Create timeline
      const timeline = await prisma.timeline.create({
        data: {
          id: `timeline_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          course_project_id: project.id,
          start_date: new Date(),
          target_launch_date: this.calculateEstimatedEndDate(phases.length),
          updated_at: new Date()
        }
      });

      // Create milestones
      for (let i = 0; i < phases.length; i++) {
        await prisma.milestone.create({
          data: {
            id: `milestone_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            timeline_id: timeline.id,
            phase: phases[i],
            name: `Complete ${phases[i]}`,
            description: `Complete all deliverables for ${phases[i]} phase`,
            due_date: this.calculatePhaseDueDate(i, phases.length),
            updated_at: new Date()
          }
        });
      }
      } else {
        logger.info('Course project already exists, reusing', { projectId: project.id });
      }

      // Fetch the complete project with all relations
      const completeProject = await prisma.courseProject.findUnique({
        where: { id: project.id },
        include: {
          PhaseProgress: {
            include: {
              Approval: true,
              Deliverable: true
            }
          },
          TeamMember: true,
          Timeline: {
            include: {
              Milestone: true
            }
          }
        }
      });

      logger.info('Course project created successfully', { projectId: project.id });

      if (!completeProject) {
        throw new Error('Failed to retrieve created project');
      }

      return this.mapToCourseProject(completeProject);
    } catch (error) {
      logger.error('Error creating course project', { error, courseInfo });
      throw new Error(`Failed to create course project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Advances a course project to the next phase after validation
   * 
   * @param projectId - Course project identifier
   * @param approvalData - Approval information from authorized reviewer
   * @returns PhaseTransition with old and new phase information
   * 
   * Validates: Requirements 1.2
   * Property 2: Phase Advancement Requires Approval
   */
  async advancePhase(projectId: string, approvalData: ApprovalData): Promise<PhaseTransition> {
    try {
      logger.info('Advancing phase', { projectId, approvalData });

      // Get current project state
      const project = await prisma.courseProject.findUnique({
        where: { id: projectId },
        include: {
          PhaseProgress: {
            include: {
              Approval: true,
              Deliverable: true
            }
          }
        }
      });

      if (!project) {
        throw new Error(`Course project not found: ${projectId}`);
      }

      const currentPhase = project.currentPhase as Phase;
      const currentPhaseData = project.PhaseProgress.find(p => p.phase === currentPhase);

      if (!currentPhaseData) {
        throw new Error(`Current phase data not found: ${currentPhase}`);
      }

      // Validate approval is present and valid
      if (!approvalData.approved) {
        throw new Error('Phase advancement requires approval');
      }

      if (!approvalData.reviewerId) {
        throw new Error('Approval must include reviewer ID');
      }

      // Validate phase completion before advancing
      const validation = await this.validatePhaseCompletion(projectId, currentPhase);
      if (!validation.passed) {
        throw new Error(`Phase completion validation failed: ${validation.errors?.map((e: any) => e.message).join(', ') || 'Unknown validation errors'}`);
      }

      // Record approval
      await prisma.approval.create({
        data: {
          id: `approval_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          phase_progress_id: currentPhaseData.id,
          approver_id: approvalData.reviewerId,
          approver_name: 'Reviewer',
          approver_role: 'QA',
          approved: true,
          comments: approvalData.comments,
          approved_at: new Date()
        }
      });

      // Determine next phase
      const phases = [
        Phase.PLANNING,
        Phase.CONTENT_DEVELOPMENT,
        Phase.PRODUCTION,
        Phase.QUALITY_REVIEW,
        Phase.PILOT_TESTING,
        Phase.LAUNCH
      ];
      const currentIndex = phases.indexOf(currentPhase);
      
      if (currentIndex === -1) {
        throw new Error(`Invalid current phase: ${currentPhase}`);
      }

      if (currentIndex === phases.length - 1) {
        // Already at final phase, mark project as complete
        await prisma.courseProject.update({
          where: { id: projectId },
          data: {
            status: ProjectStatus.COMPLETED,
            updatedAt: new Date()
          }
        });

        await prisma.phaseProgress.update({
          where: { id: currentPhaseData.id },
          data: {
            status: PhaseStatus.COMPLETED,
            completion_date: new Date(),
            updated_at: new Date()
          }
        });

        logger.info('Course project completed', { projectId });

        return {
          projectId,
          fromPhase: currentPhase,
          toPhase: currentPhase,
          transitionDate: new Date(),
          approvedBy: approvalData.reviewerId,
          completed: true
        };
      }

      const nextPhase = phases[currentIndex + 1];

      // Update current phase to completed
      await prisma.phaseProgress.update({
        where: { id: currentPhaseData.id },
        data: {
          status: PhaseStatus.COMPLETED,
          completion_date: new Date(),
          updated_at: new Date()
        }
      });

      // Update next phase to in progress
      const nextPhaseData = project.PhaseProgress.find(p => p.phase === nextPhase);
      if (nextPhaseData) {
        await prisma.phaseProgress.update({
          where: { id: nextPhaseData.id },
          data: {
            status: PhaseStatus.IN_PROGRESS,
            start_date: new Date(),
            updated_at: new Date()
          }
        });
      }

      // Update project current phase
      await prisma.courseProject.update({
        where: { id: projectId },
        data: {
          currentPhase: nextPhase,
          updatedAt: new Date()
        }
      });

      logger.info('Phase advanced successfully', { projectId, fromPhase: currentPhase, toPhase: nextPhase });

      return {
        projectId,
        fromPhase: currentPhase,
        toPhase: nextPhase,
        transitionDate: new Date(),
        approvedBy: approvalData.reviewerId,
        completed: false
      };
    } catch (error) {
      logger.error('Error advancing phase', { error, projectId, approvalData });
      throw new Error(`Failed to advance phase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates that a phase has met all completion requirements
   * 
   * @param projectId - Course project identifier
   * @param phase - Phase to validate
   * @returns ValidationResult with validation status and any errors
   * 
   * Validates: Requirements 1.4, 6.1
   * Property 4: Quality Checklist Application
   */
  async validatePhaseCompletion(projectId: string, phase: Phase): Promise<any> {
    try {
      logger.info('Validating phase completion', { projectId, phase });

      const project = await prisma.courseProject.findUnique({
        where: { id: projectId },
        include: {
          PhaseProgress: {
            include: {
              Deliverable: true
            }
          }
        }
      });

      if (!project) {
        return {
          contentId: projectId,
          passed: false,
          strictnessProfile: 'MODERATE' as any,
          errors: [{
            type: 'TECHNICAL' as any,
            severity: 'CRITICAL' as any,
            message: `Course project not found: ${projectId}`,
            location: { file: 'CourseWorkflowService', section: 'validatePhaseReadiness', context: 'project lookup' }
          }],
          warnings: [],
          correctionAttempted: false,
          correctionSuccessful: false
        };
      }

      const phaseData = project.PhaseProgress.find(p => p.phase === phase);
      if (!phaseData) {
        return {
          contentId: projectId,
          passed: false,
          strictnessProfile: 'MODERATE' as any,
          errors: [{
            type: 'TECHNICAL' as any,
            severity: 'CRITICAL' as any,
            message: `Phase data not found: ${phase}`,
            location: { file: 'CourseWorkflowService', section: 'validatePhaseReadiness', context: 'phase lookup' }
          }],
          warnings: [],
          correctionAttempted: false,
          correctionSuccessful: false
        };
      }

      const errors: string[] = [];
      const warnings: string[] = [];

      // Check all required deliverables are completed
      const requiredDeliverables = phaseData.Deliverable;
      const incompleteDeliverables = requiredDeliverables.filter(d => d.status !== 'COMPLETED');

      if (incompleteDeliverables.length > 0) {
        errors.push(
          `Incomplete required deliverables: ${incompleteDeliverables.map(d => d.name).join(', ')}`
        );
      }

      // Phase-specific validation
      switch (phase) {
        case Phase.PLANNING:
          // Validate course structure is defined
          if (!project.title || !project.code || !project.description) {
            errors.push('Course basic information incomplete');
          }
          break;

        case Phase.CONTENT_DEVELOPMENT:
          // Validate content exists
          const moduleCount = await prisma.courseModule.count({
            where: { course_project_id: projectId }
          });
          if (moduleCount < 4 || moduleCount > 12) {
            errors.push(`Invalid module count: ${moduleCount}. Must be between 4 and 12.`);
          }
          break;

        case Phase.PRODUCTION:
          // Validate all videos processed - skip for now as we don't have processed field
          // This would need to be implemented when video processing is added
          break;

        case Phase.QUALITY_REVIEW:
          // Validate quality review completed
          const qualityReview = await prisma.qualityReview.findFirst({
            where: {
              course_project_id: projectId,
              approved: true
            }
          });
          if (!qualityReview) {
            errors.push('Quality review not completed or not approved');
          }
          break;

        case Phase.PILOT_TESTING:
          // Validate pilot program completed
          const pilotProgram = await prisma.pilotProgram.findFirst({
            where: {
              course_project_id: projectId,
              launch_approved: true
            }
          });
          if (!pilotProgram) {
            errors.push('Pilot testing not completed or launch not approved');
          }
          break;

        case Phase.LAUNCH:
          // Final validation before launch
          if (errors.length === 0 && warnings.length === 0) {
            // All previous phases must be complete
            const allPhasesComplete = project.PhaseProgress
              .filter(p => p.phase !== Phase.LAUNCH)
              .every(p => p.status === PhaseStatus.COMPLETED);
            
            if (!allPhasesComplete) {
              errors.push('Not all previous phases are completed');
            }
          }
          break;
      }

      const valid = errors.length === 0;

      logger.info('Phase validation completed', { projectId, phase, valid, errorCount: errors.length });

      return {
        contentId: projectId,
        passed: valid,
        strictnessProfile: 'MODERATE' as any,
        errors: errors.map(msg => ({
          type: 'TECHNICAL' as any,
          severity: 'HIGH' as any,
          message: msg,
          location: { file: 'CourseWorkflowService', section: 'validatePhaseReadiness', context: phase }
        })),
        warnings: warnings.map(msg => ({
          type: 'TECHNICAL',
          message: msg,
          location: { file: 'CourseWorkflowService', section: 'validatePhaseReadiness', context: phase }
        })),
        correctionAttempted: false,
        correctionSuccessful: false
      };
    } catch (error) {
      logger.error('Error validating phase completion', { error, projectId, phase });
      return {
        contentId: projectId,
        passed: false,
        strictnessProfile: 'MODERATE' as any,
        errors: [{
          type: 'TECHNICAL' as any,
          severity: 'CRITICAL' as any,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          location: { file: 'CourseWorkflowService', section: 'validatePhaseReadiness', context: 'exception' }
        }],
        warnings: [],
        correctionAttempted: false,
        correctionSuccessful: false
      };
    }
  }

  /**
   * Gets the current status of a course project
   * 
   * @param projectId - Course project identifier
   * @returns ProjectStatus with current phase, progress, and timeline information
   * 
   * Validates: Requirements 8.1, 8.4
   */
  async getProjectStatus(projectId: string): Promise<any> {
    try {
      logger.info('Getting project status', { projectId });

      const project = await prisma.courseProject.findUnique({
        where: { id: projectId },
        include: {
          PhaseProgress: {
            include: {
              Deliverable: true,
              Approval: true
            }
          },
          TeamMember: true,
          Timeline: {
            include: {
              Milestone: true
            }
          }
        }
      });

      if (!project) {
        throw new Error(`Course project not found: ${projectId}`);
      }

      // Calculate overall progress
      const totalPhases = project.PhaseProgress.length;
      const completedPhases = project.PhaseProgress.filter(p => p.status === PhaseStatus.COMPLETED).length;
      const progressPercentage = (completedPhases / totalPhases) * 100;

      // Calculate deliverable completion
      const totalDeliverables = project.PhaseProgress.reduce((sum, p) => sum + p.Deliverable.length, 0);
      const completedDeliverables = project.PhaseProgress.reduce(
        (sum, p) => sum + p.Deliverable.filter(d => d.status === 'COMPLETED').length,
        0
      );

      // Identify blockers
      const blockers: string[] = [];
      const currentPhaseData = project.PhaseProgress.find(p => p.phase === project.currentPhase);
      if (currentPhaseData) {
        const incompleteRequired = currentPhaseData.Deliverable.filter(d => d.status !== 'COMPLETED');
        if (incompleteRequired.length > 0) {
          blockers.push(`${incompleteRequired.length} required deliverables incomplete in ${project.currentPhase}`);
        }
      }

      // Check for overdue milestones
      let timeline = null;
      if (project.Timeline && Array.isArray(project.Timeline) && project.Timeline.length > 0) {
        timeline = project.Timeline[0];
        if (timeline && timeline.Milestone && Array.isArray(timeline.Milestone)) {
          const overdueMilestones = timeline.Milestone.filter(
            (m: any) => !m.completed_date && m.due_date < new Date()
          );
          if (overdueMilestones.length > 0) {
            blockers.push(`${overdueMilestones.length} milestones overdue`);
          }
        }
      }

      logger.info('Project status retrieved', { projectId, progressPercentage });

      return {
        success: true,
        data: {
          project: project as any,
          progress: progressPercentage,
          currentPhase: project.currentPhase as Phase,
          nextMilestone: timeline?.Milestone.find((m: any) => !m.completed_date) as any,
          blockers
        }
      };
    } catch (error) {
      logger.error('Error getting project status', { error, projectId });
      throw new Error(`Failed to get project status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods

  private getPhaseDeliverables(phase: Phase): Deliverable[] {
    const now = new Date();
    const deliverables: Record<Phase, Deliverable[]> = {
      [Phase.PLANNING]: [
        { id: 'plan-1', name: 'Course Outline', description: 'Complete course structure with modules and learning objectives', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'plan-2', name: 'Faculty Assignment', description: 'Subject matter experts assigned to course', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'plan-3', name: 'Budget Approval', description: 'Course development budget approved', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'plan-4', name: 'Timeline Definition', description: 'Development timeline with milestones', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false }
      ],
      [Phase.CONTENT_DEVELOPMENT]: [
        { id: 'dev-1', name: 'Module Content', description: 'All module content written and reviewed', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'dev-2', name: 'Lecture Scripts', description: 'Video lecture scripts completed', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'dev-3', name: 'Assessment Design', description: 'Quizzes, assignments, and projects designed', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'dev-4', name: 'Spiritual Integration', description: 'Biblical foundation and worldview integration completed', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false }
      ],
      [Phase.PRODUCTION]: [
        { id: 'prod-1', name: 'Video Recording', description: 'All lecture videos recorded', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'prod-2', name: 'Video Editing', description: 'Videos edited with graphics and animations', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'prod-3', name: 'Written Materials', description: 'Lecture notes and PDFs generated', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'prod-4', name: 'Captions Generated', description: 'Closed captions and transcripts created', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false }
      ],
      [Phase.QUALITY_REVIEW]: [
        { id: 'qa-1', name: 'Content Review', description: 'Academic content reviewed for accuracy', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'qa-2', name: 'Theological Review', description: 'Spiritual content reviewed for alignment', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'qa-3', name: 'Technical Review', description: 'Videos and materials tested for quality', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'qa-4', name: 'QA Approval', description: 'Quality assurance sign-off received', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false }
      ],
      [Phase.PILOT_TESTING]: [
        { id: 'pilot-1', name: 'Pilot Cohort', description: 'Pilot students recruited and enrolled', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'pilot-2', name: 'Feedback Collection', description: 'Student feedback gathered for all modules', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'pilot-3', name: 'Issue Resolution', description: 'Identified issues prioritized and fixed', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'pilot-4', name: 'Launch Approval', description: 'Pilot results reviewed and launch approved', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false }
      ],
      [Phase.LAUNCH]: [
        { id: 'launch-1', name: 'Platform Deployment', description: 'Course deployed to production platform', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'launch-2', name: 'Marketing Materials', description: 'Course catalog and promotional materials ready', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'launch-3', name: 'Enrollment Open', description: 'Course available for student enrollment', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false },
        { id: 'launch-4', name: 'Monitoring Setup', description: 'Analytics and feedback systems active', dueDate: now, completedDate: undefined, status: 'PENDING', assignedTo: 'team', required: true, completed: false }
      ]
    };

    return deliverables[phase] || [];
  }

  private calculateEstimatedEndDate(phaseCount: number): Date {
    // Estimate 4 weeks per phase on average
    const weeksPerPhase = 4;
    const totalWeeks = phaseCount * weeksPerPhase;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (totalWeeks * 7));
    return endDate;
  }

  private calculatePhaseDueDate(phaseIndex: number, totalPhases: number): Date {
    const weeksPerPhase = 4;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + ((phaseIndex + 1) * weeksPerPhase * 7));
    return dueDate;
  }

  private mapToCourseProject(dbProject: any): CourseProject {
    return {
      id: dbProject.id,
      courseInfo: {
        title: dbProject.title,
        code: dbProject.code,
        description: dbProject.description,
        faculty: dbProject.TeamMember.map((t: any) => ({
          id: t.user_id,
          name: t.name,
          email: t.email || `${t.name.toLowerCase().replace(/\s+/g, '.')}@scrolluniversity.edu`,
          role: t.role,
          expertise: []
        })),
        credits: dbProject.credits,
        level: dbProject.level,
        prerequisites: dbProject.prerequisites
      },
      currentPhase: dbProject.currentPhase as Phase,
      phases: dbProject.PhaseProgress.map((p: any) => ({
        phase: p.phase as Phase,
        status: p.status as PhaseStatus,
        startDate: p.startDate,
        completionDate: p.completionDate,
        approvals: p.Approval || [],
        deliverables: p.Deliverable || []
      })),
      team: dbProject.TeamMember,
      timeline: dbProject.Timeline && dbProject.Timeline.length > 0 ? dbProject.Timeline[0] : null as any,
      budget: dbProject.Budget?.[0] || null as any,
      status: dbProject.status as ProjectStatus,
      createdAt: dbProject.createdAt,
      updatedAt: dbProject.updatedAt
    };
  }
}
