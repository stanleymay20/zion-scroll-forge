import { useParams } from 'react-router-dom';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { LiveClassroom } from '@/components/classroom/LiveClassroom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function LiveClassroomPage() {
  const { sessionId } = useParams();

  const { data: session, isLoading } = useQuery({
    queryKey: ['live-session', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*, courses(*), course_modules(*)')
        .eq('id', sessionId!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId
  });

  if (isLoading) {
    return (
      <PageTemplate title="Loading..." description="">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTemplate>
    );
  }

  if (!session) {
    return (
      <PageTemplate title="Session Not Found" description="">
        <p className="text-center text-muted-foreground">
          Live session not found or has ended.
        </p>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`Live: ${session.courses?.title || 'Class Session'}`}
      description={session.course_modules?.title || 'Interactive Learning'}
    >
      <LiveClassroom
        courseId={session.course_id}
        moduleId={session.module_id}
        sessionId={session.id}
      />
    </PageTemplate>
  );
}
