# Spiritual Formation Components

This directory contains all components related to spiritual formation features in ScrollUniversity.

## Components

### SpiritualFormationDashboard
Main dashboard showing overview of all spiritual formation activities including devotion streaks, prayer stats, scripture memory progress, and growth scores.

**Props:**
- `data: SpiritualFormationDashboard` - Dashboard data
- `onNavigate: (tab: string) => void` - Navigation handler

### DevotionReader
Daily devotion reader with audio playback, note-taking, and completion tracking.

**Props:**
- `devotion: DailyDevotion` - Today's devotion content
- `streak: DevotionStreak` - User's devotion streak data
- `userId: string` - Current user ID

**Features:**
- Audio playback for scripture passages
- Personal notes and reflections
- Rating system
- Streak tracking
- Completion marking

### PrayerJournal
Prayer journal with entry management, categorization, and answered prayer tracking.

**Props:**
- `userId: string` - Current user ID
- `initialEntries?: PrayerEntry[]` - Initial prayer entries
- `analytics?: PrayerAnalytics` - Prayer analytics data

**Features:**
- Create and manage prayer entries
- Categorize prayers
- Mark prayers as answered
- Track prayer statistics
- View active and answered prayers

### ScriptureMemoryPractice
Scripture memory practice interface with spaced repetition algorithm.

**Props:**
- `userId: string` - Current user ID
- `statistics?: MemoryStatistics` - Memory statistics

**Features:**
- Practice verses with spaced repetition
- Track mastery levels
- Review progress
- Multiple quiz formats
- Audio playback

### PropheticCheckInQuestionnaire
Spiritual assessment questionnaire for prophetic check-ins.

**Props:**
- `userId: string` - Current user ID
- `lastCheckIn?: PropheticCheckIn` - Last check-in data

**Features:**
- Multi-step questionnaire
- Spiritual temperature assessment
- Life circumstances reflection
- Obedience and community engagement tracking
- Review before submission

### SpiritualGrowthVisualization
Visual representation of spiritual growth metrics and progress.

**Props:**
- `tracking: SpiritualGrowthTracking` - Growth tracking data
- `userId: string` - Current user ID

**Features:**
- Overall growth score display
- Growth area breakdown
- Trend visualization
- Insights and recommendations
- Milestone celebration
- Progress indicators

### MentorConnection
Spiritual mentor matching and connection interface.

**Props:**
- `userId: string` - Current user ID

**Features:**
- View recommended mentors
- Match score display
- Send connection requests
- Manage active connections
- Message mentors
- Track mentorship sessions

## Usage

```tsx
import { SpiritualFormationDashboard } from '@/components/spiritual-formation';

function MyComponent() {
  return (
    <SpiritualFormationDashboard
      data={dashboardData}
      onNavigate={(tab) => console.log('Navigate to:', tab)}
    />
  );
}
```

## API Endpoints

The components interact with the following API endpoints:

- `GET /api/spiritual-formation/dashboard/:userId` - Get dashboard data
- `POST /api/devotions/complete` - Mark devotion as complete
- `GET /api/prayer/entries/:userId` - Get prayer entries
- `POST /api/prayer/entries` - Create prayer entry
- `PATCH /api/prayer/entries/:id/answer` - Mark prayer as answered
- `GET /api/scripture-memory/verses/:userId` - Get memory verses
- `POST /api/scripture-memory/review` - Submit verse review
- `POST /api/prophetic-checkin` - Submit prophetic check-in
- `GET /api/spiritual-formation/mentors/recommended/:userId` - Get recommended mentors
- `GET /api/spiritual-formation/mentors/connections/:userId` - Get mentor connections
- `POST /api/spiritual-formation/mentors/connect` - Connect with mentor

## Requirements Mapping

- **Requirement 7.1**: Daily Devotion System - `DevotionReader`
- **Requirement 7.2**: Prayer Journal - `PrayerJournal`
- **Requirement 7.3**: Scripture Memory - `ScriptureMemoryPractice`
- **Requirement 7.4**: Prophetic Check-ins - `PropheticCheckInQuestionnaire`
- **Requirement 7.5**: Spiritual Growth & Mentorship - `SpiritualGrowthVisualization`, `MentorConnection`

## Styling

All components use:
- Shadcn UI components for consistent styling
- Tailwind CSS for utility classes
- Responsive design for mobile and desktop
- Dark mode support
- Spiritual-themed color schemes (blues, greens, golds)

## Testing

Test files should be created in `__tests__` directory following the pattern:
- `SpiritualFormationDashboard.test.tsx`
- `DevotionReader.test.tsx`
- etc.

## Future Enhancements

- Real-time collaboration on prayer requests
- Group devotion studies
- Scripture memory challenges
- Mentor video calls
- Growth goal setting
- Spiritual gift assessments
- Calling discernment tools
