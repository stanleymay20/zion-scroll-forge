import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError } from "@/lib/errors";

export const ExpandContentButton = () => {
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('expand-thin-modules', {
        body: { limit: 50, provider: 'deepseek' },
      });
      if (error) throw error;
      toast({
        title: 'Elite content expansion queued',
        description: `${data?.queued ?? 0} modules being rewritten in the background. Re-run in ~10 min for the next batch.`,
      });
    } catch (e: any) {
      toast({ title: 'Failed', description: getUserFriendlyError(e), variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Button onClick={run} disabled={running} className="gap-2">
      {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {running ? 'Queueing…' : 'Expand 50 Modules to Elite Tier'}
    </Button>
  );
};
