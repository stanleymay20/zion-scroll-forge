import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollUniversity Study Groups — Christ governs collaborative learning");

// Fetchers
export async function getStudyGroups() {
  const { data, error } = await (supabase as any)
    .from("study_groups")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getStudyGroup(groupId: string) {
  const { data, error } = await (supabase as any)
    .from("study_groups")
    .select(`
      *,
      creator:profiles!creator_id(full_name, avatar_url),
      members:study_group_members(
        *,
        user:profiles!user_id(full_name, avatar_url)
      )
    `)
    .eq("id", groupId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createStudyGroup(group: { name: string; description?: string; course_id?: string; is_public?: boolean }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("study_groups")
    .insert({ creator_id: user.id, ...group })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function joinStudyGroup(groupId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("study_group_members")
    .insert({ group_id: groupId, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function leaveStudyGroup(groupId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await (supabase as any)
    .from("study_group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  if (error) throw error;
  return { success: true };
}

// Hooks
export const useStudyGroups = () =>
  useQuery({ queryKey: ["study-groups"], queryFn: getStudyGroups });

export const useStudyGroup = (groupId: string) =>
  useQuery({ 
    queryKey: ["study-group", groupId], 
    queryFn: () => getStudyGroup(groupId),
    enabled: !!groupId 
  });

export const useCreateStudyGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStudyGroup,
    onSuccess: () => {
      toast({ title: "✅ Study group created" });
      qc.invalidateQueries({ queryKey: ["study-groups"] });
    },
    onError: (e: any) => toast({ title: "Failed to create group", description: e.message, variant: "destructive" })
  });
};

export const useJoinStudyGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: joinStudyGroup,
    onSuccess: () => {
      toast({ title: "✅ Joined study group" });
      qc.invalidateQueries({ queryKey: ["study-groups"] });
      qc.invalidateQueries({ queryKey: ["study-group"] });
    },
    onError: (e: any) => toast({ title: "Failed to join group", description: e.message, variant: "destructive" })
  });
};

export const useLeaveStudyGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leaveStudyGroup,
    onSuccess: () => {
      toast({ title: "✅ Left study group" });
      qc.invalidateQueries({ queryKey: ["study-groups"] });
      qc.invalidateQueries({ queryKey: ["study-group"] });
    },
    onError: (e: any) => toast({ title: "Failed to leave group", description: e.message, variant: "destructive" })
  });
};
