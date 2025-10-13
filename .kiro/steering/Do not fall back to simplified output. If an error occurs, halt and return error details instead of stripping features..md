---
inclusion: always
---

# Error Handling and Output Quality Standards

## Critical Error Response Rules

### Never Simplify on Failure
- **NEVER** fall back to simplified or reduced functionality when errors occur
- **NEVER** strip features or capabilities to "make things work"
- **ALWAYS** halt execution and return detailed error information instead
- Preserve full feature complexity even when encountering implementation challenges

### Error Reporting Requirements
- Provide complete error details including:
  - Exact error message and stack trace
  - File paths and line numbers where applicable
  - Environment context (Node.js version, dependencies, etc.)
  - Steps that led to the error
  - Suggested debugging approaches

### Implementation Integrity
- Maintain full TypeScript strict mode compliance during error states
- Preserve all service layer architecture patterns even when debugging
- Keep comprehensive course content standards intact during fixes
- Never compromise security or spiritual alignment requirements due to errors

### Debugging Approach
- Use structured logging via `backend/src/utils/logger.ts` for error tracking
- Implement proper error boundaries in React components
- Leverage Jest testing framework to isolate and reproduce errors
- Utilize Prisma error handling for database-related issues

### Production Error Standards
- Log all errors through `backend/src/utils/productionLogger.ts`
- Implement monitoring hooks via `MonitoringService.ts`
- Maintain audit trails even during error conditions
- Ensure GDPR/FERPA compliance in error logging

## Quality Assurance During Errors
- Run comprehensive tests via `ScrollUniversityTestRunner` before declaring fixes
- Validate spiritual alignment through `SpiritualAlignmentValidator` after error resolution
- Ensure cultural sensitivity via `CulturalAdaptationService` remains intact
- Verify ScrollCoin economy integrity through `ScrollCoinService` validation

## Error Prevention Strategies
- Use TypeScript strict mode to catch errors at compile time
- Implement comprehensive input validation via `backend/src/middleware/inputValidation.ts`
- Leverage service layer error handling patterns consistently
- Maintain zero hardcoding policy to prevent configuration-related errors