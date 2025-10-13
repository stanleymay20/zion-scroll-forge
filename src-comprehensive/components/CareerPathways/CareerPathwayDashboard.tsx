import React, { useState, useEffect } from 'react';
import { 
  CareerTrack, 
  CareerPathwayProfile, 
  TrackProgressMetrics,
  TrackCompetency,
  CareerProject,
  MentorshipConnection,
  TrackCertification
} from '../../types/career-pathways';
import { CareerPathwayService } from '../../services/CareerPathwayService';
import { ScrollFounderService } from '../../services/ScrollFounderService';
import { ScrollAmbassadorService } from '../../services/ScrollAmbassadorService';
import { ScrollEngineerService } from '../../services/ScrollEngineerService';

interface CareerPathwayDashboardProps {
  studentId: string;
}

export const CareerPathwayDashboard: React.FC<CareerPathwayDashboardProps> = ({ studentId }) => {
  const [profile, setProfile] = useState<CareerPathwayProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'competencies' | 'projects' | 'mentorship' | 'certifications'>('overview');
  
  const careerPathwayService = new CareerPathwayService();
  const scrollFounderService = new ScrollFounderService();
  const scrollAmbassadorService = new ScrollAmbassadorService();
  const scrollEngineerService = new ScrollEngineerService();

  useEffect(() => {
    loadCareerProfile();
  }, [studentId]);

  const loadCareerProfile = async () => {
    try {
      setLoading(true);
      const profileData = await careerPathwayService.getCareerPathwayProfile(studentId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading career profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSelection = async (track: CareerTrack) => {
    try {
      const newProfile = await careerPathwayService.selectCareerTrack(studentId, track);
      setProfile(newProfile);
    } catch (error) {
      console.error('Error selecting career track:', error);
    }
  };

  const getTrackIcon = (track: CareerTrack): string => {
    switch (track) {
      case CareerTrack.SCROLL_FOUNDER:
        return '🚀';
      case CareerTrack.SCROLL_AMBASSADOR:
        return '🌍';
      case CareerTrack.SCROLL_PRIEST_SCRIBE:
        return '📜';
      case CareerTrack.SCROLL_ENGINEER:
        return '⚡';
      case CareerTrack.SCROLL_SCHOLAR:
        return '📚';
      case CareerTrack.SCROLL_BUILDER:
        return '🏗️';
      default:
        return '✨';
    }
  };

  const getTrackDescription = (track: CareerTrack): string => {
    switch (track) {
      case CareerTrack.SCROLL_FOUNDER:
        return 'Launch divine companies and startups that advance God\'s kingdom';
      case CareerTrack.SCROLL_AMBASSADOR:
        return 'Engage in global diplomacy and peacebuilding across nations';
      case CareerTrack.SCROLL_PRIEST_SCRIBE:
        return 'Translate sacred texts and teach through XR Bible experiences';
      case CareerTrack.SCROLL_ENGINEER:
        return 'Build next-generation technology to bless communities';
      case CareerTrack.SCROLL_SCHOLAR:
        return 'Teach, write, and mentor across nations with kingdom wisdom';
      case CareerTrack.SCROLL_BUILDER:
        return 'Deploy sacred infrastructure to serve nations';
      default:
        return 'Choose your divine calling and career pathway';
    }
  };

  const renderTrackSelection = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Career Pathway</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(CareerTrack).map((track) => (
          <div
            key={track}
            className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 cursor-pointer transition-colors"
            onClick={() => handleTrackSelection(track)}
          >
            <div className="text-4xl mb-4 text-center">{getTrackIcon(track)}</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{track}</h3>
            <p className="text-gray-600 text-sm text-center">{getTrackDescription(track)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProgressOverview = () => {
    if (!profile) return null;

    const { progressMetrics } = profile;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Progress</h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {progressMetrics.overallProgress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${progressMetrics.overallProgress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Competency Completion</h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                  Skills
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-green-600">
                  {progressMetrics.competencyCompletion}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
              <div
                style={{ width: `${progressMetrics.competencyCompletion}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Kingdom Impact</h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                  Impact
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-purple-600">
                  {progressMetrics.kingdomImpact}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
              <div
                style={{ width: `${progressMetrics.kingdomImpact}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCompetencies = () => {
    if (!profile) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Track Competencies</h3>
        <div className="space-y-4">
          {profile.competencies.map((competency) => (
            <div key={competency.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-medium text-gray-800">{competency.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  competency.completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {competency.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{competency.description}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Progress</span>
                <span className="text-sm font-medium text-gray-700">
                  {competency.currentLevel}/{competency.requiredLevel}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(competency.currentLevel / competency.requiredLevel) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (!profile) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Career Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.projects.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-medium text-gray-800">{project.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'COMPLETED' 
                    ? 'bg-green-100 text-green-800'
                    : project.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{project.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-4">Type: {project.type.replace('_', ' ')}</span>
                <span>Track: {project.track}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMentorship = () => {
    if (!profile) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Mentorship Connections</h3>
        <div className="space-y-4">
          {profile.mentorships.map((mentorship) => (
            <div key={mentorship.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-medium text-gray-800">Mentor: {mentorship.mentorId}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  mentorship.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800'
                    : mentorship.status === 'COMPLETED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {mentorship.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {mentorship.focus.map((focus) => (
                  <span key={focus} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    {focus.replace('_', ' ')}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Started: {new Date(mentorship.startDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    if (!profile) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Track Certifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.certifications.map((certification) => (
            <div key={certification.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-medium text-gray-800">{certification.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  certification.status === 'ISSUED' 
                    ? 'bg-green-100 text-green-800'
                    : certification.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {certification.status.replace('_', ' ')}
                </span>
              </div>
              <div className="mb-3">
                <span className="text-sm text-gray-500">Level: </span>
                <span className="text-sm font-medium text-gray-700">{certification.level}</span>
              </div>
              <div className="mb-3">
                <span className="text-sm text-gray-500">Track: </span>
                <span className="text-sm font-medium text-gray-700">{certification.track}</span>
              </div>
              {certification.issuedDate && (
                <p className="text-sm text-gray-500">
                  Issued: {new Date(certification.issuedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return renderTrackSelection();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-4xl mr-4">{getTrackIcon(profile.selectedTrack)}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{profile.selectedTrack}</h1>
              <p className="text-gray-600">{getTrackDescription(profile.selectedTrack)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{profile.progressMetrics.readinessScore}%</div>
            <div className="text-sm text-gray-500">Readiness Score</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {renderProgressOverview()}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'competencies', label: 'Competencies' },
              { key: 'projects', label: 'Projects' },
              { key: 'mentorship', label: 'Mentorship' },
              { key: 'certifications', label: 'Certifications' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'overview' && renderProgressOverview()}
        {activeTab === 'competencies' && renderCompetencies()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'mentorship' && renderMentorship()}
        {activeTab === 'certifications' && renderCertifications()}
      </div>
    </div>
  );
};

export default CareerPathwayDashboard;