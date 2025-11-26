import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Plus } from 'lucide-react';

interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  approvedBy: string;
}

interface BudgetTrackerProps {
  courseId: string;
  onSave?: (budget: any) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ courseId, onSave }) => {
  const [totalBudget, setTotalBudget] = useState(50000);
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { name: 'Production', allocated: 20000, spent: 12500, remaining: 7500 },
    { name: 'Faculty', allocated: 15000, spent: 10000, remaining: 5000 },
    { name: 'Materials', allocated: 10000, spent: 6000, remaining: 4000 },
    { name: 'Equipment', allocated: 3000, spent: 2800, remaining: 200 },
    { name: 'Software', allocated: 2000, spent: 1500, remaining: 500 }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      category: 'Production',
      description: 'Video editing services',
      amount: 5000,
      date: '2024-01-15',
      approvedBy: 'John Doe'
    },
    {
      id: '2',
      category: 'Faculty',
      description: 'Guest lecturer honorarium',
      amount: 2000,
      date: '2024-01-20',
      approvedBy: 'Jane Smith'
    }
  ]);

  const [newExpense, setNewExpense] = useState({
    category: 'Production',
    description: '',
    amount: 0
  });

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const percentageUsed = (totalSpent / totalBudget) * 100;

  const addExpense = () => {
    if (!newExpense.description || newExpense.amount <= 0) return;

    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category,
      description: newExpense.description,
      amount: newExpense.amount,
      date: new Date().toISOString().split('T')[0],
      approvedBy: 'Current User'
    };

    setExpenses([...expenses, expense]);

    // Update category spent amount
    const updatedCategories = categories.map(cat => {
      if (cat.name === newExpense.category) {
        return {
          ...cat,
          spent: cat.spent + newExpense.amount,
          remaining: cat.remaining - newExpense.amount
        };
      }
      return cat;
    });
    setCategories(updatedCategories);

    // Reset form
    setNewExpense({
      category: 'Production',
      description: '',
      amount: 0
    });
  };

  const getCategoryColor = (category: BudgetCategory) => {
    const percentageUsed = (category.spent / category.allocated) * 100;
    if (percentageUsed >= 90) return 'text-red-600';
    if (percentageUsed >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCategoryBadge = (category: BudgetCategory) => {
    const percentageUsed = (category.spent / category.allocated) * 100;
    if (percentageUsed >= 90) return <Badge className="bg-red-600">Critical</Badge>;
    if (percentageUsed >= 75) return <Badge className="bg-yellow-600">Warning</Badge>;
    return <Badge className="bg-green-600">On Track</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Budget Tracker</CardTitle>
          <CardDescription>
            Monitor course development costs and resource allocation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span className="text-2xl font-bold">
                    ${totalBudget.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  <span className="text-2xl font-bold text-red-600">
                    ${totalSpent.toLocaleString()}
                  </span>
                </div>
                <Progress value={percentageUsed} className="h-2 mt-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {percentageUsed.toFixed(1)}% of budget used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">
                    ${totalRemaining.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((totalRemaining / totalBudget) * 100).toFixed(1)}% remaining
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category, index) => {
                  const percentageUsed = (category.spent / category.allocated) * 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{category.name}</span>
                          {getCategoryBadge(category)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className={getCategoryColor(category)}>
                            ${category.spent.toLocaleString()}
                          </span>
                          {' / '}
                          ${category.allocated.toLocaleString()}
                        </div>
                      </div>
                      <Progress value={percentageUsed} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{percentageUsed.toFixed(1)}% used</span>
                        <span>${category.remaining.toLocaleString()} remaining</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Add New Expense */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Record New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="e.g., Video editing services"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                    <Button onClick={addExpense}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {expenses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No expenses recorded yet
                  </div>
                ) : (
                  expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{expense.category}</Badge>
                          <span className="font-medium">{expense.description}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {expense.date} • Approved by {expense.approvedBy}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          -${expense.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Budget Alerts */}
          {categories.some(cat => (cat.spent / cat.allocated) >= 0.9) && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-red-800">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Budget Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {categories
                    .filter(cat => (cat.spent / cat.allocated) >= 0.9)
                    .map((cat, index) => (
                      <li key={index} className="text-sm text-red-700">
                        <strong>{cat.name}</strong> category has used{' '}
                        {((cat.spent / cat.allocated) * 100).toFixed(1)}% of allocated budget
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline">
              Export Report
            </Button>
            <Button onClick={() => onSave?.({ totalBudget, categories, expenses })}>
              Save Budget
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetTracker;
