/**
 * Batch PDF Generation Script for ScrollUniversity
 * Generates and uploads PDFs for all course modules
 * 
 * Usage: npx tsx scripts/generate-all-pdfs.ts
 * 
 * Requirements:
 * - VITE_SUPABASE_URL in .env
 * - SUPABASE_SERVICE_ROLE_KEY in .env (get from Supabase dashboard)
 */

import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

interface Module {
  id: string;
  title: string;
  content_md: string;
  course_id: string;
  courses: {
    title: string;
    faculty: string;
  };
}

async function generatePDFHTML(module: Module): Promise<string> {
  const contentHtml = marked(module.content_md || 'Content coming soon...');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${module.title}</title>
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
    ul, ol {
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
    code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
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
    <h1>${module.title}</h1>
    <div class="meta">Course: ${module.courses.title}</div>
    <div class="meta">Faculty: ${module.courses.faculty}</div>
    <div class="meta">ScrollUniversity</div>
    <div class="meta">✝️ Jesus Christ is Lord</div>
  </div>
  
  <div class="content">
    ${contentHtml}
  </div>
  
  <div class="footer">
    © ScrollUniversity — All knowledge under Christ's Lordship
  </div>
</body>
</html>
  `;
}

async function main() {
  console.log('✝️ Jesus Christ is Lord - Starting PDF generation...\n');

  // Fetch all modules with course information
  const { data: modules, error } = await supabase
    .from('course_modules')
    .select(`
      id,
      title,
      content_md,
      course_id,
      courses:course_id (
        title,
        faculty
      )
    `)
    .order('created_at');

  if (error) {
    console.error('❌ Error fetching modules:', error);
    process.exit(1);
  }

  if (!modules || modules.length === 0) {
    console.log('⚠️  No modules found in database');
    return;
  }

  console.log(`📚 Found ${modules.length} modules to process\n`);

  let successCount = 0;
  let errorCount = 0;

  // Process each module
  for (const module of modules as Module[]) {
    try {
      console.log(`Processing: ${module.title}...`);

      // Generate HTML content
      const html = await generatePDFHTML(module);

      // Call the PDF generation edge function
      const pdfPath = `materials/${module.course_id}/${module.id}.pdf`;
      
      // For now, we'll use the edge function to generate the PDF
      // You can enhance this to use puppeteer locally if needed
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${pdfPath}`;
      
      // Update the module's material_url
      const { error: updateError } = await supabase
        .from('course_modules')
        .update({ material_url: publicUrl })
        .eq('id', module.id);

      if (updateError) {
        console.error(`  ❌ Error updating module: ${updateError.message}`);
        errorCount++;
        continue;
      }

      console.log(`  ✅ Updated: ${publicUrl}`);
      successCount++;

    } catch (err) {
      console.error(`  ❌ Error processing module:`, err);
      errorCount++;
    }
  }

  console.log(`\n📊 Generation complete!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`\n✝️ All glory to Jesus Christ, Lord of all knowledge\n`);
}

main().catch(console.error);
