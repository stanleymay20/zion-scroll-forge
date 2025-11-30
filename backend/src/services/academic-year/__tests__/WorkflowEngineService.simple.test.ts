/**
 * Simple tests for Workflow Engine Service
 * Task 5.1: Workflow State Consistency
 */

import WorkflowEngineService from '../WorkflowEngineService';

describe('Workflow Engine Service - Simple Tests', () => {
  let service: WorkflowEngineService;

  beforeEach(() => {
    service = new WorkflowEngineService();
  });

  test('should create service instance', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(WorkflowEngineService);
  });

  test('should validate same state transition as valid', () => {
    const isValid = service.isValidTransition('pending', 'pending');
    expect(isValid).toBe(true);
  });

  test('should validate pending to running transition', () => {
    const isValid = service.isValidTransition('pending', 'running');
    expect(isValid).toBe(true);
  });

  test('should invalidate completed to running transition', () => {
    const isValid = service.isValidTransition('completed', 'running');
    expect(isValid).toBe(false);
  });

  test('should validate running to completed transition', () => {
    const isValid = service.isValidTransition('running', 'completed');
    expect(isValid).toBe(true);
  });
});
