#!/usr/bin/env ts-node
/**
 * Single Course Generator - ScrollUniversity Royal Standard
 * 
 * Generates ONE course at a time with full depth and quality validation.
 * This is the new standard for ScrollUniversity course creation.
 * 
 * Usage:
 *   npx ts-node --transpile-only scripts/generate-single-course.ts SCROLLFOUND_101
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

import { ContentQualityValidator } from '../src/services/ContentQualityValidator';
import { OpenRouterService } from '../src/services/OpenRouterService';

// Pilot course catalog
const PILOT_COURSES: Record<string, any> = {
  'SCROLLFOUND_101': {
    code: 'SCROLLFOUND_101',
    title: 'Foundations of Scroll Thinking',
    faculty: 'ScrollFoundations',
    level: 100,
    credits: 3,
    description: 'Introduction to the Scroll worldview, kingdom mindset, and transformational thinking that undergirds all ScrollUniversity education.',
    prerequisites: [],
    learningOutcomes: [
      'Understand the biblical foundations of Scroll thinking',
      'Apply kingdom principles to real-world challenges',
      'Develop a transformational mindset for leadership',
      'Integrate faith and learning across disciplines'
    ],
    spiritualFormationOutcomes: [
      'Deepen relationship with Christ as the source of wisdom',
      'Cultivate a kingdom-first perspective',
      'Develop spiritual discernment for decision-making'
    ],
    scrollAlignment: {
      kingdomPurpose: 'Equip students to think and lead from a kingdom perspective',
      transformationGoals: ['Mindset transformation', 'Leadership development', 'Spiritual maturity'],
      callingIntegration: 'Help students discover how their unique calling aligns with kingdom purposes'
    }
  },
  'SCROLLBIB_101': {
    code: 'SCROLLBIB_101',
    title: 'Bible Foundations for Scroll Leaders',
    faculty: 'ScrollTheology & Bible Intelligence',
    level: 100,
    credits: 3,
    description: 'Comprehensive study of biblical foundations essential for kingdom leadership, including hermeneutics, theology, and practical application.',
    prerequisites: [],
    learningOutcomes: [
      'Master biblical interpretation principles',
      'Understand core theological frameworks',
      'Apply scripture to contemporary challenges',
      'Develop a biblical worldview'
    ],
    spiritualFormationOutcomes: [
      'Deepen love for God\'s Word',
      'Develop consistent Bible study habits',
      'Grow in biblical wisdom and discernment'
    ],
    scrollAlignment: {
      kingdomPurpose: 'Build strong biblical foundations for all kingdom work',
      transformationGoals: ['Biblical literacy', 'Theological depth', 'Practical wisdom'],
      callingIntegration: 'Discover biblical patterns for your specific calling'
    }
  },
  'SCROLLAI_101': {
    code: 'SCROLLAI_101',
    title: 'Introduction to Scroll AI & Agents',
    faculty: 'ScrollTech & AI Innovation',
    level: 100,
    credits: 3,
    description: 'Explore AI technology through a kingdom lens, learning to build and deploy AI agents for transformational impact.',
    prerequisites: [],
    learningOutcomes: [
      'Understand AI fundamentals and capabilities',
      'Build basic AI agents and applications',
      'Apply AI ethically from a biblical perspective',
      'Identify kingdom applications for AI technology'
    ],
    spiritualFormationOutcomes: [
      'Develop wisdom for technology stewardship',
      'Cultivate ethical discernment in AI use',
      'See technology as a tool for kingdom advancement'
    ],
    scrollAlignment: {
      kingdomPurpose: 'Harness AI technology for kingdom transformation',
      transformationGoals: ['Technical competency', 'Ethical AI development', 'Kingdom innovation'],
      callingIntegration: 'Discover how AI can amplify your unique calling'
    }
  }
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

class SingleCourseGenerator {
  private openRouter: OpenRouterService;
  private courseCode: string;
  private courseSpec: any;
  private outputDir: string;
  private logFile: string;

  constructor(courseCode: string) {
    this.courseCode = courseCode;
    this.courseSpec = PILOT_COURSES[courseCode];
    
    if (!this.courseSpec) {
      throw new Error(`Course ${courseCode} not found in pilot catalog. Available: ${Object.keys(PILOT_COURSES).join(', ')}`);
    }

    this.openRouter = new OpenRouterService();
    this.outputDir = path.join(process.cwd(), '..', 'courses', `COURSE_${courseCode}`);
    this.logFile = path.join(this.outputDir, 'generation.log');

    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(this.logFile, logMessage);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Step 1: Generate module outlines
   */
  private async generateModuleOutlines(): Promise<any[]> {
    this.log('\n=== STEP 1: Generating Module Outlines ===');

    const prompt = `You are an expert curriculum designer for ScrollUniversity, a Christian educational institution.

Generate 10 module outlines for the course: ${this.courseSpec.title} (${this.courseCode})

Course Description: ${this.courseSpec.description}

Learning Outcomes:
${this.courseSpec.learningOutcomes.map((o: string, i: number) => `${i + 1}. ${o}`).join('\n')}

Spiritual Formation Outcomes:
${this.courseSpec.spiritualFormationOutcomes.map((o: string, i: number) => `${i + 1}. ${o}`).join('\n')}

Kingdom Purpose: ${this.courseSpec.scrollAlignment.kingdomPurpose}

REQUIREMENTS:
1. Create 10 modules (one per week)
2. Each module must have:
   - Specific, descriptive title (NOT generic like "Module 1: Introduction")
   - Clear learning goal
   - 3-5 key scriptures with references
   - 5-7 specific concepts (NOT "Concept 1-1" - use real terminology)
   - 2-3 spiritual themes
3. Modules should build progressively
4. Include both theoretical and practical elements
5. Integrate biblical worldview throughout

Return ONLY valid JSON array of 10 modules in this EXACT format:
[
  {
    "title": "Specific Module Title",
    "goal": "Clear learning goal statement",
    "keyConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"],
    "keyScriptures": [
      {"reference": "John 3:16", "theme": "God's love"},
      {"reference": "Romans 8:28", "theme": "God's sovereignty"}
    ],
    "spiritualThemes": ["Theme 1", "Theme 2"]
  }
]

Return ONLY the JSON array. No markdown, no explanation, no code blocks.`;

    const response = await this.openRouter.generateContent(
      [{ role: 'user', content: prompt }],
      'google/gemini-2.0-flash-exp:free',
      { temperature: 0.7, max_tokens: 4000 }
    );

    // Clean markdown wrappers if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const modules = JSON.parse(cleanedResponse);
    this.log(`✅ Generated ${modules.length} module outlines`);
    
    return modules;
  }

  /**
   * Step 2: Generate ONE lecture with full depth
   */
  private async generateLecture(
    moduleNumber: number,
    lectureNumber: number,
    moduleContext: any,
    retryCount: number = 0
  ): Promise<any> {
    this.log(`\n--- Generating Module ${moduleNumber}, Lecture ${lectureNumber} (Attempt ${retryCount + 1}/${MAX_RETRIES}) ---`);

    const prompt = `You are an expert content creator for ScrollUniversity, a Christian educational institution.

Create a comprehensive lecture for:
Course: ${this.courseSpec.title} (${this.courseCode})
Module ${moduleNumber}: ${moduleContext.title}
Lecture ${lectureNumber}

Module Context:
- Goal: ${moduleContext.goal}
- Key Concepts: ${moduleContext.keyConcepts.join(', ')}
- Scriptures: ${moduleContext.keyScriptures.map((s: any) => s.reference).join(', ')}

CRITICAL REQUIREMENTS:
1. Lecture notes must be 1500+ words of SUBSTANTIVE content
2. Use SPECIFIC terminology - NO placeholders like "Concept 1-1" or "Example 2-1"
3. Include 3+ scripture references with full text and application
4. Provide 3 CONCRETE examples with real-world details
5. Include 5+ practice problems with solutions
6. Add reflection questions that connect to calling and kingdom purpose

STRUCTURE:
{
  "id": "${this.courseCode}-M${moduleNumber}-L${lectureNumber}",
  "title": "Specific descriptive title",
  "duration": 30-45,
  "content": "Brief overview",
  "notes": {
    "content": "FULL 1500+ word lecture content with:
      - Introduction with hook
      - 3-5 main sections with specific concepts
      - Biblical foundation with scripture
      - Concrete examples (NOT generic)
      - Practice problems
      - Reflection questions
      - Summary",
    "summary": "Key takeaways",
    "keyConcepts": ["Specific concept 1", "Specific concept 2", ...],
    "examples": [
      {
        "title": "Specific example title",
        "description": "Detailed description",
        "explanation": "Step-by-step explanation"
      }
    ],
    "practiceProblems": [
      {
        "question": "Specific problem",
        "solution": "Detailed solution",
        "difficulty": "Easy|Medium|Hard",
        "hints": ["Hint 1", "Hint 2"]
      }
    ]
  },
  "scriptOutline": "Video script outline",
  "keyTerms": ["Specific term 1", "Specific term 2", ...]
}

Return ONLY valid JSON. No markdown, no explanation.`;

    const response = await this.openRouter.generateContent(
      [{ role: 'user', content: prompt }],
      'google/gemini-2.0-flash-exp:free',
      { temperature: 0.7, max_tokens: 6000 }
    );

    // Clean markdown wrappers if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const lecture = JSON.parse(cleanedResponse);

    // VALIDATE QUALITY
    const validation = ContentQualityValidator.validateLecture(lecture, {
      courseCode: this.courseCode,
      moduleNumber,
      lectureNumber
    });

    this.log(ContentQualityValidator.generateReport(validation, { moduleNumber, lectureNumber }));

    if (!validation.isValid) {
      if (retryCount < MAX_RETRIES - 1) {
        this.log(`⚠️  Validation failed (score: ${validation.score}). Retrying...`);
        await this.delay(RETRY_DELAY);
        return this.generateLecture(moduleNumber, lectureNumber, moduleContext, retryCount + 1);
      } else {
        this.log(`❌ Max retries reached. Flagging for human review.`);
        lecture._needsReview = true;
        lecture._validationErrors = validation.errors;
      }
    } else {
      this.log(`✅ Lecture validated (score: ${validation.score})`);
    }

    return lecture;
  }

  /**
   * Step 3: Generate assessments for module
   */
  private async generateAssessments(moduleNumber: number, moduleContext: any): Promise<any[]> {
    this.log(`\n--- Generating Assessments for Module ${moduleNumber} ---`);

    const prompt = `Create assessments for Module ${moduleNumber}: ${moduleContext.title}

Key Concepts: ${moduleContext.keyConcepts.join(', ')}

Generate:
1. Formative quiz (5-10 questions)
2. Summative assessment (essay/project)
3. Reflection assignment

Return JSON array of assessment objects.`;

    const response = await this.openRouter.generateContent(
      [{ role: 'user', content: prompt }],
      'google/gemini-2.0-flash-exp:free',
      { temperature: 0.6, max_tokens: 2000 }
    );

    return JSON.parse(response);
  }

  /**
   * Main generation workflow
   */
  public async generate(): Promise<void> {
    this.log(`\n🚀 Starting generation for ${this.courseCode}: ${this.courseSpec.title}`);
    this.log(`Output directory: ${this.outputDir}`);

    try {
      // Step 1: Generate module outlines
      const moduleOutlines = await this.generateModuleOutlines();
      
      // Save module outlines
      fs.writeFileSync(
        path.join(this.outputDir, 'module-outlines.json'),
        JSON.stringify(moduleOutlines, null, 2)
      );

      // Step 2: Generate lectures for each module
      const fullModules = [];
      
      for (let m = 0; m < moduleOutlines.length; m++) {
        const moduleOutline = moduleOutlines[m];
        this.log(`\n=== MODULE ${m + 1}: ${moduleOutline.title} ===`);

        const lectures = [];
        const numLectures = 4; // 4 lectures per module

        for (let l = 0; l < numLectures; l++) {
          const lecture = await this.generateLecture(m + 1, l + 1, moduleOutline);
          lectures.push(lecture);
          
          // Save progress after each lecture
          fs.writeFileSync(
            path.join(this.outputDir, `module${m + 1}_lecture${l + 1}.json`),
            JSON.stringify(lecture, null, 2)
          );
        }

        // Step 3: Generate assessments
        const assessments = await this.generateAssessments(m + 1, moduleOutline);

        // Compile full module
        const fullModule = {
          ...moduleOutline,
          weekNumber: m + 1,
          lectures,
          assessments
        };

        fullModules.push(fullModule);

        // Save module
        fs.writeFileSync(
          path.join(this.outputDir, `module${m + 1}_complete.json`),
          JSON.stringify(fullModule, null, 2)
        );
      }

      // Step 4: Compile full course
      const fullCourse = {
        ...this.courseSpec,
        moduleCount: fullModules.length,
        modules: fullModules,
        generatedAt: new Date().toISOString(),
        generator: 'single-course-generator-v1'
      };

      // Validate full course
      const courseValidation = ContentQualityValidator.validateCourse(fullCourse);
      this.log(ContentQualityValidator.generateReport(courseValidation, { courseCode: this.courseCode }));

      // Save final course
      fs.writeFileSync(
        path.join(this.outputDir, 'course_data.json'),
        JSON.stringify(fullCourse, null, 2)
      );

      this.log(`\n✅ Course generation complete!`);
      this.log(`📊 Final Score: ${courseValidation.score}/100`);
      this.log(`📁 Output: ${this.outputDir}`);

      if (!courseValidation.isValid) {
        this.log(`\n⚠️  WARNING: Course did not pass validation. Review required.`);
        process.exit(1);
      }

    } catch (error) {
      this.log(`\n❌ ERROR: ${error}`);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const courseCode = process.argv[2];

  if (!courseCode) {
    console.error('Usage: npx ts-node --transpile-only scripts/generate-single-course.ts <COURSE_CODE>');
    console.error('\nAvailable pilot courses:');
    Object.keys(PILOT_COURSES).forEach(code => {
      console.error(`  - ${code}: ${PILOT_COURSES[code].title}`);
    });
    process.exit(1);
  }

  const generator = new SingleCourseGenerator(courseCode);
  await generator.generate();
}

main().catch(console.error);
