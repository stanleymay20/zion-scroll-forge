import React, { useState, useEffect } from 'react';
import { DivineScorecard, PurposeMilestone, DivineAssignment, Skill } from '../../types/spiritual-formation';
import { divineScoreCardService } from '../../services/DivineScoreCardService';

interface DivineScoreCardProps {
  userId: string;
}

export const DivineScoreCard: React.FC<DivineScoreCardProps> = ({ userId }) => {
  const [scorecard, setScorecard] = useState<DivineScorecard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'purpose' | 'skills' | 'alignment'>('purpose');
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', targetDate: '', impact: '' });
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', source: 'prayer' as const, deadline: '' });

  useEffect(() => {
    loadScorecard();
  }, [userId]);

  const loadScorecard = async () => {
    try {
      let userScorecard = await divineScoreCardService.getDivineScorecard(userId);
      if (!userScorecard) {
        userScorecard = await divineScoreCardService.createDivineScorecard(userId);
      }
      setScorecard(userScorecard);
    } catch (error) {
      console.error('Error loading scorecard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!scorecard || !newMilestone.title || !newMilestone.targetDate) return;

    try {
      const milestone: Omit<PurposeMilestone, 'id'> = {
        title: newMilestone.title,
        description: newMilestone.description,
        targetDate: new Date(newMilestone.targetDate),
        completed: false,
        impact: newMilestone.impact
      };

      const updatedScorecard = await divineScoreCardService.addPurposeMilestone(userId, milestone);
      setScorecard(updatedScorecard);
      setNewMilestone({ title: '', description: '', targetDate: '', impact: '' });
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string, impact: string) => {
    if (!scorecard) return;

    try {
      const updatedScorecard = await divineScoreCardService.completePurposeMilestone(userId, milestoneId, impact);
      setScorecard(updatedScorecard);
    } catch (error) {
      console.error('Error completing milestone:', error);
    }
  };

  const handleAddAssignment = async () => {
    if (!scorecard || !newAssignment.title) return;

    try {
      const assignment: Omit<DivineAssignment, 'id'> = {
        title: newAssignment.title,
        description: newAssignment.description,
        source: newAssignment.source,
        status: 'received',
        deadline: newAssignment.deadline ? new Date(newAssignment.deadline) : undefined,
        progress: 0
      };

      const updatedScorecard = await divineScoreCardService.addDivineAssignment(userId, assignment);
      setScorecard(updatedScorecard);
      setNewAssignment({ title: '', description: '', source: 'prayer', deadline: '' });
    } catch (error) {
      console.error('Error adding assignment:', error);
    }
  };

  const handleUpdateCallingStatement = async (callingStatement: string) => {
    if (!scorecard) return;

    try {
      const updatedScorecard = await divineScoreCardService.updateCallingStatement(userId, callingStatement);
      setScorecard(updatedScorecard);
    } catch (error) {
      console.error('Error updating calling statement:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load Divine Scorecard</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Divine Scorecard</h1>
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold">
            Overall Score: <span className={getScoreColor(scorecard.overallScore)}>{scorecard.overallScore}/100</span>
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${getProgressBarColor(scorecard.overallScore)}`}
              style={{ width: `${scorecard.overallScore}%` }}
            ></div>
          </div>
        </div>
        <p className="text-gray-600 mt-2">Last updated: {scorecard.lastUpdated.toLocaleDateString()}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6">
        {(['purpose', 'skills', 'alignment'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Purpose Tab */}
      {activeTab === 'purpose' && (
        <div className="space-y-6">
          {/* Purpose Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Clarity</h3>
              <div className={`text-2xl font-bold ${getScoreColor(scorecard.purpose.clarity)}`}>
                {scorecard.purpose.clarity}%
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Alignment</h3>
              <div className={`text-2xl font-bold ${getScoreColor(scorecard.purpose.alignment)}`}>
                {scorecard.purpose.alignment}%
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Progress</h3>
              <div className={`text-2xl font-bold ${getScoreColor(scorecard.purpose.progress)}`}>
                {scorecard.purpose.progress}%
              </div>
            </div>
          </div>

          {/* Calling Statement */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Calling Statement</h3>
            <textarea
              value={scorecard.purpose.callingStatement}
              onChange={(e) => handleUpdateCallingStatement(e.target.value)}
              placeholder="Write your divine calling statement here..."
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Milestones */}
          <div>
            <h3 className="font-semibold mb-4">Purpose Milestones</h3>
            <div className="space-y-3 mb-4">
              {scorecard.purpose.milestones.map((milestone) => (
                <div key={milestone.id} className={`p-4 rounded-lg border ${milestone.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <p className="text-gray-600 text-sm">{milestone.description}</p>
                      <p className="text-sm text-gray-500">Target: {milestone.targetDate.toLocaleDateString()}</p>
                      {milestone.completed && milestone.impact && (
                        <p className="text-sm text-green-600 mt-1">Impact: {milestone.impact}</p>
                      )}
                    </div>
                    {!milestone.completed && (
                      <button
                        onClick={() => {
                          const impact = prompt('Describe the impact of completing this milestone:');
                          if (impact) handleCompleteMilestone(milestone.id, impact);
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Milestone */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Add New Milestone</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Milestone title"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                  className="p-2 border rounded"
                />
              </div>
              <textarea
                placeholder="Description"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                className="w-full p-2 border rounded mt-3"
                rows={2}
              />
              <button
                onClick={handleAddMilestone}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Milestone
              </button>
            </div>
          </div>

          {/* Divine Assignments */}
          <div>
            <h3 className="font-semibold mb-4">Divine Assignments</h3>
            <div className="space-y-3 mb-4">
              {scorecard.purpose.divineAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 bg-white border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{assignment.title}</h4>
                      <p className="text-gray-600 text-sm">{assignment.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Source: {assignment.source}</span>
                        <span>Status: {assignment.status}</span>
                        {assignment.deadline && <span>Due: {assignment.deadline.toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm">{assignment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${assignment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Assignment */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Add New Divine Assignment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Assignment title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="p-2 border rounded"
                />
                <select
                  value={newAssignment.source}
                  onChange={(e) => setNewAssignment({ ...newAssignment, source: e.target.value as any })}
                  className="p-2 border rounded"
                >
                  <option value="prayer">Prayer</option>
                  <option value="prophecy">Prophecy</option>
                  <option value="scripture">Scripture</option>
                  <option value="mentor">Mentor</option>
                  <option value="vision">Vision</option>
                </select>
              </div>
              <textarea
                placeholder="Description"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                className="w-full p-2 border rounded mt-3"
                rows={2}
              />
              <input
                type="date"
                placeholder="Deadline (optional)"
                value={newAssignment.deadline}
                onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                className="w-full p-2 border rounded mt-3"
              />
              <button
                onClick={handleAddAssignment}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Academic', category: scorecard.skills.academicSkills },
              { name: 'Spiritual', category: scorecard.skills.spiritualSkills },
              { name: 'Practical', category: scorecard.skills.practicalSkills },
              { name: 'Leadership', category: scorecard.skills.leadershipSkills }
            ].map(({ name, category }) => (
              <div key={name} className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{name} Skills</h3>
                <div className={`text-xl font-bold ${getScoreColor(category.averageLevel * 10)}`}>
                  {(category.averageLevel * 10).toFixed(0)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressBarColor(category.averageLevel * 10)}`}
                    style={{ width: `${category.averageLevel * 10}%` }}
                  ></div>
                </div>
                <div className="mt-3 space-y-2">
                  {category.skills.slice(0, 3).map((skill) => (
                    <div key={skill.id} className="text-sm">
                      <div className="flex justify-between">
                        <span>{skill.name}</span>
                        <span>{skill.currentLevel}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Overall Skills Progress</h3>
            <div className={`text-2xl font-bold ${getScoreColor(scorecard.skills.overallProgress)}`}>
              {scorecard.skills.overallProgress.toFixed(0)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div 
                className={`h-3 rounded-full ${getProgressBarColor(scorecard.skills.overallProgress)}`}
                style={{ width: `${scorecard.skills.overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Alignment Tab */}
      {activeTab === 'alignment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Scroll Alignment</h3>
              <div className={`text-2xl font-bold ${getScoreColor(scorecard.alignment.scrollAlignment)}`}>
                {scorecard.alignment.scrollAlignment}%
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Biblical Alignment</h3>
              <div className={`text-2xl font-bold ${getScoreColor(scorecard.alignment.biblicalAlignment)}`}>
                {scorecard.alignment.biblicalAlignment}%
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Kingdom Alignment</h3>
              <div className={`text-2xl font-bold ${getScoreColor(scorecard.alignment.kingdomAlignment)}`}>
                {scorecard.alignment.kingdomAlignment}%
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900">Character Alignment</h3>
              <div className={`text-2xl font-bold ${getScoreColor(scorecard.alignment.characterAlignment)}`}>
                {scorecard.alignment.characterAlignment}%
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Overall Alignment</h3>
            <div className={`text-2xl font-bold ${getScoreColor(scorecard.alignment.overallAlignment)}`}>
              {scorecard.alignment.overallAlignment.toFixed(0)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div 
                className={`h-3 rounded-full ${getProgressBarColor(scorecard.alignment.overallAlignment)}`}
                style={{ width: `${scorecard.alignment.overallAlignment}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Alignment Areas</h3>
            {scorecard.alignment.alignmentAreas.map((area) => (
              <div key={area.id} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{area.name}</h4>
                    <p className="text-gray-600 text-sm">{area.description}</p>
                  </div>
                  <div className={`text-lg font-bold ${getScoreColor(area.currentScore)}`}>
                    {area.currentScore}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full ${getProgressBarColor(area.currentScore)}`}
                    style={{ width: `${area.currentScore}%` }}
                  ></div>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-1">Action Items:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {area.actionItems.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};