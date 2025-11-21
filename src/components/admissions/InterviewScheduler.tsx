/**
 * Interview Scheduler Component
 * Display and manage interview appointments
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Interview } from '@/types/admissions';
import { Calendar, Clock, Video, Phone, MapPin, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface InterviewSchedulerProps {
  interviews: Interview[];
  applicationId: string;
}

const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({ interviews, applicationId }) => {
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'PHONE':
        return <Phone className="h-4 w-4" />;
      case 'IN_PERSON':
        return <MapPin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {interviews.map((interview) => (
        <Card key={interview.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium mb-1">
                    {interview.interviewType.replace(/_/g, ' ')}
                  </h4>
                  {interview.interviewerName && (
                    <p className="text-sm text-muted-foreground">
                      with {interview.interviewerName}
                    </p>
                  )}
                </div>
                <Badge variant={getStatusColor(interview.status)}>
                  {interview.status}
                </Badge>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(interview.scheduledDate), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(interview.scheduledDate), 'h:mm a')} ({interview.duration} minutes)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {getFormatIcon(interview.format)}
                  <span>{interview.format.replace(/_/g, ' ')}</span>
                </div>
                {interview.platform && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span>Platform: {interview.platform}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {interview.status === 'scheduled' && interview.meetingUrl && (
                <Button className="w-full" asChild>
                  <a href={interview.meetingUrl} target="_blank" rel="noopener noreferrer">
                    <Video className="h-4 w-4 mr-2" />
                    Join Interview
                  </a>
                </Button>
              )}

              {/* Preparation Materials */}
              {interview.preparationMaterials && interview.preparationMaterials.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">Preparation Materials:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {interview.preparationMaterials.map((material, index) => (
                      <li key={index}>• {material}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InterviewScheduler;
