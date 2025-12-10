import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FileText, Volume2, Video, Loader2 } from "lucide-react";

interface GenerateMaterialsButtonProps {
  moduleId?: string;
  courseId?: string;
  onComplete?: () => void;
}

export function GenerateMaterialsButton({ 
  moduleId, 
  courseId, 
  onComplete 
}: GenerateMaterialsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!moduleId && !courseId) {
      toast({
        title: "Error",
        description: "Module ID or Course ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-materials', {
        body: moduleId ? { module_id: moduleId } : { course_id: courseId, batch_generate: true }
      });

      if (error) throw error;

      toast({
        title: "✅ Materials Generation Started",
        description: courseId 
          ? `Generating materials for ${data.modules_count} modules. This will take several minutes.`
          : `Generated ${data.materials?.length || 0} materials successfully.`,
      });

      onComplete?.();
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerate} 
      disabled={isGenerating}
      variant="outline"
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          <Volume2 className="h-4 w-4" />
          <Video className="h-4 w-4" />
          Generate All Materials
        </>
      )}
    </Button>
  );
}
