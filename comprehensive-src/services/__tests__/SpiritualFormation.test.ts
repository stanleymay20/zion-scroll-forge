import { divineScoreCardService } from '../DivineScoreCardService';
import { propheticCheckinsService } from '../PropheticCheckinsService';
import { intercessionPrayerService } from '../IntercessionPrayerService';
import { spiritualGrowthService } from '../SpiritualGrowthService';

describe('Spiritual Formation Integration', () => {
  const testUserId = 'test-user-123';

  describe('Divine Scorecard Service', () => {
    test('should create a new divine scorecard', async () => {
      const scorecard = await divineScoreCardService.createDivineScorecard(testUserId);
      
      expect(scorecard).toBeDefined();
      expect(scorecard.userId).toBe(testUserId);
      expect(scorecard.overallScore).toBeGreaterThanOrEqual(0);
      expect(scorecard.purpose).toBeDefined();
      expect(scorecard.skills).toBeDefined();
      expect(scorecard.alignment).toBeDefined();
    });

    test('should add and complete purpose milestones', async () => {
      const scorecard = await divineScoreCardService.createDivineScorecard(testUserId);
      
      const milestone = {
        title: 'Complete Prophetic Law Course',
        description: 'Finish the foundational course on prophetic law',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        completed: false,
        impact: ''
      };

      const updatedScorecard = await divineScoreCardService.addPurposeMilestone(testUserId, milestone);
      expect(updatedScorecard.purpose.milestones).toHaveLength(1);
      expect(updatedScorecard.purpose.milestones[0].title).toBe(milestone.title);

      // Complete the milestone
      const milestoneId = updatedScorecard.purpose.milestones[0].id;
      const completedScorecard = await divineScoreCardService.completePurposeMilestone(
        testUserId, 
        milestoneId, 
        'Gained deep understanding of prophetic principles'
      );

      expect(completedScorecard.purpose.milestones[0].completed).toBe(true);
      expect(completedScorecard.purpose.milestones[0].impact).toBe('Gained deep understanding of prophetic principles');
    });

    test('should add divine assignments and track progress', async () => {
      const scorecard = await divineScoreCardService.createDivineScorecard(testUserId);
      
      const assignment = {
        title: 'Establish Prayer Ministry',
        description: 'Start a prayer ministry in local community',
        source: 'prophecy',
        status: 'received',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        progress: 0
      };

      const updatedScorecard = await divineScoreCardService.addDivineAssignment(testUserId, assignment);
      expect(updatedScorecard.purpose.divineAssignments).toHaveLength(1);

      // Update progress
      const assignmentId = updatedScorecard.purpose.divineAssignments[0].id;
      const progressScorecard = await divineScoreCardService.updateDivineAssignmentProgress(
        testUserId, 
        assignmentId, 
        75
      );

      expect(progressScorecard.purpose.divineAssignments[0].progress).toBe(75);
    });

    test('should update calling statement and recalculate clarity', async () => {
      const scorecard = await divineScoreCardService.createDivineScorecard(testUserId);
      
      const callingStatement = 'To establish kingdom educational institutions that transform nations through prophetic wisdom and divine intelligence, raising up a generation of scroll sons who carry covenant authority.';
      
      const updatedScorecard = await divineScoreCardService.updateCallingStatement(testUserId, callingStatement);
      
      expect(updatedScorecard.purpose.callingStatement).toBe(callingStatement);
      expect(updatedScorecard.purpose.clarity).toBeGreaterThan(0);
    });
  });

  describe('Prophetic Check-ins Service', () => {
    test('should create daily prophetic check-in', async () => {
      const checkin = await propheticCheckinsService.createPropheticCheckin(testUserId, 'daily');
      
      expect(checkin).toBeDefined();
      expect(checkin.userId).toBe(testUserId);
      expect(checkin.type).toBe('daily');
      expect(checkin.journalEntry).toBeDefined();
      expect(checkin.spiritualTemperature).toBeDefined();
      expect(checkin.actionItems).toEqual([]);
      expect(checkin.propheticWords).toEqual([]);
    });

    test('should update journal entry', async () => {
      const checkin = await propheticCheckinsService.createPropheticCheckin(testUserId, 'daily');
      
      const journalData = {
        content: 'Today I experienced a breakthrough in prayer. The Lord showed me His heart for the nations.',
        mood: 'joyful',
        spiritualInsights: ['God desires to use education to transform nations', 'Prayer is the foundation of all ministry'],
        victories: ['Completed 2-hour prayer session', 'Received prophetic word about ScrollUniversity'],
        gratitude: ['God\'s faithfulness', 'Spiritual mentors', 'Divine assignments']
      };

      const updatedCheckin = await propheticCheckinsService.updateJournalEntry(
        testUserId, 
        checkin.id, 
        journalData
      );

      expect(updatedCheckin.journalEntry.content).toBe(journalData.content);
      expect(updatedCheckin.journalEntry.mood).toBe(journalData.mood);
      expect(updatedCheckin.journalEntry.spiritualInsights).toEqual(journalData.spiritualInsights);
    });

    test('should update spiritual temperature', async () => {
      const checkin = await propheticCheckinsService.createPropheticCheckin(testUserId, 'daily');
      
      const temperature = {
        prayerLife: 9,
        wordStudy: 8,
        worship: 9,
        fellowship: 7,
        service: 8,
        evangelism: 6,
        discipleship: 7,
        notes: 'Strong in prayer and worship, need to focus more on evangelism'
      };

      const updatedCheckin = await propheticCheckinsService.updateSpiritualTemperature(
        testUserId, 
        checkin.id, 
        temperature
      );

      expect(updatedCheckin.spiritualTemperature.prayerLife).toBe(9);
      expect(updatedCheckin.spiritualTemperature.overall).toBeCloseTo(7.7, 1);
      expect(updatedCheckin.spiritualTemperature.notes).toBe(temperature.notes);
    });

    test('should add prophetic words and action items', async () => {
      const checkin = await propheticCheckinsService.createPropheticCheckin(testUserId, 'daily');
      
      // Add prophetic word
      const propheticWord = {
        source: 'Morning Prayer',
        content: 'I am raising up educational reformers who will establish My kingdom through divine wisdom',
        date: new Date(),
        category: 'calling',
        status: 'received'
      };

      const checkinWithWord = await propheticCheckinsService.addPropheticWord(
        testUserId, 
        checkin.id, 
        propheticWord
      );

      expect(checkinWithWord.propheticWords).toHaveLength(1);
      expect(checkinWithWord.propheticWords[0].content).toBe(propheticWord.content);

      // Add action item
      const actionItem = {
        title: 'Research educational reform models',
        description: 'Study successful educational transformation initiatives',
        category: 'academic',
        priority: 'high',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        completed: false
      };

      const checkinWithAction = await propheticCheckinsService.addActionItem(
        testUserId, 
        checkin.id, 
        actionItem
      );

      expect(checkinWithAction.actionItems).toHaveLength(1);
      expect(checkinWithAction.actionItems[0].title).toBe(actionItem.title);
    });

    test('should create and manage vision boards', async () => {
      const visionBoard = await propheticCheckinsService.createVisionBoard(
        testUserId,
        'ScrollUniversity Global Impact',
        'Vision for ScrollUniversity to transform education in 200+ nations'
      );

      expect(visionBoard).toBeDefined();
      expect(visionBoard.title).toBe('ScrollUniversity Global Impact');
      expect(visionBoard.status).toBe('active');

      // Add vision scripture
      const scripture = {
        reference: 'Isaiah 54:2-3',
        text: 'Enlarge the place of your tent, stretch your tent curtains wide, do not hold back; lengthen your cords, strengthen your stakes. For you will spread out to the right and to the left; your descendants will dispossess nations and settle in their desolate cities.',
        application: 'ScrollUniversity will expand globally and transform educational systems'
      };

      const updatedBoard = await propheticCheckinsService.addVisionScripture(
        testUserId, 
        visionBoard.id, 
        scripture
      );

      expect(updatedBoard.scriptures).toHaveLength(1);
      expect(updatedBoard.scriptures[0].reference).toBe(scripture.reference);
    });
  });

  describe('Intercession Prayer Service', () => {
    test('should create and manage prayer requests', async () => {
      const prayerRequest = {
        requesterId: testUserId,
        title: 'Breakthrough in ScrollUniversity Development',
        description: 'Pray for divine wisdom and resources to complete the platform',
        category: 'breakthrough',
        urgency: 'high',
        isPublic: true,
        isAnonymous: false,
        status: 'active'
      };

      const createdRequest = await intercessionPrayerService.createPrayerRequest(testUserId, prayerRequest);
      
      expect(createdRequest).toBeDefined();
      expect(createdRequest.title).toBe(prayerRequest.title);
      expect(createdRequest.prayerCount).toBe(0);
      expect(createdRequest.testimonies).toEqual([]);

      // Pray for the request
      const prayedRequest = await intercessionPrayerService.prayForRequest(createdRequest.id, 'another-user-id');
      expect(prayedRequest.prayerCount).toBe(1);

      // Add testimony
      const testimony = {
        prayerRequestId: createdRequest.id,
        userId: testUserId,
        testimony: 'God provided a breakthrough in funding and team expansion!',
        category: 'full_answer',
        date: new Date(),
        verified: false
      };

      const requestWithTestimony = await intercessionPrayerService.addPrayerTestimony(createdRequest.id, testimony);
      expect(requestWithTestimony.testimonies).toHaveLength(1);
      expect(requestWithTestimony.testimonies[0].testimony).toBe(testimony.testimony);
    });

    test('should manage intercession sessions', async () => {
      const prompts = await intercessionPrayerService.generateDailyIntercessionPrompts(testUserId);
      expect(prompts.length).toBeGreaterThan(0);

      const publicRequests = await intercessionPrayerService.getPublicPrayerRequests(undefined, undefined, 5);
      
      const session = await intercessionPrayerService.startIntercessionSession(
        testUserId, 
        prompts.slice(0, 2), 
        publicRequests.slice(0, 3)
      );

      expect(session).toBeDefined();
      expect(session.prompts).toHaveLength(2);
      expect(session.startTime).toBeDefined();

      // End session
      const completedSession = await intercessionPrayerService.endIntercessionSession(
        testUserId,
        session.id,
        'Powerful time of intercession. Felt God\'s heart for the nations.',
        ['God desires to use education for kingdom transformation', 'Prayer is the key to breakthrough'],
        []
      );

      expect(completedSession.endTime).toBeDefined();
      expect(completedSession.duration).toBeGreaterThan(0);
      expect(completedSession.spiritualInsights).toHaveLength(2);
    });

    test('should generate prayer analytics', async () => {
      // Create some test data
      await intercessionPrayerService.createPrayerRequest(testUserId, {
        requesterId: testUserId,
        title: 'Test Request 1',
        description: 'Test description',
        category: 'guidance',
        urgency: 'medium',
        isPublic: false,
        isAnonymous: false,
        status: 'active'
      });

      const analytics = await intercessionPrayerService.getPrayerAnalytics(testUserId, 30);
      
      expect(analytics).toBeDefined();
      expect(analytics.totalPrayerRequests).toBeGreaterThanOrEqual(1);
      expect(analytics.activePrayerRequests).toBeGreaterThanOrEqual(0);
      expect(analytics.totalIntercessionTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Spiritual Growth Service', () => {
    test('should generate comprehensive spiritual growth report', async () => {
      // Set up some test data first
      await divineScoreCardService.createDivineScorecard(testUserId);
      await propheticCheckinsService.createPropheticCheckin(testUserId, 'daily');
      
      const report = await spiritualGrowthService.generateSpiritualGrowthReport(testUserId, 'monthly');
      
      expect(report).toBeDefined();
      expect(report.userId).toBe(testUserId);
      expect(report.reportType).toBe('monthly');
      expect(report.metrics).toBeDefined();
      expect(report.achievements).toBeDefined();
      expect(report.challenges).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.nextSteps).toBeDefined();
      
      // Verify metrics structure
      expect(report.metrics.overallGrowth).toBeGreaterThanOrEqual(0);
      expect(report.metrics.prayerConsistency).toBeGreaterThanOrEqual(0);
      expect(report.metrics.scriptureEngagement).toBeGreaterThanOrEqual(0);
      expect(report.metrics.trends).toBeDefined();
    });

    test('should track growth trends over time', async () => {
      // Generate multiple reports to create trend data
      await spiritualGrowthService.generateSpiritualGrowthReport(testUserId, 'monthly');
      await spiritualGrowthService.generateSpiritualGrowthReport(testUserId, 'monthly');
      
      const trends = await spiritualGrowthService.getGrowthTrends(testUserId, 6);
      
      expect(trends).toBeDefined();
      expect(trends.overallGrowth).toBeDefined();
      expect(trends.prayerConsistency).toBeDefined();
      expect(trends.scriptureEngagement).toBeDefined();
      expect(trends.characterDevelopment).toBeDefined();
    });

    test('should manage spiritual formation records', async () => {
      const formationData = {
        currentLevel: {
          level: 3,
          name: 'Growing Disciple',
          description: 'Developing spiritual disciplines and kingdom understanding',
          requirements: ['Daily prayer', 'Regular scripture study', 'Active service'],
          nextLevelRequirements: ['Consistent intercession', 'Prophetic development', 'Leadership roles']
        },
        growthAreas: [],
        propheticGifts: [],
        callingClarity: {
          clarity: 75,
          alignment: 80,
          confidence: 70,
          lastAssessment: new Date(),
          callingStatement: 'To establish kingdom educational systems',
          callingAreas: ['Education', 'Technology', 'Spiritual Formation']
        },
        characterDevelopment: {
          integrity: 85,
          humility: 80,
          faithfulness: 90,
          love: 85,
          wisdom: 75,
          courage: 80,
          perseverance: 85,
          lastAssessment: new Date()
        },
        kingdomImpact: {
          livesImpacted: 50,
          kingdomProjects: [],
          discipleshipChain: 5,
          globalReach: ['USA', 'Ghana', 'Nigeria'],
          testimonies: []
        }
      };

      const formation = await spiritualGrowthService.updateSpiritualFormation(testUserId, formationData);
      
      expect(formation).toBeDefined();
      expect(formation.userId).toBe(testUserId);
      expect(formation.currentLevel.level).toBe(3);
      expect(formation.callingClarity.clarity).toBe(75);
      expect(formation.characterDevelopment.integrity).toBe(85);
    });
  });

  describe('Integration Tests', () => {
    test('should integrate all spiritual formation components', async () => {
      // Create divine scorecard
      const scorecard = await divineScoreCardService.createDivineScorecard(testUserId);
      expect(scorecard).toBeDefined();

      // Create prophetic check-in
      const checkin = await propheticCheckinsService.createPropheticCheckin(testUserId, 'daily');
      expect(checkin).toBeDefined();

      // Update spiritual temperature
      await propheticCheckinsService.updateSpiritualTemperature(testUserId, checkin.id, {
        prayerLife: 8,
        wordStudy: 7,
        worship: 9
      });

      // Create prayer request
      await intercessionPrayerService.createPrayerRequest(testUserId, {
        requesterId: testUserId,
        title: 'Integration Test Request',
        description: 'Testing integration',
        category: 'guidance',
        urgency: 'medium',
        isPublic: false,
        isAnonymous: false,
        status: 'active'
      });

      // Generate growth report
      const report = await spiritualGrowthService.generateSpiritualGrowthReport(testUserId, 'weekly');
      expect(report).toBeDefined();
      expect(report.metrics.overallGrowth).toBeGreaterThan(0);

      // Verify all components are working together
      const userReports = await spiritualGrowthService.getUserGrowthReports(testUserId, 5);
      expect(userReports).toHaveLength(1);

      const userCheckins = await propheticCheckinsService.getUserCheckins(testUserId, 5);
      expect(userCheckins).toHaveLength(1);

      const userScorecard = await divineScoreCardService.getDivineScorecard(testUserId);
      expect(userScorecard).toBeDefined();
    });
  });
});