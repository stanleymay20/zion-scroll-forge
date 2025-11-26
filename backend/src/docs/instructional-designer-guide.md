# Instructional Designer Guide - Course Content Creation System

## Overview

As an Instructional Designer, you are responsible for architecting effective learning experiences that meet ScrollUniversity's elite academic standards while integrating spiritual formation and practical application. This guide will help you navigate the course development process from initial planning through launch.

## Your Role and Responsibilities

### Primary Responsibilities

1. **Course Architecture**: Design the overall structure, learning objectives, and pedagogical approach
2. **Learning Experience Design**: Create engaging, transformative learning journeys
3. **Quality Standards**: Ensure courses meet Course Constitution and rigor requirements
4. **Team Coordination**: Work with faculty, production team, and QA reviewers
5. **Continuous Improvement**: Analyze feedback and implement enhancements

### Key Skills Required

- Instructional design principles and best practices
- Understanding of Scroll Pedagogy (6-step lesson flow)
- Knowledge of Course Constitution requirements
- Familiarity with assessment design and alignment
- Project management and coordination

## Getting Started

### 1. Initiating a New Course Project

**Step 1**: Gather Course Information
- Course title and code
- Subject area and discipline
- Target audience and prerequisites
- Faculty lead and team members
- Desired rigor level (Beginner, Intermediate, Advanced, Strategic)

**Step 2**: Create Course Project via API

```bash
POST /api/course-content/projects
{
  "courseInfo": {
    "title": "Your Course Title",
    "code": "COURSE_XXX",
    "description": "Course description",
    "faculty": [...],
    "credits": 3,
    "level": "ADVANCED",
    "prerequisites": []
  }
}
```

**Step 3**: Review Generated Project Structure
- Verify all six phases are initialized
- Check timeline estimates
- Review budget allocation
- Confirm team assignments


### 2. Planning Phase

**Duration**: 2-4 weeks

**Your Tasks**:

1. **Define Learning Objectives**
   - Create SMART objectives (Specific, Measurable, Achievable, Relevant, Time-bound)
   - Align with Revelation Learning Model levels
   - Map to real-world deployment outcomes
   - Ensure integrated formation (Knowledge, Skill, Character, Calling)

2. **Design Course Structure**
   - Determine number of modules (4-12 required)
   - Plan lessons per module (3-10 required)
   - Sequence content for progressive learning
   - Identify key concepts and skills

3. **Plan Assessments**
   - Design assessment strategy (formative, summative, reflective)
   - Create assessment distribution plan
   - Define rubric criteria
   - Plan real-world application projects

4. **Integrate Spiritual Formation**
   - Identify biblical foundations for each module
   - Plan worldview integration points
   - Design reflection questions
   - Connect to calling and kingdom governance

5. **Create Deployment Pathways**
   - Define real-world application opportunities
   - Identify systems to transform
   - Establish measurable impact criteria
   - Plan project connections

**Deliverables**:
- Course outline document
- Learning objectives matrix
- Assessment strategy document
- Spiritual integration plan
- Deployment pathway specifications

**Approval Process**:
- Submit deliverables for review
- Address feedback from faculty and project manager
- Obtain approvals before advancing to Content Development


### 3. Content Development Phase

**Duration**: 6-10 weeks

**Your Tasks**:

1. **Guide Content Creation**
   - Work with faculty to develop lecture scripts
   - Ensure Scroll Pedagogy 6-step flow in every lesson:
     * Ignition: Hook + revelation trigger
     * Download: Concept teaching
     * Demonstration: Worked example
     * Activation: Student practice
     * Reflection: Identity integration
     * Commission: Next step action
   - Review and provide feedback on drafts
   - Ensure appropriate depth for declared rigor level

2. **Coordinate Written Materials**
   - Guide lecture notes development (10-20 pages per lecture)
   - Ensure all required components present:
     * Summary and key concepts
     * Examples and practice problems
     * Real-world application scenarios
     * Scripture references (where appropriate)
     * References and citations
   - Review for clarity and completeness

3. **Design Assessments**
   - Create assessment specifications
   - Use AI assistance for question bank generation
   - Design project requirements with real-world focus
   - Develop comprehensive rubrics
   - Validate alignment with learning objectives

4. **Validate Spiritual Integration**
   - Review content for biblical foundation
   - Ensure Christ-centered worldview throughout
   - Check for theological accuracy
   - Verify reflection questions connect faith and learning
   - Coordinate with Spiritual Advisor for review

**Best Practices**:

- **Use Templates**: Leverage successful course templates to maintain consistency
- **Iterate Early**: Get feedback on initial modules before completing all content
- **Check Alignment**: Regularly verify content aligns with objectives
- **Monitor Depth**: Ensure technical content includes theories, frameworks, formulas
- **Avoid Placeholders**: Never use TODO notes or example data in production content

**Common Pitfalls to Avoid**:

- ❌ Skipping steps in the 6-step lesson flow
- ❌ Insufficient depth for declared rigor level
- ❌ Forced or superficial spiritual integration
- ❌ Assessments not aligned with objectives
- ❌ Missing real-world deployment pathways


### 4. Production Phase

**Duration**: 4-8 weeks

**Your Tasks**:

1. **Coordinate Video Production**
   - Schedule recording sessions with faculty
   - Review video scripts before recording
   - Provide feedback on recorded content
   - Approve final edited videos

2. **Review Materials Production**
   - Verify PDF generation quality
   - Check formatting and layout
   - Ensure all links and references work
   - Approve final materials

3. **Monitor Progress**
   - Track production timeline
   - Identify and address bottlenecks
   - Coordinate with production team
   - Manage budget and resources

**Quality Checks**:

- Video quality meets 1080p minimum standard
- Audio is clear with no background noise
- Captions and transcripts are accurate
- PDFs are professionally formatted
- All materials are production-ready (no placeholders)

### 5. Quality Review Phase

**Duration**: 2-3 weeks

**Your Tasks**:

1. **Prepare for QA Review**
   - Ensure all deliverables are complete
   - Run preliminary quality checks
   - Validate Course Constitution compliance
   - Check rigor level standards

2. **Coordinate Validation**
   - Submit for Constitution validation
   - Submit for rigor level validation
   - Submit for spiritual alignment validation
   - Submit for pedagogy validation

3. **Address Feedback**
   - Review QA reviewer feedback
   - Prioritize issues by severity
   - Coordinate fixes with team
   - Resubmit for approval

**Validation Endpoints to Use**:

```bash
# Course Constitution Validation
POST /api/course-content/validate-constitution
{
  "courseId": "course_123"
}

# Rigor Level Validation
POST /api/course-content/validate-rigor
{
  "courseId": "course_123"
}

# Spiritual Alignment Validation
POST /api/course-content/validate-spiritual-alignment
{
  "contentId": "content_123",
  "contentType": "COURSE",
  "strictnessProfile": "BALANCED"
}

# Pedagogy Validation (per lesson)
POST /api/course-content/validate-pedagogy
{
  "lessonId": "lesson_456"
}
```


### 6. Pilot Testing Phase

**Duration**: 4-6 weeks

**Your Tasks**:

1. **Plan Pilot Program**
   - Define pilot cohort criteria
   - Recruit 10-20 pilot students
   - Set up feedback collection mechanisms
   - Establish success metrics

2. **Monitor Pilot Delivery**
   - Track student engagement
   - Collect feedback after each module
   - Identify issues and patterns
   - Document improvement opportunities

3. **Analyze Feedback**
   - Review student feedback data
   - Prioritize issues by impact
   - Identify content gaps or confusion points
   - Assess deployment pathway effectiveness

4. **Implement Improvements**
   - Coordinate content updates
   - Retest updated materials
   - Validate improvements with pilot students
   - Obtain approval for changes

**Success Criteria**:

- ≥ 80% student satisfaction rating
- All critical issues resolved
- Positive feedback on deployment pathways
- Faculty approval of changes
- QA approval of updates

### 7. Launch Phase

**Duration**: 1-2 weeks

**Your Tasks**:

1. **Final Review**
   - Conduct final content review
   - Verify all feedback implemented
   - Check platform integration
   - Test student experience

2. **Prepare Launch Materials**
   - Create course catalog entry
   - Write course description and marketing copy
   - Prepare enrollment information
   - Set up course dashboard

3. **Configure Monitoring**
   - Set up continuous feedback collection
   - Configure analytics tracking
   - Establish improvement workflow
   - Plan first content review cycle

4. **Launch Course**
   - Deploy to production platform
   - Open enrollment
   - Monitor initial student experience
   - Be ready to address issues quickly


## Course Constitution Compliance

### Structure Requirements

Your course MUST meet these minimum standards:

- **Modules**: 4-12 modules per course
- **Lessons**: 3-10 lessons per module
- **Components**: Every lesson must include:
  * Lecture notes (10-20 pages)
  * Video script outline
  * Examples and practice problems
  * Key scriptures or frameworks
  * References and citations

### Assessment Requirements

- **Per-Module**: Micro-assessments (formative)
- **Mid-Course**: Comprehensive assessment (summative)
- **Final**: Capstone project or exam (summative + reflective)

### Integrated Formation

Every course must address all four dimensions:

1. **Knowledge**: Theoretical understanding and concepts
2. **Skill**: Practical application and competence
3. **Character**: Virtue development and spiritual growth
4. **Calling**: Purpose alignment and kingdom governance

### Production Readiness

**Never include in production content**:
- ❌ Placeholder text like "Lorem ipsum" or "[Insert content here]"
- ❌ TODO notes or reminders
- ❌ Example data that should be replaced
- ❌ Incomplete sections or "Coming soon" messages

## Rigor Level Standards

### Beginner Level

- **Audience**: New to the subject, foundational learning
- **Vocabulary**: Basic terms, clear definitions
- **Content**: Introductory concepts, step-by-step guidance
- **Assessments**: Recognition and recall, basic application
- **Examples**: Simple, straightforward scenarios

### Intermediate Level

- **Audience**: Some background, ready for deeper learning
- **Vocabulary**: Technical terms, discipline-specific language
- **Content**: Applied concepts, problem-solving focus
- **Assessments**: Analysis, application, synthesis
- **Examples**: Real-world cases, moderate complexity

### Advanced Level

- **Audience**: Strong foundation, ready for mastery
- **Vocabulary**: Specialized terminology, expert language
- **Content**: Complex theories, frameworks, formulas
- **Assessments**: Evaluation, creation, system design
- **Examples**: Complex scenarios, research-level problems

### Strategic Level

- **Audience**: Experts, governance and leadership focus
- **Vocabulary**: Expert discourse, strategic terminology
- **Content**: Systems thinking, governance frameworks
- **Assessments**: Strategic planning, policy design, civilization building
- **Examples**: Multi-system challenges, nation-level problems


## Scroll Pedagogy Implementation

### The 6-Step Lesson Flow

Every lesson MUST follow this structure:

#### 1. Ignition (Hook + Revelation Trigger)

**Purpose**: Wake the mind and spirit, create curiosity

**Examples**:
- Compelling story or scenario
- Provocative question
- Scripture passage with modern application
- Real-world problem or challenge

**Tips**:
- Make it relevant to student's potential calling
- Create emotional or intellectual engagement
- Set up the "why" before the "what"

#### 2. Download (Concept Teaching)

**Purpose**: Clear explanation of key concepts

**Include**:
- Core concepts and definitions
- Examples and analogies
- Visual aids and diagrams
- Step-by-step explanations

**Tips**:
- Use dual-explanation pattern (conceptual + practical)
- Build from simple to complex
- Connect to prior knowledge

#### 3. Demonstration (Worked Example)

**Purpose**: Show concrete application

**Examples**:
- Coding walkthrough
- Solved equation with steps
- Business case analysis
- Theological exegesis example

**Tips**:
- Think aloud through the process
- Highlight decision points
- Show common mistakes to avoid

#### 4. Activation (Student Practice)

**Purpose**: Students do something with the knowledge

**Activities**:
- Solve a problem
- Design a system
- Write a reflection
- Create an artifact
- Pray through a pattern

**Tips**:
- Make it immediately applicable
- Provide scaffolding for success
- Allow for creativity and exploration

#### 5. Reflection (Identity & Integration)

**Purpose**: Connect learning to who they are and who they're becoming

**Questions to Ask**:
- How does this connect to your calling?
- What does this reveal about God's design?
- How might this transform your sphere of influence?
- What character qualities does this develop?

**Tips**:
- Make it personal, not generic
- Connect to spiritual formation
- Link to kingdom purposes

#### 6. Commission (Next Step / Assignment)

**Purpose**: Clear action to take

**Examples**:
- Complete quiz or assignment
- Apply in workplace or ministry
- Ship a small feature
- Pray through specific area
- Share learning with others

**Tips**:
- Make it specific and actionable
- Set clear expectations
- Provide resources for success


## Real-World Deployment Integration

### Creating Deployment Pathways

Every major concept or skill must have a deployment pathway that specifies:

1. **Real-World Application**
   - How students will apply the learning
   - What systems or communities they'll impact
   - What problems they'll solve

2. **Systems to Transform**
   - Government and policy
   - Business and economy
   - Education and training
   - Technology and innovation
   - Ministry and church
   - Community and culture

3. **Measurable Impact**
   - Specific metrics to track
   - Target outcomes
   - Evidence of transformation

4. **Required Competencies**
   - Skills needed for deployment
   - Knowledge prerequisites
   - Character qualities required

### Example Deployment Pathway

**Concept**: AI Ethics Framework Design

**Real-World Application**: Design and implement ethical AI guidelines for an organization

**Systems to Transform**:
- Corporate governance structures
- Technology development processes
- Stakeholder engagement practices

**Measurable Impact**:
- 5+ policies implemented
- 50+ staff trained
- Ethical review process established

**Required Competencies**:
- Ethical framework design
- Stakeholder communication
- Policy implementation
- Change management

### Connecting Students to Projects

Use the deployment pathway API to create connections:

```bash
POST /api/course-content/deployment-pathways
{
  "moduleId": "module_123",
  "conceptId": "concept_456",
  "description": "Implement AI ethics framework",
  "realWorldApplication": "Design and deploy ethical AI guidelines",
  "systemsToTransform": ["Corporate governance", "Technology development"],
  "measurableImpact": [...],
  "requiredCompetencies": [...]
}
```

## Tips for Success

### Do's

✅ Start with clear learning objectives
✅ Follow the 6-step lesson flow consistently
✅ Integrate spiritual formation naturally
✅ Design for real-world application
✅ Validate early and often
✅ Iterate based on feedback
✅ Maintain elite academic standards
✅ Use AI assistance wisely
✅ Document decisions and rationale
✅ Communicate proactively with team

### Don'ts

❌ Skip validation checkpoints
❌ Use placeholder content in production
❌ Force spiritual integration
❌ Compromise rigor for speed
❌ Ignore Course Constitution requirements
❌ Neglect deployment pathways
❌ Assume without testing
❌ Work in isolation
❌ Rush through quality review
❌ Forget continuous improvement

## Getting Help

### Resources

- **API Documentation**: `/backend/src/docs/course-content-api-documentation.md`
- **Scroll Pedagogy Guide**: `.kiro/steering/scroll-pedagogy-model.md`
- **Course Constitution**: Referenced in design document
- **Technical Support**: Contact development team
- **Spiritual Guidance**: Consult with Spiritual Advisors

### Common Questions

**Q: How do I know if my course meets rigor standards?**
A: Use the rigor validation endpoint and compare against elite institution benchmarks. The system will provide detailed feedback.

**Q: What if spiritual alignment validation fails?**
A: Review the specific errors, attempt auto-correction, or work with a Spiritual Advisor to address theological issues.

**Q: Can I skip the pilot testing phase?**
A: No, pilot testing is required to ensure course effectiveness and identify issues before full launch.

**Q: How do I handle budget overruns?**
A: Contact the Project Manager immediately. The system will alert at 80% budget usage, allowing time to adjust.

**Q: What if I need to change the course structure after approval?**
A: Submit a change request with justification. Significant changes may require re-approval from stakeholders.

