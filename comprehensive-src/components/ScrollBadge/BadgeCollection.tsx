/**
 * Badge Collection Component
 * Displays a collection of ScrollBadges for a student
 */

import React, { useState, useEffect } from 'react';
import { BadgeCollection, PublicBadgeDisplay, ShareableProfile } from '../../types/scrollbadge';
import ScrollBadgeDisplay from './ScrollBadgeDisplay';

interface BadgeCollectionProps {
  studentId: string;
  showPublicProfile?: boolean;
  showShareOptions?: boolean;
  isPublicView?: boolean;
}

export const BadgeCollectionComponent: React.FC<BadgeCollectionProps> = ({
  studentId,
  showPublicProfile = true,
  showShareOptions = true,
  isPublicView = false
}) => {
  const [collection, setCollection] = useState<BadgeCollection | null>(null);
  const [shareableProfile, setShareableProfile] = useState<ShareableProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadBadgeCollection();
    if (showPublicProfile) {
      loadShareableProfile();
    }
  }, [studentId]);

  const loadBadgeCollection = async () => {
    try {
      const response = await fetch(`/api/scrollbadges/student/${studentId}/collection`);
      const data = await response.json();
      
      if (data.success) {
        setCollection(data.data);
      } else {
        setError(data.error || 'Failed to load badge collection');
      }
    } catch (err) {
      setError('Error loading badge collection');
      console.error('Error loading badge collection:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadShareableProfile = async () => {
    try {
      const response = await fetch(`/api/scrollbadges/student/${studentId}/profile`);
      const data = await response.json();
      
      if (data.success) {
        setShareableProfile(data.data);
        setShareUrl(data.data.shareUrl);
      }
    } catch (err) {
      console.error('Error loading shareable profile:', err);
    }
  };

  const handleShare = async (platform: string) => {
    if (!shareableProfile) return;

    const shareText = `Check out my ScrollUniversity achievements! I've earned ${shareableProfile.achievements.totalBadges} badges and completed ${shareableProfile.achievements.coursesCompleted} courses.`;
    const url = shareableProfile.shareUrl;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Share URL copied to clipboard!');
        break;
    }
  };

  const generateEmbedCode = () => {
    if (!shareableProfile) return '';
    
    return `<iframe src="${shareableProfile.shareUrl}/embed" width="300" height="400" frameborder="0"></iframe>`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Badges</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!collection || collection.totalBadges === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No badges yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Complete courses to earn your first ScrollBadge!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collection Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">ScrollBadge Collection</h2>
            {shareableProfile && (
              <p className="text-purple-100 mt-1">{shareableProfile.studentName}</p>
            )}
          </div>
          {showShareOptions && shareableProfile && (
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Share Collection
            </button>
          )}
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{collection.totalBadges}</div>
            <div className="text-sm text-purple-100">Total Badges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{shareableProfile?.achievements.coursesCompleted || 0}</div>
            <div className="text-sm text-purple-100">Courses Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{collection.skillsAcquired.length}</div>
            <div className="text-sm text-purple-100">Skills Mastered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(collection.spiritualProgress.kingdomAlignment)}%</div>
            <div className="text-sm text-purple-100">Kingdom Alignment</div>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collection.publicProfile.map((badge, index) => (
          <ScrollBadgeDisplay
            key={badge.badgeId}
            badge={badge}
            showVerification={!isPublicView}
            showSkills={true}
            showSpiritualMetrics={false}
            size="medium"
            interactive={true}
          />
        ))}
      </div>

      {/* Skills Summary */}
      {collection.skillsAcquired.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Acquired</h3>
          <div className="flex flex-wrap gap-2">
            {collection.skillsAcquired.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill.name} ({skill.level})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareableProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Your Badge Collection</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Share URL</label>
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm"
                  />
                  <button
                    onClick={() => handleShare('copy')}
                    className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm hover:bg-gray-200"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Share on Social Media</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                  >
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex-1 bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800"
                  >
                    LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Facebook
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Embed Code</label>
                <textarea
                  value={generateEmbedCode()}
                  readOnly
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCollectionComponent;