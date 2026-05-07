import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Turn { speaker: 'LECTURER' | 'PEER' | 'TA'; text: string }
interface Session { opening: string; turns: Turn[]; reflection_prompt: string }

const SPEAKER_META: Record<Turn['speaker'], { name: string; color: string; bg: string }> = {
  LECTURER: { name: 'Dr. Selah · Lecturer', color: 'text-burgundy', bg: 'bg-burgundy/5 border-burgundy/30' },
  PEER:     { name: 'Mara · Peer Student',  color: 'text-foreground', bg: 'bg-muted/40 border-border' },
  TA:       { name: 'Tobias · Teaching Assistant', color: 'text-primary', bg: 'bg-primary/5 border-primary/30' },
};

export const MultiAgentClassroom = ({ moduleId }: { moduleId: string }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const start = async () => {
    setLoading(true);
    setSession(null);
    try {
      const { data, error } = await supabase.functions.invoke('multi-agent-classroom', {
        body: { moduleId, studentQuestion: question || undefined, rounds: 3 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSession(data as Session);
    } catch (e: any) {
      toast({ title: 'Classroom failed to open', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Live Multi-Agent Classroom
          <Badge variant="secondary" className="ml-2 text-xs">Lecturer · Peer · TA</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Optional: open with your question…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <Button onClick={start} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Convening…' : 'Enter Classroom'}
          </Button>
        </div>

        {session && (
          <div className="space-y-3">
            <p className="italic text-sm text-muted-foreground border-l-2 border-primary pl-3">
              {session.opening}
            </p>
            {session.turns.map((t, i) => {
              const m = SPEAKER_META[t.speaker];
              return (
                <div key={i} className={`rounded-lg border p-3 ${m.bg}`}>
                  <p className={`text-xs font-semibold mb-1 ${m.color}`}>{m.name}</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{t.text}</p>
                </div>
              );
            })}
            <div className="rounded-lg border-2 border-dashed border-primary/40 p-3 bg-primary/5">
              <p className="text-xs font-semibold text-primary mb-1">Reflection Prompt</p>
              <p className="text-sm">{session.reflection_prompt}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
