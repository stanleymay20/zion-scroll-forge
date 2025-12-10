-- =====================================================
-- Academic Year Automation System - Security System
-- Purpose: Comprehensive security infrastructure including
--          authentication, authorization, encryption, and audit logging
-- =====================================================

-- =====================================================
-- SECURITY TABLES
-- =====================================================

-- Sessions Table
-- Manages user sessions with expiration
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Audit Logs Table (if not exists from other migrations)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  action VARCHAR(200) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Events Table
-- Tracks security-related events and violations
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  description TEXT NOT NULL,
  details JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Encrypted Data Table
-- Stores encrypted sensitive data with metadata
CREATE TABLE IF NOT EXISTS encrypted_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv VARCHAR(255) NOT NULL,
  tag VARCHAR(255) NOT NULL,
  salt VARCHAR(255) NOT NULL,
  encryption_version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate encrypted fields
  UNIQUE(entity_type, entity_id, field_name)
);

-- Access Control Lists (ACL)
-- Fine-grained access control for resources
CREATE TABLE IF NOT EXISTS access_control_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50),
  permissions TEXT[] NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  -- Ensure unique user/role per resource
  UNIQUE(resource_type, resource_id, user_id, role)
);

-- Rate Limiting Table
-- Track API rate limits per user/IP
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL, -- user_id or IP address
  identifier_type VARCHAR(50) NOT NULL CHECK (identifier_type IN ('user', 'ip', 'api_key')),
  endpoint VARCHAR(255) NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  blocked_until TIMESTAMP WITH TIME ZONE,
  
  -- Unique constraint for rate limit tracking
  UNIQUE(identifier, identifier_type, endpoint, window_start)
);

-- Security Policies Table
-- Configurable security policies
CREATE TABLE IF NOT EXISTS security_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name VARCHAR(200) NOT NULL UNIQUE,
  policy_type VARCHAR(100) NOT NULL,
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Failed Login Attempts
-- Track failed authentication attempts
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  ip_address INET NOT NULL,
  user_agent TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  failure_reason VARCHAR(255)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Sessions Indexes
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_active ON sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Audit Logs Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_success ON audit_logs(success);

-- Security Events Indexes
CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_resolved ON security_events(resolved);
CREATE INDEX idx_security_events_created ON security_events(created_at DESC);

-- Encrypted Data Indexes
CREATE INDEX idx_encrypted_data_entity ON encrypted_data(entity_type, entity_id);
CREATE INDEX idx_encrypted_data_field ON encrypted_data(field_name);

-- ACL Indexes
CREATE INDEX idx_acl_resource ON access_control_lists(resource_type, resource_id);
CREATE INDEX idx_acl_user ON access_control_lists(user_id);
CREATE INDEX idx_acl_active ON access_control_lists(is_active) WHERE is_active = true;

-- Rate Limits Indexes
CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier, identifier_type);
CREATE INDEX idx_rate_limits_endpoint ON rate_limits(endpoint);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start, window_end);

-- Failed Login Attempts Indexes
CREATE INDEX idx_failed_logins_email ON failed_login_attempts(email);
CREATE INDEX idx_failed_logins_ip ON failed_login_attempts(ip_address);
CREATE INDEX idx_failed_logins_time ON failed_login_attempts(attempt_time DESC);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function: Check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier VARCHAR,
  p_identifier_type VARCHAR,
  p_endpoint VARCHAR,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_window_end TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  v_window_end := NOW();
  
  -- Count requests in current window
  SELECT COALESCE(SUM(request_count), 0) INTO v_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND endpoint = p_endpoint
    AND window_end > v_window_start;
  
  -- Check if blocked
  IF EXISTS (
    SELECT 1 FROM rate_limits
    WHERE identifier = p_identifier
      AND identifier_type = p_identifier_type
      AND endpoint = p_endpoint
      AND blocked_until > NOW()
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check if limit exceeded
  IF v_count >= p_max_requests THEN
    -- Block for 1 hour
    INSERT INTO rate_limits (
      identifier,
      identifier_type,
      endpoint,
      request_count,
      window_start,
      window_end,
      blocked_until
    ) VALUES (
      p_identifier,
      p_identifier_type,
      p_endpoint,
      1,
      NOW(),
      NOW() + (p_window_minutes || ' minutes')::INTERVAL,
      NOW() + INTERVAL '1 hour'
    )
    ON CONFLICT (identifier, identifier_type, endpoint, window_start)
    DO UPDATE SET
      request_count = rate_limits.request_count + 1,
      blocked_until = NOW() + INTERVAL '1 hour';
    
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  INSERT INTO rate_limits (
    identifier,
    identifier_type,
    endpoint,
    request_count,
    window_start,
    window_end
  ) VALUES (
    p_identifier,
    p_identifier_type,
    p_endpoint,
    1,
    NOW(),
    NOW() + (p_window_minutes || ' minutes')::INTERVAL
  )
  ON CONFLICT (identifier, identifier_type, endpoint, window_start)
  DO UPDATE SET
    request_count = rate_limits.request_count + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Check user permissions
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_resource_type VARCHAR,
  p_resource_id UUID,
  p_permission VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
BEGIN
  -- Check ACL
  SELECT EXISTS (
    SELECT 1 FROM access_control_lists
    WHERE user_id = p_user_id
      AND resource_type = p_resource_type
      AND resource_id = p_resource_id
      AND p_permission = ANY(permissions)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Log security event
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type VARCHAR,
  p_severity VARCHAR,
  p_user_id UUID,
  p_ip_address INET,
  p_description TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO security_events (
    event_type,
    severity,
    user_id,
    ip_address,
    description,
    details
  ) VALUES (
    p_event_type,
    p_severity,
    p_user_id,
    p_ip_address,
    p_description,
    p_details
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM sessions
  WHERE expires_at < NOW()
    OR (is_active = false AND last_activity < NOW() - INTERVAL '7 days');
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Clean old audit logs
CREATE OR REPLACE FUNCTION clean_old_audit_logs(p_retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE timestamp < NOW() - (p_retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all security tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_control_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Sessions Policies
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Audit Logs Policies
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Security Events Policies
CREATE POLICY "Admins can view all security events"
  ON security_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update security events"
  ON security_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Encrypted Data Policies
CREATE POLICY "Only system can access encrypted data"
  ON encrypted_data FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ACL Policies
CREATE POLICY "Users can view ACLs for their resources"
  ON access_control_lists FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'registrar')
    )
  );

CREATE POLICY "Admins can manage ACLs"
  ON access_control_lists FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Security Policies Policies
CREATE POLICY "Admins can manage security policies"
  ON security_policies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update updated_at timestamp
CREATE TRIGGER update_encrypted_data_updated_at
  BEFORE UPDATE ON encrypted_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_policies_updated_at
  BEFORE UPDATE ON security_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update session last_activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_last_activity
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

-- =====================================================
-- SCHEDULED JOBS (via pg_cron if available)
-- =====================================================

-- Clean expired sessions daily
-- SELECT cron.schedule('clean-expired-sessions', '0 2 * * *', 'SELECT clean_expired_sessions()');

-- Clean old audit logs monthly
-- SELECT cron.schedule('clean-old-audit-logs', '0 3 1 * *', 'SELECT clean_old_audit_logs(90)');

-- =====================================================
-- INITIAL SECURITY POLICIES
-- =====================================================

-- Insert default security policies
INSERT INTO security_policies (policy_name, policy_type, configuration, is_active)
VALUES
  ('password_policy', 'authentication', '{
    "min_length": 12,
    "require_uppercase": true,
    "require_lowercase": true,
    "require_numbers": true,
    "require_special": true,
    "max_age_days": 90,
    "prevent_reuse": 5
  }'::jsonb, true),
  
  ('session_policy', 'session', '{
    "max_age_hours": 24,
    "idle_timeout_minutes": 60,
    "max_concurrent_sessions": 5,
    "require_mfa": false
  }'::jsonb, true),
  
  ('rate_limit_policy', 'rate_limiting', '{
    "api_requests_per_minute": 100,
    "login_attempts_per_hour": 5,
    "password_reset_per_day": 3
  }'::jsonb, true),
  
  ('encryption_policy', 'encryption', '{
    "algorithm": "aes-256-gcm",
    "key_rotation_days": 90,
    "encrypt_at_rest": true,
    "encrypt_in_transit": true
  }'::jsonb, true),
  
  ('audit_policy', 'auditing', '{
    "log_all_access": true,
    "log_failed_attempts": true,
    "retention_days": 90,
    "alert_on_suspicious": true
  }'::jsonb, true)
ON CONFLICT (policy_name) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE sessions IS 'User session management with expiration tracking';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system operations';
COMMENT ON TABLE security_events IS 'Security-related events and violations tracking';
COMMENT ON TABLE encrypted_data IS 'Encrypted sensitive data storage with metadata';
COMMENT ON TABLE access_control_lists IS 'Fine-grained access control for resources';
COMMENT ON TABLE rate_limits IS 'API rate limiting tracking per user/IP';
COMMENT ON TABLE security_policies IS 'Configurable security policies';
COMMENT ON TABLE failed_login_attempts IS 'Failed authentication attempts tracking';

COMMENT ON FUNCTION check_rate_limit IS 'Checks and enforces rate limits for API endpoints';
COMMENT ON FUNCTION has_permission IS 'Checks if user has specific permission for resource';
COMMENT ON FUNCTION log_security_event IS 'Logs security-related events';
COMMENT ON FUNCTION clean_expired_sessions IS 'Removes expired and inactive sessions';
COMMENT ON FUNCTION clean_old_audit_logs IS 'Removes audit logs older than retention period';
