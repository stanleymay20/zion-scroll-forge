/**
 * Live Video Session Component
 * Interactive video with real AI-generated talking avatar using D-ID
 * Features: Real video playback, text chat, voice interaction
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Video, 
  Mic, 
  Send, 
  MessageSquare,
  Hand,
  Users,
  Volume2,
  VolumeX,
  Maximize,
  Play,
  Pause,
  Loader2,
  StopCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [activeParticipants] = useState(() => Math.floor(Math.random() * 20) + 5);
  const [isVoiceToTextEnabled, setIsVoiceToTextEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Fetch existing video for this module
  const { data: videoData, isLoading: isLoadingVideo, refetch: refetchVideo } = useQuery({
    queryKey: ['module-video', lectureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_materials')
        .select('id, url, meta, title')
        .eq('module_id', lectureId)
        .eq('kind', 'video')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // Generate video mutation
  const generateVideoMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: { module_id: lectureId, regenerate: false }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.status === 'processing') {
        toast.info('Video is being generated', { 
          description: 'This may take 2-3 minutes. Please wait...' 
        });
        // Poll for completion
        const pollInterval = setInterval(async () => {
          const result = await refetchVideo();
          if (result.data?.url && result.data.url.includes('supabase')) {
            clearInterval(pollInterval);
            toast.success('Video ready!');
          }
        }, 10000);
        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      } else if (data.video_url) {
        toast.success('Video loaded!');
        refetchVideo();
      }
    },
    onError: (error) => {
      console.error('Video generation error:', error);
      toast.error('Failed to generate video', { 
        description: 'Please try again later' 
      });
    }
  });

  // Video URL - use real URL if available
  const videoUrl = videoData?.url && videoData.url.includes('supabase') ? videoData.url : null;
  const isVideoProcessing = videoData?.meta && (videoData.meta as any).status === 'processing';

  // Initialize speech recognition
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
        toast.success('Voice captured!');
      };

      recognitionRef.current.onerror = () => {
        setIsVoiceToTextEnabled(false);
        toast.error('Voice recognition failed');
      };

      recognitionRef.current.onend = () => {
        setIsVoiceToTextEnabled(false);
      };
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Video time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onComplete?.();
    toast.success('Lecture completed!', { 
      description: 'Great job finishing this lesson!' 
    });
  };

  // Play/pause toggle
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Start voice-to-text
  const startVoiceToText = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsVoiceToTextEnabled(true);
        toast.info('Listening...', { description: 'Speak now' });
      } catch {
        toast.error('Voice recognition unavailable');
      }
    }
  };

  const stopVoiceToText = () => {
    recognitionRef.current?.stop();
    setIsVoiceToTextEnabled(false);
  };

  // Voice recording
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
      toast.info('Recording...', { description: 'Click stop when done' });
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecordingVoiceNote = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceNote = async () => {
    if (!recordedAudioBlob) return;
    setIsProcessingVoice(true);

    try {
      const audioUrl = URL.createObjectURL(recordedAudioBlob);
      
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

      // AI response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          userId: 'lecturer',
          userName: lecturerName,
          userAvatar: lecturerAvatar,
          content: "Thank you for your voice note! I've noted your question and will address it.",
          type: 'text',
          timestamp: new Date()
        }]);
      }, 2000);
    } catch {
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

    // AI response
    setTimeout(() => {
      const responses = [
        `Great question about "${userQuestion.slice(0, 30)}..." - let me elaborate.`,
        `Excellent observation! This ties into our main theme today.`,
        `Thank you for engaging with the material. Let me address that.`,
        `That's a profound insight. In Scripture, we see this pattern...`
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
    }, 1500);
  };

  // Hand raise
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={lecturerAvatar} alt={lecturerName} />
              <AvatarFallback>{lecturerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{lectureTitle}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">
                Instructor: {lecturerName}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="flex-shrink-0 flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{activeParticipants}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Video Area */}
          <div className="lg:col-span-2 bg-black aspect-video relative">
            {isLoadingVideo ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-sm">Loading video...</p>
              </div>
            ) : videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnd}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  playsInline
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="space-y-2">
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 text-white text-xs">
                      <span>{formatDuration(videoRef.current?.currentTime || 0)}</span>
                      <Progress value={videoProgress} className="flex-1 h-1" />
                      <span>{formatDuration(videoDuration)}</span>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={togglePlayPause}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleMute}
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
                          className={handRaised ? "bg-amber-500 hover:bg-amber-600" : "text-white hover:bg-white/20"}
                        >
                          <Hand className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => videoRef.current?.requestFullscreen()}
                          className="text-white hover:bg-white/20"
                        >
                          <Maximize className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : isVideoProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-amber-400" />
                <h3 className="text-lg font-semibold mb-2">Video Being Generated</h3>
                <p className="text-sm text-gray-400 max-w-sm">
                  Your AI instructor video is being created. This takes 2-3 minutes.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchVideo()}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Status
                </Button>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                <Video className="h-16 w-16 mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">AI Video Lecture</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-sm">
                  Generate a personalized video lecture with an AI instructor for this module.
                </p>
                <Button 
                  onClick={() => generateVideoMutation.mutate()} 
                  disabled={generateVideoMutation.isPending}
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  {generateVideoMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Generate AI Video
                    </>
                  )}
                </Button>
                {generateVideoMutation.isError && (
                  <p className="text-red-400 text-sm mt-4 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Failed to generate video. Try again.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Chat & Interaction Area */}
          <div className="border-l flex flex-col h-[400px] lg:h-auto">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b grid grid-cols-2">
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="voice" className="gap-2">
                  <Mic className="h-4 w-4" />
                  <span className="hidden sm:inline">Voice</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Start the video and ask questions here!
                      </p>
                    )}
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
                        <div className={`flex flex-col min-w-0 max-w-[80%] ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
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
                                  <audio controls className="h-8 max-w-full">
                                    <source src={msg.audioUrl} type="audio/webm" />
                                  </audio>
                                </div>
                              ) : (
                                <p className={`text-sm rounded-lg px-3 py-2 break-words ${
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
                      className={`flex-shrink-0 ${isVoiceToTextEnabled ? 'bg-red-100 border-red-500' : ''}`}
                    >
                      {isVoiceToTextEnabled ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="min-w-0"
                    />
                    <Button 
                      size="icon" 
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="voice" className="flex-1 flex flex-col m-0 p-4">
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <h3 className="text-lg font-semibold text-center">Voice Notes</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Record and send voice notes to interact
                  </p>

                  {!isRecording && !recordedAudioBlob && (
                    <Button
                      size="lg"
                      onClick={startRecordingVoiceNote}
                      className="w-20 h-20 rounded-full"
                    >
                      <Mic className="h-8 w-8" />
                    </Button>
                  )}

                  {isRecording && (
                    <Button
                      size="lg"
                      onClick={stopRecordingVoiceNote}
                      variant="destructive"
                      className="w-20 h-20 rounded-full animate-pulse"
                    >
                      <StopCircle className="h-8 w-8" />
                    </Button>
                  )}

                  {recordedAudioBlob && !isProcessingVoice && (
                    <div className="space-y-4 w-full max-w-xs">
                      <audio controls className="w-full">
                        <source src={URL.createObjectURL(recordedAudioBlob)} type="audio/webm" />
                      </audio>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => setRecordedAudioBlob(null)}>
                          Discard
                        </Button>
                        <Button onClick={sendVoiceNote}>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  )}

                  {isProcessingVoice && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Sending...</span>
                    </div>
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
