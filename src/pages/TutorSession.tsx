import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, X, User } from "lucide-react";
import { useTutorSession, useSessionMessages, useSendTutorMessage, useCloseTutorSession } from "@/hooks/useAITutors";
import { format } from "date-fns";

console.info("✝️ Tutor Session — Learning in Christ");

export default function TutorSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading } = useTutorSession(id!);
  const { data: messages, isLoading: messagesLoading } = useSessionMessages(id!);
  const sendMessage = useSendTutorMessage();
  const closeSession = useCloseTutorSession();
  
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !id) return;
    
    const text = messageText;
    setMessageText("");
    
    await sendMessage.mutateAsync({
      session_id: id,
      message: text
    });
  };

  const handleClose = async () => {
    if (!id) return;
    await closeSession.mutateAsync(id);
    navigate('/ai-tutors');
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <PageTemplate title="Session Not Found">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Session not found</p>
            <Button onClick={() => navigate('/ai-tutors')} className="mt-4">
              Back to Tutors
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`Session with ${(session as any).tutor?.name || 'Tutor'}`}
      description={(session as any).course?.title || 'General guidance'}
      actions={
        <Button variant="outline" onClick={handleClose}>
          <X className="h-4 w-4 mr-2" />
          End Session
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Start a conversation by asking a question below</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.sender_type === 'student' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.sender_type === 'tutor' && (
                        <Avatar>
                          <AvatarFallback>
                            {(session as any).tutor?.name?.[0] || 'T'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.sender_type === 'student'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {format(new Date(msg.created_at), 'p')}
                        </p>
                      </div>
                      {msg.sender_type === 'student' && (
                        <Avatar>
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask a question..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={2}
                  disabled={sendMessage.isPending}
                />
                <Button
                  onClick={handleSend}
                  disabled={!messageText.trim() || sendMessage.isPending}
                  size="icon"
                  className="h-auto"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tutor</p>
                <p className="font-medium">{(session as any).tutor?.name}</p>
              </div>
              {(session as any).course && (
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{(session as any).course.title}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-medium">
                  {format(new Date(session.created_at), 'PPp')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
