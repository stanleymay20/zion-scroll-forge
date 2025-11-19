/**
 * Assignment Submission Component
 * Form for submitting assignments with file upload support
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  X, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface AssignmentSubmissionProps {
  lectureId: string;
  courseId: string;
  userId: string;
}

export function AssignmentSubmission({ lectureId, courseId, userId }: AssignmentSubmissionProps) {
  const queryClient = useQueryClient();
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch assignment details
  const { data: assignmentData, isLoading } = useQuery({
    queryKey: ['assignment', lectureId],
    queryFn: async () => {
      // In production, this would fetch from the backend
      // For now, we'll return mock data
      return {
        id: lectureId,
        title: 'Prophetic Intelligence Application',
        description: 'Write a 500-word reflection on how you would apply prophetic intelligence in your ministry context. Include specific examples and biblical references.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt'],
        maxFiles: 3
      };
    }
  });

  // Fetch existing submission
  const { data: existingSubmission } = useQuery({
    queryKey: ['submission', lectureId, userId],
    queryFn: async () => {
      // In production, this would fetch from the backend
      // For now, return null to indicate no existing submission
      return null as any;
    }
  });

  // Submit assignment mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: async () => {
      // In production, this would upload files and create submission record
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would integrate with the backend assignment submission service
      console.log('Assignment submitted:', {
        lectureId,
        courseId,
        userId,
        submissionText,
        fileCount: selectedFiles.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submission', lectureId, userId] });
      toast.success('Assignment Submitted', {
        description: 'Your assignment has been submitted successfully'
      });
      setSubmissionText('');
      setSelectedFiles([]);
    },
    onError: (error: any) => {
      toast.error('Submission Failed', {
        description: error.message || 'Failed to submit assignment'
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const maxFiles = assignmentData?.maxFiles || 3;
    const maxSize = assignmentData?.maxFileSize || 10 * 1024 * 1024;
    const allowedTypes = assignmentData?.allowedFileTypes || [];

    const validFiles = files.filter(file => {
      // Check file size
      if (file.size > maxSize) {
        toast.error('File Too Large', {
          description: `${file.name} exceeds the maximum file size of ${maxSize / (1024 * 1024)}MB`
        });
        return false;
      }

      // Check file type
      const fileExt = '.' + file.name.split('.').pop();
      if (allowedTypes.length && !allowedTypes.includes(fileExt)) {
        toast.error('Invalid File Type', {
          description: `${file.name} is not an allowed file type`
        });
        return false;
      }

      return true;
    });

    const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
    setSelectedFiles(newFiles);

    if (newFiles.length > maxFiles) {
      toast.warning('Too Many Files', {
        description: `Maximum ${maxFiles} files allowed`
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!submissionText.trim() && selectedFiles.length === 0) {
      toast.error('Empty Submission', {
        description: 'Please provide either text or file attachments'
      });
      return;
    }

    submitAssignmentMutation.mutate();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!assignmentData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No assignment available for this lecture.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{assignmentData.title}</CardTitle>
            <CardDescription className="mt-2">
              {assignmentData.description}
            </CardDescription>
          </div>
          {existingSubmission && (
            <Badge variant={existingSubmission.status === 'graded' ? 'default' : 'secondary'}>
              {existingSubmission.status === 'graded' ? `Graded: ${existingSubmission.grade}%` : 'Submitted'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <span>Due: {new Date(assignmentData.dueDate).toLocaleDateString()}</span>
          <span>•</span>
          <span>Max {assignmentData.maxFiles} files</span>
          <span>•</span>
          <span>Max {assignmentData.maxFileSize / (1024 * 1024)}MB per file</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Submission Display */}
        {existingSubmission && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Your Submission</h4>
              <Badge variant="outline">
                Submitted {new Date(existingSubmission.submitted_at).toLocaleDateString()}
              </Badge>
            </div>
            {existingSubmission.submission_text && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {existingSubmission.submission_text}
              </p>
            )}
            {existingSubmission.file_urls && existingSubmission.file_urls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Attached Files:</p>
                {existingSubmission.file_urls.map((url: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Download File {index + 1}
                    </a>
                  </div>
                ))}
              </div>
            )}
            {existingSubmission.feedback && (
              <div className="border-t pt-3 mt-3">
                <p className="text-sm font-medium mb-1">Instructor Feedback:</p>
                <p className="text-sm text-muted-foreground">{existingSubmission.feedback}</p>
              </div>
            )}
          </div>
        )}

        {/* New Submission Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="submission-text">Your Response</Label>
            <Textarea
              id="submission-text"
              placeholder="Type your assignment response here..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              rows={8}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {submissionText.split(/\s+/).filter(w => w).length} words
            </p>
          </div>

          {/* File Upload Area */}
          <div>
            <Label>Attachments (Optional)</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or click to browse
              </p>
              <input
                type="file"
                id="file-upload"
                multiple
                accept={assignmentData.allowedFileTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Browse Files
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Allowed: {assignmentData.allowedFileTypes.join(', ')}
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({selectedFiles.length}/{assignmentData.maxFiles})</Label>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <File className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitAssignmentMutation.isPending || (!submissionText.trim() && selectedFiles.length === 0)}
            className="w-full"
          >
            {submitAssignmentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Assignment
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
