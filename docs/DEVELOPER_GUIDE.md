# ScrollUniversity Developer Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Architecture Overview](#architecture-overview)
4. [Development Environment](#development-environment)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Database Management](#database-management)
8. [API Development](#api-development)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Introduction

Welcome to the ScrollUniversity developer documentation. This guide provides comprehensive information for developers
working on the ScrollUniversity platform - a revolutionary Christian educational platform combining divine revelation
with cutting-edge technology.

### Technology Stack

**Backend:**
- Node.js 20+ with TypeScript 5.8+
- Express.js for API server
- Prisma ORM with PostgreSQL
- Redis for caching and sessions
- Supabase for authentication and real-time features

**Frontend:**
- React 18.3+ with TypeScript
- Tailwind CSS for styling
- Shadcn UI component library
- TanStack Query for data fetching
- React Router for navigation

**Infrastructure:**
- Docker for containerization
- Kubernetes for orchestration
- GitHub Actions for CI/CD
- Prometheus/Grafana for monitoring


## Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 9 or higher
- **PostgreSQL**: Version 15 or higher
- **Redis**: Version 7 or higher
- **Git**: Latest version
- **Docker**: For containerized development (optional)

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/scrolluniversity/platform.git
   cd platform
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ..
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment templates
   cp backend/.env.example backend/.env
   cp .env.example .env
   
   # Edit .env files with your configuration
   ```

4. **Database Setup**
   ```bash
   cd backend
   npm run db:setup
   ```

5. **Start Development Servers**
   ```bash
   # From root directory
   npm run dev
   
   # Or start individually
   npm run dev:backend  # Backend on port 3000
   npm run dev:frontend # Frontend on port 5173
   ```


## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Web Application │         │   Mobile PWA     │         │
│  │  React + TypeScript        │  Responsive      │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│              Express.js + Rate Limiting + Auth               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Auth   │ │  Course  │ │ AI Tutor │ │ Payment  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Spiritual │ │Community │ │Analytics │ │ScrollCoin│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │  Redis Cache │  │ File Storage │     │
│  │   Supabase   │  │   Sessions   │  │   Supabase   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ OpenAI   │ │  Stripe  │ │Ethereum  │ │  D-ID    │      │
│  │ GPT-4o+  │ │ Payments │ │ScrollCoin│ │  Avatar  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
ScrollUniversity/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration management
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   ├── prisma/             # Database schema and migrations
│   └── tests/              # Backend tests
├── src/                    # React frontend application
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── services/           # Frontend services
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React contexts
│   └── types/              # TypeScript types
├── docs/                   # Documentation
├── k8s/                    # Kubernetes manifests
└── scripts/                # Build and deployment scripts
```


## Development Environment

### Environment Variables

**Backend (.env):**
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/scrolluniversity"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-key"

# OpenAI
OPENAI_API_KEY="sk-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Blockchain
ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/..."
ETHEREUM_PRIVATE_KEY="your-private-key"

# Video Avatar
DID_API_KEY="your-did-api-key"

# Environment
NODE_ENV="development"
PORT=3000
```

**Frontend (.env):**
```bash
VITE_API_URL="http://localhost:3000/api"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Development Tools

**Recommended VS Code Extensions:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Prisma
- Tailwind CSS IntelliSense
- GitLens
- Docker

**Recommended Browser Extensions:**
- React Developer Tools
- Redux DevTools
- Supabase DevTools


## Backend Development

### Service Layer Architecture

All business logic must be implemented in service classes located in `backend/src/services/`.

**Service Structure:**
```typescript
// backend/src/services/ExampleService.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export default class ExampleService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getData(id: string): Promise<DataType> {
    try {
      const data = await this.prisma.example.findUnique({
        where: { id }
      });
      
      if (!data) {
        throw new Error('Data not found');
      }
      
      return data;
    } catch (error) {
      logger.error('Error fetching data:', error);
      throw error;
    }
  }
}
```

**Key Principles:**
- Single Responsibility: Each service handles one domain
- Dependency Injection: Services import other services as needed
- Error Handling: Comprehensive try-catch blocks
- Logging: Use Winston logger for all operations
- Type Safety: Explicit return types for all methods

### API Route Development

Routes are defined in `backend/src/routes/` and handle HTTP requests.

**Route Structure:**
```typescript
// backend/src/routes/example.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import ExampleService from '../services/ExampleService';

const router = express.Router();
const exampleService = new ExampleService();

// GET /api/example/:id
router.get('/:id', 
  authenticate,
  authorize(['STUDENT', 'FACULTY', 'ADMIN']),
  async (req, res) => {
    try {
      const data = await exampleService.getData(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

export default router;
```

**Best Practices:**
- Use middleware for authentication and authorization
- Validate input using express-validator
- Return consistent response format
- Handle errors gracefully
- Document endpoints with JSDoc comments


### Middleware Development

Middleware functions process requests before they reach route handlers.

**Common Middleware:**

1. **Authentication Middleware** (`backend/src/middleware/auth.ts`):
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};
```

2. **Authorization Middleware** (`backend/src/middleware/rbac.ts`):
```typescript
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }
    next();
  };
};
```

3. **Validation Middleware**:
```typescript
import { body, validationResult } from 'express-validator';

export const validateCourseCreation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('faculty').isIn(['THEOLOGY', 'BUSINESS', 'TECHNOLOGY'])
    .withMessage('Invalid faculty'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];
```


## Frontend Development

### Component Development

Components are built using React with TypeScript and follow a consistent structure.

**Component Structure:**
```typescript
// src/components/example/ExampleComponent.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ExampleComponentProps {
  title: string;
  onAction?: () => void;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({ 
  title, 
  onAction 
}) => {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/example');
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
};
```

**Best Practices:**
- Use TypeScript interfaces for props
- Implement proper loading and error states
- Use Shadcn UI components for consistency
- Follow Tailwind CSS utility-first approach
- Extract reusable logic into custom hooks

### Custom Hooks

Create custom hooks for reusable logic in `src/hooks/`.

**Example Hook:**
```typescript
// src/hooks/useApi.ts
import { useState, useEffect } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useApi<T>(url: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}
```


## Database Management

### Prisma Schema

The database schema is defined in `backend/prisma/schema.prisma`.

**Example Model:**
```prisma
model Course {
  id          String   @id @default(uuid())
  title       String
  description String
  faculty     Faculty
  instructorId String
  instructor  User     @relation(fields: [instructorId], references: [id])
  
  modules     Module[]
  enrollments Enrollment[]
  
  scrollCoinCost Int
  usdPrice      Decimal
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([faculty])
  @@index([instructorId])
}
```

### Migrations

**Creating a Migration:**
```bash
cd backend
npm run migrate:dev -- --name add_course_rating
```

**Applying Migrations:**
```bash
# Development
npm run migrate:dev

# Production
npm run migrate:deploy
```

**Rolling Back:**
```bash
# Rollback last migration
npm run migrate:rollback
```

### Seeding Data

Seed data is defined in `backend/prisma/seed.ts`.

**Example Seed:**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@scrolluniversity.org',
      name: 'Admin User',
      role: 'ADMIN',
      password: 'hashed_password_here'
    }
  });

  // Create sample course
  await prisma.course.create({
    data: {
      title: 'Introduction to Biblical Studies',
      description: 'Comprehensive introduction to Bible study',
      faculty: 'THEOLOGY',
      instructorId: admin.id,
      scrollCoinCost: 500,
      usdPrice: 49.99
    }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Running Seeds:**
```bash
npm run seed
```


## Testing

### Unit Tests

Unit tests are written using Jest and located in `__tests__` directories.

**Example Service Test:**
```typescript
// backend/src/services/__tests__/CourseService.test.ts
import CourseService from '../CourseService';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');

describe('CourseService', () => {
  let courseService: CourseService;
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    courseService = new CourseService();
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  describe('getCourse', () => {
    it('should return course when found', async () => {
      const mockCourse = {
        id: '123',
        title: 'Test Course',
        description: 'Test Description'
      };

      prisma.course.findUnique.mockResolvedValue(mockCourse);

      const result = await courseService.getCourse('123');

      expect(result).toEqual(mockCourse);
      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { id: '123' }
      });
    });

    it('should throw error when course not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(courseService.getCourse('123'))
        .rejects
        .toThrow('Course not found');
    });
  });
});
```

**Running Tests:**
```bash
# Run all tests
npm test

# Run specific test file
npm test CourseService.test.ts

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Integration Tests

Integration tests verify API endpoints work correctly.

**Example API Test:**
```typescript
// backend/src/__tests__/integration/courses.test.ts
import request from 'supertest';
import app from '../../index';

describe('Course API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login and get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    authToken = response.body.data.accessToken;
  });

  describe('GET /api/courses', () => {
    it('should return list of courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.courses)).toBe(true);
    });
  });

  describe('POST /api/courses', () => {
    it('should create new course', async () => {
      const courseData = {
        title: 'New Course',
        description: 'Course description',
        faculty: 'THEOLOGY'
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(courseData.title);
    });
  });
});
```


## Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
npm run build
# Output in dist/ directory
```

### Docker Deployment

**Build Docker Images:**
```bash
# Backend
docker build -t scrolluniversity-backend:latest -f backend/Dockerfile .

# Frontend
docker build -t scrolluniversity-frontend:latest -f Dockerfile .
```

**Run with Docker Compose:**
```bash
docker-compose up -d
```

### Kubernetes Deployment

**Apply Manifests:**
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

**Check Deployment:**
```bash
kubectl get pods -n scrolluniversity
kubectl logs -f deployment/scrolluniversity-backend -n scrolluniversity
```

### CI/CD Pipeline

The platform uses GitHub Actions for automated deployment.

**Workflow Triggers:**
- Push to `main` branch: Deploy to production
- Push to `develop` branch: Deploy to staging
- Pull requests: Run tests only

**Pipeline Steps:**
1. Checkout code
2. Install dependencies
3. Run linting
4. Run tests
5. Build Docker images
6. Push to container registry
7. Deploy to Kubernetes
8. Run smoke tests
9. Notify team

---

## Best Practices

### Code Style

**TypeScript:**
- Use strict mode
- Explicit return types for all functions
- No `any` types
- Prefer interfaces over types
- Use const for immutable values

**Naming Conventions:**
- PascalCase for classes and components
- camelCase for variables and functions
- UPPER_SNAKE_CASE for constants
- kebab-case for file names

**Comments:**
- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up to date
- Remove commented-out code

### Security

**Never Commit:**
- API keys or secrets
- Database credentials
- Private keys
- User data

**Always:**
- Use environment variables
- Validate all input
- Sanitize user content
- Implement rate limiting
- Use HTTPS in production
- Keep dependencies updated

### Performance

**Backend:**
- Use database indexes
- Implement caching with Redis
- Use connection pooling
- Optimize database queries
- Implement pagination

**Frontend:**
- Code splitting
- Lazy loading
- Image optimization
- Minimize bundle size
- Use CDN for static assets

---

## Troubleshooting

### Common Development Issues

**Issue: Database Connection Failed**
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

**Issue: Redis Connection Failed**
```bash
# Check Redis is running
redis-cli PING

# Should return PONG
```

**Issue: Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Issue: Module Not Found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: TypeScript Errors**
```bash
# Regenerate Prisma client
cd backend
npm run generate

# Check TypeScript configuration
npx tsc --noEmit
```

---

## Additional Resources

- [API Documentation](./api/openapi.yaml)
- [Architecture Documentation](./ARCHITECTURE.md)
- [User Guide](./USER_GUIDE.md)
- [Admin Manual](./ADMIN_MANUAL.md)
- [Operations Runbook](../backend/docs/OPERATIONS_RUNBOOK.md)

---

*Last Updated: December 2024*
*Version: 1.0.0*

