import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Christ the Cornerstone 8-Week Curriculum
const CURRICULUM = [
  {
    week: 1,
    title: "The Eternal Word: Christ Before Creation",
    focus: "John 1:1-14, Colossians 1:15-17",
    topics: ["Pre-existence of Christ", "The Logos doctrine", "Christ as Creator", "Divine nature"]
  },
  {
    week: 2,
    title: "The Incarnation: God Made Flesh",
    focus: "Philippians 2:5-11, John 1:14",
    topics: ["The mystery of incarnation", "Virgin birth", "Fully God and fully man", "Kenosis"]
  },
  {
    week: 3,
    title: "The Life and Ministry of Jesus",
    focus: "The Gospels Overview",
    topics: ["Jesus' teachings", "Miracles and signs", "The Kingdom of God", "Discipleship model"]
  },
  {
    week: 4,
    title: "The Atonement: Christ Our Sacrifice",
    focus: "Romans 3:21-26, Hebrews 9-10",
    topics: ["Substitutionary atonement", "Propitiation", "Redemption", "The blood of Christ"]
  },
  {
    week: 5,
    title: "The Resurrection: Victory Over Death",
    focus: "1 Corinthians 15, Romans 6",
    topics: ["Historical evidence", "Theological significance", "New creation", "Our resurrection hope"]
  },
  {
    week: 6,
    title: "The Ascension and Session of Christ",
    focus: "Hebrews 1-2, Ephesians 1:20-23",
    topics: ["Christ at the right hand", "High priestly ministry", "Present intercession", "Reign over all"]
  },
  {
    week: 7,
    title: "Christ the Cornerstone of the Church",
    focus: "Ephesians 2:19-22, 1 Peter 2:4-8",
    topics: ["Foundation of faith", "The living stones", "Unity in Christ", "Building the temple"]
  },
  {
    week: 8,
    title: "The Return of Christ: Eschatological Hope",
    focus: "1 Thessalonians 4:13-18, Revelation 19-22",
    topics: ["Second coming promises", "Judgment and reward", "New heaven and earth", "Living in hope"]
  }
];

async function generateWithAI(prompt: string, systemPrompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  console.log('Generating content with Lovable AI Gateway...');
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 8000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function generateQuizData(weekData: typeof CURRICULUM[0]): any {
  // Generate comprehensive quiz for the module
  const questions = [
    {
      question: `What is the primary focus of Week ${weekData.week}: ${weekData.title}?`,
      options: [
        weekData.focus,
        "The parables of Jesus",
        "Old Testament prophecy",
        "Church history"
      ],
      correct: 0,
      explanation: `This week focuses on ${weekData.focus}, exploring ${weekData.topics.join(', ')}.`
    },
    {
      question: `Which of the following is a key topic covered in this module?`,
      options: weekData.topics.concat(["None of the above"]).slice(0, 4),
      correct: 0,
      explanation: `${weekData.topics[0]} is one of the core themes explored this week.`
    },
    {
      question: `The theological concept of ${weekData.topics[0]} primarily relates to:`,
      options: [
        "The nature and work of Christ",
        "Old Testament law",
        "Church governance",
        "End times events only"
      ],
      correct: 0,
      explanation: `${weekData.topics[0]} is fundamental to understanding Christ's person and work.`
    },
    {
      question: `According to the Scripture focus (${weekData.focus}), what key truth is revealed?`,
      options: [
        "The supremacy and sufficiency of Christ",
        "Human effort in salvation",
        "The role of angels only",
        "Political leadership"
      ],
      correct: 0,
      explanation: `${weekData.focus} reveals profound truths about Christ's identity and mission.`
    },
    {
      question: `How does this week's study of ${weekData.title} connect to the broader course theme?`,
      options: [
        "It demonstrates Christ as the foundation of all Christian truth",
        "It is unrelated to other modules",
        "It focuses only on historical events",
        "It ignores doctrinal matters"
      ],
      correct: 0,
      explanation: "Each week builds on Christ as the Cornerstone, the foundation of faith."
    },
    {
      question: `What practical application emerges from understanding ${weekData.topics[1] || weekData.topics[0]}?`,
      options: [
        "Deeper worship and transformed living",
        "No practical relevance",
        "Academic knowledge only",
        "Historical curiosity"
      ],
      correct: 0,
      explanation: "True theology always leads to doxology (worship) and transformed life."
    },
    {
      question: `Which aspect of Christ's work is emphasized in the study of ${weekData.topics[2] || weekData.topics[0]}?`,
      options: [
        "His redemptive mission and divine nature",
        "His political agenda",
        "His economic teachings only",
        "His social reforms exclusively"
      ],
      correct: 0,
      explanation: "Christ's work is always centered on redemption and revealing God's nature."
    },
    {
      question: `The module on "${weekData.title}" helps believers understand:`,
      options: [
        "The depth of God's love and Christ's sufficiency",
        "Self-improvement techniques",
        "Secular philosophy",
        "Religious rituals alone"
      ],
      correct: 0,
      explanation: "Every Christological study deepens our understanding of God's love."
    },
    {
      question: `What is the significance of ${weekData.focus} for contemporary believers?`,
      options: [
        "It provides timeless truth applicable today",
        "It has no modern relevance",
        "It was only for first-century Christians",
        "It concerns only academics"
      ],
      correct: 0,
      explanation: "Scripture is living and active, speaking to every generation."
    },
    {
      question: `How should studying ${weekData.title} affect our daily walk with Christ?`,
      options: [
        "Increased faith, worship, and Christlike character",
        "No change expected",
        "Intellectual pride",
        "Isolation from community"
      ],
      correct: 0,
      explanation: "True knowledge of Christ always transforms how we live."
    }
  ];

  return { questions, passingScore: 70, timeLimit: 30 };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { courseId, institutionId } = await req.json();
    
    if (!courseId || !institutionId) {
      throw new Error('courseId and institutionId are required');
    }

    console.log(`Starting full course generation for course: ${courseId}`);

    // Create progress tracker
    const { data: progress } = await supabase
      .from('generation_progress')
      .insert({
        institution_id: institutionId,
        current_stage: 'Initializing...',
        progress: 0
      })
      .select()
      .single();

    const progressId = progress?.id;

    const updateProgress = async (stage: string, pct: number) => {
      if (progressId) {
        await supabase.from('generation_progress').update({
          current_stage: stage,
          progress: pct,
          updated_at: new Date().toISOString()
        }).eq('id', progressId);
      }
      console.log(`Progress: ${pct}% - ${stage}`);
    };

    // System prompt for content generation
    const systemPrompt = `You are an expert Christian theologian and educator at Scroll University, a Christ-centered institution of higher learning. 
You write with academic rigor while remaining accessible and spiritually nourishing. 
Your content should be:
- Biblically grounded with extensive Scripture references
- Theologically sound in the Reformed evangelical tradition
- Academically excellent (2500-3500 words per module)
- Practically applicable with reflection questions
- Worshipful in tone, pointing to Christ's glory

Structure each module with:
1. Opening Prayer
2. Learning Objectives (5 objectives)
3. Key Scripture Meditation
4. Introduction (why this matters)
5. 4-5 main sections with subsections
6. Practical Application
7. Reflection Questions (5 questions)
8. Closing Prayer
9. Further Study Resources`;

    // Generate all 8 weeks
    for (let i = 0; i < CURRICULUM.length; i++) {
      const week = CURRICULUM[i];
      await updateProgress(`Generating Week ${week.week}: ${week.title}`, Math.round((i / CURRICULUM.length) * 80));

      // Check if module already exists
      const { data: existingModule } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId)
        .eq('order_index', week.week)
        .maybeSingle();

      let moduleId = existingModule?.id;

      // Generate rich content
      const contentPrompt = `Write a comprehensive 3000-word module for Week ${week.week} of the "Christ the Cornerstone" ScrollCertificate course.

Title: ${week.title}
Scripture Focus: ${week.focus}
Key Topics to Cover: ${week.topics.join(', ')}

This is an 8-week intensive certificate program exploring Jesus Christ as the ultimate Cornerstone of creation, truth, salvation, and eternal hope.

Write the full module content in Markdown format with proper headers, Scripture quotations, and theological depth befitting a university-level course.`;

      const contentMd = await generateWithAI(contentPrompt, systemPrompt);
      const quizData = generateQuizData(week);

      if (moduleId) {
        // Update existing module
        await supabase.from('course_modules').update({
          title: `Week ${week.week}: ${week.title}`,
          content_md: contentMd,
          quiz_data: quizData,
          duration_minutes: 90,
          rewards_amount: 50
        }).eq('id', moduleId);
      } else {
        // Create new module
        const { data: newModule } = await supabase
          .from('course_modules')
          .insert({
            course_id: courseId,
            institution_id: institutionId,
            title: `Week ${week.week}: ${week.title}`,
            order_index: week.week,
            content_md: contentMd,
            quiz_data: quizData,
            duration_minutes: 90,
            rewards_amount: 50
          })
          .select()
          .single();
        
        moduleId = newModule?.id;
      }

      if (moduleId) {
        // Create learning materials for this module
        await updateProgress(`Creating materials for Week ${week.week}...`, Math.round((i / CURRICULUM.length) * 80) + 5);

        // Check existing materials
        const { data: existingMaterials } = await supabase
          .from('learning_materials')
          .select('kind')
          .eq('module_id', moduleId);

        const existingKinds = new Set(existingMaterials?.map(m => m.kind) || []);

        const materials = [
          { kind: 'study_guide', title: `Week ${week.week} Study Guide`, url: `#module-${moduleId}-study` },
          { kind: 'lecture_notes', title: `Week ${week.week} Lecture Notes`, url: `#module-${moduleId}-notes` },
          { kind: 'scripture_study', title: `Week ${week.week} Scripture Study (${week.focus})`, url: `#module-${moduleId}-scripture` },
          { kind: 'discussion_guide', title: `Week ${week.week} Discussion Guide`, url: `#module-${moduleId}-discussion` },
          { kind: 'video_lecture', title: `Week ${week.week} Video Lecture`, url: `#module-${moduleId}-video` },
          { kind: 'audio_lecture', title: `Week ${week.week} Audio Lecture`, url: `#module-${moduleId}-audio` },
        ];

        for (const mat of materials) {
          if (!existingKinds.has(mat.kind)) {
            await supabase.from('learning_materials').insert({
              module_id: moduleId,
              institution_id: institutionId,
              kind: mat.kind,
              title: mat.title,
              url: mat.url,
              meta: { 
                focus: week.focus, 
                topics: week.topics,
                generated: true,
                weekNumber: week.week
              }
            });
          }
        }
      }

      // Small delay between weeks to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }

    await updateProgress('Complete', 100);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'All 8 weeks generated successfully',
      progressId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating course:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
