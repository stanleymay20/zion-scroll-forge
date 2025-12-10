/**
 * Workflow Monitoring Dashboard
 * "For God is not a God of disorder but of peace" - 1 Corinthians 14:33
 * 
 * Real-time monitoring of workflow execution for Academic Year Automation System
 * Requirements: 5.1 - Workflow Automation and Orchestration
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Filter,
} from 'lucide-react';

interface WorkflowContextData {
  applicantName?: string;
  studentId?: string;
  studentName?: string;
  courseId?: string;
  [key: string]: string | number | boolean | undefined;
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  entityType: string;
  entityId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  contextData: WorkflowContextData;
}

interface WorkflowStats {
  total: number;
  running: number;
  completed: number;
  failed: number;
  avgDuration: number;
  successRate: number;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const WorkflowMonitoringDashboard: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWorkflows();
    const interval = setInterval(loadWorkflows, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const loadWorkflows = async (): Promise<void> => {
    try {
      setError(null);
      
      // Fetch workflows from API
      const workflowsResponse = await fetch(
        `${API_BASE_URL}/workflow-notifications/instances?status=${filter !== 'all' ? filter : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!workflowsResponse.ok) {
        throw new Error(`Failed to fetch workflows: ${workflowsResponse.statusText}`);
      }

      const workflowsData = await workflowsResponse.json();

      // Fetch workflow statistics
      const statsResponse = await fetch(
        `${API_BASE_URL}/workflow-notifications/stats`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch stats: ${statsResponse.statusText}`);
      }

      const statsData = await statsResponse.json();

      // Transform API data to component format
      const transformedWorkflows: WorkflowInstance[] = (workflowsData.data || []).map((wf: {
        id: string;
        workflowId: string;
        workflowName: string;
        entityType: string;
        entityId: string;
        status: string;
        currentStep: number;
        totalSteps: number;
        startedAt: string;
        completedAt?: string;
        error?: string;
        contextData: WorkflowContextData;
      }) => ({
        ...wf,
        startedAt: new Date(wf.startedAt),
        completedAt: wf.completedAt ? new Date(wf.completedAt) : undefined,
        status: wf.status as 'running' | 'completed' | 'failed' | 'paused',
      }));

      setWorkflows(transformedWorkflows);
      setStats(statsData.data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Failed to load workflows:', errorMessage);
      setError(errorMessage);
      
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        const mockWorkflows: WorkflowInstance[] = [
          {
            id: '1',
            workflowId: 'wf-001',
            workflowName: 'Student Admission Workflow',
            entityType: 'application',
            entityId: 'app-123',
            status: 'running',
            currentStep: 3,
            totalSteps: 5,
            startedAt: new Date(Date.now() - 3600000),
            contextData: { applicantName: 'John Doe' },
          },
          {
            id: '2',
            workflowId: 'wf-002',
            workflowName: 'Course Registration Workflow',
            entityType: 'enrollment',
            entityId: 'enr-456',
            status: 'completed',
            currentStep: 4,
            totalSteps: 4,
            startedAt: new Date(Date.now() - 7200000),
            completedAt: new Date(Date.now() - 3600000),
            contextData: { studentId: 'stu-789' },
          },
          {
            id: '3',
            workflowId: 'wf-003',
            workflowName: 'Graduation Evaluation Workflow',
            entityType: 'student',
            entityId: 'stu-789',
            status: 'failed',
            currentStep: 2,
            totalSteps: 6,
            startedAt: new Date(Date.now() - 1800000),
            error: 'Degree requirements not met',
            contextData: { studentName: 'Jane Smith' },
          },
        ];

        const mockStats: WorkflowStats = {
          total: 150,
          running: 12,
          completed: 125,
          failed: 13,
          avgDuration: 3600,
          successRate: 83.3,
        };

        setWorkflows(mockWorkflows);
        setStats(mockStats);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: WorkflowInstance['status']) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: WorkflowInstance['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      running: 'default',
      completed: 'secondary',
      failed: 'destructive',
      paused: 'outline',
    };
    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDuration = (startedAt: Date, completedAt?: Date) => {
    const end = completedAt || new Date();
    const duration = Math.floor((end.getTime() - startedAt.getTime()) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleWorkflowAction = async (workflowId: string, action: 'pause' | 'resume' | 'retry'): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/workflow-notifications/instances/${workflowId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} workflow: ${response.statusText}`);
      }

      // Reload workflows to reflect changes
      await loadWorkflows();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error(`Failed to ${action} workflow:`, errorMessage);
      setError(errorMessage);
    }
  };

  const filteredWorkflows = workflows.filter((wf) => {
    if (filter !== 'all' && wf.status !== filter) return false;
    if (searchTerm && !wf.workflowName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6" role="main" aria-label="Workflow Monitoring Dashboard">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" aria-hidden="true" />
          Workflow Monitoring
        </h2>
        <p className="text-muted-foreground mt-1">
          Real-time monitoring of academic workflow execution - "For God is not a God of disorder but of peace"
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              <p className="font-medium">Error loading workflows: {error}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadWorkflows}
              className="mt-3"
              aria-label="Retry loading workflows"
            >
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="region" aria-label="Workflow Statistics">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label={`${stats.total} total workflows`}>
                {stats.total}
              </div>
              <p className="text-xs text-muted-foreground">All time executions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label={`${stats.running} workflows currently running`}>
                {stats.running}
              </div>
              <p className="text-xs text-muted-foreground">Currently executing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label={`${stats.successRate.toFixed(1)}% success rate`}>
                {stats.successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completed} completed, {stats.failed} failed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label={`${Math.floor(stats.avgDuration / 60)} minutes average duration`}>
                {Math.floor(stats.avgDuration / 60)}m
              </div>
              <p className="text-xs text-muted-foreground">Average execution time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" aria-hidden="true" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search workflows by name"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]" aria-label="Filter workflows by status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={loadWorkflows}
            aria-label="Refresh workflow data"
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Workflow List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Workflows</CardTitle>
          <CardDescription>
            {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading workflows...</div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No workflows found</div>
          ) : (
            <div className="space-y-4">
              {filteredWorkflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(workflow.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{workflow.workflowName}</h4>
                            {getStatusBadge(workflow.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {workflow.entityType} • {workflow.entityId}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(workflow.startedAt, workflow.completedAt)}
                            </span>
                            <span>
                              Step {workflow.currentStep} of {workflow.totalSteps}
                            </span>
                          </div>
                          {workflow.error && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                              {workflow.error}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {workflow.status === 'running' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleWorkflowAction(workflow.id, 'pause')}
                            aria-label={`Pause workflow ${workflow.workflowName}`}
                          >
                            <Pause className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        {workflow.status === 'paused' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleWorkflowAction(workflow.id, 'resume')}
                            aria-label={`Resume workflow ${workflow.workflowName}`}
                          >
                            <Play className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        {workflow.status === 'failed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleWorkflowAction(workflow.id, 'retry')}
                            aria-label={`Retry workflow ${workflow.workflowName}`}
                          >
                            <RefreshCw className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            workflow.status === 'completed'
                              ? 'bg-green-500'
                              : workflow.status === 'failed'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                          style={{
                            width: `${(workflow.currentStep / workflow.totalSteps) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowMonitoringDashboard;
