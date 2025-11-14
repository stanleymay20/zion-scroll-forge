import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { InstitutionSetup } from '@/components/onboarding/InstitutionSetup';
import { FacultyCreation } from '@/components/onboarding/FacultyCreation';
import { CourseImport } from '@/components/onboarding/CourseImport';
import { AdminConfiguration } from '@/components/onboarding/AdminConfiguration';

const steps = [
  { id: 1, name: 'Institution Setup', description: 'Basic institution information' },
  { id: 2, name: 'Faculty Creation', description: 'Add faculties and departments' },
  { id: 3, name: 'Course Import', description: 'Import or create courses' },
  { id: 4, name: 'Admin Configuration', description: 'Configure admin settings' },
];

export const InstitutionOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [institutionData, setInstitutionData] = useState<any>({});

  const progress = (completedSteps.length / steps.length) * 100;

  const handleStepComplete = (stepId: number, data: any) => {
    setInstitutionData((prev: any) => ({ ...prev, ...data }));
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Institution Onboarding</h1>
        <p className="text-muted-foreground mt-2">
          Complete the setup process for your new institution
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
          <CardDescription>
            Step {currentStep} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-6" />
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  step.id === currentStep
                    ? 'border-primary bg-primary/5'
                    : completedSteps.includes(step.id)
                    ? 'border-green-500 bg-green-500/5'
                    : 'border-border'
                }`}
              >
                {completedSteps.includes(step.id) ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      step.id === currentStep ? 'border-primary bg-primary' : 'border-border'
                    }`}
                  />
                )}
                <div>
                  <div className="font-medium">{step.name}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <InstitutionSetup
              onComplete={(data) => handleStepComplete(1, data)}
              initialData={institutionData}
            />
          )}
          {currentStep === 2 && (
            <FacultyCreation
              onComplete={(data) => handleStepComplete(2, data)}
              onBack={handleBack}
              institutionId={institutionData.institutionId}
            />
          )}
          {currentStep === 3 && (
            <CourseImport
              onComplete={(data) => handleStepComplete(3, data)}
              onBack={handleBack}
              institutionId={institutionData.institutionId}
              faculties={institutionData.faculties}
            />
          )}
          {currentStep === 4 && (
            <AdminConfiguration
              onComplete={(data) => handleStepComplete(4, data)}
              onBack={handleBack}
              institutionId={institutionData.institutionId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstitutionOnboarding;
