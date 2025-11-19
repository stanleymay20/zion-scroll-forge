import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, Plus, Search, Activity, Cpu, Zap,
  Settings, BarChart3, Play, Pause, Square,
  Brain, MessageSquare, Code
} from "lucide-react";

const Agents = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const mockAgents = [
    {
      id: 1,
      name: "ScrollArchitect AI",
      description: "Specialized in system architecture design and documentation",
      status: "Active",
      type: "Architecture",
      performance: 94,
      uptime: "99.8%",
      lastActive: "2 minutes ago",
      capabilities: ["System Design", "Documentation", "Code Review"],
      load: 67
    },
    {
      id: 2,
      name: "TutorBot Genesis",
      description: "Advanced AI tutor for personalized learning experiences",
      status: "Training",
      type: "Education",
      performance: 87,
      uptime: "98.2%",
      lastActive: "5 minutes ago",
      capabilities: ["Teaching", "Assessment", "Personalization"],
      load: 23
    },
    {
      id: 3,
      name: "CodeForge Assistant",
      description: "AI-powered development assistant for code generation",
      status: "Idle",
      type: "Development",
      performance: 91,
      uptime: "99.5%",
      lastActive: "1 hour ago",
      capabilities: ["Code Generation", "Debugging", "Optimization"],
      load: 12
    }
  ];

  const filteredAgents = mockAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Training": return "bg-blue-500";
      case "Idle": return "bg-yellow-500";
      case "Error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <Play className="h-3 w-3" />;
      case "Training": return <Activity className="h-3 w-3" />;
      case "Idle": return <Pause className="h-3 w-3" />;
      case "Error": return <Square className="h-3 w-3" />;
      default: return <Square className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">AI Agent Fleet</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor your AI development agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Fleet Settings
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Deploy New Agent
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 from last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91%</div>
            <p className="text-xs text-muted-foreground">+2.3% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fleet Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34%</div>
            <p className="text-xs text-muted-foreground">Optimal range</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Performance Report
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Agents ({filteredAgents.length})</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="idle">Idle</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredAgents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No agents found matching your search.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <CardDescription>{agent.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(agent.status)} text-white flex items-center gap-1`}
                        >
                          {getStatusIcon(agent.status)}
                          {agent.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Performance</p>
                          <div className="flex items-center gap-2">
                            <Progress value={agent.performance} className="flex-1" />
                            <span className="font-medium">{agent.performance}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Load</p>
                          <div className="flex items-center gap-2">
                            <Progress value={agent.load} className="flex-1" />
                            <span className="font-medium">{agent.load}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Uptime</p>
                          <p className="font-medium">{agent.uptime}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Active</p>
                          <p className="font-medium">{agent.lastActive}</p>
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Capabilities</p>
                        <div className="flex gap-2">
                          {agent.capabilities.map((capability) => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
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
                <p>Active agents will be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>Training agents will be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="idle">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>Idle agents will be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Agents;