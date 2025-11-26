import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  FileText,
  Video,
  Award
} from 'lucide-react';

interface CourseProject {
  id: string;
  title: string;
  code: string;
  currentPhase: string;
  status: string;
  progress: number;
  timeline: {
    startDate: string;
    expectedCompletion: string;
    actualCompletion?: string;
  };
  team: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  milestones: Array<{
    phase: string;
    status: string;
    completionDate?: string;
    deliverables: number;
    completedDeliverables: number;
  }>;
}

export const ProductionDashboard: React.FC = () => {
  const [projects, setProjects] = useState<CourseProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<CourseProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch projects from API
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/course-content/dashboard');
      const data = await response.json();
      setProjects(data.projects || []);
      if (data.projects?.length > 0) {
        setSelectedProject(data.projects[0]);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'PENDING':
        return 'bg-gray-300';
      case 'BLOCKED':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      COMPLETED: 'default',
      IN_PROGRESS: 'secondary',
      PENDING: 'outline',
      BLOCKED: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading production dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Course Production Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Track progress, manage timelines, and monitor quality across all course projects
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">In development</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Schedule</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'ON_TRACK').length}
            </div>
            <p className="text-xs text-muted-foreground">Meeting deadlines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'AT_RISK').length}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedProject.title}</CardTitle>
                <CardDescription>{selectedProject.code}</CardDescription>
              </div>
              {getStatusBadge(selectedProject.status)}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="progress" className="w-full">
              <TabsList>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">{selectedProject.progress}%</span>
                  </div>
                  <Progress value={selectedProject.progress} className="h-2" />
                </div>

                <div className="space-y-3 mt-6">
                  <h4 className="font-medium">Phase Milestones</h4>
                  {selectedProject.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getPhaseColor(milestone.status)}`} />
                        <div>
                          <p className="font-medium">{milestone.phase.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-500">
                            {milestone.completedDeliverables} / {milestone.deliverables} deliverables
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(milestone.status)}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Start Date</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(selectedProject.timeline.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Expected Completion</Label>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>
                        {new Date(selectedProject.timeline.expectedCompletion).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Phase Timeline</h4>
                  <div className="space-y-2">
                    {selectedProject.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-24 text-sm text-gray-500">Week {index + 1}</div>
                        <div className="flex-1">
                          <div className="h-8 bg-gray-100 rounded flex items-center px-3">
                            <span className="text-sm">{milestone.phase.replace('_', ' ')}</span>
                          </div>
                        </div>
                        {milestone.completionDate && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <div className="space-y-3">
                  {selectedProject.team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Quality Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">85%</div>
                      <Progress value={85} className="h-2 mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Checklist Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">42/50</div>
                      <p className="text-sm text-gray-500 mt-1">Completed</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2 mt-4">
                  <h4 className="font-medium">Quality Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Video Quality</span>
                      <Badge variant="default">Passed</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Content Depth</span>
                      <Badge variant="default">Passed</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Spiritual Integration</span>
                      <Badge variant="secondary">In Review</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Assessment Rigor</span>
                      <Badge variant="secondary">In Review</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Project List */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>Overview of all course development projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`p-4 border rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedProject?.id === project.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{project.title}</h4>
                    <p className="text-sm text-gray-500">{project.code}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(project.status)}
                    <p className="text-sm text-gray-500 mt-1">{project.progress}% complete</p>
                  </div>
                </div>
                <Progress value={project.progress} className="h-1 mt-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <label className={className}>{children}</label>
);

export default ProductionDashboard;
