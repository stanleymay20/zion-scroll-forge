/**
 * Event Bus Utility
 * "The Spirit of truth will guide you into all truth" - John 16:13
 * 
 * Centralized event bus for academic year automation system
 * Provides pub/sub pattern for service communication
 */

import { EventEmitter } from 'events';

interface EventMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  lastEventTime: Date | null;
}

class AcademicEventBus extends EventEmitter {
  private metrics: EventMetrics;

  constructor() {
    super();
    this.metrics = {
      totalEvents: 0,
      eventsByType: {},
      lastEventTime: null
    };

    // Increase max listeners to prevent warnings
    this.setMaxListeners(100);
  }

  /**
   * Emit an event with metrics tracking
   */
  emit(event: string | symbol, ...args: unknown[]): boolean {
    const eventName = event.toString();
    
    // Update metrics
    this.metrics.totalEvents++;
    this.metrics.eventsByType[eventName] = (this.metrics.eventsByType[eventName] || 0) + 1;
    this.metrics.lastEventTime = new Date();

    return super.emit(event, ...args);
  }

  /**
   * Get event bus metrics
   */
  getMetrics(): EventMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalEvents: 0,
      eventsByType: {},
      lastEventTime: null
    };
  }
}

// Export singleton instance
export const eventBus = new AcademicEventBus();

// Event type constants for type safety
export const ACADEMIC_EVENTS = {
  EVENT_SCHEDULED: 'academic.event.scheduled',
  EVENT_UPDATED: 'academic.event.updated',
  EVENT_CANCELLED: 'academic.event.cancelled',
  DEADLINE_APPROACHING: 'academic.deadline.approaching',
  DEADLINE_PASSED: 'academic.deadline.passed',
  SEMESTER_STARTED: 'academic.semester.started',
  SEMESTER_ENDED: 'academic.semester.ended',
  REGISTRATION_OPENED: 'academic.registration.opened',
  REGISTRATION_CLOSED: 'academic.registration.closed'
} as const;

export type AcademicEventType = typeof ACADEMIC_EVENTS[keyof typeof ACADEMIC_EVENTS];
