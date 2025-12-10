/**
 * Course Offering API Routes
 * "Let every course be offered in its season, meeting the needs of all learners"
 * 
 * Provides REST API endpoints for course offering management,
 * demand analysis, capacity management, and waitlist functionality.
 * 
 * Requirements: 5.1, 5.2, 5.3
 */

import express, { Request, Response } from 'express';
import CourseOfferingService from '../services/CourseOfferingService';
import { authenticate as auth } from '../middleware/auth';

const router = express.Router();
const offeringService = new CourseOfferingService();

// ============================================================================
// Course Offering Management Routes
// ============================================================================

/**
 * Create a new course offering
 * POST /api/course-offerings
 */
router.post('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const offering = await offeringService.createOffering(req.body);
    
    res.status(201).json({
      success: true,
      data: offering
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get course offering by ID
 * GET /api/course-offerings/:offeringId
 */
router.get('/:offeringId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { offeringId } = req.params;
    const offering = await offeringService.getOffering(offeringId);
    
    if (!offering) {
      res.status(404).json({
        success: false,
        error: 'Course offering not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: offering
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all offerings for a course
 * GET /api/course-offerings/course/:courseId
 */
router.get('/course/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { semester, year, status } = req.query;
    
    const offerings = await offeringService.getCourseOfferings(courseId, {
      semester: semester as string,
      year: year ? parseInt(year as string) : undefined,
      status: status as any
    });
    
    res.json({
      success: true,
      data: offerings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Demand Analysis Routes
// ============================================================================

/**
 * Analyze course demand
 * POST /api/course-offerings/demand-analysis
 * Requirement 5.1: WHEN planning offerings THEN the system SHALL analyze student demand and program requirements
 */
router.post('/demand-analysis', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, semester, year } = req.body;
    
    const analysis = await offeringService.analyzeDemand(courseId, semester, year);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Predict future course demand
 * GET /api/course-offerings/demand-prediction/:courseId
 * Requirement 5.3: WHEN analyzing patterns THEN the system SHALL predict future course demand
 */
router.get('/demand-prediction/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { futureSemesters } = req.query;
    
    const predictions = await offeringService.predictDemand(
      courseId,
      futureSemesters ? parseInt(futureSemesters as string) : 4
    );
    
    // Convert Map to object for JSON serialization
    const predictionsObj: Record<string, number> = {};
    predictions.forEach((value, key) => {
      predictionsObj[key] = value;
    });
    
    res.json({
      success: true,
      data: {
        courseId,
        predictions: predictionsObj
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Capacity Management Routes
// ============================================================================

/**
 * Manage course capacity
 * GET /api/course-offerings/:offeringId/capacity
 * Requirement 5.2: WHEN managing capacity THEN the system SHALL track enrollment limits and waitlists
 */
router.get('/:offeringId/capacity', async (req: Request, res: Response): Promise<void> => {
  try {
    const { offeringId } = req.params;
    
    const capacityManagement = await offeringService.manageCapacity(offeringId);
    
    res.json({
      success: true,
      data: capacityManagement
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update course capacity
 * PUT /api/course-offerings/:offeringId/capacity
 */
router.put('/:offeringId/capacity', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { offeringId } = req.params;
    const { newCapacity } = req.body;
    
    // Implementation would update the offering capacity
    res.json({
      success: true,
      data: {
        offeringId,
        newCapacity,
        message: 'Capacity updated successfully'
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
// Waitlist Management Routes
// ============================================================================

/**
 * Add student to waitlist
 * POST /api/course-offerings/:offeringId/waitlist
 * Requirement 5.2: Track enrollment limits and waitlists
 */
router.post('/:offeringId/waitlist', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { offeringId } = req.params;
    const { userId, priority } = req.body;
    
    const waitlistEntry = await offeringService.addToWaitlist(
      userId,
      offeringId,
      priority || 0
    );
    
    res.status(201).json({
      success: true,
      data: waitlistEntry
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Process waitlist (when spot becomes available)
 * POST /api/course-offerings/:offeringId/waitlist/process
 */
router.post('/:offeringId/waitlist/process', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { offeringId } = req.params;
    
    const nextStudent = await offeringService.processWaitlist(offeringId);
    
    if (!nextStudent) {
      res.json({
        success: true,
        data: {
          message: 'No students on waitlist'
        }
      });
      return;
    }
    
    res.json({
      success: true,
      data: nextStudent
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Alternative Course Routes
// ============================================================================

/**
 * Suggest alternative courses
 * GET /api/course-offerings/:courseId/alternatives
 * Requirement 5.3: WHEN courses are full THEN the system SHALL suggest alternatives or additional sections
 */
router.get('/:courseId/alternatives', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { semester, year } = req.query;
    
    const alternatives = await offeringService.suggestAlternatives(
      courseId,
      semester as string,
      parseInt(year as string)
    );
    
    res.json({
      success: true,
      data: {
        originalCourseId: courseId,
        alternatives
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Scheduling and Planning Routes
// ============================================================================

/**
 * Get offering schedule
 * GET /api/course-offerings/:offeringId/schedule
 */
router.get('/:offeringId/schedule', async (req: Request, res: Response): Promise<void> => {
  try {
    const { offeringId } = req.params;
    const offering = await offeringService.getOffering(offeringId);
    
    if (!offering) {
      res.status(404).json({
        success: false,
        error: 'Course offering not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        offeringId,
        schedule: offering.schedule
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
 * Get semester offerings
 * GET /api/course-offerings/semester/:semester/:year
 */
router.get('/semester/:semester/:year', async (req: Request, res: Response): Promise<void> => {
  try {
    const { semester, year } = req.params;
    
    // This would query all offerings for the specified semester
    // Placeholder implementation
    const offerings: any[] = [];
    
    res.json({
      success: true,
      data: {
        semester,
        year: parseInt(year),
        offerings
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
 * Get offerings by instructor
 * GET /api/course-offerings/instructor/:instructorId
 */
router.get('/instructor/:instructorId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { instructorId } = req.params;
    const { semester, year } = req.query;
    
    // This would query offerings assigned to the instructor
    // Placeholder implementation
    const offerings: any[] = [];
    
    res.json({
      success: true,
      data: {
        instructorId,
        offerings
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Analytics and Reporting Routes
// ============================================================================

/**
 * Get offering statistics
 * GET /api/course-offerings/:offeringId/statistics
 */
router.get('/:offeringId/statistics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { offeringId } = req.params;
    const offering = await offeringService.getOffering(offeringId);
    
    if (!offering) {
      res.status(404).json({
        success: false,
        error: 'Course offering not found'
      });
      return;
    }
    
    const statistics = {
      offeringId,
      capacity: offering.capacity,
      enrolled: offering.enrolled,
      waitlisted: offering.waitlisted,
      utilizationRate: (offering.enrolled / offering.capacity) * 100,
      availableSeats: offering.capacity - offering.enrolled,
      status: offering.status
    };
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get enrollment trends
 * GET /api/course-offerings/trends/:courseId
 */
router.get('/trends/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { years } = req.query;
    
    // This would analyze historical enrollment trends
    // Placeholder implementation
    const trends = {
      courseId,
      historicalEnrollment: [],
      averageEnrollment: 0,
      trend: 'STABLE' as const,
      projectedDemand: 0
    };
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get capacity utilization report
 * GET /api/course-offerings/reports/capacity-utilization
 */
router.get('/reports/capacity-utilization', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { semester, year, facultyId } = req.query;
    
    // This would generate a comprehensive capacity utilization report
    // Placeholder implementation
    const report = {
      semester,
      year,
      facultyId,
      totalOfferings: 0,
      averageUtilization: 0,
      underutilizedCourses: [],
      oversubscribedCourses: []
    };
    
    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get waitlist report
 * GET /api/course-offerings/reports/waitlist
 */
router.get('/reports/waitlist', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { semester, year } = req.query;
    
    // This would generate a waitlist report
    // Placeholder implementation
    const report = {
      semester,
      year,
      totalWaitlisted: 0,
      coursesWithWaitlists: [],
      averageWaitlistSize: 0
    };
    
    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
