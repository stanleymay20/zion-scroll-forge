/**
 * CourseLearningPage - Complete course learning experience
 * Combines curriculum browsing with rich module content display
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  BookOpen, 
  List, 
  Loader2, 
  AlertCircle,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { ModuleLearningContent } from '@/components/learning/ModuleLearningContent';
import { CourseCurriculumBrowser } from '@/components/learning/CourseCurriculumBrowser';
import { AITutorAvatar } from '@/components/AITutorAvatar';

export default function CourseLearningPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'learn' | 'curriculum' | 'tutor'>('learn');
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);

  // Fetch course with modules
  const { data: courseData, isLoading, error } = useQuery({
    queryKey: ['course-learning-full', courseId],
    queryFn: async () => {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules (*)
        `)
        .eq('id', courseId!)
        .single();
      
      if (courseError) throw courseError;
      return course;
    },
    enabled: !!courseId
  });

  // Fetch enrollment
  const { data: enrollment } = useQuery({
    queryKey: ['enrollment-learning', courseId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId!)
        .eq('user_id', user!.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!courseId && !!user
  });

  // Fetch module completions - using RPC or direct query with type assertion
  const { data: moduleCompletions = [] } = useQuery({
    queryKey: ['module-completions', courseId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_completions' as any)
        .select('module_id')
        .eq('user_id', user!.id);
      
      if (error) return [];
      return (data as any[])?.map(mc => mc.module_id) || [];
    },
    enabled: !!user
  });

  // Fetch AI tutor for this faculty
  const { data: aiTutor } = useQuery({
    queryKey: ['ai-tutor-faculty', courseData?.faculty],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_tutors')
        .select('*')
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!courseData?.faculty
  });

  const modules = courseData?.course_modules || [];
  const sortedModules = [...modules].sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

  // Set initial module
  useEffect(() => {
    if (sortedModules.length > 0 && !currentModuleId) {
      // Find first incomplete module or start from beginning
      const firstIncomplete = sortedModules.find((m: any) => !moduleCompletions.includes(m.id));
      setCurrentModuleId(firstIncomplete?.id || sortedModules[0].id);
    }
  }, [sortedModules, moduleCompletions, currentModuleId]);

  const currentModule = sortedModules.find((m: any) => m.id === currentModuleId);
  const currentModuleIndex = sortedModules.findIndex((m: any) => m.id === currentModuleId);

  // Complete module mutation
  const completeModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      // Check if already completed
      const { data: existing } = await supabase
        .from('module_completions' as any)
        .select('id')
        .eq('module_id', moduleId)
        .eq('user_id', user!.id)
        .maybeSingle();
      
      if (existing) return existing;

      const { data, error } = await supabase
        .from('module_completions' as any)
        .insert({
          module_id: moduleId,
          user_id: user!.id,
          course_id: courseId
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update enrollment progress
      const newCompletedCount = moduleCompletions.length + 1;
      const newProgress = Math.round((newCompletedCount / sortedModules.length) * 100);
      
      if (enrollment) {
        await supabase
          .from('enrollments')
          .update({ progress: newProgress })
          .eq('id', enrollment.id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-completions'] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-learning'] });
      toast.success('Module completed! 🎉');
    },
    onError: (error) => {
      console.error('Failed to complete module:', error);
      toast.error('Failed to mark module as complete');
    }
  });

  const handleModuleComplete = () => {
    if (currentModuleId && !moduleCompletions.includes(currentModuleId)) {
      completeModuleMutation.mutate(currentModuleId);
    }
  };

  const handleNextModule = () => {
    if (currentModuleIndex < sortedModules.length - 1) {
      setCurrentModuleId(sortedModules[currentModuleIndex + 1].id);
      setActiveTab('learn');
    } else {
      // Course completed
      toast.success('Congratulations! You completed the course! 🎓');
      navigate(`/graduation?courseId=${courseId}`);
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleId(sortedModules[currentModuleIndex - 1].id);
      setActiveTab('learn');
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    setActiveTab('learn');
  };

  const overallProgress = sortedModules.length > 0 
    ? Math.round((moduleCompletions.filter((id: string) => 
        sortedModules.some((m: any) => m.id === id)
      ).length / sortedModules.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <PageTemplate title="Loading..." description="">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTemplate>
    );
  }

  if (error || !courseData) {
    return (
      <PageTemplate title="Course Not Found" description="">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-4">
            Failed to load course content
          </p>
          <Button onClick={() => navigate('/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </PageTemplate>
    );
  }

  if (!enrollment) {
    return (
      <PageTemplate title={courseData.title} description="">
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-4">
            You need to enroll in this course to access the content
          </p>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Course Details
          </Button>
        </div>
      </PageTemplate>
    );
  }

  console.info('✝️ ScrollUniversity: Course learning page loaded — Christ is Lord over all learning');

  return (
    <PageTemplate
      title={courseData.title}
      description={`${courseData.faculty} • ${sortedModules.length} Modules`}
      actions={
        <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Course Overview
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="learn" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Learn</span>
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Curriculum</span>
          </TabsTrigger>
          <TabsTrigger value="tutor" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">AI Tutor</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learn">
          {currentModule ? (
            <ModuleLearningContent
              module={currentModule}
              courseTitle={courseData.title}
              totalModules={sortedModules.length}
              onComplete={handleModuleComplete}
              onNext={handleNextModule}
              onPrevious={handlePreviousModule}
              isCompleted={moduleCompletions.includes(currentModuleId!)}
              isFirst={currentModuleIndex === 0}
              isLast={currentModuleIndex === sortedModules.length - 1}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No modules available yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="curriculum">
          <CourseCurriculumBrowser
            course={courseData}
            modules={sortedModules}
            currentModuleId={currentModuleId || undefined}
            completedModuleIds={moduleCompletions}
            overallProgress={overallProgress}
            onModuleSelect={handleModuleSelect}
          />
        </TabsContent>

        <TabsContent value="tutor">
          {aiTutor ? (
            <AITutorAvatar
              tutorId={aiTutor.id}
              tutorName={aiTutor.name}
              tutorSpecialty={aiTutor.specialty}
              tutorAvatar={aiTutor.avatar_image_url}
              moduleId={currentModuleId || undefined}
              moduleContent={currentModule?.content_md}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">AI Tutor coming soon</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
