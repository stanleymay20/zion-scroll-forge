import {
  IntercessionPrompt,
  PrayerRequest,
  PrayerTestimony,
  IntercessionSession
} from '../types/spiritual-formation';

export class IntercessionPrayerService {
  private prayerRequests: Map<string, PrayerRequest[]> = new Map();
  private intercessionSessions: Map<string, IntercessionSession[]> = new Map();
  private globalPrayerRequests: PrayerRequest[] = [];

  async createPrayerRequest(userId: string, request: Omit<PrayerRequest, 'id' | 'prayerCount' | 'testimonies' | 'createdAt' | 'updatedAt'>): Promise<PrayerRequest> {
    const prayerRequest: PrayerRequest = {
      ...request,
      id: `prayer_${userId}_${Date.now()}`,
      userId,
      prayerCount: 0,
      testimonies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userRequests = this.prayerRequests.get(userId) || [];
    userRequests.push(prayerRequest);
    this.prayerRequests.set(userId, userRequests);

    // Add to global requests if public
    if (prayerRequest.isPublic) {
      this.globalPrayerRequests.push(prayerRequest);
    }

    return prayerRequest;
  }

  async updatePrayerRequest(userId: string, requestId: string, updates: Partial<PrayerRequest>): Promise<PrayerRequest> {
    const userRequests = this.prayerRequests.get(userId) || [];
    const requestIndex = userRequests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) {
      throw new Error('Prayer request not found');
    }

    const updatedRequest = { ...userRequests[requestIndex], ...updates, updatedAt: new Date() };
    userRequests[requestIndex] = updatedRequest;
    this.prayerRequests.set(userId, userRequests);

    // Update global requests if public
    if (updatedRequest.isPublic) {
      const globalIndex = this.globalPrayerRequests.findIndex(req => req.id === requestId);
      if (globalIndex !== -1) {
        this.globalPrayerRequests[globalIndex] = updatedRequest;
      } else {
        this.globalPrayerRequests.push(updatedRequest);
      }
    } else {
      // Remove from global if no longer public
      this.globalPrayerRequests = this.globalPrayerRequests.filter(req => req.id !== requestId);
    }

    return updatedRequest;
  }

  async prayForRequest(prayerRequestId: string, prayingUserId: string): Promise<PrayerRequest> {
    // Find the request across all users
    let targetRequest: PrayerRequest | null = null;
    let requestOwner: string | null = null;

    for (const [userId, requests] of this.prayerRequests.entries()) {
      const request = requests.find(req => req.id === prayerRequestId);
      if (request) {
        targetRequest = request;
        requestOwner = userId;
        break;
      }
    }

    if (!targetRequest || !requestOwner) {
      throw new Error('Prayer request not found');
    }

    // Increment prayer count
    targetRequest.prayerCount++;
    targetRequest.updatedAt = new Date();

    // Update in storage
    const ownerRequests = this.prayerRequests.get(requestOwner)!;
    const requestIndex = ownerRequests.findIndex(req => req.id === prayerRequestId);
    ownerRequests[requestIndex] = targetRequest;
    this.prayerRequests.set(requestOwner, ownerRequests);

    // Update global requests if public
    if (targetRequest.isPublic) {
      const globalIndex = this.globalPrayerRequests.findIndex(req => req.id === prayerRequestId);
      if (globalIndex !== -1) {
        this.globalPrayerRequests[globalIndex] = targetRequest;
      }
    }

    return targetRequest;
  }

  async addPrayerTestimony(prayerRequestId: string, testimony: Omit<PrayerTestimony, 'id'>): Promise<PrayerRequest> {
    // Find the request across all users
    let targetRequest: PrayerRequest | null = null;
    let requestOwner: string | null = null;

    for (const [userId, requests] of this.prayerRequests.entries()) {
      const request = requests.find(req => req.id === prayerRequestId);
      if (request) {
        targetRequest = request;
        requestOwner = userId;
        break;
      }
    }

    if (!targetRequest || !requestOwner) {
      throw new Error('Prayer request not found');
    }

    const newTestimony: PrayerTestimony = {
      ...testimony,
      id: `testimony_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    targetRequest.testimonies.push(newTestimony);
    targetRequest.updatedAt = new Date();

    // Update in storage
    const ownerRequests = this.prayerRequests.get(requestOwner)!;
    const requestIndex = ownerRequests.findIndex(req => req.id === prayerRequestId);
    ownerRequests[requestIndex] = targetRequest;
    this.prayerRequests.set(requestOwner, ownerRequests);

    // Update global requests if public
    if (targetRequest.isPublic) {
      const globalIndex = this.globalPrayerRequests.findIndex(req => req.id === prayerRequestId);
      if (globalIndex !== -1) {
        this.globalPrayerRequests[globalIndex] = targetRequest;
      }
    }

    return targetRequest;
  }

  async startIntercessionSession(userId: string, prompts: IntercessionPrompt[], prayerRequests: PrayerRequest[]): Promise<IntercessionSession> {
    const session: IntercessionSession = {
      id: `session_${userId}_${Date.now()}`,
      userId,
      prompts,
      prayerRequests,
      duration: 0,
      startTime: new Date(),
      notes: '',
      spiritualInsights: [],
      propheticWords: []
    };

    const userSessions = this.intercessionSessions.get(userId) || [];
    userSessions.push(session);
    this.intercessionSessions.set(userId, userSessions);

    return session;
  }

  async endIntercessionSession(userId: string, sessionId: string, notes: string, insights: string[], propheticWords: any[]): Promise<IntercessionSession> {
    const userSessions = this.intercessionSessions.get(userId) || [];
    const sessionIndex = userSessions.findIndex(session => session.id === sessionId);
    
    if (sessionIndex === -1) {
      throw new Error('Intercession session not found');
    }

    const session = userSessions[sessionIndex];
    session.endTime = new Date();
    session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60); // minutes
    session.notes = notes;
    session.spiritualInsights = insights;
    session.propheticWords = propheticWords;

    userSessions[sessionIndex] = session;
    this.intercessionSessions.set(userId, userSessions);

    return session;
  }

  async getUserPrayerRequests(userId: string, status?: string): Promise<PrayerRequest[]> {
    const userRequests = this.prayerRequests.get(userId) || [];
    return status ? userRequests.filter(req => req.status === status) : userRequests;
  }

  async getPublicPrayerRequests(category?: string, urgency?: string, limit?: number): Promise<PrayerRequest[]> {
    let requests = this.globalPrayerRequests.filter(req => req.status === 'active');
    
    if (category) {
      requests = requests.filter(req => req.category === category);
    }
    
    if (urgency) {
      requests = requests.filter(req => req.urgency === urgency);
    }
    
    // Sort by urgency and creation date
    requests.sort((a, b) => {
      const urgencyOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const urgencyDiff = urgencyOrder[b.urgency as keyof typeof urgencyOrder] - urgencyOrder[a.urgency as keyof typeof urgencyOrder];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    return limit ? requests.slice(0, limit) : requests;
  }

  async getUserIntercessionSessions(userId: string, limit?: number): Promise<IntercessionSession[]> {
    const userSessions = this.intercessionSessions.get(userId) || [];
    const sortedSessions = userSessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    return limit ? sortedSessions.slice(0, limit) : sortedSessions;
  }

  async generateDailyIntercessionPrompts(userId: string): Promise<IntercessionPrompt[]> {
    const prompts: IntercessionPrompt[] = [
      {
        id: 'morning_dedication',
        title: 'Morning Dedication',
        description: 'Dedicate your day to the Lord and seek His guidance',
        category: 'personal',
        urgency: 'high',
        scriptureReference: 'Psalm 5:3',
        prayerPoints: [
          'Surrender the day to God',
          'Ask for wisdom and guidance',
          'Pray for protection and favor',
          'Seek God\'s will in all decisions'
        ],
        duration: 10,
        frequency: 'daily',
        createdAt: new Date()
      },
      {
        id: 'family_intercession',
        title: 'Family Intercession',
        description: 'Pray for your family members and their needs',
        category: 'family',
        urgency: 'high',
        scriptureReference: '1 Timothy 2:1-2',
        prayerPoints: [
          'Salvation and spiritual growth',
          'Health and protection',
          'Relationships and unity',
          'God\'s provision and blessing'
        ],
        duration: 15,
        frequency: 'daily',
        createdAt: new Date()
      },
      {
        id: 'church_community',
        title: 'Church and Community',
        description: 'Intercede for your local church and community',
        category: 'church',
        urgency: 'medium',
        scriptureReference: 'Ephesians 6:18',
        prayerPoints: [
          'Church leadership and vision',
          'Unity and growth',
          'Community outreach',
          'Local needs and challenges'
        ],
        duration: 10,
        frequency: 'daily',
        createdAt: new Date()
      },
      {
        id: 'global_missions',
        title: 'Global Missions',
        description: 'Pray for missionaries and global evangelism',
        category: 'global',
        urgency: 'medium',
        scriptureReference: 'Matthew 9:37-38',
        prayerPoints: [
          'Missionaries and their families',
          'Unreached people groups',
          'Church planting efforts',
          'Persecution and religious freedom'
        ],
        duration: 10,
        frequency: 'daily',
        createdAt: new Date()
      }
    ];

    return prompts;
  }

  async generateWeeklyIntercessionPrompts(userId: string): Promise<IntercessionPrompt[]> {
    const dailyPrompts = await this.generateDailyIntercessionPrompts(userId);
    
    const weeklyPrompts: IntercessionPrompt[] = [
      {
        id: 'national_leaders',
        title: 'National and Global Leaders',
        description: 'Pray for government leaders and decision makers',
        category: 'nation',
        urgency: 'high',
        scriptureReference: '1 Timothy 2:1-2',
        prayerPoints: [
          'Wisdom for government leaders',
          'Just and righteous decisions',
          'Peace and stability',
          'Protection from corruption'
        ],
        duration: 20,
        frequency: 'weekly',
        createdAt: new Date()
      },
      {
        id: 'education_systems',
        title: 'Education and Youth',
        description: 'Intercede for educational institutions and young people',
        category: 'community',
        urgency: 'medium',
        scriptureReference: 'Proverbs 22:6',
        prayerPoints: [
          'Godly influence in schools',
          'Protection of children',
          'Wisdom for educators',
          'Revival among youth'
        ],
        duration: 15,
        frequency: 'weekly',
        createdAt: new Date()
      },
      {
        id: 'economic_justice',
        title: 'Economic Justice and Provision',
        description: 'Pray for economic systems and those in need',
        category: 'community',
        urgency: 'medium',
        scriptureReference: 'Psalm 82:3-4',
        prayerPoints: [
          'Just economic systems',
          'Provision for the poor',
          'Wisdom for business leaders',
          'End to corruption and greed'
        ],
        duration: 15,
        frequency: 'weekly',
        createdAt: new Date()
      }
    ];

    return [...dailyPrompts, ...weeklyPrompts];
  }

  async getPrayerAnalytics(userId: string, days: number = 30): Promise<{
    totalPrayerRequests: number;
    activePrayerRequests: number;
    answeredPrayerRequests: number;
    totalIntercessionTime: number;
    intercessionSessions: number;
    prayersOffered: number;
    testimoniesShared: number;
  }> {
    const userRequests = this.prayerRequests.get(userId) || [];
    const userSessions = this.intercessionSessions.get(userId) || [];
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const recentRequests = userRequests.filter(req => req.createdAt >= startDate);
    const recentSessions = userSessions.filter(session => session.startTime >= startDate);
    
    const totalPrayerRequests = recentRequests.length;
    const activePrayerRequests = recentRequests.filter(req => req.status === 'active').length;
    const answeredPrayerRequests = recentRequests.filter(req => req.status === 'answered').length;
    const totalIntercessionTime = recentSessions.reduce((sum, session) => sum + session.duration, 0);
    const intercessionSessions = recentSessions.length;
    
    // Count prayers offered for others' requests
    let prayersOffered = 0;
    for (const [, requests] of this.prayerRequests.entries()) {
      for (const request of requests) {
        if (request.createdAt >= startDate && request.userId !== userId) {
          // This is a simplified count - in a real system, you'd track individual prayer actions
          prayersOffered += Math.floor(request.prayerCount / 10); // Estimate user's contribution
        }
      }
    }
    
    const testimoniesShared = userRequests.reduce((sum, req) => sum + req.testimonies.length, 0);
    
    return {
      totalPrayerRequests,
      activePrayerRequests,
      answeredPrayerRequests,
      totalIntercessionTime,
      intercessionSessions,
      prayersOffered,
      testimoniesShared
    };
  }
}

export const intercessionPrayerService = new IntercessionPrayerService();