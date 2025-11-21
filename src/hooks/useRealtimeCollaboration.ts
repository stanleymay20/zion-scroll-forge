/**
 * Real-time Collaboration Hook
 * Manages collaborative features with optimistic updates
 * "Two are better than one" - Ecclesiastes 4:9
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSupabasePresence, useSupabaseBroadcast } from './useSupabaseRealtime';
import { supabase } from '@/integrations/supabase/client';

export interface CollaborativeDocument {
  id: string;
  content: string;
  version: number;
  lastEditedBy: string;
  lastEditedAt: string;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  position: number;
  selection?: { start: number; end: number };
  color: string;
}

export interface CollaborativeEdit {
  userId: string;
  userName: string;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  timestamp: string;
}

export interface UseRealtimeCollaborationReturn {
  document: CollaborativeDocument | null;
  onlineUsers: any[];
  cursors: CursorPosition[];
  pendingEdits: CollaborativeEdit[];
  isConnected: boolean;
  updateContent: (content: string, optimistic?: boolean) => Promise<void>;
  updateCursor: (position: number, selection?: { start: number; end: number }) => void;
  applyEdit: (edit: CollaborativeEdit) => void;
  rollbackEdit: (editId: string) => void;
}

export const useRealtimeCollaboration = (
  documentId: string,
  userId: string,
  userName: string
): UseRealtimeCollaborationReturn => {
  const [document, setDocument] = useState<CollaborativeDocument | null>(null);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [pendingEdits, setPendingEdits] = useState<CollaborativeEdit[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const documentRef = useRef<CollaborativeDocument | null>(null);
  const optimisticUpdatesRef = useRef<Map<string, any>>(new Map());

  // Assign random color for cursor
  const userColor = useRef(
    `hsl(${Math.random() * 360}, 70%, 50%)`
  ).current;

  // Load initial document
  useEffect(() => {
    if (!documentId) return;

    const loadDocument = async () => {
      try {
        const { data, error } = await supabase
          .from('collaborative_documents')
          .select('*')
          .eq('id', documentId)
          .single();

        if (error) throw error;

        const doc = data as CollaborativeDocument;
        setDocument(doc);
        documentRef.current = doc;
        setIsConnected(true);
      } catch (error) {
        console.error('Error loading document:', error);
      }
    };

    loadDocument();
  }, [documentId]);

  // Presence tracking for online users
  const { onlineUsers } = useSupabasePresence(
    `document:${documentId}`,
    userId,
    { userName, color: userColor }
  );

  // Broadcast channel for real-time edits
  const { messages, sendMessage } = useSupabaseBroadcast(`document:${documentId}`);

  // Handle incoming broadcast messages
  useEffect(() => {
    messages.forEach((msg: any) => {
      if (msg.payload.type === 'cursor_update' && msg.payload.userId !== userId) {
        setCursors(prev => {
          const filtered = prev.filter(c => c.userId !== msg.payload.userId);
          return [...filtered, msg.payload.cursor];
        });
      } else if (msg.payload.type === 'content_update' && msg.payload.userId !== userId) {
        // Apply remote edit
        applyRemoteEdit(msg.payload.edit);
      }
    });
  }, [messages, userId]);

  // Apply remote edit
  const applyRemoteEdit = useCallback((edit: CollaborativeEdit) => {
    setDocument(prev => {
      if (!prev) return prev;

      let newContent = prev.content;
      
      if (edit.type === 'insert') {
        newContent = 
          prev.content.slice(0, edit.position) +
          edit.content +
          prev.content.slice(edit.position);
      } else if (edit.type === 'delete') {
        newContent = 
          prev.content.slice(0, edit.position) +
          prev.content.slice(edit.position + edit.content.length);
      } else if (edit.type === 'replace') {
        newContent = edit.content;
      }

      return {
        ...prev,
        content: newContent,
        version: prev.version + 1,
        lastEditedBy: edit.userId,
        lastEditedAt: edit.timestamp
      };
    });
  }, []);

  // Update document content
  const updateContent = useCallback(async (
    content: string,
    optimistic: boolean = true
  ) => {
    if (!document) return;

    const edit: CollaborativeEdit = {
      userId,
      userName,
      type: 'replace',
      position: 0,
      content,
      timestamp: new Date().toISOString()
    };

    // Optimistic update
    if (optimistic) {
      const updateId = `${Date.now()}_${Math.random()}`;
      optimisticUpdatesRef.current.set(updateId, document.content);

      setDocument(prev => prev ? {
        ...prev,
        content,
        version: prev.version + 1,
        lastEditedBy: userId,
        lastEditedAt: edit.timestamp
      } : null);

      setPendingEdits(prev => [...prev, edit]);
    }

    try {
      // Broadcast to other users
      sendMessage('content_update', {
        type: 'content_update',
        userId,
        edit
      });

      // Save to database
      const { error } = await supabase
        .from('collaborative_documents')
        .update({
          content,
          version: document.version + 1,
          lastEditedBy: userId,
          lastEditedAt: edit.timestamp
        })
        .eq('id', documentId);

      if (error) throw error;

      // Remove from pending edits
      setPendingEdits(prev => prev.filter(e => e.timestamp !== edit.timestamp));
    } catch (error) {
      console.error('Error updating document:', error);

      // Rollback optimistic update
      if (optimistic) {
        const originalContent = Array.from(optimisticUpdatesRef.current.values())[0];
        if (originalContent) {
          setDocument(prev => prev ? {
            ...prev,
            content: originalContent
          } : null);
        }
      }
    }
  }, [document, documentId, userId, userName, sendMessage]);

  // Update cursor position
  const updateCursor = useCallback((
    position: number,
    selection?: { start: number; end: number }
  ) => {
    const cursor: CursorPosition = {
      userId,
      userName,
      position,
      selection,
      color: userColor
    };

    // Broadcast cursor position
    sendMessage('cursor_update', {
      type: 'cursor_update',
      userId,
      cursor
    });
  }, [userId, userName, userColor, sendMessage]);

  // Apply edit (for operational transformation)
  const applyEdit = useCallback((edit: CollaborativeEdit) => {
    setPendingEdits(prev => [...prev, edit]);
    applyRemoteEdit(edit);
  }, [applyRemoteEdit]);

  // Rollback edit
  const rollbackEdit = useCallback((editId: string) => {
    // Remove from pending edits
    setPendingEdits(prev => prev.filter(e => e.timestamp !== editId));

    // Restore from optimistic updates
    const originalContent = optimisticUpdatesRef.current.get(editId);
    if (originalContent && document) {
      setDocument({
        ...document,
        content: originalContent
      });
      optimisticUpdatesRef.current.delete(editId);
    }
  }, [document]);

  return {
    document,
    onlineUsers,
    cursors,
    pendingEdits,
    isConnected,
    updateContent,
    updateCursor,
    applyEdit,
    rollbackEdit
  };
};
