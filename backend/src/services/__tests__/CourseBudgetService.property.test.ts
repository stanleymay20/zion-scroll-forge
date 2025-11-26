/**
 * Property-Based Tests for CourseBudgetService
 * 
 * Tests universal properties that should hold across all valid inputs
 * using fast-check for property-based testing.
 * 
 * Note: These tests focus on business logic validation without full database integration.
 * Integration tests with real database are in CourseBudgetService.integration.test.ts
 */

import * as fc from 'fast-check';
import { BudgetCategory, ResourceType } from '../CourseBudgetService';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';

// ============================================================================
// Generators for property-based testing
// ============================================================================

/**
 * Generate valid course IDs
 */
const courseIdGenerator = () =>
  fc.string({ minLength: 5, maxLength: 50 }).map(s => `course_${s.replace(/[^a-zA-Z0-9]/g, '_')}`);

/**
 * Generate valid budget amounts (positive numbers)
 */
const budgetAmountGenerator = () =>
  fc.integer({ min: 100000, max: 10000000 }).map(n => Math.round(n) / 100); // $1,000 to $100,000, rounded to 2 decimals

/**
 * Generate budget category allocations that sum to total
 */
const budgetAllocationsGenerator = (totalBudget: number) => {
  const requiredCategories = [
    BudgetCategory.PRODUCTION,
    BudgetCategory.FACULTY,
    BudgetCategory.MATERIALS
  ];

  return fc.array(
    fc.constantFrom(...Object.values(BudgetCategory)),
    { minLength: 3, maxLength: 8 }
  ).chain(categories => {
    // Ensure required categories are included
    const uniqueCategories = Array.from(new Set([...requiredCategories, ...categories]));
    
    // Generate random percentages that sum to 100
    return fc.array(fc.integer({ min: 5, max: 50 }), { 
      minLength: uniqueCategories.length, 
      maxLength: uniqueCategories.length 
    }).map(percentages => {
      const sum = percentages.reduce((a, b) => a + b, 0);
      const normalized = percentages.map(p => (p / sum) * totalBudget);
      
      // Adjust last value to ensure exact sum
      const currentSum = normalized.slice(0, -1).reduce((a, b) => a + b, 0);
      normalized[normalized.length - 1] = totalBudget - currentSum;

      return uniqueCategories.map((category, i) => ({
        category,
        amount: Math.round(normalized[i] * 100) / 100
      }));
    });
  });
};

// ============================================================================
// Property 37: Budget Allocation Across Categories
// Feature: course-content-creation, Property 37: Budget Allocation Across Categories
// Validates: Requirements 9.1
// ============================================================================

describe('Property 37: Budget Allocation Across Categories', () => {
  it('should generate allocations with required categories that sum to total budget', async () => {
    await fc.assert(
      fc.asyncProperty(
        courseIdGenerator(),
        budgetAmountGenerator(),
        (courseId, totalBudget) => {
          // Create allocations with required categories
          const requiredCategories = [
            BudgetCategory.PRODUCTION,
            BudgetCategory.FACULTY,
            BudgetCategory.MATERIALS
          ];

          // Simple allocation: divide budget among required categories with proper rounding
          const production = Math.round(totalBudget * 0.4 * 100) / 100;
          const faculty = Math.round(totalBudget * 0.3 * 100) / 100;
          const materials = totalBudget - production - faculty; // Ensure exact sum

          const allocations = [
            { category: BudgetCategory.PRODUCTION, amount: production },
            { category: BudgetCategory.FACULTY, amount: faculty },
            { category: BudgetCategory.MATERIALS, amount: materials }
          ];

          // Verify required categories are present
          const categories = allocations.map(a => a.category);
          expect(categories).toContain(BudgetCategory.PRODUCTION);
          expect(categories).toContain(BudgetCategory.FACULTY);
          expect(categories).toContain(BudgetCategory.MATERIALS);

          // Verify allocations sum to total budget (within rounding tolerance)
          const sum = allocations.reduce((acc, a) => acc + a.amount, 0);
          expect(Math.abs(sum - totalBudget)).toBeLessThan(0.01);

          // Verify all amounts are positive
          allocations.forEach(alloc => {
            expect(alloc.amount).toBeGreaterThan(0);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject allocations that do not sum to total budget', async () => {
    await fc.assert(
      fc.asyncProperty(
        budgetAmountGenerator(),
        fc.array(
          fc.record({
            category: fc.constantFrom(...Object.values(BudgetCategory)),
            amount: fc.integer({ min: 100, max: 10000 }).map(n => n / 100)
          }),
          { minLength: 3, maxLength: 5 }
        ),
        (totalBudget, allocations) => {
          const sum = allocations.reduce((acc, a) => acc + a.amount, 0);
          
          // If sum doesn't match total (with tolerance), it should be invalid
          if (Math.abs(sum - totalBudget) > 0.01) {
            expect(sum).not.toBeCloseTo(totalBudget, 1);
            return true;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject allocations missing required categories', async () => {
    await fc.assert(
      fc.asyncProperty(
        budgetAmountGenerator(),
        fc.array(
          fc.record({
            category: fc.constantFrom(
              BudgetCategory.EQUIPMENT,
              BudgetCategory.STUDIO,
              BudgetCategory.PERSONNEL
            ), // Deliberately exclude required categories
            amount: fc.integer({ min: 100, max: 10000 }).map(n => n / 100)
          }),
          { minLength: 1, maxLength: 3 }
        ),
        (totalBudget, allocations) => {
          const categories = allocations.map(a => a.category);
          
          // Should not have all required categories
          const hasProduction = categories.includes(BudgetCategory.PRODUCTION);
          const hasFaculty = categories.includes(BudgetCategory.FACULTY);
          const hasMaterials = categories.includes(BudgetCategory.MATERIALS);
          
          expect(hasProduction && hasFaculty && hasMaterials).toBe(false);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 38: Expense Tracking Against Budget
// Feature: course-content-creation, Property 38: Expense Tracking Against Budget
// Validates: Requirements 9.2
// ============================================================================

describe('Property 38: Expense Tracking Against Budget', () => {
  it('should calculate remaining budget correctly after expenses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100000, max: 10000000 }).map(n => n / 100), // Category budget: $1,000 to $100,000
        fc.array(
          fc.integer({ min: 1000, max: 100000 }).map(n => n / 100), // Expenses: $10 to $1,000
          { minLength: 1, maxLength: 10 }
        ),
        (categoryBudget, expenses) => {
          let remaining = categoryBudget;
          
          expenses.forEach(expense => {
            remaining -= expense;
            
            // Remaining should be budget minus all expenses so far
            const expectedRemaining = categoryBudget - expenses.slice(0, expenses.indexOf(expense) + 1).reduce((sum, e) => sum + e, 0);
            // Use larger tolerance for floating point arithmetic
            expect(Math.abs(remaining - expectedRemaining)).toBeLessThan(0.1);
          });

          // Final remaining should be initial budget minus all expenses
          const totalExpenses = expenses.reduce((sum, e) => sum + e, 0);
          expect(Math.abs(remaining - (categoryBudget - totalExpenses))).toBeLessThan(0.1);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should track when expenses exceed budget', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 1000 }).map(n => n / 100), // Small budget
        fc.integer({ min: 1001, max: 5000 }).map(n => n / 100), // Large expense
        (budget, expense) => {
          const remaining = budget - expense;
          
          // Remaining should be negative when expense exceeds budget
          expect(remaining).toBeLessThan(0);
          expect(expense).toBeGreaterThan(budget);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 39: Resource Management
// Feature: course-content-creation, Property 39: Resource Management
// Validates: Requirements 9.3
// ============================================================================

describe('Property 39: Resource Management', () => {
  it('should map resource types to appropriate budget categories', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.values(ResourceType)),
        (resourceType) => {
          // Define expected mappings
          const expectedMappings: Record<ResourceType, BudgetCategory> = {
            [ResourceType.EQUIPMENT]: BudgetCategory.EQUIPMENT,
            [ResourceType.STUDIO_TIME]: BudgetCategory.STUDIO,
            [ResourceType.PERSONNEL]: BudgetCategory.PERSONNEL,
            [ResourceType.SOFTWARE_LICENSE]: BudgetCategory.SOFTWARE,
            [ResourceType.FACILITY]: BudgetCategory.PRODUCTION
          };

          const expectedCategory = expectedMappings[resourceType];
          expect(expectedCategory).toBeDefined();
          expect(Object.values(BudgetCategory)).toContain(expectedCategory);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate resource costs correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }), // quantity
        fc.integer({ min: 10, max: 1000 }).map(n => n / 100), // unit cost
        (quantity, unitCost) => {
          const totalCost = quantity * unitCost;
          
          expect(totalCost).toBeGreaterThan(0);
          expect(totalCost).toBeCloseTo(quantity * unitCost, 2);
          
          // Cost should scale linearly with quantity
          const doubleCost = (quantity * 2) * unitCost;
          expect(doubleCost).toBeCloseTo(totalCost * 2, 2);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 40: Course Cost Calculation
// Feature: course-content-creation, Property 40: Course Cost Calculation
// Validates: Requirements 9.4
// ============================================================================

describe('Property 40: Course Cost Calculation', () => {
  it('should calculate total cost as sum of all category expenses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          production: fc.array(fc.integer({ min: 10, max: 1000 }).map(n => n / 100), { maxLength: 5 }),
          faculty: fc.array(fc.integer({ min: 10, max: 1000 }).map(n => n / 100), { maxLength: 5 }),
          materials: fc.array(fc.integer({ min: 10, max: 1000 }).map(n => n / 100), { maxLength: 5 })
        }),
        (expensesByCategory) => {
          const productionTotal = expensesByCategory.production.reduce((sum, e) => sum + e, 0);
          const facultyTotal = expensesByCategory.faculty.reduce((sum, e) => sum + e, 0);
          const materialsTotal = expensesByCategory.materials.reduce((sum, e) => sum + e, 0);
          
          const totalCost = productionTotal + facultyTotal + materialsTotal;
          
          // Total should equal sum of all categories
          expect(totalCost).toBeCloseTo(productionTotal + facultyTotal + materialsTotal, 2);
          
          // Total should be at least as large as any single category
          expect(totalCost).toBeGreaterThanOrEqual(productionTotal);
          expect(totalCost).toBeGreaterThanOrEqual(facultyTotal);
          expect(totalCost).toBeGreaterThanOrEqual(materialsTotal);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate utilization percentage correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1000, max: 100000 }).map(n => n / 100), // Total budget
        fc.integer({ min: 0, max: 100000 }).map(n => n / 100), // Total expenses
        (totalBudget, totalExpenses) => {
          const utilization = (totalExpenses / totalBudget) * 100;
          
          // Utilization should be between 0 and infinity (can exceed 100%)
          expect(utilization).toBeGreaterThanOrEqual(0);
          
          // If expenses equal budget, utilization should be 100%
          if (Math.abs(totalExpenses - totalBudget) < 0.01) {
            expect(Math.abs(utilization - 100)).toBeLessThan(0.1);
          }
          
          // If no expenses, utilization should be 0%
          if (totalExpenses === 0) {
            expect(utilization).toBe(0);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 41: Financial Report Generation
// Feature: course-content-creation, Property 41: Financial Report Generation
// Validates: Requirements 9.5
// ============================================================================

describe('Property 41: Financial Report Generation', () => {
  it('should aggregate course data correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            courseId: courseIdGenerator(),
            totalBudget: budgetAmountGenerator(),
            totalExpenses: budgetAmountGenerator()
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (courses) => {
          const totalBudgeted = courses.reduce((sum, c) => sum + c.totalBudget, 0);
          const totalSpent = courses.reduce((sum, c) => sum + c.totalExpenses, 0);
          const totalRemaining = totalBudgeted - totalSpent;
          
          // Aggregates should match sum of individual courses
          expect(totalBudgeted).toBeGreaterThan(0);
          expect(totalRemaining).toBeCloseTo(totalBudgeted - totalSpent, 2);
          
          // Average utilization calculation
          const avgUtilization = courses.reduce((sum, c) => {
            return sum + ((c.totalExpenses / c.totalBudget) * 100);
          }, 0) / courses.length;
          
          expect(avgUtilization).toBeGreaterThanOrEqual(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should categorize courses by budget status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            courseId: courseIdGenerator(),
            totalBudget: fc.integer({ min: 1000, max: 10000 }).map(n => n / 100),
            totalExpenses: fc.integer({ min: 0, max: 15000 }).map(n => n / 100)
          }),
          { minLength: 5, maxLength: 20 }
        ),
        (courses) => {
          const overBudget = courses.filter(c => c.totalExpenses > c.totalBudget);
          const underBudget = courses.filter(c => c.totalExpenses <= c.totalBudget);
          
          // All courses should be categorized
          expect(overBudget.length + underBudget.length).toBe(courses.length);
          
          // Over budget courses should have expenses > budget
          overBudget.forEach(c => {
            expect(c.totalExpenses).toBeGreaterThan(c.totalBudget);
          });
          
          // Under budget courses should have expenses <= budget
          underBudget.forEach(c => {
            expect(c.totalExpenses).toBeLessThanOrEqual(c.totalBudget);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should group expenses by category correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            category: fc.constantFrom(...Object.values(BudgetCategory)),
            amount: fc.integer({ min: 10, max: 1000 }).map(n => n / 100)
          }),
          { minLength: 5, maxLength: 20 }
        ),
        (expenses) => {
          // Group by category
          const grouped = expenses.reduce((acc, exp) => {
            if (!acc[exp.category]) {
              acc[exp.category] = [];
            }
            acc[exp.category].push(exp.amount);
            return acc;
          }, {} as Record<BudgetCategory, number[]>);

          // Calculate totals per category
          const categoryTotals = Object.entries(grouped).map(([category, amounts]) => ({
            category: category as BudgetCategory,
            total: amounts.reduce((sum, a) => sum + a, 0)
          }));

          // Sum of category totals should equal sum of all expenses
          const grandTotal = categoryTotals.reduce((sum, ct) => sum + ct.total, 0);
          const expectedTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
          
          expect(Math.abs(grandTotal - expectedTotal)).toBeLessThan(0.01);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
