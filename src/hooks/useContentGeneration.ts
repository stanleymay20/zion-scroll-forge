import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ Content Generation Hooks — Christ governs creation");

export interface ContentGenerationParams {
  institution_id?: string;
  faculty_id?: string;
  course_count?: number;
  modules_per_course?: number;
}

export interface GenerationProgress {
  id: string;
  institution_id?: string;
  progress: number;
  current_stage: string;
  faculties_created: number;
  courses_created: number;
  modules_created: number;
  tutors_created: number;
  estimated_time_remaining?: string;
  created_at: string;
  updated_at: string;
}

export async function generateContent(params: ContentGenerationParams = {}) {
  const { data, error } = await supabase.functions.invoke("generate-content", {
    body: params
  });
  
  if (error) throw error;
  return data;
}

export async function checkGenerationProgress(institutionId?: string): Promise<GenerationProgress | null> {
  const query = supabase
    .from("generation_progress" as any)
    .select("*")
    .order("created_at", { ascending: false });

  // Filter by institution if provided
  const finalQuery = institutionId 
    ? query.eq("institution_id", institutionId)
    : query;

  const { data, error } = await finalQuery
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  return data as unknown as GenerationProgress | null;
}

export const useGenerateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: generateContent,
    onSuccess: () => {
      toast({
        title: "✅ Content generation started",
        description: "This will take several minutes. Check progress in the admin dashboard."
      });
      queryClient.invalidateQueries({ queryKey: ["generation-progress"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
