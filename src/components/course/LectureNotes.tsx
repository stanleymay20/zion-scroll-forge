/**
 * Lecture Notes Component
 * Displays lecture notes with downloadable PDF functionality using proper PDF generation
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface LectureNotesProps {
  lectureId: string;
  title: string;
  content: any;
}

export function LectureNotes({ lectureId, title, content }: LectureNotesProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Convert content to plain text for PDF
  const getPlainTextContent = (): string => {
    if (typeof content === 'string') {
      // Remove markdown formatting for cleaner PDF
      return content
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic
        .replace(/`([^`]+)`/g, '$1') // Remove inline code
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links, keep text
    }

    // Build structured text from content object
    let text = `${title}\n${'='.repeat(title.length)}\n\n`;

    if (content?.key_concepts) {
      text += 'KEY CONCEPTS\n' + '-'.repeat(12) + '\n';
      content.key_concepts.forEach((concept: string, i: number) => {
        text += `${i + 1}. ${concept}\n`;
      });
      text += '\n';
    }

    if (content?.sections) {
      content.sections.forEach((section: any) => {
        text += `\n${section.title}\n${'-'.repeat(section.title.length)}\n`;
        text += `${section.content}\n`;
        
        if (section.examples) {
          text += '\nExamples:\n';
          section.examples.forEach((ex: string, i: number) => {
            text += `  ${i + 1}. ${ex}\n`;
          });
        }
      });
    }

    if (content?.scripture_references) {
      text += '\n\nSCRIPTURE REFERENCES\n' + '-'.repeat(20) + '\n';
      content.scripture_references.forEach((ref: any) => {
        text += `${ref.reference}: ${ref.text}\n`;
      });
    }

    if (content?.summary) {
      text += '\n\nSUMMARY\n' + '-'.repeat(7) + '\n';
      text += content.summary + '\n';
    }

    if (content?.study_questions) {
      text += '\n\nSTUDY QUESTIONS\n' + '-'.repeat(15) + '\n';
      content.study_questions.forEach((q: string, i: number) => {
        text += `${i + 1}. ${q}\n`;
      });
    }

    if (content?.notes || content?.description) {
      text += content.notes || content.description;
    }

    text += '\n\n---\nScrollUniversity - Christ is Lord over every scroll\n';
    text += `Generated on ${new Date().toLocaleDateString()}\n`;

    return text;
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      toast.info('Generating PDF...', {
        description: 'Please wait while we prepare your download'
      });

      const plainContent = getPlainTextContent();
      
      // Call edge function to generate proper PDF
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: {
          title: title,
          content: plainContent,
          author: 'ScrollUniversity',
          type: 'lecture_notes'
        }
      });

      if (error) throw error;

      if (!data?.pdf) {
        throw new Error('No PDF data received');
      }

      // Convert base64 to blob
      const binaryString = atob(data.pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename || `${title.replace(/\s+/g, '_')}_notes.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF Downloaded', {
        description: 'Lecture notes have been downloaded. Open with Adobe Reader or any PDF viewer.'
      });
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Download Failed', {
        description: 'Unable to generate PDF. Please try again later.'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Parse content for display
  const notesContent = typeof content === 'string' 
    ? content 
    : content?.notes || content?.description || '';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lecture Notes
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {/* Lecture Title */}
          <h2 className="text-2xl font-bold mb-4">{title}</h2>

          {/* Notes Content */}
          <div className="space-y-4">
            {typeof content === 'string' ? (
              <div className="whitespace-pre-wrap">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-4">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-4">{children}</ol>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic my-4 bg-muted/30 py-2">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <>
                {/* Key Concepts */}
                {content?.key_concepts && (
                  <div className="bg-primary/5 border-l-4 border-primary p-4 rounded">
                    <h3 className="font-semibold text-lg mb-2">Key Concepts</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {content.key_concepts.map((concept: string, index: number) => (
                        <li key={index}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Main Content */}
                {content?.sections && content.sections.map((section: any, index: number) => (
                  <div key={index} className="mb-6">
                    <h3 className="font-semibold text-xl mb-2">{section.title}</h3>
                    <p className="text-muted-foreground">{section.content}</p>
                    
                    {section.examples && (
                      <div className="mt-3 bg-muted/50 p-3 rounded">
                        <h4 className="font-medium mb-2">Examples:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {section.examples.map((example: string, exIndex: number) => (
                            <li key={exIndex}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                {/* Scripture References */}
                {content?.scripture_references && (
                  <div className="bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 p-4 rounded">
                    <h3 className="font-semibold text-lg mb-2">📖 Scripture References</h3>
                    <ul className="space-y-2">
                      {content.scripture_references.map((ref: any, index: number) => (
                        <li key={index}>
                          <span className="font-medium">{ref.reference}:</span>{' '}
                          <span className="text-muted-foreground">{ref.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Summary */}
                {content?.summary && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded">
                    <h3 className="font-semibold text-lg mb-2">Summary</h3>
                    <p>{content.summary}</p>
                  </div>
                )}

                {/* Additional Resources */}
                {content?.resources && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Additional Resources</h3>
                    <ul className="space-y-2">
                      {content.resources.map((resource: any, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {resource.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Study Questions */}
                {content?.study_questions && (
                  <div className="mt-6 bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded">
                    <h3 className="font-semibold text-lg mb-2">Study Questions</h3>
                    <ol className="list-decimal list-inside space-y-2">
                      {content.study_questions.map((question: string, index: number) => (
                        <li key={index} className="text-muted-foreground">{question}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Fallback for simple notes */}
                {notesContent && !content?.sections && (
                  <div className="whitespace-pre-wrap">
                    <ReactMarkdown>{notesContent}</ReactMarkdown>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
            <p>✝️ ScrollUniversity - Christ is Lord over every scroll</p>
            <p className="mt-1">© {new Date().getFullYear()} ScrollUniversity. All rights reserved.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
