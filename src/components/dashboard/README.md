# Dashboard Components

This directory contains reusable dashboard components for the ScrollUniversity platform.

## Components

### QuickActions
Displays a grid of quick action buttons for common tasks like browsing courses, starting AI sessions, joining study groups, etc.

**Usage:**
```tsx
import { QuickActions } from '@/components/dashboard';

<QuickActions />
```

### PersonalizedContent
Displays personalized content based on user's learning journey including:
- Continue Learning section with current course progress
- Recommended courses based on interests
- Upcoming events and deadlines
- Learning goals with progress tracking
- Recent achievements

**Usage:**
```tsx
import { PersonalizedContent } from '@/components/dashboard';

<PersonalizedContent 
  enrollments={enrollments}
  recommendations={recommendations}
  upcomingEvents={upcomingEvents}
  recentActivity={recentActivity}
/>
```

**Props:**
- `enrollments`: Array of user's course enrollments
- `recommendations`: Array of recommended courses
- `upcomingEvents`: Array of upcoming events
- `recentActivity`: Array of recent user activities

## Features

### Personalization
- Dynamic content based on user role (student, faculty, admin)
- Progress tracking for enrolled courses
- AI-powered course recommendations
- Goal tracking and achievement display

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Touch-friendly buttons and interactions

### Integration
- Uses React Query for data fetching
- Integrates with ScrollCoin economy
- Connects to spiritual formation tracking
- Real-time updates via Supabase

## Styling
All components use Tailwind CSS and shadcn/ui components for consistent styling across the platform.
