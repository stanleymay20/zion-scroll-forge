import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ Content Generation Hooks — Christ governs creation");

export interface ContentGenerationParams {
  faculty_id?: string;
  course_count?: number;
  modules_per_course?: number;
}

export async function generateContent(params: ContentGenerationParams = {}) {
  const { data, error } = await supabase.functions.invoke("generate-content", {
    body: params
  });
  
  if (error) throw error;
  return data;
}

export async function checkGenerationProgress() {
  const { data, error } = await supabase
    .from("generation_progress")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  return data;
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
