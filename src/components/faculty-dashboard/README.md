# Faculty Dashboard Components

Comprehensive faculty dashboard for the Academic Year Automation System (SU-AYAS).

## Overview

The Faculty Dashboard provides faculty members with AI-powered tools to manage their teaching operations efficiently. It implements Requirements 3.1, 3.2, 3.3, and 3.4 from the Academic Year Automation System specification.

## Components

### 1. TeachingLoadManager
**Requirements: 3.1, 3.2**

Displays and manages faculty teaching load with real-time analysis:
- Current course assignments
- Workload utilization metrics (courses, students, credits, hours)
- Schedule availability tracking
- Visual progress indicators
- Capacity warnings and alerts

**Features:**
- Real-time load calculation
- Utilization percentage tracking
- Course assignment details
- Available hours visualization
- Overload warnings

### 2. ContentCreationStudio
**Requirements: 3.3**

AI-assisted content generation for teaching materials:
- **Lecture Plans**: Generate comprehensive lecture plans with learning objectives, spiritual formation elements, and teaching strategies
- **Assessments**: Create quizzes, exams, assignments, and projects with rubrics
- **Teaching Materials**: Generate slides, handouts, activities, and study guides

**Features:**
- Integration with ScrollProfessor agent
- Integration with ScrollExaminer agent
- Spiritual formation integration
- Multiple content types
- Copy and download functionality

### 3. GradingInterface
**Requirements: 3.4**

Automated grading with AI assistance and confidence scoring:
- AI-powered grading using ScrollExaminer agent
- Confidence score calculation
- Human review flagging (Property 8: AI Grading Confidence Threshold)
- Batch grading capabilities
- Detailed feedback generation

**Features:**
- Pending submissions queue
- Automated grading with confidence scoring
- Criteria-based scoring
- Human review workflow
- Batch processing

**Property 8 Implementation:**
For any AI-graded submission with confidence score below the threshold (default 75%), the submission is automatically flagged for human review. This ensures quality control and maintains academic integrity.

### 4. StudentAnalyticsView
**Requirements: 3.1, 3.2, 3.3, 3.4**

Comprehensive student performance monitoring:
- Course-level analytics
- Individual student performance tracking
- At-risk student identification
- Attendance monitoring
- Engagement metrics

**Features:**
- Grade distribution visualization
- Performance trends
- Risk level assessment
- Intervention recommendations
- Multi-metric analysis

## Usage

### Basic Implementation

```tsx
import FacultyDashboard from '@/pages/FacultyDashboard';

// Use in your routing
<Route path="/faculty/dashboard" element={<FacultyDashboard />} />
```

### Individual Components

```tsx
import { TeachingLoadManager } from '@/components/faculty-dashboard/TeachingLoadManager';
import { ContentCreationStudio } from '@/components/faculty-dashboard/ContentCreationStudio';
import { GradingInterface } from '@/components/faculty-dashboard/GradingInterface';
import { StudentAnalyticsView } from '@/components/faculty-dashboard/StudentAnalyticsView';

// Use components individually
<TeachingLoadManager />
<ContentCreationStudio />
<GradingInterface />
<StudentAnalyticsView />
```

## API Integration

The components integrate with the Faculty Dashboard Service:

```typescript
import { facultyDashboardService } from '@/services/facultyDashboardService';

// Teaching Load
const loadAnalysis = await facultyDashboardService.getTeachingLoad(facultyId);

// Content Generation
const lecturePlan = await facultyDashboardService.generateLecturePlan(request);
const assessment = await facultyDashboardService.generateAssessment(request);

// Grading
const gradingResult = await facultyDashboardService.gradeSubmission(submissionId);

// Analytics
const studentAnalytics = await facultyDashboardService.getStudentAnalytics(studentId, courseId);
const courseAnalytics = await facultyDashboardService.getCourseAnalytics(courseId);
```

## Backend Services

The components rely on the following backend services:

1. **TeachingLoadService** - Manages faculty workload and assignments
2. **ContentGenerationService** - AI-powered content creation
3. **GradingAutomationService** - Automated grading with confidence scoring
4. **ScrollProfessor Agent** - Lecture plan and material generation
5. **ScrollExaminer Agent** - Assessment creation and grading

## Configuration

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Grading Configuration (Backend)
GRADING_CONFIDENCE_THRESHOLD=0.75
GRADING_HIGH_CONFIDENCE_THRESHOLD=0.90
GRADING_AI_MODEL=gpt-4
GRADING_AI_TEMPERATURE=0.3
```

## Features

### Teaching Load Management
- ✅ Real-time workload calculation
- ✅ Multi-metric utilization tracking
- ✅ Course assignment visualization
- ✅ Capacity warnings
- ✅ Schedule availability tracking

### Content Creation
- ✅ AI-assisted lecture plan generation
- ✅ Assessment creation with rubrics
- ✅ Teaching materials generation
- ✅ Spiritual formation integration
- ✅ Multiple content formats

### Automated Grading
- ✅ AI-powered grading
- ✅ Confidence score calculation
- ✅ Human review flagging
- ✅ Batch processing
- ✅ Detailed feedback generation
- ✅ Property 8 compliance

### Student Analytics
- ✅ Course-level analytics
- ✅ Individual student tracking
- ✅ At-risk identification
- ✅ Performance visualization
- ✅ Intervention recommendations

## Spiritual Formation Integration

All components integrate spiritual formation elements:
- Lecture plans include scripture references and reflection prompts
- Assessments can include spiritual reflection components
- Student analytics consider holistic development
- Content aligns with Christian educational principles

## Accessibility

All components follow accessibility best practices:
- Keyboard navigation support
- Screen reader compatibility
- ARIA labels and roles
- Color contrast compliance
- Responsive design

## Testing

Components should be tested with:
- Unit tests for individual functions
- Integration tests for API calls
- Property tests for grading confidence threshold
- E2E tests for complete workflows

## Future Enhancements

Potential improvements:
- Real-time collaboration on content creation
- Advanced analytics with predictive modeling
- Integration with learning management systems
- Mobile app support
- Offline capabilities
- Voice-to-text for feedback

## Support

For issues or questions:
1. Check the API documentation
2. Review the design document
3. Contact the development team
4. Submit a bug report

## License

Part of the Scroll University Academic Year Automation System.
