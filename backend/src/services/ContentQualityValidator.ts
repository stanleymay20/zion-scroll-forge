/**
 * ContentQualityValidator - Enforces ScrollUniversity Royal Standard
 * 
 * CRITICAL: This validator prevents template placeholder content from
 * entering the course catalog. It's the gatekeeper for quality.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

export interface ContentToValidate {
  type: 'lecture' | 'module' | 'assessment' | 'course';
  content: any;
  context?: {
    courseCode?: string;
    moduleNumber?: number;
    lectureNumber?: number;
  };
}

export class ContentQualityValidator {
  
  // Template patterns that indicate low-quality generation
  private static TEMPLATE_PATTERNS = [
    /Concept \d+-\d+/gi,
    /Example \d+-\d+/gi,
    /Term \d+-\d+/gi,
    /Section \d+-\d+/gi,
    /Topic \d+-\d+/gi,
    /This is a placeholder/gi,
    /\[INSERT .+?\]/gi,
    /\[TODO.+?\]/gi,
    /Lorem ipsum/gi,
  ];

  // Generic phrases that indicate vague content
  private static VAGUE_PHRASES = [
    /generic example/gi,
    /practical example/gi,
    /detailed explanation/gi,
    /comprehensive coverage/gi,
    /in-depth analysis/gi,
    /real-world scenario/gi,
    /kingdom purposes/gi, // Only when standalone without specifics
  ];

  // Minimum content requirements
  private static MIN_LECTURE_WORDS = 1500;
  private static MIN_SCRIPTURE_REFERENCES = 2;
  private static MIN_SPECIFIC_TERMS = 5;

  /**
   * Validate lecture content
   */
  public static validateLecture(lecture: any, context?: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check for template patterns
    const templateViolations = this.detectTemplatePatterns(JSON.stringify(lecture));
    if (templateViolations.length > 0) {
      errors.push(`Template placeholders detected: ${templateViolations.join(', ')}`);
      score -= 50;
    }

    // Check for vague phrases
    const vagueContent = this.detectVaguePhrases(JSON.stringify(lecture));
    if (vagueContent.length > 3) {
      warnings.push(`Excessive vague phrases detected (${vagueContent.length})`);
      score -= 10;
    }

    // Check lecture notes content
    if (lecture.notes?.content) {
      const wordCount = this.countWords(lecture.notes.content);
      if (wordCount < this.MIN_LECTURE_WORDS) {
        errors.push(`Lecture notes too short: ${wordCount} words (minimum: ${this.MIN_LECTURE_WORDS})`);
        score -= 20;
      }
    } else {
      errors.push('Missing lecture notes content');
      score -= 30;
    }

    // Check for scripture references
    const scriptureCount = this.countScriptureReferences(lecture);
    if (scriptureCount < this.MIN_SCRIPTURE_REFERENCES) {
      warnings.push(`Insufficient scripture references: ${scriptureCount} (recommended: ${this.MIN_SCRIPTURE_REFERENCES}+)`);
      score -= 5;
    }

    // Check for domain-specific terminology
    const specificTerms = this.extractSpecificTerms(lecture);
    if (specificTerms.length < this.MIN_SPECIFIC_TERMS) {
      errors.push(`Insufficient domain-specific terminology: ${specificTerms.length} terms (minimum: ${this.MIN_SPECIFIC_TERMS})`);
      score -= 15;
    }

    // Check for concrete examples
    if (!this.hasConcreteExamples(lecture)) {
      warnings.push('Examples appear generic or lack specificity');
      score -= 10;
    }

    // Check for biblical integration
    if (!this.hasBiblicalIntegration(lecture)) {
      errors.push('Missing or insufficient biblical integration');
      score -= 20;
    }

    return {
      isValid: errors.length === 0 && score >= 70,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * Validate module content
   */
  public static validateModule(module: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check for template patterns in module
    const templateViolations = this.detectTemplatePatterns(JSON.stringify(module));
    if (templateViolations.length > 0) {
      errors.push(`Module contains template placeholders: ${templateViolations.join(', ')}`);
      score -= 40;
    }

    // Validate each lecture in module
    if (module.lectures && Array.isArray(module.lectures)) {
      let lectureScores: number[] = [];
      
      module.lectures.forEach((lecture: any, index: number) => {
        const lectureResult = this.validateLecture(lecture, { moduleNumber: module.weekNumber, lectureNumber: index + 1 });
        
        if (!lectureResult.isValid) {
          errors.push(`Lecture ${index + 1} validation failed: ${lectureResult.errors.join('; ')}`);
        }
        
        lectureScores.push(lectureResult.score);
      });

      // Average lecture scores
      const avgLectureScore = lectureScores.reduce((a, b) => a + b, 0) / lectureScores.length;
      score = (score + avgLectureScore) / 2;
    } else {
      errors.push('Module missing lectures array');
      score -= 50;
    }

    // Check spiritual integration
    if (!module.spiritualIntegration) {
      warnings.push('Module missing spiritual integration section');
      score -= 10;
    }

    return {
      isValid: errors.length === 0 && score >= 70,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * Validate entire course
   */
  public static validateCourse(course: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check course metadata
    if (!course.code || !course.title || !course.description) {
      errors.push('Missing required course metadata');
      score -= 20;
    }

    // Validate all modules
    if (course.modules && Array.isArray(course.modules)) {
      let moduleScores: number[] = [];
      
      course.modules.forEach((module: any, index: number) => {
        const moduleResult = this.validateModule(module);
        
        if (!moduleResult.isValid) {
          errors.push(`Module ${index + 1} validation failed: ${moduleResult.errors.join('; ')}`);
        }
        
        moduleScores.push(moduleResult.score);
      });

      // Average module scores
      const avgModuleScore = moduleScores.reduce((a, b) => a + b, 0) / moduleScores.length;
      score = (score + avgModuleScore) / 2;
    } else {
      errors.push('Course missing modules array');
      score -= 50;
    }

    return {
      isValid: errors.length === 0 && score >= 75,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  // Helper methods

  private static detectTemplatePatterns(content: string): string[] {
    const violations: string[] = [];
    
    this.TEMPLATE_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        violations.push(...matches.slice(0, 3)); // Limit to first 3 examples
      }
    });

    return [...new Set(violations)]; // Remove duplicates
  }

  private static detectVaguePhrases(content: string): string[] {
    const vague: string[] = [];
    
    this.VAGUE_PHRASES.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        vague.push(...matches);
      }
    });

    return vague;
  }

  private static countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private static countScriptureReferences(lecture: any): number {
    let count = 0;
    
    const content = JSON.stringify(lecture);
    
    // Count scripture reference patterns
    const patterns = [
      /\b\d?\s?[A-Z][a-z]+\s+\d+:\d+/g, // "John 3:16"
      /\b[A-Z][a-z]+\s+\d+:\d+-\d+/g,    // "Romans 8:28-30"
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) count += matches.length;
    });

    return count;
  }

  private static extractSpecificTerms(lecture: any): string[] {
    const content = JSON.stringify(lecture);
    const terms: Set<string> = new Set();

    // Look for capitalized terms (likely domain-specific)
    const capitalizedTerms = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    if (capitalizedTerms) {
      capitalizedTerms.forEach(term => {
        // Filter out common words
        if (!['The', 'This', 'That', 'These', 'Those', 'Module', 'Lecture', 'Course'].includes(term)) {
          terms.add(term);
        }
      });
    }

    return Array.from(terms);
  }

  private static hasConcreteExamples(lecture: any): boolean {
    if (!lecture.notes?.examples) return false;

    const examples = lecture.notes.examples;
    
    // Check if examples have specific titles (not "Example 1-1")
    return examples.some((ex: any) => {
      return ex.title && 
             !ex.title.match(/Example \d+-\d+/i) &&
             ex.description &&
             ex.description.length > 50;
    });
  }

  private static hasBiblicalIntegration(lecture: any): boolean {
    const content = JSON.stringify(lecture);
    
    // Check for scripture references
    const hasScripture = this.countScriptureReferences(lecture) > 0;
    
    // Check for biblical keywords
    const biblicalKeywords = [
      'scripture', 'biblical', 'God', 'Christ', 'Jesus', 
      'Holy Spirit', 'kingdom', 'gospel', 'faith'
    ];
    
    const hasBiblicalContent = biblicalKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );

    return hasScripture && hasBiblicalContent;
  }

  /**
   * Generate detailed validation report
   */
  public static generateReport(result: ValidationResult, context?: any): string {
    let report = '\n=== CONTENT QUALITY VALIDATION REPORT ===\n\n';
    
    if (context) {
      report += `Context: ${JSON.stringify(context, null, 2)}\n\n`;
    }

    report += `Overall Score: ${result.score}/100\n`;
    report += `Status: ${result.isValid ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    if (result.errors.length > 0) {
      report += '🚨 ERRORS (Must Fix):\n';
      result.errors.forEach((error, i) => {
        report += `  ${i + 1}. ${error}\n`;
      });
      report += '\n';
    }

    if (result.warnings.length > 0) {
      report += '⚠️  WARNINGS (Should Fix):\n';
      result.warnings.forEach((warning, i) => {
        report += `  ${i + 1}. ${warning}\n`;
      });
      report += '\n';
    }

    if (result.isValid) {
      report += '✨ Content meets ScrollUniversity Royal Standard\n';
    } else {
      report += '❌ Content does NOT meet quality standards - regeneration required\n';
    }

    report += '\n==========================================\n';

    return report;
  }
}

export default ContentQualityValidator;
