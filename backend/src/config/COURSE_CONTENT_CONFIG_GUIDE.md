# Course Content Creation System Configuration Guide

## Overview

The Course Content Creation System configuration (`course-content.config.ts`) provides comprehensive settings for managing the entire course development lifecycle at ScrollUniversity. This configuration ensures that all courses meet elite academic standards while maintaining Christ-centered spiritual formation.

## Configuration Sections

### 1. Video Processing Configuration

Controls video recording, editing, captioning, and streaming optimization.

**Key Settings:**
- **Resolution**: Minimum (720p), Standard (1080p), High (4K)
- **Bitrate**: Audio and video quality settings for different streaming levels
- **Formats**: Supported output formats (mp4, webm, hls)
- **Captioning**: Automatic caption generation in 9+ languages
- **Streaming**: Adaptive bitrate and HLS/DASH support

**Environment Variables:**
- `VIDEO_MIN_RESOLUTION`, `VIDEO_STANDARD_RESOLUTION`, `VIDEO_HIGH_RESOLUTION`
- `VIDEO_AUDIO_BITRATE`, `VIDEO_BITRATE_LOW/MEDIUM/HIGH`
- `VIDEO_FORMATS`, `VIDEO_CAPTION_LANGUAGES`
- `VIDEO_ADAPTIVE_BITRATE`, `VIDEO_HLS_ENABLED`

### 2. Quality Checklist Configuration

Defines the 50-point quality checklist criteria and thresholds for course approval.

**Key Settings:**
- **Video Quality**: Resolution, audio quality, length requirements
- **Written Materials**: Page count, required sections, citation requirements
- **Assessment Rigor**: Question bank size, assessment types, rubric requirements
- **Spiritual Integration**: Biblical foundation, reflection questions, theological review

**Thresholds:**
- Overall Passing Score: 0.8 (80%)
- Video Quality: 0.85 (85%)
- Content Quality: 0.8 (80%)
- Assessment Rigor: 0.8 (80%)
- Spiritual Alignment: 0.9 (90%)

**Environment Variables:**
- `QC_MIN_RESOLUTION`, `QC_MIN_PAGE_COUNT`, `QC_MIN_QUESTION_BANK`
- `QC_OVERALL_PASSING_SCORE`, `QC_VIDEO_MIN_SCORE`, `QC_SPIRITUAL_MIN_SCORE`

### 3. Budget Configuration

Manages financial allocation across course development categories.

**Default Allocations:**
- Production: 35% ($10,000)
- Faculty: 30% ($8,000)
- Materials: 15% ($4,000)
- Equipment: 10% ($3,000)
- Software: 5% ($2,000)
- Marketing: 5% ($1,500)

**Limits:**
- Maximum Course Budget: $50,000
- Minimum Course Budget: $5,000
- Alert Threshold: 85% of budget

**Environment Variables:**
- `BUDGET_CATEGORY_*`, `BUDGET_DEFAULT_*`
- `BUDGET_MAX_COURSE`, `BUDGET_MIN_COURSE`, `BUDGET_ALERT_THRESHOLD`

### 4. Timeline Configuration

Provides three timeline templates for different course development speeds.

**Templates:**
- **Standard** (93 days total): Balanced approach
- **Accelerated** (62 days total): Fast-track development
- **Comprehensive** (145 days total): Thorough, detailed development

**Phases:**
1. Planning
2. Content Development
3. Production
4. Quality Review
5. Pilot Testing
6. Launch

**Environment Variables:**
- `TIMELINE_STANDARD_*`, `TIMELINE_ACCELERATED_*`, `TIMELINE_COMPREHENSIVE_*`
- `TIMELINE_ESCALATION_DAYS`

### 5. Automation Configuration

Defines rules for automating repetitive tasks.

**Automated Tasks:**
- **Captioning**: Auto-generate captions in multiple languages
- **Formatting**: PDF generation with consistent styling
- **File Conversion**: Support for pdf, docx, epub, html
- **Notifications**: Email, SMS, push notifications

**Environment Variables:**
- `AUTOMATION_CAPTIONING_ENABLED`, `AUTOMATION_PDF_GEN`
- `AUTOMATION_FORMATS`, `AUTOMATION_NOTIFICATION_CHANNELS`

### 6. Course Constitution Configuration

Enforces the Scroll Course Content Constitution minimum standards.

**Structure Requirements:**
- Modules: 4-12 per course
- Lessons: 3-10 per module
- Required Components: lecture notes, video scripts, examples, references

**Content Requirements:**
- No placeholder content (TODO, FIXME, etc.)
- Production-ready materials only
- Complete notes, scripts, examples, references

**Assessment Requirements:**
- Micro-assessments per module
- Mid-course assessment
- Final capstone assessment
- Minimum 2 assessments per module

**Integrated Formation:**
- Knowledge dimension required
- Skill dimension required
- Character dimension required
- Calling dimension required
- Minimum score: 0.7 per dimension

**Environment Variables:**
- `CONSTITUTION_MIN_MODULES`, `CONSTITUTION_MAX_MODULES`
- `CONSTITUTION_PLACEHOLDER_DETECTION`, `CONSTITUTION_STRICT_MODE`
- `CONSTITUTION_KNOWLEDGE_DIM`, `CONSTITUTION_SKILL_DIM`

### 7. Rigor Level Configuration

Defines standards for four rigor levels matching elite institutions.

**Levels:**
- **Beginner**: Foundational concepts, basic vocabulary (depth: 0.3)
- **Intermediate**: Applied concepts, technical vocabulary (depth: 0.6)
- **Advanced**: Complex theories, specialized vocabulary (depth: 0.85)
- **Strategic**: Systems thinking, expert vocabulary (depth: 0.95)

**Benchmarking:**
- Elite Institutions: MIT, Stanford, Oxford, Cambridge, Harvard, Yale, Princeton, ETH Zurich
- Comparison Criteria: content depth, assessment rigor, theoretical foundation, practical application
- Minimum Benchmark Score: 0.8

**Thresholds:**
- Minimum Depth Score: 0.7
- Minimum Technical Accuracy: 0.9
- Minimum Spiritual Integration: 0.8
- Rejection Threshold: 0.6

**Environment Variables:**
- `RIGOR_BEGINNER_*`, `RIGOR_INTERMEDIATE_*`, `RIGOR_ADVANCED_*`, `RIGOR_STRATEGIC_*`
- `RIGOR_BENCHMARK_INSTITUTIONS`, `RIGOR_MIN_BENCHMARK_SCORE`

### 8. Spiritual Alignment Configuration

Configures the SpiritualAlignmentValidator with three strictness profiles.

**Strictness Profiles:**
- **STRICT_SPIRITUAL**: For theology modules (zero tolerance for drift)
- **BALANCED**: For technical modules with spiritual integration
- **LIGHT_CHECK**: For technical content (tone and respect validation)

**Integration Points:**
- Course generation
- Module generation
- Lesson finalization
- AI tutor scripts
- System messages
- Spiritual content blocks

**Validation Types:**
- Theological drift detection
- Tone problem detection
- Spiritualization of laziness detection
- Babylonian flattening detection

**Error Handling:**
- Auto-correction enabled (max 3 attempts)
- Stop on critical errors
- Surface all issues to content creators

**Environment Variables:**
- `SPIRITUAL_STRICT_*`, `SPIRITUAL_BALANCED_*`, `SPIRITUAL_LIGHT_*`
- `SPIRITUAL_VALIDATE_*`, `SPIRITUAL_DETECT_*`
- `SPIRITUAL_AUTO_CORRECTION`, `SPIRITUAL_MAX_CORRECTION_ATTEMPTS`

### 9. Scroll Pedagogy Configuration

Enforces the Scroll Pedagogy 6-step lesson flow and Revelation Learning Model.

**Lesson Flow (6 Steps):**
1. Ignition (Hook + revelation trigger)
2. Download (Concept teaching)
3. Demonstration (Worked example)
4. Activation (Student practice)
5. Reflection (Identity & integration)
6. Commission (Next step/assignment)

**AI Tutor Requirements:**
- Dual explanation pattern (conceptual + practical)
- Tone: warm, wise, prophetic-but-grounded
- Adapt to student calling/context

**Assessment Distribution:**
- Formative: minimum 3
- Summative: minimum 2
- Reflective: minimum 2

**Progression Model (5 Levels):**
1. Awareness & Vocabulary
2. Understanding & Analysis
3. Application & Problem Solving
4. System Design & Governance
5. Multiplication & Teaching Others

**Priority Hierarchy:**
1. Spiritual alignment
2. Pedagogical integrity
3. Content depth
4. Technical correctness
5. Delivery speed

**Environment Variables:**
- `PEDAGOGY_FLOW_REQUIRED`, `PEDAGOGY_DUAL_EXPLANATION`
- `PEDAGOGY_TONE_*`, `PEDAGOGY_ADAPT_CALLING`
- `PEDAGOGY_FORMATIVE_REQUIRED`, `PEDAGOGY_MIN_FORMATIVE`
- `PEDAGOGY_LEVEL_MAPPING`, `PEDAGOGY_LEVEL_APPROPRIATE`

## Usage

### Importing Configuration

```typescript
import { courseContentConfig, validateCourseContentConfig } from '@/config/course-content.config';

// Validate configuration on startup
validateCourseContentConfig();

// Access specific configuration
const videoSettings = courseContentConfig.videoProcessing;
const qualityThresholds = courseContentConfig.qualityChecklist.thresholds;
```

### Validation

The configuration includes a validation function that checks:
- Required environment variables are present
- Budget category percentages sum to 1.0
- Quality thresholds are between 0 and 1
- Module and lesson ranges are valid

Call `validateCourseContentConfig()` during application startup to ensure configuration is valid.

### Environment Variables

All configuration values can be overridden via environment variables. See `.env.example` for the complete list of available variables.

**Best Practices:**
- Use environment variables for deployment-specific settings
- Keep default values sensible for development
- Document any custom environment variables
- Validate configuration on startup

## Integration with Services

The configuration is used by the following services:

- **CourseWorkflowService**: Timeline templates, phase milestones
- **VideoProductionService**: Video processing settings, captioning
- **WrittenMaterialsService**: Page count requirements, formatting
- **AssessmentDesignService**: Question bank size, assessment types
- **CourseQualityService**: Quality checklist criteria and thresholds
- **CourseBudgetService**: Budget categories and allocations
- **ProductionTimelineService**: Timeline templates and reminders
- **CourseConstitutionValidatorService**: Structure and content requirements
- **DepthRigorEnforcerService**: Rigor levels and benchmarking
- **SpiritualAlignmentValidatorService**: Strictness profiles and validation
- **ScrollPedagogyEnforcerService**: Lesson flow and pedagogy requirements

## Customization

To customize configuration for specific deployments:

1. Copy `.env.example` to `.env`
2. Update environment variables as needed
3. Restart the application
4. Verify configuration with `validateCourseContentConfig()`

**Common Customizations:**
- Adjust quality thresholds for different standards
- Modify timeline templates for faster/slower development
- Configure budget allocations based on institutional priorities
- Set rigor level benchmarks for specific disciplines
- Adjust spiritual alignment strictness for different content types

## Troubleshooting

**Configuration Validation Errors:**
- Check that all required environment variables are set
- Verify budget category percentages sum to 1.0
- Ensure quality thresholds are between 0 and 1
- Confirm module/lesson ranges are valid (min <= max)

**Performance Issues:**
- Reduce video bitrate for faster processing
- Disable auto-captioning if not needed
- Adjust timeline templates for faster development
- Optimize automation rules for specific workflows

**Quality Issues:**
- Increase quality thresholds for stricter standards
- Enable strict mode for constitution validation
- Use STRICT_SPIRITUAL profile for theology content
- Increase minimum scores for integrated formation

## Support

For questions or issues with configuration:
- Review this guide and `.env.example`
- Check service documentation for specific requirements
- Consult the Course Content Creation design document
- Contact the development team for assistance
