import { CheckCircle2, XCircle, AlertCircle, GraduationCap, BookOpen, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCheckPrerequisites } from "@/hooks/useStudentQualifications";

interface DegreePrerequisitesCardProps {
  degreeLevel: string;
  onEligibilityChange?: (eligible: boolean) => void;
}

const PREREQUISITE_ICONS: Record<string, any> = {
  scroll_degree: GraduationCap,
  external_degree: Award,
  courses_completed: BookOpen,
  experience: AlertCircle,
  assessment: AlertCircle
};

export function DegreePrerequisitesCard({ degreeLevel, onEligibilityChange }: DegreePrerequisitesCardProps) {
  const { data: prereqCheck, isLoading } = useCheckPrerequisites(degreeLevel);

  // Notify parent of eligibility changes
  if (prereqCheck && onEligibilityChange) {
    onEligibilityChange(prereqCheck.eligible);
  }

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-6 text-center text-muted-foreground">
          Checking prerequisites...
        </CardContent>
      </Card>
    );
  }

  if (!prereqCheck || prereqCheck.prerequisites.length === 0) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Open Enrollment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This program has no prerequisites — all seekers of knowledge are welcome to apply.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={prereqCheck.eligible ? "border-primary/20" : "border-amber-500/20"}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Admission Requirements</CardTitle>
          <Badge variant={prereqCheck.eligible ? "default" : "secondary"}>
            {prereqCheck.eligible ? "Eligible" : "Prerequisites Required"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {prereqCheck.prerequisites.map((prereq) => {
          const Icon = PREREQUISITE_ICONS[prereq.prerequisite_type] || AlertCircle;
          
          return (
            <div 
              key={prereq.id}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                prereq.met 
                  ? "bg-primary/5 border border-primary/20" 
                  : prereq.is_required 
                    ? "bg-destructive/5 border border-destructive/20"
                    : "bg-muted/50 border border-border/50"
              }`}
            >
              <div className="mt-0.5">
                {prereq.met ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : prereq.is_required ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {prereq.prerequisite_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {prereq.is_required && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {prereq.description}
                </p>
                {prereq.met && prereq.userQualification && (
                  <p className="text-xs text-primary mt-1">
                    ✓ Met via: {prereq.userQualification.qualification_name}
                    {prereq.userQualification.institution_name && ` from ${prereq.userQualification.institution_name}`}
                  </p>
                )}
                {!prereq.met && prereq.alternative_path && (
                  <p className="text-xs text-amber-600 mt-1">
                    Alternative: {prereq.alternative_path}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {!prereqCheck.eligible && prereqCheck.alternativePaths.length > 0 && (
          <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
              Alternative Pathways Available
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {[...new Set(prereqCheck.alternativePaths)].map((path, i) => (
                <li key={i}>• {path}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
