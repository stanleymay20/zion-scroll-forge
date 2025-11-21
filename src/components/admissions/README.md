# Admissions Application Components

This directory contains all components related to the ScrollUniversity admissions application system.

## Components

### Application Form Components

- **ApplicationFormStep.tsx** - Dynamic form field renderer for multi-step application
  - Supports various field types: text, textarea, select, multiselect, date, checkbox, radio
  - Built-in validation and error handling
  - Conditional field display logic
  - Help text tooltips

- **DocumentUploadStep.tsx** - Document upload interface with drag-and-drop
  - Drag-and-drop file upload
  - Multiple document type support
  - File validation (size, format)
  - Upload progress tracking
  - Document verification status display

- **ApplicationPreview.tsx** - Review and edit functionality
  - Complete application summary
  - Section-by-section review
  - Edit navigation
  - Completion status indicators
  - Pre-submission checklist

### Status Tracking Components

- **ApplicationTimeline.tsx** - Visual timeline of application events
  - Chronological event display
  - Status indicators (completed, in progress, pending)
  - Event details and descriptions

- **DocumentChecklist.tsx** - Required documents status
  - Document upload status
  - Verification status
  - Required vs optional indicators

- **InterviewScheduler.tsx** - Interview appointment management
  - Interview details display
  - Meeting link access
  - Preparation materials
  - Calendar integration

- **DecisionDisplay.tsx** - Admission decision presentation
  - Decision type with visual indicators
  - Strengths and concerns
  - Recommendations
  - Admission conditions
  - Next steps
  - Appeal information

- **AppealSubmission.tsx** - Appeal form for decisions
  - Reason for appeal
  - Additional evidence submission
  - Supporting document upload
  - Appeal guidelines

## Pages

### AdmissionsApplication.tsx
Multi-step application form with:
- Progress tracking
- Auto-save functionality
- Step validation
- Form data persistence
- Document upload integration

### ApplicationStatus.tsx
Application status dashboard with:
- Real-time status updates
- Timeline visualization
- Document checklist
- Interview scheduling
- Decision display
- Next steps guidance

## Usage

```tsx
import { AdmissionsApplication } from '@/pages/AdmissionsApplication';
import { ApplicationStatus } from '@/pages/ApplicationStatus';

// In your router
<Route path="/admissions/apply/:applicationId?" element={<AdmissionsApplication />} />
<Route path="/admissions/status/:applicationId" element={<ApplicationStatus />} />
```

## Features

### Multi-Step Form
- 5-step application process
- Personal Information
- Academic Background
- Spiritual Journey
- Document Upload
- Review & Submit

### Progress Tracking
- Overall completion percentage
- Section-by-section progress
- Auto-save functionality
- Resume from any point

### Document Management
- Drag-and-drop upload
- Multiple file support
- Format validation
- Size validation
- Verification tracking

### Interview Management
- Schedule display
- Meeting access
- Preparation materials
- Reminder system

### Decision Handling
- Clear decision display
- Detailed feedback
- Next steps guidance
- Appeal process

## API Integration

All components integrate with the backend admissions API:

```typescript
// Create application
POST /api/admissions/applications

// Save form data
POST /api/admissions/applications/:id/form-data

// Upload document
POST /api/admissions/documents/upload

// Get application status
GET /api/admissions/portal/dashboard/:applicantId

// Submit appeal
POST /api/admissions/appeals
```

## Type Definitions

See `src/types/admissions.ts` for complete type definitions including:
- Application
- FormTemplate
- FormSection
- FormField
- ApplicationDocument
- Interview
- Decision
- Appeal

## Validation

### Form Validation
- Required field checking
- Format validation (email, phone, etc.)
- Length constraints
- Pattern matching
- Custom validation rules

### Document Validation
- File type checking
- File size limits
- Required document verification

## Accessibility

All components follow WCAG 2.1 AA standards:
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- Color contrast compliance

## Spiritual Integration

The admissions system includes spiritual formation components:
- Spiritual testimony section
- Ministry experience documentation
- Character references
- Calling discernment questions
- Kingdom-focused evaluation criteria

## Future Enhancements

- [ ] Real-time collaboration with admissions counselors
- [ ] Video interview integration
- [ ] AI-powered application assistance
- [ ] Multilingual support
- [ ] Mobile app integration
- [ ] Scholarship application integration
- [ ] Financial aid calculator
