import { supabase } from '@/integrations/supabase/client';
import { underChrist } from '@/lib/lordship';
import type { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'] & {
  student_documents?: Database['public']['Tables']['student_documents']['Row'][];
};

type Graduation = Database['public']['Tables']['graduations']['Row'] & {
  students: { full_name: string; email: string };
};

type Transcript = Database['public']['Tables']['transcripts']['Row'] & {
  courses: { title: string; faculty: string };
};

export const createStudentApplication = underChrist(async (formData: any) => {
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('students')
    .upsert({
      user_id: user.user!.id,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      gender: formData.gender,
      country: formData.country,
      address: formData.address,
      application_status: 'submitted'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
});

export const uploadStudentDocument = underChrist(async (
  studentId: string,
  docType: string,
  file: File
) => {
  const path = `applications/${studentId}/${file.name}`;
  
  const { data: upload, error: uploadError } = await supabase.storage
    .from('materials')
    .upload(path, file, { upsert: true });
  
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('student_documents')
    .insert({
      student_id: studentId,
      doc_type: docType,
      file_url: upload.path
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
});

export const getStudentProfile = underChrist(async () => {
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('students')
    .select('*, student_documents(*)')
    .eq('user_id', user.user!.id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
});

export const getPendingApplications = underChrist(async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*, student_documents(*)')
    .eq('application_status', 'submitted')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
});

export const approveApplication = underChrist(async (studentId: string) => {
  // Generate admission letter
  const { data } = await supabase.functions.invoke('generate-admission-letter', {
    body: { studentId }
  });

  return data;
});

export const rejectApplication = underChrist(async (studentId: string) => {
  const { error } = await supabase
    .from('students')
    .update({ application_status: 'rejected' })
    .eq('id', studentId);
  
  if (error) throw error;
  return { success: true };
});

export const getStudentTranscript = underChrist(async () => {
  const { data: user } = await supabase.auth.getUser();
  
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.user!.id)
    .maybeSingle();

  if (!student) return null;

  const { data, error } = await supabase
    .from('transcripts')
    .select('*, courses(title, faculty)')
    .eq('student_id', student.id)
    .order('completed_at', { ascending: false });
  
  if (error) throw error;
  return data;
});

export const getGraduations = underChrist(async () => {
  const { data, error } = await supabase
    .from('graduations')
    .select('*, students(full_name, email)')
    .order('ceremony_date', { ascending: false });
  
  if (error) throw error;
  return data;
});

export const checkGraduationEligibility = underChrist(async (studentId: string) => {
  // Check if student has completed required courses with passing grades
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('score')
    .eq('student_id', studentId);

  if (!transcripts || transcripts.length === 0) return { eligible: false, gpa: 0 };

  const avgScore = transcripts.reduce((sum, t) => sum + (t.score || 0), 0) / transcripts.length;
  const eligible = avgScore >= 70 && transcripts.length >= 3; // Example criteria

  return { eligible, gpa: avgScore };
});

export const generateGraduationCertificate = underChrist(async (studentId: string) => {
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  const { data: gpa } = await supabase
    .from('student_gpa')
    .select('gpa')
    .eq('student_id', studentId)
    .maybeSingle();

  const honors = (gpa?.gpa || 0) >= 90 ? 'First Class Honors' : 
                 (gpa?.gpa || 0) >= 80 ? 'Second Class Honors' : 'Merit';

  // Generate certificate via existing function
  const { data: cert } = await supabase.functions.invoke('generate-certificate', {
    body: { userId: student.user_id }
  });

  // Record graduation
  const { data, error } = await supabase
    .from('graduations')
    .insert({
      student_id: studentId,
      ceremony_date: new Date().toISOString().split('T')[0],
      certificate_url: cert?.html || '',
      honors
    })
    .select()
    .single();

  if (error) throw error;
  return data;
});
