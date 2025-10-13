/**
 * ScrollUniversity Research Routes
 * "Let knowledge be generated for kingdom advancement"
 */

import express from 'express';
import { logger } from '../utils/logger';
import { ScrollScholarService } from '../../../src/services/ScrollScholarService';

const router = express.Router();
const scholarService = ScrollScholarService.getInstance();

/**
 * POST /api/research/papers
 * Submit a new research paper
 */
router.post('/papers', async (req, res) => {
  try {
    const {
      studentId,
      title,
      abstract,
      keywords,
      methodology,
      findings,
      conclusions,
      references,
      researchType,
      kingdomAlignment,
      innovationPotential
    } = req.body;

    // Validate required fields
    if (!studentId || !title || !abstract || !methodology) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, title, abstract, methodology',
        scrollMessage: 'The research scroll requires all essential elements to be properly documented.'
      });
    }

    // Create research project
    const project = await scholarService.createResearchProject(studentId, {
      title,
      description: abstract,
      researchType: researchType || 'THEORETICAL',
      collaborators: [studentId],
      funding: {
        amount: 0,
        currency: 'USD',
        source: 'Self-funded',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      methodology,
      findings: findings || '',
      impact: {
        academicImpact: 0,
        kingdomImpact: kingdomAlignment || 0,
        societalImpact: 0,
        innovationScore: innovationPotential || 0,
        citations: 0,
        downloads: 0,
        mediaMentions: 0
      },
      publications: []
    });

    // Publish the research
    const publication = await scholarService.publishResearch(project.id, {
      title,
      authors: [studentId],
      journal: 'ScrollUniversity Research Journal',
      publicationDate: new Date(),
      doi: `10.1000/scroll.${Date.now()}`,
      abstract,
      keywords: keywords || [],
      impactFactor: 1.0,
      kingdomAlignment: kingdomAlignment || 0,
      researchQuality: 75
    });

    logger.info(`Research paper submitted: ${title} by student ${studentId}`);

    res.json({
      success: true,
      project,
      publication,
      message: 'Research paper submitted successfully',
      scrollMessage: 'Your research scroll has been recorded in the kingdom archives.'
    });
  } catch (error) {
    logger.error('Submit research paper error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit research paper',
      scrollMessage: 'The research scroll could not be submitted at this time.'
    });
  }
});

/**
 * GET /api/research/papers
 * Get research papers for a student
 */
router.get('/papers/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const program = await scholarService.getProgram(studentId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Student program not found',
        scrollMessage: 'The scholar\'s scroll could not be found in the archives.'
      });
    }

    res.json({
      success: true,
      publications: program.publications,
      activeResearch: program.activeResearch,
      completedResearch: program.completedResearch,
      message: 'Research papers retrieved successfully',
      scrollMessage: 'The research scrolls have been retrieved from the kingdom archives.'
    });
  } catch (error) {
    logger.error('Get research papers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve research papers',
      scrollMessage: 'The research scrolls could not be retrieved at this time.'
    });
  }
});

/**
 * PUT /api/research/papers/:projectId
 * Update research project status
 */
router.put('/papers/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, findings } = req.body;

    const project = await scholarService.updateResearchStatus(projectId, status, findings);

    res.json({
      success: true,
      project,
      message: 'Research project updated successfully',
      scrollMessage: 'The research scroll has been updated in the kingdom archives.'
    });
  } catch (error) {
    logger.error('Update research project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update research project',
      scrollMessage: 'The research scroll could not be updated at this time.'
    });
  }
});

/**
 * POST /api/research/citations
 * Record a citation for a publication
 */
router.post('/citations', async (req, res) => {
  try {
    const { publicationId, citedBy, context } = req.body;

    if (!publicationId || !citedBy || !context) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: publicationId, citedBy, context',
        scrollMessage: 'The citation requires all essential elements to be properly documented.'
      });
    }

    const citation = await scholarService.recordCitation(publicationId, citedBy, context);

    res.json({
      success: true,
      citation,
      message: 'Citation recorded successfully',
      scrollMessage: 'The citation has been recorded in the kingdom archives.'
    });
  } catch (error) {
    logger.error('Record citation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record citation',
      scrollMessage: 'The citation could not be recorded at this time.'
    });
  }
});

/**
 * GET /api/research/metrics/:studentId
 * Get academic metrics for a student
 */
router.get('/metrics/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const program = await scholarService.getProgram(studentId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Student program not found',
        scrollMessage: 'The scholar\'s scroll could not be found in the archives.'
      });
    }

    res.json({
      success: true,
      academicMetrics: program.academicMetrics,
      kingdomImpact: program.kingdomImpact,
      message: 'Academic metrics retrieved successfully',
      scrollMessage: 'The scholar\'s metrics have been retrieved from the kingdom archives.'
    });
  } catch (error) {
    logger.error('Get academic metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve academic metrics',
      scrollMessage: 'The academic metrics could not be retrieved at this time.'
    });
  }
});

/**
 * GET /api/research/recommendations/:studentId
 * Get research recommendations for a student
 */
router.get('/recommendations/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const recommendations = await scholarService.getResearchRecommendations(studentId);

    res.json({
      success: true,
      recommendations,
      message: 'Research recommendations retrieved successfully',
      scrollMessage: 'The research guidance has been retrieved from the kingdom archives.'
    });
  } catch (error) {
    logger.error('Get research recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve research recommendations',
      scrollMessage: 'The research guidance could not be retrieved at this time.'
    });
  }
});

export default router;