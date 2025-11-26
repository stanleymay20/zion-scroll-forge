# Quick Start: Course Generation

## Generate a Single Course (Fastest)

```powershell
cd backend
$env:DEEPSEEK_API_KEY = "sk-cab0b71f6aac4b76a3a5f3cdf0874913"
npx tsx scripts/generate-full-course-standalone.ts KINGBIZ_301
```

**Time**: ~2-3 hours per course  
**Output**: Complete course with 4 modules, 12 lectures, full content

## Generate Multiple Courses (Batch)

```powershell
cd backend
.\scripts\batch-generate-courses.ps1
```

**Courses Generated**:
1. KINGBIZ_301 - Kingdom Business Principles
2. SCROLLFOUND_101 - Foundations of ScrollUniversity
3. SPIRFORM_101 - Spiritual Formation
4. BIBWORLD_201 - Biblical Worldview
5. SACREDAI_201 - Sacred AI Engineering

**Time**: ~10-15 hours total  
**Output**: 5 complete courses

## Generate All Courses (Master)

```powershell
cd backend
$env:DEEPSEEK_API_KEY = "sk-cab0b71f6aac4b76a3a5f3cdf0874913"
npx tsx scripts/master-course-generator.ts
```

**Reads from**: `backend/data/full-course-catalog.json`  
**Output**: All courses defined in catalog

## What Gets Generated

### Every Course:
- ✅ Comprehensive course overview
- ✅ 4 modules with overviews
- ✅ 12 lectures (3 per module)
- ✅ Full Scroll Pedagogy (6 steps per lecture)
- ✅ Notes, video scripts, assessments

### Every Lecture:
- ✅ IGNITION (150-200 words)
- ✅ DOWNLOAD (800-1000 words)
- ✅ DEMONSTRATION (500-600 words)
- ✅ ACTIVATION (300-400 words)
- ✅ REFLECTION (400-500 words)
- ✅ COMMISSION (300-400 words)
- ✅ Notes (concepts, examples, Scriptures)
- ✅ Video script (45 minutes)
- ✅ Assessment (quiz, assignment, reflection)

## Content Quality

- ✅ NO placeholders
- ✅ Real Scripture references
- ✅ Specific examples
- ✅ Actionable strategies
- ✅ Spiritual integration

## Check Generated Content

```powershell
# View course overview
cat courses/COURSE_KINGBIZ_301/course_overview.md

# View lecture
cat courses/COURSE_KINGBIZ_301/module1/lecture1.md

# View JSON data
cat courses/COURSE_KINGBIZ_301/module1/lecture1.json
```

## Monitor Progress

```powershell
# Check generation log
cat courses/generation-log.json

# List generated courses
ls courses/
```

## That's It!

The system generates **complete, comprehensive, production-quality courses** with **NO placeholders** and **NO hardcoding**.

**The scrolls are rolling!** 📜✨
