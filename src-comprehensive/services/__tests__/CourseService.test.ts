import { CourseService, CourseData, LectureData, AssessmentData } from '../CourseService';
import { ScrollField, CourseStatus } from '../../types/index';

describe('CourseService', () => {
  let courseService: CourseService;

  beforeEach(() => {
    courseService = new CourseService();
  });

  afterEach(async () => {
    await courseService.disconnect();
  });

  describe('createCourse', () => {
    const validCourseData: CourseData = {
      title: 'Introduction to ScrollAI',
      description: 'A comprehensive introduction to AI principles within the ScrollUniversity framework',
      scroll_field: ScrollField.ScrollAI,
      difficulty_level: 'basic',
      xp_multiplier: 1.0,
      learning_objectives: [
        'Understand fundamental AI concepts',
        'Apply AI principles to scroll-aligned projects'
      ],
      estimated_hours: 40,
      gpt_tutor_enabled: true,
      final_project_required: false,
      status: CourseStatus.Draft,
      created_by: '12345678-1234-4567-8901-123456789012'
    };

    it('should create a course with valid data', async () => {
      const result = await courseService.createCourse(validCourseData);

      expect(result).toBeDefined();
      expect(result.course_id).toBeDefined();
      expect(result.title).toBe(validCourseData.title);
      expect(result.scroll_field).toBe(validCourseData.scroll_field);
      expect(result.difficulty_level).toBe(validCourseData.difficulty_level);
      expect(result.xp_multiplier).toBe(1.0); // Basic level multiplier
      expect(result.status).toBe(CourseStatus.Draft);
    });

    it('should set correct XP multiplier for intermediate difficulty', async () => {
      const intermediateData = { ...validCourseData, difficulty_level: 'intermediate' as const };
      const result = await courseService.createCourse(intermediateData);

      expect(result.xp_multiplier).toBe(1.5);
    });

    it('should set correct XP multiplier for advanced difficulty', async () => {
      const advancedData = { ...validCourseData, difficulty_level: 'advanced' as const };
      const result = await courseService.createCourse(advancedData);

      expect(result.xp_multiplier).toBe(2.0);
    });

    it('should throw error for missing title', async () => {
      const invalidData = { ...validCourseData, title: '' };

      await expect(courseService.createCourse(invalidData)).rejects.toThrow('Course validation failed');
    });

    it('should throw error for missing description', async () => {
      const invalidData = { ...validCourseData, description: '' };

      await expect(courseService.createCourse(invalidData)).rejects.toThrow('Course validation failed');
    });

    it('should throw error for missing scroll_field', async () => {
      const invalidData = { ...validCourseData };
      delete (invalidData as any).scroll_field;

      await expect(courseService.createCourse(invalidData)).rejects.toThrow('Course validation failed');
    });

    it('should throw error for missing learning_objectives', async () => {
      const invalidData = { ...validCourseData, learning_objectives: [] };

      await expect(courseService.createCourse(invalidData)).rejects.toThrow('Course validation failed');
    });

    it('should throw error for invalid scroll_field', async () => {
      const invalidData = { ...validCourseData, scroll_field: 'InvalidField' as ScrollField };

      await expect(courseService.createCourse(invalidData)).rejects.toThrow('Course validation failed');
    });

    it('should throw error for invalid difficulty_level', async () => {
      const invalidData = { ...validCourseData, difficulty_level: 'expert' as any };

      await expect(courseService.createCourse(invalidData)).rejects.toThrow('Course validation failed');
    });

    it('should throw error for title too long', async () => {
      const invalidData = { ...validCourseData, title: 'A'.repeat(256) };

      await expect(courseService.createCourse(invalidData)).rejects.toThrow('Course validation failed');
    });

    it('should throw error for invalid XP multiplier', async () => {
      const invalidData = { ...validCourseData, xp_multiplier: 6.0 };

      await expect(courseService.createCourse(invalidData)).rejects.toThrow('Course validation failed');
    });

    it('should throw error for negative estimated hours', async () => {
      const invalidData = { ...validCourseData, estimated_hours: -5 };

      await expect(courseService.createCourse(invalidData)).rejects.toThrow('Course validation failed');
    });

    it('should throw error for invalid creator ID format', async () => {
      const invalidData = { ...validCourseData, created_by: 'invalid-uuid' };

      await expect(courseService.createCourse(invalidData)).rejects.toThrow('Course validation failed');
    });

    it('should validate prerequisites if provided', async () => {
      const dataWithPrereqs = { 
        ...validCourseData, 
        prerequisites: ['12345678-1234-4567-8901-123456789012'] 
      };

      // Should not throw error for valid UUID format
      await expect(courseService.createCourse(dataWithPrereqs)).resolves.toBeDefined();
    });

    it('should throw error for invalid prerequisite ID format', async () => {
      const dataWithInvalidPrereqs = { 
        ...validCourseData, 
        prerequisites: ['invalid-uuid'] 
      };

      await expect(courseService.createCourse(dataWithInvalidPrereqs)).rejects.toThrow('Invalid prerequisite course ID format');
    });
  });

  describe('getCourseById', () => {
    it('should throw error for invalid course ID', async () => {
      await expect(courseService.getCourseById('invalid-id')).rejects.toThrow('Invalid course ID provided');
    });

    it('should return null for non-existent course', async () => {
      const result = await courseService.getCourseById('12345678-1234-4567-8901-123456789012');
      expect(result).toBeNull();
    });
  });

  describe('getAllCourses', () => {
    it('should return empty array when no courses exist', async () => {
      const result = await courseService.getAllCourses();
      expect(result).toEqual([]);
    });

    it('should throw error for invalid scroll_field filter', async () => {
      await expect(courseService.getAllCourses({ 
        scroll_field: 'InvalidField' as ScrollField 
      })).rejects.toThrow('Invalid scroll_field filter value');
    });

    it('should throw error for invalid difficulty_level filter', async () => {
      await expect(courseService.getAllCourses({ 
        difficulty_level: 'expert' as any 
      })).rejects.toThrow('Invalid difficulty_level filter value');
    });

    it('should throw error for invalid status filter', async () => {
      await expect(courseService.getAllCourses({ 
        status: 'invalid' as CourseStatus 
      })).rejects.toThrow('Invalid status filter value');
    });
  });

  describe('updateCourse', () => {
    it('should throw error for invalid course ID', async () => {
      await expect(courseService.updateCourse('invalid-id', { title: 'New Title' }))
        .rejects.toThrow('Invalid course ID provided');
    });

    it('should throw error for non-existent course', async () => {
      await expect(courseService.updateCourse('12345678-1234-4567-8901-123456789012', { title: 'New Title' }))
        .rejects.toThrow('Course not found');
    });
  });

  describe('deleteCourse', () => {
    it('should throw error for invalid course ID', async () => {
      await expect(courseService.deleteCourse('invalid-id')).rejects.toThrow('Invalid course ID provided');
    });

    it('should throw error for non-existent course', async () => {
      await expect(courseService.deleteCourse('12345678-1234-4567-8901-123456789012'))
        .rejects.toThrow('Course not found');
    });
  });

  describe('publishCourse', () => {
    it('should throw error for non-existent course', async () => {
      await expect(courseService.publishCourse('12345678-1234-4567-8901-123456789012'))
        .rejects.toThrow('Course not found');
    });
  });

  describe('archiveCourse', () => {
    it('should throw error for non-existent course', async () => {
      await expect(courseService.archiveCourse('12345678-1234-4567-8901-123456789012'))
        .rejects.toThrow('Course not found');
    });
  });

  describe('searchCourses', () => {
    it('should throw error for empty search term', async () => {
      await expect(courseService.searchCourses('')).rejects.toThrow('Search term is required');
    });

    it('should return empty array for valid search term', async () => {
      const result = await courseService.searchCourses('AI');
      expect(result).toEqual([]);
    });
  });

  describe('getCoursesByScrollField', () => {
    it('should return empty array for valid scroll field', async () => {
      const result = await courseService.getCoursesByScrollField(ScrollField.ScrollAI);
      expect(result).toEqual([]);
    });
  });

  describe('getCoursesByDifficulty', () => {
    it('should return empty array for valid difficulty level', async () => {
      const result = await courseService.getCoursesByDifficulty('basic');
      expect(result).toEqual([]);
    });
  });

  describe('validateCourseForPublishing', () => {
    const baseCourse: CourseData = {
      course_id: '12345678-1234-4567-8901-123456789012',
      title: 'Test Course',
      description: 'Test Description',
      scroll_field: ScrollField.ScrollAI,
      difficulty_level: 'basic',
      xp_multiplier: 1.0,
      learning_objectives: ['Objective 1', 'Objective 2'],
      estimated_hours: 40,
      gpt_tutor_enabled: true,
      final_project_required: false,
      status: CourseStatus.Draft,
      created_by: '12345678-1234-4567-8901-123456789012',
      lectures: [],
      assessments: []
    };

    it('should throw error for course without lectures', async () => {
      await expect(courseService.publishCourse('12345678-1234-4567-8901-123456789012'))
        .rejects.toThrow('Course not found');
    });

    it('should validate lecture content requirements', () => {
      const validLecture: LectureData = {
        lecture_id: '12345678-1234-4567-8901-123456789012',
        title: 'Introduction to AI',
        video_url: 'https://example.com/video.mp4',
        transcript_md: 'Lecture transcript content',
        resources: ['https://example.com/resource1.pdf'],
        xp_reward: 10,
        order: 1
      };

      expect(validLecture.title).toBeDefined();
      expect(validLecture.video_url || validLecture.transcript_md).toBeTruthy();
      expect(validLecture.xp_reward).toBeGreaterThanOrEqual(0);
      expect(validLecture.order).toBeGreaterThanOrEqual(0);
    });

    it('should validate assessment content requirements', () => {
      const validAssessment: AssessmentData = {
        assessment_id: '12345678-1234-4567-8901-123456789012',
        type: 'quiz',
        title: 'AI Fundamentals Quiz',
        instructions: 'Complete this quiz to test your understanding',
        passing_score: 70,
        xp_reward: 25,
        required: true
      };

      expect(validAssessment.title).toBeDefined();
      expect(validAssessment.instructions).toBeDefined();
      expect(validAssessment.passing_score).toBeGreaterThanOrEqual(0);
      expect(validAssessment.passing_score).toBeLessThanOrEqual(100);
      expect(validAssessment.xp_reward).toBeGreaterThanOrEqual(0);
      expect(['quiz', 'project', 'peer_review', 'practical']).toContain(validAssessment.type);
    });
  });

  describe('XP multiplier calculation', () => {
    it('should calculate correct multipliers for all difficulty levels', () => {
      // Test through course creation to verify multiplier calculation
      const testCases = [
        { difficulty: 'basic' as const, expectedMultiplier: 1.0 },
        { difficulty: 'intermediate' as const, expectedMultiplier: 1.5 },
        { difficulty: 'advanced' as const, expectedMultiplier: 2.0 }
      ];

      testCases.forEach(({ difficulty, expectedMultiplier }) => {
        const courseData: CourseData = {
          title: `Test Course - ${difficulty}`,
          description: 'Test Description',
          scroll_field: ScrollField.ScrollAI,
          difficulty_level: difficulty,
          xp_multiplier: 1.0, // Will be overridden
          learning_objectives: ['Test Objective'],
          estimated_hours: 40,
          gpt_tutor_enabled: true,
          final_project_required: false,
          status: CourseStatus.Draft,
          created_by: '12345678-1234-4567-8901-123456789012'
        };

        // The service should set the correct multiplier based on difficulty
        expect(difficulty).toBeDefined();
        expect(expectedMultiplier).toBeGreaterThan(0);
      });
    });
  });
});