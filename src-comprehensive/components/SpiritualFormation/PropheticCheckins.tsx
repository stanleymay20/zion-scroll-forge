import React, { useState, useEffect } from 'react';
import { PropheticCheckin, JournalEntry, SpiritualTemperature, PropheticWord, ActionItem, VisionBoardEntry } from '../../types/spiritual-formation';
import { propheticCheckinsService } from '../../services/PropheticCheckinsService';

interface PropheticCheckinsProps {
  userId: string;
}

export const PropheticCheckins: React.FC<PropheticCheckinsProps> = ({ userId }) => {
  const [checkins, setCheckins] = useState<PropheticCheckin[]>([]);
  const [currentCheckin, setCurrentCheckin] = useState<PropheticCheckin | null>(null);
  const [visionBoards, setVisionBoards] = useState<VisionBoardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'journal' | 'temperature' | 'prophetic' | 'actions' | 'vision'>('journal');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const [userCheckins, userVisionBoards, checkinAnalytics] = await Promise.all([
        propheticCheckinsService.getUserCheckins(userId, 10),
        propheticCheckinsService.getUserVisionBoards(userId),
        propheticCheckinsService.getCheckinAnalytics(userId, 30)
      ]);

      setCheckins(userCheckins);
      setVisionBoards(userVisionBoards);
      setAnalytics(checkinAnalytics);

      // Set current checkin to today's or create new one
      const today = new Date().toDateString();
      const todayCheckin = userCheckins.find(c => c.date.toDateString() === today);

      if (todayCheckin) {
        setCurrentCheckin(todayCheckin);
      } else {
        const newCheckin = await propheticCheckinsService.createPropheticCheckin(userId, 'daily');
        setCurrentCheckin(newCheckin);
        setCheckins([newCheckin, ...userCheckins]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJournalUpdate = async (journalData: Partial<JournalEntry>) => {
    if (!currentCheckin) return;

    try {
      const updatedCheckin = await propheticCheckinsService.updateJournalEntry(
        userId,
        currentCheckin.id,
        journalData
      );
      setCurrentCheckin(updatedCheckin);
      updateCheckinsArray(updatedCheckin);
    } catch (error) {
      console.error('Error updating journal:', error);
    }
  };

  const handleTemperatureUpdate = async (temperature: Partial<SpiritualTemperature>) => {
    if (!currentCheckin) return;

    try {
      const updatedCheckin = await propheticCheckinsService.updateSpiritualTemperature(
        userId,
        currentCheckin.id,
        temperature
      );
      setCurrentCheckin(updatedCheckin);
      updateCheckinsArray(updatedCheckin);
    } catch (error) {
      console.error('Error updating temperature:', error);
    }
  };

  const handleAddPropheticWord = async (word: Omit<PropheticWord, 'id'>) => {
    if (!currentCheckin) return;

    try {
      const updatedCheckin = await propheticCheckinsService.addPropheticWord(
        userId,
        currentCheckin.id,
        word
      );
      setCurrentCheckin(updatedCheckin);
      updateCheckinsArray(updatedCheckin);
    } catch (error) {
      console.error('Error adding prophetic word:', error);
    }
  };

  const handleAddActionItem = async (actionItem: Omit<ActionItem, 'id'>) => {
    if (!currentCheckin) return;

    try {
      const updatedCheckin = await propheticCheckinsService.addActionItem(
        userId,
        currentCheckin.id,
        actionItem
      );
      setCurrentCheckin(updatedCheckin);
      updateCheckinsArray(updatedCheckin);
    } catch (error) {
      console.error('Error adding action item:', error);
    }
  };

  const handleCompleteActionItem = async (actionItemId: string) => {
    if (!currentCheckin) return;

    try {
      const updatedCheckin = await propheticCheckinsService.completeActionItem(
        userId,
        currentCheckin.id,
        actionItemId
      );
      setCurrentCheckin(updatedCheckin);
      updateCheckinsArray(updatedCheckin);
    } catch (error) {
      console.error('Error completing action item:', error);
    }
  };

  const handleCreateVisionBoard = async (title: string, description: string) => {
    try {
      const newVisionBoard = await propheticCheckinsService.createVisionBoard(userId, title, description);
      setVisionBoards([newVisionBoard, ...visionBoards]);
    } catch (error) {
      console.error('Error creating vision board:', error);
    }
  };

  const updateCheckinsArray = (updatedCheckin: PropheticCheckin) => {
    setCheckins(prev => prev.map(c => c.id === updatedCheckin.id ? updatedCheckin : c));
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 8) return 'text-green-600';
    if (temp >= 6) return 'text-yellow-600';
    if (temp >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTemperatureBarColor = (temp: number) => {
    if (temp >= 8) return 'bg-green-500';
    if (temp >= 6) return 'bg-yellow-500';
    if (temp >= 4) return 'bg-orange-500';
    return 'bg-red-500';
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prophetic Check-ins</h1>
        <p className="text-gray-600">Daily spiritual reflection and growth tracking</p>

        {/* Analytics Summary */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalCheckins}</div>
              <div className="text-sm text-blue-800">Total Check-ins</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.averageSpiritualTemperature.toFixed(1)}</div>
              <div className="text-sm text-green-800">Avg Temperature</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analytics.completedActionItems}</div>
              <div className="text-sm text-purple-800">Actions Completed</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{analytics.propheticWordsReceived}</div>
              <div className="text-sm text-yellow-800">Prophetic Words</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 overflow-x-auto">
        {(['journal', 'temperature', 'prophetic', 'actions', 'vision'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap ${activeTab === tab
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {tab === 'prophetic' ? 'Prophetic Words' : tab}
          </button>
        ))}
      </div>

      {/* Journal Tab */}
      {activeTab === 'journal' && currentCheckin && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Today's Journal Entry</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Main Content</label>
                <textarea
                  value={currentCheckin.journalEntry.content}
                  onChange={(e) => handleJournalUpdate({ content: e.target.value })}
                  placeholder="Write about your spiritual journey today..."
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mood</label>
                  <select
                    value={currentCheckin.journalEntry.mood}
                    onChange={(e) => handleJournalUpdate({ mood: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select mood</option>
                    <option value="joyful">Joyful</option>
                    <option value="peaceful">Peaceful</option>
                    <option value="grateful">Grateful</option>
                    <option value="hopeful">Hopeful</option>
                    <option value="contemplative">Contemplative</option>
                    <option value="challenged">Challenged</option>
                    <option value="weary">Weary</option>
                    <option value="anxious">Anxious</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Spiritual Insights</label>
                  <textarea
                    value={currentCheckin.journalEntry.spiritualInsights.join('\n')}
                    onChange={(e) => handleJournalUpdate({ spiritualInsights: e.target.value.split('\n').filter(i => i.trim()) })}
                    placeholder="Key spiritual insights (one per line)"
                    className="w-full p-2 border rounded resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Challenges</label>
                  <textarea
                    value={currentCheckin.journalEntry.challenges.join('\n')}
                    onChange={(e) => handleJournalUpdate({ challenges: e.target.value.split('\n').filter(i => i.trim()) })}
                    placeholder="Challenges faced (one per line)"
                    className="w-full p-2 border rounded resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Victories</label>
                  <textarea
                    value={currentCheckin.journalEntry.victories.join('\n')}
                    onChange={(e) => handleJournalUpdate({ victories: e.target.value.split('\n').filter(i => i.trim()) })}
                    placeholder="Victories and breakthroughs (one per line)"
                    className="w-full p-2 border rounded resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gratitude</label>
                  <textarea
                    value={currentCheckin.journalEntry.gratitude.join('\n')}
                    onChange={(e) => handleJournalUpdate({ gratitude: e.target.value.split('\n').filter(i => i.trim()) })}
                    placeholder="Things you're grateful for (one per line)"
                    className="w-full p-2 border rounded resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prayer Requests</label>
                <textarea
                  value={currentCheckin.journalEntry.prayerRequests.join('\n')}
                  onChange={(e) => handleJournalUpdate({ prayerRequests: e.target.value.split('\n').filter(i => i.trim()) })}
                  placeholder="Prayer requests (one per line)"
                  className="w-full p-2 border rounded resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spiritual Temperature Tab */}
      {activeTab === 'temperature' && currentCheckin && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Spiritual Temperature Check</h3>
            <p className="text-gray-600 mb-6">Rate each area from 1-10 (1 = Very Low, 10 = Excellent)</p>

            <div className="space-y-4">
              {[
                { key: 'prayerLife', label: 'Prayer Life' },
                { key: 'wordStudy', label: 'Word Study' },
                { key: 'worship', label: 'Worship' },
                { key: 'fellowship', label: 'Fellowship' },
                { key: 'service', label: 'Service' },
                { key: 'evangelism', label: 'Evangelism' },
                { key: 'discipleship', label: 'Discipleship' }
              ].map(({ key, label }) => {
                const value = currentCheckin.spiritualTemperature[key as keyof SpiritualTemperature] as number;
                return (
                  <div key={key} className="flex items-center space-x-4">
                    <div className="w-32 text-sm font-medium">{label}</div>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={value}
                        onChange={(e) => handleTemperatureUpdate({ [key]: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div className={`w-12 text-center font-bold ${getTemperatureColor(value)}`}>
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overall Temperature</span>
                <span className={`text-xl font-bold ${getTemperatureColor(currentCheckin.spiritualTemperature.overall)}`}>
                  {currentCheckin.spiritualTemperature.overall.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getTemperatureBarColor(currentCheckin.spiritualTemperature.overall)}`}
                  style={{ width: `${(currentCheckin.spiritualTemperature.overall / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={currentCheckin.spiritualTemperature.notes}
                onChange={(e) => handleTemperatureUpdate({ notes: e.target.value })}
                placeholder="Additional notes about your spiritual temperature..."
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Prophetic Words Tab */}
      {activeTab === 'prophetic' && currentCheckin && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Prophetic Words</h3>

            {/* Existing Prophetic Words */}
            <div className="space-y-3 mb-6">
              {currentCheckin.propheticWords.map((word) => (
                <div key={word.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">Source: {word.source}</span>
                        <span className={`px-2 py-1 rounded text-xs ${word.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                          word.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            word.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {word.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${word.category === 'encouragement' ? 'bg-green-100 text-green-800' :
                          word.category === 'warning' ? 'bg-red-100 text-red-800' :
                            word.category === 'calling' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                          }`}>
                          {word.category}
                        </span>
                      </div>
                      <p className="text-gray-700">{word.content}</p>
                      <p className="text-sm text-gray-500 mt-1">{word.date.toLocaleDateString()}</p>
                      {word.fulfillmentNotes && (
                        <p className="text-sm text-green-600 mt-2">Fulfillment: {word.fulfillmentNotes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Prophetic Word */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-3">Add New Prophetic Word</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const word: Omit<PropheticWord, 'id'> = {
                  source: formData.get('source') as string,
                  content: formData.get('content') as string,
                  date: new Date(),
                  category: formData.get('category') as any,
                  status: 'received'
                };
                handleAddPropheticWord(word);
                (e.target as HTMLFormElement).reset();
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    name="source"
                    type="text"
                    placeholder="Source (e.g., Pastor John, Prayer time)"
                    className="p-2 border rounded"
                    required
                  />
                  <select name="category" className="p-2 border rounded" required>
                    <option value="">Select category</option>
                    <option value="personal">Personal</option>
                    <option value="ministry">Ministry</option>
                    <option value="calling">Calling</option>
                    <option value="warning">Warning</option>
                    <option value="encouragement">Encouragement</option>
                  </select>
                </div>
                <textarea
                  name="content"
                  placeholder="Prophetic word content..."
                  className="w-full p-3 border rounded resize-none mb-3"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Prophetic Word
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Action Items Tab */}
      {activeTab === 'actions' && currentCheckin && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Action Items</h3>

            {/* Existing Action Items */}
            <div className="space-y-3 mb-6">
              {currentCheckin.actionItems.map((item) => (
                <div key={item.id} className={`p-4 rounded-lg border ${item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
                          {item.title}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs ${item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {item.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${item.category === 'spiritual' ? 'bg-purple-100 text-purple-800' :
                          item.category === 'academic' ? 'bg-blue-100 text-blue-800' :
                            item.category === 'practical' ? 'bg-green-100 text-green-800' :
                              'bg-pink-100 text-pink-800'
                          }`}>
                          {item.category}
                        </span>
                      </div>
                      <p className={`text-gray-600 text-sm ${item.completed ? 'line-through' : ''}`}>
                        {item.description}
                      </p>
                      {item.deadline && (
                        <p className="text-sm text-gray-500 mt-1">
                          Due: {item.deadline.toLocaleDateString()}
                        </p>
                      )}
                      {item.completed && item.completedAt && (
                        <p className="text-sm text-green-600 mt-1">
                          Completed: {item.completedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {!item.completed && (
                      <button
                        onClick={() => handleCompleteActionItem(item.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Action Item */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-3">Add New Action Item</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const actionItem: Omit<ActionItem, 'id'> = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  category: formData.get('category') as any,
                  priority: formData.get('priority') as any,
                  deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string) : undefined,
                  completed: false
                };
                handleAddActionItem(actionItem);
                (e.target as HTMLFormElement).reset();
              }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input
                    name="title"
                    type="text"
                    placeholder="Action item title"
                    className="p-2 border rounded"
                    required
                  />
                  <select name="category" className="p-2 border rounded" required>
                    <option value="">Select category</option>
                    <option value="spiritual">Spiritual</option>
                    <option value="academic">Academic</option>
                    <option value="practical">Practical</option>
                    <option value="relational">Relational</option>
                  </select>
                  <select name="priority" className="p-2 border rounded" required>
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <textarea
                  name="description"
                  placeholder="Description..."
                  className="w-full p-2 border rounded resize-none mb-3"
                  rows={2}
                  required
                />
                <div className="flex items-center space-x-3">
                  <input
                    name="deadline"
                    type="date"
                    className="p-2 border rounded"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Action Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Vision Board Tab */}
      {activeTab === 'vision' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Vision Boards</h3>

            {/* Existing Vision Boards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {visionBoards.map((board) => (
                <div key={board.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{board.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${board.status === 'achieved' ? 'bg-green-100 text-green-800' :
                      board.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        board.status === 'revised' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {board.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{board.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Images:</span>
                      <span>{board.images.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scriptures:</span>
                      <span>{board.scriptures.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goals:</span>
                      <span>{board.goals.length}</span>
                    </div>
                  </div>

                  {board.deadline && (
                    <p className="text-sm text-gray-500 mt-2">
                      Target: {board.deadline.toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Create New Vision Board */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-3">Create New Vision Board</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const title = formData.get('title') as string;
                const description = formData.get('description') as string;
                handleCreateVisionBoard(title, description);
                (e.target as HTMLFormElement).reset();
              }}>
                <div className="space-y-3">
                  <input
                    name="title"
                    type="text"
                    placeholder="Vision board title"
                    className="w-full p-2 border rounded"
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Description of your vision..."
                    className="w-full p-2 border rounded resize-none"
                    rows={3}
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create Vision Board
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recent Check-ins History */}
      <div className="mt-8">
        <h3 className="font-semibold mb-4">Recent Check-ins</h3>
        <div className="space-y-2">
          {checkins.slice(1, 6).map((checkin) => (
            <div key={checkin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{checkin.date.toLocaleDateString()}</span>
                <span className="ml-2 text-sm text-gray-600">({checkin.type})</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span>Temp: {checkin.spiritualTemperature.overall.toFixed(1)}</span>
                <span>Actions: {checkin.actionItems.filter(a => a.completed).length}/{checkin.actionItems.length}</span>
                <span>Words: {checkin.propheticWords.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};