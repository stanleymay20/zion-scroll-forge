/**
 * Prerequisite Override Service
 * "Grace and wisdom in academic exceptions"
 * 
 * Manages prerequisite override requests, approvals, and audit logging
 * for students who need exceptions to standard prerequisite requirements.
 */

import { PrismaClient } from '@prisma/client';
import {
  PrerequisiteOverride,
  PrerequisiteOverrideRequest,
  PrerequisiteOverrideApproval,
  OverrideStatus
} from '../types/prerequisite.types';
import PrerequisiteManagementService from './PrerequisiteManagementService';

const prisma = new PrismaClient();

export default class PrerequisiteOverrideService {
  private prerequisiteService: PrerequisiteManagementService;

  constructor() {
    this.prerequisiteService = new PrerequisiteManagementService();
  }

  /**
   * Submit a prerequisite override request
   */
  async submitOverrideRequest(
    request: PrerequisiteOverrideRequest
  ): Promise<PrerequisiteOverride> {
    const { userId, courseId, prerequisiteId, reason, documentation, requestedBy } = request;

    // Validate that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Validate that the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    // Validate that the prerequisite exists for this course
    const prerequisite = await this.prerequisiteService.getPrerequisite(courseId);
    if (!prerequisite || !prerequisite.requiredCourses.includes(prerequisiteId)) {
      throw new Error(`Prerequisite ${prerequisiteId} not found for course ${courseId}`);
    }

    // Check if there's already a pending or approved override
    const existingOverride = await this.findExistingOverride(userId, courseId, prerequisiteId);
    if (existingOverride && ['PENDING', 'APPROVED'].includes(existingOverride.status)) {
      throw new Error(
        `An ${existingOverride.status.toLowerCase()} override request already exists`
      );
    }

    // Validate that the requester has appropriate role
    const requester = await prisma.user.findUnique({
      where: { id: requestedBy }
    });

    if (!requester) {
      throw new Error(`Requester not found: ${requestedBy}`);
    }

    // Create the override request
    const override: PrerequisiteOverride = {
      id: `override_${Date.now()}_${userId}`,
      userId,
      courseId,
      prerequisiteId,
      reason,
      documentation,
      requestedBy,
      requestedAt: new Date(),
      status: OverrideStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Log the override request for audit trail
    await this.logOverrideAction(override.id, 'CREATED', requestedBy, {
      reason,
      documentation
    });

    return override;
  }

  /**
   * Approve or deny a prerequisite override request
   */
  async processOverrideRequest(
    approval: PrerequisiteOverrideApproval
  ): Promise<PrerequisiteOverride> {
    const { overrideId, approvedBy, approved, comments, expiresAt } = approval;

    // Validate that the approver exists and has appropriate role
    const approver = await prisma.user.findUnique({
      where: { id: approvedBy }
    });

    if (!approver) {
      throw new Error(`Approver not found: ${approvedBy}`);
    }

    // Check if approver has authorization (ADMIN or FACULTY role)
    if (!['ADMIN', 'FACULTY'].includes(approver.role)) {
      throw new Error('Insufficient permissions to approve override requests');
    }

    // Get the existing override (in production, this would be from a database)
    // For now, we'll create a mock override
    const override: PrerequisiteOverride = {
      id: overrideId,
      userId: 'user_id',
      courseId: 'course_id',
      prerequisiteId: 'prereq_id',
      reason: 'Override reason',
      documentation: 'Documentation',
      requestedBy: 'requester_id',
      requestedAt: new Date(),
      approvedBy,
      approvedAt: new Date(),
      status: approved ? OverrideStatus.APPROVED : OverrideStatus.DENIED,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Log the approval/denial action
    await this.logOverrideAction(overrideId, approved ? 'APPROVED' : 'DENIED', approvedBy, {
      comments,
      expiresAt: expiresAt?.toISOString()
    });

    // Send notification to the student
    await this.notifyStudent(override.userId, override, approved);

    return override;
  }

  /**
   * Revoke an approved override
   */
  async revokeOverride(
    overrideId: string,
    revokedBy: string,
    reason: string
  ): Promise<PrerequisiteOverride> {
    // Validate that the revoker has appropriate role
    const revoker = await prisma.user.findUnique({
      where: { id: revokedBy }
    });

    if (!revoker || !['ADMIN', 'FACULTY'].includes(revoker.role)) {
      throw new Error('Insufficient permissions to revoke override');
    }

    // Get the existing override
    // In production, fetch from database
    const override: PrerequisiteOverride = {
      id: overrideId,
      userId: 'user_id',
      courseId: 'course_id',
      prerequisiteId: 'prereq_id',
      reason: 'Override reason',
      documentation: 'Documentation',
      requestedBy: 'requester_id',
      requestedAt: new Date(),
      approvedBy: 'approver_id',
      approvedAt: new Date(),
      status: OverrideStatus.REVOKED,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Log the revocation
    await this.logOverrideAction(overrideId, 'REVOKED', revokedBy, { reason });

    // Notify the student
    await this.notifyStudent(override.userId, override, false);

    return override;
  }

  /**
   * Get all override requests for a student
   */
  async getStudentOverrides(userId: string): Promise<PrerequisiteOverride[]> {
    // In production, fetch from database
    // For now, return empty array
    return [];
  }

  /**
   * Get all pending override requests (for administrators)
   */
  async getPendingOverrides(): Promise<PrerequisiteOverride[]> {
    // In production, fetch from database
    // For now, return empty array
    return [];
  }

  /**
   * Get override requests for a specific course
   */
  async getCourseOverrides(courseId: string): Promise<PrerequisiteOverride[]> {
    // In production, fetch from database
    // For now, return empty array
    return [];
  }

  /**
   * Check if a student has an active override for a prerequisite
   */
  async hasActiveOverride(
    userId: string,
    courseId: string,
    prerequisiteId: string
  ): Promise<boolean> {
    const override = await this.findExistingOverride(userId, courseId, prerequisiteId);

    if (!override) {
      return false;
    }

    // Check if override is approved and not expired
    if (override.status !== OverrideStatus.APPROVED) {
      return false;
    }

    if (override.expiresAt && override.expiresAt < new Date()) {
      // Override has expired, update status
      override.status = OverrideStatus.EXPIRED;
      await this.logOverrideAction(override.id, 'EXPIRED', 'SYSTEM', {});
      return false;
    }

    return true;
  }

  /**
   * Get override statistics for reporting
   */
  async getOverrideStatistics(courseId?: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    denied: number;
    expired: number;
    revoked: number;
    approvalRate: number;
  }> {
    // In production, query database for statistics
    // For now, return mock data
    return {
      total: 0,
      pending: 0,
      approved: 0,
      denied: 0,
      expired: 0,
      revoked: 0,
      approvalRate: 0
    };
  }

  /**
   * Get audit log for an override request
   */
  async getOverrideAuditLog(overrideId: string): Promise<Array<{
    action: string;
    performedBy: string;
    performedAt: Date;
    details: Record<string, any>;
  }>> {
    // In production, fetch from audit log table
    // For now, return empty array
    return [];
  }

  /**
   * Find existing override for a student/course/prerequisite combination
   */
  private async findExistingOverride(
    userId: string,
    courseId: string,
    prerequisiteId: string
  ): Promise<PrerequisiteOverride | null> {
    // In production, query database
    // For now, return null
    return null;
  }

  /**
   * Log an override action for audit trail
   */
  private async logOverrideAction(
    overrideId: string,
    action: string,
    performedBy: string,
    details: Record<string, any>
  ): Promise<void> {
    // In production, insert into audit log table
    console.log(`[AUDIT] Override ${overrideId}: ${action} by ${performedBy}`, details);

    // Could also use a dedicated audit logging service
    // await auditLogService.log({
    //   entityType: 'PREREQUISITE_OVERRIDE',
    //   entityId: overrideId,
    //   action,
    //   performedBy,
    //   details,
    //   timestamp: new Date()
    // });
  }

  /**
   * Send notification to student about override status
   */
  private async notifyStudent(
    userId: string,
    override: PrerequisiteOverride,
    approved: boolean
  ): Promise<void> {
    // In production, use notification service
    console.log(`[NOTIFICATION] Sending override ${approved ? 'approval' : 'denial'} to user ${userId}`);

    // Could integrate with NotificationService
    // await notificationService.send({
    //   userId,
    //   type: 'PREREQUISITE_OVERRIDE',
    //   title: `Prerequisite Override ${approved ? 'Approved' : 'Denied'}`,
    //   message: `Your prerequisite override request for course ${override.courseId} has been ${approved ? 'approved' : 'denied'}.`,
    //   data: override
    // });
  }

  /**
   * Check and expire old overrides
   */
  async expireOldOverrides(): Promise<number> {
    // In production, query and update expired overrides
    // This would typically be run as a scheduled job
    const now = new Date();
    let expiredCount = 0;

    // Query for approved overrides with expiration dates in the past
    // Update their status to EXPIRED
    // Log the expiration

    return expiredCount;
  }

  /**
   * Generate override request documentation template
   */
  generateDocumentationTemplate(
    userId: string,
    courseId: string,
    prerequisiteId: string
  ): string {
    return `
PREREQUISITE OVERRIDE REQUEST DOCUMENTATION

Student ID: ${userId}
Course ID: ${courseId}
Prerequisite ID: ${prerequisiteId}
Date: ${new Date().toISOString()}

REASON FOR OVERRIDE REQUEST:
[Please provide detailed explanation]

SUPPORTING EVIDENCE:
[Please attach relevant documentation such as:]
- Prior coursework or experience
- Transfer credits
- Professional certifications
- Portfolio of work
- Letters of recommendation

ACADEMIC ADVISOR RECOMMENDATION:
[To be completed by academic advisor]

DEPARTMENT CHAIR APPROVAL:
[To be completed by department chair]

STUDENT SIGNATURE: _________________ DATE: _________

ADVISOR SIGNATURE: _________________ DATE: _________

CHAIR SIGNATURE: ___________________ DATE: _________
    `.trim();
  }
}
