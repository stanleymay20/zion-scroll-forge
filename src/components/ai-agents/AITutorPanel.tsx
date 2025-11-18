import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, Send, BookOpen, GraduationCap, 
  HeartHandshake, Sparkles, Loader2
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorPanelProps {
  courseId: string;
  moduleId?: string;
}

export function AITutorPanel({ courseId, moduleId }: AITutorPanelProps) {
  const [activeAgent, setActiveAgent] = useState<'tutor' | 'ta' | 'mentor'>('tutor');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const chatMutation = useMutation({
    mutationFn: async ({ message, agent }: { message: string; agent: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-agent-chat', {
        body: { 
          message,
          agent,
          courseId,
          moduleId,
          history: messages
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    },
    onError: (error: any) => {
      toast.error('Failed to get response: ' + error.message);
    }
  });

  const sendMessage = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    chatMutation.mutate({ message: input, agent: activeAgent });
  };

  const agents = {
    tutor: {
      name: 'ScrollTutor',
      icon: Bot,
      description: 'Your personal AI tutor for questions and explanations',
      color: 'text-blue-500'
    },
    ta: {
      name: 'ScrollTA',
      icon: GraduationCap,
      description: 'Teaching assistant for assignments and grading',
      color: 'text-purple-500'
    },
    mentor: {
      name: 'ScrollMentor',
      icon: HeartHandshake,
      description: 'Career guidance and motivation',
      color: 'text-green-500'
    }
  };

  const currentAgent = agents[activeAgent];
  const Icon = currentAgent.icon;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <Tabs value={activeAgent} onValueChange={(v) => setActiveAgent(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tutor" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Tutor
            </TabsTrigger>
            <TabsTrigger value="ta" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              TA
            </TabsTrigger>
            <TabsTrigger value="mentor" className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4" />
              Mentor
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 mt-2">
          <Icon className={`h-5 w-5 ${currentAgent.color}`} />
          <div>
            <CardTitle className="text-base">{currentAgent.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{currentAgent.description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Hi! I'm {currentAgent.name}. How can I help you today?
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder={`Ask ${currentAgent.name}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={chatMutation.isPending}
            />
            <Button 
              onClick={sendMessage} 
              disabled={chatMutation.isPending || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
