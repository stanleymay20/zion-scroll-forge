/**
 * Content Creation Engine Integration Tests
 * Tests the complete content creation workflow with all components
 */

import ContentCreationService from '../ContentCreationService';
import { MultiFormatCoordinator } from '../MultiFormatCoordinator';
import { ScrollPedagogyValidator } from '../ScrollPedagogyValidator';
import { ContentVersionControl } from '../ContentVersionControl';
import { QualityMetricsService } from '../QualityMetricsService';
import { TheologicalAlignmentService } from '../TheologicalAlignmentService';
import {
  LectureGenerationRequest,
  AssessmentGenerationRequest,
  BloomLevel,
  AssessmentType
} from '../../types/content-creation.types';

describe('Content Creation Engine - Integration Tests', () => {
  let contentService: ContentCreationService;
  let formatCoordinator: MultiFormatCoordinator;
  let pedagogyValidator: ScrollPedagogyValidator;
  let versionControl: ContentVersionControl;
  let qualityService: QualityMetricsService;
  let theologicalService: TheologicalAlignmentService;

  beforeEach(() => {
    contentService = new ContentCreationService();
    formatCoordinator = new MultiFormatCoordinator();
    pedagogyValidator = new ScrollPedagogyValidator();
    versionControl = new ContentVersionControl();
    qualityService = new QualityMetricsService();
    theologicalService = new TheologicalAlignmentService();
  });

  describe('Complete Content Generation Workflow', () => {
    it('should generate, validate, and format complete course content', async () => {
      // Step 1: Generate lecture content
      const lectureRequest: LectureGenerationRequest = {
        courseOutline: {
          courseId: 'course_integration_001',
          title: 'Kingdom Principles in Business Leadership',
          description: 'Biblical foundations for transformational leadership',
          learningObjectives: [],
          modules: [],
          targetAudience: 'Graduate students',
          difficulty: 'ADVANCED',
          duration: 40
        },
        moduleOutline: {
          moduleNumber: 1,
          title: 'Servant Leadership in the Marketplace',
          description: 'Understanding Christ-centered leadership',
          learningObjectives: ['Apply servant leadership principles'],
          topics: ['Servant leadership', 'Biblical authority', 'Kingdom impact'],
          estimatedDuration: 2
        },
        learningObjectives: [
          {
            id: 'obj_001',
            description: 'Apply servant leadership principles in business contexts',
            bloomLevel: BloomLevel.APPLY,
            assessmentMethod: 'Case study'
          }
        ],
        targetAudience: 'Graduate students',
        difficulty: 'ADVANCED',
        includeExamples: true,
        includeCaseStudies: true,
        includeBiblicalIntegration: true
      };

      const lectureResult = await contentService.generateLecture(lectureRequest);
      expect(lectureResult.success).toBe(true);
      expect(lectureResult.content).toBeDefined();

      if (!lectureResult.content) return;

      // Step 2: Validate pedagogy
      const pedagogyValidation = await pedagogyValidator.validateContent({
        content: lectureResult.content.mainContent,
        contentType: 'lecture',
        targetAudience: 'Graduate students',
        learningObjectives: lectureRequest.learningObjectives
      });

      expect(pedagogyValidation.isValid).toBe(true);
      expect(pedagogyValidation.pedagogyScore).toBeGreaterThan(0.7);

      // Step 3: Check theological alignment
      const theologicalCheck = await theologicalService.checkAlignment({
        content: lectureResult.content.mainContent,
        contentType: 'lecture',
        requiresBiblicalIntegration: true
      });

      expect(theologicalCheck.alignmentScore).toBeGreaterThan(0.8);
      expect(theologicalCheck.hasScrollTone).toBe(true);

      // Step 4: Generate multiple formats
      const formats = await formatCoordinator.generateMultipleFormats({
        sourceContent: lectureResult.content.mainContent,
        sourceFormat: 'text',
        targetFormats: ['video_script', 'audio_script', 'mobile_optimized'],
        preserveScrollAlignment: true
      });

      expect(formats.success).toBe(true);
      expect(formats.formats).toBeDefined();
      expect(formats.formats?.length).toBe(3);

      // Step 5: Version control
      const versionResult = await versionControl.createVersion({
        contentId: 'lecture_001',
        content: lectureResult.content.mainContent,
        contentType: 'lecture',
        changeDescription: 'Initial version',
        author: 'ContentCreationEngine'
      });

      expect(versionResult.success).toBe(true);
      expect(versionResult.version).toBeDefined();

      // Step 6: Quality metrics
      const qualityMetrics = await qualityService.calculateMetrics({
        contentId: 'lecture_001',
        content: lectureResult.content.mainContent,
        contentType: 'lecture',
        metadata: {
          pedagogyScore: pedagogyValidation.pedagogyScore,
          theologicalScore: theologicalCheck.alignmentScore
        }
      });

      expect(qualityMetrics.overallScore).toBeGreaterThan(0.75);
      expect(qualityMetrics.readabilityScore).toBeGreaterThan(0);
      expect(qualityMetrics.completenessScore).toBeGreaterThan(0);
    }, 60000);

    it('should generate and validate assessment with content', async () => {
      // Generate assessment
      const assessmentRequest: AssessmentGenerationRequest = {
        courseId: 'course_integration_001',
        topic: 'Servant Leadership Principles',
        learningObjectives: [
          {
            id: 'obj_002',
            description: 'Evaluate leadership scenarios using biblical principles',
            bloomLevel: BloomLevel.EVALUATE,
            assessmentMethod: 'Case study'
          }
        ],
        assessmentType: AssessmentType.CASE_STUDY,
        difficulty: 'HARD',
        numberOfQuestions: 3,
        uniquenessRequired: true,
        studentId: 'student_integration_001'
      };

      const assessmentResult = await contentService.generateAssessment(assessmentRequest);
      expect(assessmentResult.success).toBe(true);
      expect(assessmentResult.content).toBeDefined();

      if (!assessmentResult.content) return;

      // Validate assessment quality
      const qualityCheck = await qualityService.calculateMetrics({
        contentId: 'assessment_001',
        content: JSON.stringify(assessmentResult.content),
        contentType: 'assessment',
        metadata: {
          difficulty: assessmentRequest.difficulty,
          assessmentType: assessmentRequest.assessmentType
        }
      });

      expect(qualityCheck.overallScore).toBeGreaterThan(0.7);

      // Check theological alignment in assessment
      const theologicalCheck = await theologicalService.checkAlignment({
        content: JSON.stringify(assessmentResult.content),
        contentType: 'assessment',
        requiresBiblicalIntegration: true
      });

      expect(theologicalCheck.alignmentScore).toBeGreaterThan(0.7);
    }, 60000);
  });

  describe('Multi-Format Content Transformation', () => {
    it('should transform content across all formats while preserving quality', async () => {
      const sourceContent = `
# Servant Leadership in the Marketplace

## Introduction
In the kingdom of God, leadership is fundamentally different from worldly models. Jesus Christ demonstrated that true leadership is rooted in service, sacrifice, and stewardship.

## Biblical Foundation
"Whoever wants to become great among you must be your servant" (Mark 10:43). This principle transforms how we approach authority and influence in business.

## Kingdom Application
As believers called to transform systems, we must embody servant leadership in our professional lives, demonstrating Christ's love through our leadership practices.

## Reflection Questions
1. How does servant leadership challenge conventional business practices?
2. What systems might God be calling you to influence through servant leadership?
`;

      const formats = await formatCoordinator.generateMultipleFormats({
        sourceContent,
        sourceFormat: 'text',
        targetFormats: ['video_script', 'audio_script', 'presentation', 'mobile_optimized'],
        preserveScrollAlignment: true
      });

      expect(formats.success).toBe(true);
      expect(formats.formats).toBeDefined();
      expect(formats.formats?.length).toBe(4);

      // Validate each format maintains scroll alignment
      for (const format of formats.formats || []) {
        const theologicalCheck = await theologicalService.checkAlignment({
          content: format.content,
          contentType: format.format,
          requiresBiblicalIntegration: true
        });

        expect(theologicalCheck.hasScrollTone).toBe(true);
        expect(theologicalCheck.alignmentScore).toBeGreaterThan(0.7);
      }
    }, 60000);
  });

  describe('Content Version Control and Rollback', () => {
    it('should manage content versions and support rollback', async () => {
      const contentId = 'lecture_version_test_001';
      const originalContent = 'Original lecture content with kingdom principles';

      // Create initial version
      const v1 = await versionControl.createVersion({
        contentId,
        content: originalContent,
        contentType: 'lecture',
        changeDescription: 'Initial version',
        author: 'TestAuthor'
      });

      expect(v1.success).toBe(true);
      expect(v1.version?.versionNumber).toBe(1);

      // Create second version
      const updatedContent = originalContent + '\n\nAdditional biblical integration';
      const v2 = await versionControl.createVersion({
        contentId,
        content: updatedContent,
        contentType: 'lecture',
        changeDescription: 'Added biblical integration',
        author: 'TestAuthor'
      });

      expect(v2.success).toBe(true);
      expect(v2.version?.versionNumber).toBe(2);

      // Get version history
      const history = await versionControl.getVersionHistory(contentId);
      expect(history.versions.length).toBe(2);

      // Rollback to version 1
      const rollback = await versionControl.rollbackToVersion(contentId, 1);
      expect(rollback.success).toBe(true);
      expect(rollback.content).toBe(originalContent);

      // Verify current version is now v1 content
      const current = await versionControl.getCurrentVersion(contentId);
      expect(current.content).toBe(originalContent);
    }, 60000);
  });

  describe('Quality Assurance Pipeline', () => {
    it('should run complete quality assurance checks', async () => {
      const content = `
# Kingdom Economics: Biblical Principles for Business

## Introduction
God's economy operates on principles fundamentally different from worldly systems. Understanding these principles transforms how we approach business, finance, and stewardship.

## Biblical Foundation
Scripture reveals that all resources belong to God (Psalm 24:1), and we are called to be faithful stewards. This foundational truth reshapes our understanding of ownership, profit, and success.

## Kingdom Application
As believers in the marketplace, we must:
1. Recognize God's ownership of all resources
2. Practice generous stewardship
3. Pursue kingdom impact over mere profit
4. Build businesses that reflect God's character

## Practical Implementation
- Integrate prayer into business decisions
- Prioritize people over profits
- Seek divine wisdom in strategic planning
- Measure success by kingdom impact

## Reflection Questions
1. How does viewing God as the ultimate owner change your business practices?
2. What systems might God be calling you to transform through kingdom economics?
`;

      // Run all quality checks
      const [
        pedagogyCheck,
        theologicalCheck,
        qualityMetrics
      ] = await Promise.all([
        pedagogyValidator.validateContent({
          content,
          contentType: 'lecture',
          targetAudience: 'Graduate students',
          learningObjectives: []
        }),
        theologicalService.checkAlignment({
          content,
          contentType: 'lecture',
          requiresBiblicalIntegration: true
        }),
        qualityService.calculateMetrics({
          contentId: 'qa_test_001',
          content,
          contentType: 'lecture',
          metadata: {}
        })
      ]);

      // Verify all checks pass
      expect(pedagogyCheck.isValid).toBe(true);
      expect(pedagogyCheck.pedagogyScore).toBeGreaterThan(0.7);

      expect(theologicalCheck.hasScrollTone).toBe(true);
      expect(theologicalCheck.alignmentScore).toBeGreaterThan(0.8);
      expect(theologicalCheck.biblicalReferences.length).toBeGreaterThan(0);

      expect(qualityMetrics.overallScore).toBeGreaterThan(0.75);
      expect(qualityMetrics.completenessScore).toBeGreaterThan(0.8);
    }, 60000);
  });

  describe('University System Integration', () => {
    it('should integrate with course management system', async () => {
      // This test verifies the content creation engine integrates properly
      // with the broader university system

      const courseId = 'course_integration_002';
      
      // Generate course content
      const lectureRequest: LectureGenerationRequest = {
        courseOutline: {
          courseId,
          title: 'Digital Transformation with Kingdom Values',
          description: 'Integrating faith and technology',
          learningObjectives: [],
          modules: [],
          targetAudience: 'Professional students',
          difficulty: 'INTERMEDIATE',
          duration: 40
        },
        moduleOutline: {
          moduleNumber: 1,
          title: 'Technology as Kingdom Tool',
          description: 'Using technology for kingdom advancement',
          learningObjectives: ['Apply kingdom principles to technology'],
          topics: ['Digital ethics', 'Technology stewardship', 'Kingdom impact'],
          estimatedDuration: 2
        },
        learningObjectives: [
          {
            id: 'obj_003',
            description: 'Apply kingdom principles to technology decisions',
            bloomLevel: BloomLevel.APPLY,
            assessmentMethod: 'Project'
          }
        ],
        targetAudience: 'Professional students',
        difficulty: 'INTERMEDIATE',
        includeExamples: true,
        includeCaseStudies: true,
        includeBiblicalIntegration: true
      };

      const result = await contentService.generateLecture(lectureRequest);
      expect(result.success).toBe(true);

      // Verify content is ready for course delivery
      expect(result.content).toBeDefined();
      expect(result.content?.title).toBeDefined();
      expect(result.content?.mainContent).toBeDefined();
      expect(result.content?.biblicalIntegration).toBeDefined();
      expect(result.content?.keyTakeaways.length).toBeGreaterThan(0);
    }, 60000);
  });

  describe('Performance and Scalability', () => {
    it('should handle large-scale content generation efficiently', async () => {
      const startTime = Date.now();
      
      // Generate multiple pieces of content concurrently
      const requests = Array.from({ length: 5 }, (_, i) => ({
        courseOutline: {
          courseId: `course_perf_${i}`,
          title: `Test Course ${i}`,
          description: 'Performance test course',
          learningObjectives: [],
          modules: [],
          targetAudience: 'Students',
          difficulty: 'INTERMEDIATE' as const,
          duration: 40
        },
        moduleOutline: {
          moduleNumber: 1,
          title: `Module ${i}`,
          description: 'Test module',
          learningObjectives: ['Test objective'],
          topics: ['Test topic'],
          estimatedDuration: 2
        },
        learningObjectives: [
          {
            id: `obj_${i}`,
            description: 'Test objective',
            bloomLevel: BloomLevel.UNDERSTAND,
            assessmentMethod: 'Quiz'
          }
        ],
        targetAudience: 'Students',
        difficulty: 'INTERMEDIATE' as const,
        includeExamples: true,
        includeCaseStudies: false,
        includeBiblicalIntegration: true
      }));

      const results = await Promise.all(
        requests.map(req => contentService.generateLecture(req))
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all succeeded
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.content).toBeDefined();
      });

      // Performance check: should complete in reasonable time
      expect(duration).toBeLessThan(120000); // 2 minutes for 5 concurrent generations
    }, 180000);
  });
});
