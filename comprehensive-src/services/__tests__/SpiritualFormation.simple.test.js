const { divineScoreCardService } = require('../DivineScoreCardService');
const { propheticCheckinsService } = require('../PropheticCheckinsService');
const { intercessionPrayerService } = require('../IntercessionPrayerService');
const { spiritualGrowthService } = require('../SpiritualGrowthService');

describe('Spiritual Formation Integration - Simple Tests', () => {
  const testUserId = 'test-user-123';

  test('Divine Scorecard Service - Basic Operations', async () => {
    // Create scorecard
    const scorecard = await divineScoreCardService.createDivineScorecard(testUserId);
    expect(scorecard).toBeDefined();
    expect(scorecard.userId).toBe(testUserId);
    expect(scorecard.overallScore).toBeGreaterThanOrEqual(0);

    // Get scorecard
    const retrievedScorecard = await divineScoreCardService.getDivineScorecard(testUserId);
    expect(retrievedScorecard).toBeDefined();
    expect(retrievedScorecard.id).toBe(scorecard.id);

    // Update calling statement
    const callingStatement = 'To establish kingdom educational institutions';
    const updatedScorecard = await divineScoreCardService.updateCallingStatement(testUserId, callingStatement);
    expect(updatedScorecard.purpose.callingStatement).toBe(callingStatement);
  });

  test('Prophetic Check-ins Service - Basic Operations', async () => {
    // Create check-in
    const checkin = await propheticCheckinsService.createPropheticCheckin(testUserId, 'daily');
    expect(checkin).toBeDefined();
    expect(checkin.userId).toBe(testUserId);
    expect(checkin.type).toBe('daily');

    // Update journal
    const journalData = {
      content: 'Today was a blessed day of prayer and study.',
      mood: 'joyful'
    };
    const updatedCheckin = await propheticCheckinsService.updateJournalEntry(testUserId, checkin.id, journalData);
    expect(updatedCheckin.journalEntry.content).toBe(journalData.content);

    // Get user check-ins
    const userCheckins = await propheticCheckinsService.getUserCheckins(testUserId, 5);
    expect(userCheckins).toHaveLength(1);
  });

  test('Intercession Prayer Service - Basic Operations', async () => {
    // Create prayer request
    const prayerRequest = {
      requesterId: testUserId,
      title: 'Test Prayer Request',
      description: 'Testing prayer request functionality',
      category: 'guidance',
      urgency: 'medium',
      isPublic: true,
      isAnonymous: false,
      status: 'active'
    };

    const createdRequest = await intercessionPrayerService.createPrayerRequest(testUserId, prayerRequest);
    expect(createdRequest).toBeDefined();
    expect(createdRequest.title).toBe(prayerRequest.title);
    expect(createdRequest.prayerCount).toBe(0);

    // Get user requests
    const userRequests = await intercessionPrayerService.getUserPrayerRequests(testUserId);
    expect(userRequests).toHaveLength(1);

    // Generate prompts
    const prompts = await intercessionPrayerService.generateDailyIntercessionPrompts(testUserId);
    expect(prompts.length).toBeGreaterThan(0);
  });

  test('Spiritual Growth Service - Basic Operations', async () => {
    // Generate growth report
    const report = await spiritualGrowthService.generateSpiritualGrowthReport(testUserId, 'monthly');
    expect(report).toBeDefined();
    expect(report.userId).toBe(testUserId);
    expect(report.reportType).toBe('monthly');
    expect(report.metrics).toBeDefined();

    // Get user reports
    const userReports = await spiritualGrowthService.getUserGrowthReports(testUserId, 5);
    expect(userReports).toHaveLength(1);

    // Get growth trends
    const trends = await spiritualGrowthService.getGrowthTrends(testUserId, 6);
    expect(trends).toBeDefined();
    expect(trends.overallGrowth).toBeDefined();
  });

  test('Integration Test - All Services Working Together', async () => {
    // Create scorecard
    const scorecard = await divineScoreCardService.createDivineScorecard(testUserId);
    expect(scorecard).toBeDefined();

    // Create check-in
    const checkin = await propheticCheckinsService.createPropheticCheckin(testUserId, 'daily');
    expect(checkin).toBeDefined();

    // Create prayer request
    const prayerRequest = await intercessionPrayerService.createPrayerRequest(testUserId, {
      requesterId: testUserId,
      title: 'Integration Test',
      description: 'Testing integration',
      category: 'guidance',
      urgency: 'medium',
      isPublic: false,
      isAnonymous: false,
      status: 'active'
    });
    expect(prayerRequest).toBeDefined();

    // Generate growth report
    const report = await spiritualGrowthService.generateSpiritualGrowthReport(testUserId, 'weekly');
    expect(report).toBeDefined();

    // Verify all components exist
    const finalScorecard = await divineScoreCardService.getDivineScorecard(testUserId);
    const finalCheckins = await propheticCheckinsService.getUserCheckins(testUserId);
    const finalRequests = await intercessionPrayerService.getUserPrayerRequests(testUserId);
    const finalReports = await spiritualGrowthService.getUserGrowthReports(testUserId);

    expect(finalScorecard).toBeDefined();
    expect(finalCheckins.length).toBeGreaterThan(0);
    expect(finalRequests.length).toBeGreaterThan(0);
    expect(finalReports.length).toBeGreaterThan(0);
  });
});