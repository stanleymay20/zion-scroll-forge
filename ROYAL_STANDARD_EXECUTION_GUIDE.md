# ScrollUniversity Royal Standard - Execution Guide
## One Course at a Time, Full Depth

## 🎯 IMMEDIATE NEXT STEPS

### Step 1: Generate First Pilot Course (NOW)

```bash
cd backend
npx ts-node --transpile-only scripts/generate-single-course.ts SCROLLFOUND_101
```

**Expected Output:**
- Generation time: 4-6 hours
- Output location: `courses/COURSE_SCROLLFOUND_101/`
- Quality score: 75+ (validated automatically)
- Cost: ~$2-5

**What Happens:**
1. ✅ Generates 10 module outlines with specific concepts
2. ✅ Creates 40 lectures (4 per module) with 1500+ words each
3. ✅ Validates EVERY lecture for template patterns
4. ✅ Auto-retries failed validations (max 3 attempts)
5. ✅ Flags content needing human review
6. ✅ Produces final course JSON with quality score

### Step 2: Review & Refine (2-3 hours)

```bash
# Check validation report
cat courses/COURSE_SCROLLFOUND_101/generation.log

# Review flagged content
grep "_needsReview" courses/COURSE_SCROLLFOUND_101/*.json

# Manual review checklist:
# [ ] Read 2-3 sample lectures for quality
# [ ] Verify scripture references are accurate
# [ ] Check examples are concrete and specific
# [ ] Ensure spiritual integration is authentic
```

### Step 3: Generate Next Course

```bash
# Once SCROLLFOUND_101 is approved, generate next:
npx ts-node --transpile-only scripts/generate-single-course.ts SCROLLBIB_101
```

## 📊 PILOT CATALOG PROGRESS

| Priority | Course Code | Title | Status | Score | Time |
|----------|-------------|-------|--------|-------|------|
| 1 | SCROLLFOUND_101 | Foundations of Scroll Thinking | ⏳ Pending | - | - |
| 2 | SCROLLBIB_101 | Bible Foundations | ⏳ Pending | - | - |
| 3 | SCROLLAI_101 | Intro to Scroll AI | ⏳ Pending | - | - |
| 4 | SCROLLECON_101 | Kingdom Economics | ⏳ Pending | - | - |
| 5 | SCROLLMED_101 | Spiritual Health | ⏳ Pending | - | - |
| 6 | SCROLLWORSHIP_101 | Worship & Arts | ⏳ Pending | - | - |
| 7 | SCROLLMISSION_101 | Missional Leadership | ⏳ Pending | - | - |
| 8 | SCROLLTECH_101 | Kingdom Technology | ⏳ Pending | - | - |

**Target:** 8 flagship courses in 3-4 weeks

## 🔍 QUALITY VALIDATION SYSTEM

### Automatic Checks (Every Lecture)

✅ **Template Pattern Detection**
- Rejects: "Concept 1-1", "Example 2-1", "Term X-Y"
- Rejects: "[INSERT...]", "[TODO...]", "Lorem ipsum"

✅ **Content Depth Validation**
- Minimum 1500 words per lecture
- Minimum 2 scripture references
- Minimum 5 domain-specific terms

✅ **Vague Content Detection**
- Flags excessive generic phrases
- Requires concrete examples
- Demands specific terminology

✅ **Biblical Integration Check**
- Verifies scripture presence
- Checks biblical keywords
- Validates spiritual themes

### Validation Scores

- **90-100**: Excellent - Royal Standard ⭐⭐⭐⭐⭐
- **75-89**: Good - Approved with minor notes ⭐⭐⭐⭐
- **70-74**: Acceptable - Needs review ⭐⭐⭐
- **Below 70**: Failed - Auto-retry or flag ❌

## 🚨 WHAT TO DO IF VALIDATION FAILS

### Scenario 1: Lecture Fails Validation (Score < 70)

**System Response:**
1. Auto-retry up to 3 times
2. If still failing, flag for human review
3. Continue with next lecture (don't block pipeline)

**Your Action:**
```bash
# Review flagged lecture
cat courses/COURSE_*/module*_lecture*_FLAGGED.json

# Manually regenerate if needed
npx ts-node --transpile-only scripts/regenerate-lecture.ts SCROLLFOUND_101 1 2
```

### Scenario 2: Module Fails Validation

**System Response:**
1. Logs all lecture failures
2. Calculates average module score
3. Flags entire module if score < 70

**Your Action:**
- Review module report
- Decide: regenerate module OR fix individual lectures

### Scenario 3: Course Fails Validation

**System Response:**
1. Generates comprehensive report
2. Lists all failed modules/lectures
3. Exits with error code (prevents bad content)

**Your Action:**
- DO NOT proceed to next course
- Fix current course first
- Re-run validation

## 📈 SCALING TIMELINE

### Week 1-2: Pilot Phase (3 courses)
- Generate SCROLLFOUND_101, SCROLLBIB_101, SCROLLAI_101
- Manual review of each course
- Refine prompts based on feedback
- **Goal:** Lock in quality pattern

### Week 3-4: Expansion (5 more courses)
- Generate remaining 5 pilot courses
- Reduced manual review (spot checks)
- **Goal:** 8 flagship courses ready

### Week 5-6: Soft Launch
- Beta test with 50 students
- Gather feedback
- Iterate on content
- **Goal:** Validate market fit

### Month 2+: Controlled Scaling
- 5 courses/week with proven pipeline
- Human review for all courses
- **Goal:** 20-30 excellent courses

## 💰 COST TRACKING

### Per Course Estimates
- **API Calls:** ~150-200 calls
- **Tokens:** ~500K-800K tokens
- **Cost:** $2-5 per course (using Groq/Cerebras free tier)

### Pilot Catalog (8 courses)
- **Total Cost:** $16-40
- **Time Investment:** 32-48 hours generation + 16-24 hours review
- **ROI:** Priceless (launch-ready flagship courses)

## 🎓 LAUNCH STRATEGY

### Soft Launch (Week 3)
**Messaging:** "We don't have 10,000 courses. We have 8 courses that will transform your life."

**Positioning:**
- Quality over quantity
- Royal standard education
- Depth, not breadth
- Transformation, not information

### Public Launch (Week 6)
**Catalog:** 15-20 excellent courses
**Promise:** Every course meets ScrollUniversity Royal Standard
**Guarantee:** If content doesn't transform, full refund

## 🔧 TROUBLESHOOTING

### Issue: Generation Taking Too Long

**Solution:**
- Check API rate limits
- Verify network connection
- Use faster model (Groq llama-3.1-70b)

### Issue: Too Many Validation Failures

**Solution:**
- Review prompts for clarity
- Add more specific examples
- Increase temperature for creativity
- Check if model is appropriate

### Issue: Content Still Generic

**Solution:**
- Enhance prompts with domain expertise
- Provide more context in module outlines
- Use few-shot examples
- Consider human-in-the-loop for first draft

## ✅ SUCCESS CRITERIA

### Per Course
- [ ] Validation score 75+
- [ ] Zero template placeholders
- [ ] All lectures 1500+ words
- [ ] Concrete examples throughout
- [ ] Authentic biblical integration
- [ ] Manual review approved

### Pilot Catalog
- [ ] 8 courses generated
- [ ] All courses validated
- [ ] Beta tested with students
- [ ] Positive feedback received
- [ ] Ready for public launch

## 🚀 EXECUTE NOW

```bash
# Start first course generation
cd backend
npx ts-node --transpile-only scripts/generate-single-course.ts SCROLLFOUND_101

# Monitor progress
tail -f courses/COURSE_SCROLLFOUND_101/generation.log

# Check validation
grep "VALIDATION REPORT" courses/COURSE_SCROLLFOUND_101/generation.log
```

**This is the ScrollUniversity way: Royal standard, not mass production.**

---

*Generated: 2025-01-23*
*Status: READY TO EXECUTE*
*Next Action: Run first course generation*
