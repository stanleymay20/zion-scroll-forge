/**
 * Workflow Engine Service
 * Manages workflow execution, state transitions, and orchestration
 * Task 5: Workflow & Notifications System
 * Validates Requirements 5.1
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Workflow types
export type WorkflowStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'timeout';
export type WorkflowType = 
  | 'student_enrollment'
  | 'course_approval'
  | 'grade_processing'
  | 'faculty_onboarding'
  | 'academic_standing_review'
  | 'graduation_audit'
  | 'financial_aid_processing'
  | 'content_moderation'
  | 'system_maintenance'
  | 'custom';

export type StepType = 
  | 'approval'
  | 'notification'
  | 'data_validation'
  | 'api_call'
  | 'email_send'
  | 'database_update'
  | 'file_processing'
  | 'condition_check'
  | 'delay'
  | 'custom_script';

// Properly typed workflow data structures
export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number | boolean;
}

export interface StepConfig {
  [key: string]: string | number | boolean | string[] | number[] | undefined;
}

export interface ContextData {
  [key: string]: string | number | boolean | Date | null | undefined;
}

export interface ExecutionResults {
  [key: string]: StepExecutionResult;
}

export interface StepExecutionResult {
  executed: boolean;
  executedAt?: string;
  sent?: boolean;
  timestamp?: string;
  valid?: boolean;
  validatedAt?: string;
  approved?: boolean;
  approvedAt?: string;
  error?: string;
}

export interface WorkflowDefinition {
  id?: string;
  name: string;
  description?: string;
  workflowType: WorkflowType;
  triggerConditions: TriggerCondition[];
  steps: WorkflowStep[];
  isActive?: boolean;
  autoStart?: boolean;
  maxRetries?: number;
  timeoutMinutes?: number;
  version?: number;
}

export interface WorkflowStep {
  stepNumber: number;
  stepName: string;
  stepType: StepType;
  stepConfig: StepConfig;
  onSuccess?: string;
  onFailure?: string;
}

export interface WorkflowContext {
  triggeredByUserId?: string;
  triggerEvent?: string;
  contextData: ContextData;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  completedAt?: Date;
  retryCount: number;
  lastError?: string;
  executionResults: ExecutionResults;
}

export interface WorkflowResult {
  executionId: string;
  status: WorkflowStatus;
  completedSteps: number;
  totalSteps: number;
  results: ExecutionResults;
  error?: string;
}

// Database workflow record type
interface WorkflowRecord {
  id: string;
  name: string;
  description: string | null;
  workflow_type: WorkflowType;
  trigger_conditions: TriggerCondition[];
  steps: WorkflowStep[];
  is_active: boolean;
  auto_start: boolean;
  max_retries: number;
  timeout_minutes: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export class WorkflowEngineService {
  private supabase: SupabaseClient;

  // Valid state transitions
  private readonly validTransitions: Record<WorkflowStatus, WorkflowStatus[]> = {
    'pending': ['running', 'cancelled'],
    'running': ['completed', 'failed', 'paused', 'timeout'],
    'paused': ['running', 'cancelled'],
    'completed': [],
    'failed': ['pending'], // Allow retry
    'cancelled': [],
    'timeout': ['pending'] // Allow retry
  };

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY required');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Register a new workflow definition
   */
  async registerWorkflow(workflow: WorkflowDefinition): Promise<string> {
    // Validate workflow structure
    this.validateWorkflowDefinition(workflow);

    // Store workflow definition
    const { data, error } = await this.supabase
      .from('workflows')
      .insert({
        name: workflow.name,
        description: workflow.description,
        workflow_type: workflow.workflowType,
        trigger_conditions: workflow.triggerConditions,
        steps: workflow.steps,
        is_active: workflow.isActive ?? true,
        auto_start: workflow.autoStart ?? false,
        max_retries: workflow.maxRetries ?? 3,
        timeout_minutes: workflow.timeoutMinutes ?? 60,
        version: workflow.version ?? 1
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to register workflow: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, context: WorkflowContext): Promise<WorkflowResult> {
    // Load workflow definition
    const workflow = await this.loadWorkflow(workflowId);
    
    if (!workflow.is_active) {
      throw new Error(`Workflow ${workflowId} is not active`);
    }

    // Create workflow execution instance
    const execution = await this.createExecution(workflowId, context, workflow.steps.length);

    try {
      // Transition to running state
      await this.transitionState(execution.id, 'pending', 'running');

      // Execute steps in sequence
      const results: ExecutionResults = {};
      
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        
        try {
          // Execute step
          const stepResult = await this.executeStep(execution.id, step, context.contextData);
          results[`step_${step.stepNumber}`] = stepResult;

          // Update execution progress
          await this.updateExecutionProgress(execution.id, i + 1);

        } catch (stepError) {
          const errorMessage = stepError instanceof Error ? stepError.message : 'Unknown error occurred';
          const error = stepError instanceof Error ? stepError : new Error(errorMessage);
          
          // Handle step failure
          await this.handleStepFailure(execution.id, step, error);
          
          // Check if we should retry
          if (execution.retryCount < workflow.max_retries) {
            await this.retryExecution(execution.id);
            throw new Error(`Step ${step.stepNumber} failed, retrying...`);
          } else {
            await this.transitionState(execution.id, 'running', 'failed');
            throw new Error(`Workflow failed at step ${step.stepNumber}: ${errorMessage}`);
          }
        }
      }

      // All steps completed successfully
      await this.transitionState(execution.id, 'running', 'completed');

      return {
        executionId: execution.id,
        status: 'completed',
        completedSteps: workflow.steps.length,
        totalSteps: workflow.steps.length,
        results
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Update execution with error
      await this.supabase
        .from('workflow_executions')
        .update({
          last_error: errorMessage,
          error_details: { error: errorMessage, stack: errorStack }
        })
        .eq('id', execution.id);

      return {
        executionId: execution.id,
        status: 'failed',
        completedSteps: execution.currentStep,
        totalSteps: workflow.steps.length,
        results: {},
        error: errorMessage
      };
    }
  }

  /**
   * Transition workflow state with validation
   */
  async transitionState(executionId: string, fromState: WorkflowStatus, toState: WorkflowStatus): Promise<void> {
    // Validate transition
    if (!this.isValidTransition(fromState, toState)) {
      throw new Error(`Invalid state transition from ${fromState} to ${toState}`);
    }

    // Get current state
    const { data: execution, error: fetchError } = await this.supabase
      .from('workflow_executions')
      .select('status')
      .eq('id', executionId)
      .single();

    if (fetchError || !execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    // Verify current state matches expected state
    if (execution.status !== fromState) {
      throw new Error(`Expected state ${fromState} but found ${execution.status}`);
    }

    // Update state atomically
    const { error: updateError } = await this.supabase
      .from('workflow_executions')
      .update({
        status: toState,
        ...(toState === 'completed' && { completed_at: new Date().toISOString() })
      })
      .eq('id', executionId)
      .eq('status', fromState); // Ensure atomic update

    if (updateError) {
      throw new Error(`Failed to transition state: ${updateError.message}`);
    }
  }

  /**
   * Check if state transition is valid
   */
  isValidTransition(fromState: WorkflowStatus, toState: WorkflowStatus): boolean {
    if (fromState === toState) {
      return true; // Same state is always valid
    }
    
    const allowedTransitions = this.validTransitions[fromState];
    return allowedTransitions.includes(toState);
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution> {
    const { data, error } = await this.supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (error || !data) {
      throw new Error(`Execution ${executionId} not found`);
    }

    return {
      id: data.id,
      workflowId: data.workflow_id,
      status: data.status,
      currentStep: data.current_step,
      totalSteps: data.total_steps,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      retryCount: data.retry_count,
      lastError: data.last_error,
      executionResults: data.execution_results
    };
  }

  /**
   * Pause a running workflow
   */
  async pauseWorkflow(executionId: string): Promise<void> {
    await this.transitionState(executionId, 'running', 'paused');
  }

  /**
   * Resume a paused workflow
   */
  async resumeWorkflow(executionId: string): Promise<void> {
    await this.transitionState(executionId, 'paused', 'running');
  }

  /**
   * Cancel a workflow
   */
  async cancelWorkflow(executionId: string): Promise<void> {
    const execution = await this.getExecutionStatus(executionId);
    
    if (execution.status === 'pending' || execution.status === 'paused') {
      await this.transitionState(executionId, execution.status, 'cancelled');
    } else {
      throw new Error(`Cannot cancel workflow in ${execution.status} state`);
    }
  }

  // Private helper methods

  private validateWorkflowDefinition(workflow: WorkflowDefinition): void {
    if (!workflow.name || workflow.name.trim().length === 0) {
      throw new Error('Workflow name is required');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      throw new Error('Workflow must have at least one step');
    }

    // Validate step numbers are sequential
    const sortedSteps = [...workflow.steps].sort((a, b) => a.stepNumber - b.stepNumber);
    for (let i = 0; i < sortedSteps.length; i++) {
      if (sortedSteps[i].stepNumber !== i + 1) {
        throw new Error(`Step numbers must be sequential starting from 1`);
      }
    }
  }

  private async loadWorkflow(workflowId: string): Promise<WorkflowRecord> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error) {
      throw new Error(`Failed to load workflow ${workflowId}: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    return data as WorkflowRecord;
  }

  private async createExecution(
    workflowId: string,
    context: WorkflowContext,
    totalSteps: number
  ): Promise<WorkflowExecution> {
    const { data, error } = await this.supabase
      .from('workflow_executions')
      .insert({
        workflow_id: workflowId,
        triggered_by_user_id: context.triggeredByUserId,
        trigger_event: context.triggerEvent,
        context_data: context.contextData,
        status: 'pending',
        current_step: 0,
        total_steps: totalSteps,
        retry_count: 0,
        execution_results: {}
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to create workflow execution: ${error?.message}`);
    }

    return {
      id: data.id,
      workflowId: data.workflow_id,
      status: data.status,
      currentStep: data.current_step,
      totalSteps: data.total_steps,
      startedAt: new Date(data.started_at),
      retryCount: data.retry_count,
      executionResults: data.execution_results
    };
  }

  private async executeStep(
    executionId: string,
    step: WorkflowStep,
    contextData: ContextData
  ): Promise<StepExecutionResult> {
    // Create step execution record
    const { data: stepExecution, error: createError } = await this.supabase
      .from('workflow_step_executions')
      .insert({
        workflow_execution_id: executionId,
        step_number: step.stepNumber,
        step_name: step.stepName,
        step_type: step.stepType,
        step_config: step.stepConfig,
        input_data: contextData,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (createError) {
      throw new Error(`Failed to create step execution: ${createError.message}`);
    }

    if (!stepExecution) {
      throw new Error('Step execution record was not created');
    }

    try {
      // Execute step based on type
      const result = await this.executeStepByType(step, contextData);

      // Mark step as completed
      const { error: updateError } = await this.supabase
        .from('workflow_step_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          output_data: result
        })
        .eq('id', stepExecution.id);

      if (updateError) {
        throw new Error(`Failed to update step execution: ${updateError.message}`);
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Mark step as failed
      await this.supabase
        .from('workflow_step_executions')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: errorMessage
        })
        .eq('id', stepExecution.id);

      throw error;
    }
  }

  private async executeStepByType(step: WorkflowStep, _contextData: ContextData): Promise<StepExecutionResult> {
    // Implementation would be extended based on step type
    // This is a placeholder that returns appropriate results for each step type
    switch (step.stepType) {
      case 'notification':
        return { 
          sent: true, 
          timestamp: new Date().toISOString(),
          executed: true
        };
      
      case 'data_validation':
        return { 
          valid: true, 
          validatedAt: new Date().toISOString(),
          executed: true
        };
      
      case 'approval':
        return { 
          approved: true, 
          approvedAt: new Date().toISOString(),
          executed: true
        };
      
      case 'email_send':
      case 'api_call':
      case 'database_update':
      case 'file_processing':
      case 'condition_check':
      case 'delay':
      case 'custom_script':
      default:
        return { 
          executed: true, 
          executedAt: new Date().toISOString() 
        };
    }
  }

  private async updateExecutionProgress(executionId: string, currentStep: number): Promise<void> {
    const { error } = await this.supabase
      .from('workflow_executions')
      .update({ current_step: currentStep })
      .eq('id', executionId);

    if (error) {
      throw new Error(`Failed to update execution progress: ${error.message}`);
    }
  }

  private async handleStepFailure(executionId: string, step: WorkflowStep, error: Error): Promise<void> {
    const { error: updateError } = await this.supabase
      .from('workflow_executions')
      .update({
        last_error: error.message,
        error_details: { step: step.stepNumber, error: error.message }
      })
      .eq('id', executionId);

    if (updateError) {
      // Log but don't throw - we're already handling a failure
      console.error(`Failed to record step failure: ${updateError.message}`);
    }
  }

  private async retryExecution(executionId: string): Promise<void> {
    const { data, error: fetchError } = await this.supabase
      .from('workflow_executions')
      .select('retry_count')
      .eq('id', executionId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch retry count: ${fetchError.message}`);
    }

    if (!data) {
      throw new Error(`Execution ${executionId} not found for retry`);
    }

    const { error: updateError } = await this.supabase
      .from('workflow_executions')
      .update({
        retry_count: data.retry_count + 1,
        status: 'pending'
      })
      .eq('id', executionId);

    if (updateError) {
      throw new Error(`Failed to update retry count: ${updateError.message}`);
    }
  }
}

export default WorkflowEngineService;
