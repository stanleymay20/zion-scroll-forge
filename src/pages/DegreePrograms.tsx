import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap, BookOpen, Clock, Shield, Award } from "lucide-react";
import { useDegreePrograms, useEnrollInDegree } from "@/hooks/useDegreePrograms";
import { DegreeApplicationFlow } from "@/components/degrees/DegreeApplicationFlow";
import { SCROLL_DEGREE_LEVELS } from "@/types/scroll-degree-levels";

console.info("✝️ Degree Programs — Christ-centered education");

// Map degree levels to display info
const LEVEL_CONFIG: Record<string, { color: string; icon: any; order: number }> = {
  'ScrollCertificate': { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Award, order: 1 },
  'ScrollDiploma': { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: BookOpen, order: 2 },
  'ScrollBachelor': { color: 'bg-violet-500/10 text-violet-600 border-violet-500/20', icon: GraduationCap, order: 3 },
  'ScrollMaster': { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Shield, order: 4 },
  'ScrollDoctorate': { color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: GraduationCap, order: 5 },
  'ScrollExousia': { color: 'bg-primary/10 text-primary border-primary/20', icon: Shield, order: 6 },
};

export default function DegreePrograms() {
  const navigate = useNavigate();
  const { data: programs, isLoading } = useDegreePrograms();
  const enrollInDegree = useEnrollInDegree();
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [applicationDialog, setApplicationDialog] = useState<{
    open: boolean;
    degreeId: string;
    degreeTitle: string;
    degreeLevel: string;
  }>({ open: false, degreeId: '', degreeTitle: '', degreeLevel: '' });

  const handleApply = (program: any) => {
    const level = program.scroll_level || program.level || 'ScrollCertificate';
    setApplicationDialog({
      open: true,
      degreeId: program.id,
      degreeTitle: program.title || program.name,
      degreeLevel: level
    });
  };

  const filteredPrograms = programs?.filter((p: any) => {
    const matchesFaculty = !selectedFaculty || p.faculty === selectedFaculty;
    const matchesLevel = !selectedLevel || p.scroll_level === selectedLevel || p.level === selectedLevel;
    return matchesFaculty && matchesLevel;
  });

  const faculties = [...new Set(programs?.map((p: any) => p.faculty).filter(Boolean) || [])];
  const levels = Object.keys(LEVEL_CONFIG);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTemplate
      title="Degree Programs"
      description="Choose your path of Christ-centered higher education with rigorous prerequisites"
    >
      <div className="space-y-4 md:space-y-6">
        {/* Level filter */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Filter by Degree Level</p>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedLevel === null ? "default" : "outline"}
              onClick={() => setSelectedLevel(null)}
            >
              All Levels
            </Button>
            {levels.map((level) => {
              const config = LEVEL_CONFIG[level];
              const Icon = config.icon;
              return (
                <Button
                  key={level}
                  size="sm"
                  variant={selectedLevel === level ? "default" : "outline"}
                  onClick={() => setSelectedLevel(level)}
                  className="gap-1"
                >
                  <Icon className="h-3 w-3" />
                  {level.replace('Scroll', '')}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Faculty filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={selectedFaculty === null ? "default" : "outline"}
            onClick={() => setSelectedFaculty(null)}
          >
            All Faculties
          </Button>
          {faculties.map((faculty) => (
            <Button
              key={faculty}
              size="sm"
              variant={selectedFaculty === faculty ? "default" : "outline"}
              onClick={() => setSelectedFaculty(faculty)}
            >
              {faculty}
            </Button>
          ))}
        </div>

        {/* Degree level requirements info */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Admission Requirements</p>
                <p className="text-muted-foreground">
                  Each degree level has specific prerequisites. Students with standard qualifications from accredited institutions 
                  may apply by submitting their credentials for review. ScrollCertificate programs are open to all.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!filteredPrograms || filteredPrograms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No degree programs available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
            {filteredPrograms.map((program: any) => {
              const level = program.scroll_level || program.level || 'ScrollCertificate';
              const levelConfig = LEVEL_CONFIG[level] || LEVEL_CONFIG['ScrollCertificate'];
              const levelInfo = SCROLL_DEGREE_LEVELS[level as keyof typeof SCROLL_DEGREE_LEVELS];
              const LevelIcon = levelConfig.icon;

              return (
                <Card
                  key={program.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/degrees/${program.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
                            {program.title || program.name}
                          </CardTitle>
                          {program.faculty && (
                            <Badge variant="secondary">
                              {program.faculty}
                            </Badge>
                          )}
                          <Badge className={`border ${levelConfig.color}`}>
                            <LevelIcon className="h-3 w-3 mr-1" />
                            {level.replace('Scroll', '')}
                          </Badge>
                        </div>
                        <CardDescription>
                          {program.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Duration
                        </span>
                        <span className="font-medium">{program.duration || program.duration_months + ' months'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          Credits
                        </span>
                        <span className="font-medium">{program.total_credits || levelInfo?.requirements.minCredits}</span>
                      </div>
                      {levelInfo && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Shield className="h-4 w-4" />
                            Min XP Required
                          </span>
                          <span className="font-medium">{levelInfo.requirements.minXP.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant={program.is_enrolled ? "outline" : "default"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!program.is_enrolled) {
                          handleApply(program);
                        }
                      }}
                      disabled={program.is_enrolled}
                    >
                      {program.is_enrolled ? "Enrolled" : "Apply Now"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Flow Dialog */}
      <DegreeApplicationFlow
        open={applicationDialog.open}
        onOpenChange={(open) => setApplicationDialog(prev => ({ ...prev, open }))}
        degreeId={applicationDialog.degreeId}
        degreeTitle={applicationDialog.degreeTitle}
        degreeLevel={applicationDialog.degreeLevel}
      />
    </PageTemplate>
  );
}