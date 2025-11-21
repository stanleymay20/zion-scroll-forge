/**
 * Application Timeline Component
 * Visual timeline of application events
 */

import React from 'react';
import { TimelineEvent } from '@/types/admissions';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface ApplicationTimelineProps {
  events: TimelineEvent[];
}

const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ events }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div key={event.eventId} className="flex gap-4">
          {/* Icon and Line */}
          <div className="flex flex-col items-center">
            <div className="flex-shrink-0">
              {getStatusIcon(event.status)}
            </div>
            {index < events.length - 1 && (
              <div className="w-0.5 h-full bg-border mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-6">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-medium">{event.description}</h4>
              <span className="text-sm text-muted-foreground">
                {format(new Date(event.eventDate), 'MMM d, yyyy')}
              </span>
            </div>
            {event.details && (
              <p className="text-sm text-muted-foreground">{event.details}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicationTimeline;
