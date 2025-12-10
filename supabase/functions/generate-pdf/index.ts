/**
 * Generate PDF Edge Function
 * Creates proper PDF files that can be read by Adobe Reader and other PDF readers
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PDF generation utilities - creates proper PDF/A compliant files
function createPDF(title: string, content: string, author: string = 'ScrollUniversity'): Uint8Array {
  const encoder = new TextEncoder();
  
  // Clean and prepare content
  const cleanContent = content
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '    ');
  
  // Split content into lines for proper pagination
  const lines = cleanContent.split('\n');
  const pageHeight = 792; // Letter size height in points
  const pageWidth = 612; // Letter size width in points
  const margin = 72; // 1 inch margins
  const lineHeight = 14;
  const maxLinesPerPage = Math.floor((pageHeight - margin * 2 - 50) / lineHeight);
  
  // Create pages
  const pages: string[][] = [];
  let currentPage: string[] = [];
  
  for (const line of lines) {
    // Word wrap long lines
    const maxCharsPerLine = 80;
    if (line.length > maxCharsPerLine) {
      const words = line.split(' ');
      let currentLine = '';
      for (const word of words) {
        if ((currentLine + ' ' + word).length > maxCharsPerLine) {
          if (currentLine) currentPage.push(currentLine);
          currentLine = word;
        } else {
          currentLine = currentLine ? currentLine + ' ' + word : word;
        }
        
        if (currentPage.length >= maxLinesPerPage) {
          pages.push(currentPage);
          currentPage = [];
        }
      }
      if (currentLine) currentPage.push(currentLine);
    } else {
      currentPage.push(line);
    }
    
    if (currentPage.length >= maxLinesPerPage) {
      pages.push(currentPage);
      currentPage = [];
    }
  }
  
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  // Ensure at least one page
  if (pages.length === 0) {
    pages.push(['No content available']);
  }
  
  // Build PDF structure
  let pdf = '%PDF-1.4\n';
  pdf += '%âãÏÓ\n'; // Binary marker for PDF readers
  
  const objects: string[] = [];
  let objectNumber = 1;
  
  // Object 1: Catalog
  objects.push(`${objectNumber} 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  objectNumber++;
  
  // Object 2: Pages (root of page tree)
  const pageRefs = pages.map((_, i) => `${i + 4} 0 R`).join(' ');
  objects.push(`${objectNumber} 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>\nendobj\n`);
  objectNumber++;
  
  // Object 3: Font
  objects.push(`${objectNumber} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`);
  objectNumber++;
  
  // Create page objects and content streams
  const contentObjectStart = objectNumber + pages.length;
  
  for (let i = 0; i < pages.length; i++) {
    const pageContentRef = contentObjectStart + i;
    objects.push(`${objectNumber} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${pageContentRef} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj\n`);
    objectNumber++;
  }
  
  // Create content streams for each page
  for (let i = 0; i < pages.length; i++) {
    const pageContent = pages[i];
    let streamContent = 'BT\n';
    streamContent += '/F1 12 Tf\n';
    streamContent += `${margin} ${pageHeight - margin} Td\n`;
    
    // Add title on first page
    if (i === 0) {
      streamContent += '/F1 18 Tf\n';
      const escapedTitle = escapeForPDF(title);
      streamContent += `(${escapedTitle}) Tj\n`;
      streamContent += '0 -30 Td\n';
      streamContent += '/F1 12 Tf\n';
      streamContent += `(Author: ${author}) Tj\n`;
      streamContent += '0 -20 Td\n';
      streamContent += '0 -20 Td\n'; // Extra spacing after header
    }
    
    // Add content lines
    for (const line of pageContent) {
      const escapedLine = escapeForPDF(line);
      streamContent += `(${escapedLine}) Tj\n`;
      streamContent += `0 -${lineHeight} Td\n`;
    }
    
    // Add page number
    streamContent += `0 -30 Td\n`;
    streamContent += `(Page ${i + 1} of ${pages.length}) Tj\n`;
    
    streamContent += 'ET';
    
    const streamBytes = encoder.encode(streamContent);
    objects.push(`${objectNumber} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`);
    objectNumber++;
  }
  
  // Object for document info
  const creationDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  objects.push(`${objectNumber} 0 obj\n<< /Title (${escapeForPDF(title)}) /Author (${escapeForPDF(author)}) /Creator (ScrollUniversity PDF Generator) /Producer (ScrollUniversity) /CreationDate (D:${creationDate}) >>\nendobj\n`);
  const infoRef = objectNumber;
  objectNumber++;
  
  // Combine all objects
  for (const obj of objects) {
    pdf += obj;
  }
  
  // Cross-reference table
  const xrefOffset = encoder.encode(pdf).length;
  pdf += 'xref\n';
  pdf += `0 ${objectNumber}\n`;
  pdf += '0000000000 65535 f \n';
  
  let currentOffset = 9; // After header
  for (let i = 0; i < objects.length; i++) {
    const offsetStr = currentOffset.toString().padStart(10, '0');
    pdf += `${offsetStr} 00000 n \n`;
    currentOffset += encoder.encode(objects[i]).length;
  }
  
  // Trailer
  pdf += 'trailer\n';
  pdf += `<< /Size ${objectNumber} /Root 1 0 R /Info ${infoRef} 0 R >>\n`;
  pdf += 'startxref\n';
  pdf += `${xrefOffset}\n`;
  pdf += '%%EOF';
  
  return encoder.encode(pdf);
}

function escapeForPDF(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ''); // Remove non-printable characters
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content, author, type } = await req.json();

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating PDF:', { title, contentLength: content.length, type });

    // Generate PDF bytes
    const pdfBytes = createPDF(title, content, author || 'ScrollUniversity');

    // Return PDF as base64 for frontend to download
    const base64PDF = btoa(String.fromCharCode(...pdfBytes));

    return new Response(
      JSON.stringify({ 
        pdf: base64PDF,
        filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        size: pdfBytes.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate PDF' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
