import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ Academic Terms — Christ governs all seasons of learning");

export interface AcademicTerm {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean | null;
  created_at: string | null;
}

// Fetchers
export async function getAcademicTerms(): Promise<AcademicTerm[]> {
  const { data, error } = await supabase
    .from("academic_terms")
    .select("*")
    .order("start_date", { ascending: false });
  
  if (error) throw error;
  return data as AcademicTerm[];
}

export async function getActiveTerm(): Promise<AcademicTerm | null> {
  const { data, error } = await supabase
    .from("academic_terms")
    .select("*")
    .eq("is_active", true)
    .order("start_date", { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as AcademicTerm | null;
}

export async function getUpcomingTerms(): Promise<AcademicTerm[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from("academic_terms")
    .select("*")
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(5);
  
  if (error) throw error;
  return data as AcademicTerm[];
}

// Hooks
export const useAcademicTerms = () =>
  useQuery({ 
    queryKey: ["academic-terms"], 
    queryFn: getAcademicTerms 
  });

export const useActiveTerm = () =>
  useQuery({ 
    queryKey: ["active-term"], 
    queryFn: getActiveTerm 
  });

export const useUpcomingTerms = () =>
  useQuery({ 
    queryKey: ["upcoming-terms"], 
    queryFn: getUpcomingTerms 
  });

// Helper function to get term status
export function getTermStatus(term: AcademicTerm): 'active' | 'upcoming' | 'past' {
  const now = new Date();
  const startDate = new Date(term.start_date);
  const endDate = new Date(term.end_date);
  
  if (term.is_active && now >= startDate && now <= endDate) {
    return 'active';
  } else if (now < startDate) {
    return 'upcoming';
  }
  return 'past';
}

// Helper function to calculate term progress
export function getTermProgress(term: AcademicTerm): number {
  const now = new Date();
  const startDate = new Date(term.start_date);
  const endDate = new Date(term.end_date);
  
  if (now < startDate) return 0;
  if (now > endDate) return 100;
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  
  return Math.round((elapsed / totalDuration) * 100);
}
