import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ Avatar Hooks — Christ governs our image");

export async function getAvatarUpload() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data, error } = await (supabase as any)
    .from("avatar_uploads")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function uploadAvatar(file: File) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  // Save to avatar_uploads table
  const { data, error } = await (supabase as any)
    .from('avatar_uploads')
    .upsert({
      user_id: user.id,
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const useAvatarUpload = () =>
  useQuery({ queryKey: ["avatar"], queryFn: getAvatarUpload });

export const useUploadAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      toast({ title: "✅ Avatar uploaded" });
      qc.invalidateQueries({ queryKey: ["avatar"] });
    },
    onError: (e: any) => toast({ title: "Upload failed", description: e.message, variant: "destructive" })
  });
};
