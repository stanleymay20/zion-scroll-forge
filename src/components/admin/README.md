# Admin Dashboard Components

Comprehensive admin interface for system management and monitoring.

## Components

### SystemHealthOverview
Real-time system health monitoring with metrics and alerts.

**Features:**
- Overall system status display
- Active alerts with acknowledgment
- Service health monitoring
- CPU, memory, database, and storage metrics
- Network statistics
- Auto-refresh every 30 seconds

**Usage:**
```tsx
import { SystemHealthOverview } from '@/components/admin';

<SystemHealthOverview />
```

### UserManagement
User administration interface with role management.

**Features:**
- User listing with filters (role, status, search)
- Role assignment and updates
- User suspension and activation
- User deletion with confirmation
- Enrollment and course count display

**Usage:**
```tsx
import { UserManagement } from '@/components/admin';

<UserManagement />
```

### CourseApprovalWorkflow
Course review and approval system.

**Features:**
- Pending course submissions list
- Compliance checklist review
- Approve, reject, or request revision actions
- Instructor feedback system
- Content metrics display

**Usage:**
```tsx
import { CourseApprovalWorkflow } from '@/components/admin';

<CourseApprovalWorkflow />
```

### ContentModerationQueue
Content moderation interface for flagged items.

**Features:**
- Flagged content queue
- AI analysis display
- Multiple moderation actions (approve, reject, warn, suspend)
- Flag reason tracking
- Content preview

**Usage:**
```tsx
import { ContentModerationQueue } from '@/components/admin';

<ContentModerationQueue />
```

### SystemConfiguration
System settings and configuration management.

**Features:**
- General settings (site name, URL, maintenance mode)
- Feature toggles (AI tutor, ScrollCoin, etc.)
- System limits configuration
- Security settings
- AI provider configuration
- Tabbed interface for organization

**Usage:**
```tsx
import { SystemConfiguration } from '@/components/admin';

<SystemConfiguration />
```

### AuditLogViewer
System audit log viewer and exporter.

**Features:**
- Audit log listing with filters
- Action, user, and target filtering
- Detailed log entry view
- Export functionality
- IP address and user agent tracking

**Usage:**
```tsx
import { AuditLogViewer } from '@/components/admin';

<AuditLogViewer />
```

### BackupRestoreInterface
Backup and restore management system.

**Features:**
- Backup creation (full, incremental, database, files)
- Backup listing with status
- Backup schedules management
- Restore functionality with options
- Download backup files
- Metadata display

**Usage:**
```tsx
import { BackupRestoreInterface } from '@/components/admin';

<BackupRestoreInterface />
```

## Admin Dashboard Page

The main admin dashboard integrates all components with:
- Quick stats overview
- Tabbed navigation
- Real-time metrics
- Responsive layout

**Route:** `/admin`

**Access:** Requires admin role

## Data Flow

1. **Authentication:** All components use `useAuth()` hook for user context
2. **API Service:** Components interact with backend via `adminService`
3. **Real-time Updates:** System health auto-refreshes every 30 seconds
4. **State Management:** Local state with React hooks
5. **Error Handling:** Try-catch blocks with console logging

## API Integration

All components use the `adminService` which provides:
- `getSystemHealth()` - System health metrics
- `getDashboardStats()` - Dashboard statistics
- `getUsers()` - User management
- `getPendingCourses()` - Course approvals
- `getModerationQueue()` - Content moderation
- `getConfiguration()` - System config
- `getAuditLogs()` - Audit logs
- `getBackups()` - Backup management

## Security

- All API calls require authentication token
- Role-based access control (admin only)
- Audit logging for all actions
- Confirmation dialogs for destructive actions
- IP address and user agent tracking

## Styling

Components use:
- Shadcn UI components
- Tailwind CSS utilities
- Lucide React icons
- Responsive design patterns
- Consistent color schemes

## Best Practices

1. **Error Handling:** Always wrap API calls in try-catch
2. **Loading States:** Show loading indicators during async operations
3. **Confirmation:** Require confirmation for destructive actions
4. **Feedback:** Provide success/error feedback to users
5. **Accessibility:** Use semantic HTML and ARIA labels
6. **Performance:** Implement pagination for large lists
7. **Security:** Validate user permissions before actions

## Future Enhancements

- Real-time WebSocket updates for system health
- Advanced filtering and search
- Bulk operations for user management
- Custom dashboard widgets
- Scheduled reports
- Multi-factor authentication for sensitive actions
- Role-based dashboard customization
