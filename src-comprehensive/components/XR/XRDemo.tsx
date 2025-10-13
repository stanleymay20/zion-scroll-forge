/**
 * XR Demo Component
 * Demonstrates the XR Content Integration System functionality
 */

import React, { useState, useEffect } from 'react';
import XRIntegrationSystem from './XRIntegrationSystem';
import { XRSession, SpiritualInsight } from '../../types/xr';

interface XRDemoProps {
  userId?: string;
}

export const XRDemo: React.FC<XRDemoProps> = ({ userId = 'demo-user' }) => {
  const [sessionHistory, setSessionHistory] = useState<XRSession[]>([]);
  const [spiritualInsights, setSpiritualInsights] = useState<SpiritualInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSessionStart = (session: XRSession) => {
    console.log('XR Session started:', session.id);
    setIsLoading(false);
  };

  const handleSessionEnd = (session: XRSession) => {
    console.log('XR Session ended:', session.id);
    setSessionHistory(prev => [...prev, session]);
  };

  const handleSpiritualInsight = (insight: SpiritualInsight) => {
    console.log('Spiritual insight received:', insight);
    setSpiritualInsights(prev => [...prev, insight]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ScrollUniversity XR Experience
        </h1>
        <p className="text-lg text-gray-600">
          Immersive biblical and scientific learning with angelic tutors
        </p>
      </div>

      {/* XR Integration System */}
      <div className="mb-8">
        <XRIntegrationSystem
          userId={userId}
          initialSceneId="creation-genesis"
          onSessionStart={handleSessionStart}
          onSessionEnd={handleSessionEnd}
          onSpiritualInsight={handleSpiritualInsight}
        />
      </div>

      {/* Session History */}
      {sessionHistory.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Session History</h2>
          <div className="space-y-4">
            {sessionHistory.map((session) => (
              <div key={session.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Session {session.id.slice(-8)}</h3>
                  <span className="text-sm text-gray-500">
                    {session.endTime ? 
                      `${Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)} minutes` :
                      'Active'
                    }
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Scene:</span> {session.sceneId}
                  </div>
                  <div>
                    <span className="text-gray-600">Progress:</span> {session.progress.currentStep}/{session.progress.totalSteps}
                  </div>
                  <div>
                    <span className="text-gray-600">Engagement:</span> {Math.round(session.progress.engagementScore * 100)}%
                  </div>
                  <div>
                    <span className="text-gray-600">Interactions:</span> {session.interactions.length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spiritual Insights */}
      {spiritualInsights.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Spiritual Insights</h2>
          <div className="space-y-4">
            {spiritualInsights.map((insight, index) => (
              <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">💡</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">{insight.insight}</p>
                    {insight.biblicalReference && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Scripture:</span> {insight.biblicalReference}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Application:</span> {insight.personalApplication}
                    </p>
                    {insight.prayerPoint && (
                      <p className="text-sm text-purple-700">
                        <span className="font-medium">Prayer:</span> {insight.prayerPoint}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {insight.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">🥽</span>
            </div>
            <h3 className="font-semibold">WebXR Support</h3>
          </div>
          <p className="text-sm text-gray-600">
            Immersive VR/AR experiences with device optimization
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">👼</span>
            </div>
            <h3 className="font-semibold">Angelic Tutors</h3>
          </div>
          <p className="text-sm text-gray-600">
            AI-powered spiritual guides with biblical wisdom
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">🏛️</span>
            </div>
            <h3 className="font-semibold">Virtual Classrooms</h3>
          </div>
          <p className="text-sm text-gray-600">
            Immersive learning environments for global students
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">📖</span>
            </div>
            <h3 className="font-semibold">Biblical Scenes</h3>
          </div>
          <p className="text-sm text-gray-600">
            Walk through Scripture with 3D reconstructions
          </p>
        </div>
      </div>

      {/* Technical Requirements */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Technical Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Supported Devices</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• VR Headsets (Oculus, HTC Vive, etc.)</li>
              <li>• AR Glasses (HoloLens, Magic Leap)</li>
              <li>• Mobile AR (iOS/Android)</li>
              <li>• Desktop VR (WebXR compatible browsers)</li>
              <li>• Web 3D (Fallback for all devices)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Browser Support</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Chrome 79+ (WebXR support)</li>
              <li>• Firefox 80+ (WebXR support)</li>
              <li>• Edge 79+ (WebXR support)</li>
              <li>• Safari (3D fallback mode)</li>
              <li>• Mobile browsers (AR support)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XRDemo;