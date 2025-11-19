# AI Components Documentation

## Overview

This directory contains all AI-powered frontend components for ScrollUniversity. These components provide comprehensive interfaces for students, faculty, and administrators to interact with AI automation services.

## Components

### 1. AIChatInterface
**Purpose**: 24/7 AI support chatbot for instant answers  
**Users**: Students, Faculty, Admin  
**Features**:
- Real-time conversational interface
- Context-aware responses with sources
- Confidence scoring
- Automatic escalation to human support
- Conversation history

**API Endpoints**:
- `POST /api/ai-unified/chatbot/query` - Send chat message

**Usage**:
```tsx
import { AIChatInterface } from '@/components/ai';

<AIChatInterface 
  conversationId="optional-id"
  onConversationStart={(id) => console.log('Started:', id)}
/>
```

### 2. AIGradingFeedback
**Purpose**: Display detailed AI-generated grading feedback  
**Users**: Students  
**Features**:
- Overall score and grade display
- Detailed breakdown by category
- Line-by-line feedback for code
- Suggestions for improvement
- Confidence indicators
- Human review flags

**Usage**:
```tsx
import { AIGradingFeedback } from '@/components/ai';

<AIGradingFeedback 
  feedback={gradingData}
  submissionType="code" // or "essay" or "math"
/>
```

### 3. AIContentCreator
**Purpose**: Faculty interface for AI-assisted content creation  
**Users**: Faculty  
**Features**:
- Generate lectures, assessments, and resources
- Configure learning objectives
- Adjust difficulty levels
- Preview generated content
- Quality indicators (confidence, theological alignment)
- Save and regenerate options

**API Endpoints**:
- `POST /api/ai-unified/content/lecture` - Generate lecture
- `POST /api/ai-unified/content/assessment` - Generate assessment
- `POST /api/ai-unified/content/resources` - Curate resources
- `POST /api/ai-unified/content/save` - Save content

**Usage**:
```tsx
import { AIContentCreator } from '@/components/ai';

<AIContentCreator />
```

### 4. AIPersonalizedLearning
**Purpose**: Student dashboard for personalized learning insights  
**Users**: Students  
**Features**:
- Learning profile overview (style, pace, risk level)
- Strengths and weaknesses analysis
- Performance insights with trends
- Personalized recommendations
- Engagement scoring

**API Endpoints**:
- `GET /api/ai-unified/personalization/profile` - Get learning profile
- `GET /api/ai-unified/personalization/recommendations` - Get recommendations
- `GET /api/ai-unified/personalization/insights` - Get performance insights

**Usage**:
```tsx
import { AIPersonalizedLearning } from '@/components/ai';

<AIPersonalizedLearning />
```

### 5. AIResearchAssistant
**Purpose**: Research tools for literature review and citations  
**Users**: Students, Faculty  
**Features**:
- Literature search and review
- Paper summarization
- Research gap identification
- Methodology suggestions
- Citation formatting (APA, MLA, Chicago)
- Copy to clipboard

**API Endpoints**:
- `POST /api/ai-unified/research/literature-review` - Conduct review
- `POST /api/ai-unified/research/format-citations` - Format citations

**Usage**:
```tsx
import { AIResearchAssistant } from '@/components/ai';

<AIResearchAssistant />
```

### 6. AICourseRecommendations
**Purpose**: Smart course selection and degree planning  
**Users**: Students  
**Features**:
- Personalized course recommendations
- Match scores (relevance, difficulty, career alignment)
- Prerequisite checking
- Degree progress tracking
- Semester-by-semester planning
- Bulk enrollment

**API Endpoints**:
- `GET /api/ai-unified/course-recommendation/recommendations` - Get recommendations
- `GET /api/ai-unified/course-recommendation/degree-plan` - Get degree plan
- `POST /api/ai-unified/course-recommendation/enroll` - Enroll in courses

**Usage**:
```tsx
import { AICourseRecommendations } from '@/components/ai';

<AICourseRecommendations />
```

### 7. AIAdminDashboard
**Purpose**: Comprehensive monitoring and management dashboard  
**Users**: Admin  
**Features**:
- Real-time service metrics
- Cost tracking and budgets
- Performance monitoring
- Service status overview
- Alerts and warnings
- Cost breakdown by service

**API Endpoints**:
- `GET /api/ai-unified/metrics` - Get overall metrics
- `GET /api/ai-unified/services` - Get service status

**Usage**:
```tsx
import { AIAdminDashboard } from '@/components/ai';

<AIAdminDashboard />
```

### 8. AIFeaturesHub
**Purpose**: Central hub for accessing all AI features  
**Users**: Students, Faculty, Admin (role-based)  
**Features**:
- Feature discovery and navigation
- Role-based feature filtering
- Stats overview
- How-it-works guide
- Integrated navigation

**Usage**:
```tsx
import { AIFeaturesHub } from '@/components/ai';

<AIFeaturesHub 
  userRole="student" // or "faculty" or "admin"
  initialFeature="home" // optional
/>
```

## Design Principles

### 1. Spiritual Integration
All components include spiritual encouragement and biblical references to maintain ScrollUniversity's Christian mission.

### 2. User Experience
- Clean, modern interface with Tailwind CSS
- Responsive design for all screen sizes
- Loading states and error handling
- Accessibility compliance

### 3. Transparency
- Confidence scores displayed
- AI-generated content clearly marked
- Human review flags when needed
- Source attribution

### 4. Performance
- Optimistic UI updates
- Efficient API calls
- Caching where appropriate
- Real-time updates

## Styling

All components use:
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Gradient backgrounds** for headers
- **Shadow effects** for depth
- **Color coding** for status indicators

### Color Scheme
- Blue: Primary actions, AI features
- Purple: Spiritual/theological elements
- Green: Success, positive metrics
- Yellow: Warnings, medium priority
- Red: Errors, high priority
- Gray: Neutral, secondary elements

## Authentication

All API calls require authentication:
```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

## Error Handling

Components implement consistent error handling:
- Display user-friendly error messages
- Provide retry options
- Log errors for debugging
- Graceful degradation

## Testing

Each component should be tested for:
- Rendering with various props
- API call success/failure scenarios
- User interactions
- Accessibility compliance
- Responsive design

## Future Enhancements

Planned improvements:
- Real-time notifications
- Offline support
- Advanced analytics
- Multi-language support
- Voice interface
- Mobile app integration

## Support

For issues or questions:
- Check API documentation in `backend/src/docs/ai-api-documentation.md`
- Review backend services in `backend/src/services/`
- Contact development team

## License

Copyright © 2024 ScrollUniversity. All rights reserved.
