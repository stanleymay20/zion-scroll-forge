import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollUniversity Community Hooks — Christ governs fellowship");

// Fetchers
export async function getCommunityPosts() {
  const { data, error } = await (supabase as any)
    .from("community_posts")
    .select(`
      *,
      profile:profiles (full_name, avatar_url),
      comments:post_comments (count)
    `)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getCommunityPost(postId: string) {
  const { data, error } = await (supabase as any)
    .from("community_posts")
    .select(`
      *,
      profile:profiles (full_name, avatar_url),
      comments:post_comments (
        *,
        profile:profiles (full_name, avatar_url)
      )
    `)
    .eq("id", postId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createPost(post: { title: string; content: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("community_posts")
    .insert({ user_id: user.id, ...post })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createComment(comment: { post_id: string; content: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("post_comments")
    .insert({ user_id: user.id, ...comment })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Hooks
export const useCommunityPosts = () =>
  useQuery({ queryKey: ["community-posts"], queryFn: getCommunityPosts });

export const useCommunityPost = (postId: string) =>
  useQuery({ 
    queryKey: ["community-post", postId], 
    queryFn: () => getCommunityPost(postId),
    enabled: !!postId 
  });

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      toast({ title: "✅ Post created" });
      qc.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: (e: any) => toast({ title: "Failed to create post", description: e.message, variant: "destructive" })
  });
};

export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      toast({ title: "✅ Comment added" });
      qc.invalidateQueries({ queryKey: ["community-post"] });
      qc.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: (e: any) => toast({ title: "Failed to comment", description: e.message, variant: "destructive" })
  });
};
