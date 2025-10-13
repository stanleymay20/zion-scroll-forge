/**
 * Competitive Analysis Matrix Service (JavaScript version)
 * Implements task 4.3: Build interactive feature comparison matrix
 * Provides data generation and management for feature comparisons
 */

class CompetitiveAnalysisMatrixService {
  /**
   * Generate comprehensive feature comparison matrix
   * Requirements: 3.2, 3.4 - Feature comparison and competitive advantage highlighting
   */
  generateFeatureComparisonMatrix() {
    const categories = this.generateCategoryComparisons();
    const detailedComparisons = this.generateDetailedFeatureComparisons();
    const overallScore = this.calculateOverallScore(detailedComparisons);

    return {
      categories,
      overallScore,
      detailedComparisons
    };
  }

  generateCategoryComparisons() {
    return [
      {
        category: 'core-education',
        scrollUniversityScore: 95,
        learnTubeAIScore: 75,
        advantage: 'scrolluniversity',
        keyDifferentiators: [
          'Comprehensive course catalog with 10,000+ courses',
          'Multi-dimensional assessment including spiritual growth',
          'Prophetic AI tutoring with divine discernment'
        ]
      },
      {
        category: 'ai-capabilities',
        scrollUniversityScore: 98,
        learnTubeAIScore: 70,
        advantage: 'scrolluniversity',
        keyDifferentiators: [
          'ScrollGPT with prophetic intelligence',
          'Cultural fluency across 200+ nations',
          'Spiritual discernment integration'
        ]
      },
      {
        category: 'spiritual-formation',
        scrollUniversityScore: 100,
        learnTubeAIScore: 0,
        advantage: 'scrolluniversity',
        keyDifferentiators: [
          'Divine scorecard system',
          'Prophetic check-ins',
          'Intercession prayer integration',
          'Character formation tracking'
        ]
      },
      {
        category: 'blockchain-integration',
        scrollUniversityScore: 95,
        learnTubeAIScore: 20,
        advantage: 'scrolluniversity',
        keyDifferentiators: [
          'HeavenLedger blockchain foundation',
          'ScrollCoin economy',
          'Immutable credential verification',
          'Smart contract automation'
        ]
      },
      {
        category: 'global-accessibility',
        scrollUniversityScore: 92,
        learnTubeAIScore: 60,
        advantage: 'scrolluniversity',
        keyDifferentiators: [
          'Offline-first architecture',
          'Mesh networking capabilities',
          'Solar microhub integration',
          'Multi-language cultural adaptation'
        ]
      }
    ];
  }

  generateDetailedFeatureComparisons() {
    return [
      {
        featureName: 'AI-Powered Personalized Tutoring',
        category: 'ai-capabilities',
        scrollUniversity: {
          available: true,
          quality: 'excellent',
          uniqueAspects: [
            'ScrollGPT with prophetic intelligence integration',
            'Spiritual discernment in learning guidance',
            'Cultural fluency across 200+ nations',
            'Divine scorecard integration for holistic development'
          ],
          limitations: []
        },
        learnTubeAI: {
          available: true,
          quality: 'good',
          uniqueAspects: [
            'Standard AI tutoring capabilities',
            'Basic personalization algorithms'
          ],
          limitations: [
            'No spiritual dimension',
            'Limited cultural adaptation',
            'Secular worldview only'
          ]
        },
        competitiveAdvantage: {
          platform: 'scrolluniversity',
          magnitude: 'significant',
          reasoning: 'ScrollUniversity\'s prophetic AI tutoring represents a revolutionary advancement beyond standard AI assistance. The integration of spiritual discernment, cultural fluency, and divine scorecard systems creates a holistic learning experience that addresses the whole person - spirit, soul, and body - while LearnTube.ai focuses only on intellectual development.',
          spiritualDimension: true,
          kingdomImpact: true
        },
        strategicImportance: 'high'
      },
      {
        featureName: 'Spiritual Formation Tracking',
        category: 'spiritual-formation',
        scrollUniversity: {
          available: true,
          quality: 'excellent',
          uniqueAspects: [
            'Divine scorecard system',
            'Prophetic check-ins with AI guidance',
            'Character development metrics',
            'Spiritual growth visualization',
            'Integration with academic progress'
          ],
          limitations: []
        },
        learnTubeAI: {
          available: false,
          quality: 'unavailable',
          uniqueAspects: [],
          limitations: [
            'No spiritual dimension',
            'Secular platform only',
            'No character development focus'
          ]
        },
        competitiveAdvantage: {
          platform: 'scrolluniversity',
          magnitude: 'significant',
          reasoning: 'This is a completely unique feature that no secular education platform can match. ScrollUniversity\'s spiritual formation tracking addresses the whole person, providing divine scorecard systems and prophetic check-ins that guide students in their spiritual journey alongside academic achievement.',
          spiritualDimension: true,
          kingdomImpact: true
        },
        strategicImportance: 'high'
      },
      {
        featureName: 'Blockchain Credential Verification',
        category: 'credentialing',
        scrollUniversity: {
          available: true,
          quality: 'excellent',
          uniqueAspects: [
            'HeavenLedger blockchain integration',
            'Immutable credential verification',
            'ScrollBadge NFT system',
            'Global recognition framework',
            'Smart contract automation'
          ],
          limitations: []
        },
        learnTubeAI: {
          available: false,
          quality: 'unavailable',
          uniqueAspects: [],
          limitations: [
            'Traditional certificate system',
            'No blockchain integration',
            'Limited verification capabilities',
            'Potential for fraud'
          ]
        },
        competitiveAdvantage: {
          platform: 'scrolluniversity',
          magnitude: 'significant',
          reasoning: 'ScrollUniversity\'s blockchain-based credential system provides immutable, globally verifiable certificates through HeavenLedger and ScrollBadge NFTs. This revolutionary approach eliminates fraud and provides instant global recognition, while LearnTube.ai relies on traditional, easily falsifiable certificates.',
          spiritualDimension: false,
          kingdomImpact: true
        },
        strategicImportance: 'high'
      }
    ];
  }

  calculateOverallScore(features) {
    const categoryWeights = {
      'core-education': 0.15,
      'ai-capabilities': 0.15,
      'spiritual-formation': 0.20,
      'blockchain-integration': 0.10,
      'global-accessibility': 0.10,
      'community-features': 0.08,
      'xr-integration': 0.07,
      'assessment-evaluation': 0.08,
      'credentialing': 0.05,
      'economic-model': 0.02
    };

    let scrollUniversityTotal = 0;
    let learnTubeAITotal = 0;
    const categoryBreakdown = {};

    // Calculate category scores
    const categories = [...new Set(features.map(f => f.category))];
    categories.forEach(category => {
      const categoryFeatures = features.filter(f => f.category === category);
      const weight = categoryWeights[category] || 0.05;
      
      let scrollScore = 0;
      let learntubeScore = 0;
      
      categoryFeatures.forEach(feature => {
        const featureWeight = feature.strategicImportance === 'high' ? 3 : 
                             feature.strategicImportance === 'medium' ? 2 : 1;
        
        if (feature.competitiveAdvantage.platform === 'scrolluniversity') {
          const magnitude = feature.competitiveAdvantage.magnitude === 'significant' ? 3 :
                           feature.competitiveAdvantage.magnitude === 'moderate' ? 2 : 1;
          scrollScore += featureWeight * magnitude;
        } else if (feature.competitiveAdvantage.platform === 'learntube') {
          const magnitude = feature.competitiveAdvantage.magnitude === 'significant' ? 3 :
                           feature.competitiveAdvantage.magnitude === 'moderate' ? 2 : 1;
          learntubeScore += featureWeight * magnitude;
        }
      });

      const normalizedScrollScore = Math.min(100, scrollScore * 10);
      const normalizedLearntubeScore = Math.min(100, learntubeScore * 10);

      categoryBreakdown[category] = {
        scrollUniversity: normalizedScrollScore,
        learnTubeAI: normalizedLearntubeScore,
        weight,
        advantage: normalizedScrollScore > normalizedLearntubeScore ? 'scrolluniversity' :
                  normalizedLearntubeScore > normalizedScrollScore ? 'learntube' : 'neutral'
      };

      scrollUniversityTotal += normalizedScrollScore * weight;
      learnTubeAITotal += normalizedLearntubeScore * weight;
    });

    return {
      scrollUniversityTotal: Math.round(scrollUniversityTotal),
      learnTubeAITotal: Math.round(learnTubeAITotal),
      categoryBreakdown,
      overallAdvantage: scrollUniversityTotal > learnTubeAITotal ? 'scrolluniversity' :
                       learnTubeAITotal > scrollUniversityTotal ? 'learntube' : 'neutral',
      confidenceLevel: 0.92
    };
  }

  generateFeatureSuperiority(matrix) {
    const dominantFeatures = matrix.detailedComparisons.filter(f => 
      f.competitiveAdvantage.platform === 'scrolluniversity' && 
      f.competitiveAdvantage.magnitude === 'significant'
    );

    const competitiveGaps = matrix.detailedComparisons.filter(f => 
      f.competitiveAdvantage.platform === 'learntube' && 
      f.strategicImportance === 'high'
    );

    const uniqueAdvantages = matrix.detailedComparisons.filter(f => 
      f.competitiveAdvantage.spiritualDimension || f.competitiveAdvantage.kingdomImpact
    );

    const strategicRecommendations = [
      'Leverage spiritual formation features as unique market differentiator',
      'Emphasize blockchain credentialing system in marketing materials',
      'Expand global accessibility features to underserved markets',
      'Develop partnerships to enhance XR learning capabilities',
      'Create case studies showcasing ScrollCoin economic model success',
      'Build community around kingdom-focused collaborative projects'
    ];

    return {
      dominantFeatures,
      competitiveGaps,
      uniqueAdvantages,
      strategicRecommendations
    };
  }

  filterFeaturesByAdvantage(features, advantage) {
    if (advantage === 'all') return features;
    return features.filter(f => f.competitiveAdvantage.platform === advantage);
  }

  filterFeaturesByCategory(features, categories) {
    if (categories.length === 0) return features;
    return features.filter(f => categories.includes(f.category));
  }

  highlightCompetitiveAdvantages(features) {
    return {
      significantAdvantages: features.filter(f => 
        f.competitiveAdvantage.platform === 'scrolluniversity' && 
        f.competitiveAdvantage.magnitude === 'significant'
      ),
      moderateAdvantages: features.filter(f => 
        f.competitiveAdvantage.platform === 'scrolluniversity' && 
        f.competitiveAdvantage.magnitude === 'moderate'
      ),
      slightAdvantages: features.filter(f => 
        f.competitiveAdvantage.platform === 'scrolluniversity' && 
        f.competitiveAdvantage.magnitude === 'slight'
      ),
      spiritualAdvantages: features.filter(f => f.competitiveAdvantage.spiritualDimension),
      kingdomImpactFeatures: features.filter(f => f.competitiveAdvantage.kingdomImpact)
    };
  }
}

module.exports = { CompetitiveAnalysisMatrixService };