/**
 * Master Course Catalog Service
 * Comprehensive service for managing the Supreme Scroll Faculty course catalog
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import {
  SupremeScrollFaculty,
  CourseLevel,
  CourseStatus,
  CourseMetadata,
  CourseSearchCriteria,
  StudentProfile,
  CatalogStatistics,
  CourseGenerationRequest
} from '../types/curriculum-grid';

export class MasterCourseCatalogService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all Supreme Scroll Faculties
   */
  getAllFaculties(): SupremeScrollFaculty[] {
    return Object.values(SupremeScrollFaculty);
  }

  /**
   * Get catalog statistics
   */
  async getCatalogStatistics(): Promise<CatalogStatistics> {
    try {
      const courses = await this.prisma.course.findMany({
        select: {
          faculty: true,
          level: true,
          status: true,
          credits: true
        }
      });

      const totalCourses = courses.length;
      const coursesByFaculty: Record<string, number> = {};
      const coursesByLevel: Record<string, number> = {};
      const coursesByStatus: Record<string, number> = {};
      let totalCredits = 0;

      courses.forEach(course => {
        // Count by faculty
        coursesByFaculty[course.faculty] = (coursesByFaculty[course.faculty] || 0) + 1;
        
        // Count by level
        coursesByLevel[course.level] = (coursesByLevel[course.level] || 0) + 1;
        
        // Count by status
        coursesByStatus[course.status] = (coursesByStatus[course.status] || 0) + 1;
        
        // Sum credits
        totalCredits += course.credits || 0;
      });

      return {
        totalCourses,
        coursesByFaculty: coursesByFaculty as Record<SupremeScrollFaculty, number>,
        coursesByLevel: coursesByLevel as Record<CourseLevel, number>,
        coursesByStatus: coursesByStatus as Record<CourseStatus, number>,
        averageCredits: totalCourses > 0 ? totalCredits / totalCourses : 0,
        totalCreditsAvailable: totalCredits
      };
    } catch (error) {
      logger.error('Failed to get catalog statistics', { error });
      throw new Error('Failed to retrieve catalog statistics');
    }
  }

  /**
   * Search courses with advanced filtering
   */
  async searchCourses(
    criteria: CourseSearchCriteria,
    studentProfile?: StudentProfile
  ): Promise<CourseMetadata[]> {
    try {
      const whereClause: any = {
        AND: []
      };

      // Text search
      if (criteria.query) {
        whereClause.AND.push({
          OR: [
            { title: { contains: criteria.query, mode: 'insensitive' } },
            { description: { contains: criteria.query, mode: 'insensitive' } },
            { code: { contains: criteria.query, mode: 'insensitive' } }
          ]
        });
      }

      // Faculty filter
      if (criteria.faculty && criteria.faculty.length > 0) {
        whereClause.AND.push({
          faculty: { in: criteria.faculty }
        });
      }

      // Level filter
      if (criteria.level && criteria.level.length > 0) {
        whereClause.AND.push({
          level: { in: criteria.level }
        });
      }

      // Status filter
      if (criteria.status && criteria.status.length > 0) {
        whereClause.AND.push({
          status: { in: criteria.status }
        });
      }

      // Credits filter
      if (criteria.minCredits !== undefined || criteria.maxCredits !== undefined) {
        const creditsFilter: any = {};
        if (criteria.minCredits !== undefined) {
          creditsFilter.gte = criteria.minCredits;
        }
        if (criteria.maxCredits !== undefined) {
          creditsFilter.lte = criteria.maxCredits;
        }
        whereClause.AND.push({ credits: creditsFilter });
      }

      const courses = await this.prisma.course.findMany({
        where: whereClause.AND.length > 0 ? whereClause : {},
        include: {
          prerequisites: true,
          learningOutcomes: true
        },
        orderBy: { title: 'asc' }
      });

      return courses.map(course => this.mapCourseToMetadata(course));
    } catch (error) {
      logger.error('Failed to search courses', { error, criteria });
      throw new Error('Failed to search courses');
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(id: string): Promise<CourseMetadata | null> {
    try {
      const course = await this.prisma.course.findUnique({
        where: { id },
        include: {
          prerequisites: true,
          learningOutcomes: true
        }
      });

      if (!course) {
        return null;
      }

      return this.mapCourseToMetadata(course);
    } catch (error) {
      logger.error('Failed to get course by ID', { error, id });
      throw new Error('Failed to retrieve course');
    }
  }

  /**
   * Add a new course
   */
  async addCourse(courseData: Partial<CourseMetadata>): Promise<CourseMetadata> {
    try {
      const course = await this.prisma.course.create({
        data: {
          code: courseData.code || '',
          title: courseData.title || '',
          description: courseData.description || '',
          faculty: courseData.faculty || SupremeScrollFaculty.BIBLICAL_STUDIES,
          level: courseData.level || CourseLevel.FOUNDATION,
          status: courseData.status || CourseStatus.DRAFT,
          credits: courseData.credits || 3,
          duration: courseData.duration || 8,
          category: courseData.faculty || SupremeScrollFaculty.BIBLICAL_STUDIES
        },
        include: {
          prerequisites: true,
          learningOutcomes: true
        }
      });

      logger.info('Course created', { courseId: course.id, title: course.title });
      return this.mapCourseToMetadata(course);
    } catch (error) {
      logger.error('Failed to create course', { error, courseData });
      throw new Error('Failed to create course');
    }
  }

  /**
   * Update a course
   */
  async updateCourse(id: string, updates: Partial<CourseMetadata>): Promise<CourseMetadata> {
    try {
      const course = await this.prisma.course.update({
        where: { id },
        data: {
          code: updates.code,
          title: updates.title,
          description: updates.description,
          faculty: updates.faculty,
          level: updates.level,
          status: updates.status,
          credits: updates.credits,
          duration: updates.duration
        },
        include: {
          prerequisites: true,
          learningOutcomes: true
        }
      });

      logger.info('Course updated', { courseId: id });
      return this.mapCourseToMetadata(course);
    } catch (error) {
      logger.error('Failed to update course', { error, id, updates });
      throw new Error('Failed to update course');
    }
  }

  /**
   * Delete a course
   */
  async deleteCourse(id: string): Promise<void> {
    try {
      await this.prisma.course.delete({
        where: { id }
      });

      logger.info('Course deleted', { courseId: id });
    } catch (error) {
      logger.error('Failed to delete course', { error, id });
      throw new Error('Failed to delete course');
    }
  }

  /**
   * Get courses by faculty
   */
  async getCoursesByFaculty(faculty: SupremeScrollFaculty): Promise<CourseMetadata[]> {
    try {
      const courses = await this.prisma.course.findMany({
        where: { faculty },
        include: {
          prerequisites: true,
          learningOutcomes: true
        },
        orderBy: { title: 'asc' }
      });

      return courses.map(course => this.mapCourseToMetadata(course));
    } catch (error) {
      logger.error('Failed to get courses by faculty', { error, faculty });
      throw new Error('Failed to retrieve faculty courses');
    }
  }

  /**
   * Generate a new course dynamically
   */
  async generateCourse(request: CourseGenerationRequest): Promise<CourseMetadata> {
    try {
      // Generate course code
      const facultyCode = this.getFacultyCode(request.faculty);
      const levelCode = this.getLevelCode(request.level);
      const randomNum = Math.floor(Math.random() * 900) + 100;
      const code = `${facultyCode}${levelCode}${randomNum}`;

      // Create course
      const courseData: Partial<CourseMetadata> = {
        code,
        title: request.topic,
        description: `A comprehensive ${request.level} course in ${request.topic} within the ${request.faculty} faculty.`,
        faculty: request.faculty,
        level: request.level,
        status: CourseStatus.DRAFT,
        credits: request.credits,
        duration: request.duration,
        prerequisites: request.prerequisites || [],
        learningOutcomes: [
          `Understand core concepts of ${request.topic}`,
          `Apply ${request.topic} principles in real-world contexts`,
          `Integrate ${request.topic} with spiritual formation`,
          `Demonstrate mastery of ${request.topic} skills`
        ],
        spiritualAlignment: {
          biblicalFoundation: ['Scripture-based learning'],
          spiritualObjectives: ['Spiritual growth through academic excellence'],
          characterDevelopment: ['Christ-like character formation'],
          ministryApplication: ['Practical ministry skills'],
          kingdomImpact: ['Kingdom advancement through education']
        }
      };

      return await this.addCourse(courseData);
    } catch (error) {
      logger.error('Failed to generate course', { error, request });
      throw new Error('Failed to generate course');
    }
  }

  /**
   * Get student profile
   */
  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          enrollments: {
            where: {
              OR: [
                { status: 'COMPLETED' },
                { status: 'ACTIVE' }
              ]
            },
            include: {
              course: true
            }
          }
        }
      });

      if (!user) {
        return null;
      }

      const completedCourses = user.enrollments
        .filter(e => e.status === 'COMPLETED')
        .map(e => e.courseId);

      const currentEnrollments = user.enrollments
        .filter(e => e.status === 'ACTIVE')
        .map(e => e.courseId);

      return {
        userId: user.id,
        completedCourses,
        currentEnrollments,
        interests: [],
        spiritualGifts: [],
        careerGoals: []
      };
    } catch (error) {
      logger.error('Failed to get student profile', { error, userId });
      throw new Error('Failed to retrieve student profile');
    }
  }

  /**
   * Initialize database faculties
   */
  async initializeDatabaseFaculties(): Promise<void> {
    try {
      const faculties = this.getAllFaculties();
      
      logger.info('Initializing database faculties', { count: faculties.length });
      
      // This would create faculty records if needed
      // For now, just log the initialization
      
      logger.info('Database faculties initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database faculties', { error });
      throw new Error('Failed to initialize database faculties');
    }
  }

  /**
   * Helper: Map Prisma course to CourseMetadata
   */
  private mapCourseToMetadata(course: any): CourseMetadata {
    return {
      id: course.id,
      code: course.code || '',
      title: course.title,
      description: course.description,
      faculty: course.faculty as SupremeScrollFaculty,
      level: course.level as CourseLevel,
      status: course.status as CourseStatus,
      credits: course.credits || 3,
      duration: course.duration || 8,
      prerequisites: course.prerequisites?.map((p: any) => p.prerequisiteId) || [],
      learningOutcomes: course.learningOutcomes?.map((lo: any) => lo.outcome) || [],
      spiritualAlignment: {
        biblicalFoundation: [],
        spiritualObjectives: [],
        characterDevelopment: [],
        ministryApplication: [],
        kingdomImpact: []
      },
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
  }

  /**
   * Helper: Get faculty code
   */
  private getFacultyCode(faculty: SupremeScrollFaculty): string {
    const codes: Record<SupremeScrollFaculty, string> = {
      [SupremeScrollFaculty.SACRED_AI_ENGINEERING]: 'SAI',
      [SupremeScrollFaculty.PROPHETIC_INTELLIGENCE]: 'PIN',
      [SupremeScrollFaculty.KINGDOM_ECONOMICS]: 'KEC',
      [SupremeScrollFaculty.DIVINE_GOVERNANCE]: 'DGV',
      [SupremeScrollFaculty.SPIRITUAL_FORMATION]: 'SPF',
      [SupremeScrollFaculty.BIBLICAL_STUDIES]: 'BIB',
      [SupremeScrollFaculty.WORSHIP_ARTS]: 'WOR',
      [SupremeScrollFaculty.MISSIONS_EVANGELISM]: 'MIS',
      [SupremeScrollFaculty.PASTORAL_MINISTRY]: 'PAS',
      [SupremeScrollFaculty.EDUCATION_PEDAGOGY]: 'EDU'
    };
    return codes[faculty] || 'GEN';
  }

  /**
   * Helper: Get level code
   */
  private getLevelCode(level: CourseLevel): string {
    const codes: Record<CourseLevel, string> = {
      [CourseLevel.FOUNDATION]: '1',
      [CourseLevel.INTERMEDIATE]: '2',
      [CourseLevel.ADVANCED]: '3',
      [CourseLevel.MASTERY]: '4'
    };
    return codes[level] || '1';
  }
}

export default MasterCourseCatalogService;
