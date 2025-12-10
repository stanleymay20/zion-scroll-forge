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

export interface CreateTermInput {
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export interface UpdateTermInput {
  id: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
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

export async function getTermById(id: string): Promise<AcademicTerm | null> {
  const { data, error } = await supabase
    .from("academic_terms")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data as AcademicTerm;
}

// Mutations
export async function createTerm(input: CreateTermInput): Promise<AcademicTerm> {
  const { data, error } = await supabase
    .from("academic_terms")
    .insert([input])
    .select()
    .single();
  
  if (error) throw error;
  return data as AcademicTerm;
}

export async function updateTerm(input: UpdateTermInput): Promise<AcademicTerm> {
  const { id, ...updates } = input;
  const { data, error } = await supabase
    .from("academic_terms")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as AcademicTerm;
}

export async function deleteTerm(id: string): Promise<void> {
  const { error } = await supabase
    .from("academic_terms")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
}

export async function setActiveTerm(id: string): Promise<void> {
  // First deactivate all terms
  const { error: deactivateError } = await supabase
    .from("academic_terms")
    .update({ is_active: false })
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all
  
  if (deactivateError) throw deactivateError;
  
  // Then activate the selected term
  const { error: activateError } = await supabase
    .from("academic_terms")
    .update({ is_active: true })
    .eq("id", id);
  
  if (activateError) throw activateError;
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

export const useTerm = (id: string) =>
  useQuery({ 
    queryKey: ["academic-term", id], 
    queryFn: () => getTermById(id),
    enabled: !!id
  });

// Mutation Hooks
export const useCreateTerm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-terms"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-terms"] });
      toast({
        title: "Term Created",
        description: "The academic term has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create academic term.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTerm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTerm,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["academic-terms"] });
      queryClient.invalidateQueries({ queryKey: ["active-term"] });
      queryClient.invalidateQueries({ queryKey: ["academic-term", data.id] });
      toast({
        title: "Term Updated",
        description: "The academic term has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update academic term.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTerm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-terms"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-terms"] });
      toast({
        title: "Term Deleted",
        description: "The academic term has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete academic term.",
        variant: "destructive",
      });
    },
  });
};

export const useSetActiveTerm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: setActiveTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-terms"] });
      queryClient.invalidateQueries({ queryKey: ["active-term"] });
      toast({
        title: "Active Term Updated",
        description: "The active academic term has been changed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set active term.",
        variant: "destructive",
      });
    },
  });
};

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

// Get course offerings for a term
export async function getTermCourseOfferings(termId: string) {
  const { data, error } = await supabase
    .from("course_offerings")
    .select(`
      *,
      courses (
        id,
        title,
        description,
        faculty,
        level
      )
    `)
    .eq("term_id", termId);
  
  if (error) throw error;
  return data;
}

export const useTermCourseOfferings = (termId: string) =>
  useQuery({
    queryKey: ["term-course-offerings", termId],
    queryFn: () => getTermCourseOfferings(termId),
    enabled: !!termId
  });
