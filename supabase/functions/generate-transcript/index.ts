import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateTranscriptHTML(data: any): string {
  const { profile, enrollments, stats, scrollcoins } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Academic Transcript - ScrollUniversity</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }
    .subtitle { font-size: 16px; color: #666; }
    .student-info {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .student-info h2 { margin: 0 0 15px 0; font-size: 20px; }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
    }
    .label { font-weight: 600; color: #666; }
    .value { color: #1a1a1a; }
    .courses-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .courses-table th {
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    .courses-table td {
      border-bottom: 1px solid #e5e7eb;
      padding: 12px;
    }
    .grade {
      font-weight: bold;
      color: #059669;
      font-size: 18px;
    }
    .summary {
      background: #f0f9ff;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 30px 0;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">SCROLLUNIVERSITY</div>
    <div class="subtitle">Official Academic Transcript</div>
    <div style="margin-top: 10px; font-size: 14px; color: #666;">
      ✝️ Jesus Christ is Lord
    </div>
  </div>

  <div class="student-info">
    <h2>Student Information</h2>
    <div class="info-row">
      <span class="label">Student Email:</span>
      <span class="value">${profile.email || 'N/A'}</span>
    </div>
    <div class="info-row">
      <span class="label">Total XP Earned:</span>
      <span class="value">${stats?.total_xp || 0} XP</span>
    </div>
    <div class="info-row">
      <span class="label">ScrollCoin Balance:</span>
      <span class="value">${scrollcoins || 0} ScrollCoins</span>
    </div>
    <div class="info-row">
      <span class="label">Courses Completed:</span>
      <span class="value">${enrollments?.length || 0}</span>
    </div>
    <div class="info-row">
      <span class="label">Transcript Generated:</span>
      <span class="value">${new Date().toLocaleDateString()}</span>
    </div>
  </div>

  <h2 style="margin-top: 30px;">Completed Courses</h2>
  
  ${enrollments && enrollments.length > 0 ? `
    <table class="courses-table">
      <thead>
        <tr>
          <th>Course Title</th>
          <th>Faculty</th>
          <th>Level</th>
          <th>Completed</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>
        ${enrollments.map((e: any) => `
          <tr>
            <td>${e.courses?.title || 'N/A'}</td>
            <td>${e.courses?.faculty || 'N/A'}</td>
            <td>${e.courses?.level || 'N/A'}</td>
            <td>${new Date(e.updated_at).toLocaleDateString()}</td>
            <td class="grade">A</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p style="text-align: center; color: #666; padding: 20px;">No completed courses yet.</p>'}

  <div class="summary">
    <strong>Academic Summary:</strong><br>
    This transcript certifies that the above student has successfully completed the listed courses
    at ScrollUniversity, demonstrating commitment to Christ-centered education and academic excellence.
    All courses include integrated spiritual formation and kingdom principles.
  </div>

  <div class="footer">
    <p>This is an official transcript from ScrollUniversity</p>
    <p>© ScrollUniversity — All knowledge under Christ's Lordship</p>
    <p style="margin-top: 10px;">For verification, contact: verify@scrolluniversity.edu</p>
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

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    // Fetch completed enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses(title, faculty, level)
      `)
      .eq('user_id', userId)
      .eq('progress', 100)
      .order('updated_at', { ascending: false });

    // Fetch user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Fetch wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    const html = generateTranscriptHTML({
      profile,
      enrollments,
      stats,
      scrollcoins: wallet?.balance || 0,
    });

    return new Response(
      JSON.stringify({ success: true, html }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating transcript:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
