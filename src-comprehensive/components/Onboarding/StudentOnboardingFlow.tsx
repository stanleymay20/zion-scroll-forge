import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Heart, BookOpen, Globe, Zap, Users, Award } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
}

interface OnboardingStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onComplete: (data: any) => void;
  data: any;
}

interface OnboardingData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    preferredLanguage: string;
    age: number;
  };
  spiritualProfile: {
    faithBackground: string;
    spiritualGifts: string[];
    callingAreas: string[];
    prayerLife: string;
    scriptureEngagement: string;
  };
  academicBackground: {
    educationLevel: string;
    previousInstitutions: string[];
    areasOfInterest: string[];
    learningStyle: string;
  };
  careerAspirations: {
    missionTrack: string;
    careerGoals: string[];
    kingdomImpactVision: string;
    timeCommitment: string;
  };
  technicalSetup: {
    deviceCapabilities: string[];
    internetConnection: string;
    xrCapability: boolean;
    preferredLearningMode: string;
  };
}

const WelcomeStep: React.FC<OnboardingStepProps> = ({ onNext }) => (
  <div className="text-center space-y-6">
    <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
      <BookOpen className="w-10 h-10 text-black" />
    </div>
    <h2 className="text-3xl font-bold text-white">Welcome to ScrollUniversity</h2>
    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
      You're about to embark on a transformational educational journey that will prepare you to impact nations 
      and advance the Kingdom of God through cutting-edge technology and prophetic wisdom.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="bg-white/10 rounded-lg p-4">
        <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <h3 className="font-semibold text-white">Spiritual Formation</h3>
        <p className="text-sm text-gray-300">Grow in your relationship with God</p>
      </div>
      <div className="bg-white/10 rounded-lg p-4">
        <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
        <h3 className="font-semibold text-white">AI-Powered Learning</h3>
        <p className="text-sm text-gray-300">24/7 personalized tutoring</p>
      </div>
      <div className="bg-white/10 rounded-lg p-4">
        <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
        <h3 className="font-semibold text-white">Global Impact</h3>
        <p className="text-sm text-gray-300">Transform nations through education</p>
      </div>
    </div>
    <button
      onClick={onNext}
      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center mx-auto"
    >
      Begin Your Journey <ChevronRight className="ml-2 w-5 h-5" />
    </button>
  </div>
);

const PersonalInfoStep: React.FC<OnboardingStepProps> = ({ onNext, onPrevious, onComplete, data }) => {
  const [formData, setFormData] = useState(data.personalInfo || {
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    preferredLanguage: 'English',
    age: 18
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ personalInfo: formData });
    onNext();
  };

  const languages = ['English', 'French', 'Twi', 'Yoruba', 'Hausa', 'Arabic', 'German', 'Spanish', 'Hebrew'];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Personal Information</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-semibold mb-2">First Name</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Last Name</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
              placeholder="Enter your last name"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-white font-semibold mb-2">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
            placeholder="Enter your email address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-semibold mb-2">Country</label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
              placeholder="Enter your country"
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Preferred Language</label>
            <select
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
            >
              {languages.map(lang => (
                <option key={lang} value={lang} className="bg-gray-800">{lang}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Age</label>
          <input
            type="number"
            min="12"
            max="100"
            required
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center px-6 py-3 border border-white/30 text-white rounded-lg hover:border-white/50 transition-all duration-300"
          >
            <ChevronLeft className="mr-2 w-5 h-5" /> Previous
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center"
          >
            Continue <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

const SpiritualProfileStep: React.FC<OnboardingStepProps> = ({ onNext, onPrevious, onComplete, data }) => {
  const [formData, setFormData] = useState(data.spiritualProfile || {
    faithBackground: '',
    spiritualGifts: [],
    callingAreas: [],
    prayerLife: '',
    scriptureEngagement: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ spiritualProfile: formData });
    onNext();
  };

  const spiritualGifts = [
    'Prophecy', 'Teaching', 'Evangelism', 'Pastoral Care', 'Administration',
    'Intercession', 'Worship', 'Healing', 'Discernment', 'Helps', 'Giving', 'Leadership'
  ];

  const callingAreas = [
    'Education', 'Technology', 'Business', 'Government', 'Healthcare',
    'Arts & Media', 'Missions', 'Social Justice', 'Environmental Stewardship', 'Family Ministry'
  ];

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Spiritual Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-2">Faith Background</label>
          <textarea
            required
            value={formData.faithBackground}
            onChange={(e) => setFormData({ ...formData, faithBackground: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none h-24"
            placeholder="Share your faith journey and current spiritual walk..."
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Spiritual Gifts (Select all that apply)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {spiritualGifts.map(gift => (
              <label key={gift} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.spiritualGifts.includes(gift)}
                  onChange={() => toggleArrayItem(formData.spiritualGifts, gift, (gifts) => 
                    setFormData({ ...formData, spiritualGifts: gifts })
                  )}
                  className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-white text-sm">{gift}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Areas of Calling (Select all that apply)</label>
          <div className="grid grid-cols-2 gap-3">
            {callingAreas.map(area => (
              <label key={area} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.callingAreas.includes(area)}
                  onChange={() => toggleArrayItem(formData.callingAreas, area, (areas) => 
                    setFormData({ ...formData, callingAreas: areas })
                  )}
                  className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-white text-sm">{area}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-semibold mb-2">Prayer Life</label>
            <select
              required
              value={formData.prayerLife}
              onChange={(e) => setFormData({ ...formData, prayerLife: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="" className="bg-gray-800">Select...</option>
              <option value="daily" className="bg-gray-800">Daily prayer time</option>
              <option value="regular" className="bg-gray-800">Regular but not daily</option>
              <option value="occasional" className="bg-gray-800">Occasional prayer</option>
              <option value="developing" className="bg-gray-800">Developing prayer life</option>
            </select>
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Scripture Engagement</label>
            <select
              required
              value={formData.scriptureEngagement}
              onChange={(e) => setFormData({ ...formData, scriptureEngagement: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="" className="bg-gray-800">Select...</option>
              <option value="daily" className="bg-gray-800">Daily Bible reading</option>
              <option value="weekly" className="bg-gray-800">Weekly Bible study</option>
              <option value="occasional" className="bg-gray-800">Occasional reading</option>
              <option value="new" className="bg-gray-800">New to Bible study</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center px-6 py-3 border border-white/30 text-white rounded-lg hover:border-white/50 transition-all duration-300"
          >
            <ChevronLeft className="mr-2 w-5 h-5" /> Previous
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center"
          >
            Continue <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

const CareerAspirationsStep: React.FC<OnboardingStepProps> = ({ onNext, onPrevious, onComplete, data }) => {
  const [formData, setFormData] = useState(data.careerAspirations || {
    missionTrack: '',
    careerGoals: [],
    kingdomImpactVision: '',
    timeCommitment: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ careerAspirations: formData });
    onNext();
  };

  const missionTracks = [
    { id: 'scrollfounder', name: 'ScrollFounder', description: 'Launch divine companies and startups' },
    { id: 'scrollambassador', name: 'ScrollAmbassador', description: 'Global diplomacy and peacebuilding' },
    { id: 'scrollpriest', name: 'ScrollPriest/ScrollScribe', description: 'Translate sacred texts and teach XR Bible' },
    { id: 'scrollengineer', name: 'ScrollEngineer', description: 'Build next-gen technology to bless communities' },
    { id: 'scrollscholar', name: 'ScrollScholar', description: 'Teach, write, and mentor across nations' },
    { id: 'scrollbuilder', name: 'ScrollBuilder', description: 'Deploy sacred infrastructure to nations' }
  ];

  const careerGoals = [
    'Start a kingdom business', 'Become a technology leader', 'Serve in government',
    'Lead educational institutions', 'Pioneer missions work', 'Develop AI systems',
    'Create media content', 'Build sustainable infrastructure', 'Advance scientific research',
    'Establish healthcare systems', 'Lead worship and arts', 'Develop economic systems'
  ];

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Career Aspirations</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-4">Mission Track</label>
          <div className="space-y-3">
            {missionTracks.map(track => (
              <label key={track.id} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300">
                <input
                  type="radio"
                  name="missionTrack"
                  value={track.id}
                  checked={formData.missionTrack === track.id}
                  onChange={(e) => setFormData({ ...formData, missionTrack: e.target.value })}
                  className="mt-1 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <div className="text-white font-semibold">{track.name}</div>
                  <div className="text-gray-300 text-sm">{track.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Career Goals (Select all that apply)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {careerGoals.map(goal => (
              <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.careerGoals.includes(goal)}
                  onChange={() => toggleArrayItem(formData.careerGoals, goal, (goals) => 
                    setFormData({ ...formData, careerGoals: goals })
                  )}
                  className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-white text-sm">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Kingdom Impact Vision</label>
          <textarea
            required
            value={formData.kingdomImpactVision}
            onChange={(e) => setFormData({ ...formData, kingdomImpactVision: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none h-32"
            placeholder="Describe how you envision using your education to impact the Kingdom of God and transform nations..."
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Time Commitment</label>
          <select
            required
            value={formData.timeCommitment}
            onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
          >
            <option value="" className="bg-gray-800">Select your availability...</option>
            <option value="full-time" className="bg-gray-800">Full-time (40+ hours/week)</option>
            <option value="part-time" className="bg-gray-800">Part-time (20-30 hours/week)</option>
            <option value="flexible" className="bg-gray-800">Flexible (10-20 hours/week)</option>
            <option value="minimal" className="bg-gray-800">Minimal (5-10 hours/week)</option>
          </select>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center px-6 py-3 border border-white/30 text-white rounded-lg hover:border-white/50 transition-all duration-300"
          >
            <ChevronLeft className="mr-2 w-5 h-5" /> Previous
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center"
          >
            Continue <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

const CompletionStep: React.FC<OnboardingStepProps> = ({ onPrevious, data }) => {
  const handleStartLearning = () => {
    // Navigate to dashboard or course selection
    console.log('Starting learning journey with data:', data);
  };

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-white">Welcome to Your Scroll Journey!</h2>
      <p className="text-xl text-gray-300 max-w-2xl mx-auto">
        Your onboarding is complete. You're now ready to begin your transformational education that will 
        prepare you to impact nations and advance the Kingdom of God.
      </p>
      
      <div className="bg-white/10 rounded-xl p-6 max-w-md mx-auto">
        <h3 className="text-xl font-bold text-white mb-4">Your Profile Summary</h3>
        <div className="space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-gray-300">Name:</span>
            <span className="text-white">{data.personalInfo?.firstName} {data.personalInfo?.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Mission Track:</span>
            <span className="text-white">{data.careerAspirations?.missionTrack || 'Not selected'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Language:</span>
            <span className="text-white">{data.personalInfo?.preferredLanguage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Commitment:</span>
            <span className="text-white">{data.careerAspirations?.timeCommitment}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Recommended Next Steps:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-900/50 rounded-lg p-4">
            <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h4 className="font-semibold text-white">Enroll in Launch Courses</h4>
            <p className="text-sm text-gray-300">Start with our foundational courses</p>
          </div>
          <div className="bg-blue-900/50 rounded-lg p-4">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="font-semibold text-white">Join Community</h4>
            <p className="text-sm text-gray-300">Connect with fellow students</p>
          </div>
          <div className="bg-green-900/50 rounded-lg p-4">
            <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="font-semibold text-white">Set Goals</h4>
            <p className="text-sm text-gray-300">Define your learning objectives</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="flex items-center px-6 py-3 border border-white/30 text-white rounded-lg hover:border-white/50 transition-all duration-300"
        >
          <ChevronLeft className="mr-2 w-5 h-5" /> Previous
        </button>
        <button
          onClick={handleStartLearning}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center"
        >
          Start Learning Journey <ChevronRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export const StudentOnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Introduction to ScrollUniversity',
      component: WelcomeStep
    },
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Basic personal details',
      component: PersonalInfoStep
    },
    {
      id: 'spiritual-profile',
      title: 'Spiritual Profile',
      description: 'Your faith journey and spiritual gifts',
      component: SpiritualProfileStep
    },
    {
      id: 'career-aspirations',
      title: 'Career Aspirations',
      description: 'Your mission track and kingdom impact vision',
      component: CareerAspirationsStep
    },
    {
      id: 'completion',
      title: 'Complete',
      description: 'Ready to begin your journey',
      component: CompletionStep
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (stepData: any) => {
    setOnboardingData({ ...onboardingData, ...stepData });
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-white/20 text-gray-400'
                }`}>
                  {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index < currentStep ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{steps[currentStep].title}</h1>
            <p className="text-gray-300">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <CurrentStepComponent
            onNext={handleNext}
            onPrevious={handlePrevious}
            onComplete={handleComplete}
            data={onboardingData}
          />
        </div>
      </div>
    </div>
  );
};