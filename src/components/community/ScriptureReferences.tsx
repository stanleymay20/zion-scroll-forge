/**
 * Scripture References Component
 * Display scripture references in posts
 */

import React from 'react';
import { ScriptureReference } from '@/types/community';
import { Card } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface ScriptureReferencesProps {
  references: ScriptureReference[];
}

export const ScriptureReferences: React.FC<ScriptureReferencesProps> = ({ references }) => {
  if (!references || references.length === 0) return null;

  return (
    <Card className="p-4 my-4 bg-blue-50 border-blue-200">
      <div className="flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-2">Scripture References</h4>
          <div className="space-y-2">
            {references.map((ref, index) => (
              <div key={index} className="text-sm">
                <p className="font-medium text-blue-800">{ref.reference}</p>
                {ref.translation && (
                  <p className="text-xs text-blue-600 mt-0.5">({ref.translation})</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
