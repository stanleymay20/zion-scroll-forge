import React from 'react';
import { Card } from '@/components/ui/card';

interface CollaborativeWhiteboardProps {
  sessionId?: string;
  isReadOnly?: boolean;
}

export const CollaborativeWhiteboard = ({
  sessionId,
  isReadOnly = false,
}: CollaborativeWhiteboardProps) => {
  return (
    <Card className="w-full h-full overflow-hidden border-2 border-primary/20">
      <div className="w-full h-[600px] flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground text-sm">Collaborative whiteboard loading...</p>
      </div>
    </Card>
  );
};
