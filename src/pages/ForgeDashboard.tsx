import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, Bot, Zap, TrendingUp, Clock, 
  Activity, Code, GitBranch, Monitor, Users,
  BarChart3, Target, Calendar, Bell, Plus,
  Cpu, Database, Settings, Play, Eye
} from "lucide-react";

const ForgeDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Welcome to Zion Scroll Forge</h1>
          <p className="text-muted-foreground mt-2">
            Your AI-powered development platform for creating intelligent systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Quick Setup
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Specs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">3 active</span>, 5 idle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forge Sessions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              2h 34m active time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Optimal</span> performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Your current development initiatives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                        <Code className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">ScrollUniversity Architecture</p>
                        <p className="text-sm text-muted-foreground">System redesign</p>
                      </div>
                    </div>
                    <Badge variant="secondary">67% Complete</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center">
                        <Bot className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">AI Tutor Enhancement</p>
                        <p className="text-sm text-muted-foreground">Capability expansion</p>
                      </div>
                    </div>
                    <Badge variant="outline">Paused</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <Database className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Data Pipeline Optimization</p>
                        <p className="text-sm text-muted-foreground">Performance tuning</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Real-time platform health metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">API Performance</span>
                      <span className="text-sm text-muted-foreground">245ms avg</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Agent Utilization</span>
                      <span className="text-sm text-muted-foreground">34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Storage Usage</span>
                      <span className="text-sm text-muted-foreground">67% of 100GB</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Network Throughput</span>
                      <span className="text-sm text-muted-foreground">42 MB/s</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Specifications</CardTitle>
              <CardDescription>Latest updates to your project specs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Scroll University Architecture", author: "System Team", time: "2 hours ago", status: "Updated" },
                  { name: "AI Tutor Specification", author: "AI Team", time: "1 day ago", status: "Draft" },
                  { name: "ScrollCoin Economic Model", author: "Economics Team", time: "3 days ago", status: "Published" }
                ].map((spec, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{spec.name}</p>
                        <p className="text-sm text-muted-foreground">by {spec.author} • {spec.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={spec.status === 'Updated' ? 'default' : 'outline'}>
                        {spec.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across your forge environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Agent deployment completed", time: "5 minutes ago", type: "success" },
                  { action: "New specification created", time: "1 hour ago", type: "info" },
                  { action: "Forge session started", time: "2 hours ago", type: "info" },
                  { action: "System backup completed", time: "4 hours ago", type: "success" },
                  { action: "Performance alert resolved", time: "6 hours ago", type: "warning" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>System metrics over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mr-2" />
                  <span>Analytics visualization would go here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Efficiency</CardTitle>
                <CardDescription>AI agent performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <Target className="h-8 w-8 mr-2" />
                  <span>Efficiency charts would go here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quick-actions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Create Specification
                </CardTitle>
                <CardDescription>Start a new project specification</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Deploy AI Agent
                </CardTitle>
                <CardDescription>Launch a new AI development agent</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Start Forge Session
                </CardTitle>
                <CardDescription>Begin collaborative development</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Version Control
                </CardTitle>
                <CardDescription>Manage specification versions</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Monitor
                </CardTitle>
                <CardDescription>View detailed system metrics</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Platform Settings
                </CardTitle>
                <CardDescription>Configure forge environment</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForgeDashboard;