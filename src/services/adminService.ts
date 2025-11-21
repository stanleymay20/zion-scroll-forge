/**
 * Admin Service
 * Frontend service for admin dashboard API interactions
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  SystemHealth,
  AdminUser,
  UserManagementFilters,
  RoleAssignment,
  CourseApproval,
  CourseApprovalAction,
  ModerationQueueItem,
  ModerationAction,
  SystemConfiguration,
  ConfigurationUpdate,
  AuditLogEntry,
  AuditLogFilters,
  Backup,
  BackupSchedule,
  RestoreRequest,
  RestoreStatus,
  AdminDashboardStats,
} from '@/types/admin';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AdminService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  // ============================================================================
  // System Health
  // ============================================================================

  async getSystemHealth(): Promise<SystemHealth> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/system/health`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch system health');
    }

    const data = await response.json();
    return data.health;
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    const data = await response.json();
    return data.stats;
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/system/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to acknowledge alert');
    }
  }

  // ============================================================================
  // User Management
  // ============================================================================

  async getUsers(filters?: UserManagementFilters): Promise<AdminUser[]> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.startDate.toISOString());
        params.append('endDate', filters.dateRange.endDate.toISOString());
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.users;
  }

  async getUser(userId: string): Promise<AdminUser> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const data = await response.json();
    return data.user;
  }

  async updateUserRole(assignment: RoleAssignment): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${assignment.userId}/role`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(assignment),
    });

    if (!response.ok) {
      throw new Error('Failed to update user role');
    }
  }

  async suspendUser(userId: string, reason: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to suspend user');
    }
  }

  async activateUser(userId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/activate`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to activate user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }

  // ============================================================================
  // Course Approval
  // ============================================================================

  async getPendingCourses(): Promise<CourseApproval[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/courses/pending`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending courses');
    }

    const data = await response.json();
    return data.courses;
  }

  async getCourseApproval(courseId: string): Promise<CourseApproval> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}/approval`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course approval');
    }

    const data = await response.json();
    return data.approval;
  }

  async reviewCourse(action: CourseApprovalAction): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/courses/${action.courseId}/review`, {
      method: 'POST',
      headers,
      body: JSON.stringify(action),
    });

    if (!response.ok) {
      throw new Error('Failed to review course');
    }
  }

  // ============================================================================
  // Content Moderation
  // ============================================================================

  async getModerationQueue(): Promise<ModerationQueueItem[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/moderation/queue`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch moderation queue');
    }

    const data = await response.json();
    return data.items;
  }

  async getModerationItem(itemId: string): Promise<ModerationQueueItem> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/moderation/items/${itemId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch moderation item');
    }

    const data = await response.json();
    return data.item;
  }

  async moderateContent(action: ModerationAction): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/moderation/items/${action.itemId}/moderate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(action),
    });

    if (!response.ok) {
      throw new Error('Failed to moderate content');
    }
  }

  // ============================================================================
  // System Configuration
  // ============================================================================

  async getConfiguration(): Promise<SystemConfiguration> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/config`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch configuration');
    }

    const data = await response.json();
    return data.config;
  }

  async updateConfiguration(update: ConfigurationUpdate): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/config`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      throw new Error('Failed to update configuration');
    }
  }

  // ============================================================================
  // Audit Logs
  // ============================================================================

  async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogEntry[]> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.targetType) params.append('targetType', filters.targetType);
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.startDate.toISOString());
        params.append('endDate', filters.dateRange.endDate.toISOString());
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/audit-logs?${params}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }

    const data = await response.json();
    return data.logs;
  }

  async exportAuditLogs(filters?: AuditLogFilters): Promise<string> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/audit-logs/export`, {
      method: 'POST',
      headers,
      body: JSON.stringify(filters || {}),
    });

    if (!response.ok) {
      throw new Error('Failed to export audit logs');
    }

    const data = await response.json();
    return data.fileUrl;
  }

  // ============================================================================
  // Backup & Restore
  // ============================================================================

  async getBackups(): Promise<Backup[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/backups`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch backups');
    }

    const data = await response.json();
    return data.backups;
  }

  async createBackup(type: Backup['type']): Promise<Backup> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/backups`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error('Failed to create backup');
    }

    const data = await response.json();
    return data.backup;
  }

  async getBackupSchedules(): Promise<BackupSchedule[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/backups/schedules`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch backup schedules');
    }

    const data = await response.json();
    return data.schedules;
  }

  async updateBackupSchedule(schedule: BackupSchedule): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/backups/schedules/${schedule.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(schedule),
    });

    if (!response.ok) {
      throw new Error('Failed to update backup schedule');
    }
  }

  async restoreBackup(request: RestoreRequest): Promise<RestoreStatus> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/backups/restore`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate restore');
    }

    const data = await response.json();
    return data.restore;
  }

  async getRestoreStatus(restoreId: string): Promise<RestoreStatus> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/backups/restore/${restoreId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch restore status');
    }

    const data = await response.json();
    return data.restore;
  }
}

export default new AdminService();
