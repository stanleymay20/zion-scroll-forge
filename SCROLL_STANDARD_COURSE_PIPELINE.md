# ScrollUniversity Course Generation Pipeline
## Royal Standard - One Course at a Time

## 🚨 CRITICAL INSIGHT

**Mass generation (10,000+ courses) produces template garbage.**

The LLM hits cognitive limits:
- Context overload → falls back to patterns
- Safety mode → generic, vague phrasing  
- Rate limits → degraded quality

**Result**: Beautiful structure, hollow content.

## ✅ NEW STRATEGY: Depth First, Scale Later

### Phase 1: Pilot Catalog (5-20 Flagship Courses)

Generate **one course at a time** with full depth:

```bash
cd backend
npx ts-node --transpile-only scripts/generate-single-course.ts SCROLLFOUND_101
```

#### Pilot Course List
1. **SCROLLFOUND_101** - Foundations of Scroll Thinking
2. **SCROLLBIB_101** - Bible Foundations for Scroll Leaders
3. **SCROLLAI_101** - Intro to Scroll AI & Agents
4. **SCROLLECON_101** - Kingdom Economics & Stewardship
5. **SCROLLMED_101** - Spiritual Health & Mental Resilience
6. **SCROLLWORSHIP_101** - Worship & Creative Arts
7. **SCROLLMISSION_101** - Missional Leadership
8. **SCROLLTECH_101** - Technology for Kingdom Impact

### Phase 2: Per-Course Generation Workflow

#### Step 1: Course Specification (5-10 min)
```typescript
// Generate high-precision course spec
{
  title, description, level, prerequisites,
  learningOutcomes: [...],
  spiritualFormationOutcomes: [...],
  scrollAlignment: {
    kingdomPurpose: "...",
    transformationGoals: [...],
    callingIntegration: "..."
  }
}
```

#### Step 2: Module Outline Only (10-15 min)
```typescript
// 10 modules max
{
  moduleTitle,
  weekNumber,
  goal,
  keyScriptures: [...],
  keyConcepts: [...], // REAL concepts, not "Concept 1-1"
  spiritualThemes: [...]
}
```

#### Step 3: ONE Lecture at a Time (15-20 min each)
```typescript
// For each lecture:
{
  title: "Specific, not generic",
  intro: {
    hook: "Story/question/scenario",
    context: "Why this matters",
    objectives: [...]
  },
  mainTeaching: {
    section1: { concept, explanation, examples },
    section2: { concept, explanation, examples },
    section3: { concept, explanation, examples }
  },
  biblicalIntegration: {
    scriptures: [...],
    application: "Specific, not vague"
  },
  caseStudy: "Real-world example",
  discussionQuestions: [...],
  assignment: "Concrete task"
}
```

#### Step 4: Assessments & Resources (10-15 min)
```typescript
{
  quizQuestions: [...], // Specific to content
  examQuestions: [...],
  readingList: {
    scriptures: [...],
    books: [...],
    articles: [...]
  }
}
```

## 🔒 QUALITY VALIDATION (MANDATORY)

### ContentQualityValidator

Run after EVERY lecture generation:

```typescript
interface ValidationRules {
  // ❌ REJECT IF:
  containsTemplatePatterns: [
    "Concept X-Y",
    "Example X-Y", 
    "Term X-Y",
    "This is a placeholder"
  ],
  
  missingRequiredElements: [
    "No scriptures where required",
    "No domain-specific vocabulary",
    "Generic 'kingdom purposes' without substance"
  ],
  
  // ✅ ACCEPT ONLY IF:
  hasConcreteTerms: true,
  hasSpecificExamples: true,
  hasExplicitTheology: true,
  hasCompleteStructure: true
}
```

### Validation Response

**If validation fails:**
- Regenerate THAT LECTURE ONLY
- Not the whole course
- Max 3 retry attempts
- Then flag for human review

## 📊 COST & TIME ESTIMATES

### Per Course (Royal Standard)
- **Time**: 4-6 hours per course
- **API Calls**: ~150-200 calls
- **Cost**: $2-5 per course (using Groq/Cerebras)
- **Quality**: ⭐⭐⭐⭐⭐

### Pilot Catalog (8 courses)
- **Time**: 32-48 hours
- **Cost**: $16-40 total
- **Result**: Launch-ready flagship courses

### Scaling Timeline
- **Week 1-2**: 8 pilot courses
- **Week 3-4**: 5 more courses/week
- **Month 2**: 10 courses/week
- **Month 3+**: Semi-automated with human review

## 🎯 IMPLEMENTATION CHECKLIST

### Immediate Actions

- [ ] Create `generate-single-course.ts` script
- [ ] Implement `ContentQualityValidator` service
- [ ] Add template pattern detection
- [ ] Set up per-lecture retry logic
- [ ] Create pilot course catalog JSON

### Service Updates

- [ ] Refactor `WrittenMaterialsService` for single-course focus
- [ ] Add validation hooks to generation pipeline
- [ ] Implement progressive generation (spec → modules → lectures)
- [ ] Add human review flagging system

### Quality Assurance

- [ ] Manual review of first 2 pilot courses
- [ ] Automated validation for remaining courses
- [ ] Peer review before public launch
- [ ] Student beta testing with feedback loop

## 🚀 LAUNCH STRATEGY

### Soft Launch (Week 3)
- 5 flagship courses live
- Invite 50 beta students
- Gather feedback
- Iterate on quality

### Public Launch (Week 6)
- 15-20 excellent courses
- Full marketing push
- "Quality over quantity" positioning
- "Royal standard education"

### Expansion (Month 3+)
- Proven pipeline locked in
- Scale to 5-10 courses/week
- Maintain quality standards
- Human review for all courses

## 💡 KEY PRINCIPLES

1. **Never sacrifice quality for velocity**
2. **One course at a time, royal standard**
3. **Validation is mandatory, not optional**
4. **Template patterns = automatic rejection**
5. **Depth first, scale later**

## 🎓 SCROLLUNIVERSITY PROMISE

> "We don't have 10,000 courses. We have 20 courses that will transform your life, your calling, and your kingdom impact."

**That's the ScrollUniversity difference.**

---

*Generated: 2025-01-23*
*Status: ACTIVE STRATEGY*
*Priority: HIGHEST*
