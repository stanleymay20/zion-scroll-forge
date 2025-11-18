import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Users, 
  MessageSquare, Share2, Hand, Settings, Grid3x3, Maximize2
} from 'lucide-react';
import { AIAvatarLecturer } from '@/components/ai-avatar/AIAvatarLecturer';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LiveClassroomProps {
  courseId: string;
  moduleId: string;
  sessionId: string;
}

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

export function LiveClassroom({ courseId, moduleId, sessionId }: LiveClassroomProps) {
  const { user } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [viewMode, setViewMode] = useState<'speaker' | 'gallery'>('speaker');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isJoined) {
      initializeMedia();
      setupRealtimeSubscription();
    }

    return () => {
      cleanupMedia();
    };
  }, [isJoined]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Add participant to session
      await supabase
        .from('live_sessions_participants')
        .insert({
          session_id: sessionId,
          user_id: user?.id,
          video_enabled: isVideoEnabled,
          audio_enabled: isAudioEnabled
        });

    } catch (error) {
      console.error('Failed to initialize media:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`live-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_sessions_participants',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Participant change:', payload);
          fetchParticipants();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_sessions_chat',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('New chat message:', payload);
          fetchChatMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from('live_sessions_participants')
      .select('*, profiles(email)')
      .eq('session_id', sessionId);

    if (error) {
      console.error('Failed to fetch participants:', error);
      return;
    }

    setParticipants(data.map(p => ({
      id: p.user_id,
      name: p.profiles?.email || 'Student',
      isHost: p.is_host || false,
      videoEnabled: p.video_enabled,
      audioEnabled: p.audio_enabled
    })));
  };

  const fetchChatMessages = async () => {
    const { data, error } = await supabase
      .from('live_sessions_chat')
      .select('*, profiles(email)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch chat:', error);
      return;
    }

    setChatMessages(data.map(m => ({
      id: m.id,
      userId: m.user_id,
      userName: m.profiles?.email || 'Student',
      message: m.message,
      timestamp: new Date(m.created_at)
    })));
  };

  const cleanupMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const { error } = await supabase
      .from('live_sessions_chat')
      .insert({
        session_id: sessionId,
        user_id: user?.id,
        message
      });

    if (error) {
      toast.error('Failed to send message');
      return;
    }

    setMessage('');
  };

  const raiseHand = async () => {
    setHandRaised(!handRaised);
    
    await supabase
      .from('live_sessions_participants')
      .update({ hand_raised: !handRaised })
      .eq('session_id', sessionId)
      .eq('user_id', user?.id);

    toast.success(handRaised ? 'Hand lowered' : 'Hand raised');
  };

  const leaveSession = async () => {
    cleanupMedia();
    
    await supabase
      .from('live_sessions_participants')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', user?.id);

    setIsJoined(false);
    toast.success('Left the session');
  };

  if (!isJoined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join Live Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ready to join the live classroom session?
            </p>
            <Button onClick={() => setIsJoined(true)} className="w-full">
              <Video className="h-4 w-4 mr-2" />
              Join Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
      {/* Main Video Area */}
      <div className="lg:col-span-3 space-y-4">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Live
              </Badge>
              <span className="text-sm text-muted-foreground">
                {participants.length} participants
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setViewMode(viewMode === 'speaker' ? 'gallery' : 'speaker')}
              >
                {viewMode === 'speaker' ? <Grid3x3 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">
            {viewMode === 'speaker' ? (
              <div className="space-y-4 h-full">
                <AIAvatarLecturer
                  courseId={courseId}
                  moduleId={moduleId}
                  professorName="Dr. Sarah Chen"
                  professorSpecialty="AI & Ethics"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
                {participants.map((participant) => (
                  <div key={participant.id} className="relative bg-muted rounded-lg overflow-hidden">
                    <div className="aspect-video flex items-center justify-center">
                      {participant.videoEnabled ? (
                        <video className="w-full h-full object-cover" autoPlay />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {participant.name}
                      </Badge>
                      {!participant.audioEnabled && (
                        <MicOff className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant={isVideoEnabled ? 'default' : 'destructive'}
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button
                size="lg"
                variant={isAudioEnabled ? 'default' : 'destructive'}
                onClick={toggleAudio}
              >
                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button
                size="lg"
                variant={handRaised ? 'secondary' : 'outline'}
                onClick={raiseHand}
              >
                <Hand className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Settings className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="destructive" onClick={leaveSession}>
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Chat & Participants */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm flex-1">{participant.name}</span>
                    {participant.isHost && (
                      <Badge variant="secondary" className="text-xs">Host</Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 mb-4">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{msg.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm bg-muted p-2 rounded-lg">{msg.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
