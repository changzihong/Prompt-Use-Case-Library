-- Create sessions table to associate links with admins
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Policies for sessions
CREATE POLICY "Public Read Sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Admins Manage Own Sessions" ON public.sessions FOR ALL USING (auth.uid() = admin_id);

-- Update prompts to ensure session_id is indexed for performance
CREATE INDEX IF NOT EXISTS idx_prompts_session_id ON public.prompts(session_id);
