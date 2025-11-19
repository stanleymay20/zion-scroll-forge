# ScrollUniversity Navigation Guide

## Overview
This guide explains the navigation structure and user experience for the ScrollUniversity platform.

## Desktop Navigation (Sidebar)

### Layout
The desktop navigation appears as a fixed sidebar on the left side of the screen (width: 256px / 16rem).

### Sections

#### Header
- **Logo**: ScrollUniversity logo and name
- **Tagline**: "Veritas et Sapientia" (Truth and Wisdom)

#### User Section
- **Profile Avatar**: Clickable to open profile dropdown
- **Notification Bell**: Shows unread count, opens notification dropdown

#### Navigation Menu
Collapsible sections with expandable/collapsible behavior:

**1. Overview** (Always visible)
- Dashboard - Main landing page
- My Courses - Current enrollments
- Calendar - Events and deadlines

**2. Learning** (Always visible)
- Course Catalog - Browse all courses
- AI Tutors - Start AI tutoring sessions
- XR Classrooms - Immersive learning
- Virtual Labs - Hands-on practice
- Assessments - Assignments and quizzes
- Study Groups - Collaborative learning

**3. Spiritual Formation** (Always visible)
- Daily Devotion - Today's devotional
- Prayer Journal - Personal prayer entries
- Scripture Memory - Memorization practice
- Prayer Requests - Community prayer
- Spiritual Mentor - Mentorship connections

**4. Community** (Always visible)
- Community Feed - Social updates
- Messaging - Direct messages
- Fellowship Rooms - Group discussions
- Testimonies - Share testimonies

**5. ScrollCoin Economy** (Always visible)
- My Wallet - ScrollCoin balance
- Earn ScrollCoin - Earning opportunities
- Redemption Store - Spend ScrollCoins
- Leaderboard - Top earners

**6. Academic Progress** (Always visible)
- Transcript - Academic record
- Degree Audit - Degree requirements
- Achievements - Badges and awards
- Scholarships - Financial aid

**7. Faculty Tools** (Faculty & Admin only)
- Faculty Dashboard - Faculty overview
- Course Management - Manage courses
- Gradebook - Grade assignments
- Faculty Analytics - Teaching metrics

**8. Administration** (Admin only)
- Admin Dashboard - System overview
- Admissions Review - Application review
- Analytics - Platform analytics
- Content Generation - AI content tools
- Institutions - Multi-tenant management
- System Status - Health monitoring

#### Footer
- **Start AI Session** - Quick access to AI tutors
- **Settings** - User preferences

## Mobile Navigation

### Top Header
- **Logo**: ScrollUniversity branding
- **Notification Bell**: Unread notifications
- **Hamburger Menu**: Opens full navigation drawer

### Bottom Tab Bar (5 items)
1. **Dashboard** - Home icon
2. **Courses** - Book icon
3. **AI Tutors** - Bot icon
4. **Community** - Users icon
5. **More** - Menu icon (opens full navigation)

### Hamburger Menu Drawer
When opened, displays:
- User profile section with avatar
- Full navigation menu (all sections)
- Quick action button (Start AI Session)

## User Profile Dropdown

Accessible from the avatar in the navigation header.

### Sections

**User Info**
- Avatar
- Full name
- Email address
- Role badge (Student/Faculty/Admin)
- ScrollCoin balance

**Quick Links**
- Profile - View/edit profile
- Transcript - Academic record
- ScrollCoin Wallet - Manage coins
- Achievements - View badges
- Spiritual Formation - Growth tracking

**Settings & Admin**
- Settings - User preferences
- Admin Dashboard - (Admin/Faculty only)

**Account**
- Sign Out - Log out of account

## Breadcrumb Navigation

Appears below the page header on all pages except the dashboard.

### Format
```
Home > Section > Subsection > Current Page
```

### Features
- Clickable links to parent pages
- Home icon for root level
- Auto-generated from URL path
- Custom labels for common routes

### Examples
```
Home > Courses > Sacred AI Engineering
Home > Spiritual Formation > Prayer Journal
Home > Admin > Admissions Review
```

## Quick Actions

Grid of 12 common actions displayed on the dashboard:

### Primary Actions (Default variant)
1. Browse Courses
2. Start AI Session

### Secondary Actions (Outline variant)
3. Join Study Group
4. Daily Devotion
5. XR Classroom
6. Submit Prayer
7. Community Feed
8. My Transcript
9. Achievements
10. Calendar
11. Assessments

### Tertiary Actions (Secondary variant)
12. View Wallet

## Role-Based Access

### Student Role
- Access to sections 1-6
- Cannot see Faculty Tools or Administration

### Faculty Role
- Access to sections 1-7
- Can see Faculty Tools
- Cannot see Administration (except faculty-specific admin)

### Admin Role
- Access to all sections 1-8
- Full system access
- Can see all admin tools

## Navigation States

### Active State
- Highlighted background (accent color)
- Bold text
- Icon color matches accent

### Hover State
- Light background on hover
- Smooth transition
- Cursor pointer

### Expanded/Collapsed
- Chevron icon indicates state
- Smooth animation
- Remembers state per session

## Responsive Breakpoints

### Desktop (lg: 1024px+)
- Sidebar visible
- Full navigation menu
- Bottom nav hidden

### Tablet (md: 768px - 1023px)
- Sidebar hidden
- Top header visible
- Bottom nav visible
- Optimized spacing

### Mobile (< 768px)
- Sidebar hidden
- Top header visible
- Bottom nav visible
- Compact layouts

## Keyboard Navigation

### Shortcuts
- `Tab` - Navigate through items
- `Enter` - Activate link
- `Space` - Expand/collapse section
- `Esc` - Close dropdowns/drawers

### Focus Indicators
- Visible focus ring
- High contrast
- Follows tab order

## Accessibility Features

### Screen Readers
- ARIA labels on all interactive elements
- Semantic HTML structure
- Descriptive link text

### Keyboard Support
- Full keyboard navigation
- Focus management
- Skip links

### Visual
- High contrast ratios
- Clear focus indicators
- Sufficient touch targets (44px minimum)

## Best Practices

### For Users
1. Use breadcrumbs to navigate back
2. Collapse unused sections to reduce clutter
3. Use quick actions for common tasks
4. Check notifications regularly
5. Keep profile information updated

### For Developers
1. Always use role-based filtering
2. Test on multiple screen sizes
3. Ensure keyboard accessibility
4. Maintain consistent styling
5. Document new navigation items

## Troubleshooting

### Navigation Not Showing
- Check authentication status
- Verify user role
- Clear browser cache
- Check network connection

### Items Missing
- Verify user role permissions
- Check role-based filtering
- Ensure proper authentication

### Mobile Issues
- Check viewport meta tag
- Test on actual devices
- Verify touch targets
- Check z-index stacking

## Future Enhancements

1. **Customizable Navigation**: Allow users to reorder items
2. **Favorites**: Pin frequently used items
3. **Search**: Global navigation search
4. **Keyboard Shortcuts**: Custom shortcuts
5. **Themes**: Multiple navigation themes
6. **Animations**: Enhanced transitions
7. **Gestures**: Swipe navigation on mobile
8. **Voice Control**: Voice-activated navigation
