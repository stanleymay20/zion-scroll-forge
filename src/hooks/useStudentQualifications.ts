import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ Student Qualifications — Verifying readiness for kingdom education");

export interface StudentQualification {
  id: string;
  user_id: string;
  qualification_type: 'scroll_degree' | 'external_degree' | 'certificate' | 'diploma';
  qualification_name: string;
  level: string;
  institution_name?: string;
  field_of_study?: string;
  graduation_date?: string;
  is_verified: boolean;
  verification_document_url?: string;
  scroll_degree_id?: string;
  created_at: string;
}

export interface DegreePrerequisite {
  id: string;
  degree_level: string;
  prerequisite_type: 'scroll_degree' | 'external_degree' | 'experience' | 'assessment' | 'courses_completed';
  prerequisite_level?: string;
  min_courses_completed?: number;
  min_credits?: number;
  min_xp?: number;
  description: string;
  is_required: boolean;
  alternative_path?: string;
}

export interface DegreeApplication {
  id: string;
  user_id: string;
  degree_id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'conditional';
  applied_at: string;
  reviewed_at?: string;
  qualifications_submitted: any[];
  prerequisites_met: Record<string, boolean>;
  reviewer_notes?: string;
  conditions?: string;
}

// Level hierarchy for comparison
const LEVEL_HIERARCHY: Record<string, number> = {
  'certificate': 1,
  'ScrollCertificate': 1,
  'diploma': 2,
  'ScrollDiploma': 2,
  'bachelor': 3,
  'ScrollBachelor': 3,
  'master': 4,
  'ScrollMaster': 4,
  'doctorate': 5,
  'ScrollDoctorate': 5,
  'ScrollExousia': 6
};

// Fetchers
export async function getStudentQualifications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("student_qualifications")
    .select("*")
    .eq("user_id", user.id)
    .order("graduation_date", { ascending: false });

  if (error) throw error;
  return data as StudentQualification[];
}

export async function getDegreePrerequisites(degreeLevel: string) {
  const { data, error } = await supabase
    .from("degree_prerequisites")
    .select("*")
    .eq("degree_level", degreeLevel)
    .order("is_required", { ascending: false });

  if (error) throw error;
  return data as DegreePrerequisite[];
}

export async function getAllDegreePrerequisites() {
  const { data, error } = await supabase
    .from("degree_prerequisites")
    .select("*")
    .order("degree_level");

  if (error) throw error;
  return data as DegreePrerequisite[];
}

export async function checkPrerequisitesMet(degreeLevel: string): Promise<{
  eligible: boolean;
  prerequisites: Array<DegreePrerequisite & { met: boolean; userQualification?: StudentQualification }>;
  missingRequired: DegreePrerequisite[];
  alternativePaths: string[];
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get prerequisites for this degree level
  const prerequisites = await getDegreePrerequisites(degreeLevel);
  
  // Get user's qualifications
  const qualifications = await getStudentQualifications();
  
  // Get user's completed courses count
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, progress")
    .eq("user_id", user.id)
    .gte("progress", 100);
  
  const completedCourses = enrollments?.length || 0;

  // Check each prerequisite
  const prerequisiteResults = prerequisites.map(prereq => {
    let met = false;
    let userQualification: StudentQualification | undefined;

    switch (prereq.prerequisite_type) {
      case 'scroll_degree':
        // Check if user has the required scroll degree level or higher
        userQualification = qualifications.find(q => 
          q.qualification_type === 'scroll_degree' && 
          LEVEL_HIERARCHY[q.level] >= LEVEL_HIERARCHY[prereq.prerequisite_level || '']
        );
        met = !!userQualification;
        break;

      case 'external_degree':
        // Check if user has external degree at required level or higher
        userQualification = qualifications.find(q => 
          q.qualification_type === 'external_degree' && 
          LEVEL_HIERARCHY[q.level] >= LEVEL_HIERARCHY[prereq.prerequisite_level || '']
        );
        met = !!userQualification;
        break;

      case 'courses_completed':
        met = prereq.min_courses_completed ? completedCourses >= prereq.min_courses_completed : true;
        break;

      case 'experience':
      case 'assessment':
        // These need manual verification or assessment completion
        met = false;
        break;
    }

    return { ...prereq, met, userQualification };
  });

  // Determine eligibility
  const missingRequired = prerequisiteResults
    .filter(p => p.is_required && !p.met)
    .map(({ met, userQualification, ...prereq }) => prereq);

  // Check alternative paths
  const alternativePaths = missingRequired
    .filter(p => p.alternative_path)
    .map(p => p.alternative_path as string);

  // For ScrollCertificate (open enrollment), always eligible
  const eligible = degreeLevel === 'ScrollCertificate' || missingRequired.length === 0;

  return {
    eligible,
    prerequisites: prerequisiteResults,
    missingRequired,
    alternativePaths
  };
}

export async function addQualification(qualification: Omit<StudentQualification, 'id' | 'user_id' | 'is_verified' | 'created_at'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("student_qualifications")
    .insert({
      ...qualification,
      user_id: user.id,
      is_verified: false
    })
    .select()
    .single();

  if (error) throw error;
  return data as StudentQualification;
}

export async function submitDegreeApplication(degreeId: string, qualificationIds: string[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get degree details to check level
  const { data: degree } = await supabase
    .from("degree_programs")
    .select("scroll_level")
    .eq("id", degreeId)
    .single();

  if (!degree) throw new Error("Degree program not found");

  // Check prerequisites
  const prereqCheck = await checkPrerequisitesMet(degree.scroll_level || 'ScrollCertificate');
  
  const prerequisitesMet: Record<string, boolean> = {};
  prereqCheck.prerequisites.forEach(p => {
    prerequisitesMet[p.id] = p.met;
  });

  const { data, error } = await supabase
    .from("degree_applications")
    .insert({
      user_id: user.id,
      degree_id: degreeId,
      status: prereqCheck.eligible ? 'approved' : 'pending',
      qualifications_submitted: qualificationIds,
      prerequisites_met: prerequisitesMet
    })
    .select()
    .single();

  if (error) throw error;
  return { application: data, eligible: prereqCheck.eligible, missingRequired: prereqCheck.missingRequired };
}

export async function getUserDegreeApplications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("degree_applications")
    .select(`
      *,
      degree:degree_programs (*)
    `)
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Hooks
export const useStudentQualifications = () =>
  useQuery({ 
    queryKey: ["student-qualifications"], 
    queryFn: getStudentQualifications 
  });

export const useDegreePrerequisites = (degreeLevel: string) =>
  useQuery({
    queryKey: ["degree-prerequisites", degreeLevel],
    queryFn: () => getDegreePrerequisites(degreeLevel),
    enabled: !!degreeLevel
  });

export const useAllDegreePrerequisites = () =>
  useQuery({
    queryKey: ["all-degree-prerequisites"],
    queryFn: getAllDegreePrerequisites
  });

export const useCheckPrerequisites = (degreeLevel: string) =>
  useQuery({
    queryKey: ["check-prerequisites", degreeLevel],
    queryFn: () => checkPrerequisitesMet(degreeLevel),
    enabled: !!degreeLevel
  });

export const useAddQualification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addQualification,
    onSuccess: () => {
      toast({ title: "✅ Qualification added successfully" });
      qc.invalidateQueries({ queryKey: ["student-qualifications"] });
    },
    onError: (e: any) => toast({
      title: "Failed to add qualification",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useSubmitDegreeApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ degreeId, qualificationIds }: { degreeId: string; qualificationIds: string[] }) =>
      submitDegreeApplication(degreeId, qualificationIds),
    onSuccess: (result) => {
      if (result.eligible) {
        toast({ title: "✝️ Application approved — You may proceed with enrollment" });
      } else {
        toast({ 
          title: "📋 Application submitted for review",
          description: "Your application is pending approval based on prerequisite verification"
        });
      }
      qc.invalidateQueries({ queryKey: ["user-degree-applications"] });
    },
    onError: (e: any) => toast({
      title: "Failed to submit application",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useUserDegreeApplications = () =>
  useQuery({
    queryKey: ["user-degree-applications"],
    queryFn: getUserDegreeApplications
  });
