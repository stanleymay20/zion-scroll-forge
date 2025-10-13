/**
 * Spiritual Alignment Validator
 * Ensures all courses maintain scroll-authenticated quality, kingdom power,
 * prophetic purpose, and eternal usefulness
 */

import {
  ScrollCourse,
  ScrollAuthentication,
  PropheticValidation,
  QualityMetrics,
  PropheticAlignment,
  KingdomImpact,
  SpiritualObjective,
  BiblicalFoundation,
  PropheticSource,
  DivineGuidanceLevel,
  TransformationArea,
  SpiritualDiscipline
} from '../types/curriculum-grid';

export interface ValidationCriteria {
  minimumPropheticAlignment: number;
  minimumKingdomImpact: number;
  minimumSpiritualAlignment: number;
  requiredBiblicalFoundations: number;
  requiredSpiritualObjectives: number;
  requiresPropheticValidation: boolean;
  requiresDivineApproval: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  overallScore: number;
  validationDetails: ValidationDetails;
  recommendations: ValidationRecommendation[];
  warnings: ValidationWarning[];
  errors: ValidationError[];
}

export interface ValidationDetails {
  propheticAlignmentScore: number;
  kingdomImpactScore: number;
  spiritualAlignmentScore: number;
  biblicalFoundationScore: number;
  spiritualObjectiveScore: number;
  divineGuidanceScore: number;
  transformationPotentialScore: number;
}

export interface ValidationRecommendation {
  category: ValidationCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  actionRequired: string;
  expectedImprovement: number;
}

export interface ValidationWarning {
  category: ValidationCategory;
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestedAction: string;
}

export interface ValidationError {
  category: ValidationCategory;
  message: string;
  field: string;
  currentValue: any;
  expectedValue: any;
  isBlocking: boolean;
}

export enum ValidationCategory {
  PROPHETIC_ALIGNMENT = 'prophetic_alignment',
  KINGDOM_IMPACT = 'kingdom_impact',
  SPIRITUAL_OBJECTIVES = 'spiritual_objectives',
  BIBLICAL_FOUNDATION = 'biblical_foundation',
  DIVINE_GUIDANCE = 'divine_guidance',
  TRANSFORMATION_POTENTIAL = 'transformation_potential',
  SCROLL_AUTHENTICATION = 'scroll_authentication'
}

export class SpiritualAlignmentValidator {
  private defaultCriteria: ValidationCriteria = {
    minimumPropheticAlignment: 70,
    minimumKingdomImpact: 65,
    minimumSpiritualAlignment: 75,
    requiredBiblicalFoundations: 3,
    requiredSpiritualObjectives: 2,
    requiresPropheticValidation: true,
    requiresDivineApproval: true
  };

  private propheticValidators: string[] = [
    'Prophet Council',
    'Scroll Elders',
    'Divine Revelation Team',
    'Prophetic Oversight Board'
  ];

  /**
   * Validate course spiritual alignment and scroll authentication
   */
  async validateCourse(
    course: ScrollCourse,
    criteria: ValidationCriteria = this.defaultCriteria
  ): Promise<ValidationResult> {
    const validationDetails = await this.performDetailedValidation(course, criteria);
    const recommendations = this.generateRecommendations(course, validationDetails, criteria);
    const warnings = this.generateWarnings(course, validationDetails, criteria);
    const errors = this.generateErrors(course, validationDetails, criteria);

    const overallScore = this.calculateOverallScore(validationDetails);
    const isValid = this.determineValidityStatus(validationDetails, criteria, errors);

    return {
      isValid,
      overallScore,
      validationDetails,
      recommendations,
      warnings,
      errors
    };
  }

  /**
   * Perform scroll authentication for a course
   */
  async performScrollAuthentication(course: ScrollCourse): Promise<ScrollAuthentication> {
    const validationResult = await this.validateCourse(course);
    
    const propheticValidation = await this.performPropheticValidation(course);
    const kingdomPowerLevel = this.calculateKingdomPowerLevel(course, validationResult);
    const divineApproval = this.assessDivineApproval(course, validationResult);

    return {
      isAuthenticated: validationResult.isValid && divineApproval,
      authenticatedBy: 'ScrollCatalog Spiritual Validator',
      authenticationDate: new Date(),
      propheticValidation,
      kingdomPowerLevel,
      divineApproval
    };
  }

  /**
   * Validate prophetic accuracy and biblical alignment
   */
  async performPropheticValidation(course: ScrollCourse): Promise<PropheticValidation> {
    const propheticAccuracy = this.assessPropheticAccuracy(course);
    const biblicalAlignment = this.assessBiblicalAlignment(course);
    const divineConfirmation = this.assessDivineConfirmation(course);

    return {
      isValidated: propheticAccuracy >= 80 && biblicalAlignment >= 85,
      validatedBy: this.selectPropheticValidators(course),
      validationDate: new Date(),
      propheticAccuracy,
      biblicalAlignment,
      divineConfirmation
    };
  }

  /**
   * Generate quality metrics for a course
   */
  async generateQualityMetrics(course: ScrollCourse): Promise<QualityMetrics> {
    const scrollAuthentication = await this.performScrollAuthentication(course);
    const validationResult = await this.validateCourse(course);

    return {
      scrollAuthentication,
      spiritualAlignment: validationResult.validationDetails.spiritualAlignmentScore,
      academicRigor: this.assessAcademicRigor(course),
      practicalApplication: this.assessPracticalApplication(course),
      kingdomRelevance: validationResult.validationDetails.kingdomImpactScore,
      propheticAccuracy: scrollAuthentication.propheticValidation.propheticAccuracy,
      studentOutcomes: {
        completionRate: 0, // Would be populated from actual data
        averageGrade: 0,
        kingdomImpactScore: 0,
        spiritualGrowthMeasure: 0,
        careerAdvancement: 0
      }
    };
  }

  /**
   * Validate course updates for spiritual drift
   */
  async validateCourseUpdate(
    originalCourse: ScrollCourse,
    updatedCourse: ScrollCourse
  ): Promise<ValidationResult> {
    const originalValidation = await this.validateCourse(originalCourse);
    const updatedValidation = await this.validateCourse(updatedCourse);

    // Check for spiritual drift
    const driftWarnings = this.detectSpiritualDrift(originalValidation, updatedValidation);
    
    return {
      ...updatedValidation,
      warnings: [...updatedValidation.warnings, ...driftWarnings]
    };
  }

  // Private validation methods

  private async performDetailedValidation(
    course: ScrollCourse,
    criteria: ValidationCriteria
  ): Promise<ValidationDetails> {
    return {
      propheticAlignmentScore: this.validatePropheticAlignment(course),
      kingdomImpactScore: this.validateKingdomImpact(course),
      spiritualAlignmentScore: this.validateSpiritualAlignment(course),
      biblicalFoundationScore: this.validateBiblicalFoundations(course),
      spiritualObjectiveScore: this.validateSpiritualObjectives(course),
      divineGuidanceScore: this.validateDivineGuidance(course),
      transformationPotentialScore: this.validateTransformationPotential(course)
    };
  }

  private validatePropheticAlignment(course: ScrollCourse): number {
    const alignment = course.propheticAlignment;
    let score = alignment.alignmentScore;

    // Boost score based on prophetic themes
    if (alignment.propheticThemes.length >= 3) score += 5;
    if (alignment.propheticThemes.length >= 5) score += 5;

    // Boost score based on biblical foundations
    if (alignment.biblicalFoundation.length >= 3) score += 10;
    if (alignment.biblicalFoundation.length >= 5) score += 5;

    // Boost score based on divine guidance level
    switch (alignment.divineGuidanceLevel) {
      case DivineGuidanceLevel.REVELATORY:
        score += 15;
        break;
      case DivineGuidanceLevel.PROPHETIC:
        score += 10;
        break;
      case DivineGuidanceLevel.INSPIRED:
        score += 5;
        break;
    }

    return Math.min(score, 100);
  }

  private validateKingdomImpact(course: ScrollCourse): number {
    const impact = course.kingdomImpact;
    let score = impact.impactScore;

    // Boost score based on transformation areas
    const transformationBonus = impact.transformationAreas.length * 2;
    score += transformationBonus;

    // Boost score based on specific impact metrics
    score += impact.nationBuildingPotential * 0.1;
    score += impact.healingCapacity * 0.1;
    score += impact.governanceContribution * 0.1;

    return Math.min(score, 100);
  }

  private validateSpiritualAlignment(course: ScrollCourse): number {
    let score = 0;

    // Check spiritual objectives quality
    const spiritualObjectiveScore = this.validateSpiritualObjectives(course);
    score += spiritualObjectiveScore * 0.4;

    // Check biblical foundation strength
    const biblicalScore = this.validateBiblicalFoundations(course);
    score += biblicalScore * 0.3;

    // Check prophetic alignment
    const propheticScore = course.propheticAlignment.alignmentScore;
    score += propheticScore * 0.3;

    return Math.min(score, 100);
  }

  private validateBiblicalFoundations(course: ScrollCourse): number {
    const foundations = course.propheticAlignment.biblicalFoundation;
    let score = 0;

    // Base score for having foundations
    if (foundations.length > 0) score += 30;

    // Score based on quantity
    score += Math.min(foundations.length * 10, 40);

    // Score based on quality (simplified assessment)
    foundations.forEach(foundation => {
      if (foundation.reference && foundation.text) score += 5;
      if (foundation.application && foundation.propheticSignificance) score += 5;
    });

    return Math.min(score, 100);
  }

  private validateSpiritualObjectives(course: ScrollCourse): number {
    const objectives = course.spiritualObjectives;
    let score = 0;

    // Base score for having objectives
    if (objectives.length > 0) score += 20;

    // Score based on quantity
    score += Math.min(objectives.length * 15, 45);

    // Score based on diversity of spiritual disciplines
    const disciplines = new Set(objectives.map(obj => obj.spiritualDiscipline));
    score += disciplines.size * 5;

    // Score based on character development focus
    objectives.forEach(objective => {
      if (objective.characterDevelopment.length > 0) score += 5;
      if (objective.propheticActivation) score += 5;
    });

    return Math.min(score, 100);
  }

  private validateDivineGuidance(course: ScrollCourse): number {
    const guidanceLevel = course.propheticAlignment.divineGuidanceLevel;
    
    switch (guidanceLevel) {
      case DivineGuidanceLevel.REVELATORY: return 100;
      case DivineGuidanceLevel.PROPHETIC: return 85;
      case DivineGuidanceLevel.INSPIRED: return 70;
      case DivineGuidanceLevel.NATURAL: return 50;
      default: return 40;
    }
  }

  private validateTransformationPotential(course: ScrollCourse): number {
    const transformationAreas = course.kingdomImpact.transformationAreas;
    let score = 0;

    // Score based on breadth of transformation
    score += transformationAreas.length * 10;

    // Bonus for specific high-impact areas
    if (transformationAreas.includes(TransformationArea.NATIONAL)) score += 15;
    if (transformationAreas.includes(TransformationArea.GLOBAL)) score += 20;
    if (transformationAreas.includes(TransformationArea.SPIRITUAL)) score += 10;

    // Score based on overall kingdom impact
    score += course.kingdomImpact.impactScore * 0.3;

    return Math.min(score, 100);
  }

  private calculateOverallScore(details: ValidationDetails): number {
    const weights = {
      propheticAlignment: 0.25,
      kingdomImpact: 0.20,
      spiritualAlignment: 0.20,
      biblicalFoundation: 0.15,
      spiritualObjectives: 0.10,
      divineGuidance: 0.05,
      transformationPotential: 0.05
    };

    return Math.round(
      details.propheticAlignmentScore * weights.propheticAlignment +
      details.kingdomImpactScore * weights.kingdomImpact +
      details.spiritualAlignmentScore * weights.spiritualAlignment +
      details.biblicalFoundationScore * weights.biblicalFoundation +
      details.spiritualObjectiveScore * weights.spiritualObjectives +
      details.divineGuidanceScore * weights.divineGuidance +
      details.transformationPotentialScore * weights.transformationPotential
    );
  }

  private determineValidityStatus(
    details: ValidationDetails,
    criteria: ValidationCriteria,
    errors: ValidationError[]
  ): boolean {
    // Check for blocking errors
    if (errors.some(error => error.isBlocking)) return false;

    // Check minimum criteria
    if (details.propheticAlignmentScore < criteria.minimumPropheticAlignment) return false;
    if (details.kingdomImpactScore < criteria.minimumKingdomImpact) return false;
    if (details.spiritualAlignmentScore < criteria.minimumSpiritualAlignment) return false;

    return true;
  }

  private generateRecommendations(
    course: ScrollCourse,
    details: ValidationDetails,
    criteria: ValidationCriteria
  ): ValidationRecommendation[] {
    const recommendations: ValidationRecommendation[] = [];

    // Prophetic alignment recommendations
    if (details.propheticAlignmentScore < criteria.minimumPropheticAlignment) {
      recommendations.push({
        category: ValidationCategory.PROPHETIC_ALIGNMENT,
        priority: 'high',
        recommendation: 'Strengthen prophetic alignment through additional biblical foundations and prophetic themes',
        actionRequired: 'Add more biblical references and seek prophetic input',
        expectedImprovement: 15
      });
    }

    // Kingdom impact recommendations
    if (details.kingdomImpactScore < criteria.minimumKingdomImpact) {
      recommendations.push({
        category: ValidationCategory.KINGDOM_IMPACT,
        priority: 'high',
        recommendation: 'Enhance kingdom impact potential through practical applications',
        actionRequired: 'Add real-world transformation examples and measurable outcomes',
        expectedImprovement: 20
      });
    }

    // Spiritual objectives recommendations
    if (course.spiritualObjectives.length < criteria.requiredSpiritualObjectives) {
      recommendations.push({
        category: ValidationCategory.SPIRITUAL_OBJECTIVES,
        priority: 'medium',
        recommendation: 'Add more comprehensive spiritual formation objectives',
        actionRequired: `Add ${criteria.requiredSpiritualObjectives - course.spiritualObjectives.length} more spiritual objectives`,
        expectedImprovement: 10
      });
    }

    // Biblical foundation recommendations
    if (course.propheticAlignment.biblicalFoundation.length < criteria.requiredBiblicalFoundations) {
      recommendations.push({
        category: ValidationCategory.BIBLICAL_FOUNDATION,
        priority: 'medium',
        recommendation: 'Strengthen biblical foundation with additional scripture references',
        actionRequired: `Add ${criteria.requiredBiblicalFoundations - course.propheticAlignment.biblicalFoundation.length} more biblical foundations`,
        expectedImprovement: 12
      });
    }

    return recommendations;
  }

  private generateWarnings(
    course: ScrollCourse,
    details: ValidationDetails,
    criteria: ValidationCriteria
  ): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Low divine guidance warning
    if (details.divineGuidanceScore < 70) {
      warnings.push({
        category: ValidationCategory.DIVINE_GUIDANCE,
        message: 'Course may benefit from stronger divine guidance and prophetic input',
        severity: 'medium',
        suggestedAction: 'Seek additional prophetic validation and divine direction'
      });
    }

    // Limited transformation potential warning
    if (details.transformationPotentialScore < 60) {
      warnings.push({
        category: ValidationCategory.TRANSFORMATION_POTENTIAL,
        message: 'Course transformation potential could be enhanced',
        severity: 'low',
        suggestedAction: 'Consider adding more practical kingdom applications'
      });
    }

    return warnings;
  }

  private generateErrors(
    course: ScrollCourse,
    details: ValidationDetails,
    criteria: ValidationCriteria
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Critical prophetic alignment error
    if (details.propheticAlignmentScore < 50) {
      errors.push({
        category: ValidationCategory.PROPHETIC_ALIGNMENT,
        message: 'Course fails minimum prophetic alignment requirements',
        field: 'propheticAlignment',
        currentValue: details.propheticAlignmentScore,
        expectedValue: criteria.minimumPropheticAlignment,
        isBlocking: true
      });
    }

    // Missing spiritual objectives error
    if (course.spiritualObjectives.length === 0) {
      errors.push({
        category: ValidationCategory.SPIRITUAL_OBJECTIVES,
        message: 'Course must have at least one spiritual objective',
        field: 'spiritualObjectives',
        currentValue: course.spiritualObjectives.length,
        expectedValue: 1,
        isBlocking: true
      });
    }

    return errors;
  }

  private detectSpiritualDrift(
    originalValidation: ValidationResult,
    updatedValidation: ValidationResult
  ): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    const threshold = 10; // Score decrease threshold for drift detection

    // Check for prophetic alignment drift
    const propheticDrift = originalValidation.validationDetails.propheticAlignmentScore - 
                          updatedValidation.validationDetails.propheticAlignmentScore;
    if (propheticDrift > threshold) {
      warnings.push({
        category: ValidationCategory.PROPHETIC_ALIGNMENT,
        message: `Prophetic alignment decreased by ${propheticDrift} points`,
        severity: 'high',
        suggestedAction: 'Review changes for spiritual drift and restore prophetic alignment'
      });
    }

    // Check for kingdom impact drift
    const kingdomDrift = originalValidation.validationDetails.kingdomImpactScore - 
                        updatedValidation.validationDetails.kingdomImpactScore;
    if (kingdomDrift > threshold) {
      warnings.push({
        category: ValidationCategory.KINGDOM_IMPACT,
        message: `Kingdom impact score decreased by ${kingdomDrift} points`,
        severity: 'high',
        suggestedAction: 'Restore kingdom impact focus and practical applications'
      });
    }

    return warnings;
  }

  private assessPropheticAccuracy(course: ScrollCourse): number {
    // Simplified prophetic accuracy assessment
    let accuracy = course.propheticAlignment.alignmentScore;
    
    // Boost for strong biblical foundation
    if (course.propheticAlignment.biblicalFoundation.length >= 5) accuracy += 10;
    
    // Boost for revelatory guidance
    if (course.propheticAlignment.divineGuidanceLevel === DivineGuidanceLevel.REVELATORY) accuracy += 15;
    
    return Math.min(accuracy, 100);
  }

  private assessBiblicalAlignment(course: ScrollCourse): number {
    const foundations = course.propheticAlignment.biblicalFoundation;
    let alignment = 70; // Base alignment score

    // Score based on quantity and quality of biblical foundations
    alignment += Math.min(foundations.length * 5, 25);
    
    // Check for comprehensive biblical coverage
    foundations.forEach(foundation => {
      if (foundation.application && foundation.propheticSignificance) {
        alignment += 2;
      }
    });

    return Math.min(alignment, 100);
  }

  private assessDivineConfirmation(course: ScrollCourse): boolean {
    // Simplified divine confirmation assessment
    return course.propheticAlignment.alignmentScore >= 80 &&
           course.kingdomImpact.impactScore >= 70 &&
           course.propheticAlignment.divineGuidanceLevel !== DivineGuidanceLevel.NATURAL;
  }

  private calculateKingdomPowerLevel(course: ScrollCourse, validationResult: ValidationResult): number {
    return Math.round(
      validationResult.overallScore * 0.7 +
      course.kingdomImpact.impactScore * 0.3
    );
  }

  private assessDivineApproval(course: ScrollCourse, validationResult: ValidationResult): boolean {
    return validationResult.isValid && 
           validationResult.overallScore >= 75 &&
           course.propheticAlignment.alignmentScore >= 70;
  }

  private selectPropheticValidators(course: ScrollCourse): string[] {
    // Select appropriate validators based on course content and level
    const validators = [...this.propheticValidators];
    
    // Add specific validators based on faculty
    if (course.faculty.includes('Theology')) {
      validators.push('Biblical Scholars Council');
    }
    if (course.faculty.includes('Prophetic')) {
      validators.push('Prophetic Oversight Board');
    }
    
    return validators.slice(0, 2); // Return top 2 validators
  }

  private assessAcademicRigor(course: ScrollCourse): number {
    let rigor = 70; // Base rigor score

    // Boost for comprehensive learning objectives
    rigor += Math.min(course.learningObjectives.length * 2, 15);

    // Boost for advanced assessment methods
    const advancedAssessments = course.assessmentMethods.filter(method => 
      method.type === 'project' || method.type === 'scroll_defense'
    );
    rigor += advancedAssessments.length * 5;

    // Boost for estimated hours (indicates depth)
    if (course.estimatedHours >= 40) rigor += 10;
    if (course.estimatedHours >= 80) rigor += 5;

    return Math.min(rigor, 100);
  }

  private assessPracticalApplication(course: ScrollCourse): number {
    let practical = 60; // Base practical score

    // Boost for practical components in content framework
    if (course.contentFramework.practicalComponents.length > 0) {
      practical += course.contentFramework.practicalComponents.length * 10;
    }

    // Boost for XR experiences
    if (course.contentFramework.xrExperiences.length > 0) {
      practical += course.contentFramework.xrExperiences.length * 8;
    }

    // Boost for kingdom impact applications
    practical += course.kingdomImpact.impactScore * 0.2;

    return Math.min(practical, 100);
  }

  /**
   * Validate content for spiritual alignment (simplified version for general content)
   */
  async validateContent(content: string, contentType: string): Promise<boolean> {
    try {
      // Simple validation based on content analysis
      const spiritualKeywords = [
        'spiritual', 'kingdom', 'prophetic', 'divine', 'biblical', 'christian',
        'faith', 'prayer', 'worship', 'ministry', 'calling', 'purpose',
        'transformation', 'discipleship', 'stewardship', 'service'
      ];

      const negativeKeywords = [
        'secular', 'worldly', 'ungodly', 'immoral', 'unethical'
      ];

      const contentLower = content.toLowerCase();
      
      // Count spiritual keywords
      const spiritualCount = spiritualKeywords.filter(keyword => 
        contentLower.includes(keyword)
      ).length;

      // Count negative keywords
      const negativeCount = negativeKeywords.filter(keyword => 
        contentLower.includes(keyword)
      ).length;

      // Simple scoring: must have spiritual content and minimal negative content
      const spiritualScore = spiritualCount * 10;
      const negativeScore = negativeCount * 20;
      
      const finalScore = spiritualScore - negativeScore;
      
      // Content is valid if it has spiritual alignment and minimal negative content
      return finalScore >= 20 && negativeCount <= 1;
      
    } catch (error) {
      console.error('Error validating content:', error);
      return false;
    }
  }
}