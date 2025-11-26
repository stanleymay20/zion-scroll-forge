import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Save,
  Eye,
  BookOpen,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface LectureNotes {
  id?: string;
  lectureId: string;
  title: string;
  summary: string;
  keyConcepts: string[];
  examples: string[];
  practiceProblems: string[];
  realWorldApplications: string[];
  biblicalFoundation: string;
  reflectionQuestions: string[];
  supplementalResources: Resource[];
  citations: Citation[];
}

interface Resource {
  title: string;
  type: 'article' | 'book' | 'video' | 'website';
  url: string;
  description: string;
}

interface Citation {
  text: string;
  source: string;
  format: 'APA' | 'MLA' | 'Chicago';
  verified: boolean;
}

interface MaterialsEditorProps {
  lectureId: string;
  initialData?: Partial<LectureNotes>;
  onSave?: (notes: LectureNotes) => void;
  onCancel?: () => void;
}

export const MaterialsEditor: React.FC<MaterialsEditorProps> = ({
  lectureId,
  initialData,
  onSave,
  onCancel
}) => {
  const [notes, setNotes] = useState<LectureNotes>({
    lectureId,
    title: '',
    summary: '',
    keyConcepts: [''],
    examples: [''],
    practiceProblems: [''],
    realWorldApplications: [''],
    biblicalFoundation: '',
    reflectionQuestions: [''],
    supplementalResources: [],
    citations: [],
    ...initialData
  });

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    // Calculate word count
    const text = `${notes.summary} ${notes.keyConcepts.join(' ')} ${notes.examples.join(' ')}`;
    const words = text.trim().split(/\s+/).length;
    setWordCount(words);
  }, [notes]);

  const handleSave = async () => {
    // Validate
    const errors: string[]= [];
    if (!notes.title) errors.push('Title is required');
    if (!notes.summary || notes.summary.length < 100) {
      errors.push('Summary must be at least 100 words');
    }
    if (notes.keyConcepts.filter(k => k.trim()).length === 0) {
      errors.push('At least one key concept is required');
    }
    if (!notes.biblicalFoundation) {
      errors.push('Biblical foundation is required');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/course-content/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(notes)
      });

      if (!response.ok) throw new Error('Failed to save materials');

      const savedNotes = await response.json();
      onSave?.(savedNotes);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = async () => {
    try {
      const response = await fetch(`/api/course-content/materials/${notes.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${notes.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  const aiGenerateContent = async (section: string) => {
    setGenerating(true);
    try {
      const response = await fetch('/api/course-content/materials/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          lectureId,
          section,
          context: notes
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const { content } = await response.json();
      
      // Update appropriate section
      switch (section) {
        case 'summary':
          setNotes({ ...notes, summary: content });
          break;
        case 'examples':
          setNotes({ ...notes, examples: content.split('\n\n') });
          break;
        case 'practiceProblems':
          setNotes({ ...notes, practiceProblems: content.split('\n\n') });
          break;
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const addArrayItem = (field: keyof LectureNotes) => {
    const current = notes[field] as string[];
    setNotes({ ...notes, [field]: [...current, ''] });
  };

  const updateArrayItem = (field: keyof LectureNotes, index: number, value: string) => {
    const current = notes[field] as string[];
    const updated = [...current];
    updated[index] = value;
    setNotes({ ...notes, [field]: updated });
  };

  const removeArrayItem = (field: keyof LectureNotes, index: number) => {
    const current = notes[field] as string[];
    setNotes({ ...notes, [field]: current.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Written Materials Editor</CardTitle>
              <CardDescription>
                Create comprehensive lecture notes (10-20 pages) with elite academic standards
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button variant="outline" size="sm" onClick={generatePDF} disabled={!notes.id}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Word Count & Status */}
          <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex space-x-6">
              <div>
                <span className="text-sm text-gray-500">Word Count</span>
                <p className="text-lg font-medium">{wordCount}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Target Range</span>
                <p className="text-lg font-medium">2,500 - 5,000</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <div className="mt-1">
                  {wordCount >= 2500 && wordCount <= 5000 ? (
                    <Badge variant="default">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      On Target
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {wordCount < 2500 ? 'Too Short' : 'Too Long'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {previewMode ? (
            // Preview Mode
            <div className="prose max-w-none">
              <h1>{notes.title}</h1>
              <h2>Summary</h2>
              <p>{notes.summary}</p>
              
              <h2>Key Concepts</h2>
              <ul>
                {notes.keyConcepts.filter(k => k.trim()).map((concept, i) => (
                  <li key={i}>{concept}</li>
                ))}
              </ul>

              <h2>Examples</h2>
              {notes.examples.filter(e => e.trim()).map((example, i) => (
                <div key={i} className="mb-4">
                  <h3>Example {i + 1}</h3>
                  <p>{example}</p>
                </div>
              ))}

              <h2>Practice Problems</h2>
              {notes.practiceProblems.filter(p => p.trim()).map((problem, i) => (
                <div key={i} className="mb-4">
                  <h3>Problem {i + 1}</h3>
                  <p>{problem}</p>
                </div>
              ))}

              <h2>Real-World Applications</h2>
              {notes.realWorldApplications.filter(a => a.trim()).map((app, i) => (
                <div key={i} className="mb-4">
                  <p>{app}</p>
                </div>
              ))}

              <h2>Biblical Foundation</h2>
              <p>{notes.biblicalFoundation}</p>

              <h2>Reflection Questions</h2>
              <ol>
                {notes.reflectionQuestions.filter(q => q.trim()).map((question, i) => (
                  <li key={i}>{question}</li>
                ))}
              </ol>
            </div>
          ) : (
            // Edit Mode
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="spiritual">Spiritual</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="citations">Citations</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Lecture Title *</Label>
                  <Input
                    id="title"
                    value={notes.title}
                    onChange={(e) => setNotes({ ...notes, title: e.target.value })}
                    placeholder="Enter lecture title"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="summary">Summary * (100+ words)</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => aiGenerateContent('summary')}
                      disabled={generating}
                    >
                      AI Generate
                    </Button>
                  </div>
                  <Textarea
                    id="summary"
                    value={notes.summary}
                    onChange={(e) => setNotes({ ...notes, summary: e.target.value })}
                    placeholder="Provide a comprehensive summary of the lecture content..."
                    rows={8}
                  />
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                {/* Key Concepts */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Key Concepts *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('keyConcepts')}
                    >
                      Add Concept
                    </Button>
                  </div>
                  {notes.keyConcepts.map((concept, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={concept}
                        onChange={(e) => updateArrayItem('keyConcepts', index, e.target.value)}
                        placeholder={`Key concept ${index + 1}`}
                      />
                      {notes.keyConcepts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('keyConcepts', index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Examples */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Examples</Label>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => aiGenerateContent('examples')}
                        disabled={generating}
                      >
                        AI Generate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('examples')}
                      >
                        Add Example
                      </Button>
                    </div>
                  </div>
                  {notes.examples.map((example, index) => (
                    <div key={index} className="space-y-2">
                      <Textarea
                        value={example}
                        onChange={(e) => updateArrayItem('examples', index, e.target.value)}
                        placeholder={`Example ${index + 1}`}
                        rows={3}
                      />
                      {notes.examples.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('examples', index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Practice Problems */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Practice Problems</Label>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => aiGenerateContent('practiceProblems')}
                        disabled={generating}
                      >
                        AI Generate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem('practiceProblems')}
                      >
                        Add Problem
                      </Button>
                    </div>
                  </div>
                  {notes.practiceProblems.map((problem, index) => (
                    <div key={index} className="space-y-2">
                      <Textarea
                        value={problem}
                        onChange={(e) => updateArrayItem('practiceProblems', index, e.target.value)}
                        placeholder={`Practice problem ${index + 1}`}
                        rows={3}
                      />
                      {notes.practiceProblems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('practiceProblems', index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Real-World Applications */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Real-World Applications *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('realWorldApplications')}
                    >
                      Add Application
                    </Button>
                  </div>
                  {notes.realWorldApplications.map((app, index) => (
                    <div key={index} className="space-y-2">
                      <Textarea
                        value={app}
                        onChange={(e) => updateArrayItem('realWorldApplications', index, e.target.value)}
                        placeholder={`Real-world application ${index + 1}`}
                        rows={3}
                      />
                      {notes.realWorldApplications.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('realWorldApplications', index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="spiritual" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="biblical">Biblical Foundation *</Label>
                  <Textarea
                    id="biblical"
                    value={notes.biblicalFoundation}
                    onChange={(e) => setNotes({ ...notes, biblicalFoundation: e.target.value })}
                    placeholder="Provide biblical foundation with scripture references..."
                    rows={6}
                  />
                  <p className="text-sm text-gray-500">
                    Include relevant scripture passages and explain how they relate to the course content
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Reflection Questions *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem('reflectionQuestions')}
                    >
                      Add Question
                    </Button>
                  </div>
                  {notes.reflectionQuestions.map((question, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={question}
                        onChange={(e) => updateArrayItem('reflectionQuestions', index, e.target.value)}
                        placeholder={`Reflection question ${index + 1}`}
                      />
                      {notes.reflectionQuestions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('reflectionQuestions', index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Supplemental Resources</Label>
                  <Button variant="outline" size="sm">
                    Add Resource
                  </Button>
                </div>
                {notes.supplementalResources.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No supplemental resources added yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notes.supplementalResources.map((resource, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-gray-500">{resource.type}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="citations" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Citations</Label>
                  <Button variant="outline" size="sm">
                    Add Citation
                  </Button>
                </div>
                {notes.citations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No citations added yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notes.citations.map((citation, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm">{citation.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{citation.source}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={citation.verified ? 'default' : 'secondary'}>
                              {citation.format}
                            </Badge>
                            {citation.verified && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded p-4">
              <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
              <ul className="list-disc list-inside text-red-700 text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Materials
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialsEditor;
