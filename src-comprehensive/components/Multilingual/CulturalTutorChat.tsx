/**
 * Cultural Tutor Chat Component for ScrollUniversity Platform
 * Displays AI tutor responses with cultural adaptation and spiritual alignment
 */

import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage, CulturalRegion, AITutorPersonality } from '../../types/multilingual';
import { MultilingualService } from '../../services/MultilingualService';

interface CulturalTutorChatProps {
  userId: string;
  topic: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  includeSpiritual?: boolean;
  onPersonalityChange?: (personality: AITutorPersonality) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'tutor';
  content: string;
  timestamp: Date;
  personality?: string;
  culturalContext?: CulturalRegion;
  spiritualAlignment?: number;
  suggestedFollowUp?: string;
}

export const CulturalTutorChat: React.FC<CulturalTutorChatProps> = ({
  userId,
  topic,
  userLevel = 'beginner',
  includeSpiritual = true,
  onPersonalityChange
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState<AITutorPersonality | null>(null);
  const [userLanguage, setUserLanguage] = useState<SupportedLanguage>(SupportedLanguage.English);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const multilingualService = MultilingualService.getInstance();

  useEffect(() => {
    initializeChat();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Get user's AI tutor personality
      const personality = multilingualService.getAITutorForUser(userId);
      setCurrentPersonality(personality);
      setUserLanguage(personality.language);
      
      if (onPersonalityChange) {
        onPersonalityChange(personality);
      }

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        type: 'tutor',
        content: `${personality.greeting} I'm ${personality.name}, your ScrollUniversity tutor. I'm here to help you learn about ${topic}. How can I assist you today?`,
        timestamp: new Date(),
        personality: personality.name,
        culturalContext: personality.culturalRegion,
        spiritualAlignment: 95
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await multilingualService.generateTutorResponse(
        userId,
        inputMessage,
        topic,
        userLevel,
        includeSpiritual
      );

      const tutorMessage: ChatMessage = {
        id: `tutor-${Date.now()}`,
        type: 'tutor',
        content: response.text,
        timestamp: new Date(),
        personality: response.personality,
        culturalContext: response.culturalContext,
        spiritualAlignment: response.spiritualAlignment,
        suggestedFollowUp: response.suggestedFollowUp
      };

      setMessages(prev => [...prev, tutorMessage]);
    } catch (error) {
      console.error('Failed to get tutor response:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'tutor',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again.',
        timestamp: new Date(),
        personality: currentPersonality?.name || 'ScrollTutor',
        culturalContext: currentPersonality?.culturalRegion || CulturalRegion.NorthAmerica,
        spiritualAlignment: 0
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSpiritualAlignmentColor = (alignment: number): string => {
    if (alignment >= 80) return 'text-green-600';
    if (alignment >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCulturalRegionDisplay = (region: CulturalRegion): string => {
    return region.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="cultural-tutor-chat flex flex-col h-96 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="chat-header bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{currentPersonality?.name || 'ScrollTutor'}</h3>
            <p className="text-sm opacity-90">
              {topic} • {getCulturalRegionDisplay(currentPersonality?.culturalRegion || CulturalRegion.NorthAmerica)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm">Language: {userLanguage}</p>
            <p className="text-xs opacity-75">
              Style: {currentPersonality?.teachingStyle.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.type === 'user' ? 'user-message' : 'tutor-message'}`}
          >
            <div
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                
                {message.type === 'tutor' && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{message.personality}</span>
                      <span>{formatTimestamp(message.timestamp)}</span>
                    </div>
                    
                    {message.spiritualAlignment !== undefined && includeSpiritual && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-400">Spiritual Alignment: </span>
                        <span className={`text-xs font-medium ${getSpiritualAlignmentColor(message.spiritualAlignment)}`}>
                          {message.spiritualAlignment}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {message.suggestedFollowUp && message.type === 'tutor' && (
              <div className="mt-2 flex justify-start">
                <button
                  onClick={() => setInputMessage(message.suggestedFollowUp!)}
                  className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200"
                >
                  💡 {message.suggestedFollowUp}
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-500">
                  {currentPersonality?.name} is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${currentPersonality?.name || 'your tutor'} about ${topic}...`}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        {currentPersonality && (
          <div className="mt-2 text-xs text-gray-500">
            <p>
              Chatting with {currentPersonality.name} • 
              {currentPersonality.spiritualApproach.replace('_', ' ')} approach • 
              {getCulturalRegionDisplay(currentPersonality.culturalRegion)} context
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CulturalTutorChat;