import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

console.info("✝️ Assignment Upload — Christ governs submission");

export default function AssignmentUpload() {
  const { assignmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [textAnswer, setTextAnswer] = useState("");

  const { data: assignment } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          *,
          courses(title)
        `)
        .eq("id", assignmentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!assignmentId,
  });

  const { data: existingSubmission } = useQuery({
    queryKey: ["submission", assignmentId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", assignmentId)
        .eq("user_id", user!.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!assignmentId && !!user,
  });

  const submitAssignment = useMutation({
    mutationFn: async () => {
      let fileUrl = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user!.id}/${assignmentId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("materials")
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from("materials").getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("submissions")
        .insert({
          assignment_id: assignmentId,
          user_id: user!.id,
          answers: { text: textAnswer },
          file_url: fileUrl,
          status: "submitted",
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission"] });
      toast({ title: "✅ Assignment submitted successfully!" });
      navigate(-1);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (existingSubmission) {
    return (
      <PageTemplate title="Assignment Submitted" description="You have already submitted this assignment">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Submission Received
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Submitted:</p>
                <p>{formatDistanceToNow(new Date(existingSubmission.submitted_at), { addSuffix: true })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status:</p>
                <p className="capitalize">{existingSubmission.status}</p>
              </div>
              {existingSubmission.file_url && (
                <div>
                  <p className="text-sm text-muted-foreground">File:</p>
                  <a href={existingSubmission.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    View Submission
                  </a>
                </div>
              )}
              <Button variant="outline" onClick={() => navigate(-1)}>
                Back to Course
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title={assignment?.title || "Submit Assignment"} description={assignment?.courses?.title}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Assignment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{assignment?.description}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Due: {assignment?.due_at ? new Date(assignment.due_at).toLocaleDateString() : "No deadline"}</span>
              </div>
              <div>
                <span>Points: {assignment?.total_points || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload File (Optional)</label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT (max 10MB)</p>
                </label>
              </div>
            </div>

            {/* Text Answer */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Written Response</label>
              <Textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[200px]"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                onClick={() => submitAssignment.mutate()}
                disabled={(!file && !textAnswer.trim()) || submitAssignment.isPending}
              >
                <FileText className="mr-2 h-4 w-4" />
                Submit Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
