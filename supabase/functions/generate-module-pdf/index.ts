import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple HTML to PDF conversion using basic HTML structure
function generatePDFHTML(title: string, faculty: string, contentMd: string): string {
  // Convert basic markdown to HTML (very simplified)
  let html = contentMd
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^\> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/<li>/g, '<ul><li>')
    .replace(/<\/li>\n(?!<li>)/g, '</li></ul>\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { 
      margin: 2cm;
      size: A4;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .cover {
      text-align: center;
      padding: 100px 20px;
      page-break-after: always;
    }
    .cover h1 {
      font-size: 36px;
      margin-bottom: 20px;
      color: #2563eb;
    }
    .cover .meta {
      font-size: 16px;
      color: #666;
      margin: 10px 0;
    }
    h1 {
      font-size: 28px;
      color: #1a1a1a;
      margin: 30px 0 15px;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      font-size: 22px;
      color: #2563eb;
      margin: 25px 0 12px;
    }
    h3 {
      font-size: 18px;
      color: #4f46e5;
      margin: 20px 0 10px;
    }
    p {
      margin: 10px 0;
      text-align: justify;
    }
    blockquote {
      border-left: 4px solid #2563eb;
      padding: 10px 20px;
      margin: 20px 0;
      background: #f8fafc;
      font-style: italic;
    }
    ul {
      margin: 10px 0;
      padding-left: 30px;
    }
    li {
      margin: 5px 0;
    }
    strong {
      color: #1e40af;
      font-weight: 600;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${title}</h1>
    <div class="meta">Faculty: ${faculty}</div>
    <div class="meta">ScrollUniversity</div>
    <div class="meta">✝️ Jesus Christ is Lord</div>
  </div>
  
  <div class="content">
    ${html}
  </div>
  
  <div class="footer">
    © ScrollUniversity — All knowledge under Christ's Lordship
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get module_id from query params
    const url = new URL(req.url);
    const moduleId = url.searchParams.get('module_id');

    if (!moduleId) {
      return new Response(
        JSON.stringify({ error: 'module_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✝️ Jesus Christ is Lord - Generating PDF for module:', moduleId);

    // Fetch module data
    const { data: module, error: moduleError } = await supabase
      .from('course_modules')
      .select(`
        id,
        title,
        content_md,
        courses:course_id (
          title,
          faculty
        )
      `)
      .eq('id', moduleId)
      .single();

    if (moduleError || !module) {
      console.error('Module fetch error:', moduleError);
      return new Response(
        JSON.stringify({ error: 'Module not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const title = module.title || 'Module';
    const faculty = (module.courses as any)?.faculty || 'Faculty';
    const contentMd = module.content_md || 'Content coming soon...';

    // Generate HTML
    const html = generatePDFHTML(title, faculty, contentMd);

    // Return HTML that will be rendered as PDF by browser print functionality
    // For actual PDF generation, you'd need a service like Puppeteer or a PDF API
    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
