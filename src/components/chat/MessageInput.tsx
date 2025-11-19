/**
 * Message Input Component
 * Text input with file attachments and emoji support
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Paperclip,
  X,
  Smile,
  Image as ImageIcon,
  File as FileIcon
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import type { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  roomId: string;
  onSend: (content: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  replyTo?: ChatMessage | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  roomId,
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Common emojis for quick access
  const commonEmojis = [
    '😊', '😂', '❤️', '👍', '🙏', '🎉', '🔥', '✨',
    '💯', '👏', '🙌', '💪', '🤝', '✅', '📚', '⭐'
  ];

  // Handle message change
  const handleMessageChange = useCallback((value: string) => {
    setMessage(value);

    // Typing indicator
    if (onTyping) {
      if (!isTyping && value.length > 0) {
        setIsTyping(true);
        onTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 2000);
    }
  }, [isTyping, onTyping]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Remove attachment
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle send
  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && attachments.length === 0) return;
    if (disabled) return;

    // Send message
    onSend(trimmedMessage, attachments.length > 0 ? attachments : undefined);

    // Clear input
    setMessage('');
    setAttachments([]);
    
    // Stop typing indicator
    if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    // Focus textarea
    textareaRef.current?.focus();
  }, [message, attachments, disabled, isTyping, onSend, onTyping]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Insert emoji
  const insertEmoji = useCallback((emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.substring(0, start) + emoji + message.substring(end);
    
    setMessage(newMessage);
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  }, [message]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  return (
    <div className="p-4 space-y-3">
      {/* Reply To */}
      {replyTo && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-accent border-l-2 border-primary">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">
              Replying to {replyTo.sender?.name}
            </p>
            <p className="text-sm truncate">{replyTo.content}</p>
          </div>
          {onCancelReply && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={onCancelReply}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent"
            >
              <div className="text-muted-foreground">
                {getFileIcon(file)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => removeAttachment(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* File Upload */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-10 w-10 p-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? 'Connecting...' : 'Type a message...'}
            disabled={disabled}
            className="min-h-[40px] max-h-[200px] resize-none pr-10"
            rows={1}
          />
          
          {/* Emoji Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 bottom-2 h-6 w-6 p-0"
                disabled={disabled}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="end">
              <div className="grid grid-cols-8 gap-1">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Send Button */}
        <Button
          size="sm"
          className="h-10 w-10 p-0"
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Character Count */}
      {message.length > 0 && (
        <div className="flex justify-end">
          <span className={cn(
            'text-xs',
            message.length > 2000 ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {message.length} / 2000
          </span>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
