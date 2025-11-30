/**
 * CourseBudgetService
 * 
 * Manages financial and resource allocation for course development projects.
 * Tracks budgets, expenses, resources, and generates financial reports.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Budget categories for course development
export enum BudgetCategory {
  PRODUCTION = 'PRODUCTION',
  FACULTY = 'FACULTY',
  MATERIALS = 'MATERIALS',
  EQUIPMENT = 'EQUIPMENT',
  STUDIO = 'STUDIO',
  PERSONNEL = 'PERSONNEL',
  SOFTWARE = 'SOFTWARE',
  MARKETING = 'MARKETING',
  OTHER = 'OTHER'
}

// Resource types
export enum ResourceType {
  EQUIPMENT = 'EQUIPMENT',
  STUDIO_TIME = 'STUDIO_TIME',
  PERSONNEL = 'PERSONNEL',
  SOFTWARE_LICENSE = 'SOFTWARE_LICENSE',
  FACILITY = 'FACILITY'
}

// Budget allocation interface
export interface BudgetAllocation {
  courseId: string;
  totalBudget: number;
  allocations: {
    category: BudgetCategory;
    amount: number;
    percentage: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Expense record interface
export interface ExpenseRecord {
  id: string;
  courseId: string;
  category: BudgetCategory;
  amount: number;
  description: string;
  date: Date;
  vendor?: string;
  receiptUrl?: string;
  approvedBy?: string;
  remainingBudget: number;
}

// Resource allocation interface
export interface ResourceAllocation {
  id: string;
  courseId: string;
  resourceType: ResourceType;
  resourceName: string;
  quantity: number;
  unit: string;
  startDate: Date;
  endDate?: Date;
  cost: number;
  assignedTo?: string;
  status: 'REQUESTED' | 'ALLOCATED' | 'IN_USE' | 'RELEASED';
}

// Cost report interface
export interface CostReport {
  courseId: string;
  courseName: string;
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  utilizationPercentage: number;
  expensesByCategory: {
    category: BudgetCategory;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage: number;
  }[];
  resourceCosts: {
    resourceType: ResourceType;
    totalCost: number;
    count: number;
  }[];
  generatedAt: Date;
}

// Financial report interface
export interface FinancialReport {
  reportType: 'BY_COURSE' | 'BY_CATEGORY' | 'SUMMARY';
  startDate: Date;
  endDate: Date;
  courses: {
    courseId: string;
    courseName: string;
    totalBudget: number;
    totalExpenses: number;
    remainingBudget: number;
    utilizationPercentage: number;
  }[];
  categoryTotals: {
    category: BudgetCategory;
    totalBudgeted: number;
    totalSpent: number;
    totalRemaining: number;
  }[];
  overallSummary: {
    totalBudgeted: number;
    totalSpent: number;
    totalRemaining: number;
    averageUtilization: number;
    coursesOverBudget: number;
    coursesUnderBudget: number;
  };
  generatedAt: Date;
}

export class CourseBudgetService {
  /**
   * Allocate budget for a course with category allocation
   * Requirement 9.1: WHEN a course is budgeted THEN the System SHALL allocate funds 
   * for production, faculty, and materials
   */
  async allocateBudget(
    courseId: string,
    totalBudget: number,
    categoryAllocations: { category: BudgetCategory; amount: number }[]
  ): Promise<BudgetAllocation> {
    try {
      logger.info(`Allocating budget for course ${courseId}: $${totalBudget}`);

      // Validate that allocations sum to total budget
      const allocatedSum = categoryAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);
      if (Math.abs(allocatedSum - totalBudget) > 0.01) {
        throw new Error(
          `Budget allocation mismatch: allocated $${allocatedSum} but total budget is $${totalBudget}`
        );
      }

      // Ensure required categories are present
      const requiredCategories = [
        BudgetCategory.PRODUCTION,
        BudgetCategory.FACULTY,
        BudgetCategory.MATERIALS
      ];
      const allocatedCategories = categoryAllocations.map(a => a.category);
      const missingCategories = requiredCategories.filter(
        cat => !allocatedCategories.includes(cat)
      );

      if (missingCategories.length > 0) {
        throw new Error(
          `Missing required budget categories: ${missingCategories.join(', ')}`
        );
      }

      // Create budget allocation record
      const allocation: BudgetAllocation = {
        courseId,
        totalBudget,
        allocations: categoryAllocations.map(alloc => ({
          category: alloc.category,
          amount: alloc.amount,
          percentage: (alloc.amount / totalBudget) * 100
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store in database (using JSON field for flexibility)
      await prisma.$executeRaw`
        INSERT INTO course_budgets (course_id, total_budget, allocations, created_at, updated_at)
        VALUES (${courseId}, ${totalBudget}, ${JSON.stringify(allocation.allocations)}::jsonb, 
                ${allocation.createdAt}, ${allocation.updatedAt})
        ON CONFLICT (course_id) 
        DO UPDATE SET 
          total_budget = ${totalBudget},
          allocations = ${JSON.stringify(allocation.allocations)}::jsonb,
          updated_at = ${allocation.updatedAt}
      `;

      logger.info(`Budget allocated successfully for course ${courseId}`);
      return allocation;
    } catch (error) {
      logger.error(`Error allocating budget for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Track expense against budget
   * Requirement 9.2: WHEN expenses occur THEN the System SHALL track actual costs against budget
   */
  async trackExpense(
    courseId: string,
    category: BudgetCategory,
    amount: number,
    description: string,
    metadata?: {
      vendor?: string;
      receiptUrl?: string;
      approvedBy?: string;
    }
  ): Promise<ExpenseRecord> {
    try {
      logger.info(`Tracking expense for course ${courseId}: $${amount} in ${category}`);

      // Get current budget allocation
      const budgetResult = await prisma.$queryRaw<any[]>`
        SELECT total_budget, allocations 
        FROM course_budgets 
        WHERE course_id = ${courseId}
      `;

      if (!budgetResult || budgetResult.length === 0) {
        throw new Error(`No budget allocation found for course ${courseId}`);
      }

      const budget = budgetResult[0];
      const allocations = budget.allocations as any[];
      const categoryAllocation = allocations.find(a => a.category === category);

      if (!categoryAllocation) {
        throw new Error(`No budget allocation found for category ${category}`);
      }

      // Get current expenses for this category
      const expensesResult = await prisma.$queryRaw<any[]>`
        SELECT COALESCE(SUM(amount), 0) as total_spent
        FROM course_expenses
        WHERE course_id = ${courseId} AND category = ${category}
      `;

      const totalSpent = Number(expensesResult[0]?.total_spent || 0);
      const remainingBudget = categoryAllocation.amount - totalSpent - amount;

      if (remainingBudget < 0) {
        logger.warn(
          `Expense exceeds budget for course ${courseId}, category ${category}. ` +
          `Budget: $${categoryAllocation.amount}, Spent: $${totalSpent}, New expense: $${amount}`
        );
      }

      // Create expense record
      const expenseId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expense: ExpenseRecord = {
        id: expenseId,
        courseId,
        category,
        amount,
        description,
        date: new Date(),
        vendor: metadata?.vendor,
        receiptUrl: metadata?.receiptUrl,
        approvedBy: metadata?.approvedBy,
        remainingBudget
      };

      // Store expense in database
      await prisma.$executeRaw`
        INSERT INTO course_expenses 
        (id, course_id, category, amount, description, date, vendor, receipt_url, approved_by, remaining_budget)
        VALUES (
          ${expense.id}, ${expense.courseId}, ${expense.category}, ${expense.amount},
          ${expense.description}, ${expense.date}, ${expense.vendor}, ${expense.receiptUrl},
          ${expense.approvedBy}, ${expense.remainingBudget}
        )
      `;

      logger.info(`Expense tracked successfully: ${expenseId}`);
      return expense;
    } catch (error) {
      logger.error(`Error tracking expense for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Manage resources (equipment, studio time, personnel)
   * Requirement 9.3: WHEN resources are needed THEN the System SHALL manage 
   * equipment, studio time, and personnel
   */
  async manageResources(
    courseId: string,
    resourceType: ResourceType,
    resourceName: string,
    quantity: number,
    unit: string,
    startDate: Date,
    endDate: Date | undefined,
    cost: number,
    assignedTo?: string
  ): Promise<ResourceAllocation> {
    try {
      logger.info(
        `Managing resource for course ${courseId}: ${resourceName} (${resourceType})`
      );

      // Create resource allocation
      const resourceId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const resource: ResourceAllocation = {
        id: resourceId,
        courseId,
        resourceType,
        resourceName,
        quantity,
        unit,
        startDate,
        endDate,
        cost,
        assignedTo,
        status: 'ALLOCATED'
      };

      // Store resource allocation in database
      await prisma.$executeRaw`
        INSERT INTO course_resources
        (id, course_id, resource_type, resource_name, quantity, unit, start_date, end_date, 
         cost, assigned_to, status, created_at)
        VALUES (
          ${resource.id}, ${resource.courseId}, ${resource.resourceType}, ${resource.resourceName},
          ${resource.quantity}, ${resource.unit}, ${resource.startDate}, ${resource.endDate},
          ${resource.cost}, ${resource.assignedTo}, ${resource.status}, ${new Date()}
        )
      `;

      // Track resource cost as expense if cost > 0
      if (cost > 0) {
        const category = this.mapResourceTypeToCategory(resourceType);
        await this.trackExpense(
          courseId,
          category,
          cost,
          `${resourceType}: ${resourceName} (${quantity} ${unit})`,
          { approvedBy: assignedTo }
        );
      }

      logger.info(`Resource allocated successfully: ${resourceId}`);
      return resource;
    } catch (error) {
      logger.error(`Error managing resource for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate total cost per course
   * Requirement 9.4: WHEN courses are completed THEN the System SHALL calculate total cost per course
   */
  async calculateCourseCost(courseId: string): Promise<CostReport> {
    try {
      logger.info(`Calculating total cost for course ${courseId}`);

      // Get budget allocation
      const budgetResult = await prisma.$queryRaw<any[]>`
        SELECT cb.total_budget, cb.allocations, c.title as course_name
        FROM course_budgets cb
        LEFT JOIN courses c ON c.id = cb.course_id
        WHERE cb.course_id = ${courseId}
      `;

      if (!budgetResult || budgetResult.length === 0) {
        throw new Error(`No budget found for course ${courseId}`);
      }

      const budget = budgetResult[0];
      const allocations = budget.allocations as any[];

      // Get total expenses
      const expensesResult = await prisma.$queryRaw<any[]>`
        SELECT 
          category,
          SUM(amount) as total_spent,
          COUNT(*) as expense_count
        FROM course_expenses
        WHERE course_id = ${courseId}
        GROUP BY category
      `;

      const expensesByCategory = expensesResult.map((exp: any) => {
        const allocation = allocations.find(a => a.category === exp.category);
        const budgeted = allocation?.amount || 0;
        const spent = Number(exp.total_spent);
        const remaining = budgeted - spent;
        const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;

        return {
          category: exp.category as BudgetCategory,
          budgeted,
          spent,
          remaining,
          percentage
        };
      });

      // Add categories with no expenses
      allocations.forEach(alloc => {
        if (!expensesByCategory.find(e => e.category === alloc.category)) {
          expensesByCategory.push({
            category: alloc.category,
            budgeted: alloc.amount,
            spent: 0,
            remaining: alloc.amount,
            percentage: 0
          });
        }
      });

      // Get resource costs
      const resourcesResult = await prisma.$queryRaw<any[]>`
        SELECT 
          resource_type,
          SUM(cost) as total_cost,
          COUNT(*) as resource_count
        FROM course_resources
        WHERE course_id = ${courseId}
        GROUP BY resource_type
      `;

      const resourceCosts = resourcesResult.map((res: any) => ({
        resourceType: res.resource_type as ResourceType,
        totalCost: Number(res.total_cost),
        count: Number(res.resource_count)
      }));

      // Calculate totals
      const totalExpenses = expensesByCategory.reduce((sum, exp) => sum + exp.spent, 0);
      const totalBudget = budget.total_budget;
      const remainingBudget = totalBudget - totalExpenses;
      const utilizationPercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

      const report: CostReport = {
        courseId,
        courseName: budget.course_name || 'Unknown Course',
        totalBudget,
        totalExpenses,
        remainingBudget,
        utilizationPercentage,
        expensesByCategory,
        resourceCosts,
        generatedAt: new Date()
      };

      logger.info(`Cost report generated for course ${courseId}: $${totalExpenses} spent`);
      return report;
    } catch (error) {
      logger.error(`Error calculating cost for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Generate financial report with grouping
   * Requirement 9.5: WHEN reporting is needed THEN the System SHALL generate 
   * financial reports by course and category
   */
  async generateFinancialReport(
    reportType: 'BY_COURSE' | 'BY_CATEGORY' | 'SUMMARY',
    startDate: Date,
    endDate: Date,
    courseIds?: string[]
  ): Promise<FinancialReport> {
    try {
      logger.info(`Generating financial report: ${reportType} from ${startDate} to ${endDate}`);

      // Build course filter
      const courseFilter = courseIds && courseIds.length > 0
        ? `AND cb.course_id = ANY(ARRAY[${courseIds.map(id => `'${id}'`).join(',')}])`
        : '';

      // Get all course budgets and expenses
      const coursesResult = await prisma.$queryRaw<any[]>`
        SELECT 
          cb.course_id,
          c.title as course_name,
          cb.total_budget,
          COALESCE(SUM(ce.amount), 0) as total_expenses
        FROM course_budgets cb
        LEFT JOIN courses c ON c.id = cb.course_id
        LEFT JOIN course_expenses ce ON ce.course_id = cb.course_id 
          AND ce.date >= ${startDate} AND ce.date <= ${endDate}
        WHERE cb.created_at <= ${endDate} ${courseFilter}
        GROUP BY cb.course_id, c.title, cb.total_budget
      `;

      const courses = coursesResult.map((course: any) => {
        const totalBudget = Number(course.total_budget);
        const totalExpenses = Number(course.total_expenses);
        const remainingBudget = totalBudget - totalExpenses;
        const utilizationPercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

        return {
          courseId: course.course_id,
          courseName: course.course_name || 'Unknown Course',
          totalBudget,
          totalExpenses,
          remainingBudget,
          utilizationPercentage
        };
      });

      // Get category totals
      const categoryResult = await prisma.$queryRaw<any[]>`
        SELECT 
          ce.category,
          SUM(cb.allocations::jsonb -> ce.category ->> 'amount')::numeric as total_budgeted,
          SUM(ce.amount) as total_spent
        FROM course_expenses ce
        JOIN course_budgets cb ON cb.course_id = ce.course_id
        WHERE ce.date >= ${startDate} AND ce.date <= ${endDate} ${courseFilter}
        GROUP BY ce.category
      `;

      const categoryTotals = categoryResult.map((cat: any) => {
        const totalBudgeted = Number(cat.total_budgeted || 0);
        const totalSpent = Number(cat.total_spent);
        const totalRemaining = totalBudgeted - totalSpent;

        return {
          category: cat.category as BudgetCategory,
          totalBudgeted,
          totalSpent,
          totalRemaining
        };
      });

      // Calculate overall summary
      const totalBudgeted = courses.reduce((sum, c) => sum + c.totalBudget, 0);
      const totalSpent = courses.reduce((sum, c) => sum + c.totalExpenses, 0);
      const totalRemaining = totalBudgeted - totalSpent;
      const averageUtilization = courses.length > 0
        ? courses.reduce((sum, c) => sum + c.utilizationPercentage, 0) / courses.length
        : 0;
      const coursesOverBudget = courses.filter(c => c.utilizationPercentage > 100).length;
      const coursesUnderBudget = courses.filter(c => c.utilizationPercentage <= 100).length;

      const report: FinancialReport = {
        reportType,
        startDate,
        endDate,
        courses,
        categoryTotals,
        overallSummary: {
          totalBudgeted,
          totalSpent,
          totalRemaining,
          averageUtilization,
          coursesOverBudget,
          coursesUnderBudget
        },
        generatedAt: new Date()
      };

      logger.info(`Financial report generated: ${courses.length} courses, $${totalSpent} spent`);
      return report;
    } catch (error) {
      logger.error('Error generating financial report:', error);
      throw error;
    }
  }

  /**
   * Helper method to map resource type to budget category
   */
  private mapResourceTypeToCategory(resourceType: ResourceType): BudgetCategory {
    const mapping: Record<ResourceType, BudgetCategory> = {
      [ResourceType.EQUIPMENT]: BudgetCategory.EQUIPMENT,
      [ResourceType.STUDIO_TIME]: BudgetCategory.STUDIO,
      [ResourceType.PERSONNEL]: BudgetCategory.PERSONNEL,
      [ResourceType.SOFTWARE_LICENSE]: BudgetCategory.SOFTWARE,
      [ResourceType.FACILITY]: BudgetCategory.PRODUCTION
    };

    return mapping[resourceType] || BudgetCategory.OTHER;
  }

  /**
   * Get budget allocation for a course
   */
  async getBudgetAllocation(courseId: string): Promise<BudgetAllocation | null> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT total_budget, allocations, created_at, updated_at
        FROM course_budgets
        WHERE course_id = ${courseId}
      `;

      if (!result || result.length === 0) {
        return null;
      }

      const budget = result[0];
      return {
        courseId,
        totalBudget: Number(budget.total_budget),
        allocations: budget.allocations as any[],
        createdAt: budget.created_at,
        updatedAt: budget.updated_at
      };
    } catch (error) {
      logger.error(`Error getting budget allocation for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Get all expenses for a course
   */
  async getCourseExpenses(courseId: string): Promise<ExpenseRecord[]> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT *
        FROM course_expenses
        WHERE course_id = ${courseId}
        ORDER BY date DESC
      `;

      return result.map((exp: any) => ({
        id: exp.id,
        courseId: exp.course_id,
        category: exp.category as BudgetCategory,
        amount: Number(exp.amount),
        description: exp.description,
        date: exp.date,
        vendor: exp.vendor,
        receiptUrl: exp.receipt_url,
        approvedBy: exp.approved_by,
        remainingBudget: Number(exp.remaining_budget)
      }));
    } catch (error) {
      logger.error(`Error getting expenses for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Get all resources for a course
   */
  async getCourseResources(courseId: string): Promise<ResourceAllocation[]> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT *
        FROM course_resources
        WHERE course_id = ${courseId}
        ORDER BY start_date DESC
      `;

      return result.map((res: any) => ({
        id: res.id,
        courseId: res.course_id,
        resourceType: res.resource_type as ResourceType,
        resourceName: res.resource_name,
        quantity: Number(res.quantity),
        unit: res.unit,
        startDate: res.start_date,
        endDate: res.end_date,
        cost: Number(res.cost),
        assignedTo: res.assigned_to,
        status: res.status
      }));
    } catch (error) {
      logger.error(`Error getting resources for course ${courseId}:`, error);
      throw error;
    }
  }
}

export default CourseBudgetService;
