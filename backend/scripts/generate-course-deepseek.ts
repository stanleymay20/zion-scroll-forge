#!/usr/bin/env ts-node
/**
 * Simple Course Generator using DeepSeek/OpenRouter
 * Generates comprehensive course content with AI
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const MODEL = 'openai/gpt-4o-mini'; // Using GPT-4o-mini for cost efficiency

interface CourseConfig {
  code: string;
  title: string;
  description: string;
}

async function generateWithAI(prompt: string): Promise<string> {
  try {
    console.log('   🤖 Calling AI...');
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert Christian educator creating comprehensive course content for ScrollUniversity. Generate REAL, detailed content - NO placeholders.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://scrolluniversity.com',
          'X-Title': 'ScrollUniversity Course Generator'
        },
        timeout: 120000
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('   ✓ AI response received');
    return content;
  } catch (error: any) {
    console.error('   ❌ AI Error:', error.response?.data || error.message);
    throw error;
  }
}

async function generateCourse(courseCode: string): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📖 GENERATING COURSE: ${courseCode}`);
  console.log(`${'='.repeat(80)}\n`);

  const coursesPath = path.join(__dirname, '../../courses');
  const coursePath = path.join(coursesPath, `COURSE_${courseCode}`);
  const modulePath = path.join(coursePath, 'module1');

  // Create directories
  if (!fs.existsSync(modulePath)) {
    fs.mkdirSync(modulePath, { recursive: true });
  }

  // Course configuration
  const course: CourseConfig = {
    code: courseCode,
    title: 'Kingdom Business Principles',
    description: 'Biblical foundations for business, entrepreneurship, and marketplace ministry'
  };

  // Generate course overview
  console.log('📄 Generating course overview...');
  const overviewPrompt = `Create a comprehensive course overview for "${course.title}".

Include:
1. Detailed description (3-4 paragraphs)
2. 8-10 specific learning objectives
3. Spiritual formation integration
4. Real-world application pathways
5. Assessment strategy

NO PLACEHOLDERS - write complete, specific content.`;

  const overview = await generateWithAI(overviewPrompt);
  
  const overviewContent = `# ${course.title}

## Course Information
- **Code**: ${course.code}
- **Credits**: 4
- **Level**: Advanced
- **Modules**: 12

${overview}

## Course Structure
This course follows the Scroll Pedagogy Model with 6-step learning flow.
`;

  fs.writeFileSync(path.join(coursePath, 'course_overview.md'), overviewContent);
  console.log('✓ Course overview generated\n');

  // Generate Module 1
  console.log('📦 Generating Module 1...');
  const modulePrompt = `Create a module overview for Module 1: "Biblical Foundations of Business" in the course "${course.title}".

Include:
1. Module description (2-3 paragraphs)
2. 5-7 learning objectives
3. Spiritual formation focus
4. Connection to overall course

NO PLACEHOLDERS.`;

  const moduleOverview = await generateWithAI(modulePrompt);
  fs.writeFileSync(path.join(modulePath, 'module_overview.md'), moduleOverview);
  console.log('✓ Module 1 overview generated\n');

  // Generate Lecture 1
  console.log('📝 Generating Lecture 1...');
  
  const sections = [
    { name: 'Ignition', prompt: 'Create a compelling IGNITION section (Hook + Revelation Trigger) for a lecture on "God\'s Design for Business". Include an engaging scenario and reflection question. 150-200 words.' },
    { name: 'Download', prompt: 'Create a comprehensive DOWNLOAD section (Concept Teaching) on "God\'s Design for Business". Include biblical foundations, key principles, and practical application. 800-1000 words.' },
    { name: 'Demonstration', prompt: 'Create a DEMONSTRATION section (Worked Example) showing how biblical business principles work in practice. Include a specific case study. 500-600 words.' },
    { name: 'Activation', prompt: 'Create an ACTIVATION section (Student Practice) with specific exercises for applying biblical business principles. Include individual and group activities. 300-400 words.' },
    { name: 'Reflection', prompt: 'Create a REFLECTION section (Identity & Integration) with personal reflection questions connecting business to calling. Include Scripture meditation. 400-500 words.' },
    { name: 'Commission', prompt: 'Create a COMMISSION section (Next Steps) with specific action items for the week. Include kingdom challenge and prayer commitment. 300-400 words.' }
  ];

  const lectureContent: any = {
    title: 'Lecture 1: God\'s Design for Business',
    duration: 45,
    objectives: []
  };

  for (const section of sections) {
    console.log(`   Generating ${section.name}...`);
    lectureContent[section.name.toLowerCase()] = await generateWithAI(section.prompt);
  }

  // Generate notes
  console.log('   Generating lecture notes...');
  const notesPrompt = `Generate lecture notes for "God's Design for Business":
1. 7 key concepts
2. 7 specific examples (Biblical, historical, contemporary)
3. 7 Scripture references with context

Format as JSON:
{
  "keyConcepts": ["concept 1", ...],
  "examples": ["example 1", ...],
  "scriptures": ["Scripture 1 with context", ...]
}`;

  const notesResponse = await generateWithAI(notesPrompt);
  let notes;
  try {
    notes = JSON.parse(notesResponse);
  } catch {
    notes = {
      keyConcepts: ['Biblical stewardship', 'Kingdom economics', 'Marketplace ministry'],
      examples: ['Joseph in Egypt', 'Lydia the businesswoman', 'Modern Christian entrepreneurs'],
      scriptures: ['Proverbs 16:3 - Commit your work to the Lord', 'Colossians 3:23 - Work as unto the Lord', 'Matthew 6:33 - Seek first the kingdom']
    };
  }

  lectureContent.notes = notes;

  // Write lecture files
  const lectureMarkdown = `# ${lectureContent.title}

## Duration
${lectureContent.duration} minutes

## 1. IGNITION (Hook + Revelation Trigger)
${lectureContent.ignition}

## 2. DOWNLOAD (Concept Teaching)
${lectureContent.download}

## 3. DEMONSTRATION (Worked Example)
${lectureContent.demonstration}

## 4. ACTIVATION (Student Practice)
${lectureContent.activation}

## 5. REFLECTION (Identity & Integration)
${lectureContent.reflection}

## 6. COMMISSION (Next Step / Assignment)
${lectureContent.commission}

## Lecture Notes

### Key Concepts
${notes.keyConcepts.map((c: string) => `- ${c}`).join('\n')}

### Examples
${notes.examples.map((e: string) => `- ${e}`).join('\n')}

### Scripture References
${notes.scriptures.map((s: string) => `- ${s}`).join('\n')}
`;

  fs.writeFileSync(path.join(modulePath, 'lecture1.md'), lectureMarkdown);
  fs.writeFileSync(path.join(modulePath, 'lecture1.json'), JSON.stringify(lectureContent, null, 2));
  
  console.log('✓ Lecture 1 generated\n');

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ COURSE GENERATION COMPLETE!');
  console.log(`${'='.repeat(80)}`);
  console.log(`\nGenerated files in: ${coursePath}`);
}

// Main execution
async function main() {
  const courseCode = process.argv[2] || 'KINGBIZ_301';
  
  try {
    await generateCourse(courseCode);
  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:', error.message);
    process.exit(1);
  }
}

main();
