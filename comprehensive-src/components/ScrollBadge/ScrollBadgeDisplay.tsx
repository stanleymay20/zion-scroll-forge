/**
 * ScrollBadge Display Component
 * React component for displaying ScrollBadge NFTs with verification
 */

import React, { useState, useEffect } from 'react';
import { ScrollBadge, PublicBadgeDisplay, BadgeVerificationResult } from '../../types/scrollbadge';

interface ScrollBadgeDisplayProps {
  badge: ScrollBadge | PublicBadgeDisplay;
  showVerification?: boolean;
  showSkills?: boolean;
  showSpiritualMetrics?: boolean;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
}

export const ScrollBadgeDisplay: React.FC<ScrollBadgeDisplayProps> = ({
  badge,
  showVerification = true,
  showSkills = true,
  showSpiritualMetrics = false,
  size = 'medium',
  interactive = true
}) => {
  const [verificationResult, setVerificationResult] = useState<BadgeVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isScrollBadge = (b: any): b is ScrollBadge => b.tokenId && b.competencies;
  const isPublicDisplay = (b: any): b is PublicBadgeDisplay => b.badgeId && b.skills;

  const badgeId = isScrollBadge(badge) ? badge.tokenId : badge.badgeId;
  const badgeName = isScrollBadge(badge) ? `${badge.badgeType} Badge` : `Badge ${badgeId}`;
  const skills = isScrollBadge(badge) ? badge.competencies.map(c => c.name) : badge.skills;
  const issueDate = isScrollBadge(badge) ? badge.timestamp : badge.issueDate;

  useEffect(() => {
    if (showVerification && interactive) {
      verifyBadge();
    }
  }, [badgeId, showVerification, interactive]);

  const verifyBadge = async () => {
    if (!badgeId) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/scrollbadges/verify/${badgeId}`);
      const data = await response.json();
      
      if (data.success) {
        setVerificationResult(data.data);
      }
    } catch (error) {
      console.error('Error verifying badge:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-32 h-40';
      case 'large':
        return 'w-80 h-96';
      default:
        return 'w-64 h-80';
    }
  };

  const getVerificationIcon = () => {
    if (isVerifying) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      );
    }
    
    if (verificationResult?.isValid) {
      return (
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${getSizeClasses()} ${interactive ? 'hover:shadow-xl transition-shadow cursor-pointer' : ''}`}
         onClick={() => interactive && setShowDetails(!showDetails)}>
      
      {/* Badge Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg truncate">{badgeName}</h3>
          {showVerification && (
            <div className="flex items-center space-x-1">
              {getVerificationIcon()}
              <span className="text-xs">
                {isVerifying ? 'Verifying...' : verificationResult?.isValid ? 'Verified' : 'Invalid'}
              </span>
            </div>
          )}
        </div>
        
        {/* Badge Image Placeholder */}
        <div className="mt-2 flex justify-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Badge Content */}
      <div className="p-4 flex-1">
        <div className="text-sm text-gray-600 mb-2">
          Issued: {issueDate.toLocaleDateString()}
        </div>

        {showSkills && skills && skills.length > 0 && (
          <div className="mb-3">
            <h4 className="font-semibold text-sm text-gray-800 mb-1">Skills Acquired:</h4>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  +{skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {showSpiritualMetrics && isScrollBadge(badge) && (
          <div className="mb-3">
            <h4 className="font-semibold text-sm text-gray-800 mb-1">Spiritual Growth:</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Kingdom Alignment:</span>
                <span>{badge.spiritualGrowth.kingdomAlignment}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Prophetic Sensitivity:</span>
                <span>{badge.spiritualGrowth.propheticSensitivity}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Verification Details */}
        {showDetails && verificationResult && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="font-semibold text-sm text-gray-800 mb-2">Verification Details:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Badge Exists:</span>
                <span className={verificationResult.verificationDetails.badgeExists ? 'text-green-600' : 'text-red-600'}>
                  {verificationResult.verificationDetails.badgeExists ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ownership Verified:</span>
                <span className={verificationResult.verificationDetails.ownershipVerified ? 'text-green-600' : 'text-red-600'}>
                  {verificationResult.verificationDetails.ownershipVerified ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Course Completed:</span>
                <span className={verificationResult.verificationDetails.courseCompleted ? 'text-green-600' : 'text-red-600'}>
                  {verificationResult.verificationDetails.courseCompleted ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Blockchain Confirmed:</span>
                <span className={verificationResult.verificationDetails.blockchainConfirmed ? 'text-green-600' : 'text-red-600'}>
                  {verificationResult.verificationDetails.blockchainConfirmed ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Badge Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>ScrollUniversity</span>
          {isPublicDisplay(badge) && (
            <a 
              href={badge.verificationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              Verify
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrollBadgeDisplay;