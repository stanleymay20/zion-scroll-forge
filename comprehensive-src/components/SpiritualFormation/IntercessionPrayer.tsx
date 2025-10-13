import React, { useState, useEffect } from 'react';
import { PrayerRequest, IntercessionPrompt, IntercessionSession, PrayerTestimony } from '../../types/spiritual-formation';
import { intercessionPrayerService } from '../../services/IntercessionPrayerService';

interface IntercessionPrayerProps {
  userId: string;
}

export const IntercessionPrayer: React.FC<IntercessionPrayerProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'prompts' | 'requests' | 'sessions' | 'create'>('prompts');
  const [dailyPrompts, setDailyPrompts] = useState<IntercessionPrompt[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [publicRequests, setPublicRequests] = useState<PrayerRequest[]>([]);
  const [sessions, setSessions] = useState<IntercessionSession[]>([]);
  const [currentSession, setCurrentSession] = useState<IntercessionSession | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const [prompts, userRequests, publicReqs, userSessions, prayerAnalytics] = await Promise.all([
        intercessionPrayerService.generateDailyIntercessionPrompts(userId),
        intercessionPrayerService.getUserPrayerRequests(userId),
        intercessionPrayerService.getPublicPrayerRequests(undefined, undefined, 20),
        intercessionPrayerService.getUserIntercessionSessions(userId, 10),
        intercessionPrayerService.getPrayerAnalytics(userId, 30)
      ]);

      setDailyPrompts(prompts);
      setPrayerRequests(userRequests);
      setPublicRequests(publicReqs);
      setSessions(userSessions);
      setAnalytics(prayerAnalytics);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrayerRequest = async (requestData: Omit<PrayerRequest, 'id' | 'userId' | 'prayerCount' | 'testimonies' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRequest = await intercessionPrayerService.createPrayerRequest(userId, requestData);
      setPrayerRequests([newRequest, ...prayerRequests]);
      if (newRequest.isPublic) {
        setPublicRequests([newRequest, ...publicRequests]);
      }
    } catch (error) {
      console.error('Error creating prayer request:', error);
    }
  };

  const handlePrayForRequest = async (requestId: string) => {
    try {
      const updatedRequest = await intercessionPrayerService.prayForRequest(requestId, userId);
      
      // Update public requests
      setPublicRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
      
      // Update user requests if it's their own
      setPrayerRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
    } catch (error) {
      console.error('Error praying for request:', error);
    }
  };

  const handleStartSession = async (selectedPrompts: IntercessionPrompt[], selectedRequests: PrayerRequest[]) => {
    try {
      const session = await intercessionPrayerService.startIntercessionSession(userId, selectedPrompts, selectedRequests);
      setCurrentSession(session);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleEndSession = async (notes: string, insights: string[], propheticWords: any[]) => {
    if (!currentSession) return;

    try {
      const completedSession = await intercessionPrayerService.endIntercessionSession(
        userId, 
        currentSession.id, 
        notes, 
        insights, 
        propheticWords
      );
      setSessions([completedSession, ...sessions]);
      setCurrentSession(null);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleAddTestimony = async (requestId: string, testimony: Omit<PrayerTestimony, 'id'>) => {
    try {
      const updatedRequest = await intercessionPrayerService.addPrayerTestimony(requestId, testimony);
      
      // Update relevant arrays
      setPrayerRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
      setPublicRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
    } catch (error) {
      console.error('Error adding testimony:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'personal': 'bg-blue-100 text-blue-800',
      'family': 'bg-green-100 text-green-800',
      'church': 'bg-purple-100 text-purple-800',
      'community': 'bg-yellow-100 text-yellow-800',
      'nation': 'bg-red-100 text-red-800',
      'global': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: { [key: string]: string } = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Intercession & Prayer</h1>
        <p className="text-gray-600">Join the global prayer movement and intercede for others</p>
        
        {/* Analytics Summary */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalPrayerRequests}</div>
              <div className="text-sm text-blue-800">Your Requests</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.prayersOffered}</div>
              <div className="text-sm text-green-800">Prayers Offered</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analytics.totalIntercessionTime}</div>
              <div className="text-sm text-purple-800">Minutes Prayed</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{analytics.answeredPrayerRequests}</div>
              <div className="text-sm text-yellow-800">Answered Prayers</div>
            </div>
          </div>
        )}
      </div>

      {/* Current Session Modal */}
      {currentSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Intercession Session</h2>
            <p className="text-gray-600 mb-4">Started: {currentSession.startTime.toLocaleTimeString()}</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Prayer Prompts</h3>
                <div className="space-y-2">
                  {currentSession.prompts.map((prompt) => (
                    <div key={prompt.id} className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium">{prompt.title}</h4>
                      <p className="text-sm text-gray-600">{prompt.description}</p>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Prayer Points:</p>
                        <ul className="text-sm text-gray-600 ml-4">
                          {prompt.prayerPoints.map((point, index) => (
                            <li key={index} className="list-disc">{point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Prayer Requests</h3>
                <div className="space-y-2">
                  {currentSession.prayerRequests.map((request) => (
                    <div key={request.id} className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium">{request.title}</h4>
                      <p className="text-sm text-gray-600">{request.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const notes = formData.get('notes') as string;
              const insights = (formData.get('insights') as string).split('\n').filter(i => i.trim());
              handleEndSession(notes, insights, []);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Session Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Notes about your prayer session..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Spiritual Insights</label>
                  <textarea
                    name="insights"
                    placeholder="Spiritual insights received (one per line)"
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    End Session
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentSession(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 overflow-x-auto">
        {(['prompts', 'requests', 'sessions', 'create'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab === 'create' ? 'Create Request' : tab}
          </button>
        ))}
      </div>

      {/* Prayer Prompts Tab */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daily Prayer Prompts</h2>
            <button
              onClick={() => {
                const selectedPrompts = dailyPrompts.slice(0, 2); // Select first 2 prompts
                const selectedRequests = publicRequests.slice(0, 3); // Select first 3 public requests
                handleStartSession(selectedPrompts, selectedRequests);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start Prayer Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyPrompts.map((prompt) => (
              <div key={prompt.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{prompt.title}</h3>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(prompt.category)}`}>
                      {prompt.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getUrgencyColor(prompt.urgency)}`}>
                      {prompt.urgency}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{prompt.description}</p>
                
                {prompt.scriptureReference && (
                  <p className="text-blue-600 text-sm mb-3 font-medium">
                    Scripture: {prompt.scriptureReference}
                  </p>
                )}

                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-1">Prayer Points:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {prompt.prayerPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Duration: {prompt.duration} min</span>
                  <span>Frequency: {prompt.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prayer Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Prayer Requests */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Prayer Requests</h2>
              <div className="space-y-3">
                {prayerRequests.map((request) => (
                  <div key={request.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{request.title}</h3>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(request.category)}`}>
                          {request.category}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.status === 'answered' ? 'bg-green-100 text-green-800' :
                          request.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{request.prayerCount} prayers</span>
                      <span>{request.createdAt.toLocaleDateString()}</span>
                    </div>
                    {request.testimonies.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium text-sm mb-2">Testimonies:</h4>
                        {request.testimonies.map((testimony) => (
                          <div key={testimony.id} className="text-sm text-green-600 mb-1">
                            {testimony.testimony}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Public Prayer Requests */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Community Prayer Requests</h2>
              <div className="space-y-3">
                {publicRequests.map((request) => (
                  <div key={request.id} className="bg-white border p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{request.title}</h3>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(request.category)}`}>
                          {request.category}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {request.isAnonymous ? request.description : request.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{request.prayerCount} prayers</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePrayForRequest(request.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Pray
                        </button>
                        <button
                          onClick={() => {
                            const testimony = prompt('Share a testimony or update:');
                            if (testimony) {
                              handleAddTestimony(request.id, {
                                prayerRequestId: request.id,
                                userId,
                                testimony,
                                category: 'partial_answer',
                                date: new Date(),
                                verified: false
                              });
                            }
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Testimony
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Recent Prayer Sessions</h2>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">Prayer Session</h3>
                    <p className="text-sm text-gray-600">
                      {session.startTime.toLocaleDateString()} • {session.duration} minutes
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {session.prompts.length} prompts • {session.prayerRequests.length} requests
                  </div>
                </div>

                {session.notes && (
                  <div className="mb-3">
                    <h4 className="font-medium text-sm mb-1">Notes:</h4>
                    <p className="text-sm text-gray-600">{session.notes}</p>
                  </div>
                )}

                {session.spiritualInsights.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium text-sm mb-1">Spiritual Insights:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {session.spiritualInsights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Started: {session.startTime.toLocaleTimeString()}</span>
                  {session.endTime && <span>Ended: {session.endTime.toLocaleTimeString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Request Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Create Prayer Request</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const requestData = {
                requesterId: userId,
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                category: formData.get('category') as any,
                urgency: formData.get('urgency') as any,
                isPublic: formData.get('isPublic') === 'on',
                isAnonymous: formData.get('isAnonymous') === 'on',
                status: 'active' as const
              };
              handleCreatePrayerRequest(requestData);
              (e.target as HTMLFormElement).reset();
              setActiveTab('requests');
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    name="title"
                    type="text"
                    placeholder="Brief title for your prayer request"
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    placeholder="Detailed description of your prayer request..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select name="category" className="w-full p-3 border rounded-lg" required>
                      <option value="">Select category</option>
                      <option value="healing">Healing</option>
                      <option value="provision">Provision</option>
                      <option value="guidance">Guidance</option>
                      <option value="protection">Protection</option>
                      <option value="salvation">Salvation</option>
                      <option value="breakthrough">Breakthrough</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Urgency</label>
                    <select name="urgency" className="w-full p-3 border rounded-lg" required>
                      <option value="">Select urgency</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      name="isPublic"
                      type="checkbox"
                      className="mr-2"
                    />
                    <span className="text-sm">Make this request public (others can pray for it)</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      name="isAnonymous"
                      type="checkbox"
                      className="mr-2"
                    />
                    <span className="text-sm">Keep my identity anonymous</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Prayer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};