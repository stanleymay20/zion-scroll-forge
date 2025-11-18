import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Video, VideoOff, Mic, MicOff, MessageSquare, 
  Send, Maximize2, Minimize2, PlayCircle, PauseCircle,
  Volume2, VolumeX, Settings, Download, BookOpen
} from 'lucide-react';
import { ReadyPlayerMeAvatar } from '@/components/ReadyPlayerMeAvatar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AIAvatarLecturerProps {
  courseId: string;
  moduleId: string;
  professorName: string;
  professorSpecialty: string;
  avatarUrl?: string;
}

export function AIAvatarLecturer({
  courseId,
  moduleId,
  professorName,
  professorSpecialty,
  avatarUrl
}: AIAvatarLecturerProps) {
  const [isLecturing, setIsLecturing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: string; content: string}>>([]);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('play', () => setIsSpeaking(true));
    audioRef.current.addEventListener('ended', () => setIsSpeaking(false));
    audioRef.current.addEventListener('pause', () => setIsSpeaking(false));

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startLecture = async () => {
    setIsLecturing(true);
    setIsThinking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-professor-lecture', {
        body: { 
          courseId, 
          moduleId,
          professorName,
          specialty: professorSpecialty
        }
      });

      if (error) throw error;

      setIsThinking(false);
      if (data.audioUrl) {
        playAudio(data.audioUrl);
      }
      if (data.transcript) {
        setTranscript(prev => [...prev, data.transcript]);
      }
    } catch (error) {
      console.error('Failed to start lecture:', error);
      toast.error('Failed to start lecture');
      setIsLecturing(false);
      setIsThinking(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');
    setIsThinking(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-professor-qa', {
        body: { 
          question,
          courseId,
          moduleId,
          chatHistory,
          professorName
        }
      });

      if (error) throw error;

      setIsThinking(false);
      const assistantMessage = { role: 'assistant', content: data.response };
      setChatHistory(prev => [...prev, assistantMessage]);

      if (data.audioUrl) {
        playAudio(data.audioUrl);
      }
    } catch (error) {
      console.error('Failed to ask question:', error);
      toast.error('Failed to get response');
      setIsThinking(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceQuestion(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const processVoiceQuestion = async (audioBlob: Blob) => {
    setIsThinking(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('courseId', courseId);
      formData.append('moduleId', moduleId);
      formData.append('professorName', professorName);

      const { data, error } = await supabase.functions.invoke('ai-professor-voice-qa', {
        body: formData
      });

      if (error) throw error;

      setIsThinking(false);
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: data.transcription },
        { role: 'assistant', content: data.response }
      ]);

      if (data.audioUrl) {
        playAudio(data.audioUrl);
      }
    } catch (error) {
      console.error('Failed to process voice question:', error);
      toast.error('Failed to process voice question');
      setIsThinking(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.muted = isMuted;
      audioRef.current.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const downloadTranscript = () => {
    const text = transcript.join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lecture-transcript-${moduleId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`grid gap-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : 'grid-cols-1 lg:grid-cols-3'}`}>
      {/* Avatar Video Panel */}
      <Card className={isFullscreen ? 'col-span-2' : 'lg:col-span-2'}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              {professorName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{professorSpecialty}</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            >
              {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            {isVideoEnabled && avatarUrl ? (
              <ReadyPlayerMeAvatar
                avatarUrl={avatarUrl}
                isSpeaking={isSpeaking}
                isThinking={isThinking}
                audioElement={audioRef.current}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <VideoOff className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            {/* Status Indicators */}
            <div className="absolute top-4 left-4 flex gap-2">
              {isLecturing && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Live
                </Badge>
              )}
              {isSpeaking && (
                <Badge variant="secondary">Speaking</Badge>
              )}
              {isThinking && (
                <Badge variant="secondary">Thinking...</Badge>
              )}
            </div>

            {/* Lecture Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {!isLecturing ? (
                <Button onClick={startLecture} size="lg">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Start Lecture
                </Button>
              ) : (
                <Button onClick={() => setIsLecturing(false)} variant="destructive" size="lg">
                  <PauseCircle className="h-5 w-5 mr-2" />
                  Stop Lecture
                </Button>
              )}
            </div>
          </div>

          {/* Live Transcript */}
          {transcript.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg max-h-32 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold">Live Transcript</h4>
                <Button size="sm" variant="ghost" onClick={downloadTranscript}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {transcript[transcript.length - 1]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Q&A Panel */}
      <Card className={isFullscreen ? '' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ask Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat History */}
          <div className="h-96 overflow-y-auto space-y-3 p-4 bg-muted rounded-lg">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-background border p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Methods */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Ask a question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                disabled={isThinking}
              />
              <Button onClick={askQuestion} disabled={isThinking || !question.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={isThinking}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Question
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              View Notes
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
