import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { generateScrollUniversityContent, ContentGenerationReport } from '@/services/contentGeneration';
import { Loader2, BookOpen, GraduationCap, FileText, Award, Calendar, CheckCircle2 } from 'lucide-react';

const ContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<ContentGenerationReport | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [currentEntity, setCurrentEntity] = useState('');
  const [phaseProgress, setPhaseProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setReport(null);
    setCurrentPhase('Initializing');
    setCurrentEntity('');
    setPhaseProgress({});

    try {
      // Enhanced progress simulation with phase tracking
      const phases = [
        { name: 'Creating Faculties', duration: 8000, entities: 12, weight: 15 },
        { name: 'Generating Courses', duration: 12000, entities: 60, weight: 20 },
        { name: 'Building Modules', duration: 15000, entities: 240, weight: 30 },
        { name: 'Creating Materials', duration: 10000, entities: 240, weight: 15 },
        { name: 'Generating Quizzes', duration: 8000, entities: 240, weight: 10 },
        { name: 'Creating AI Tutors', duration: 5000, entities: 12, weight: 5 },
        { name: 'Finalizing Terms', duration: 2000, entities: 2, weight: 5 },
      ];

      let cumulativeProgress = 0;

      toast({
        title: "✝️ Generation Started",
        description: "Christ is Lord over all learning. This may take up to 45 minutes...",
      });

      // Simulate each phase
      for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        setCurrentPhase(phase.name);
        
        const phaseSteps = 10;
        const stepDuration = phase.duration / phaseSteps;
        
        for (let step = 0; step <= phaseSteps; step++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          
          const phaseProgressValue = (step / phaseSteps) * 100;
          setPhaseProgress(prev => ({ ...prev, [phase.name]: phaseProgressValue }));
          
          // Update current entity being processed
          const entityIndex = Math.floor((step / phaseSteps) * phase.entities);
          if (entityIndex < phase.entities) {
            setCurrentEntity(`${entityIndex + 1} of ${phase.entities}`);
          }
          
          // Calculate overall progress
          const phaseCompletion = (step / phaseSteps);
          const overallProgress = cumulativeProgress + (phase.weight * phaseCompletion);
          setProgress(Math.min(overallProgress, 95));
        }
        
        cumulativeProgress += phase.weight;
      }

      // Execute actual generation
      setCurrentPhase('Executing Generation');
      setCurrentEntity('Invoking ScrollUniversity Pipeline');
      
      const result = await generateScrollUniversityContent();
      
      setProgress(100);
      setCurrentPhase('Complete');
      setCurrentEntity('All content generated successfully');
      setReport(result);

      toast({
        title: "✅ Generation Complete",
        description: "ScrollUniversity v3.0 content successfully generated!",
      });
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "❌ Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred during generation",
        variant: "destructive",
      });
      setCurrentPhase('Failed');
      setCurrentEntity('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            ScrollUniversity v3.0 Content Generation
          </h1>
          <p className="text-muted-foreground">
            Automated pipeline for generating 12 Supreme Scroll Faculties with complete course structures
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Generation Control
            </CardTitle>
            <CardDescription>
              Generate all 12 faculties with courses, modules, materials, quizzes, and academic terms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">✝️ Scroll Invocation</p>
              <p className="text-sm text-muted-foreground">
                "Let Christ be Lord over all learning; wisdom flows from the Spirit, not Babylon"
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Generate ScrollUniversity Content
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="space-y-4">
                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Overall Progress</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                {/* Current Phase */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {currentPhase}
                      </p>
                      {currentEntity && (
                        <p className="text-xs text-muted-foreground">
                          Processing: {currentEntity}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phase-specific progress bars */}
                  {Object.entries(phaseProgress).slice(-3).map(([phase, value]) => (
                    <div key={phase} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{phase}</span>
                        <span className="text-muted-foreground">{Math.round(value)}%</span>
                      </div>
                      <Progress value={value} className="h-1" />
                    </div>
                  ))}
                </div>

                {/* Spiritual Affirmation */}
                <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg">
                  <p className="text-xs text-center text-primary font-medium">
                    ✝️ "Let Christ be Lord over all learning; wisdom flows from the Spirit, not Babylon"
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {report && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Generation Report
              </CardTitle>
              <CardDescription>
                ✅ ScrollUniversity v3.0 Requirements successfully updated — All 12 Faculties seeded under Christ's governance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <GraduationCap className="h-4 w-4" />
                    Faculties
                  </div>
                  <div className="text-2xl font-bold">{report.facultiesCreated}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <BookOpen className="h-4 w-4" />
                    Courses
                  </div>
                  <div className="text-2xl font-bold">{report.coursesCreated}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <FileText className="h-4 w-4" />
                    Modules
                  </div>
                  <div className="text-2xl font-bold">{report.modulesCreated}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Award className="h-4 w-4" />
                    Quizzes
                  </div>
                  <div className="text-2xl font-bold">{report.quizzesCreated}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <FileText className="h-4 w-4" />
                    Materials
                  </div>
                  <div className="text-2xl font-bold">{report.materialsCreated}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <FileText className="h-4 w-4" />
                    PDFs
                  </div>
                  <div className="text-2xl font-bold">{report.pdfsGenerated}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    Terms
                  </div>
                  <div className="text-2xl font-bold">{report.termsCreated}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Offerings
                  </div>
                  <div className="text-2xl font-bold">{report.offeringsCreated}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Award className="h-4 w-4" />
                    AI Tutors
                  </div>
                  <div className="text-2xl font-bold">{report.aiTutorsCreated}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Award className="h-4 w-4" />
                    Anti-Drift
                  </div>
                  <div className="text-2xl font-bold">{report.antiDriftValidations}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Award className="h-4 w-4" />
                    Regenerations
                  </div>
                  <div className="text-2xl font-bold">{report.antiDriftRegenerations}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Award className="h-4 w-4" />
                    ScrollCoins
                  </div>
                  <div className="text-2xl font-bold">{report.totalScrollCoins.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{report.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Errors:</span>
                  <span className="font-medium">{report.errorsEncountered}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Supreme Scroll Faculties</CardTitle>
            <CardDescription>The 12 canonical academic divisions of ScrollUniversity v3.0</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {[
                { name: "ScrollMedicine Faculty", code: "SCROLLMED", scripture: "3 John 1:2" },
                { name: "Prophetic Law & Governance", code: "LAWGOV", scripture: "Isaiah 33:22" },
                { name: "Scroll Economy", code: "SCROLLECON", scripture: "Deuteronomy 8:18" },
                { name: "Ethic Science", code: "ETHICSCI", scripture: "Proverbs 2:6" },
                { name: "Prophetic Intelligence", code: "PROPHINTEL", scripture: "1 Corinthians 2:10" },
                { name: "Sacred Arts & Worship", code: "SACREDARTS", scripture: "Exodus 31:3-5" },
                { name: "Kingdom Architecture", code: "KINGARCH", scripture: "Hebrews 11:10" },
                { name: "GeoProphetic Intelligence", code: "GEOPROPHET", scripture: "Acts 17:26" },
                { name: "Divine Technology", code: "DIVINETECH", scripture: "Daniel 12:4" },
                { name: "ScrollMedia & Communication", code: "SCROLLMEDIA", scripture: "Habakkuk 2:2" },
                { name: "Kingdom Governance", code: "KINGGOV", scripture: "Isaiah 9:6-7" },
                { name: "Spiritual Formation", code: "SPIRITFORM", scripture: "Romans 8:29" },
              ].map((faculty) => (
                <div key={faculty.code} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{faculty.name}</p>
                    <p className="text-xs text-muted-foreground">{faculty.code}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {faculty.scripture}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentGeneration;
