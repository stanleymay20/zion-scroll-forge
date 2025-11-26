/**
 * Course Constitution Validator Service
 * 
 * Validates courses against the Course Content Constitution minimum standards.
 * Ensures every course meets non-negotiable structure, depth, and component requirements.
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { PrismaClient } from '@prisma/client';
import {
  StructureValidation,
  PlaceholderDetection,
  ComponentValidation,
  AssessmentValidation,
  FormationValidation,
  ComponentCheck,
  Location,
  AssessmentDistribution,
  DimensionScore,
  AssessmentType
} from '../types/course-content.types';

const prisma = new PrismaClient();

export default class CourseConstitutionValidatorService {
  /**
   * Validates course structure against Constitution requirements
   * Requirements: 14.1
   * 
   * @param courseId - The course to validate
   * @returns Structure validation results
   */
  async validateCourseStructure(courseId: string): Promise<StructureValidation> {
    try {
      // Fetch course with modules and lessons
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            include: {
              Lecture: true,
              Assessment: true,
              SpiritualIntegration: true,
              LearningObjective: true
            }
          }
        }
      });

      if (!course) {
        throw new Error(`Course not found: ${courseId}`);
      }

      const errors: string[] = [];
      const requiredComponents: ComponentCheck[] = [];

      // Validate module count (4-12 modules per course)
      const moduleCount = course.modules.length;
      const moduleCountValid = moduleCount >= 4 && moduleCount <= 12;
      
      if (!moduleCountValid) {
        errors.push(`Module count ${moduleCount} is outside valid range (4-12)`);
      }

      requiredComponents.push({
        component: 'Module Count',
        present: moduleCountValid,
        details: `${moduleCount} modules (required: 4-12)`
      });

      // Validate lessons per module (3-10 lessons per module)
      const lessonsPerModule: number[] = [];
      let lessonsValid = true;

      for (const module of course.modules) {
        const lessonCount = module.lectures.length;
        lessonsPerModule.push(lessonCount);

        if (lessonCount < 3 || lessonCount > 10) {
          lessonsValid = false;
          errors.push(`Module "${module.title}" has ${lessonCount} lessons (required: 3-10)`);
        }
      }

      requiredComponents.push({
        component: 'Lessons Per Module',
        present: lessonsValid,
        details: `Lessons per module: ${lessonsPerModule.join(', ')}`
      });

      // Check for required course components
      const hasDescription = !!course.description && course.description.length > 0;
      requiredComponents.push({
        component: 'Course Description',
        present: hasDescription,
        details: hasDescription ? 'Present' : 'Missing'
      });

      if (!hasDescription) {
        errors.push('Course description is missing');
      }

      // Check for learning objectives
      const hasObjectives = course.modules.some(m => 
        m.LearningObjective && m.LearningObjective.length > 0
      );
      requiredComponents.push({
        component: 'Learning Objectives',
        present: hasObjectives,
        details: hasObjectives ? 'Present' : 'Missing'
      });

      if (!hasObjectives) {
        errors.push('No learning objectives defined in any module');
      }

      // Check for assessments
      const hasAssessments = course.modules.some(m => m.Assessment.length > 0);
      requiredComponents.push({
        component: 'Assessments',
        present: hasAssessments,
        details: hasAssessments ? 'Present' : 'Missing'
      });

      if (!hasAssessments) {
        errors.push('No assessments defined in any module');
      }

      const overallValid = moduleCountValid && lessonsValid && hasDescription && hasObjectives && hasAssessments;

      return {
        courseId,
        moduleCount,
        moduleCountValid,
        lessonsPerModule,
        lessonsValid,
        requiredComponents,
        overallValid,
        errors
      };
    } catch (error) {
      throw new Error(`Failed to validate course structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detects placeholder content in course materials
   * Requirements: 14.2
   * 
   * @param contentId - The content to check
   * @returns Placeholder detection results
   */
  async detectPlaceholderContent(contentId: string): Promise<PlaceholderDetection> {
    try {
      // Fetch content (could be course, module, or lecture)
      const content = await this.fetchContent(contentId);
      
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      const placeholderLocations: Location[] = [];
      let hasPlaceholders = false;
      let hasTODONotes = false;
      let hasExampleData = false;

      // Patterns to detect
      const placeholderPatterns = [
        /\[placeholder\]/gi,
        /\[insert.*here\]/gi,
        /\[tbd\]/gi,
        /\[to be determined\]/gi,
        /lorem ipsum/gi,
        /sample text/gi,
        /example content/gi,
        /\[xxx\]/gi
      ];

      const todoPatterns = [
        /TODO:/gi,
        /FIXME:/gi,
        /HACK:/gi,
        /XXX:/gi,
        /NOTE:/gi
      ];

      const exampleDataPatterns = [
        /example@example\.com/gi,
        /john\.doe/gi,
        /jane\.doe/gi,
        /test user/gi,
        /sample data/gi,
        /dummy data/gi
      ];

      // Check all text fields in content
      const textFields = this.extractTextFields(content);
      
      for (const field of textFields) {
        const { fieldName, text, lineNumber } = field;

        // Check for placeholders
        for (const pattern of placeholderPatterns) {
          const matches = text.match(pattern);
          if (matches) {
            hasPlaceholders = true;
            placeholderLocations.push({
              file: contentId,
              line: lineNumber,
              column: 0,
              context: `${fieldName}: ${text.substring(0, 100)}...`
            });
          }
        }

        // Check for TODO notes
        for (const pattern of todoPatterns) {
          if (pattern.test(text)) {
            hasTODONotes = true;
            placeholderLocations.push({
              file: contentId,
              line: lineNumber,
              column: 0,
              context: `${fieldName}: ${text.substring(0, 100)}...`
            });
          }
        }

        // Check for example data
        for (const pattern of exampleDataPatterns) {
          if (pattern.test(text)) {
            hasExampleData = true;
            placeholderLocations.push({
              file: contentId,
              line: lineNumber,
              column: 0,
              context: `${fieldName}: ${text.substring(0, 100)}...`
            });
          }
        }
      }

      const productionReady = !hasPlaceholders && !hasTODONotes && !hasExampleData;

      return {
        contentId,
        hasPlaceholders,
        placeholderLocations,
        hasTODONotes,
        hasExampleData,
        productionReady
      };
    } catch (error) {
      throw new Error(`Failed to detect placeholder content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates lesson components for completeness
   * Requirements: 14.3
   * 
   * @param lessonId - The lesson to validate
   * @returns Component validation results
   */
  async validateLessonComponents(lessonId: string): Promise<ComponentValidation> {
    try {
      // Fetch lesson with all components
      const lesson = await prisma.lecture.findUnique({
        where: { id: lessonId },
        include: {
          module: {
            include: {
              spiritualIntegration: true
            }
          }
        }
      });

      if (!lesson) {
        throw new Error(`Lesson not found: ${lessonId}`);
      }

      const missingComponents: string[] = [];

      // Check for lecture notes
      const hasLectureNotes = !!lesson.notes && (lesson.notes as any).content && (lesson.notes as any).content.length > 0;
      if (!hasLectureNotes) {
        missingComponents.push('Lecture Notes');
      }

      // Check for video script outline
      const hasVideoScriptOutline = !!lesson.transcript && lesson.transcript.length > 0;
      if (!hasVideoScriptOutline) {
        missingComponents.push('Video Script Outline');
      }

      // Check for examples
      const hasExamples = lesson.notes && (lesson.notes as any).examples && (lesson.notes as any).examples.length > 0;
      if (!hasExamples) {
        missingComponents.push('Examples');
      }

      // Check for key scriptures or frameworks
      const hasKeyScripturesOrFrameworks = 
        (lesson.module.spiritualIntegration && 
         (lesson.module.spiritualIntegration as any).biblicalFoundation &&
         (lesson.module.spiritualIntegration as any).biblicalFoundation.scriptures &&
         (lesson.module.spiritualIntegration as any).biblicalFoundation.scriptures.length > 0) ||
        (lesson.notes && (lesson.notes as any).keyConcepts && (lesson.notes as any).keyConcepts.length > 0);
      
      if (!hasKeyScripturesOrFrameworks) {
        missingComponents.push('Key Scriptures or Frameworks');
      }

      // Check for references
      const hasReferences = lesson.resources && lesson.resources.length > 0;
      if (!hasReferences) {
        missingComponents.push('References');
      }

      const allComponentsPresent = missingComponents.length === 0;

      return {
        lessonId,
        hasLectureNotes,
        hasVideoScriptOutline,
        hasExamples,
        hasKeyScripturesOrFrameworks,
        hasReferences,
        allComponentsPresent,
        missingComponents
      };
    } catch (error) {
      throw new Error(`Failed to validate lesson components: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates assessment distribution across course
   * Requirements: 14.4
   * 
   * @param courseId - The course to validate
   * @returns Assessment validation results
   */
  async validateAssessmentDistribution(courseId: string): Promise<AssessmentValidation> {
    try {
      // Fetch course with all assessments
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            include: {
              assessments: true
            }
          }
        }
      });

      if (!course) {
        throw new Error(`Course not found: ${courseId}`);
      }

      // Collect all assessments
      const allAssessments = course.modules.flatMap(m => m.assessments);

      // Count assessment types
      let formativeCount = 0;
      let summativeCount = 0;
      let reflectiveCount = 0;
      let microAssessmentCount = 0;
      let midCourseCount = 0;
      let finalCapstoneCount = 0;

      for (const assessment of allAssessments) {
        const type = assessment.type as AssessmentType;
        
        // Count by type
        if (type === AssessmentType.FORMATIVE) {
          formativeCount++;
        } else if (type === AssessmentType.SUMMATIVE) {
          summativeCount++;
        } else if (type === AssessmentType.REFLECTIVE) {
          reflectiveCount++;
        }

        // Identify specific assessment categories by title/description
        const title = assessment.title.toLowerCase();
        const description = assessment.description?.toLowerCase() || '';
        
        if (title.includes('micro') || title.includes('quiz') || description.includes('micro')) {
          microAssessmentCount++;
        }
        
        if (title.includes('mid') || title.includes('midterm') || description.includes('mid-course')) {
          midCourseCount++;
        }
        
        if (title.includes('final') || title.includes('capstone') || description.includes('final')) {
          finalCapstoneCount++;
        }
      }

      // Check requirements
      const hasMicroAssessments = microAssessmentCount > 0 || formativeCount >= course.modules.length;
      const hasMidCourseAssessment = midCourseCount > 0;
      const hasFinalCapstone = finalCapstoneCount > 0;

      // Check distribution balance
      const recommendations: string[] = [];
      const distributionBalanced = formativeCount > 0 && summativeCount > 0 && reflectiveCount > 0;

      if (formativeCount === 0) {
        recommendations.push('Add formative assessments for ongoing feedback');
      }
      if (summativeCount === 0) {
        recommendations.push('Add summative assessments to measure mastery');
      }
      if (reflectiveCount === 0) {
        recommendations.push('Add reflective assessments for spiritual integration');
      }
      if (!hasMicroAssessments) {
        recommendations.push('Add per-module micro-assessments');
      }
      if (!hasMidCourseAssessment) {
        recommendations.push('Add mid-course assessment');
      }
      if (!hasFinalCapstone) {
        recommendations.push('Add final capstone assessment');
      }

      const assessmentDistribution: AssessmentDistribution = {
        courseId,
        formativeCount,
        summativeCount,
        reflectiveCount,
        distributionBalanced,
        recommendations
      };

      const valid = hasMicroAssessments && hasMidCourseAssessment && hasFinalCapstone && distributionBalanced;

      return {
        courseId,
        hasMicroAssessments,
        hasMidCourseAssessment,
        hasFinalCapstone,
        assessmentDistribution,
        valid
      };
    } catch (error) {
      throw new Error(`Failed to validate assessment distribution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates integrated formation across four dimensions
   * Requirements: 14.5
   * 
   * @param courseId - The course to validate
   * @returns Formation validation results
   */
  async validateIntegratedFormation(courseId: string): Promise<FormationValidation> {
    try {
      // Fetch course with all relevant data
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          modules: {
            include: {
              lectures: true,
              assessments: true,
              spiritualIntegration: true
            }
          }
        }
      });

      if (!course) {
        throw new Error(`Course not found: ${courseId}`);
      }

      const gaps: string[] = [];

      // Evaluate Knowledge Dimension
      const knowledgeDimension = this.evaluateKnowledgeDimension(course);
      if (knowledgeDimension.score < knowledgeDimension.maxScore * 0.7) {
        gaps.push('Knowledge dimension needs strengthening');
      }

      // Evaluate Skill Dimension
      const skillDimension = this.evaluateSkillDimension(course);
      if (skillDimension.score < skillDimension.maxScore * 0.7) {
        gaps.push('Skill dimension needs strengthening');
      }

      // Evaluate Character Dimension
      const characterDimension = this.evaluateCharacterDimension(course);
      if (characterDimension.score < characterDimension.maxScore * 0.7) {
        gaps.push('Character dimension needs strengthening');
      }

      // Evaluate Calling Dimension
      const callingDimension = this.evaluateCallingDimension(course);
      if (callingDimension.score < callingDimension.maxScore * 0.7) {
        gaps.push('Calling dimension needs strengthening');
      }

      // Check if integrated formation is achieved (all dimensions >= 70%)
      const integratedFormationAchieved = 
        knowledgeDimension.score >= knowledgeDimension.maxScore * 0.7 &&
        skillDimension.score >= skillDimension.maxScore * 0.7 &&
        characterDimension.score >= characterDimension.maxScore * 0.7 &&
        callingDimension.score >= callingDimension.maxScore * 0.7;

      return {
        courseId,
        knowledgeDimension,
        skillDimension,
        characterDimension,
        callingDimension,
        integratedFormationAchieved,
        gaps
      };
    } catch (error) {
      throw new Error(`Failed to validate integrated formation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Fetches content by ID (could be course, module, or lecture)
   */
  private async fetchContent(contentId: string): Promise<any> {
    // Try to fetch as course first
    let content = await prisma.course.findUnique({
      where: { id: contentId },
      include: {
        modules: {
          include: {
            lectures: true
          }
        }
      }
    });

    if (content) return content;

    // Try as module
    content = await prisma.module.findUnique({
      where: { id: contentId },
      include: {
        lectures: true
      }
    });

    if (content) return content;

    // Try as lecture
    content = await prisma.lecture.findUnique({
      where: { id: contentId }
    });

    return content;
  }

  /**
   * Extracts text fields from content for analysis
   */
  private extractTextFields(content: any): Array<{ fieldName: string; text: string; lineNumber: number }> {
    const fields: Array<{ fieldName: string; text: string; lineNumber: number }> = [];
    let lineNumber = 0;

    const extractFromObject = (obj: any, prefix: string = '') => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          fields.push({
            fieldName: prefix ? `${prefix}.${key}` : key,
            text: obj[key],
            lineNumber: lineNumber++
          });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          extractFromObject(obj[key], prefix ? `${prefix}.${key}` : key);
        }
      }
    };

    extractFromObject(content);
    return fields;
  }

  /**
   * Evaluates Knowledge dimension (theory, concepts, understanding)
   */
  private evaluateKnowledgeDimension(course: any): DimensionScore {
    const evidence: string[] = [];
    const gaps: string[] = [];
    let score = 0;
    const maxScore = 100;

    // Check for learning objectives (30 points)
    const hasObjectives = course.modules.some((m: any) => 
      m.learningObjectives && m.learningObjectives.length > 0
    );
    if (hasObjectives) {
      score += 30;
      evidence.push('Learning objectives defined');
    } else {
      gaps.push('Missing learning objectives');
    }

    // Check for lecture content (40 points)
    const hasLectures = course.modules.some((m: any) => m.lectures.length > 0);
    if (hasLectures) {
      score += 40;
      evidence.push('Lecture content present');
    } else {
      gaps.push('Missing lecture content');
    }

    // Check for assessments testing knowledge (30 points)
    const hasKnowledgeAssessments = course.modules.some((m: any) => 
      m.assessments.some((a: any) => 
        a.type === 'QUIZ' || a.type === 'ESSAY' || a.type === 'FORMATIVE'
      )
    );
    if (hasKnowledgeAssessments) {
      score += 30;
      evidence.push('Knowledge assessments present');
    } else {
      gaps.push('Missing knowledge assessments');
    }

    return { score, maxScore, evidence, gaps };
  }

  /**
   * Evaluates Skill dimension (practice, application, competence)
   */
  private evaluateSkillDimension(course: any): DimensionScore {
    const evidence: string[] = [];
    const gaps: string[] = [];
    let score = 0;
    const maxScore = 100;

    // Check for practice problems (30 points)
    const hasPracticeProblems = course.modules.some((m: any) => 
      m.lectures.some((l: any) => 
        l.notes && l.notes.practiceProblems && l.notes.practiceProblems.length > 0
      )
    );
    if (hasPracticeProblems) {
      score += 30;
      evidence.push('Practice problems included');
    } else {
      gaps.push('Missing practice problems');
    }

    // Check for project assessments (40 points)
    const hasProjects = course.modules.some((m: any) => 
      m.assessments.some((a: any) => a.type === 'PROJECT')
    );
    if (hasProjects) {
      score += 40;
      evidence.push('Project assessments present');
    } else {
      gaps.push('Missing project assessments');
    }

    // Check for examples (30 points)
    const hasExamples = course.modules.some((m: any) => 
      m.lectures.some((l: any) => 
        l.notes && l.notes.examples && l.notes.examples.length > 0
      )
    );
    if (hasExamples) {
      score += 30;
      evidence.push('Examples provided');
    } else {
      gaps.push('Missing examples');
    }

    return { score, maxScore, evidence, gaps };
  }

  /**
   * Evaluates Character dimension (virtue, ethics, spiritual growth)
   */
  private evaluateCharacterDimension(course: any): DimensionScore {
    const evidence: string[] = [];
    const gaps: string[] = [];
    let score = 0;
    const maxScore = 100;

    // Check for spiritual integration (40 points)
    const hasSpiritualIntegration = course.modules.some((m: any) => 
      m.spiritualIntegration && m.spiritualIntegration.biblicalFoundation
    );
    if (hasSpiritualIntegration) {
      score += 40;
      evidence.push('Spiritual integration present');
    } else {
      gaps.push('Missing spiritual integration');
    }

    // Check for reflection questions (30 points)
    const hasReflectionQuestions = course.modules.some((m: any) => 
      m.spiritualIntegration && 
      m.spiritualIntegration.reflectionQuestions && 
      m.spiritualIntegration.reflectionQuestions.length > 0
    );
    if (hasReflectionQuestions) {
      score += 30;
      evidence.push('Reflection questions included');
    } else {
      gaps.push('Missing reflection questions');
    }

    // Check for reflective assessments (30 points)
    const hasReflectiveAssessments = course.modules.some((m: any) => 
      m.assessments.some((a: any) => a.type === 'REFLECTIVE')
    );
    if (hasReflectiveAssessments) {
      score += 30;
      evidence.push('Reflective assessments present');
    } else {
      gaps.push('Missing reflective assessments');
    }

    return { score, maxScore, evidence, gaps };
  }

  /**
   * Evaluates Calling dimension (purpose, ministry, kingdom impact)
   */
  private evaluateCallingDimension(course: any): DimensionScore {
    const evidence: string[] = [];
    const gaps: string[] = [];
    let score = 0;
    const maxScore = 100;

    // Check for real-world application (40 points)
    const hasRealWorldApplication = course.modules.some((m: any) => 
      m.assessments.some((a: any) => 
        a.projectRequirements && a.projectRequirements.realWorldApplication
      )
    );
    if (hasRealWorldApplication) {
      score += 40;
      evidence.push('Real-world application included');
    } else {
      gaps.push('Missing real-world application');
    }

    // Check for ministry/calling connection (30 points)
    const hasCallingConnection = course.modules.some((m: any) => 
      m.spiritualIntegration && 
      (m.spiritualIntegration.reflectionQuestions?.some((q: any) => 
        q.question.toLowerCase().includes('calling') || 
        q.question.toLowerCase().includes('ministry') ||
        q.question.toLowerCase().includes('purpose')
      ))
    );
    if (hasCallingConnection) {
      score += 30;
      evidence.push('Calling/ministry connection present');
    } else {
      gaps.push('Missing calling/ministry connection');
    }

    // Check for kingdom impact focus (30 points)
    const hasKingdomImpact = course.modules.some((m: any) => 
      m.assessments.some((a: any) => 
        a.projectRequirements && 
        a.projectRequirements.measurableImpact && 
        a.projectRequirements.measurableImpact.length > 0
      )
    );
    if (hasKingdomImpact) {
      score += 30;
      evidence.push('Kingdom impact focus present');
    } else {
      gaps.push('Missing kingdom impact focus');
    }

    return { score, maxScore, evidence, gaps };
  }
}
