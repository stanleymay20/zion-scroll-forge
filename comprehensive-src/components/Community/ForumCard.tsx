import React from 'react';
import { CommunityForum } from '../../types/community';

interface ForumCardProps {
  forum: CommunityForum;
}

export const ForumCard: React.FC<ForumCardProps> = ({ forum }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{forum.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{forum.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                {forum.memberCount} members
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                {forum.postCount} posts
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  forum.category === 'spiritual' ? 'bg-purple-100 text-purple-800' :
                  forum.category === 'academic' ? 'bg-blue-100 text-blue-800' :
                  forum.category === 'career' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {forum.category}
                </span>
                {forum.spiritualAlignment.biblicalFoundation && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Biblical
                  </span>
                )}
              </div>
              
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Forum
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};