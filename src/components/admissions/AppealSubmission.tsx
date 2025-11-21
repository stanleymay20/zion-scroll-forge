/**
 * Appeal Submission Component
 * Form for submitting admission decision appeals
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';

interface AppealSubmissionProps {
  applicationId: string;
  appealDeadline: Date;
  onSuccess?: () => void;
}

const AppealSubmission: React.FC<AppealSubmissionProps> = ({
  applicationId,
  appealDeadline,
  onSuccess
}) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [additionalEvidence, setAdditionalEvidence] = useState('');
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSupportingDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSupportingDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for your appeal',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);

      // Upload supporting documents if any
      const documentUrls: string[] = [];
      for (const file of supportingDocuments) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${applicationId}/appeal_${Date.now()}_${file.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('application-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('application-documents')
          .getPublicUrl(fileName);

        documentUrls.push(publicUrl);
      }

      // Submit appeal
      const { error } = await supabase
        .from('appeals')
        .insert({
          applicationId,
          reason,
          additionalEvidence,
          supportingDocuments: documentUrls,
          status: 'pending',
          submittedDate: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Appeal Submitted',
        description: 'Your appeal has been submitted successfully. You will be notified of the decision.'
      });

      // Reset form
      setReason('');
      setAdditionalEvidence('');
      setSupportingDocuments([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting appeal:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit appeal. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isDeadlinePassed = new Date() > appealDeadline;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Appeal</CardTitle>
        <CardDescription>
          Appeal the admission decision by providing additional information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isDeadlinePassed ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The appeal deadline has passed. Appeals are no longer being accepted for this application.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Guidelines */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Appeal Guidelines:</p>
                <ul className="text-sm space-y-1">
                  <li>• Clearly state the reason for your appeal</li>
                  <li>• Provide any new information not included in your original application</li>
                  <li>• Include supporting documentation if applicable</li>
                  <li>• Appeals are reviewed within 2-3 weeks</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Reason for Appeal */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for Appeal <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Explain why you believe the decision should be reconsidered..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                {reason.length} / 2000 characters
              </p>
            </div>

            {/* Additional Evidence */}
            <div className="space-y-2">
              <Label htmlFor="evidence">Additional Evidence or Information</Label>
              <Textarea
                id="evidence"
                placeholder="Provide any new information, achievements, or circumstances that were not included in your original application..."
                value={additionalEvidence}
                onChange={(e) => setAdditionalEvidence(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Include any relevant details that support your appeal
              </p>
            </div>

            {/* Supporting Documents */}
            <div className="space-y-2">
              <Label>Supporting Documents (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <input
                  type="file"
                  id="documents"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                <label
                  htmlFor="documents"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-center">
                    Click to upload supporting documents
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                  </p>
                </label>
              </div>

              {/* File List */}
              {supportingDocuments.length > 0 && (
                <div className="space-y-2 mt-3">
                  {supportingDocuments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certification */}
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <p className="text-sm">
                  By submitting this appeal, I certify that all information provided is true and
                  accurate. I understand that false or misleading information may result in the
                  rejection of my appeal and potential dismissal from consideration.
                </p>
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Appeal...
                  </>
                ) : (
                  'Submit Appeal'
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default AppealSubmission;
