/**
 * Live Video Session Component
 * Interactive live video with text chat, voice notes, and voice-to-text interaction
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  VideoOff,
  Mic, 
  MicOff, 
  Send, 
  MessageSquare,
  Hand,
  Users,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Play,
  Pause,
  Loader2,
  FileAudio,
  StopCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'text' | 'voice' | 'system';
  timestamp: Date;
  audioUrl?: string;
}

interface LiveVideoSessionProps {
  lectureId: string;
  lectureTitle: string;
  lecturerName: string;
  lecturerAvatar?: string;
  onComplete?: () => void;
  enrollmentId: string;
  moduleContent?: string;
}

export function LiveVideoSession({ 
  lectureId, 
  lectureTitle,
  lecturerName,
  lecturerAvatar,
  onComplete,
  enrollmentId,
  moduleContent
}: LiveVideoSessionProps) {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [activeParticipants, setActiveParticipants] = useState(12);
  const [isVoiceToTextEnabled, setIsVoiceToTextEnabled] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition for voice-to-text
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessageInput(prev => prev + ' ' + transcript);
        setIsVoiceToTextEnabled(false);
        toast.success('Voice captured!', { description: transcript.slice(0, 50) + '...' });
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceToTextEnabled(false);
        toast.error('Voice recognition failed', { description: 'Please try again or type your message' });
      };

      recognitionRef.current.onend = () => {
        setIsVoiceToTextEnabled(false);
      };
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulate live session with AI responses
  useEffect(() => {
    if (isLive) {
      // Add welcome message
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        userId: 'system',
        userName: 'System',
        content: `Welcome to the live session: "${lectureTitle}". ${lecturerName} is your instructor today.`,
        type: 'system',
        timestamp: new Date()
      }]);

      // Simulate occasional participant count updates
      const participantInterval = setInterval(() => {
        setActiveParticipants(prev => prev + Math.floor(Math.random() * 3) - 1);
      }, 30000);

      return () => clearInterval(participantInterval);
    }
  }, [isLive, lectureTitle, lecturerName]);

  // Start voice-to-text
  const startVoiceToText = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsVoiceToTextEnabled(true);
        toast.info('Listening...', { description: 'Speak now, your voice will be converted to text' });
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        toast.error('Voice recognition unavailable');
      }
    } else {
      toast.error('Voice recognition not supported', { 
        description: 'Your browser does not support voice recognition' 
      });
    }
  };

  // Stop voice-to-text
  const stopVoiceToText = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsVoiceToTextEnabled(false);
  };

  // Start recording voice note
  const startRecordingVoiceNote = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info('Recording voice note...', { description: 'Click stop when done' });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Microphone access denied', { 
        description: 'Please allow microphone access to record voice notes' 
      });
    }
  };

  // Stop recording voice note
  const stopRecordingVoiceNote = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Send recorded voice note
  const sendVoiceNote = async () => {
    if (!recordedAudioBlob) return;

    setIsProcessingVoice(true);

    try {
      // Create audio URL for playback
      const audioUrl = URL.createObjectURL(recordedAudioBlob);
      
      // Add voice message to chat
      const newMessage: Message = {
        id: crypto.randomUUID(),
        userId: user?.id || 'anonymous',
        userName: user?.user_metadata?.full_name || 'You',
        userAvatar: user?.user_metadata?.avatar_url,
        content: '🎤 Voice note',
        type: 'voice',
        timestamp: new Date(),
        audioUrl
      };

      setMessages(prev => [...prev, newMessage]);
      setRecordedAudioBlob(null);
      toast.success('Voice note sent!');

      // Simulate AI lecturer response to voice note
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          userId: 'lecturer',
          userName: lecturerName,
          userAvatar: lecturerAvatar,
          content: 'Thank you for your voice note! I\'ve noted your question and will address it shortly in the lecture.',
          type: 'text',
          timestamp: new Date()
        }]);
      }, 2000);
    } catch (error) {
      console.error('Failed to send voice note:', error);
      toast.error('Failed to send voice note');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Send text message
  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      userId: user?.id || 'anonymous',
      userName: user?.user_metadata?.full_name || 'You',
      userAvatar: user?.user_metadata?.avatar_url,
      content: messageInput,
      type: 'text',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    const userQuestion = messageInput;
    setMessageInput('');

    // Simulate AI lecturer response
    setTimeout(() => {
      const responses = [
        `Great question about "${userQuestion.slice(0, 30)}..." - let me address that in the lecture.`,
        `I see your point. This ties into our main theme today about ${lectureTitle}.`,
        `Excellent observation! This is exactly the kind of critical thinking we encourage at ScrollUniversity.`,
        `Thank you for engaging with the material. Let me elaborate on that concept.`,
        `That's a profound insight. In the context of Scripture and this topic, we can see...`
      ];
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        userId: 'lecturer',
        userName: lecturerName,
        userAvatar: lecturerAvatar,
        content: responses[Math.floor(Math.random() * responses.length)],
        type: 'text',
        timestamp: new Date()
      }]);
    }, 1500 + Math.random() * 2000);
  };

  // Toggle hand raise
  const toggleHandRaise = () => {
    setHandRaised(!handRaised);
    if (!handRaised) {
      toast.info('Hand raised!', { description: 'The instructor has been notified' });
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        userId: 'system',
        userName: 'System',
        content: `${user?.user_metadata?.full_name || 'A student'} raised their hand`,
        type: 'system',
        timestamp: new Date()
      }]);
    }
  };

  // Start live session
  const startLiveSession = () => {
    setIsLive(true);
    setIsPlaying(true);
    toast.success('Joined live session!', { description: 'You can now interact with the lecturer' });
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={lecturerAvatar} alt={lecturerName} />
                <AvatarFallback>{lecturerName.charAt(0)}</AvatarFallback>
              </Avatar>
              {isLive && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{lectureTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Instructor: {lecturerName}
                {isLive && (
                  <Badge variant="destructive" className="ml-2">
                    LIVE
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {activeParticipants} watching
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Video Area */}
          <div className="lg:col-span-2 bg-black aspect-video relative">
            {!isLive ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Video className="h-16 w-16 mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Live Interactive Session</h3>
                <p className="text-sm text-gray-400 mb-4 text-center px-4">
                  Join the live session to interact with {lecturerName} via text, voice notes, or voice-to-text
                </p>
                <Button onClick={startLiveSession} size="lg" className="bg-primary hover:bg-primary/90">
                  <Play className="h-5 w-5 mr-2" />
                  Join Live Session
                </Button>
              </div>
            ) : (
              <>
                {/* Simulated live video stream - In production, integrate with actual video service */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="text-center text-white">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={lecturerAvatar} alt={lecturerName} />
                      <AvatarFallback className="text-2xl">{lecturerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold">{lecturerName}</h3>
                    <p className="text-sm opacity-75">Teaching: {lectureTitle}</p>
                    {isPlaying && (
                      <p className="text-xs mt-2 opacity-50">
                        Live session in progress...
                      </p>
                    )}
                  </div>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={handRaised ? "default" : "ghost"}
                        size="icon"
                        onClick={toggleHandRaise}
                        className={handRaised ? "bg-yellow-500 hover:bg-yellow-600" : "text-white hover:bg-white/20"}
                      >
                        <Hand className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <Settings className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chat & Interaction Area */}
          <div className="border-l flex flex-col h-[400px] lg:h-auto">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b">
                <TabsTrigger value="chat" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex-1">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex gap-3 ${msg.userId === user?.id ? 'flex-row-reverse' : ''}`}
                      >
                        {msg.type !== 'system' && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={msg.userAvatar} />
                            <AvatarFallback>{msg.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : ''}`}>
                          {msg.type === 'system' ? (
                            <p className="text-xs text-muted-foreground text-center w-full py-2">
                              {msg.content}
                            </p>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">
                                  {msg.userId === 'lecturer' ? (
                                    <Badge variant="secondary" className="text-xs">Instructor</Badge>
                                  ) : msg.userName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(msg.timestamp)}
                                </span>
                              </div>
                              {msg.type === 'voice' && msg.audioUrl ? (
                                <div className="bg-muted rounded-lg p-2">
                                  <audio controls className="h-8">
                                    <source src={msg.audioUrl} type="audio/webm" />
                                  </audio>
                                </div>
                              ) : (
                                <p className={`text-sm rounded-lg px-3 py-2 max-w-[250px] ${
                                  msg.userId === user?.id 
                                    ? 'bg-primary text-primary-foreground' 
                                    : msg.userId === 'lecturer'
                                    ? 'bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800'
                                    : 'bg-muted'
                                }`}>
                                  {msg.content}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={isVoiceToTextEnabled ? stopVoiceToText : startVoiceToText}
                      className={isVoiceToTextEnabled ? 'bg-red-100 border-red-500' : ''}
                      disabled={!isLive}
                    >
                      {isVoiceToTextEnabled ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                    <Input
                      placeholder={isLive ? "Type or use voice-to-text..." : "Join session to chat"}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={!isLive}
                    />
                    <Button 
                      size="icon" 
                      onClick={sendMessage}
                      disabled={!isLive || !messageInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="voice" className="flex-1 flex flex-col m-0 p-4">
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <h3 className="text-lg font-semibold">Voice Notes</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Record and send voice notes to interact with the lecturer
                  </p>

                  {!isRecording && !recordedAudioBlob && (
                    <Button
                      size="lg"
                      onClick={startRecordingVoiceNote}
                      disabled={!isLive}
                      className="w-24 h-24 rounded-full"
                    >
                      <Mic className="h-8 w-8" />
                    </Button>
                  )}

                  {isRecording && (
                    <Button
                      size="lg"
                      onClick={stopRecordingVoiceNote}
                      variant="destructive"
                      className="w-24 h-24 rounded-full animate-pulse"
                    >
                      <StopCircle className="h-8 w-8" />
                    </Button>
                  )}

                  {recordedAudioBlob && !isProcessingVoice && (
                    <div className="space-y-4">
                      <audio controls className="w-full">
                        <source src={URL.createObjectURL(recordedAudioBlob)} type="audio/webm" />
                      </audio>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setRecordedAudioBlob(null)}>
                          Discard
                        </Button>
                        <Button onClick={sendVoiceNote}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Voice Note
                        </Button>
                      </div>
                    </div>
                  )}

                  {isProcessingVoice && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Sending voice note...</span>
                    </div>
                  )}

                  {!isLive && (
                    <p className="text-sm text-muted-foreground">
                      Join the live session to send voice notes
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
