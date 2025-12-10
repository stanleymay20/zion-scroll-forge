/**
 * Graduation Planning View Component
 * "The Lord will fulfill his purpose for me" - Psalm 138:8
 * 
 * Graduation planning and timeline visualization
 * Requirements: 2.5
 */

import React, { useState, useEffect } from 'react';
import { GraduationCap, Calendar, CheckCircle, AlertTriangle, TrendingUp, Send, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { studentPortalService } from '@/services/studentPortalService';
import type { GraduationEvaluation, GraduationTimeline, GraduationMilestone } from '@/types/student-portal';

interface GraduationPlanningViewProps {
  studentId: string;
}

export const GraduationPlanningView: React.FC<GraduationPlanningViewProps> = ({ studentId }) => {
  const [evaluation, setEvaluation] = useState<GraduationEvaluation | null>(null);
  const [timeline, setTimeline] = useState<GraduationTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplication, setShowApplication] = useState(false);
  const [applicationData, setApplicationData] = useState({
    diplomaMailingAddress: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGraduationData();
  }, [studentId]);

  const loadGraduationData = async () => {
    setLoading(true);
    try {
      const [evalResponse, timelineResponse] = await Promise.all([
        studentPortalService.evaluateGraduationEligibility(studentId),
        studentPortalService.getGraduationTimeline(studentId)
      ]);

      if (evalResponse.success && evalResponse.data) {
        setEvaluation(evalResponse.data);
      }

      if (timelineResponse.success && timelineResponse.data) {
        setTimeline(timelineResponse.data);
      }
    } catch (error) {
      console.error('Error loading graduation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!applicationData.diplomaMailingAddress.trim()) {
      alert('Please provide a mailing address for your diploma');
      return;
    }

    setSubmitting(true);
    try {
      const response = await studentPortalService.submitGraduationApplication(
        studentId,
        applicationData
      );

      if (response.success) {
        alert('Graduation application submitted successfully!');
        setShowApplication(false);
        loadGraduationData();
      }
    } catch (error) {
      console.error('Error submitting graduation application:', error);
      alert('Failed to submit graduation application');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Loading graduation planning data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!evaluation || !timeline) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Unable to load graduation planning data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Graduation Planning
          </CardTitle>
          <CardDescription>
            "The Lord will fulfill his purpose for me" - Psalm 138:8
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Eligibility Status */}
      <Card className={evaluation.isEligible ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {evaluation.isEligible ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-green-900">Eligible for Graduation!</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <span className="text-orange-900">Graduation Requirements In Progress</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Requirements Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <RequirementCheck
                label="Credits Completed"
                met={evaluation.requirements.creditsCompleted}
              />
              <RequirementCheck
                label="GPA Requirement Met"
                met={evaluation.requirements.gpaRequirementMet}
              />
              <RequirementCheck
                label="All Requirements Fulfilled"
                met={evaluation.requirements.allRequirementsFulfilled}
              />
              <RequirementCheck
                label="No Financial Holds"
                met={evaluation.requirements.noFinancialHolds}
              />
              <RequirementCheck
                label="No Academic Holds"
                met={evaluation.requirements.noAcademicHolds}
              />
              <RequirementCheck
                label="No Disciplinary Holds"
                met={evaluation.requirements.noDisciplinaryHolds}
              />
            </div>

            {/* Estimated Graduation Date */}
            {evaluation.estimatedGraduationDate && (
              <div className="flex items-center gap-2 p-4 bg-white rounded-lg border">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Estimated Graduation Date</p>
                  <p className="font-semibold">
                    {new Date(evaluation.estimatedGraduationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Apply Button */}
            {evaluation.isEligible && (
              <Button
                onClick={() => setShowApplication(true)}
                size="lg"
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Apply for Graduation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Graduation Application Form */}
      {showApplication && (
        <Card>
          <CardHeader>
            <CardTitle>Graduation Application</CardTitle>
            <CardDescription>
              Complete the information below to submit your graduation application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Diploma Mailing Address *
                </label>
                <Textarea
                  value={applicationData.diplomaMailingAddress}
                  onChange={(e) => setApplicationData({
                    ...applicationData,
                    diplomaMailingAddress: e.target.value
                  })}
                  placeholder="Enter your complete mailing address..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  value={applicationData.notes}
                  onChange={(e) => setApplicationData({
                    ...applicationData,
                    notes: e.target.value
                  })}
                  placeholder="Any special requests or information..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowApplication(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blockers */}
      {evaluation.blockers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items Requiring Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluation.blockers.map((blocker, index) => (
                <Alert key={index} className={getSeverityColor(blocker.severity)}>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">{blocker.description}</p>
                      {blocker.resolutionSteps.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Resolution Steps:</p>
                          <ul className="text-sm list-disc list-inside space-y-1">
                            {blocker.resolutionSteps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions */}
      {evaluation.recommendedActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation.recommendedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Graduation Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Graduation Timeline</CardTitle>
          <CardDescription>
            Projected path to graduation based on current progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {timeline.estimatedSemesters}
                </p>
                <p className="text-sm text-gray-600">Semesters Remaining</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {timeline.remainingCredits}
                </p>
                <p className="text-sm text-gray-600">Credits Remaining</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {timeline.creditsPerSemester}
                </p>
                <p className="text-sm text-gray-600">Credits per Semester</p>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-4">
              <h4 className="font-semibold">Projected Milestones</h4>
              {timeline.milestones.map((milestone, index) => (
                <MilestoneCard key={index} milestone={milestone} isLast={index === timeline.milestones.length - 1} />
              ))}
            </div>

            {/* Assumptions */}
            <Alert>
              <AlertDescription>
                <p className="font-semibold mb-2">Timeline Assumptions:</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {timeline.assumptions.map((assumption, index) => (
                    <li key={index}>{assumption}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Spiritual Formation */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-purple-600 mt-1" />
            <div>
              <p className="font-semibold text-purple-900 mb-2">Graduation Prayer</p>
              <p className="text-sm text-purple-800 mb-3">
                "Lord, as I approach graduation, I thank You for bringing me this far. Guide my steps as I prepare
                to use my education for Your glory. Help me to remain faithful in completing my studies and to trust
                Your perfect timing for my future."
              </p>
              <p className="text-xs text-purple-700 italic">
                "Commit your work to the Lord, and your plans will be established." - Proverbs 16:3
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Requirement Check Component
const RequirementCheck: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
  <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
    {met ? (
      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
    )}
    <span className={`text-sm ${met ? 'text-green-900' : 'text-orange-900'}`}>
      {label}
    </span>
  </div>
);

// Milestone Card Component
const MilestoneCard: React.FC<{ milestone: GraduationMilestone; isLast: boolean }> = ({ milestone, isLast }) => (
  <div className="relative pl-8 pb-4">
    {/* Timeline Line */}
    {!isLast && (
      <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-300" />
    )}
    
    {/* Timeline Dot */}
    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
    
    {/* Content */}
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h5 className="font-semibold">{milestone.semesterName}</h5>
              <p className="text-sm text-gray-600">
                {new Date(milestone.semesterStartDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
            <Badge variant="outline">
              {milestone.completionPercentage.toFixed(0)}% Complete
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Planned Credits</p>
              <p className="font-semibold">{milestone.plannedCredits}</p>
            </div>
            <div>
              <p className="text-gray-600">Cumulative Credits</p>
              <p className="font-semibold">{milestone.cumulativeCredits}</p>
            </div>
          </div>

          <Progress value={milestone.completionPercentage} className="h-2" />

          {milestone.keyRequirements.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">Key Requirements:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {milestone.keyRequirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default GraduationPlanningView;
