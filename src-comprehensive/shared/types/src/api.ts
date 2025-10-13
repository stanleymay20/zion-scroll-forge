import { z } from 'zod';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: ResponseMetadata;
  timestamp: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  trace_id?: string;
}

export interface ResponseMetadata {
  request_id: string;
  processing_time_ms: number;
  api_version: string;
  rate_limit?: RateLimitInfo;
  pagination?: PaginationInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset_time: string;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_previous: boolean;
}

// API Request Types
export interface APIRequest {
  endpoint: string;
  method: HTTPMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Authentication Types
export interface AuthHeaders {
  Authorization: string;
  'X-API-Key'?: string;
  'X-User-ID'?: string;
  'X-Session-ID'?: string;
}

export interface TokenInfo {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string[];
  issued_at: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: WSMessageType;
  payload: any;
  timestamp: string;
  message_id: string;
}

export type WSMessageType = 
  | 'auth'
  | 'heartbeat'
  | 'notification'
  | 'ai_tutor_message'
  | 'xr_session_update'
  | 'course_progress'
  | 'system_announcement'
  | 'error';

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect_attempts: number;
  reconnect_delay_ms: number;
  heartbeat_interval_ms: number;
  auth_token?: string;
}

// API Endpoints Configuration
export interface APIEndpoints {
  auth: AuthEndpoints;
  users: UserEndpoints;
  courses: CourseEndpoints;
  ai_tutors: AITutorEndpoints;
  xr: XREndpoints;
  scrollcoin: ScrollCoinEndpoints;
  scholarships: ScholarshipEndpoints;
  admin: AdminEndpoints;
}

export interface AuthEndpoints {
  login: string;
  logout: string;
  register: string;
  refresh: string;
  verify_email: string;
  reset_password: string;
}

export interface UserEndpoints {
  profile: string;
  preferences: string;
  enrollments: string;
  achievements: string;
  dashboard: string;
}

export interface CourseEndpoints {
  browse: string;
  details: string;
  enroll: string;
  progress: string;
  assignments: string;
  assessments: string;
}

export interface AITutorEndpoints {
  start_session: string;
  send_message: string;
  end_session: string;
  session_history: string;
  available_tutors: string;
}

export interface XREndpoints {
  classrooms: string;
  join_session: string;
  capabilities: string;
  virtual_labs: string;
}

export interface ScrollCoinEndpoints {
  wallet: string;
  transactions: string;
  transfer: string;
  missions: string;
  workstudy: string;
}

export interface ScholarshipEndpoints {
  browse: string;
  apply: string;
  applications: string;
  eligibility_check: string;
}

export interface AdminEndpoints {
  users: string;
  courses: string;
  system_stats: string;
  scroll_nodes: string;
}

// API Client Configuration
export interface APIClientConfig {
  base_url: string;
  api_version: string;
  timeout_ms: number;
  retry_attempts: number;
  retry_delay_ms: number;
  auth_token?: string;
  default_headers: Record<string, string>;
  interceptors: APIInterceptors;
}

export interface APIInterceptors {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
  error: ErrorInterceptor[];
}

export interface RequestInterceptor {
  name: string;
  handler: (request: APIRequest) => APIRequest | Promise<APIRequest>;
}

export interface ResponseInterceptor {
  name: string;
  handler: (response: APIResponse) => APIResponse | Promise<APIResponse>;
}

export interface ErrorInterceptor {
  name: string;
  handler: (error: APIError) => APIError | Promise<APIError>;
}

// Cache Configuration
export interface CacheConfig {
  enabled: boolean;
  default_ttl_ms: number;
  max_size_mb: number;
  storage_type: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  cache_strategies: CacheStrategy[];
}

export interface CacheStrategy {
  pattern: string; // URL pattern or endpoint name
  ttl_ms: number;
  strategy: 'cache_first' | 'network_first' | 'cache_only' | 'network_only';
  invalidation_triggers: string[];
}

// Error Handling
export interface ErrorHandlingConfig {
  global_error_handler: boolean;
  retry_on_error: boolean;
  error_reporting: ErrorReportingConfig;
  fallback_responses: FallbackResponse[];
}

export interface ErrorReportingConfig {
  enabled: boolean;
  endpoint?: string;
  include_stack_trace: boolean;
  include_user_context: boolean;
  sampling_rate: number; // 0-1
}

export interface FallbackResponse {
  error_codes: string[];
  response: APIResponse;
}

// Service Discovery
export interface ServiceConfig {
  name: string;
  base_url: string;
  health_check_endpoint: string;
  version: string;
  capabilities: string[];
  load_balancing: LoadBalancingConfig;
}

export interface LoadBalancingConfig {
  strategy: 'round_robin' | 'least_connections' | 'weighted' | 'random';
  health_check_interval_ms: number;
  failure_threshold: number;
  recovery_threshold: number;
}

// API Monitoring and Analytics
export interface APIMetrics {
  endpoint: string;
  method: HTTPMethod;
  response_time_ms: number;
  status_code: number;
  success: boolean;
  timestamp: string;
  user_id?: string;
  error_code?: string;
}

export interface PerformanceMetrics {
  avg_response_time_ms: number;
  success_rate: number;
  error_rate: number;
  requests_per_minute: number;
  peak_response_time_ms: number;
  slowest_endpoints: EndpointMetric[];
}

export interface EndpointMetric {
  endpoint: string;
  avg_response_time_ms: number;
  request_count: number;
  error_count: number;
}

// Validation Schemas
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
    trace_id: z.string().optional()
  }).optional(),
  timestamp: z.string().datetime()
});

export const APIRequestSchema = z.object({
  endpoint: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  headers: z.record(z.string()).optional(),
  params: z.record(z.any()).optional(),
  body: z.any().optional(),
  timeout: z.number().positive().optional()
});

export const TokenInfoSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number().positive(),
  scope: z.array(z.string()),
  issued_at: z.string().datetime()
});

export const WebSocketMessageSchema = z.object({
  type: z.enum(['auth', 'heartbeat', 'notification', 'ai_tutor_message', 'xr_session_update', 'course_progress', 'system_announcement', 'error']),
  payload: z.any(),
  timestamp: z.string().datetime(),
  message_id: z.string().uuid()
});

export const PaginationInfoSchema = z.object({
  page: z.number().positive(),
  per_page: z.number().positive(),
  total_pages: z.number().nonnegative(),
  total_items: z.number().nonnegative(),
  has_next: z.boolean(),
  has_previous: z.boolean()
});