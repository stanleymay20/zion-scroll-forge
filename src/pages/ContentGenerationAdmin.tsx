import { useState } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, FileText, CheckCircle2, Volume2, Video, FileAudio } from "lucide-react";
import { useFaculties } from "@/hooks/useFaculties";
import { useGenerateContent, checkGenerationProgress } from "@/hooks/useContentGeneration";
import { useInstitution } from "@/contexts/InstitutionContext";
import { useQuery } from "@tanstack/react-query";
import { checkUserRole } from "@/lib/scrollGovernance";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GenerateVideosButton } from "@/components/admin/GenerateVideosButton";
import { BulkContentSeeding } from "@/components/admin/BulkContentSeeding";

console.info("✝️ Content Generation Admin — Christ governs all creation");

export default function ContentGenerationAdmin() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [courseCount, setCourseCount] = useState<number>(5);
  const [modulesPerCourse, setModulesPerCourse] = useState<number>(8);
  const [isGeneratingMaterials, setIsGeneratingMaterials] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const { activeInstitution } = useInstitution();
  const { data: faculties } = useFaculties();
  const generateMutation = useGenerateContent();

  const { data: progress, refetch: refetchProgress } = useQuery({
    queryKey: ["generation-progress", activeInstitution?.id],
    queryFn: () => checkGenerationProgress(activeInstitution?.id),
    refetchInterval: 5000, // Poll every 5 seconds when generating
    enabled: !!activeInstitution
  });

  const handleGenerate = async () => {
    if (!activeInstitution) {
      toast({
        title: "No institution selected",
        description: "Please select an institution first",
        variant: "destructive"
      });
      return;
    }

    const isAdmin = await checkUserRole("admin");
    if (!isAdmin) {
      toast({
        title: "Access denied",
        description: "Only administrators can generate content",
        variant: "destructive"
      });
      return;
    }

    const params: any = {
      institution_id: activeInstitution.id,
      course_count: courseCount,
      modules_per_course: modulesPerCourse
    };

    if (selectedFaculty !== "all") {
      params.faculty_id = selectedFaculty;
    }

    await generateMutation.mutateAsync(params);
  };

  // Fetch courses for material generation
  const { data: courses } = useQuery({
    queryKey: ["courses-for-materials", activeInstitution?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, faculty')
        .eq('institution_id', activeInstitution?.id || '')
        .order('title');
      return data || [];
    },
    enabled: !!activeInstitution
  });

  const handleGenerateMaterials = async () => {
    if (!selectedCourse) {
      toast({
        title: "Select a course",
        description: "Please select a course to generate materials for",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingMaterials(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-materials', {
        body: { course_id: selectedCourse, batch_generate: true }
      });

      if (error) throw error;

      toast({
        title: "✅ Material Generation Started",
        description: `Generating comprehensive materials for ${data.modules_count} modules. This will take several minutes.`,
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingMaterials(false);
    }
  };

  const isGenerating = progress && progress.progress < 100;

  return (
    <PageTemplate
      title="Content Generation System"
      description="Generate comprehensive course materials for ScrollUniversity"
    >
      <div className="space-y-6">
        {/* Current Progress */}
        {isGenerating && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Generation in Progress
              </CardTitle>
              <CardDescription>{progress.current_stage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress.progress} className="h-2" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Faculties</p>
                  <p className="font-semibold">{progress.faculties_created}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Courses</p>
                  <p className="font-semibold">{progress.courses_created}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modules</p>
                  <p className="font-semibold">{progress.modules_created}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tutors</p>
                  <p className="font-semibold">{progress.tutors_created}</p>
                </div>
              </div>
              {progress.estimated_time_remaining && (
                <p className="text-sm text-muted-foreground">
                  Estimated time remaining: {progress.estimated_time_remaining}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Generation Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate New Content
            </CardTitle>
            <CardDescription>
              Create comprehensive courses, modules, quizzes, and learning materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="faculty">Faculty</Label>
                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                  <SelectTrigger id="faculty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Faculties</SelectItem>
                    {faculties?.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="courses">Courses to Generate</Label>
                <Input
                  id="courses"
                  type="number"
                  min={1}
                  max={20}
                  value={courseCount}
                  onChange={(e) => setCourseCount(parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <Label htmlFor="modules">Modules per Course</Label>
                <Input
                  id="modules"
                  type="number"
                  min={4}
                  max={16}
                  value={modulesPerCourse}
                  onChange={(e) => setModulesPerCourse(parseInt(e.target.value) || 8)}
                />
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <p className="text-sm font-medium">8-Week Intensive Course Generation:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span><strong>{courseCount} courses</strong> with 8 weeks of intensive content each</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span><strong>{courseCount * 8} comprehensive modules</strong> (2000+ words each)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span><strong>{courseCount * 8 * 10} quiz questions</strong> (10 per module)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span><strong>{courseCount * 8 * 4} learning materials</strong> (study guides, notes, scripture refs)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Scripture memory verses, discussion questions, and ScrollCoin rewards</span>
                </li>
              </ul>
              <div className="mt-3 p-3 bg-primary/10 rounded-md">
                <p className="text-xs font-medium text-primary">Week-by-Week Structure:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mt-2 text-xs text-muted-foreground">
                  <span>W1: Foundations</span>
                  <span>W2: Theology</span>
                  <span>W3: Deep Dive</span>
                  <span>W4: Application</span>
                  <span>W5: Advanced</span>
                  <span>W6: Integration</span>
                  <span>W7: Ministry</span>
                  <span>W8: Capstone</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || generateMutation.isPending}
              className="w-full"
              size="lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Generation...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Material Generation Card */}
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              <Volume2 className="h-5 w-5 text-amber-500" />
              <Video className="h-5 w-5 text-amber-500" />
              Generate Full Learning Materials
            </CardTitle>
            <CardDescription>
              Create comprehensive PDFs, audio lectures, and video scripts for each module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="material-course">Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger id="material-course">
                  <SelectValue placeholder="Choose a course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title} ({course.faculty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-amber-500/10 p-4 rounded-lg space-y-3">
              <p className="text-sm font-medium">Materials Generated Per Module:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span><strong>PDF Study Guide</strong> - Comprehensive 2000+ word guide with objectives, content, exercises</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span><strong>Lecture Notes</strong> - Detailed 3000+ word notes with examples and diagrams</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span><strong>Scripture Study</strong> - In-depth biblical analysis with Greek/Hebrew insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span><strong>Discussion Guide</strong> - Group activities, debate topics, and case studies</span>
                </li>
                <li className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-amber-500" />
                  <span><strong>Video Script</strong> - 15-minute lecture script with visual cues</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileAudio className="h-4 w-4 text-amber-500" />
                  <span><strong>Audio Lecture</strong> - AI-generated spoken lecture (requires ElevenLabs)</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleGenerateMaterials}
              disabled={isGeneratingMaterials || !selectedCourse}
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              {isGeneratingMaterials ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Materials...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate All Materials for Course
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Content Seeding */}
        <BulkContentSeeding />

        {/* AI Video Generation Card */}
        <GenerateVideosButton courseId={selectedCourse} />

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              About Content Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              The content generation system uses AI to create comprehensive, Christ-centered
              educational materials across all ScrollUniversity faculties.
            </p>
            <p>
              Each course includes biblical integration, practical applications, and
              alignment with kingdom principles. All content is reviewed for spiritual
              accuracy and academic excellence.
            </p>
            <p className="text-primary font-medium">
              ✝️ All generation is conducted under the Lordship of Jesus Christ
              with appropriate governance logging.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
