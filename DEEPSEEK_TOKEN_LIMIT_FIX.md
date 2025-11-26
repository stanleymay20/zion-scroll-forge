# DeepSeek Token Limit Fix

## Issue Identified
DeepSeek API was returning 400 errors because the course generator was requesting `max_tokens: 12000`, which exceeds DeepSeek's maximum output token limit of **8192 tokens**.

## Root Cause
```
Error: Request failed with status code 400
```

The ComprehensiveCourseGenerator was requesting 12,000 tokens for lecture generation, but DeepSeek's API has a hard limit of 8,192 tokens for output.

## Fix Applied

### OpenRouterService.ts Changes
1. **Token Limit Enforcement**: Added automatic capping of max_tokens to 8192 for DeepSeek
2. **Fallback Logic**: If DeepSeek direct API fails, automatically falls back to OpenRouter with DeepSeek model
3. **Better Logging**: Added logging to show when token limits are being enforced

```typescript
// DeepSeek has a max output token limit of 8192
const requestedTokens = options.max_tokens || parseInt(process.env.AI_MAX_TOKENS || '4000');
const maxTokens = Math.min(requestedTokens, 8192);
```

### Fallback Strategy
```
1. Try DeepSeek Direct API (with 8192 token limit)
   ↓ (if fails)
2. Try OpenRouter with DeepSeek model
   ↓ (if fails)
3. Try OpenRouter with Google Gemini (free tier)
   ↓ (if rate limited)
4. Retry with exponential backoff
```

## Testing Required
Run the course generation again:
```powershell
cd backend
npx ts-node --transpile-only scripts/generate-real-course.ts SCROLLFOUND_101
```

## Expected Behavior
- DeepSeek API calls will automatically cap at 8192 tokens
- If DeepSeek direct fails, will seamlessly fall back to OpenRouter
- No more 400 errors from token limit violations
- Course generation should complete successfully

## Token Limits Reference
- **DeepSeek Direct API**: 8,192 max output tokens
- **OpenRouter DeepSeek**: 8,192 max output tokens  
- **Google Gemini Free**: 8,192 max output tokens
- **GPT-4o-mini**: 16,384 max output tokens

## Status
✅ Fix applied to OpenRouterService.ts
⏳ Ready for testing
