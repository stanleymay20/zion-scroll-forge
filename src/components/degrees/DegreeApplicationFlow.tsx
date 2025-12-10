import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap, Award, FileCheck, ArrowRight } from "lucide-react";
import { useStudentQualifications, useCheckPrerequisites, useSubmitDegreeApplication } from "@/hooks/useStudentQualifications";
import { useEnrollInDegree } from "@/hooks/useDegreePrograms";
import { AddQualificationDialog } from "./AddQualificationDialog";
import { DegreePrerequisitesCard } from "./DegreePrerequisitesCard";
import { toast } from "@/hooks/use-toast";

interface DegreeApplicationFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  degreeId: string;
  degreeTitle: string;
  degreeLevel: string;
}

export function DegreeApplicationFlow({ 
  open, 
  onOpenChange, 
  degreeId, 
  degreeTitle,
  degreeLevel 
}: DegreeApplicationFlowProps) {
  const [step, setStep] = useState<'prerequisites' | 'qualifications' | 'confirm'>('prerequisites');
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>([]);
  const [isEligible, setIsEligible] = useState(false);

  const { data: qualifications, isLoading: loadingQuals } = useStudentQualifications();
  const { data: prereqCheck, refetch: refetchPrereqs } = useCheckPrerequisites(degreeLevel);
  const submitApplication = useSubmitDegreeApplication();
  const enrollInDegree = useEnrollInDegree();

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep('prerequisites');
      setSelectedQualifications([]);
      refetchPrereqs();
    }
  }, [open]);

  const handleEligibilityChange = (eligible: boolean) => {
    setIsEligible(eligible);
  };

  const handleProceedToQualifications = () => {
    setStep('qualifications');
  };

  const handleProceedToConfirm = () => {
    setStep('confirm');
  };

  const handleSubmitApplication = async () => {
    try {
      const result = await submitApplication.mutateAsync({
        degreeId,
        qualificationIds: selectedQualifications
      });

      if (result.eligible) {
        // Auto-enroll if eligible
        await enrollInDegree.mutateAsync(degreeId);
        onOpenChange(false);
      } else {
        toast({
          title: "Application Submitted",
          description: "Your application is pending review. You will be notified once approved."
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Application error:", error);
    }
  };

  const handleDirectEnroll = async () => {
    try {
      await enrollInDegree.mutateAsync(degreeId);
      toast({
        title: "✝️ Successfully Enrolled",
        description: `You are now enrolled in ${degreeTitle}`
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Enrollment error:", error);
    }
  };

  const toggleQualification = (id: string) => {
    setSelectedQualifications(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Apply for {degreeTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant={step === 'prerequisites' ? 'default' : 'secondary'}>1. Prerequisites</Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={step === 'qualifications' ? 'default' : 'secondary'}>2. Qualifications</Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={step === 'confirm' ? 'default' : 'secondary'}>3. Confirm</Badge>
        </div>

        {/* Step 1: Prerequisites Check */}
        {step === 'prerequisites' && (
          <div className="space-y-4">
            <DegreePrerequisitesCard 
              degreeLevel={degreeLevel} 
              onEligibilityChange={handleEligibilityChange}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {isEligible ? (
                <Button onClick={handleDirectEnroll} disabled={enrollInDegree.isPending}>
                  {enrollInDegree.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enroll Now
                </Button>
              ) : (
                <Button onClick={handleProceedToQualifications}>
                  Add Qualifications
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Submit Qualifications */}
        {step === 'qualifications' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Submit your prior qualifications to demonstrate eligibility. Students with standard degrees from accredited institutions may qualify.
            </p>

            {loadingQuals ? (
              <div className="py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              </div>
            ) : (
              <>
                {qualifications && qualifications.length > 0 ? (
                  <div className="space-y-2">
                    {qualifications.map((qual) => (
                      <Card 
                        key={qual.id}
                        className={`cursor-pointer transition-colors ${
                          selectedQualifications.includes(qual.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => toggleQualification(qual.id)}
                      >
                        <CardContent className="flex items-center gap-3 py-3">
                          <Checkbox 
                            checked={selectedQualifications.includes(qual.id)}
                            onCheckedChange={() => toggleQualification(qual.id)}
                          />
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{qual.qualification_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {qual.institution_name && `${qual.institution_name} • `}
                              {qual.level.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                          </div>
                          {qual.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              <FileCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        No qualifications added yet
                      </p>
                    </CardContent>
                  </Card>
                )}

                <AddQualificationDialog />
              </>
            )}

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep('prerequisites')}>
                Back
              </Button>
              <Button 
                onClick={handleProceedToConfirm}
                disabled={selectedQualifications.length === 0}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Application */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span className="font-medium">{degreeTitle}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Submitting {selectedQualifications.length} qualification(s) for review.</p>
                </div>
                
                {prereqCheck && !prereqCheck.eligible && (
                  <div className="text-sm p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      Application Review Required
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Your qualifications will be reviewed to determine eligibility based on equivalent credentials.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep('qualifications')}>
                Back
              </Button>
              <Button 
                onClick={handleSubmitApplication}
                disabled={submitApplication.isPending}
              >
                {submitApplication.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Application
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
