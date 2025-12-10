/**
 * Course Sequencing API Routes
 * "Let wisdom guide the path of learning, step by step"
 * 
 * Provides REST API endpoints for optimal course path calculation,
 * scheduling optimization, and student progression tracking.
 * 
 * Requirements: 3.2, 5.2
 */

import express, { Request, Response } from 'express';
import CourseSequencingService from '../services/CourseSequencingService';
import { auth } from '../middleware/auth';

const router = express.Router();
const sequencingService = new CourseSequencingService();

// ============================================================================
// Path Recommendation Routes
// ============================================================================

/**
 * Calculate optimal course path for a student
 * POST /api/course-sequencing/optimal-path
 * Requirement 5.2: WHEN scheduling courses THEN the system SHALL optimize for student progression
 */
router.post('/optimal-path', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const optimalPath = await sequencingService.calculateOptimalPath(req.body);
    
    res.json({
      success: true,
      data: optimalPath
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get student progression tracking
 * GET /api/course-sequencing/progression/:userId/:degreeProgramId
 * Requirement 3.2: Track student progression through course sequences
 */
router.get('/progression/:userId/:degreeProgramId', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, degreeProgramId } = req.params;
    const progression = await sequencingService.trackProgression(userId, degreeProgramId);
    
    res.json({
      success: true,
      data: progression
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Detect scheduling conflicts
 * POST /api/course-sequencing/detect-conflicts
 */
router.post('/detect-conflicts', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, semester, proposedCourses } = req.body;
    
    const conflicts = await sequencingService.detectSchedulingConflicts(
      userId,
      semester,
      proposedCourses
    );
    
    res.json({
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Scheduling Optimization Routes
// ============================================================================

/**
 * Optimize course scheduling for a semester
 * POST /api/course-sequencing/optimize-schedule
 * Requirement 5.2: Optimize scheduling for student progression
 */
router.post('/optimize-schedule', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, semester, availableCourses, constraints } = req.body;
    
    const optimizedSchedule = await sequencingService.optimizeScheduling(
      userId,
      semester,
      availableCourses,
      constraints || {}
    );
    
    res.json({
      success: true,
      data: {
        semester,
        selectedCourses: optimizedSchedule
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get recommended courses for next semester
 * GET /api/course-sequencing/recommendations/:userId/:degreeProgramId
 */
router.get('/recommendations/:userId/:degreeProgramId', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, degreeProgramId } = req.params;
    const { semester, maxCourses } = req.query;
    
    // Get progression to determine remaining courses
    const progression = await sequencingService.trackProgression(userId, degreeProgramId);
    
    // Optimize scheduling for remaining courses
    const recommendations = await sequencingService.optimizeScheduling(
      userId,
      parseInt(semester as string) || 1,
      progression.remainingCourses,
      {
        maxCourses: parseInt(maxCourses as string) || 5
      }
    );
    
    res.json({
      success: true,
      data: {
        recommendedCourses: recommendations,
        remainingCourses: progression.remainingCourses.length,
        projectedGraduation: progression.projectedGraduationSemester
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Validate proposed course schedule
 * POST /api/course-sequencing/validate-schedule
 */
router.post('/validate-schedule', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, semester, proposedCourses } = req.body;
    
    // Detect conflicts
    const conflicts = await sequencingService.detectSchedulingConflicts(
      userId,
      semester,
      proposedCourses
    );
    
    // Calculate total credits
    const totalCredits = proposedCourses.length * 3; // Simplified calculation
    
    const validation = {
      valid: conflicts.length === 0 && totalCredits <= 18,
      conflicts,
      totalCredits,
      warnings: [] as string[]
    };
    
    if (totalCredits > 18) {
      validation.warnings.push('Course load exceeds recommended 18 credits');
    }
    
    if (totalCredits > 21) {
      validation.warnings.push('CRITICAL: Course load exceeds maximum 21 credits');
      validation.valid = false;
    }
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Degree Planning Routes
// ============================================================================

/**
 * Generate complete degree plan
 * POST /api/course-sequencing/degree-plan
 */
router.post('/degree-plan', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, degreeProgramId, startSemester, preferences } = req.body;
    
    const optimalPath = await sequencingService.calculateOptimalPath({
      userId,
      degreeProgramId,
      startSemester,
      maxCoursesPerSemester: preferences?.maxCoursesPerSemester || 5,
      preferredCourses: preferences?.preferredCourses || []
    });
    
    res.json({
      success: true,
      data: {
        degreePlan: optimalPath,
        summary: {
          totalSemesters: optimalPath.estimatedCompletionSemesters,
          totalCredits: optimalPath.totalCredits,
          warnings: optimalPath.warnings
        }
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get degree completion timeline
 * GET /api/course-sequencing/timeline/:userId/:degreeProgramId
 */
router.get('/timeline/:userId/:degreeProgramId', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, degreeProgramId } = req.params;
    
    const progression = await sequencingService.trackProgression(userId, degreeProgramId);
    
    const timeline = {
      currentProgress: {
        completedCourses: progression.completedCourses.length,
        inProgressCourses: progression.inProgressCourses.length,
        remainingCourses: progression.remainingCourses.length,
        percentComplete: progression.percentComplete
      },
      credits: {
        completed: progression.completedCredits,
        remaining: progression.remainingCredits
      },
      status: {
        onTrack: progression.onTrack,
        projectedGraduation: progression.projectedGraduationSemester
      }
    };
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Compare multiple degree paths
 * POST /api/course-sequencing/compare-paths
 */
router.post('/compare-paths', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, degreeProgramId, scenarios } = req.body;
    
    const comparisons = [];
    
    for (const scenario of scenarios) {
      const path = await sequencingService.calculateOptimalPath({
        userId,
        degreeProgramId,
        ...scenario
      });
      
      comparisons.push({
        scenarioName: scenario.name,
        estimatedSemesters: path.estimatedCompletionSemesters,
        totalCredits: path.totalCredits,
        warnings: path.warnings.length,
        path: path.recommendedPath
      });
    }
    
    res.json({
      success: true,
      data: {
        comparisons,
        recommendation: comparisons.reduce((best, current) => 
          current.estimatedSemesters < best.estimatedSemesters ? current : best
        )
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Analytics Routes
// ============================================================================

/**
 * Get sequencing analytics for a program
 * GET /api/course-sequencing/analytics/:degreeProgramId
 */
router.get('/analytics/:degreeProgramId', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { degreeProgramId } = req.params;
    
    // This would aggregate data from multiple students
    // Placeholder implementation
    const analytics = {
      averageCompletionTime: 8, // semesters
      commonPathways: [],
      bottleneckCourses: [],
      successRate: 85
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get course sequencing patterns
 * GET /api/course-sequencing/patterns/:courseId
 */
router.get('/patterns/:courseId', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    
    // Analyze common sequencing patterns for this course
    // Placeholder implementation
    const patterns = {
      courseId,
      commonPrerequisites: [],
      commonFollowUps: [],
      typicalSemester: 3,
      successRate: 90
    };
    
    res.json({
      success: true,
      data: patterns
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
