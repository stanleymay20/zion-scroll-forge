import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ModuleNotes {
  id: string;
  user_id: string;
  module_id: string;
  notes: string | null;
  scripture_connections: string | null;
  application_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useModuleNotes(moduleId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ['module-notes', moduleId, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('module_notes')
        .select('*')
        .eq('module_id', moduleId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as ModuleNotes | null;
    },
    enabled: !!userId && !!moduleId,
  });
}

export function useSaveModuleNotes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      moduleId,
      userId,
      notes,
      scriptureConnections,
      applicationNotes,
    }: {
      moduleId: string;
      userId: string;
      notes: string;
      scriptureConnections: string;
      applicationNotes: string;
    }) => {
      const { data, error } = await supabase
        .from('module_notes')
        .upsert({
          module_id: moduleId,
          user_id: userId,
          notes,
          scripture_connections: scriptureConnections,
          application_notes: applicationNotes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['module-notes', variables.moduleId, variables.userId] 
      });
      toast({
        title: 'Notes saved',
        description: 'Your reflections have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error saving notes',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
