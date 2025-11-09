import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, ArrowRight, CheckCircle2, PlayCircle, FileText,
  BookOpen, Trophy, Loader2, AlertCircle, MessageSquare, Download, Award
} from 'lucide-react';
import { getCourseDetail } from '@/services/courses';
import { useAuth } from '@/contexts/AuthContext';
import { useCourseProgress, useCompleteModule } from '@/hooks/useCourseProgress';
import { toast } from 'sonner';
import { ModuleNotes } from '@/components/course/ModuleNotes';
import { supabase } from '@/integrations/supabase/client';

export default function CourseLearn() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const { data: courseData, isLoading } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: async () => await getCourseDetail(courseId!, user?.id),
    enabled: !!courseId && !!user?.id
  });

  const { data: progressData } = useCourseProgress(courseId!);
  const completeModuleMutation = useCompleteModule(courseId!);

  useEffect(() => {
    // Reset quiz when changing modules
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  }, [currentModuleIndex]);

  if (isLoading) {
    return (
      <PageTemplate title="Loading..." description="">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTemplate>
    );
  }

  if (!courseData) {
    return (
      <PageTemplate title="Course Not Found" description="">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-4">Course not found or you're not enrolled</p>
          <Button onClick={() => navigate('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </PageTemplate>
    );
  }

  const { course, modules } = courseData;
  const currentModule = modules[currentModuleIndex];
  const isLastModule = currentModuleIndex === modules.length - 1;
  const isFirstModule = currentModuleIndex === 0;

  const handleNextModule = () => {
    if (!isLastModule) {
      setCurrentModuleIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousModule = () => {
    if (!isFirstModule) {
      setCurrentModuleIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuizSubmit = async () => {
    const quiz = currentModule.quiz_data;
    if (!quiz || !Array.isArray(quiz) || quiz.length === 0) return;

    let correct = 0;
    quiz.forEach((q: any, index: number) => {
      if (quizAnswers[`q${index}`] === q.correct) {
        correct++;
      }
    });

    const score = Math.round((correct / quiz.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= 70) {
      toast.success(`Great job! You scored ${score}%`, {
        description: 'Module quiz passed!'
      });
    } else {
      toast.error(`Score: ${score}%`, {
        description: 'You need 70% to pass. Try again!'
      });
    }
  };

  const handleCompleteModule = async () => {
    await completeModuleMutation.mutateAsync({
      moduleId: currentModule.id,
      quizScore: quizScore || undefined
    });

    if (!isLastModule) {
      setTimeout(handleNextModule, 1000);
    } else {
      toast.success('🎉 Course Completed!', {
        description: 'Generating your certificate...'
      });
      // Generate certificate
      await checkAndGenerateCertificate();
    }
  };

  const checkAndGenerateCertificate = async () => {
    if (!user || !courseId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { courseId, userId: user.id },
      });
      
      if (error) throw error;
      
      if (data?.html) {
        // Open certificate in new window
        const win = window.open();
        if (win) {
          win.document.write(data.html);
          toast.success('Certificate generated!', {
            description: 'Your certificate has been opened in a new window.'
          });
        }
      }
      
      setTimeout(() => navigate(`/courses/${courseId}`), 2000);
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Certificate generation failed', {
        description: 'Your progress has been saved.'
      });
    }
  };

  const canCompleteModule = () => {
    if (!currentModule.quiz_data || !Array.isArray(currentModule.quiz_data) || currentModule.quiz_data.length === 0) return true;
    return quizSubmitted && quizScore !== null && quizScore >= 70;
  };

  return (
    <PageTemplate
      title={course.title}
      description="Course Learning"
      actions={
        <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Course Overview
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Module List */}
        <div className="lg:col-span-1">
          <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Modules</CardTitle>
                <CardDescription>
                  Progress: {Math.round(progressData?.progress ?? 0)}%
                </CardDescription>
                <Progress value={progressData?.progress ?? 0} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {modules.map((module, index) => (
                  <button
                    key={module.id}
                    onClick={() => setCurrentModuleIndex(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      currentModuleIndex === index
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card hover:bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {index < currentModuleIndex ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{module.title}</p>
                        <p className="text-xs opacity-70">Module {index + 1}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2">
                    Module {currentModuleIndex + 1} of {modules.length}
                  </Badge>
                  <CardTitle className="text-2xl">{currentModule.title}</CardTitle>
                  {currentModule.content?.summary && (
                    <CardDescription className="mt-2">
                      {currentModule.content.summary}
                    </CardDescription>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`/ai-tutors/${course.faculty}?context=${encodeURIComponent(currentModule.title)}`)
                  }
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask AI Tutor
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="lecture" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lecture">
                <PlayCircle className="h-4 w-4 mr-2" />
                Lecture
              </TabsTrigger>
              <TabsTrigger value="materials">
                <FileText className="h-4 w-4 mr-2" />
                Materials
              </TabsTrigger>
              <TabsTrigger value="quiz">
                <Trophy className="h-4 w-4 mr-2" />
                Quiz
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lecture" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Module Content</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  {currentModule.content_md ? (
                    <ReactMarkdown>{currentModule.content_md}</ReactMarkdown>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        Module content coming soon
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {currentModule.content?.learning_objectives && (
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Objectives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentModule.content.learning_objectives.map((objective: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="materials">
              <Card>
                <CardHeader>
                  <CardTitle>Course Materials</CardTitle>
                  <CardDescription>Downloadable resources and reading materials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentModule.material_url ? (
                    <div className="border rounded-lg p-6 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <FileText className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{currentModule.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Complete module workbook • PDF Format
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {currentModule.duration_minutes || 45} minutes reading time
                            </p>
                          </div>
                        </div>
                        <Button asChild size="lg">
                          <a
                            href={currentModule.material_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        No additional materials for this module
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Focus on the module content and complete the quiz
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz">
              <Card>
                <CardHeader>
                  <CardTitle>Module Quiz</CardTitle>
                  <CardDescription>
                    Complete this quiz with 70% or higher to progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentModule.quiz_data && Array.isArray(currentModule.quiz_data) && currentModule.quiz_data.length > 0 ? (
                    <div className="space-y-6">
                      {currentModule.quiz_data.map((question: any, qIndex: number) => (
                        <div key={qIndex} className="space-y-3 pb-4 border-b last:border-0">
                          <p className="font-medium">
                            {qIndex + 1}. {question.question}
                          </p>
                          <RadioGroup
                            value={quizAnswers[`q${qIndex}`]}
                            onValueChange={(value) =>
                              setQuizAnswers({ ...quizAnswers, [`q${qIndex}`]: value })
                            }
                            disabled={quizSubmitted}
                          >
                            {question.options.map((option: string, oIndex: number) => (
                              <div key={oIndex} className="flex items-center space-x-2">
                                <RadioGroupItem value={String(oIndex)} id={`q${qIndex}-${oIndex}`} />
                                <Label
                                  htmlFor={`q${qIndex}-${oIndex}`}
                                  className={`cursor-pointer ${
                                    quizSubmitted && String(oIndex) === question.correct
                                      ? 'text-green-600 font-medium'
                                      : quizSubmitted && quizAnswers[`q${qIndex}`] === String(oIndex)
                                      ? 'text-red-600'
                                      : ''
                                  }`}
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          {quizSubmitted && question.explanation && (
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          )}
                        </div>
                      ))}

                      {quizSubmitted && quizScore !== null && (
                        <div
                          className={`p-4 rounded-lg ${
                            quizScore >= 70 ? 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100' : 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100'
                          }`}
                        >
                          <p className="font-semibold">
                            Your Score: {quizScore}%
                          </p>
                          <p className="text-sm mt-1">
                            {quizScore >= 70
                              ? '🎉 Passed! You can now complete this module.'
                              : 'You need 70% to pass. Review the materials and try again.'}
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        {!quizSubmitted ? (
                          <Button
                            onClick={handleQuizSubmit}
                            disabled={
                              Object.keys(quizAnswers).length <
                              currentModule.quiz_data.length
                            }
                          >
                            Submit Quiz
                          </Button>
                        ) : quizScore !== null && quizScore < 70 ? (
                          <Button
                            onClick={() => {
                              setQuizAnswers({});
                              setQuizSubmitted(false);
                              setQuizScore(null);
                            }}
                          >
                            Retry Quiz
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No quiz for this module</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        You can proceed to the next module
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Student Notes */}
          <ModuleNotes moduleId={currentModule.id} userId={user?.id} />

          {/* Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousModule}
                  disabled={isFirstModule}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Module
                </Button>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleCompleteModule}
                    disabled={!canCompleteModule() || completeModuleMutation.isPending}
                  >
                    {completeModuleMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Complete Module
                  </Button>

                  {!isLastModule && (
                    <Button variant="outline" onClick={handleNextModule}>
                      Next Module
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
