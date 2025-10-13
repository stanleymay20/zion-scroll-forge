import { PrismaClient } from '@prisma/client';
import { ScrollField, CourseLevel, CourseStatus, ValidationResult, ValidationError } from '../types/index';

// Course interfaces based on ScrollCourseSpec design document
export interface CourseData {
  course_id?: string;
  title: string;
  description: string;
  scroll_field: ScrollField;
  difficulty_level: 'basic' | 'intermediate' | 'advanced';
  xp_multiplier: number;
  prerequisites?: string[];
  learning_objectives: string[];
  estimated_hours: number;
  lectures?: LectureData[];
  assessments?: AssessmentData[];
  gpt_tutor_enabled: boolean;
  final_project_required: boolean;
  status: CourseStatus;
  created_by: string;
}

export interface LectureData {
  lecture_id?: string;
  title: string;
  video_url?: string;
  transcript_md?: string;
  resources?: string[];
  xp_reward: number;
  order: number;
}

export interface AssessmentData {
  assessment_id?: string;
  type: 'quiz' | 'project' | 'peer_review' | 'practical';
  title: string;
  instructions: string;
  passing_score: number;
  xp_reward: number;
  required: boolean;
}

export class CourseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create a new course with comprehensive validation
   * Requirements: 1.1, 1.4, 1.5
   */
  async createCourse(courseData: CourseData): Promise<CourseData> {
    // Validate required fields and constraints
    const validation = await this.validateCourseData(courseData);
    if (!validation.isValid) {
      throw new Error(`Course validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    // Validate prerequisites if provided
    if (courseData.prerequisites && courseData.prerequisites.length > 0) {
      await this.validatePrerequisites(courseData.prerequisites);
    }

    // Set XP multiplier based on difficulty level
    const xpMultiplier = this.calculateXPMultiplier(courseData.difficulty_level);

    // For now, we'll store course data in a structured format
    // This would integrate with the actual Prisma schema once it's updated
    const course: CourseData = {
      course_id: this.generateUUID(),
      ...courseData,
      xp_multiplier: xpMultiplier,
      status: CourseStatus.Draft,
      lectures: courseData.lectures || [],
      assessments: courseData.assessments || []
    };

    // In a real implementation, this would use Prisma to save to database
    // For now, we'll return the structured course data
    return course;
  }

  /**
   * Retrieve a course by ID with all related data
   * Requirements: 1.1
   */
  async getCourseById(courseId: string): Promise<CourseData | null> {
    if (!courseId || !this.isValidUUID(courseId)) {
      throw new Error('Invalid course ID provided');
    }

    // In a real implementation, this would query the database
    // For now, we'll return null to indicate course not found
    // This would be: return await this.prisma.course.findUnique({ where: { course_id: courseId }, include: { lectures: true, assessments: true } });
    return null;
  }

  /**
   * Retrieve all courses with optional filtering
   * Requirements: 1.1
   */
  async getAllCourses(filters?: {
    scroll_field?: ScrollField;
    difficulty_level?: 'basic' | 'intermediate' | 'advanced';
    status?: CourseStatus;
  }): Promise<CourseData[]> {
    // Validate filter parameters
    if (filters?.scroll_field && !Object.values(ScrollField).includes(filters.scroll_field)) {
      throw new Error('Invalid scroll_field filter value');
    }

    if (filters?.difficulty_level && !['basic', 'intermediate', 'advanced'].includes(filters.difficulty_level)) {
      throw new Error('Invalid difficulty_level filter value');
    }

    if (filters?.status && !Object.values(CourseStatus).includes(filters.status)) {
      throw new Error('Invalid status filter value');
    }

    // In a real implementation, this would query the database with filters
    // For now, we'll return an empty array
    // This would be: return await this.prisma.course.findMany({ where: filters, include: { lectures: true, assessments: true }, orderBy: { created_at: 'desc' } });
    return [];
  }

  /**
   * Update an existing course with validation
   * Requirements: 1.1, 1.4, 1.5
   */
  async updateCourse(courseId: string, updateData: Partial<CourseData>): Promise<CourseData> {
    if (!courseId || !this.isValidUUID(courseId)) {
      throw new Error('Invalid course ID provided');
    }

    const existingCourse = await this.getCourseById(courseId);
    if (!existingCourse) {
      throw new Error('Course not found');
    }

    // Merge existing data with updates for validation
    const mergedData = { ...existingCourse, ...updateData };

    // Validate update data if core fields are being changed
    if (updateData.title || updateData.description || updateData.learning_objectives || updateData.scroll_field) {
      const validation = await this.validateCourseData(mergedData);
      if (!validation.isValid) {
        throw new Error(`Course validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }
    }

    // Validate prerequisites if being updated
    if (updateData.prerequisites) {
      await this.validatePrerequisites(updateData.prerequisites);
    }

    // Update XP multiplier if difficulty level is being changed
    if (updateData.difficulty_level) {
      updateData.xp_multiplier = this.calculateXPMultiplier(updateData.difficulty_level);
    }

    // In a real implementation, this would update the database
    // For now, we'll return the merged data
    // This would be: return await this.prisma.course.update({ where: { course_id: courseId }, data: updateData, include: { lectures: true, assessments: true } });
    return mergedData;
  }

  /**
   * Delete a course with safety checks
   * Requirements: 1.1
   */
  async deleteCourse(courseId: string): Promise<void> {
    if (!courseId || !this.isValidUUID(courseId)) {
      throw new Error('Invalid course ID provided');
    }

    const course = await this.getCourseById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if course has active enrollments
    const hasActiveEnrollments = await this.checkActiveEnrollments(courseId);
    if (hasActiveEnrollments) {
      throw new Error('Cannot delete course with active enrollments');
    }

    // In a real implementation, this would delete from database
    // This would be: await this.prisma.course.delete({ where: { course_id: courseId } });
  }

  /**
   * Publish a course after validation
   * Requirements: 1.1, 1.4
   */
  async publishCourse(courseId: string): Promise<CourseData> {
    const course = await this.getCourseById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Validate course is ready for publishing
    await this.validateCourseForPublishing(course);

    return await this.updateCourse(courseId, { status: CourseStatus.Published });
  }

  /**
   * Archive a course
   * Requirements: 1.1
   */
  async archiveCourse(courseId: string): Promise<CourseData> {
    return await this.updateCourse(courseId, { status: CourseStatus.Archived });
  }

  /**
   * Comprehensive course data validation
   * Requirements: 1.1, 1.4, 1.5
   */
  private async validateCourseData(courseData: Partial<CourseData>): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Required field validation (Requirement 1.1)
    if (!courseData.title || courseData.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Course title is required',
        code: 'REQUIRED_FIELD'
      });
    } else if (courseData.title.length > 255) {
      errors.push({
        field: 'title',
        message: 'Course title must be 255 characters or less',
        code: 'FIELD_TOO_LONG'
      });
    }

    if (!courseData.description || courseData.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Course description is required',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!courseData.scroll_field) {
      errors.push({
        field: 'scroll_field',
        message: 'Scroll field is required',
        code: 'REQUIRED_FIELD'
      });
    } else if (!Object.values(ScrollField).includes(courseData.scroll_field)) {
      errors.push({
        field: 'scroll_field',
        message: 'Invalid scroll field',
        value: courseData.scroll_field,
        code: 'INVALID_ENUM_VALUE'
      });
    }

    if (!courseData.learning_objectives || courseData.learning_objectives.length === 0) {
      errors.push({
        field: 'learning_objectives',
        message: 'Learning objectives are required',
        code: 'REQUIRED_FIELD'
      });
    }

    // Difficulty level validation (Requirement 1.5)
    if (courseData.difficulty_level) {
      const validDifficultyLevels = ['basic', 'intermediate', 'advanced'];
      if (!validDifficultyLevels.includes(courseData.difficulty_level)) {
        errors.push({
          field: 'difficulty_level',
          message: 'Invalid difficulty level. Must be basic, intermediate, or advanced',
          value: courseData.difficulty_level,
          code: 'INVALID_ENUM_VALUE'
        });
      }
    }

    // XP multiplier validation (Requirement 1.5)
    if (courseData.xp_multiplier !== undefined) {
      if (courseData.xp_multiplier < 0.5 || courseData.xp_multiplier > 5.0) {
        errors.push({
          field: 'xp_multiplier',
          message: 'XP multiplier must be between 0.5 and 5.0',
          value: courseData.xp_multiplier,
          code: 'VALUE_OUT_OF_RANGE'
        });
      }
    }

    // Estimated hours validation
    if (courseData.estimated_hours !== undefined && courseData.estimated_hours < 0) {
      errors.push({
        field: 'estimated_hours',
        message: 'Estimated hours must be a positive number',
        value: courseData.estimated_hours,
        code: 'INVALID_VALUE'
      });
    }

    // Created by validation
    if (courseData.created_by && !this.isValidUUID(courseData.created_by)) {
      errors.push({
        field: 'created_by',
        message: 'Invalid creator ID format',
        value: courseData.created_by,
        code: 'INVALID_UUID'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate prerequisite courses exist and are published
   * Requirements: 1.4
   */
  private async validatePrerequisites(prerequisites: string[]): Promise<void> {
    for (const prerequisiteId of prerequisites) {
      if (!this.isValidUUID(prerequisiteId)) {
        throw new Error(`Invalid prerequisite course ID format: ${prerequisiteId}`);
      }

      // In a real implementation, this would check the database
      // const prerequisiteCourse = await this.prisma.course.findUnique({
      //   where: { course_id: prerequisiteId, status: CourseStatus.Published }
      // });
      // 
      // if (!prerequisiteCourse) {
      //   throw new Error(`Prerequisite course ${prerequisiteId} not found or not published`);
      // }

      // For now, we'll assume prerequisites are valid
      // This validation would be implemented when the database schema is updated
    }
  }

  /**
   * Validate course is ready for publishing
   * Requirements: 1.1, 1.4
   */
  private async validateCourseForPublishing(course: CourseData): Promise<void> {
    // Check if course has at least one lecture (Requirement 1.2)
    if (!course.lectures || course.lectures.length === 0) {
      throw new Error('Course must have at least one lecture before publishing');
    }

    // Check if course has at least one assessment (Requirement 1.2)
    if (!course.assessments || course.assessments.length === 0) {
      throw new Error('Course must have at least one assessment before publishing');
    }

    // Validate all lectures have required content (Requirement 1.2)
    for (const lecture of course.lectures) {
      if (!lecture.title || lecture.title.trim().length === 0) {
        throw new Error('All lectures must have a title');
      }

      if (!lecture.video_url && !lecture.transcript_md) {
        throw new Error('All lectures must have either video or transcript content');
      }

      if (lecture.xp_reward < 0) {
        throw new Error('Lecture XP reward must be a positive number');
      }

      if (lecture.order < 0) {
        throw new Error('Lecture order must be a positive number');
      }
    }

    // Validate all assessments have required content (Requirement 1.2)
    for (const assessment of course.assessments) {
      if (!assessment.title || assessment.title.trim().length === 0) {
        throw new Error('All assessments must have a title');
      }

      if (!assessment.instructions || assessment.instructions.trim().length === 0) {
        throw new Error('All assessments must have instructions');
      }

      if (assessment.passing_score < 0 || assessment.passing_score > 100) {
        throw new Error('Assessment passing score must be between 0 and 100');
      }

      if (assessment.xp_reward < 0) {
        throw new Error('Assessment XP reward must be a positive number');
      }

      const validTypes = ['quiz', 'project', 'peer_review', 'practical'];
      if (!validTypes.includes(assessment.type)) {
        throw new Error('Invalid assessment type');
      }
    }

    // Validate learning objectives are comprehensive
    if (course.learning_objectives.length < 2) {
      throw new Error('Course must have at least 2 learning objectives before publishing');
    }
  }

  /**
   * Get courses by scroll field
   * Requirements: 1.1
   */
  async getCoursesByScrollField(scrollField: ScrollField): Promise<CourseData[]> {
    return await this.getAllCourses({ scroll_field: scrollField, status: CourseStatus.Published });
  }

  /**
   * Get courses by difficulty level
   * Requirements: 1.1, 1.5
   */
  async getCoursesByDifficulty(difficultyLevel: 'basic' | 'intermediate' | 'advanced'): Promise<CourseData[]> {
    return await this.getAllCourses({ difficulty_level: difficultyLevel, status: CourseStatus.Published });
  }

  /**
   * Search courses by title or description
   * Requirements: 1.1
   */
  async searchCourses(searchTerm: string): Promise<CourseData[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('Search term is required');
    }

    // In a real implementation, this would search the database
    // For now, we'll return an empty array
    // This would be: return await this.prisma.course.findMany({
    //   where: {
    //     status: CourseStatus.Published,
    //     OR: [
    //       { title: { contains: searchTerm, mode: 'insensitive' } },
    //       { description: { contains: searchTerm, mode: 'insensitive' } }
    //     ]
    //   },
    //   include: { lectures: true, assessments: true },
    //   orderBy: { created_at: 'desc' }
    // });
    return [];
  }

  /**
   * Calculate XP multiplier based on difficulty level
   * Requirements: 1.5
   */
  private calculateXPMultiplier(difficultyLevel: 'basic' | 'intermediate' | 'advanced'): number {
    switch (difficultyLevel) {
      case 'basic':
        return 1.0;
      case 'intermediate':
        return 1.5;
      case 'advanced':
        return 2.0;
      default:
        return 1.0;
    }
  }

  /**
   * Check if course has active enrollments
   */
  private async checkActiveEnrollments(courseId: string): Promise<boolean> {
    // In a real implementation, this would check the database
    // For now, we'll return false
    // This would be: const count = await this.prisma.enrollment.count({
    //   where: { courseId, status: 'active' }
    // });
    // return count > 0;
    return false;
  }

  /**
   * Generate UUID for new courses
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validate UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Cleanup resources
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}