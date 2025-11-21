/**
 * ScrollUniversity Admissions Application Page
 * "Many are called, but few are chosen" - Matthew 22:14
 * 
 * Multi-step application form with progress tracking
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Application, FormTemplate, ProgramType } from '@/types/admissions';
import ApplicationFormStep from '@/components/admissions/ApplicationFormStep';
import DocumentUploadStep from '@/components/admissions/DocumentUploadStep';
import ApplicationPreview from '@/components/admissions/ApplicationPreview';

const AdmissionsApplication: React.FC = () => {
  const { applicationId } = useParams<{ applicationId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [application, setApplication] = useState<Application | null>(null);
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 'personal', title: 'Personal Information', description: 'Basic details about you' },
    { id: 'academic', title: 'Academic Background', description: 'Your educational history' },
    { id: 'spiritual', title: 'Spiritual Journey', description: 'Your faith and calling' },
    { id: 'documents', title: 'Documents', description: 'Upload required documents' },
    { id: 'review', title: 'Review & Submit', description: 'Review your application' }
  ];

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      setLoading(true);

      if (applicationId) {
        // Load existing application
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select('*')
          .eq('id', applicationId)
          .single();

        if (appError) throw appError;

        setApplication(appData);
        setFormData(appData.formData || {});

        // Load form template
        const { data: templateData, error: templateError } = await supabase
          .from('application_form_templates')
          .select('*')
          .eq('programType', appData.programApplied)
          .eq('isActive', true)
          .single();

        if (templateError) throw templateError;
        setFormTemplate(templateData);
      } else {
        // Create new application
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth/login');
          return;
        }

        const { data: newApp, error: createError } = await supabase
          .from('applications')
          .insert({
            applicantId: user.id,
            programApplied: ProgramType.UNDERGRADUATE,
            status: 'DRAFT',
            completionPercentage: 0,
            intendedStartDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months from now
          })
          .select()
          .single();

        if (createError) throw createError;

        setApplication(newApp);
        navigate(`/admissions/apply/${newApp.id}`, { replace: true });

        // Load form template
        const { data: templateData, error: templateError } = await supabase
          .from('application_form_templates')
          .select('*')
          .eq('programType', ProgramType.UNDERGRADUATE)
          .eq('isActive', true)
          .single();

        if (templateError) throw templateError;
        setFormTemplate(templateData);
      }
    } catch (error) {
      console.error('Error loading application:', error);
      toast({
        title: 'Error',
        description: 'Failed to load application. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    if (!application) return;

    try {
      setSaving(true);

      const completionPercentage = calculateCompletionPercentage();

      const { error } = await supabase
        .from('applications')
        .update({
          formData,
          completionPercentage,
          updatedAt: new Date().toISOString()
        })
        .eq('id', application.id);

      if (error) throw error;

      toast({
        title: 'Progress Saved',
        description: 'Your application has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletionPercentage = (): number => {
    if (!formTemplate) return 0;

    let totalFields = 0;
    let completedFields = 0;

    formTemplate.sections.forEach(section => {
      section.fields.forEach(field => {
        totalFields++;
        if (formData[field.id] !== undefined && formData[field.id] !== '') {
          completedFields++;
        }
      });
    });

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };

  const validateCurrentStep = (): boolean => {
    if (!formTemplate) return false;

    const currentSection = formTemplate.sections[currentStep];
    if (!currentSection) return true; // Documents and review steps

    const newErrors: Record<string, string> = {};

    currentSection.fields.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        newErrors[field.id] = `${field.label} is required`;
      }

      // Additional validation
      if (field.validation && formData[field.id]) {
        const value = formData[field.id];

        if (field.validation.minLength && value.length < field.validation.minLength) {
          newErrors[field.id] = `Minimum length is ${field.validation.minLength} characters`;
        }

        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          newErrors[field.id] = `Maximum length is ${field.validation.maxLength} characters`;
        }

        if (field.validation.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            newErrors[field.id] = `Invalid format for ${field.label}`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      if (validateCurrentStep()) {
        await saveProgress();
        setCurrentStep(currentStep + 1);
      } else {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields correctly.',
          variant: 'destructive'
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!application) return;

    try {
      setSubmitting(true);

      // Final validation
      if (!validateCurrentStep()) {
        toast({
          title: 'Validation Error',
          description: 'Please review and complete all required fields.',
          variant: 'destructive'
        });
        return;
      }

      // Submit application
      const { error } = await supabase
        .from('applications')
        .update({
          status: 'SUBMITTED',
          submissionDate: new Date().toISOString(),
          formData,
          completionPercentage: 100
        })
        .eq('id', application.id);

      if (error) throw error;

      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!',
      });

      navigate(`/admissions/status/${application.id}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application || !formTemplate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load application. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admissions Application</h1>
        <p className="text-muted-foreground">
          {formTemplate.name} - {application.programApplied}
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index < currentStep
                      ? 'bg-primary border-primary text-primary-foreground'
                      : index === currentStep
                      ? 'border-primary text-primary'
                      : 'border-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center hidden md:block">
                  <p className="text-xs font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-12 md:w-24 mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep < formTemplate.sections.length && (
            <ApplicationFormStep
              section={formTemplate.sections[currentStep]}
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
            />
          )}

          {currentStep === formTemplate.sections.length && (
            <DocumentUploadStep
              applicationId={application.id}
              programType={application.programApplied}
            />
          )}

          {currentStep === steps.length - 1 && (
            <ApplicationPreview
              application={application}
              formTemplate={formTemplate}
              formData={formData}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || saving || submitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={saveProgress}
            disabled={saving || submitting}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </>
            )}
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={saving || submitting}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Auto-save indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-3 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Saving...</span>
        </div>
      )}
    </div>
  );
};

export default AdmissionsApplication;
