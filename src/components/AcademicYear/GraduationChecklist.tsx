import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  DollarSign, 
  Heart, 
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { useMyGraduationStatus, useApplyForGraduation, GraduationCandidate } from '@/hooks/useAcademicYear';
import { useStudentAcademicStanding } from '@/hooks/useAcademicYear';
import { cn } from '@/lib/utils';

interface GraduationChecklistProps {
  degreeProgramId?: string;
}

export const GraduationChecklist = ({ degreeProgramId }: GraduationChecklistProps) => {
  const { data: graduationStatus, isLoading: statusLoading } = useMyGraduationStatus();
  const { data: academicStanding, isLoading: standingLoading } = useStudentAcademicStanding();
  const applyForGraduation = useApplyForGraduation();

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Calculate requirements based on academic standing
  const requirements = [
    {
      id: 'credits',
      label: 'Credit Requirements',
      description: 'Complete minimum required credits for your degree',
      icon: BookOpen,
      met: (academicStanding?.credits_earned || 0) >= 120,
      current: academicStanding?.credits_earned || 0,
      required: 120,
      unit: 'credits',
    },
    {
      id: 'gpa',
      label: 'GPA Requirement',
      description: 'Maintain minimum cumulative GPA of 2.0',
      icon: Award,
      met: (academicStanding?.cumulative_gpa || 0) >= 2.0,
      current: academicStanding?.cumulative_gpa || 0,
      required: 2.0,
      unit: 'GPA',
    },
    {
      id: 'spiritual',
      label: 'Spiritual Formation',
      description: 'Complete all spiritual formation requirements',
      icon: Heart,
      met: graduationStatus?.spiritual_formation_met || false,
      current: graduationStatus?.spiritual_formation_met ? 100 : 50,
      required: 100,
      unit: '%',
    },
    {
      id: 'capstone',
      label: 'Capstone Project',
      description: 'Complete and defend capstone project or thesis',
      icon: FileCheck,
      met: graduationStatus?.capstone_completed || false,
      current: graduationStatus?.capstone_completed ? 1 : 0,
      required: 1,
      unit: '',
    },
    {
      id: 'financial',
      label: 'Financial Clearance',
      description: 'All tuition and fees must be paid',
      icon: DollarSign,
      met: graduationStatus?.financial_clearance || false,
      current: graduationStatus?.financial_clearance ? 100 : 0,
      required: 100,
      unit: '%',
    },
  ];

  const metRequirements = requirements.filter((r) => r.met).length;
  const totalRequirements = requirements.length;
  const progressPercent = (metRequirements / totalRequirements) * 100;

  const canApply = metRequirements === totalRequirements && !graduationStatus;

  const handleApply = async () => {
    if (!acceptedTerms || !degreeProgramId) return;

    await applyForGraduation.mutateAsync({
      degree_program_id: degreeProgramId,
      gpa_requirement_met: requirements.find((r) => r.id === 'gpa')?.met,
      credits_requirement_met: requirements.find((r) => r.id === 'credits')?.met,
      spiritual_formation_met: requirements.find((r) => r.id === 'spiritual')?.met,
      capstone_completed: requirements.find((r) => r.id === 'capstone')?.met,
      financial_clearance: requirements.find((r) => r.id === 'financial')?.met,
      ceremony_participation: true,
    });
  };

  const getStatusBadge = (status?: GraduationCandidate['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="h-3 w-3 mr-1" /> Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'graduated':
        return <Badge className="bg-primary/10 text-primary"><GraduationCap className="h-3 w-3 mr-1" /> Graduated</Badge>;
      case 'denied':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Denied</Badge>;
      case 'deferred':
        return <Badge variant="secondary">Deferred</Badge>;
      default:
        return null;
    }
  };

  if (statusLoading || standingLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={cn(
        'border-2',
        graduationStatus?.status === 'approved' && 'border-green-500/50 bg-green-500/5',
        graduationStatus?.status === 'graduated' && 'border-primary/50 bg-primary/5'
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Graduation Eligibility</CardTitle>
                <CardDescription>
                  {graduationStatus
                    ? `Application submitted on ${new Date(graduationStatus.application_date).toLocaleDateString()}`
                    : 'Complete all requirements to apply for graduation'}
                </CardDescription>
              </div>
            </div>
            {graduationStatus && getStatusBadge(graduationStatus.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Requirements Met</span>
              <span className="font-medium">{metRequirements} of {totalRequirements}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Requirements List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Graduation Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requirements.map((req) => {
              const Icon = req.icon;
              const progress = (req.current / req.required) * 100;

              return (
                <div
                  key={req.id}
                  className={cn(
                    'p-4 rounded-lg border transition-colors',
                    req.met ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/50'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'p-2 rounded-lg',
                      req.met ? 'bg-green-500/10' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'h-5 w-5',
                        req.met ? 'text-green-500' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{req.label}</p>
                        {req.met ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                      {req.unit && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{req.current} {req.unit}</span>
                            <span>{req.required} {req.unit} required</span>
                          </div>
                          <Progress value={Math.min(100, progress)} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Apply Section */}
      {!graduationStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Apply for Graduation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                disabled={!canApply}
              />
              <label
                htmlFor="terms"
                className={cn(
                  'text-sm',
                  !canApply && 'text-muted-foreground'
                )}
              >
                I confirm that I have completed all degree requirements and understand that my application will be reviewed by the academic office.
              </label>
            </div>

            <Button
              onClick={handleApply}
              disabled={!canApply || !acceptedTerms || applyForGraduation.isPending}
              className="w-full"
              size="lg"
            >
              {applyForGraduation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <GraduationCap className="h-5 w-5 mr-2" />
              Submit Graduation Application
            </Button>

            {!canApply && (
              <p className="text-sm text-center text-muted-foreground">
                Complete all requirements above to apply for graduation
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
