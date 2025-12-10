/**
 * ScrollProblem Identification Service
 * Manages real-world problem database and assignment algorithms
 * 
 * Requirements: 2.1, 7.1, 7.2
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import {
  ScrollProblem,
  ProblemCategory,
  ProblemComplexity,
  ProblemAssignment,
  ProblemAnalysisFramework,
  ProblemSelectionCriteria,
  StakeholderInfo
} from '../types/innovation.types';

const prisma = new PrismaClient();

export default class ScrollProblemIdentificationService {
  /**
   * Get all problems in the database
   */
  async getAllProblems(): Promise<ScrollProblem[]> {
    try {
      logger.info('Fetching all problems from database');

      const problems = await prisma.scrollProblem.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      return problems.map(p => this.mapProblemFromDb(p));
    } catch (error) {
      logger.error('Error fetching all problems', { error });
      throw new Error('Failed to fetch problems');
    }
  }

  /**
   * Get problem by ID
   */
  async getProblemById(problemId: string): Promise<ScrollProblem | null> {
    try {
      logger.info('Fetching problem by ID', { problemId });

      const problem = await prisma.scrollProblem.findUnique({
        where: { id: problemId }
      });

      if (!problem) return null;

      return this.mapProblemFromDb(problem);
    } catch (error) {
      logger.error('Error fetching problem by ID', { error, problemId });
      throw new Error('Failed to fetch problem');
    }
  }

  /**
   * Get problems by category
   */
  async getProblemsByCategory(category: ProblemCategory): Promise<ScrollProblem[]> {
    try {
      logger.info('Fetching problems by category', { category });

      const problems = await prisma.scrollProblem.findMany({
        where: {
          category,
          isActive: true
        },
        orderBy: { priority: 'desc' }
      });

      return problems.map(p => this.mapProblemFromDb(p));
    } catch (error) {
      logger.error('Error fetching problems by category', { error, category });
      throw new Error('Failed to fetch problems by category');
    }
  }

  /**
   * Create a new problem in the database
   */
  async createProblem(problemData: Omit<ScrollProblem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScrollProblem> {
    try {
      logger.info('Creating new problem', { title: problemData.title });

      const problem = await prisma.scrollProblem.create({
        data: {
          title: problemData.title,
          description: problemData.description,
          category: problemData.category,
          complexity: problemData.complexity,
          affectedPopulation: problemData.affectedPopulation,
          geographicScope: problemData.geographicScope,
          urgency: problemData.urgency,
          priority: problemData.priority,
          currentSolutions: JSON.stringify(problemData.currentSolutions),
          gaps: JSON.stringify(problemData.gaps),
          constraints: JSON.stringify(problemData.constraints),
          stakeholders: JSON.stringify(problemData.stakeholders),
          dataAvailable: JSON.stringify(problemData.dataAvailable),
          successMetrics: JSON.stringify(problemData.successMetrics),
          kingdomRelevance: problemData.kingdomRelevance,
          scripturalBasis: JSON.stringify(problemData.scripturalBasis),
          transformationalPotential: problemData.transformationalPotential,
          requiredSkills: problemData.requiredSkills,
          estimatedDuration: problemData.estimatedDuration,
          isActive: problemData.isActive
        }
      });

      logger.info('Problem created successfully', { problemId: problem.id });

      return this.mapProblemFromDb(problem);
    } catch (error) {
      logger.error('Error creating problem', { error, problemData });
      throw new Error('Failed to create problem');
    }
  }

  /**
   * Select appropriate problem for a student or team based on criteria
   */
  async selectProblemForStudent(
    userId: string,
    criteria: ProblemSelectionCriteria
  ): Promise<ScrollProblem> {
    try {
      logger.info('Selecting problem for student', { userId, criteria });

      // Get student profile to understand their skills and interests
      const studentProfile = await this.getStudentProfile(userId);

      // Find problems matching criteria
      const matchingProblems = await this.findMatchingProblems(criteria, studentProfile);

      if (matchingProblems.length === 0) {
        throw new Error('No suitable problems found for the given criteria');
      }

      // Select best match using algorithm
      const selectedProblem = await this.selectBestMatch(matchingProblems, studentProfile);

      logger.info('Problem selected for student', {
        userId,
        problemId: selectedProblem.id,
        problemTitle: selectedProblem.title
      });

      return selectedProblem;
    } catch (error) {
      logger.error('Error selecting problem for student', { error, userId, criteria });
      throw new Error('Failed to select problem for student');
    }
  }

  /**
   * Assign problem to a student or team
   */
  async assignProblem(
    problemId: string,
    assigneeId: string,
    assigneeType: 'student' | 'team',
    deadline: Date
  ): Promise<ProblemAssignment> {
    try {
      logger.info('Assigning problem', { problemId, assigneeId, assigneeType });

      const assignment = await prisma.problemAssignment.create({
        data: {
          problemId,
          assigneeId,
          assigneeType,
          assignedAt: new Date(),
          deadline,
          status: 'assigned',
          progress: 0
        }
      });

      logger.info('Problem assigned successfully', { assignmentId: assignment.id });

      return {
        id: assignment.id,
        problemId: assignment.problemId,
        assigneeId: assignment.assigneeId,
        assigneeType: assignment.assigneeType as 'student' | 'team',
        assignedAt: assignment.assignedAt,
        deadline: assignment.deadline,
        status: assignment.status,
        progress: assignment.progress,
        milestones: [],
        feedback: []
      };
    } catch (error) {
      logger.error('Error assigning problem', { error, problemId, assigneeId });
      throw new Error('Failed to assign problem');
    }
  }

  /**
   * Get problem analysis framework for a specific problem
   */
  async getProblemAnalysisFramework(problemId: string): Promise<ProblemAnalysisFramework> {
    try {
      logger.info('Getting problem analysis framework', { problemId });

      const problem = await this.getProblemById(problemId);

      if (!problem) {
        throw new Error('Problem not found');
      }

      // Generate analysis framework based on problem characteristics
      const framework: ProblemAnalysisFramework = {
        problemId,
        analysisSteps: this.generateAnalysisSteps(problem),
        researchQuestions: this.generateResearchQuestions(problem),
        dataCollectionMethods: this.suggestDataCollectionMethods(problem),
        stakeholderAnalysis: this.createStakeholderAnalysis(problem),
        constraintMapping: this.mapConstraints(problem),
        successCriteria: problem.successMetrics,
        spiritualConsiderations: this.identifySpiritualConsiderations(problem)
      };

      logger.info('Problem analysis framework generated', { problemId });

      return framework;
    } catch (error) {
      logger.error('Error getting problem analysis framework', { error, problemId });
      throw new Error('Failed to get problem analysis framework');
    }
  }

  /**
   * Update problem assignment progress
   */
  async updateAssignmentProgress(
    assignmentId: string,
    progress: number,
    notes?: string
  ): Promise<void> {
    try {
      logger.info('Updating assignment progress', { assignmentId, progress });

      await prisma.problemAssignment.update({
        where: { id: assignmentId },
        data: {
          progress,
          notes,
          updatedAt: new Date()
        }
      });

      logger.info('Assignment progress updated', { assignmentId });
    } catch (error) {
      logger.error('Error updating assignment progress', { error, assignmentId });
      throw new Error('Failed to update assignment progress');
    }
  }

  /**
   * Get assignments for a student
   */
  async getStudentAssignments(userId: string): Promise<ProblemAssignment[]> {
    try {
      logger.info('Fetching student assignments', { userId });

      const assignments = await prisma.problemAssignment.findMany({
        where: {
          assigneeId: userId,
          assigneeType: 'student'
        },
        orderBy: { assignedAt: 'desc' }
      });

      return assignments.map(a => ({
        id: a.id,
        problemId: a.problemId,
        assigneeId: a.assigneeId,
        assigneeType: a.assigneeType as 'student' | 'team',
        assignedAt: a.assignedAt,
        deadline: a.deadline,
        status: a.status,
        progress: a.progress,
        milestones: [],
        feedback: []
      }));
    } catch (error) {
      logger.error('Error fetching student assignments', { error, userId });
      throw new Error('Failed to fetch student assignments');
    }
  }

  /**
   * Search problems by keywords
   */
  async searchProblems(keywords: string[]): Promise<ScrollProblem[]> {
    try {
      logger.info('Searching problems', { keywords });

      const problems = await prisma.scrollProblem.findMany({
        where: {
          isActive: true,
          OR: keywords.map(keyword => ({
            OR: [
              { title: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } }
            ]
          }))
        }
      });

      return problems.map(p => this.mapProblemFromDb(p));
    } catch (error) {
      logger.error('Error searching problems', { error, keywords });
      throw new Error('Failed to search problems');
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private mapProblemFromDb(dbProblem: any): ScrollProblem {
    return {
      id: dbProblem.id,
      title: dbProblem.title,
      description: dbProblem.description,
      category: dbProblem.category as ProblemCategory,
      complexity: dbProblem.complexity as ProblemComplexity,
      affectedPopulation: dbProblem.affectedPopulation,
      geographicScope: dbProblem.geographicScope,
      urgency: dbProblem.urgency,
      priority: dbProblem.priority,
      currentSolutions: this.parseJson(dbProblem.currentSolutions, []),
      gaps: this.parseJson(dbProblem.gaps, []),
      constraints: this.parseJson(dbProblem.constraints, []),
      stakeholders: this.parseJson(dbProblem.stakeholders, []),
      dataAvailable: this.parseJson(dbProblem.dataAvailable, []),
      successMetrics: this.parseJson(dbProblem.successMetrics, []),
      kingdomRelevance: dbProblem.kingdomRelevance,
      scripturalBasis: this.parseJson(dbProblem.scripturalBasis, []),
      transformationalPotential: dbProblem.transformationalPotential,
      requiredSkills: dbProblem.requiredSkills,
      estimatedDuration: dbProblem.estimatedDuration,
      isActive: dbProblem.isActive,
      createdAt: dbProblem.createdAt,
      updatedAt: dbProblem.updatedAt
    };
  }

  private parseJson(jsonString: any, defaultValue: any): any {
    if (typeof jsonString === 'string') {
      try {
        return JSON.parse(jsonString);
      } catch {
        return defaultValue;
      }
    }
    return jsonString || defaultValue;
  }

  private async getStudentProfile(userId: string): Promise<any> {
    // Get student's skills, interests, and past performance
    const profile = await prisma.criticalThinkingProfile.findUnique({
      where: { userId }
    });

    return profile || {
      skills: [],
      interests: [],
      level: 'foundation'
    };
  }

  private async findMatchingProblems(
    criteria: ProblemSelectionCriteria,
    studentProfile: any
  ): Promise<ScrollProblem[]> {
    const whereClause: any = {
      isActive: true
    };

    if (criteria.category) {
      whereClause.category = criteria.category;
    }

    if (criteria.complexity) {
      whereClause.complexity = criteria.complexity;
    }

    if (criteria.maxDuration) {
      whereClause.estimatedDuration = {
        lte: criteria.maxDuration
      };
    }

    const problems = await prisma.scrollProblem.findMany({
      where: whereClause,
      orderBy: { priority: 'desc' }
    });

    return problems.map(p => this.mapProblemFromDb(p));
  }

  private async selectBestMatch(
    problems: ScrollProblem[],
    studentProfile: any
  ): Promise<ScrollProblem> {
    // Score each problem based on student profile
    const scoredProblems = problems.map(problem => {
      let score = 0;

      // Match skills
      const skillMatch = this.calculateSkillMatch(
        problem.requiredSkills,
        studentProfile.skills || []
      );
      score += skillMatch * 0.4;

      // Match complexity to student level
      const complexityMatch = this.calculateComplexityMatch(
        problem.complexity,
        studentProfile.level || 'foundation'
      );
      score += complexityMatch * 0.3;

      // Priority weight
      score += (problem.priority / 10) * 0.3;

      return { problem, score };
    });

    // Sort by score and return best match
    scoredProblems.sort((a, b) => b.score - a.score);

    return scoredProblems[0].problem;
  }

  private calculateSkillMatch(requiredSkills: string[], studentSkills: string[]): number {
    if (requiredSkills.length === 0) return 0.5;

    const matchCount = requiredSkills.filter(skill =>
      studentSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    ).length;

    return matchCount / requiredSkills.length;
  }

  private calculateComplexityMatch(
    problemComplexity: ProblemComplexity,
    studentLevel: string
  ): number {
    const complexityLevels = {
      [ProblemComplexity.BEGINNER]: 1,
      [ProblemComplexity.INTERMEDIATE]: 2,
      [ProblemComplexity.ADVANCED]: 3,
      [ProblemComplexity.EXPERT]: 4
    };

    const studentLevels: { [key: string]: number } = {
      'foundation': 1,
      'intermediate': 2,
      'advanced': 3,
      'prophetic': 4,
      'governmental': 4
    };

    const problemLevel = complexityLevels[problemComplexity] || 2;
    const studentLevelNum = studentLevels[studentLevel] || 1;

    // Perfect match = 1.0, one level off = 0.7, two levels = 0.4, etc.
    const diff = Math.abs(problemLevel - studentLevelNum);
    return Math.max(0, 1 - (diff * 0.3));
  }

  private generateAnalysisSteps(problem: ScrollProblem): string[] {
    return [
      'Define the problem scope and boundaries',
      'Identify all stakeholders and their perspectives',
      'Research current solutions and their limitations',
      'Analyze root causes using systems thinking',
      'Examine spiritual and ethical dimensions',
      'Identify data sources and evidence',
      'Map constraints and opportunities',
      'Develop success criteria and metrics'
    ];
  }

  private generateResearchQuestions(problem: ScrollProblem): string[] {
    return [
      `What are the root causes of ${problem.title}?`,
      'Who is most affected and how?',
      'What solutions have been tried and why did they succeed or fail?',
      'What resources and constraints exist?',
      'What are the spiritual and ethical considerations?',
      'How can technology and innovation help?',
      'What would success look like?',
      'How can this solution advance the kingdom?'
    ];
  }

  private suggestDataCollectionMethods(problem: ScrollProblem): string[] {
    const methods = [
      'Literature review and research synthesis',
      'Stakeholder interviews and surveys',
      'Data analysis and statistical modeling',
      'Case study analysis',
      'Field observations and ethnography'
    ];

    // Add category-specific methods
    if (problem.category === ProblemCategory.CLIMATE_SOLUTIONS) {
      methods.push('Environmental data collection', 'Climate modeling');
    } else if (problem.category === ProblemCategory.HEALTH_ACCESS) {
      methods.push('Health surveys', 'Medical records analysis');
    } else if (problem.category === ProblemCategory.BIBLICAL_LITERACY) {
      methods.push('Scripture study', 'Theological research');
    }

    return methods;
  }

  private createStakeholderAnalysis(problem: ScrollProblem): StakeholderInfo[] {
    return problem.stakeholders.map((stakeholder: string) => ({
      name: stakeholder,
      role: 'Stakeholder',
      interests: ['Problem resolution', 'Positive outcomes'],
      influence: 'Medium',
      engagement: 'Active'
    }));
  }

  private mapConstraints(problem: ScrollProblem): { [key: string]: string } {
    const constraintMap: { [key: string]: string } = {};

    problem.constraints.forEach((constraint: string, index: number) => {
      constraintMap[`constraint_${index + 1}`] = constraint;
    });

    return constraintMap;
  }

  private identifySpiritualConsiderations(problem: ScrollProblem): string[] {
    const considerations = [
      'How does this problem relate to kingdom values?',
      'What does Scripture say about this issue?',
      'How can we demonstrate love and truth?',
      'What is the prophetic perspective?',
      'How does this advance God\'s purposes?'
    ];

    // Add scriptural basis
    problem.scripturalBasis.forEach((verse: string) => {
      considerations.push(`Consider ${verse}`);
    });

    return considerations;
  }
}
