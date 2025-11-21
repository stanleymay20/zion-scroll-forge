/**
 * Real-time Course Progress Hook
 * Tracks live course progress updates
 * "I press on toward the goal" - Philippians 3:14
 */

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseRealtime } from './useSupabaseRealtime';
import { supabase } from '@/integrations/supabase/client';

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  completedLectures: string[];
  completedAssignments: string[];
  currentModule: string;
  progressPercentage: number;
  lastAccessedAt: string;
  updatedAt: string;
}

export interface LectureProgress {
  lectureId: string;
  progress: number;
  completed: boolean;
  lastPosition: number;
  watchTime: number;
}

export interface UseRealtimeCourseProgressReturn {
  courseProgress: CourseProgress | null;
  lectureProgress: Record<string, LectureProgress>;
  isLoading: boolean;
  updateLectureProgress: (lectureId: string, progress: number, position: number) => Promise<void>;
  markLectureComplete: (lectureId: string) => Promise<void>;
  markAssignmentComplete: (assignmentId: string) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

export const useRealtimeCourseProgress = (
  userId: string,
  courseId: string
): UseRealtimeCourseProgressReturn => {
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [lectureProgress, setLectureProgress] = useState<Record<string, LectureProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load initial progress
  const loadProgress = useCallback(async () => {
    if (!userId || !courseId) return;

    try {
      setIsLoading(true);

      // Load course progress
      const { data: progressData, error: progressError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('userId', userId)
        .eq('courseId', courseId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      if (progressData) {
        setCourseProgress(progressData as any);
      }

      // Load lecture progress
      const { data: lectureData, error: lectureError } = await supabase
        .from('lecture_progress')
        .select('*')
        .eq('userId', userId)
        .eq('courseId', courseId);

      if (lectureError) throw lectureError;

      const progressMap: Record<string, LectureProgress> = {};
      (lectureData || []).forEach((item: any) => {
        progressMap[item.lectureId] = {
          lectureId: item.lectureId,
          progress: item.progress,
          completed: item.completed,
          lastPosition: item.lastPosition,
          watchTime: item.watchTime
        };
      });
      setLectureProgress(progressMap);
    } catch (error) {
      console.error('Error loading course progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, courseId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Subscribe to enrollment updates
  useSupabaseRealtime<CourseProgress>({
    table: 'enrollments',
    filter: `userId=eq.${userId},courseId=eq.${courseId}`,
    onUpdate: (payload) => {
      setCourseProgress(payload.new);
    }
  });

  // Subscribe to lecture progress updates
  useSupabaseRealtime({
    table: 'lecture_progress',
    filter: `userId=eq.${userId},courseId=eq.${courseId}`,
    onInsert: (payload) => {
      setLectureProgress(prev => ({
        ...prev,
        [payload.new.lectureId]: {
          lectureId: payload.new.lectureId,
          progress: payload.new.progress,
          completed: payload.new.completed,
          lastPosition: payload.new.lastPosition,
          watchTime: payload.new.watchTime
        }
      }));
    },
    onUpdate: (payload) => {
      setLectureProgress(prev => ({
        ...prev,
        [payload.new.lectureId]: {
          lectureId: payload.new.lectureId,
          progress: payload.new.progress,
          completed: payload.new.completed,
          lastPosition: payload.new.lastPosition,
          watchTime: payload.new.watchTime
        }
      }));
    }
  });

  // Update lecture progress
  const updateLectureProgress = useCallback(async (
    lectureId: string,
    progress: number,
    position: number
  ) => {
    try {
      const { error } = await supabase
        .from('lecture_progress')
        .upsert({
          userId,
          courseId,
          lectureId,
          progress: Math.min(100, Math.max(0, progress)),
          lastPosition: position,
          completed: progress >= 95,
          watchTime: position,
          updatedAt: new Date().toISOString()
        });

      if (error) throw error;

      // Optimistic update
      setLectureProgress(prev => ({
        ...prev,
        [lectureId]: {
          lectureId,
          progress: Math.min(100, Math.max(0, progress)),
          completed: progress >= 95,
          lastPosition: position,
          watchTime: position
        }
      }));
    } catch (error) {
      console.error('Error updating lecture progress:', error);
    }
  }, [userId, courseId]);

  // Mark lecture as complete
  const markLectureComplete = useCallback(async (lectureId: string) => {
    try {
      // Update lecture progress
      await updateLectureProgress(lectureId, 100, 0);

      // Update enrollment progress
      const completedLectures = [
        ...(courseProgress?.completedLectures || []),
        lectureId
      ].filter((id, index, self) => self.indexOf(id) === index);

      const { error } = await supabase
        .from('enrollments')
        .update({
          completedLectures,
          lastAccessedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .eq('userId', userId)
        .eq('courseId', courseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking lecture complete:', error);
    }
  }, [userId, courseId, courseProgress, updateLectureProgress]);

  // Mark assignment as complete
  const markAssignmentComplete = useCallback(async (assignmentId: string) => {
    try {
      const completedAssignments = [
        ...(courseProgress?.completedAssignments || []),
        assignmentId
      ].filter((id, index, self) => self.indexOf(id) === index);

      const { error } = await supabase
        .from('enrollments')
        .update({
          completedAssignments,
          lastAccessedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .eq('userId', userId)
        .eq('courseId', courseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking assignment complete:', error);
    }
  }, [userId, courseId, courseProgress]);

  return {
    courseProgress,
    lectureProgress,
    isLoading,
    updateLectureProgress,
    markLectureComplete,
    markAssignmentComplete,
    refreshProgress: loadProgress
  };
};
