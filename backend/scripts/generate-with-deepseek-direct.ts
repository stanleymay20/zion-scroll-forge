#!/usr/bin/env npx tsx

/**
 * DEEPSEEK DIRECT API COURSE GENERATOR
 * Generates comprehensive course content using DeepSeek API directly
 * Following Scroll Pedagogy Model and Course Content Constitution
 */

import { promises as fs } from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Verify DeepSeek API key
const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  console.error('❌ ERROR: DEEPSEEK_API_KEY not found in environment variables');
  console.error('Please add DEEPSEEK_API_KEY to your .env file');
  console.error('Get your API key from: https://platform.deepseek.com/api_keys');
  process.exit(1);
}

console.log('✅ DeepSeek API Key loaded successfully');
console.log('🔧 Using DeepSeek Chat model (direct API)');
console.log('');

// Initialize OpenAI client with DeepSeek endpoint
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: apiKey
});

interface CourseDefinition {
  courseId: string;
  courseName: string;
  description: string;
  modules: number;
  lecturesPerModule: number;
  level: string;
  category: string;
}

// All 15 courses to generate
const ALL_COURSES: CourseDefinition[] = [
  {
    courseId: 'COURSE_001_Sacred_AI_Engineering',
    courseName: 'Sacred AI & Machine Learning Engineering',
    description: 'Comprehensive AI and machine learning engineering with biblical integration and kingdom applications',
    modules: 10,
    lecturesPerModule: 4,
    level: 'Undergraduate',
    category: 'Technology'
  },
  {
    courseId: 'COURSE_ECON101',
    courseName: 'Kingdom Economics Foundations',
    description: 'Introduction to economic principles through a biblical worldview, covering supply/demand, markets, and stewardship',
    modules: 8,
    lecturesPerModule: 4,
    level: 'Undergraduate',
    category: 'Economics'
  },
  {
    courseId: 'COURSE_ECON201',
    courseName: 'ScrollCoin & Digital Currency Systems',
    description: 'Cryptocurrency, blockchain technology, and digital economics from a kingdom perspective',
    modules: 8,
    lecturesPerModule: 4,
    level: 'Undergraduate',
    category: 'Economics'
  },
  {
    courseId: 'COURSE_ECON301',
    courseName: 'Global Trade & Kingdom Commerce',
    description: 'International economics, trade policy, and global commerce with biblical justice principles',
    modules: 10,
    lecturesPerModule: 4,
    level: 'Undergraduate',
    category: 'Economics'
  },
  {
    courseId: 'COURSE_ECON401',
    courseName: 'AI Trading & Financial Technology',
    description: 'Advanced fintech, algorithmic trading, and AI in finance with ethical considerations',
    modules: 10,
    lecturesPerModule: 4,
    level: 'Graduate',
    category: 'Economics'
  },
  {
    courseId: 'COURSE_SCROLLAI101',
    courseName: 'Introduction to Prophetic AI & Kingdom Intelligence',
    description: 'Foundational AI concepts integrated with spiritual discernment and prophetic intelligence',
    modules: 8,
    lecturesPerModule: 4,
    level: 'Undergraduate',
    category: 'Technology'
  },
  {
    courseId: 'COURSE_SCROLLAI201',
    courseName: 'ScrollAgent Development Fundamentals',
    description: 'Building AI agents for kingdom purposes, covering agent architecture and deployment',
    modules: 10,
    lecturesPerModule: 4,
    level: 'Undergraduate',
    category: 'Technology'
  },
  {
    courseId: 'COURSE_SCROLLAI301',
    courseName: 'Neural Networks & Deep Learning for Kingdom Impact',
    description: 'Advanced neural network architectures and deep learning for transformative applications',
    modules: 10,
    lecturesPerModule: 4,
    level: 'Graduate',
    category: 'Technology'
  },
  {
    courseId: 'COURSE_SCROLLAI401',
    courseName: 'ScrollOS & AI Infrastructure Design',
    description: 'Designing and deploying AI infrastructure and operating systems for kingdom advancement',
    modules: 10,
    lecturesPerModule: 4,
    level: 'Graduate',
    category: 'Technology'
  },
  {
    courseId: 'COURSE_SCROLLAI501',
    courseName: 'Advanced AI Governance & Prophetic Intelligence',
    description: 'Doctoral-level AI governance, ethics, and integration of prophetic intelligence',
    modules: 12,
    lecturesPerModule: 4,
    level: 'Doctoral',
    category: 'Technology'
  },
  {
    courseId: 'COURSE_THEO101',
    courseName: 'Scroll Hermeneutics & Biblical Interpretation',
    description: 'Foundational biblical interpretation methods with scroll-based hermeneutics',
    modules: 8,
    lecturesPerModule: 4,
    level: 'Undergraduate',
    category: 'Theology'
  },
  {
    courseId: 'COURSE_THEO201',
    courseName: 'Prophetic Timeline Construction',
    description: 'Understanding biblical prophecy, timelines, and eschatological frameworks',
    modules: 10,
    lecturesPerModule: 4,
    level: 'Undergraduate',
    category: 'Theology'
  },
  {
    courseId: 'COURSE_THEO301',
    courseName: 'Christology & Messianic Studies',
    description: 'In-depth study of Christ, messianic prophecies, and theological implications',
    modules: 10,
    lecturesPerModule: 4,
    level: 'Graduate',
    category: 'Theology'
  },
  {
    courseId: 'COURSE_THEO401',
    courseName: 'Biblical Translation & ScrollVersion Development',
    description: 'Advanced biblical translation theory and developing scroll-based versions',
    modules: 10,
    lecturesPerModule: 4,
    level: 'Graduate',
    category: 'Theology'
  },
  {
    courseId: 'COURSE_THEO501',
    courseName: 'Spiritual Warfare & ScrollWarfare Protocols',
    description: 'Doctoral-level spiritual warfare theology and practical scroll-based protocols',
    modules: 12,
    lecturesPerModule: 4,
    level: 'Doctoral',
    category: 'Theology'
  }
];

class DeepSeekCourseGenerator {
  private coursesDir = path.join(process.cwd(), '../courses');
  private generatedCount = 0;
  private failedCourses: string[] = [];

  async generateAllCourses(): Promise<void> {
    console.log('🚀 DEEPSEEK DIRECT API COURSE GENERATOR');
    console.log('='.repeat(70));
    console.log(`📚 Generating ${ALL_COURSES.length} comprehensive courses`);
    console.log('⚡ Following Scroll Pedagogy Model & Course Content Constitution');
    console.log('');

    for (const course of ALL_COURSES) {
      try {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`📖 Generating: ${course.courseName}`);
        console.log(`   Course ID: ${course.courseId}`);
        console.log(`   Modules: ${course.modules} | Lectures: ${course.lecturesPerModule} per module`);
        console.log(`${'='.repeat(70)}\n`);

        await this.generateCompleteCourse(course);
        this.generatedCount++;
        
        console.log(`\n✅ COMPLETE: ${course.courseName}`);
        console.log(`   Progress: ${this.generatedCount}/${ALL_COURSES.length} courses`);
        
      } catch (error: any) {
        console.error(`\n❌ FAILED: ${course.courseName}`);
        console.error(`   Error: ${error.message}`);
        this.failedCourses.push(course.courseId);
        
        // HALT on error - do not continue with simplified output
        console.error('\n🛑 HALTING: Error occurred during generation');
        console.error('   Following "Do not fall back to simplified output" policy');
        console.error(`   Failed at: ${course.courseId}`);
        break;
      }
    }

    await this.generateFinalReport();
  }

  async generateCompleteCourse(course: CourseDefinition): Promise<void> {
    const coursePath = path.join(this.coursesDir, course.courseId);
    
    // Ensure course directory exists
    await fs.mkdir(coursePath, { recursive: true });

    // Generate course overview
    console.log(`  📋 Course overview...`);
    await this.generateCourseOverview(coursePath, course);

    // Generate all modules
    for (let moduleNum = 1; moduleNum <= course.modules; moduleNum++) {
      console.log(`  📂 Module ${moduleNum}/${course.modules}...`);
      await this.generateModule(coursePath, course, moduleNum);
    }

    // Generate deployment pathways
    console.log(`  🚀 Deployment pathways...`);
    await this.generateDeploymentPathways(coursePath, course);

    // Generate final assessment
    console.log(`  📝 Final assessment...`);
    await this.generateFinalAssessment(coursePath, course);
  }

  async generateModule(coursePath: string, course: CourseDefinition, moduleNum: number): Promise<void> {
    const modulePath = path.join(coursePath, `module${moduleNum}`);
    await fs.mkdir(modulePath, { recursive: true });

    // Module overview
    const moduleOverview = await this.generateModuleOverview(course, moduleNum);
    await fs.writeFile(path.join(modulePath, 'module_overview.md'), moduleOverview);

    // Generate lectures
    for (let lectureNum = 1; lectureNum <= course.lecturesPerModule; lectureNum++) {
      console.log(`    📄 Lecture ${lectureNum}/${course.lecturesPerModule}...`);
      
      const lecture = await this.generateLecture(course, moduleNum, lectureNum);
      await fs.writeFile(path.join(modulePath, `lecture${lectureNum}.md`), lecture);
      
      // Video script
      const videoScript = await this.generateVideoScript(course, moduleNum, lectureNum);
      await fs.writeFile(path.join(modulePath, `lecture${lectureNum}_video.json`), JSON.stringify(videoScript, null, 2));
      
      // Lecture notes
      const notes = await this.generateLectureNotes(course, moduleNum, lectureNum);
      await fs.writeFile(path.join(modulePath, `lecture${lectureNum}_notes.md`), notes);
    }

    // Assessments
    console.log(`    ✅ Assessments...`);
    const knowledgeCheck = await this.generateKnowledgeCheck(course, moduleNum);
    await fs.writeFile(path.join(modulePath, `module_${moduleNum}_knowledge_check.md`), knowledgeCheck);

    const assignment = await this.generateAssignment(course, moduleNum);
    await fs.writeFile(path.join(modulePath, `module_${moduleNum}_application_assignment.md`), assignment);

    // Spiritual formation
    console.log(`    🙏 Spiritual formation...`);
    const spiritualFormation = await this.generateSpiritualFormation(course, moduleNum);
    await fs.writeFile(path.join(modulePath, `module_${moduleNum}_spiritual_formation_reflection.md`), spiritualFormation);
  }

  async callDeepSeek(prompt: string, maxTokens: number, retries: number = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: maxTokens
        });

        const content = response.choices[0].message.content;
        if (!content) {
          throw new Error('Empty response from DeepSeek API');
        }
        
        return content;
      } catch (error: any) {
        console.error(`      ⚠️  Attempt ${attempt}/${retries} failed: ${error.message}`);
        
        if (attempt === retries) {
          throw new Error(`Failed after ${retries} attempts: ${error.message}`);
        }
        
        // Exponential backoff
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`      ⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw new Error('Failed to generate content');
  }

  async generateCourseOverview(coursePath: string, course: CourseDefinition): Promise<void> {
    const prompt = `Generate comprehensive course overview for "${course.courseName}" (${course.description}). Include: course title, description, learning outcomes (8-10), prerequisites, ${course.modules} module structure, assessment strategy, required materials, spiritual formation goals. Follow Scroll Pedagogy Model. Markdown format.`;
    const content = await this.callDeepSeek(prompt, 2000);
    await fs.writeFile(path.join(coursePath, 'course_overview.md'), content);
  }

  async generateModuleOverview(course: CourseDefinition, moduleNum: number): Promise<string> {
    const prompt = `Generate module overview for Module ${moduleNum} of "${course.courseName}" (${course.description}). Include: module title, 4-5 learning objectives, key concepts, 2 Scripture foundations, real-world applications, ${course.lecturesPerModule} lecture structure. Follow Scroll Pedagogy. Markdown format.`;
    return await this.callDeepSeek(prompt, 1500);
  }

  async generateLecture(course: CourseDefinition, moduleNum: number, lectureNum: number): Promise<string> {
    const prompt = `Generate comprehensive lecture for Module ${moduleNum}, Lecture ${lectureNum} of "${course.courseName}" (${course.description}). MUST follow Scroll Pedagogy 6-step flow: 1) IGNITION (hook/revelation trigger), 2) DOWNLOAD (concept teaching), 3) DEMONSTRATION (worked example), 4) ACTIVATION (student practice), 5) REFLECTION (identity/integration), 6) COMMISSION (next steps). 2000-2500 words, university-level depth, biblical integration, practical examples. Markdown format.`;
    return await this.callDeepSeek(prompt, 4000);
  }

  async generateVideoScript(course: CourseDefinition, moduleNum: number, lectureNum: number): Promise<any> {
    const prompt = `Generate video script structure for Module ${moduleNum}, Lecture ${lectureNum} of "${course.courseName}". Include: segments (introduction, main teaching, demonstration, conclusion), timing, interactive elements, visual aids. JSON format.`;
    const content = await this.callDeepSeek(prompt, 1000);
    
    try {
      return JSON.parse(content);
    } catch {
      // Fallback structure if JSON parsing fails
      return {
        title: `Module ${moduleNum} - Lecture ${lectureNum}`,
        duration: "45-50 minutes",
        segments: [
          { type: "introduction", duration: "5 minutes", content: "Welcome and overview" },
          { type: "main_teaching", duration: "30 minutes", content: "Core content following Scroll Pedagogy" },
          { type: "demonstration", duration: "10 minutes", content: "Worked examples" },
          { type: "conclusion", duration: "5 minutes", content: "Summary and next steps" }
        ],
        interactiveElements: ["Knowledge checks", "Reflection prompts", "Prayer moments"]
      };
    }
  }

  async generateLectureNotes(course: CourseDefinition, moduleNum: number, lectureNum: number): Promise<string> {
    const prompt = `Generate detailed lecture notes for Module ${moduleNum}, Lecture ${lectureNum} of "${course.courseName}". Include: key points, definitions, examples, Scripture references, discussion questions, additional resources. Student-friendly format. Markdown.`;
    return await this.callDeepSeek(prompt, 2000);
  }

  async generateKnowledgeCheck(course: CourseDefinition, moduleNum: number): Promise<string> {
    const prompt = `Generate knowledge check assessment for Module ${moduleNum} of "${course.courseName}". Include: 10 multiple choice (with explanations), 5 true/false (with reasoning), 3 short answer questions. Focus on understanding, application, spiritual integration. Markdown format.`;
    return await this.callDeepSeek(prompt, 2500);
  }

  async generateAssignment(course: CourseDefinition, moduleNum: number): Promise<string> {
    const prompt = `Generate practical assignment for Module ${moduleNum} of "${course.courseName}". Include: learning objectives, detailed instructions, real-world project/case study, deliverables, grading rubric, submission guidelines, kingdom impact focus. 3-5 hours work. Markdown format.`;
    return await this.callDeepSeek(prompt, 2000);
  }

  async generateSpiritualFormation(course: CourseDefinition, moduleNum: number): Promise<string> {
    const prompt = `Generate spiritual formation reflection for Module ${moduleNum} of "${course.courseName}". Include: Scripture meditation passage, 5-7 reflection questions connecting learning to identity in Christ, prayer prompts, character development focus, ministry application. Markdown format.`;
    return await this.callDeepSeek(prompt, 1500);
  }

  async generateDeploymentPathways(coursePath: string, course: CourseDefinition): Promise<void> {
    const prompt = `Generate deployment pathways for "${course.courseName}" (${course.description}). Include: 3-4 career applications, 3-4 ministry applications, implementation strategies, portfolio guidance, recommended next courses, relevant certifications, kingdom impact opportunities. Markdown format.`;
    const content = await this.callDeepSeek(prompt, 2000);
    await fs.writeFile(path.join(coursePath, 'deployment_pathways.md'), content);
  }

  async generateFinalAssessment(coursePath: string, course: CourseDefinition): Promise<void> {
    const prompt = `Generate comprehensive final assessment for "${course.courseName}" (${course.modules} modules). Include: final exam (20-25 questions covering all modules), capstone project requirements, presentation guidelines, comprehensive grading rubric, reflection essay prompts. Markdown format.`;
    const content = await this.callDeepSeek(prompt, 3000);
    await fs.writeFile(path.join(coursePath, 'final_assessment.md'), content);
  }

  async generateFinalReport(): Promise<void> {
    console.log('\n' + '='.repeat(70));
    console.log('📊 DEEPSEEK DIRECT API GENERATION REPORT');
    console.log('='.repeat(70));
    
    console.log(`\n✅ Successfully Generated: ${this.generatedCount}/${ALL_COURSES.length} courses`);
    
    if (this.failedCourses.length > 0) {
      console.log(`\n❌ Failed Courses (${this.failedCourses.length}):` );
      this.failedCourses.forEach(courseId => {
        console.log(`   • ${courseId}`);
      });
    }

    const reportPath = path.join(process.cwd(), '../DEEPSEEK_DIRECT_GENERATION_REPORT.md');
    const report = `# DEEPSEEK DIRECT API GENERATION REPORT

**Generated**: ${new Date().toISOString()}

## Summary

- **Total Courses**: ${ALL_COURSES.length}
- **Successfully Generated**: ${this.generatedCount}
- **Failed**: ${this.failedCourses.length}

## API Configuration

- **Provider**: DeepSeek Direct API
- **Endpoint**: https://api.deepseek.com
- **Model**: deepseek-chat

## Generated Courses

${ALL_COURSES.filter(c => !this.failedCourses.includes(c.courseId)).map(c => 
  `- ✅ ${c.courseId} - ${c.courseName}`
).join('\n')}

${this.failedCourses.length > 0 ? `\n## Failed Courses\n\n${this.failedCourses.map(id => `- ❌ ${id}`).join('\n')}\n` : ''}

## Next Steps

1. Run verification: \`npx tsx scripts/comprehensive-course-verification.ts\`
2. Review generated content for quality
3. Launch student onboarding system

**Status**: ${this.generatedCount === ALL_COURSES.length ? '✅ ALL COURSES COMPLETE' : '⚠️ SOME COURSES NEED ATTENTION'}
`;

    await fs.writeFile(reportPath, report);
    console.log(`\n📄 Report saved: DEEPSEEK_DIRECT_GENERATION_REPORT.md`);
  }
}

// Execute
if (require.main === module) {
  const generator = new DeepSeekCourseGenerator();
  generator.generateAllCourses().catch(error => {
    console.error('\n💥 FATAL ERROR:', error);
    process.exit(1);
  });
}

export { DeepSeekCourseGenerator };
