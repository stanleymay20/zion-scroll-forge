/**
 * Course Search and Discovery Engine
 * Advanced search capabilities with AI-powered filtering and prophetic insights
 */

import {
  ScrollCourse,
  CourseSearchCriteria,
  CourseSearchResult,
  SearchFacets,
  FacetCount,
  SupremeScrollFaculty,
  CourseLevel,
  DeliveryMode,
  CourseStatus,
  PropheticInsight,
  CulturalContext
} from '../types/curriculum-grid';

export interface SearchIndex {
  termToDocuments: Map<string, Set<string>>;
  documentToTerms: Map<string, Set<string>>;
  facetIndex: Map<string, Map<string, Set<string>>>;
}

export interface SearchQuery {
  terms: string[];
  filters: SearchFilters;
  sorting: SearchSorting;
  pagination: SearchPagination;
}

export interface SearchFilters {
  faculty?: SupremeScrollFaculty[];
  level?: CourseLevel[];
  deliveryMode?: DeliveryMode[];
  language?: string[];
  culturalContext?: CulturalContext[];
  propheticThemes?: string[];
  kingdomImpactMin?: number;
  scrollCoinCostMax?: number;
  estimatedHoursMax?: number;
  status?: CourseStatus[];
  tags?: string[];
  hasPrerequisites?: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface SearchSorting {
  field: SortField;
  direction: 'asc' | 'desc';
}

export enum SortField {
  RELEVANCE = 'relevance',
  TITLE = 'title',
  CREATED_DATE = 'createdAt',
  UPDATED_DATE = 'updatedAt',
  KINGDOM_IMPACT = 'kingdomImpact',
  PROPHETIC_ALIGNMENT = 'propheticAlignment',
  XP_REWARD = 'xpReward',
  SCROLL_COIN_COST = 'scrollCoinCost',
  ESTIMATED_HOURS = 'estimatedHours'
}

export interface SearchPagination {
  page: number;
  pageSize: number;
}

export interface SearchResult {
  course: ScrollCourse;
  relevanceScore: number;
  matchedTerms: string[];
  highlightedTitle: string;
  highlightedDescription: string;
}

export class CourseSearchEngine {
  private searchIndex: SearchIndex;
  private courses: Map<string, ScrollCourse>;
  private stopWords: Set<string>;

  constructor() {
    this.searchIndex = {
      termToDocuments: new Map(),
      documentToTerms: new Map(),
      facetIndex: new Map()
    };
    this.courses = new Map();
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'
    ]);
  }

  /**
   * Index a course for search
   */
  indexCourse(course: ScrollCourse): void {
    this.courses.set(course.id, course);
    
    // Extract searchable terms
    const searchableText = this.extractSearchableText(course);
    const terms = this.tokenize(searchableText);
    
    // Update term-to-document index
    terms.forEach(term => {
      if (!this.searchIndex.termToDocuments.has(term)) {
        this.searchIndex.termToDocuments.set(term, new Set());
      }
      this.searchIndex.termToDocuments.get(term)!.add(course.id);
    });

    // Update document-to-terms index
    this.searchIndex.documentToTerms.set(course.id, new Set(terms));

    // Update facet index
    this.updateFacetIndex(course);
  }

  /**
   * Remove course from search index
   */
  removeFromIndex(courseId: string): void {
    const course = this.courses.get(courseId);
    if (!course) return;

    // Remove from term-to-document index
    const terms = this.searchIndex.documentToTerms.get(courseId);
    if (terms) {
      terms.forEach(term => {
        const documents = this.searchIndex.termToDocuments.get(term);
        if (documents) {
          documents.delete(courseId);
          if (documents.size === 0) {
            this.searchIndex.termToDocuments.delete(term);
          }
        }
      });
    }

    // Remove from document-to-terms index
    this.searchIndex.documentToTerms.delete(courseId);

    // Remove from facet index
    this.removeFacetIndex(course);

    // Remove from courses
    this.courses.delete(courseId);
  }

  /**
   * Search courses with advanced filtering and ranking
   */
  async search(criteria: CourseSearchCriteria): Promise<CourseSearchResult> {
    const query = this.buildSearchQuery(criteria);
    
    // Get candidate documents
    let candidateIds = this.getCandidateDocuments(query);
    
    // Apply filters
    candidateIds = this.applyFilters(candidateIds, query.filters);
    
    // Calculate relevance scores
    const searchResults = this.calculateRelevanceScores(candidateIds, query);
    
    // Sort results
    const sortedResults = this.sortResults(searchResults, query.sorting);
    
    // Apply pagination
    const paginatedResults = this.paginateResults(sortedResults, query.pagination);
    
    // Generate facets
    const facets = this.generateFacets(candidateIds);
    
    // Get courses from results
    const courses = paginatedResults.map(result => result.course);
    
    return {
      courses,
      totalCount: candidateIds.size,
      facets,
      recommendations: [], // Will be populated by recommendation engine
      propheticInsights: this.getRelevantPropheticInsights(criteria)
    };
  }

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions(partialQuery: string, limit: number = 10): string[] {
    const normalizedQuery = this.normalizeText(partialQuery);
    const suggestions: string[] = [];
    
    // Find terms that start with the partial query
    for (const term of this.searchIndex.termToDocuments.keys()) {
      if (term.startsWith(normalizedQuery) && suggestions.length < limit) {
        suggestions.push(term);
      }
    }
    
    return suggestions.sort();
  }

  /**
   * Get popular search terms
   */
  getPopularTerms(limit: number = 20): Array<{ term: string; frequency: number }> {
    const termFrequency: Array<{ term: string; frequency: number }> = [];
    
    for (const [term, documents] of this.searchIndex.termToDocuments.entries()) {
      if (!this.stopWords.has(term) && term.length > 2) {
        termFrequency.push({ term, frequency: documents.size });
      }
    }
    
    return termFrequency
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  /**
   * Get related courses based on content similarity
   */
  getRelatedCourses(courseId: string, limit: number = 5): ScrollCourse[] {
    const course = this.courses.get(courseId);
    if (!course) return [];

    const courseTerms = this.searchIndex.documentToTerms.get(courseId);
    if (!courseTerms) return [];

    const similarity = new Map<string, number>();

    // Calculate similarity with other courses
    for (const [otherCourseId, otherTerms] of this.searchIndex.documentToTerms.entries()) {
      if (otherCourseId === courseId) continue;

      const intersection = new Set([...courseTerms].filter(term => otherTerms.has(term)));
      const union = new Set([...courseTerms, ...otherTerms]);
      const jaccardSimilarity = intersection.size / union.size;

      if (jaccardSimilarity > 0.1) { // Minimum similarity threshold
        similarity.set(otherCourseId, jaccardSimilarity);
      }
    }

    // Sort by similarity and return top courses
    const sortedSimilar = Array.from(similarity.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    return sortedSimilar
      .map(([courseId]) => this.courses.get(courseId))
      .filter(course => course !== undefined) as ScrollCourse[];
  }

  // Private helper methods

  private extractSearchableText(course: ScrollCourse): string {
    const textParts = [
      course.title,
      course.description,
      course.courseCode,
      course.faculty,
      course.level,
      course.department || '',
      ...course.tags,
      ...course.learningObjectives.map(obj => obj.description),
      ...course.spiritualObjectives.map(obj => obj.description),
      ...course.propheticAlignment.propheticThemes,
      ...course.kingdomImpact.transformationAreas
    ];

    return textParts.join(' ');
  }

  private tokenize(text: string): string[] {
    const normalized = this.normalizeText(text);
    const tokens = normalized.split(/\s+/).filter(token => 
      token.length > 2 && !this.stopWords.has(token)
    );
    
    return [...new Set(tokens)]; // Remove duplicates
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private updateFacetIndex(course: ScrollCourse): void {
    const facets = {
      faculty: course.faculty,
      level: course.level,
      language: course.language,
      status: course.status,
      deliveryModes: course.deliveryModes,
      tags: course.tags,
      propheticThemes: course.propheticAlignment.propheticThemes
    };

    Object.entries(facets).forEach(([facetName, facetValues]) => {
      if (!this.searchIndex.facetIndex.has(facetName)) {
        this.searchIndex.facetIndex.set(facetName, new Map());
      }

      const facetMap = this.searchIndex.facetIndex.get(facetName)!;
      const values = Array.isArray(facetValues) ? facetValues : [facetValues];

      values.forEach(value => {
        if (!facetMap.has(value)) {
          facetMap.set(value, new Set());
        }
        facetMap.get(value)!.add(course.id);
      });
    });
  }

  private removeFacetIndex(course: ScrollCourse): void {
    const facets = {
      faculty: course.faculty,
      level: course.level,
      language: course.language,
      status: course.status,
      deliveryModes: course.deliveryModes,
      tags: course.tags,
      propheticThemes: course.propheticAlignment.propheticThemes
    };

    Object.entries(facets).forEach(([facetName, facetValues]) => {
      const facetMap = this.searchIndex.facetIndex.get(facetName);
      if (!facetMap) return;

      const values = Array.isArray(facetValues) ? facetValues : [facetValues];

      values.forEach(value => {
        const documents = facetMap.get(value);
        if (documents) {
          documents.delete(course.id);
          if (documents.size === 0) {
            facetMap.delete(value);
          }
        }
      });
    });
  }

  private buildSearchQuery(criteria: CourseSearchCriteria): SearchQuery {
    const terms = criteria.query ? this.tokenize(criteria.query) : [];
    
    const filters: SearchFilters = {
      faculty: criteria.faculty,
      level: criteria.level,
      deliveryMode: criteria.deliveryMode,
      language: criteria.language,
      culturalContext: criteria.culturalContext,
      propheticThemes: criteria.propheticThemes,
      kingdomImpactMin: criteria.kingdomImpact,
      status: criteria.status,
      tags: criteria.tags,
      hasPrerequisites: criteria.prerequisites,
      dateRange: criteria.dateRange
    };

    return {
      terms,
      filters,
      sorting: { field: SortField.RELEVANCE, direction: 'desc' },
      pagination: { page: 1, pageSize: 20 }
    };
  }

  private getCandidateDocuments(query: SearchQuery): Set<string> {
    if (query.terms.length === 0) {
      // Return all documents if no search terms
      return new Set(this.courses.keys());
    }

    // Find documents that contain any of the search terms
    const candidateIds = new Set<string>();
    
    query.terms.forEach(term => {
      const documents = this.searchIndex.termToDocuments.get(term);
      if (documents) {
        documents.forEach(docId => candidateIds.add(docId));
      }
    });

    return candidateIds;
  }

  private applyFilters(candidateIds: Set<string>, filters: SearchFilters): Set<string> {
    const filteredIds = new Set<string>();

    for (const courseId of candidateIds) {
      const course = this.courses.get(courseId);
      if (!course) continue;

      // Apply all filters
      if (filters.faculty && !filters.faculty.includes(course.faculty)) continue;
      if (filters.level && !filters.level.includes(course.level)) continue;
      if (filters.deliveryMode && !course.deliveryModes.some(mode => filters.deliveryMode!.includes(mode))) continue;
      if (filters.language && !filters.language.includes(course.language)) continue;
      if (filters.propheticThemes && !course.propheticAlignment.propheticThemes.some(theme => filters.propheticThemes!.includes(theme))) continue;
      if (filters.kingdomImpactMin && course.kingdomImpact.impactScore < filters.kingdomImpactMin) continue;
      if (filters.scrollCoinCostMax && course.scrollCoinCost > filters.scrollCoinCostMax) continue;
      if (filters.estimatedHoursMax && course.estimatedHours > filters.estimatedHoursMax) continue;
      if (filters.status && !filters.status.includes(course.status)) continue;
      if (filters.tags && !course.tags.some(tag => filters.tags!.includes(tag))) continue;
      if (filters.hasPrerequisites !== undefined) {
        const hasPrereqs = course.prerequisites.length > 0;
        if (filters.hasPrerequisites !== hasPrereqs) continue;
      }
      if (filters.dateRange) {
        if (course.createdAt < filters.dateRange.startDate || course.createdAt > filters.dateRange.endDate) continue;
      }

      filteredIds.add(courseId);
    }

    return filteredIds;
  }

  private calculateRelevanceScores(candidateIds: Set<string>, query: SearchQuery): SearchResult[] {
    const results: SearchResult[] = [];

    for (const courseId of candidateIds) {
      const course = this.courses.get(courseId);
      if (!course) continue;

      const relevanceScore = this.calculateRelevanceScore(course, query.terms);
      const matchedTerms = this.getMatchedTerms(course, query.terms);
      
      results.push({
        course,
        relevanceScore,
        matchedTerms,
        highlightedTitle: this.highlightText(course.title, query.terms),
        highlightedDescription: this.highlightText(course.description, query.terms)
      });
    }

    return results;
  }

  private calculateRelevanceScore(course: ScrollCourse, queryTerms: string[]): number {
    if (queryTerms.length === 0) return 1.0;

    let score = 0;
    const courseTerms = this.searchIndex.documentToTerms.get(course.id);
    if (!courseTerms) return 0;

    // TF-IDF-like scoring
    queryTerms.forEach(term => {
      if (courseTerms.has(term)) {
        // Term frequency in document
        const tf = 1; // Simplified - could count actual occurrences
        
        // Inverse document frequency
        const documentsWithTerm = this.searchIndex.termToDocuments.get(term)?.size || 1;
        const totalDocuments = this.courses.size;
        const idf = Math.log(totalDocuments / documentsWithTerm);
        
        score += tf * idf;
      }
    });

    // Boost score based on course quality metrics
    const qualityBoost = (
      course.propheticAlignment.alignmentScore / 100 * 0.2 +
      course.kingdomImpact.impactScore / 100 * 0.3
    );

    return score + qualityBoost;
  }

  private getMatchedTerms(course: ScrollCourse, queryTerms: string[]): string[] {
    const courseTerms = this.searchIndex.documentToTerms.get(course.id);
    if (!courseTerms) return [];

    return queryTerms.filter(term => courseTerms.has(term));
  }

  private highlightText(text: string, queryTerms: string[]): string {
    if (queryTerms.length === 0) return text;

    let highlightedText = text;
    queryTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<mark>$&</mark>`);
    });

    return highlightedText;
  }

  private sortResults(results: SearchResult[], sorting: SearchSorting): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sorting.field) {
        case SortField.RELEVANCE:
          comparison = a.relevanceScore - b.relevanceScore;
          break;
        case SortField.TITLE:
          comparison = a.course.title.localeCompare(b.course.title);
          break;
        case SortField.CREATED_DATE:
          comparison = a.course.createdAt.getTime() - b.course.createdAt.getTime();
          break;
        case SortField.UPDATED_DATE:
          comparison = a.course.updatedAt.getTime() - b.course.updatedAt.getTime();
          break;
        case SortField.KINGDOM_IMPACT:
          comparison = a.course.kingdomImpact.impactScore - b.course.kingdomImpact.impactScore;
          break;
        case SortField.PROPHETIC_ALIGNMENT:
          comparison = a.course.propheticAlignment.alignmentScore - b.course.propheticAlignment.alignmentScore;
          break;
        case SortField.XP_REWARD:
          comparison = a.course.xpReward - b.course.xpReward;
          break;
        case SortField.SCROLL_COIN_COST:
          comparison = a.course.scrollCoinCost - b.course.scrollCoinCost;
          break;
        case SortField.ESTIMATED_HOURS:
          comparison = a.course.estimatedHours - b.course.estimatedHours;
          break;
      }

      return sorting.direction === 'desc' ? -comparison : comparison;
    });
  }

  private paginateResults(results: SearchResult[], pagination: SearchPagination): SearchResult[] {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return results.slice(startIndex, endIndex);
  }

  private generateFacets(candidateIds: Set<string>): SearchFacets {
    const facetCounts = {
      faculties: new Map<string, number>(),
      levels: new Map<string, number>(),
      deliveryModes: new Map<string, number>(),
      languages: new Map<string, number>(),
      propheticThemes: new Map<string, number>(),
      tags: new Map<string, number>()
    };

    for (const courseId of candidateIds) {
      const course = this.courses.get(courseId);
      if (!course) continue;

      // Count facet values
      facetCounts.faculties.set(course.faculty, (facetCounts.faculties.get(course.faculty) || 0) + 1);
      facetCounts.levels.set(course.level, (facetCounts.levels.get(course.level) || 0) + 1);
      facetCounts.languages.set(course.language, (facetCounts.languages.get(course.language) || 0) + 1);

      course.deliveryModes.forEach(mode => {
        facetCounts.deliveryModes.set(mode, (facetCounts.deliveryModes.get(mode) || 0) + 1);
      });

      course.propheticAlignment.propheticThemes.forEach(theme => {
        facetCounts.propheticThemes.set(theme, (facetCounts.propheticThemes.get(theme) || 0) + 1);
      });

      course.tags.forEach(tag => {
        facetCounts.tags.set(tag, (facetCounts.tags.get(tag) || 0) + 1);
      });
    }

    return {
      faculties: Array.from(facetCounts.faculties.entries()).map(([value, count]) => ({ value, count })),
      levels: Array.from(facetCounts.levels.entries()).map(([value, count]) => ({ value, count })),
      deliveryModes: Array.from(facetCounts.deliveryModes.entries()).map(([value, count]) => ({ value, count })),
      languages: Array.from(facetCounts.languages.entries()).map(([value, count]) => ({ value, count })),
      propheticThemes: Array.from(facetCounts.propheticThemes.entries()).map(([value, count]) => ({ value, count })),
      tags: Array.from(facetCounts.tags.entries()).map(([value, count]) => ({ value, count }))
    };
  }

  private getRelevantPropheticInsights(criteria: CourseSearchCriteria): PropheticInsight[] {
    // Placeholder for prophetic insights - would be populated from external source
    return [];
  }
}