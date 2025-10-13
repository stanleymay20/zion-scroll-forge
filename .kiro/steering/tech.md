# ScrollUniversity Technology Stack

## Architecture
**Microservices Architecture** with API Gateway pattern, supporting multi-platform deployment (Web, Mobile, XR)

## Backend Stack

### Core Technologies
- **Runtime**: Node.js with TypeScript (strict mode)
- **Framework**: Express.js with middleware-based architecture
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis with clustering support
- **Authentication**: JWT with bcrypt password hashing

### Database & ORM
- **Prisma**: Primary ORM with migration management
- **PostgreSQL**: Production database with connection pooling
- **Redis**: Session storage, caching, and real-time features
- **Alembic**: Database migration management (Python-based)

### Blockchain Integration
- **Ethereum**: Smart contracts for credential verification
- **IPFS**: Decentralized document storage
- **Ethers.js**: Blockchain interaction library
- **OpenZeppelin**: Smart contract security standards

## Frontend Stack

### Web Application
- **React 19**: Main UI framework with hooks and context
- **TypeScript**: Strict typing with comprehensive interfaces
- **Tailwind CSS**: Utility-first styling framework
- **React Router**: Client-side routing and navigation

### Mobile Application
- **React Native 0.72**: Cross-platform mobile development
- **React Navigation**: Mobile navigation stack
- **AsyncStorage**: Local data persistence
- **SQLite**: Offline database storage

### State Management
- **React Context**: Global state management
- **Redux Toolkit**: Complex state management (where needed)
- **React Query**: Server state synchronization

## AI & Machine Learning

### AI Services
- **OpenAI GPT-4**: Primary AI model for tutoring and assessment
- **Claude 3**: Secondary AI for prophetic intelligence
- **Custom AI Models**: Specialized educational and spiritual guidance

### Integration
- **WebXR**: Immersive learning experiences
- **WebRTC**: Real-time communication for virtual classrooms
- **Socket.io**: Real-time messaging and notifications

## Development Tools

### Build System
- **TypeScript Compiler**: Strict compilation with path mapping
- **Webpack**: Module bundling (via React Scripts)
- **Metro**: React Native bundler
- **Babel**: JavaScript transpilation

### Testing Framework
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Supertest**: API endpoint testing
- **Cypress**: End-to-end testing (planned)

### Code Quality
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality gates
- **TypeScript**: Strict mode with comprehensive type checking

## Infrastructure & Deployment

### Containerization
- **Docker**: Multi-stage production builds
- **Docker Compose**: Local development environment
- **Kubernetes**: Production orchestration (planned)

### CI/CD
- **GitHub Actions**: Automated testing and deployment
- **Production Pipeline**: Security scanning, testing, building, deployment
- **Environment Management**: Development, staging, production

### Monitoring & Logging
- **Winston**: Structured logging with daily rotation
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards
- **Elasticsearch**: Log aggregation and search

## Common Commands

### Development Setup
```bash
# Full platform setup
npm run setup

# Start all services
npm run dev

# Start individual services
npm run dev:backend
npm run dev:frontend
npm run dev:mobile
npm run dev:gateway
```

### Database Management
```bash
# Backend database operations
cd backend
npm run db:setup          # Initialize database with migrations and seed
npm run migrate           # Run pending migrations
npm run generate          # Generate Prisma client
npm run seed              # Seed database with initial data
npm run db:reset          # Reset database (development only)
```

### Testing
```bash
# Run all tests
npm run test:backend
npm run test:frontend
npm run test:mobile

# Backend-specific testing
cd backend
npm test                  # Unit tests
npm run test:integration  # Integration tests
npm run test:coverage     # Coverage report
npm run test:ci          # CI pipeline tests
```

### Building & Deployment
```bash
# Build all platforms
npm run build:backend
npm run build:frontend
npm run build:mobile:android
npm run build:mobile:ios

# Production deployment
npm run validate:production
npm run deploy:production

# Docker operations
npm run docker:up
npm run docker:down
```

### Quality Assurance
```bash
# Backend quality checks
cd backend
npm run lint              # ESLint checking
npm run lint:fix          # Auto-fix linting issues
npm run format            # Prettier formatting
npm run type-check        # TypeScript validation
npm run security:audit    # Security vulnerability scan
```

### Admissions System
```bash
# Admissions-specific commands
cd backend
npm run admissions:setup     # Setup admissions infrastructure
npm run admissions:validate  # Validate admissions system
npm run qa:admissions       # Run quality assurance tests
npm run admissions:dev      # Start admissions service in dev mode
```

## Environment Configuration

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Authentication secret key
- `OPENAI_API_KEY`: AI services integration
- `BLOCKCHAIN_RPC_URL`: Ethereum network connection

### Development vs Production
- **Development**: Hot reload, detailed logging, mock services
- **Production**: Optimized builds, clustering, monitoring, security hardening

## Performance Considerations
- **Caching Strategy**: Redis for session data, HTTP caching for static assets
- **Database Optimization**: Connection pooling, query optimization, indexing
- **CDN Integration**: Static asset delivery optimization
- **Load Balancing**: Horizontal scaling with clustering support