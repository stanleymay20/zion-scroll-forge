import React from 'react';
import { StudyGroup } from '../../types/community';

interface StudyGroupCardProps {
  studyGroup: StudyGroup;
}

export const StudyGroupCard: React.FC<StudyGroupCardProps> = ({ studyGroup }) => {
  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      case 'in_person':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        );
      case 'hybrid':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getNextSession = () => {
    if (studyGroup.schedule.length === 0) return null;
    // This would calculate the next session based on schedule
    return studyGroup.schedule[0];
  };

  const nextSession = getNextSession();

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{studyGroup.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{studyGroup.subject}</p>
            {studyGroup.courseId && (
              <p className="text-xs text-blue-600 mt-1">Course: {studyGroup.courseId}</p>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            {getMeetingTypeIcon(studyGroup.meetingType)}
            <span className="ml-1 capitalize">{studyGroup.meetingType.replace('_', ' ')}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{studyGroup.description}</p>

        {/* Member Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            {studyGroup.members.length}/{studyGroup.maxMembers} members
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {studyGroup.resources.length} resources
          </div>
        </div>

        {/* Next Session */}
        {nextSession && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-900">
                Next session: {nextSession.dayOfWeek === 0 ? 'Sunday' : 
                              nextSession.dayOfWeek === 1 ? 'Monday' :
                              nextSession.dayOfWeek === 2 ? 'Tuesday' :
                              nextSession.dayOfWeek === 3 ? 'Wednesday' :
                              nextSession.dayOfWeek === 4 ? 'Thursday' :
                              nextSession.dayOfWeek === 5 ? 'Friday' : 'Saturday'} at {nextSession.startTime}
              </span>
            </div>
          </div>
        )}

        {/* Member Avatars */}
        <div className="flex items-center mb-4">
          <div className="flex -space-x-2">
            {studyGroup.members.slice(0, 4).map((member, index) => (
              <div
                key={member.userId}
                className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center"
              >
                <span className="text-xs font-medium text-gray-600">
                  {member.userId.charAt(0).toUpperCase()}
                </span>
              </div>
            ))}
            {studyGroup.members.length > 4 && (
              <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">
                  +{studyGroup.members.length - 4}
                </span>
              </div>
            )}
          </div>
          <span className="ml-3 text-sm text-gray-500">Active members</span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            studyGroup.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {studyGroup.isActive ? 'Active' : 'Inactive'}
          </span>
          
          <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Group
            </button>
            {studyGroup.members.length < studyGroup.maxMembers && (
              <button className="bg-blue-600 text-white text-sm py-1 px-3 rounded-md hover:bg-blue-700 transition-colors">
                Join
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};