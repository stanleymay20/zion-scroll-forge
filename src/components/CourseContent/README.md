# Course Content Creation Components

This directory contains React components for the Course Content Creation system, enabling ScrollUniversity to develop elite-tier educational content.

## Components Overview

### 1. CourseBuilder
Main interface for creating new course projects with phase management and workflow tracking.

**Features:**
- Course information input (title, code, description, faculty, credits, level)
- Phase progress visualization (Planning → Content Development → Production → Quality Review → Pilot Testing → Launch)
- Faculty member management
- Course structure configuration
- Spiritual integration requirements

### 2. VideoUploader
Component for uploading and managing video lecture content.

**Features:**
- Video file upload with drag-and-drop
- Recording session scheduling
- Video processing status tracking
- Caption generation
- Streaming optimization
- Multilingual version creation

### 3. MaterialsEditor
Rich text editor for creating and managing written course materials.

**Features:**
- Lecture notes creation (10-20 pages)
- PDF generation with professional formatting
- Supplemental resources curation
- Citation validation
- Version control

### 4. AssessmentDesigner
Comprehensive tool for creating rigorous assessments aligned with learning objectives.

**Features:**
- Multiple assessment types (Quiz, Essay, Project, Oral Defense, Peer Review)
- Question bank generation (50+ questions)
- Real-world project requirements
- Rubric creation with grade-level criteria
- Learning objective alignment validation
- Assessment distribution tracking (formative, summative, reflective)

### 5. QualityReview
Quality assurance interface for validating course content against elite standards.

**Features:**
- 50-point quality checklist validation
- Video quality assessment (audio, visual, engagement)
- Written materials review (accuracy, clarity, depth)
- Assessment rigor validation
- Course approval workflow
- Recommendations and feedback

### 6. ProductionDashboard
Dashboard for tracking course development progress across all projects.

**Features:**
- Project status overview
- Timeline and milestone tracking
- Team member assignments
- Deadline monitoring
- Bottleneck identification
- Progress metrics and analytics

### 7. BudgetTracker
Financial management tool for tracking course development costs and resource allocation.

**Features:**
- Budget allocation by category (Production, Faculty, Materials, Equipment, Software)
- Expense tracking against budget
- Real-time remaining budget calculation
- Budget alerts for categories approaching limits
- Financial reporting and export
- Expense history with approval tracking

### 8. DeploymentPathwayEditor
Tool for defining real-world application pathways for course concepts.

**Features:**
- Real-world application description
- Systems to transform selection (Government, Business, Education, etc.)
- Measurable impact metrics definition
- Required competencies specification
- Deployment readiness criteria
- Portfolio evidence generation

### 9. ConstitutionValidator
Validator for ensuring courses meet Course Content Constitution minimum standards.

**Features:**
- Course structure validation (4-12 modules, 3-10 lessons per module)
- Placeholder content detection
- Required component completeness check
- Assessment distribution validation
- Integrated formation verification (Knowledge, Skill, Character, Calling)

### 10. RigorLevelSelector
Configuration tool for selecting and validating academic rigor levels.

**Features:**
- Rigor level selection (Beginner, Intermediate, Advanced, Strategic)
- Level-specific requirements display
- Content depth validation
- Elite institution benchmarking
- Vocabulary and assessment difficulty matching

### 11. SpiritualAlignmentDashboard
Monitoring dashboard for spiritual alignment validation across all content.

**Features:**
- Strictness profile configuration (Strict Spiritual, Balanced, Light Check)
- Christ-centered score tracking
- Scripture-rooted content validation
- Theological drift detection
- Tone problem identification
- Auto-correction attempts

### 12. PedagogyFlowEditor
Editor for designing lessons following the 6-step Scroll Pedagogy flow.

**Features:**
- Six-step lesson flow (Ignition, Download, Demonstration, Activation, Reflection, Commission)
- Step-by-step content editing
- Pedagogy validation
- Assessment type distribution reminders
- Revelation Learning Model (5-level progression)

## Integration with Backend

All components integrate with the backend API at `/api/course-content/*`:

- `POST /api/course-content/projects` - Create course project
- `PUT /api/course-content/projects/:id/phase` - Advance phase
- `POST /api/course-content/videos` - Upload video
- `POST /api/course-content/materials` - Create materials
- `POST /api/course-content/assessments` - Create assessment
- `POST /api/course-content/quality-review` - Submit for QA
- `GET /api/course-content/dashboard` - Get dashboard data
- `POST /api/course-content/deployment-pathways` - Create deployment pathway
- `POST /api/course-content/validate-constitution` - Validate constitution
- `POST /api/course-content/validate-rigor` - Validate rigor level
- `POST /api/course-content/validate-spiritual-alignment` - Validate spiritual alignment
- `POST /api/course-content/validate-pedagogy` - Validate pedagogy

## Validation Standards

All components enforce ScrollUniversity's quality standards:

- **Course Constitution Compliance**: 4-12 modules, 3-10 lessons per module
- **Elite Academic Rigor**: Benchmarked against top-tier global universities
- **Spiritual Integration**: Christ-centered biblical foundation required
- **Real-World Application**: Deployment pathways for every major concept
- **Assessment Distribution**: Formative, summative, and reflective types
- **Scroll Pedagogy**: 6-step lesson flow mandatory
- **Integrated Formation**: Knowledge, Skill, Character, and Calling dimensions

## Usage Example

```tsx
import {
  CourseBuilder,
  AssessmentDesigner,
  QualityReview,
  ConstitutionValidator
} from '@/components/CourseContent';

// Create a new course
<CourseBuilder
  onSave={(courseInfo) => handleCourseSave(courseInfo)}
  onCancel={() => handleCancel()}
/>

// Design an assessment
<AssessmentDesigner
  moduleId="module_123"
  onSave={(assessment) => handleAssessmentSave(assessment)}
/>

// Run quality review
<QualityReview
  courseId="course_123"
  onApprove={(decision) => handleApproval(decision)}
  onReject={(feedback) => handleRejection(feedback)}
/>

// Validate constitution compliance
<ConstitutionValidator
  courseId="course_123"
  onValidate={(results) => handleValidation(results)}
/>
```

## Development Guidelines

When extending these components:

1. Follow TypeScript strict mode - no `any` types
2. Use existing UI components from `@/components/ui`
3. Integrate with backend API routes
4. Maintain accessibility standards (WCAG 2.1 AA)
5. Include loading states and error handling
6. Add validation for all user inputs
7. Ensure mobile responsiveness
8. Follow Scroll Pedagogy principles
9. Enforce Course Constitution standards
10. Validate spiritual alignment at all checkpoints
