import { useState } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, BookOpen, FileText, CheckCircle2 } from "lucide-react";
import { useFaculties } from "@/hooks/useFaculties";
import { useGenerateContent, checkGenerationProgress } from "@/hooks/useContentGeneration";
import { useInstitution } from "@/contexts/InstitutionContext";
import { useQuery } from "@tanstack/react-query";
import { checkUserRole } from "@/lib/scrollGovernance";
import { toast } from "@/hooks/use-toast";

console.info("✝️ Content Generation Admin — Christ governs all creation");

export default function ContentGenerationAdmin() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [courseCount, setCourseCount] = useState<number>(5);
  const [modulesPerCourse, setModulesPerCourse] = useState<number>(8);

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

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">What will be generated:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{courseCount} comprehensive courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{courseCount * modulesPerCourse} detailed learning modules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Quizzes and assessments for each module</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Learning materials (PDFs, videos, infographics)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Scripture integrations and spiritual applications</span>
                </li>
              </ul>
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
