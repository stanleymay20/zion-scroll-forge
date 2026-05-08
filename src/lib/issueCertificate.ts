import { supabase } from "@/integrations/supabase/client";

export type CertType = "course" | "program" | "degree" | "transcript" | "matriculation" | "seal";

export async function issueCertificate(params: {
  userId: string;
  certType: CertType;
  programName: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabase.rpc("issue_certificate", {
    p_user_id: params.userId,
    p_cert_type: params.certType,
    p_program_name: params.programName,
    p_entity_id: params.entityId ?? null,
    p_metadata: (params.metadata ?? {}) as never,
  });
  if (error) throw error;
  return data as { cert_number: string; seal_hash?: string; reused: boolean };
}
