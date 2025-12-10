/**
 * Content Creation Studio Component
 * AI-assisted content generation for lectures, assessments, and materials
 * Requirements: 3.3
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { facultyDashboardService } from '@/services/facultyDashboardService';
import type { LecturePlan, Assessment } from '@/types/faculty-dashboard';
import { FileText, ClipboardList, BookOpen, Sparkles, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ContentCreationStudio() {
  const [activeTab, setActiveTab] = useState('lecture-plan');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<LecturePlan | Assessment | string | null>(null);
  const { toast } = useToast();

  // Lecture Plan Form State
  const [lecturePlanForm, setLecturePlanForm] = useState({
    courseId: '',
    moduleId: '',
    moduleTitle: '',
    learningObjectives: '',
    targetAudience: '',
    duration: 60,
    courseContext: '',
    spiritualFocus: ''
  });

  // Assessment Form State
  const [assessmentForm, setAssessmentForm] = useState({
    courseId: '',
    moduleId: '',
    assessmentType: 'quiz' as 'quiz' | 'exam' | 'assignment' | 'project' | 'discussion',
    topics: '',
    learningObjectives: '',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    numberOfQuestions: 10,
    timeLimit: 60,
    includeSpiritual: true
  });

  // Materials Form State
  const [materialsForm, setMaterialsForm] = useState({
    courseId: '',
    moduleId: '',
    materialType: 'slides' as 'slides' | 'handout' | 'activity' | 'guide'
  });

  const handleGenerateLecturePlan = async () => {
    if (!lecturePlanForm.moduleTitle || !lecturePlanForm.learningObjectives) {
      toast({
        title: 'Missing Information',
        description: 'Please provide module title and learning objectives',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);
    try {
      const result = await facultyDashboardService.generateLecturePlan({
        ...lecturePlanForm,
        learningObjectives: lecturePlanForm.learningObjectives.split('\n').filter(obj => obj.trim())
      });

      if (result.success && result.data) {
        setGeneratedContent(result.data);
        toast({
          title: 'Success',
          description: 'Lecture plan generated successfully'
        });
      } else {
        throw new Error(result.error || 'Failed to generate lecture plan');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate lecture plan',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAssessment = async () => {
    if (!assessmentForm.topics || !assessmentForm.learningObjectives) {
      toast({
        title: 'Missing Information',
        description: 'Please provide topics and learning objectives',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);
    try {
      const result = await facultyDashboardService.generateAssessment({
        ...assessmentForm,
        topics: assessmentForm.topics.split(',').map(t => t.trim()).filter(t => t),
        learningObjectives: assessmentForm.learningObjectives.split('\n').filter(obj => obj.trim())
      });

      if (result.success && result.data) {
        setGeneratedContent(result.data);
        toast({
          title: 'Success',
          description: 'Assessment generated successfully'
        });
      } else {
        throw new Error(result.error || 'Failed to generate assessment');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate assessment',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateMaterials = async () => {
    if (!materialsForm.courseId || !materialsForm.moduleId) {
      toast({
        title: 'Missing Information',
        description: 'Please provide course and module IDs',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);
    try {
      const result = await facultyDashboardService.generateTeachingMaterials(
        materialsForm.courseId,
        materialsForm.moduleId,
        materialsForm.materialType
      );

      if (result.success && result.data) {
        setGeneratedContent(result.data);
        toast({
          title: 'Success',
          description: 'Teaching materials generated successfully'
        });
      } else {
        throw new Error(result.error || 'Failed to generate materials');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate materials',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      const text = typeof generatedContent === 'string' 
        ? generatedContent 
        : JSON.stringify(generatedContent, null, 2);
      navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: 'Content copied to clipboard'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          Generate high-quality educational content with AI assistance. All content includes spiritual formation elements.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lecture-plan">
            <FileText className="h-4 w-4 mr-2" />
            Lecture Plans
          </TabsTrigger>
          <TabsTrigger value="assessment">
            <ClipboardList className="h-4 w-4 mr-2" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="materials">
            <BookOpen className="h-4 w-4 mr-2" />
            Materials
          </TabsTrigger>
        </TabsList>

        {/* Lecture Plan Tab */}
        <TabsContent value="lecture-plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Lecture Plan</CardTitle>
              <CardDescription>
                Create a comprehensive lecture plan with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="moduleTitle">Module Title *</Label>
                  <Input
                    id="moduleTitle"
                    value={lecturePlanForm.moduleTitle}
                    onChange={(e) => setLecturePlanForm({ ...lecturePlanForm, moduleTitle: e.target.value })}
                    placeholder="Introduction to Biblical Hermeneutics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={lecturePlanForm.targetAudience}
                    onChange={(e) => setLecturePlanForm({ ...lecturePlanForm, targetAudience: e.target.value })}
                    placeholder="Undergraduate theology students"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningObjectives">Learning Objectives * (one per line)</Label>
                <Textarea
                  id="learningObjectives"
                  value={lecturePlanForm.learningObjectives}
                  onChange={(e) => setLecturePlanForm({ ...lecturePlanForm, learningObjectives: e.target.value })}
                  placeholder="Students will be able to...&#10;- Explain the principles of biblical interpretation&#10;- Apply hermeneutical methods to scripture passages"
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={lecturePlanForm.duration}
                    onChange={(e) => setLecturePlanForm({ ...lecturePlanForm, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spiritualFocus">Spiritual Focus</Label>
                  <Input
                    id="spiritualFocus"
                    value={lecturePlanForm.spiritualFocus}
                    onChange={(e) => setLecturePlanForm({ ...lecturePlanForm, spiritualFocus: e.target.value })}
                    placeholder="Understanding God's Word"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseContext">Course Context</Label>
                <Textarea
                  id="courseContext"
                  value={lecturePlanForm.courseContext}
                  onChange={(e) => setLecturePlanForm({ ...lecturePlanForm, courseContext: e.target.value })}
                  placeholder="This module is part of a foundational theology course..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleGenerateLecturePlan} 
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Lecture Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Assessment</CardTitle>
              <CardDescription>
                Create quizzes, exams, and assignments with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="assessmentType">Assessment Type</Label>
                  <Select
                    value={assessmentForm.assessmentType}
                    onValueChange={(value: any) => setAssessmentForm({ ...assessmentForm, assessmentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={assessmentForm.difficulty}
                    onValueChange={(value: any) => setAssessmentForm({ ...assessmentForm, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topics">Topics * (comma-separated)</Label>
                <Input
                  id="topics"
                  value={assessmentForm.topics}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, topics: e.target.value })}
                  placeholder="Biblical interpretation, Hermeneutical principles, Exegesis"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessmentObjectives">Learning Objectives * (one per line)</Label>
                <Textarea
                  id="assessmentObjectives"
                  value={assessmentForm.learningObjectives}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, learningObjectives: e.target.value })}
                  placeholder="Students will demonstrate...&#10;- Understanding of hermeneutical principles&#10;- Ability to apply exegetical methods"
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="numberOfQuestions">Number of Questions</Label>
                  <Input
                    id="numberOfQuestions"
                    type="number"
                    value={assessmentForm.numberOfQuestions}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, numberOfQuestions: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={assessmentForm.timeLimit}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, timeLimit: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerateAssessment} 
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Assessment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Teaching Materials</CardTitle>
              <CardDescription>
                Create slides, handouts, activities, and guides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="materialCourseId">Course ID</Label>
                  <Input
                    id="materialCourseId"
                    value={materialsForm.courseId}
                    onChange={(e) => setMaterialsForm({ ...materialsForm, courseId: e.target.value })}
                    placeholder="THEO-101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materialModuleId">Module ID</Label>
                  <Input
                    id="materialModuleId"
                    value={materialsForm.moduleId}
                    onChange={(e) => setMaterialsForm({ ...materialsForm, moduleId: e.target.value })}
                    placeholder="module-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="materialType">Material Type</Label>
                <Select
                  value={materialsForm.materialType}
                  onValueChange={(value: any) => setMaterialsForm({ ...materialsForm, materialType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slides">Presentation Slides</SelectItem>
                    <SelectItem value="handout">Student Handout</SelectItem>
                    <SelectItem value="activity">Class Activity</SelectItem>
                    <SelectItem value="guide">Study Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateMaterials} 
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Materials
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Content Display */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  Review and use the AI-generated content
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyContent}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {typeof generatedContent === 'string' 
                  ? generatedContent 
                  : JSON.stringify(generatedContent, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
