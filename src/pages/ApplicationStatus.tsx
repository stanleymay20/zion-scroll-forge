/**
 * Application Status Tracking Page
 * Track application progress and view decision
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  MessageSquare,
  Edit,
  Download,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ApplicantDashboard,
  ApplicationStatus as AppStatus,
  TimelineEvent,
  DocumentRequirement,
  Interview,
  Decision
} from '@/types/admissions';
import { format } from 'date-fns';
import ApplicationTimeline from '@/components/admissions/ApplicationTimeline';
import DocumentChecklist from '@/components/admissions/DocumentChecklist';
import InterviewScheduler from '@/components/admissions/InterviewScheduler';
import DecisionDisplay from '@/components/admissions/DecisionDisplay';

const ApplicationStatus: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<ApplicantDashboard | null>(null);

  useEffect(() => {
    if (applicationId) {
      loadDashboard();
    }
  }, [applicationId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/login');
        return;
      }

      // Load application
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (appError) throw appError;

      // Load timeline events
      const { data: timelineData } = await supabase
        .from('application_timeline')
        .select('*')
        .eq('applicationId', applicationId)
        .order('eventDate', { ascending: false });

      // Load documents
      const { data: docsData } = await supabase
        .from('application_documents')
        .select('*')
        .eq('applicationId', applicationId);

      // Load interviews
      const { data: interviewsData } = await supabase
        .from('interviews')
        .select('*')
        .eq('applicationId', applicationId)
        .order('scheduledDate', { ascending: true });

      // Load decision if exists
      const { data: decisionData } = await supabase
        .from('admission_decisions')
        .select('*')
        .eq('applicationId', applicationId)
        .single();

      // Build dashboard
      const dashboardData: ApplicantDashboard = {
        applicationId: appData.id,
        applicantId: appData.applicantId,
        applicationStatus: appData.status,
        programApplied: appData.programApplied,
        submissionDate: appData.submissionDate,
        timeline: timelineData || [],
        completionPercentage: appData.completionPercentage,
        nextSteps: generateNextSteps(appData.status),
        requiredDocuments: generateDocumentRequirements(docsData || []),
        upcomingInterviews: interviewsData || [],
        decision: decisionData || undefined
      };

      setDashboard(dashboardData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load application status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNextSteps = (status: AppStatus): string[] => {
    switch (status) {
      case AppStatus.DRAFT:
        return [
          'Complete all required sections of the application',
          'Upload all required documents',
          'Review and submit your application'
        ];
      case AppStatus.SUBMITTED:
        return [
          'Your application is under review',
          'You will be notified of the next steps via email',
          'Check your email regularly for updates'
        ];
      case AppStatus.UNDER_REVIEW:
        return [
          'Your application is being reviewed by our admissions team',
          'This process typically takes 2-4 weeks',
          'You may be contacted for additional information'
        ];
      case AppStatus.INTERVIEW_SCHEDULED:
        return [
          'Prepare for your upcoming interview',
          'Review the preparation materials provided',
          'Ensure you have a stable internet connection for video interviews'
        ];
      case AppStatus.INTERVIEW_COMPLETED:
        return [
          'Thank you for completing your interview',
          'A decision will be made within 1-2 weeks',
          'You will be notified via email'
        ];
      case AppStatus.ACCEPTED:
        return [
          'Congratulations! You have been accepted',
          'Review your acceptance letter and conditions',
          'Complete enrollment by the deadline specified'
        ];
      case AppStatus.WAITLISTED:
        return [
          'You have been placed on the waitlist',
          'We will notify you if a spot becomes available',
          'You may submit additional materials to strengthen your application'
        ];
      case AppStatus.REJECTED:
        return [
          'We appreciate your interest in ScrollUniversity',
          'You may appeal this decision within 30 days',
          'Consider reapplying in a future term'
        ];
      default:
        return [];
    }
  };

  const generateDocumentRequirements = (uploadedDocs: any[]): DocumentRequirement[] => {
    const requirements = [
      { type: 'TRANSCRIPT', label: 'Academic Transcript', required: true },
      { type: 'RECOMMENDATION_LETTER', label: 'Recommendation Letters', required: true },
      { type: 'PERSONAL_STATEMENT', label: 'Personal Statement', required: true },
      { type: 'SPIRITUAL_TESTIMONY', label: 'Spiritual Testimony', required: true },
      { type: 'IDENTIFICATION', label: 'Identification', required: true }
    ];

    return requirements.map(req => {
      const uploaded = uploadedDocs.find(doc => doc.documentType === req.type);
      return {
        documentType: req.type as any,
        required: req.required,
        uploaded: !!uploaded,
        verified: uploaded?.verificationStatus === 'verified',
        instructions: `Upload your ${req.label.toLowerCase()}`
      };
    });
  };

  const getStatusColor = (status: AppStatus): string => {
    switch (status) {
      case AppStatus.ACCEPTED:
        return 'bg-green-500';
      case AppStatus.REJECTED:
        return 'bg-red-500';
      case AppStatus.WAITLISTED:
        return 'bg-yellow-500';
      case AppStatus.UNDER_REVIEW:
      case AppStatus.INTERVIEW_SCHEDULED:
      case AppStatus.INTERVIEW_COMPLETED:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: AppStatus) => {
    switch (status) {
      case AppStatus.ACCEPTED:
        return <CheckCircle2 className="h-5 w-5" />;
      case AppStatus.REJECTED:
        return <AlertCircle className="h-5 w-5" />;
      case AppStatus.UNDER_REVIEW:
      case AppStatus.INTERVIEW_SCHEDULED:
      case AppStatus.INTERVIEW_COMPLETED:
        return <Clock className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Application not found. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Application Status</h1>
            <p className="text-muted-foreground">
              {dashboard.programApplied} Program
            </p>
          </div>
          {dashboard.applicationStatus === AppStatus.DRAFT && (
            <Button onClick={() => navigate(`/admissions/apply/${applicationId}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Continue Application
            </Button>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(dashboard.applicationStatus)} text-white`}>
            <span className="flex items-center gap-2">
              {getStatusIcon(dashboard.applicationStatus)}
              {dashboard.applicationStatus.replace(/_/g, ' ')}
            </span>
          </Badge>
          {dashboard.submissionDate && (
            <span className="text-sm text-muted-foreground">
              Submitted on {format(new Date(dashboard.submissionDate), 'PPP')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Decision Display */}
          {dashboard.decision && (
            <DecisionDisplay decision={dashboard.decision} />
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
              <CardDescription>Track your application progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationTimeline events={dashboard.timeline} />
            </CardContent>
          </Card>

          {/* Interviews */}
          {dashboard.upcomingInterviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Interviews</CardTitle>
                <CardDescription>Upcoming interview appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <InterviewScheduler
                  interviews={dashboard.upcomingInterviews}
                  applicationId={dashboard.applicationId}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completion Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span className="font-medium">{dashboard.completionPercentage}%</span>
                </div>
                <Progress value={dashboard.completionPercentage} />
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {dashboard.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Document Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentChecklist documents={dashboard.requiredDocuments} />
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Admissions
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                FAQ & Resources
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;
