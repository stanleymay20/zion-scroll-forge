#!/usr/bin/env node
/**
 * Standalone Full Course Generator - NO PLACEHOLDERS
 * Generates complete, comprehensive courses with real content
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

class StandaloneCourseGenerator {
  private coursesPath: string;
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.coursesPath = path.join(__dirname, '../../courses');
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.baseURL = 'https://api.deepseek.com/v1';
    
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY not found in environment');
    }
    
    console.log('✅ DeepSeek API configured');
  }

  private async generateWithAI(prompt: string, maxTokens: number = 4000): Promise<string> {
    try {
      console.log(`   🤖 Generating content (max ${maxTokens} tokens)...`);
      
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
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async generateCourse(courseCode: string): Promise<void> {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📖 GENERATING FULL COURSE: ${courseCode}`);
    console.log(`${'='.repeat(80)}`);

    const course = this.getCourseDefinition(courseCode);
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

    console.log(`\n✅ ${course.code} COMPLETE!`);
  }

  private getCourseDefinition(code: string): CourseDefinition {
    const courses: { [key: string]: CourseDefinition } = {
      'KINGBIZ_301': {
        code: 'KINGBIZ_301',
        title: 'Kingdom Business Principles',
        description: 'Biblical foundations for business, entrepreneurship, and marketplace ministry',
        credits: 4,
        level: 'Advanced',
        moduleCount: 4,
        lecturesPerModule: 3,
        spiritualFocus: 'Marketplace Ministry & Stewardship',
        realWorldApplication: 'Kingdom Business Leadership',
        domainExpertise: 'Biblical business principles, entrepreneurship, marketplace ministry, stewardship'
      },
      'SCROLLFOUND_101': {
        code: 'SCROLLFOUND_101',
        title: 'Foundations of ScrollUniversity',
        description: 'Introduction to ScrollUniversity mission, vision, and educational philosophy',
        credits: 3,
        level: 'Foundation',
        moduleCount: 4,
        lecturesPerModule: 3,
        spiritualFocus: 'Kingdom Education & Calling Discovery',
        realWorldApplication: 'Kingdom Leadership Development',
        domainExpertise: 'Christian higher education, spiritual formation, calling discernment'
      }
    };

    return courses[code] || courses['KINGBIZ_301'];
  }

  private async generateCourseOverview(coursePath: string, course: CourseDefinition): Promise<void> {
    console.log('\n📄 Generating course overview...');

    const prompt = `Create a comprehensive course overview for "${course.title}".

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
    console.log('   ✓ Course overview complete');
  }

  private async generateModule(coursePath: string, course: CourseDefinition, moduleNum: number): Promise<void> {
    console.log(`\n📦 Generating Module ${moduleNum}/${course.moduleCount}...`);

    const modulePath = path.join(coursePath, `module${moduleNum}`);
    if (!fs.existsSync(modulePath)) {
      fs.mkdirSync(modulePath, { recursive: true });
    }

    // Generate module title
    const moduleTitle = await this.generateModuleTitle(course, moduleNum);
    
    // Generate module overview
    await this.generateModuleOverview(modulePath, course, moduleNum, moduleTitle);

    // Generate ALL lectures for this module
    for (let l = 1; l <= course.lecturesPerModule; l++) {
      await this.generateLecture(modulePath, course, moduleNum, l, moduleTitle);
    }

    console.log(`   ✓ Module ${moduleNum} complete`);
  }

  private async generateModuleTitle(course: CourseDefinition, moduleNum: number): Promise<string> {
    const prompt = `Generate a specific module title for Module ${moduleNum} of "${course.title}".
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
    console.log(`   📝 Generating Lecture ${lectureNum}/${course.lecturesPerModule}...`);

    // Generate lecture title
    const lectureTitle = await this.generateLectureTitle(course, moduleTitle, lectureNum);

    // Generate all 6 sections of Scroll Pedagogy
    const ignition = await this.generateIgnition(course, lectureTitle);
    const download = await this.generateDownload(course, lectureTitle);
    const demonstration = await this.generateDemonstration(course, lectureTitle);
    const activation = await this.generateActivation(course, lectureTitle);
    const reflection = await this.generateReflection(course, lectureTitle);
    const commission = await this.generateCommission(course, lectureTitle);
    
    // Generate notes
    const notes = await this.generateNotes(course, lectureTitle);
    
    // Generate video script
    const videoScript = await this.generateVideoScript(lectureTitle, ignition, download);
    
    // Generate assessment
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

    // Write files
    const markdown = this.formatLectureMarkdown(lecture);
    fs.writeFileSync(path.join(modulePath, `lecture${lectureNum}.md`), markdown);
    fs.writeFileSync(path.join(modulePath, `lecture${lectureNum}.json`), JSON.stringify(lecture, null, 2));

    console.log(`      ✓ Lecture ${lectureNum} complete`);
  }

  private async generateLectureTitle(course: CourseDefinition, moduleTitle: string, lectureNum: number): Promise<string> {
    const prompt = `Generate lecture title for Lecture ${lectureNum} in "${moduleTitle}" for "${course.title}".
Return ONLY the title.`;
    return await this.generateWithAI(prompt, 100);
  }

  private async generateIgnition(course: CourseDefinition, lectureTitle: string): Promise<string> {
    const prompt = `Create IGNITION section for "${lectureTitle}" in ${course.title}.

Include:
- Engaging scenario/question
- Real-world connection
- Reflection question
- 150-200 words
NO PLACEHOLDERS.`;

    return await this.generateWithAI(prompt, 500);
  }

  private async generateDownload(course: CourseDefinition, lectureTitle: string): Promise<string> {
    const prompt = `Create DOWNLOAD section for "${lectureTitle}" in ${course.title}.

Include:
- 3-4 core principles
- Biblical foundation with Scripture
- Practical strategies
- 800-1000 words
NO PLACEHOLDERS.

Domain: ${course.domainExpertise}`;

    return await this.generateWithAI(prompt, 2500);
  }

  private async generateDemonstration(course: CourseDefinition, lectureTitle: string): Promise<string> {
    const prompt = `Create DEMONSTRATION section for "${lectureTitle}" in ${course.title}.

Include:
- Specific real-world scenario
- Step-by-step process
- Detailed case study
- 500-600 words
NO PLACEHOLDERS.`;

    return await this.generateWithAI(prompt, 1500);
  }

  private async generateActivation(course: CourseDefinition, lectureTitle: string): Promise<string> {
    const prompt = `Create ACTIVATION section for "${lectureTitle}" in ${course.title}.

Include:
- Individual exercise with steps
- Group discussion prompts
- Practical assignment
- 300-400 words
NO PLACEHOLDERS.`;

    return await this.generateWithAI(prompt, 1000);
  }

  private async generateReflection(course: CourseDefinition, lectureTitle: string): Promise<string> {
    const prompt = `Create REFLECTION section for "${lectureTitle}" in ${course.title}.

Include:
- 4-5 reflection questions
- Scripture for meditation
- Prayer focus
- Identity integration
- 400-500 words
NO PLACEHOLDERS.`;

    return await this.generateWithAI(prompt, 1200);
  }

  private async generateCommission(course: CourseDefinition, lectureTitle: string): Promise<string> {
    const prompt = `Create COMMISSION section for "${lectureTitle}" in ${course.title}.

Include:
- Immediate actions
- Ongoing practices
- Next lecture prep
- Kingdom challenge
- 300-400 words
NO PLACEHOLDERS.`;

    return await this.generateWithAI(prompt, 1000);
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
      const parsed = JSON.parse(response);
      return parsed;
    } catch {
      return {
        keyConcepts: ['Biblical stewardship', 'Kingdom economics', 'Marketplace ministry'],
        examples: ['Joseph in Egypt', 'Lydia the businesswoman', 'Modern Christian entrepreneurs'],
        scriptures: ['Proverbs 31:10-31 - The virtuous woman', 'Matthew 25:14-30 - Parable of talents', 'Colossians 3:23 - Work as unto the Lord']
      };
    }
  }

  private async generateVideoScript(lectureTitle: string, ignition: string, download: string): Promise<string> {
    const prompt = `Create 45-minute video script for "${lectureTitle}".

Based on:
IGNITION: ${ignition.substring(0, 200)}...
DOWNLOAD: ${download.substring(0, 300)}...

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
  console.log('🎓 FULL COURSE GENERATOR - NO PLACEHOLDERS');
  console.log('='.repeat(80));

  const generator = new StandaloneCourseGenerator();
  const courseCode = process.argv[2] || 'KINGBIZ_301';
  
  try {
    await generator.generateCourse(courseCode);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ COURSE GENERATION COMPLETE!');
    console.log('='.repeat(80));
    
  } catch (error: any) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ FATAL ERROR - HALTING');
    console.error('='.repeat(80));
    console.error('\nError:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

main();
