import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/faculty';

export const useTeachingCourses = () =>
  useQuery({ 
    queryKey: ['teaching-courses'], 
    queryFn: api.listTeachingCourses 
  });

export const useGradingQueue = (courseId?: string) =>
  useQuery({ 
    queryKey: ['grading-queue', courseId], 
    queryFn: () => api.getGradingQueue(courseId) 
  });

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    }
  });
};

export const useAddQuizQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addQuizQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
    }
  });
};

export const usePublishAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, published }: { assignmentId: string; published: boolean }) =>
      api.publishAssignment(assignmentId, published),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    }
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.submitQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    }
  });
};

export const useAssignments = (courseId: string) =>
  useQuery({
    queryKey: ['assignments', courseId],
    queryFn: () => api.getAssignments(courseId)
  });

export const useLearningMaterials = (moduleId: string) =>
  useQuery({
    queryKey: ['learning-materials', moduleId],
    queryFn: () => api.getLearningMaterials(moduleId)
  });

export const useAddLearningMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addLearningMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-materials'] });
    }
  });
};

export const useGradebook = (courseId: string) =>
  useQuery({
    queryKey: ['gradebook', courseId],
    queryFn: () => api.getGradebook(courseId)
  });

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, score, feedback }: { submissionId: string; score: number; feedback: string }) =>
      api.gradeSubmission(submissionId, score, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradebook'] });
      queryClient.invalidateQueries({ queryKey: ['grading-queue'] });
    }
  });
};
