import React, { useState } from 'react';
import { ScrollUniversityLanding } from '../components/Landing/ScrollUniversityLanding';
import { StudentOnboardingFlow } from '../components/Onboarding/StudentOnboardingFlow';
import { LaunchDashboard } from '../components/Launch/LaunchDashboard';

type LaunchView = 'landing' | 'onboarding' | 'dashboard';

export const LaunchPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<LaunchView>('landing');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <ScrollUniversityLanding />;
      case 'onboarding':
        return <StudentOnboardingFlow />;
      case 'dashboard':
        return <LaunchDashboard />;
      default:
        return <ScrollUniversityLanding />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation for demo purposes */}
      <div className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur-sm rounded-lg p-2 space-x-2">
        <button
          onClick={() => setCurrentView('landing')}
          className={`px-3 py-1 rounded text-sm ${
            currentView === 'landing' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Landing
        </button>
        <button
          onClick={() => setCurrentView('onboarding')}
          className={`px-3 py-1 rounded text-sm ${
            currentView === 'onboarding' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Onboarding
        </button>
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`px-3 py-1 rounded text-sm ${
            currentView === 'dashboard' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Dashboard
        </button>
      </div>

      {renderCurrentView()}
    </div>
  );
};