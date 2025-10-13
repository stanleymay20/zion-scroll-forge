import { Repository } from 'typeorm';
import { Enrollment } from '../models/Enrollment';
import { Course } from '../models/Course';
import { AppDataSource } from '../config/database';

export interface ActivityAlert {
  alert_id: string;
  student_id: string;
  course_id: string;
  alert_type: 'inactivity' | 'struggling' | 'at_risk' | 'milestone_missed' | 'engagement_drop';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommended_actions: string[];
  mentor_id?: string;
  created_at: Date;
  resolved_at?: Date;
}

export interface StudentActivity {
  student_id: string;
  course_id: string;
  last_login: Date;
  last_course_activity: Date;
  session_duration_avg: number;
  activities_per_week: number;
  engagement_score: number;
  progress_velocity: number;
  struggle_indicators: string[];
}

export class ActivityMonitoringService {
  private enrollmentRepository: Repository<Enrollment>;
  private courseRepository: Repository<Course>;
  private alerts: ActivityAlert[] = []; // In production, this would be a database table

  constructor() {
    this.enrollmentRepository = AppDataSource.getRepository(Enrollment);
    this.courseRepository = AppDataSource.getRepository(Course);
  }

  async monitorStudentActivity(): Promise<void> {
    console.log('🔍 Starting student activity monitoring...');
    
    const activeEnrollments = await this.enrollmentRepository.find({
      where: { status: 'in_progress' },
      relations: ['course']
    });

    for (const enrollment of activeEnrollments) {
      await this.analyzeStudentActivity(enrollment);
    }

    console.log(`✅ Activity monitoring complete. Generated ${this.alerts.length} alerts.`);
  }

  async analyzeStudentActivity(enrollment: Enrollment): Promise<void> {
    const activity = await this.getStudentActivity(enrollment.student_id, enrollment.course_id);
    
    // Check for inactivity
    await this.checkInactivity(enrollment, activity);
    
    // Check for struggling indicators
    await this.checkStruggling(enrollment, activity);
    
    // Check for at-risk patterns
    await this.checkAtRisk(enrollment, activity);
    
    // Check for missed milestones
    await this.checkMissedMilestones(enrollment);
    
    // Check for engagement drops
    await this.checkEngagementDrop(enrollment, activity);
  }

  private async checkInactivity(enrollment: Enrollment, activity: StudentActivity): Promise<void> {
    const daysSinceLastActivity = this.getDaysSince(activity.last_course_activity);
    
    if (daysSinceLastActivity >= 7) {
      const severity = daysSinceLastActivity >= 14 ? 'high' : 'medium';
      
      await this.createAlert({
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        alert_type: 'inactivity',
        severity,
        message: `Student has been inactive for ${daysSinceLastActivity} days`,
        recommended_actions: [
          'Send re-engagement email',
          'Schedule mentor check-in',
          'Provide motivational content',
          'Offer study group participation'
        ]
      });
    }
  }

  private async checkStruggling(enrollment: Enrollment, activity: StudentActivity): Promise<void> {
    const strugglingIndicators = [];
    
    // Low progress velocity
    if (activity.progress_velocity < 0.5) {
      strugglingIndicators.push('slow_progress');
    }
    
    // Low engagement score
    if (activity.engagement_score < 0.4) {
      strugglingIndicators.push('low_engagement');
    }
    
    // Multiple failed assessments (simulated)
    if (enrollment.completed_assessments.length < enrollment.course.assessments?.length * 0.3) {
      strugglingIndicators.push('assessment_struggles');
    }
    
    // Short session durations
    if (activity.session_duration_avg < 15) {
      strugglingIndicators.push('short_sessions');
    }

    if (strugglingIndicators.length >= 2) {
      await this.createAlert({
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        alert_type: 'struggling',
        severity: 'medium',
        message: `Student showing multiple struggling indicators: ${strugglingIndicators.join(', ')}`,
        recommended_actions: [
          'Assign additional tutoring support',
          'Provide supplementary learning materials',
          'Schedule mentor intervention',
          'Adjust learning path difficulty',
          'Offer peer study group'
        ]
      });
    }
  }

  private async checkAtRisk(enrollment: Enrollment, activity: StudentActivity): Promise<void> {
    const riskFactors = [];
    
    // Very low progress after significant time
    const daysSinceEnrollment = this.getDaysSince(enrollment.enrollment_date);
    if (daysSinceEnrollment > 30 && enrollment.progress_percentage < 20) {
      riskFactors.push('minimal_progress');
    }
    
    // Declining engagement
    if (activity.engagement_score < 0.3) {
      riskFactors.push('very_low_engagement');
    }
    
    // Irregular activity pattern
    if (activity.activities_per_week < 2) {
      riskFactors.push('irregular_activity');
    }
    
    // Multiple struggle indicators
    if (activity.struggle_indicators.length >= 3) {
      riskFactors.push('multiple_struggles');
    }

    if (riskFactors.length >= 2) {
      await this.createAlert({
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        alert_type: 'at_risk',
        severity: 'high',
        message: `Student at risk of dropping out. Risk factors: ${riskFactors.join(', ')}`,
        recommended_actions: [
          'Immediate mentor intervention required',
          'Consider course modification or break',
          'Provide intensive support resources',
          'Evaluate external factors affecting study',
          'Offer alternative learning approaches'
        ]
      });
    }
  }

  private async checkMissedMilestones(enrollment: Enrollment): Promise<void> {
    const daysSinceEnrollment = this.getDaysSince(enrollment.enrollment_date);
    const expectedProgress = Math.min(daysSinceEnrollment * 2, 100); // 2% per day expected
    
    if (enrollment.progress_percentage < expectedProgress * 0.7) {
      await this.createAlert({
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        alert_type: 'milestone_missed',
        severity: 'medium',
        message: `Student behind expected progress. Current: ${enrollment.progress_percentage}%, Expected: ${expectedProgress}%`,
        recommended_actions: [
          'Review and adjust study schedule',
          'Provide catch-up resources',
          'Schedule progress review meeting',
          'Identify and remove learning barriers'
        ]
      });
    }
  }

  private async checkEngagementDrop(enrollment: Enrollment, activity: StudentActivity): Promise<void> {
    // This would compare current engagement to historical averages
    // For now, we'll use a simple threshold
    if (activity.engagement_score < 0.5 && activity.activities_per_week < 3) {
      await this.createAlert({
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        alert_type: 'engagement_drop',
        severity: 'medium',
        message: `Significant drop in student engagement detected`,
        recommended_actions: [
          'Send personalized encouragement',
          'Offer variety in learning activities',
          'Check for external challenges',
          'Provide gamification incentives'
        ]
      });
    }
  }

  private async createAlert(alertData: Omit<ActivityAlert, 'alert_id' | 'created_at'>): Promise<ActivityAlert> {
    const alert: ActivityAlert = {
      alert_id: this.generateAlertId(),
      ...alertData,
      created_at: new Date()
    };

    this.alerts.push(alert);
    
    // In production, save to database and trigger notifications
    await this.notifyMentor(alert);
    await this.updateEnrollmentAlerts(alert);
    
    return alert;
  }

  private async notifyMentor(alert: ActivityAlert): Promise<void> {
    // This would integrate with notification system
    console.log(`📧 Mentor notification sent for ${alert.alert_type} alert:`, {
      student: alert.student_id,
      course: alert.course_id,
      severity: alert.severity,
      message: alert.message
    });
  }

  private async updateEnrollmentAlerts(alert: ActivityAlert): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { 
        student_id: alert.student_id, 
        course_id: alert.course_id 
      }
    });

    if (enrollment) {
      const alertKey = `${alert.alert_type}_${Date.now()}`;
      enrollment.mentor_alerts.push(alertKey);
      await this.enrollmentRepository.save(enrollment);
    }
  }

  private async getStudentActivity(studentId: string, courseId: string): Promise<StudentActivity> {
    // In production, this would query actual activity logs
    // For now, we'll simulate activity data
    const enrollment = await this.enrollmentRepository.findOne({
      where: { student_id: studentId, course_id: courseId }
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const daysSinceEnrollment = this.getDaysSince(enrollment.enrollment_date);
    const daysSinceLastActivity = this.getDaysSince(enrollment.last_activity);

    return {
      student_id: studentId,
      course_id: courseId,
      last_login: new Date(Date.now() - daysSinceLastActivity * 24 * 60 * 60 * 1000),
      last_course_activity: enrollment.last_activity,
      session_duration_avg: Math.max(10, 45 - daysSinceLastActivity * 2), // Simulated
      activities_per_week: Math.max(1, 7 - daysSinceLastActivity), // Simulated
      engagement_score: Math.max(0.1, enrollment.progress_percentage / 100 - daysSinceLastActivity * 0.05),
      progress_velocity: enrollment.progress_percentage / Math.max(daysSinceEnrollment, 1),
      struggle_indicators: this.getStruggleIndicators(enrollment)
    };
  }

  private getStruggleIndicators(enrollment: Enrollment): string[] {
    const indicators = [];
    
    if (enrollment.progress_percentage < 30) {
      indicators.push('low_progress');
    }
    
    if (enrollment.completed_lectures.length < 3) {
      indicators.push('few_lectures_completed');
    }
    
    if (enrollment.completed_assessments.length === 0) {
      indicators.push('no_assessments_completed');
    }
    
    if (enrollment.tutoring_sessions === 0) {
      indicators.push('no_tutoring_used');
    }

    return indicators;
  }

  async getActiveAlerts(studentId?: string, courseId?: string): Promise<ActivityAlert[]> {
    let filteredAlerts = this.alerts.filter(alert => !alert.resolved_at);
    
    if (studentId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.student_id === studentId);
    }
    
    if (courseId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.course_id === courseId);
    }
    
    return filteredAlerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  async resolveAlert(alertId: string, resolutionNotes?: string): Promise<void> {
    const alert = this.alerts.find(a => a.alert_id === alertId);
    if (alert) {
      alert.resolved_at = new Date();
      console.log(`✅ Alert ${alertId} resolved:`, resolutionNotes || 'No notes provided');
    }
  }

  async getActivitySummary(courseId?: string): Promise<any> {
    const activeAlerts = await this.getActiveAlerts(undefined, courseId);
    
    const summary = {
      total_active_alerts: activeAlerts.length,
      alerts_by_severity: {
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        high: activeAlerts.filter(a => a.severity === 'high').length,
        medium: activeAlerts.filter(a => a.severity === 'medium').length,
        low: activeAlerts.filter(a => a.severity === 'low').length
      },
      alerts_by_type: {
        inactivity: activeAlerts.filter(a => a.alert_type === 'inactivity').length,
        struggling: activeAlerts.filter(a => a.alert_type === 'struggling').length,
        at_risk: activeAlerts.filter(a => a.alert_type === 'at_risk').length,
        milestone_missed: activeAlerts.filter(a => a.alert_type === 'milestone_missed').length,
        engagement_drop: activeAlerts.filter(a => a.alert_type === 'engagement_drop').length
      },
      recent_alerts: activeAlerts.slice(0, 10)
    };

    return summary;
  }

  async sendReEngagementCampaign(courseId: string): Promise<void> {
    const inactiveStudents = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.course_id = :courseId', { courseId })
      .andWhere('enrollment.status = :status', { status: 'in_progress' })
      .andWhere('enrollment.last_activity < :cutoff', { 
        cutoff: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      })
      .getMany();

    for (const enrollment of inactiveStudents) {
      await this.sendReEngagementMessage(enrollment);
    }

    console.log(`📧 Re-engagement campaign sent to ${inactiveStudents.length} inactive students`);
  }

  private async sendReEngagementMessage(enrollment: Enrollment): Promise<void> {
    // This would integrate with email/notification system
    console.log(`📧 Re-engagement message sent to student ${enrollment.student_id} for course ${enrollment.course_id}`);
    
    // Update last contact
    enrollment.mentor_alerts.push(`reengagement_${Date.now()}`);
    await this.enrollmentRepository.save(enrollment);
  }

  private getDaysSince(date: Date): number {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Scheduled monitoring methods
  async runDailyMonitoring(): Promise<void> {
    console.log('🔄 Running daily activity monitoring...');
    await this.monitorStudentActivity();
  }

  async runWeeklyAnalysis(): Promise<void> {
    console.log('📊 Running weekly activity analysis...');
    
    const summary = await this.getActivitySummary();
    console.log('Weekly Activity Summary:', summary);
    
    // Generate reports for administrators
    await this.generateWeeklyReport(summary);
  }

  private async generateWeeklyReport(summary: any): Promise<void> {
    console.log('📋 Weekly Activity Report Generated:', {
      timestamp: new Date().toISOString(),
      total_alerts: summary.total_active_alerts,
      high_priority_alerts: summary.alerts_by_severity.critical + summary.alerts_by_severity.high,
      recommendations: [
        'Review high-priority alerts immediately',
        'Implement targeted interventions for struggling students',
        'Analyze patterns to improve course design'
      ]
    });
  }
}