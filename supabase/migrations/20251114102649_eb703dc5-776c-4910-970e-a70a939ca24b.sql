-- Add missing columns to ai_tutor_interactions
ALTER TABLE public.ai_tutor_interactions 
ADD COLUMN IF NOT EXISTS interaction_type TEXT CHECK (interaction_type IN ('chat', 'voice', 'video'));

ALTER TABLE public.ai_tutor_interactions 
ADD COLUMN IF NOT EXISTS response_time INTEGER;

-- Update existing rows to have default interaction_type
UPDATE public.ai_tutor_interactions 
SET interaction_type = 'chat' 
WHERE interaction_type IS NULL;