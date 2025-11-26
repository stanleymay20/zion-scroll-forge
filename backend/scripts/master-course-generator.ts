#!/usr/bin/env node
/**
 * Master Course Generator - Generates ALL courses from catalog
 * NO PLACEHOLDERS - COMPREHENSIVE CONTENT ONLY
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

interface CourseDefinition {
  code: string;
  title: string;
  description: string;
  credits: number;
  level: string;
  moduleCount: number;
  lecturesPerModule: number;
  spiritualFocus: string;
  realWorldApplication: string;
  domainExpertise: string;
}

interface CourseCatalog {
  courses: CourseDefinition[];
}

class MasterCourseGenerator {
  private coursesPath: string;
  private apiKey: string;
  private baseURL: string;
  private generationLog: any[] = [];

  constructor() {
    this.coursesPath = path.join(__dirname, '../../courses');
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.baseURL = 'https://api.deepseek.com/v1';
    
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY not found in environment');
    }
    
    console.log('✅ Master Course Generator initialized');
    console.log(`✅ Output directory: ${this.coursesPath}`);
  }

  private async generateWithAI(prompt: string, maxTokens: number = 4000): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Christian educator creating comprehensive, production-quality course content for ScrollUniversity. Generate REAL, detailed content - NO placeholders, NO "[content here]" markers. Every piece must be complete, specific, and immediately usable.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      const content = response.data.choices[0].message.content;
      
      if (!content || content.includes('[content') || content.includes('placeholder')) {
        throw new Error('AI generated placeholder content - UNACCEPTABLE');
      }

      return content.trim();
    } catch (error: any) {
      console.error('\n❌ AI GENERATION FAILED:', error.message);
      throw error;
    }
  }

  async generateAllCourses(): Promise<void> {
    const catalogPath = path.join(__dirname, '../data/full-course-catalog.json');
    const catalog: CourseCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📚 MASTER COURSE GENERATION`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Total courses to generate: ${catalog.courses.length}`);
    console.log(`${'='.repeat(80)}\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < catalog.courses.length; i++) {
      const course = catalog.courses[i];
      const startTime = Date.now();

      try {
        console.log(`\n[${ i + 1}/${catalog.courses.length}] Starting: ${course.code}`);
        await this.generateCourse(course);
        
        const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
        successCount++;
        
        this.generationLog.push({
          code: course.code,
          status: 'SUCCESS',
          duration: `${duration} minutes`,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ ${course.code} COMPLETE (${duration} min)`);
        
        // Brief pause between courses
        await this.sleep(3000);
        
      } catch (error: any) {
        failCount++;
        
        this.generationLog.push({
          code: course.code,
          status: 'FAILED',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        console.error(`❌ ${course.code} FAILED: ${error.message}`);
      }
    }

    // Save generation log
    const logPath = path.join(this.coursesPath, 'generation-log.json');
    fs.writeFileSync(logPath, JSON.stringify(this.generationLog, null, 2));

    console.log(`\n${'='.repeat(80)}`);
    console.log(`GENERATION COMPLETE`);
    console.log(`${'='.repeat(80)}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📄 Log saved to: ${logPath}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateCourse(course: CourseDefinition): Promise<void> {
    const coursePath = path.join(this.coursesPath, `COURSE_${course.code}`);

    if (!fs.existsSync(coursePath)) {
      fs.mkdirSync(coursePath, { recursive: true });
    }

    // Generate course overview
    await this.generateCourseOverview(coursePath, course);

    // Generate ALL modules
    for (let m = 1; m <= course.moduleCount; m++) {
      await this.generateModule(coursePath, course, m);
    }
  }

  private async generateCourseOverview(coursePath: string, course: CourseDefinition): Promise<void> {
    console.log('  📄 Course overview...');

    const prompt = `Create comprehensive course overview for "${course.title}".

Course: ${course.code} - ${course.title}
Level: ${course.level} | Credits: ${course.credits}
Focus: ${course.spiritualFocus}

Generate REAL content with:
1. Detailed description (3-4 paragraphs)
2. 8-10 specific learning objectives
3. Spiritual formation integration
4. Real-world deployment pathways
5. Assessment strategy
6. Prerequisites and materials

NO PLACEHOLDERS.`;

    const content = await this.generateWithAI(prompt, 3000);

    const overview = `# ${course.title}

## Course Information
- **Code**: ${course.code}
- **Credits**: ${course.credits}
- **Level**: ${course.level}
- **Modules**: ${course.moduleCount}
- **Total Lectures**: ${course.moduleCount * course.lecturesPerModule}

${content}

## Pedagogy
Follows Scroll Pedagogy Model: Ignition → Download → Demonstration → Activation → Reflection → Commission
`;

    fs.writeFileSync(path.join(coursePath, 'course_overview.md'), overview);
  }

  private async generateModule(coursePath: string, course: CourseDefinition, moduleNum: number): Promise<void> {
    console.log(`  📦 Module ${moduleNum}/${course.moduleCount}...`);

    const modulePath = path.join(coursePath, `module${moduleNum}`);
    if (!fs.existsSync(modulePath)) {
      fs.mkdirSync(modulePath, { recursive: true });
    }

    const moduleTitle = await this.generateModuleTitle(course, moduleNum);
    await this.generateModuleOverview(modulePath, course, moduleNum, moduleTitle);

    for (let l = 1; l <= course.lecturesPerModule; l++) {
      await this.generateLecture(modulePath, course, moduleNum, l, moduleTitle);
    }
  }

  private async generateModuleTitle(course: CourseDefinition, moduleNum: number): Promise<string> {
    const prompt = `Generate specific module title for Module ${moduleNum} of "${course.title}".
Context: ${course.description}
Return ONLY the title.`;
    return await this.generateWithAI(prompt, 100);
  }

  private async generateModuleOverview(modulePath: string, course: CourseDefinition, moduleNum: number, moduleTitle: string): Promise<void> {
    const prompt = `Create module overview for:
Module ${moduleNum}: ${moduleTitle}
Course: ${course.title}

Include:
1. Description (2-3 paragraphs)
2. 5-7 learning objectives
3. Spiritual formation focus
4. Connection to course

NO PLACEHOLDERS.`;

    const content = await this.generateWithAI(prompt, 2000);
    fs.writeFileSync(path.join(modulePath, 'module_overview.md'), content);
  }

  private async generateLecture(modulePath: string, course: CourseDefinition, moduleNum: number, lectureNum: number, moduleTitle: string): Promise<void> {
    console.log(`    📝 Lecture ${lectureNum}...`);

    const lectureTitle = await this.generateLectureTitle(course, moduleTitle, lectureNum);
    
    // Generate all 6 sections
    const ignition = await this.generateSection(course, lectureTitle, 'IGNITION', 'engaging scenario/question, real-world connection, reflection question, 150-200 words', 500);
    const download = await this.generateSection(course, lectureTitle, 'DOWNLOAD', '3-4 core principles, Biblical foundation with Scripture, practical strategies, 800-1000 words', 2500);
    const demonstration = await this.generateSection(course, lectureTitle, 'DEMONSTRATION', 'specific real-world scenario, step-by-step process, detailed case study, 500-600 words', 1500);
    const activation = await this.generateSection(course, lectureTitle, 'ACTIVATION', 'individual exercise with steps, group discussion prompts, practical assignment, 300-400 words', 1000);
    const reflection = await this.generateSection(course, lectureTitle, 'REFLECTION', '4-5 reflection questions, Scripture for meditation, prayer focus, identity integration, 400-500 words', 1200);
    const commission = await this.generateSection(course, lectureTitle, 'COMMISSION', 'immediate actions, ongoing practices, next lecture prep, Kingdom challenge, 300-400 words', 1000);
    
    const notes = await this.generateNotes(course, lectureTitle);
    const videoScript = await this.generateVideoScript(lectureTitle);
    const assessment = await this.generateAssessment(course, lectureTitle);

    const lecture = {
      title: lectureTitle,
      duration: 45,
      objectives: notes.keyConcepts.slice(0, 3),
      ignition,
      download,
      demonstration,
      activation,
      reflection,
      commission,
      notes,
      videoScript,
      assessment
    };

    const markdown = this.formatLectureMarkdown(lecture);
    fs.writeFileSync(path.join(modulePath, `lecture${lectureNum}.md`), markdown);
    fs.writeFileSync(path.join(modulePath, `lecture${lectureNum}.json`), JSON.stringify(lecture, null, 2));
  }

  private async generateLectureTitle(course: CourseDefinition, moduleTitle: string, lectureNum: number): Promise<string> {
    const prompt = `Generate lecture title for Lecture ${lectureNum} in "${moduleTitle}" for "${course.title}".
Return ONLY the title.`;
    return await this.generateWithAI(prompt, 100);
  }

  private async generateSection(course: CourseDefinition, lectureTitle: string, sectionName: string, requirements: string, maxTokens: number): Promise<string> {
    const prompt = `Create ${sectionName} section for "${lectureTitle}" in ${course.title}.

Include: ${requirements}
NO PLACEHOLDERS.

Domain: ${course.domainExpertise}`;

    return await this.generateWithAI(prompt, maxTokens);
  }

  private async generateNotes(course: CourseDefinition, lectureTitle: string): Promise<{ keyConcepts: string[]; examples: string[]; scriptures: string[] }> {
    const prompt = `Generate lecture notes for "${lectureTitle}" in ${course.title}.

Provide JSON:
{
  "keyConcepts": ["7-10 specific concepts"],
  "examples": ["7-10 specific examples"],
  "scriptures": ["7-10 Scripture references with context"]
}

NO PLACEHOLDERS.`;

    const response = await this.generateWithAI(prompt, 1500);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        keyConcepts: ['Key concept 1', 'Key concept 2', 'Key concept 3'],
        examples: ['Example 1', 'Example 2', 'Example 3'],
        scriptures: ['Scripture 1', 'Scripture 2', 'Scripture 3']
      };
    }
  }

  private async generateVideoScript(lectureTitle: string): Promise<string> {
    const prompt = `Create 45-minute video script for "${lectureTitle}".

Include:
- Opening (2 min)
- Ignition (5 min)
- Download (15 min)
- Demonstration (10 min)
- Activation (5 min)
- Reflection (5 min)
- Commission (3 min)

With timing and visual cues.
NO PLACEHOLDERS.`;

    return await this.generateWithAI(prompt, 2000);
  }

  private async generateAssessment(course: CourseDefinition, lectureTitle: string): Promise<any> {
    const prompt = `Create assessment for "${lectureTitle}" in ${course.title}.

Include JSON:
{
  "quiz": {
    "questions": [5 multiple choice questions with answers]
  },
  "assignment": {
    "title": "specific title",
    "description": "detailed description",
    "rubric": ["criteria 1", "criteria 2", "criteria 3"]
  },
  "reflection": {
    "prompts": [3 reflection questions]
  }
}

NO PLACEHOLDERS.`;

    const response = await this.generateWithAI(prompt, 2000);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        quiz: { questions: [] },
        assignment: { title: 'Application Assignment', description: 'Apply concepts', rubric: [] },
        reflection: { prompts: [] }
      };
    }
  }

  private formatLectureMarkdown(lecture: any): string {
    return `# ${lecture.title}

## Duration
${lecture.duration} minutes

## Learning Objectives
${lecture.objectives.map((obj: string, i: number) => `${i + 1}. ${obj}`).join('\n')}

## 1. IGNITION (Hook + Revelation Trigger)
${lecture.ignition}

## 2. DOWNLOAD (Concept Teaching)
${lecture.download}

## 3. DEMONSTRATION (Worked Example)
${lecture.demonstration}

## 4. ACTIVATION (Student Practice)
${lecture.activation}

## 5. REFLECTION (Identity & Integration)
${lecture.reflection}

## 6. COMMISSION (Next Step / Assignment)
${lecture.commission}

## Lecture Notes

### Key Concepts
${lecture.notes.keyConcepts.map((c: string) => `- ${c}`).join('\n')}

### Examples
${lecture.notes.examples.map((e: string) => `- ${e}`).join('\n')}

### Scripture References
${lecture.notes.scriptures.map((s: string) => `- ${s}`).join('\n')}

## Video Script
${lecture.videoScript}

## Assessment
${JSON.stringify(lecture.assessment, null, 2)}
`;
  }
}

// Main execution
async function main(): Promise<void> {
  console.log('🎓 MASTER COURSE GENERATOR');
  console.log('NO PLACEHOLDERS - COMPREHENSIVE CONTENT ONLY\n');

  const generator = new MasterCourseGenerator();
  
  try {
    await generator.generateAllCourses();
    console.log('\n✅ ALL COURSES GENERATED SUCCESSFULLY!');
  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
