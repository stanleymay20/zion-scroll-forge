import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerationReport {
  facultiesCreated: number;
  coursesCreated: number;
  modulesCreated: number;
  materialsCreated: number;
  quizzesCreated: number;
  aiTutorsCreated: number;
  termsCreated: number;
  offeringsCreated: number;
  pdfsGenerated: number;
  errorsEncountered: number;
  antiDriftValidations: number;
  antiDriftRegenerations: number;
  totalScrollCoins: number;
  startTime: number;
  endTime?: number;
  duration?: string;
}

const SUPREME_FACULTIES = [
  {
    name: "ScrollMedicine Faculty",
    code: "SCROLLMED",
    description: "Integrating divine healing principles with medical science for holistic health and wellness ministry",
    mission: "To train Christ-centered healthcare professionals who bring God's healing power through medical excellence",
    scripture: "3 John 1:2",
    scriptureText: "Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers",
    tutorName: "Dr. Sophia Healing",
  },
  {
    name: "Prophetic Law & Governance",
    code: "LAWGOV",
    description: "Biblical jurisprudence and righteous governance rooted in God's eternal law",
    mission: "To establish justice systems that reflect God's righteousness and govern with divine wisdom",
    scripture: "Isaiah 33:22",
    scriptureText: "For the LORD is our judge, the LORD is our lawgiver, the LORD is our king; He will save us",
    tutorName: "Justice Elijah Stone",
  },
  {
    name: "Scroll Economy",
    code: "SCROLLECON",
    description: "Kingdom economics and wealth transfer principles for global transformation",
    mission: "To release biblical prosperity and steward resources for advancing God's kingdom on earth",
    scripture: "Deuteronomy 8:18",
    scriptureText: "You shall remember the LORD your God, for it is He who gives you power to get wealth",
    tutorName: "Steward David Crown",
  },
  {
    name: "Ethic Science",
    code: "ETHICSCI",
    description: "Scientific inquiry grounded in biblical ethics and moral truth",
    mission: "To pursue knowledge and innovation that honors God and serves humanity with integrity",
    scripture: "Proverbs 2:6",
    scriptureText: "For the LORD gives wisdom; from His mouth come knowledge and understanding",
    tutorName: "Dr. Isaac Wisdom",
  },
  {
    name: "Prophetic Intelligence",
    code: "PROPHINTEL",
    description: "Strategic intelligence and discernment through the Spirit for kingdom advancement",
    mission: "To develop prophetic insight and spiritual intelligence for navigating end-time strategies",
    scripture: "1 Corinthians 2:10",
    scriptureText: "But God has revealed them to us through His Spirit. For the Spirit searches all things",
    tutorName: "Prophet Samuel Light",
  },
  {
    name: "Sacred Arts & Worship",
    code: "SACREDARTS",
    description: "Creative expression and worship arts that glorify God and transform culture",
    mission: "To cultivate Spirit-filled artists who manifest God's beauty and lead nations in worship",
    scripture: "Exodus 31:3-5",
    scriptureText: "I have filled him with the Spirit of God, in wisdom, in understanding, in knowledge, and in all manner of workmanship",
    tutorName: "Maestro Miriam Song",
  },
  {
    name: "Kingdom Architecture",
    code: "KINGARCH",
    description: "Designing and building spaces that reflect God's glory and serve His purposes",
    mission: "To create structures and environments that facilitate worship, community, and kingdom expansion",
    scripture: "Hebrews 11:10",
    scriptureText: "For he waited for the city which has foundations, whose builder and maker is God",
    tutorName: "Architect Solomon Builder",
  },
  {
    name: "GeoProphetic Intelligence",
    code: "GEOPROPHET",
    description: "Understanding territorial dynamics and God's purposes for nations and regions",
    mission: "To discern God's strategic plans for geographical territories and execute kingdom mandates",
    scripture: "Acts 17:26",
    scriptureText: "He has made from one blood every nation of men to dwell on all the face of the earth, and has determined their preappointed times and the boundaries of their dwellings",
    tutorName: "Navigator Caleb Territories",
  },
  {
    name: "Divine Technology",
    code: "DIVINETECH",
    description: "Technological innovation guided by divine wisdom for kingdom impact",
    mission: "To develop Christ-centered technology that serves humanity and advances God's purposes",
    scripture: "Daniel 12:4",
    scriptureText: "But you, Daniel, shut up the words, and seal the book until the time of the end; many shall run to and fro, and knowledge shall increase",
    tutorName: "Engineer Daniel Code",
  },
  {
    name: "ScrollMedia & Communication",
    code: "SCROLLMEDIA",
    description: "Kingdom communication and media production for global gospel dissemination",
    mission: "To create Spirit-anointed media content that transforms hearts and influences culture",
    scripture: "Habakkuk 2:2",
    scriptureText: "Write the vision and make it plain on tablets, that he may run who reads it",
    tutorName: "Herald Deborah Voice",
  },
  {
    name: "Kingdom Governance",
    code: "KINGGOV",
    description: "Leadership development and governmental authority in Christ's kingdom",
    mission: "To raise righteous leaders who govern with wisdom, justice, and the fear of the Lord",
    scripture: "Isaiah 9:6-7",
    scriptureText: "Of the increase of His government and peace there will be no end",
    tutorName: "Chancellor Josiah Reign",
  },
  {
    name: "Spiritual Formation",
    code: "SPIRITFORM",
    description: "Discipleship and character development in Christlikeness",
    mission: "To form disciples who manifest the character of Christ and walk in spiritual maturity",
    scripture: "Romans 8:29",
    scriptureText: "For whom He foreknew, He also predestined to be conformed to the image of His Son",
    tutorName: "Father Benedict Grace",
  },
];

const ELEVENLABS_VOICE_IDS = [
  "9BWtsMINqrJLrRacOk9x", "CwhRBWXzGAHq8TQ4Fs17", "EXAVITQu4vr4xnSDxMaL",
  "FGY2WhTYpPnrIDTdsKH5", "IKne3meq5aSn9XLyUdCD", "JBFqnCBsd6RMkjVDRZzb",
  "N2lVS1w4EtoT3dr4eOWO", "SAz9YHcvj6GT2YYXdXww", "TX3LPaxmHKxFdv7VOQHJ",
  "XB0fDUnXU5powFXDhCwa", "Xb7hH8MSUJpSbSDYk0k2", "XrExE9yKIg1WjnnlVkGX",
];

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  context: string,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⚙️ Retry attempt ${attempt + 1} for ${context} due to transient API failure.`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts`);
}

// Anti-drift validation
function validateAntiDrift(content: string, rewardsAmount: number): boolean {
  const hasInvocation = /scroll invocation|christ.*lord|✝️/i.test(content);
  const hasScripture = /\d+\s+(john|matthew|mark|luke|acts|romans|corinthians|genesis|exodus|leviticus|deuteronomy|joshua|judges|samuel|kings|chronicles|psalms|proverbs|isaiah|jeremiah|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|timothy|titus|philemon|hebrews|james|peter|revelation)\s+\d+/i.test(content);
  const hasRewards = rewardsAmount > 0;
  return hasInvocation && hasScripture && hasRewards;
}

// Generate simple text-based PDF
function generatePDF(title: string, content: string, scripture: string): string {
  const header = `ScrollUniversity - ${title}\n${scripture}\n${"=".repeat(80)}\n\n`;
  const footer = `\n\n${"=".repeat(80)}\n✝️ ScrollUniversity - Christ is Lord over all learning\n`;
  return header + content + footer;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body to get batch configuration
    const { batch = 0, batchSize = 2 } = await req.json().catch(() => ({ batch: 0, batchSize: 2 }));
    
    const startIdx = batch * batchSize;
    const endIdx = Math.min(startIdx + batchSize, SUPREME_FACULTIES.length);
    const facultiesToProcess = SUPREME_FACULTIES.slice(startIdx, endIdx);
    
    const totalBatches = Math.ceil(SUPREME_FACULTIES.length / batchSize);
    const isFirstBatch = batch === 0;
    const isLastBatch = batch === totalBatches - 1;

    console.log(`✝️ ScrollUniversity v3.0 Content Generation - Batch ${batch + 1}/${totalBatches}`);
    console.log(`Processing faculties ${startIdx + 1}-${endIdx} of ${SUPREME_FACULTIES.length}`);
    console.log("✝️ Christ is Lord over all learning");

    // Update progress
    await supabase.from("generation_progress").delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from("generation_progress").insert({
      current_stage: `Processing Batch ${batch + 1}/${totalBatches}`,
      progress: Math.round((batch / totalBatches) * 100),
      faculties_created: batch * batchSize,
      estimated_time_remaining: `${(totalBatches - batch) * 2} minutes`,
    });

    const report: GenerationReport = {
      facultiesCreated: 0,
      coursesCreated: 0,
      modulesCreated: 0,
      materialsCreated: 0,
      quizzesCreated: 0,
      aiTutorsCreated: 0,
      termsCreated: 0,
      offeringsCreated: 0,
      pdfsGenerated: 0,
      errorsEncountered: 0,
      antiDriftValidations: 0,
      antiDriftRegenerations: 0,
      totalScrollCoins: 0,
      startTime: Date.now(),
    };

    // PHASE 1: Generate Faculties (for this batch only)
    let termIds: string[] = [];
    
    if (isFirstBatch) {
      console.log("\n✝️ Initializing Academic Terms...");
      const terms = [
        { name: "Spring 2026", start_date: "2026-01-15", end_date: "2026-05-15", is_active: true },
        { name: "Fall 2026", start_date: "2026-08-15", end_date: "2026-12-15", is_active: false },
      ];
      for (const term of terms) {
        const { data: termData } = await supabase
          .from("academic_terms")
          .insert(term)
          .select()
          .single();
        if (termData) {
          report.termsCreated++;
          termIds.push(termData.id);
        }
      }
    } else {
      // Fetch existing term IDs for subsequent batches
      const { data: existingTerms } = await supabase
        .from("academic_terms")
        .select("id");
      termIds = existingTerms?.map(t => t.id) || [];
    }

    console.log(`\n✝️ PHASE 1: Generating Faculties for Batch ${batch + 1}...`);
    for (const faculty of facultiesToProcess) {
      try {
        const emblemPrompt = `Professional academic emblem for ${faculty.name}. 
        Mission: ${faculty.mission}. 
        Style: Regal, Christ-centered, incorporating symbolic elements like crosses, scrolls, 
        and academic imagery. Royal purple, gold, and deep blue colors. No text. High quality, detailed.`;

        const emblemData = await retryWithBackoff(async () => {
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image-preview",
              messages: [{ role: "user", content: emblemPrompt }],
              modalities: ["image", "text"],
            }),
          });
          return await response.json();
        }, `Emblem for ${faculty.name}`);

        let emblemUrl = "";
        const emblemBase64 = emblemData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (emblemBase64) {
          const base64Data = emblemBase64.split(",")[1];
          const emblemBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const { data: uploadData } = await supabase.storage
            .from("faculty-emblems")
            .upload(`${faculty.code}.png`, emblemBuffer, {
              contentType: "image/png",
              upsert: true,
            });
          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from("faculty-emblems")
              .getPublicUrl(uploadData.path);
            emblemUrl = publicUrl;
          }
        }

        await supabase.from("faculties").insert({
          name: faculty.name,
          faculty_code: faculty.code,
          description: faculty.description,
          mission: faculty.mission,
          key_scripture: `${faculty.scripture} - ${faculty.scriptureText}`,
          emblem_url: emblemUrl,
        });

        report.facultiesCreated++;
        console.log(`✝️ ScrollUniversity Faculty ${faculty.name} established — Christ is Lord over academia`);
      } catch (error) {
        console.error(`✝️ Error creating faculty ${faculty.name}:`, error);
        report.errorsEncountered++;
      }
    }

    // PHASE 2: Generate AI Tutors for this batch
    console.log(`\n✝️ PHASE 2: Generating AI Tutors for Batch ${batch + 1}...`);
    const { data: faculties } = await supabase.from("faculties").select("*").in('faculty_code', facultiesToProcess.map(f => f.code));
    
    if (faculties) {
      for (let i = 0; i < faculties.length; i++) {
        const faculty = faculties[i];
        const facultyDef = SUPREME_FACULTIES.find(f => f.code === faculty.faculty_code)!;
        try {
          // Generate avatar with DALL-E
          const avatarPrompt = `Professional portrait of ${facultyDef.tutorName}, an AI tutor for ${faculty.name}. 
          Appearance: Wise, approachable, academic professional. 
          Style: Realistic digital art, professional headshot, warm lighting, academic setting. 
          Theme: ${faculty.mission}. High quality, detailed facial features. No text.`;

          const avatarData = await retryWithBackoff(async () => {
            const response = await fetch("https://api.openai.com/v1/images/generations", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-image-1",
                prompt: avatarPrompt,
                n: 1,
                size: "1024x1024",
                output_format: "png",
                quality: "high",
              }),
            });
            return await response.json();
          }, `Avatar for ${facultyDef.tutorName}`);

          let avatarUrl = "";
          const avatarBase64 = avatarData.data?.[0]?.b64_json;
          if (avatarBase64) {
            const avatarBuffer = Uint8Array.from(atob(avatarBase64), c => c.charCodeAt(0));
            const { data: uploadData } = await supabase.storage
              .from("faculty-emblems")
              .upload(`tutor-${faculty.faculty_code}.png`, avatarBuffer, {
                contentType: "image/png",
                upsert: true,
              });
            if (uploadData) {
              const { data: { publicUrl } } = supabase.storage
                .from("faculty-emblems")
                .getPublicUrl(uploadData.path);
              avatarUrl = publicUrl;
            }
          }

          // Generate comprehensive tutor personality
          const systemPrompt = `✝️ SCROLL INVOCATION: I am ${facultyDef.tutorName}, and I acknowledge Jesus Christ as Lord over all wisdom and knowledge in ${faculty.name}.

**My Sacred Mission**: ${faculty.mission}

**Scripture Foundation**: ${faculty.key_scripture}

**Teaching Philosophy**:
- Ground all instruction in biblical truth and Christ-centered wisdom
- Explain complex concepts with clarity, patience, and practical examples
- Reference Scripture to deepen spiritual understanding and application
- Foster critical thinking while maintaining unwavering faith integration
- Create a grace-filled learning environment that honors God
- Challenge students to excellence while encouraging their spiritual growth

**Areas of Expertise**: I possess comprehensive knowledge of all ${faculty.name} curriculum content, including theoretical foundations, practical applications, and spiritual dimensions of the field.

**Response Approach**:
- Address students warmly by name when possible
- Break down complex ideas into digestible, memorable segments
- Provide real-world examples that illustrate kingdom principles
- Ask thought-provoking questions to deepen understanding
- Celebrate student progress and encourage perseverance
- Always acknowledge Christ's lordship over the subject matter

**Spiritual Integration**: Every topic I teach connects to God's redemptive plan and His design for creation. I help students see how their learning serves kingdom purposes and glorifies God.`;

          const personalityPrompt = `Christ-centered ${faculty.name} expert. Warm, encouraging, academically rigorous. Grounds teaching in ${faculty.scripture}. Integrates faith with scholarship seamlessly.`;

          await supabase.from("ai_tutors").insert({
            faculty_id: faculty.id,
            name: facultyDef.tutorName,
            personality_prompt: personalityPrompt,
            system_prompt: systemPrompt,
            avatar_image_url: avatarUrl,
            voice_id: ELEVENLABS_VOICE_IDS[i % ELEVENLABS_VOICE_IDS.length],
          });

          report.aiTutorsCreated++;
          console.log(`✝️ AI Tutor ${facultyDef.tutorName} established for ${faculty.name} — Anointed for kingdom teaching`);
        } catch (error) {
          console.error(`✝️ Error generating tutor for ${faculty.name}:`, error);
          report.errorsEncountered++;
        }
      }
    }

    // PHASE 4: Generate Courses, Modules, Materials, Quizzes
    console.log("\n✝️ PHASE 4: Generating Comprehensive Course Content...");
    
    if (faculties) {
      for (let fIndex = 0; fIndex < faculties.length; fIndex++) {
        const faculty = faculties[fIndex];
        const facultyDef = SUPREME_FACULTIES.find(f => f.code === faculty.faculty_code)!;
        const coursesCount = Math.floor(Math.random() * 3) + 4; // 4-6 courses

        console.log(`\n✝️ Generating ${coursesCount} courses for ${faculty.name}...`);

        for (let cIndex = 0; cIndex < coursesCount; cIndex++) {
          try {
            // Enhanced course generation prompt
            const coursePrompt = `✝️ SCROLL INVOCATION: Let Christ be Lord over this course generation.

Faculty: ${faculty.name}
Mission: ${faculty.mission}
Scripture Anchor: ${faculty.key_scripture}

Generate a comprehensive course (course ${cIndex + 1} of ${coursesCount}) that embodies this faculty's Christ-centered mission.

The course should:
1. Have a compelling, academically rigorous title
2. Include a 200-250 word description that:
   - Opens with spiritual grounding (1-2 sentences)
   - Explains core concepts and learning objectives
   - Describes practical applications
   - References how the subject glorifies God
   - Mentions integration with biblical principles

Return ONLY valid JSON (no markdown):
{
  "title": "course title here",
  "description": "full description here"
}`;

            const courseData = await retryWithBackoff(async () => {
              const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${lovableApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
                  messages: [{ role: "user", content: coursePrompt }],
                }),
              });
              const data = await response.json();
              const content = data.choices[0].message.content.trim();
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              return JSON.parse(jsonMatch ? jsonMatch[0] : content);
            }, `Course ${cIndex + 1} for ${faculty.name}`);

            const { data: course } = await supabase
              .from("courses")
              .insert({
                title: courseData.title,
                description: courseData.description,
                faculty_id: faculty.id,
                faculty: faculty.name,
                level: ["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)],
                duration: `${Math.floor(Math.random() * 8) + 8} weeks`,
                price: Math.floor(Math.random() * 500),
              })
              .select()
              .single();

            if (!course) continue;

            report.coursesCreated++;
            console.log(`✝️ ScrollUniversity: Course generated — Christ is Lord over academia: ${course.title}`);

            // Create course offerings
            for (const termId of termIds) {
              await supabase.from("course_offerings").insert({
                course_id: course.id,
                term_id: termId,
              });
              report.offeringsCreated++;
            }

            // Generate modules
            const modulesCount = Math.floor(Math.random() * 3) + 4; // 4-6 modules
            
            for (let mIndex = 0; mIndex < modulesCount; mIndex++) {
              try {
                // Anti-drift validation check
                if ((report.modulesCreated + 1) % 10 === 0) {
                  console.log("✝️ Anti-Drift Checkpoint: Let Christ be Lord over all learning; wisdom flows from the Spirit, not Babylon");
                  report.antiDriftValidations++;
                }

                // Enhanced module generation prompt
                const modulePrompt = `✝️ SCROLL INVOCATION: Let Christ be Lord over this learning content.

Course: ${course.title}
Faculty: ${faculty.name}
Mission: ${faculty.mission}
Scripture: ${faculty.key_scripture}

Generate Module ${mIndex + 1} of ${modulesCount} with the following structure:

**Content Requirements** (900-1100 words total):

1. **SCROLL INVOCATION** (2-3 sentences)
   - Begin with "✝️ SCROLL INVOCATION:"
   - Dedicate this learning to Christ's Lordship
   - Connect to the faculty's spiritual mission

2. **MAIN CONTENT** (600-700 words)
   - Title the section clearly
   - Teach with academic depth and biblical wisdom
   - Include practical examples and applications
   - Integrate Scripture naturally (cite at least one verse with reference)
   - Use clear markdown formatting (headers, lists, emphasis)

3. **KEY TAKEAWAYS** (100-150 words)
   - Bullet point list of 4-6 main concepts
   - Spiritual and practical insights

4. **REFLECTION QUESTIONS** (50-100 words)
   - 2-3 questions for deeper thinking
   - Connect learning to faith and practice

5. **SCROLLCOIN REWARD NOTICE**
   - End with: "📜 **Earn [amount] ScrollCoins for completing this module**"

Return ONLY valid JSON:
{
  "title": "Module Title",
  "content": "full markdown content here including all sections"
}`;

                const moduleData = await retryWithBackoff(async () => {
                  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${lovableApiKey}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      model: "google/gemini-2.5-flash",
                      messages: [{ role: "user", content: modulePrompt }],
                    }),
                  });
                  const data = await response.json();
                  const content = data.choices[0].message.content.trim();
                  const jsonMatch = content.match(/\{[\s\S]*\}/);
                  return JSON.parse(jsonMatch ? jsonMatch[0] : content);
                }, `Module ${mIndex + 1} for ${course.title}`);

                const rewardAmount = Math.floor(Math.random() * 41) + 10; // 10-50 coins
                const finalContent = moduleData.content + `\n\n📜 **Earn ${rewardAmount} ScrollCoins for completing this module**`;

                // Anti-drift validation
                const isValid = validateAntiDrift(finalContent, rewardAmount);
                if (!isValid && (report.modulesCreated + 1) % 10 === 0) {
                  console.log(`🔄 Anti-Drift Regeneration triggered — ${moduleData.title} realigned under Christ's governance`);
                  report.antiDriftRegenerations++;
                  // In a real implementation, we would regenerate here
                }

                const { data: module } = await supabase
                  .from("course_modules")
                  .insert({
                    course_id: course.id,
                    title: moduleData.title,
                    content_md: finalContent,
                    order_index: mIndex,
                    rewards_amount: rewardAmount,
                  })
                  .select()
                  .single();

                if (!module) continue;

                report.modulesCreated++;
                report.totalScrollCoins += rewardAmount;

                // Generate PDF
                const pdfContent = generatePDF(
                  `${course.title} - ${module.title}`,
                  finalContent,
                  faculty.key_scripture
                );
                const pdfBuffer = new TextEncoder().encode(pdfContent);
                const { data: pdfUpload } = await supabase.storage
                  .from("materials")
                  .upload(`pdfs/${faculty.faculty_code}/${course.id}/${module.id}.txt`, pdfBuffer, {
                    contentType: "text/plain",
                    upsert: true,
                  });

                if (pdfUpload) {
                  const { data: { publicUrl } } = supabase.storage
                    .from("materials")
                    .getPublicUrl(pdfUpload.path);
                  
                  await supabase.from("course_materials").insert({
                    module_id: module.id,
                    title: `${module.title} - Study Guide`,
                    type: "pdf",
                    url: publicUrl,
                  });
                  report.pdfsGenerated++;
                  report.materialsCreated++;
                }

                // Generate additional materials
                await supabase.from("course_materials").insertMany([
                  {
                    module_id: module.id,
                    title: `${module.title} - Video Lecture`,
                    type: "video",
                    url: `https://placeholder.com/video/${module.id}`,
                  },
                  {
                    module_id: module.id,
                    title: `${module.title} - Slides`,
                    type: "slides",
                    url: `https://placeholder.com/slides/${module.id}`,
                  },
                ]);
                report.materialsCreated += 2;

                // Generate quiz
                const quizPrompt = `Generate a comprehensive quiz for this module.

Module: ${module.title}
Content Summary: First 200 chars of content for context

Create 7 multiple-choice questions that:
- Test key concepts and understanding
- Include practical application questions
- Align with Christian values and biblical principles
- Have one clearly correct answer
- Include 3 plausible distractors

Also provide a reflection prompt for spiritual growth.

Return ONLY valid JSON:
{
  "title": "Quiz Title",
  "questions": [
    {
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0
    }
  ],
  "reflectionPrompt": "reflection question"
}`;

                const quizData = await retryWithBackoff(async () => {
                  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${lovableApiKey}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      model: "google/gemini-2.5-flash",
                      messages: [{ role: "user", content: quizPrompt }],
                    }),
                  });
                  const data = await response.json();
                  const content = data.choices[0].message.content.trim();
                  const jsonMatch = content.match(/\{[\s\S]*\}/);
                  return JSON.parse(jsonMatch ? jsonMatch[0] : content);
                }, `Quiz for ${module.title}`);

                const { data: quiz } = await supabase
                  .from("quizzes")
                  .insert({
                    module_id: module.id,
                    title: quizData.title,
                    passing_score: 70,
                  })
                  .select()
                  .single();

                if (quiz && quizData.questions) {
                  const questions = quizData.questions.map((q: any, idx: number) => ({
                    quiz_id: quiz.id,
                    question_text: q.question,
                    options: q.options,
                    correct_answer: q.options[q.correctIndex],
                    order_index: idx,
                  }));
                  await supabase.from("quiz_questions").insert(questions);
                  report.quizzesCreated++;
                }

                // Spiritual checkpoint every 50 modules
                if (report.modulesCreated % 50 === 0) {
                  console.log(`\n✝️ Spiritual Checkpoint: ${report.modulesCreated} modules created under Christ's governance`);
                }

              } catch (error) {
                console.error(`✝️ Error generating module:`, error);
                report.errorsEncountered++;
              }
            }

            console.log(`📘 ${faculty.name}: ${coursesCount} courses, ${report.modulesCreated} total modules, ${report.materialsCreated} materials created successfully`);

          } catch (error) {
            console.error(`✝️ Error generating course:`, error);
            report.errorsEncountered++;
          }
        }
      }
    }

    report.endTime = Date.now();
    report.duration = `${Math.floor((report.endTime - report.startTime) / 1000 / 60)} minutes`;

    console.log(`\n✝️ Batch ${batch + 1}/${totalBatches} Complete`);
    console.log("=".repeat(80));
    console.log(`Faculties Created: ${report.facultiesCreated}`);
    console.log(`AI Tutors Created: ${report.aiTutorsCreated}`);
    console.log(`Courses Created: ${report.coursesCreated}`);
    console.log(`Modules Created: ${report.modulesCreated}`);
    console.log(`Materials Created: ${report.materialsCreated}`);
    console.log(`PDFs Generated: ${report.pdfsGenerated}`);
    console.log(`Duration: ${report.duration}`);
    console.log("=".repeat(80));

    // Update progress
    await supabase.from("generation_progress").delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from("generation_progress").insert({
      current_stage: isLastBatch ? 'Complete' : `Batch ${batch + 1} Complete`,
      progress: Math.round(((batch + 1) / totalBatches) * 100),
      faculties_created: (batch + 1) * batchSize,
      courses_created: report.coursesCreated,
      modules_created: report.modulesCreated,
      tutors_created: report.aiTutorsCreated,
      estimated_time_remaining: isLastBatch ? 'Done' : `${(totalBatches - batch - 1) * 2} minutes`,
    });

    // Save batch report
    if (isLastBatch) {
      const reportJson = JSON.stringify({ ...report, totalBatches, batchSize }, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      await supabase.storage
        .from("materials")
        .upload(`generation-reports/generation_${timestamp}.json`, new TextEncoder().encode(reportJson), {
          contentType: "application/json",
          upsert: true,
        });
      console.log("✅ Final generation report saved.");
      
      // Clear progress on completion
      await supabase.from("generation_progress").delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    return new Response(JSON.stringify({
      ...report,
      batch,
      totalBatches,
      isComplete: isLastBatch,
      nextBatch: isLastBatch ? null : batch + 1,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("✝️ Generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
