/**
 * Competitive Analysis Matrix Demo Script
 * Demonstrates task 4.3: Build interactive feature comparison matrix
 * Tests the CompetitiveAnalysisMatrixService functionality
 */

const { CompetitiveAnalysisMatrixService } = require('./CompetitiveAnalysisMatrixService');

async function runCompetitiveAnalysisDemo() {
  console.log('🚀 Starting Competitive Analysis Matrix Demo');
  console.log('=' .repeat(60));

  try {
    const service = new CompetitiveAnalysisMatrixService();

    // Generate feature comparison matrix
    console.log('📊 Generating Feature Comparison Matrix...');
    const matrix = service.generateFeatureComparisonMatrix();

    // Display overall results
    console.log('\n📈 Overall Competitive Score:');
    console.log(`ScrollUniversity: ${matrix.overallScore.scrollUniversityTotal}`);
    console.log(`LearnTube.ai: ${matrix.overallScore.learnTubeAITotal}`);
    console.log(`Overall Advantage: ${matrix.overallScore.overallAdvantage.toUpperCase()}`);
    console.log(`Confidence Level: ${Math.round(matrix.overallScore.confidenceLevel * 100)}%`);

    // Display category breakdown
    console.log('\n🏆 Category Breakdown:');
    matrix.categories.forEach(category => {
      const advantage = category.advantage === 'scrolluniversity' ? '✅ ScrollU' :
                       category.advantage === 'learntube' ? '❌ LearnTube' : '⚖️ Neutral';
      console.log(`${category.category.padEnd(20)} | ScrollU: ${category.scrollUniversityScore.toString().padStart(3)} | LearnTube: ${category.learnTubeAIScore.toString().padStart(3)} | ${advantage}`);
    });

    // Display feature highlights
    console.log('\n🌟 Feature Highlights:');
    const highlights = service.highlightCompetitiveAdvantages(matrix.detailedComparisons);
    
    console.log(`\n✨ Significant ScrollUniversity Advantages (${highlights.significantAdvantages.length}):`);
    highlights.significantAdvantages.slice(0, 5).forEach(feature => {
      console.log(`  • ${feature.featureName} (${feature.category})`);
    });

    console.log(`\n🙏 Spiritual Formation Features (${highlights.spiritualAdvantages.length}):`);
    highlights.spiritualAdvantages.slice(0, 3).forEach(feature => {
      console.log(`  • ${feature.featureName}`);
    });

    console.log(`\n👑 Kingdom Impact Features (${highlights.kingdomImpactFeatures.length}):`);
    highlights.kingdomImpactFeatures.slice(0, 3).forEach(feature => {
      console.log(`  • ${feature.featureName}`);
    });

    // Generate superiority report
    console.log('\n📋 Feature Superiority Report:');
    const superiority = service.generateFeatureSuperiority(matrix);
    
    console.log(`Dominant Features: ${superiority.dominantFeatures.length}`);
    console.log(`Competitive Gaps: ${superiority.competitiveGaps.length}`);
    console.log(`Unique Advantages: ${superiority.uniqueAdvantages.length}`);

    console.log('\n💡 Strategic Recommendations:');
    superiority.strategicRecommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });

    // Test filtering capabilities
    console.log('\n🔍 Testing Filter Capabilities:');
    
    const scrollAdvantages = service.filterFeaturesByAdvantage(matrix.detailedComparisons, 'scrolluniversity');
    console.log(`ScrollUniversity Advantages: ${scrollAdvantages.length} features`);
    
    const spiritualFeatures = service.filterFeaturesByCategory(matrix.detailedComparisons, ['spiritual-formation']);
    console.log(`Spiritual Formation Features: ${spiritualFeatures.length} features`);
    
    const aiFeatures = service.filterFeaturesByCategory(matrix.detailedComparisons, ['ai-capabilities']);
    console.log(`AI Capabilities Features: ${aiFeatures.length} features`);

    // Display sample feature details
    console.log('\n🔬 Sample Feature Analysis:');
    const sampleFeature = matrix.detailedComparisons[0];
    console.log(`Feature: ${sampleFeature.featureName}`);
    console.log(`Category: ${sampleFeature.category}`);
    console.log(`Advantage: ${sampleFeature.competitiveAdvantage.platform} (${sampleFeature.competitiveAdvantage.magnitude})`);
    console.log(`Strategic Importance: ${sampleFeature.strategicImportance}`);
    console.log(`Spiritual Dimension: ${sampleFeature.competitiveAdvantage.spiritualDimension ? 'Yes' : 'No'}`);
    console.log(`Kingdom Impact: ${sampleFeature.competitiveAdvantage.kingdomImpact ? 'Yes' : 'No'}`);
    console.log(`Reasoning: ${sampleFeature.competitiveAdvantage.reasoning.substring(0, 150)}...`);

    console.log('\n✅ Competitive Analysis Matrix Demo Completed Successfully!');
    console.log('=' .repeat(60));

    return {
      success: true,
      matrix,
      highlights,
      superiority,
      totalFeatures: matrix.detailedComparisons.length,
      scrollAdvantages: scrollAdvantages.length,
      spiritualFeatures: highlights.spiritualAdvantages.length,
      kingdomFeatures: highlights.kingdomImpactFeatures.length
    };

  } catch (error) {
    console.error('❌ Error in Competitive Analysis Demo:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runCompetitiveAnalysisDemo };
}

// Run demo if called directly
if (require.main === module) {
  runCompetitiveAnalysisDemo()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Demo completed successfully!');
        process.exit(0);
      } else {
        console.error('\n💥 Demo failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}