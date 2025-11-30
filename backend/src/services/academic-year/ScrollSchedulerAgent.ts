/**
 * ScrollScheduler Agent Service
 * "To everything there is a season, and a time to every purpose under heaven" - Ecclesiastes 3:1
 * 
 * Task 33: Implement ScrollScheduler agent integration
 * Specialized AI agent for schedule optimization, conflict resolution, resource allocation, and preference handling
 * Requirements: 3.1, 3.2
 */

import { logger } from '../../utils/productionLogger';
import { AIGatewayService } from '../AIGatewayService';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface AgentContext {
  sessionId: string;
  userId?: string;
  role: 'faculty' | 'admin' | 'system';
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

export interface ScheduleOptimizationRequest {
  semesterId: string;
  constraints?: ScheduleConstraints;
  preferences?: SchedulePreferences;
  optimizationGoals?: OptimizationGoal[];
}

export interface ScheduleConstraints {
  maxConsecutiveHours?: number;
  minBreakBetweenClasses?: number;
  preferredTimeSlots?: TimeSlot[];
  blockedTimeSlots?: TimeSlot[];
  roomCapacityRequirements?: Record<string, number>;
  equipmentRequirements?: Record<string, string[]>;
}

export interface SchedulePreferences {
  facultyPreferences?: FacultyPreference[];
  departmentPreferences?: DepartmentPreference[];
  studentPreferences?: StudentPreference[];
}

export interface FacultyPreference {
  facultyId: string;
  preferredDays?: string[];
  preferredTimes?: TimeSlot[];
  avoidDays?: string[];
  avoidTimes?: TimeSlot[];
  maxDailyHours?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface DepartmentPreference {
  departmentId: string;
  preferredBuildings?: string[];
  clusterCourses?: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface StudentPreference {
  preferredTimeSlots?: TimeSlot[];
  avoidBackToBackCourses?: boolean;
  maxDailyHours?: number;
}

export interface TimeSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface OptimizationGoal {
  type: 'minimize_conflicts' | 'maximize_utilization' | 'balance_workload' | 'respect_preferences' | 'minimize_gaps';
  weight: number;
  priority: number;
}

export interface ScheduleConflict {
  conflictId: string;
  type: 'time_overlap' | 'room_double_booking' | 'faculty_overload' | 'resource_unavailable' | 'preference_violation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedEntities: {
    courses?: string[];
    faculty?: string[];
    rooms?: string[];
    students?: string[];
  };
  suggestedResolutions: ConflictResolution[];
}

export interface ConflictResolution {
  resolutionId: string;
  strategy: 'reschedule' | 'reassign_room' | 'reassign_faculty' | 'split_section' | 'adjust_capacity';
  description: string;
  impact: {
    affectedCount: number;
    preferenceViolations: number;
    costEstimate: number;
  };
  confidence: number;
}

export interface ResourceAllocation {
  resourceType: 'room' | 'equipment' | 'faculty' | 'time_slot';
  resourceId: string;
  allocatedTo: string;
  timeSlot: TimeSlot;
  utilizationRate: number;
  conflicts: string[];
}

export interface OptimizedSchedule {
  scheduleId: string;
  semesterId: string;
  assignments: ScheduleAssignment[];
  metrics: ScheduleMetrics;
  conflicts: ScheduleConflict[];
  recommendations: string[];
  confidence: number;
  generatedAt: Date;
}

export interface ScheduleAssignment {
  assignmentId: string;
  courseId: string;
  facultyId: string;
  roomId: string;
  timeSlot: TimeSlot;
  capacity: number;
  enrollmentCount: number;
}

export interface ScheduleMetrics {
  totalAssignments: number;
  conflictCount: number;
  roomUtilization: number;
  facultyUtilization: number;
  preferencesSatisfied: number;
  preferencesTotal: number;
  optimizationScore: number;
}

// =====================================================
// SCROLLSCHEDULER AGENT
// =====================================================

export class ScrollSchedulerAgent {
  private aiGateway: AIGatewayService;
  private contexts: Map<string, AgentContext> = new Map();

  constructor() {
    this.aiGateway = new AIGatewayService();
    logger.info('ScrollScheduler Agent initialized');
  }

  /**
   * Create or retrieve agent context for a session
   */
  async getOrCreateContext(
    sessionId: string,
    userId?: string,
    role: 'faculty' | 'admin' | 'system' = 'system'
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
   * Optimize teaching assignments for a semester
   * Requirements: 3.1, 3.2
   */
  async optimizeTeachingAssignments(
    request: ScheduleOptimizationRequest,
    sessionId?: string
  ): Promise<OptimizedSchedule> {
    try {
      logger.info('Optimizing teaching assignments', {
        semesterId: request.semesterId
      });

      const context = sessionId
        ? await this.getOrCreateContext(sessionId, undefined, 'system')
        : null;

      // Fetch semester data
      const { data: semester } = await supabase
        .from('semesters')
        .select('*')
        .eq('id', request.semesterId)
        .single();

      if (!semester) {
        throw new Error('Semester not found');
      }

      // Fetch faculty and their current assignments
      const { data: faculty } = await supabase
        .from('faculty_profiles')
        .select('*')
        .eq('is_active', true);

      // Fetch courses needing assignment
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true);

      // Fetch existing assignments
      const { data: existingAssignments } = await supabase
        .from('teaching_assignments')
        .select('*')
        .eq('semester_id', request.semesterId);

      // Build optimization prompt
      const systemPrompt = `You are ScrollScheduler, an AI agent for Scroll University's scheduling system.
Your role is to optimize teaching assignments considering faculty workload, preferences, qualifications, and institutional constraints.
Always prioritize academic excellence, faculty well-being, and student success.
Provide clear reasoning for your recommendations.`;

      const userPrompt = this.buildOptimizationPrompt(
        semester,
        faculty || [],
        courses || [],
        existingAssignments || [],
        request
      );

      const response = await this.aiGateway.generateContent({
        model: 'gpt-4',
        prompt: userPrompt,
        systemPrompt,
        maxTokens: 3000,
        temperature: 0.5
      });

      // Parse AI response and create optimized schedule
      const optimizedSchedule = this.parseOptimizationResponse(
        response.content,
        request.semesterId,
        faculty || [],
        courses || []
      );

      if (context) {
        this.addToHistory(context, 'user', `Optimize teaching assignments for semester ${request.semesterId}`);
        this.addToHistory(context, 'assistant', `Generated optimized schedule with ${optimizedSchedule.assignments.length} assignments`);
      }

      logger.info('Teaching assignments optimized', {
        semesterId: request.semesterId,
        assignmentCount: optimizedSchedule.assignments.length,
        conflictCount: optimizedSchedule.conflicts.length,
        optimizationScore: optimizedSchedule.metrics.optimizationScore
      });

      return optimizedSchedule;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error optimizing teaching assignments', {
        error: errorMessage,
        semesterId: request.semesterId
      });
      throw new Error(`Failed to optimize teaching assignments: ${errorMessage}`);
    }
  }

  /**
   * Detect and resolve scheduling conflicts
   * Requirements: 3.1
   */
  async resolveConflicts(
    semesterId: string,
    sessionId?: string
  ): Promise<{
    conflicts: ScheduleConflict[];
    resolutions: ConflictResolution[];
    autoResolved: number;
    requiresManualReview: number;
  }> {
    try {
      logger.info('Resolving scheduling conflicts', { semesterId });

      const context = sessionId
        ? await this.getOrCreateContext(sessionId, undefined, 'admin')
        : null;

      // Fetch all assignments for the semester
      const { data: assignments } = await supabase
        .from('teaching_assignments')
        .select(`
          *,
          faculty:faculty_profiles(*),
          course:courses(*)
        `)
        .eq('semester_id', semesterId);

      // Detect conflicts
      const conflicts = await this.detectConflicts(assignments || []);

      // Generate AI-powered resolutions
      const systemPrompt = `You are ScrollScheduler, an AI agent specializing in conflict resolution for academic scheduling.
Analyze conflicts and provide practical, fair resolutions that minimize disruption.
Consider faculty preferences, student needs, and institutional constraints.`;

      const userPrompt = this.buildConflictResolutionPrompt(conflicts, assignments || []);

      const response = await this.aiGateway.generateContent({
        model: 'gpt-4',
        prompt: userPrompt,
        systemPrompt,
        maxTokens: 2500,
        temperature: 0.6
      });

      const resolutions = this.parseConflictResolutions(response.content, conflicts);

      // Categorize resolutions
      const autoResolved = resolutions.filter(r => r.confidence > 0.9).length;
      const requiresManualReview = resolutions.filter(r => r.confidence <= 0.9).length;

      if (context) {
        this.addToHistory(context, 'user', `Resolve conflicts for semester ${semesterId}`);
        this.addToHistory(context, 'assistant', `Found ${conflicts.length} conflicts, generated ${resolutions.length} resolutions`);
      }

      logger.info('Conflicts resolved', {
        semesterId,
        totalConflicts: conflicts.length,
        autoResolved,
        requiresManualReview
      });

      return {
        conflicts,
        resolutions,
        autoResolved,
        requiresManualReview
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error resolving conflicts', {
        error: errorMessage,
        semesterId
      });
      throw new Error(`Failed to resolve conflicts: ${errorMessage}`);
    }
  }

  /**
   * Allocate resources (rooms, equipment, time slots)
   * Requirements: 3.1
   */
  async allocateResources(
    semesterId: string,
    resourceType: 'room' | 'equipment' | 'time_slot',
    sessionId?: string
  ): Promise<ResourceAllocation[]> {
    try {
      logger.info('Allocating resources', { semesterId, resourceType });

      const context = sessionId
        ? await this.getOrCreateContext(sessionId, undefined, 'admin')
        : null;

      // Fetch resource availability
      const resources = await this.fetchAvailableResources(semesterId, resourceType);

      // Fetch resource requirements
      const requirements = await this.fetchResourceRequirements(semesterId, resourceType);

      // Build allocation prompt
      const systemPrompt = `You are ScrollScheduler, an AI agent for resource allocation in academic scheduling.
Optimize resource utilization while ensuring all requirements are met.
Consider capacity, location, equipment needs, and accessibility.`;

      const userPrompt = this.buildResourceAllocationPrompt(
        resources,
        requirements,
        resourceType
      );

      const response = await this.aiGateway.generateContent({
        model: 'gpt-4',
        prompt: userPrompt,
        systemPrompt,
        maxTokens: 2000,
        temperature: 0.4
      });

      const allocations = this.parseResourceAllocations(response.content, resourceType);

      if (context) {
        this.addToHistory(context, 'user', `Allocate ${resourceType} resources for semester ${semesterId}`);
        this.addToHistory(context, 'assistant', `Allocated ${allocations.length} ${resourceType} resources`);
      }

      logger.info('Resources allocated', {
        semesterId,
        resourceType,
        allocationCount: allocations.length
      });

      return allocations;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error allocating resources', {
        error: errorMessage,
        semesterId,
        resourceType
      });
      throw new Error(`Failed to allocate resources: ${errorMessage}`);
    }
  }

  /**
   * Handle faculty and student preferences
   * Requirements: 3.2
   */
  async handlePreferences(
    semesterId: string,
    preferences: SchedulePreferences,
    sessionId?: string
  ): Promise<{
    satisfiedPreferences: number;
    totalPreferences: number;
    satisfactionRate: number;
    unsatisfiedPreferences: Array<{
      type: string;
      entityId: string;
      reason: string;
      alternatives: string[];
    }>;
  }> {
    try {
      logger.info('Handling scheduling preferences', {
        semesterId,
        facultyPreferences: preferences.facultyPreferences?.length || 0,
        departmentPreferences: preferences.departmentPreferences?.length || 0
      });

      const context = sessionId
        ? await this.getOrCreateContext(sessionId, undefined, 'admin')
        : null;

      // Fetch current schedule
      const { data: currentSchedule } = await supabase
        .from('teaching_assignments')
        .select('*')
        .eq('semester_id', semesterId);

      // Build preference analysis prompt
      const systemPrompt = `You are ScrollScheduler, an AI agent for preference management in academic scheduling.
Analyze preferences and provide recommendations for maximizing satisfaction while maintaining schedule integrity.
Balance individual preferences with institutional needs.`;

      const userPrompt = this.buildPreferenceHandlingPrompt(
        preferences,
        currentSchedule || []
      );

      const response = await this.aiGateway.generateContent({
        model: 'gpt-4',
        prompt: userPrompt,
        systemPrompt,
        maxTokens: 2000,
        temperature: 0.6
      });

      const analysis = this.parsePreferenceAnalysis(response.content, preferences);

      if (context) {
        this.addToHistory(context, 'user', `Analyze preferences for semester ${semesterId}`);
        this.addToHistory(context, 'assistant', `Satisfaction rate: ${analysis.satisfactionRate.toFixed(1)}%`);
      }

      logger.info('Preferences handled', {
        semesterId,
        satisfactionRate: analysis.satisfactionRate,
        unsatisfiedCount: analysis.unsatisfiedPreferences.length
      });

      return analysis;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error handling preferences', {
        error: errorMessage,
        semesterId
      });
      throw new Error(`Failed to handle preferences: ${errorMessage}`);
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private buildOptimizationPrompt(
    semester: any,
    faculty: any[],
    courses: any[],
    existingAssignments: any[],
    request: ScheduleOptimizationRequest
  ): string {
    return `
Optimize teaching assignments for ${semester.name} (${semester.semester_type}).

**Faculty Available:** ${faculty.length} faculty members
**Courses to Assign:** ${courses.length} courses
**Existing Assignments:** ${existingAssignments.length}

**Optimization Goals:**
${request.optimizationGoals?.map(g => `- ${g.type} (weight: ${g.weight}, priority: ${g.priority})`).join('\n') || '- Minimize conflicts\n- Balance workload\n- Respect preferences'}

**Constraints:**
${request.constraints ? JSON.stringify(request.constraints, null, 2) : 'Standard constraints apply'}

**Faculty Summary:**
${faculty.slice(0, 10).map(f => `- ${f.first_name} ${f.last_name}: Max ${f.max_courses || 4} courses, ${f.max_credits || 12} credits`).join('\n')}
${faculty.length > 10 ? `... and ${faculty.length - 10} more faculty` : ''}

Provide an optimized assignment plan that:
1. Balances workload across faculty
2. Respects faculty qualifications and preferences
3. Minimizes scheduling conflicts
4. Maximizes resource utilization
5. Maintains academic quality

Format response as JSON with:
{
  "assignments": [{"courseId": "...", "facultyId": "...", "reasoning": "..."}],
  "metrics": {"optimizationScore": 85, "conflictCount": 2},
  "recommendations": ["recommendation 1", "recommendation 2"]
}
    `.trim();
  }

  private buildConflictResolutionPrompt(
    conflicts: ScheduleConflict[],
    assignments: any[]
  ): string {
    return `
Analyze and resolve the following scheduling conflicts:

**Total Conflicts:** ${conflicts.length}

**Conflicts by Severity:**
- Critical: ${conflicts.filter(c => c.severity === 'critical').length}
- High: ${conflicts.filter(c => c.severity === 'high').length}
- Medium: ${conflicts.filter(c => c.severity === 'medium').length}
- Low: ${conflicts.filter(c => c.severity === 'low').length}

**Conflict Details:**
${conflicts.slice(0, 5).map(c => `
- ${c.type} (${c.severity}): ${c.description}
  Affected: ${JSON.stringify(c.affectedEntities)}
`).join('\n')}
${conflicts.length > 5 ? `... and ${conflicts.length - 5} more conflicts` : ''}

For each conflict, provide:
1. Resolution strategy
2. Impact assessment
3. Implementation steps
4. Confidence level (0-1)

Format as JSON array of resolutions.
    `.trim();
  }

  private buildResourceAllocationPrompt(
    resources: any[],
    requirements: any[],
    resourceType: string
  ): string {
    return `
Allocate ${resourceType} resources optimally:

**Available Resources:** ${resources.length}
**Requirements:** ${requirements.length}

**Resource Details:**
${resources.slice(0, 10).map(r => `- ${r.id}: Capacity ${r.capacity || 'N/A'}, Features: ${r.features || 'Standard'}`).join('\n')}

**Requirements:**
${requirements.slice(0, 10).map(r => `- ${r.courseId}: Needs capacity ${r.requiredCapacity}, Features: ${r.requiredFeatures || 'Standard'}`).join('\n')}

Optimize for:
1. Maximum utilization
2. Minimal conflicts
3. Appropriate capacity matching
4. Feature requirements satisfaction

Format as JSON array of allocations.
    `.trim();
  }

  private buildPreferenceHandlingPrompt(
    preferences: SchedulePreferences,
    currentSchedule: any[]
  ): string {
    const facultyPrefCount = preferences.facultyPreferences?.length || 0;
    const deptPrefCount = preferences.departmentPreferences?.length || 0;

    return `
Analyze scheduling preferences and current schedule:

**Faculty Preferences:** ${facultyPrefCount}
**Department Preferences:** ${deptPrefCount}
**Current Assignments:** ${currentSchedule.length}

**Sample Faculty Preferences:**
${preferences.facultyPreferences?.slice(0, 5).map(p => `
- Faculty ${p.facultyId}:
  Preferred Days: ${p.preferredDays?.join(', ') || 'Any'}
  Avoid Days: ${p.avoidDays?.join(', ') || 'None'}
  Priority: ${p.priority}
`).join('\n') || 'None specified'}

Analyze:
1. How many preferences can be satisfied?
2. Which preferences conflict with each other?
3. What alternatives exist for unsatisfied preferences?
4. Overall satisfaction rate

Format as JSON with satisfaction analysis.
    `.trim();
  }

  private async detectConflicts(assignments: any[]): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = [];

    // Check for time overlaps
    for (let i = 0; i < assignments.length; i++) {
      for (let j = i + 1; j < assignments.length; j++) {
        const a1 = assignments[i];
        const a2 = assignments[j];

        // Same faculty, overlapping times
        if (a1.faculty_id === a2.faculty_id) {
          conflicts.push({
            conflictId: `conflict-${Date.now()}-${i}-${j}`,
            type: 'time_overlap',
            severity: 'high',
            description: `Faculty ${a1.faculty_id} assigned to overlapping courses`,
            affectedEntities: {
              courses: [a1.course_id, a2.course_id],
              faculty: [a1.faculty_id]
            },
            suggestedResolutions: []
          });
        }
      }
    }

    return conflicts;
  }

  private async fetchAvailableResources(
    semesterId: string,
    resourceType: string
  ): Promise<any[]> {
    // Simplified - in production, fetch from appropriate tables
    return [];
  }

  private async fetchResourceRequirements(
    semesterId: string,
    resourceType: string
  ): Promise<any[]> {
    // Simplified - in production, fetch from course requirements
    return [];
  }

  private parseOptimizationResponse(
    content: string,
    semesterId: string,
    faculty: any[],
    courses: any[]
  ): OptimizedSchedule {
    try {
      const parsed = JSON.parse(content);

      return {
        scheduleId: `schedule-${Date.now()}`,
        semesterId,
        assignments: parsed.assignments || [],
        metrics: {
          totalAssignments: parsed.assignments?.length || 0,
          conflictCount: parsed.metrics?.conflictCount || 0,
          roomUtilization: parsed.metrics?.roomUtilization || 0,
          facultyUtilization: parsed.metrics?.facultyUtilization || 0,
          preferencesSatisfied: parsed.metrics?.preferencesSatisfied || 0,
          preferencesTotal: parsed.metrics?.preferencesTotal || 0,
          optimizationScore: parsed.metrics?.optimizationScore || 0
        },
        conflicts: [],
        recommendations: parsed.recommendations || [],
        confidence: 0.85,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error parsing optimization response', { error });
      return {
        scheduleId: `schedule-${Date.now()}`,
        semesterId,
        assignments: [],
        metrics: {
          totalAssignments: 0,
          conflictCount: 0,
          roomUtilization: 0,
          facultyUtilization: 0,
          preferencesSatisfied: 0,
          preferencesTotal: 0,
          optimizationScore: 0
        },
        conflicts: [],
        recommendations: ['Failed to parse optimization response'],
        confidence: 0,
        generatedAt: new Date()
      };
    }
  }

  private parseConflictResolutions(
    content: string,
    conflicts: ScheduleConflict[]
  ): ConflictResolution[] {
    try {
      const parsed = JSON.parse(content);
      return (parsed.resolutions || parsed || []).map((r: any, index: number) => ({
        resolutionId: `resolution-${Date.now()}-${index}`,
        strategy: r.strategy || 'reschedule',
        description: r.description || '',
        impact: r.impact || { affectedCount: 0, preferenceViolations: 0, costEstimate: 0 },
        confidence: r.confidence || 0.7
      }));
    } catch (error) {
      logger.error('Error parsing conflict resolutions', { error });
      return [];
    }
  }

  private parseResourceAllocations(
    content: string,
    resourceType: string
  ): ResourceAllocation[] {
    try {
      const parsed = JSON.parse(content);
      return (parsed.allocations || parsed || []).map((a: any) => ({
        resourceType,
        resourceId: a.resourceId || '',
        allocatedTo: a.allocatedTo || '',
        timeSlot: a.timeSlot || { dayOfWeek: '', startTime: '', endTime: '' },
        utilizationRate: a.utilizationRate || 0,
        conflicts: a.conflicts || []
      }));
    } catch (error) {
      logger.error('Error parsing resource allocations', { error });
      return [];
    }
  }

  private parsePreferenceAnalysis(
    content: string,
    preferences: SchedulePreferences
  ): {
    satisfiedPreferences: number;
    totalPreferences: number;
    satisfactionRate: number;
    unsatisfiedPreferences: Array<{
      type: string;
      entityId: string;
      reason: string;
      alternatives: string[];
    }>;
  } {
    try {
      const parsed = JSON.parse(content);
      return {
        satisfiedPreferences: parsed.satisfiedPreferences || 0,
        totalPreferences: parsed.totalPreferences || 0,
        satisfactionRate: parsed.satisfactionRate || 0,
        unsatisfiedPreferences: parsed.unsatisfiedPreferences || []
      };
    } catch (error) {
      logger.error('Error parsing preference analysis', { error });
      return {
        satisfiedPreferences: 0,
        totalPreferences: 0,
        satisfactionRate: 0,
        unsatisfiedPreferences: []
      };
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

export default new ScrollSchedulerAgent();
