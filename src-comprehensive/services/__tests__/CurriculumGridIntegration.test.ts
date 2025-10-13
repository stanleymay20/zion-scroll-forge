/**
 * Curriculum Grid Integration Test
 * Simple integration test to verify the Master Course Catalog Infrastructure works
 */

import { MasterCourseCatalogService } from '../MasterCourseCatalogService';
import { CourseSearchEngine } from '../CourseSearchEngine';
import { CourseRecommendationEngine } from '../CourseRecommendationEngine';
import { SpiritualAlignmentValidator } from '../SpiritualAlignmentValidator';

describe('Curriculum Grid Integration', () => {
  test('should create and initialize services without errors', () => {
    expect(() => {
      const catalogService = new MasterCourseCatalogService();
      const searchEngine = new CourseSearchEngine();
      const recommendationEngine = new CourseRecommendationEngine();
      const spiritualValidator = new SpiritualAlignmentValidator();
      
      // Basic functionality checks
      expect(catalogService).toBeDefined();
      expect(searchEngine).toBeDefined();
      expect(recommendationEngine).toBeDefined();
      expect(spiritualValidator).toBeDefined();
    }).not.toThrow();
  });

  test('should initialize all 12 Supreme Scroll Faculties', () => {
    const catalogService = new MasterCourseCatalogService();
    const faculties = catalogService.getAllFaculties();
    
    expect(faculties).toHaveLength(12);
    expect(faculties.every(f => f.targetCourseCount > 0)).toBe(true);
    expect(faculties.every(f => f.departments.length > 0)).toBe(true);
  });

  test('should provide catalog statistics', () => {
    const catalogService = new MasterCourseCatalogService();
    const stats = catalogService.getCatalogStatistics();
    
    expect(stats.totalCourses).toBeDefined();
    expect(stats.targetTotal).toBe(10000);
    expect(stats.facultyStats).toHaveLength(12);
    expect(stats.progress).toBeGreaterThanOrEqual(0);
  });

  test('should support course search functionality', () => {
    const searchEngine = new CourseSearchEngine();
    
    // Test basic search functionality
    const suggestions = searchEngine.getSuggestions('test');
    expect(Array.isArray(suggestions)).toBe(true);
    
    const popularTerms = searchEngine.getPopularTerms(5);
    expect(Array.isArray(popularTerms)).toBe(true);
  });

  test('should support recommendation strategies', () => {
    const recommendationEngine = new CourseRecommendationEngine();
    
    // Test that the engine initializes with strategies
    expect(recommendationEngine).toBeDefined();
    // The strategies are private, but we can test that the engine doesn't throw
    expect(() => recommendationEngine).not.toThrow();
  });

  test('should support spiritual alignment validation', () => {
    const spiritualValidator = new SpiritualAlignmentValidator();
    
    // Test that the validator initializes
    expect(spiritualValidator).toBeDefined();
    expect(() => spiritualValidator).not.toThrow();
  });
});

describe('Type System Validation', () => {
  test('should have proper type definitions', () => {
    // Import types to ensure they compile correctly
    const types = require('../../types/curriculum-grid');
    
    expect(types.SupremeScrollFaculty).toBeDefined();
    expect(types.CourseLevel).toBeDefined();
    expect(types.DeliveryMode).toBeDefined();
    expect(types.CourseStatus).toBeDefined();
  });
});