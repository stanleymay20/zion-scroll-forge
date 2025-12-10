import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Heart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  User
} from 'lucide-react';
import { useMentorship } from '@/hooks/useMentorship';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SESSION_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  initial_consultation: { label: 'Initial Consultation', icon: MessageSquare, color: 'text-blue-500' },
  progress_review: { label: 'Progress Review', icon: CheckCircle2, color: 'text-green-500' },
  spiritual_guidance: { label: 'Spiritual Guidance', icon: Heart, color: 'text-rose-500' },
  academic_coaching: { label: 'Academic Coaching', icon: Users, color: 'text-purple-500' },
  career_counseling: { label: 'Career Counseling', icon: User, color: 'text-amber-500' },
  prophetic_activation: { label: 'Prophetic Activation', icon: Sparkles, color: 'text-indigo-500' },
  scroll_alignment: { label: 'Scroll Alignment', icon: AlertCircle, color: 'text-teal-500' },
};

const MentorshipPanel = () => {
  const { relationships, sessions, stats, acceptMentorship, relationshipsLoading } = useMentorship();
  const [activeTab, setActiveTab] = useState('relationships');

  const activeRelationships = relationships?.filter(r => r.status === 'active') || [];
  const pendingRelationships = relationships?.filter(r => r.status === 'pending') || [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Mentorships</p>
                <p className="text-2xl font-bold text-green-500">{stats.activeRelationships}</p>
              </div>
              <Users className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold text-blue-500">{stats.totalSessions}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold text-purple-500">{stats.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Role</p>
                <p className="text-lg font-bold text-amber-500">
                  {stats.isMentor && stats.isMentee ? 'Both' : stats.isMentor ? 'Mentor' : stats.isMentee ? 'Mentee' : 'None'}
                </p>
              </div>
              <User className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingRelationships.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="relationships" className="space-y-4">
          {activeRelationships.length > 0 ? (
            activeRelationships.map((relationship: any) => (
              <Card key={relationship.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-500/10">
                        <Users className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {relationship.mentor?.full_name || relationship.mentor?.email || 'Mentor'}
                          {' ↔ '}
                          {relationship.mentee?.full_name || relationship.mentee?.email || 'Mentee'}
                        </CardTitle>
                        <CardDescription>
                          Started {format(new Date(relationship.start_date), 'MMMM d, yyyy')}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Sessions</p>
                      <p className="font-bold">{relationship.total_sessions}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Hours</p>
                      <p className="font-bold">{Number(relationship.total_hours).toFixed(1)}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Goals</p>
                      <p className="font-bold">{relationship.goals?.length || 0}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-bold capitalize">{relationship.status}</p>
                    </div>
                  </div>
                  
                  {relationship.goals?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Goals:</p>
                      <div className="flex flex-wrap gap-2">
                        {relationship.goals.map((goal: any, i: number) => (
                          <Badge key={i} variant="outline">
                            {typeof goal === 'string' ? goal : goal.title || goal.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Mentorships</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect with a mentor to accelerate your spiritual and academic growth.
                </p>
                <Button className="bg-gradient-to-r from-green-500 to-green-600">
                  Find a Mentor
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {sessions && sessions.length > 0 ? (
            sessions.map((session: any) => {
              const typeInfo = SESSION_TYPE_LABELS[session.session_type] || {
                label: session.session_type,
                icon: MessageSquare,
                color: 'text-gray-500',
              };
              const Icon = typeInfo.icon;

              return (
                <Card key={session.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className={cn('p-2 rounded-lg bg-muted', typeInfo.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{typeInfo.label}</h4>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(session.scheduled_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        
                        {session.topics_discussed?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {session.topics_discussed.map((topic: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {session.guidance_provided && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {session.guidance_provided}
                          </p>
                        )}
                        
                        {session.prophetic_words && (
                          <div className="p-2 rounded-lg bg-purple-500/10 text-sm">
                            <Sparkles className="h-3 w-3 text-purple-500 inline mr-1" />
                            <span className="italic">{session.prophetic_words}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          {session.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.duration_minutes} min
                            </span>
                          )}
                          {session.follow_up_required && (
                            <Badge variant="outline" className="text-xs text-amber-600">
                              Follow-up Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
                <p className="text-muted-foreground text-center">
                  Schedule your first mentorship session to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingRelationships.length > 0 ? (
            pendingRelationships.map((relationship: any) => (
              <Card key={relationship.id} className="border-amber-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-amber-500/10">
                        <Users className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {relationship.mentee?.full_name || relationship.mentee?.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Requested mentorship
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => acceptMentorship.mutate(relationship.id)}
                      disabled={acceptMentorship.isPending}
                    >
                      Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground text-center">
                  All mentorship requests have been addressed.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorshipPanel;
