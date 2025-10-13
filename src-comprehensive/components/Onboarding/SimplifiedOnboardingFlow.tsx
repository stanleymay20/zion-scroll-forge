/**
 * ScrollUniversity Simplified Onboarding Flow
 * "Come unto me, all ye that labour and are heavy laden" - Matthew 11:28
 * 
 * Provides multiple onboarding paths to meet users where they are
 */

import React, { useState } from 'react';

interface OnboardingPathOption {
  id: 'quick_start' | 'spiritual_journey' | 'full_experience';
  title: string;
  description: string;
  spiritualLevel: 'none' | 'light' | 'comprehensive';
  timeToStart: string;
  features: string[];
}

interface SimplifiedOnboardingFlowProps {
  onPathSelected: (pathId: string) => void;
  onComplete: (userData: any) => void;
}

const SimplifiedOnboardingFlow: React.FC<SimplifiedOnboardingFlowProps> = ({
  onPathSelected,
  onComplete
}) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({});

  const onboardingPaths: OnboardingPathOption[] = [
    {
      id: 'quick_start',
      title: 'Quick Start',
      description: 'Jump right into learning with immediate access to practical courses',
      spiritualLevel: 'none',
      timeToStart: '< 2 minutes',
      features: [
        'Immediate course access',
        'No spiritual assessments required',
        'Traditional payment options',
        'Optional spiritual elements',
        'Progressive feature unlock'
      ]
    },
    {
      id: 'spiritual_journey',
      title: 'Spiritual Journey',
      description: 'Combine practical learning with light spiritual formation',
      spiritualLevel: 'light',
      timeToStart: '5-10 minutes',
      features: [
        'Light spiritual assessment',
        'Character formation integration',
        'Kingdom purpose introduction',
        'Community connections',
        'Mentorship opportunities'
      ]
    },
    {
      id: 'full_experience',
      title: 'Full ScrollUniversity Experience',
      description: 'Complete spiritual-academic integration with prophetic AI',
      spiritualLevel: 'comprehensive',
      timeToStart: '15-20 minutes',
      features: [
        'Comprehensive spiritual evaluation',
        'Prophetic AI tutoring',
        'Divine scorecard tracking',
        'Kingdom transformation focus',
        'Full ScrollCoin economy access'
      ]
    }
  ];

  const handlePathSelection = (pathId: string) => {
    setSelectedPath(pathId);
    onPathSelected(pathId);
    setCurrentStep(1);
  };

  const handleBasicInfoSubmit = (basicInfo: any) => {
    setUserData({ ...userData, ...basicInfo });
    setCurrentStep(2);
  };

  const handlePreferencesSubmit = (preferences: any) => {
    const finalUserData = { ...userData, ...preferences, onboardingPath: selectedPath };
    setUserData(finalUserData);
    onComplete(finalUserData);
  };

  const renderPathSelection = () => (
    <div className="path-selection">
      <div className="header">
        <h1>Welcome to ScrollUniversity</h1>
        <p>Choose your learning journey. You can always upgrade later.</p>
      </div>
      
      <div className="path-options">
        {onboardingPaths.map((path) => (
          <div
            key={path.id}
            className={`path-card ${path.id === 'quick_start' ? 'recommended' : ''}`}
            onClick={() => handlePathSelection(path.id)}
          >
            {path.id === 'quick_start' && (
              <div className="recommended-badge">Most Popular</div>
            )}
            
            <h3>{path.title}</h3>
            <p className="description">{path.description}</p>
            
            <div className="path-details">
              <div className="time-to-start">
                <span className="label">Time to start:</span>
                <span className="value">{path.timeToStart}</span>
              </div>
              
              <div className="spiritual-level">
                <span className="label">Spiritual content:</span>
                <span className={`value ${path.spiritualLevel}`}>
                  {path.spiritualLevel === 'none' ? 'Optional' : 
                   path.spiritualLevel === 'light' ? 'Light' : 'Comprehensive'}
                </span>
              </div>
            </div>
            
            <ul className="features">
              {path.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            
            <button className="select-path-btn">
              Choose {path.title}
            </button>
          </div>
        ))}
      </div>
      
      <div className="path-comparison">
        <p>Not sure which path is right for you?</p>
        <button className="comparison-btn">Compare All Paths</button>
      </div>
    </div>
  );

  const renderBasicInfo = () => {
    const selectedPathData = onboardingPaths.find(p => p.id === selectedPath);
    
    return (
      <div className="basic-info-step">
        <div className="step-header">
          <h2>Let's get you started with {selectedPathData?.title}</h2>
          <p>Just a few quick details to personalize your experience</p>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const basicInfo = Object.fromEntries(formData.entries());
          handleBasicInfoSubmit(basicInfo);
        }}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" name="firstName" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="learningGoals">What do you want to learn?</label>
            <select id="learningGoals" name="learningGoals" required>
              <option value="">Select your primary interest</option>
              <option value="business">Business & Entrepreneurship</option>
              <option value="technology">Technology & Programming</option>
              <option value="ministry">Ministry & Theology</option>
              <option value="creative">Creative Arts & Media</option>
              <option value="leadership">Leadership & Governance</option>
              <option value="science">Science & Research</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {selectedPath !== 'quick_start' && (
            <div className="form-group">
              <label htmlFor="spiritualBackground">Spiritual Background (Optional)</label>
              <select id="spiritualBackground" name="spiritualBackground">
                <option value="">Prefer not to say</option>
                <option value="new_believer">New believer</option>
                <option value="growing">Growing in faith</option>
                <option value="mature">Mature believer</option>
                <option value="ministry_leader">Ministry leader</option>
              </select>
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" onClick={() => setCurrentStep(0)}>
              Back to Path Selection
            </button>
            <button type="submit" className="primary">
              Continue
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderPreferences = () => (
    <div className="preferences-step">
      <div className="step-header">
        <h2>Customize Your Experience</h2>
        <p>These preferences help us tailor your learning journey</p>
      </div>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const preferences = Object.fromEntries(formData.entries());
        handlePreferencesSubmit(preferences);
      }}>
        <div className="form-group">
          <label>Learning Schedule</label>
          <div className="radio-group">
            <label>
              <input type="radio" name="schedule" value="flexible" defaultChecked />
              Flexible - Learn at my own pace
            </label>
            <label>
              <input type="radio" name="schedule" value="structured" />
              Structured - Regular schedule with deadlines
            </label>
            <label>
              <input type="radio" name="schedule" value="intensive" />
              Intensive - Fast-track learning
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label>Notification Preferences</label>
          <div className="checkbox-group">
            <label>
              <input type="checkbox" name="notifications" value="course_updates" defaultChecked />
              Course updates and new content
            </label>
            <label>
              <input type="checkbox" name="notifications" value="progress_reminders" defaultChecked />
              Progress reminders and encouragement
            </label>
            {selectedPath !== 'quick_start' && (
              <label>
                <input type="checkbox" name="notifications" value="spiritual_insights" />
                Spiritual insights and prophetic words
              </label>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="timezone">Time Zone</label>
          <select id="timezone" name="timezone">
            <option value="auto">Auto-detect</option>
            <option value="EST">Eastern Time (EST)</option>
            <option value="CST">Central Time (CST)</option>
            <option value="MST">Mountain Time (MST)</option>
            <option value="PST">Pacific Time (PST)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => setCurrentStep(1)}>
            Back
          </button>
          <button type="submit" className="primary">
            Complete Setup
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="simplified-onboarding-flow">
      <div className="progress-indicator">
        <div className={`step ${currentStep >= 0 ? 'active' : ''}`}>
          <span>1</span> Choose Path
        </div>
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          <span>2</span> Basic Info
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <span>3</span> Preferences
        </div>
      </div>
      
      <div className="onboarding-content">
        {currentStep === 0 && renderPathSelection()}
        {currentStep === 1 && renderBasicInfo()}
        {currentStep === 2 && renderPreferences()}
      </div>
      
      <div className="onboarding-footer">
        <p>
          Questions? <a href="/help">Get help</a> or{' '}
          <a href="/contact">contact support</a>
        </p>
      </div>
    </div>
  );
};

export default SimplifiedOnboardingFlow;