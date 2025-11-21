/**
 * ScrollUniversity Loading Manager
 * Centralized loading state management
 * "Wait for the Lord; be strong and take heart" - Psalm 27:14
 */

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  operation?: string;
}

export type LoadingKey = string;

/**
 * Global loading state manager
 */
class LoadingManager {
  private loadingStates: Map<LoadingKey, LoadingState> = new Map();
  private listeners: Set<(states: Map<LoadingKey, LoadingState>) => void> = new Set();
  
  /**
   * Start loading for a specific key
   */
  start(key: LoadingKey, message?: string, operation?: string): void {
    this.loadingStates.set(key, {
      isLoading: true,
      message,
      operation
    });
    this.notifyListeners();
  }
  
  /**
   * Update loading progress
   */
  updateProgress(key: LoadingKey, progress: number, message?: string): void {
    const state = this.loadingStates.get(key);
    if (state) {
      this.loadingStates.set(key, {
        ...state,
        progress,
        message: message || state.message
      });
      this.notifyListeners();
    }
  }
  
  /**
   * Stop loading for a specific key
   */
  stop(key: LoadingKey): void {
    this.loadingStates.delete(key);
    this.notifyListeners();
  }
  
  /**
   * Check if any operation is loading
   */
  isAnyLoading(): boolean {
    return this.loadingStates.size > 0;
  }
  
  /**
   * Check if specific key is loading
   */
  isLoading(key: LoadingKey): boolean {
    return this.loadingStates.has(key);
  }
  
  /**
   * Get loading state for a key
   */
  getState(key: LoadingKey): LoadingState | undefined {
    return this.loadingStates.get(key);
  }
  
  /**
   * Get all loading states
   */
  getAllStates(): Map<LoadingKey, LoadingState> {
    return new Map(this.loadingStates);
  }
  
  /**
   * Subscribe to loading state changes
   */
  subscribe(listener: (states: Map<LoadingKey, LoadingState>) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const states = this.getAllStates();
    this.listeners.forEach(listener => {
      try {
        listener(states);
      } catch (error) {
        console.error('Error in loading state listener:', error);
      }
    });
  }
  
  /**
   * Clear all loading states
   */
  clear(): void {
    this.loadingStates.clear();
    this.notifyListeners();
  }
}

// Singleton instance
const loadingManager = new LoadingManager();

export { loadingManager };

/**
 * Helper to wrap async operations with loading state
 */
export async function withLoading<T>(
  key: LoadingKey,
  operation: () => Promise<T>,
  message?: string
): Promise<T> {
  try {
    loadingManager.start(key, message);
    const result = await operation();
    return result;
  } finally {
    loadingManager.stop(key);
  }
}

/**
 * Helper to wrap async operations with progress tracking
 */
export async function withProgress<T>(
  key: LoadingKey,
  operation: (updateProgress: (progress: number, message?: string) => void) => Promise<T>,
  initialMessage?: string
): Promise<T> {
  try {
    loadingManager.start(key, initialMessage);
    
    const updateProgress = (progress: number, message?: string) => {
      loadingManager.updateProgress(key, progress, message);
    };
    
    const result = await operation(updateProgress);
    return result;
  } finally {
    loadingManager.stop(key);
  }
}

/**
 * Loading state categories
 */
export const LoadingKeys = {
  // Authentication
  AUTH_LOGIN: 'auth:login',
  AUTH_REGISTER: 'auth:register',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_RESET_PASSWORD: 'auth:reset-password',
  
  // Courses
  COURSES_FETCH: 'courses:fetch',
  COURSE_ENROLL: 'course:enroll',
  COURSE_CONTENT: 'course:content',
  
  // Assignments
  ASSIGNMENT_SUBMIT: 'assignment:submit',
  ASSIGNMENT_GRADE: 'assignment:grade',
  
  // Payments
  PAYMENT_PROCESS: 'payment:process',
  SCROLLCOIN_TRANSFER: 'scrollcoin:transfer',
  
  // Community
  POST_CREATE: 'post:create',
  MESSAGE_SEND: 'message:send',
  
  // Profile
  PROFILE_UPDATE: 'profile:update',
  AVATAR_UPLOAD: 'avatar:upload',
  
  // AI Services
  AI_TUTOR: 'ai:tutor',
  AI_GRADING: 'ai:grading',
  
  // General
  DATA_FETCH: 'data:fetch',
  DATA_SAVE: 'data:save',
  FILE_UPLOAD: 'file:upload',
  FILE_DOWNLOAD: 'file:download'
} as const;
