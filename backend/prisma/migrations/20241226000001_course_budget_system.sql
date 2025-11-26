-- Course Budget System Migration
-- Supports budget allocation, expense tracking, and resource management

-- Course budgets table
CREATE TABLE IF NOT EXISTS course_budgets (
  course_id TEXT PRIMARY KEY,
  total_budget DECIMAL(12, 2) NOT NULL CHECK (total_budget >= 0),
  allocations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Course expenses table
CREATE TABLE IF NOT EXISTS course_expenses (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  description TEXT NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  vendor TEXT,
  receipt_url TEXT,
  approved_by TEXT,
  remaining_budget DECIMAL(12, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Course resources table
CREATE TABLE IF NOT EXISTS course_resources (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  cost DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  assigned_to TEXT,
  status TEXT NOT NULL DEFAULT 'REQUESTED',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_expenses_course_id ON course_expenses(course_id);
CREATE INDEX IF NOT EXISTS idx_course_expenses_category ON course_expenses(category);
CREATE INDEX IF NOT EXISTS idx_course_expenses_date ON course_expenses(date);
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_type ON course_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_course_resources_status ON course_resources(status);

-- Comments for documentation
COMMENT ON TABLE course_budgets IS 'Budget allocations for course development projects';
COMMENT ON TABLE course_expenses IS 'Expense tracking for course development';
COMMENT ON TABLE course_resources IS 'Resource allocation and management for courses';

COMMENT ON COLUMN course_budgets.allocations IS 'JSON array of budget allocations by category';
COMMENT ON COLUMN course_expenses.remaining_budget IS 'Remaining budget in category after this expense';
COMMENT ON COLUMN course_resources.status IS 'Resource status: REQUESTED, ALLOCATED, IN_USE, RELEASED';
