# Student Profile Components

Comprehensive student profile management system with academic records, achievements, skills, and resume generation.

## Components

### ProfileEditor
Full-featured profile editor with avatar upload, personal information, interests, spiritual gifts, contact details, and privacy settings.

**Features:**
- Avatar upload with preview
- Personal information editing
- Interests and spiritual gifts management
- Address and emergency contact
- Privacy settings control
- Tabbed interface for organization

**Usage:**
```tsx
import ProfileEditor from '@/components/profile/ProfileEditor';

<ProfileEditor
  profile={studentProfile}
  onSave={handleProfileUpdate}
  onCancel={() => setIsEditing(false)}
/>
```

### AcademicTranscript
Official academic transcript viewer with course history, grades, GPA, and download functionality.

**Features:**
- Overall GPA and credit summary
- Course history by term
- Academic standing history
- Degrees and certificates awarded
- PDF and JSON download
- Official transcript seal

**Usage:**
```tsx
import AcademicTranscript from '@/components/profile/AcademicTranscript';

<AcademicTranscript studentId={userId} />
```

### DegreeAuditViewer
Interactive degree audit showing progress toward graduation with requirement tracking.

**Features:**
- Overall progress visualization
- Requirement categories (core, major, elective, etc.)
- Course completion tracking
- Projected graduation date
- Outstanding requirements alerts
- Graduation eligibility status

**Usage:**
```tsx
import DegreeAuditViewer from '@/components/profile/DegreeAuditViewer';

<DegreeAuditViewer studentId={userId} />
```

### CourseHistoryList
Comprehensive course history with filtering, sorting, and performance metrics.

**Features:**
- Search and filter courses
- Sort by date, grade, or name
- Performance metrics (attendance, assignments)
- Spiritual growth tracking
- Status badges
- Statistics dashboard

**Usage:**
```tsx
import CourseHistoryList from '@/components/profile/CourseHistoryList';

<CourseHistoryList studentId={userId} />
```

### AchievementShowcase
Visual showcase of student achievements with categories and endorsements.

**Features:**
- Achievement cards with icons
- Category filtering
- Pin favorite achievements
- Verification links
- Statistics dashboard
- Public/private visibility

**Usage:**
```tsx
import AchievementShowcase from '@/components/profile/AchievementShowcase';

<AchievementShowcase 
  studentId={userId}
  isOwnProfile={true}
/>
```

### SkillEndorsements
Skill management system with peer endorsements and proficiency levels.

**Features:**
- Add and manage skills
- Proficiency level tracking
- Peer endorsements with comments
- Skill verification
- Category organization
- Endorsement history

**Usage:**
```tsx
import SkillEndorsements from '@/components/profile/SkillEndorsements';

<SkillEndorsements 
  studentId={userId}
  isOwnProfile={true}
/>
```

### ResumeGenerator
Professional resume/CV generator from profile data with multiple templates.

**Features:**
- Multiple template options
- PDF and Word export
- Live preview
- Auto-generated from profile
- Education, experience, skills
- Ministry experience section
- Certifications and references

**Usage:**
```tsx
import ResumeGenerator from '@/components/profile/ResumeGenerator';

<ResumeGenerator profile={studentProfile} />
```

## API Endpoints

### Profile Management
- `GET /api/profile/:userId` - Get student profile
- `PUT /api/profile/:userId` - Update profile
- `POST /api/profile/avatar` - Upload avatar

### Academic Records
- `GET /api/profile/:userId/transcript` - Get transcript
- `GET /api/profile/:userId/transcript/download` - Download transcript
- `GET /api/profile/:userId/degree-audit` - Get degree audit
- `GET /api/profile/:userId/course-history` - Get course history

### Achievements & Skills
- `GET /api/profile/:userId/achievements` - Get achievements
- `PUT /api/profile/:userId/achievements/:id/pin` - Pin/unpin achievement
- `GET /api/profile/:userId/skills` - Get skills
- `POST /api/profile/:userId/skills` - Add skill
- `POST /api/profile/:userId/skills/:id/endorse` - Endorse skill

### Resume Generation
- `GET /api/profile/:userId/resume-data` - Get resume data
- `POST /api/profile/:userId/resume/generate` - Generate resume
- `GET /api/profile/:userId/resume/preview` - Preview resume

## Type Definitions

All types are defined in `@/types/student-profile.ts`:

- `StudentProfile` - Complete student profile
- `AcademicTranscript` - Transcript data
- `DegreeAudit` - Degree progress audit
- `CourseHistoryEntry` - Course record
- `Achievement` - Achievement data
- `SkillEndorsement` - Skill with endorsements
- `ResumeData` - Resume/CV data

## Features

### Privacy Controls
- Profile visibility settings (public, private, connections only)
- Control GPA visibility
- Control course history visibility
- Control achievements visibility

### Spiritual Integration
- Spiritual gifts tracking
- Ministry interests
- Ministry experience section
- Spiritual growth metrics

### Professional Development
- Skills with endorsements
- Professional experience
- Certifications
- Resume generation
- Career pathway tracking

### Academic Excellence
- GPA tracking
- Transcript management
- Degree audit
- Course history
- Academic standing

## Styling

All components use:
- Tailwind CSS for styling
- Shadcn UI components
- Responsive design
- Dark mode support
- Accessible markup

## Best Practices

1. **Data Loading**: All components handle loading states
2. **Error Handling**: Graceful error messages
3. **Privacy**: Respect user privacy settings
4. **Performance**: Efficient data fetching and caching
5. **Accessibility**: WCAG 2.1 AA compliant
6. **Mobile**: Fully responsive design

## Integration

The profile system integrates with:
- Authentication system
- Course management
- ScrollCoin economy
- ScrollBadge NFTs
- Spiritual formation
- Analytics dashboard
