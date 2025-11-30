/**
 * Academic Calendar API Routes
 * Part of: Scroll University Academic Year Automation System (SU-AYAS)
 * Purpose: RESTful API endpoints for academic calendar management
 * 
 * Endpoints:
 * - POST /api/academic-calendar/years - Create academic year
 * - GET /api/academic-calendar/years - List all academic years
 * - GET /api/academic-calendar/years/:id - Get academic year details
 * - POST /api/academic-calendar/semesters - Create semester
 * - GET /api/academic-calendar/semesters/:academicYearId - Get semesters for academic year
 * - GET /api/academic-calendar/deadlines - Get upcoming deadlines
 * - POST /api/academic-calendar/events - Schedule event
 * - GET /api/academic-calendar/events/:academicYearId - Get events for academic year
 * - GET /api/academic-calendar/health - Health check
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import express, { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import AcademicCalendarService from '../services/academic-year/AcademicCalendarService';
import EventSchedulerService from '../services/academic-year/EventSchedulerService';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/productionLogger';
import {
  CreateAcademicYearParams,
  CreateAcademicEventParams,
  CalendarType
} from '../types/academic-year.types';

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const router = express.Router();
const academicCalendarService = new AcademicCalendarService();
const eventSchedulerService = new EventSchedulerService();

// Constants
const DEFAULT_DAYS_AHEAD = 30;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const createAcademicYearSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
    .messages({
      'string.empty': 'Academic year name is required',
      'string.min': 'Academic year name must be at least 3 characters',
      'string.max': 'Academic year name must not exceed 100 characters'
    }),
  startDate: Joi.date().iso().required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required'
    }),
  calendarType: Joi.string().valid('semester', 'trimester', 'quarter', 'custom').required()
    .messages({
      'any.only': 'Calendar type must be one of: semester, trimester, quarter, custom',
      'any.required': 'Calendar type is required'
    }),
  isActive: Joi.boolean().optional()
});

const generateSemesterSchema = Joi.object({
  academicYearId: Joi.string().uuid().required()
    .messages({
      'string.guid': 'Academic year ID must be a valid UUID',
      'any.required': 'Academic year ID is required'
    }),
  calendarType: Joi.string().valid('semester', 'trimester', 'quarter', 'custom').required()
    .messages({
      'any.only': 'Calendar type must be one of: semester, trimester, quarter, custom',
      'any.required': 'Calendar type is required'
    })
});

const scheduleEventSchema = Joi.object({
  academicYearId: Joi.string().uuid().required()
    .messages({
      'string.guid': 'Academic year ID must be a valid UUID',
      'any.required': 'Academic year ID is required'
    }),
  semesterId: Joi.string().uuid().optional()
    .messages({
      'string.guid': 'Semester ID must be a valid UUID'
    }),
  eventType: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Event type is required',
      'any.required': 'Event type is required'
    }),
  name: Joi.string().min(3).max(200).required()
    .messages({
      'string.empty': 'Event name is required',
      'string.min': 'Event name must be at least 3 characters',
      'any.required': 'Event name is required'
    }),
  description: Joi.string().max(1000).optional(),
  startDate: Joi.date().iso().required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be on or after start date'
    }),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
    .messages({
      'string.pattern.base': 'Start time must be in HH:MM format (24-hour)'
    }),
  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
    .messages({
      'string.pattern.base': 'End time must be in HH:MM format (24-hour)'
    }),
  location: Joi.string().max(200).optional(),
  isHoliday: Joi.boolean().optional(),
  affectsClasses: Joi.boolean().optional(),
  isRecurring: Joi.boolean().optional(),
  recurrencePattern: Joi.object().optional()
});

const getDeadlinesSchema = Joi.object({
  entityType: Joi.string().required()
    .messages({
      'any.required': 'Entity type is required'
    }),
  entityId: Joi.string().required()
    .messages({
      'any.required': 'Entity ID is required'
    }),
  daysAhead: Joi.number().integer().min(1).max(365).optional()
    .messages({
      'number.base': 'Days ahead must be a number',
      'number.min': 'Days ahead must be at least 1',
      'number.max': 'Days ahead must not exceed 365'
    })
});

// =====================================================
// API ENDPOINTS
// =====================================================

/**
 * POST /api/academic-calendar/years
 * Create a new academic year
 * 
 * Requirements: 1.1, 1.2
 */
router.post('/years', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = createAcademicYearSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
      return;
    }

    const params: CreateAcademicYearParams = {
      name: value.name,
      startDate: new Date(value.startDate),
      endDate: new Date(value.endDate),
      calendarType: value.calendarType as CalendarType,
      isActive: value.isActive
    };

    const result = await academicCalendarService.createAcademicYear(params);

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    logger.info('Academic year created', {
      academicYearId: result.data?.id,
      name: result.data?.name,
      userId: req.user?.id
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating academic year', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id
    });
    next(error);
  }
});

/**
 * GET /api/academic-calendar/years
 * List all academic years
 * 
 * Requirements: 1.1
 */
router.get('/years', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await academicCalendarService.getAllAcademicYears();

    if (!result.success) {
      res.status(500).json(result);
      return;
    }

    res.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0
    });
  } catch (error) {
    logger.error('Error listing academic years', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id
    });
    next(error);
  }
});

/**
 * GET /api/academic-calendar/years/:id
 * Get academic year details by ID
 * 
 * Requirements: 1.1
 */
router.get('/years/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid academic year ID format'
      });
      return;
    }

    const result = await academicCalendarService.getAcademicYearById(id);

    if (!result.success) {
      res.status(404).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    logger.error('Error fetching academic year', {
      error: error instanceof Error ? error.message : 'Unknown error',
      academicYearId: req.params.id,
      userId: req.user?.id
    });
    next(error);
  }
});

/**
 * POST /api/academic-calendar/semesters
 * Generate semester schedule for an academic year
 * 
 * Requirements: 1.1, 1.2
 */
router.post('/semesters', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = generateSemesterSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
      return;
    }

    const result = await academicCalendarService.generateSemesterSchedule(
      value.academicYearId,
      value.calendarType as CalendarType
    );

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    logger.info('Semester schedule generated', {
      academicYearId: value.academicYearId,
      calendarType: value.calendarType,
      semesterCount: result.data?.length,
      userId: req.user?.id
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error generating semester schedule', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id
    });
    next(error);
  }
});

/**
 * GET /api/academic-calendar/semesters/:academicYearId
 * Get all semesters for an academic year
 * 
 * Requirements: 1.1
 */
router.get('/semesters/:academicYearId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { academicYearId } = req.params;

    if (!UUID_REGEX.test(academicYearId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid academic year ID format'
      });
      return;
    }

    const result = await academicCalendarService.getSemestersByAcademicYear(academicYearId);

    if (!result.success) {
      res.status(500).json(result);
      return;
    }

    res.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0
    });
  } catch (error) {
    logger.error('Error fetching semesters', {
      error: error instanceof Error ? error.message : 'Unknown error',
      academicYearId: req.params.academicYearId,
      userId: req.user?.id
    });
    next(error);
  }
});

/**
 * GET /api/academic-calendar/deadlines
 * Get upcoming deadlines for an entity
 * 
 * Requirements: 1.3, 1.4
 */
router.get('/deadlines', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = getDeadlinesSchema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
      return;
    }

    const { entityType, entityId, daysAhead } = value;

    const result = await academicCalendarService.getUpcomingDeadlines(
      entityType,
      entityId,
      daysAhead || DEFAULT_DAYS_AHEAD
    );

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    logger.error('Error fetching deadlines', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id
    });
    next(error);
  }
});

/**
 * POST /api/academic-calendar/events
 * Schedule a new academic event
 * 
 * Requirements: 1.3, 1.4
 */
router.post('/events', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error, value } = scheduleEventSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
      return;
    }

    const params: CreateAcademicEventParams = {
      academicYearId: value.academicYearId,
      semesterId: value.semesterId,
      eventType: value.eventType,
      name: value.name,
      description: value.description,
      startDate: new Date(value.startDate),
      endDate: value.endDate ? new Date(value.endDate) : undefined,
      startTime: value.startTime,
      endTime: value.endTime,
      location: value.location,
      isHoliday: value.isHoliday,
      affectsClasses: value.affectsClasses,
      isRecurring: value.isRecurring,
      recurrencePattern: value.recurrencePattern
    };

    const result = await eventSchedulerService.scheduleEvent(params);

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    logger.info('Academic event scheduled', {
      eventId: result.data?.id,
      eventName: result.data?.name,
      eventType: result.data?.eventType,
      userId: req.user?.id
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error scheduling event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id
    });
    next(error);
  }
});

/**
 * GET /api/academic-calendar/events/:academicYearId
 * Get all events for an academic year
 * 
 * Requirements: 1.3
 */
router.get('/events/:academicYearId', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { academicYearId } = req.params;

    if (!UUID_REGEX.test(academicYearId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid academic year ID format'
      });
      return;
    }

    const result = await eventSchedulerService.getEventsByAcademicYear(academicYearId);

    if (!result.success) {
      res.status(500).json(result);
      return;
    }

    res.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0
    });
  } catch (error) {
    logger.error('Error fetching events', {
      error: error instanceof Error ? error.message : 'Unknown error',
      academicYearId: req.params.academicYearId,
      userId: req.user?.id
    });
    next(error);
  }
});

/**
 * GET /api/academic-calendar/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Academic Calendar API is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
