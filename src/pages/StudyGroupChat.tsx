import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, Users, FileText, Upload, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StudyGroupChat() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  // Fetch group details
  const { data: group } = useQuery({
    queryKey: ['study-group', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('id', groupId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch members
  const { data: members } = useQuery({
    queryKey: ['study-group-members', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_group_members')
        .select(`
          *,
          profiles:user_id(email)
        `)
        .eq('group_id', groupId);
      if (error) throw error;
      return data;
    },
  });

  // Fetch messages with realtime
  const { data: messages } = useQuery({
    queryKey: ['study-group-messages', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_group_messages')
        .select(`
          *,
          profiles:user_id(email)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription for messages
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`study-group-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['study-group-messages', groupId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch notes
  const { data: notes } = useQuery({
    queryKey: ['study-group-notes', groupId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('study_group_notes')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch files
  const { data: files } = useQuery({
    queryKey: ['study-group-files', groupId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('study_group_files')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!user || !message.trim()) return;
      const { error } = await supabase
        .from('study_group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          message: message.trim(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['study-group-messages', groupId] });
    },
    onError: (error) => {
      toast.error('Failed to send message', { description: error.message });
    },
  });

  const createNote = useMutation({
    mutationFn: async () => {
      if (!user || !noteTitle.trim() || !noteContent.trim()) return;
      const { error } = await (supabase as any)
        .from('study_group_notes')
        .insert({
          group_id: groupId,
          user_id: user.id,
          title: noteTitle.trim(),
          content: noteContent.trim(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      setNoteTitle('');
      setNoteContent('');
      queryClient.invalidateQueries({ queryKey: ['study-group-notes', groupId] });
      toast.success('Note created!');
    },
    onError: (error) => {
      toast.error('Failed to create note', { description: error.message });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingFile(true);
    try {
      const filePath = `${groupId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('study-group-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('study-group-files')
        .getPublicUrl(filePath);

      const { error: dbError } = await (supabase as any)
        .from('study_group_files')
        .insert({
          group_id: groupId,
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['study-group-files', groupId] });
      toast.success('File uploaded!');
    } catch (error: any) {
      toast.error('Failed to upload file', { description: error.message });
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <PageTemplate
      title={group?.name || 'Study Group'}
      description="Collaborative learning space"
      actions={
        <Button variant="outline" onClick={() => navigate('/study-groups')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Group Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages?.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.user_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.user_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-xs opacity-70 mb-1">
                          {msg.profiles?.email?.split('@')[0] || 'Anonymous'}
                        </p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-50 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage.mutate()}
                />
                <Button
                  onClick={() => sendMessage.mutate()}
                  disabled={!message.trim() || sendMessage.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({members?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members?.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6" />
                    <span>{member.profiles?.email?.split('@')[0] || 'Anonymous'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        New Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Shared Note</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            placeholder="Note title..."
                          />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Write your notes..."
                            rows={6}
                          />
                        </div>
                        <Button
                          onClick={() => createNote.mutate()}
                          disabled={!noteTitle || !noteContent || createNote.isPending}
                          className="w-full"
                        >
                          {createNote.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            'Create Note'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {notes?.map((note: any) => (
                        <div key={note.id} className="p-2 border rounded text-sm">
                          <p className="font-medium">{note.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {note.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button size="sm" asChild disabled={uploadingFile}>
                      <span>
                        {uploadingFile ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload File
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {files?.map((file: any) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 border rounded text-sm"
                        >
                          <span className="truncate flex-1">{file.file_name}</span>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTemplate>
  );
}
