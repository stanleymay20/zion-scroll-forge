#!/usr/bin/env npx tsx

/**
 * COMPLETE COURSE_001 - Finish modules 9-10
 * Sacred AI & Machine Learning Engineering
 */

import { promises as fs } from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('❌ ERROR: OPENROUTER_API_KEY not found');
  process.exit(1);
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey,
  defaultHeaders: {
    'HTTP-Referer': 'https://scrolluniversity.com',
    'X-Title': 'ScrollUniversity Course Generator'
  }
});

const coursePath = path.join(process.cwd(), '../courses/COURSE_001_Sacred_AI_Engineering');

async function callAI(prompt: string, maxTokens: number): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'deepseek/deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: maxTokens
  });
  return response.choices[0].message.content || '';
}

async function completeModule(moduleNum: number): Promise<void> {
  console.log(`\n📂 Completing Module ${moduleNum}/10...`);
  
  const modulePath = path.join(coursePath, `module${moduleNum}`);
  await fs.mkdir(modulePath, { recursive: true });

  // Module overview
  console.log(`  📄 Module overview...`);
  const overview = await callAI(
    `Generate module overview for Module ${moduleNum} of "Sacred AI & Machine Learning Engineering". Include: title, 4 learning objectives, key concepts, 2 Scripture foundations, applications, 4 lecture structure. Follow Scroll Pedagogy. Markdown format.`,
    1500
  );
  await fs.writeFile(path.join(modulePath, 'module_overview.md'), overview);

  // 4 Lectures
  for (let lectureNum = 1; lectureNum <= 4; lectureNum++) {
    console.log(`  📄 Lecture ${lectureNum}/4...`);
    const lecture = await callAI(
      `Generate comprehensive lecture for Module ${moduleNum}, Lecture ${lectureNum} of "Sacred AI & Machine Learning Engineering". Follow Scroll Pedagogy 6-step flow: 1) IGNITION (hook), 2) DOWNLOAD (teaching), 3) DEMONSTRATION (example), 4) ACTIVATION (practice), 5) REFLECTION (application), 6) COMMISSION (next steps). 2000+ words, university-level, biblical integration. Markdown format.`,
      3000
    );
    await fs.writeFile(path.join(modulePath, `lecture${lectureNum}.md`), lecture);
    
    // Video script
    const videoScript = {
      title: `Module ${moduleNum} - Lecture ${lectureNum}`,
      duration: "45-50 minutes",
      segments: [
        { type: "introduction", duration: "5 minutes", content: "Welcome and overview" },
        { type: "main_teaching", duration: "30 minutes", content: "Core content delivery" },
        { type: "demonstration", duration: "10 minutes", content: "Worked examples" },
        { type: "conclusion", duration: "5 minutes", content: "Summary and next steps" }
      ]
    };
    await fs.writeFile(path.join(modulePath, `lecture${lectureNum}_video.json`), JSON.stringify(videoScript, null, 2));
  }

  // Assessments
  console.log(`  ✅ Assessments...`);
  const knowledgeCheck = await callAI(
    `Generate knowledge check for Module ${moduleNum} of "Sacred AI & Machine Learning Engineering". Include: 10 multiple choice, 5 true/false, 3 short answer. Markdown format.`,
    2000
  );
  await fs.writeFile(path.join(modulePath, `module_${moduleNum}_knowledge_check.md`), knowledgeCheck);

  const assignment = await callAI(
    `Generate practical assignment for Module ${moduleNum} of "Sacred AI & Machine Learning Engineering". Include: objectives, instructions, deliverables, rubric. Markdown format.`,
    1500
  );
  await fs.writeFile(path.join(modulePath, `module_${moduleNum}_application_assignment.md`), assignment);

  // Spiritual formation
  console.log(`  🙏 Spiritual formation...`);
  const spiritualFormation = await callAI(
    `Generate spiritual formation reflection for Module ${moduleNum} of "Sacred AI & Machine Learning Engineering". Include: Scripture meditation, reflection questions, prayer prompts. Markdown format.`,
    1500
  );
  await fs.writeFile(path.join(modulePath, `module_${moduleNum}_spiritual_formation_reflection.md`), spiritualFormation);
  
  console.log(`✅ Module ${moduleNum} complete!`);
}

async function main() {
  console.log('🔧 COMPLETING COURSE_001: Sacred AI Engineering');
  console.log('='.repeat(60));
  console.log('📋 Finishing modules 9-10\n');

  try {
    await completeModule(9);
    await completeModule(10);
    
    console.log('\n✅ COURSE_001 COMPLETION SUCCESSFUL!');
    console.log('📊 Course now has all 10 modules with complete content');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
