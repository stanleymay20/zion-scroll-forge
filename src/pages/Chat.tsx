/**
 * Chat Page
 * Main page for real-time chat and messaging
 * "Let your conversation be always full of grace" - Colossians 4:6
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatInterface from '@/components/chat/ChatInterface';

const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get('room') || undefined;

  return (
    <div className="h-screen bg-background">
      <ChatInterface initialRoomId={initialRoomId} />
    </div>
  );
};

export default Chat;
