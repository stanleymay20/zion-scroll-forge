/**
 * OpenRouter AI Service
 * Provides access to multiple AI models through OpenRouter API
 */
import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export class OpenRouterService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;
  private timeout: number;
  private maxRetries: number;
  private deepseekApiKey: string | undefined;
  private deepseekBaseURL: string = 'https://api.deepseek.com/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    this.baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    this.timeout = parseInt(process.env.OPENROUTER_TIMEOUT || '180000');
    this.maxRetries = parseInt(process.env.OPENROUTER_MAX_RETRIES || '3');

    if (!this.apiKey && !this.deepseekApiKey) {
      throw new Error('Either OPENROUTER_API_KEY or DEEPSEEK_API_KEY is required');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://scrolluniversity.edu',
        'X-Title': 'ScrollUniversity Course Generator'
      }
    });

    logger.info('OpenRouter service initialized', {
      baseURL: this.baseURL,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      hasDeepSeek: !!this.deepseekApiKey
    });
  }

  /**
   * Generate content using DeepSeek (primary and default)
   * Only falls back to OpenRouter if DeepSeek is not configured
   */
  async generateContent(
    messages: OpenRouterMessage[],
    model: string = 'deepseek/deepseek-chat',
    options: Partial<OpenRouterRequest> = {}
  ): Promise<string> {
    // Use DeepSeek as primary (direct API or through OpenRouter)
    if (this.deepseekApiKey) {
      // Use DeepSeek direct API
      return await this.generateWithDeepSeek(messages, options);
    } else if (this.apiKey) {
      // Use DeepSeek through OpenRouter
      return await this.generateWithOpenRouter(messages, 'deepseek/deepseek-chat', options);
    } else {
      throw new Error('No API key configured. Set DEEPSEEK_API_KEY or OPENROUTER_API_KEY in .env');
    }
  }

  /**
   * Generate content using DeepSeek API
   */
  private async generateWithDeepSeek(
    messages: OpenRouterMessage[],
    options: Partial<OpenRouterRequest> = {}
  ): Promise<string> {
    // DeepSeek has a max output token limit of 8192
    const requestedTokens = options.max_tokens || parseInt(process.env.AI_MAX_TOKENS || '4000');
    const maxTokens = Math.min(requestedTokens, 8192);
    const temperature = options.temperature || parseFloat(process.env.AI_TEMPERATURE || '0.7');

    logger.info('Making DeepSeek API call', {
      messageCount: messages.length,
      requestedTokens,
      maxTokens,
      limited: requestedTokens > 8192
    });

    const startTime = Date.now();
    
    try {
      const response = await axios.post(
        `${this.deepseekBaseURL}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages,
          max_tokens: maxTokens,
          temperature,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.deepseekApiKey}`
          },
          timeout: this.timeout
        }
      );

      const duration = Date.now() - startTime;

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid response from DeepSeek API');
      }

      const content = response.data.choices[0].message?.content;
      if (!content) {
        throw new Error('No content returned from DeepSeek API');
      }

      logger.info('DeepSeek API call successful', {
        duration,
        tokensUsed: response.data.usage?.total_tokens || 0,
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0
      });

      return content.trim();
    } catch (error: any) {
      logger.warn('DeepSeek API failed, falling back to OpenRouter', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Fall back to OpenRouter with DeepSeek model
      if (this.apiKey) {
        return await this.generateWithOpenRouter(messages, 'deepseek/deepseek-chat', options);
      }
      
      throw error;
    }
  }

  /**
   * Generate content using OpenRouter API
   */
  private async generateWithOpenRouter(
    messages: OpenRouterMessage[],
    model: string = 'openai/gpt-4o-mini',
    options: Partial<OpenRouterRequest> = {}
  ): Promise<string> {
    const request: OpenRouterRequest = {
      model,
      messages,
      max_tokens: options.max_tokens || parseInt(process.env.AI_MAX_TOKENS || '4000'),
      temperature: options.temperature || parseFloat(process.env.AI_TEMPERATURE || '0.7'),
      top_p: options.top_p || 1,
      frequency_penalty: options.frequency_penalty || 0,
      presence_penalty: options.presence_penalty || 0,
      stream: false,
      ...options
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info('Making OpenRouter API call', {
          attempt,
          model,
          messageCount: messages.length,
          maxTokens: request.max_tokens
        });

        const startTime = Date.now();
        const response = await this.client.post<OpenRouterResponse>('/chat/completions', request);
        const duration = Date.now() - startTime;

        logger.info('OpenRouter API call successful', {
          attempt,
          duration,
          model: response.data.model,
          tokensUsed: response.data.usage?.total_tokens || 0,
          promptTokens: response.data.usage?.prompt_tokens || 0,
          completionTokens: response.data.usage?.completion_tokens || 0
        });

        const content = response.data.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No content returned from OpenRouter API');
        }

        return content.trim();
      } catch (error: any) {
        lastError = error;
        const duration = Date.now();

        logger.error('OpenRouter API call failed', {
          attempt,
          error: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          duration
        });

        // Don't retry on certain errors
        if (error.response?.status === 401) {
          throw new Error('OpenRouter API authentication failed - check API key');
        }
        if (error.response?.status === 400) {
          throw new Error(`OpenRouter API request invalid: ${error.response.data?.error?.message || error.message}`);
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.maxRetries) {
          const delay = Math.min(
            parseInt(process.env.AI_RETRY_INITIAL_DELAY || '2000') * Math.pow(2, attempt - 1),
            parseInt(process.env.AI_RETRY_MAX_DELAY || '15000')
          );
          logger.info('Retrying OpenRouter API call', { attempt, delay });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`OpenRouter API failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Generate lecture content using DeepSeek (default)
   */
  async generateLectureContent(
    course: string,
    module: string,
    lectureTitle: string,
    difficulty: string = 'INTERMEDIATE',
    targetAudience: string = 'University Students'
  ): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are an expert course content creator for ScrollUniversity, a Christian educational platform. Create comprehensive, engaging lecture content that integrates biblical principles with academic excellence.

REQUIREMENTS:
- Follow the Scroll Pedagogy Model (6-step lesson flow)
- Integrate biblical principles naturally throughout
- Maintain academic rigor at ${difficulty} level
- Target audience: ${targetAudience}
- Include practical applications and real-world examples
- Provide clear learning objectives
- Create engaging, transformative content

SCROLL PEDAGOGY MODEL:
1. IGNITION: Hook + Revelation Trigger
2. DOWNLOAD: Concept Teaching
3. DEMONSTRATION: Worked Example
4. ACTIVATION: Student Practice
5. REFLECTION: Identity & Integration
6. COMMISSION: Next Step/Assignment`
      },
      {
        role: 'user',
        content: `Generate comprehensive lecture content for:

**Course**: ${course}
**Module**: ${module}
**Lecture**: ${lectureTitle}
**Difficulty**: ${difficulty}
**Target Audience**: ${targetAudience}

Create a complete lecture following the Scroll Pedagogy Model with:
- Clear learning objectives
- Engaging introduction (Ignition)
- Comprehensive content delivery (Download)
- Practical examples (Demonstration)
- Interactive elements (Activation)
- Reflective questions (Reflection)
- Action steps (Commission)
- Biblical integration throughout
- Real-world applications

Make it comprehensive, engaging, and transformative for students.`
      }
    ];

    // Use DeepSeek as default (no model parameter = uses default from generateContent)
    return await this.generateContent(messages);
  }

  /**
   * Test API connectivity (uses DeepSeek by default)
   */
  async testConnection(): Promise<boolean> {
    try {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Say "Hello from ScrollUniversity!" to test the connection.'
        }
      ];

      const response = await this.generateContent(messages);
      logger.info('API connection test successful (DeepSeek)', { response });
      return true;
    } catch (error: any) {
      logger.error('API connection test failed', { error: error.message });
      return false;
    }
  }
}

export const openRouterService = new OpenRouterService();
