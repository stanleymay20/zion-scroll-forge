/**
 * Document Checklist Component
 * Shows status of required documents
 */

import React from 'react';
import { DocumentRequirement } from '@/types/admissions';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface DocumentChecklistProps {
  documents: DocumentRequirement[];
}

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ documents }) => {
  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.documentType} className="flex items-start gap-3">
          {doc.verified ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          ) : doc.uploaded ? (
            <Clock className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {doc.documentType.replace(/_/g, ' ')}
              {doc.required && <span className="text-destructive ml-1">*</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              {doc.verified
                ? 'Verified'
                : doc.uploaded
                ? 'Pending verification'
                : 'Not uploaded'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentChecklist;
