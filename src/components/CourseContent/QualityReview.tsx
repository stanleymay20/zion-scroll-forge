import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Video, 
  FileText, 
  ClipboardCheck,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface ChecklistItem {
  criterion: string;
  passed: boolean;
  score: number;
  notes: string;
}

interface QualityReport {
  courseId: string;
  overallScore: number;
  checklistResults: ChecklistItem[];
  videoQuality?: {
    audioQuality: number;
    visualClarity: number;
    engagement: number;
    issues: string[];
  };
  contentQuality?: {
    accuracy: number;
    clarity: number;
    depth: number;
    issues: string[];
  };
  assessmentQuality?: {
    rigor: number;
    alignment: number;
    issues: string[];
  };
  approved: boolean;
  feedback: string;
  recommendations: string[];
}

interface QualityReviewProps {
  courseId: string;
  onApprove?: (decision: { approved: boolean; feedback: string }) => void;
  onReject?: (feedback: string) => void;
}

export const QualityReview: React.FC<QualityReviewProps> = ({
  courseId,
  onApprove,
  onReject
}) => {
  const [report, setReport] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewType, setReviewType] = useState<'FULL' | 'VIDEO' | 'WRITTEN' | 'ASSESSMENT'>('FULL');
  const [feedback, setFeedback] = useState('');

  const runQualityCheck = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock report data
      setReport({
        courseId,
        overallScore: 87,
        checklistResults: [
          { criterion: 'Course Structure (4-12 modules)', passed: true, score: 100, notes: 'Course has 8 modules' },
          { criterion: 'Lessons per Module (3-10)', passed: true, score: 100, notes: 'All modules have 5-7 lessons' },
          { criterion: 'Biblical Foundation', passed: true, score: 95, notes: 'Strong scriptural integration' },
          { criterion: 'Learning Objectives Clarity', passed: true, score: 90, notes: 'Clear and measurable' },
          { criterion: 'Assessment Distribution', passed: true, score: 85, notes: 'Good balance of types' },
          { criterion: 'Video Quality (1080p minimum)', passed: true, score: 100, notes: 'All videos 1080p or higher' },
          { criterion: 'Lecture Notes (10-20 pages)', passed: true, score: 90, notes: 'Comprehensive notes provided' },
          { criterion: 'Real-World Application', passed: true, score: 80, notes: 'Good deployment pathways' },
          { criterion: 'Spiritual Integration Quality', passed: true, score: 85, notes: 'Christ-centered throughout' },
          { criterion: 'Academic Rigor', passed: false, score: 70, notes: 'Some areas need deeper content' }
        ],
        videoQuality: {
          audioQuality: 95,
          visualClarity: 90,
          engagement: 85,
          issues: ['Minor audio echo in lecture 3', 'Slide transition timing in module 2']
        },
        contentQuality: {
          accuracy: 90,
          clarity: 85,
          depth: 75,
          issues: ['Module 4 needs more technical depth', 'Some examples could be more detailed']
        },
        assessmentQuality: {
          rigor: 80,
          alignment: 90,
          issues: ['Quiz questions could be more challenging', 'Project rubric needs refinement']
        },
        approved: false,
        feedback: '',
        recommendations: [
          'Increase technical depth in Module 4',
          'Add more worked examples in advanced topics',
          'Enhance quiz difficulty for better rigor',
          'Refine project rubric criteria'
        ]
      });
    } catch (error) {
      console.error('Error running quality check:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    onApprove?.({ approved: true, feedback });
  };

  const handleReject = () => {
    onReject?.(feedback);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-600">Excellent</Badge>;
    if (score >= 75) return <Badge className="bg-yellow-600">Good</Badge>;
    return <Badge className="bg-red-600">Needs Improvement</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Quality Assurance Review</CardTitle>
          <CardDescription>
            Validate course content against elite global standards and Course Constitution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Review Type Selection */}
          <div className="flex space-x-2">
            <Button
              variant={reviewType === 'FULL' ? 'default' : 'outline'}
              onClick={() => setReviewType('FULL')}
            >
              Full Review
            </Button>
            <Button
              variant={reviewType === 'VIDEO' ? 'default' : 'outline'}
              onClick={() => setReviewType('VIDEO')}
            >
              <Video className="w-4 h-4 mr-2" />
              Video Only
            </Button>
            <Button
              variant={reviewType === 'WRITTEN' ? 'default' : 'outline'}
              onClick={() => setReviewType('WRITTEN')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Written Materials
            </Button>
            <Button
              variant={reviewType === 'ASSESSMENT' ? 'default' : 'outline'}
              onClick={() => setReviewType('ASSESSMENT')}
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Assessments
            </Button>
          </div>

          {/* Run Quality Check Button */}
          {!report && (
            <div className="text-center py-12">
              <Button onClick={runQualityCheck} disabled={loading} size="lg">
                {loading ? 'Running Quality Check...' : 'Run Quality Check'}
              </Button>
            </div>
          )}

          {/* Quality Report */}
          {report && (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Overall Quality Score</CardTitle>
                    {getScoreBadge(report.overallScore)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-4xl font-bold ${getScoreColor(report.overallScore)}`}>
                        {report.overallScore}%
                      </span>
                      <span className="text-sm text-gray-500">
                        {report.approved ? 'Approved for Publication' : 'Requires Improvements'}
                      </span>
                    </div>
                    <Progress value={report.overallScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="checklist" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  <TabsTrigger value="video">Video Quality</TabsTrigger>
                  <TabsTrigger value="content">Content Quality</TabsTrigger>
                  <TabsTrigger value="assessment">Assessment Quality</TabsTrigger>
                </TabsList>

                <TabsContent value="checklist" className="space-y-4">
                  <div className="space-y-2">
                    {report.checklistResults.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg ${
                          item.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {item.passed ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium">{item.criterion}</h4>
                              <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                            </div>
                          </div>
                          <Badge variant={item.passed ? 'default' : 'destructive'}>
                            {item.score}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-4">
                  {report.videoQuality && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Audio Quality</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${getScoreColor(report.videoQuality.audioQuality)}`}>
                              {report.videoQuality.audioQuality}%
                            </div>
                            <Progress value={report.videoQuality.audioQuality} className="h-1 mt-2" />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Visual Clarity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${getScoreColor(report.videoQuality.visualClarity)}`}>
                              {report.videoQuality.visualClarity}%
                            </div>
                            <Progress value={report.videoQuality.visualClarity} className="h-1 mt-2" />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Engagement</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${getScoreColor(report.videoQuality.engagement)}`}>
                              {report.videoQuality.engagement}%
                            </div>
                            <Progress value={report.videoQuality.engagement} className="h-1 mt-2" />
                          </CardContent>
                        </Card>
                      </div>

                      {report.videoQuality.issues.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                              Issues Found
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {report.videoQuality.issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  {report.contentQuality && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Accuracy</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${getScoreColor(report.contentQuality.accuracy)}`}>
                              {report.contentQuality.accuracy}%
                            </div>
                            <Progress value={report.contentQuality.accuracy} className="h-1 mt-2" />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Clarity</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${getScoreColor(report.contentQuality.clarity)}`}>
                              {report.contentQuality.clarity}%
                            </div>
                            <Progress value={report.contentQuality.clarity} className="h-1 mt-2" />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Depth</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${getScoreColor(report.contentQuality.depth)}`}>
                              {report.contentQuality.depth}%
                            </div>
                            <Progress value={report.contentQuality.depth} className="h-1 mt-2" />
                          </CardContent>
                        </Card>
                      </div>

                      {report.contentQuality.issues.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                              Issues Found
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {report.contentQuality.issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="assessment" className="space-y-4">
                  {report.assessmentQuality && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Rigor</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${getScoreColor(report.assessmentQuality.rigor)}`}>
                              {report.assessmentQuality.rigor}%
                            </div>
                            <Progress value={report.assessmentQuality.rigor} className="h-1 mt-2" />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Alignment</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${getScoreColor(report.assessmentQuality.alignment)}`}>
                              {report.assessmentQuality.alignment}%
                            </div>
                            <Progress value={report.assessmentQuality.alignment} className="h-1 mt-2" />
                          </CardContent>
                        </Card>
                      </div>

                      {report.assessmentQuality.issues.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center">
                              <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                              Issues Found
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {report.assessmentQuality.issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>

              {/* Recommendations */}
              {report.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Reviewer Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Reviewer Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide detailed feedback for the course creators..."
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Approval Actions */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={handleReject}>
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject - Needs Improvements
                </Button>
                <Button onClick={handleApprove}>
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve for Publication
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityReview;
