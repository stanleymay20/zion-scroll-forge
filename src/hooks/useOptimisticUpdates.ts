/**
 * Optimistic Updates Hook
 * Manages optimistic UI updates with automatic rollback
 * "Faith is confidence in what we hope for" - Hebrews 11:1
 */

import { useState, useCallback, useRef } from 'react';

export interface OptimisticUpdate<T> {
  id: string;
  data: T;
  originalData: T;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface UseOptimisticUpdatesReturn<T> {
  data: T[];
  pendingUpdates: OptimisticUpdate<T>[];
  addOptimistic: (item: T, operation: () => Promise<T>) => Promise<T>;
  updateOptimistic: (id: string, updates: Partial<T>, operation: () => Promise<T>) => Promise<T>;
  deleteOptimistic: (id: string, operation: () => Promise<void>) => Promise<void>;
  rollback: (updateId: string) => void;
  rollbackAll: () => void;
  confirmUpdate: (updateId: string) => void;
}

export const useOptimisticUpdates = <T extends { id: string }>(
  initialData: T[] = []
): UseOptimisticUpdatesReturn<T> => {
  const [data, setData] = useState<T[]>(initialData);
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate<T>[]>([]);
  const updateTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Add item optimistically
  const addOptimistic = useCallback(async (
    item: T,
    operation: () => Promise<T>
  ): Promise<T> => {
    const updateId = `add_${item.id}_${Date.now()}`;

    // Optimistic update
    setData(prev => [...prev, item]);

    const update: OptimisticUpdate<T> = {
      id: updateId,
      data: item,
      originalData: item,
      timestamp: Date.now(),
      status: 'pending'
    };

    setPendingUpdates(prev => [...prev, update]);

    // Set timeout for automatic rollback
    const timeout = setTimeout(() => {
      rollback(updateId);
    }, 30000); // 30 seconds timeout

    updateTimeoutsRef.current.set(updateId, timeout);

    try {
      // Perform actual operation
      const result = await operation();

      // Clear timeout
      const existingTimeout = updateTimeoutsRef.current.get(updateId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        updateTimeoutsRef.current.delete(updateId);
      }

      // Confirm update with actual data
      setData(prev => prev.map(i => i.id === item.id ? result : i));
      setPendingUpdates(prev =>
        prev.map(u => u.id === updateId ? { ...u, status: 'confirmed' as const } : u)
      );

      // Remove confirmed update after delay
      setTimeout(() => {
        setPendingUpdates(prev => prev.filter(u => u.id !== updateId));
      }, 1000);

      return result;
    } catch (error) {
      console.error('Optimistic add failed:', error);

      // Mark as failed
      setPendingUpdates(prev =>
        prev.map(u => u.id === updateId ? { ...u, status: 'failed' as const } : u)
      );

      // Rollback
      rollback(updateId);

      throw error;
    }
  }, []);

  // Update item optimistically
  const updateOptimistic = useCallback(async (
    id: string,
    updates: Partial<T>,
    operation: () => Promise<T>
  ): Promise<T> => {
    const updateId = `update_${id}_${Date.now()}`;

    // Find original item
    const originalItem = data.find(item => item.id === id);
    if (!originalItem) {
      throw new Error(`Item with id ${id} not found`);
    }

    // Optimistic update
    const updatedItem = { ...originalItem, ...updates };
    setData(prev => prev.map(item => item.id === id ? updatedItem : item));

    const update: OptimisticUpdate<T> = {
      id: updateId,
      data: updatedItem,
      originalData: originalItem,
      timestamp: Date.now(),
      status: 'pending'
    };

    setPendingUpdates(prev => [...prev, update]);

    // Set timeout for automatic rollback
    const timeout = setTimeout(() => {
      rollback(updateId);
    }, 30000);

    updateTimeoutsRef.current.set(updateId, timeout);

    try {
      // Perform actual operation
      const result = await operation();

      // Clear timeout
      const existingTimeout = updateTimeoutsRef.current.get(updateId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        updateTimeoutsRef.current.delete(updateId);
      }

      // Confirm update with actual data
      setData(prev => prev.map(i => i.id === id ? result : i));
      setPendingUpdates(prev =>
        prev.map(u => u.id === updateId ? { ...u, status: 'confirmed' as const } : u)
      );

      // Remove confirmed update after delay
      setTimeout(() => {
        setPendingUpdates(prev => prev.filter(u => u.id !== updateId));
      }, 1000);

      return result;
    } catch (error) {
      console.error('Optimistic update failed:', error);

      // Mark as failed
      setPendingUpdates(prev =>
        prev.map(u => u.id === updateId ? { ...u, status: 'failed' as const } : u)
      );

      // Rollback
      rollback(updateId);

      throw error;
    }
  }, [data]);

  // Delete item optimistically
  const deleteOptimistic = useCallback(async (
    id: string,
    operation: () => Promise<void>
  ): Promise<void> => {
    const updateId = `delete_${id}_${Date.now()}`;

    // Find original item
    const originalItem = data.find(item => item.id === id);
    if (!originalItem) {
      throw new Error(`Item with id ${id} not found`);
    }

    // Optimistic delete
    setData(prev => prev.filter(item => item.id !== id));

    const update: OptimisticUpdate<T> = {
      id: updateId,
      data: originalItem,
      originalData: originalItem,
      timestamp: Date.now(),
      status: 'pending'
    };

    setPendingUpdates(prev => [...prev, update]);

    // Set timeout for automatic rollback
    const timeout = setTimeout(() => {
      rollback(updateId);
    }, 30000);

    updateTimeoutsRef.current.set(updateId, timeout);

    try {
      // Perform actual operation
      await operation();

      // Clear timeout
      const existingTimeout = updateTimeoutsRef.current.get(updateId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        updateTimeoutsRef.current.delete(updateId);
      }

      // Confirm delete
      setPendingUpdates(prev =>
        prev.map(u => u.id === updateId ? { ...u, status: 'confirmed' as const } : u)
      );

      // Remove confirmed update after delay
      setTimeout(() => {
        setPendingUpdates(prev => prev.filter(u => u.id !== updateId));
      }, 1000);
    } catch (error) {
      console.error('Optimistic delete failed:', error);

      // Mark as failed
      setPendingUpdates(prev =>
        prev.map(u => u.id === updateId ? { ...u, status: 'failed' as const } : u)
      );

      // Rollback
      rollback(updateId);

      throw error;
    }
  }, [data]);

  // Rollback specific update
  const rollback = useCallback((updateId: string) => {
    const update = pendingUpdates.find(u => u.id === updateId);
    if (!update) return;

    // Clear timeout
    const timeout = updateTimeoutsRef.current.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      updateTimeoutsRef.current.delete(updateId);
    }

    if (updateId.startsWith('add_')) {
      // Remove added item
      setData(prev => prev.filter(item => item.id !== update.data.id));
    } else if (updateId.startsWith('update_')) {
      // Restore original item
      setData(prev =>
        prev.map(item => item.id === update.originalData.id ? update.originalData : item)
      );
    } else if (updateId.startsWith('delete_')) {
      // Restore deleted item
      setData(prev => [...prev, update.originalData]);
    }

    // Remove from pending updates
    setPendingUpdates(prev => prev.filter(u => u.id !== updateId));
  }, [pendingUpdates]);

  // Rollback all pending updates
  const rollbackAll = useCallback(() => {
    pendingUpdates.forEach(update => {
      rollback(update.id);
    });
  }, [pendingUpdates, rollback]);

  // Confirm update manually
  const confirmUpdate = useCallback((updateId: string) => {
    // Clear timeout
    const timeout = updateTimeoutsRef.current.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      updateTimeoutsRef.current.delete(updateId);
    }

    setPendingUpdates(prev =>
      prev.map(u => u.id === updateId ? { ...u, status: 'confirmed' as const } : u)
    );

    // Remove confirmed update after delay
    setTimeout(() => {
      setPendingUpdates(prev => prev.filter(u => u.id !== updateId));
    }, 1000);
  }, []);

  return {
    data,
    pendingUpdates,
    addOptimistic,
    updateOptimistic,
    deleteOptimistic,
    rollback,
    rollbackAll,
    confirmUpdate
  };
};
