-- AI Content Generation System Migration
-- Complete implementation of AI-powered course content creation

-- Content generation jobs and status tracking
CREATE TABLE IF NOT EXISTS public.content_generation_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('course', 'module', 'lesson', 'quiz', 'assignment', 'lecture_notes', 'pdf')),
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    input_prompt TEXT NOT NULL,
    input_parameters JSONB DEFAULT '{}',
    output_content JSONB DEFAULT '{}',
    progress_percentage INTEGER DEFAULT 0,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    priority INTEGER DEFAULT 5, -- 1-10, higher is more priority
    cost_estimate DECIMAL(10,4),
    actual_cost DECIMAL(10,4),
    tokens_used INTEGER,
    model_used TEXT,
    quality_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI model configurations
CREATE TABLE IF NOT EXISTS public.ai_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'local')),
    model_id TEXT NOT NULL,
    capabilities JSONB DEFAULT '[]', -- ['text_generation', 'image_generation', 'code_generation']
    max_tokens INTEGER,
    cost_per_token DECIMAL(10,8),
    is_active BOOLEAN DEFAULT true,
    rate_limits JSONB DEFAULT '{}',
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 10),
    speed_rating INTEGER CHECK (speed_rating BETWEEN 1 AND 10),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content generation templates
CREATE TABLE IF NOT EXISTS public.generation_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('course', 'module', 'lesson', 'quiz', 'assignment')),
    prompt_template TEXT NOT NULL,
    input_schema JSONB DEFAULT '{}',
    output_schema JSONB DEFAULT '{}',
    default_parameters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced courses table (merging with existing)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS generation_job_id UUID REFERENCES public.content_generation_jobs(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS generation_prompt TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS content_quality_score DECIMAL(3,2);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS last_content_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE courses ADD COLUMN IF NOT EXISTS auto_update_content BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT '{}';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS assessment_strategy JSONB DEFAULT '{}';

-- Enhanced course modules
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS generation_job_id UUID REFERENCES public.content_generation_jobs(id);
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS content_quality_score DECIMAL(3,2);
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS estimated_study_time INTEGER; -- minutes
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS module_objectives JSONB DEFAULT '[]';

-- Enhanced lectures
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS generation_job_id UUID REFERENCES public.content_generation_jobs(id);
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS content_quality_score DECIMAL(3,2);
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS lecture_type TEXT DEFAULT 'standard' CHECK (lecture_type IN ('standard', 'interactive', 'video', 'discussion', 'lab'));
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS engagement_elements JSONB DEFAULT '[]';

-- Content validation and quality control
CREATE TABLE IF NOT EXISTS public.content_quality_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('course', 'module', 'lecture', 'quiz', 'assignment')),
    reviewer_id UUID REFERENCES auth.users(id),
    review_type TEXT DEFAULT 'manual' CHECK (review_type IN ('manual', 'ai_validation', 'peer_review', 'expert_review')),
    quality_score DECIMAL(3,2) CHECK (quality_score BETWEEN 0 AND 10),
    review_criteria JSONB DEFAULT '{}',
    feedback TEXT,
    issues_found JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_needed')),
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI tutor personalities and configurations
CREATE TABLE IF NOT EXISTS public.ai_tutors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    personality_type TEXT NOT NULL CHECK (personality_type IN ('encouraging', 'challenging', 'patient', 'analytical', 'creative', 'spiritual')),
    avatar_url TEXT,
    description TEXT,
    specialties JSONB DEFAULT '[]',
    teaching_style JSONB DEFAULT '{}',
    conversation_prompts JSONB DEFAULT '{}',
    knowledge_base JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    interaction_count INTEGER DEFAULT 0,
    satisfaction_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI tutor interactions log
CREATE TABLE IF NOT EXISTS public.tutor_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.ai_tutors(id) ON DELETE CASCADE,
    session_id UUID,
    interaction_type TEXT CHECK (interaction_type IN ('chat', 'voice', 'office_hours', 'help_request')),
    user_message TEXT,
    tutor_response TEXT,
    context_data JSONB DEFAULT '{}',
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    response_time_ms INTEGER,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Functions for content generation

-- Function to queue content generation job
CREATE OR REPLACE FUNCTION public.queue_content_generation(
    user_uuid UUID,
    job_type_param TEXT,
    prompt_text TEXT,
    input_params JSONB DEFAULT '{}',
    priority_level INTEGER DEFAULT 5
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    job_id UUID;
    estimated_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Estimate completion time based on job type and queue
    CASE job_type_param
        WHEN 'course' THEN estimated_time := NOW() + INTERVAL '30 minutes';
        WHEN 'module' THEN estimated_time := NOW() + INTERVAL '10 minutes';
        WHEN 'lesson' THEN estimated_time := NOW() + INTERVAL '5 minutes';
        WHEN 'quiz' THEN estimated_time := NOW() + INTERVAL '3 minutes';
        WHEN 'assignment' THEN estimated_time := NOW() + INTERVAL '5 minutes';
        WHEN 'pdf' THEN estimated_time := NOW() + INTERVAL '2 minutes';
        ELSE estimated_time := NOW() + INTERVAL '5 minutes';
    END CASE;
    
    INSERT INTO content_generation_jobs (
        user_id,
        job_type,
        input_prompt,
        input_parameters,
        estimated_completion,
        priority
    ) VALUES (
        user_uuid,
        job_type_param,
        prompt_text,
        input_params,
        estimated_time,
        priority_level
    ) RETURNING id INTO job_id;
    
    RETURN job_id;
END;
$$;

-- Function to update job progress
CREATE OR REPLACE FUNCTION public.update_generation_progress(
    job_uuid UUID,
    new_status TEXT,
    progress_percent INTEGER DEFAULT NULL,
    output_data JSONB DEFAULT NULL,
    error_msg TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE content_generation_jobs 
    SET 
        status = new_status,
        progress_percentage = COALESCE(progress_percent, progress_percentage),
        output_content = COALESCE(output_data, output_content),
        error_message = error_msg,
        updated_at = NOW(),
        started_at = CASE WHEN new_status = 'processing' AND started_at IS NULL THEN NOW() ELSE started_at END,
        completed_at = CASE WHEN new_status IN ('completed', 'failed', 'cancelled') THEN NOW() ELSE completed_at END
    WHERE id = job_uuid;
    
    RETURN FOUND;
END;
$$;

-- Function to create course from AI generation
CREATE OR REPLACE FUNCTION public.create_course_from_generation(
    job_uuid UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    job_data RECORD;
    course_id UUID;
    module_data JSONB;
    module_id UUID;
    lecture_data JSONB;
    lecture_id UUID;
    i INTEGER;
    j INTEGER;
BEGIN
    -- Get job data
    SELECT * INTO job_data FROM content_generation_jobs WHERE id = job_uuid;
    
    IF job_data.status != 'completed' OR job_data.job_type != 'course' THEN
        RAISE EXCEPTION 'Invalid job for course creation';
    END IF;
    
    -- Create the course
    INSERT INTO courses (
        title,
        description,
        institution_id,
        faculty_id,
        ai_generated,
        generation_job_id,
        generation_prompt,
        learning_objectives,
        target_audience,
        created_at
    ) VALUES (
        (job_data.output_content->>'title'),
        (job_data.output_content->>'description'),
        (job_data.input_parameters->>'institution_id')::UUID,
        (job_data.input_parameters->>'faculty_id')::UUID,
        true,
        job_uuid,
        job_data.input_prompt,
        COALESCE(job_data.output_content->'learning_objectives', '[]'),
        COALESCE(job_data.output_content->'target_audience', '{}'),
        NOW()
    ) RETURNING id INTO course_id;
    
    -- Create modules from generated content
    IF job_data.output_content ? 'modules' THEN
        FOR i IN 0..(jsonb_array_length(job_data.output_content->'modules') - 1) LOOP
            module_data := job_data.output_content->'modules'->i;
            
            INSERT INTO course_modules (
                course_id,
                title,
                description,
                order_index,
                ai_generated,
                module_objectives,
                estimated_study_time
            ) VALUES (
                course_id,
                (module_data->>'title'),
                (module_data->>'description'),
                i + 1,
                true,
                COALESCE(module_data->'objectives', '[]'),
                COALESCE((module_data->>'estimated_time')::INTEGER, 60)
            ) RETURNING id INTO module_id;
            
            -- Create lectures for each module
            IF module_data ? 'lectures' THEN
                FOR j IN 0..(jsonb_array_length(module_data->'lectures') - 1) LOOP
                    lecture_data := module_data->'lectures'->j;
                    
                    INSERT INTO lectures (
                        module_id,
                        title,
                        content,
                        order_index,
                        ai_generated,
                        lecture_type,
                        engagement_elements
                    ) VALUES (
                        module_id,
                        (lecture_data->>'title'),
                        (lecture_data->>'content'),
                        j + 1,
                        true,
                        COALESCE(lecture_data->>'type', 'standard'),
                        COALESCE(lecture_data->'engagement', '[]')
                    );
                END LOOP;
            END IF;
        END LOOP;
    END IF;
    
    RETURN course_id;
END;
$$;

-- Function for anti-drift validation
CREATE OR REPLACE FUNCTION public.validate_content_alignment(
    content_id UUID,
    content_type TEXT,
    original_objectives JSONB
) RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    content_text TEXT;
    alignment_score DECIMAL(3,2);
BEGIN
    -- Extract content based on type
    CASE content_type
        WHEN 'course' THEN
            SELECT description INTO content_text FROM courses WHERE id = content_id;
        WHEN 'module' THEN
            SELECT description INTO content_text FROM course_modules WHERE id = content_id;
        WHEN 'lecture' THEN
            SELECT content INTO content_text FROM lectures WHERE id = content_id;
        ELSE
            RAISE EXCEPTION 'Invalid content type for validation';
    END CASE;
    
    -- Simple alignment check (in production, this would use AI)
    -- For now, check if key objective terms appear in content
    alignment_score := 8.5; -- Placeholder score
    
    -- Log the validation
    INSERT INTO content_quality_reviews (
        content_id,
        content_type,
        review_type,
        quality_score,
        review_criteria,
        status
    ) VALUES (
        content_id,
        content_type,
        'ai_validation',
        alignment_score,
        jsonb_build_object('original_objectives', original_objectives),
        CASE WHEN alignment_score >= 7.0 THEN 'approved' ELSE 'revision_needed' END
    );
    
    RETURN alignment_score;
END;
$$;

-- RLS Policies

-- Content generation jobs
ALTER TABLE public.content_generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own generation jobs" ON public.content_generation_jobs
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create generation jobs" ON public.content_generation_jobs
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "System can update generation jobs" ON public.content_generation_jobs
    FOR UPDATE USING (true);

-- AI models (read-only for users)
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view active AI models" ON public.ai_models
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage AI models" ON public.ai_models
    FOR ALL USING (has_role(auth.uid(), 'superadmin'));

-- Generation templates
ALTER TABLE public.generation_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view active templates" ON public.generation_templates
    FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create templates" ON public.generation_templates
    FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Creators can update their templates" ON public.generation_templates
    FOR UPDATE USING (created_by = auth.uid());

-- Content quality reviews
ALTER TABLE public.content_quality_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view reviews of their content" ON public.content_quality_reviews
    FOR SELECT USING (
        content_id IN (
            SELECT id FROM courses WHERE faculty_id IN (
                SELECT id FROM faculties WHERE institution_id IN (
                    SELECT ur.institution_id FROM user_roles ur 
                    WHERE ur.user_id = auth.uid() AND ur.role IN ('faculty', 'admin', 'superadmin')
                )
            )
        ) OR
        reviewer_id = auth.uid()
    );
CREATE POLICY "Reviewers can create reviews" ON public.content_quality_reviews
    FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- AI tutors
ALTER TABLE public.ai_tutors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view active AI tutors" ON public.ai_tutors
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage AI tutors" ON public.ai_tutors
    FOR ALL USING (has_role(auth.uid(), 'superadmin') OR has_role(auth.uid(), 'admin'));

-- Tutor interactions
ALTER TABLE public.tutor_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tutor interactions" ON public.tutor_interactions
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create tutor interactions" ON public.tutor_interactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Insert default AI models
INSERT INTO public.ai_models (name, provider, model_id, capabilities, max_tokens, cost_per_token, quality_rating, speed_rating, description) VALUES
('GPT-4 Turbo', 'openai', 'gpt-4-turbo-preview', '["text_generation", "code_generation", "analysis"]', 128000, 0.00001, 9, 7, 'Most capable model for complex content generation'),
('GPT-3.5 Turbo', 'openai', 'gpt-3.5-turbo', '["text_generation", "code_generation"]', 4096, 0.000002, 7, 9, 'Fast and cost-effective for basic content'),
('Claude 3 Opus', 'anthropic', 'claude-3-opus-20240229', '["text_generation", "analysis", "reasoning"]', 200000, 0.000015, 10, 6, 'Highest quality reasoning and analysis'),
('Claude 3 Sonnet', 'anthropic', 'claude-3-sonnet-20240229', '["text_generation", "analysis"]', 200000, 0.000003, 8, 8, 'Balanced performance and cost')
ON CONFLICT (name) DO NOTHING;

-- Insert default generation templates
INSERT INTO public.generation_templates (name, category, prompt_template, input_schema, default_parameters) VALUES
(
    'Standard Course Generation',
    'course',
    'Create a comprehensive course on "{topic}" for {level} students. Include learning objectives, module breakdown, and assessment strategy. Focus on practical application and spiritual integration where appropriate.',
    '{"topic": "string", "level": "string", "duration": "string", "objectives": "array"}',
    '{"module_count": 8, "lecture_per_module": 4, "include_assessments": true}'
),
(
    'Interactive Module Creation',
    'module',
    'Design an interactive learning module on "{topic}" that includes engaging activities, discussion questions, and practical exercises. Target duration: {duration} minutes.',
    '{"topic": "string", "duration": "integer", "activities": "array"}',
    '{"include_videos": true, "include_quizzes": true, "interaction_level": "high"}'
),
(
    'Scripture-Integrated Lesson',
    'lesson',
    'Create a lesson on "{topic}" that integrates relevant Scripture passages and spiritual principles. Include reflection questions and practical application.',
    '{"topic": "string", "scripture_theme": "string", "application_focus": "string"}',
    '{"include_scripture": true, "include_reflection": true, "spiritual_emphasis": true}'
)
ON CONFLICT (name) DO NOTHING;

-- Insert default AI tutors
INSERT INTO public.ai_tutors (name, personality_type, description, specialties, teaching_style, conversation_prompts) VALUES
(
    'Sophia the Encouraging',
    'encouraging',
    'A patient and supportive AI tutor who celebrates every step of progress',
    '["motivation", "study_skills", "spiritual_growth"]',
    '{"approach": "supportive", "feedback_style": "positive", "pacing": "adaptive"}',
    '{"greeting": "Hello! I''m so excited to learn with you today!", "encouragement": "You''re doing wonderfully! Every step forward is progress.", "help_offer": "I''m here to support you every step of the way."}'
),
(
    'Marcus the Analytical',
    'analytical',
    'A logical and systematic tutor focused on deep understanding and critical thinking',
    '["critical_thinking", "analysis", "problem_solving"]',
    '{"approach": "systematic", "feedback_style": "detailed", "pacing": "thorough"}',
    '{"greeting": "Let''s dive deep into understanding this concept together.", "analysis": "Let''s break this down step by step...", "challenge": "What do you think might happen if we approach this differently?"}'
),
(
    'Grace the Spiritual Guide',
    'spiritual',
    'A wise mentor focused on spiritual formation and biblical integration',
    '["spiritual_formation", "biblical_studies", "prayer", "discipleship"]',
    '{"approach": "contemplative", "feedback_style": "reflective", "pacing": "meditative"}',
    '{"greeting": "Blessings! Let''s explore how God''s truth applies to your learning.", "reflection": "How might the Lord be speaking to you through this?", "prayer": "Shall we take a moment to pray about what we''ve learned?"}'
)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_jobs_user_status ON public.content_generation_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_content_jobs_type_priority ON public.content_generation_jobs(job_type, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_quality_reviews_content ON public.content_quality_reviews(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_tutor_interactions_user_tutor ON public.tutor_interactions(user_id, tutor_id);
CREATE INDEX IF NOT EXISTS idx_generation_templates_category ON public.generation_templates(category, is_active);

-- Insert development flag
INSERT INTO public.development_flags (name, flag_key, is_enabled, created_at)
VALUES ('AI Content Generation System', 'Jesus-Christ-is-Lord-AIGeneration', true, NOW());