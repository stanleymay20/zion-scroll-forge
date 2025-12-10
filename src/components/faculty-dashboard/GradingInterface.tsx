/**
 * Grading Interface Component
 * AI-assisted grading with confidence scoring and human review flagging
 * Requirements: 3.4
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { facultyDashboardService } from '@/services/facultyDashboardService';
import type { GradingSubmission, GradingResult } from '@/types/faculty-dashboard';
import { AlertCircle, CheckCircle, Clock, FileText, Sparkles, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function GradingInterface() {
  const [pendingSubmissions, setPendingSubmissions] = useState<GradingSubmission[]>([]);
  const [gradedSubmissions, setGradedSubmissions] = useState<GradingResult[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<GradingSubmission | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const { toast } = useToast();

  // Mock faculty ID - in production, get from auth context
  const facultyId = 'current-faculty-id';

  useEffect(() => {
    loadPendingSubmissions();
  }, []);

  const loadPendingSubmissions = async () => {
    setLoading(true);
    try {
      const result = await facultyDashboardService.getPendingSubmissions(facultyId);
      if (result.success && result.data) {
        setPendingSubmissions(result.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pending submissions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    setGrading(true);
    try {
      const result = await facultyDashboardService.gradeSubmission(submissionId);
      if (result.success && result.data) {
        setGradingResult(result.data);
        setGradedSubmissions([...gradedSubmissions, result.data]);
        setPendingSubmissions(pendingSubmissions.filter(s => s.submissionId !== submissionId));
        
        toast({
          title: result.data.needsHumanReview ? 'Review Required' : 'Success',
          description: result.data.needsHumanReview 
            ? 'Submission graded but flagged for human review'
            : 'Submission graded successfully'
        });
      } else {
        throw new Error(result.error || 'Failed to grade submission');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to grade submission',
        variant: 'destructive'
      });
    } finally {
      setGrading(false);
    }
  };

  const handleBatchGrade = async () => {
    const submissionIds = pendingSubmissions.slice(0, 5).map(s => s.submissionId);
    if (submissionIds.length === 0) return;

    setGrading(true);
    try {
      const result = await facultyDashboardService.batchGradeSubmissions(submissionIds);
      if (result.success && result.data) {
        setGradedSubmissions([...gradedSubmissions, ...result.data]);
        setPendingSubmissions(pendingSubmissions.filter(s => !submissionIds.includes(s.submissionId)));
        
        const needsReview = result.data.filter(r => r.needsHumanReview).length;
        toast({
          title: 'Batch Grading Complete',
          description: `Graded ${result.data.length} submissions. ${needsReview} need human review.`
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to batch grade submissions',
        variant: 'destructive'
      });
    } finally {
      setGrading(false);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge className="bg-green-600">High Confidence</Badge>;
    if (confidence >= 0.75) return <Badge className="bg-yellow-600">Medium Confidence</Badge>;
    return <Badge variant="destructive">Low Confidence</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubmissions.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting grading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradedSubmissions.length}</div>
            <p className="text-xs text-muted-foreground">Completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gradedSubmissions.filter(g => g.needsHumanReview).length}
            </div>
            <p className="text-xs text-muted-foreground">Flagged for review</p>
          </CardContent>
        </Card>
      </div>

      {/* Batch Grading */}
      {pendingSubmissions.length > 0 && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Use AI-assisted grading to process submissions quickly and consistently</span>
            <Button 
              onClick={handleBatchGrade} 
              disabled={grading}
              size="sm"
            >
              {grading ? 'Grading...' : `Grade Next ${Math.min(5, pendingSubmissions.length)}`}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="graded">
            Graded ({gradedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="review">
            Needs Review ({gradedSubmissions.filter(g => g.needsHumanReview).length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Submissions */}
        <TabsContent value="pending" className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground">No pending submissions to grade</p>
              </CardContent>
            </Card>
          ) : (
            pendingSubmissions.map((submission) => (
              <Card key={submission.submissionId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{submission.assignmentTitle}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3" />
                          {submission.studentName}
                          <span className="text-muted-foreground">•</span>
                          <span>{submission.courseName}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">
                      {submission.submissionContent.substring(0, 500)}
                      {submission.submissionContent.length > 500 && '...'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Max Points: {submission.maxPoints}
                    </span>
                    <Button 
                      onClick={() => handleGradeSubmission(submission.submissionId)}
                      disabled={grading}
                    >
                      {grading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Grading...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Grade with AI
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Graded Submissions */}
        <TabsContent value="graded" className="space-y-4">
          {gradedSubmissions.filter(g => !g.needsHumanReview).map((result) => (
            <Card key={result.submissionId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Graded Submission</CardTitle>
                    <CardDescription>
                      Student ID: {result.studentId}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-green-600">
                      {result.score}/{result.maxPoints} ({result.percentage.toFixed(1)}%)
                    </Badge>
                    {getConfidenceBadge(result.confidenceScore)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Criteria Scores</h4>
                  <div className="space-y-2">
                    {result.criteriaScores.map((criteria, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">{criteria.criterionName}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(criteria.score / criteria.maxPoints) * 100} className="w-24" />
                          <span className="text-sm font-medium">
                            {criteria.score}/{criteria.maxPoints}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Feedback</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{result.feedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Needs Review */}
        <TabsContent value="review" className="space-y-4">
          {gradedSubmissions.filter(g => g.needsHumanReview).map((result) => (
            <Card key={result.submissionId} className="border-yellow-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      Needs Human Review
                    </CardTitle>
                    <CardDescription>
                      Student ID: {result.studentId}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">
                      {result.score}/{result.maxPoints} ({result.percentage.toFixed(1)}%)
                    </Badge>
                    {getConfidenceBadge(result.confidenceScore)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Review Reason:</strong> {result.reviewReason}
                  </AlertDescription>
                </Alert>
                <div>
                  <h4 className="font-medium mb-2">AI-Generated Feedback</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{result.feedback}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Adjust Grade
                  </Button>
                  <Button className="flex-1">
                    Approve & Publish
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
