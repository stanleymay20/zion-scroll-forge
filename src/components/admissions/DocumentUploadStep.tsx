/**
 * Document Upload Step Component
 * Drag-and-drop interface for uploading required documents
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  File,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Eye,
  AlertCircle,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DocumentType, ApplicationDocument, ProgramType } from '@/types/admissions';
import { useDropzone } from 'react-dropzone';

interface DocumentUploadStepProps {
  applicationId: string;
  programType: ProgramType;
}

interface DocumentRequirement {
  type: DocumentType;
  label: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSize: number; // in MB
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  applicationId,
  programType
}) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const documentRequirements: DocumentRequirement[] = [
    {
      type: DocumentType.TRANSCRIPT,
      label: 'Academic Transcript',
      description: 'Official transcript from your previous institution',
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.png'],
      maxSize: 10
    },
    {
      type: DocumentType.RECOMMENDATION_LETTER,
      label: 'Recommendation Letters',
      description: 'At least 2 letters of recommendation',
      required: true,
      acceptedFormats: ['.pdf', '.doc', '.docx'],
      maxSize: 5
    },
    {
      type: DocumentType.PERSONAL_STATEMENT,
      label: 'Personal Statement',
      description: 'Your personal statement or essay',
      required: true,
      acceptedFormats: ['.pdf', '.doc', '.docx'],
      maxSize: 5
    },
    {
      type: DocumentType.SPIRITUAL_TESTIMONY,
      label: 'Spiritual Testimony',
      description: 'Your testimony of faith and calling',
      required: true,
      acceptedFormats: ['.pdf', '.doc', '.docx'],
      maxSize: 5
    },
    {
      type: DocumentType.RESUME,
      label: 'Resume/CV',
      description: 'Your current resume or curriculum vitae',
      required: false,
      acceptedFormats: ['.pdf', '.doc', '.docx'],
      maxSize: 5
    },
    {
      type: DocumentType.IDENTIFICATION,
      label: 'Identification Document',
      description: 'Government-issued ID or passport',
      required: true,
      acceptedFormats: ['.pdf', '.jpg', '.png'],
      maxSize: 5
    },
    {
      type: DocumentType.PROOF_OF_MINISTRY,
      label: 'Proof of Ministry Experience',
      description: 'Documentation of ministry involvement',
      required: false,
      acceptedFormats: ['.pdf', '.jpg', '.png', '.doc', '.docx'],
      maxSize: 10
    }
  ];

  useEffect(() => {
    loadDocuments();
  }, [applicationId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .eq('applicationId', applicationId);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, documentType: DocumentType) => {
    const uploadId = `${documentType}-${Date.now()}`;

    try {
      setUploading(prev => ({ ...prev, [uploadId]: true }));
      setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${applicationId}/${documentType}_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setUploadProgress(prev => ({ ...prev, [uploadId]: percentage }));
          }
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('application-documents')
        .getPublicUrl(fileName);

      // Save document record
      const { data: docData, error: docError } = await supabase
        .from('application_documents')
        .insert({
          applicationId,
          documentType,
          documentUrl: publicUrl,
          fileName: file.name,
          fileSize: file.size,
          verificationStatus: 'pending'
        })
        .select()
        .single();

      if (docError) throw docError;

      setDocuments(prev => [...prev, docData]);

      toast({
        title: 'Upload Successful',
        description: `${file.name} has been uploaded successfully.`
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(prev => {
        const newState = { ...prev };
        delete newState[uploadId];
        return newState;
      });
      setUploadProgress(prev => {
        const newState = { ...prev };
        delete newState[uploadId];
        return newState;
      });
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('application_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      toast({
        title: 'Document Deleted',
        description: 'Document has been removed successfully.'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document.',
        variant: 'destructive'
      });
    }
  };

  const DocumentUploadCard: React.FC<{ requirement: DocumentRequirement }> = ({ requirement }) => {
    const uploadedDocs = documents.filter(doc => doc.documentType === requirement.type);
    const isUploading = Object.keys(uploading).some(key => key.startsWith(requirement.type));
    const progress = Object.entries(uploadProgress).find(([key]) => key.startsWith(requirement.type))?.[1] || 0;

    const onDrop = useCallback((acceptedFiles: File[]) => {
      acceptedFiles.forEach(file => {
        // Validate file size
        if (file.size > requirement.maxSize * 1024 * 1024) {
          toast({
            title: 'File Too Large',
            description: `File size must be less than ${requirement.maxSize}MB`,
            variant: 'destructive'
          });
          return;
        }

        uploadDocument(file, requirement.type);
      });
    }, [requirement]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: requirement.acceptedFormats.reduce((acc, format) => {
        acc[format] = [];
        return acc;
      }, {} as Record<string, string[]>),
      multiple: requirement.type === DocumentType.RECOMMENDATION_LETTER
    });

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {requirement.label}
                {requirement.required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </CardTitle>
              <CardDescription>{requirement.description}</CardDescription>
            </div>
            {uploadedDocs.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {uploadedDocs.length} uploaded
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm">Drop files here...</p>
            ) : (
              <>
                <p className="text-sm font-medium mb-1">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  Accepted formats: {requirement.acceptedFormats.join(', ')} (Max {requirement.maxSize}MB)
                </p>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Uploaded Documents */}
          {uploadedDocs.length > 0 && (
            <div className="space-y-2">
              {uploadedDocs.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Badge
                      variant={
                        doc.verificationStatus === 'verified'
                          ? 'default'
                          : doc.verificationStatus === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {doc.verificationStatus === 'verified' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {doc.verificationStatus === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                      {doc.verificationStatus === 'pending' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      {doc.verificationStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.documentUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const requiredDocs = documentRequirements.filter(req => req.required);
  const uploadedRequiredDocs = requiredDocs.filter(req =>
    documents.some(doc => doc.documentType === req.type)
  );

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You have uploaded {uploadedRequiredDocs.length} of {requiredDocs.length} required documents.
          {uploadedRequiredDocs.length < requiredDocs.length && (
            <span className="font-medium"> Please upload all required documents to proceed.</span>
          )}
        </AlertDescription>
      </Alert>

      {/* Document Upload Cards */}
      <div className="space-y-4">
        {documentRequirements.map(requirement => (
          <DocumentUploadCard key={requirement.type} requirement={requirement} />
        ))}
      </div>
    </div>
  );
};

export default DocumentUploadStep;
