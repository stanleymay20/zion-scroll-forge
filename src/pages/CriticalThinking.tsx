/**
 * Critical Thinking Page
 * Main page for ScrollCritical Thinking & Innovation Engine
 * "Come, let us reason together" - Isaiah 1:18
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CriticalThinkingDashboard } from '@/components/critical-thinking';

export default function CriticalThinking() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access Critical Thinking</h1>
          <p className="text-muted-foreground">
            You need to be authenticated to use the ScrollCritical Thinking Engine
          </p>
        </div>
      </div>
    );
  }

  return <CriticalThinkingDashboard userId={user.id} />;
}
