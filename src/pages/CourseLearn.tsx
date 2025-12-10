/**
 * Course Learning Experience Page
 * Comprehensive learning interface with video player, notes, quizzes, assignments, and discussions
 * Requirements: 4.2, 4.3, 4.4
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  MessageSquare, 
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { VideoPlayer } from '@/components/course/VideoPlayer';
import { LectureNotes } from '@/components/course/LectureNotes';
import { QuizInterface } from '@/components/course/QuizInterface';
import { AssignmentSubmission } from '@/components/course/AssignmentSubmission';
import { LectureDiscussion } from '@/components/course/LectureDiscussion';
import { CourseProgressSidebar } from '@/components/course/CourseProgressSidebar';

export default function CourseLearn() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('video');

  // Fetch course data with modules and lectures
  const { data: courseData, isLoading, error } = useQuery({
    queryKey: ['course-learning', courseId],
    queryFn: async () => {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules(
            *,
            learning_materials(*)
          )
        `)
        .eq('id', courseId!)
        .single();
      
      if (courseError) throw courseError;
      
      return course;
    },
    enabled: !!courseId
  });

  // Fetch enrollment data
  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId!)
        .eq('user_id', user!.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!courseId && !!user
  });

  // Get all lectures from all modules
  const allLectures = courseData?.course_modules
    ?.flatMap((module: any) => 
      module.learning_materials?.map((material: any) => ({
        ...material,
        moduleTitle: module.title,
        moduleId: module.id
      })) || []
    ) || [];

  const currentLecture = allLectures[currentLectureIndex];

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      const { error } = await supabase
        .from('enrollments')
        .update({ 
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollment?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', courseId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  // Mark lecture as complete
  const markLectureComplete = () => {
    const newProgress = Math.round(((currentLectureIndex + 1) / allLectures.length) * 100);
    updateProgressMutation.mutate(newProgress);
    toast.success('Lecture completed!', {
      description: `Your progress: ${newProgress}%`
    });
  };

  // Navigation handlers
  const goToPreviousLecture = () => {
    if (currentLectureIndex > 0) {
      setCurrentLectureIndex(currentLectureIndex - 1);
      setActiveTab('video');
    }
  };

  const goToNextLecture = () => {
    if (currentLectureIndex < allLectures.length - 1) {
      markLectureComplete();
      setCurrentLectureIndex(currentLectureIndex + 1);
      setActiveTab('video');
    } else {
      // Course completed
      updateProgressMutation.mutate(100);
      toast.success('🎉 Course Completed!', {
        description: 'Congratulations on completing this course!'
      });
    }
  };

  const handleLectureSelect = (index: number) => {
    setCurrentLectureIndex(index);
    setActiveTab('video');
  };

  if (isLoading) {
    return (
      <PageTemplate title="Loading..." description="">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTemplate>
    );
  }

  if (error || !courseData || !enrollment) {
    return (
      <PageTemplate title="Course Not Found" description="">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-4">
            {!enrollment ? 'You are not enrolled in this course' : 'Failed to load course'}
          </p>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course Details
          </Button>
        </div>
      </PageTemplate>
    );
  }

  if (!currentLecture) {
    return (
      <PageTemplate title={courseData.title} description="">
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg text-muted-foreground mb-4">
            No lectures available yet
          </p>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course Details
          </Button>
        </div>
      </PageTemplate>
    );
  }

  console.info('✝️ ScrollUniversity: Learning experience loaded — Christ is Lord over every lesson');

  return (
    <PageTemplate
      title={courseData.title}
      description={currentLecture.moduleTitle}
      actions={
        <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Lecture Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{currentLecture.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Module: {currentLecture.moduleTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {currentLectureIndex + 1} / {allLectures.length}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Learning Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="video" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Video</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Quiz</span>
              </TabsTrigger>
              <TabsTrigger value="assignment" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Assignment</span>
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Discussion</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="mt-6">
              <VideoPlayer
                videoUrl={currentLecture.url || ''}
                title={currentLecture.title}
                onComplete={markLectureComplete}
                lectureId={currentLecture.id}
                enrollmentId={enrollment.id}
              />
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <LectureNotes
                lectureId={currentLecture.id}
                title={currentLecture.title}
                content={currentLecture.content}
              />
            </TabsContent>

            <TabsContent value="quiz" className="mt-6">
              <QuizInterface
                lectureId={currentLecture.id}
                courseId={courseId!}
                onComplete={markLectureComplete}
              />
            </TabsContent>

            <TabsContent value="assignment" className="mt-6">
              <AssignmentSubmission
                lectureId={currentLecture.id}
                courseId={courseId!}
                userId={user!.id}
              />
            </TabsContent>

            <TabsContent value="discussion" className="mt-6">
              <LectureDiscussion
                lectureId={currentLecture.id}
                courseId={courseId!}
                userId={user!.id}
              />
            </TabsContent>
          </Tabs>

          {/* Navigation Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPreviousLecture}
                  disabled={currentLectureIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lecture
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Lecture {currentLectureIndex + 1} of {allLectures.length}
                  </p>
                  <Progress 
                    value={(currentLectureIndex / allLectures.length) * 100} 
                    className="w-32 h-2 mt-2"
                  />
                </div>

                <Button
                  onClick={goToNextLecture}
                  disabled={currentLectureIndex === allLectures.length - 1 && enrollment.progress === 100}
                >
                  {currentLectureIndex === allLectures.length - 1 ? 'Complete Course' : 'Next Lecture'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Course Progress */}
        <div className="lg:col-span-1">
          <CourseProgressSidebar
            modules={courseData.course_modules || []}
            currentLectureIndex={currentLectureIndex}
            allLectures={allLectures}
            progress={enrollment.progress}
            onLectureSelect={handleLectureSelect}
          />
        </div>
      </div>
    </PageTemplate>
  );
}
