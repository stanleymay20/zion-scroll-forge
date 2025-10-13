import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// Mock data stores (in production, these would be database operations)
const divineScoreCards = new Map();
const propheticCheckins = new Map();
const prayerRequests = new Map();
const intercessionSessions = new Map();
const spiritualGrowthReports = new Map();

// Divine Scorecard Routes
router.get('/scorecard/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const scorecard = divineScoreCards.get(userId);
    
    if (!scorecard) {
      return res.status(404).json({ error: 'Divine Scorecard not found' });
    }
    
    res.json(scorecard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Divine Scorecard' });
  }
});

router.post('/scorecard/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const scorecardData = req.body;
    
    const scorecard = {
      id: `scorecard_${userId}_${Date.now()}`,
      userId,
      ...scorecardData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    divineScoreCards.set(userId, scorecard);
    res.status(201).json(scorecard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Divine Scorecard' });
  }
});

router.put('/scorecard/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const existingScorecard = divineScoreCards.get(userId);
    if (!existingScorecard) {
      return res.status(404).json({ error: 'Divine Scorecard not found' });
    }
    
    const updatedScorecard = {
      ...existingScorecard,
      ...updates,
      updatedAt: new Date()
    };
    
    divineScoreCards.set(userId, updatedScorecard);
    res.json(updatedScorecard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update Divine Scorecard' });
  }
});

// Prophetic Check-ins Routes
router.get('/checkins/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const userCheckins = propheticCheckins.get(userId) || [];
    const limitedCheckins = userCheckins.slice(0, parseInt(limit as string));
    
    res.json(limitedCheckins);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prophetic check-ins' });
  }
});

router.post('/checkins/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { type = 'daily' } = req.body;
    
    const checkin = {
      id: `checkin_${userId}_${Date.now()}`,
      userId,
      date: new Date(),
      type,
      journalEntry: {
        id: `journal_${Date.now()}`,
        content: '',
        mood: '',
        spiritualInsights: [],
        challenges: [],
        victories: [],
        gratitude: [],
        prayerRequests: [],
        date: new Date()
      },
      visionBoard: {
        id: `vision_${Date.now()}`,
        title: '',
        description: '',
        images: [],
        scriptures: [],
        goals: [],
        status: 'active'
      },
      intercessionPrompts: [],
      spiritualTemperature: {
        overall: 5,
        prayerLife: 5,
        wordStudy: 5,
        worship: 5,
        fellowship: 5,
        service: 5,
        evangelism: 5,
        discipleship: 5,
        notes: ''
      },
      propheticWords: [],
      actionItems: []
    };
    
    const userCheckins = propheticCheckins.get(userId) || [];
    userCheckins.unshift(checkin);
    propheticCheckins.set(userId, userCheckins);
    
    res.status(201).json(checkin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prophetic check-in' });
  }
});

router.put('/checkins/:userId/:checkinId', async (req: Request, res: Response) => {
  try {
    const { userId, checkinId } = req.params;
    const updates = req.body;
    
    const userCheckins = propheticCheckins.get(userId) || [];
    const checkinIndex = userCheckins.findIndex((c: any) => c.id === checkinId);
    
    if (checkinIndex === -1) {
      return res.status(404).json({ error: 'Prophetic check-in not found' });
    }
    
    userCheckins[checkinIndex] = {
      ...userCheckins[checkinIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    propheticCheckins.set(userId, userCheckins);
    res.json(userCheckins[checkinIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update prophetic check-in' });
  }
});

// Prayer Requests Routes
router.get('/prayer-requests/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    
    const userRequests = prayerRequests.get(userId) || [];
    const filteredRequests = status 
      ? userRequests.filter((req: any) => req.status === status)
      : userRequests;
    
    res.json(filteredRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prayer requests' });
  }
});

router.get('/prayer-requests/public', async (req: Request, res: Response) => {
  try {
    const { category, urgency, limit = 20 } = req.query;
    
    let publicRequests: any[] = [];
    
    // Collect all public requests from all users
    for (const [userId, requests] of prayerRequests.entries()) {
      const userPublicRequests = (requests as any[]).filter(req => req.isPublic && req.status === 'active');
      publicRequests.push(...userPublicRequests);
    }
    
    // Apply filters
    if (category) {
      publicRequests = publicRequests.filter(req => req.category === category);
    }
    
    if (urgency) {
      publicRequests = publicRequests.filter(req => req.urgency === urgency);
    }
    
    // Sort by urgency and creation date
    const urgencyOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    publicRequests.sort((a, b) => {
      const urgencyDiff = (urgencyOrder as any)[b.urgency] - (urgencyOrder as any)[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Apply limit
    const limitedRequests = publicRequests.slice(0, parseInt(limit as string));
    
    res.json(limitedRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public prayer requests' });
  }
});

router.post('/prayer-requests/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requestData = req.body;
    
    const prayerRequest = {
      id: `prayer_${userId}_${Date.now()}`,
      userId,
      ...requestData,
      prayerCount: 0,
      testimonies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const userRequests = prayerRequests.get(userId) || [];
    userRequests.unshift(prayerRequest);
    prayerRequests.set(userId, userRequests);
    
    res.status(201).json(prayerRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prayer request' });
  }
});

router.post('/prayer-requests/:requestId/pray', async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { prayingUserId } = req.body;
    
    // Find the request across all users
    let targetRequest: any = null;
    let requestOwner: string | null = null;
    
    for (const [userId, requests] of prayerRequests.entries()) {
      const request = (requests as any[]).find(req => req.id === requestId);
      if (request) {
        targetRequest = request;
        requestOwner = userId;
        break;
      }
    }
    
    if (!targetRequest || !requestOwner) {
      return res.status(404).json({ error: 'Prayer request not found' });
    }
    
    // Increment prayer count
    targetRequest.prayerCount++;
    targetRequest.updatedAt = new Date();
    
    // Update in storage
    const ownerRequests = prayerRequests.get(requestOwner);
    const requestIndex = ownerRequests.findIndex((req: any) => req.id === requestId);
    ownerRequests[requestIndex] = targetRequest;
    prayerRequests.set(requestOwner, ownerRequests);
    
    res.json(targetRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to pray for request' });
  }
});

router.post('/prayer-requests/:requestId/testimony', async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const testimonyData = req.body;
    
    // Find the request across all users
    let targetRequest: any = null;
    let requestOwner: string | null = null;
    
    for (const [userId, requests] of prayerRequests.entries()) {
      const request = (requests as any[]).find(req => req.id === requestId);
      if (request) {
        targetRequest = request;
        requestOwner = userId;
        break;
      }
    }
    
    if (!targetRequest || !requestOwner) {
      return res.status(404).json({ error: 'Prayer request not found' });
    }
    
    const testimony = {
      id: `testimony_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...testimonyData,
      date: new Date(),
      verified: false
    };
    
    targetRequest.testimonies.push(testimony);
    targetRequest.updatedAt = new Date();
    
    // Update in storage
    const ownerRequests = prayerRequests.get(requestOwner);
    const requestIndex = ownerRequests.findIndex((req: any) => req.id === requestId);
    ownerRequests[requestIndex] = targetRequest;
    prayerRequests.set(requestOwner, ownerRequests);
    
    res.json(targetRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add testimony' });
  }
});

// Intercession Sessions Routes
router.get('/intercession-sessions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const userSessions = intercessionSessions.get(userId) || [];
    const sortedSessions = userSessions.sort((a: any, b: any) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    const limitedSessions = sortedSessions.slice(0, parseInt(limit as string));
    
    res.json(limitedSessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch intercession sessions' });
  }
});

router.post('/intercession-sessions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { prompts, prayerRequests } = req.body;
    
    const session = {
      id: `session_${userId}_${Date.now()}`,
      userId,
      prompts: prompts || [],
      prayerRequests: prayerRequests || [],
      duration: 0,
      startTime: new Date(),
      notes: '',
      spiritualInsights: [],
      propheticWords: []
    };
    
    const userSessions = intercessionSessions.get(userId) || [];
    userSessions.unshift(session);
    intercessionSessions.set(userId, userSessions);
    
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start intercession session' });
  }
});

router.put('/intercession-sessions/:userId/:sessionId/end', async (req: Request, res: Response) => {
  try {
    const { userId, sessionId } = req.params;
    const { notes, insights, propheticWords } = req.body;
    
    const userSessions = intercessionSessions.get(userId) || [];
    const sessionIndex = userSessions.findIndex((s: any) => s.id === sessionId);
    
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Intercession session not found' });
    }
    
    const session = userSessions[sessionIndex];
    session.endTime = new Date();
    session.duration = Math.floor((session.endTime.getTime() - new Date(session.startTime).getTime()) / 1000 / 60);
    session.notes = notes || '';
    session.spiritualInsights = insights || [];
    session.propheticWords = propheticWords || [];
    
    userSessions[sessionIndex] = session;
    intercessionSessions.set(userId, userSessions);
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to end intercession session' });
  }
});

// Spiritual Growth Reports Routes
router.get('/growth-reports/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 5 } = req.query;
    
    const userReports = spiritualGrowthReports.get(userId) || [];
    const sortedReports = userReports.sort((a: any, b: any) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
    const limitedReports = sortedReports.slice(0, parseInt(limit as string));
    
    res.json(limitedReports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch growth reports' });
  }
});

router.post('/growth-reports/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reportType = 'monthly' } = req.body;
    
    // Generate mock report data
    const endDate = new Date();
    const startDate = new Date();
    
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
    
    const report = {
      id: `report_${userId}_${Date.now()}`,
      userId,
      reportType,
      period: { startDate, endDate },
      metrics: {
        overallGrowth: Math.floor(Math.random() * 40) + 60, // 60-100
        prayerConsistency: Math.floor(Math.random() * 30) + 70, // 70-100
        scriptureEngagement: Math.floor(Math.random() * 50) + 50, // 50-100
        serviceParticipation: Math.floor(Math.random() * 40) + 40, // 40-80
        discipleshipActivity: Math.floor(Math.random() * 30) + 50, // 50-80
        characterDevelopment: Math.floor(Math.random() * 20) + 70, // 70-90
        propheticSensitivity: Math.floor(Math.random() * 40) + 40, // 40-80
        kingdomImpact: Math.floor(Math.random() * 30) + 50, // 50-80
        trends: [
          {
            metric: 'Prayer Consistency',
            direction: 'increasing',
            changePercentage: Math.random() * 15,
            timeframe: 'last 30 days'
          },
          {
            metric: 'Scripture Engagement',
            direction: 'stable',
            changePercentage: Math.random() * 5,
            timeframe: 'last 30 days'
          }
        ]
      },
      achievements: [
        {
          id: `achievement_${Date.now()}`,
          title: 'Prayer Warrior',
          description: 'Maintained consistent prayer practice',
          category: 'Prayer',
          date: new Date(),
          impact: 'Strengthened spiritual foundation',
          evidence: ['20+ prayer sessions', '100+ minutes of intercession']
        }
      ],
      challenges: [
        {
          id: `challenge_${Date.now()}`,
          title: 'Scripture Engagement',
          description: 'Need to increase daily Bible study time',
          category: 'Bible Study',
          severity: 'medium',
          recommendations: [
            'Set daily Bible reading reminders',
            'Join a Bible study group',
            'Use Bible study apps'
          ],
          resources: [
            'Bible reading plans',
            'Study guides and commentaries'
          ]
        }
      ],
      recommendations: [
        {
          id: `rec_${Date.now()}`,
          title: 'Establish Daily Bible Reading',
          description: 'Create a consistent daily Bible reading routine',
          category: 'study',
          priority: 'high',
          timeframe: '2-4 weeks',
          resources: ['Bible reading plans', 'Study apps'],
          expectedOutcome: 'Improved scripture engagement and spiritual growth'
        }
      ],
      nextSteps: [
        'Focus on high-priority recommendations',
        'Schedule weekly spiritual growth review',
        'Connect with a spiritual mentor'
      ],
      generatedAt: new Date()
    };
    
    const userReports = spiritualGrowthReports.get(userId) || [];
    userReports.unshift(report);
    spiritualGrowthReports.set(userId, userReports);
    
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate growth report' });
  }
});

// Analytics Routes
router.get('/analytics/:userId/checkins', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const userCheckins = propheticCheckins.get(userId) || [];
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (parseInt(days as string) * 24 * 60 * 60 * 1000));
    
    const recentCheckins = userCheckins.filter((checkin: any) => 
      new Date(checkin.date) >= startDate && new Date(checkin.date) <= endDate
    );
    
    const analytics = {
      totalCheckins: recentCheckins.length,
      averageSpiritualTemperature: recentCheckins.length > 0 
        ? recentCheckins.reduce((sum: number, c: any) => sum + c.spiritualTemperature.overall, 0) / recentCheckins.length 
        : 0,
      completedActionItems: recentCheckins.reduce((sum: number, c: any) => 
        sum + c.actionItems.filter((item: any) => item.completed).length, 0),
      totalActionItems: recentCheckins.reduce((sum: number, c: any) => sum + c.actionItems.length, 0),
      propheticWordsReceived: recentCheckins.reduce((sum: number, c: any) => sum + c.propheticWords.length, 0),
      journalEntries: recentCheckins.filter((c: any) => c.journalEntry.content.length > 0).length,
      trends: {
        spiritualTemperature: recentCheckins.map((c: any) => c.spiritualTemperature.overall),
        checkinFrequency: new Array(parseInt(days as string)).fill(0)
      }
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch checkin analytics' });
  }
});

router.get('/analytics/:userId/prayer', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const userRequests = prayerRequests.get(userId) || [];
    const userSessions = intercessionSessions.get(userId) || [];
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (parseInt(days as string) * 24 * 60 * 60 * 1000));
    
    const recentRequests = userRequests.filter((req: any) => new Date(req.createdAt) >= startDate);
    const recentSessions = userSessions.filter((session: any) => new Date(session.startTime) >= startDate);
    
    const analytics = {
      totalPrayerRequests: recentRequests.length,
      activePrayerRequests: recentRequests.filter((req: any) => req.status === 'active').length,
      answeredPrayerRequests: recentRequests.filter((req: any) => req.status === 'answered').length,
      totalIntercessionTime: recentSessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0),
      intercessionSessions: recentSessions.length,
      prayersOffered: Math.floor(Math.random() * 50), // Mock data
      testimoniesShared: recentRequests.reduce((sum: number, req: any) => sum + req.testimonies.length, 0)
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prayer analytics' });
  }
});

export default router;