import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Sparkles, Video, Mic, MicOff, VideoOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AITutorAvatarProps {
  tutorId?: string;
  tutorName: string;
  tutorSpecialty: string;
  tutorAvatar?: string;
  moduleId?: string;
  moduleContent?: string;
}

export const AITutorAvatar = ({
  tutorId,
  tutorName,
  tutorSpecialty,
  tutorAvatar,
  moduleId,
  moduleContent
}: AITutorAvatarProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor-chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          tutorId,
          moduleId,
          moduleContent: moduleContent?.substring(0, 3000)
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Simulate avatar speaking (you can integrate actual TTS here)
      if (isVideoMode && !isMuted) {
        speakMessage(data.message);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to communicate with AI tutor',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = (text: string) => {
    // Browser TTS (simple version - can be enhanced with ElevenLabs)
    if ('speechSynthesis' in window && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={tutorAvatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {tutorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">
                {tutorName}
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Tutor
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{tutorSpecialty}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isVideoMode ? "default" : "outline"}
              onClick={() => setIsVideoMode(!isVideoMode)}
            >
              {isVideoMode ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant={isMuted ? "outline" : "default"}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* Avatar Video Preview */}
        {isVideoMode && (
          <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-lg overflow-hidden border-2 border-primary/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <Avatar className="h-32 w-32 border-4 border-primary">
                <AvatarImage src={tutorAvatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {tutorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            {isLoading && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-1 rounded-full">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-xs">Thinking...</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
              ● LIVE
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea className="h-[300px]" ref={scrollRef}>
          <div className="space-y-4 pr-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">✝️ Christ is Lord over this learning session</p>
                <p className="text-xs mt-2">
                  Ask me anything about the module content. I'm here to help!
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarImage src={tutorAvatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {tutorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="flex gap-2 w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your AI tutor anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
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
};
