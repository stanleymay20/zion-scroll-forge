-- Access Audit Logs Migration
-- "Let all things be done decently and in order" (1 Corinthians 14:40)
-- Comprehensive audit logging for compliance and accountability

-- ============================================================================
-- ACCESS AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS access_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event Details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'ACCESS_GRANTED',
    'ACCESS_REVOKED',
    'ACCESS_EXTENDED',
    'ACCESS_CHECKED',
    'SUBSCRIPTION_CREATED',
    'SUBSCRIPTION_UPDATED',
    'SUBSCRIPTION_CANCELED',
    'PAYMENT_SUCCEEDED',
    'PAYMENT_FAILED',
    'SCROLLGOLD_AWARDED',
    'SCROLLGOLD_SPENT',
    'TIER_UPGRADED',
    'TIER_DOWNGRADED',
    'GRACE_PERIOD_STARTED',
    'GRACE_PERIOD_ENDED'
  )),
  
  -- User and Entity
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'subscription', 'payment', 'enrollment_access', etc.
  entity_id TEXT, -- UUID or identifier of the entity
  
  -- Action Details
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  
  -- Request Context
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamp
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_access_audit_logs_user_id ON access_audit_logs(user_id);
CREATE INDEX idx_access_audit_logs_event_type ON access_audit_logs(event_type);
CREATE INDEX idx_access_audit_logs_entity ON access_audit_logs(entity_type, entity_id);
CREATE INDEX idx_access_audit_logs_timestamp ON access_audit_logs(timestamp DESC);
CREATE INDEX idx_access_audit_logs_action ON access_audit_logs(action);

-- Composite index for common queries
CREATE INDEX idx_access_audit_logs_user_event_time 
  ON access_audit_logs(user_id, event_type, timestamp DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE access_audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON access_audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON access_audit_logs FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON access_audit_logs FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- No updates or deletes allowed (immutable audit trail)
CREATE POLICY "No updates allowed"
  ON access_audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "No deletes allowed"
  ON access_audit_logs FOR DELETE
  USING (false);

-- ============================================================================
-- FUNCTIONS FOR AUDIT LOG QUERIES
-- ============================================================================

-- Function to get audit summary for a user
CREATE OR REPLACE FUNCTION get_user_audit_summary(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  event_type TEXT,
  event_count BIGINT,
  first_occurrence TIMESTAMPTZ,
  last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aal.event_type,
    COUNT(*) as event_count,
    MIN(aal.timestamp) as first_occurrence,
    MAX(aal.timestamp) as last_occurrence
  FROM access_audit_logs aal
  WHERE aal.user_id = p_user_id
    AND aal.timestamp >= p_start_date
    AND aal.timestamp <= p_end_date
  GROUP BY aal.event_type
  ORDER BY event_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get compliance report
CREATE OR REPLACE FUNCTION get_compliance_report(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_events BIGINT,
  access_grants BIGINT,
  access_revocations BIGINT,
  payment_successes BIGINT,
  payment_failures BIGINT,
  subscription_cancellations BIGINT,
  tier_changes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE event_type = 'ACCESS_GRANTED') as access_grants,
    COUNT(*) FILTER (WHERE event_type = 'ACCESS_REVOKED') as access_revocations,
    COUNT(*) FILTER (WHERE event_type = 'PAYMENT_SUCCEEDED') as payment_successes,
    COUNT(*) FILTER (WHERE event_type = 'PAYMENT_FAILED') as payment_failures,
    COUNT(*) FILTER (WHERE event_type = 'SUBSCRIPTION_CANCELED') as subscription_cancellations,
    COUNT(*) FILTER (WHERE event_type IN ('TIER_UPGRADED', 'TIER_DOWNGRADED')) as tier_changes
  FROM access_audit_logs
  WHERE timestamp >= p_start_date
    AND timestamp <= p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription timeline
CREATE OR REPLACE FUNCTION get_subscription_timeline(
  p_subscription_id TEXT
)
RETURNS TABLE (
  timestamp TIMESTAMPTZ,
  event_type TEXT,
  action TEXT,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aal.timestamp,
    aal.event_type,
    aal.action,
    aal.details
  FROM access_audit_logs aal
  WHERE aal.entity_id = p_subscription_id
    AND aal.entity_type = 'subscription'
  ORDER BY aal.timestamp ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RETENTION POLICY (Optional - for GDPR compliance)
-- ============================================================================

-- Function to archive old audit logs (older than 7 years)
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- In production, you might want to move these to an archive table
  -- For now, we'll just count them
  SELECT COUNT(*) INTO archived_count
  FROM access_audit_logs
  WHERE timestamp < NOW() - INTERVAL '7 years';
  
  -- Optionally delete or move to archive
  -- DELETE FROM access_audit_logs WHERE timestamp < NOW() - INTERVAL '7 years';
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE access_audit_logs IS 'Immutable audit trail for all access control and billing operations';
COMMENT ON COLUMN access_audit_logs.event_type IS 'Type of audit event (ACCESS_GRANTED, PAYMENT_SUCCEEDED, etc.)';
COMMENT ON COLUMN access_audit_logs.user_id IS 'User who triggered or was affected by the event';
COMMENT ON COLUMN access_audit_logs.entity_type IS 'Type of entity affected (subscription, payment, enrollment_access)';
COMMENT ON COLUMN access_audit_logs.entity_id IS 'Unique identifier of the affected entity';
COMMENT ON COLUMN access_audit_logs.action IS 'Specific action taken (grant_access, revoke_access, etc.)';
COMMENT ON COLUMN access_audit_logs.details IS 'Additional context and metadata about the event';
COMMENT ON COLUMN access_audit_logs.ip_address IS 'IP address of the request (if applicable)';
COMMENT ON COLUMN access_audit_logs.user_agent IS 'User agent string of the request (if applicable)';

COMMENT ON FUNCTION get_user_audit_summary IS 'Get summary of audit events for a user within a date range';
COMMENT ON FUNCTION get_compliance_report IS 'Generate compliance report with key metrics for a date range';
COMMENT ON FUNCTION get_subscription_timeline IS 'Get chronological timeline of events for a subscription';

