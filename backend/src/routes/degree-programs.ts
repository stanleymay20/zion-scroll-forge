/**
 * ScrollUniversity Degree Program Routes
 * API endpoints for managing degree programs and student enrollments
 */

import express, { Request, Response } from 'express';
import DegreeProgramService from '../services/DegreeProgramService';
import { DegreeType } from '@prisma/client';

const router = express.Router();
const degreeProgramService = new DegreeProgramService();

/**
 * GET /api/degree-programs
 * Get all degree programs with optional filters
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { degreeType, facultyId } = req.query;

    const programs = await degreeProgramService.getDegreePrograms(
      degreeType as DegreeType | undefined,
      facultyId as string | undefined
    );

    res.json({
      success: true,
      data: programs,
    });
  } catch (error) {
    console.error('Error fetching degree programs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch degree programs',
    });
  }
});

/**
 * GET /api/degree-programs/:id
 * Get degree program details
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const program = await degreeProgramService.getDegreeProgramDetails(id);

    res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error('Error fetching degree program:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch degree program',
    });
  }
});

/**
 * POST /api/degree-programs
 * Create a new degree program
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await degreeProgramService.createDegreeProgram(req.body);

    res.status(201).json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error('Error creating degree program:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create degree program',
    });
  }
});

/**
 * POST /api/degree-programs/:id/requirements
 * Add requirement to degree program
 */
router.post('/:id/requirements', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const requirement = await degreeProgramService.addDegreeRequirement({
      ...req.body,
      degreeProgramId: id,
    });

    res.status(201).json({
      success: true,
      data: requirement,
    });
  } catch (error) {
    console.error('Error adding degree requirement:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add degree requirement',
    });
  }
});

/**
 * POST /api/degree-programs/:id/enroll
 * Enroll student in degree program
 */
router.post('/:id/enroll', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, expectedGraduationDate } = req.body;

    const enrollment = await degreeProgramService.enrollInDegree({
      userId,
      degreeProgramId: id,
      expectedGraduationDate: expectedGraduationDate ? new Date(expectedGraduationDate) : undefined,
    });

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error('Error enrolling in degree:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enroll in degree',
    });
  }
});

/**
 * GET /api/degree-programs/student/:userId
 * Get student's degree enrollments
 */
router.get('/student/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const enrollments = await degreeProgramService.getStudentDegreeEnrollments(userId);

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch student enrollments',
    });
  }
});

/**
 * GET /api/degree-programs/:id/progress/:userId
 * Get student's progress in degree program
 */
router.get('/:id/progress/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;

    const progress = await degreeProgramService.getDegreeProgress(userId, id);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error fetching degree progress:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch degree progress',
    });
  }
});

/**
 * POST /api/degree-programs/update-progress
 * Update degree progress when course is completed
 */
router.post('/update-progress', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, courseId, grade, credits } = req.body;

    await degreeProgramService.updateProgressOnCourseCompletion(
      userId,
      courseId,
      grade,
      credits
    );

    res.json({
      success: true,
      message: 'Degree progress updated successfully',
    });
  } catch (error) {
    console.error('Error updating degree progress:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update degree progress',
    });
  }
});

export default router;
