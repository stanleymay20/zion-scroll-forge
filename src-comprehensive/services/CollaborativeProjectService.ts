import {
  CollaborativeProject,
  ProjectTask,
  ProjectMember,
  ProjectResource,
  ProjectType,
  ProjectStatus,
  TaskStatus,
  Priority,
  ProjectRole
} from '../types/community';
import { ScrollCoinService } from './ScrollCoinService';
import { PropheticIntelligenceService } from './PropheticIntelligenceService';

export class CollaborativeProjectService {
  private scrollCoinService: ScrollCoinService;
  private propheticService: PropheticIntelligenceService;

  constructor() {
    this.scrollCoinService = new ScrollCoinService();
    this.propheticService = new PropheticIntelligenceService();
  }

  async createProject(projectData: {
    title: string;
    description: string;
    type: ProjectType;
    createdBy: string;
    deadline?: Date;
    spiritualPurpose?: string;
    kingdomImpact?: string;
  }): Promise<CollaborativeProject> {
    // Validate spiritual alignment if spiritual purpose provided
    let spiritualValidation = null;
    if (projectData.spiritualPurpose) {
      spiritualValidation = await this.propheticService.validateSpiritualContent({
        content: projectData.spiritualPurpose,
        kingdomImpact: projectData.kingdomImpact
      });
    }

    const project: CollaborativeProject = {
      id: this.generateId(),
      title: projectData.title,
      description: projectData.description,
      type: projectData.type,
      createdBy: projectData.createdBy,
      team: [{
        userId: projectData.createdBy,
        role: ProjectRole.LEADER,
        joinedAt: new Date(),
        contributions: [],
        scrollCoinEarned: 0
      }],
      status: ProjectStatus.PLANNING,
      deadline: projectData.deadline,
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: [],
      resources: [],
      spiritualPurpose: projectData.spiritualPurpose,
      kingdomImpact: projectData.kingdomImpact
    };

    await this.storeProject(project);
    
    // Award ScrollCoin for creating project
    let reward = 50;
    if (spiritualValidation?.isAligned) {
      reward += 25; // Bonus for spiritually aligned projects
    }
    
    await this.scrollCoinService.awardCoins(projectData.createdBy, reward, 'Created collaborative project');

    return project;
  }

  async joinProject(projectId: string, userId: string, role: ProjectRole = ProjectRole.MEMBER): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.team.some(member => member.userId === userId)) {
      throw new Error('User already in project team');
    }

    const newMember: ProjectMember = {
      userId,
      role,
      joinedAt: new Date(),
      contributions: [],
      scrollCoinEarned: 0
    };

    await this.addProjectMember(projectId, newMember);
    
    // Award ScrollCoin for joining project
    await this.scrollCoinService.awardCoins(userId, 20, 'Joined collaborative project');
    
    // Notify team members
    await this.notifyTeamMembers(projectId, `${userId} joined the project team`);
  }

  async leaveProject(projectId: string, userId: string): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is project leader
    const member = project.team.find(m => m.userId === userId);
    if (member?.role === ProjectRole.LEADER && project.team.length > 1) {
      throw new Error('Project leader must transfer leadership before leaving');
    }

    await this.removeProjectMember(projectId, userId);
    await this.notifyTeamMembers(projectId, `${userId} left the project team`);
  }

  async createTask(projectId: string, taskData: {
    title: string;
    description: string;
    assignedTo?: string;
    priority: Priority;
    dueDate?: Date;
    dependencies?: string[];
    scrollCoinReward?: number;
  }): Promise<ProjectTask> {
    const task: ProjectTask = {
      id: this.generateId(),
      projectId,
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo,
      status: TaskStatus.TODO,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      dependencies: taskData.dependencies || [],
      scrollCoinReward: taskData.scrollCoinReward || this.calculateTaskReward(taskData.priority)
    };

    await this.storeTask(task);
    
    // Notify assigned user if specified
    if (taskData.assignedTo) {
      await this.notifyTaskAssignment(taskData.assignedTo, task);
    }

    return task;
  }

  async assignTask(taskId: string, userId: string, assignedBy: string): Promise<void> {
    await this.updateTaskAssignment(taskId, userId);
    await this.notifyTaskAssignment(userId, await this.getTaskById(taskId));
    
    // Award ScrollCoin to assigner for task management
    await this.scrollCoinService.awardCoins(assignedBy, 5, 'Assigned project task');
  }

  async updateTaskStatus(taskId: string, status: TaskStatus, userId: string): Promise<void> {
    await this.updateTaskStatusInDatabase(taskId, status);
    
    if (status === TaskStatus.COMPLETED) {
      const task = await this.getTaskById(taskId);
      if (task && task.assignedTo) {
        // Award ScrollCoin for task completion
        const reward = task.scrollCoinReward || this.calculateTaskReward(task.priority);
        await this.scrollCoinService.awardCoins(task.assignedTo, reward, 'Completed project task');
        
        // Update member contributions
        await this.addMemberContribution(task.projectId, task.assignedTo, `Completed task: ${task.title}`);
        
        // Check if project can be moved to next phase
        await this.checkProjectProgress(task.projectId);
      }
    }
  }

  async addProjectResource(projectId: string, resourceData: {
    title: string;
    type: string;
    url?: string;
    content?: string;
    uploadedBy: string;
  }): Promise<ProjectResource> {
    const resource: ProjectResource = {
      id: this.generateId(),
      title: resourceData.title,
      type: resourceData.type as any,
      url: resourceData.url,
      content: resourceData.content,
      uploadedBy: resourceData.uploadedBy,
      uploadedAt: new Date()
    };

    await this.storeProjectResource(projectId, resource);
    
    // Award ScrollCoin for sharing resources
    await this.scrollCoinService.awardCoins(resourceData.uploadedBy, 15, 'Shared project resource');
    
    // Update member contributions
    await this.addMemberContribution(projectId, resourceData.uploadedBy, `Shared resource: ${resource.title}`);

    return resource;
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus, updatedBy: string): Promise<void> {
    await this.updateProjectStatusInDatabase(projectId, status);
    
    if (status === ProjectStatus.COMPLETED) {
      await this.completeProject(projectId);
    }
    
    await this.notifyTeamMembers(projectId, `Project status updated to ${status}`);
  }

  async findProjects(criteria: {
    type?: ProjectType;
    status?: ProjectStatus;
    spiritualFocus?: boolean;
    skillsNeeded?: string[];
    location?: string;
  }): Promise<CollaborativeProject[]> {
    return this.searchProjectsInDatabase(criteria);
  }

  async getProjectsByUser(userId: string): Promise<CollaborativeProject[]> {
    return this.getProjectsFromDatabase({ teamMemberUserId: userId });
  }

  async getProjectTasks(projectId: string, filters?: {
    status?: TaskStatus;
    assignedTo?: string;
    priority?: Priority;
  }): Promise<ProjectTask[]> {
    return this.getTasksFromDatabase({ projectId, ...filters });
  }

  async transferLeadership(projectId: string, currentLeader: string, newLeader: string): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Verify current leader
    const currentLeaderMember = project.team.find(m => m.userId === currentLeader);
    if (!currentLeaderMember || currentLeaderMember.role !== ProjectRole.LEADER) {
      throw new Error('Only current project leader can transfer leadership');
    }

    // Verify new leader is team member
    const newLeaderMember = project.team.find(m => m.userId === newLeader);
    if (!newLeaderMember) {
      throw new Error('New leader must be a team member');
    }

    await this.updateMemberRole(projectId, currentLeader, ProjectRole.MEMBER);
    await this.updateMemberRole(projectId, newLeader, ProjectRole.LEADER);
    
    // Award ScrollCoin for leadership transition
    await this.scrollCoinService.awardCoins(newLeader, 30, 'Became project leader');
    
    await this.notifyTeamMembers(projectId, `Leadership transferred to ${newLeader}`);
  }

  async generateProjectReport(projectId: string): Promise<{
    overview: any;
    taskProgress: any;
    teamContributions: any[];
    resourceUsage: any[];
    spiritualImpact?: any;
    kingdomAlignment?: any;
  }> {
    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const report = await this.calculateProjectAnalytics(projectId);
    
    // Add spiritual analysis if applicable
    if (project.spiritualPurpose) {
      report.spiritualImpact = await this.propheticService.assessSpiritualImpact(project);
    }

    return report;
  }

  async completeProject(projectId: string): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Award completion bonuses to all team members
    for (const member of project.team) {
      let bonus = 100; // Base completion bonus
      
      if (member.role === ProjectRole.LEADER) {
        bonus += 50; // Leadership bonus
      }
      
      // Spiritual project bonus
      if (project.spiritualPurpose) {
        bonus += 75;
      }
      
      await this.scrollCoinService.awardCoins(member.userId, bonus, 'Project completion bonus');
    }

    // Generate completion certificates
    await this.generateProjectCertificates(project);
    
    // Assess kingdom impact if applicable
    if (project.kingdomImpact) {
      await this.assessKingdomImpact(project);
    }

    await this.notifyTeamMembers(projectId, 'Project completed successfully!');
  }

  private calculateTaskReward(priority: Priority): number {
    switch (priority) {
      case Priority.LOW: return 10;
      case Priority.MEDIUM: return 20;
      case Priority.HIGH: return 35;
      case Priority.URGENT: return 50;
      default: return 15;
    }
  }

  private async checkProjectProgress(projectId: string): Promise<void> {
    const tasks = await this.getTasksFromDatabase({ projectId });
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
    
    if (completedTasks.length === tasks.length && tasks.length > 0) {
      // All tasks completed, move to review phase
      await this.updateProjectStatusInDatabase(projectId, ProjectStatus.REVIEW);
    }
  }

  private async generateProjectCertificates(project: CollaborativeProject): Promise<void> {
    // Generate completion certificates for all team members
    console.log('Generating project certificates for:', project.id);
  }

  private async assessKingdomImpact(project: CollaborativeProject): Promise<void> {
    // Assess and record kingdom impact metrics
    console.log('Assessing kingdom impact for:', project.id);
  }

  private generateId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Database operations (simulated)
  private async storeProject(project: CollaborativeProject): Promise<void> {
    console.log('Storing project:', project.id);
  }

  private async getProjectById(projectId: string): Promise<CollaborativeProject | null> {
    return null;
  }

  private async storeTask(task: ProjectTask): Promise<void> {
    console.log('Storing task:', task.id);
  }

  private async getTaskById(taskId: string): Promise<ProjectTask | null> {
    return null;
  }

  private async addProjectMember(projectId: string, member: ProjectMember): Promise<void> {
    console.log('Adding project member:', projectId, member.userId);
  }

  private async removeProjectMember(projectId: string, userId: string): Promise<void> {
    console.log('Removing project member:', projectId, userId);
  }

  private async updateTaskAssignment(taskId: string, userId: string): Promise<void> {
    console.log('Updating task assignment:', taskId, userId);
  }

  private async updateTaskStatusInDatabase(taskId: string, status: TaskStatus): Promise<void> {
    console.log('Updating task status:', taskId, status);
  }

  private async updateProjectStatusInDatabase(projectId: string, status: ProjectStatus): Promise<void> {
    console.log('Updating project status:', projectId, status);
  }

  private async storeProjectResource(projectId: string, resource: ProjectResource): Promise<void> {
    console.log('Storing project resource:', projectId, resource.id);
  }

  private async addMemberContribution(projectId: string, userId: string, contribution: string): Promise<void> {
    console.log('Adding member contribution:', projectId, userId, contribution);
  }

  private async updateMemberRole(projectId: string, userId: string, role: ProjectRole): Promise<void> {
    console.log('Updating member role:', projectId, userId, role);
  }

  private async searchProjectsInDatabase(criteria: any): Promise<CollaborativeProject[]> {
    return [];
  }

  private async getProjectsFromDatabase(filters: any): Promise<CollaborativeProject[]> {
    return [];
  }

  private async getTasksFromDatabase(filters: any): Promise<ProjectTask[]> {
    return [];
  }

  private async calculateProjectAnalytics(projectId: string): Promise<any> {
    return {
      overview: {},
      taskProgress: {},
      teamContributions: [],
      resourceUsage: []
    };
  }

  private async notifyTeamMembers(projectId: string, message: string): Promise<void> {
    console.log('Notifying team members:', projectId, message);
  }

  private async notifyTaskAssignment(userId: string, task: ProjectTask | null): Promise<void> {
    console.log('Notifying task assignment:', userId, task?.id);
  }
}