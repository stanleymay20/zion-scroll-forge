/**
 * Collaborative Editing Service
 * Manages multiple contributor inputs for content creation
 * with real-time collaboration and version control
 */

import ReviewWorkflowService from './ReviewWorkflowService';

interface EditingSession {
  id: string;
  contentId: string;
  sessionName: string;
  contributors: Contributor[];
  currentVersion: ContentVersion;
  versionHistory: ContentVersion[];
  activeEdits: ActiveEdit[];
  locks: ContentLock[];
  status: SessionStatus;
  createdAt: Date;
  lastModified: Date;
  collaborationMode: CollaborationMode;
}

interface Contributor {
  id: string;
  userId: string;
  name: string;
  role: ContributorRole;
  permissions: Permission[];
  joinedAt: Date;
  lastActive: Date;
  contributionCount: number;
  isOnline: boolean;
}

enum ContributorRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  REVIEWER = 'reviewer',
  COMMENTER = 'commenter',
  VIEWER = 'viewer'
}

enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  APPROVE = 'approve',
  MANAGE_CONTRIBUTORS = 'manage_contributors',
  LOCK_CONTENT = 'lock_content'
}

interface ContentVersion {
  version: number;
  content: string;
  authorId: string;
  timestamp: Date;
  changeDescription: string;
  changes: ContentChange[];
  approvalStatus: ApprovalStatus;
  reviewComments: ReviewComment[];
}

interface ContentChange {
  id: string;
  type: ChangeType;
  section: string;
  oldValue: string;
  newValue: string;
  authorId: string;
  timestamp: Date;
  approved: boolean;
}

enum ChangeType {
  ADDITION = 'addition',
  DELETION = 'deletion',
  MODIFICATION = 'modification',
  FORMATTING = 'formatting',
  RESTRUCTURE = 'restructure'
}

enum ApprovalStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVISION = 'needs_revision'
}

interface ReviewComment {
  id: string;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  section: string;
  timestamp: Date;
  resolved: boolean;
}

interface ActiveEdit {
  id: string;
  contributorId: string;
  section: string;
  startTime: Date;
  lastUpdate: Date;
  content: string;
  isConflicting: boolean;
}

interface ContentLock {
  id: string;
  section: string;
  lockedBy: string;
  lockedAt: Date;
  expiresAt: Date;
  reason: string;
}

enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

enum CollaborationMode {
  REAL_TIME = 'real_time',
  ASYNCHRONOUS = 'asynchronous',
  REVIEW_ONLY = 'review_only'
}

interface EditRequest {
  sessionId: string;
  contributorId: string;
  section: string;
  content: string;
  changeDescription: string;
}

interface EditResponse {
  success: boolean;
  version: number;
  conflicts?: EditConflict[];
  message: string;
}

interface EditConflict {
  section: string;
  yourEdit: string;
  conflictingEdit: string;
  conflictingContributor: string;
  timestamp: Date;
}

export default class CollaborativeEditingService {
  private reviewWorkflow: ReviewWorkflowService;
  private activeSessions: Map<string, EditingSession>;

  constructor() {
    this.reviewWorkflow = new ReviewWorkflowService();
    this.activeSessions = new Map();
  }

  /**
   * Create a new collaborative editing session
   */
  async createEditingSession(
    contentId: string,
    sessionName: string,
    ownerId: string,
    collaborationMode: CollaborationMode
  ): Promise<EditingSession> {
    const session: EditingSession = {
      id: this.generateSessionId(),
      contentId,
      sessionName,
      contributors: [
        {
          id: this.generateContributorId(),
          userId: ownerId,
          name: 'Session Owner',
          role: ContributorRole.OWNER,
          permissions: Object.values(Permission),
          joinedAt: new Date(),
          lastActive: new Date(),
          contributionCount: 0,
          isOnline: true
        }
      ],
      currentVersion: {
        version: 1,
        content: '',
        authorId: ownerId,
        timestamp: new Date(),
        changeDescription: 'Initial version',
        changes: [],
        approvalStatus: ApprovalStatus.DRAFT,
        reviewComments: []
      },
      versionHistory: [],
      activeEdits: [],
      locks: [],
      status: SessionStatus.ACTIVE,
      createdAt: new Date(),
      lastModified: new Date(),
      collaborationMode
    };

    this.activeSessions.set(session.id, session);
    return session;
  }

  /**
   * Add contributor to editing session
   */
  async addContributor(
    sessionId: string,
    userId: string,
    name: string,
    role: ContributorRole
  ): Promise<Contributor> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const contributor: Contributor = {
      id: this.generateContributorId(),
      userId,
      name,
      role,
      permissions: this.getPermissionsForRole(role),
      joinedAt: new Date(),
      lastActive: new Date(),
      contributionCount: 0,
      isOnline: true
    };

    session.contributors.push(contributor);
    return contributor;
  }

  /**
   * Submit edit to collaborative session
   */
  async submitEdit(request: EditRequest): Promise<EditResponse> {
    const session = this.activeSessions.get(request.sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Check contributor permissions
    const contributor = session.contributors.find(
      c => c.id === request.contributorId
    );
    if (!contributor || !contributor.permissions.includes(Permission.WRITE)) {
      return {
        success: false,
        version: session.currentVersion.version,
        message: 'Insufficient permissions to edit'
      };
    }

    // Check for section locks
    const lock = session.locks.find(
      l => l.section === request.section && l.lockedBy !== request.contributorId
    );
    if (lock && lock.expiresAt > new Date()) {
      return {
        success: false,
        version: session.currentVersion.version,
        message: `Section locked by ${lock.lockedBy}`
      };
    }

    // Check for conflicts with active edits
    const conflicts = await this.detectConflicts(session, request);
    if (conflicts.length > 0) {
      return {
        success: false,
        version: session.currentVersion.version,
        conflicts,
        message: 'Edit conflicts detected'
      };
    }

    // Apply edit
    const newVersion = await this.applyEdit(session, request);
    
    // Update session
    session.versionHistory.push(session.currentVersion);
    session.currentVersion = newVersion;
    session.lastModified = new Date();

    // Update contributor stats
    contributor.contributionCount++;
    contributor.lastActive = new Date();

    return {
      success: true,
      version: newVersion.version,
      message: 'Edit applied successfully'
    };
  }

  /**
   * Detect conflicts between edits
   */
  private async detectConflicts(
    session: EditingSession,
    request: EditRequest
  ): Promise<EditConflict[]> {
    const conflicts: EditConflict[] = [];

    // Check active edits in the same section
    const activeEditsInSection = session.activeEdits.filter(
      edit => edit.section === request.section &&
              edit.contributorId !== request.contributorId
    );

    for (const activeEdit of activeEditsInSection) {
      // Simple conflict detection - in production, use proper diff algorithm
      if (activeEdit.content !== request.content) {
        const contributor = session.contributors.find(
          c => c.id === activeEdit.contributorId
        );

        conflicts.push({
          section: request.section,
          yourEdit: request.content,
          conflictingEdit: activeEdit.content,
          conflictingContributor: contributor?.name || 'Unknown',
          timestamp: activeEdit.lastUpdate
        });
      }
    }

    return conflicts;
  }

  /**
   * Apply edit to content
   */
  private async applyEdit(
    session: EditingSession,
    request: EditRequest
  ): Promise<ContentVersion> {
    const change: ContentChange = {
      id: this.generateChangeId(),
      type: this.detectChangeType(
        session.currentVersion.content,
        request.content
      ),
      section: request.section,
      oldValue: session.currentVersion.content,
      newValue: request.content,
      authorId: request.contributorId,
      timestamp: new Date(),
      approved: false
    };

    return {
      version: session.currentVersion.version + 1,
      content: request.content,
      authorId: request.contributorId,
      timestamp: new Date(),
      changeDescription: request.changeDescription,
      changes: [change],
      approvalStatus: ApprovalStatus.DRAFT,
      reviewComments: []
    };
  }

  /**
   * Lock content section for editing
   */
  async lockSection(
    sessionId: string,
    contributorId: string,
    section: string,
    durationMinutes: number = 30
  ): Promise<ContentLock> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const contributor = session.contributors.find(c => c.id === contributorId);
    if (!contributor || !contributor.permissions.includes(Permission.LOCK_CONTENT)) {
      throw new Error('Insufficient permissions to lock content');
    }

    // Check if section is already locked
    const existingLock = session.locks.find(l => l.section === section);
    if (existingLock && existingLock.expiresAt > new Date()) {
      throw new Error('Section already locked');
    }

    const lock: ContentLock = {
      id: this.generateLockId(),
      section,
      lockedBy: contributorId,
      lockedAt: new Date(),
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000),
      reason: 'Editing in progress'
    };

    session.locks.push(lock);
    return lock;
  }

  /**
   * Unlock content section
   */
  async unlockSection(
    sessionId: string,
    contributorId: string,
    section: string
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const lockIndex = session.locks.findIndex(
      l => l.section === section && l.lockedBy === contributorId
    );

    if (lockIndex === -1) {
      throw new Error('Lock not found or not owned by contributor');
    }

    session.locks.splice(lockIndex, 1);
  }

  /**
   * Track active edit in real-time
   */
  async trackActiveEdit(
    sessionId: string,
    contributorId: string,
    section: string,
    content: string
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Find or create active edit
    let activeEdit = session.activeEdits.find(
      edit => edit.contributorId === contributorId && edit.section === section
    );

    if (activeEdit) {
      activeEdit.content = content;
      activeEdit.lastUpdate = new Date();
    } else {
      activeEdit = {
        id: this.generateEditId(),
        contributorId,
        section,
        startTime: new Date(),
        lastUpdate: new Date(),
        content,
        isConflicting: false
      };
      session.activeEdits.push(activeEdit);
    }

    // Check for conflicts
    activeEdit.isConflicting = await this.checkForConflicts(session, activeEdit);
  }

  /**
   * Check if active edit conflicts with others
   */
  private async checkForConflicts(
    session: EditingSession,
    activeEdit: ActiveEdit
  ): Promise<boolean> {
    const otherEdits = session.activeEdits.filter(
      edit => edit.section === activeEdit.section &&
              edit.contributorId !== activeEdit.contributorId
    );

    return otherEdits.length > 0;
  }

  /**
   * Add review comment to content
   */
  async addReviewComment(
    sessionId: string,
    reviewerId: string,
    section: string,
    comment: string
  ): Promise<ReviewComment> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const reviewer = session.contributors.find(c => c.id === reviewerId);
    if (!reviewer) {
      throw new Error('Reviewer not found in session');
    }

    const reviewComment: ReviewComment = {
      id: this.generateCommentId(),
      reviewerId,
      reviewerName: reviewer.name,
      comment,
      section,
      timestamp: new Date(),
      resolved: false
    };

    session.currentVersion.reviewComments.push(reviewComment);
    return reviewComment;
  }

  /**
   * Resolve review comment
   */
  async resolveComment(
    sessionId: string,
    commentId: string
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const comment = session.currentVersion.reviewComments.find(
      c => c.id === commentId
    );

    if (comment) {
      comment.resolved = true;
    }
  }

  /**
   * Get session status and active contributors
   */
  async getSessionStatus(sessionId: string): Promise<any> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return {
      sessionId: session.id,
      sessionName: session.sessionName,
      status: session.status,
      currentVersion: session.currentVersion.version,
      totalVersions: session.versionHistory.length + 1,
      activeContributors: session.contributors.filter(c => c.isOnline).length,
      totalContributors: session.contributors.length,
      activeEdits: session.activeEdits.length,
      locks: session.locks.filter(l => l.expiresAt > new Date()).length,
      pendingComments: session.currentVersion.reviewComments.filter(
        c => !c.resolved
      ).length
    };
  }

  /**
   * Integrate with review workflow for approval
   */
  async submitForReview(
    sessionId: string,
    submitterId: string
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.currentVersion.approvalStatus = ApprovalStatus.PENDING_REVIEW;

    // Route to review workflow
    await this.reviewWorkflow.submitForReview({
      contentId: session.contentId,
      contentType: 'collaborative_content',
      submitterId,
      reviewType: 'content_quality',
      priority: 'normal',
      metadata: {
        sessionId: session.id,
        version: session.currentVersion.version,
        contributors: session.contributors.map(c => c.name)
      }
    });
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateContributorId(): string {
    return `contrib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLockId(): string {
    return `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEditId(): string {
    return `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCommentId(): string {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getPermissionsForRole(role: ContributorRole): Permission[] {
    switch (role) {
      case ContributorRole.OWNER:
        return Object.values(Permission);
      case ContributorRole.EDITOR:
        return [Permission.READ, Permission.WRITE, Permission.LOCK_CONTENT];
      case ContributorRole.REVIEWER:
        return [Permission.READ, Permission.APPROVE];
      case ContributorRole.COMMENTER:
        return [Permission.READ];
      case ContributorRole.VIEWER:
        return [Permission.READ];
      default:
        return [Permission.READ];
    }
  }

  private detectChangeType(oldContent: string, newContent: string): ChangeType {
    if (!oldContent) return ChangeType.ADDITION;
    if (!newContent) return ChangeType.DELETION;
    if (oldContent.length < newContent.length) return ChangeType.ADDITION;
    if (oldContent.length > newContent.length) return ChangeType.DELETION;
    return ChangeType.MODIFICATION;
  }
}
