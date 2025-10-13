---
inclusion: always
---

# Scroll University Development Guidelines

## Critical Rules

### Zero Hardcoding Policy
- **NEVER** embed URLs, ports, secrets, or environment-specific values directly in code
- All configuration must use environment variables with sensible fallbacks
- Reference `.env.example` for required environment variables
- Store configuration patterns in `backend/src/config/` directory
- Use `process.env.VARIABLE_NAME || 'fallback'` pattern consistently

### TypeScript Strictness
- Strict mode is mandatory - **NEVER** use `any` type
- All functions must have explicit return types: `function name(): ReturnType`
- Import types from `src/types/` and `src/shared/types/` directories
- Define interfaces for all data structures, API responses, and service contracts
- Use union types and generics instead of `any`

## Architecture Patterns

### Service Layer Architecture
- Business logic belongs in `src/services/` with single responsibility principle
- Database operations **exclusively** through Prisma ORM - no raw SQL queries
- Schema changes via Alembic migrations in `backend/alembic/` directory
- All services must implement error handling and structured logging
- Services should export a default class with clear method signatures

### API Gateway Pattern
- Route external API calls through `src/gateway/APIGatewayService.ts`
- Authentication handled by `backend/src/middleware/auth.ts`
- API versioning via `APIVersioningService`
- Follow RESTful conventions: GET, POST, PUT, DELETE with proper status codes
- Use consistent response format: `{ success: boolean, data?: any, error?: string }`

### Error Handling Strategy
- Centralized error handling via `backend/src/middleware/errorHandler.ts`
- Structured logging through `backend/src/utils/logger.ts`
- Include monitoring hooks for production debugging
- Use custom error classes that extend Error with status codes

## File Organization Standards

```
src/services/           # Business logic services
src/types/             # TypeScript type definitions
src/shared/types/      # Cross-platform shared types
src/components/        # React components organized by feature
backend/src/routes/    # Express API route handlers
backend/prisma/        # Database schema and migrations
backend/src/config/    # Configuration management
backend/src/middleware/ # Express middleware functions
```

## Testing Requirements
- Unit tests in `src/services/__tests__/` with `.test.ts` suffix
- Integration tests use `ScrollUniversityTestRunner` framework
- Mock external dependencies using Jest mocks
- Maintain >80% test coverage for business-critical logic
- Test files should mirror source file structure

## Domain-Specific Implementation Rules

### Spiritual Formation Integration
- All features must align with Christian educational mission
- Use components from `src/components/SpiritualFormation/` directory
- Maintain cultural sensitivity in content and interactions
- Include spiritual growth tracking in user journeys

### ScrollCoin Economy System
- Follow specifications in `docs/SCROLLCOIN_ECONOMY.md`
- Use `backend/src/services/BlockchainService.ts` for blockchain operations
- Implement fraud prevention via `ScrollCoinFraudPreventionService`
- Tie all rewards directly to measurable educational outcomes
- Maintain transparent reward calculation logic

### Security & Privacy Compliance
- Role-based access control (RBAC) via `backend/src/middleware/auth.ts`
- GDPR and FERPA compliance is mandatory for all data handling
- Use `DataPrivacyComplianceService` for privacy operations
- Implement audit trails for all critical user actions
- Encrypt sensitive data at rest and in transit

## Platform Support Requirements
- Mobile: React Native implementation in `mobile/` directory
- Offline functionality: `OfflineStorageService` for data persistence
- Progressive Web App: Service worker in `public/sw.js`
- AI content validation: `AIResponseValidator` for all AI-generated content
- Extended Reality: `WebXRIntegrationService` for immersive experiences

## Code Quality Standards
- Use meaningful variable and function names that describe intent
- Write self-documenting code with minimal but clear comments
- Follow consistent naming conventions: camelCase for variables, PascalCase for classes
- Implement proper TypeScript interfaces before writing implementation
- Use async/await instead of Promise chains for better readability

## Implementation Workflow
When implementing new features:
1. **Research**: Check existing services in `src/services/` for reusable components
2. **Types**: Define TypeScript interfaces in `src/types/` before implementation
3. **Service**: Create business logic service in `src/services/` with proper error handling
4. **Tests**: Write comprehensive tests in `src/services/__tests__/`
5. **API**: Add Express routes in `backend/src/routes/` with proper validation
6. **Config**: Add any configuration to `backend/src/config/`
7. **Validation**: Ensure spiritual alignment and educational value
8. **Documentation**: Update relevant documentation and type definitions