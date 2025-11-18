import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsPDF } from "https://cdn.skypack.dev/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Generate Course Materials function started");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { courseId, moduleId, materialType } = await req.json();

    // Fetch course and module data
    const { data: module, error: moduleError } = await supabaseClient
      .from('course_modules')
      .select('*, courses(*)')
      .eq('id', moduleId)
      .single();

    if (moduleError) throw moduleError;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    let generatedContent = '';
    let fileName = '';

    switch (materialType) {
      case 'textbook':
        generatedContent = await generateTextbook(module, LOVABLE_API_KEY);
        fileName = `textbook-${module.title.replace(/\s+/g, '-')}.pdf`;
        break;
      
      case 'slides':
        generatedContent = await generateSlides(module, LOVABLE_API_KEY);
        fileName = `slides-${module.title.replace(/\s+/g, '-')}.pdf`;
        break;
      
      case 'workbook':
        generatedContent = await generateWorkbook(module, LOVABLE_API_KEY);
        fileName = `workbook-${module.title.replace(/\s+/g, '-')}.pdf`;
        break;
      
      case 'assignments':
        generatedContent = await generateAssignments(module, LOVABLE_API_KEY);
        fileName = `assignments-${module.title.replace(/\s+/g, '-')}.pdf`;
        break;
      
      case 'case-study':
        generatedContent = await generateCaseStudy(module, LOVABLE_API_KEY);
        fileName = `case-study-${module.title.replace(/\s+/g, '-')}.pdf`;
        break;
      
      default:
        throw new Error('Invalid material type');
    }

    // Generate PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Add header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(module.courses.title, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(16);
    pdf.text(module.title, margin, yPosition);
    yPosition += 15;

    // Add content
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const lines = pdf.splitTextToSize(generatedContent, pageWidth - 2 * margin);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    const pdfBuffer = pdf.output('arraybuffer');

    // Upload to Supabase Storage
    const storagePath = `materials/${courseId}/${moduleId}/${fileName}`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('materials')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseClient.storage
      .from('materials')
      .getPublicUrl(storagePath);

    // Create learning material record
    const { error: insertError } = await supabaseClient
      .from('learning_materials')
      .insert({
        module_id: moduleId,
        title: fileName.replace('.pdf', '').replace(/-/g, ' '),
        kind: materialType,
        url: urlData.publicUrl,
        meta: {
          generated: true,
          generatedAt: new Date().toISOString()
        }
      });

    if (insertError) console.error('Failed to insert learning material record:', insertError);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: urlData.publicUrl,
        fileName,
        materialType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate course materials error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateTextbook(module: any, apiKey: string): Promise<string> {
  const prompt = `Generate a comprehensive textbook chapter (20-30 pages worth) for:

Title: ${module.title}
Course: ${module.courses.title}

Module Content:
${module.content_md || module.content}

Requirements:
- Academic rigor equivalent to Harvard/MIT level
- Introduction and learning objectives
- Multiple sections with clear headings
- Detailed explanations with examples
- Real-world applications and case studies
- Practice problems with solutions
- Summary and key takeaways
- Further reading recommendations
- Glossary of key terms

Write in a scholarly yet accessible tone. Include citations and references where appropriate.`;

  return await callAI(prompt, apiKey);
}

async function generateSlides(module: any, apiKey: string): Promise<string> {
  const prompt = `Generate presentation slides content for:

Title: ${module.title}

Create 15-20 slides covering:
1. Title slide
2. Learning objectives
3. Key concepts (multiple slides)
4. Examples and applications
5. Case studies
6. Practice questions
7. Summary
8. Q&A

For each slide, provide:
- Slide number
- Title
- Bullet points (3-5 per slide)
- Speaker notes

Keep text concise and presentation-friendly.`;

  return await callAI(prompt, apiKey);
}

async function generateWorkbook(module: any, apiKey: string): Promise<string> {
  const prompt = `Generate a student workbook for:

Title: ${module.title}

Include:
- Guided notes templates
- Practice exercises (easy, medium, hard)
- Reflection questions
- Application scenarios
- Self-assessment checklist
- Additional resources

Make it interactive and practical for student learning.`;

  return await callAI(prompt, apiKey);
}

async function generateAssignments(module: any, apiKey: string): Promise<string> {
  const prompt = `Generate comprehensive assignments for:

Title: ${module.title}

Create 3 assignments:
1. Conceptual understanding (essay/short answer)
2. Applied problem-solving
3. Project-based application

For each:
- Clear instructions
- Learning objectives
- Grading rubric
- Expected deliverables
- Estimated time
- Resources allowed

Include answer keys/solutions.`;

  return await callAI(prompt, apiKey);
}

async function generateCaseStudy(module: any, apiKey: string): Promise<string> {
  const prompt = `Generate a detailed case study for:

Title: ${module.title}
Course: ${module.courses.title}

Requirements:
- Real-world scenario (10-15 pages)
- Background and context
- Key stakeholders
- Challenges and problems
- Data and information
- Discussion questions
- Suggested solutions
- Learning objectives

Make it engaging and relevant to ${module.courses.faculty || 'the subject'}.`;

  return await callAI(prompt, apiKey);
}

async function callAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: 'You are an expert educational content creator generating university-level materials.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error('AI generation failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
