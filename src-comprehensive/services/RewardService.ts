/**
 * RewardService - ScrollCoin and XP management for ScrollProjectsSpec
 * Handles reward calculations, distribution, and usage tracking
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ScrollProjectSpec,
  MilestoneSpec,
  RewardCalculation,
  RewardBreakdown,
  UsageMetrics,
  ScrollField,
  MilestoneStage,
  ProjectStatus
} from '../types/scroll-projects.js';

export interface XPTrackerIntegration {
  updateStudentXP(studentId: string, xpAmount: number, source: string): Promise<boolean>;
  getStudentXP(studentId: string): Promise<number>;
}

export interface ScrollCoinIntegration {
  transferScrollCoin(fromAccount: string, toAccount: string, amount: number, reason: string): Promise<boolean>;
  getAccountBalance(accountId: string): Promise<number>;
  createTransaction(transaction: ScrollCoinTransaction): Promise<string>;
}

export interface ScrollCoinTransaction {
  transaction_id: string;
  from_account: string;
  to_account: string;
  amount: number;
  transaction_type: 'reward' | 'usage_bonus' | 'milestone_completion' | 'marketplace_revenue';
  description: string;
  project_id?: string;
  milestone_id?: string;
  timestamp: Date;
}

export class RewardService {
  private xpTracker: XPTrackerIntegration;
  private scrollCoinService: ScrollCoinIntegration;
  private rewardConfig: RewardConfiguration;

  constructor(
    xpTracker: XPTrackerIntegration,
    scrollCoinService: ScrollCoinIntegration,
    config?: Partial<RewardConfiguration>
  ) {
    this.xpTracker = xpTracker;
    this.scrollCoinService = scrollCoinService;
    this.rewardConfig = { ...this.getDefaultRewardConfig(), ...config };
  }

  /**
   * Calculates total rewards for a project based on completion and impact
   */
  async calculateProjectRewards(project: ScrollProjectSpec): Promise<RewardCalculation> {
    try {
      const breakdown: RewardBreakdown[] = [];

      // Base reward for project completion
      const baseReward = this.calculateBaseReward(project);
      breakdown.push({
        category: 'Base Project Completion',
        amount: baseReward,
        reason: `Base reward for completing ${project.scroll_field} project`
      });

      // Milestone completion bonuses
      const milestoneRewards = this.calculateMilestoneRewards(project.milestones);
      breakdown.push(...milestoneRewards);

      // Impact bonus based on real-world usage
      const impactBonus = await this.calculateImpactBonus(project);
      if (impactBonus > 0) {
        breakdown.push({
          category: 'Real-World Impact',
          amount: impactBonus,
          reason: 'Bonus for demonstrated real-world impact and usage'
        });
      }

      // Mentor feedback bonus
      const mentorBonus = this.calculateMentorBonus(project.milestones);
      if (mentorBonus > 0) {
        breakdown.push({
          category: 'Mentor Excellence',
          amount: mentorBonus,
          reason: 'Bonus for exceptional mentor feedback and engagement'
        });
      }

      // Scroll alignment bonus
      const alignmentBonus = await this.calculateScrollAlignmentBonus(project);
      if (alignmentBonus > 0) {
        breakdown.push({
          category: 'Scroll Alignment Excellence',
          amount: alignmentBonus,
          reason: 'Bonus for exceptional scroll alignment and kingdom impact'
        });
      }

      // Innovation bonus
      const innovationBonus = this.calculateInnovationBonus(project);
      if (innovationBonus > 0) {
        breakdown.push({
          category: 'Innovation Excellence',
          amount: innovationBonus,
          reason: 'Bonus for innovative approach and creative solutions'
        });
      }

      // Calculate totals
      const totalScrollCoin = breakdown.reduce((sum, item) => sum + item.amount, 0);
      const xpAwarded = Math.floor(totalScrollCoin * this.rewardConfig.scrollCoinToXPRatio);

      return {
        base_scrollcoin: baseReward,
        impact_bonus: impactBonus,
        mentor_bonus: mentorBonus,
        total_scrollcoin: totalScrollCoin,
        xp_awarded: xpAwarded,
        calculation_details: breakdown
      };

    } catch (error) {
      throw new Error(`Reward calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Distributes calculated rewards to a student
   */
  async distributeRewards(studentId: string, rewards: RewardCalculation): Promise<void> {
    try {
      // Create ScrollCoin transaction
      const transaction: ScrollCoinTransaction = {
        transaction_id: uuidv4(),
        from_account: 'scroll_university_rewards',
        to_account: studentId,
        amount: rewards.total_scrollcoin,
        transaction_type: 'reward',
        description: `Project completion rewards: ${rewards.total_scrollcoin} ScrollCoin`,
        timestamp: new Date()
      };

      // Transfer ScrollCoin
      const scrollCoinSuccess = await this.scrollCoinService.transferScrollCoin(
        transaction.from_account,
        transaction.to_account,
        transaction.amount,
        transaction.description
      );

      if (!scrollCoinSuccess) {
        throw new Error('ScrollCoin transfer failed');
      }

      // Record transaction
      await this.scrollCoinService.createTransaction(transaction);

      // Update XP
      const xpSuccess = await this.xpTracker.updateStudentXP(
        studentId,
        rewards.xp_awarded,
        'project_completion'
      );

      if (!xpSuccess) {
        throw new Error('XP update failed');
      }

      // Log reward distribution
      await this.logRewardDistribution(studentId, rewards, transaction.transaction_id);

    } catch (error) {
      throw new Error(`Reward distribution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Tracks usage metrics for a project and calculates usage-based rewards
   */
  async trackUsageMetrics(projectId: string): Promise<UsageMetrics> {
    try {
      // This would integrate with external analytics services
      // For now, providing a placeholder implementation
      const metrics: UsageMetrics = {
        total_users: 0,
        active_users_30d: 0,
        total_sessions: 0,
        average_session_duration: 0,
        user_satisfaction_score: 0,
        revenue_generated: 0
      };

      // Load actual metrics from external services
      const actualMetrics = await this.loadUsageMetrics(projectId);
      Object.assign(metrics, actualMetrics);

      // Calculate usage-based rewards
      const usageRewards = this.calculateUsageRewards(metrics);
      if (usageRewards > 0) {
        await this.distributeUsageRewards(projectId, usageRewards, metrics);
      }

      return metrics;
    } catch (error) {
      console.error(`Failed to track usage metrics for project ${projectId}:`, error);
      return {
        total_users: 0,
        active_users_30d: 0,
        total_sessions: 0,
        average_session_duration: 0,
        user_satisfaction_score: 0
      };
    }
  }

  /**
   * Updates ScrollCoin earnings for a project
   */
  async updateScrollCoinEarnings(projectId: string, earnings: number): Promise<void> {
    try {
      // Load project to get student ID
      const project = await this.loadProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Create earnings transaction
      const transaction: ScrollCoinTransaction = {
        transaction_id: uuidv4(),
        from_account: 'marketplace_revenue',
        to_account: project.student_id,
        amount: earnings,
        transaction_type: 'marketplace_revenue',
        description: `Marketplace earnings for project: ${project.title}`,
        project_id: projectId,
        timestamp: new Date()
      };

      // Transfer earnings
      const success = await this.scrollCoinService.transferScrollCoin(
        transaction.from_account,
        transaction.to_account,
        transaction.amount,
        transaction.description
      );

      if (!success) {
        throw new Error('Earnings transfer failed');
      }

      // Record transaction
      await this.scrollCoinService.createTransaction(transaction);

      // Update project earnings
      project.scrollcoin_earned += earnings;
      await this.saveProject(project);

    } catch (error) {
      throw new Error(`Failed to update ScrollCoin earnings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculates milestone-specific rewards
   */
  async calculateMilestoneReward(milestone: MilestoneSpec): Promise<number> {
    const stageMultipliers: Record<MilestoneStage, number> = {
      [MilestoneStage.PROPOSAL]: 0.1,
      [MilestoneStage.PROTOTYPE]: 0.3,
      [MilestoneStage.TESTING]: 0.4,
      [MilestoneStage.FINAL]: 0.2
    };

    const baseAmount = this.rewardConfig.baseMilestoneReward;
    const stageMultiplier = stageMultipliers[milestone.stage];
    const completionMultiplier = milestone.completion_percentage / 100;
    const qualityMultiplier = this.calculateQualityMultiplier(milestone);

    return Math.floor(baseAmount * stageMultiplier * completionMultiplier * qualityMultiplier);
  }

  /**
   * Gets reward history for a student
   */
  async getStudentRewardHistory(studentId: string): Promise<{
    total_scrollcoin_earned: number;
    total_xp_earned: number;
    recent_transactions: ScrollCoinTransaction[];
    reward_breakdown_by_project: Record<string, number>;
  }> {
    try {
      // This would integrate with actual transaction history
      const transactions = await this.loadStudentTransactions(studentId);
      const totalScrollCoin = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const totalXP = await this.xpTracker.getStudentXP(studentId);

      const recentTransactions = transactions
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

      const projectBreakdown: Record<string, number> = {};
      transactions.forEach(tx => {
        if (tx.project_id) {
          projectBreakdown[tx.project_id] = (projectBreakdown[tx.project_id] || 0) + tx.amount;
        }
      });

      return {
        total_scrollcoin_earned: totalScrollCoin,
        total_xp_earned: totalXP,
        recent_transactions: recentTransactions,
        reward_breakdown_by_project: projectBreakdown
      };
    } catch (error) {
      console.error(`Failed to get reward history for student ${studentId}:`, error);
      return {
        total_scrollcoin_earned: 0,
        total_xp_earned: 0,
        recent_transactions: [],
        reward_breakdown_by_project: {}
      };
    }
  }

  /**
   * Private helper methods
   */
  private calculateBaseReward(project: ScrollProjectSpec): number {
    const fieldMultipliers: Record<ScrollField, number> = {
      [ScrollField.SCROLL_MEDICINE]: 1.5,
      [ScrollField.SCROLL_AI]: 1.3,
      [ScrollField.SCROLL_GOVERNANCE]: 1.4,
      [ScrollField.SCROLL_ECONOMY]: 1.2,
      [ScrollField.SCROLL_THEOLOGY]: 1.1,
      [ScrollField.SCROLL_LAW]: 1.3,
      [ScrollField.SCROLL_ENGINEERING]: 1.2,
      [ScrollField.SCROLL_ARTS]: 1.0,
      [ScrollField.SCROLL_HEALTH]: 1.4,
      [ScrollField.SCROLL_EDUCATION]: 1.1
    };

    const baseAmount = this.rewardConfig.baseProjectReward;
    const fieldMultiplier = fieldMultipliers[project.scroll_field] || 1.0;
    const statusMultiplier = this.getStatusMultiplier(project.status);

    return Math.floor(baseAmount * fieldMultiplier * statusMultiplier);
  }

  private calculateMilestoneRewards(milestones: MilestoneSpec[]): RewardBreakdown[] {
    return milestones
      .filter(m => m.completed)
      .map(milestone => {
        const amount = Math.floor(this.rewardConfig.baseMilestoneReward * this.getMilestoneMultiplier(milestone.stage));
        return {
          category: `${milestone.stage} Milestone`,
          amount,
          reason: `Completion of ${milestone.stage} milestone`
        };
      });
  }

  private async calculateImpactBonus(project: ScrollProjectSpec): Promise<number> {
    if (!project.published || !project.metadata) {
      return 0;
    }

    const impactScore = project.metadata.real_world_impact_score;
    const baseBonus = this.rewardConfig.impactBonusBase;
    
    // Impact bonus scales exponentially with score
    return Math.floor(baseBonus * Math.pow(impactScore / 100, 2));
  }

  private calculateMentorBonus(milestones: MilestoneSpec[]): number {
    const totalFeedback = milestones.reduce((sum, m) => sum + m.feedback.length, 0);
    const approvalFeedback = milestones.reduce((sum, m) => 
      sum + m.feedback.filter(f => f.approval_status).length, 0);

    if (totalFeedback === 0) return 0;

    const approvalRate = approvalFeedback / totalFeedback;
    const engagementBonus = Math.min(totalFeedback * 10, 100); // Cap at 100
    const qualityBonus = Math.floor(approvalRate * 50);

    return engagementBonus + qualityBonus;
  }

  private async calculateScrollAlignmentBonus(project: ScrollProjectSpec): Promise<number> {
    // This would integrate with the validation service to get alignment score
    // For now, using a placeholder calculation
    const alignmentScore = 85; // Would be retrieved from validation service
    
    if (alignmentScore >= 90) return 200;
    if (alignmentScore >= 80) return 100;
    if (alignmentScore >= 70) return 50;
    return 0;
  }

  private calculateInnovationBonus(project: ScrollProjectSpec): number {
    // Innovation bonus based on project characteristics
    let bonus = 0;

    if (project.metadata?.tags.includes('innovative')) bonus += 50;
    if (project.metadata?.tags.includes('ai-powered')) bonus += 30;
    if (project.metadata?.tags.includes('blockchain')) bonus += 40;
    if (project.metadata?.difficulty_level === 'advanced') bonus += 25;

    return Math.min(bonus, 150); // Cap at 150
  }

  private calculateQualityMultiplier(milestone: MilestoneSpec): number {
    const approvedFeedback = milestone.feedback.filter(f => f.approval_status).length;
    const totalFeedback = milestone.feedback.length;
    
    if (totalFeedback === 0) return 1.0;
    
    const approvalRate = approvedFeedback / totalFeedback;
    return 0.5 + (approvalRate * 0.5); // Range: 0.5 to 1.0
  }

  private getStatusMultiplier(status: ProjectStatus): number {
    const multipliers: Record<ProjectStatus, number> = {
      [ProjectStatus.PROPOSAL]: 0.1,
      [ProjectStatus.IN_PROGRESS]: 0.3,
      [ProjectStatus.REVIEW]: 0.6,
      [ProjectStatus.SUBMITTED]: 0.8,
      [ProjectStatus.LISTED]: 1.0,
      [ProjectStatus.ARCHIVED]: 0.9
    };

    return multipliers[status] || 0.5;
  }

  private getMilestoneMultiplier(stage: MilestoneStage): number {
    const multipliers: Record<MilestoneStage, number> = {
      [MilestoneStage.PROPOSAL]: 0.2,
      [MilestoneStage.PROTOTYPE]: 0.4,
      [MilestoneStage.TESTING]: 0.3,
      [MilestoneStage.FINAL]: 0.1
    };

    return multipliers[stage] || 0.25;
  }

  private calculateUsageRewards(metrics: UsageMetrics): number {
    let rewards = 0;

    // User engagement rewards
    rewards += Math.floor(metrics.active_users_30d * 0.5);
    
    // Session quality rewards
    if (metrics.average_session_duration > 300) { // 5 minutes
      rewards += Math.floor(metrics.total_sessions * 0.1);
    }

    // Satisfaction rewards
    if (metrics.user_satisfaction_score > 4.0) {
      rewards += Math.floor(metrics.user_satisfaction_score * 20);
    }

    // Revenue sharing (10% of revenue as bonus)
    if (metrics.revenue_generated) {
      rewards += Math.floor(metrics.revenue_generated * 0.1);
    }

    return Math.min(rewards, 1000); // Cap at 1000 ScrollCoin per period
  }

  private async distributeUsageRewards(projectId: string, rewards: number, metrics: UsageMetrics): Promise<void> {
    const project = await this.loadProject(projectId);
    if (!project) return;

    const transaction: ScrollCoinTransaction = {
      transaction_id: uuidv4(),
      from_account: 'usage_rewards_pool',
      to_account: project.student_id,
      amount: rewards,
      transaction_type: 'usage_bonus',
      description: `Usage-based rewards: ${metrics.active_users_30d} active users, ${metrics.user_satisfaction_score} satisfaction`,
      project_id: projectId,
      timestamp: new Date()
    };

    await this.scrollCoinService.transferScrollCoin(
      transaction.from_account,
      transaction.to_account,
      transaction.amount,
      transaction.description
    );

    await this.scrollCoinService.createTransaction(transaction);
  }

  private getDefaultRewardConfig(): RewardConfiguration {
    return {
      baseProjectReward: 500,
      baseMilestoneReward: 100,
      impactBonusBase: 200,
      scrollCoinToXPRatio: 2.0,
      maxDailyRewards: 2000,
      usageRewardMultiplier: 1.0
    };
  }

  private async logRewardDistribution(studentId: string, rewards: RewardCalculation, transactionId: string): Promise<void> {
    // Placeholder for logging reward distribution
    console.log(`Distributed ${rewards.total_scrollcoin} ScrollCoin and ${rewards.xp_awarded} XP to student ${studentId}`);
  }

  // Database integration methods (placeholders)
  private async loadProject(projectId: string): Promise<ScrollProjectSpec | null> {
    // Placeholder - would integrate with actual database
    console.log(`Loading project ${projectId}`);
    return null;
  }

  private async saveProject(project: ScrollProjectSpec): Promise<void> {
    // Placeholder - would integrate with actual database
    console.log(`Saving project ${project.project_id}`);
  }

  private async loadUsageMetrics(projectId: string): Promise<Partial<UsageMetrics>> {
    // Placeholder - would integrate with analytics services
    console.log(`Loading usage metrics for project ${projectId}`);
    return {};
  }

  private async loadStudentTransactions(studentId: string): Promise<ScrollCoinTransaction[]> {
    // Placeholder - would integrate with transaction database
    console.log(`Loading transactions for student ${studentId}`);
    return [];
  }
}

interface RewardConfiguration {
  baseProjectReward: number;
  baseMilestoneReward: number;
  impactBonusBase: number;
  scrollCoinToXPRatio: number;
  maxDailyRewards: number;
  usageRewardMultiplier: number;
}