import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, Plus, Search, Clock, Users, Monitor,
  Play, Pause, Square, GitBranch, Code,
  MessageSquare, Share, Settings
} from "lucide-react";

const ForgeSessions = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const mockSessions = [
    {
      id: 1,
      name: "ScrollUniversity Architecture Refactor",
      description: "Redesigning the core architecture for better scalability",
      status: "Active",
      type: "Architecture",
      duration: "2h 34m",
      progress: 67,
      participants: ["Alice Chen", "Bob Smith", "Charlie Wong"],
      aiAgent: "ScrollArchitect AI",
      lastActivity: "2 minutes ago",
      startedAt: "10:30 AM",
      estimatedCompletion: "2:15 PM"
    },
    {
      id: 2,
      name: "AI Tutor Enhancement Sprint",
      description: "Adding new capabilities to the tutoring system",
      status: "Paused",
      type: "Development",
      duration: "1h 45m",
      progress: 42,
      participants: ["David Kim", "Eve Johnson"],
      aiAgent: "TutorBot Genesis",
      lastActivity: "15 minutes ago",
      startedAt: "9:00 AM",
      estimatedCompletion: "1:30 PM"
    },
    {
      id: 3,
      name: "ScrollCoin Economic Model Review",
      description: "Analyzing and optimizing the token economy",
      status: "Completed",
      type: "Analysis",
      duration: "3h 12m",
      progress: 100,
      participants: ["Frank Liu", "Grace Taylor", "Henry Park", "Ivy Chen"],
      aiAgent: "EconomyAnalyst AI",
      lastActivity: "1 hour ago",
      startedAt: "Yesterday 2:00 PM",
      estimatedCompletion: "Yesterday 5:12 PM"
    }
  ];

  const filteredSessions = mockSessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Paused": return "bg-yellow-500";
      case "Completed": return "bg-blue-500";
      case "Error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <Play className="h-3 w-3" />;
      case "Paused": return <Pause className="h-3 w-3" />;
      case "Completed": return <Square className="h-3 w-3" />;
      default: return <Square className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Forge Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Collaborative AI-powered development sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Monitor className="h-4 w-4 mr-2" />
            Session Monitor
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Start New Session
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">2h 34m active time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Across all sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">3h 12m total time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <GitBranch className="h-4 w-4 mr-2" />
          Session History
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Sessions ({filteredSessions.length})</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions found matching your search.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{session.name}</CardTitle>
                            <CardDescription>{session.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(session.status)} text-white flex items-center gap-1`}
                        >
                          {getStatusIcon(session.status)}
                          {session.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">{session.progress}%</span>
                        </div>
                        <Progress value={session.progress} className="w-full" />
                      </div>

                      {/* Session Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Duration
                          </p>
                          <p className="font-medium">{session.duration}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Participants
                          </p>
                          <p className="font-medium">{session.participants.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Started</p>
                          <p className="font-medium">{session.startedAt}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Est. Completion</p>
                          <p className="font-medium">{session.estimatedCompletion}</p>
                        </div>
                      </div>

                      {/* Participants and AI Agent */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Participants</p>
                          <div className="flex gap-1">
                            {session.participants.slice(0, 3).map((participant, index) => (
                              <div 
                                key={participant}
                                className="h-6 w-6 bg-accent rounded-full flex items-center justify-center text-xs font-medium"
                                style={{ marginLeft: index > 0 ? '-4px' : '0' }}
                              >
                                {participant.split(' ').map(n => n[0]).join('')}
                              </div>
                            ))}
                            {session.participants.length > 3 && (
                              <div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium ml-1">
                                +{session.participants.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">AI Agent</p>
                          <Badge variant="outline" className="text-xs">
                            <Code className="h-3 w-3 mr-1" />
                            {session.aiAgent}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>Active sessions will be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paused">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>Paused sessions will be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>Completed sessions will be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForgeSessions;