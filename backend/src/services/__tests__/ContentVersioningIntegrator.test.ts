// Content Versioning Integrator Service Tests
// Testing unified version management system

import ContentVersioningIntegrator, { VersionManagementRequest } from '../ContentVersioningIntegrator';

describe('ContentVersioningIntegrator', () => {
  let integrator: ContentVersioningIntegrator;

  beforeEach(() => {
    integrator = new ContentVersioningIntegrator();
  });

  describe('manageVersion - create', () => {
    it('should create content with version and tracking', async () => {
      const request: VersionManagementRequest = {
        contentId: 'content_001',
        contentType: 'lecture',
        content: {
          title: 'Kingdom Principles 101',
          mainContent: 'Introduction to kingdom principles...'
        },
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'create',
        metadata: {
          title: 'Initial Version',
          tags: ['initial', 'draft']
        }
      };

      const response = await integrator.manageVersion(request);

      expect(response.success).toBe(true);
      expect(response.version).toBeDefined();
      expect(response.version.versionNumber).toBe(1);
      expect(response.revision).toBeDefined();
      expect(response.revision.changeType).toBe('creation');
      expect(response.message).toContain('created');
    });
  });

  describe('manageVersion - update', () => {
    it('should update content with change tracking', async () => {
      // First create
      const createRequest: VersionManagementRequest = {
        contentId: 'content_002',
        contentType: 'lecture',
        content: { title: 'Original Title', mainContent: 'Original content' },
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'create'
      };
      await integrator.manageVersion(createRequest);

      // Then update
      const updateRequest: VersionManagementRequest = {
        contentId: 'content_002',
        contentType: 'lecture',
        content: { title: 'Updated Title', mainContent: 'Updated content' },
        userId: 'user_456',
        userName: 'Jane Smith',
        userRole: 'editor',
        action: 'update',
        metadata: {
          comments: 'Updated for clarity'
        }
      };

      const response = await integrator.manageVersion(updateRequest);

      expect(response.success).toBe(true);
      expect(response.version.versionNumber).toBe(2);
      expect(response.revision.changeType).toBe('update');
      expect(response.revision.comments).toBe('Updated for clarity');
    });
  });

  describe('manageVersion - approve', () => {
    it('should approve content version', async () => {
      // Create content first
      const createRequest: VersionManagementRequest = {
        contentId: 'content_003',
        contentType: 'lecture',
        content: { title: 'Test Lecture' },
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'create'
      };
      await integrator.manageVersion(createRequest);

      // Approve
      const approveRequest: VersionManagementRequest = {
        contentId: 'content_003',
        contentType: 'lecture',
        content: {},
        userId: 'reviewer_123',
        userName: 'Elder Smith',
        userRole: 'elder',
        action: 'approve',
        metadata: {
          comments: 'Spiritually aligned and pedagogically sound'
        }
      };

      const response = await integrator.manageVersion(approveRequest);

      expect(response.success).toBe(true);
      expect(response.version.status).toBe('approved');
      expect(response.revision.changeType).toBe('approval');
      expect(response.revision.reviewedBy).toBe('reviewer_123');
    });
  });

  describe('manageVersion - publish', () => {
    it('should publish approved content', async () => {
      // Create and approve content
      const createRequest: VersionManagementRequest = {
        contentId: 'content_004',
        contentType: 'lecture',
        content: { title: 'Test Lecture' },
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'create'
      };
      await integrator.manageVersion(createRequest);

      const approveRequest: VersionManagementRequest = {
        ...createRequest,
        userId: 'reviewer_123',
        userName: 'Elder Smith',
        userRole: 'elder',
        action: 'approve'
      };
      await integrator.manageVersion(approveRequest);

      // Publish
      const publishRequest: VersionManagementRequest = {
        ...createRequest,
        userId: 'publisher_123',
        userName: 'Admin User',
        userRole: 'admin',
        action: 'publish'
      };

      const response = await integrator.manageVersion(publishRequest);

      expect(response.success).toBe(true);
      expect(response.version.status).toBe('published');
      expect(response.revision.changeType).toBe('publication');
    });
  });

  describe('manageVersion - rollback', () => {
    it('should rollback to previous version', async () => {
      // Create initial version
      const createRequest: VersionManagementRequest = {
        contentId: 'content_005',
        contentType: 'lecture',
        content: { title: 'Version 1', mainContent: 'Content v1' },
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'create'
      };
      await integrator.manageVersion(createRequest);

      // Update to version 2
      const updateRequest: VersionManagementRequest = {
        ...createRequest,
        content: { title: 'Version 2', mainContent: 'Content v2' },
        action: 'update'
      };
      await integrator.manageVersion(updateRequest);

      // Rollback to version 1
      const rollbackRequest: VersionManagementRequest = {
        ...createRequest,
        userId: 'admin_123',
        userName: 'Admin User',
        userRole: 'admin',
        action: 'rollback',
        rollbackTarget: {
          versionNumber: 1,
          reason: 'Critical bug in version 2',
          preserveApprovals: false
        }
      };

      const response = await integrator.manageVersion(rollbackRequest);

      expect(response.success).toBe(true);
      expect(response.revision.changeType).toBe('rollback');
      expect(response.warnings).toBeDefined();
    });
  });

  describe('manageVersion - archive', () => {
    it('should archive content version', async () => {
      // Create content
      const createRequest: VersionManagementRequest = {
        contentId: 'content_006',
        contentType: 'lecture',
        content: { title: 'Old Lecture' },
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'create'
      };
      await integrator.manageVersion(createRequest);

      // Archive
      const archiveRequest: VersionManagementRequest = {
        ...createRequest,
        userId: 'admin_123',
        userName: 'Admin User',
        userRole: 'admin',
        action: 'archive',
        metadata: {
          description: 'Outdated content'
        }
      };

      const response = await integrator.manageVersion(archiveRequest);

      expect(response.success).toBe(true);
      expect(response.version.status).toBe('archived');
    });
  });

  describe('getContentHistoryReport', () => {
    beforeEach(async () => {
      // Create content with multiple versions
      const createRequest: VersionManagementRequest = {
        contentId: 'content_007',
        contentType: 'lecture',
        content: { title: 'Test Lecture' },
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'create'
      };
      await integrator.manageVersion(createRequest);

      const updateRequest: VersionManagementRequest = {
        ...createRequest,
        content: { title: 'Updated Lecture' },
        action: 'update'
      };
      await integrator.manageVersion(updateRequest);

      const approveRequest: VersionManagementRequest = {
        ...createRequest,
        userId: 'reviewer_123',
        userName: 'Elder Smith',
        userRole: 'elder',
        action: 'approve'
      };
      await integrator.manageVersion(approveRequest);
    });

    it('should generate comprehensive history report', async () => {
      const report = await integrator.getContentHistoryReport('content_007');

      expect(report.contentId).toBe('content_007');
      expect(report.currentVersion).toBeDefined();
      expect(report.versionHistory.length).toBeGreaterThan(0);
      expect(report.revisionHistory.length).toBeGreaterThan(0);
      expect(report.accountabilityRecords.length).toBeGreaterThan(0);
      expect(report.statistics).toBeDefined();
      expect(report.summary).toBeDefined();
    });

    it('should include accurate summary information', async () => {
      const report = await integrator.getContentHistoryReport('content_007');

      expect(report.summary.totalVersions).toBeGreaterThan(0);
      expect(report.summary.totalRevisions).toBeGreaterThan(0);
      expect(report.summary.contributors).toContain('user_123');
      expect(report.summary.approvers).toContain('reviewer_123');
      expect(report.summary.createdDate).toBeInstanceOf(Date);
      expect(report.summary.lastModifiedDate).toBeInstanceOf(Date);
    });
  });

  describe('compareVersionsWithContext', () => {
    beforeEach(async () => {
      // Create multiple versions
      const createRequest: VersionManagementRequest = {
        contentId: 'content_008',
        contentType: 'lecture',
        content: { title: 'Version 1', mainContent: 'Content v1' },
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'create'
      };
      await integrator.manageVersion(createRequest);

      const updateRequest: VersionManagementRequest = {
        ...createRequest,
        content: { title: 'Version 2', mainContent: 'Content v2' },
        action: 'update'
      };
      await integrator.manageVersion(updateRequest);
    });

    it('should compare versions with revision context', async () => {
      const result = await integrator.compareVersionsWithContext('content_008', 1, 2);

      expect(result.comparison).toBeDefined();
      expect(result.comparison.differences.length).toBeGreaterThan(0);
      expect(result.version1Revision).toBeDefined();
      expect(result.version2Revision).toBeDefined();
      expect(result.version1Revision?.versionNumber).toBe(1);
      expect(result.version2Revision?.versionNumber).toBe(2);
    });
  });

  describe('getUserAccountabilityReport', () => {
    beforeEach(async () => {
      // Create content with user actions
      const createRequest: VersionManagementRequest = {
        contentId: 'content_009',
        contentType: 'lecture',
        content: { title: 'Test' },
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'create'
      };
      await integrator.manageVersion(createRequest);

      const updateRequest: VersionManagementRequest = {
        ...createRequest,
        content: { title: 'Updated' },
        action: 'update'
      };
      await integrator.manageVersion(updateRequest);
    });

    it('should generate user accountability report', async () => {
      const report = await integrator.getUserAccountabilityReport('user_123', {
        contentIds: ['content_009']
      });

      expect(report.userId).toBe('user_123');
      expect(report.totalActions).toBeGreaterThan(0);
      expect(report.actionsByType).toBeDefined();
      expect(report.contentModified).toContain('content_009');
      expect(report.recentActivity.length).toBeGreaterThan(0);
    });

    it('should filter by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const report = await integrator.getUserAccountabilityReport('user_123', {
        contentIds: ['content_009'],
        startDate: yesterday,
        endDate: tomorrow
      });

      expect(report.totalActions).toBeGreaterThan(0);
    });
  });

  describe('rollbackWithTracking', () => {
    beforeEach(async () => {
      // Create versions for rollback
      const createRequest: VersionManagementRequest = {
        contentId: 'content_010',
        contentType: 'lecture',
        content: { title: 'Version 1' },
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'create'
      };
      await integrator.manageVersion(createRequest);

      const updateRequest: VersionManagementRequest = {
        ...createRequest,
        content: { title: 'Version 2' },
        action: 'update'
      };
      await integrator.manageVersion(updateRequest);
    });

    it('should rollback with full tracking', async () => {
      const result = await integrator.rollbackWithTracking(
        'content_010',
        1,
        'admin_123',
        'Admin User',
        'admin',
        'Testing rollback functionality',
        false
      );

      expect(result.rollbackResult.success).toBe(true);
      expect(result.rollbackResult.restoredVersion).toBe(1);
      expect(result.revision).toBeDefined();
      expect(result.revision.changeType).toBe('rollback');
    });

    it('should include warnings when not preserving approvals', async () => {
      const result = await integrator.rollbackWithTracking(
        'content_010',
        1,
        'admin_123',
        'Admin User',
        'admin',
        'Testing rollback',
        false
      );

      expect(result.rollbackResult.warnings).toBeDefined();
      expect(result.rollbackResult.warnings?.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should throw error for unknown action', async () => {
      const request: any = {
        contentId: 'content_011',
        contentType: 'lecture',
        content: {},
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'invalid_action'
      };

      await expect(integrator.manageVersion(request)).rejects.toThrow('Unknown action');
    });

    it('should throw error when approving non-existent content', async () => {
      const request: VersionManagementRequest = {
        contentId: 'non_existent',
        contentType: 'lecture',
        content: {},
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'approve'
      };

      await expect(integrator.manageVersion(request)).rejects.toThrow();
    });

    it('should throw error when rolling back without target', async () => {
      const request: VersionManagementRequest = {
        contentId: 'content_012',
        contentType: 'lecture',
        content: {},
        userId: 'user_123',
        userName: 'John Doe',
        userRole: 'faculty',
        action: 'rollback'
      };

      await expect(integrator.manageVersion(request)).rejects.toThrow('Rollback target must be specified');
    });
  });

  describe('Integration workflow', () => {
    it('should handle complete content lifecycle', async () => {
      const contentId = 'content_lifecycle';

      // 1. Create
      const createRequest: VersionManagementRequest = {
        contentId,
        contentType: 'lecture',
        content: { title: 'Lifecycle Test', mainContent: 'Initial content' },
        userId: 'author_123',
        userName: 'Author',
        userRole: 'faculty',
        action: 'create'
      };
      const createResponse = await integrator.manageVersion(createRequest);
      expect(createResponse.success).toBe(true);

      // 2. Update
      const updateRequest: VersionManagementRequest = {
        ...createRequest,
        content: { title: 'Lifecycle Test', mainContent: 'Updated content' },
        userId: 'editor_123',
        userName: 'Editor',
        userRole: 'editor',
        action: 'update'
      };
      const updateResponse = await integrator.manageVersion(updateRequest);
      expect(updateResponse.success).toBe(true);

      // 3. Approve
      const approveRequest: VersionManagementRequest = {
        ...createRequest,
        userId: 'reviewer_123',
        userName: 'Reviewer',
        userRole: 'elder',
        action: 'approve'
      };
      const approveResponse = await integrator.manageVersion(approveRequest);
      expect(approveResponse.success).toBe(true);

      // 4. Publish
      const publishRequest: VersionManagementRequest = {
        ...createRequest,
        userId: 'publisher_123',
        userName: 'Publisher',
        userRole: 'admin',
        action: 'publish'
      };
      const publishResponse = await integrator.manageVersion(publishRequest);
      expect(publishResponse.success).toBe(true);

      // 5. Get history report
      const report = await integrator.getContentHistoryReport(contentId);
      expect(report.versionHistory.length).toBeGreaterThan(0);
      expect(report.revisionHistory.length).toBeGreaterThan(0);
      expect(report.summary.contributors.length).toBeGreaterThan(0);
      expect(report.summary.currentStatus).toBe('published');
    });
  });
});
