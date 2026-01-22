-- Update prompts policies to allow admins to delete ONLY their own prompts
DROP POLICY IF EXISTS "Admin Delete Prompts" ON public.prompts;

CREATE POLICY "Admin Manage Own Library Prompts" ON public.prompts 
FOR DELETE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE public.sessions.id = public.prompts.session_id 
    AND public.sessions.admin_id = auth.uid()
  )
);

-- Ensure prompts are visible to everyone (for sharing links) but managed by owner
CREATE OR REPLACE POLICY "Public Select Prompts" ON public.prompts FOR SELECT USING (true);
