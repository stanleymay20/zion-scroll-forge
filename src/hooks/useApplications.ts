import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logSpiritualEvent } from "@/lib/scrollGovernance";

console.info("✝️ Admissions — Opening doors to Kingdom education");

export interface Application {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  degree_interest?: string;
  spiritual_statement?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getApplications() {
  const { data, error } = await (supabase as any)
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Application[];
}

export async function getUserApplications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Application[];
}

export async function updateApplicationStatus(params: {
  application_id: string;
  status: 'accepted' | 'rejected';
  notes?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("applications")
    .update({
      status: params.status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      notes: params.notes
    })
    .eq("id", params.application_id)
    .select()
    .single();

  if (error) throw error;

  // If accepted, trigger student lifecycle
  if (params.status === 'accepted') {
    const { error: lifecycleError } = await supabase.functions.invoke('student-lifecycle', {
      body: { application_id: params.application_id }
    });

    if (lifecycleError) {
      console.error('Failed to trigger student lifecycle:', lifecycleError);
    }
  }

  await logSpiritualEvent({
    scope: 'admissions',
    action: `application_${params.status}`,
    details: { application_id: params.application_id },
    severity: 'info'
  });

  return data as Application;
}

export const useApplications = () =>
  useQuery({ queryKey: ["applications"], queryFn: getApplications });

export const useUserApplications = () =>
  useQuery({ queryKey: ["user-applications"], queryFn: getUserApplications });

export const useUpdateApplicationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === 'accepted' ? '✝️ Application Accepted' : 'Application Rejected',
        description: variables.status === 'accepted'
          ? 'Student lifecycle initiated — Welcome to the Kingdom!'
          : 'Application has been rejected'
      });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (e: any) => toast({
      title: "Failed to update application",
      description: e.message,
      variant: "destructive"
    })
  });
};
