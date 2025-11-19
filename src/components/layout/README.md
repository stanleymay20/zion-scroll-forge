# Layout Components

This directory contains the core layout components for the ScrollUniversity platform.

## Components

### MainLayout
The primary layout wrapper that includes navigation, breadcrumbs, and content area.

**Features:**
- Desktop sidebar navigation
- Mobile bottom navigation
- Breadcrumb navigation
- Institution guard for multi-tenant support

**Usage:**
```tsx
import { MainLayout } from '@/components/layout/MainLayout';

<Route path="/" element={<MainLayout />}>
  <Route path="dashboard" element={<Dashboard />} />
</Route>
```

### MainNavigation
Desktop sidebar navigation with role-based menu items.

**Features:**
- Collapsible sections
- Role-based visibility (student, faculty, admin)
- Active route highlighting
- User profile dropdown
- Notification bell
- Quick action buttons

**Role-Based Navigation:**
- **Students**: Learning, Spiritual Formation, Community, ScrollCoin Economy, Academic Progress
- **Faculty**: All student sections + Faculty Tools (Course Management, Gradebook, Analytics)
- **Admin**: All sections + Administration (Admin Dashboard, Admissions, System Status)

### MobileNavigation
Mobile-optimized navigation with hamburger menu and bottom tab bar.

**Features:**
- Top header with logo and notifications
- Hamburger menu with full navigation
- Bottom tab bar with 5 most important sections
- User profile in hamburger menu
- Touch-friendly interactions

### UserProfileDropdown
User profile dropdown menu with account actions.

**Features:**
- User avatar and name display
- Current role badge
- ScrollCoin balance
- Quick links to profile, transcript, wallet, achievements
- Settings and admin access (role-based)
- Sign out action

**Usage:**
```tsx
import { UserProfileDropdown } from '@/components/layout/UserProfileDropdown';

<UserProfileDropdown />
```

### Breadcrumbs
Automatic breadcrumb navigation based on current route.

**Features:**
- Auto-generates breadcrumbs from URL path
- Clickable navigation to parent pages
- Custom labels for common routes
- Home icon for root level

### PageTemplate
Reusable page template with consistent header and layout.

**Features:**
- Page title and description
- Action buttons area
- Responsive spacing
- Consistent styling

**Usage:**
```tsx
import { PageTemplate } from '@/components/layout/PageTemplate';

<PageTemplate 
  title="My Page"
  description="Page description"
  actions={<Button>Action</Button>}
>
  <div>Page content</div>
</PageTemplate>
```

## Navigation Structure

### Desktop Navigation (Sidebar)
```
┌─────────────────────────┐
│ Logo & Title            │
├─────────────────────────┤
│ User Profile | Notif    │
├─────────────────────────┤
│ ▼ Overview              │
│   • Dashboard           │
│   • My Courses          │
│   • Calendar            │
│                         │
│ ▼ Learning              │
│   • Course Catalog      │
│   • AI Tutors           │
│   • XR Classrooms       │
│   • Virtual Labs        │
│   • Assessments         │
│   • Study Groups        │
│                         │
│ ▼ Spiritual Formation   │
│   • Daily Devotion      │
│   • Prayer Journal      │
│   • Scripture Memory    │
│   • Prayer Requests     │
│   • Spiritual Mentor    │
│                         │
│ ... (more sections)     │
├─────────────────────────┤
│ Quick Actions           │
│ • Start AI Session      │
│ • Settings              │
└─────────────────────────┘
```

### Mobile Navigation
```
┌─────────────────────────┐
│ Logo    [Notif] [Menu]  │ ← Top Header
└─────────────────────────┘

        Page Content

┌─────────────────────────┐
│ [Home] [Courses] [AI]   │ ← Bottom Tab Bar
│ [Community] [More]      │
└─────────────────────────┘
```

## Role-Based Access Control

Navigation items are filtered based on user role:

```typescript
interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles?: string[]; // Optional: if specified, only these roles can see it
}
```

Example:
```typescript
{
  label: "Admin Dashboard",
  href: "/admin",
  icon: Shield,
  roles: ["admin"] // Only admins can see this
}
```

## Responsive Behavior

- **Desktop (lg+)**: Sidebar navigation visible, bottom nav hidden
- **Mobile (<lg)**: Sidebar hidden, top header + bottom nav visible
- **Tablet**: Optimized layouts for medium screens

## Styling

All components use:
- Tailwind CSS for styling
- shadcn/ui components
- Consistent color scheme from theme
- Dark mode support

## Integration

Components integrate with:
- React Router for navigation
- AuthContext for user data
- Supabase for real-time updates
- React Query for data fetching
