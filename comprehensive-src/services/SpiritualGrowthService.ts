import {
  SpiritualGrowthReport,
  SpiritualMetrics,
  SpiritualAchievement,
  SpiritualChallenge,
  GrowthRecommendation,
  MetricTrend,
  SpiritualFormation
} from '../types/spiritual-formation';
import { divineScoreCardService } from './DivineScoreCardService';
import { propheticCheckinsService } from './PropheticCheckinsService';
import { intercessionPrayerService } from './IntercessionPrayerService';

export class SpiritualGrowthService {
  private growthReports: Map<string, SpiritualGrowthReport[]> = new Map();
  private spiritualFormations: Map<string, SpiritualFormation> = new Map();

  async generateSpiritualGrowthReport(
    userId: string, 
    reportType: 'weekly' | 'monthly' | 'quarterly' | 'annual'
  ): Promise<SpiritualGrowthReport> {
    const endDate = new Date();
    const startDate = this.getStartDateForReportType(reportType, endDate);

    const metrics = await this.calculateSpiritualMetrics(userId, startDate, endDate);
    const achievements = await this.identifySpiritualAchievements(userId, startDate, endDate);
    const challenges = await this.identifySpiritualChallenges(userId, metrics);
    const recommendations = await this.generateGrowthRecommendations(userId, challenges, metrics);

    const report: SpiritualGrowthReport = {
      id: `report_${userId}_${Date.now()}`,
      userId,
      reportType,
      period: { startDate, endDate },
      metrics,
      achievements,
      challenges,
      recommendations,
      nextSteps: this.generateNextSteps(recommendations),
      generatedAt: new Date()
    };

    const userReports = this.growthReports.get(userId) || [];
    userReports.push(report);
    this.growthReports.set(userId, userReports);

    return report;
  }

  async getSpiritualFormation(userId: string): Promise<SpiritualFormation | null> {
    return this.spiritualFormations.get(userId) || null;
  }

  async updateSpiritualFormation(userId: string, formation: Partial<SpiritualFormation>): Promise<SpiritualFormation> {
    const existing = this.spiritualFormations.get(userId);
    const updated: SpiritualFormation = {
      ...existing,
      ...formation,
      id: existing?.id || `formation_${userId}_${Date.now()}`,
      userId,
      updatedAt: new Date()
    } as SpiritualFormation;

    this.spiritualFormations.set(userId, updated);
    return updated;
  }

  async getUserGrowthReports(userId: string, limit?: number): Promise<SpiritualGrowthReport[]> {
    const userReports = this.growthReports.get(userId) || [];
    const sortedReports = userReports.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    return limit ? sortedReports.slice(0, limit) : sortedReports;
  }

  async getGrowthTrends(userId: string, months: number = 6): Promise<{
    overallGrowth: number[];
    prayerConsistency: number[];
    scriptureEngagement: number[];
    serviceParticipation: number[];
    characterDevelopment: number[];
  }> {
    const reports = await this.getUserGrowthReports(userId);
    const recentReports = reports.slice(0, months);

    return {
      overallGrowth: recentReports.map(r => r.metrics.overallGrowth).reverse(),
      prayerConsistency: recentReports.map(r => r.metrics.prayerConsistency).reverse(),
      scriptureEngagement: recentReports.map(r => r.metrics.scriptureEngagement).reverse(),
      serviceParticipation: recentReports.map(r => r.metrics.serviceParticipation).reverse(),
      characterDevelopment: recentReports.map(r => r.metrics.characterDevelopment).reverse()
    };
  }

  private getStartDateForReportType(reportType: 'weekly' | 'monthly' | 'quarterly' | 'annual', endDate: Date): Date {
    const startDate = new Date(endDate);
    
    switch (reportType) {
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'annual':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    return startDate;
  }

  private async calculateSpiritualMetrics(userId: string, startDate: Date, endDate: Date): Promise<SpiritualMetrics> {
    // Get data from other services
    const scorecard = await divineScoreCardService.getDivineScorecard(userId);
    const checkinAnalytics = await propheticCheckinsService.getCheckinAnalytics(userId, 30);
    const prayerAnalytics = await intercessionPrayerService.getPrayerAnalytics(userId, 30);

    // Calculate metrics based on available data
    const prayerConsistency = Math.min(100, (prayerAnalytics.intercessionSessions / 30) * 100);
    const scriptureEngagement = checkinAnalytics.journalEntries > 0 ? 
      Math.min(100, (checkinAnalytics.journalEntries / 30) * 100) : 50;
    const serviceParticipation = scorecard ? 
      scorecard.skills.practicalSkills.averageLevel * 10 : 50;
    const discipleshipActivity = scorecard ? 
      scorecard.skills.spiritualSkills.skills.find(s => s.id === 'discipleship')?.currentLevel * 10 || 50 : 50;
    const characterDevelopment = scorecard ? scorecard.alignment.characterAlignment : 50;
    const propheticSensitivity = scorecard ? 
      scorecard.skills.spiritualSkills.skills.find(s => s.id === 'prophetic_sensitivity')?.currentLevel * 10 || 50 : 50;
    const kingdomImpact = scorecard ? scorecard.purpose.progress : 30;

    const overallGrowth = Math.round(
      (prayerConsistency + scriptureEngagement + serviceParticipation + 
       discipleshipActivity + characterDevelopment + propheticSensitivity + kingdomImpact) / 7
    );

    const trends: MetricTrend[] = [
      {
        metric: 'Prayer Consistency',
        direction: prayerConsistency > 70 ? 'increasing' : prayerConsistency < 40 ? 'decreasing' : 'stable',
        changePercentage: Math.random() * 20 - 10, // Simplified
        timeframe: 'last 30 days'
      },
      {
        metric: 'Scripture Engagement',
        direction: scriptureEngagement > 60 ? 'increasing' : scriptureEngagement < 30 ? 'decreasing' : 'stable',
        changePercentage: Math.random() * 15 - 7.5,
        timeframe: 'last 30 days'
      }
    ];

    return {
      overallGrowth,
      prayerConsistency,
      scriptureEngagement,
      serviceParticipation,
      discipleshipActivity,
      characterDevelopment,
      propheticSensitivity,
      kingdomImpact,
      trends
    };
  }

  private async identifySpiritualAchievements(userId: string, startDate: Date, endDate: Date): Promise<SpiritualAchievement[]> {
    const achievements: SpiritualAchievement[] = [];
    
    // Get recent data
    const checkins = await propheticCheckinsService.getCheckinsByDateRange(userId, startDate, endDate);
    const prayerAnalytics = await intercessionPrayerService.getPrayerAnalytics(userId, 30);
    const scorecard = await divineScoreCardService.getDivineScorecard(userId);

    // Check for prayer consistency achievement
    if (prayerAnalytics.intercessionSessions >= 20) {
      achievements.push({
        id: `achievement_prayer_${Date.now()}`,
        title: 'Prayer Warrior',
        description: 'Maintained consistent intercession practice',
        category: 'Prayer',
        date: new Date(),
        impact: 'Strengthened spiritual foundation and intercession ministry',
        evidence: [`${prayerAnalytics.intercessionSessions} intercession sessions`, `${prayerAnalytics.totalIntercessionTime} minutes of prayer`]
      });
    }

    // Check for journaling consistency
    if (checkins.filter(c => c.journalEntry.content.length > 100).length >= 15) {
      achievements.push({
        id: `achievement_journal_${Date.now()}`,
        title: 'Faithful Journaler',
        description: 'Consistent spiritual journaling and reflection',
        category: 'Spiritual Discipline',
        date: new Date(),
        impact: 'Enhanced spiritual awareness and growth tracking',
        evidence: ['Regular journal entries', 'Deep spiritual reflections']
      });
    }

    // Check for skill development
    if (scorecard && scorecard.skills.overallProgress > 70) {
      achievements.push({
        id: `achievement_skills_${Date.now()}`,
        title: 'Skill Developer',
        description: 'Significant progress in spiritual and practical skills',
        category: 'Skill Development',
        date: new Date(),
        impact: 'Increased capacity for kingdom service and leadership',
        evidence: [`${Math.round(scorecard.skills.overallProgress)}% overall skill progress`]
      });
    }

    return achievements;
  }

  private async identifySpiritualChallenges(userId: string, metrics: SpiritualMetrics): Promise<SpiritualChallenge[]> {
    const challenges: SpiritualChallenge[] = [];

    // Identify low-performing areas
    if (metrics.prayerConsistency < 50) {
      challenges.push({
        id: `challenge_prayer_${Date.now()}`,
        title: 'Prayer Consistency',
        description: 'Need to develop more consistent prayer and intercession habits',
        category: 'Prayer',
        severity: 'medium',
        recommendations: [
          'Set daily prayer reminders',
          'Join a prayer group',
          'Use prayer apps or guides',
          'Start with shorter, more frequent prayer times'
        ],
        resources: [
          'Prayer guides and devotionals',
          'Prayer partner matching',
          'Intercession training materials'
        ]
      });
    }

    if (metrics.scriptureEngagement < 40) {
      challenges.push({
        id: `challenge_scripture_${Date.now()}`,
        title: 'Scripture Engagement',
        description: 'Low engagement with Bible study and scripture meditation',
        category: 'Bible Study',
        severity: 'high',
        recommendations: [
          'Establish daily Bible reading routine',
          'Join a Bible study group',
          'Use Bible study apps',
          'Practice scripture memorization'
        ],
        resources: [
          'Bible reading plans',
          'Study guides and commentaries',
          'Scripture memorization tools'
        ]
      });
    }

    if (metrics.serviceParticipation < 30) {
      challenges.push({
        id: `challenge_service_${Date.now()}`,
        title: 'Service Participation',
        description: 'Limited involvement in service and ministry activities',
        category: 'Service',
        severity: 'medium',
        recommendations: [
          'Find service opportunities that match your gifts',
          'Start with small, regular commitments',
          'Connect with ministry leaders',
          'Explore different areas of service'
        ],
        resources: [
          'Ministry opportunity directory',
          'Spiritual gifts assessment',
          'Service training programs'
        ]
      });
    }

    return challenges;
  }

  private async generateGrowthRecommendations(userId: string, challenges: SpiritualChallenge[], metrics: SpiritualMetrics): Promise<GrowthRecommendation[]> {
    const recommendations: GrowthRecommendation[] = [];

    // Generate recommendations based on challenges
    challenges.forEach(challenge => {
      challenge.recommendations.forEach((rec, index) => {
        recommendations.push({
          id: `rec_${challenge.id}_${index}`,
          title: rec,
          description: `Address ${challenge.title.toLowerCase()} through ${rec.toLowerCase()}`,
          category: this.mapChallengeToCategory(challenge.category),
          priority: challenge.severity === 'high' ? 'high' : challenge.severity === 'medium' ? 'medium' : 'low',
          timeframe: challenge.severity === 'high' ? '1-2 weeks' : '2-4 weeks',
          resources: challenge.resources,
          expectedOutcome: `Improved ${challenge.title.toLowerCase()} and overall spiritual growth`
        });
      });
    });

    // Add general growth recommendations based on metrics
    if (metrics.overallGrowth < 70) {
      recommendations.push({
        id: `rec_general_${Date.now()}`,
        title: 'Comprehensive Spiritual Development Plan',
        description: 'Focus on balanced growth across all spiritual disciplines',
        category: 'study',
        priority: 'high',
        timeframe: '1-3 months',
        resources: [
          'Spiritual formation curriculum',
          'Mentorship program',
          'Spiritual disciplines guide'
        ],
        expectedOutcome: 'Accelerated spiritual maturity and kingdom readiness'
      });
    }

    return recommendations;
  }

  private mapChallengeToCategory(challengeCategory: string): 'prayer' | 'study' | 'service' | 'fellowship' | 'discipleship' {
    const mapping: { [key: string]: 'prayer' | 'study' | 'service' | 'fellowship' | 'discipleship' } = {
      'Prayer': 'prayer',
      'Bible Study': 'study',
      'Service': 'service',
      'Fellowship': 'fellowship',
      'Discipleship': 'discipleship'
    };
    return mapping[challengeCategory] || 'study';
  }

  private generateNextSteps(recommendations: GrowthRecommendation[]): string[] {
    const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
    const nextSteps: string[] = [];

    if (highPriorityRecs.length > 0) {
      nextSteps.push(`Focus on ${highPriorityRecs.length} high-priority recommendations`);
      nextSteps.push(`Start with: ${highPriorityRecs[0].title}`);
    }

    nextSteps.push('Schedule weekly spiritual growth review');
    nextSteps.push('Connect with a spiritual mentor or accountability partner');
    nextSteps.push('Set specific, measurable spiritual goals for next period');

    return nextSteps;
  }
export c
export const spiritualGrowthService = new SpiritualGrowthService();