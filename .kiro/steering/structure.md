---
inclusion: always
---

# ScrollUniversity Project Structure

## Root Directory Organization

```
ScrollUniversity/
├── backend/                 # Node.js/Express API server
├── frontend/               # React web application (minimal - main app in src/)
├── mobile/                 # React Native mobile application
├── src/                    # Main React application source
├── public/                 # Static web assets
├── docs/                   # Documentation
├── scripts/                # Build and deployment scripts
├── k8s/                    # Kubernetes deployment manifests
├── nginx/                  # Nginx configuration
├── .kiro/                  # Kiro AI assistant configuration
├── .github/                # GitHub Actions CI/CD
└── node_modules/           # Root dependencies
```

## Backend Structure (`backend/`)

### Core Architecture
```
backend/
├── src/
│   ├── index.ts                    # Main server entry point
│   ├── admissions-server.ts        # Dedicated admissions microservice
│   ├── routes/                     # API route handlers
│   │   ├── auth.ts                 # Authentication endpoints
│   │   ├── courses.ts              # Course management
│   │   ├── users.ts                # User management
│   │   ├── scrollcoin.ts           # ScrollCoin economy
│   │   ├── admissions/             # Admissions system routes
│   │   └── [feature].ts            # Feature-specific routes
│   ├── services/                   # Business logic services
│   │   ├── admissions/             # Admissions-specific services
│   │   ├── testing/                # Quality assurance framework
│   │   └── [Service].ts            # Individual service classes
│   ├── middleware/                 # Express middleware
│   │   ├── auth.ts                 # Authentication middleware
│   │   ├── errorHandler.ts         # Global error handling
│   │   ├── inputValidation.ts      # Request validation
│   │   └── productionSecurity.ts   # Production security
│   ├── config/                     # Configuration management
│   │   ├── redis.config.ts         # Redis configuration
│   │   └── [feature].config.ts     # Feature configurations
│   ├── utils/                      # Utility functions
│   │   ├── logger.ts               # Winston logging
│   │   └── productionLogger.ts     # Production logging
│   └── __tests__/                  # Backend tests
├── prisma/                         # Database schema and migrations
│   ├── schema.prisma               # Main database schema
│   ├── migrations/                 # Database migrations
│   └── seeds/                      # Database seed data
├── scripts/                        # Backend-specific scripts
├── contracts/                      # Blockchain smart contracts
└── docker/                         # Docker configurations
```

### Service Layer Pattern
- **Single Responsibility**: Each service handles one domain area
- **Dependency Injection**: Services import other services as needed
- **Error Handling**: Consistent error patterns across all services
- **Testing**: Each service has corresponding test files in `__tests__/`

## Frontend Structure (`src/`)

### Main Application
```
src/
├── App.tsx                         # Main React application
├── index.js                        # Application entry point
├── components/                     # Reusable UI components
│   ├── [Feature]/                  # Feature-specific components
│   │   ├── [Component].tsx         # Individual components
│   │   └── __tests__/              # Component tests
│   ├── common/                     # Shared UI components
│   └── layout/                     # Layout components
├── pages/                          # Page-level components
├── services/                       # Frontend business logic
│   ├── [Service].ts                # Service classes
│   ├── __tests__/                  # Service tests
│   └── [feature]/                  # Feature-specific services
├── types/                          # TypeScript type definitions
│   ├── index.ts                    # Main type exports
│   ├── [feature].ts                # Feature-specific types
│   └── shared/                     # Cross-platform shared types
├── shared/                         # Cross-platform shared code
│   └── types/                      # Shared TypeScript definitions
├── gateway/                        # API Gateway implementation
├── integration/                    # System integration layer
├── testing/                        # Testing framework
├── deployment/                     # Deployment utilities
└── portal/                         # Portal-specific implementation
    ├── src/                        # Portal source code
    ├── components/                 # Portal components
    └── package.json                # Portal dependencies
```

## Mobile Structure (`mobile/`)

### React Native Application
```
mobile/
├── src/
│   ├── App.tsx                     # Main mobile app
│   ├── screens/                    # Screen components
│   ├── components/                 # Mobile-specific components
│   ├── services/                   # Mobile services
│   ├── contexts/                   # React contexts
│   └── navigation/                 # Navigation configuration
├── lib/                            # Native library integrations
├── android/                        # Android-specific code
├── ios/                            # iOS-specific code (when added)
└── package.json                    # Mobile dependencies
```

## Configuration & Infrastructure

### Kiro AI Configuration (`.kiro/`)
```
.kiro/
├── steering/                       # AI assistant guidance
│   ├── product.md                  # Product overview
│   ├── tech.md                     # Technology stack
│   ├── structure.md                # Project structure
│   └── [custom-rules].md           # Custom development rules
├── specs/                          # Feature specifications
│   ├── [feature-spec]/             # Individual feature specs
│   │   ├── requirements.md         # Feature requirements
│   │   ├── design.md               # Technical design
│   │   └── tasks.md                # Implementation tasks
│   └── MASTER_*.md                 # Master planning documents
└── settings/                       # Kiro settings
```

### Deployment & Operations
```
k8s/                                # Kubernetes manifests
├── namespace.yaml                  # Namespace definition
├── backend-deployment.yaml         # Backend deployment
├── frontend-deployment.yaml        # Frontend deployment
├── ingress.yaml                    # Ingress configuration
└── [service].yaml                  # Service-specific configs

scripts/                            # Automation scripts
├── deploy-production.sh            # Production deployment
└── validate-production-readiness.ts # Production validation

.github/workflows/                  # CI/CD pipelines
└── production-deploy.yml           # Production deployment workflow
```

## Key Architectural Patterns

### Microservices Architecture
- **API Gateway**: Central routing and authentication (`src/gateway/`)
- **Service Discovery**: Dynamic service registration and discovery
- **Independent Services**: Backend services can be deployed independently
- **Shared Types**: Common TypeScript interfaces in `src/shared/types/`

### Domain-Driven Design
- **Feature Folders**: Related code grouped by business domain
- **Service Layer**: Business logic separated from API routes
- **Type Safety**: Comprehensive TypeScript interfaces for all domains

### Testing Strategy
- **Unit Tests**: Individual component and service testing
- **Integration Tests**: Cross-service interaction testing
- **E2E Tests**: Full user journey testing
- **Quality Assurance**: Dedicated testing framework in `backend/src/services/testing/`

## Critical Development Rules

### Service Layer Requirements
- All business logic MUST be in `src/services/` with single responsibility
- Services MUST export default class with explicit TypeScript return types
- Database operations EXCLUSIVELY through Prisma ORM - no raw SQL
- All services require error handling and structured logging via `backend/src/utils/logger.ts`

### Type Safety Standards
- Strict TypeScript mode mandatory - NEVER use `any` type
- All functions require explicit return types: `function name(): ReturnType`
- Import types from `src/types/` and `src/shared/types/` directories
- Define interfaces for all data structures before implementation

### Configuration Management
- Zero hardcoding policy - use environment variables with fallbacks
- Configuration patterns in `backend/src/config/` directory
- Reference `.env.example` for required variables
- Use `process.env.VARIABLE_NAME || 'fallback'` pattern consistently

## File Naming Conventions

### TypeScript Files
- **Components**: PascalCase (e.g., `UserDashboard.tsx`)
- **Services**: PascalCase with Service suffix (e.g., `CourseService.ts`)
- **Types**: kebab-case for files, PascalCase for interfaces (e.g., `user-types.ts`)
- **Tests**: Same name as source with `.test.ts` suffix in `__tests__/` directories

### Directories
- **Feature Directories**: kebab-case (e.g., `spiritual-formation/`)
- **Component Directories**: PascalCase (e.g., `UserManagement/`)
- **Service Directories**: camelCase (e.g., `admissions/`)

### API and Route Conventions
- **REST Endpoints**: Follow RESTful conventions (GET, POST, PUT, DELETE)
- **Response Format**: Consistent `{ success: boolean, data?: any, error?: string }`
- **Route Files**: kebab-case in `backend/src/routes/` (e.g., `spiritual-formation.ts`)
- **Middleware**: camelCase in `backend/src/middleware/` (e.g., `auth.ts`)

## Import Path Conventions

### TypeScript Path Mapping
```typescript
// Configured in tsconfig.json
"@/*": ["src/*"]
"@shared/*": ["src/shared/*"]
"@components/*": ["src/components/*"]
"@services/*": ["src/services/*"]
"@types/*": ["src/types/*"]
```

### Import Patterns
```typescript
// Absolute imports for src/ files
import { UserService } from '@services/UserService';
import { User } from '@types/user';

// Relative imports for same directory
import { validateInput } from './validation';
```

## Spiritual Integration Requirements

### Course Content Standards
- All courses MUST include: modules, lectures, notes, videos, assessments
- Spiritual formation integration in every component
- Use `SpiritualAlignmentValidator` for content validation
- Cultural sensitivity via `CulturalAdaptationService`

### Service Integration
- `SpiritualGrowthService` for spiritual formation tracking
- `PropheticIntelligenceService` for divine guidance integration
- `ScrollCoinService` for kingdom economy rewards
- All AI content validated through `AIResponseValidator`

## Environment-Specific Structure

### Development
- Hot reload enabled for all platforms
- Mock services for external dependencies
- Detailed logging and debugging tools
- Local database and Redis instances

### Production
- Optimized builds with minification
- Clustered backend services
- Production logging and monitoring
- External managed services (database, cache, etc.)

## Cross-Platform Considerations

### Shared Code
- **Types**: Shared TypeScript interfaces in `src/shared/types/`
- **Services**: Platform-agnostic business logic in `src/services/`
- **Utilities**: Common helper functions

### Platform-Specific
- **Web**: React components with DOM-specific features
- **Mobile**: React Native components in `mobile/src/`
- **API**: Express.js backend serving all platforms

## Error Handling and Security

### Error Management
- Centralized error handling via `backend/src/middleware/errorHandler.ts`
- Structured logging through `backend/src/utils/logger.ts`
- Custom error classes extending Error with status codes
- Production monitoring hooks for debugging

### Security Standards
- Role-based access control (RBAC) via `backend/src/middleware/auth.ts`
- GDPR and FERPA compliance mandatory for all data handling
- Use `DataPrivacyComplianceService` for privacy operations
- Audit trails for all critical user actions
- Encrypt sensitive data at rest and in transit

## Database and Migration Patterns

### Prisma ORM Usage
- All database operations through Prisma - no raw SQL queries
- Schema changes via Alembic migrations in `backend/alembic/`
- Seed data in `backend/prisma/seeds/`
- Connection pooling and optimization for production

### Migration Workflow
1. Update `backend/prisma/schema.prisma`
2. Generate migration: `npm run migrate`
3. Update seed data if needed
4. Test migration in development
5. Deploy to production with validation