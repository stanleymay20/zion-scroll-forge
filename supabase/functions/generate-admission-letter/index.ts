import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.info('✝️ Jesus Christ is Lord - Generating admission letter');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { studentId } = await req.json();

    // Fetch student data
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error || !student) {
      throw new Error('Student not found');
    }

    // Generate admission letter HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; max-width: 800px; margin: 50px auto; padding: 40px; }
          .header { text-align: center; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #4F46E5; }
          .subtitle { color: #6B7280; font-style: italic; margin-top: 10px; }
          .content { line-height: 1.8; color: #1F2937; }
          .signature { margin-top: 60px; }
          .footer { margin-top: 60px; text-align: center; color: #6B7280; font-size: 14px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ScrollUniversity</div>
          <div class="subtitle">"Jesus Christ is Lord over all Learning"</div>
        </div>
        
        <div class="content">
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <p>Dear ${student.full_name},</p>
          
          <p><strong>Congratulations! You have been admitted to ScrollUniversity.</strong></p>
          
          <p>On behalf of the entire ScrollUniversity community, I am delighted to offer you admission to our institution. Your application demonstrated exceptional promise, and we believe you will thrive in our Christ-centered learning environment.</p>
          
          <p>ScrollUniversity is committed to providing transformative education grounded in biblical wisdom and powered by cutting-edge technology. As a student, you will:</p>
          
          <ul>
            <li>Access courses from our distinguished faculties</li>
            <li>Learn from world-class instructors</li>
            <li>Engage with XR-enabled immersive learning experiences</li>
            <li>Join a global community of faith-driven scholars</li>
            <li>Earn recognized credentials and ScrollBadge NFT certificates</li>
          </ul>
          
          <p>Your journey at ScrollUniversity will be more than academic excellence—it will be a spiritual transformation. We are committed to nurturing your God-given gifts and preparing you for kingdom impact.</p>
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Accept your offer through your student portal</li>
            <li>Complete enrollment and payment</li>
            <li>Begin your learning journey</li>
          </ol>
          
          <p>We look forward to welcoming you to our community and watching you grow in wisdom, knowledge, and faith.</p>
          
          <div class="signature">
            <p>Blessings and welcome,</p>
            <p><strong>The ScrollUniversity Admissions Team</strong></p>
          </div>
        </div>
        
        <div class="footer">
          <p><em>"For the Lord gives wisdom; from his mouth come knowledge and understanding." - Proverbs 2:6</em></p>
          <p>ScrollUniversity | Where Faith Meets Knowledge</p>
        </div>
      </body>
      </html>
    `;

    // Update student status
    await supabase
      .from('students')
      .update({ 
        application_status: 'accepted',
        admission_letter_url: 'generated'
      })
      .eq('id', studentId);

    return new Response(
      JSON.stringify({ html }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Generate admission letter error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
