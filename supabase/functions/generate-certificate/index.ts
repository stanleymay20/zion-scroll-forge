import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateCertificateHTML(
  studentName: string,
  courseTitle: string,
  faculty: string,
  completionDate: string,
  scrollBadge: boolean
): string {
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate of Completion</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      width: 297mm;
      height: 210mm;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    .certificate {
      background: white;
      width: 280mm;
      height: 195mm;
      padding: 40px;
      border: 20px solid #2563eb;
      border-image: linear-gradient(45deg, #2563eb, #7c3aed) 1;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      position: relative;
    }
    .ornament {
      position: absolute;
      font-size: 60px;
      color: #2563eb;
      opacity: 0.1;
    }
    .ornament.top-left { top: 20px; left: 20px; }
    .ornament.top-right { top: 20px; right: 20px; }
    .ornament.bottom-left { bottom: 20px; left: 20px; }
    .ornament.bottom-right { bottom: 20px; right: 20px; }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 14px;
      color: #666;
      font-style: italic;
    }
    .title {
      text-align: center;
      font-size: 48px;
      color: #1e40af;
      margin: 40px 0 20px;
      font-weight: normal;
      letter-spacing: 4px;
      text-transform: uppercase;
    }
    .content {
      text-align: center;
      margin: 40px 0;
    }
    .awarded-to {
      font-size: 18px;
      color: #666;
      margin-bottom: 15px;
    }
    .student-name {
      font-size: 42px;
      color: #1a1a1a;
      font-weight: bold;
      margin: 20px 0;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
      display: inline-block;
    }
    .completion-text {
      font-size: 16px;
      color: #666;
      margin: 30px 0 15px;
      line-height: 1.8;
    }
    .course-title {
      font-size: 28px;
      color: #2563eb;
      font-weight: bold;
      margin: 15px 0;
    }
    .faculty {
      font-size: 18px;
      color: #7c3aed;
      font-style: italic;
      margin-bottom: 30px;
    }
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      color: #1a1a1a;
      padding: 10px 30px;
      border-radius: 50px;
      font-size: 16px;
      font-weight: bold;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    }
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .signature-block {
      text-align: center;
    }
    .signature-line {
      width: 200px;
      border-top: 2px solid #2563eb;
      margin: 40px auto 10px;
    }
    .signature-title {
      font-size: 12px;
      color: #666;
    }
    .date {
      text-align: center;
      margin-top: 40px;
      font-size: 14px;
      color: #666;
    }
    .cross {
      text-align: center;
      font-size: 20px;
      color: #2563eb;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="ornament top-left">✦</div>
    <div class="ornament top-right">✦</div>
    <div class="ornament bottom-left">✦</div>
    <div class="ornament bottom-right">✦</div>
    
    <div class="header">
      <div class="logo">SCROLLUNIVERSITY</div>
      <div class="subtitle">Excellence in Kingdom Education</div>
    </div>
    
    <div class="title">Certificate of Completion</div>
    
    <div class="content">
      <div class="awarded-to">This certificate is proudly awarded to</div>
      
      <div class="student-name">${studentName}</div>
      
      <div class="completion-text">
        for successfully completing the comprehensive course
      </div>
      
      <div class="course-title">${courseTitle}</div>
      <div class="faculty">${faculty}</div>
      
      ${scrollBadge ? '<div class="badge">🏆 ScrollBadge Earned</div>' : ''}
      
      <div class="date">
        Completed on ${formattedDate}
      </div>
    </div>
    
    <div class="footer">
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-title">Dean of Faculty</div>
      </div>
      
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-title">Academic Director</div>
      </div>
    </div>
    
    <div class="cross">✝️ Jesus Christ is Lord</div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { courseId, userId } = await req.json();

    if (!courseId || !userId) {
      return new Response(
        JSON.stringify({ error: 'courseId and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✝️ Generating certificate for user:', userId, 'course:', courseId);

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    // Fetch course details
    const { data: course } = await supabase
      .from('courses')
      .select('title, faculty')
      .eq('id', courseId)
      .single();

    if (!profile || !course) {
      return new Response(
        JSON.stringify({ error: 'User or course not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const studentName = profile.email?.split('@')[0] || 'Student';
    const completionDate = new Date().toISOString();

    // Generate certificate HTML
    const html = generateCertificateHTML(
      studentName,
      course.title,
      course.faculty,
      completionDate,
      true
    );

    // For now, return the HTML (you can enhance this with PDF generation)
    // In production, you'd use a service like Puppeteer or a PDF API
    const certificateUrl = `data:text/html;base64,${btoa(html)}`;

    // Save certificate record
    const { data: certificate, error: certError } = await supabase
      .from('course_certificates')
      .upsert({
        user_id: userId,
        course_id: courseId,
        certificate_url: certificateUrl,
        scroll_badge_earned: true,
        completion_date: completionDate,
      })
      .select()
      .single();

    if (certError) throw certError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        certificate,
        html 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating certificate:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
