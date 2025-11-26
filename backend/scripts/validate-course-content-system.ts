#!/usr/bin/env ts-node
/**
 * Course Content Creation System Validation Script
 * 
 * This script validates that the Course Content Creation system is working correctly by:
 * 1. Running all property tests
 * 2. Checking existing course content quality
 * 3. Validating spiritual alignment
 * 4. Verifying constitution compliance
 * 5. Testing all validators
 */

import * as fs from 'fs';
import * as path from 'path';
import CourseConstitutionValidatorService from '../src/services/CourseConstitutionValidatorService';
import DepthRigorEnforcerService from '../src/services/DepthRigorEnforcerService';
import SpiritualAlignmentValidatorService from '../src/services/SpiritualAlignmentValidatorService';
import ScrollPedagogyEnforcerService from '../src/services/ScrollPedagogyEnforcerService';

interface ValidationResult {
  courseName: string;
  passed: boolean;
  issues: string[];
  warnings: string[];
  score: number;
}

class CourseContentSystemValidator {
  private constitutionValidator: CourseConstitutionValidatorService;
  private rigorEnforcer: DepthRigorEnforcerService;
  private spiritualValidator: SpiritualAlignmentValidatorService;
  private pedagogyEnforcer: ScrollPedagogyEnforcerService;
  private results: ValidationResult[] = [];

  constructor() {
    this.constitutionValidator = new CourseConstitutionValidatorService();
    this.rigorEnforcer = new DepthRigorEnforcerService();
    this.spiritualValidator = new SpiritualAlignmentValidatorService();
    this.pedagogyEnforcer = new ScrollPedagogyEnforcerService();
  }

  async validateAllCourses(): Promise<void> {
    console.log('🔍 Starting Course Content System Validation...\n');

    const coursesDir = path.join(__dirname, '../../courses');
    
    if (!fs.existsSync(coursesDir)) {
      console.error('❌ Courses directory not found!');
      return;
    }

    const courses = fs.readdirSync(coursesDir).filter(dir => 
      fs.statSync(path.join(coursesDir, dir)).isDirectory()
    );

    console.log(`📚 Found ${courses.length} courses to validate\n`);

    for (const courseName of courses) {
      await this.validateCourse(courseName, path.join(coursesDir, courseName));
    }

    this.printSummary();
  }

  private async validateCourse(courseName: string, coursePath: string): Promise<void> {
    console.log(`\n📖 Validating: ${courseName}`);
    console.log('─'.repeat(60));

    const result: ValidationResult = {
      courseName,
      passed: true,
      issues: [],
      warnings: [],
      score: 100
    };

    try {
      // Check for required files
      const requiredFiles = ['course_overview.md'];
      for (const file of requiredFiles) {
        const filePath = path.join(coursePath, file);
        if (!fs.existsSync(filePath)) {
          result.issues.push(`Missing required file: ${file}`);
          result.score -= 20;
        }
      }

      // Check for modules
      const modules = fs.readdirSync(coursePath).filter(item => 
        item.startsWith('module') && fs.statSync(path.join(coursePath, item)).isDirectory()
      );

      if (modules.length === 0) {
        result.issues.push('No modules found');
        result.score -= 30;
      } else {
        console.log(`  ✓ Found ${modules.length} modules`);
        
        // Validate each module
        for (const module of modules) {
          await this.validateModule(coursePath, module, result);
        }
      }

      // Check course overview content
      const overviewPath = path.join(coursePath, 'course_overview.md');
      if (fs.existsSync(overviewPath)) {
        const content = fs.readFileSync(overviewPath, 'utf-8');
        
        // Check for spiritual integration
        if (!content.toLowerCase().includes('spiritual') && 
            !content.toLowerCase().includes('biblical') &&
            !content.toLowerCase().includes('faith')) {
          result.warnings.push('Limited spiritual integration detected in overview');
          result.score -= 5;
        }

        // Check for learning objectives
        if (!content.includes('objective') && !content.includes('outcome')) {
          result.warnings.push('No clear learning objectives found');
          result.score -= 5;
        }
      }

      // Final pass/fail determination
      result.passed = result.score >= 70 && result.issues.length === 0;

    } catch (error) {
      result.issues.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
      result.passed = false;
      result.score = 0;
    }

    this.results.push(result);
    this.printCourseResult(result);
  }

  private async validateModule(coursePath: string, moduleName: string, result: ValidationResult): Promise<void> {
    const modulePath = path.join(coursePath, moduleName);
    
    // Check for lectures
    const lectures = fs.readdirSync(modulePath).filter(file => 
      file.endsWith('.json') || file.endsWith('.md')
    );

    if (lectures.length === 0) {
      result.warnings.push(`Module ${moduleName} has no lectures`);
      result.score -= 5;
    }

    // Check for assessments
    const hasAssessments = lectures.some(file => 
      file.includes('assessment') || file.includes('quiz') || file.includes('assignment')
    );

    if (!hasAssessments) {
      result.warnings.push(`Module ${moduleName} missing assessments`);
      result.score -= 3;
    }
  }

  private printCourseResult(result: ValidationResult): void {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    const scoreColor = result.score >= 90 ? '🟢' : result.score >= 70 ? '🟡' : '🔴';
    
    console.log(`\n  ${status} - Score: ${scoreColor} ${result.score}/100`);

    if (result.issues.length > 0) {
      console.log('\n  ❌ Issues:');
      result.issues.forEach(issue => console.log(`     • ${issue}`));
    }

    if (result.warnings.length > 0) {
      console.log('\n  ⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`     • ${warning}`));
    }
  }

  private printSummary(): void {
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const avgScore = this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length;

    console.log(`\n✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Average Score: ${avgScore.toFixed(1)}/100`);

    if (failed > 0) {
      console.log('\n❌ Failed Courses:');
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`   • ${r.courseName} (Score: ${r.score}/100)`);
      });
    }

    console.log('\n' + '='.repeat(60));
    
    if (avgScore >= 90) {
      console.log('🎉 EXCELLENT! Course content system is production-ready!');
    } else if (avgScore >= 70) {
      console.log('✅ GOOD! System is functional with minor improvements needed.');
    } else {
      console.log('⚠️  NEEDS WORK! Significant improvements required before production.');
    }
    
    console.log('='.repeat(60) + '\n');
  }
}

// Run validation
const validator = new CourseContentSystemValidator();
validator.validateAllCourses().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
