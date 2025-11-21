/**
 * Application Preview Component
 * Review and edit functionality before submission
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, CheckCircle2, AlertCircle } from 'lucide-react';
import { Application, FormTemplate } from '@/types/admissions';
import { format } from 'date-fns';

interface ApplicationPreviewProps {
  application: Application;
  formTemplate: FormTemplate;
  formData: Record<string, any>;
  onEdit?: (sectionIndex: number) => void;
}

const ApplicationPreview: React.FC<ApplicationPreviewProps> = ({
  application,
  formTemplate,
  formData,
  onEdit
}) => {
  const formatValue = (value: any, fieldType?: string): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (fieldType === 'date' && typeof value === 'string') {
      try {
        return format(new Date(value), 'PPP');
      } catch {
        return value;
      }
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
  };

  const isComplete = application.completionPercentage === 100;

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card className={isComplete ? 'border-green-500' : 'border-yellow-500'}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium">Application Complete</p>
                  <p className="text-sm text-muted-foreground">
                    Your application is ready for submission
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="font-medium">Application Incomplete</p>
                  <p className="text-sm text-muted-foreground">
                    Please complete all required fields before submitting
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
          <CardDescription>Review your information before submitting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Program</p>
              <p className="text-base">{application.programApplied}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Intended Start Date</p>
              <p className="text-base">
                {format(new Date(application.intendedStartDate), 'MMMM yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Application Status</p>
              <Badge variant="outline">{application.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completion</p>
              <p className="text-base">{application.completionPercentage}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Sections Review */}
      {formTemplate.sections.map((section, sectionIndex) => {
        const sectionFields = section.fields.filter(field => formData[field.id] !== undefined);
        const completedFields = sectionFields.filter(
          field => formData[field.id] !== '' && formData[field.id] !== null
        );

        return (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {completedFields.length} / {section.fields.length} fields
                  </Badge>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(sectionIndex)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.fields
                  .sort((a, b) => a.order - b.order)
                  .map((field, fieldIndex) => {
                    const value = formData[field.id];
                    const isEmpty = value === undefined || value === '' || value === null;

                    return (
                      <div key={field.id}>
                        {fieldIndex > 0 && <Separator className="my-4" />}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1">
                            <p className="text-sm font-medium flex items-center gap-2">
                              {field.label}
                              {field.required && (
                                <span className="text-destructive">*</span>
                              )}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p
                              className={`text-sm ${
                                isEmpty ? 'text-muted-foreground italic' : ''
                              }`}
                            >
                              {formatValue(value, field.fieldType)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Important Notice */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-lg">Before You Submit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm">
              I certify that all information provided in this application is true and complete to
              the best of my knowledge.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm">
              I understand that any false or misleading information may result in the rejection of
              my application or dismissal from the program.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm">
              I have reviewed all sections of my application and uploaded all required documents.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-sm">
              I agree to abide by the spiritual and academic standards of ScrollUniversity.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submission Warning */}
      {!isComplete && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  Incomplete Application
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                  Please complete all required fields and upload all required documents before
                  submitting your application. You can save your progress and return later.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationPreview;
