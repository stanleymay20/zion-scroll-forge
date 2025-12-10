-- Workflow & Notifications Schema
-- Migration: 20251227000005_workflow_notifications
-- Task 5: Workflow & Notifications Schema
-- Comprehensive workflow automation and notification system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- WORKFLOW MANAGEMENT SYSTEM
-- =====================================================

-- Workflow type enumeration (must be created first)
DO $$ BEGIN
    CREATE TYPE workflow_type AS ENUM (
        'admission',
        'registration',
        'enrollment',
        'grading',
        'graduation',
        'notification',
        'approval',
        'custom'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE execution_status AS ENUM ('pending','running','completed','failed','cancelled','paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM ('low','normal','high','urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('email','sms','push','in_app','webhook');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM ('pending','sent','delivered','failed','read');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE step_type AS ENUM ('action','condition','approval','notification','delay','custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_category AS ENUM ('academic','administrative','social','spiritual','system','alert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_method AS ENUM ('email','sms','push','in_app','webhook');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE digest_frequency AS ENUM ('realtime','hourly','daily','weekly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Workflow definitions and templates
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Workflow Identity
    name VARCHAR(200) NOT NULL,
    description TEXT,
    workflow_type workflow_type NOT NULL,
    
    -- Configuration
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    steps JSONB NOT NULL DEFAULT '[]',
    
    -- Execution Settings
    is_active BOOLEAN DEFAULT true,
    auto_start BOOLEAN DEFAULT false,
    max_retries INTEGER DEFAULT 3,
    timeout_minutes INTEGER DEFAULT 60,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    is_current_version BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT workflows_max_retries_check CHECK (max_retries >= 0),
    CONSTRAINT workflows_timeout_check CHECK (timeout_minutes > 0),
    CONSTRAINT workflows_version_check CHECK (version > 0)
);

-- Workflow type enumeration
DO $$ BEGIN
    CREATE TYPE workflow_type AS ENUM (
        'student_enrollment',
        'course_approval',
        'grade_processing',
        'faculty_onboarding',
        'academic_standing_review',
        'graduation_audit',
        'financial_aid_processing',
        'content_moderation',
        'system_maintenance',
        'custom'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Workflow execution instances
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    
    -- Execution Context
    triggered_by_user_id UUID REFERENCES auth.users(id),
    trigger_event VARCHAR(100),
    context_data JSONB DEFAULT '{}',
    
    -- Status and Progress
    status execution_status NOT NULL DEFAULT 'pending',
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER NOT NULL,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Error Handling
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    error_details JSONB,
    
    -- Results
    execution_results JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT workflow_executions_steps_check CHECK (current_step >= 0 AND current_step <= total_steps),
    CONSTRAINT workflow_executions_retry_check CHECK (retry_count >= 0)
);

-- Execution status enumeration
DO $$ BEGIN
    CREATE TYPE execution_status AS ENUM (
        'pending',
        'running',
        'paused',
        'completed',
        'failed',
        'cancelled',
        'timeout'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Workflow step executions
CREATE TABLE IF NOT EXISTS workflow_step_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    workflow_execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    
    -- Step Details
    step_number INTEGER NOT NULL,
    step_name VARCHAR(200) NOT NULL,
    step_type step_type NOT NULL,
    
    -- Configuration
    step_config JSONB DEFAULT '{}',
    input_data JSONB DEFAULT '{}',
    
    -- Execution
    status execution_status NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT workflow_step_executions_step_number_check CHECK (step_number > 0),
    UNIQUE(workflow_execution_id, step_number)
);

-- Step type enumeration
DO $$ BEGIN
    CREATE TYPE step_type AS ENUM (
        'approval',
        'notification',
        'data_validation',
        'api_call',
        'email_send',
        'database_update',
        'file_processing',
        'condition_check',
        'delay',
        'custom_script'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- NOTIFICATION SYSTEM
-- =====================================================

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template Identity
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    category notification_category NOT NULL,
    
    -- Content
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    
    -- Delivery Configuration
    delivery_methods delivery_method[] NOT NULL DEFAULT '{email}',
    priority notification_priority NOT NULL DEFAULT 'normal',
    
    -- Personalization
    supports_variables BOOLEAN DEFAULT true,
    required_variables TEXT[] DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification category enumeration
DO $$ BEGIN
    CREATE TYPE notification_category AS ENUM (
        'academic',
        'administrative',
        'financial',
        'system',
        'marketing',
        'emergency',
        'spiritual_formation'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Delivery method enumeration
DO $$ BEGIN
    CREATE TYPE delivery_method AS ENUM (
        'email',
        'sms',
        'push_notification',
        'in_app',
        'webhook',
        'slack',
        'teams'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification priority enumeration
DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM (
        'low',
        'normal',
        'high',
        'urgent',
        'critical'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification queue and delivery tracking
-- Drop old notifications table if it exists with incompatible schema
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    template_id UUID REFERENCES notification_templates(id),
    workflow_execution_id UUID REFERENCES workflow_executions(id),
    
    -- Recipients
    recipient_user_id UUID REFERENCES auth.users(id),
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    
    -- Content
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    
    -- Delivery Configuration
    delivery_method delivery_method NOT NULL DEFAULT 'email',
    priority notification_priority NOT NULL DEFAULT 'normal',
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status and Tracking
    status notification_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery Details
    delivery_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    delivery_error TEXT,
    
    -- Tracking
    tracking_id UUID DEFAULT uuid_generate_v4(),
    external_message_id VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT notifications_delivery_attempts_check CHECK (delivery_attempts >= 0),
    CONSTRAINT notifications_recipient_check CHECK (
        recipient_user_id IS NOT NULL OR 
        recipient_email IS NOT NULL OR 
        recipient_phone IS NOT NULL
    )
);

-- Notification status enumeration
DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM (
        'pending',
        'queued',
        'sending',
        'sent',
        'delivered',
        'read',
        'failed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- USER NOTIFICATION PREFERENCES
-- =====================================================

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Preference Settings
    category notification_category NOT NULL,
    enabled BOOLEAN DEFAULT true,
    delivery_methods delivery_method[] DEFAULT '{email}',
    
    -- Quiet Hours
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Frequency Control
    digest_enabled BOOLEAN DEFAULT false,
    digest_frequency digest_frequency DEFAULT 'daily',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, category)
);

-- Digest frequency enumeration
DO $$ BEGIN
    CREATE TYPE digest_frequency AS ENUM (
        'realtime',
        'hourly',
        'daily',
        'weekly'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Workflow indexes
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_workflows_current_version ON workflows(is_current_version);

-- Workflow execution indexes
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started ON workflow_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user ON workflow_executions(triggered_by_user_id);

-- Workflow step execution indexes
CREATE INDEX IF NOT EXISTS idx_workflow_step_executions_execution ON workflow_step_executions(workflow_execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_step_executions_status ON workflow_step_executions(status);

-- Notification template indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON notification_templates(category);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

-- Notification indexes
-- Add missing columns if they don't exist (for existing notifications tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'template_id') THEN
        ALTER TABLE notifications ADD COLUMN template_id UUID REFERENCES notification_templates(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'workflow_execution_id') THEN
        ALTER TABLE notifications ADD COLUMN workflow_execution_id UUID REFERENCES workflow_executions(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'recipient_user_id') THEN
        ALTER TABLE notifications ADD COLUMN recipient_user_id UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'scheduled_for') THEN
        ALTER TABLE notifications ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'priority') THEN
        ALTER TABLE notifications ADD COLUMN priority notification_priority DEFAULT 'normal';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_template ON notifications(template_id);
CREATE INDEX IF NOT EXISTS idx_notifications_workflow ON notifications(workflow_execution_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_user ON notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- User preference indexes
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_category ON user_notification_preferences(category);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Workflow policies
CREATE POLICY "Admins can manage all workflows" ON workflows
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view active workflows" ON workflows
    FOR SELECT USING (is_active = true);

-- Workflow execution policies
CREATE POLICY "Users can view their workflow executions" ON workflow_executions
    FOR SELECT USING (triggered_by_user_id = auth.uid());

CREATE POLICY "Admins can manage all workflow executions" ON workflow_executions
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Notification policies
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (recipient_user_id = auth.uid());

CREATE POLICY "Users can update their notification read status" ON notifications
    FOR UPDATE USING (recipient_user_id = auth.uid());

CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- User preference policies
CREATE POLICY "Users can manage their notification preferences" ON user_notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to process notification queue
CREATE OR REPLACE FUNCTION process_notification_queue()
RETURNS VOID AS $$
DECLARE
    notification_record RECORD;
BEGIN
    -- Process pending notifications that are due
    FOR notification_record IN
        SELECT id, recipient_user_id, category, delivery_method
        FROM notifications
        WHERE status = 'pending'
          AND scheduled_for <= NOW()
          AND delivery_attempts < 3
        ORDER BY priority DESC, scheduled_for ASC
        LIMIT 100
    LOOP
        -- Check user preferences
        IF EXISTS (
            SELECT 1 FROM user_notification_preferences
            WHERE user_id = notification_record.recipient_user_id
              AND category = notification_record.category
              AND enabled = true
              AND notification_record.delivery_method = ANY(delivery_methods)
        ) THEN
            -- Update status to queued
            UPDATE notifications
            SET status = 'queued',
                updated_at = NOW()
            WHERE id = notification_record.id;
        ELSE
            -- Mark as cancelled if user has disabled this category
            UPDATE notifications
            SET status = 'cancelled',
                updated_at = NOW()
            WHERE id = notification_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update workflow execution progress
CREATE OR REPLACE FUNCTION update_workflow_execution_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update workflow execution current step
    UPDATE workflow_executions
    SET current_step = (
            SELECT COUNT(*)
            FROM workflow_step_executions
            WHERE workflow_execution_id = NEW.workflow_execution_id
              AND status = 'completed'
        ),
        updated_at = NOW()
    WHERE id = NEW.workflow_execution_id;
    
    -- Check if all steps are completed
    IF (SELECT current_step FROM workflow_executions WHERE id = NEW.workflow_execution_id) = 
       (SELECT total_steps FROM workflow_executions WHERE id = NEW.workflow_execution_id) THEN
        UPDATE workflow_executions
        SET status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.workflow_execution_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update workflow progress
CREATE TRIGGER trigger_update_workflow_progress
    AFTER UPDATE ON workflow_step_executions
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_workflow_execution_progress();

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'read' AND OLD.status != 'read' THEN
        NEW.read_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set read timestamp
CREATE TRIGGER trigger_mark_notification_read
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION mark_notification_read();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER trigger_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_workflow_executions_updated_at
    BEFORE UPDATE ON workflow_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_workflow_step_executions_updated_at
    BEFORE UPDATE ON workflow_step_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_notification_preferences_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Workflow execution summary view
CREATE OR REPLACE VIEW workflow_execution_summary AS
SELECT 
    w.id as workflow_id,
    w.name as workflow_name,
    w.workflow_type,
    COUNT(we.id) as total_executions,
    COUNT(CASE WHEN we.status = 'completed' THEN 1 END) as completed_executions,
    COUNT(CASE WHEN we.status = 'failed' THEN 1 END) as failed_executions,
    COUNT(CASE WHEN we.status = 'running' THEN 1 END) as running_executions,
    ROUND(AVG(EXTRACT(EPOCH FROM (we.completed_at - we.started_at))/60), 2) as avg_duration_minutes
FROM workflows w
LEFT JOIN workflow_executions we ON w.id = we.workflow_id
GROUP BY w.id, w.name, w.workflow_type;

-- Notification delivery statistics view
CREATE OR REPLACE VIEW notification_delivery_stats AS
SELECT 
    nt.name as template_name,
    nt.category,
    n.delivery_method,
    COUNT(n.id) as total_sent,
    COUNT(CASE WHEN n.status = 'delivered' THEN 1 END) as delivered_count,
    COUNT(CASE WHEN n.status = 'failed' THEN 1 END) as failed_count,
    COUNT(CASE WHEN n.status = 'read' THEN 1 END) as read_count,
    ROUND(COUNT(CASE WHEN n.status = 'delivered' THEN 1 END)::DECIMAL / NULLIF(COUNT(n.id), 0) * 100, 2) as delivery_rate,
    ROUND(COUNT(CASE WHEN n.status = 'read' THEN 1 END)::DECIMAL / NULLIF(COUNT(CASE WHEN n.status = 'delivered' THEN 1 END), 0) * 100, 2) as read_rate
FROM notification_templates nt
LEFT JOIN notifications n ON nt.id = n.template_id
GROUP BY nt.name, nt.category, n.delivery_method;

-- Grant permissions
GRANT SELECT ON workflow_execution_summary TO authenticated;
GRANT SELECT ON notification_delivery_stats TO authenticated;
GRANT EXECUTE ON FUNCTION process_notification_queue() TO authenticated;

COMMIT;
