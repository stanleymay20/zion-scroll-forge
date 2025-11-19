/**
 * AI Grading Feedback Component
 * "Whatever is true, whatever is noble, whatever is right... think about such things" - Philippians 4:8
 * 
 * Displays AI-generated grading feedback with detailed breakdowns
 */

import React from 'react';
import { CheckCircle, AlertCircle, TrendingUp, TrendingDown, Award, Eye } from 'lucide-react';

interface GradingFeedback {
  overallScore: number;
  confidence: number;
  breakdown: {
    correctness?: number;
    efficiency?: number;
    style?: number;
    documentation?: number;
    clarity?: number;
    structure?: number;
    evidence?: number;
  };
  feedback: string;
  lineByLineFeedback?: Array<{
    line: number;
    type: 'error' | 'warning' | 'suggestion';
    message: string;
  }>;
  suggestions: string[];
  humanReviewRequired: boolean;
}

interface AIGradingFeedbackProps {
  feedback: GradingFeedback;
  submissionType: 'code' | 'essay' | 'math';
}

export const AIGradingFeedback: React.FC<AIGradingFeedbackProps> = ({
  feedback,
  submissionType
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getGrade = (score: number) => {
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 63) return 'D';
    if (score >= 60) return 'D-';
    return 'F';
  };

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI Grading Results</h2>
            <p className="text-sm opacity-90">
              Powered by world-class AI evaluation
            </p>
          </div>
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(feedback.overallScore)}`}>
              {feedback.overallScore}
            </div>
            <div className="text-2xl font-semibold mt-2">
              {getGrade(feedback.overallScore)}
            </div>
          </div>
        </div>

        {/* Confidence Indicator */}
        <div className="mt-4 flex items-center gap-2">
          {feedback.confidence >= 0.85 ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm">
            AI Confidence: {(feedback.confidence * 100).toFixed(0)}%
          </span>
        </div>

        {/* Human Review Badge */}
        {feedback.humanReviewRequired && (
          <div className="mt-3 bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <span className="text-sm">
              This submission has been flagged for human review due to lower confidence
            </span>
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Score Breakdown
        </h3>
        <div className="space-y-3">
          {Object.entries(feedback.breakdown).map(([category, score]) => (
            <div key={category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                  {score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreBgColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Feedback</h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{feedback.feedback}</p>
        </div>
      </div>

      {/* Line-by-Line Feedback (for code) */}
      {feedback.lineByLineFeedback && feedback.lineByLineFeedback.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Line-by-Line Feedback</h3>
          <div className="space-y-2">
            {feedback.lineByLineFeedback.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  item.type === 'error'
                    ? 'bg-red-50 border-red-200'
                    : item.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-mono bg-gray-800 text-white px-2 py-1 rounded">
                    Line {item.line}
                  </span>
                  <span className="text-sm flex-1">{item.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions for Improvement */}
      {feedback.suggestions && feedback.suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Suggestions for Improvement
          </h3>
          <ul className="space-y-2">
            {feedback.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Spiritual Encouragement */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-semibold mb-2 text-purple-900">
          Spiritual Encouragement
        </h3>
        <p className="text-purple-800 italic">
          "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters" - Colossians 3:23
        </p>
        <p className="text-purple-700 mt-3">
          Remember that learning is a journey. Each assignment is an opportunity to grow in knowledge and wisdom. Keep pressing forward!
        </p>
      </div>
    </div>
  );
};
