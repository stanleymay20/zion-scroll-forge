import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
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
      <div className="w-full h-[600px]">
        <Tldraw
          persistenceKey={sessionId || 'default-session'}
          autoFocus={!isReadOnly}
        />
      </div>
    </Card>
  );
};
