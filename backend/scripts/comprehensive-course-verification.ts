#!/usr/bin/env npx tsx

/**
 * COMPREHENSIVE COURSE VERIFICATION SCANNER
 * Scans all generated courses to verify complete learning materials
 * Checks for: modules, lectures, assessments, videos, notes, spiritual formation
 */

import { promises as fs } from 'fs';
import path from 'path';

interface CourseVerificationResult {
  courseId: string;
  courseName: string;
  status: 'COMPLETE' | 'INCOMPLETE' | 'MISSING_CRITICAL';
  modules: number;
  lectures: number;
  assessments: number;
  spiritualFormation: number;
  videoScripts: number;
  lectureNotes: number;
  missingComponents: string[];
  criticalIssues: string[];
  contentSample: string;
  wordCount: number;
  hasPlaceholders: boolean;
}

class CourseVerificationScanner {
  private coursesDir = path.join(process.cwd(), '../courses');
  private results: CourseVerificationResult[] = [];

  async scanAllCourses(): Promise<void> {
    console.log('🔍 COMPREHENSIVE COURSE VERIFICATION SCANNER');
    console.log('='.repeat(60));
    
    try {
      const courseDirectories = await fs.readdir(this.coursesDir);
      const courseDirs = courseDirectories.filter(dir => dir.startsWith('COURSE_'));
      
      console.log(`📚 Found ${courseDirs.length} courses to verify`);
      console.log('');
      
      for (const courseDir of courseDirs) {
        await this.verifyCourse(courseDir);
      }
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Error scanning courses:', error);
    }
  }

  async verifyCourse(courseDir: string): Promise<void> {
    const coursePath = path.join(this.coursesDir, courseDir);
    const result: CourseVerificationResult = {
      courseId: courseDir,
      courseName: '',
      status: 'INCOMPLETE',
      modules: 0,
      lectures: 0,
      assessments: 0,
      spiritualFormation: 0,
      videoScripts: 0,
      lectureNotes: 0,
      missingComponents: [],
      criticalIssues: [],
      contentSample: '',
      wordCount: 0,
      hasPlaceholders: false
    };

    try {
      console.log(`🔍 Verifying ${courseDir}...`);
      
      // Check course overview
      const overviewPath = path.join(coursePath, 'course_overview.md');
      if (await this.fileExists(overviewPath)) {
        const overview = await fs.readFile(overviewPath, 'utf-8');
        result.courseName = this.extractCourseName(overview);
        result.contentSample = overview.substring(0, 500);
        result.wordCount += this.countWords(overview);
        result.hasPlaceholders = this.checkForPlaceholders(overview);
      } else {
        result.criticalIssues.push('Missing course_overview.md');
      }

      // Scan modules
      const items = await fs.readdir(coursePath);
      const moduleDirs = items.filter(item => item.startsWith('module'));
      result.modules = moduleDirs.length;

      for (const moduleDir of moduleDirs) {
        await this.verifyModule(path.join(coursePath, moduleDir), result);
      }

      // Check for final assessment
      if (await this.fileExists(path.join(coursePath, 'final_assessment.md'))) {
        result.assessments++;
      }

      // Check for deployment pathways
      if (await this.fileExists(path.join(coursePath, 'deployment_pathways.md'))) {
        // Good - has deployment info
      } else {
        result.missingComponents.push('deployment_pathways.md');
      }

      // Determine overall status
      result.status = this.determineStatus(result);
      
      this.results.push(result);
      
      // Print immediate results
      this.printCourseResult(result);
      
    } catch (error) {
      console.error(`❌ Error verifying ${courseDir}:`, error);
      result.criticalIssues.push(`Verification error: ${error}`);
      this.results.push(result);
    }
  }

  async verifyModule(modulePath: string, result: CourseVerificationResult): Promise<void> {
    try {
      const items = await fs.readdir(modulePath);
      
      // Count lectures
      const lectures = items.filter(item => item.startsWith('lecture') && item.endsWith('.md'));
      result.lectures += lectures.length;
      
      // Check lecture content
      for (const lecture of lectures.slice(0, 2)) { // Sample first 2 lectures
        const lecturePath = path.join(modulePath, lecture);
        const content = await fs.readFile(lecturePath, 'utf-8');
        result.wordCount += this.countWords(content);
        if (this.checkForPlaceholders(content)) {
          result.hasPlaceholders = true;
        }
      }
      
      // Count assessments
      const assessments = items.filter(item => 
        item.includes('quiz') || 
        item.includes('assessment') || 
        item.includes('assignment') ||
        item.includes('check')
      );
      result.assessments += assessments.length;
      
      // Count spiritual formation content
      const spiritualContent = items.filter(item => 
        item.includes('spiritual') || 
        item.includes('reflection') ||
        item.includes('formation') ||
        item.includes('prayer')
      );
      result.spiritualFormation += spiritualContent.length;
      
      // Check for video scripts (JSON files often contain video scripts)
      const videoScripts = items.filter(item => item.endsWith('.json'));
      result.videoScripts += videoScripts.length;
      
      // Check module overview
      if (!items.includes('module_overview.md')) {
        result.missingComponents.push(`${path.basename(modulePath)}/module_overview.md`);
      }
      
    } catch (error) {
      result.criticalIssues.push(`Module verification error: ${error}`);
    }
  }

  private extractCourseName(overview: string): string {
    const lines = overview.split('\n');
    for (const line of lines) {
      if (line.startsWith('#') && !line.startsWith('##')) {
        return line.replace(/^#+\s*/, '').trim();
      }
    }
    return 'Unknown Course';
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private checkForPlaceholders(text: string): boolean {
    const placeholders = [
      '[INSERT',
      '[TODO',
      '[PLACEHOLDER',
      'Lorem ipsum',
      'PLACEHOLDER',
      'TODO:',
      '[Content to be added]',
      '[Add content here]'
    ];
    
    return placeholders.some(placeholder => 
      text.toUpperCase().includes(placeholder.toUpperCase())
    );
  }

  private determineStatus(result: CourseVerificationResult): 'COMPLETE' | 'INCOMPLETE' | 'MISSING_CRITICAL' {
    if (result.criticalIssues.length > 0) {
      return 'MISSING_CRITICAL';
    }
    
    if (result.hasPlaceholders) {
      return 'INCOMPLETE';
    }
    
    // Minimum requirements for COMPLETE status
    const hasMinimumContent = 
      result.modules >= 3 &&
      result.lectures >= 9 &&
      result.assessments >= 3 &&
      result.spiritualFormation >= 1 &&
      result.wordCount >= 10000;
    
    return hasMinimumContent ? 'COMPLETE' : 'INCOMPLETE';
  }

  private printCourseResult(result: CourseVerificationResult): void {
    const statusIcon = {
      'COMPLETE': '✅',
      'INCOMPLETE': '⚠️',
      'MISSING_CRITICAL': '❌'
    }[result.status];
    
    console.log(`${statusIcon} ${result.courseId}`);
    console.log(`   📖 ${result.courseName}`);
    console.log(`   📊 Modules: ${result.modules} | Lectures: ${result.lectures} | Assessments: ${result.assessments}`);
    console.log(`   🙏 Spiritual Formation: ${result.spiritualFormation} | Video Scripts: ${result.videoScripts}`);
    console.log(`   📝 Word Count: ${result.wordCount.toLocaleString()} | Placeholders: ${result.hasPlaceholders ? 'YES' : 'NO'}`);
    
    if (result.criticalIssues.length > 0) {
      console.log(`   🚨 Critical Issues: ${result.criticalIssues.join(', ')}`);
    }
    
    if (result.missingComponents.length > 0) {
      console.log(`   ⚠️  Missing: ${result.missingComponents.slice(0, 3).join(', ')}${result.missingComponents.length > 3 ? '...' : ''}`);
    }
    
    console.log('');
  }

  async generateReport(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE VERIFICATION REPORT');
    console.log('='.repeat(60));
    
    const complete = this.results.filter(r => r.status === 'COMPLETE');
    const incomplete = this.results.filter(r => r.status === 'INCOMPLETE');
    const critical = this.results.filter(r => r.status === 'MISSING_CRITICAL');
    
    console.log(`\n📈 SUMMARY STATISTICS`);
    console.log(`Total Courses Scanned: ${this.results.length}`);
    console.log(`✅ Complete & Ready: ${complete.length}`);
    console.log(`⚠️  Incomplete: ${incomplete.length}`);
    console.log(`❌ Critical Issues: ${critical.length}`);
    
    const totalModules = this.results.reduce((sum, r) => sum + r.modules, 0);
    const totalLectures = this.results.reduce((sum, r) => sum + r.lectures, 0);
    const totalAssessments = this.results.reduce((sum, r) => sum + r.assessments, 0);
    const totalWords = this.results.reduce((sum, r) => sum + r.wordCount, 0);
    
    console.log(`\n📚 CONTENT STATISTICS`);
    console.log(`Total Modules: ${totalModules}`);
    console.log(`Total Lectures: ${totalLectures}`);
    console.log(`Total Assessments: ${totalAssessments}`);
    console.log(`Total Word Count: ${totalWords.toLocaleString()}`);
    
    const coursesWithPlaceholders = this.results.filter(r => r.hasPlaceholders);
    console.log(`\n🔍 QUALITY CHECK`);
    console.log(`Courses with Placeholders: ${coursesWithPlaceholders.length}`);
    console.log(`Placeholder-Free Courses: ${this.results.length - coursesWithPlaceholders.length}`);
    
    if (complete.length > 0) {
      console.log(`\n✅ READY FOR STUDENT ONBOARDING (${complete.length} courses):`);
      complete.forEach(course => {
        console.log(`   • ${course.courseId} - ${course.courseName}`);
        console.log(`     ${course.modules} modules, ${course.lectures} lectures, ${course.wordCount.toLocaleString()} words`);
      });
    }
    
    if (incomplete.length > 0) {
      console.log(`\n⚠️  NEEDS ATTENTION (${incomplete.length} courses):`);
      incomplete.forEach(course => {
        console.log(`   • ${course.courseId} - ${course.courseName}`);
        console.log(`     Issues: ${course.missingComponents.length} missing components, ${course.hasPlaceholders ? 'has placeholders' : 'no placeholders'}`);
      });
    }
    
    if (critical.length > 0) {
      console.log(`\n❌ CRITICAL ISSUES (${critical.length} courses):`);
      critical.forEach(course => {
        console.log(`   • ${course.courseId} - ${course.criticalIssues.join(', ')}`);
      });
    }
    
    // Generate detailed report file
    await this.saveDetailedReport();
    
    console.log(`\n🎯 STUDENT ONBOARDING READINESS`);
    if (complete.length >= 10) {
      console.log(`✅ READY TO LAUNCH! ${complete.length} complete courses available for students.`);
    } else if (complete.length >= 5) {
      console.log(`⚠️  PARTIAL READINESS: ${complete.length} courses ready. Recommend generating more before full launch.`);
    } else {
      console.log(`❌ NOT READY: Only ${complete.length} complete courses. Need at least 10 for launch.`);
    }
  }

  async saveDetailedReport(): Promise<void> {
    const reportPath = path.join(process.cwd(), '../COMPREHENSIVE_COURSE_VERIFICATION_REPORT.md');
    
    let report = `# COMPREHENSIVE COURSE VERIFICATION REPORT\n`;
    report += `**Generated**: ${new Date().toISOString()}\n\n`;
    
    report += `## Executive Summary\n\n`;
    report += `- **Total Courses**: ${this.results.length}\n`;
    report += `- **Complete & Ready**: ${this.results.filter(r => r.status === 'COMPLETE').length}\n`;
    report += `- **Incomplete**: ${this.results.filter(r => r.status === 'INCOMPLETE').length}\n`;
    report += `- **Critical Issues**: ${this.results.filter(r => r.status === 'MISSING_CRITICAL').length}\n\n`;
    
    report += `## Detailed Course Analysis\n\n`;
    
    for (const result of this.results) {
      const statusIcon = {
        'COMPLETE': '✅',
        'INCOMPLETE': '⚠️',
        'MISSING_CRITICAL': '❌'
      }[result.status];
      
      report += `### ${statusIcon} ${result.courseId}\n`;
      report += `**Course Name**: ${result.courseName}\n`;
      report += `**Status**: ${result.status}\n`;
      report += `**Content Stats**:\n`;
      report += `- Modules: ${result.modules}\n`;
      report += `- Lectures: ${result.lectures}\n`;
      report += `- Assessments: ${result.assessments}\n`;
      report += `- Spiritual Formation Elements: ${result.spiritualFormation}\n`;
      report += `- Video Scripts: ${result.videoScripts}\n`;
      report += `- Word Count: ${result.wordCount.toLocaleString()}\n`;
      report += `- Has Placeholders: ${result.hasPlaceholders ? 'YES' : 'NO'}\n`;
      
      if (result.criticalIssues.length > 0) {
        report += `**Critical Issues**: ${result.criticalIssues.join(', ')}\n`;
      }
      
      if (result.missingComponents.length > 0) {
        report += `**Missing Components**: ${result.missingComponents.join(', ')}\n`;
      }
      
      report += `\n`;
    }
    
    await fs.writeFile(reportPath, report);
    console.log(`\n📄 Detailed report saved: COMPREHENSIVE_COURSE_VERIFICATION_REPORT.md`);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Execute the scanner
if (require.main === module) {
  const scanner = new CourseVerificationScanner();
  scanner.scanAllCourses().catch(console.error);
}

export { CourseVerificationScanner };
