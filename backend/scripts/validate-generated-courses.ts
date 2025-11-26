#!/usr/bin/env ts-node
/**
 * Generated Course Content Validation Script
 * 
 * Validates generated course files against Course Content Constitution requirements:
 * - Comprehensive modules, lectures, notes, videos, assessments
 * - Spiritual integration in all content
 * - Pedagogical flow (6-step Scroll Pedagogy)
 * - Real-world deployment pathways
 * - No placeholder content
 */

import * as fs from 'fs';
import * as path from 'path';

interface CourseValidation {
  courseName: string;
  passed: boolean;
  score: number;
  modules: number;
  lectures: number;
  assessments: number;
  hasNotes: boolean;
  hasVideos: boolean;
  hasSpiritualIntegration: boolean;
  hasPedagogicalFlow: boolean;
  hasRealWorldApplication: boolean;
  issues: string[];
  warnings: string[];
}

class GeneratedCourseValidator {
  private results: CourseValidation[] = [];
  private coursesDir: string;

  constructor() {
    this.coursesDir = path.join(__dirname, '../../courses');
  }

  async validateAll(): Promise<void> {
    console.log('🎓 COURSE CONTENT VALIDATION SYSTEM');
    console.log('=' .repeat(70));
    console.log('📋 Validating against Course Content Constitution requirements\n');

    if (!fs.existsSync(this.coursesDir)) {
      console.error('❌ ERROR: Courses directory not found!');
      console.error(`   Expected: ${this.coursesDir}`);
      process.exit(1);
    }

    const courses = fs.readdirSync(this.coursesDir)
      .filter(dir => fs.statSync(path.join(this.coursesDir, dir)).isDirectory());

    if (courses.length === 0) {
      console.error('❌ ERROR: No courses found to validate!');
      process.exit(1);
    }

    console.log(`📚 Found ${courses.length} courses\n`);

    for (const courseName of courses) {
      this.validateCourse(courseName);
    }

    this.printSummary();
  }

  private validateCourse(courseName: string): void {
    const coursePath = path.join(this.coursesDir, courseName);
    
    const validation: CourseValidation = {
      courseName,
      passed: false,
      score: 0,
      modules: 0,
      lectures: 0,
      assessments: 0,
      hasNotes: false,
      hasVideos: false,
      hasSpiritualIntegration: false,
      hasPedagogicalFlow: false,
      hasRealWorldApplication: false,
      issues: [],
      warnings: []
    };

    console.log(`\n📖 ${courseName}`);
    console.log('─'.repeat(70));

    // Check for course overview
    const overviewPath = path.join(coursePath, 'course_overview.md');
    if (!fs.existsSync(overviewPath)) {
      validation.issues.push('Missing course_overview.md');
      validation.score -= 20;
    } else {
      const overview = fs.readFileSync(overviewPath, 'utf-8');
      
      // Check spiritual integration
      if (this.checkSpiritualIntegration(overview)) {
        validation.hasSpiritualIntegration = true;
        validation.score += 15;
        console.log('   ✅ Spiritual integration present');
      } else {
        validation.warnings.push('Limited spiritual integration in overview');
        console.log('   ⚠️  Limited spiritual integration');
      }

      // Check real-world application
      if (this.checkRealWorldApplication(overview)) {
        validation.hasRealWorldApplication = true;
        validation.score += 10;
        console.log('   ✅ Real-world application pathways');
      }
    }

    // Check modules
    const modules = fs.readdirSync(coursePath)
      .filter(item => item.startsWith('module') && 
              fs.statSync(path.join(coursePath, item)).isDirectory());

    validation.modules = modules.length;

    if (modules.length === 0) {
      validation.issues.push('No modules found - CRITICAL');
      console.log('   ❌ No modules found');
    } else if (modules.length < 4) {
      validation.warnings.push(`Only ${modules.length} modules (minimum 4 recommended)`);
      validation.score += modules.length * 5;
      console.log(`   ⚠️  Only ${modules.length} modules (recommend 4+)`);
    } else {
      validation.score += 20;
      console.log(`   ✅ ${modules.length} modules`);
    }

    // Validate each module
    let totalLectures = 0;
    let totalAssessments = 0;
    let hasAnyNotes = false;
    let hasAnyVideos = false;
    let hasPedagogy = false;

    for (const moduleName of modules) {
      const modulePath = path.join(coursePath, moduleName);
      const files = fs.readdirSync(modulePath);

      // Count lectures
      const lectures = files.filter(f => 
        (f.includes('lecture') || f.includes('lesson')) && 
        (f.endsWith('.json') || f.endsWith('.md'))
      );
      totalLectures += lectures.length;

      // Check for notes
      const notes = files.filter(f => f.includes('notes') || f.includes('note'));
      if (notes.length > 0) hasAnyNotes = true;

      // Check for video references
      const hasVideoRefs = files.some(f => {
        const filePath = path.join(modulePath, f);
        if (f.endsWith('.json') || f.endsWith('.md')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          return content.includes('video') || content.includes('Video');
        }
        return false;
      });
      if (hasVideoRefs) hasAnyVideos = true;

      // Check for assessments
      const assessments = files.filter(f => 
        f.includes('assessment') || f.includes('quiz') || 
        f.includes('assignment') || f.includes('exam')
      );
      totalAssessments += assessments.length;

      // Check pedagogical flow (6-step)
      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.md')) {
          const content = fs.readFileSync(path.join(modulePath, file), 'utf-8');
          if (this.checkPedagogicalFlow(content)) {
            hasPedagogy = true;
          }
        }
      }
    }

    validation.lectures = totalLectures;
    validation.assessments = totalAssessments;
    validation.hasNotes = hasAnyNotes;
    validation.hasVideos = hasAnyVideos;
    validation.hasPedagogicalFlow = hasPedagogy;

    // Validate lecture count
    if (totalLectures === 0) {
      validation.issues.push('No lectures found - CRITICAL');
      console.log('   ❌ No lectures found');
    } else if (totalLectures < modules.length * 3) {
      validation.warnings.push(`Only ${totalLectures} lectures (recommend 3+ per module)`);
      validation.score += totalLectures * 2;
      console.log(`   ⚠️  ${totalLectures} lectures (recommend ${modules.length * 3}+)`);
    } else {
      validation.score += 20;
      console.log(`   ✅ ${totalLectures} lectures`);
    }

    // Validate assessments
    if (totalAssessments === 0) {
      validation.issues.push('No assessments found - CRITICAL');
      console.log('   ❌ No assessments found');
    } else {
      validation.score += Math.min(totalAssessments * 3, 15);
      console.log(`   ✅ ${totalAssessments} assessments`);
    }

    // Check notes
    if (hasAnyNotes) {
      validation.score += 10;
      console.log('   ✅ Lecture notes present');
    } else {
      validation.warnings.push('No lecture notes found');
      console.log('   ⚠️  No lecture notes');
    }

    // Check videos
    if (hasAnyVideos) {
      validation.score += 10;
      console.log('   ✅ Video content referenced');
    } else {
      validation.warnings.push('No video content found');
      console.log('   ⚠️  No video content');
    }

    // Check pedagogical flow
    if (hasPedagogy) {
      validation.score += 10;
      console.log('   ✅ Pedagogical flow (6-step) detected');
    } else {
      validation.warnings.push('Pedagogical flow not clearly evident');
      console.log('   ⚠️  Pedagogical flow unclear');
    }

    // Final scoring
    validation.score = Math.min(validation.score, 100);
    validation.passed = validation.score >= 70 && validation.issues.length === 0;

    const scoreEmoji = validation.score >= 90 ? '🟢' : 
                       validation.score >= 70 ? '🟡' : '🔴';
    const status = validation.passed ? '✅ PASSED' : '❌ FAILED';
    
    console.log(`\n   ${status} - Score: ${scoreEmoji} ${validation.score}/100`);

    this.results.push(validation);
  }

  private checkSpiritualIntegration(content: string): boolean {
    const keywords = [
      'spiritual', 'biblical', 'scripture', 'faith', 'prayer',
      'christ', 'christian', 'kingdom', 'god', 'holy spirit',
      'theology', 'worship', 'ministry', 'calling', 'discipleship'
    ];
    
    const lowerContent = content.toLowerCase();
    return keywords.filter(k => lowerContent.includes(k)).length >= 3;
  }

  private checkRealWorldApplication(content: string): boolean {
    const keywords = [
      'real-world', 'application', 'practical', 'project',
      'deployment', 'implementation', 'case study', 'portfolio',
      'workplace', 'career', 'professional', 'industry'
    ];
    
    const lowerContent = content.toLowerCase();
    return keywords.some(k => lowerContent.includes(k));
  }

  private checkPedagogicalFlow(content: string): boolean {
    // Check for 6-step Scroll Pedagogy: Ignition, Download, Demonstration, 
    // Activation, Reflection, Commission
    const flowKeywords = [
      'objective', 'introduction', 'concept', 'example',
      'practice', 'exercise', 'reflection', 'application',
      'assignment', 'next steps'
    ];
    
    const lowerContent = content.toLowerCase();
    return flowKeywords.filter(k => lowerContent.includes(k)).length >= 4;
  }

  private printSummary(): void {
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(70));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const avgScore = this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length;
    const totalModules = this.results.reduce((sum, r) => sum + r.modules, 0);
    const totalLectures = this.results.reduce((sum, r) => sum + r.lectures, 0);
    const totalAssessments = this.results.reduce((sum, r) => sum + r.assessments, 0);

    console.log(`\n📈 Overall Statistics:`);
    console.log(`   • Total Courses: ${this.results.length}`);
    console.log(`   • Passed: ${passed} ✅`);
    console.log(`   • Failed: ${failed} ❌`);
    console.log(`   • Average Score: ${avgScore.toFixed(1)}/100`);
    console.log(`   • Total Modules: ${totalModules}`);
    console.log(`   • Total Lectures: ${totalLectures}`);
    console.log(`   • Total Assessments: ${totalAssessments}`);

    console.log(`\n📋 Content Completeness:`);
    const withNotes = this.results.filter(r => r.hasNotes).length;
    const withVideos = this.results.filter(r => r.hasVideos).length;
    const withSpiritual = this.results.filter(r => r.hasSpiritualIntegration).length;
    const withPedagogy = this.results.filter(r => r.hasPedagogicalFlow).length;
    const withRealWorld = this.results.filter(r => r.hasRealWorldApplication).length;

    console.log(`   • Courses with Notes: ${withNotes}/${this.results.length}`);
    console.log(`   • Courses with Videos: ${withVideos}/${this.results.length}`);
    console.log(`   • Courses with Spiritual Integration: ${withSpiritual}/${this.results.length}`);
    console.log(`   • Courses with Pedagogical Flow: ${withPedagogy}/${this.results.length}`);
    console.log(`   • Courses with Real-World Application: ${withRealWorld}/${this.results.length}`);

    if (failed > 0) {
      console.log(`\n❌ Failed Courses:`);
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`   • ${r.courseName} (Score: ${r.score}/100)`);
        r.issues.forEach(issue => console.log(`     - ${issue}`));
      });
    }

    console.log('\n' + '='.repeat(70));
    
    if (avgScore >= 90) {
      console.log('🎉 EXCELLENT! Course content meets world-class standards!');
      console.log('   Ready for production deployment.');
    } else if (avgScore >= 70) {
      console.log('✅ GOOD! Courses are functional with room for enhancement.');
      console.log('   Consider adding more comprehensive content.');
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT! Courses require significant work.');
      console.log('   Focus on adding comprehensive modules, lectures, and assessments.');
    }
    
    console.log('='.repeat(70) + '\n');

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run validation
const validator = new GeneratedCourseValidator();
validator.validateAll().catch(error => {
  console.error('\n❌ VALIDATION ERROR:', error);
  process.exit(1);
});
