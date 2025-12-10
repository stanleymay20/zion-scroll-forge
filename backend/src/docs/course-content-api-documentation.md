# Course Content Creation System - API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Endpoints](#api-endpoints)
4. [Workflow Phases](#workflow-phases)
5. [Quality Checklist](#quality-checklist)
6. [Budget & Resource Management](#budget--resource-management)
7. [Course Constitution Compliance](#course-constitution-compliance)
8. [Rigor Level Standards](#rigor-level-standards)
9. [Spiritual Alignment Validation](#spiritual-alignment-validation)
10. [Scroll Pedagogy](#scroll-pedagogy)
11. [Real-World Deployment](#real-world-deployment)
12. [Error Handling](#error-handling)
13. [User Guides](#user-guides)

## Overview

The Course Content Creation System is a comprehensive platform for developing world-class educational content at ScrollUniversity. It orchestrates the entire course development lifecycle from initial planning through production, quality assurance, pilot testing, and continuous improvement.

### Key Features

- **Structured Workflow**: Multi-phase development process with approval gates
- **Video Production**: Professional video recording, editing, captioning, and streaming optimization
- **Written Materials**: AI-assisted lecture notes, PDF generation, and resource curation
- **Assessment Design**: Multi-modal assessments with AI-generated question banks
- **Spiritual Integration**: Biblical foundation and theological accuracy validation
- **Quality Assurance**: 50-point checklist benchmarked to elite global institutions
- **Real-World Deployment**: Practical application pathways and outcome tracking
- **Course Constitution**: Minimum standards enforcement for structure and depth
- **Rigor Enforcement**: Benchmarking against top-tier universities
- **Spiritual Alignment**: Multi-point validation with strictness profiles
- **Scroll Pedagogy**: 6-step lesson flow and Revelation Learning Model

### Architecture

The system follows a microservices architecture with the following layers:

- **Presentation Layer**: Course Builder UI, Review Dashboard, Analytics Portal
- **API Gateway Layer**: Authentication, Rate Limiting, Routing
- **Business Logic Layer**: Workflow, Production, Quality, Content, Assessment, Spiritual Services
- **Data Access Layer**: Prisma ORM, Redis Cache, File Storage, Vector DB
- **Infrastructure Layer**: PostgreSQL, Redis, S3/CDN, AI Services


## Authentication & Authorization

### Authentication

All API requests must include a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Authorization Roles

The system supports the following roles with specific permissions:

- **Instructional Designer**: Create and manage course projects, design learning experiences
- **Faculty**: Record lectures, create content, review materials
- **Production Team**: Process videos, edit content, generate materials
- **QA Reviewer**: Validate content quality, approve courses
- **Project Manager**: Track progress, manage timelines, allocate resources
- **Spiritual Advisor**: Validate theological accuracy, review spiritual integration
- **Admin**: Full system access, configuration management

### Permission Matrix

| Endpoint | Instructional Designer | Faculty | Production | QA Reviewer | Project Manager | Spiritual Advisor | Admin |
|----------|----------------------|---------|------------|-------------|-----------------|-------------------|-------|
| POST /api/course-content/projects | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| PUT /api/course-content/projects/:id/phase | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| POST /api/course-content/videos | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| POST /api/course-content/materials | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| POST /api/course-content/assessments | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| POST /api/course-content/quality-review | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| GET /api/course-content/dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| POST /api/course-content/validate-spiritual-alignment | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |


## API Endpoints

### Course Project Management

#### Create Course Project

Creates a new course development project with defined phases and milestones.

**Endpoint**: `POST /api/course-content/projects`

**Request Body**:
```json
{
  "courseInfo": {
    "title": "Sacred AI Engineering",
    "code": "COURSE_001",
    "description": "Integrating artificial intelligence with biblical principles",
    "faculty": [
      {
        "id": "faculty_123",
        "name": "Dr. John Smith",
        "role": "Lead Instructor"
      }
    ],
    "credits": 3,
    "level": "ADVANCED",
    "prerequisites": ["COURSE_FOUND_101"]
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "project_456",
    "courseInfo": { ... },
    "currentPhase": "PLANNING",
    "phases": [
      {
        "phase": "PLANNING",
        "status": "IN_PROGRESS",
        "startDate": "2024-01-15T00:00:00Z",
        "deliverables": [
          {
            "id": "deliverable_1",
            "name": "Course Outline",
            "status": "PENDING"
          }
        ]
      },
      {
        "phase": "CONTENT_DEVELOPMENT",
        "status": "NOT_STARTED",
        "deliverables": []
      }
    ],
    "timeline": {
      "startDate": "2024-01-15T00:00:00Z",
      "estimatedEndDate": "2024-06-15T00:00:00Z"
    },
    "budget": {
      "total": 50000,
      "allocated": 0,
      "spent": 0
    },
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validation**:
- Course title must be unique
- Faculty must have valid IDs
- Level must be one of: BEGINNER, INTERMEDIATE, ADVANCED, STRATEGIC
- Prerequisites must reference existing courses


#### Advance Phase

Advances a course project to the next phase after approval validation.

**Endpoint**: `PUT /api/course-content/projects/:id/phase`

**Request Body**:
```json
{
  "approvalData": {
    "approverId": "user_789",
    "approverRole": "QA_REVIEWER",
    "comments": "All deliverables meet quality standards",
    "timestamp": "2024-02-15T14:30:00Z"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "projectId": "project_456",
    "previousPhase": "PLANNING",
    "currentPhase": "CONTENT_DEVELOPMENT",
    "transitionDate": "2024-02-15T14:30:00Z",
    "approval": {
      "approverId": "user_789",
      "approverRole": "QA_REVIEWER",
      "comments": "All deliverables meet quality standards"
    }
  }
}
```

**Error Response** (422 Unprocessable Entity):
```json
{
  "success": false,
  "error": "Phase advancement requires approval",
  "details": {
    "currentPhase": "PLANNING",
    "missingApprovals": ["Project Manager", "Instructional Designer"],
    "incompleteDeliverables": ["Course Outline", "Learning Objectives"]
  }
}
```


### Video Production

#### Upload and Process Video

Uploads a lecture video and initiates the production pipeline.

**Endpoint**: `POST /api/course-content/videos`

**Request** (multipart/form-data):
```
video: <video_file>
lectureInfo: {
  "moduleId": "module_123",
  "title": "Introduction to AI Ethics",
  "duration": 2700,
  "language": "en"
}
editingSpecs: {
  "includeIntro": true,
  "includeOutro": true,
  "addGraphics": true,
  "addTransitions": true
}
```

**Response** (202 Accepted):
```json
{
  "success": true,
  "data": {
    "videoId": "video_789",
    "status": "PROCESSING",
    "processingSteps": [
      {
        "step": "UPLOAD",
        "status": "COMPLETED",
        "completedAt": "2024-02-20T10:00:00Z"
      },
      {
        "step": "EDITING",
        "status": "IN_PROGRESS",
        "estimatedCompletion": "2024-02-20T12:00:00Z"
      },
      {
        "step": "CAPTIONING",
        "status": "PENDING"
      },
      {
        "step": "OPTIMIZATION",
        "status": "PENDING"
      }
    ],
    "estimatedCompletionTime": "2024-02-20T14:00:00Z"
  }
}
```

#### Get Video Status

**Endpoint**: `GET /api/course-content/videos/:id/status`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "videoId": "video_789",
    "status": "COMPLETED",
    "video": {
      "url": "https://cdn.scrolluniversity.com/videos/video_789.mp4",
      "resolution": "1080p",
      "format": "mp4",
      "streamingUrls": [
        {
          "quality": "1080p",
          "url": "https://cdn.scrolluniversity.com/videos/video_789_1080p.m3u8"
        },
        {
          "quality": "720p",
          "url": "https://cdn.scrolluniversity.com/videos/video_789_720p.m3u8"
        },
        {
          "quality": "480p",
          "url": "https://cdn.scrolluniversity.com/videos/video_789_480p.m3u8"
        }
      ],
      "thumbnails": [
        "https://cdn.scrolluniversity.com/thumbnails/video_789_1.jpg",
        "https://cdn.scrolluniversity.com/thumbnails/video_789_2.jpg"
      ],
      "duration": 2700,
      "fileSize": 524288000
    },
    "captions": [
      {
        "language": "en",
        "url": "https://cdn.scrolluniversity.com/captions/video_789_en.vtt"
      }
    ],
    "transcript": "https://cdn.scrolluniversity.com/transcripts/video_789_en.txt"
  }
}
```


### Written Materials

#### Generate Lecture Notes

Generates comprehensive lecture notes with AI assistance.

**Endpoint**: `POST /api/course-content/materials`

**Request Body**:
```json
{
  "lectureId": "lecture_456",
  "content": {
    "topic": "AI Ethics and Biblical Principles",
    "keyPoints": [
      "Image of God in AI development",
      "Stewardship of technology",
      "Justice and fairness in algorithms"
    ],
    "scriptureReferences": [
      "Genesis 1:27",
      "Psalm 24:1",
      "Micah 6:8"
    ]
  },
  "template": "STANDARD"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "notesId": "notes_789",
    "lectureId": "lecture_456",
    "content": {
      "summary": "This lecture explores the intersection of AI ethics and biblical principles...",
      "sections": [
        {
          "title": "Introduction",
          "content": "...",
          "pageCount": 2
        },
        {
          "title": "Image of God in AI Development",
          "content": "...",
          "scriptureReferences": ["Genesis 1:27"],
          "pageCount": 4
        }
      ],
      "totalPages": 15,
      "wordCount": 4500
    },
    "pdfUrl": "https://cdn.scrolluniversity.com/notes/notes_789.pdf",
    "status": "COMPLETED",
    "createdAt": "2024-02-21T10:00:00Z"
  }
}
```


### Assessment Design

#### Create Assessment

Creates a new assessment with AI-generated questions or project requirements.

**Endpoint**: `POST /api/course-content/assessments`

**Request Body** (Quiz):
```json
{
  "moduleId": "module_123",
  "type": "QUIZ",
  "title": "AI Ethics Fundamentals Quiz",
  "description": "Test your understanding of AI ethics and biblical principles",
  "points": 100,
  "dueDate": "2024-03-15T23:59:59Z",
  "questionBankSize": 50,
  "alignedObjectives": ["obj_1", "obj_2", "obj_3"]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "assessmentId": "assessment_456",
    "type": "QUIZ",
    "title": "AI Ethics Fundamentals Quiz",
    "questionBank": {
      "totalQuestions": 52,
      "questionTypes": {
        "MULTIPLE_CHOICE": 30,
        "TRUE_FALSE": 10,
        "SHORT_ANSWER": 12
      },
      "difficultyDistribution": {
        "EASY": 15,
        "MEDIUM": 25,
        "HARD": 12
      }
    },
    "rubric": {
      "criteria": [
        {
          "name": "Conceptual Understanding",
          "weight": 40,
          "levels": [
            {
              "name": "Excellent",
              "points": 40,
              "description": "Demonstrates deep understanding of AI ethics principles"
            },
            {
              "name": "Good",
              "points": 32,
              "description": "Shows solid grasp of key concepts"
            }
          ]
        }
      ],
      "totalPoints": 100
    },
    "alignmentReport": {
      "objectivesCovered": ["obj_1", "obj_2", "obj_3"],
      "coveragePercentage": 100,
      "gaps": []
    }
  }
}
```

**Request Body** (Project):
```json
{
  "moduleId": "module_123",
  "type": "PROJECT",
  "title": "AI Ethics Framework Design",
  "description": "Design an ethical framework for AI development in your organization",
  "points": 200,
  "dueDate": "2024-04-15T23:59:59Z",
  "projectRequirements": {
    "realWorldApplication": "Apply to actual organization or community",
    "measurableImpact": [
      "Number of stakeholders impacted",
      "Policy changes implemented",
      "Training sessions conducted"
    ],
    "deliverables": [
      "Written framework document (10-15 pages)",
      "Presentation to leadership",
      "Implementation plan"
    ]
  }
}
```


### Quality Review

#### Submit for Quality Review

Submits a course for quality assurance review.

**Endpoint**: `POST /api/course-content/quality-review`

**Request Body**:
```json
{
  "courseId": "course_123",
  "reviewerId": "reviewer_456",
  "reviewType": "COMPREHENSIVE"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reviewId": "review_789",
    "courseId": "course_123",
    "reviewDate": "2024-03-01T10:00:00Z",
    "checklistResults": [
      {
        "criterion": "Video Quality - Audio Clarity",
        "passed": true,
        "score": 10,
        "notes": "Excellent audio quality throughout"
      },
      {
        "criterion": "Content Depth - Technical Accuracy",
        "passed": true,
        "score": 9,
        "notes": "Strong technical content with minor suggestions"
      },
      {
        "criterion": "Spiritual Integration - Biblical Foundation",
        "passed": true,
        "score": 10,
        "notes": "Well-integrated biblical principles"
      }
    ],
    "videoQuality": {
      "audioScore": 95,
      "visualScore": 92,
      "engagementScore": 88,
      "overallScore": 92
    },
    "contentQuality": {
      "accuracyScore": 94,
      "clarityScore": 90,
      "depthScore": 93,
      "overallScore": 92
    },
    "assessmentQuality": {
      "rigorScore": 91,
      "alignmentScore": 95,
      "diversityScore": 88,
      "overallScore": 91
    },
    "overallScore": 92,
    "approved": true,
    "feedback": "Excellent course that meets all quality standards",
    "recommendations": [
      "Consider adding more interactive elements in Module 3",
      "Expand case studies in Module 5"
    ]
  }
}
```


### Production Dashboard

#### Get Dashboard Data

Retrieves progress tracking data for all courses.

**Endpoint**: `GET /api/course-content/dashboard`

**Query Parameters**:
- `status` (optional): Filter by status (ACTIVE, COMPLETED, ON_HOLD)
- `phase` (optional): Filter by current phase
- `faculty` (optional): Filter by faculty ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCourses": 25,
      "activeCourses": 15,
      "completedCourses": 8,
      "onHoldCourses": 2
    },
    "courses": [
      {
        "id": "course_123",
        "title": "Sacred AI Engineering",
        "currentPhase": "PRODUCTION",
        "progress": 65,
        "status": "ACTIVE",
        "timeline": {
          "startDate": "2024-01-15T00:00:00Z",
          "estimatedEndDate": "2024-06-15T00:00:00Z",
          "daysRemaining": 45
        },
        "budget": {
          "allocated": 50000,
          "spent": 32000,
          "remaining": 18000,
          "percentageUsed": 64
        },
        "team": [
          {
            "userId": "user_123",
            "name": "Dr. John Smith",
            "role": "Lead Instructor"
          }
        ],
        "bottlenecks": [
          {
            "type": "RESOURCE",
            "description": "Video editing backlog",
            "severity": "MEDIUM",
            "suggestedSolution": "Allocate additional editor"
          }
        ]
      }
    ],
    "bottlenecks": {
      "total": 5,
      "byType": {
        "RESOURCE": 3,
        "TIMELINE": 1,
        "QUALITY": 1
      }
    }
  }
}
```


### Deployment Pathways

#### Create Deployment Pathway

Creates a real-world deployment pathway for a course module.

**Endpoint**: `POST /api/course-content/deployment-pathways`

**Request Body**:
```json
{
  "moduleId": "module_123",
  "conceptId": "concept_456",
  "description": "Implement AI ethics framework in organization",
  "realWorldApplication": "Design and deploy ethical AI guidelines for company or ministry",
  "systemsToTransform": [
    "Corporate governance",
    "Technology development",
    "Stakeholder engagement"
  ],
  "measurableImpact": [
    {
      "metric": "Policies implemented",
      "target": 5,
      "unit": "policies"
    },
    {
      "metric": "Staff trained",
      "target": 50,
      "unit": "people"
    }
  ],
  "requiredCompetencies": [
    "Ethical framework design",
    "Stakeholder communication",
    "Policy implementation"
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "pathwayId": "pathway_789",
    "moduleId": "module_123",
    "conceptId": "concept_456",
    "description": "Implement AI ethics framework in organization",
    "realWorldApplication": "Design and deploy ethical AI guidelines for company or ministry",
    "systemsToTransform": ["Corporate governance", "Technology development", "Stakeholder engagement"],
    "measurableImpact": [...],
    "requiredCompetencies": [...],
    "createdAt": "2024-03-05T10:00:00Z"
  }
}
```


### Validation Endpoints

#### Validate Course Constitution

Validates a course against Course Content Constitution requirements.

**Endpoint**: `POST /api/course-content/validate-constitution`

**Request Body**:
```json
{
  "courseId": "course_123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "courseId": "course_123",
    "structureValidation": {
      "moduleCount": 8,
      "moduleCountValid": true,
      "lessonsPerModule": [5, 6, 5, 7, 6, 5, 6, 5],
      "lessonsValid": true,
      "requiredComponents": [
        {
          "component": "Lecture Notes",
          "present": true
        },
        {
          "component": "Video Script Outline",
          "present": true
        }
      ],
      "overallValid": true,
      "errors": []
    },
    "placeholderDetection": {
      "hasPlaceholders": false,
      "hasTODONotes": false,
      "hasExampleData": false,
      "productionReady": true
    },
    "assessmentValidation": {
      "hasMicroAssessments": true,
      "hasMidCourseAssessment": true,
      "hasFinalCapstone": true,
      "valid": true
    },
    "formationValidation": {
      "knowledgeDimension": {
        "score": 95,
        "present": true
      },
      "skillDimension": {
        "score": 92,
        "present": true
      },
      "characterDimension": {
        "score": 88,
        "present": true
      },
      "callingDimension": {
        "score": 90,
        "present": true
      },
      "integratedFormationAchieved": true,
      "gaps": []
    },
    "overallValid": true
  }
}
```


#### Validate Rigor Level

Validates course content depth against declared rigor level.

**Endpoint**: `POST /api/course-content/validate-rigor`

**Request Body**:
```json
{
  "courseId": "course_123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "courseId": "course_123",
    "declaredLevel": "ADVANCED",
    "actualLevel": "ADVANCED",
    "depthScore": 92,
    "vocabularyAppropriate": true,
    "assessmentDifficultyMatches": true,
    "technicalValidation": {
      "hasProperTheories": true,
      "hasFrameworks": true,
      "hasFormulas": true,
      "hasWorkedExamples": true,
      "depthScore": 94
    },
    "benchmarkReport": {
      "comparedInstitutions": ["MIT", "Stanford", "Oxford"],
      "contentDepthComparison": [
        {
          "institution": "MIT",
          "similarity": 95,
          "meetsStandard": true
        }
      ],
      "meetsOrExceedsStandards": true
    },
    "valid": true,
    "issues": []
  }
}
```


#### Validate Spiritual Alignment

Validates content through SpiritualAlignmentValidator.

**Endpoint**: `POST /api/course-content/validate-spiritual-alignment`

**Request Body**:
```json
{
  "contentId": "content_123",
  "contentType": "MODULE",
  "strictnessProfile": "BALANCED"
}
```

**Response** (200 OK - Passed):
```json
{
  "success": true,
  "data": {
    "contentId": "content_123",
    "passed": true,
    "strictnessProfile": "BALANCED",
    "errors": [],
    "warnings": [
      {
        "type": "MINOR_TONE_ISSUE",
        "severity": "LOW",
        "message": "Consider softening language in paragraph 3",
        "location": {
          "module": "module_123",
          "lesson": "lesson_456",
          "paragraph": 3
        }
      }
    ],
    "correctionAttempted": false,
    "correctionSuccessful": null,
    "validatedAt": "2024-03-10T10:00:00Z"
  }
}
```

**Response** (200 OK - Failed with Correction):
```json
{
  "success": true,
  "data": {
    "contentId": "content_123",
    "passed": false,
    "strictnessProfile": "STRICT_SPIRITUAL",
    "errors": [
      {
        "type": "THEOLOGICAL_DRIFT",
        "severity": "CRITICAL",
        "message": "Content presents Jesus as 'a way' rather than 'the way'",
        "location": {
          "module": "module_123",
          "lesson": "lesson_456",
          "paragraph": 5
        },
        "suggestedCorrection": "Jesus is the way, the truth, and the life (John 14:6)"
      }
    ],
    "warnings": [],
    "correctionAttempted": true,
    "correctionSuccessful": true,
    "correctedContent": {
      "contentId": "content_123_corrected",
      "changes": [
        {
          "location": "paragraph 5",
          "original": "Jesus is one of many paths to God",
          "corrected": "Jesus is the way, the truth, and the life (John 14:6)"
        }
      ]
    },
    "validatedAt": "2024-03-10T10:00:00Z"
  }
}
```


#### Validate Pedagogy

Validates lesson structure against Scroll Pedagogy requirements.

**Endpoint**: `POST /api/course-content/validate-pedagogy`

**Request Body**:
```json
{
  "lessonId": "lesson_456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "lessonId": "lesson_456",
    "flowValidation": {
      "hasIgnition": true,
      "hasDownload": true,
      "hasDemonstration": true,
      "hasActivation": true,
      "hasReflection": true,
      "hasCommission": true,
      "allStepsPresent": true,
      "flowQuality": 94,
      "missingSteps": []
    },
    "toneValidation": {
      "isWarm": true,
      "isWise": true,
      "isPropheticButGrounded": true,
      "hasDualExplanation": true,
      "toneScore": 92
    },
    "progressionMapping": {
      "targetLevel": "APPLICATION_PROBLEM_SOLVING",
      "contentMappedToLevel": true,
      "assessmentsMappedToLevel": true,
      "levelAppropriate": true,
      "gaps": []
    },
    "valid": true
  }
}
```


## Workflow Phases

The course development workflow consists of six phases with approval gates between each phase:

### 1. Planning Phase

**Duration**: 2-4 weeks

**Key Activities**:
- Define course objectives and learning outcomes
- Create course outline with module structure
- Identify faculty and team members
- Establish timeline and budget
- Define real-world deployment pathways

**Deliverables**:
- Course outline document
- Learning objectives matrix
- Team assignment plan
- Project timeline
- Budget allocation

**Approval Requirements**:
- Instructional Designer approval
- Project Manager approval
- Faculty lead approval

### 2. Content Development Phase

**Duration**: 6-10 weeks

**Key Activities**:
- Write lecture scripts and outlines
- Develop written materials and notes
- Create assessment designs
- Integrate spiritual formation content
- Design deployment pathways

**Deliverables**:
- Complete lecture scripts for all modules
- Lecture notes (10-20 pages per lecture)
- Assessment designs with rubrics
- Spiritual integration materials
- Deployment pathway specifications

**Approval Requirements**:
- Faculty approval
- Spiritual Advisor approval
- Instructional Designer approval


### 3. Production Phase

**Duration**: 4-8 weeks

**Key Activities**:
- Record lecture videos
- Edit videos with graphics and transitions
- Generate captions and transcripts
- Optimize videos for streaming
- Create multilingual versions
- Generate PDF materials

**Deliverables**:
- Edited lecture videos (1080p minimum)
- Closed captions in primary language
- Transcripts for all lectures
- Streaming-optimized video files
- Professional PDF documents
- Multilingual subtitles (if required)

**Approval Requirements**:
- Production Manager approval
- Faculty approval of final edits
- Quality check of technical specifications

### 4. Quality Review Phase

**Duration**: 2-3 weeks

**Key Activities**:
- Run 50-point quality checklist
- Review video quality (audio, visual, engagement)
- Review written materials (accuracy, clarity, depth)
- Review assessment rigor and alignment
- Validate Course Constitution compliance
- Validate rigor level standards
- Validate spiritual alignment
- Validate Scroll Pedagogy compliance
- Benchmark against elite institutions

**Deliverables**:
- Quality review report
- Constitution validation report
- Rigor validation report
- Spiritual alignment validation report
- Pedagogy validation report
- Benchmarking report
- Recommendations for improvements

**Approval Requirements**:
- QA Reviewer approval (score ≥ 85/100)
- Spiritual Advisor approval
- All validation checks passed


### 5. Pilot Testing Phase

**Duration**: 4-6 weeks

**Key Activities**:
- Recruit 10-20 pilot students
- Deliver course to pilot cohort
- Collect feedback after each module
- Prioritize issues by impact
- Implement improvements
- Re-test updated content

**Deliverables**:
- Pilot program report
- Student feedback analysis
- Issue prioritization matrix
- Content updates based on feedback
- Re-test validation results

**Approval Requirements**:
- Positive feedback threshold (≥ 80% satisfaction)
- All critical issues resolved
- Faculty approval of changes
- QA Reviewer approval of updates

### 6. Launch Phase

**Duration**: 1-2 weeks

**Key Activities**:
- Final content review
- Deploy to production platform
- Create course marketing materials
- Set up enrollment system
- Configure real-time monitoring
- Establish continuous improvement process

**Deliverables**:
- Published course on platform
- Course catalog entry
- Marketing materials
- Enrollment configuration
- Monitoring dashboard
- Improvement workflow

**Approval Requirements**:
- Final approval from all stakeholders
- Technical deployment validation
- Platform integration testing
- Launch readiness checklist completed


## Quality Checklist

The 50-point quality checklist is benchmarked against elite global institutions and covers five major categories:

### Video Quality (10 points)

1. **Audio Clarity** (2 points): Clear, professional audio with no background noise
2. **Visual Quality** (2 points): 1080p minimum resolution, proper lighting and framing
3. **Engagement** (2 points): Dynamic presentation, appropriate pacing, visual aids
4. **Technical Specifications** (2 points): Proper encoding, streaming optimization, adaptive bitrate
5. **Accessibility** (2 points): Closed captions, transcripts, audio descriptions

### Written Materials Quality (10 points)

6. **Accuracy** (2 points): Factually correct, properly cited, authoritative sources
7. **Clarity** (2 points): Clear writing, logical organization, appropriate vocabulary
8. **Depth** (2 points): Comprehensive coverage, appropriate detail level, scholarly standards
9. **Formatting** (2 points): Professional layout, consistent styling, proper citations
10. **Completeness** (2 points): All required sections, 10-20 pages per lecture, supplemental resources

### Assessment Quality (10 points)

11. **Rigor** (2 points): Appropriate difficulty, tests deep understanding, matches declared level
12. **Alignment** (2 points): Aligned with learning objectives, covers all key concepts
13. **Diversity** (2 points): Multiple assessment types, varied question formats
14. **Real-World Application** (2 points): Projects require practical application, measurable impact
15. **Rubrics** (2 points): Clear criteria, defined levels, objective scoring

### Spiritual Integration Quality (10 points)

16. **Biblical Foundation** (2 points): Scripture-based content, Christ-centered perspective
17. **Theological Accuracy** (2 points): Doctrinally sound, reviewed by spiritual advisor
18. **Worldview Integration** (2 points): Christian perspective woven throughout, not forced
19. **Reflection Questions** (2 points): Connect faith and learning, promote spiritual growth
20. **Calling Connection** (2 points): Link to kingdom governance, civilization building


### Course Constitution Compliance (10 points)

21. **Structure Requirements** (2 points): 4-12 modules, 3-10 lessons per module
22. **Component Completeness** (2 points): All mandatory components present (notes, scripts, examples, references)
23. **Production Readiness** (2 points): No placeholders, TODO notes, or example data
24. **Assessment Distribution** (2 points): Micro-assessments, mid-course, final capstone
25. **Integrated Formation** (2 points): All four dimensions (Knowledge, Skill, Character, Calling)

### Scroll Pedagogy Compliance (10 points)

26. **Six-Step Flow** (2 points): All steps present (Ignition, Download, Demonstration, Activation, Reflection, Commission)
27. **AI Tutor Tone** (2 points): Warm, wise, prophetic-but-grounded, dual-explanation pattern
28. **Assessment Types** (2 points): Formative, summative, and reflective assessments
29. **Progression Mapping** (2 points): Content mapped to 5-level model
30. **Pedagogical Priority** (2 points): Pedagogy prioritized over delivery speed

### Scoring Guidelines

- **90-100 points**: Excellent - Exceeds elite standards, ready for immediate launch
- **85-89 points**: Very Good - Meets elite standards, minor improvements recommended
- **75-84 points**: Good - Meets minimum standards, improvements required before launch
- **Below 75 points**: Needs Improvement - Does not meet standards, significant revision required

**Minimum Passing Score**: 85 points

**Critical Failures** (automatic rejection regardless of total score):
- Theological drift or doctrinal errors
- Placeholder content or TODO notes in production
- Missing mandatory components
- Below declared rigor level
- Spiritual alignment validation failures
- Pedagogy compliance failures


## Budget & Resource Management

### Budget Categories

Courses are budgeted across the following categories:

1. **Production** (40-50% of budget)
   - Video recording equipment and studio time
   - Video editing and post-production
   - Graphics and animation
   - Captioning and translation services

2. **Faculty** (30-40% of budget)
   - Faculty compensation for content creation
   - Subject matter expert consultation
   - Spiritual advisor review time

3. **Materials** (10-20% of budget)
   - Written materials development
   - PDF generation and formatting
   - Supplemental resource curation
   - Assessment design and question bank creation

4. **Technology** (5-10% of budget)
   - AI service usage (content generation, grading)
   - Storage and CDN costs
   - Platform hosting and infrastructure

5. **Contingency** (5-10% of budget)
   - Unexpected expenses
   - Rework and revisions
   - Additional resources as needed

### Resource Allocation

**Equipment Resources**:
- Recording studio (scheduled by hour)
- Video cameras and lighting
- Audio recording equipment
- Editing workstations

**Personnel Resources**:
- Instructional designers
- Faculty and subject matter experts
- Video producers and editors
- Graphic designers
- QA reviewers
- Spiritual advisors

**Time Resources**:
- Studio booking slots
- Faculty availability windows
- Review and approval timelines
- Production pipeline capacity


### Budget Tracking

The system tracks expenses in real-time and provides alerts when:

- **Budget threshold reached** (80% of allocated budget spent)
- **Projected overage detected** (current burn rate will exceed budget)
- **Category imbalance** (one category consuming disproportionate resources)
- **Contingency fund needed** (unexpected expenses require contingency allocation)

### Cost Optimization Strategies

1. **Template Reuse**: Leverage successful course templates to reduce design time
2. **Batch Production**: Record multiple lectures in single studio sessions
3. **AI Assistance**: Use AI for initial content generation and question banks
4. **Automated Processing**: Automate captioning, formatting, and optimization
5. **Resource Pooling**: Share resources across concurrent course projects

### Financial Reporting

Monthly financial reports include:

- Budget vs. actual spending by category
- Cost per course comparison
- Resource utilization rates
- ROI analysis (cost per student, revenue projections)
- Efficiency metrics (cost per lecture hour, cost per assessment)


## Course Constitution Compliance

### Minimum Structure Requirements

Every course MUST meet these non-negotiable standards:

**Module Count**: 4-12 modules per course
**Lesson Count**: 3-10 lessons per module
**Mandatory Components** (per lesson):
- Lecture notes (10-20 pages)
- Video script outline
- Examples and practice problems
- Key scriptures or frameworks
- References and citations

**Assessment Distribution**:
- Per-module micro-assessments (formative)
- Mid-course comprehensive assessment (summative)
- Final capstone project or exam (summative + reflective)

**Integrated Formation Dimensions**:
1. Knowledge: Theoretical understanding
2. Skill: Practical application
3. Character: Virtue development
4. Calling: Purpose alignment

**Production Readiness**:
- No placeholder content
- No TODO notes or reminders
- No example data to be replaced
- All content complete and polished

### Validation API

```bash
POST /api/course-content/validate-constitution
{
  "courseId": "course_123"
}
```

**Response includes**:
- Structure validation (module/lesson counts)
- Placeholder detection
- Component completeness check
- Assessment distribution validation
- Integrated formation verification


## Rigor Level Standards

### Level Definitions

#### Beginner
- **Audience**: New to subject, foundational learning
- **Vocabulary**: Basic terms, clear definitions
- **Content**: Introductory concepts, step-by-step guidance
- **Assessments**: Recognition, recall, basic application
- **Examples**: Simple, straightforward scenarios

#### Intermediate
- **Audience**: Some background, ready for deeper learning
- **Vocabulary**: Technical terms, discipline-specific language
- **Content**: Applied concepts, problem-solving focus
- **Assessments**: Analysis, application, synthesis
- **Examples**: Real-world cases, moderate complexity

#### Advanced
- **Audience**: Strong foundation, ready for mastery
- **Vocabulary**: Specialized terminology, expert language
- **Content**: Complex theories, frameworks, formulas
- **Assessments**: Evaluation, creation, system design
- **Examples**: Complex scenarios, research-level problems

#### Strategic
- **Audience**: Experts, governance and leadership focus
- **Vocabulary**: Expert discourse, strategic terminology
- **Content**: Systems thinking, governance frameworks
- **Assessments**: Strategic planning, policy design, civilization building
- **Examples**: Multi-system challenges, nation-level problems

### Benchmarking Process

Courses are compared against equivalent courses at:
- MIT OpenCourseWare
- Stanford Online
- Oxford/Cambridge syllabi
- Leading textbooks in the field

**Validation checks**:
- Content depth matches declared level
- Vocabulary is appropriate
- Assessment difficulty aligns
- Technical content includes proper theories, frameworks, formulas
- Worked examples demonstrate mastery

### Validation API

```bash
POST /api/course-content/validate-rigor
{
  "courseId": "course_123"
}
```

**Response includes**:
- Declared vs. actual rigor level
- Depth score
- Technical content validation
- Benchmark comparison report
- Issues and recommendations


## Spiritual Alignment Validation

### Strictness Profiles

#### Strict Spiritual
**Used For**: Theology modules, spiritual formation content, devotionals
**Validation**: Zero tolerance for theological drift, Christ-centered language required

#### Balanced
**Used For**: Technical modules with spiritual integration, general education
**Validation**: Worldview integration, spiritual enrichment without academic compromise

#### Light Check
**Used For**: Highly technical content, specialized professional training
**Validation**: Tone and respect, no spiritualization of laziness

### Error Types

**Theological Drift**: Content presenting Jesus as "a way not the way"
**Tone Problems**: Condemning, shaming, manipulative language
**Spiritualization of Laziness**: Prayer replacing study, God replacing discipline
**Babylonian Flattening**: Reduction to neutral secular academia

### Integration Points

Validation is mandatory at:
1. Course generation (after each module)
2. Module generation (after each lesson)
3. AI tutor scripts (before deployment)
4. System messages (long-lived prompts)
5. Spiritual content blocks (devotionals, prayers)

### Validation API

```bash
POST /api/course-content/validate-spiritual-alignment
{
  "contentId": "content_123",
  "contentType": "MODULE",
  "strictnessProfile": "BALANCED"
}
```

**Response includes**:
- Pass/fail status
- Error details with locations
- Suggested corrections
- Auto-correction attempts
- Warnings and recommendations


## Scroll Pedagogy

### The 6-Step Lesson Flow

Every lesson MUST follow this structure:

1. **Ignition**: Hook + revelation trigger (story, question, scripture, scenario)
2. **Download**: Clear concept teaching with examples and analogies
3. **Demonstration**: Worked example showing concrete application
4. **Activation**: Student practice (solve problem, design system, write reflection)
5. **Reflection**: Questions connecting learning to identity and calling
6. **Commission**: Clear "go and do" action or assignment

### AI Tutor Requirements

- **Dual-Explanation Pattern**: Conceptual + practical explanations
- **Tone**: Warm, wise, prophetic-but-grounded
- **Adaptation**: Adjust to student calling/context when available
- **Respect**: Never condescending, treat students as kings/queens in training

### Revelation Learning Model

**5-Level Progression**:
1. Awareness & Vocabulary
2. Understanding & Analysis
3. Application & Problem Solving
4. System Design & Governance
5. Multiplication & Teaching Others

### Assessment Types

**Required Distribution**:
- **Formative**: Low-stakes, frequent, for feedback
- **Summative**: Certify mastery, readiness for next level
- **Reflective**: Spiritual, identity, purpose-based

### Priority Hierarchy

When conflicts arise:
1. Spiritual alignment
2. Pedagogical integrity
3. Content depth
4. Technical correctness
5. Delivery speed

**Never sacrifice pedagogy for velocity.**

### Validation API

```bash
POST /api/course-content/validate-pedagogy
{
  "lessonId": "lesson_456"
}
```

**Response includes**:
- Six-step flow validation
- AI tutor tone validation
- Assessment distribution check
- Progression level mapping
- Overall pedagogy compliance


## Real-World Deployment

### Deployment Pathway Requirements

Every major concept or skill must have a deployment pathway specifying:

1. **Real-World Application**: How students will apply the learning
2. **Systems to Transform**: Government, business, education, technology, ministry, community
3. **Measurable Impact**: Specific metrics, target outcomes, evidence of transformation
4. **Required Competencies**: Skills, knowledge, character qualities needed

### Project Connections

Connect students with:
- Actual organizations and communities
- Real systems and problems
- Mentorship for applied work
- Portfolio-building opportunities

### Outcome Tracking

Track and measure:
- Systems transformed
- Impact achieved
- Testimony and feedback
- Results fed back into course improvement

### Assessment Integration

Measure:
- Deployment readiness (not just knowledge)
- Practical competence
- Character development
- Calling alignment
- Readiness for governance and civilization building

### API Endpoints

```bash
# Create Deployment Pathway
POST /api/course-content/deployment-pathways
{
  "moduleId": "module_123",
  "conceptId": "concept_456",
  "description": "...",
  "realWorldApplication": "...",
  "systemsToTransform": [...],
  "measurableImpact": [...],
  "requiredCompetencies": [...]
}

# Connect Student to Project
POST /api/course-content/deployment-pathways/:id/connect
{
  "studentId": "student_789",
  "projectDetails": {...}
}

# Track Outcome
POST /api/course-content/deployment-pathways/:id/outcomes
{
  "graduateId": "graduate_123",
  "outcomeData": {...}
}
```


## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "Additional context",
    "code": "ERROR_CODE"
  },
  "correlationId": "uuid-for-tracking"
}
```

### HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **202 Accepted**: Request accepted for processing
- **400 Bad Request**: Invalid input or validation failure
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Business logic error
- **500 Internal Server Error**: System error
- **503 Service Unavailable**: External service failure

### Common Errors

#### Validation Errors (400)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "fields": {
      "courseInfo.title": "Title is required",
      "courseInfo.level": "Must be one of: BEGINNER, INTERMEDIATE, ADVANCED, STRATEGIC"
    }
  }
}
```

#### Authorization Errors (403)

```json
{
  "success": false,
  "error": "Insufficient permissions",
  "details": {
    "required": "QA_REVIEWER",
    "actual": "FACULTY"
  }
}
```

#### Business Logic Errors (422)

```json
{
  "success": false,
  "error": "Phase advancement requires approval",
  "details": {
    "currentPhase": "PLANNING",
    "missingApprovals": ["Project Manager", "Instructional Designer"],
    "incompleteDeliverables": ["Course Outline"]
  }
}
```

#### Validation Failures

```json
{
  "success": false,
  "error": "Course Constitution validation failed",
  "details": {
    "moduleCount": 3,
    "required": "4-12",
    "issues": ["Insufficient modules", "Missing deployment pathways"]
  }
}
```

### Error Recovery

**Transient Errors**: Implement retry with exponential backoff
**Validation Errors**: Fix input and resubmit
**Authorization Errors**: Request appropriate permissions
**Business Logic Errors**: Follow suggested next steps
**System Errors**: Contact support with correlation ID


## User Guides

Comprehensive guides are available for each role:

### Instructional Designer Guide
**Location**: `/backend/src/docs/instructional-designer-guide.md`

**Topics Covered**:
- Initiating course projects
- Planning phase workflow
- Content development coordination
- Production oversight
- Quality review process
- Pilot testing management
- Launch preparation
- Course Constitution compliance
- Rigor level standards
- Scroll Pedagogy implementation
- Real-world deployment integration

### Faculty Guide
**Location**: `/backend/src/docs/faculty-guide.md`

**Topics Covered**:
- Understanding your role
- Working with instructional designers
- Creating lecture content
- Integrating biblical principles
- Maintaining academic rigor
- Recording video lectures
- Reviewing materials
- Working with pilot students
- Tips for success

### QA Reviewer Guide
**Location**: `/backend/src/docs/qa-reviewer-guide.md`

**Topics Covered**:
- Quality review process
- 50-point quality checklist
- Scoring and approval guidelines
- Running automated validations
- Providing feedback
- Common issues and solutions
- Standards enforcement
- Tips for success

### Spiritual Alignment Validator Guide
**Location**: `/backend/src/docs/spiritual-alignment-validator-guide.md`

**Topics Covered**:
- Understanding strictness profiles
- Running validation
- Error types to detect
- Providing corrections
- Validation scenarios
- Best practices
- Working with content creators
- Theological guidance

## Additional Resources

### API Reference
- Full endpoint documentation with request/response examples
- Authentication and authorization details
- Error handling and recovery strategies

### Configuration
- Video processing settings
- Quality checklist criteria
- Budget categories and allocations
- Timeline templates
- Automation rules
- Validation thresholds

### Best Practices
- Course development workflow
- Content creation guidelines
- Quality assurance procedures
- Continuous improvement processes

### Support
- Technical support: development team
- Content questions: instructional design team
- Spiritual guidance: spiritual advisors
- Project management: project managers

## Conclusion

The Course Content Creation System provides a comprehensive platform for developing world-class educational content that meets ScrollUniversity's elite standards. By following the structured workflow, maintaining quality standards, and integrating spiritual formation naturally, we create transformative learning experiences that prepare students for kingdom governance and civilization building.

For questions or support, consult the appropriate user guide or contact the relevant team.

