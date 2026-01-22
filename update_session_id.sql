-- Add session_id column to prompts
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Remove prompts that do not have a session_id
DELETE FROM public.prompts WHERE session_id IS NULL OR session_id = '';
