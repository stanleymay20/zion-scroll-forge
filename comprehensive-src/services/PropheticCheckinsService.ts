import {
  PropheticCheckin,
  JournalEntry,
  VisionBoardEntry,
  IntercessionPrompt,
  SpiritualTemperature,
  PropheticWord,
  ActionItem,
  VisionImage,
  VisionScripture,
  VisionGoal
} from '../types/spiritual-formation';

export class PropheticCheckinsService {
  private checkins: Map<string, PropheticCheckin[]> = new Map();
  private visionBoards: Map<string, VisionBoardEntry[]> = new Map();

  async createPropheticCheckin(userId: string, type: 'daily' | 'weekly' | 'monthly' | 'special'): Promise<PropheticCheckin> {
    const checkin: PropheticCheckin = {
      id: `checkin_${userId}_${Date.now()}`,
      userId,
      date: new Date(),
      type,
      journalEntry: this.createEmptyJournalEntry(),
      visionBoard: this.createEmptyVisionBoardEntry(),
      intercessionPrompts: await this.generateIntercessionPrompts(type),
      spiritualTemperature: this.createEmptySpiritualTemperature(),
      propheticWords: [],
      actionItems: []
    };

    const userCheckins = this.checkins.get(userId) || [];
    userCheckins.push(checkin);
    this.checkins.set(userId, userCheckins);

    return checkin;
  }

  async updateJournalEntry(userId: string, checkinId: string, journalData: Partial<JournalEntry>): Promise<PropheticCheckin> {
    const checkin = await this.getCheckinById(userId, checkinId);
    if (!checkin) {
      throw new Error('Prophetic check-in not found');
    }

    checkin.journalEntry = { ...checkin.journalEntry, ...journalData };
    return checkin;
  }

  async updateSpiritualTemperature(userId: string, checkinId: string, temperature: Partial<SpiritualTemperature>): Promise<PropheticCheckin> {
    const checkin = await this.getCheckinById(userId, checkinId);
    if (!checkin) {
      throw new Error('Prophetic check-in not found');
    }

    checkin.spiritualTemperature = { ...checkin.spiritualTemperature, ...temperature };
    
    // Calculate overall temperature
    const temps = [
      checkin.spiritualTemperature.prayerLife,
      checkin.spiritualTemperature.wordStudy,
      checkin.spiritualTemperature.worship,
      checkin.spiritualTemperature.fellowship,
      checkin.spiritualTemperature.service,
      checkin.spiritualTemperature.evangelism,
      checkin.spiritualTemperature.discipleship
    ];
    
    checkin.spiritualTemperature.overall = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    
    return checkin;
  }

  async addPropheticWord(userId: string, checkinId: string, propheticWord: Omit<PropheticWord, 'id'>): Promise<PropheticCheckin> {
    const checkin = await this.getCheckinById(userId, checkinId);
    if (!checkin) {
      throw new Error('Prophetic check-in not found');
    }

    const newWord: PropheticWord = {
      ...propheticWord,
      id: `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    checkin.propheticWords.push(newWord);
    return checkin;
  }

  async addActionItem(userId: string, checkinId: string, actionItem: Omit<ActionItem, 'id'>): Promise<PropheticCheckin> {
    const checkin = await this.getCheckinById(userId, checkinId);
    if (!checkin) {
      throw new Error('Prophetic check-in not found');
    }

    const newActionItem: ActionItem = {
      ...actionItem,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    checkin.actionItems.push(newActionItem);
    return checkin;
  }

  async completeActionItem(userId: string, checkinId: string, actionItemId: string): Promise<PropheticCheckin> {
    const checkin = await this.getCheckinById(userId, checkinId);
    if (!checkin) {
      throw new Error('Prophetic check-in not found');
    }

    const actionItem = checkin.actionItems.find(item => item.id === actionItemId);
    if (!actionItem) {
      throw new Error('Action item not found');
    }

    actionItem.completed = true;
    actionItem.completedAt = new Date();
    
    return checkin;
  }

  async createVisionBoard(userId: string, title: string, description: string): Promise<VisionBoardEntry> {
    const visionBoard: VisionBoardEntry = {
      id: `vision_${userId}_${Date.now()}`,
      title,
      description,
      images: [],
      scriptures: [],
      goals: [],
      status: 'active'
    };

    const userVisionBoards = this.visionBoards.get(userId) || [];
    userVisionBoards.push(visionBoard);
    this.visionBoards.set(userId, userVisionBoards);

    return visionBoard;
  }

  async addVisionImage(userId: string, visionBoardId: string, image: Omit<VisionImage, 'id' | 'addedDate'>): Promise<VisionBoardEntry> {
    const visionBoard = await this.getVisionBoardById(userId, visionBoardId);
    if (!visionBoard) {
      throw new Error('Vision board not found');
    }

    const newImage: VisionImage = {
      ...image,
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedDate: new Date()
    };

    visionBoard.images.push(newImage);
    return visionBoard;
  }

  async addVisionScripture(userId: string, visionBoardId: string, scripture: Omit<VisionScripture, 'id' | 'addedDate'>): Promise<VisionBoardEntry> {
    const visionBoard = await this.getVisionBoardById(userId, visionBoardId);
    if (!visionBoard) {
      throw new Error('Vision board not found');
    }

    const newScripture: VisionScripture = {
      ...scripture,
      id: `scripture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedDate: new Date()
    };

    visionBoard.scriptures.push(newScripture);
    return visionBoard;
  }

  async addVisionGoal(userId: string, visionBoardId: string, goal: Omit<VisionGoal, 'id'>): Promise<VisionBoardEntry> {
    const visionBoard = await this.getVisionBoardById(userId, visionBoardId);
    if (!visionBoard) {
      throw new Error('Vision board not found');
    }

    const newGoal: VisionGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    visionBoard.goals.push(newGoal);
    return visionBoard;
  }

  async updateVisionGoalProgress(userId: string, visionBoardId: string, goalId: string, progress: number): Promise<VisionBoardEntry> {
    const visionBoard = await this.getVisionBoardById(userId, visionBoardId);
    if (!visionBoard) {
      throw new Error('Vision board not found');
    }

    const goal = visionBoard.goals.find(g => g.id === goalId);
    if (!goal) {
      throw new Error('Vision goal not found');
    }

    goal.progress = Math.max(0, Math.min(100, progress));
    return visionBoard;
  }

  async getUserCheckins(userId: string, limit?: number): Promise<PropheticCheckin[]> {
    const userCheckins = this.checkins.get(userId) || [];
    return limit ? userCheckins.slice(-limit) : userCheckins;
  }

  async getUserVisionBoards(userId: string): Promise<VisionBoardEntry[]> {
    return this.visionBoards.get(userId) || [];
  }

  async getCheckinsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<PropheticCheckin[]> {
    const userCheckins = this.checkins.get(userId) || [];
    return userCheckins.filter(checkin => 
      checkin.date >= startDate && checkin.date <= endDate
    );
  }

  async getCheckinAnalytics(userId: string, days: number = 30): Promise<{
    totalCheckins: number;
    averageSpiritualTemperature: number;
    completedActionItems: number;
    totalActionItems: number;
    propheticWordsReceived: number;
    journalEntries: number;
    trends: {
      spiritualTemperature: number[];
      checkinFrequency: number[];
    };
  }> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const checkins = await this.getCheckinsByDateRange(userId, startDate, endDate);
    
    const totalCheckins = checkins.length;
    const averageSpiritualTemperature = checkins.length > 0 
      ? checkins.reduce((sum, c) => sum + c.spiritualTemperature.overall, 0) / checkins.length 
      : 0;
    
    const allActionItems = checkins.flatMap(c => c.actionItems);
    const completedActionItems = allActionItems.filter(item => item.completed).length;
    const totalActionItems = allActionItems.length;
    
    const propheticWordsReceived = checkins.reduce((sum, c) => sum + c.propheticWords.length, 0);
    const journalEntries = checkins.filter(c => c.journalEntry.content.length > 0).length;
    
    // Calculate trends (simplified)
    const spiritualTemperatureTrend = checkins.map(c => c.spiritualTemperature.overall);
    const checkinFrequencyTrend = this.calculateCheckinFrequency(checkins, days);
    
    return {
      totalCheckins,
      averageSpiritualTemperature,
      completedActionItems,
      totalActionItems,
      propheticWordsReceived,
      journalEntries,
      trends: {
        spiritualTemperature: spiritualTemperatureTrend,
        checkinFrequency: checkinFrequencyTrend
      }
    };
  }

  private async getCheckinById(userId: string, checkinId: string): Promise<PropheticCheckin | null> {
    const userCheckins = this.checkins.get(userId) || [];
    return userCheckins.find(checkin => checkin.id === checkinId) || null;
  }

  private async getVisionBoardById(userId: string, visionBoardId: string): Promise<VisionBoardEntry | null> {
    const userVisionBoards = this.visionBoards.get(userId) || [];
    return userVisionBoards.find(board => board.id === visionBoardId) || null;
  }

  private createEmptyJournalEntry(): JournalEntry {
    return {
      id: `journal_${Date.now()}`,
      content: '',
      mood: '',
      spiritualInsights: [],
      challenges: [],
      victories: [],
      gratitude: [],
      prayerRequests: [],
      date: new Date()
    };
  }

  private createEmptyVisionBoardEntry(): VisionBoardEntry {
    return {
      id: `vision_${Date.now()}`,
      title: '',
      description: '',
      images: [],
      scriptures: [],
      goals: [],
      status: 'active'
    };
  }

  private createEmptySpiritualTemperature(): SpiritualTemperature {
    return {
      overall: 5,
      prayerLife: 5,
      wordStudy: 5,
      worship: 5,
      fellowship: 5,
      service: 5,
      evangelism: 5,
      discipleship: 5,
      notes: ''
    };
  }

  private async generateIntercessionPrompts(type: 'daily' | 'weekly' | 'monthly' | 'special'): Promise<IntercessionPrompt[]> {
    const basePrompts: IntercessionPrompt[] = [
      {
        id: 'personal_growth',
        title: 'Personal Spiritual Growth',
        description: 'Pray for your own spiritual development and relationship with God',
        category: 'personal',
        urgency: 'medium',
        scriptureReference: 'Philippians 1:6',
        prayerPoints: [
          'Growth in faith and trust',
          'Deeper intimacy with God',
          'Character development',
          'Wisdom and discernment'
        ],
        duration: 10,
        frequency: 'daily',
        createdAt: new Date()
      },
      {
        id: 'family_blessing',
        title: 'Family Blessing and Protection',
        description: 'Intercede for your family members and their spiritual well-being',
        category: 'family',
        urgency: 'high',
        scriptureReference: 'Joshua 24:15',
        prayerPoints: [
          'Salvation of family members',
          'Protection from harm',
          'Unity and love',
          'God\'s provision'
        ],
        duration: 15,
        frequency: 'daily',
        createdAt: new Date()
      }
    ];

    // Add type-specific prompts
    if (type === 'weekly' || type === 'monthly') {
      basePrompts.push({
        id: 'global_missions',
        title: 'Global Missions and Evangelism',
        description: 'Pray for missionaries and evangelism efforts worldwide',
        category: 'global',
        urgency: 'high',
        scriptureReference: 'Matthew 28:19-20',
        prayerPoints: [
          'Missionaries around the world',
          'Unreached people groups',
          'Church planting efforts',
          'Persecution of believers'
        ],
        duration: 20,
        frequency: type,
        createdAt: new Date()
      });
    }

    if (type === 'monthly' || type === 'special') {
      basePrompts.push({
        id: 'national_transformation',
        title: 'National and Global Transformation',
        description: 'Intercede for nations and global transformation',
        category: 'nation',
        urgency: 'critical',
        scriptureReference: '2 Chronicles 7:14',
        prayerPoints: [
          'Government leaders',
          'Social justice',
          'Economic stability',
          'Spiritual awakening'
        ],
        duration: 30,
        frequency: type === 'special' ? 'once' : type,
        createdAt: new Date()
      });
    }

    return basePrompts;
  }

  private calculateCheckinFrequency(checkins: PropheticCheckin[], days: number): number[] {
    const frequency: number[] = new Array(days).fill(0);
    
    checkins.forEach(checkin => {
      const dayIndex = Math.floor((new Date().getTime() - checkin.date.getTime()) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < days) {
        frequency[days - 1 - dayIndex]++;
      }
    });
    
    return frequency;
  }
}

export const propheticCheckinsService = new PropheticCheckinsService();