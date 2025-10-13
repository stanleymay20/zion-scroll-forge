import {
  DivineScorecard,
  PurposeTracking,
  SkillsTracking,
  AlignmentTracking,
  PurposeMilestone,
  DivineAssignment,
  Skill,
  SkillEvidence,
  AlignmentArea
} from '../types/spiritual-formation';

export class DivineScoreCardService {
  private scorecards: Map<string, DivineScorecard> = new Map();

  async getDivineScorecard(userId: string): Promise<DivineScorecard | null> {
    return this.scorecards.get(userId) || null;
  }

  async createDivineScorecard(userId: string): Promise<DivineScorecard> {
    const scorecard: DivineScorecard = {
      id: `scorecard_${userId}_${Date.now()}`,
      userId,
      purpose: this.initializePurposeTracking(),
      skills: this.initializeSkillsTracking(),
      alignment: this.initializeAlignmentTracking(),
      overallScore: 0,
      lastUpdated: new Date()
    };

    scorecard.overallScore = this.calculateOverallScore(scorecard);
    this.scorecards.set(userId, scorecard);
    return scorecard;
  }

  async updatePurposeTracking(userId: string, purpose: Partial<PurposeTracking>): Promise<DivineScorecard> {
    const scorecard = await this.getDivineScorecard(userId);
    if (!scorecard) {
      throw new Error('Divine Scorecard not found');
    }

    scorecard.purpose = { ...scorecard.purpose, ...purpose };
    scorecard.lastUpdated = new Date();
    scorecard.overallScore = this.calculateOverallScore(scorecard);
    
    this.scorecards.set(userId, scorecard);
    return scorecard;
  }

  async updateSkillsTracking(userId: string, skills: Partial<SkillsTracking>): Promise<DivineScorecard> {
    const scorecard = await this.getDivineScorecard(userId);
    if (!scorecard) {
      throw new Error('Divine Scorecard not found');
    }

    scorecard.skills = { ...scorecard.skills, ...skills };
    scorecard.lastUpdated = new Date();
    scorecard.overallScore = this.calculateOverallScore(scorecard);
    
    this.scorecards.set(userId, scorecard);
    return scorecard;
  }

  async updateAlignmentTracking(userId: string, alignment: Partial<AlignmentTracking>): Promise<DivineScorecard> {
    const scorecard = await this.getDivineScorecard(userId);
    if (!scorecard) {
      throw new Error('Divine Scorecard not found');
    }

    scorecard.alignment = { ...scorecard.alignment, ...alignment };
    scorecard.lastUpdated = new Date();
    scorecard.overallScore = this.calculateOverallScore(scorecard);
    
    this.scorecards.set(userId, scorecard);
    return scorecard;
  }

  async addPurposeMilestone(userId: string, milestone: Omit<PurposeMilestone, 'id'>): Promise<DivineScorecard> {
    const scorecard = await this.getDivineScorecard(userId);
    if (!scorecard) {
      throw new Error('Divine Scorecard not found');
    }

    const newMilestone: PurposeMilestone = {
      ...milestone,
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    scorecard.purpose.milestones.push(newMilestone);
    scorecard.lastUpdated = new Date();
    scorecard.overallScore = this.calculateOverallScore(scorecard);
    
    this.scorecards.set(userId, scorecard);
    return scorecard;
  }

  async completePurposeMilestone(userId: string, milestoneId: string, impact: string): Promise<DivineScorecard> {
    const scorecard = await this.getDivineScorecard(userId);
    if (!scorecard) {
      throw new Error('Divine Scorecard not found');
    }

    const milestone = scorecard.purpose.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    milestone.completed = true;
    milestone.completedAt = new Date();
    milestone.impact = impact;

    // Update purpose progress based on completed milestones
    const completedCount = scorecard.purpose.milestones.filter(m => m.completed).length;
    const totalCount = scorecard.purpose.milestones.length;
    scorecard.purpose.progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    scorecard.lastUpdated = new Date();
    scorecard.overallScore = this.calculateOverallScore(scorecard);
    
    this.scorecards.set(userId, scorecard);
    return scorecard;
  }

  async addDivineAssignment(userId: string, assignment: Omit<DivineAssignment, 'id'>): Promise<DivineScorecard> {
    const scorecard = await this.getDivineScorecard(userId);
    if (!scorecard) {
      throw new Error('Divine Scorecard not found');
    }

    const newAssignment: DivineAssignment = {
      ...assignment,
      id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    scorecard.purpose.divineAssignments.push(newAssignment);
    scorecard.lastUpdated = new Date();
    
    this.scorecards.set(userId, scorecard);
    return scorecard;
  }

  async updateDivineAssignmentProgress(userId: string, assignmentId: string, progress: number): Promise<DivineScorecard> {
    const scorecard = await this.getDivineScorecard(userId);
    if (!scorecard) {
      throw new Error('Divine Scorecard not found');
    }

    const assignment = scorecard.purpose.divineAssignments.find(a => a.id === assignmentId);
    if (!assignment) {
      throw new Error('Divine Assignment not found');
    }

    assignment.progress = Math.max(0, Math.min(100, progress));
    if (progress >= 100) {
      assignment.status = 'completed';
    }

    scorecard.lastUpdated = new Date();
    scorecard.overallScore = this.calculateOverallScore(scorecard);
    
    this.scorecards.set(userId, scorecard);
    return scorecard;
  }

  async addSkillEvidence(userId: string, skillId: string, evidence: Omit<SkillEvidence, 'id'>): Promise<DivineScorecard> {
    const scorecard = await this.getDivineScorecard(userId);
    if (!scorecard) {
      throw new Error('Divine Scorecard not found');
    }

    // Find the skill across all categories
    let targetSkill: Skill | undefined;
    const categories = [
      scorecard.skills.academicSkills,
      scorecard.skills.spiritualSkills,
      scorecard.skills.practicalSkills,
      scorecard.skills.leadershipSkills
    ];

    for (const category of categories) {
      targetSkill = category.skills.find(s => s.id === skillId);
      if (targetSkill) break;
    }

    if (!targetSkill) {
      throw new Error('Skill not found');
    }

    const newEvidence: SkillEvidence = {
      ...evidence,
      id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    targetSkill.evidence.push(newEvidence);
    targetSkill.lastAssessed = new Date();

    // Recalculate skill levels and category averages
    this.recalculateSkillLevels(scorecard);

    scorecard.lastUpdated = new Date();
    scorecard.overallScore = this.calculateOverallScore(scorecard);
    
    this.scorecards.set(userId, scorecard);
    return scorecard;
  }

  async updateCallingStatement(userId: string, callingStatement: string): Promise<DivineScorecard> {
    const scorecard = await this.getDivineScorecard(userId);
    if (!scorecard) {
      throw new Error('Divine Scorecard not found');
    }

    scorecard.purpose.callingStatement = callingStatement;
    scorecard.purpose.clarity = this.calculateCallingClarity(scorecard.purpose);
    scorecard.lastUpdated = new Date();
    scorecard.overallScore = this.calculateOverallScore(scorecard);
    
    this.scorecards.set(userId, scorecard);
    return scorecard;
  }

  private initializePurposeTracking(): PurposeTracking {
    return {
      clarity: 0,
      alignment: 0,
      progress: 0,
      milestones: [],
      callingStatement: '',
      divineAssignments: []
    };
  }

  private initializeSkillsTracking(): SkillsTracking {
    return {
      academicSkills: {
        name: 'Academic Skills',
        skills: this.getDefaultAcademicSkills(),
        averageLevel: 0,
        targetLevel: 8
      },
      spiritualSkills: {
        name: 'Spiritual Skills',
        skills: this.getDefaultSpiritualSkills(),
        averageLevel: 0,
        targetLevel: 9
      },
      practicalSkills: {
        name: 'Practical Skills',
        skills: this.getDefaultPracticalSkills(),
        averageLevel: 0,
        targetLevel: 7
      },
      leadershipSkills: {
        name: 'Leadership Skills',
        skills: this.getDefaultLeadershipSkills(),
        averageLevel: 0,
        targetLevel: 8
      },
      overallProgress: 0
    };
  }

  private initializeAlignmentTracking(): AlignmentTracking {
    return {
      scrollAlignment: 0,
      biblicalAlignment: 0,
      kingdomAlignment: 0,
      characterAlignment: 0,
      overallAlignment: 0,
      alignmentAreas: this.getDefaultAlignmentAreas()
    };
  }

  private getDefaultAcademicSkills(): Skill[] {
    return [
      {
        id: 'critical_thinking',
        name: 'Critical Thinking',
        description: 'Ability to analyze, evaluate, and synthesize information',
        currentLevel: 1,
        targetLevel: 8,
        evidence: [],
        developmentPlan: ['Complete logic courses', 'Practice debate', 'Analyze case studies'],
        lastAssessed: new Date()
      },
      {
        id: 'research_methodology',
        name: 'Research Methodology',
        description: 'Skills in conducting thorough and accurate research',
        currentLevel: 1,
        targetLevel: 8,
        evidence: [],
        developmentPlan: ['Learn research methods', 'Practice data collection', 'Write research papers'],
        lastAssessed: new Date()
      },
      {
        id: 'communication',
        name: 'Communication',
        description: 'Effective written and verbal communication skills',
        currentLevel: 1,
        targetLevel: 9,
        evidence: [],
        developmentPlan: ['Practice public speaking', 'Write regularly', 'Join debate club'],
        lastAssessed: new Date()
      }
    ];
  }

  private getDefaultSpiritualSkills(): Skill[] {
    return [
      {
        id: 'prayer_intercession',
        name: 'Prayer & Intercession',
        description: 'Ability to pray effectively and intercede for others',
        currentLevel: 1,
        targetLevel: 10,
        evidence: [],
        developmentPlan: ['Daily prayer time', 'Join prayer groups', 'Study prayer methods'],
        lastAssessed: new Date()
      },
      {
        id: 'scripture_study',
        name: 'Scripture Study',
        description: 'Deep understanding and application of biblical principles',
        currentLevel: 1,
        targetLevel: 9,
        evidence: [],
        developmentPlan: ['Daily Bible reading', 'Hermeneutics course', 'Scripture memorization'],
        lastAssessed: new Date()
      },
      {
        id: 'prophetic_sensitivity',
        name: 'Prophetic Sensitivity',
        description: 'Ability to hear and discern God\'s voice',
        currentLevel: 1,
        targetLevel: 8,
        evidence: [],
        developmentPlan: ['Prophetic training', 'Practice listening prayer', 'Seek mentorship'],
        lastAssessed: new Date()
      },
      {
        id: 'discipleship',
        name: 'Discipleship',
        description: 'Ability to mentor and disciple others in faith',
        currentLevel: 1,
        targetLevel: 8,
        evidence: [],
        developmentPlan: ['Mentor training', 'Practice discipling', 'Study discipleship models'],
        lastAssessed: new Date()
      }
    ];
  }

  private getDefaultPracticalSkills(): Skill[] {
    return [
      {
        id: 'project_management',
        name: 'Project Management',
        description: 'Ability to plan, execute, and deliver projects',
        currentLevel: 1,
        targetLevel: 7,
        evidence: [],
        developmentPlan: ['PM certification', 'Lead projects', 'Use PM tools'],
        lastAssessed: new Date()
      },
      {
        id: 'technology_proficiency',
        name: 'Technology Proficiency',
        description: 'Competence with modern technology and digital tools',
        currentLevel: 1,
        targetLevel: 7,
        evidence: [],
        developmentPlan: ['Learn new software', 'Take tech courses', 'Build digital projects'],
        lastAssessed: new Date()
      },
      {
        id: 'financial_stewardship',
        name: 'Financial Stewardship',
        description: 'Wise management of financial resources',
        currentLevel: 1,
        targetLevel: 7,
        evidence: [],
        developmentPlan: ['Budgeting course', 'Investment training', 'Stewardship study'],
        lastAssessed: new Date()
      }
    ];
  }

  private getDefaultLeadershipSkills(): Skill[] {
    return [
      {
        id: 'servant_leadership',
        name: 'Servant Leadership',
        description: 'Leading through service and humility',
        currentLevel: 1,
        targetLevel: 9,
        evidence: [],
        developmentPlan: ['Leadership training', 'Serve in ministry', 'Study servant leadership'],
        lastAssessed: new Date()
      },
      {
        id: 'team_building',
        name: 'Team Building',
        description: 'Ability to build and lead effective teams',
        currentLevel: 1,
        targetLevel: 8,
        evidence: [],
        developmentPlan: ['Team leadership roles', 'Conflict resolution training', 'Team dynamics study'],
        lastAssessed: new Date()
      },
      {
        id: 'vision_casting',
        name: 'Vision Casting',
        description: 'Ability to communicate and inspire others with vision',
        currentLevel: 1,
        targetLevel: 8,
        evidence: [],
        developmentPlan: ['Vision development', 'Public speaking', 'Strategic planning'],
        lastAssessed: new Date()
      }
    ];
  }

  private getDefaultAlignmentAreas(): AlignmentArea[] {
    return [
      {
        id: 'scroll_principles',
        name: 'Scroll Principles',
        description: 'Alignment with ScrollUniversity core principles',
        currentScore: 50,
        targetScore: 95,
        actionItems: ['Study scroll principles', 'Apply in daily life', 'Seek mentorship'],
        lastReview: new Date()
      },
      {
        id: 'biblical_worldview',
        name: 'Biblical Worldview',
        description: 'Consistency with biblical principles and values',
        currentScore: 50,
        targetScore: 95,
        actionItems: ['Daily scripture study', 'Worldview training', 'Apply biblical principles'],
        lastReview: new Date()
      },
      {
        id: 'kingdom_priorities',
        name: 'Kingdom Priorities',
        description: 'Prioritizing God\'s kingdom in decisions and actions',
        currentScore: 50,
        targetScore: 90,
        actionItems: ['Seek first the kingdom', 'Eternal perspective', 'Kingdom service'],
        lastReview: new Date()
      },
      {
        id: 'character_integrity',
        name: 'Character Integrity',
        description: 'Consistency between beliefs, words, and actions',
        currentScore: 50,
        targetScore: 95,
        actionItems: ['Character assessment', 'Accountability partner', 'Integrity practices'],
        lastReview: new Date()
      }
    ];
  }

  private calculateOverallScore(scorecard: DivineScorecard): number {
    const purposeWeight = 0.4;
    const skillsWeight = 0.3;
    const alignmentWeight = 0.3;

    const purposeScore = (scorecard.purpose.clarity + scorecard.purpose.alignment + scorecard.purpose.progress) / 3;
    const skillsScore = scorecard.skills.overallProgress;
    const alignmentScore = scorecard.alignment.overallAlignment;

    return Math.round(purposeScore * purposeWeight + skillsScore * skillsWeight + alignmentScore * alignmentWeight);
  }

  private calculateCallingClarity(purpose: PurposeTracking): number {
    let clarity = 0;
    
    // Base clarity from calling statement
    if (purpose.callingStatement && purpose.callingStatement.length > 50) {
      clarity += 30;
    }

    // Clarity from divine assignments
    const activeAssignments = purpose.divineAssignments.filter(a => a.status === 'active' || a.status === 'confirmed');
    clarity += Math.min(30, activeAssignments.length * 10);

    // Clarity from completed milestones
    const completedMilestones = purpose.milestones.filter(m => m.completed);
    clarity += Math.min(40, completedMilestones.length * 5);

    return Math.min(100, clarity);
  }

  private recalculateSkillLevels(scorecard: DivineScorecard): void {
    const categories = [
      scorecard.skills.academicSkills,
      scorecard.skills.spiritualSkills,
      scorecard.skills.practicalSkills,
      scorecard.skills.leadershipSkills
    ];

    let totalSkillLevel = 0;
    let totalSkillCount = 0;

    categories.forEach(category => {
      let categoryTotal = 0;
      category.skills.forEach(skill => {
        // Adjust skill level based on evidence
        const evidenceBonus = Math.min(2, skill.evidence.length * 0.5);
        skill.currentLevel = Math.min(10, skill.currentLevel + evidenceBonus);
        categoryTotal += skill.currentLevel;
        totalSkillLevel += skill.currentLevel;
        totalSkillCount++;
      });
      category.averageLevel = category.skills.length > 0 ? categoryTotal / category.skills.length : 0;
    });

    scorecard.skills.overallProgress = totalSkillCount > 0 ? (totalSkillLevel / (totalSkillCount * 10)) * 100 : 0;

    // Recalculate alignment
    const alignmentAreas = scorecard.alignment.alignmentAreas;
    const totalAlignment = alignmentAreas.reduce((sum, area) => sum + area.currentScore, 0);
    scorecard.alignment.overallAlignment = alignmentAreas.length > 0 ? totalAlignment / alignmentAreas.length : 0;

    scorecard.alignment.scrollAlignment = alignmentAreas.find(a => a.id === 'scroll_principles')?.currentScore || 0;
    scorecard.alignment.biblicalAlignment = alignmentAreas.find(a => a.id === 'biblical_worldview')?.currentScore || 0;
    scorecard.alignment.kingdomAlignment = alignmentAreas.find(a => a.id === 'kingdom_priorities')?.currentScore || 0;
    scorecard.alignment.characterAlignment = alignmentAreas.find(a => a.id === 'character_integrity')?.currentScore || 0;
  }
}

export const divineScoreCardService = new DivineScoreCardService();