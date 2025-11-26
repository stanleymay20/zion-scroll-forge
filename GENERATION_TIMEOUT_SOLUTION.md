# Course Generation Timeout Solution

## Problem
Single lecture generation is timing out (>5 minutes) because we're requesting too much content in one API call:
- 2000+ word lecture notes
- 1500+ word video script
- 6-step pedagogy model with detailed examples
- Multiple scripture references
- Key terms and definitions

## Root Cause
DeepSeek API is taking 5+ minutes to generate 8000+ tokens of highly structured content in a single call.

## Solution Options

### Option 1: Increase Timeout (Quick Fix)
Increase the timeout to 10 minutes per lecture:
```typescript
timeout: 600000 // 10 minutes
```

**Pros**: Simple, no code changes
**Cons**: Still slow, may hit API limits

### Option 2: Multi-Stage Generation (Recommended)
Break lecture generation into 3 API calls:
1. **Structure** (1-2 min): Generate 6-step pedagogy outline
2. **Notes** (2-3 min): Generate full lecture notes
3. **Script** (2-3 min): Generate video script

**Pros**: Faster, more reliable, better quality
**Cons**: More API calls, slightly more complex

### Option 3: Parallel Generation
Generate multiple lectures in parallel using Promise.all()

**Pros**: Much faster overall
**Cons**: Higher API load, potential rate limits

## Recommended Approach

Use **Option 1** for immediate testing, then implement **Option 2** for production.

### Immediate Fix
```typescript
// In generate-real-course.ts
const response = await this.openRouter.generateContent(
  [{ role: 'user', content: prompt }],
  'deepseek/deepseek-chat',
  { temperature: 0.7, max_tokens: 8192, timeout: 600000 } // 10 min
);
```

### Production Fix (Multi-Stage)
```typescript
// Stage 1: Generate structure
const structure = await generateLectureStructure();

// Stage 2: Generate notes
const notes = await generateLectureNotes(structure);

// Stage 3: Generate script
const script = await generateVideoScript(structure);

// Combine
return { ...structure, fullNotes: notes, videoScript: script };
```

## Current Status
- DeepSeek API is working correctly
- JSON schema is correct
- Content quality is good
- **Issue**: Single API call is too slow

## Next Steps
1. Increase timeout to 10 minutes for testing
2. Test SCROLLFOUND_101 generation
3. If successful, implement multi-stage generation for production
