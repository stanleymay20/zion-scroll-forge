import {
  CareerTrack,
  CareerPathwayProfile,
  CallingAssessment,
  TrackProgressMetrics,
  TrackCompetency,
  CareerProject,
  MentorshipConnection,
  TrackCertification,
  SpiritualGift,
  SkillAssessment,
  CompetencyCategory,
  ProjectType,
  ProjectStatus,
  MentorshipFocus,
  CertificationLevel
} from '../types/career-pathways';

export class CareerPathwayService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Career Track Selection and Guidance
  async assessDivineCallingForTrack(studentId: string, assessmentData: any): Promise<CallingAssessment> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/career-pathways/calling-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, assessmentData })
      });

      if (!response.ok) {
        throw new Error('Failed to assess divine calling');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assessing divine calling:', error);
      throw error;
    }
  }

  async recommendCareerTrack(studentId: string): Promise<{
    primaryRecommendation: CareerTrack;
    secondaryOptions: CareerTrack[];
    reasoning: string;
    confidenceScore: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/career-pathways/recommend/${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get career track recommendation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting career track recommendation:', error);
      throw error;
    }
  }

  async selectCareerTrack(studentId: string, track: CareerTrack): Promise<CareerPathwayProfile> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/career-pathways/select-track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, track })
      });

      if (!response.ok) {
        throw new Error('Failed to select career track');
      }

      return await response.json();
    } catch (error) {
      console.error('Error selecting career track:', error);
      throw error;
    }
  }

  async getCareerPathwayProfile(studentId: string): Promise<CareerPathwayProfile | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/career-pathways/profile/${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to get career pathway profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting career pathway profile:', error);
      throw error;
    }
  }

  // Track-specific implementations
  async initializeScrollFounderTrack(studentId: string): Promise<void> {
    const competencies = this.getScrollFounderCompetencies();
    const projects = this.getScrollFounderStarterProjects();
    
    await this.initializeTrackCompetencies(studentId, CareerTrack.SCROLL_FOUNDER, competencies);
    await this.createInitialProjects(studentId, projects);
  }

  async initializeScrollAmbassadorTrack(studentId: string): Promise<void> {
    const competencies = this.getScrollAmbassadorCompetencies();
    const projects = this.getScrollAmbassadorStarterProjects();
    
    await this.initializeTrackCompetencies(studentId, CareerTrack.SCROLL_AMBASSADOR, competencies);
    await this.createInitialProjects(studentId, projects);
  }

  async initializeScrollPriestScribeTrack(studentId: string): Promise<void> {
    const competencies = this.getScrollPriestScribeCompetencies();
    const projects = this.getScrollPriestScribeStarterProjects();
    
    await this.initializeTrackCompetencies(studentId, CareerTrack.SCROLL_PRIEST_SCRIBE, competencies);
    await this.createInitialProjects(studentId, projects);
  }

  async initializeScrollEngineerTrack(studentId: string): Promise<void> {
    const competencies = this.getScrollEngineerCompetencies();
    const projects = this.getScrollEngineerStarterProjects();
    
    await this.initializeTrackCompetencies(studentId, CareerTrack.SCROLL_ENGINEER, competencies);
    await this.createInitialProjects(studentId, projects);
  }

  async initializeScrollScholarTrack(studentId: string): Promise<void> {
    const competencies = this.getScrollScholarCompetencies();
    const projects = this.getScrollScholarStarterProjects();
    
    await this.initializeTrackCompetencies(studentId, CareerTrack.SCROLL_SCHOLAR, competencies);
    await this.createInitialProjects(studentId, projects);
  }

  async initializeScrollBuilderTrack(studentId: string): Promise<void> {
    const competencies = this.getScrollBuilderCompetencies();
    const projects = this.getScrollBuilderStarterProjects();
    
    await this.initializeTrackCompetencies(studentId, CareerTrack.SCROLL_BUILDER, competencies);
    await this.createInitialProjects(studentId, projects);
  }

  // Progress tracking and metrics
  async updateProgressMetrics(studentId: string): Promise<TrackProgressMetrics> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/career-pathways/progress/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update progress metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating progress metrics:', error);
      throw error;
    }
  }

  async getTrackCompetencies(track: CareerTrack): Promise<TrackCompetency[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/career-pathways/competencies/${track}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get track competencies');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting track competencies:', error);
      throw error;
    }
  }

  // Project management
  async createCareerProject(studentId: string, projectData: Partial<CareerProject>): Promise<CareerProject> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/career-pathways/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, ...projectData })
      });

      if (!response.ok) {
        throw new Error('Failed to create career project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating career project:', error);
      throw error;
    }
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<CareerProject> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/career-pathways/projects/${projectId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update project status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  }

  // Mentorship connections
  async requestMentorship(studentId: string, track: CareerTrack, focus: MentorshipFocus[]): Promise<MentorshipConnection> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/career-pathways/mentorship/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, track, focus })
      });

      if (!response.ok) {
        throw new Error('Failed to request mentorship');
      }

      return await response.json();
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      throw error;
    }
  }

  // Private helper methods
  private async initializeTrackCompetencies(studentId: string, track: CareerTrack, competencies: Partial<TrackCompetency>[]): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/career-pathways/competencies/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, track, competencies })
      });
    } catch (error) {
      console.error('Error initializing track competencies:', error);
      throw error;
    }
  }

  private async createInitialProjects(studentId: string, projects: Partial<CareerProject>[]): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/career-pathways/projects/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, projects })
      });
    } catch (error) {
      console.error('Error creating initial projects:', error);
      throw error;
    }
  }

  // Track-specific competency definitions
  private getScrollFounderCompetencies(): Partial<TrackCompetency>[] {
    return [
      {
        name: 'Divine Business Vision',
        description: 'Ability to receive and articulate God-given business vision',
        category: CompetencyCategory.SPIRITUAL_FORMATION,
        requiredLevel: 8
      },
      {
        name: 'Kingdom Entrepreneurship',
        description: 'Understanding of biblical principles for business creation',
        category: CompetencyCategory.KINGDOM_PERSPECTIVE,
        requiredLevel: 9
      },
      {
        name: 'Startup Development',
        description: 'Technical skills for launching and scaling startups',
        category: CompetencyCategory.TECHNICAL_SKILLS,
        requiredLevel: 7
      },
      {
        name: 'Ethical Leadership',
        description: 'Leading teams with integrity and kingdom values',
        category: CompetencyCategory.LEADERSHIP,
        requiredLevel: 8
      },
      {
        name: 'Impact Measurement',
        description: 'Measuring both profit and kingdom impact',
        category: CompetencyCategory.PRACTICAL_APPLICATION,
        requiredLevel: 7
      }
    ];
  }

  private getScrollAmbassadorCompetencies(): Partial<TrackCompetency>[] {
    return [
      {
        name: 'Prophetic Diplomacy',
        description: 'Applying prophetic insight to international relations',
        category: CompetencyCategory.SPIRITUAL_FORMATION,
        requiredLevel: 9
      },
      {
        name: 'Cultural Intelligence',
        description: 'Deep understanding of diverse cultures and contexts',
        category: CompetencyCategory.CULTURAL_INTELLIGENCE,
        requiredLevel: 9
      },
      {
        name: 'Peacebuilding',
        description: 'Skills in conflict resolution and reconciliation',
        category: CompetencyCategory.PRACTICAL_APPLICATION,
        requiredLevel: 8
      },
      {
        name: 'Multilingual Communication',
        description: 'Effective communication across language barriers',
        category: CompetencyCategory.COMMUNICATION,
        requiredLevel: 8
      },
      {
        name: 'Global Networks',
        description: 'Building and maintaining international relationships',
        category: CompetencyCategory.LEADERSHIP,
        requiredLevel: 7
      }
    ];
  }

  private getScrollPriestScribeCompetencies(): Partial<TrackCompetency>[] {
    return [
      {
        name: 'Sacred Text Mastery',
        description: 'Deep knowledge of biblical languages and texts',
        category: CompetencyCategory.SPIRITUAL_FORMATION,
        requiredLevel: 9
      },
      {
        name: 'Translation Excellence',
        description: 'Skills in accurate and culturally relevant translation',
        category: CompetencyCategory.TECHNICAL_SKILLS,
        requiredLevel: 9
      },
      {
        name: 'XR Bible Teaching',
        description: 'Creating immersive biblical experiences',
        category: CompetencyCategory.PRACTICAL_APPLICATION,
        requiredLevel: 8
      },
      {
        name: 'Spiritual Authority',
        description: 'Recognized spiritual maturity and teaching authority',
        category: CompetencyCategory.SPIRITUAL_FORMATION,
        requiredLevel: 9
      },
      {
        name: 'Cultural Adaptation',
        description: 'Adapting sacred content for different cultures',
        category: CompetencyCategory.CULTURAL_INTELLIGENCE,
        requiredLevel: 8
      }
    ];
  }

  private getScrollEngineerCompetencies(): Partial<TrackCompetency>[] {
    return [
      {
        name: 'Sacred Technology',
        description: 'Building technology that blesses communities',
        category: CompetencyCategory.TECHNICAL_SKILLS,
        requiredLevel: 9
      },
      {
        name: 'Ethical AI Development',
        description: 'Creating AI systems aligned with kingdom values',
        category: CompetencyCategory.TECHNICAL_SKILLS,
        requiredLevel: 8
      },
      {
        name: 'Community Impact',
        description: 'Measuring and maximizing community blessing',
        category: CompetencyCategory.PRACTICAL_APPLICATION,
        requiredLevel: 8
      },
      {
        name: 'Innovation Leadership',
        description: 'Leading technical teams with kingdom vision',
        category: CompetencyCategory.LEADERSHIP,
        requiredLevel: 7
      },
      {
        name: 'Prophetic Technology',
        description: 'Receiving divine insight for technological solutions',
        category: CompetencyCategory.SPIRITUAL_FORMATION,
        requiredLevel: 8
      }
    ];
  }

  private getScrollScholarCompetencies(): Partial<TrackCompetency>[] {
    return [
      {
        name: 'Kingdom Research',
        description: 'Conducting research that advances God\'s kingdom',
        category: CompetencyCategory.TECHNICAL_SKILLS,
        requiredLevel: 9
      },
      {
        name: 'Transformational Teaching',
        description: 'Teaching that transforms hearts and minds',
        category: CompetencyCategory.PRACTICAL_APPLICATION,
        requiredLevel: 9
      },
      {
        name: 'Global Mentoring',
        description: 'Mentoring leaders across nations and cultures',
        category: CompetencyCategory.LEADERSHIP,
        requiredLevel: 8
      },
      {
        name: 'Academic Excellence',
        description: 'Maintaining highest standards of scholarship',
        category: CompetencyCategory.TECHNICAL_SKILLS,
        requiredLevel: 8
      },
      {
        name: 'Wisdom Integration',
        description: 'Integrating divine wisdom with academic knowledge',
        category: CompetencyCategory.SPIRITUAL_FORMATION,
        requiredLevel: 9
      }
    ];
  }

  private getScrollBuilderCompetencies(): Partial<TrackCompetency>[] {
    return [
      {
        name: 'Sacred Infrastructure',
        description: 'Building infrastructure that serves God\'s purposes',
        category: CompetencyCategory.TECHNICAL_SKILLS,
        requiredLevel: 9
      },
      {
        name: 'Nation Building',
        description: 'Understanding principles of righteous governance',
        category: CompetencyCategory.KINGDOM_PERSPECTIVE,
        requiredLevel: 8
      },
      {
        name: 'Systems Thinking',
        description: 'Seeing and building interconnected systems',
        category: CompetencyCategory.TECHNICAL_SKILLS,
        requiredLevel: 8
      },
      {
        name: 'Sustainable Development',
        description: 'Creating lasting, sustainable solutions',
        category: CompetencyCategory.PRACTICAL_APPLICATION,
        requiredLevel: 8
      },
      {
        name: 'Prophetic Architecture',
        description: 'Receiving divine blueprints for infrastructure',
        category: CompetencyCategory.SPIRITUAL_FORMATION,
        requiredLevel: 8
      }
    ];
  }

  // Track-specific starter projects
  private getScrollFounderStarterProjects(): Partial<CareerProject>[] {
    return [
      {
        title: 'Divine Business Plan Development',
        description: 'Create a comprehensive business plan for a kingdom-focused startup',
        type: ProjectType.STARTUP_LAUNCH,
        status: ProjectStatus.PLANNING
      },
      {
        title: 'Kingdom Impact Measurement System',
        description: 'Develop metrics for measuring both profit and kingdom impact',
        type: ProjectType.RESEARCH_PROJECT,
        status: ProjectStatus.PLANNING
      }
    ];
  }

  private getScrollAmbassadorStarterProjects(): Partial<CareerProject>[] {
    return [
      {
        title: 'Cross-Cultural Peacebuilding Initiative',
        description: 'Design and implement a peacebuilding project between conflicting communities',
        type: ProjectType.DIPLOMACY_INITIATIVE,
        status: ProjectStatus.PLANNING
      },
      {
        title: 'Global Network Development',
        description: 'Build relationships with key leaders across multiple nations',
        type: ProjectType.COMMUNITY_SERVICE,
        status: ProjectStatus.PLANNING
      }
    ];
  }

  private getScrollPriestScribeStarterProjects(): Partial<CareerProject>[] {
    return [
      {
        title: 'Sacred Text Translation Project',
        description: 'Translate a portion of scripture into a target language',
        type: ProjectType.SACRED_TEXT_TRANSLATION,
        status: ProjectStatus.PLANNING
      },
      {
        title: 'XR Bible Experience Creation',
        description: 'Create an immersive XR experience for a biblical narrative',
        type: ProjectType.TEACHING_PROGRAM,
        status: ProjectStatus.PLANNING
      }
    ];
  }

  private getScrollEngineerStarterProjects(): Partial<CareerProject>[] {
    return [
      {
        title: 'Community Blessing Technology',
        description: 'Develop a technology solution that directly blesses a community',
        type: ProjectType.TECHNOLOGY_BLESSING,
        status: ProjectStatus.PLANNING
      },
      {
        title: 'Ethical AI System',
        description: 'Build an AI system with built-in ethical and kingdom principles',
        type: ProjectType.RESEARCH_PROJECT,
        status: ProjectStatus.PLANNING
      }
    ];
  }

  private getScrollScholarStarterProjects(): Partial<CareerProject>[] {
    return [
      {
        title: 'Kingdom Research Publication',
        description: 'Conduct and publish research that advances kingdom understanding',
        type: ProjectType.RESEARCH_PROJECT,
        status: ProjectStatus.PLANNING
      },
      {
        title: 'Global Teaching Program',
        description: 'Develop and deliver a teaching program across multiple nations',
        type: ProjectType.TEACHING_PROGRAM,
        status: ProjectStatus.PLANNING
      }
    ];
  }

  private getScrollBuilderStarterProjects(): Partial<CareerProject>[] {
    return [
      {
        title: 'Sacred Infrastructure Deployment',
        description: 'Deploy infrastructure that serves kingdom purposes in a target nation',
        type: ProjectType.INFRASTRUCTURE_DEPLOYMENT,
        status: ProjectStatus.PLANNING
      },
      {
        title: 'Sustainable Systems Design',
        description: 'Design sustainable systems for community development',
        type: ProjectType.COMMUNITY_SERVICE,
        status: ProjectStatus.PLANNING
      }
    ];
  }
}

export default CareerPathwayService;