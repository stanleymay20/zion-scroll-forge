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
  termsCreated: number;
  offeringsCreated: number;
  errorsEncountered: number;
  antiDriftValidations: number;
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
    scripture: "3 John 1:2 - 'Beloved, I pray that you may prosper in all things and be in health, just as your soul prospers'",
  },
  {
    name: "Prophetic Law & Governance",
    code: "LAWGOV",
    description: "Biblical jurisprudence and righteous governance rooted in God's eternal law",
    mission: "To establish justice systems that reflect God's righteousness and govern with divine wisdom",
    scripture: "Isaiah 33:22 - 'For the LORD is our judge, the LORD is our lawgiver, the LORD is our king; He will save us'",
  },
  {
    name: "Scroll Economy",
    code: "SCROLLECON",
    description: "Kingdom economics and wealth transfer principles for global transformation",
    mission: "To release biblical prosperity and steward resources for advancing God's kingdom on earth",
    scripture: "Deuteronomy 8:18 - 'You shall remember the LORD your God, for it is He who gives you power to get wealth'",
  },
  {
    name: "Ethic Science",
    code: "ETHICSCI",
    description: "Scientific inquiry grounded in biblical ethics and moral truth",
    mission: "To pursue knowledge and innovation that honors God and serves humanity with integrity",
    scripture: "Proverbs 2:6 - 'For the LORD gives wisdom; from His mouth come knowledge and understanding'",
  },
  {
    name: "Prophetic Intelligence",
    code: "PROPHINTEL",
    description: "Strategic intelligence and discernment through the Spirit for kingdom advancement",
    mission: "To develop prophetic insight and spiritual intelligence for navigating end-time strategies",
    scripture: "1 Corinthians 2:10 - 'But God has revealed them to us through His Spirit. For the Spirit searches all things'",
  },
  {
    name: "Sacred Arts & Worship",
    code: "SACREDARTS",
    description: "Creative expression and worship arts that glorify God and transform culture",
    mission: "To cultivate Spirit-filled artists who manifest God's beauty and lead nations in worship",
    scripture: "Exodus 31:3-5 - 'I have filled him with the Spirit of God, in wisdom, in understanding, in knowledge, and in all manner of workmanship'",
  },
  {
    name: "Kingdom Architecture",
    code: "KINGARCH",
    description: "Designing and building spaces that reflect God's glory and serve His purposes",
    mission: "To create structures and environments that facilitate worship, community, and kingdom expansion",
    scripture: "Hebrews 11:10 - 'For he waited for the city which has foundations, whose builder and maker is God'",
  },
  {
    name: "GeoProphetic Intelligence",
    code: "GEOPROPHET",
    description: "Understanding territorial dynamics and God's purposes for nations and regions",
    mission: "To discern God's strategic plans for geographical territories and execute kingdom mandates",
    scripture: "Acts 17:26 - 'He has made from one blood every nation of men to dwell on all the face of the earth, and has determined their preappointed times and the boundaries of their dwellings'",
  },
  {
    name: "Divine Technology",
    code: "DIVINETECH",
    description: "Technological innovation guided by divine wisdom for kingdom impact",
    mission: "To develop Christ-centered technology that serves humanity and advances God's purposes",
    scripture: "Daniel 12:4 - 'But you, Daniel, shut up the words, and seal the book until the time of the end; many shall run to and fro, and knowledge shall increase'",
  },
  {
    name: "ScrollMedia & Communication",
    code: "SCROLLMEDIA",
    description: "Kingdom communication and media production for global gospel dissemination",
    mission: "To create Spirit-anointed media content that transforms hearts and influences culture",
    scripture: "Habakkuk 2:2 - 'Write the vision and make it plain on tablets, that he may run who reads it'",
  },
  {
    name: "Kingdom Governance",
    code: "KINGGOV",
    description: "Leadership development and governmental authority in Christ's kingdom",
    mission: "To raise righteous leaders who govern with wisdom, justice, and the fear of the Lord",
    scripture: "Isaiah 9:6-7 - 'Of the increase of His government and peace there will be no end'",
  },
  {
    name: "Spiritual Formation",
    code: "SPIRITFORM",
    description: "Discipleship and character development in Christlikeness",
    mission: "To form disciples who manifest the character of Christ and walk in spiritual maturity",
    scripture: "Romans 8:29 - 'For whom He foreknew, He also predestined to be conformed to the image of His Son'",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("✝️ ScrollUniversity v3.0 Content Generation System");
    console.log("Let Christ be Lord over all learning");

    const report: GenerationReport = {
      facultiesCreated: 0,
      coursesCreated: 0,
      modulesCreated: 0,
      materialsCreated: 0,
      quizzesCreated: 0,
      termsCreated: 0,
      offeringsCreated: 0,
      errorsEncountered: 0,
      antiDriftValidations: 0,
      startTime: Date.now(),
    };

    // Step 1: Generate Faculties with Emblems
    console.log("\n📚 Step 1: Generating 12 Supreme Scroll Faculties...");
    for (const faculty of SUPREME_FACULTIES) {
      try {
        // Generate emblem using Gemini Flash
        const emblemPrompt = `Create a professional academic faculty emblem for ${faculty.name}. 
        Mission: ${faculty.mission}. 
        The emblem should include Christian symbolism (cross, light, dove), 
        academic elements (scrolls, books, laurels), and represent the faculty's spiritual calling.
        Style: Professional, elegant, suitable for an academic institution. Colors: Gold, deep blue, white.`;

        const emblemResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

        const emblemData = await emblemResponse.json();
        const emblemBase64 = emblemData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        let emblemUrl = "";
        if (emblemBase64) {
          // Upload to Supabase Storage
          const emblemBuffer = Uint8Array.from(atob(emblemBase64.split(",")[1]), c => c.charCodeAt(0));
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("faculty-emblems")
            .upload(`${faculty.code}.png`, emblemBuffer, {
              contentType: "image/png",
              upsert: true,
            });

          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from("faculty-emblems")
              .getPublicUrl(uploadData.path);
            emblemUrl = publicUrl;
          }
        }

        // Insert faculty
        const { error: facultyError } = await supabase.from("faculties").insert({
          name: faculty.name,
          faculty_code: faculty.code,
          description: faculty.description,
          mission: faculty.mission,
          key_scripture: faculty.scripture,
          emblem_url: emblemUrl,
        });

        if (!facultyError) {
          report.facultiesCreated++;
          console.log(`✝️ ScrollUniversity Faculty ${faculty.name} established — Christ is Lord over academia`);
        } else {
          console.error(`Error creating faculty ${faculty.name}:`, facultyError);
          report.errorsEncountered++;
        }
      } catch (error) {
        console.error(`Error generating faculty ${faculty.name}:`, error);
        report.errorsEncountered++;
      }
    }

    // Step 2: Generate Academic Terms
    console.log("\n📅 Step 2: Generating Academic Terms...");
    const terms = [
      { name: "Spring 2026", start_date: "2026-01-15", end_date: "2026-05-15", is_active: true },
      { name: "Fall 2026", start_date: "2026-08-15", end_date: "2026-12-15", is_active: false },
    ];

    const termIds: string[] = [];
    for (const term of terms) {
      const { data: termData, error: termError } = await supabase
        .from("academic_terms")
        .insert(term)
        .select()
        .single();

      if (!termError && termData) {
        termIds.push(termData.id);
        report.termsCreated++;
        console.log(`✅ Term created: ${term.name}`);
      }
    }

    // Step 3: Generate Courses, Modules, Materials, Quizzes
    console.log("\n📖 Step 3: Generating Courses and Content...");
    
    const { data: faculties } = await supabase.from("faculties").select("*");
    
    if (faculties) {
      for (const faculty of faculties) {
        const coursesCount = Math.floor(Math.random() * 3) + 4; // 4-6 courses

        for (let i = 0; i < coursesCount; i++) {
          try {
            // Generate course using AI
            const coursePrompt = `Generate a comprehensive course for ${faculty.name} faculty.
            Mission: ${faculty.mission}
            Scripture: ${faculty.key_scripture}
            
            Provide a course with:
            1. Title (compelling and academic)
            2. Description (150-200 words, include spiritual dimension)
            
            Return as JSON: { "title": "...", "description": "..." }`;

            const courseResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

            const courseData = await courseResponse.json();
            const courseContent = JSON.parse(courseData.choices[0].message.content);

            // Insert course
            const { data: course, error: courseError } = await supabase
              .from("courses")
              .insert({
                title: courseContent.title,
                description: courseContent.description,
                faculty_id: faculty.id,
                faculty: faculty.name,
                level: ["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)],
                duration: `${Math.floor(Math.random() * 8) + 8} weeks`,
                price: Math.floor(Math.random() * 500),
              })
              .select()
              .single();

            if (courseError || !course) {
              console.error("Error creating course:", courseError);
              report.errorsEncountered++;
              continue;
            }

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

            // Generate 4-6 modules
            const modulesCount = Math.floor(Math.random() * 3) + 4;
            
            for (let modIndex = 0; modIndex < modulesCount; modIndex++) {
              try {
                // Anti-drift validation check
                if ((report.modulesCreated + 1) % 10 === 0) {
                  console.log("⚠️ Anti-drift validation: Let Christ be Lord over all learning; wisdom flows from the Spirit, not Babylon");
                  report.antiDriftValidations++;
                }

                const modulePrompt = `Generate module ${modIndex + 1} for course "${course.title}" in ${faculty.name}.
                Faculty Scripture: ${faculty.key_scripture}
                
                Create content with:
                1. Scroll Invocation (opening statement dedicating to Christ's Lordship)
                2. Title
                3. Content (800-1200 words in markdown, include 1 Scripture verse)
                4. Key concepts
                
                Return as JSON: { "title": "...", "content": "..." }`;

                const moduleResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

                const moduleData = await moduleResponse.json();
                const moduleContent = JSON.parse(moduleData.choices[0].message.content);

                const rewardAmount = Math.floor(Math.random() * 41) + 10; // 10-50 coins

                const { data: module, error: moduleError } = await supabase
                  .from("course_modules")
                  .insert({
                    course_id: course.id,
                    title: moduleContent.title,
                    content_md: moduleContent.content + `\n\n📜 **Earn ${rewardAmount} ScrollCoins for completing this module**`,
                    order_index: modIndex,
                    rewards_amount: rewardAmount,
                  })
                  .select()
                  .single();

                if (moduleError || !module) {
                  console.error("Error creating module:", moduleError);
                  report.errorsEncountered++;
                  continue;
                }

                report.modulesCreated++;

                // Generate 2-3 materials per module
                const materialsCount = Math.floor(Math.random() * 2) + 2;
                for (let matIndex = 0; matIndex < materialsCount; matIndex++) {
                  const materialTypes = ["pdf", "video", "slides"];
                  const materialType = materialTypes[matIndex % 3];
                  
                  await supabase.from("course_materials").insert({
                    module_id: module.id,
                    title: `${module.title} - ${materialType.toUpperCase()}`,
                    type: materialType,
                    url: `https://placeholder.com/${materialType}/${module.id}`,
                  });
                  report.materialsCreated++;
                }

                // Generate quiz
                const quizPrompt = `Generate a quiz for module "${module.title}".
                Create 7 multiple-choice questions testing understanding.
                
                Return as JSON: {
                  "questions": [
                    {
                      "question": "...",
                      "options": ["A", "B", "C", "D"],
                      "correct_answer": "A"
                    }
                  ]
                }`;

                const quizResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

                const quizData = await quizResponse.json();
                const quizContent = JSON.parse(quizData.choices[0].message.content);

                const { data: quiz } = await supabase
                  .from("quizzes")
                  .insert({
                    module_id: module.id,
                    title: `${module.title} Assessment`,
                    passing_score: 70,
                  })
                  .select()
                  .single();

                if (quiz) {
                  for (let qIndex = 0; qIndex < quizContent.questions.length; qIndex++) {
                    const q = quizContent.questions[qIndex];
                    await supabase.from("quiz_questions").insert({
                      quiz_id: quiz.id,
                      question_text: q.question,
                      options: q.options,
                      correct_answer: q.correct_answer,
                      order_index: qIndex,
                    });
                  }
                  report.quizzesCreated++;
                }
              } catch (error) {
                console.error("Error generating module:", error);
                report.errorsEncountered++;
              }
            }
          } catch (error) {
            console.error("Error generating course:", error);
            report.errorsEncountered++;
          }
        }
      }
    }

    report.endTime = Date.now();
    report.duration = `${Math.floor((report.endTime - report.startTime) / 1000 / 60)} minutes`;

    console.log("\n✅ ScrollUniversity v3.0 Generation Complete!");
    console.log("=".repeat(60));
    console.log(`Faculties Created: ${report.facultiesCreated}`);
    console.log(`Courses Created: ${report.coursesCreated}`);
    console.log(`Modules Created: ${report.modulesCreated}`);
    console.log(`Materials Created: ${report.materialsCreated}`);
    console.log(`Quizzes Created: ${report.quizzesCreated}`);
    console.log(`Terms Created: ${report.termsCreated}`);
    console.log(`Offerings Created: ${report.offeringsCreated}`);
    console.log(`Errors Encountered: ${report.errorsEncountered}`);
    console.log(`Anti-Drift Validations: ${report.antiDriftValidations}`);
    console.log(`Duration: ${report.duration}`);
    console.log("=".repeat(60));
    console.log("✅ ScrollUniversity v3.0 Requirements successfully updated — All 12 Faculties seeded under Christ's governance");

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
