import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
const lovableKey = Deno.env.get('LOVABLE_API_KEY');
const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
const didApiKey = Deno.env.get('DID_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

// 8-Week Curriculum Structure for Christ the Cornerstone ScrollCertificate
const COURSE_CURRICULUM = [
  {
    week: 1,
    title: "The Eternal Word: Christ Before Creation",
    theme: "Pre-existence and Divinity of Christ",
    keyScripture: "John 1:1-14",
    focus: "Understanding Christ's eternal nature, the Word made flesh, and His role in the Godhead"
  },
  {
    week: 2,
    title: "Creator and Sustainer: Christ in Genesis",
    theme: "Christ as the Agent of Creation",
    keyScripture: "Colossians 1:15-20",
    focus: "Exploring Christ's role in creating and sustaining all things, cosmic Christology"
  },
  {
    week: 3,
    title: "The Promised One: Christ in Old Testament Prophecy",
    theme: "Messianic Prophecies Fulfilled",
    keyScripture: "Isaiah 53:1-12",
    focus: "Tracing Christ through the prophets, typology, and messianic expectations"
  },
  {
    week: 4,
    title: "The Incarnation: God With Us",
    theme: "The Mystery of the Incarnation",
    keyScripture: "Philippians 2:5-11",
    focus: "The kenosis, virgin birth, fully God and fully man, the hypostatic union"
  },
  {
    week: 5,
    title: "The Cornerstone Revealed: Christ's Teaching Ministry",
    theme: "The Wisdom and Authority of Christ",
    keyScripture: "Matthew 5:1-16",
    focus: "Sermon on the Mount, parables, kingdom teaching, and revolutionary ethics"
  },
  {
    week: 6,
    title: "The Cross and the Cornerstone: Atonement",
    theme: "Redemption Through Sacrifice",
    keyScripture: "Romans 5:6-11",
    focus: "Theories of atonement, substitutionary sacrifice, propitiation, and reconciliation"
  },
  {
    week: 7,
    title: "Victory and Vindication: Resurrection Power",
    theme: "The Risen Christ",
    keyScripture: "1 Corinthians 15:12-28",
    focus: "Historical evidence, theological significance, and transformative power of resurrection"
  },
  {
    week: 8,
    title: "Reign and Return: Christ the King",
    theme: "Christological Eschatology",
    keyScripture: "Revelation 19:11-16",
    focus: "Ascension, session, intercession, second coming, and eternal reign"
  }
];

// AI Content Generation
async function generateContent(prompt: string, systemPrompt: string, maxTokens: number = 8000): Promise<string> {
  const apiKey = deepseekKey || lovableKey;
  const apiUrl = deepseekKey 
    ? 'https://api.deepseek.com/v1/chat/completions'
    : 'https://ai.gateway.lovable.dev/v1/chat/completions';
  const model = deepseekKey ? 'deepseek-chat' : 'google/gemini-2.5-flash';

  console.log(`Generating content with ${deepseekKey ? 'DeepSeek' : 'Lovable AI'}...`);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', errorText);
    throw new Error(`AI API failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Upload file to Supabase Storage
async function uploadToStorage(
  bucket: string,
  path: string,
  content: Uint8Array | string,
  contentType: string
): Promise<string | null> {
  try {
    const fileContent = typeof content === 'string' 
      ? new TextEncoder().encode(content) 
      : content;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, fileContent, { contentType, upsert: true });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

// Generate comprehensive module content (2500+ words)
async function generateModuleContent(week: typeof COURSE_CURRICULUM[0]): Promise<string> {
  const systemPrompt = `You are Dr. Emmanuel Wisdom, a distinguished professor of Christology at Scroll University with 30 years of teaching experience. Your writing combines deep theological scholarship with pastoral warmth and practical application. You write with academic rigor yet accessibility, always grounding truth in Scripture.`;

  const prompt = `Create a comprehensive 2500-3000 word lesson for Week ${week.week} of "Christ the Cornerstone" ScrollCertificate.

TITLE: ${week.title}
THEME: ${week.theme}
KEY SCRIPTURE: ${week.keyScripture}
FOCUS: ${week.focus}

Write in rich Markdown format with:

# Week ${week.week}: ${week.title}

## Opening Prayer
[A reverent 50-word prayer setting the tone]

## Learning Objectives
1. [Cognitive objective - knowledge]
2. [Affective objective - values/attitudes]
3. [Behavioral objective - practical application]
4. [Spiritual objective - formation]
5. [Ministry objective - service]

## Key Scripture Meditation
> [Full text of ${week.keyScripture}]

[150-word devotional reflection on this passage]

## Introduction: Why This Matters
[300 words contextualizing this week's study within the broader scope of Christology and its relevance to contemporary Christian life]

## Section 1: Biblical Foundations
[500 words of deep exegesis of key passages, including original language insights where relevant]

### Key Greek/Hebrew Terms
- **[Term 1]**: [Meaning and significance]
- **[Term 2]**: [Meaning and significance]
- **[Term 3]**: [Meaning and significance]

## Section 2: Theological Development
[500 words tracing how the church has understood this doctrine through history - Church Fathers, Reformers, Modern scholars]

### Historical Milestones
[Brief timeline of key theological developments]

## Section 3: Contemporary Application
[400 words on how this truth applies to:
- Personal spiritual formation
- Corporate worship and community
- Cultural engagement and witness
- Ministry and mission]

## Section 4: Common Misconceptions
[300 words addressing 3-4 common errors or heresies related to this topic]

## Case Study
[A 200-word real-world scenario for reflection and discussion]

## Discussion Questions
1. [Knowledge recall question]
2. [Comprehension question]
3. [Application question]
4. [Analysis question]
5. [Evaluation question]
6. [Personal reflection question]

## Weekly Assignment
**Due: End of Week ${week.week}**
[Detailed 150-word assignment description worth 50 ScrollGold]

## Scripture Memory Challenge
> "${week.keyScripture} memory verse"
*Memorizing this verse earns 15 ScrollGold*

## Further Reading
- [Academic source 1]
- [Devotional source 2]
- [Biblical commentary source 3]

## ScrollGold Rewards
| Activity | Reward |
|----------|--------|
| Complete Module Reading | 20 SG |
| Pass Weekly Quiz (70%+) | 30 SG |
| Submit Assignment | 50 SG |
| Scripture Memory | 15 SG |
| Discussion Participation | 10 SG |

## Closing Benediction
[A 50-word benediction connecting to the week's theme]

---
*Next Week Preview: Week ${week.week + 1 > 8 ? 'Final Assessment' : COURSE_CURRICULUM[week.week]?.title || 'Certificate Completion'}*

IMPORTANT: Write substantive, theologically rich content. No filler. Every paragraph should teach something significant.`;

  return await generateContent(prompt, systemPrompt, 8000);
}

// Generate comprehensive study guide PDF
async function generateStudyGuide(week: typeof COURSE_CURRICULUM[0]): Promise<string> {
  const systemPrompt = `You are creating a professional PDF study guide for university theology students. Write in clear, organized HTML format suitable for PDF conversion.`;

  const prompt = `Create a comprehensive HTML study guide for:
Week ${week.week}: ${week.title}
Theme: ${week.theme}
Scripture: ${week.keyScripture}

Generate a well-structured HTML document with:
1. Title page with course branding
2. Learning objectives (7-10 specific objectives)
3. Vocabulary/Key Terms glossary (15+ terms with definitions)
4. Scripture passages with analysis (10+ verses)
5. Theological concepts explained in depth (2000+ words)
6. Charts/Tables for comparing views
7. Timeline of historical development
8. Application exercises (5 practical exercises)
9. Self-assessment questions (15 questions)
10. Notes section with lined spaces
11. Bibliography and further reading

Use proper semantic HTML with:
- Clean typography styling
- Professional academic formatting
- Scroll University branding colors (gold accents)
- Print-friendly layout`;

  return await generateContent(prompt, systemPrompt, 8000);
}

// Generate lecture notes
async function generateLectureNotes(week: typeof COURSE_CURRICULUM[0]): Promise<string> {
  const systemPrompt = `You are a theology professor preparing detailed lecture notes with a teaching focus.`;

  const prompt = `Create comprehensive lecture notes for:
Week ${week.week}: ${week.title}
Theme: ${week.theme}

Include in HTML format:
1. Lecture outline with timestamps
2. Key points highlighted with boxes
3. Scripture references with full text
4. Discussion prompts for class
5. Whiteboard diagram descriptions
6. Memory aids and mnemonics
7. Common student questions anticipated
8. Supplementary examples
9. Connections to previous weeks
10. Preview of upcoming content

Make it 3000+ words with rich theological content.`;

  return await generateContent(prompt, systemPrompt, 8000);
}

// Generate scripture study guide
async function generateScriptureStudy(week: typeof COURSE_CURRICULUM[0]): Promise<string> {
  const systemPrompt = `You are a biblical scholar with expertise in original languages and hermeneutics.`;

  const prompt = `Create an in-depth Scripture study for:
Week ${week.week}: ${week.title}
Primary Text: ${week.keyScripture}

Include in HTML format:
1. Primary passage with verse-by-verse commentary
2. 10 cross-references with explanations
3. Original language word studies (5+ terms)
4. Historical-cultural background
5. Literary structure analysis
6. Theological themes extracted
7. Christological connections
8. Personal application questions (10)
9. Memorization techniques
10. Prayer points from the text

Make it thorough and academically rigorous.`;

  return await generateContent(prompt, systemPrompt, 6000);
}

// Generate discussion guide
async function generateDiscussionGuide(week: typeof COURSE_CURRICULUM[0]): Promise<string> {
  const systemPrompt = `You create engaging small group discussion materials.`;

  const prompt = `Create a discussion guide for:
Week ${week.week}: ${week.title}

Include in HTML format:
1. Ice breaker question
2. Opening prayer prompt
3. Review questions (10)
4. Deep dive questions (10)
5. Application questions (10)
6. Debate topics (3 with multiple perspectives)
7. Group activities (5)
8. Case studies (3 real-world scenarios)
9. Accountability questions
10. Closing challenge and prayer points`;

  return await generateContent(prompt, systemPrompt, 5000);
}

// Generate video script for AI avatar
async function generateVideoScript(week: typeof COURSE_CURRICULUM[0]): Promise<string> {
  const systemPrompt = `You are Professor Emmanuel, a warm and engaging theology professor. Write a script to be spoken by an AI avatar - conversational, engaging, about 180 words (90 seconds when spoken). No stage directions, just spoken text.`;

  const prompt = `Create a brief video lecture introduction for:
Week ${week.week}: ${week.title}
Theme: ${week.theme}
Key Scripture: ${week.keyScripture}

Include:
- Warm welcome
- Why this topic matters
- 2-3 key points to preview
- Encouraging conclusion

Keep it under 200 words, conversational tone.`;

  return await generateContent(prompt, systemPrompt, 500);
}

// Generate audio content
async function generateAudio(text: string, voiceId: string = 'JBFqnCBsd6RMkjVDRZzb'): Promise<Uint8Array | null> {
  if (!elevenLabsKey) {
    console.log('ElevenLabs API key not configured');
    return null;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.substring(0, 5000),
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!response.ok) {
      console.error('ElevenLabs error:', await response.text());
      return null;
    }

    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    console.error('Audio generation error:', error);
    return null;
  }
}

// Generate D-ID video
async function generateVideo(script: string, moduleSlug: string, basePath: string): Promise<{ url: string | null; status: string }> {
  if (!didApiKey) {
    console.log('D-ID API key not configured');
    return { url: null, status: 'skipped' };
  }

  try {
    console.log('Creating D-ID talk...');
    const createResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${didApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg',
        script: {
          type: 'text',
          input: script.substring(0, 1500),
          provider: { type: 'microsoft', voice_id: 'en-US-GuyNeural' }
        },
        config: { fluent: true, pad_audio: 0.5, stitch: true }
      })
    });

    if (!createResponse.ok) {
      console.error('D-ID create error:', await createResponse.text());
      return { url: null, status: 'error' };
    }

    const { id: talkId } = await createResponse.json();
    console.log('D-ID talk created:', talkId);

    // Poll for completion
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      
      const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: { 'Authorization': `Basic ${didApiKey}` }
      });
      
      const statusData = await statusResponse.json();
      console.log(`D-ID status: ${statusData.status}`);

      if (statusData.status === 'done') {
        // Download and upload to Supabase
        const videoResponse = await fetch(statusData.result_url);
        const videoBuffer = await videoResponse.arrayBuffer();
        const videoPath = `${basePath}/${moduleSlug}-video.mp4`;
        
        const uploadedUrl = await uploadToStorage('materials', videoPath, new Uint8Array(videoBuffer), 'video/mp4');
        return { url: uploadedUrl, status: 'complete' };
      } else if (statusData.status === 'error') {
        return { url: null, status: 'error' };
      }
    }
    return { url: null, status: 'timeout' };
  } catch (error) {
    console.error('D-ID error:', error);
    return { url: null, status: 'error' };
  }
}

// Main generation runner
async function runCertificateGeneration(courseId: string, institutionId: string, progressId: string) {
  const basePath = 'christ-the-cornerstone-certificate';
  
  try {
    // Clear existing modules to regenerate fresh
    await supabase.from('course_modules').delete().eq('course_id', courseId);
    
    for (let i = 0; i < COURSE_CURRICULUM.length; i++) {
      const week = COURSE_CURRICULUM[i];
      const moduleSlug = `week-${week.week}-${week.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}`;
      
      console.log(`\n📚 Generating Week ${week.week}: ${week.title}`);
      
      await supabase.from('generation_progress').update({
        current_stage: `Week ${week.week}/8: ${week.title}`,
        progress: Math.floor((i / 8) * 100),
        modules_created: i
      }).eq('id', progressId);

      // 1. Generate comprehensive module content
      console.log('  → Generating module content...');
      const moduleContent = await generateModuleContent(week);
      
      const { data: module, error: moduleError } = await supabase.from('course_modules').insert({
        institution_id: institutionId,
        course_id: courseId,
        title: `Week ${week.week}: ${week.title}`,
        content_md: moduleContent,
        order_index: week.week,
        duration_minutes: 90,
        rewards_amount: 125
      }).select().single();

      if (moduleError) {
        console.error('Module creation error:', moduleError);
        continue;
      }
      
      console.log(`  ✅ Module created: ${module.id}`);

      // 2. Generate Study Guide PDF
      console.log('  → Generating study guide...');
      const studyGuide = await generateStudyGuide(week);
      const studyGuideUrl = await uploadToStorage('materials', `${basePath}/week-${week.week}/${moduleSlug}-study-guide.html`, studyGuide, 'text/html');
      if (studyGuideUrl) {
        await supabase.from('learning_materials').insert({
          module_id: module.id,
          institution_id: institutionId,
          title: `Week ${week.week} Study Guide - ${week.title}`,
          kind: 'pdf',
          url: studyGuideUrl,
          meta: { type: 'study_guide', week: week.week, theme: week.theme }
        });
      }

      // 3. Generate Lecture Notes
      console.log('  → Generating lecture notes...');
      const lectureNotes = await generateLectureNotes(week);
      const notesUrl = await uploadToStorage('materials', `${basePath}/week-${week.week}/${moduleSlug}-lecture-notes.html`, lectureNotes, 'text/html');
      if (notesUrl) {
        await supabase.from('learning_materials').insert({
          module_id: module.id,
          institution_id: institutionId,
          title: `Week ${week.week} Lecture Notes`,
          kind: 'notes',
          url: notesUrl,
          meta: { type: 'lecture_notes', week: week.week }
        });
      }

      // 4. Generate Scripture Study
      console.log('  → Generating scripture study...');
      const scriptureStudy = await generateScriptureStudy(week);
      const scriptureUrl = await uploadToStorage('materials', `${basePath}/week-${week.week}/${moduleSlug}-scripture-study.html`, scriptureStudy, 'text/html');
      if (scriptureUrl) {
        await supabase.from('learning_materials').insert({
          module_id: module.id,
          institution_id: institutionId,
          title: `Week ${week.week} Scripture Study - ${week.keyScripture}`,
          kind: 'pdf',
          url: scriptureUrl,
          meta: { type: 'scripture_study', week: week.week, keyScripture: week.keyScripture }
        });
      }

      // 5. Generate Discussion Guide
      console.log('  → Generating discussion guide...');
      const discussionGuide = await generateDiscussionGuide(week);
      const discussionUrl = await uploadToStorage('materials', `${basePath}/week-${week.week}/${moduleSlug}-discussion-guide.html`, discussionGuide, 'text/html');
      if (discussionUrl) {
        await supabase.from('learning_materials').insert({
          module_id: module.id,
          institution_id: institutionId,
          title: `Week ${week.week} Discussion Guide`,
          kind: 'pdf',
          url: discussionUrl,
          meta: { type: 'discussion_guide', week: week.week }
        });
      }

      // 6. Generate Video Script and Audio
      console.log('  → Generating video script...');
      const videoScript = await generateVideoScript(week);
      const scriptUrl = await uploadToStorage('materials', `${basePath}/week-${week.week}/${moduleSlug}-video-script.txt`, videoScript, 'text/plain');
      if (scriptUrl) {
        await supabase.from('learning_materials').insert({
          module_id: module.id,
          institution_id: institutionId,
          title: `Week ${week.week} Video Script`,
          kind: 'notes',
          url: scriptUrl,
          meta: { type: 'video_script', week: week.week }
        });
      }

      // 7. Generate Audio Lecture (if ElevenLabs configured)
      if (elevenLabsKey) {
        console.log('  → Generating audio lecture...');
        const audioSummary = `Welcome to Week ${week.week} of Christ the Cornerstone. ${week.theme}. Today we explore ${week.focus}. Our key scripture is ${week.keyScripture}. ${videoScript}`;
        const audioData = await generateAudio(audioSummary);
        if (audioData) {
          const audioUrl = await uploadToStorage('materials', `${basePath}/week-${week.week}/${moduleSlug}-audio.mp3`, audioData, 'audio/mpeg');
          if (audioUrl) {
            await supabase.from('learning_materials').insert({
              module_id: module.id,
              institution_id: institutionId,
              title: `Week ${week.week} Audio Lecture`,
              kind: 'audio',
              url: audioUrl,
              meta: { type: 'audio_lecture', week: week.week, duration: '5-10 min' }
            });
          }
        }
      }

      // 8. Generate Video (if D-ID configured)
      if (didApiKey) {
        console.log('  → Generating video lecture...');
        const videoResult = await generateVideo(videoScript, moduleSlug, `${basePath}/week-${week.week}`);
        if (videoResult.url) {
          await supabase.from('learning_materials').insert({
            module_id: module.id,
            institution_id: institutionId,
            title: `Week ${week.week} Video Lecture`,
            kind: 'video',
            url: videoResult.url,
            meta: { type: 'video_lecture', week: week.week, status: videoResult.status }
          });
        }
      }

      // 9. Generate Quiz
      console.log('  → Generating quiz...');
      await generateQuiz(module.id, week, institutionId);

      console.log(`  ✅ Week ${week.week} complete with all materials`);
      
      // Rate limiting pause
      await new Promise(r => setTimeout(r, 3000));
    }

    await supabase.from('generation_progress').update({
      current_stage: 'Complete! 8 weeks of comprehensive content generated',
      progress: 100,
      modules_created: 8
    }).eq('id', progressId);

    console.log('\n🎉 Certificate course generation complete!');
  } catch (error) {
    console.error('Generation failed:', error);
    await supabase.from('generation_progress').update({
      current_stage: `Error: ${error.message}`,
      progress: -1
    }).eq('id', progressId);
  }
}

// Generate quiz for module
async function generateQuiz(moduleId: string, week: typeof COURSE_CURRICULUM[0], institutionId: string) {
  const systemPrompt = `You are creating a rigorous theology quiz. Return ONLY valid JSON.`;
  
  const prompt = `Create 10 quiz questions for:
Week ${week.week}: ${week.title}
Theme: ${week.theme}
Scripture: ${week.keyScripture}

Return JSON array:
[
  {
    "question": "Question text?",
    "type": "multiple_choice",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correct": "A) Option 1",
    "explanation": "Why this is correct",
    "points": 10
  }
]

Include:
- 4 knowledge questions (remember/understand)
- 3 application questions (apply/analyze)
- 2 synthesis questions (evaluate)
- 1 scripture identification question`;

  try {
    const response = await generateContent(prompt, systemPrompt, 4000);
    let content = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(content);

    const { data: quiz } = await supabase.from('quizzes').insert({
      institution_id: institutionId,
      module_id: moduleId,
      title: `Week ${week.week} Assessment: ${week.title}`,
      passing_score: 70,
      time_limit_minutes: 30
    }).select().single();

    if (quiz) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await supabase.from('quiz_questions').insert({
          quiz_id: quiz.id,
          question_text: q.question,
          question_type: 'multiple_choice',
          options: q.options,
          correct_answer: q.correct,
          explanation: q.explanation,
          points: q.points || 10,
          order_index: i + 1
        });
      }
      console.log(`    ✅ Quiz created with ${questions.length} questions`);
    }
  } catch (error) {
    console.error('Quiz generation error:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const courseId = '2f27390e-d6cd-4f85-b228-1e999ace865c'; // Christ the Cornerstone
    
    // Get institution
    const { data: course } = await supabase.from('courses').select('institution_id').eq('id', courseId).single();
    if (!course) throw new Error('Course not found');
    
    const institutionId = course.institution_id;

    // Create progress tracker
    const { data: progress } = await supabase.from('generation_progress').insert({
      institution_id: institutionId,
      progress: 0,
      current_stage: 'Starting Christ the Cornerstone ScrollCertificate generation',
      modules_created: 0
    }).select().single();

    // Run in background
    EdgeRuntime.waitUntil(runCertificateGeneration(courseId, institutionId, progress.id));

    return new Response(JSON.stringify({
      success: true,
      message: 'Christ the Cornerstone ScrollCertificate generation started',
      courseId,
      progressId: progress.id,
      estimatedTime: '30-60 minutes for complete 8-week curriculum',
      materialsPerWeek: [
        'Comprehensive module content (2500+ words)',
        'Study Guide PDF',
        'Lecture Notes',
        'Scripture Study Guide',
        'Discussion Guide',
        'Video Script',
        'Audio Lecture (if ElevenLabs configured)',
        'Video Lecture (if D-ID configured)',
        '10-question quiz with explanations'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
