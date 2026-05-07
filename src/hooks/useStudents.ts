import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/students';

export const useStudentProfile = () =>
  useQuery({
    queryKey: ['student-profile'],
    queryFn: api.getStudentProfile
  });

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createStudentApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    }
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, docType, file }: { studentId: string; docType: string; file: File }) =>
      api.uploadStudentDocument(studentId, docType, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    }
  });
};

export const usePendingApplications = () =>
  useQuery({
    queryKey: ['pending-applications'],
    queryFn: api.getPendingApplications
  });

export const useApproveApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.approveApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-applications'] });
    }
  });
};

export const useRejectApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, reason }: { studentId: string; reason?: string }) =>
      api.rejectApplication(studentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-applications'] });
    }
  });
};

export const useWaitlistApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, reason }: { studentId: string; reason?: string }) =>
      api.waitlistApplication(studentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-applications'] });
    }
  });
};

export const useAIPrescreen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.aiPrescreenApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-applications'] });
    }
  });
};

export const useStudentTranscript = () =>
  useQuery({
    queryKey: ['student-transcript'],
    queryFn: api.getStudentTranscript
  });

export const useGraduations = () =>
  useQuery({
    queryKey: ['graduations'],
    queryFn: api.getGraduations
  });

export const useGenerateGraduationCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.generateGraduationCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graduations'] });
    }
  });
};
