/**
 * ScrollUniversity Curriculum Mapping Service
 * Links courses to degree requirements and manages curriculum relationships
 */

import {
  DegreeProgram,
  DegreeType,
  CurriculumMapping,
  DegreeRequirement,
  RequirementType,
  StudentDegreeProgress,
  RequirementProgress,
  RequirementStatus
} from '../types/degree';
import { DegreeTemplateService } from './DegreeTemplateService';

export interface CourseMapping {
  courseId: string;
  courseTitle: string;
  credits: number;
  prerequisites: string[];
  learningObjectives: string[];
  spiritualObjectives: string[];
  practicalObjectives: string[];
  propheticIntegration: string[];
}

export interface MappingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class CurriculumMappingService {
  private degreeTemplateService: DegreeTemplateService;

  constructor() {
    this.degreeTemplateService = new DegreeTemplateService();
  }

  /**
   * Get curriculum mapping for a specific degree program
   */
  public getCurriculumMapping(degreeType: DegreeType): CurriculumMapping[] {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(degreeType);
    const mappings: CurriculumMapping[] = [];

    for (const requirement of degreeProgram.requirements) {
      if (requirement.courseIds) {
        for (const courseId of requirement.courseIds) {
          mappings.push({
            degreeId: degreeProgram.id,
            courseId,
            requirementId: requirement.id,
            credits: requirement.credits,
            isRequired: requirement.isRequired,
            prerequisitesMet: true, // This would be calculated based on student progress
            spiritualObjectives: requirement.spiritualObjectives || [],
            practicalObjectives: requirement.practicalObjectives || [],
            propheticIntegration: this.getPropheticIntegrationForRequirement(degreeProgram, requirement.id)
          });
        }
      }

      // Handle alternative courses
      if (requirement.alternativeCourseIds) {
        for (const courseId of requirement.alternativeCourseIds) {
          mappings.push({
            degreeId: degreeProgram.id,
            courseId,
            requirementId: requirement.id,
            credits: requirement.credits,
            isRequired: false, // Alternative courses are not strictly required
            prerequisitesMet: true,
            spiritualObjectives: requirement.spiritualObjectives || [],
            practicalObjectives: requirement.practicalObjectives || [],
            propheticIntegration: this.getPropheticIntegrationForRequirement(degreeProgram, requirement.id)
          });
        }
      }
    }

    return mappings;
  }

  /**
   * Get all courses that fulfill a specific requirement
   */
  public getCoursesForRequirement(degreeType: DegreeType, requirementId: string): CourseMapping[] {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(degreeType);
    const requirement = degreeProgram.requirements.find(req => req.id === requirementId);
    
    if (!requirement) {
      throw new Error(`Requirement ${requirementId} not found in degree program ${degreeType}`);
    }

    const courses: CourseMapping[] = [];

    // Add primary courses
    if (requirement.courseIds) {
      for (const courseId of requirement.courseIds) {
        courses.push(this.createCourseMapping(courseId, requirement, true));
      }
    }

    // Add alternative courses
    if (requirement.alternativeCourseIds) {
      for (const courseId of requirement.alternativeCourseIds) {
        courses.push(this.createCourseMapping(courseId, requirement, false));
      }
    }

    return courses;
  }

  /**
   * Get all requirements that a course can fulfill
   */
  public getRequirementsForCourse(degreeType: DegreeType, courseId: string): DegreeRequirement[] {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(degreeType);
    const requirements: DegreeRequirement[] = [];

    for (const requirement of degreeProgram.requirements) {
      const canFulfill = 
        (requirement.courseIds && requirement.courseIds.includes(courseId)) ||
        (requirement.alternativeCourseIds && requirement.alternativeCourseIds.includes(courseId));

      if (canFulfill) {
        requirements.push(requirement);
      }
    }

    return requirements;
  }

  /**
   * Validate curriculum mapping for a degree program
   */
  public validateCurriculumMapping(degreeType: DegreeType): MappingValidationResult {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(degreeType);
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check that all required courses have mappings
    for (const requirement of degreeProgram.requirements) {
      if (requirement.isRequired && requirement.type === RequirementType.CORE_COURSE) {
        if (!requirement.courseIds || requirement.courseIds.length === 0) {
          errors.push(`Required core course requirement "${requirement.title}" has no course mappings`);
        }
      }

      // Check for circular prerequisites
      if (requirement.prerequisites) {
        const circularDeps = this.detectCircularPrerequisites(degreeProgram, requirement.id);
        if (circularDeps.length > 0) {
          errors.push(`Circular prerequisite dependency detected for requirement "${requirement.title}": ${circularDeps.join(' -> ')}`);
        }
      }

      // Validate credit distribution
      if (requirement.credits <= 0) {
        errors.push(`Requirement "${requirement.title}" has invalid credit value: ${requirement.credits}`);
      }
    }

    // Check total credits
    const totalCredits = degreeProgram.requirements.reduce((sum, req) => sum + req.credits, 0);
    if (totalCredits !== degreeProgram.totalCredits) {
      warnings.push(`Total requirement credits (${totalCredits}) does not match degree total credits (${degreeProgram.totalCredits})`);
    }

    // Check spiritual formation integration
    const spiritualRequirements = degreeProgram.requirements.filter(req => req.type === RequirementType.SPIRITUAL_FORMATION);
    if (spiritualRequirements.length === 0) {
      warnings.push('No spiritual formation requirements found in degree program');
    }

    // Check practical application integration
    const practicalRequirements = degreeProgram.requirements.filter(req => req.type === RequirementType.PRACTICAL_APPLICATION);
    if (practicalRequirements.length === 0) {
      warnings.push('No practical application requirements found in degree program');
    }

    // Check capstone requirement
    const capstoneRequirements = degreeProgram.requirements.filter(req => req.type === RequirementType.CAPSTONE);
    if (capstoneRequirements.length === 0) {
      suggestions.push('Consider adding a capstone requirement to integrate learning');
    } else if (capstoneRequirements.length > 1) {
      warnings.push('Multiple capstone requirements found - consider consolidating');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Get prerequisite chain for a requirement
   */
  public getPrerequisiteChain(degreeType: DegreeType, requirementId: string): string[] {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(degreeType);
    const visited = new Set<string>();
    const chain: string[] = [];

    this.buildPrerequisiteChain(degreeProgram, requirementId, visited, chain);
    return chain;
  }

  /**
   * Check if prerequisites are met for a requirement
   */
  public arePrerequisitesMet(
    degreeType: DegreeType, 
    requirementId: string, 
    studentProgress: StudentDegreeProgress
  ): boolean {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(degreeType);
    const requirement = degreeProgram.requirements.find(req => req.id === requirementId);
    
    if (!requirement || !requirement.prerequisites) {
      return true;
    }

    for (const prereqId of requirement.prerequisites) {
      const progress = studentProgress.requirementProgress.find(rp => rp.requirementId === prereqId);
      if (!progress || progress.status !== RequirementStatus.COMPLETED) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get recommended course sequence for a degree program
   */
  public getRecommendedCourseSequence(degreeType: DegreeType): string[][] {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(degreeType);
    const sequence: string[][] = [];
    const processed = new Set<string>();
    
    // Sort requirements by order index and prerequisites
    const sortedRequirements = [...degreeProgram.requirements].sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) {
        return a.orderIndex - b.orderIndex;
      }
      // Prioritize requirements with fewer prerequisites
      const aPrereqs = a.prerequisites?.length || 0;
      const bPrereqs = b.prerequisites?.length || 0;
      return aPrereqs - bPrereqs;
    });

    let currentSemester: string[] = [];
    let semesterCredits = 0;
    const maxCreditsPerSemester = 18;

    for (const requirement of sortedRequirements) {
      if (processed.has(requirement.id)) continue;

      // Check if prerequisites are in previous semesters
      const canTakeNow = !requirement.prerequisites || 
        requirement.prerequisites.every(prereq => processed.has(prereq));

      if (canTakeNow && semesterCredits + requirement.credits <= maxCreditsPerSemester) {
        if (requirement.courseIds) {
          currentSemester.push(...requirement.courseIds);
        }
        semesterCredits += requirement.credits;
        processed.add(requirement.id);
      } else if (canTakeNow) {
        // Start new semester
        if (currentSemester.length > 0) {
          sequence.push([...currentSemester]);
          currentSemester = [];
          semesterCredits = 0;
        }
        
        if (requirement.courseIds) {
          currentSemester.push(...requirement.courseIds);
        }
        semesterCredits += requirement.credits;
        processed.add(requirement.id);
      }
    }

    // Add final semester if not empty
    if (currentSemester.length > 0) {
      sequence.push(currentSemester);
    }

    return sequence;
  }

  /**
   * Calculate degree completion percentage
   */
  public calculateCompletionPercentage(studentProgress: StudentDegreeProgress): number {
    if (studentProgress.creditsRemaining <= 0) {
      return 100;
    }

    const completionPercentage = (studentProgress.creditsCompleted / (studentProgress.creditsCompleted + studentProgress.creditsRemaining)) * 100;
    return Math.round(completionPercentage * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get next recommended courses for a student
   */
  public getNextRecommendedCourses(
    degreeType: DegreeType, 
    studentProgress: StudentDegreeProgress,
    maxCourses: number = 5
  ): CourseMapping[] {
    const degreeProgram = this.degreeTemplateService.getDegreeTemplate(degreeType);
    const recommendations: CourseMapping[] = [];

    // Find requirements that are not yet completed and have prerequisites met
    for (const requirement of degreeProgram.requirements) {
      const progress = studentProgress.requirementProgress.find(rp => rp.requirementId === requirement.id);
      
      if (!progress || progress.status === RequirementStatus.NOT_STARTED) {
        if (this.arePrerequisitesMet(degreeType, requirement.id, studentProgress)) {
          const courses = this.getCoursesForRequirement(degreeType, requirement.id);
          recommendations.push(...courses);
        }
      }
    }

    // Sort by requirement priority (required first, then by order index)
    recommendations.sort((a, b) => {
      const reqA = degreeProgram.requirements.find(req => req.id === a.courseId);
      const reqB = degreeProgram.requirements.find(req => req.id === b.courseId);
      
      if (reqA && reqB) {
        if (reqA.isRequired !== reqB.isRequired) {
          return reqA.isRequired ? -1 : 1;
        }
        return reqA.orderIndex - reqB.orderIndex;
      }
      return 0;
    });

    return recommendations.slice(0, maxCourses);
  }

  // Private helper methods

  private createCourseMapping(courseId: string, requirement: DegreeRequirement, isPrimary: boolean): CourseMapping {
    // This would typically fetch course details from a course service
    // For now, we'll create a basic mapping
    return {
      courseId,
      courseTitle: `Course for ${requirement.title}`,
      credits: requirement.credits,
      prerequisites: [], // Would be fetched from course service
      learningObjectives: [], // Would be fetched from course service
      spiritualObjectives: requirement.spiritualObjectives || [],
      practicalObjectives: requirement.practicalObjectives || [],
      propheticIntegration: [] // Would be calculated based on degree program
    };
  }

  private getPropheticIntegrationForRequirement(degreeProgram: DegreeProgram, requirementId: string): string[] {
    // Find relevant prophetic integration components for this requirement
    const integration: string[] = [];
    
    for (const component of degreeProgram.propheticIntegrationTrack.requiredComponents) {
      // This is a simplified mapping - in practice, you'd have more sophisticated logic
      integration.push(`${component.title}: ${component.description}`);
    }

    return integration;
  }

  private detectCircularPrerequisites(degreeProgram: DegreeProgram, requirementId: string, visited: Set<string> = new Set()): string[] {
    if (visited.has(requirementId)) {
      return [requirementId]; // Circular dependency found
    }

    visited.add(requirementId);
    const requirement = degreeProgram.requirements.find(req => req.id === requirementId);
    
    if (!requirement || !requirement.prerequisites) {
      visited.delete(requirementId);
      return [];
    }

    for (const prereqId of requirement.prerequisites) {
      const circular = this.detectCircularPrerequisites(degreeProgram, prereqId, visited);
      if (circular.length > 0) {
        circular.unshift(requirementId);
        return circular;
      }
    }

    visited.delete(requirementId);
    return [];
  }

  private buildPrerequisiteChain(
    degreeProgram: DegreeProgram, 
    requirementId: string, 
    visited: Set<string>, 
    chain: string[]
  ): void {
    if (visited.has(requirementId)) {
      return; // Avoid infinite loops
    }

    visited.add(requirementId);
    const requirement = degreeProgram.requirements.find(req => req.id === requirementId);
    
    if (!requirement || !requirement.prerequisites) {
      return;
    }

    for (const prereqId of requirement.prerequisites) {
      this.buildPrerequisiteChain(degreeProgram, prereqId, visited, chain);
      if (!chain.includes(prereqId)) {
        chain.push(prereqId);
      }
    }
  }
}