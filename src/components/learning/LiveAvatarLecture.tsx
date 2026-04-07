/**
 * LiveAvatarLecture — Real-time AI avatar lecture with voice + text interaction
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2, Send, Sparkles, Video, Mic, MicOff,
  VideoOff, Phone, PhoneOff, Volume2, VolumeX
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LiveAvatarLectureProps {
  tutorName: string;
  tutorSpecialty: string;
  tutorAvatar?: string | null;
  tutorId?: string;
  moduleId?: string;
  moduleContent?: string;
  moduleTitle?: string;
}

export function LiveAvatarLecture({
  tutorName,
  tutorSpecialty,
  tutorAvatar,
  tutorId,
  moduleId,
  moduleContent,
  moduleTitle,
}: LiveAvatarLectureProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const streamIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectStream();
    };
  }, []);

  const connectStream = useCallback(async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-avatar-stream', {
        body: { action: 'create_stream' },
      });

      if (error) throw error;

      streamIdRef.current = data.stream_id;
      sessionIdRef.current = data.session_id;

      // Set up WebRTC
      const pc = new RTCPeerConnection({
        iceServers: data.ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      peerConnectionRef.current = pc;

      // Handle incoming video track
      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      // Send ICE candidates to D-ID
      pc.onicecandidate = async (event) => {
        if (event.candidate && streamIdRef.current && sessionIdRef.current) {
          await supabase.functions.invoke('ai-avatar-stream', {
            body: {
              action: 'ice_candidate',
              stream_id: streamIdRef.current,
              session_id: sessionIdRef.current,
              candidate: event.candidate,
            },
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
          setIsConnecting(false);
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setIsConnected(false);
        }
      };

      // Set remote offer
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer to D-ID
      await supabase.functions.invoke('ai-avatar-stream', {
        body: {
          action: 'sdp_answer',
          stream_id: data.stream_id,
          session_id: data.session_id,
          answer,
        },
      });

      setIsConnected(true);
      toast.success('🎥 Live avatar connected! Ask your tutor anything.');

      // Send initial greeting
      await sendToAvatar(
        'Introduce yourself and welcome the student to today\'s lecture on this module.',
        true
      );
    } catch (err: any) {
      console.error('Stream connection error:', err);
      toast.error('Failed to connect avatar stream. Using audio-only mode.');
      // Fall back to audio-only mode
      setShowVideo(false);
      setIsConnected(true);
    } finally {
      setIsConnecting(false);
    }
  }, [moduleContent]);

  const disconnectStream = useCallback(async () => {
    if (streamIdRef.current) {
      try {
        await supabase.functions.invoke('ai-avatar-stream', {
          body: {
            action: 'destroy_stream',
            stream_id: streamIdRef.current,
            session_id: sessionIdRef.current,
          },
        });
      } catch (e) {
        console.error('Disconnect error:', e);
      }
    }

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    streamIdRef.current = null;
    sessionIdRef.current = null;
    setIsConnected(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const sendToAvatar = useCallback(
    async (text: string, isSystem = false) => {
      setIsLoading(true);
      setIsSpeaking(false);

      try {
        const { data, error } = await supabase.functions.invoke('ai-avatar-stream', {
          body: {
            action: 'talk',
            stream_id: streamIdRef.current,
            session_id: sessionIdRef.current,
            text,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            moduleContent: moduleContent?.substring(0, 3000),
            tutorId,
          },
        });

        if (error) throw error;

        const assistantMsg: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Play ElevenLabs audio
        if (data.audio_base64 && !isMuted) {
          playAudio(data.audio_base64);
        }
      } catch (err: any) {
        console.error('Avatar talk error:', err);
        toast.error(err.message || 'Failed to get avatar response');
      } finally {
        setIsLoading(false);
      }
    },
    [messages, moduleContent, tutorId, isMuted]
  );

  const playAudio = (base64Audio: string) => {
    setIsSpeaking(true);
    const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
    audioRef.current = audio;

    audio.onended = () => setIsSpeaking(false);
    audio.onerror = () => {
      setIsSpeaking(false);
      console.error('Audio playback error');
    };

    audio.play().catch((err) => {
      console.error('Audio play error:', err);
      setIsSpeaking(false);
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setInput('');
    setMessages((prev) => [...prev, userMsg]);
    await sendToAvatar(userMsg.content);
  };

  const startVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          if (!base64) return;

          // Use ai-tutor-voice for transcription or fall back to typed text
          try {
            const { data: voiceData, error } = await supabase.functions.invoke(
              'ai-tutor-voice',
              {
                body: {
                  session_id: `live-${moduleId}`,
                  audio_base64: base64,
                },
              }
            );

            if (error || !voiceData?.transcript) {
              toast.error('Voice not recognized. Please type your question.');
              return;
            }

            const userMsg: Message = {
              role: 'user',
              content: voiceData.transcript,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, userMsg]);
            await sendToAvatar(voiceData.transcript);
          } catch (e) {
            console.error('Voice processing error:', e);
            toast.error('Voice processing failed. Please type your question.');
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      toast.info('🎙️ Listening... Speak now.');
    } catch (err) {
      console.error('Microphone error:', err);
      toast.error('Microphone access required for voice input.');
    }
  };

  const stopVoiceInput = () => {
    mediaRecorderRef.current?.stop();
    setIsRecordingVoice(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Avatar
              className={`h-10 w-10 border-2 border-primary ${
                isSpeaking ? 'animate-pulse ring-4 ring-primary/50' : ''
              }`}
            >
              <AvatarImage src={tutorAvatar || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {tutorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {tutorName}
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Live Avatar
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">{tutorSpecialty}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isConnected ? (
              <Button
                size="sm"
                onClick={connectStream}
                disabled={isConnecting}
                className="gap-1.5"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                {isConnecting ? 'Connecting...' : 'Start Lecture'}
              </Button>
            ) : (
              <>
                <Button
                  size="icon"
                  variant={showVideo ? 'default' : 'outline'}
                  className="h-8 w-8"
                  onClick={() => setShowVideo(!showVideo)}
                >
                  {showVideo ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant={isMuted ? 'outline' : 'default'}
                  className="h-8 w-8"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={disconnectStream}
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Avatar Video Area */}
        {showVideo && (
          <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-lg overflow-hidden border border-border">
            {isConnected ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={tutorAvatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                      {tutorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isConnecting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium">
                  {isConnecting
                    ? 'Connecting to live avatar...'
                    : 'Press "Start Lecture" to begin'}
                </p>
                {moduleTitle && (
                  <p className="text-xs opacity-70 text-center px-4">
                    Today's lecture: {moduleTitle}
                  </p>
                )}
              </div>
            )}

            {/* Status overlays */}
            {isConnected && (
              <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            )}
            {isSpeaking && (
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-primary/90 backdrop-blur px-3 py-1 rounded-full">
                <div className="flex gap-0.5">
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      className="h-3 w-1 bg-white rounded-full animate-pulse"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-white font-medium">Speaking...</span>
              </div>
            )}
            {isLoading && !isSpeaking && (
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-1 rounded-full">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-xs">Thinking...</span>
              </div>
            )}
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea className="h-[250px]" ref={scrollRef}>
          <div className="space-y-3 pr-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-6">
                <Video className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Live AI Avatar Lecture</p>
                <p className="text-xs mt-1 opacity-70">
                  Start the lecture to interact with your AI tutor in real-time
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-7 w-7 border border-primary/20 shrink-0">
                    <AvatarImage src={tutorAvatar || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {tutorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                  <p className="text-[10px] opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <Avatar className="h-7 w-7 border border-primary/20 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {tutorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 bg-muted">
                  <div className="flex gap-1">
                    {[0, 200, 400].map((delay) => (
                      <div
                        key={delay}
                        className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t pt-3 pb-3">
        <div className="flex gap-2 w-full">
          {/* Voice input button */}
          <Button
            size="icon"
            variant={isRecordingVoice ? 'destructive' : 'outline'}
            onClick={isRecordingVoice ? stopVoiceInput : startVoiceInput}
            disabled={!isConnected || isLoading}
            className="shrink-0"
          >
            {isRecordingVoice ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              isConnected ? 'Ask your tutor anything...' : 'Start lecture first...'
            }
            disabled={!isConnected || isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !isConnected}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
