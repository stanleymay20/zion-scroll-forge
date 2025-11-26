/**
 * Course Content Creation API Routes
 * 
 * RESTful endpoints for managing the complete course development lifecycle
 * from planning through production, quality assurance, pilot testing, and launch.
 * 
 * All routes require authentication and appropriate role-based permissions.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import CourseWorkflowService from '../services/CourseWorkflowService';
import VideoProductionService from '../services/VideoProductionService';
import WrittenMaterialsService from '../services/WrittenMaterialsService';
import AssessmentDesignService from '../services/AssessmentDesignService';
import SpiritualIntegrationService from '../services/SpiritualIntegrationService';
import CourseQualityService from '../services/CourseQualityService';
import { CourseContentManagementService } from '../services/CourseContentManagementService';
import ProductionTimelineService from '../services/ProductionTimelineService';
import RealWorldDeploymentService from '../services/RealWorldDeploymentService';
import CourseConstitutionValidatorService from '../services/CourseConstitutionValidatorService';
import DepthRigorEnforcerService from '../services/DepthRigorEnforcerService';
import SpiritualAlignmentValidatorService from '../services/SpiritualAlignmentValidatorService';
import ScrollPedagogyEnforcerService from '../services/ScrollPedagogyEnforcerService';
import { authenticate as authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Initialize services
const workflowService = new CourseWorkflowService();
const videoService = new VideoProductionService();
const materialsService = new WrittenMaterialsService();
const assessmentService = new AssessmentDesignService();
const spiritualService = new SpiritualIntegrationService();
const qualityService = new CourseQualityService();
const contentService = new CourseContentManagementService();
const timelineService = new ProductionTimelineService();
const deploymentService = new RealWorldDeploymentService();
const constitutionValidator = new CourseConstitutionValidatorService();
const rigorEnforcer = new DepthRigorEnforcerService();
const alignmentValidator = new SpiritualAlignmentValidatorService();
const pedagogyEnforcer = new ScrollPedagogyEnforcerService();

// Validation error handler
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};


// ==================== Course Project Management ====================

/**
 * POST /api/course-content/projects
 * Create a new course development project
 * 
 * @access Faculty, Instructional Designer, Admin
 * @validates Requirements 1.1
 */
router.post(
  '/projects',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('Course title is required'),
    body('code').notEmpty().withMessage('Course code is required'),
    body('description').notEmpty().withMessage('Course description is required'),
    body('credits').isInt({ min: 1, max: 12 }).withMessage('Credits must be between 1 and 12'),
    body('level').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'STRATEGIC']).withMessage('Invalid course level'),
    body('faculty').isArray({ min: 1 }).withMessage('At least one faculty member required'),
    body('prerequisites').optional().isArray()
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Creating course project', { userId: req.user?.id, courseCode: req.body.code });

      const courseInfo = {
        title: req.body.title,
        code: req.body.code,
        description: req.body.description,
        faculty: req.body.faculty,
        credits: req.body.credits,
        level: req.body.level,
        prerequisites: req.body.prerequisites || []
      };

      const project = await workflowService.createCourseProject(courseInfo);

      logger.info('Course project created successfully', { projectId: project.id });

      res.status(201).json({
        success: true,
        data: project,
        message: 'Course project created successfully'
      });
    } catch (error) {
      logger.error('Error creating course project', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create course project'
      });
    }
  }
);

/**
 * PUT /api/course-content/projects/:id/phase
 * Advance course project to next phase
 * 
 * @access Project Manager, Admin
 * @validates Requirements 1.2
 */
router.put(
  '/projects/:id/phase',
  authMiddleware,
  [
    param('id').notEmpty().withMessage('Project ID is required'),
    body('approved').isBoolean().withMessage('Approval status is required'),
    body('reviewerId').notEmpty().withMessage('Reviewer ID is required'),
    body('comments').optional().isString()
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Advancing project phase', { 
        projectId: req.params.id, 
        userId: req.user?.id,
        approved: req.body.approved 
      });

      const approvalData = {
        approved: req.body.approved,
        reviewerId: req.body.reviewerId,
        comments: req.body.comments
      };

      const transition = await workflowService.advancePhase(req.params.id, approvalData);

      logger.info('Phase advanced successfully', { 
        projectId: req.params.id,
        fromPhase: transition.fromPhase,
        toPhase: transition.toPhase
      });

      res.json({
        success: true,
        data: transition,
        message: `Phase advanced from ${transition.fromPhase} to ${transition.toPhase}`
      });
    } catch (error) {
      logger.error('Error advancing phase', { error, projectId: req.params.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to advance phase'
      });
    }
  }
);

/**
 * GET /api/course-content/projects/:id/status
 * Get current status of course project
 * 
 * @access All authenticated users
 * @validates Requirements 8.1, 8.4
 */
router.get(
  '/projects/:id/status',
  authMiddleware,
  [param('id').notEmpty().withMessage('Project ID is required')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Getting project status', { projectId: req.params.id, userId: req.user?.id });

      const status = await workflowService.getProjectStatus(req.params.id);

      res.json({
        success: true,
        data: status.data
      });
    } catch (error) {
      logger.error('Error getting project status', { error, projectId: req.params.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get project status'
      });
    }
  }
);


// ==================== Video Production ====================

/**
 * POST /api/course-content/videos
 * Upload and process video lecture
 * 
 * @access Faculty, Production Team
 * @validates Requirements 2.1, 2.2
 */
router.post(
  '/videos',
  authMiddleware,
  [
    body('lectureId').notEmpty().withMessage('Lecture ID is required'),
    body('facultyId').notEmpty().withMessage('Faculty ID is required'),
    body('requestedDate').optional().isISO8601().withMessage('Invalid date format'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be positive'),
    body('studioLocation').optional().isString(),
    body('recordingType').optional().isIn(['STANDARD', 'ADVANCED']),
    body('editingSpecs').optional().isObject()
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Processing video upload', { 
        lectureId: req.body.lectureId,
        userId: req.user?.id 
      });

      // Schedule recording if requested
      let recordingSession = null;
      if (req.body.requestedDate) {
        const lectureInfo = {
          lectureId: req.body.lectureId,
          facultyId: req.body.facultyId,
          requestedDate: new Date(req.body.requestedDate),
          duration: req.body.duration || 30,
          studioLocation: req.body.studioLocation,
          recordingType: req.body.recordingType
        };

        recordingSession = await videoService.scheduleRecording(lectureInfo);
      }

      // Process video if editing specs provided
      let processedVideo = null;
      if (req.body.editingSpecs && req.body.videoId) {
        processedVideo = await videoService.processVideo(
          req.body.videoId,
          req.body.editingSpecs
        );
      }

      res.status(201).json({
        success: true,
        data: {
          recordingSession,
          processedVideo
        },
        message: 'Video processing initiated successfully'
      });
    } catch (error) {
      logger.error('Error processing video', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process video'
      });
    }
  }
);

/**
 * POST /api/course-content/videos/:id/captions
 * Generate captions and transcripts for video
 * 
 * @access Production Team
 * @validates Requirements 2.3
 */
router.post(
  '/videos/:id/captions',
  authMiddleware,
  [
    param('id').notEmpty().withMessage('Video ID is required'),
    body('language').optional().isString().withMessage('Language code must be a string')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Generating captions', { videoId: req.params.id, userId: req.user?.id });

      const language = req.body.language || 'en';
      const captions = await videoService.generateCaptions(req.params.id, language);

      res.json({
        success: true,
        data: captions,
        message: 'Captions generated successfully'
      });
    } catch (error) {
      logger.error('Error generating captions', { error, videoId: req.params.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate captions'
      });
    }
  }
);

/**
 * POST /api/course-content/videos/:id/optimize
 * Optimize video for streaming
 * 
 * @access Production Team
 * @validates Requirements 2.4
 */
router.post(
  '/videos/:id/optimize',
  authMiddleware,
  [param('id').notEmpty().withMessage('Video ID is required')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Optimizing video for streaming', { videoId: req.params.id, userId: req.user?.id });

      const streamingAsset = await videoService.optimizeForStreaming(req.params.id);

      res.json({
        success: true,
        data: streamingAsset,
        message: 'Video optimized for streaming successfully'
      });
    } catch (error) {
      logger.error('Error optimizing video', { error, videoId: req.params.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize video'
      });
    }
  }
);

/**
 * POST /api/course-content/videos/:id/multilingual
 * Create multilingual versions of video
 * 
 * @access Production Team
 * @validates Requirements 2.5
 */
router.post(
  '/videos/:id/multilingual',
  authMiddleware,
  [
    param('id').notEmpty().withMessage('Video ID is required'),
    body('languages').isArray({ min: 1 }).withMessage('At least one language required')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Creating multilingual versions', { 
        videoId: req.params.id,
        languages: req.body.languages,
        userId: req.user?.id 
      });

      const multilingualAsset = await videoService.createMultilingualVersion(
        req.params.id,
        req.body.languages
      );

      res.json({
        success: true,
        data: multilingualAsset,
        message: 'Multilingual versions created successfully'
      });
    } catch (error) {
      logger.error('Error creating multilingual versions', { error, videoId: req.params.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create multilingual versions'
      });
    }
  }
);


// ==================== Written Materials ====================

/**
 * POST /api/course-content/materials
 * Generate written materials for lecture
 * 
 * @access Faculty, Instructional Designer
 * @validates Requirements 3.1, 3.2, 3.3
 */
router.post(
  '/materials',
  authMiddleware,
  [
    body('lectureId').notEmpty().withMessage('Lecture ID is required'),
    body('content').notEmpty().withMessage('Lecture content is required'),
    body('generatePDF').optional().isBoolean(),
    body('template').optional().isString()
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Generating written materials', { 
        lectureId: req.body.lectureId,
        userId: req.user?.id 
      });

      const lectureNotesRequest = {
        lectureId: req.body.lectureId,
        topic: req.body.title || '',
        learningObjectives: req.body.learningObjectives || [],
        keyTerms: req.body.keyTerms || [],
        content: req.body.content
      };

      const lectureNotes = await materialsService.generateLectureNotes(
        lectureNotesRequest
      );

      // Generate PDF if requested
      let pdfDocument = null;
      if (req.body.generatePDF) {
        const template = req.body.template || 'default';
        pdfDocument = await materialsService.createPDF(lectureNotes.id, { template });
      }

      res.status(201).json({
        success: true,
        data: {
          lectureNotes,
          pdfDocument
        },
        message: 'Written materials generated successfully'
      });
    } catch (error) {
      logger.error('Error generating written materials', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate written materials'
      });
    }
  }
);

/**
 * POST /api/course-content/materials/:id/resources
 * Curate supplemental resources for module
 * 
 * @access Faculty, Instructional Designer
 * @validates Requirements 3.4
 */
router.post(
  '/materials/:id/resources',
  authMiddleware,
  [
    param('id').notEmpty().withMessage('Module ID is required'),
    body('topic').notEmpty().withMessage('Topic is required')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Curating supplemental resources', { 
        moduleId: req.params.id,
        topic: req.body.topic,
        userId: req.user?.id 
      });

      const resourceRequest = {
        moduleId: req.params.id,
        topic: req.body.topic,
        learningObjectives: req.body.learningObjectives || [],
        targetAudience: req.body.targetAudience || 'undergraduate'
      };

      const resources = await materialsService.curateSupplementalResources(
        resourceRequest
      );

      res.json({
        success: true,
        data: resources,
        message: 'Supplemental resources curated successfully'
      });
    } catch (error) {
      logger.error('Error curating resources', { error, moduleId: req.params.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to curate resources'
      });
    }
  }
);

/**
 * POST /api/course-content/materials/:id/validate-citations
 * Validate citations in document
 * 
 * @access Faculty, QA Reviewer
 * @validates Requirements 3.5
 */
router.post(
  '/materials/:id/validate-citations',
  authMiddleware,
  [param('id').notEmpty().withMessage('Document ID is required')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Validating citations', { documentId: req.params.id, userId: req.user?.id });

      const validation = await materialsService.validateCitations(req.params.id);

      res.json({
        success: true,
        data: validation,
        message: 'Citations validated successfully'
      });
    } catch (error) {
      logger.error('Error validating citations', { error, documentId: req.params.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate citations'
      });
    }
  }
);


// ==================== Assessment Design ====================

/**
 * POST /api/course-content/assessments
 * Create assessment for module
 * 
 * @access Faculty, Instructional Designer
 * @validates Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */
router.post(
  '/assessments',
  authMiddleware,
  [
    body('moduleId').notEmpty().withMessage('Module ID is required'),
    body('type').isIn(['QUIZ', 'ESSAY', 'PROJECT', 'ORAL_DEFENSE', 'PEER_REVIEW']).withMessage('Invalid assessment type'),
    body('title').notEmpty().withMessage('Assessment title is required'),
    body('description').notEmpty().withMessage('Assessment description is required'),
    body('points').isInt({ min: 1 }).withMessage('Points must be positive'),
    body('learningObjectives').isArray({ min: 1 }).withMessage('At least one learning objective required')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Creating assessment', { 
        moduleId: req.body.moduleId,
        type: req.body.type,
        userId: req.user?.id 
      });

      let assessment;

      switch (req.body.type) {
        case 'QUIZ':
          const questionCount = req.body.questionCount || 50;
          const questionBank = await assessmentService.createQuestionBank(
            req.body.moduleId,
            questionCount
          );
          assessment = {
            ...req.body,
            questionBank
          };
          break;

        case 'PROJECT':
          const projectRequirements = req.body.projectRequirements || {
            realWorldApplication: true,
            measurableImpact: true,
            deploymentReadiness: true
          };
          const project = await assessmentService.designProject(
            req.body.moduleId,
            projectRequirements
          );
          assessment = {
            ...req.body,
            project
          };
          break;

        default:
          assessment = req.body;
      }

      // Create rubric
      const criteria = req.body.rubricCriteria || [];
      const assessmentId = assessment.id || `assessment_${Date.now()}`;
      const rubric = await assessmentService.createRubric(
        assessmentId,
        criteria
      );

      // Validate alignment with learning objectives
      const alignmentReport = await assessmentService.validateAlignment(
        assessmentId,
        req.body.learningObjectives
      );

      res.status(201).json({
        success: true,
        data: {
          assessment,
          rubric,
          alignmentReport
        },
        message: 'Assessment created successfully'
      });
    } catch (error) {
      logger.error('Error creating assessment', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create assessment'
      });
    }
  }
);


// ==================== Quality Review ====================

/**
 * POST /api/course-content/quality-review
 * Submit course for quality assurance review
 * 
 * @access Faculty, Project Manager
 * @validates Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */
router.post(
  '/quality-review',
  authMiddleware,
  [
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('reviewType').optional().isIn(['FULL', 'VIDEO', 'WRITTEN', 'ASSESSMENT']).withMessage('Invalid review type')
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Submitting for quality review', { 
        courseId: req.body.courseId,
        reviewType: req.body.reviewType,
        userId: req.user?.id 
      });

      const reviewType = req.body.reviewType || 'FULL';
      let report;

      switch (reviewType) {
        case 'FULL':
          report = await qualityService.runQualityChecklist(req.body.courseId);
          break;

        case 'VIDEO':
          if (!req.body.videoId) {
            res.status(400).json({
              success: false,
              error: 'Video ID required for video review'
            });
            return;
          }
          report = await qualityService.reviewVideoQuality(req.body.videoId);
          break;

        case 'WRITTEN':
          if (!req.body.documentId) {
            res.status(400).json({
              success: false,
              error: 'Document ID required for written materials review'
            });
            return;
          }
          report = await qualityService.reviewWrittenMaterials(req.body.documentId);
          break;

        case 'ASSESSMENT':
          if (!req.body.assessmentId) {
            res.status(400).json({
              success: false,
              error: 'Assessment ID required for assessment review'
            });
            return;
          }
          report = await qualityService.reviewAssessmentRigor(req.body.assessmentId);
          break;

        default:
          report = await qualityService.runQualityChecklist(req.body.courseId);
      }

      res.json({
        success: true,
        data: report,
        message: 'Quality review completed successfully'
      });
    } catch (error) {
      logger.error('Error in quality review', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete quality review'
      });
    }
  }
);

/**
 * POST /api/course-content/quality-review/:courseId/approve
 * Approve course for publication
 * 
 * @access QA Reviewer, Admin
 * @validates Requirements 6.5
 */
router.post(
  '/quality-review/:courseId/approve',
  authMiddleware,
  [
    param('courseId').notEmpty().withMessage('Course ID is required'),
    body('reviewerId').notEmpty().withMessage('Reviewer ID is required')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Approving course', { 
        courseId: req.params.courseId,
        reviewerId: req.body.reviewerId,
        userId: req.user?.id 
      });

      const decision = await qualityService.approveCourse(
        req.params.courseId,
        req.body.reviewerId
      );

      res.json({
        success: true,
        data: decision,
        message: decision.approved 
          ? 'Course approved for publication' 
          : 'Course requires improvements before approval'
      });
    } catch (error) {
      logger.error('Error approving course', { error, courseId: req.params.courseId });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve course'
      });
    }
  }
);


// ==================== Progress Tracking Dashboard ====================

/**
 * GET /api/course-content/dashboard
 * Get production dashboard with progress tracking
 * 
 * @access All authenticated users
 * @validates Requirements 8.1, 8.4
 */
router.get(
  '/dashboard',
  authMiddleware,
  [
    query('userId').optional().isString(),
    query('role').optional().isIn(['faculty', 'designer', 'producer', 'reviewer', 'manager']),
    query('status').optional().isIn(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED'])
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Getting dashboard data', { userId: req.user?.id, filters: req.query });

      // Get user's projects based on role
      const userId = req.query.userId as string || req.user?.id;
      const role = req.query.role as string;
      const status = req.query.status as string;

      // Get timeline data - simplified for now
      const timelineData = await timelineService.getDashboardData();

      // Get progress metrics
      const projects = (timelineData as any).courseProjects || [];
      const upcomingDeadlines = (timelineData as any).upcomingDeadlines || [];
      const recentActivity = (timelineData as any).recentActivity || [];
      
      const metrics = {
        totalProjects: projects.length,
        activeProjects: projects.filter((p: any) => p.status === 'ACTIVE').length,
        completedProjects: projects.filter((p: any) => p.status === 'COMPLETED').length,
        overdueProjects: projects.filter((p: any) => p.overdue).length,
        upcomingDeadlines
      };

      res.json({
        success: true,
        data: {
          projects,
          metrics,
          upcomingDeadlines,
          recentActivity
        }
      });
    } catch (error) {
      logger.error('Error getting dashboard data', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get dashboard data'
      });
    }
  }
);


// ==================== Real-World Deployment ====================

/**
 * POST /api/course-content/deployment-pathways
 * Create deployment pathway for module concept
 * 
 * @access Faculty, Instructional Designer
 * @validates Requirements 13.1, 13.2, 13.3, 13.4, 13.5
 */
router.post(
  '/deployment-pathways',
  authMiddleware,
  [
    body('moduleId').notEmpty().withMessage('Module ID is required'),
    body('conceptId').notEmpty().withMessage('Concept ID is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('realWorldApplication').notEmpty().withMessage('Real-world application is required'),
    body('systemsToTransform').isArray({ min: 1 }).withMessage('At least one system to transform required'),
    body('measurableImpact').isArray({ min: 1 }).withMessage('At least one measurable impact metric required')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Creating deployment pathway', { 
        moduleId: req.body.moduleId,
        conceptId: req.body.conceptId,
        userId: req.user?.id 
      });

      const pathway = await deploymentService.createDeploymentPathway(
        req.body.moduleId,
        req.body.conceptId,
        req.body.description,
        req.body.realWorldApplication,
        req.body.systemsToTransform,
        req.body.measurableImpact,
        req.body.requiredCompetencies || []
      );

      res.status(201).json({
        success: true,
        data: pathway,
        message: 'Deployment pathway created successfully'
      });
    } catch (error) {
      logger.error('Error creating deployment pathway', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create deployment pathway'
      });
    }
  }
);

/**
 * POST /api/course-content/deployment-pathways/:id/connect-student
 * Connect student to real-world project
 * 
 * @access Faculty, Project Coordinator
 * @validates Requirements 13.2
 */
router.post(
  '/deployment-pathways/:id/connect-student',
  authMiddleware,
  [
    param('id').notEmpty().withMessage('Pathway ID is required'),
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('organization').notEmpty().withMessage('Organization is required'),
    body('systemType').notEmpty().withMessage('System type is required')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Connecting student to project', { 
        pathwayId: req.params.id,
        studentId: req.body.studentId,
        userId: req.user?.id 
      });

      const connection = await deploymentService.connectStudentToProject(
        req.body.studentId,
        req.body.projectId,
        req.body.organization,
        req.body.systemType,
        req.body.expectedOutcomes || []
      );

      res.status(201).json({
        success: true,
        data: connection,
        message: 'Student connected to project successfully'
      });
    } catch (error) {
      logger.error('Error connecting student to project', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect student to project'
      });
    }
  }
);

/**
 * POST /api/course-content/deployment-pathways/assess-readiness
 * Assess student deployment readiness
 * 
 * @access Faculty, Assessment Coordinator
 * @validates Requirements 13.3
 */
router.post(
  '/deployment-pathways/assess-readiness',
  authMiddleware,
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('assessmentId').notEmpty().withMessage('Assessment ID is required')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Assessing deployment readiness', { 
        studentId: req.body.studentId,
        assessmentId: req.body.assessmentId,
        userId: req.user?.id 
      });

      const readinessReport = await deploymentService.assessDeploymentReadiness(
        req.body.studentId,
        req.body.assessmentId
      );

      res.json({
        success: true,
        data: readinessReport,
        message: 'Deployment readiness assessed successfully'
      });
    } catch (error) {
      logger.error('Error assessing deployment readiness', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assess deployment readiness'
      });
    }
  }
);

/**
 * POST /api/course-content/deployment-pathways/generate-portfolio
 * Generate portfolio evidence for student
 * 
 * @access Faculty, Student
 * @validates Requirements 13.4
 */
router.post(
  '/deployment-pathways/generate-portfolio',
  authMiddleware,
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('courseId').notEmpty().withMessage('Course ID is required')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Generating portfolio evidence', { 
        studentId: req.body.studentId,
        courseId: req.body.courseId,
        userId: req.user?.id 
      });

      const portfolioAsset = await deploymentService.generatePortfolioEvidence(
        req.body.studentId,
        req.body.courseId
      );

      res.status(201).json({
        success: true,
        data: portfolioAsset,
        message: 'Portfolio evidence generated successfully'
      });
    } catch (error) {
      logger.error('Error generating portfolio evidence', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate portfolio evidence'
      });
    }
  }
);


// ==================== Validation Endpoints ====================

/**
 * POST /api/course-content/validate-constitution
 * Validate course against Course Content Constitution
 * 
 * @access Faculty, QA Reviewer
 * @validates Requirements 14.1, 14.2, 14.3, 14.4, 14.5
 */
router.post(
  '/validate-constitution',
  authMiddleware,
  [
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('validationType').optional().isIn(['STRUCTURE', 'PLACEHOLDER', 'COMPONENTS', 'ASSESSMENT', 'FORMATION', 'FULL'])
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Validating course constitution', { 
        courseId: req.body.courseId,
        validationType: req.body.validationType,
        userId: req.user?.id 
      });

      const validationType = req.body.validationType || 'FULL';
      let validation;

      switch (validationType) {
        case 'STRUCTURE':
          validation = await constitutionValidator.validateCourseStructure(req.body.courseId);
          break;

        case 'PLACEHOLDER':
          if (!req.body.contentId) {
            res.status(400).json({
              success: false,
              error: 'Content ID required for placeholder detection'
            });
            return;
          }
          validation = await constitutionValidator.detectPlaceholderContent(req.body.contentId);
          break;

        case 'COMPONENTS':
          if (!req.body.lessonId) {
            res.status(400).json({
              success: false,
              error: 'Lesson ID required for component validation'
            });
            return;
          }
          validation = await constitutionValidator.validateLessonComponents(req.body.lessonId);
          break;

        case 'ASSESSMENT':
          validation = await constitutionValidator.validateAssessmentDistribution(req.body.courseId);
          break;

        case 'FORMATION':
          validation = await constitutionValidator.validateIntegratedFormation(req.body.courseId);
          break;

        case 'FULL':
        default:
          // Run all validations
          const [structure, assessment, formation] = await Promise.all([
            constitutionValidator.validateCourseStructure(req.body.courseId),
            constitutionValidator.validateAssessmentDistribution(req.body.courseId),
            constitutionValidator.validateIntegratedFormation(req.body.courseId)
          ]);

          validation = {
            structure,
            assessment,
            formation,
            overallValid: structure.overallValid && assessment.valid && formation.integratedFormationAchieved
          };
          break;
      }

      res.json({
        success: true,
        data: validation,
        message: 'Constitution validation completed'
      });
    } catch (error) {
      logger.error('Error validating constitution', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate constitution'
      });
    }
  }
);

/**
 * POST /api/course-content/validate-rigor
 * Validate course rigor level and depth
 * 
 * @access Faculty, QA Reviewer
 * @validates Requirements 15.1, 15.2, 15.3, 15.4, 15.5
 */
router.post(
  '/validate-rigor',
  authMiddleware,
  [
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('declaredLevel').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'STRATEGIC']).withMessage('Invalid rigor level')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Validating course rigor', { 
        courseId: req.body.courseId,
        declaredLevel: req.body.declaredLevel,
        userId: req.user?.id 
      });

      const rigorValidation = await rigorEnforcer.validateRigorLevel(
        req.body.courseId,
        req.body.declaredLevel
      );

      // Benchmark against elite institutions
      const benchmarkReport = await rigorEnforcer.benchmarkAgainstEliteInstitutions(
        req.body.courseId
      );

      res.json({
        success: true,
        data: {
          rigorValidation,
          benchmarkReport
        },
        message: 'Rigor validation completed'
      });
    } catch (error) {
      logger.error('Error validating rigor', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate rigor'
      });
    }
  }
);

/**
 * POST /api/course-content/validate-spiritual-alignment
 * Validate spiritual alignment of content
 * 
 * @access Theology Advisor, QA Reviewer
 * @validates Requirements 16.1, 16.2, 16.3, 16.4, 16.5
 */
router.post(
  '/validate-spiritual-alignment',
  authMiddleware,
  [
    body('contentId').notEmpty().withMessage('Content ID is required'),
    body('strictnessProfile').isIn(['STRICT_SPIRITUAL', 'BALANCED', 'LIGHT_CHECK']).withMessage('Invalid strictness profile')
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      logger.info('Validating spiritual alignment', { 
        contentId: req.body.contentId,
        strictnessProfile: req.body.strictnessProfile,
        userId: req.user?.id 
      });

      const validation = await alignmentValidator.validateContent(
        req.body.contentId,
        req.body.strictnessProfile
      );

      // If validation failed, attempt auto-correction
      if (!validation.passed && req.body.attemptCorrection !== false) {
        const correctionResult = await alignmentValidator.attemptAutoCorrection(
          req.body.contentId,
          validation.errors
        );

        validation.correctionAttempted = true;
        validation.correctionSuccessful = correctionResult.successful;
      }

      res.json({
        success: true,
        data: validation,
        message: validation.passed 
          ? 'Content passes spiritual alignment validation' 
          : 'Content has spiritual alignment issues'
      });
    } catch (error) {
      logger.error('Error validating spiritual alignment', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate spiritual alignment'
      });
    }
  }
);

/**
 * POST /api/course-content/validate-pedagogy
 * Validate Scroll Pedagogy compliance
 * 
 * @access Instructional Designer, QA Reviewer
 * @validates Requirements 18.1, 18.2, 18.3, 18.4, 18.5
 */
router.post(
  '/validate-pedagogy',
  authMiddleware,
  [
    body('lessonId').optional().isString(),
    body('courseId').optional().isString(),
    body('validationType').isIn(['LESSON_FLOW', 'TUTOR_TONE', 'ASSESSMENT_DISTRIBUTION', 'PROGRESSION_LEVEL', 'FULL']).withMessage('Invalid validation type')
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Validating pedagogy', { 
        lessonId: req.body.lessonId,
        courseId: req.body.courseId,
        validationType: req.body.validationType,
        userId: req.user?.id 
      });

      const validationType = req.body.validationType;
      let validation;

      switch (validationType) {
        case 'LESSON_FLOW':
          if (!req.body.lessonId) {
            res.status(400).json({
              success: false,
              error: 'Lesson ID required for lesson flow validation'
            });
            return;
          }
          validation = await pedagogyEnforcer.validateLessonFlow(req.body.lessonId);
          break;

        case 'TUTOR_TONE':
          if (!req.body.tutorResponseId) {
            res.status(400).json({
              success: false,
              error: 'Tutor response ID required for tone validation'
            });
            return;
          }
          validation = await pedagogyEnforcer.validateAITutorTone(req.body.tutorResponseId);
          break;

        case 'ASSESSMENT_DISTRIBUTION':
          if (!req.body.courseId) {
            res.status(400).json({
              success: false,
              error: 'Course ID required for assessment distribution validation'
            });
            return;
          }
          validation = await pedagogyEnforcer.validateAssessmentDistribution(req.body.courseId);
          break;

        case 'PROGRESSION_LEVEL':
          if (!req.body.courseId) {
            res.status(400).json({
              success: false,
              error: 'Course ID required for progression level validation'
            });
            return;
          }
          validation = await pedagogyEnforcer.mapToProgressionLevel(req.body.courseId);
          break;

        case 'FULL':
        default:
          if (!req.body.courseId) {
            res.status(400).json({
              success: false,
              error: 'Course ID required for full pedagogy validation'
            });
            return;
          }

          const [assessmentDist, progressionLevel] = await Promise.all([
            pedagogyEnforcer.validateAssessmentDistribution(req.body.courseId),
            pedagogyEnforcer.mapToProgressionLevel(req.body.courseId)
          ]);

          validation = {
            assessmentDistribution: assessmentDist,
            progressionLevel,
            overallValid: assessmentDist.distributionBalanced && progressionLevel.levelAppropriate
          };
          break;
      }

      res.json({
        success: true,
        data: validation,
        message: 'Pedagogy validation completed'
      });
    } catch (error) {
      logger.error('Error validating pedagogy', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate pedagogy'
      });
    }
  }
);

// Export router
export default router;

