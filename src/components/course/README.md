# Course Components

This directory contains all components related to course catalog, course details, and enrollment functionality.

## Components

### CourseReviews
Displays course reviews and ratings with the ability for enrolled students to submit reviews.

**Features:**
- Star rating system (1-5 stars)
- Review text submission
- Average rating calculation
- Review list with timestamps
- User authentication check

**Usage:**
```tsx
import { CourseReviews } from '@/components/course';

<CourseReviews courseId="course-id" />
```

### CourseRecommendations
Displays a carousel of recommended courses based on user's interests and enrollment history.

**Features:**
- Personalized recommendations
- Carousel navigation
- Course cards with key information
- Responsive grid layout
- Faculty-based filtering

**Usage:**
```tsx
import { CourseRecommendations } from '@/components/course';

<CourseRecommendations 
  currentCourseId="course-id" 
  limit={6} 
/>
```

### InstructorProfileCard
Displays instructor information with credentials, experience, and contact details.

**Features:**
- Avatar display
- Bio and credentials
- Experience statistics
- Specializations
- Contact buttons (email, LinkedIn)
- Compact and full view modes

**Usage:**
```tsx
import { InstructorProfileCard } from '@/components/course';

<InstructorProfileCard 
  instructor={instructorData}
  compact={false}
/>
```

### CoursePreviewVideo
Displays a preview video for the course with custom controls.

**Features:**
- Video playback with controls
- Play/pause functionality
- Mute/unmute toggle
- Fullscreen support
- Loading states
- Thumbnail fallback
- Preview badge

**Usage:**
```tsx
import { CoursePreviewVideo } from '@/components/course';

<CoursePreviewVideo
  videoUrl="https://example.com/video.mp4"
  thumbnailUrl="https://example.com/thumbnail.jpg"
  title="Course Title"
  duration="5:30"
/>
```

### CourseEnrollmentFlow
Handles the complete enrollment process including payment method selection.

**Features:**
- Multi-step enrollment dialog
- Payment method selection (ScrollCoin, Credit Card, Scholarship)
- Price display in multiple formats
- Processing states
- Success/error handling
- Integration with payment systems

**Usage:**
```tsx
import { CourseEnrollmentFlow } from '@/components/course';

<CourseEnrollmentFlow
  course={{
    id: "course-id",
    title: "Course Title",
    price_cents: 5000,
    scrollCoinCost: 50,
    scholarshipEligible: true
  }}
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onSuccess={() => navigate('/course/learn')}
/>
```

### ModuleNotes
Displays lecture notes and materials for a course module.

**Features:**
- Markdown rendering
- Downloadable materials
- Scripture references
- Study questions

## Integration

These components are integrated into:
- `/courses` - Course catalog page with filtering and search
- `/courses/:id` - Course detail page with all components
- Course learning interface

## Requirements Validation

This implementation satisfies Task 28 requirements:
- ✅ Course catalog with filtering and search
- ✅ Course detail page with preview video
- ✅ Course enrollment flow with payment
- ✅ Course curriculum display with module accordion
- ✅ Instructor profile cards
- ✅ Course reviews and ratings
- ✅ Course recommendation carousel

## Backend Integration

Components integrate with:
- Supabase for data fetching
- Course API endpoints
- ScrollCoin service
- Payment processing (Stripe)
- Enrollment management

## Styling

All components use:
- Tailwind CSS for styling
- Shadcn UI components
- Responsive design patterns
- Consistent color scheme
- Accessibility features
