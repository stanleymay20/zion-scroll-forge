import React from 'react';
import { PeerMentorship } from '../../types/community';

interface MentorshipCardProps {
  mentorship: PeerMentorship;
}

export const MentorshipCard: React.FC<MentorshipCardProps> = ({ mentorship }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const progressPercentage = mentorship.progress.totalGoals > 0 
    ? (mentorship.progress.goalsCompleted / mentorship.progress.totalGoals) * 100 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{mentorship.subject}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Mentor: {mentorship.mentorId} • Mentee: {mentorship.menteeId}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mentorship.status)}`}>
            {mentorship.status}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{mentorship.progress.goalsCompleted}/{mentorship.progress.totalGoals} goals</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Goals */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Goals</h4>
          <div className="space-y-1">
            {mentorship.goals.slice(0, 3).map((goal, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  index < mentorship.progress.goalsCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className={index < mentorship.progress.goalsCompleted ? 'text-gray-900 line-through' : 'text-gray-600'}>
                  {goal}
                </span>
              </div>
            ))}
            {mentorship.goals.length > 3 && (
              <p className="text-xs text-gray-500 ml-4">+{mentorship.goals.length - 3} more goals</p>
            )}
          </div>
        </div>

        {/* Sessions */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Sessions completed</span>
            <span className="font-medium">{mentorship.sessions.filter(s => s.status === 'completed').length}</span>
          </div>
        </div>

        {/* Spiritual Guidance Badge */}
        {mentorship.spiritualGuidance && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Spiritual Guidance
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors">
            View Details
          </button>
          {mentorship.status === 'active' && (
            <button className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">
              Schedule Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};