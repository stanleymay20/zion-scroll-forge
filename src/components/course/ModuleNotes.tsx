import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BookOpen, Save } from 'lucide-react';
import { useModuleNotes, useSaveModuleNotes } from '@/hooks/useModuleNotes';

interface ModuleNotesProps {
  moduleId: string;
  userId: string | undefined;
}

export function ModuleNotes({ moduleId, userId }: ModuleNotesProps) {
  const { data: existingNotes } = useModuleNotes(moduleId, userId);
  const saveNotes = useSaveModuleNotes();

  const [notes, setNotes] = useState('');
  const [scriptureConnections, setScriptureConnections] = useState('');
  const [applicationNotes, setApplicationNotes] = useState('');

  useEffect(() => {
    if (existingNotes) {
      setNotes(existingNotes.notes || '');
      setScriptureConnections(existingNotes.scripture_connections || '');
      setApplicationNotes(existingNotes.application_notes || '');
    }
  }, [existingNotes]);

  const handleSave = () => {
    if (!userId) return;

    saveNotes.mutate({
      moduleId,
      userId,
      notes,
      scriptureConnections,
      applicationNotes,
    });
  };

  const hasChanges =
    notes !== (existingNotes?.notes || '') ||
    scriptureConnections !== (existingNotes?.scripture_connections || '') ||
    applicationNotes !== (existingNotes?.application_notes || '');

  if (!userId) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Personal Study Notes
        </CardTitle>
        <CardDescription>
          Record your reflections, scripture connections, and practical applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Personal Reflections</Label>
          <Textarea
            id="notes"
            placeholder="What insights did God reveal to you through this module?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scripture">Scripture Connections</Label>
          <Textarea
            id="scripture"
            placeholder="What Bible verses or passages relate to this teaching?"
            value={scriptureConnections}
            onChange={(e) => setScriptureConnections(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="application">Practical Application</Label>
          <Textarea
            id="application"
            placeholder="How will you apply this knowledge in your life and ministry?"
            value={applicationNotes}
            onChange={(e) => setApplicationNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || saveNotes.isPending}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveNotes.isPending ? 'Saving...' : 'Save Notes'}
        </Button>
      </CardContent>
    </Card>
  );
}
