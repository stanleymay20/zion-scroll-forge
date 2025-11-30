/**
 * ScrollRegistrar Agent Service
 * "For I know the plans I have for you, declares the Lord" - Jeremiah 29:11
 * 
 * Task 29: Implement ScrollRegistrar agent integration
 * Specialized AI agent for academic registration, admissions, and student records
 * Requirements: 2.1, 2.2
 */

import { logger } from '../../utils/productionLogger';
import { AIGatewayService } from '../AIGatewayService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AgentContext {
  sessionId: string;
  userId?: string;
  role: 'student' | 'faculty' | 'admin' | 'system';
  conversationHistory: AgentMessage[];
  metadata: Record<string, any>;
  createdAt: Date;
  lastUpdated: Date;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AdmissionLetterRequest {
  applicantName: string;
  program: string;
  decisionDate: Date;
  decision: 'accepted' | 'conditional' | 'waitlisted' | 'rejected';
  conditions?: string[];
  spiritualEvaluation?: any;
  startDate?: Date;
  scholarshipInfo?: string;
}

export interface TranscriptRequest {
  studentId: string;
  includeInProgress?: boolean;
  officialFormat?: boolean;
  purpose?: string;
}

export interface PrerequisiteValidationRequest {
  studentId: string;
  courseId: string;
  detailedAnalysis?: boolean;
}

export interface AdmissionLetterResponse {
  letter: string;
  confidence: number;
  reviewRequired: boolean;
  generatedAt: Date;
}

export interface TranscriptResponse {
  transcript: string;
  format: 'pdf' | 'json' | 'text';
  generatedAt: Date;
  officialSeal?: string;
}

export interface PrerequisiteValidationResponse {
  isEligible: boolean;
  missingPrerequisites: string[];
  recommendations: string[];
  confidence: number;
}

export interface RegistrationGuidanceRequest {
  studentId: string;
  semester: string;
  academicGoals?: string[];
}

export interface RegistrationGuidanceResponse {
  recommendedCourses: Array<{
    courseId: string;
    courseName: string;
    reason: string;
    priority: number;
  }>;
  warnings: string[];
  guidance: string;
  confidence: number;
}

export class ScrollRegistrarAgent {
  private aiGateway: AIGatewayService;
  private contexts: Map<string, AgentContext> = new Map();

  constructor() {
    this.aiGateway = new AIGatewayService();
    logger.info('ScrollRegistrar Agent initialized');
  }

  /**
   * Create or retrieve agent context for a session
   * Manages conversation history and user context
   */
  async getOrCreateContext(
    sessionId: string,
    userId?: string,
    role: 'student' | 'faculty' | 'admin' | 'system' = 'system'
  ): Promise<AgentContext> {
    if (this.contexts.has(sessionId)) {
      const context = this.contexts.get(sessionId)!;
      context.lastUpdated = new Date();
      return context;
    }

    const context: AgentContext = {
      sessionId,
      userId,
      role,
      conversationHistory: [],
      metadata: {},
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.contexts.set(sessionId, context);
    logger.info('Agent context created', { sessionId, userId, role });

    return context;
  }

  /**
   * Add message to conversation history
   */
  private addToHistory(
    context: AgentContext,
    role: 'system' | 'user' | 'assistant',
    content: string,
    metadata?: Record<string, any>
  ): void {
    context.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
      metadata
    });

    // Keep only last 20 messages to manage context size
    if (context.conversationHistory.length > 20) {
      context.conversationHistory = context.conversationHistory.slice(-20);
    }

    context.lastUpdated = new Date();
  }

  /**
   * Generate personalized admission letter
   * Requirements: 2.1
   */
  async generateAdmissionLetter(
    request: AdmissionLetterRequest,
    sessionId?: string
  ): Promise<string> {
    try {
      logger.info('Generating admission letter', { 
        applicant: request.applicantName,
        program: request.program,
        decision: request.decision
      });

      const context = sessionId 
        ? await this.getOrCreateContext(sessionId, undefined, 'system')
        : null;

      const systemPrompt = `You are ScrollRegistrar, an AI agent for Scroll University's admissions office.
Your role is to generate warm, professional, and spiritually-aligned admission letters.
You understand the importance of spiritual formation alongside academic excellence.
Always maintain a tone that is encouraging, Christ-centered, and professionally appropriate.`;


      const userPrompt = `Generate a personalized admission letter for ${request.applicantName} who has been ${request.decision} to ${request.program}.

Decision Details:
- Decision: ${request.decision}
- Program: ${request.program}
- Decision Date: ${request.decisionDate.toLocaleDateString()}
${request.startDate ? `- Start Date: ${request.startDate.toLocaleDateString()}` : ''}
${request.conditions && request.conditions.length > 0 ? `- Conditions: ${request.conditions.join(', ')}` : ''}
${request.scholarshipInfo ? `- Scholarship: ${request.scholarshipInfo}` : ''}

The letter should include:
1. Warm congratulations and welcome (if accepted)
2. Acknowledgment of their spiritual journey and calling
3. Program details and key dates
4. Any admission conditions or next steps
5. Spiritual formation expectations at Scroll University
6. Contact information for questions
7. Encouragement for their academic and spiritual journey

Make the letter professional, encouraging, and aligned with Christian values.
Use proper business letter format with appropriate salutations and closings.`;

      const response = await this.aiGateway.generateContent({
        model: 'gpt-4',
        prompt: userPrompt,
        systemPrompt,
        maxTokens: 1500,
        temperature: 0.7
      });

      if (context) {
        this.addToHistory(context, 'user', `Generate admission letter for ${request.applicantName}`);
        this.addToHistory(context, 'assistant', response.content);
      }

      logger.info('Admission letter generated successfully', {
        applicant: request.applicantName,
        tokensUsed: response.usage.totalTokens
      });

      return response.content;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error generating admission letter', { 
        error: errorMessage,
        applicant: request.applicantName
      });
      throw new Error(`Failed to generate admission letter: ${errorMessage}`);
    }
  }


  /**
   * Generate official academic transcript
   * Requirements: 2.1
   */
  async generateTranscript(
    request: TranscriptRequest,
    sessionId?: string
  ): Promise<{
    transcript: string;
    metadata: {
      studentId: string;
      generatedAt: Date;
      isOfficial: boolean;
      totalCredits: number;
      gpa: number;
    };
  }> {
    try {
      logger.info('Generating transcript', { 
        studentId: request.studentId,
        official: request.officialFormat
      });

      const context = sessionId 
        ? await this.getOrCreateContext(sessionId, request.studentId, 'student')
        : null;

      // Fetch student information
      const studentResult = await prisma.$queryRaw<Array<{
        id: string;
        user_id: string;
        student_id: string;
        admission_date: Date;
        academic_standing: string;
        gpa: number;
        total_credits_earned: number;
      }>>`
        SELECT id, user_id, student_id, admission_date, academic_standing, gpa, total_credits_earned
        FROM students
        WHERE id = ${request.studentId}::uuid
        LIMIT 1
      `;

      if (studentResult.length === 0) {
        throw new Error('Student not found');
      }

      const student = studentResult[0];

      // Fetch user details
      const userResult = await prisma.$queryRaw<Array<{
        id: string;
        email: string;
        full_name: string;
      }>>`
        SELECT id, email, full_name
        FROM users
        WHERE id = ${student.user_id}::uuid
        LIMIT 1
      `;

      const user = userResult[0];

      // Fetch enrollment history
      const enrollmentsResult = await prisma.$queryRaw<Array<{
        course_id: string;
        semester_id: string;
        enrollment_status: string;
        grade: string | null;
        credits: number;
        enrollment_date: Date;
      }>>`
        SELECT course_id, semester_id, enrollment_status, grade, credits, enrollment_date
        FROM course_enrollments
        WHERE student_id = ${request.studentId}::uuid
        ${request.includeInProgress ? '' : `AND enrollment_status = 'completed'`}
        ORDER BY enrollment_date ASC
      `;


      // Format course history for transcript
      const courseHistory = await Promise.all(
        enrollmentsResult.map(async (enrollment) => {
          const courseResult = await prisma.$queryRaw<Array<{
            title: string;
            course_code: string;
          }>>`
            SELECT title, course_code
            FROM courses
            WHERE id = ${enrollment.course_id}::uuid
            LIMIT 1
          `;

          const semesterResult = await prisma.$queryRaw<Array<{
            name: string;
            semester_type: string;
          }>>`
            SELECT name, semester_type
            FROM semesters
            WHERE id = ${enrollment.semester_id}::uuid
            LIMIT 1
          `;

          return {
            courseCode: courseResult[0]?.course_code || 'N/A',
            courseTitle: courseResult[0]?.title || 'Unknown Course',
            semester: semesterResult[0]?.name || 'Unknown Semester',
            credits: enrollment.credits,
            grade: enrollment.grade || (enrollment.enrollment_status === 'enrolled' ? 'IP' : 'N/A'),
            status: enrollment.enrollment_status
          };
        })
      );

      const systemPrompt = `You are ScrollRegistrar, an AI agent for Scroll University's registrar office.
Your role is to generate official academic transcripts that are accurate, professional, and properly formatted.
${request.officialFormat ? 'This is an OFFICIAL transcript and must include all required legal and institutional information.' : 'This is an unofficial transcript for student reference.'}`;

      const userPrompt = `Generate an academic transcript for:

Student Information:
- Student ID: ${student.student_id}
- Name: ${user.full_name}
- Email: ${user.email}
- Admission Date: ${student.admission_date.toLocaleDateString()}
- Academic Standing: ${student.academic_standing}
- Cumulative GPA: ${student.gpa.toFixed(2)}
- Total Credits Earned: ${student.total_credits_earned}

Course History:
${courseHistory.map(course => 
  `- ${course.courseCode}: ${course.courseTitle} (${course.semester}) - ${course.credits} credits - Grade: ${course.grade}`
).join('\n')}

${request.purpose ? `Purpose: ${request.purpose}` : ''}

Format the transcript professionally with:
1. University header and official seal notation
2. Student identification information
3. Course history organized by semester
4. Credit and GPA calculations
5. Academic standing and honors (if applicable)
6. ${request.officialFormat ? 'Official certification statement and registrar signature line' : 'Unofficial transcript disclaimer'}
7. Date of generation

Make it clear, accurate, and professionally formatted.`;


      const response = await this.aiGateway.generateContent({
        model: 'gpt-4',
        prompt: userPrompt,
        systemPrompt,
        maxTokens: 2000,
        temperature: 0.3 // Lower temperature for more consistent formatting
      });

      if (context) {
        this.addToHistory(context, 'user', `Generate transcript for student ${student.student_id}`);
        this.addToHistory(context, 'assistant', 'Transcript generated successfully');
      }

      logger.info('Transcript generated successfully', {
        studentId: request.studentId,
        tokensUsed: response.usage.totalTokens,
        official: request.officialFormat
      });

      return {
        transcript: response.content,
        metadata: {
          studentId: request.studentId,
          generatedAt: new Date(),
          isOfficial: request.officialFormat || false,
          totalCredits: student.total_credits_earned,
          gpa: student.gpa
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error generating transcript', { 
        error: errorMessage,
        studentId: request.studentId
      });
      throw new Error(`Failed to generate transcript: ${errorMessage}`);
    }
  }


  /**
   * Validate prerequisites with detailed analysis
   * Requirements: 2.2
   */
  async validatePrerequisites(
    request: PrerequisiteValidationRequest,
    sessionId?: string
  ): Promise<{
    eligible: boolean;
    missingPrerequisites: Array<{
      courseId: string;
      courseCode: string;
      courseTitle: string;
      reason: string;
    }>;
    completedPrerequisites: Array<{
      courseId: string;
      courseCode: string;
      courseTitle: string;
      grade: string;
      completedDate: Date;
    }>;
    recommendations?: string;
  }> {
    try {
      logger.info('Validating prerequisites', { 
        studentId: request.studentId,
        courseId: request.courseId
      });

      const context = sessionId 
        ? await this.getOrCreateContext(sessionId, request.studentId, 'student')
        : null;

      // Get course prerequisites
      const courseResult = await prisma.$queryRaw<Array<{
        id: string;
        course_code: string;
        title: string;
        prerequisites: string | null;
      }>>`
        SELECT id, course_code, title, prerequisites
        FROM courses
        WHERE id = ${request.courseId}::uuid
        LIMIT 1
      `;

      if (courseResult.length === 0) {
        throw new Error('Course not found');
      }

      const course = courseResult[0];

      // Parse prerequisites
      let prerequisiteIds: string[] = [];
      if (course.prerequisites) {
        try {
          prerequisiteIds = Array.isArray(course.prerequisites)
            ? course.prerequisites
            : JSON.parse(course.prerequisites as string);
        } catch (e) {
          prerequisiteIds = [];
        }
      }

      if (prerequisiteIds.length === 0) {
        return {
          eligible: true,
          missingPrerequisites: [],
          completedPrerequisites: [],
          recommendations: 'No prerequisites required for this course.'
        };
      }

      // Get student's completed courses
      const completedCoursesResult = await prisma.$queryRaw<Array<{
        course_id: string;
        grade: string;
        enrollment_date: Date;
      }>>`
        SELECT course_id, grade, enrollment_date
        FROM course_enrollments
        WHERE student_id = ${request.studentId}::uuid
          AND enrollment_status = 'completed'
          AND grade IN ('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'P')
      `;

      const completedIds = completedCoursesResult.map(c => c.course_id);


      // Identify missing prerequisites
      const missingIds = prerequisiteIds.filter(id => !completedIds.includes(id));

      // Get details for missing prerequisites
      const missingPrerequisites = await Promise.all(
        missingIds.map(async (id) => {
          const prereqResult = await prisma.$queryRaw<Array<{
            id: string;
            course_code: string;
            title: string;
          }>>`
            SELECT id, course_code, title
            FROM courses
            WHERE id = ${id}::uuid
            LIMIT 1
          `;

          return {
            courseId: id,
            courseCode: prereqResult[0]?.course_code || 'N/A',
            courseTitle: prereqResult[0]?.title || 'Unknown Course',
            reason: 'Not completed with passing grade'
          };
        })
      );

      // Get details for completed prerequisites
      const completedPrerequisites = await Promise.all(
        prerequisiteIds
          .filter(id => completedIds.includes(id))
          .map(async (id) => {
            const enrollment = completedCoursesResult.find(c => c.course_id === id)!;
            const prereqResult = await prisma.$queryRaw<Array<{
              course_code: string;
              title: string;
            }>>`
              SELECT course_code, title
              FROM courses
              WHERE id = ${id}::uuid
              LIMIT 1
            `;

            return {
              courseId: id,
              courseCode: prereqResult[0]?.course_code || 'N/A',
              courseTitle: prereqResult[0]?.title || 'Unknown Course',
              grade: enrollment.grade,
              completedDate: enrollment.enrollment_date
            };
          })
      );

      const eligible = missingPrerequisites.length === 0;

      // Generate AI recommendations if detailed analysis requested
      let recommendations: string | undefined;
      if (request.detailedAnalysis && !eligible) {
        const systemPrompt = `You are ScrollRegistrar, an AI agent for Scroll University's registrar office.
Provide helpful, encouraging guidance to students about prerequisite requirements.`;

        const userPrompt = `A student wants to enroll in ${course.course_code}: ${course.title}.

Missing Prerequisites:
${missingPrerequisites.map(p => `- ${p.courseCode}: ${p.courseTitle}`).join('\n')}

Completed Prerequisites:
${completedPrerequisites.map(p => `- ${p.courseCode}: ${p.courseTitle} (Grade: ${p.grade})`).join('\n')}

Provide brief, encouraging recommendations for the student including:
1. Why these prerequisites are important
2. Suggested order for completing missing prerequisites
3. Alternative courses they might consider
4. Encouragement for their academic journey

Keep it concise (3-4 sentences).`;


        const response = await this.aiGateway.generateContent({
          model: 'gpt-4',
          prompt: userPrompt,
          systemPrompt,
          maxTokens: 300,
          temperature: 0.7
        });

        recommendations = response.content;
      }

      if (context) {
        this.addToHistory(
          context,
          'user',
          `Validate prerequisites for ${course.course_code}`
        );
        this.addToHistory(
          context,
          'assistant',
          eligible 
            ? 'All prerequisites met' 
            : `Missing ${missingPrerequisites.length} prerequisite(s)`
        );
      }

      logger.info('Prerequisites validated', {
        studentId: request.studentId,
        courseId: request.courseId,
        eligible,
        missingCount: missingPrerequisites.length
      });

      return {
        eligible,
        missingPrerequisites,
        completedPrerequisites,
        recommendations
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error validating prerequisites', { 
        error: errorMessage,
        studentId: request.studentId,
        courseId: request.courseId
      });
      throw new Error(`Failed to validate prerequisites: ${errorMessage}`);
    }
  }

  /**
   * Clear agent context (for session cleanup)
   */
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
    logger.info('Agent context cleared', { sessionId });
  }

  /**
   * Get context statistics
   */
  getContextStats(): {
    activeContexts: number;
    totalMessages: number;
  } {
    let totalMessages = 0;
    this.contexts.forEach(context => {
      totalMessages += context.conversationHistory.length;
    });

    return {
      activeContexts: this.contexts.size,
      totalMessages
    };
  }
}

export default new ScrollRegistrarAgent();

