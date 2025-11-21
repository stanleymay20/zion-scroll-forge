/**
 * Decision Display Component
 * Shows admission decision with details
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Decision, AdmissionDecisionType } from '@/types/admissions';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  FileText,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface DecisionDisplayProps {
  decision: Decision;
}

const DecisionDisplay: React.FC<DecisionDisplayProps> = ({ decision }) => {
  const getDecisionColor = (decisionType: AdmissionDecisionType) => {
    switch (decisionType) {
      case AdmissionDecisionType.ACCEPTED:
      case AdmissionDecisionType.CONDITIONAL_ACCEPTANCE:
        return 'bg-green-500';
      case AdmissionDecisionType.REJECTED:
        return 'bg-red-500';
      case AdmissionDecisionType.WAITLISTED:
        return 'bg-yellow-500';
      case AdmissionDecisionType.DEFERRED:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDecisionIcon = (decisionType: AdmissionDecisionType) => {
    switch (decisionType) {
      case AdmissionDecisionType.ACCEPTED:
      case AdmissionDecisionType.CONDITIONAL_ACCEPTANCE:
        return <CheckCircle2 className="h-6 w-6" />;
      case AdmissionDecisionType.REJECTED:
        return <XCircle className="h-6 w-6" />;
      case AdmissionDecisionType.WAITLISTED:
        return <Clock className="h-6 w-6" />;
      case AdmissionDecisionType.DEFERRED:
        return <AlertCircle className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const isAccepted = decision.decision === AdmissionDecisionType.ACCEPTED ||
    decision.decision === AdmissionDecisionType.CONDITIONAL_ACCEPTANCE;

  return (
    <Card className={`border-2 ${isAccepted ? 'border-green-500' : ''}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${getDecisionColor(decision.decision)} text-white`}>
            {getDecisionIcon(decision.decision)}
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl">
              {decision.decision === AdmissionDecisionType.ACCEPTED && 'Congratulations!'}
              {decision.decision === AdmissionDecisionType.CONDITIONAL_ACCEPTANCE && 'Conditional Acceptance'}
              {decision.decision === AdmissionDecisionType.REJECTED && 'Application Decision'}
              {decision.decision === AdmissionDecisionType.WAITLISTED && 'Waitlisted'}
              {decision.decision === AdmissionDecisionType.DEFERRED && 'Application Deferred'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Decision made on {format(new Date(decision.decisionDate), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Assessment */}
        <div>
          <h4 className="font-medium mb-2">Overall Assessment</h4>
          <p className="text-sm text-muted-foreground">{decision.overallAssessment}</p>
        </div>

        <Separator />

        {/* Strengths */}
        {decision.strengths.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {decision.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {decision.concerns.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Areas for Growth
            </h4>
            <ul className="space-y-1">
              {decision.concerns.map((concern, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {concern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {decision.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {decision.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Admission Conditions */}
        {decision.admissionConditions && decision.admissionConditions.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Conditions of Admission:</p>
              <ul className="space-y-1">
                {decision.admissionConditions.map((condition, index) => (
                  <li key={index} className="text-sm">
                    • {condition}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Enrollment Deadline */}
        {decision.enrollmentDeadline && isAccepted && (
          <Alert className="border-primary">
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">Important: Enrollment Deadline</p>
              <p className="text-sm mt-1">
                You must complete enrollment by{' '}
                <span className="font-medium">
                  {format(new Date(decision.enrollmentDeadline), 'MMMM d, yyyy')}
                </span>
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Next Steps */}
        <div>
          <h4 className="font-medium mb-3">Next Steps</h4>
          <div className="space-y-2">
            {decision.nextSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appeal Information */}
        {decision.appealEligible && decision.appealDeadline && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">Appeal Option Available</p>
              <p className="text-sm mt-1">
                You may appeal this decision by{' '}
                <span className="font-medium">
                  {format(new Date(decision.appealDeadline), 'MMMM d, yyyy')}
                </span>
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Decision Letter
          </Button>
          {isAccepted && (
            <Button variant="outline" className="flex-1">
              Begin Enrollment
            </Button>
          )}
          {decision.appealEligible && !isAccepted && (
            <Button variant="outline" className="flex-1">
              Submit Appeal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DecisionDisplay;
