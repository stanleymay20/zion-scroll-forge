import React, { useState } from 'react';
import { DivineScoreCard } from './DivineScorecard';
import { PropheticCheckins } from './PropheticCheckins';
import { IntercessionPrayer } from './IntercessionPrayer';
import { SpiritualGrowthReportComponent } from './SpiritualGrowthReport';

interface SpiritualFormationDashboardProps {
  userId: string;
}

export const SpiritualFormationDashboard: React.FC<SpiritualFormationDashboardProps> = ({ userId }) => {
  const [activeComponent, setActiveComponent] = useState<'scorecard' | 'checkins' | 'prayer' | 'reports'>('scorecard');

  const components = [
    {
      id: 'scorecard',
      name: 'Divine Scorecard',
      description: 'Track your purpose, skills, and spiritual alignment',
      icon: '📊',
      component: <DivineScoreCard userId={userId} />
    },
    {
      id: 'checkins',
      name: 'Prophetic Check-ins',
      description: 'Daily spiritual reflection and vision board',
      icon: '📝',
      component: <PropheticCheckins userId={userId} />
    },
    {
      id: 'prayer',
      name: 'Intercession & Prayer',
      description: 'Prayer requests and intercession prompts',
      icon: '🙏',
      component: <IntercessionPrayer userId={userId} />
    },
    {
      id: 'reports',
      name: 'Growth Reports',
      description: 'Comprehensive spiritual growth analysis',
      icon: '📈',
      component: <SpiritualGrowthReportComponent userId={userId} />
    }
  ];

  const activeComponentData = components.find(c => c.id === activeComponent);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Spiritual Formation</h1>
                <p className="mt-1 text-gray-600">
                  Comprehensive spiritual growth tracking and development platform
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  ScrollUniversity Platform
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Spiritual Formation Tools</h2>
              <nav className="space-y-2">
                {components.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => setActiveComponent(component.id as any)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      activeComponent === component.id
                        ? 'bg-blue-50 border-blue-200 border text-blue-900'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{component.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{component.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {component.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overall Progress</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prayer Consistency</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Scripture Study</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Kingdom Impact</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="text-sm font-medium">70%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spiritual Formation Principles */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Formation Principles</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-blue-900">Purpose-Driven Growth</div>
                    <div className="text-blue-700">Align your development with divine calling</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-green-900">Prophetic Integration</div>
                    <div className="text-green-700">Incorporate spiritual discernment in learning</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-purple-900">Kingdom Impact</div>
                    <div className="text-purple-700">Focus on eternal significance</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-yellow-900">Character Formation</div>
                    <div className="text-yellow-700">Develop Christ-like character</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Component Header */}
              <div className="border-b px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{activeComponentData?.icon}</div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {activeComponentData?.name}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {activeComponentData?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Component Content */}
              <div className="p-6">
                {activeComponentData?.component}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              ScrollUniversity Spiritual Formation Platform
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Powered by AI + Prophetic Intelligence</span>
              <span>•</span>
              <span>Kingdom-Focused Education</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};