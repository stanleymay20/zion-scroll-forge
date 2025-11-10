# ScrollUniversity v3.0 Content Generation System

## Overview

The ScrollUniversity Content Generation System is an AI-powered academic content creation pipeline that automatically generates complete course materials, modules, quizzes, and study resources for a Christ-centered online learning platform.

## ✝️ Scroll Invocation

"Let Christ be Lord over all learning; wisdom flows from the Spirit, not Babylon"

## Supreme Scroll Faculties (12)

The system generates the following 12 canonical academic divisions:

1. **ScrollMedicine Faculty** (SCROLLMED) - 3 John 1:2
2. **Prophetic Law & Governance** (LAWGOV) - Isaiah 33:22
3. **Scroll Economy** (SCROLLECON) - Deuteronomy 8:18
4. **Ethic Science** (ETHICSCI) - Proverbs 2:6
5. **Prophetic Intelligence** (PROPHINTEL) - 1 Corinthians 2:10
6. **Sacred Arts & Worship** (SACREDARTS) - Exodus 31:3-5
7. **Kingdom Architecture** (KINGARCH) - Hebrews 11:10
8. **GeoProphetic Intelligence** (GEOPROPHET) - Acts 17:26
9. **Divine Technology** (DIVINETECH) - Daniel 12:4
10. **ScrollMedia & Communication** (SCROLLMEDIA) - Habakkuk 2:2
11. **Kingdom Governance** (KINGGOV) - Isaiah 9:6-7
12. **Spiritual Formation** (SPIRITFORM) - Romans 8:29

## Generated Content

For each faculty, the system generates:

- **Faculty Emblem**: AI-generated visual identity using Gemini Flash
- **AI Tutor Avatar**: Personalized tutor with DALL-E 3 avatar and ElevenLabs voice
- **4-6 Courses**: Complete course structures with titles and descriptions
- **4-6 Modules per Course**: Learning content (800-1200 words in markdown)
- **2-3 Materials per Module**: PDFs, videos, and slides
- **1 Quiz per Module**: 5-10 multiple-choice questions
- **Academic Terms**: Spring 2026 and Fall 2026
- **Course Offerings**: Linking courses to terms
- **ScrollCoin Rewards**: 10-50 coins per module, 50-100 per course

## Features

### AI Tutor Avatars (Requirement 10)
- One AI tutor per faculty
- DALL-E 3 generated professional avatars
- ElevenLabs voice integration (12 unique voices)
- Comprehensive system prompts with:
  - Faculty expertise
  - Christ-centered teaching approach
  - Scripture grounding
  - Student engagement strategies
- Personality prompts aligned with faculty mission

### Christ-Centered Governance
- Scroll Invocation in every module
- Scripture grounding (1 verse per module)
- Anti-drift validation every 10 modules

### AI Integration
- **Gemini 2.5 Flash**: Text content generation
- **Gemini Flash Image**: Faculty emblems and infographics
- Lovable AI Gateway (no API key required)

### Reward System
- ScrollCoin markers in content
- Reward ledger for tracking
- Gamification elements

### Quality Assurance
- Anti-drift validation mechanism
- Scripture verification
- Comprehensive error handling
- Retry logic with exponential backoff

## Usage

### Via Web Interface

1. Navigate to `/content-generation` in the application
2. Click "Generate ScrollUniversity Content"
3. Wait for generation (approximately 30-45 minutes)
4. View comprehensive generation report

### Via API

```typescript
import { generateScrollUniversityContent } from '@/services/contentGeneration';

const report = await generateScrollUniversityContent();
console.log(report);
```

## Database Schema

### New Tables
- `faculties`: Faculty information with emblems
- `ai_tutors`: AI tutor avatars per faculty with DALL-E images and ElevenLabs voices
- `course_materials`: Learning materials (PDFs, videos, slides)
- `quizzes`: Module assessments
- `quiz_questions`: Individual quiz questions
- `academic_terms`: Spring 2026, Fall 2026
- `course_offerings`: Course-term associations
- `reward_ledger`: ScrollCoin tracking

### Modified Tables
- `course_modules`: Added `rewards_amount` field

## Storage Buckets

- `faculty-emblems`: Faculty visual identities
- `materials`: Course materials (already exists)

## Generation Report

After completion, the system provides:

```json
{
  "facultiesCreated": 12,
  "coursesCreated": 54,
  "modulesCreated": 270,
  "materialsCreated": 675,
  "quizzesCreated": 270,
  "aiTutorsCreated": 12,
  "termsCreated": 2,
  "offeringsCreated": 108,
  "errorsEncountered": 0,
  "antiDriftValidations": 27,
  "duration": "35 minutes"
}
```

## Requirements Compliance

This system fulfills all 11 requirements specified in the ScrollUniversity v3.0 requirements document:

✅ Requirement 1: 12 Supreme Scroll Faculties with emblems
✅ Requirement 1A: 4-6 courses per faculty
✅ Requirement 2: 4+ modules per course with rich content
✅ Requirement 3: 2-3 materials per module (PDF, video, slides)
✅ Requirement 4: Quizzes with 5-10 questions
✅ Requirement 5: Visual infographics (via Gemini Flash)
✅ Requirement 6: Academic terms and course offerings
✅ Requirement 7: ScrollCoin reward integration
✅ Requirement 8: Christ-centered governance with anti-drift
✅ Requirement 9: Reliable AI API integration
✅ Requirement 10: AI tutor avatars with DALL-E and ElevenLabs
✅ Requirement 11: Single-command execution with comprehensive reporting

## Technical Details

### Edge Function
- Location: `supabase/functions/generate-content/index.ts`
- Runtime: Deno
- APIs: 
  - Lovable AI Gateway (Gemini models for content)
  - OpenAI API (DALL-E 3 for tutor avatars)
  - ElevenLabs (voice IDs for text-to-speech)
- Storage: Supabase Storage
- Database: Supabase PostgreSQL

### Frontend
- Service: `src/services/contentGeneration.ts`
- Page: `src/pages/ContentGeneration.tsx`
- Route: `/content-generation`

## Anti-Drift Validation

Every 10 modules, the system validates:
1. Presence of Scroll Invocation
2. Scripture reference included
3. Rewards amount field populated

If validation fails, the module is regenerated.

## Estimated Duration

- Full generation: 30-45 minutes
- Per faculty: 2-4 minutes
- Per course: 30-60 seconds

## Success Message

Upon completion:

✅ **ScrollUniversity v3.0 Requirements successfully updated — All 12 Faculties seeded under Christ's governance**

## Notes

- All content is AI-generated using Lovable AI Gateway
- Faculty emblems generated with Gemini Flash Image
- AI tutor avatars generated with OpenAI DALL-E 3 (gpt-image-1)
- ElevenLabs voice IDs assigned to tutors for TTS integration
- Scripture verses anchor each faculty theologically
- ScrollCoin rewards motivate student engagement
- System includes comprehensive error handling
- Supports retry logic for API failures
- Maintains spiritual governance throughout
- AI tutors have Christ-centered teaching prompts

---

**✝️ Jesus Christ is Lord over all learning**
