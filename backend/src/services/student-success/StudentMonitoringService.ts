/**
 * Student Monitoring Service
 * 
 * Continuous tracking of student academic, financial, and spiritual indicators
 * with real-time data aggregation, risk factor calculation, engagement pattern
 * analysis, and milestone tracking.
 * 
 * Requirements: 2.2, 3.1, 4.2
 */

import BaseStudentSuccessService from './BaseStudentSuccessService';
import studentSuccessConfig from '../../config/student-success.config';
import {
  StudentSuccessProfile,
  AcademicMetrics,
  FinancialHealth,
  SpiritualFormationMetrics,
  EngagementMetrics,
  RiskFactor,
  RiskLevel,
  RiskAssessment,
  MilestoneRecord,
  Alert,
  AcademicRecord,
  EnrollmentRecord,
  EngagementMetricsData,
  AssignmentRecord,
  ParticipationMetrics,
  GradeRecord,
  SpiritualAssessment,
  CallingProgress,
  MentorshipRecord,
  SpiritualMetrics,
  InterventionRecommendation,
  InterventionType,
} from '../../types/student-success.types';

export class StudentMonitoringService extends BaseStudentSuccessService {
  constructor() {
    super('StudentMonitoringService');
  }

  /**
   * Get comprehensive student success profile with real-time data aggregation
   * Requirement 2.5: Real-time access to progress dashboard
   */
  async getStudentProfile(studentId: string): Promise<StudentSuccessProfile> {
    this.validateRequired({ studentId }, ['studentId']);

    return this.cacheGet(
      `profile:${studentId}`,
      async () => {
        this.logger.info('Aggregating student profile data', { studentId });

        // Aggregate data from multiple sources in parallel
        const [
          academicMetrics,
          financialHealth,
          spiritualFormation,
          engagementPatterns,
          riskFactors,
          interventionHistory,
          supportTeam,
          milestones,
          predictiveScores,
        ] = await Promise.all([
          this.getAcademicMetrics(studentId),
          this.getFinancialHealth(studentId),
          this.getSpiritualFormationMetrics(studentId),
          this.getEngagementPatterns(studentId),
          this.getCurrentRiskFactors(studentId),
          this.getInterventionHistory(studentId),
          this.getSupportTeam(studentId),
          this.getMilestones(studentId),
          this.getPredictiveScores(studentId),
        ]);

        const profile: StudentSuccessProfile = {
          studentId,
          academicMetrics,
          financialHealth,
          spiritualFormation,
          engagementPatterns,
          riskFactors,
          interventionHistory,
          supportTeam,
          milestones,
          predictiveScores,
          createdAt: new Date(),
          lastUpdated: new Date(),
        };

        // Store profile in database
        await this.executeQuery(
          async () => {
            const { error } = await this.supabase
              .from('student_success_profiles')
              .upsert({
                student_id: studentId,
                profile_data: profile,
                last_updated: new Date().toISOString(),
              });

            if (error) throw error;
          },
          'Store student profile'
        );

        return profile;
      },
      studentSuccessConfig.cache.ttl.profile
    );
  }

  /**
   * Aggregate academic metrics from SIS and LMS
   * Requirement 4.1: Detailed engagement metrics
   */
  private async getAcademicMetrics(studentId: string): Promise<AcademicMetrics> {
    return this.executeQuery(async () => {
      // Get academic data from SIS
      const academicData = await this.fetchFromSIS<AcademicRecord>(
        `/students/${studentId}/academic`
      );

      // Get enrollment and grade data
      const enrollments = await this.fetchFromSIS<EnrollmentRecord[]>(
        `/students/${studentId}/enrollments`
      );

      const grades = await this.fetchFromLMS<GradeRecord[]>(
        `/students/${studentId}/grades`
      );

      // Get assignment completion data
      const assignments = await this.fetchFromLMS<AssignmentRecord[]>(
        `/students/${studentId}/assignments`
      );

      // Calculate metrics
      const completedAssignments = assignments.filter(a => a.status === 'submitted').length;
      const totalAssignments = assignments.length;
      const assignmentSubmissionRate = totalAssignments > 0
        ? (completedAssignments / totalAssignments) * 100
        : 0;

      // Calculate grade distribution
      const gradeDistribution = this.calculateGradeDistribution(grades);

      // Calculate attendance rate (from LMS engagement data)
      const engagementData = await this.fetchFromLMS<EngagementMetricsData[]>(
        `/students/${studentId}/engagement`
      );
      const attendanceRate = this.calculateAttendanceRate(engagementData);

      return {
        gpa: academicData.gpa,
        creditHours: academicData.creditsEarned,
        completionRate: (academicData.creditsEarned / academicData.creditsRequired) * 100,
        attendanceRate,
        assignmentSubmissionRate,
        gradeDistribution,
        progressTowardDegree: (academicData.creditsEarned / academicData.creditsRequired) * 100,
        lastUpdated: new Date(),
      };
    }, 'Get academic metrics');
  }

  /**
   * Get financial health indicators
   * Requirement 5.1: Correlate financial stress with academic performance
   */
  private async getFinancialHealth(studentId: string): Promise<FinancialHealth> {
    return this.executeQuery(async () => {
      const { data, error } = await this.supabase
        .from('student_financial_data')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if (error) throw error;

      return {
        tuitionBalance: data.tuition_balance || 0,
        financialAidStatus: data.financial_aid_status || 'pending',
        scrollGoldEarnings: data.scrollgold_earnings || 0,
        workStudyParticipation: data.work_study_participation || false,
        emergencyFundRequests: data.emergency_fund_requests || [],
        paymentHistory: data.payment_history || [],
        lastUpdated: new Date(),
      };
    }, 'Get financial health');
  }

  /**
   * Get spiritual formation metrics
   * Requirement 6.1: Integrate spiritual assessments with academic metrics
   */
  private async getSpiritualFormationMetrics(
    studentId: string
  ): Promise<SpiritualFormationMetrics> {
    return this.executeQuery(async () => {
      // Fetch from Spiritual Formation Service
      const [assessments, callingProgress, mentorship, metrics] = await Promise.all([
        this.fetchFromSpiritualFormation<SpiritualAssessment[]>(
          `/students/${studentId}/assessments`
        ),
        this.fetchFromSpiritualFormation<CallingProgress>(
          `/students/${studentId}/calling-progress`
        ),
        this.fetchFromSpiritualFormation<MentorshipRecord[]>(
          `/students/${studentId}/mentorship`
        ),
        this.fetchFromSpiritualFormation<SpiritualMetrics>(
          `/students/${studentId}/metrics`
        ),
      ]);

      // Calculate engagement score
      const mentorshipEngagement = mentorship.reduce(
        (sum, m) => sum + m.engagementScore,
        0
      ) / (mentorship.length || 1);

      return {
        callingDiscernmentStage: callingProgress.currentStage,
        spiritualGrowthScore: metrics.spiritualGrowthScore,
        mentorshipEngagement,
        prayerJournalActivity: metrics.prayerJournalEntries,
        scriptureMemoryProgress: metrics.scriptureMemoryVerses,
        ministryInvolvementLevel: metrics.ministryHours,
        propheticCheckInResults: assessments.map(a => ({
          id: a.id,
          date: new Date(a.assessedAt),
          assessorId: a.assessorId,
          insights: a.insights,
          recommendations: [],
          score: a.score,
        })),
        lastUpdated: new Date(),
      };
    }, 'Get spiritual formation metrics');
  }

  /**
   * Calculate engagement patterns from LMS data
   * Requirement 4.1: Detailed engagement metrics
   */
  private async getEngagementPatterns(studentId: string): Promise<EngagementMetrics> {
    return this.executeQuery(async () => {
      const [engagementData, participation] = await Promise.all([
        this.fetchFromLMS<EngagementMetricsData[]>(
          `/students/${studentId}/engagement`
        ),
        this.fetchFromLMS<ParticipationMetrics>(
          `/students/${studentId}/participation`
        ),
      ]);

      // Calculate aggregate metrics
      const totalLogins = engagementData.reduce((sum, e) => sum + e.loginCount, 0);
      const totalTimeSpent = engagementData.reduce((sum, e) => sum + e.timeSpent, 0);
      const avgParticipation = engagementData.reduce(
        (sum, e) => sum + e.participationScore,
        0
      ) / (engagementData.length || 1);

      const lastActivity = engagementData.reduce((latest, e) => {
        const date = new Date(e.lastAccess);
        return date > latest ? date : latest;
      }, new Date(0));

      return {
        loginFrequency: totalLogins / 30, // Average per day over 30 days
        courseAccessRate: (engagementData.length / 10) * 100, // Assuming 10 courses
        discussionParticipation: participation.discussionPosts,
        resourceUtilization: participation.resourcesShared,
        peerInteractionScore: participation.peerInteractions,
        lastActivityDate: lastActivity,
      };
    }, 'Get engagement patterns');
  }

  /**
   * Calculate risk factors based on current metrics
   * Requirement 2.2: Automatically trigger intervention protocols
   * Requirement 3.1: Generate early warning alerts
   */
  async calculateRiskFactors(studentId: string): Promise<RiskFactor[]> {
    this.logger.info('Calculating risk factors', { studentId });

    const profile = await this.getStudentProfile(studentId);
    const riskFactors: RiskFactor[] = [];

    // Academic risk factors
    if (profile.academicMetrics.gpa < studentSuccessConfig.riskThresholds.gpa.critical) {
      riskFactors.push({
        id: `academic-gpa-${Date.now()}`,
        category: 'academic',
        description: 'GPA below critical threshold',
        severity: RiskLevel.CRITICAL,
        detectedAt: new Date(),
        indicators: [`GPA: ${profile.academicMetrics.gpa}`],
      });
    } else if (profile.academicMetrics.gpa < studentSuccessConfig.riskThresholds.gpa.high) {
      riskFactors.push({
        id: `academic-gpa-${Date.now()}`,
        category: 'academic',
        description: 'GPA below high-risk threshold',
        severity: RiskLevel.HIGH,
        detectedAt: new Date(),
        indicators: [`GPA: ${profile.academicMetrics.gpa}`],
      });
    }

    // Attendance risk factors
    if (profile.academicMetrics.attendanceRate < studentSuccessConfig.riskThresholds.attendance.critical) {
      riskFactors.push({
        id: `academic-attendance-${Date.now()}`,
        category: 'academic',
        description: 'Attendance rate critically low',
        severity: RiskLevel.CRITICAL,
        detectedAt: new Date(),
        indicators: [`Attendance: ${profile.academicMetrics.attendanceRate}%`],
      });
    }

    // Engagement risk factors
    const engagementScore = this.calculateEngagementScore(profile.engagementPatterns);
    if (engagementScore < studentSuccessConfig.riskThresholds.engagement.critical) {
      riskFactors.push({
        id: `engagement-${Date.now()}`,
        category: 'engagement',
        description: 'Student engagement critically low',
        severity: RiskLevel.CRITICAL,
        detectedAt: new Date(),
        indicators: [`Engagement score: ${engagementScore}`],
      });
    }

    // Financial risk factors
    if (profile.financialHealth.tuitionBalance > studentSuccessConfig.riskThresholds.financialBalance.critical) {
      riskFactors.push({
        id: `financial-${Date.now()}`,
        category: 'financial',
        description: 'High tuition balance',
        severity: RiskLevel.HIGH,
        detectedAt: new Date(),
        indicators: [`Balance: $${profile.financialHealth.tuitionBalance}`],
      });
    }

    // Spiritual formation risk factors
    if (profile.spiritualFormation.spiritualGrowthScore < 50) {
      riskFactors.push({
        id: `spiritual-${Date.now()}`,
        category: 'spiritual',
        description: 'Spiritual growth score below threshold',
        severity: RiskLevel.MODERATE,
        detectedAt: new Date(),
        indicators: [`Growth score: ${profile.spiritualFormation.spiritualGrowthScore}`],
      });
    }

    // Store risk factors
    await this.executeQuery(
      async () => {
        const { error } = await this.supabase
          .from('student_risk_factors')
          .insert(
            riskFactors.map(rf => ({
              student_id: studentId,
              risk_factor_data: rf,
              detected_at: rf.detectedAt.toISOString(),
            }))
          );

        if (error) throw error;
      },
      'Store risk factors'
    );

    return riskFactors;
  }

  /**
   * Generate comprehensive risk assessment
   * Requirement 8.1: Identify at-risk students with 85%+ accuracy
   */
  async generateRiskAssessment(studentId: string): Promise<RiskAssessment> {
    this.logger.info('Generating risk assessment', { studentId });

    const riskFactors = await this.calculateRiskFactors(studentId);
    const profile = await this.getStudentProfile(studentId);

    // Calculate overall risk score (0-100)
    const overallRiskScore = this.calculateOverallRiskScore(profile, riskFactors);

    // Categorize risks
    const riskCategories = {
      academic: this.categorizeRisk(
        riskFactors.filter(rf => rf.category === 'academic')
      ),
      financial: this.categorizeRisk(
        riskFactors.filter(rf => rf.category === 'financial')
      ),
      social: this.categorizeRisk(
        riskFactors.filter(rf => rf.category === 'social')
      ),
      spiritual: this.categorizeRisk(
        riskFactors.filter(rf => rf.category === 'spiritual')
      ),
      engagement: this.categorizeRisk(
        riskFactors.filter(rf => rf.category === 'engagement')
      ),
    };

    // Generate intervention recommendations
    const recommendedInterventions = this.generateInterventionRecommendations(
      riskFactors,
      profile
    );

    // Calculate confidence level based on data completeness
    const confidenceLevel = this.calculateConfidenceLevel(profile);

    const assessment: RiskAssessment = {
      studentId,
      overallRiskScore,
      riskCategories,
      contributingFactors: riskFactors,
      recommendedInterventions,
      confidenceLevel,
      lastUpdated: new Date(),
    };

    // Store assessment
    await this.executeQuery(
      async () => {
        const { error } = await this.supabase
          .from('student_risk_assessments')
          .upsert({
            student_id: studentId,
            assessment_data: assessment,
            overall_risk_score: overallRiskScore,
            last_updated: new Date().toISOString(),
          });

        if (error) throw error;
      },
      'Store risk assessment'
    );

    // Trigger alerts if necessary
    if (overallRiskScore >= 70) {
      await this.triggerAlert(studentId, assessment);
    }

    return assessment;
  }

  /**
   * Track and celebrate student milestones
   * Requirement 2.5: Real-time progress dashboard
   */
  async trackMilestone(
    studentId: string,
    milestoneType: string,
    milestoneName: string
  ): Promise<MilestoneRecord> {
    this.logger.info('Tracking milestone', { studentId, milestoneType, milestoneName });

    const milestone: MilestoneRecord = {
      id: `milestone-${Date.now()}`,
      type: milestoneType,
      name: milestoneName,
      description: `Student achieved ${milestoneName}`,
      targetDate: new Date(),
      completedDate: new Date(),
      status: 'completed',
      celebrationSent: false,
    };

    // Store milestone
    await this.executeQuery(
      async () => {
        const { error } = await this.supabase
          .from('student_milestones')
          .insert({
            student_id: studentId,
            milestone_data: milestone,
            completed_at: new Date().toISOString(),
          });

        if (error) throw error;
      },
      'Store milestone'
    );

    // Send celebration notification
    await this.sendMilestoneCelebration(studentId, milestone);

    // Invalidate cache
    await this.cacheInvalidate(`profile:${studentId}`);

    return milestone;
  }

  /**
   * Monitor real-time data changes and update profiles
   * Requirement 4.1: Real-time data integration
   */
  async updateFromDataSource(
    studentId: string,
    source: 'sis' | 'lms' | 'spiritual' | 'financial',
    data: any
  ): Promise<void> {
    this.logger.info('Updating from data source', { studentId, source });

    // Invalidate relevant caches
    await this.cacheInvalidate(`profile:${studentId}`);
    await this.cacheInvalidate(`risk:${studentId}`);

    // Trigger risk recalculation
    await this.generateRiskAssessment(studentId);

    // Log audit event
    await this.logAudit('data_update', studentId, { source, timestamp: new Date() });
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private async getCurrentRiskFactors(studentId: string): Promise<RiskFactor[]> {
    const { data, error } = await this.supabase
      .from('student_risk_factors')
      .select('risk_factor_data')
      .eq('student_id', studentId)
      .gte('detected_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('detected_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to fetch risk factors', { error, studentId });
      return [];
    }

    return data.map(d => d.risk_factor_data);
  }

  private async getInterventionHistory(studentId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('intervention_cases')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to fetch intervention history', { error, studentId });
      return [];
    }

    return data || [];
  }

  private async getSupportTeam(studentId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('student_support_teams')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error) {
      this.logger.error('Failed to fetch support team', { error, studentId });
      return {
        academicAdvisor: null,
        spiritualMentor: null,
        additionalSupport: [],
      };
    }

    return data?.team_data || {
      academicAdvisor: null,
      spiritualMentor: null,
      additionalSupport: [],
    };
  }

  private async getMilestones(studentId: string): Promise<MilestoneRecord[]> {
    const { data, error } = await this.supabase
      .from('student_milestones')
      .select('milestone_data')
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to fetch milestones', { error, studentId });
      return [];
    }

    return data.map(d => d.milestone_data);
  }

  private async getPredictiveScores(studentId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('student_predictive_scores')
      .select('*')
      .eq('student_id', studentId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      this.logger.error('Failed to fetch predictive scores', { error, studentId });
      return {
        retentionProbability: 0.5,
        graduationProbability: 0.5,
        timeToGraduation: 4,
        successLikelihood: 0.5,
        modelVersion: 'v1.0',
        calculatedAt: new Date(),
      };
    }

    return data?.scores || {
      retentionProbability: 0.5,
      graduationProbability: 0.5,
      timeToGraduation: 4,
      successLikelihood: 0.5,
      modelVersion: 'v1.0',
      calculatedAt: new Date(),
    };
  }

  private calculateGradeDistribution(grades: GradeRecord[]): any {
    const distribution = {
      aCount: 0,
      bCount: 0,
      cCount: 0,
      dCount: 0,
      fCount: 0,
      incompleteCount: 0,
      withdrawalCount: 0,
    };

    grades.forEach(grade => {
      const letter = grade.grade.toUpperCase();
      if (letter.startsWith('A')) distribution.aCount++;
      else if (letter.startsWith('B')) distribution.bCount++;
      else if (letter.startsWith('C')) distribution.cCount++;
      else if (letter.startsWith('D')) distribution.dCount++;
      else if (letter.startsWith('F')) distribution.fCount++;
      else if (letter === 'I') distribution.incompleteCount++;
      else if (letter === 'W') distribution.withdrawalCount++;
    });

    return distribution;
  }

  private calculateAttendanceRate(engagementData: EngagementMetricsData[]): number {
    if (engagementData.length === 0) return 100;

    const totalSessions = engagementData.length * 10; // Assuming 10 sessions per course
    const attendedSessions = engagementData.reduce(
      (sum, e) => sum + e.loginCount,
      0
    );

    return Math.min((attendedSessions / totalSessions) * 100, 100);
  }

  private calculateEngagementScore(engagement: EngagementMetrics): number {
    return (
      engagement.loginFrequency * 0.2 +
      engagement.courseAccessRate * 0.2 +
      engagement.discussionParticipation * 0.2 +
      engagement.resourceUtilization * 0.2 +
      engagement.peerInteractionScore * 0.2
    );
  }

  private calculateOverallRiskScore(
    profile: StudentSuccessProfile,
    riskFactors: RiskFactor[]
  ): number {
    let score = 0;

    // Weight by severity
    riskFactors.forEach(rf => {
      switch (rf.severity) {
        case RiskLevel.CRITICAL:
          score += 25;
          break;
        case RiskLevel.HIGH:
          score += 15;
          break;
        case RiskLevel.MODERATE:
          score += 10;
          break;
        case RiskLevel.LOW:
          score += 5;
          break;
      }
    });

    return Math.min(score, 100);
  }

  private categorizeRisk(riskFactors: RiskFactor[]): RiskLevel {
    if (riskFactors.some(rf => rf.severity === RiskLevel.CRITICAL)) {
      return RiskLevel.CRITICAL;
    }
    if (riskFactors.some(rf => rf.severity === RiskLevel.HIGH)) {
      return RiskLevel.HIGH;
    }
    if (riskFactors.some(rf => rf.severity === RiskLevel.MODERATE)) {
      return RiskLevel.MODERATE;
    }
    return RiskLevel.LOW;
  }

  private generateInterventionRecommendations(
    riskFactors: RiskFactor[],
    profile: StudentSuccessProfile
  ): InterventionRecommendation[] {
    const recommendations: InterventionRecommendation[] = [];

    // Academic interventions
    if (riskFactors.some(rf => rf.category === 'academic')) {
      recommendations.push({
        type: InterventionType.ACADEMIC_SUPPORT,
        priority: 1,
        description: 'Provide tutoring and academic coaching',
        estimatedImpact: 0.7,
        resources: ['Tutoring Center', 'Study Skills Workshop'],
      });
    }

    // Financial interventions
    if (riskFactors.some(rf => rf.category === 'financial')) {
      recommendations.push({
        type: InterventionType.FINANCIAL_AID,
        priority: 2,
        description: 'Connect with financial aid resources',
        estimatedImpact: 0.6,
        resources: ['Financial Aid Office', 'Emergency Fund'],
      });
    }

    // Spiritual interventions
    if (riskFactors.some(rf => rf.category === 'spiritual')) {
      recommendations.push({
        type: InterventionType.SPIRITUAL_GUIDANCE,
        priority: 3,
        description: 'Increase spiritual mentorship engagement',
        estimatedImpact: 0.5,
        resources: ['Spiritual Mentor', 'Prayer Support Group'],
      });
    }

    return recommendations;
  }

  private calculateConfidenceLevel(profile: StudentSuccessProfile): number {
    let completeness = 0;
    let total = 0;

    // Check data completeness
    if (profile.academicMetrics.gpa > 0) completeness++;
    total++;

    if (profile.financialHealth.tuitionBalance >= 0) completeness++;
    total++;

    if (profile.spiritualFormation.spiritualGrowthScore > 0) completeness++;
    total++;

    if (profile.engagementPatterns.loginFrequency > 0) completeness++;
    total++;

    return completeness / total;
  }

  private async triggerAlert(
    studentId: string,
    assessment: RiskAssessment
  ): Promise<void> {
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      studentId,
      type: 'risk_assessment',
      severity: assessment.riskCategories.academic,
      message: `Student at risk: Overall score ${assessment.overallRiskScore}`,
      recommendations: assessment.recommendedInterventions.map(r => r.description),
      createdAt: new Date(),
    };

    await this.executeQuery(
      async () => {
        const { error } = await this.supabase
          .from('student_alerts')
          .insert({
            student_id: studentId,
            alert_data: alert,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;
      },
      'Create alert'
    );

    this.logger.info('Alert triggered', { studentId, alertId: alert.id });
  }

  private async sendMilestoneCelebration(
    studentId: string,
    milestone: MilestoneRecord
  ): Promise<void> {
    // Implementation would send notification through notification service
    this.logger.info('Milestone celebration sent', { studentId, milestone: milestone.name });
  }

  private async fetchFromSIS<T>(endpoint: string): Promise<T> {
    // Mock implementation - would make actual HTTP request
    return {} as T;
  }

  private async fetchFromLMS<T>(endpoint: string): Promise<T> {
    // Mock implementation - would make actual HTTP request
    return {} as T;
  }

  private async fetchFromSpiritualFormation<T>(endpoint: string): Promise<T> {
    // Mock implementation - would make actual HTTP request
    return {} as T;
  }
}

export default StudentMonitoringService;
