# Academic Year Automation System - Developer Documentation

## Overview

This documentation provides comprehensive technical guidance for developers working on the Scroll University Academic Year Automation System (SU-AYAS). It covers architecture, development setup, coding standards, testing, and deployment procedures.

---

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Architecture Overview](#architecture-overview)
3. [Code Structure](#code-structure)
4. [Development Workflow](#development-workflow)
5. [API Development](#api-development)
6. [Service Layer](#service-layer)
7. [Database Schema](#database-schema)
8. [Testing](#testing)
9. [AI Agent Integration](#ai-agent-integration)
10. [Frontend Development](#frontend-development)
11. [Deployment](#deployment)
12. [Best Practices](#best-practices)

---

## Development Environment Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Git
- VS Code (recommended) or your preferred IDE
- Docker Desktop (optional, for containerized development)

### Initial Setup

#### 1. Clone Repository

```bash
git clone https://github.com/scrolluniversity/su-ayas.git
cd su-ayas
```

#### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 3. Configure Environment

Create `.env` file in backend directory:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/suayas_dev
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=dev-secret-key-change-in-production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# AI Services
OPENAI_API_KEY=your-openai-key
AI_MODEL=gpt-4

# Development
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

#### 4. Database Setup

```bash
cd backend

# Run migrations
npm run migrate

# Seed development data
npm run seed:dev
```

#### 5. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Redis (if not running as service)
redis-server
```

### IDE Configuration

#### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Prisma
- GitLens
- REST Client
- Docker

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Architecture Overview

### System Architecture

SU-AYAS follows a microservices architecture with event-driven communication:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React)                    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              API Gateway & Authentication Layer              │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Workflow Orchestration Layer                │
│  Event Bus | Workflow Engine | Notification Service         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│   Academic     │  │    Student      │  │    Faculty &    │
│   Calendar     │  │   Lifecycle     │  │    Teaching     │
│    Engine      │  │    Engine       │  │   Operations    │
└────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Course Execution │
                    │      Engine       │
                    └───────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  ScrollRegistrar│  │ ScrollProfessor │  │   ScrollTutor   │
│     Agent      │  │     Agent       │  │     Agent       │
└────────────────┘  └─────────────────┘  └─────────────────┘
```

### Technology Stack

**Backend:**
- Node.js with TypeScript
- Express.js for REST API
- Prisma ORM for database access
- Redis for caching and sessions
- Joi for validation

**Frontend:**
- React 19 with TypeScript
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling

**Database:**
- PostgreSQL 14+ via Supabase
- Row-Level Security (RLS)
- Real-time subscriptions

**AI Integration:**
- OpenAI GPT-4
- Custom AI agents (ScrollProfessor, ScrollTutor, ScrollExaminer)

---

## Code Structure

### Backend Structure

```
backend/
├── src/
│   ├── index.ts                    # Main server entry point
│   ├── routes/                     # API route handlers
│   │   ├── academic-calendar.ts
│   │   ├── student-lifecycle.ts
│   │   ├── faculty-operations.ts
│   │   ├── course-execution.ts
│   │   └── workflow-notifications.ts
│   ├── services/                   # Business logic services
│   │   └── academic-year/
│   │       ├── AcademicCalendarService.ts
│   │       ├── EventSchedulerService.ts
│   │       ├── AdmissionService.ts
│   │       ├── RegistrationService.ts
│   │       ├── GraduationService.ts
│   │       ├── TeachingLoadService.ts
│   │       ├── ContentGenerationService.ts
│   │       ├── GradingAutomationService.ts
│   │       ├── ModuleSequencerService.ts
│   │       ├── WorkflowEngineService.ts
│   │       ├── ScrollRegistrarAgent.ts
│   │       ├── ScrollProfessorAgent.ts
│   │       ├── ScrollTutorAgent.ts
│   │       ├── ScrollExaminerAgent.ts
│   │       └── ScrollSchedulerAgent.ts
│   ├── middleware/                 # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── inputValidation.ts
│   ├── types/                      # TypeScript type definitions
│   │   └── academic-year.types.ts
│   ├── utils/                      # Utility functions
│   │   ├── logger.ts
│   │   └── eventBus.ts
│   └── __tests__/                  # Test files
│       ├── integration/
│       └── unit/
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Database migrations
└── package.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── App.tsx                     # Main application component
│   ├── components/                 # Reusable components
│   │   ├── academic-calendar/
│   │   ├── student-portal/
│   │   ├── faculty-dashboard/
│   │   └── admin/
│   ├── pages/                      # Page components
│   ├── services/                   # API service layer
│   │   ├── academicCalendarService.ts
│   │   ├── studentPortalService.ts
│   │   └── facultyDashboardService.ts
│   ├── types/                      # TypeScript types
│   ├── hooks/                      # Custom React hooks
│   └── contexts/                   # React contexts
└── package.json
```

---

## Development Workflow

### Git Workflow

We follow Git Flow branching strategy:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Production hotfixes

#### Creating a Feature Branch

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/add-semester-scheduling

# Make changes and commit
git add .
git commit -m "feat: add semester scheduling functionality"

# Push to remote
git push origin feature/add-semester-scheduling

# Create pull request on GitHub
```

### Commit Message Convention

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(calendar): add semester generation logic

Implement automatic semester generation based on calendar type.
Supports semester, trimester, and quarter systems.

Closes #123
```

### Code Review Process

1. Create pull request with clear description
2. Ensure all tests pass
3. Request review from team members
4. Address review comments
5. Obtain approval from at least 2 reviewers
6. Merge to develop branch

---

## API Development

### Creating a New Endpoint

#### 1. Define Route

Create or update route file in `src/routes/`:

```typescript
// src/routes/academic-calendar.ts
import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import AcademicCalendarService from '../services/academic-year/AcademicCalendarService';

const router = express.Router();
const service = new AcademicCalendarService();

router.post('/years', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await service.createAcademicYear(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

#### 2. Add Validation

Use Joi for request validation:

```typescript
import Joi from 'joi';

const createAcademicYearSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  calendarType: Joi.string().valid('semester', 'trimester', 'quarter').required()
});

router.post('/years', authenticate, async (req: Request, res: Response) => {
  const { error, value } = createAcademicYearSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }
  
  // Process request...
});
```

#### 3. Register Route

Register route in main server file:

```typescript
// src/index.ts
import academicCalendarRoutes from './routes/academic-calendar';

app.use('/api/academic-calendar', academicCalendarRoutes);
```

### API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": ["Additional error details"]
}
```

---

## Service Layer

### Creating a Service

Services contain business logic and should be independent of HTTP concerns.

#### Service Template

```typescript
// src/services/academic-year/ExampleService.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

export class ExampleService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async performOperation(params: OperationParams): Promise<ServiceResult> {
    try {
      logger.info('Performing operation', { params });

      // Business logic here
      const result = await this.prisma.entity.create({
        data: params
      });

      logger.info('Operation completed', { resultId: result.id });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error('Operation failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default ExampleService;
```

### Service Best Practices

1. **Single Responsibility**: Each service handles one domain area
2. **Dependency Injection**: Pass dependencies via constructor
3. **Error Handling**: Always catch and log errors
4. **Logging**: Log important operations and errors
5. **Type Safety**: Use TypeScript interfaces for all parameters and returns
6. **Testing**: Write unit tests for all service methods

---

## Database Schema

### Prisma Schema

Database schema is defined in `prisma/schema.prisma`:

```prisma
model AcademicYear {
  id           String   @id @default(uuid())
  name         String
  startDate    DateTime
  endDate      DateTime
  calendarType String
  isActive     Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  semesters    Semester[]
  events       AcademicEvent[]

  @@map("academic_years")
}

model Semester {
  id                  String   @id @default(uuid())
  academicYearId      String
  name                String
  semesterType        String
  startDate           DateTime
  endDate             DateTime
  registrationStart   DateTime
  registrationEnd     DateTime
  addDropDeadline     DateTime
  withdrawalDeadline  DateTime
  finalExamsStart     DateTime
  finalExamsEnd       DateTime
  gradesDue           DateTime
  isActive            Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  academicYear        AcademicYear @relation(fields: [academicYearId], references: [id])

  @@map("semesters")
}
```

### Creating Migrations

```bash
# Create migration
npx prisma migrate dev --name add_semester_table

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Database Queries

Use Prisma Client for all database operations:

```typescript
// Create
const academicYear = await prisma.academicYear.create({
  data: {
    name: 'Academic Year 2024-2025',
    startDate: new Date('2024-08-15'),
    endDate: new Date('2025-05-31'),
    calendarType: 'semester'
  }
});

// Read
const academicYears = await prisma.academicYear.findMany({
  where: { isActive: true },
  include: { semesters: true }
});

// Update
const updated = await prisma.academicYear.update({
  where: { id: 'uuid' },
  data: { isActive: true }
});

// Delete
await prisma.academicYear.delete({
  where: { id: 'uuid' }
});
```

---

## Testing

### Test Structure

```
backend/src/__tests__/
├── integration/
│   ├── academic-calendar-api.integration.test.ts
│   ├── student-lifecycle-api.integration.test.ts
│   └── workflow-orchestration.integration.test.ts
├── unit/
│   ├── AcademicCalendarService.test.ts
│   ├── RegistrationService.test.ts
│   └── WorkflowEngineService.test.ts
└── property/
    ├── CalendarDateConsistency.property.test.ts
    └── PrerequisiteEnforcement.property.test.ts
```

### Unit Testing

Use Jest for unit testing:

```typescript
// src/services/__tests__/AcademicCalendarService.test.ts
import AcademicCalendarService from '../AcademicCalendarService';

describe('AcademicCalendarService', () => {
  let service: AcademicCalendarService;

  beforeEach(() => {
    service = new AcademicCalendarService();
  });

  describe('createAcademicYear', () => {
    it('should create academic year with valid data', async () => {
      const params = {
        name: 'Academic Year 2024-2025',
        startDate: new Date('2024-08-15'),
        endDate: new Date('2025-05-31'),
        calendarType: 'semester' as const
      };

      const result = await service.createAcademicYear(params);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data?.name).toBe(params.name);
    });

    it('should reject invalid date range', async () => {
      const params = {
        name: 'Invalid Year',
        startDate: new Date('2025-05-31'),
        endDate: new Date('2024-08-15'),
        calendarType: 'semester' as const
      };

      const result = await service.createAcademicYear(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain('End date must be after start date');
    });
  });
});
```

### Integration Testing

Test API endpoints end-to-end:

```typescript
// src/__tests__/integration/academic-calendar-api.integration.test.ts
import request from 'supertest';
import app from '../../index';

describe('Academic Calendar API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    authToken = response.body.data.token;
  });

  describe('POST /api/academic-calendar/years', () => {
    it('should create academic year', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/years')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Academic Year 2024-2025',
          startDate: '2024-08-15',
          endDate: '2025-05-31',
          calendarType: 'semester'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });
  });
});
```

### Property-Based Testing

Test correctness properties using fast-check:

```typescript
// src/services/__tests__/CalendarDateConsistency.property.test.ts
import fc from 'fast-check';
import AcademicCalendarService from '../AcademicCalendarService';

describe('Property: Calendar Date Consistency', () => {
  it('all semester dates must fall within academic year dates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.date(),
        fc.integer({ min: 180, max: 365 }),
        async (startDate, duration) => {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + duration);

          const service = new AcademicCalendarService();
          const result = await service.createAcademicYear({
            name: 'Test Year',
            startDate,
            endDate,
            calendarType: 'semester'
          });

          if (result.success && result.data) {
            const semesters = await service.getSemestersByAcademicYear(result.data.id);
            
            for (const semester of semesters.data || []) {
              expect(semester.startDate >= startDate).toBe(true);
              expect(semester.endDate <= endDate).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test AcademicCalendarService.test.ts

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration

# Run property tests only
npm run test:property
```

---

*Continued in next section...*

## AI Agent Integration

### AI Agent Architecture

AI agents are specialized services that use OpenAI GPT-4 to perform domain-specific tasks.

#### Agent Types

1. **ScrollRegistrar**: Admission processing, transcript generation
2. **ScrollProfessor**: Content generation, lecture planning
3. **ScrollTutor**: Personalized tutoring, practice problems
4. **ScrollExaminer**: Assessment creation, automated grading
5. **ScrollScheduler**: Teaching load optimization, scheduling

### Creating an AI Agent

#### Agent Template

```typescript
// src/services/academic-year/ScrollExampleAgent.ts
import { AIGatewayService } from '../AIGatewayService';
import { logger } from '../../utils/logger';

export class ScrollExampleAgent {
  private aiGateway: AIGatewayService;

  constructor() {
    this.aiGateway = new AIGatewayService();
  }

  async performTask(params: TaskParams): Promise<AgentResult> {
    try {
      logger.info('ScrollExample agent starting task', { params });

      // Construct prompt
      const prompt = this.buildPrompt(params);

      // Call AI service
      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are ScrollExample, an AI agent specialized in...'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 2000
      });

      // Parse and validate response
      const result = this.parseResponse(response);

      logger.info('ScrollExample agent completed task', { resultId: result.id });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error('ScrollExample agent failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  private buildPrompt(params: TaskParams): string {
    return `
      Task: ${params.task}
      Context: ${params.context}
      Requirements: ${params.requirements}
      
      Please provide a detailed response that includes...
    `;
  }

  private parseResponse(response: string): ParsedResult {
    // Parse AI response
    // Validate structure
    // Return typed result
  }
}

export default ScrollExampleAgent;
```

### AI Agent Best Practices

1. **Clear System Prompts**: Define agent role and capabilities
2. **Structured Prompts**: Use consistent prompt templates
3. **Response Validation**: Always validate AI responses
4. **Error Handling**: Handle API failures gracefully
5. **Logging**: Log all AI interactions for debugging
6. **Cost Management**: Monitor token usage
7. **Spiritual Alignment**: Include biblical principles in prompts

### Example: ScrollProfessor Agent

```typescript
async generateLecturePlan(request: LecturePlanRequest): Promise<ServiceResult<LecturePlan>> {
  const prompt = `
    You are ScrollProfessor, an AI teaching assistant for Scroll University.
    
    Generate a comprehensive lecture plan for:
    Course: ${request.courseId}
    Module: ${request.moduleTitle}
    Duration: ${request.duration} minutes
    Learning Objectives:
    ${request.learningObjectives.map(obj => `- ${obj}`).join('\n')}
    
    Include:
    1. Detailed outline with timing
    2. Teaching notes and tips
    3. Discussion questions
    4. Scripture integration points
    5. Assessment suggestions
    
    Format as JSON with structure:
    {
      "outline": [...],
      "teachingNotes": "...",
      "discussionQuestions": [...],
      "scriptureIntegration": [...],
      "assessmentSuggestions": [...]
    }
  `;

  const response = await this.aiGateway.generateCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are ScrollProfessor...' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    maxTokens: 2000
  });

  return this.parseLecturePlan(response);
}
```

---

## Frontend Development

### Component Structure

#### Component Template

```typescript
// src/components/academic-calendar/CalendarCreationForm.tsx
import React, { useState } from 'react';
import { useAcademicCalendar } from '../../hooks/useAcademicCalendar';

interface CalendarCreationFormProps {
  onSuccess?: (academicYear: AcademicYear) => void;
  onCancel?: () => void;
}

export const CalendarCreationForm: React.FC<CalendarCreationFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    calendarType: 'semester'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createAcademicYear, loading } = useAcademicCalendar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit form
    const result = await createAcademicYear(formData);
    if (result.success) {
      onSuccess?.(result.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Academic Year Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      {/* Additional form fields... */}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          {loading ? 'Creating...' : 'Create Academic Year'}
        </button>
      </div>
    </form>
  );
};
```

### Custom Hooks

#### API Hook Template

```typescript
// src/hooks/useAcademicCalendar.ts
import { useState, useCallback } from 'react';
import { academicCalendarService } from '../services/academicCalendarService';

export const useAcademicCalendar = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAcademicYear = useCallback(async (data: CreateAcademicYearData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await academicCalendarService.createAcademicYear(data);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAcademicYears = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await academicCalendarService.getAcademicYears();
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createAcademicYear,
    getAcademicYears,
    loading,
    error
  };
};
```

### Service Layer (Frontend)

```typescript
// src/services/academicCalendarService.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class AcademicCalendarService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async createAcademicYear(data: CreateAcademicYearData) {
    const response = await axios.post(
      `${API_BASE_URL}/academic-calendar/years`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getAcademicYears() {
    const response = await axios.get(
      `${API_BASE_URL}/academic-calendar/years`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getAcademicYear(id: string) {
    const response = await axios.get(
      `${API_BASE_URL}/academic-calendar/years/${id}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }
}

export const academicCalendarService = new AcademicCalendarService();
```

---

## Deployment

### Build Process

#### Backend Build

```bash
cd backend

# Install dependencies
npm ci

# Run tests
npm test

# Build TypeScript
npm run build

# Output in dist/ directory
```

#### Frontend Build

```bash
cd frontend

# Install dependencies
npm ci

# Run tests
npm test

# Build for production
npm run build

# Output in build/ directory
```

### Docker Deployment

#### Dockerfile (Backend)

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=suayas
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment

#### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: su-ayas
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: scrolluniversity/su-ayas-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### CI/CD Pipeline

#### GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run tests
        run: |
          cd backend
          npm test
      
      - name: Run linter
        run: |
          cd backend
          npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: |
          docker build -t scrolluniversity/su-ayas-backend:${{ github.sha }} ./backend
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push scrolluniversity/su-ayas-backend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/backend backend=scrolluniversity/su-ayas-backend:${{ github.sha }} -n su-ayas
          kubectl rollout status deployment/backend -n su-ayas
```

---

## Best Practices

### Code Quality

#### TypeScript Best Practices

1. **Use Strict Mode**: Enable strict TypeScript checking
2. **Explicit Types**: Always define return types for functions
3. **Avoid Any**: Never use `any` type
4. **Interface Over Type**: Prefer interfaces for object shapes
5. **Const Assertions**: Use `as const` for literal types

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
}

function getUser(id: string): Promise<User> {
  // Implementation
}

// Bad
function getUser(id): any {
  // Implementation
}
```

#### Error Handling

```typescript
// Good: Specific error handling
try {
  const result = await service.performOperation();
  return result;
} catch (error) {
  if (error instanceof ValidationError) {
    logger.warn('Validation failed', { error: error.message });
    return { success: false, error: 'Invalid input' };
  } else if (error instanceof DatabaseError) {
    logger.error('Database error', { error: error.message });
    return { success: false, error: 'Database operation failed' };
  } else {
    logger.error('Unexpected error', { error });
    throw error;
  }
}

// Bad: Generic error handling
try {
  const result = await service.performOperation();
  return result;
} catch (error) {
  console.log(error);
  return null;
}
```

### Performance Optimization

#### Database Queries

```typescript
// Good: Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true
  },
  where: { isActive: true }
});

// Bad: Fetch all fields
const users = await prisma.user.findMany({
  where: { isActive: true }
});
```

#### Caching

```typescript
// Good: Cache frequently accessed data
async function getAcademicYear(id: string): Promise<AcademicYear> {
  const cacheKey = `academic_year:${id}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const academicYear = await prisma.academicYear.findUnique({
    where: { id }
  });
  
  // Store in cache
  await redis.setex(cacheKey, 3600, JSON.stringify(academicYear));
  
  return academicYear;
}
```

### Security Best Practices

1. **Input Validation**: Always validate user input
2. **SQL Injection**: Use parameterized queries (Prisma handles this)
3. **XSS Prevention**: Sanitize output in frontend
4. **CSRF Protection**: Use CSRF tokens for state-changing operations
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **Authentication**: Always verify JWT tokens
7. **Authorization**: Check user permissions before operations

### Logging Best Practices

```typescript
// Good: Structured logging with context
logger.info('User registered for course', {
  userId: user.id,
  courseId: course.id,
  semesterId: semester.id,
  timestamp: new Date().toISOString()
});

// Bad: Unstructured logging
console.log('User registered');
```

### Documentation

1. **Code Comments**: Explain why, not what
2. **JSDoc**: Document public APIs
3. **README**: Keep README up to date
4. **API Docs**: Document all endpoints
5. **Architecture Docs**: Maintain architecture diagrams

---

## Troubleshooting

### Common Development Issues

#### Database Connection Errors

```bash
# Check database is running
docker ps | grep postgres

# Test connection
psql -h localhost -U postgres -d suayas_dev

# Reset database
npm run db:reset
```

#### TypeScript Compilation Errors

```bash
# Clean build
rm -rf dist/
npm run build

# Check for type errors
npx tsc --noEmit
```

#### Test Failures

```bash
# Run specific test
npm test -- AcademicCalendarService.test.ts

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u
```

### Debugging

#### Backend Debugging

```typescript
// Add breakpoint in VS Code
// Or use debugger statement
debugger;

// Use logger for debugging
logger.debug('Variable value', { variable });
```

#### Frontend Debugging

```typescript
// React DevTools
// Chrome DevTools

// Console logging
console.log('Component rendered', { props, state });

// React error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
}
```

---

## Resources

### Documentation

- **TypeScript**: https://www.typescriptlang.org/docs/
- **Express.js**: https://expressjs.com/
- **Prisma**: https://www.prisma.io/docs/
- **React**: https://react.dev/
- **Jest**: https://jestjs.io/docs/getting-started

### Tools

- **Postman**: API testing
- **Prisma Studio**: Database GUI
- **Redis Commander**: Redis GUI
- **React DevTools**: React debugging

### Internal Resources

- **Wiki**: https://wiki.scrolluniversity.edu/suayas
- **API Docs**: https://api-docs.scrolluniversity.edu
- **Slack**: #suayas-dev

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Maintained By**: Development Team

*"Whatever you do, work heartily, as for the Lord and not for men." - Colossians 3:23*
