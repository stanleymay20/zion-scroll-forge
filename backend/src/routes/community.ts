import express from 'express';
import { CommunityCollaborationService } from '../../../src/services/CommunityCollaborationService';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const communityService = new CommunityCollaborationService();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Community Dashboard
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const dashboard = await communityService.getCommunityDashboard(userId);
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching community dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch community dashboard' });
  }
});

// Forums
router.get('/forums', async (req, res) => {
  try {
    const forumService = await communityService.getForumService();
    const { category, spiritualFocus } = req.query;
    
    let forums;
    if (category) {
      forums = await forumService.getForumsByCategory(category as any);
    } else {
      forums = await forumService.getPopularForums();
    }
    
    res.json(forums);
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ error: 'Failed to fetch forums' });
  }
});

router.post('/forums', async (req, res) => {
  try {
    const forumService = await communityService.getForumService();
    const forum = await forumService.createForum(req.body);
    res.status(201).json(forum);
  } catch (error) {
    console.error('Error creating forum:', error);
    res.status(500).json({ error: 'Failed to create forum' });
  }
});

router.post('/forums/:forumId/join', async (req, res) => {
  try {
    const forumService = await communityService.getForumService();
    const { forumId } = req.params;
    const { userId } = req.body;
    
    await forumService.joinForum(forumId, userId);
    res.json({ message: 'Successfully joined forum' });
  } catch (error) {
    console.error('Error joining forum:', error);
    res.status(500).json({ error: 'Failed to join forum' });
  }
});

router.post('/forums/:forumId/posts', async (req, res) => {
  try {
    const forumService = await communityService.getForumService();
    const { forumId } = req.params;
    const postData = { ...req.body, forumId };
    
    const post = await forumService.createPost(postData);
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.post('/posts/:postId/replies', async (req, res) => {
  try {
    const forumService = await communityService.getForumService();
    const { postId } = req.params;
    const replyData = { ...req.body, postId };
    
    const reply = await forumService.createReply(replyData);
    res.status(201).json(reply);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// Mentoring
router.get('/mentoring/:userId', async (req, res) => {
  try {
    const mentoringService = await communityService.getMentoringService();
    const { userId } = req.params;
    const { role } = req.query;
    
    const mentorships = await mentoringService.getMentorshipsByUser(userId, role as 'mentor' | 'mentee');
    res.json(mentorships);
  } catch (error) {
    console.error('Error fetching mentorships:', error);
    res.status(500).json({ error: 'Failed to fetch mentorships' });
  }
});

router.post('/mentoring/request', async (req, res) => {
  try {
    const mentoringService = await communityService.getMentoringService();
    const mentorship = await mentoringService.createMentorshipRequest(req.body);
    res.status(201).json(mentorship);
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    res.status(500).json({ error: 'Failed to create mentorship request' });
  }
});

router.post('/mentoring/:mentorshipId/accept', async (req, res) => {
  try {
    const mentoringService = await communityService.getMentoringService();
    const { mentorshipId } = req.params;
    const { mentorId } = req.body;
    
    await mentoringService.acceptMentorshipRequest(mentorshipId, mentorId);
    res.json({ message: 'Mentorship request accepted' });
  } catch (error) {
    console.error('Error accepting mentorship:', error);
    res.status(500).json({ error: 'Failed to accept mentorship request' });
  }
});

router.post('/mentoring/:mentorshipId/sessions', async (req, res) => {
  try {
    const mentoringService = await communityService.getMentoringService();
    const { mentorshipId } = req.params;
    const sessionData = { ...req.body, mentorshipId };
    
    const session = await mentoringService.scheduleSession(sessionData);
    res.status(201).json(session);
  } catch (error) {
    console.error('Error scheduling session:', error);
    res.status(500).json({ error: 'Failed to schedule session' });
  }
});

router.post('/mentoring/sessions/:sessionId/complete', async (req, res) => {
  try {
    const mentoringService = await communityService.getMentoringService();
    const { sessionId } = req.params;
    const { notes, feedback } = req.body;
    
    await mentoringService.completeSession(sessionId, notes, feedback);
    res.json({ message: 'Session completed successfully' });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

// Study Groups
router.get('/study-groups', async (req, res) => {
  try {
    const studyGroupService = await communityService.getStudyGroupService();
    const { subject, courseId, hasSpace } = req.query;
    
    const criteria: any = {};
    if (subject) criteria.subject = subject;
    if (courseId) criteria.courseId = courseId;
    if (hasSpace === 'true') criteria.hasSpace = true;
    
    const studyGroups = await studyGroupService.findStudyGroups(criteria);
    res.json(studyGroups);
  } catch (error) {
    console.error('Error fetching study groups:', error);
    res.status(500).json({ error: 'Failed to fetch study groups' });
  }
});

router.post('/study-groups', async (req, res) => {
  try {
    const studyGroupService = await communityService.getStudyGroupService();
    const studyGroup = await studyGroupService.createStudyGroup(req.body);
    res.status(201).json(studyGroup);
  } catch (error) {
    console.error('Error creating study group:', error);
    res.status(500).json({ error: 'Failed to create study group' });
  }
});

router.post('/study-groups/:groupId/join', async (req, res) => {
  try {
    const studyGroupService = await communityService.getStudyGroupService();
    const { groupId } = req.params;
    const { userId } = req.body;
    
    await studyGroupService.joinStudyGroup(groupId, userId);
    res.json({ message: 'Successfully joined study group' });
  } catch (error) {
    console.error('Error joining study group:', error);
    res.status(500).json({ error: 'Failed to join study group' });
  }
});

router.post('/study-groups/:groupId/resources', async (req, res) => {
  try {
    const studyGroupService = await communityService.getStudyGroupService();
    const { groupId } = req.params;
    
    const resource = await studyGroupService.addStudyResource(groupId, req.body);
    res.status(201).json(resource);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ error: 'Failed to add study resource' });
  }
});

router.post('/study-groups/:groupId/sessions', async (req, res) => {
  try {
    const studyGroupService = await communityService.getStudyGroupService();
    const { groupId } = req.params;
    
    await studyGroupService.recordStudySession(groupId, req.body);
    res.json({ message: 'Study session recorded successfully' });
  } catch (error) {
    console.error('Error recording session:', error);
    res.status(500).json({ error: 'Failed to record study session' });
  }
});

// Projects
router.get('/projects', async (req, res) => {
  try {
    const projectService = await communityService.getProjectService();
    const { type, status, spiritualFocus } = req.query;
    
    const criteria: any = {};
    if (type) criteria.type = type;
    if (status) criteria.status = status;
    if (spiritualFocus === 'true') criteria.spiritualFocus = true;
    
    const projects = await projectService.findProjects(criteria);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const projectService = await communityService.getProjectService();
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.post('/projects/:projectId/join', async (req, res) => {
  try {
    const projectService = await communityService.getProjectService();
    const { projectId } = req.params;
    const { userId, role } = req.body;
    
    await projectService.joinProject(projectId, userId, role);
    res.json({ message: 'Successfully joined project' });
  } catch (error) {
    console.error('Error joining project:', error);
    res.status(500).json({ error: 'Failed to join project' });
  }
});

router.post('/projects/:projectId/tasks', async (req, res) => {
  try {
    const projectService = await communityService.getProjectService();
    const { projectId } = req.params;
    
    const task = await projectService.createTask(projectId, req.body);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/projects/tasks/:taskId/status', async (req, res) => {
  try {
    const projectService = await communityService.getProjectService();
    const { taskId } = req.params;
    const { status, userId } = req.body;
    
    await projectService.updateTaskStatus(taskId, status, userId);
    res.json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// Networking
router.get('/networking/:userId', async (req, res) => {
  try {
    const networkingService = await communityService.getNetworkingService();
    const { userId } = req.params;
    const { connectionType, status } = req.query;
    
    const filters: any = {};
    if (connectionType) filters.connectionType = connectionType;
    if (status) filters.status = status;
    
    const connections = await networkingService.getConnectionsByUser(userId, filters);
    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

router.post('/networking/connect', async (req, res) => {
  try {
    const networkingService = await communityService.getNetworkingService();
    const { fromUserId, toUserId, connectionType, message } = req.body;
    
    const connection = await networkingService.sendConnectionRequest(fromUserId, toUserId, connectionType, message);
    res.status(201).json(connection);
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ error: 'Failed to send connection request' });
  }
});

router.post('/networking/connections/:connectionId/accept', async (req, res) => {
  try {
    const networkingService = await communityService.getNetworkingService();
    const { connectionId } = req.params;
    const { userId } = req.body;
    
    await networkingService.acceptConnectionRequest(connectionId, userId);
    res.json({ message: 'Connection request accepted' });
  } catch (error) {
    console.error('Error accepting connection:', error);
    res.status(500).json({ error: 'Failed to accept connection request' });
  }
});

router.get('/networking/:userId/opportunities', async (req, res) => {
  try {
    const networkingService = await communityService.getNetworkingService();
    const { userId } = req.params;
    const { careerTrack, skills, interests } = req.query;
    
    const criteria: any = {};
    if (careerTrack) criteria.careerTrack = careerTrack;
    if (skills) criteria.skills = (skills as string).split(',');
    if (interests) criteria.interests = (interests as string).split(',');
    
    const opportunities = await networkingService.findNetworkingOpportunities(userId, criteria);
    res.json(opportunities);
  } catch (error) {
    console.error('Error finding networking opportunities:', error);
    res.status(500).json({ error: 'Failed to find networking opportunities' });
  }
});

// Search
router.get('/search', async (req, res) => {
  try {
    const { query, contentType, spiritualFocus, careerTrack } = req.query;
    
    const filters: any = {};
    if (contentType) filters.contentType = contentType;
    if (spiritualFocus === 'true') filters.spiritualFocus = true;
    if (careerTrack) filters.careerTrack = careerTrack;
    
    const results = await communityService.searchCommunityContent(query as string, filters);
    res.json(results);
  } catch (error) {
    console.error('Error searching community content:', error);
    res.status(500).json({ error: 'Failed to search community content' });
  }
});

// Peer Assistance Rewards (Requirement 9.2)
router.post('/peer-assistance', async (req, res) => {
  try {
    await communityService.implementPeerAssistanceRewards(req.body);
    res.json({ message: 'Peer assistance recorded and rewards distributed' });
  } catch (error) {
    console.error('Error recording peer assistance:', error);
    res.status(500).json({ error: 'Failed to record peer assistance' });
  }
});

// Faculty Interaction Quality (Requirement 5.4)
router.post('/faculty-interaction-quality', async (req, res) => {
  try {
    const qualityAssessment = await communityService.ensureFacultyInteractionQuality(req.body);
    res.json(qualityAssessment);
  } catch (error) {
    console.error('Error assessing faculty interaction quality:', error);
    res.status(500).json({ error: 'Failed to assess faculty interaction quality' });
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await communityService.getCommunityAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching community analytics:', error);
    res.status(500).json({ error: 'Failed to fetch community analytics' });
  }
});

// Spiritual Community Events
router.post('/spiritual-events', async (req, res) => {
  try {
    const eventId = await communityService.createSpiritualCommunityEvent(req.body);
    res.status(201).json({ eventId, message: 'Spiritual community event created successfully' });
  } catch (error) {
    console.error('Error creating spiritual event:', error);
    res.status(500).json({ error: 'Failed to create spiritual community event' });
  }
});

export default router;