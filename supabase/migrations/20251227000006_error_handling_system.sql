-- Error Handling System for Academic Year Automation
-- Tracks errors, recovery attempts, and provides monitoring capabilities

-- Create error tracking table
CREATE TABLE IF NOT EXISTS academic_year_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  stack TEXT,
  context JSONB NOT NULL DEFAULT '{}',
  recovery_strategy VARCHAR(20) NOT NULL CHECK (recovery_strategy IN ('retry', 'fallback', 'compensate', 'escalate', 'ignore')),
  recovery_attempts INTEGER NOT NULL DEFAULT 0,
  max_recovery_attempts INTEGER NOT NULL DEFAULT 3,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_academic_year_errors_type ON academic_year_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_academic_year_errors_severity ON academic_year_errors(severity);
CREATE INDEX IF NOT EXISTS idx_academic_year_errors_resolved ON academic_year_errors(resolved);
CREATE INDEX IF NOT EXISTS idx_academic_year_errors_created_at ON academic_year_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_academic_year_errors_context_service ON academic_year_errors((context->>'service'));
CREATE INDEX IF NOT EXISTS idx_academic_year_errors_context_user ON academic_year_errors((context->>'userId'));

-- Create error recovery log table
CREATE TABLE IF NOT EXISTS error_recovery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID NOT NULL REFERENCES academic_year_errors(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  strategy VARCHAR(20) NOT NULL,
  success BOOLEAN NOT NULL,
  message TEXT,
  recovery_data JSONB,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for recovery log
CREATE INDEX IF NOT EXISTS idx_error_recovery_log_error_id ON error_recovery_log(error_id);
CREATE INDEX IF NOT EXISTS idx_error_recovery_log_attempted_at ON error_recovery_log(attempted_at DESC);

-- Create error escalation table
CREATE TABLE IF NOT EXISTS error_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID NOT NULL REFERENCES academic_year_errors(id) ON DELETE CASCADE,
  escalated_to_user_id UUID,
  escalation_reason TEXT NOT NULL,
  escalation_level VARCHAR(20) NOT NULL CHECK (escalation_level IN ('team_lead', 'manager', 'admin', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'resolved', 'closed')),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for escalations
CREATE INDEX IF NOT EXISTS idx_error_escalations_error_id ON error_escalations(error_id);
CREATE INDEX IF NOT EXISTS idx_error_escalations_status ON error_escalations(status);
CREATE INDEX IF NOT EXISTS idx_error_escalations_level ON error_escalations(escalation_level);
CREATE INDEX IF NOT EXISTS idx_error_escalations_user ON error_escalations(escalated_to_user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_academic_year_errors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_update_academic_year_errors_updated_at ON academic_year_errors;
CREATE TRIGGER trigger_update_academic_year_errors_updated_at
  BEFORE UPDATE ON academic_year_errors
  FOR EACH ROW
  EXECUTE FUNCTION update_academic_year_errors_updated_at();

-- Create function to get error statistics
CREATE OR REPLACE FUNCTION get_error_statistics(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  total_errors BIGINT,
  resolved_errors BIGINT,
  unresolved_errors BIGINT,
  critical_errors BIGINT,
  high_errors BIGINT,
  medium_errors BIGINT,
  low_errors BIGINT,
  avg_recovery_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_errors,
    COUNT(*) FILTER (WHERE resolved = TRUE)::BIGINT AS resolved_errors,
    COUNT(*) FILTER (WHERE resolved = FALSE)::BIGINT AS unresolved_errors,
    COUNT(*) FILTER (WHERE severity = 'critical')::BIGINT AS critical_errors,
    COUNT(*) FILTER (WHERE severity = 'high')::BIGINT AS high_errors,
    COUNT(*) FILTER (WHERE severity = 'medium')::BIGINT AS medium_errors,
    COUNT(*) FILTER (WHERE severity = 'low')::BIGINT AS low_errors,
    AVG(resolved_at - created_at) FILTER (WHERE resolved = TRUE) AS avg_recovery_time
  FROM academic_year_errors
  WHERE (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- Create function to get top errors by type
CREATE OR REPLACE FUNCTION get_top_errors_by_type(
  p_limit INTEGER DEFAULT 10,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  error_type VARCHAR(50),
  error_count BIGINT,
  resolved_count BIGINT,
  unresolved_count BIGINT,
  avg_recovery_attempts NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.error_type,
    COUNT(*)::BIGINT AS error_count,
    COUNT(*) FILTER (WHERE e.resolved = TRUE)::BIGINT AS resolved_count,
    COUNT(*) FILTER (WHERE e.resolved = FALSE)::BIGINT AS unresolved_count,
    AVG(e.recovery_attempts)::NUMERIC AS avg_recovery_attempts
  FROM academic_year_errors e
  WHERE (p_start_date IS NULL OR e.created_at >= p_start_date)
    AND (p_end_date IS NULL OR e.created_at <= p_end_date)
  GROUP BY e.error_type
  ORDER BY error_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to get errors by service
CREATE OR REPLACE FUNCTION get_errors_by_service(
  p_limit INTEGER DEFAULT 10,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  service VARCHAR(255),
  error_count BIGINT,
  critical_count BIGINT,
  high_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (e.context->>'service')::VARCHAR(255) AS service,
    COUNT(*)::BIGINT AS error_count,
    COUNT(*) FILTER (WHERE e.severity = 'critical')::BIGINT AS critical_count,
    COUNT(*) FILTER (WHERE e.severity = 'high')::BIGINT AS high_count
  FROM academic_year_errors e
  WHERE (p_start_date IS NULL OR e.created_at >= p_start_date)
    AND (p_end_date IS NULL OR e.created_at <= p_end_date)
    AND e.context->>'service' IS NOT NULL
  GROUP BY (e.context->>'service')
  ORDER BY error_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-escalate unresolved critical errors
CREATE OR REPLACE FUNCTION auto_escalate_critical_errors()
RETURNS INTEGER AS $$
DECLARE
  escalated_count INTEGER := 0;
  error_record RECORD;
BEGIN
  -- Find critical errors that are unresolved and not yet escalated
  FOR error_record IN
    SELECT e.id, e.error_type, e.message, e.severity
    FROM academic_year_errors e
    WHERE e.severity = 'critical'
      AND e.resolved = FALSE
      AND e.created_at < NOW() - INTERVAL '15 minutes'
      AND NOT EXISTS (
        SELECT 1 FROM error_escalations esc
        WHERE esc.error_id = e.id
      )
  LOOP
    -- Create escalation
    INSERT INTO error_escalations (
      error_id,
      escalation_reason,
      escalation_level,
      status
    ) VALUES (
      error_record.id,
      'Auto-escalated: Critical error unresolved for 15+ minutes',
      'critical',
      'pending'
    );
    
    escalated_count := escalated_count + 1;
  END LOOP;
  
  RETURN escalated_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old resolved errors
CREATE OR REPLACE FUNCTION cleanup_old_resolved_errors(
  p_retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM academic_year_errors
    WHERE resolved = TRUE
      AND resolved_at < NOW() - (p_retention_days || ' days')::INTERVAL
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE academic_year_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_recovery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_escalations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for academic_year_errors
CREATE POLICY "Allow service role full access to errors"
  ON academic_year_errors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view errors"
  ON academic_year_errors
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for error_recovery_log
CREATE POLICY "Allow service role full access to recovery log"
  ON error_recovery_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view recovery log"
  ON error_recovery_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for error_escalations
CREATE POLICY "Allow service role full access to escalations"
  ON error_escalations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view escalations"
  ON error_escalations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow assigned users to update escalations"
  ON error_escalations
  FOR UPDATE
  TO authenticated
  USING (escalated_to_user_id = auth.uid())
  WITH CHECK (escalated_to_user_id = auth.uid());

-- Add comments for documentation
COMMENT ON TABLE academic_year_errors IS 'Tracks all errors in the Academic Year Automation System with recovery information';
COMMENT ON TABLE error_recovery_log IS 'Logs all recovery attempts for errors';
COMMENT ON TABLE error_escalations IS 'Tracks error escalations to administrators';
COMMENT ON FUNCTION get_error_statistics IS 'Returns comprehensive error statistics for a given time period';
COMMENT ON FUNCTION get_top_errors_by_type IS 'Returns the most common error types with resolution statistics';
COMMENT ON FUNCTION get_errors_by_service IS 'Returns error counts grouped by service';
COMMENT ON FUNCTION auto_escalate_critical_errors IS 'Automatically escalates unresolved critical errors';
COMMENT ON FUNCTION cleanup_old_resolved_errors IS 'Removes old resolved errors to maintain database performance';
