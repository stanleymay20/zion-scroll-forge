-- Billing Disputes Table Migration
-- Supports Task 4.5: Billing dispute resolution workflow

-- ============================================================================
-- BILLING DISPUTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dispute Details
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'OPEN',
    'UNDER_REVIEW',
    'RESOLVED',
    'REJECTED',
    'ESCALATED'
  )) DEFAULT 'OPEN',
  priority TEXT NOT NULL CHECK (priority IN (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
  )) DEFAULT 'MEDIUM',
  
  -- Resolution
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_billing_disputes_invoice_id ON billing_disputes(invoice_id);
CREATE INDEX idx_billing_disputes_user_id ON billing_disputes(user_id);
CREATE INDEX idx_billing_disputes_status ON billing_disputes(status);
CREATE INDEX idx_billing_disputes_priority ON billing_disputes(priority);
CREATE INDEX idx_billing_disputes_created_at ON billing_disputes(created_at DESC);

-- Add RLS policies for billing disputes
ALTER TABLE billing_disputes ENABLE ROW LEVEL SECURITY;

-- Users can view their own disputes
CREATE POLICY "Users can view own disputes"
  ON billing_disputes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create disputes for their own invoices
CREATE POLICY "Users can create own disputes"
  ON billing_disputes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update disputes
CREATE POLICY "Admins can update disputes"
  ON billing_disputes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE billing_disputes IS 'Tracks billing disputes and resolution workflow for invoices';
