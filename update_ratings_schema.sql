ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS user_identifier TEXT;
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_prompt_id_user_identifier_key;
ALTER TABLE public.ratings ADD CONSTRAINT ratings_prompt_id_user_identifier_key UNIQUE (prompt_id, user_identifier);
