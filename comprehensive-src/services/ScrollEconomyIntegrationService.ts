/**
 * ScrollEconomy Integration Service
 * Integrates ScrollEconomy Faculty with the main curriculum grid system
 */

import { PrismaClient } from '@prisma/client';
import { ScrollEconomyFacultyService } from './ScrollEconomyFacultyService';
import { MasterCourseCatalogService } from './MasterCourseCatalogService';
import {
  SupremeScrollFaculty,
  ScrollCourse,
  FacultyConfiguration,
  CourseSearchCriteria,
  CourseSearchResult
} from '../types/curriculum-grid';

export class ScrollEconomyIntegrationService {
  private prisma: PrismaClient;
  private scrollEconomyService: ScrollEconomyFacultyService;
  private masterCatalogService: MasterCourseCatalogService;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
    this.scrollEconomyService = new ScrollEconomyFacultyService(this.prisma);
    this.masterCatalogService = new MasterCourseCatalogService(this.prisma);
  }

  /**
   * Initialize ScrollEconomy Faculty in the main curriculum grid
   */
  async initializeScrollEconomyInCurriculumGrid(): Promise<{
    success: boolean;
    facultyConfiguration: FacultyConfiguration;
    coursesCreated: number;
    integrationStatus: string;
  }> {
    try {
      // Initialize the complete ScrollEconomy faculty
      const facultyResult = await this.scrollEconomyService.initializeCompleteFaculty();

      // Register faculty with master catalog
      await this.masterCatalogService.initializeDatabaseFaculties();

      // Add all courses to the master catalog
      const allCourses = [
        ...facultyResult.foundationalCourses,
        ...facultyResult.advancedCourses,
        ...facultyResult.practicalLabs
      ];

      let coursesAdded = 0;
      for (const course of allCourses) {
        try {
          await this.masterCatalogService.addCourse(course);
          coursesAdded++;
        } catch (error) {
          console.error(`Failed to add course ${course.courseCode}:`, error);
        }
      }

      return {
        success: true,
        facultyConfiguration: facultyResult.facultyConfiguration,
        coursesCreated: coursesAdded,
        integrationStatus: `Successfully integrated ScrollEconomy Faculty with ${coursesAdded} courses`
      };

    } catch (error) {
      console.error('Failed to initialize ScrollEconomy in curriculum grid:', error);
      return {
        success: false,
        facultyConfiguration: this.scrollEconomyService.getFacultyConfiguration(),
        coursesCreated: 0,
        integrationStatus: `Integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Search ScrollEconomy courses specifically
   */
  async searchScrollEconomyCourses(criteria: Partial<CourseSearchCriteria>): Promise<CourseSearchResult> {
    const scrollEconomyCriteria: CourseSearchCriteria = {
      ...criteria,
      faculty: [SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE]
    };

    return await this.masterCatalogService.searchCourses(scrollEconomyCriteria);
  }

  /**
   * Get ScrollEconomy faculty statistics
   */
  async getScrollEconomyStatistics(): Promise<{
    facultyName: string;
    totalCourses: number;
    targetCourses: number;
    progress: number;
    departmentBreakdown: Array<{
      department: string;
      courseCount: number;
      focus: string;
    }>;
    specializations: Array<{
      name: string;
      requiredCourses: number;
      electiveCourses: number;
    }>;
    scrollCoinIntegration: {
      coursesWithScrollCoin: number;
      totalScrollCoinRewards: number;
      averageCost: number;
    };
  }> {
    const config = this.scrollEconomyService.getFacultyConfiguration();
    const courses = await this.masterCatalogService.getCoursesByFaculty(
      SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE
    );

    // Calculate ScrollCoin statistics
    const coursesWithScrollCoin = courses.filter(c => 
      c.scrollCoinCost !== undefined || c.xpReward > 0
    ).length;
    
    const totalScrollCoinRewards = courses.reduce((sum, c) => sum + (c.xpReward || 0), 0);
    const totalScrollCoinCosts = courses.reduce((sum, c) => sum + (c.scrollCoinCost || 0), 0);
    const averageCost = courses.length > 0 ? totalScrollCoinCosts / courses.length : 0;

    return {
      facultyName: config.faculty,
      totalCourses: courses.length,
      targetCourses: config.targetCourseCount,
      progress: (courses.length / config.targetCourseCount) * 100,
      departmentBreakdown: config.departments.map(dept => ({
        department: dept.name,
        courseCount: courses.filter(c => c.department === dept.name).length,
        focus: dept.focus
      })),
      specializations: config.specializations.map(spec => ({
        name: spec.name,
        requiredCourses: spec.requiredCourses.length,
        electiveCourses: spec.electiveCourses.length
      })),
      scrollCoinIntegration: {
        coursesWithScrollCoin,
        totalScrollCoinRewards,
        averageCost: Math.round(averageCost)
      }
    };
  }

  /**
   * Get recommended learning path for ScrollEconomy
   */
  getScrollEconomyLearningPath(): Array<{
    phase: string;
    description: string;
    courses: string[];
    estimatedDuration: string;
    prerequisites: string[];
    outcomes: string[];
  }> {
    return [
      {
        phase: 'Foundation Phase',
        description: 'Build biblical foundation for kingdom economics',
        courses: ['SEC101', 'SEC150'],
        estimatedDuration: '8-12 weeks',
        prerequisites: [],
        outcomes: [
          'Understand biblical economic principles',
          'Recognize covenant vs Babylonian economics',
          'Set up ScrollCoin wallet',
          'Practice basic kingdom stewardship'
        ]
      },
      {
        phase: 'Digital Currency Phase',
        description: 'Master ScrollCoin and digital currency principles',
        courses: ['SEC205', 'SEC305'],
        estimatedDuration: '6-10 weeks',
        prerequisites: ['SEC101'],
        outcomes: [
          'Compare digital currencies with ScrollCoin',
          'Understand blockchain technology',
          'Execute ScrollCoin transactions',
          'Apply divine currency principles'
        ]
      },
      {
        phase: 'Advanced Application Phase',
        description: 'Apply kingdom economics to complex systems',
        courses: ['SEC310', 'SEC350', 'SEC401'],
        estimatedDuration: '12-16 weeks',
        prerequisites: ['SEC205', 'SEC305'],
        outcomes: [
          'Design kingdom trade systems',
          'Analyze global economic systems',
          'Develop prophetic economic insight',
          'Create kingdom business models'
        ]
      },
      {
        phase: 'Mastery Phase',
        description: 'Achieve mastery in prophetic economics and financial reformation',
        courses: ['SEC402', 'SEC450', 'SEC501'],
        estimatedDuration: '10-14 weeks',
        prerequisites: ['SEC310', 'SEC401'],
        outcomes: [
          'Apply prophetic insight to financial markets',
          'Lead financial reformation initiatives',
          'Mentor others in kingdom economics',
          'Contribute to ScrollEconomy development'
        ]
      },
      {
        phase: 'Practical Implementation Phase',
        description: 'Build real-world kingdom economic systems',
        courses: ['SECLAB01', 'SECCERT', 'SECPRAC'],
        estimatedDuration: '16-20 weeks',
        prerequisites: ['SEC205', 'SEC310'],
        outcomes: [
          'Build functional ScrollBank prototype',
          'Implement kingdom accounting systems',
          'Deploy community economic solutions',
          'Earn ScrollEconomy certification'
        ]
      }
    ];
  }

  /**
   * Validate ScrollEconomy integration
   */
  async validateScrollEconomyIntegration(): Promise<{
    isValid: boolean;
    validationResults: Array<{
      check: string;
      passed: boolean;
      details: string;
    }>;
    overallScore: number;
  }> {
    const validationResults = [];
    let passedChecks = 0;
    const totalChecks = 8;

    // Check 1: Faculty configuration exists
    try {
      const config = this.scrollEconomyService.getFacultyConfiguration();
      validationResults.push({
        check: 'Faculty Configuration',
        passed: config.faculty === SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE,
        details: config ? 'Faculty configuration loaded successfully' : 'Faculty configuration missing'
      });
      if (config.faculty === SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE) passedChecks++;
    } catch (error) {
      validationResults.push({
        check: 'Faculty Configuration',
        passed: false,
        details: `Failed to load faculty configuration: ${error}`
      });
    }

    // Check 2: Required foundational courses exist
    try {
      const foundationalCourses = await this.scrollEconomyService.createFoundationalCourses();
      const hasRequiredCourses = foundationalCourses.some(c => c.courseCode === 'SEC101') &&
                                foundationalCourses.some(c => c.courseCode === 'SEC205');
      validationResults.push({
        check: 'Required Foundational Courses',
        passed: hasRequiredCourses,
        details: hasRequiredCourses ? 'SEC101 and SEC205 courses created' : 'Missing required foundational courses'
      });
      if (hasRequiredCourses) passedChecks++;
    } catch (error) {
      validationResults.push({
        check: 'Required Foundational Courses',
        passed: false,
        details: `Failed to create foundational courses: ${error}`
      });
    }

    // Check 3: Advanced courses exist
    try {
      const advancedCourses = await this.scrollEconomyService.createAdvancedCourses();
      const hasAdvancedCourses = advancedCourses.some(c => c.courseCode === 'SEC310') &&
                               advancedCourses.some(c => c.courseCode === 'SEC402');
      validationResults.push({
        check: 'Advanced Courses',
        passed: hasAdvancedCourses,
        details: hasAdvancedCourses ? 'SEC310 and SEC402 courses created' : 'Missing required advanced courses'
      });
      if (hasAdvancedCourses) passedChecks++;
    } catch (error) {
      validationResults.push({
        check: 'Advanced Courses',
        passed: false,
        details: `Failed to create advanced courses: ${error}`
      });
    }

    // Check 4: Practical labs exist
    try {
      const practicalLabs = await this.scrollEconomyService.createPracticalLabs();
      const hasRequiredLabs = practicalLabs.some(c => c.courseCode === 'SECLAB01') &&
                             practicalLabs.some(c => c.courseCode === 'SECCERT');
      validationResults.push({
        check: 'Practical Labs',
        passed: hasRequiredLabs,
        details: hasRequiredLabs ? 'SECLAB01 and SECCERT labs created' : 'Missing required practical labs'
      });
      if (hasRequiredLabs) passedChecks++;
    } catch (error) {
      validationResults.push({
        check: 'Practical Labs',
        passed: false,
        details: `Failed to create practical labs: ${error}`
      });
    }

    // Check 5: ScrollCoin integration
    try {
      const foundationalCourses = await this.scrollEconomyService.createFoundationalCourses();
      const hasScrollCoinIntegration = foundationalCourses.every(c => 
        c.scrollCoinIntegration && c.scrollCoinIntegration.hasScrollCoinComponent
      );
      validationResults.push({
        check: 'ScrollCoin Integration',
        passed: hasScrollCoinIntegration,
        details: hasScrollCoinIntegration ? 'All courses have ScrollCoin integration' : 'Missing ScrollCoin integration'
      });
      if (hasScrollCoinIntegration) passedChecks++;
    } catch (error) {
      validationResults.push({
        check: 'ScrollCoin Integration',
        passed: false,
        details: `Failed to validate ScrollCoin integration: ${error}`
      });
    }

    // Check 6: Kingdom economics principles
    try {
      const foundationalCourses = await this.scrollEconomyService.createFoundationalCourses();
      const hasKingdomPrinciples = foundationalCourses.every(c => 
        c.kingdomEconomicsPrinciples && c.kingdomEconomicsPrinciples.length > 0
      );
      validationResults.push({
        check: 'Kingdom Economics Principles',
        passed: hasKingdomPrinciples,
        details: hasKingdomPrinciples ? 'All courses include kingdom economics principles' : 'Missing kingdom economics principles'
      });
      if (hasKingdomPrinciples) passedChecks++;
    } catch (error) {
      validationResults.push({
        check: 'Kingdom Economics Principles',
        passed: false,
        details: `Failed to validate kingdom economics principles: ${error}`
      });
    }

    // Check 7: Department structure
    try {
      const config = this.scrollEconomyService.getFacultyConfiguration();
      const hasRequiredDepartments = config.departments.length >= 5 &&
        config.departments.some(d => d.name.includes('Kingdom Economics')) &&
        config.departments.some(d => d.name.includes('ScrollCoin'));
      validationResults.push({
        check: 'Department Structure',
        passed: hasRequiredDepartments,
        details: hasRequiredDepartments ? 'Required departments configured' : 'Missing required departments'
      });
      if (hasRequiredDepartments) passedChecks++;
    } catch (error) {
      validationResults.push({
        check: 'Department Structure',
        passed: false,
        details: `Failed to validate department structure: ${error}`
      });
    }

    // Check 8: Specializations
    try {
      const config = this.scrollEconomyService.getFacultyConfiguration();
      const hasSpecializations = config.specializations.length >= 3 &&
        config.specializations.some(s => s.name.includes('Kingdom Economics')) &&
        config.specializations.some(s => s.name.includes('ScrollCoin'));
      validationResults.push({
        check: 'Specializations',
        passed: hasSpecializations,
        details: hasSpecializations ? 'Required specializations configured' : 'Missing required specializations'
      });
      if (hasSpecializations) passedChecks++;
    } catch (error) {
      validationResults.push({
        check: 'Specializations',
        passed: false,
        details: `Failed to validate specializations: ${error}`
      });
    }

    const overallScore = (passedChecks / totalChecks) * 100;
    const isValid = overallScore >= 80; // 80% pass rate required

    return {
      isValid,
      validationResults,
      overallScore: Math.round(overallScore)
    };
  }

  /**
   * Generate ScrollEconomy faculty report
   */
  async generateScrollEconomyReport(): Promise<{
    facultyOverview: {
      name: string;
      description: string;
      targetCourses: number;
      currentCourses: number;
      completionPercentage: number;
    };
    departments: Array<{
      name: string;
      head: string;
      focus: string;
      researchAreas: string[];
    }>;
    courseBreakdown: {
      foundational: number;
      advanced: number;
      practicalLabs: number;
      total: number;
    };
    scrollCoinMetrics: {
      totalRewards: number;
      averageCost: number;
      integrationRate: number;
    };
    kingdomImpact: {
      averageImpactScore: number;
      transformationAreas: string[];
      propheticAlignment: number;
    };
    recommendations: string[];
  }> {
    const config = this.scrollEconomyService.getFacultyConfiguration();
    const stats = await this.getScrollEconomyStatistics();
    
    // Get sample courses for analysis
    const foundationalCourses = await this.scrollEconomyService.createFoundationalCourses();
    const advancedCourses = await this.scrollEconomyService.createAdvancedCourses();
    const practicalLabs = await this.scrollEconomyService.createPracticalLabs();
    
    const allCourses = [...foundationalCourses, ...advancedCourses, ...practicalLabs];
    
    // Calculate metrics
    const averageImpactScore = allCourses.reduce((sum, c) => sum + c.kingdomImpact.impactScore, 0) / allCourses.length;
    const averagePropheticAlignment = allCourses.reduce((sum, c) => sum + c.propheticAlignment.alignmentScore, 0) / allCourses.length;
    
    const transformationAreas = [...new Set(
      allCourses.flatMap(c => c.kingdomImpact.transformationAreas)
    )];

    // Generate recommendations
    const recommendations = [];
    if (stats.progress < 10) {
      recommendations.push('Accelerate course development to meet 800+ course target');
    }
    if (stats.scrollCoinIntegration.averageCost === 0) {
      recommendations.push('Implement ScrollCoin pricing strategy for sustainability');
    }
    if (averageImpactScore < 85) {
      recommendations.push('Enhance kingdom impact focus in course design');
    }
    if (config.departments.length < 6) {
      recommendations.push('Consider adding specialized departments for emerging areas');
    }

    return {
      facultyOverview: {
        name: config.faculty,
        description: config.description,
        targetCourses: config.targetCourseCount,
        currentCourses: stats.totalCourses,
        completionPercentage: Math.round(stats.progress)
      },
      departments: config.departments.map(dept => ({
        name: dept.name,
        head: dept.head.name,
        focus: dept.focus,
        researchAreas: dept.researchAreas
      })),
      courseBreakdown: {
        foundational: foundationalCourses.length,
        advanced: advancedCourses.length,
        practicalLabs: practicalLabs.length,
        total: allCourses.length
      },
      scrollCoinMetrics: {
        totalRewards: stats.scrollCoinIntegration.totalScrollCoinRewards,
        averageCost: stats.scrollCoinIntegration.averageCost,
        integrationRate: Math.round((stats.scrollCoinIntegration.coursesWithScrollCoin / stats.totalCourses) * 100)
      },
      kingdomImpact: {
        averageImpactScore: Math.round(averageImpactScore),
        transformationAreas,
        propheticAlignment: Math.round(averagePropheticAlignment)
      },
      recommendations
    };
  }
}