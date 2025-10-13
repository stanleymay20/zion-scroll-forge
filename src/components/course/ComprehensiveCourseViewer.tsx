import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Pause, BookOpen, FileText, MessageSquare, 
  CheckCircle, Lock, Clock, Star, Users, Trophy,
  ArrowLeft, ArrowRight, Download, Heart, Share2,
  Loader2, AlertCircle, Lightbulb, Pray
} from 'lucide-react';
import { getCourseDetail, getModuleContent, trackProgress } from '@/services/courses';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { CourseModule, Lecture, Assessment, Assignment } from '@/types/course';

/**
 * Comprehensive Course Viewer Component
 * Implements complete course learning experience with:
 * - Video lectures with spiritual integration
 * - Comprehensive notes and resources
 * - Interactive assessments
 * - Practical assignments
 * - Discussion forums
 * - Progress tracking
 * - Spiritual formation elements
 */
export function ComprehensiveCourseViewer() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fetch course details
  const { data: courseData, isLoading } = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: () => getCourseDetail(courseId!, user?.id),
    enabled: !!courseId && !!user?.id
  });

  // Fetch current module content
  const { data: moduleContent } = useQuery({
    queryKey: ['module-content', courseData?.modules[currentModuleIndex]?.id],
    queryFn: () => getModuleContent(courseData?.modules[currentModuleIndex]?.id!, user?.id),
    enabled: !!courseData?.modules[currentModuleIndex]?.id && !!user?.id
  });

  // Track progress mutation
  const trackProgressMutation = useMutation({
    mutationFn: (params: {
      moduleId?: string;
      lectureId?: string;
      progressType: 'lecture_viewed' | 'assessment_completed' | 'assignment_submitted';
      timeSpent?: number;
      spiritualNotes?: string;
    }) => trackProgress(
      user!.id,
      courseId!,
      params.moduleId,
      params.lectureId,
      params.progressType,
      params.timeSpent,
      params.spiritualNotes
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-detail', courseId] });
      toast.success('Progress saved successfully');
    }
  });

  const currentModule = courseData?.modules[currentModuleIndex];
  const currentLecture = moduleContent?.lectures[currentLectureIndex];

  // Handle lecture completion
  const handleLectureComplete = () => {
    if (currentLecture && currentModule) {
      trackProgressMutation.mutate({
        moduleId: currentModule.id,
        lectureId: currentLecture.id,
        progressType: 'lecture_viewed',
        timeSpent: Math.round(duration)
      });
    }
  };

  // Navigation functions
  const goToNextLecture = () => {
    if (moduleContent && currentLectureIndex < moduleContent.lectures.length - 1) {
      setCurrentLectureIndex(currentLectureIndex + 1);
    } else if (courseData && currentModuleIndex < courseData.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLectureIndex(0);
    }
  };

  const goToPreviousLecture = () => {
    if (currentLectureIndex > 0) {
      setCurrentLectureIndex(currentLectureIndex - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      // Set to last lecture of previous module
      const prevModuleIndex = currentModuleIndex - 1;
      const prevModule = courseData?.modules[prevModuleIndex];
      if (prevModule) {
        // We'll need to fetch the previous module content to know the lecture count
        setCurrentLectureIndex(0); // Simplified for now
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Course not found</p>
          <Button onClick={() => navigate('/courses')} className="mt-4">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{courseData.course.title}</h1>
                <p className="text-muted-foreground">{courseData.course.faculty}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{courseData.course.level}</Badge>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{courseData.course.rating}</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          {courseData.enrollment && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Course Progress</span>
                <span>{courseData.enrollment.progress}%</span>
              </div>
              <Progress value={courseData.enrollment.progress} className="h-2" />
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            {currentLecture && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-black rounded-t-lg relative">
                    {currentLecture.video_url ? (
                      <video
                        className="w-full h-full rounded-t-lg"
                        controls
                        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                        onEnded={handleLectureComplete}
                      >
                        <source src={currentLecture.video_url} type="video/mp4" />
                        {currentLecture.closed_captions_url && (
                          <track
                            kind="captions"
                            src={currentLecture.closed_captions_url}
                            srcLang="en"
                            label="English"
                            default
                          />
                        )}
                      </video>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-white">
                          <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>Video content coming soon</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold">{currentLecture.title}</h2>
                        <p className="text-muted-foreground">{currentLecture.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4 mr-2" />
                          Like
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Spiritual Elements */}
                    {currentLecture.spiritual_elements && (
                      <div className="bg-primary/5 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Pray className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-primary">Spiritual Focus</h3>
                        </div>
                        <p className="text-sm">{currentLecture.spiritual_elements.ministry_application}</p>
                        {currentLecture.spiritual_elements.character_focus.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Character Development:</p>
                            <div className="flex flex-wrap gap-1">
                              {currentLecture.spiritual_elements.character_focus.map((focus, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {focus}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        onClick={goToPreviousLecture}
                        disabled={currentModuleIndex === 0 && currentLectureIndex === 0}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button onClick={goToNextLecture}>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content Tabs */}
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="notes">
                  <FileText className="h-4 w-4 mr-2" />
                  Notes
                </TabsTrigger>
                <TabsTrigger value="assessments">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Assessments
                </TabsTrigger>
                <TabsTrigger value="assignments">
                  <Trophy className="h-4 w-4 mr-2" />
                  Assignments
                </TabsTrigger>
                <TabsTrigger value="discussion">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussion
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notes" className="space-y-4">
                {currentLecture?.notes?.map((note) => (
                  <Card key={note.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{note.title}</CardTitle>
                        {note.downloadable_pdf_url && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: note.content }} />
                      </div>
                      
                      {note.study_questions.length > 0 && (
                        <div className="mt-6 p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold mb-3 flex items-center">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Study Questions
                          </h4>
                          <ul className="space-y-2">
                            {note.study_questions.map((question, index) => (
                              <li key={index} className="text-sm">
                                {index + 1}. {question}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {note.reflection_prompts.length > 0 && (
                        <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                          <h4 className="font-semibold mb-3 flex items-center text-primary">
                            <Heart className="h-4 w-4 mr-2" />
                            Reflection Prompts
                          </h4>
                          <ul className="space-y-2">
                            {note.reflection_prompts.map((prompt, index) => (
                              <li key={index} className="text-sm">
                                • {prompt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="assessments" className="space-y-4">
                {moduleContent?.assessments.map((assessment) => (
                  <AssessmentCard key={assessment.id} assessment={assessment} />
                ))}
              </TabsContent>

              <TabsContent value="assignments" className="space-y-4">
                {moduleContent?.assignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </TabsContent>

              <TabsContent value="discussion" className="space-y-4">
                {moduleContent?.forums.map((forum) => (
                  <DiscussionForumCard key={forum.id} forum={forum} />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Modules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {courseData.modules.map((module, moduleIndex) => (
                      <div key={module.id} className="space-y-1">
                        <Button
                          variant={moduleIndex === currentModuleIndex ? "default" : "ghost"}
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => {
                            setCurrentModuleIndex(moduleIndex);
                            setCurrentLectureIndex(0);
                          }}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{module.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {module.estimated_duration} minutes
                            </p>
                          </div>
                          {moduleIndex === currentModuleIndex && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                        
                        {moduleIndex === currentModuleIndex && moduleContent && (
                          <div className="ml-4 space-y-1">
                            {moduleContent.lectures.map((lecture, lectureIndex) => (
                              <Button
                                key={lecture.id}
                                variant={lectureIndex === currentLectureIndex ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start text-left"
                                onClick={() => setCurrentLectureIndex(lectureIndex)}
                              >
                                <Play className="h-3 w-3 mr-2" />
                                <span className="text-xs">{lecture.title}</span>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Course Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {moduleContent?.resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">{resource.resource_type}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function AssessmentCard({ assessment }: { assessment: Assessment }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {assessment.title}
          <Badge variant="outline">{assessment.assessment_type}</Badge>
        </CardTitle>
        <CardDescription>{assessment.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1" />
            {assessment.time_limit} minutes
          </div>
          <div className="text-sm text-muted-foreground">
            {assessment.max_score} points
          </div>
        </div>
        <Button className="w-full">
          Start Assessment
        </Button>
      </CardContent>
    </Card>
  );
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {assignment.title}
          <Badge variant="outline">{assignment.assignment_type}</Badge>
        </CardTitle>
        <CardDescription>{assignment.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm">
            <h4 className="font-medium mb-2">Deliverables:</h4>
            <ul className="space-y-1">
              {assignment.deliverables.map((deliverable, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>{deliverable.name}</span>
                </li>
              ))}
            </ul>
          </div>
          {assignment.due_date && (
            <div className="text-sm text-muted-foreground">
              Due: {new Date(assignment.due_date).toLocaleDateString()}
            </div>
          )}
          <Button className="w-full">
            Start Assignment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DiscussionForumCard({ forum }: { forum: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {forum.title}
          <Badge variant="outline">{forum.forum_type}</Badge>
        </CardTitle>
        <CardDescription>{forum.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 inline mr-1" />
            {forum.posts?.length || 0} posts
          </div>
          <div className="text-sm text-muted-foreground">
            {forum.moderated && "Moderated"}
          </div>
        </div>
        <Button className="w-full" variant="outline">
          Join Discussion
        </Button>
      </CardContent>
    </Card>
  );
}