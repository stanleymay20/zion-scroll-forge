// Content Change Tracker Service Tests
// Testing revision history and accountability tracking

import ContentChangeTracker from '../ContentChangeTracker';
import ContentVersionControl from '../ContentVersionControl';

describe('ContentChangeTracker', () => {
  let tracker: ContentChangeTracker;
  let versionControl: ContentVersionControl;

  beforeEach(() => {
    versionControl = new ContentVersionControl();
    tracker = new ContentChangeTracker(versionControl);
  });

  describe('trackCreation', () => {
    it('should track content creation with initial revision', async () => {
      const content = {
        type: 'lecture',
        title: 'Introduction to Kingdom Principles',
        mainContent: 'Content here...'
      };

      const revision = await tracker.trackCreation(
        'content_001',
        content,
        'author_123',
        'faculty',
        { tags: ['initial', 'draft'] }
      );

      expect(revision).toBeDefined();
      expect(revision.contentId).toBe('content_001');
      expect(revision.versionNumber).toBe(1);
      expect(revision.changeType).toBe('creation');
      expect(revision.author).toBe('author_123');
      expect(revision.impactLevel).toBe('critical');
      expect(revision.reviewRequired).toBe(true);
      expect(revision.metadata.tags).toContain('initial');
    });

    it('should create accountability record for creation', async () => {
      const content = { type: 'lecture', title: 'Test Lecture' };

      await tracker.trackCreation('content_002', content, 'author_456', 'faculty');

      const records = await tracker.getAccountabilityRecords('content_002');
      expect(records).toHaveLength(1);
      expect(records[0].action).toBe('content_created');
      expect(records[0].userId).toBe('author_456');
    });

    it('should add audit trail entry for creation', async () => {
      const content = { type: 'lecture', title: 'Test Lecture' };

      await tracker.trackCreation('content_003', content, 'author_789', 'faculty');

      const trail = await tracker.getAuditTrail('content_003');
      expect(trail).toHaveLength(1);
      expect(trail[0].action).toBe('content_created');
      expect(trail[0].actor).toBe('author_789');
    });
  });

  describe('trackUpdate', () => {
    it('should track content updates with changes', async () => {
      const changes = [
        {
          changeId: 'chg_001',
          field: 'mainContent',
          oldValue: 'Old content',
          newValue: 'New content',
          changeType: 'modification' as const,
          changedBy: 'editor_123',
          changedAt: new Date()
        }
      ];

      const revision = await tracker.trackUpdate(
        'content_004',
        2,
        changes,
        'editor_123',
        'editor',
        'Updated main content for clarity'
      );

      expect(revision).toBeDefined();
      expect(revision.versionNumber).toBe(2);
      expect(revision.changeType).toBe('update');
      expect(revision.changesDetail).toHaveLength(1);
      expect(revision.comments).toBe('Updated main content for clarity');
    });

    it('should assess impact level correctly for critical changes', async () => {
      const criticalChanges = [
        {
          changeId: 'chg_002',
          field: 'learningObjectives',
          oldValue: ['Old objective'],
          newValue: ['New objective'],
          changeType: 'modification' as const,
          changedBy: 'editor_456',
          changedAt: new Date()
        }
      ];

      const revision = await tracker.trackUpdate(
        'content_005',
        2,
        criticalChanges,
        'editor_456',
        'editor'
      );

      expect(revision.impactLevel).toBe('critical');
      expect(revision.reviewRequired).toBe(true);
    });

    it('should assess impact level correctly for minor changes', async () => {
      const minorChanges = [
        {
          changeId: 'chg_003',
          field: 'formatting',
          oldValue: 'old',
          newValue: 'new',
          changeType: 'modification' as const,
          changedBy: 'editor_789',
          changedAt: new Date()
        }
      ];

      const revision = await tracker.trackUpdate(
        'content_006',
        2,
        minorChanges,
        'editor_789',
        'editor'
      );

      expect(revision.impactLevel).toBe('trivial');
      expect(revision.reviewRequired).toBe(false);
    });

    it('should generate appropriate changes summary', async () => {
      const multipleChanges = [
        {
          changeId: 'chg_004',
          field: 'title',
          oldValue: 'Old Title',
          newValue: 'New Title',
          changeType: 'modification' as const,
          changedBy: 'editor_123',
          changedAt: new Date()
        },
        {
          changeId: 'chg_005',
          field: 'description',
          oldValue: 'Old desc',
          newValue: 'New desc',
          changeType: 'modification' as const,
          changedBy: 'editor_123',
          changedAt: new Date()
        }
      ];

      const revision = await tracker.trackUpdate(
        'content_007',
        2,
        multipleChanges,
        'editor_123',
        'editor'
      );

      expect(revision.changesSummary).toContain('title');
      expect(revision.changesSummary).toContain('description');
    });
  });

  describe('trackApproval', () => {
    it('should track content approval', async () => {
      const revision = await tracker.trackApproval(
        'content_008',
        3,
        'reviewer_123',
        'elder',
        'Content meets spiritual alignment standards'
      );

      expect(revision).toBeDefined();
      expect(revision.changeType).toBe('approval');
      expect(revision.reviewedBy).toBe('reviewer_123');
      expect(revision.reviewRequired).toBe(false);
      expect(revision.metadata.workflowStage).toBe('approved');
      expect(revision.comments).toBe('Content meets spiritual alignment standards');
    });

    it('should add reviewer to approval chain', async () => {
      const revision = await tracker.trackApproval(
        'content_009',
        3,
        'reviewer_456',
        'elder'
      );

      expect(revision.metadata.approvalChain).toContain('reviewer_456');
    });
  });

  describe('trackPublication', () => {
    it('should track content publication', async () => {
      const revision = await tracker.trackPublication(
        'content_010',
        4,
        'publisher_123',
        'admin'
      );

      expect(revision).toBeDefined();
      expect(revision.changeType).toBe('publication');
      expect(revision.impactLevel).toBe('critical');
      expect(revision.metadata.workflowStage).toBe('published');
      expect(revision.metadata.tags).toContain('published');
      expect(revision.metadata.tags).toContain('live');
    });

    it('should create accountability record for publication', async () => {
      await tracker.trackPublication('content_011', 4, 'publisher_456', 'admin');

      const records = await tracker.getAccountabilityRecords('content_011');
      expect(records.some(r => r.action === 'content_published')).toBe(true);
    });
  });

  describe('trackRollback', () => {
    it('should track content rollback', async () => {
      const revision = await tracker.trackRollback(
        'content_012',
        5,
        3,
        'admin_123',
        'admin',
        'Critical bug found in version 5'
      );

      expect(revision).toBeDefined();
      expect(revision.changeType).toBe('rollback');
      expect(revision.impactLevel).toBe('critical');
      expect(revision.reviewRequired).toBe(true);
      expect(revision.comments).toBe('Critical bug found in version 5');
      expect(revision.changesSummary).toContain('v5');
      expect(revision.changesSummary).toContain('v3');
    });

    it('should tag rollback for review', async () => {
      const revision = await tracker.trackRollback(
        'content_013',
        5,
        3,
        'admin_456',
        'admin',
        'Rollback needed'
      );

      expect(revision.metadata.tags).toContain('rollback');
      expect(revision.metadata.tags).toContain('requires_review');
    });
  });

  describe('getRevisionHistory', () => {
    beforeEach(async () => {
      // Create some test revisions
      const content = { type: 'lecture', title: 'Test' };
      await tracker.trackCreation('content_014', content, 'author_123', 'faculty');
      
      const changes = [{
        changeId: 'chg_006',
        field: 'title',
        oldValue: 'Test',
        newValue: 'Updated Test',
        changeType: 'modification' as const,
        changedBy: 'editor_123',
        changedAt: new Date()
      }];
      await tracker.trackUpdate('content_014', 2, changes, 'editor_123', 'editor');
      await tracker.trackApproval('content_014', 2, 'reviewer_123', 'elder');
    });

    it('should retrieve complete revision history', async () => {
      const history = await tracker.getRevisionHistory('content_014');

      expect(history).toHaveLength(3);
      expect(history[0].changeType).toBe('creation');
      expect(history[1].changeType).toBe('update');
      expect(history[2].changeType).toBe('approval');
    });

    it('should filter by author', async () => {
      const history = await tracker.getRevisionHistory('content_014', {
        author: 'editor_123'
      });

      expect(history).toHaveLength(1);
      expect(history[0].author).toBe('editor_123');
    });

    it('should filter by change type', async () => {
      const history = await tracker.getRevisionHistory('content_014', {
        changeType: 'approval'
      });

      expect(history).toHaveLength(1);
      expect(history[0].changeType).toBe('approval');
    });

    it('should limit results', async () => {
      const history = await tracker.getRevisionHistory('content_014', {
        limit: 2
      });

      expect(history).toHaveLength(2);
    });
  });

  describe('getAccountabilityRecords', () => {
    beforeEach(async () => {
      const content = { type: 'lecture', title: 'Test' };
      await tracker.trackCreation('content_015', content, 'author_123', 'faculty');
      await tracker.trackPublication('content_015', 2, 'publisher_123', 'admin');
    });

    it('should retrieve all accountability records', async () => {
      const records = await tracker.getAccountabilityRecords('content_015');

      expect(records.length).toBeGreaterThan(0);
      expect(records.some(r => r.action === 'content_created')).toBe(true);
      expect(records.some(r => r.action === 'content_published')).toBe(true);
    });

    it('should filter by user ID', async () => {
      const records = await tracker.getAccountabilityRecords('content_015', 'author_123');

      expect(records.every(r => r.userId === 'author_123')).toBe(true);
    });
  });

  describe('getAuditTrail', () => {
    beforeEach(async () => {
      const content = { type: 'lecture', title: 'Test' };
      await tracker.trackCreation('content_016', content, 'author_123', 'faculty');
    });

    it('should retrieve audit trail', async () => {
      const trail = await tracker.getAuditTrail('content_016');

      expect(trail).toHaveLength(1);
      expect(trail[0].action).toBe('content_created');
      expect(trail[0].actor).toBe('author_123');
    });

    it('should filter by actor', async () => {
      const trail = await tracker.getAuditTrail('content_016', {
        actor: 'author_123'
      });

      expect(trail.every(e => e.actor === 'author_123')).toBe(true);
    });

    it('should filter by action', async () => {
      const trail = await tracker.getAuditTrail('content_016', {
        action: 'content_created'
      });

      expect(trail.every(e => e.action === 'content_created')).toBe(true);
    });
  });

  describe('getChangeStatistics', () => {
    beforeEach(async () => {
      const content = { type: 'lecture', title: 'Test' };
      await tracker.trackCreation('content_017', content, 'author_123', 'faculty');
      
      const changes1 = [{
        changeId: 'chg_007',
        field: 'mainContent',
        oldValue: 'Old',
        newValue: 'New',
        changeType: 'modification' as const,
        changedBy: 'editor_123',
        changedAt: new Date()
      }];
      await tracker.trackUpdate('content_017', 2, changes1, 'editor_123', 'editor');
      
      const changes2 = [{
        changeId: 'chg_008',
        field: 'title',
        oldValue: 'Test',
        newValue: 'Updated Test',
        changeType: 'modification' as const,
        changedBy: 'editor_456',
        changedAt: new Date()
      }];
      await tracker.trackUpdate('content_017', 3, changes2, 'editor_456', 'editor');
    });

    it('should calculate comprehensive statistics', async () => {
      const stats = await tracker.getChangeStatistics('content_017');

      expect(stats.contentId).toBe('content_017');
      expect(stats.totalRevisions).toBe(3);
      expect(stats.totalChanges).toBeGreaterThan(0);
      expect(stats.changesByType).toBeDefined();
      expect(stats.changesByAuthor).toBeDefined();
      expect(stats.averageChangesPerRevision).toBeGreaterThan(0);
    });

    it('should identify most active authors', async () => {
      const stats = await tracker.getChangeStatistics('content_017');

      expect(stats.mostActiveAuthors).toBeDefined();
      expect(stats.mostActiveAuthors.length).toBeGreaterThan(0);
    });

    it('should calculate change frequency', async () => {
      const stats = await tracker.getChangeStatistics('content_017');

      expect(stats.changeFrequency).toBeDefined();
      expect(stats.changeFrequency.trend).toMatch(/increasing|stable|decreasing/);
    });

    it('should calculate quality trend', async () => {
      const stats = await tracker.getChangeStatistics('content_017');

      expect(stats.qualityTrend).toBeDefined();
      expect(stats.qualityTrend.direction).toMatch(/improving|stable|declining/);
    });

    it('should return empty statistics for non-existent content', async () => {
      const stats = await tracker.getChangeStatistics('content_999');

      expect(stats.totalRevisions).toBe(0);
      expect(stats.totalChanges).toBe(0);
    });
  });

  describe('Integration with ContentVersionControl', () => {
    it('should work seamlessly with version control', async () => {
      // Create version through version control
      const content = {
        type: 'lecture',
        title: 'Integration Test',
        mainContent: 'Content here'
      };

      await versionControl.createVersion(
        'content_018',
        'lecture',
        content,
        { title: 'Version 1' },
        'author_123'
      );

      // Track creation through change tracker
      await tracker.trackCreation('content_018', content, 'author_123', 'faculty');

      // Verify both systems have records
      const version = await versionControl.getLatestVersion('content_018');
      const history = await tracker.getRevisionHistory('content_018');

      expect(version).toBeDefined();
      expect(history).toHaveLength(1);
    });
  });
});
