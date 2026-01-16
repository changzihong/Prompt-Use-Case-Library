
-- 1. Clean up existing triggers and policies
DROP TRIGGER IF EXISTS on_rating_change ON public.ratings;
DROP TRIGGER IF EXISTS on_comment_change ON public.comments;
DROP POLICY IF EXISTS "Public Read Prompts" ON public.prompts;
DROP POLICY IF EXISTS "Public Read Photos" ON public.photos;
DROP POLICY IF EXISTS "Public Read Comments" ON public.comments;
DROP POLICY IF EXISTS "Public Read Ratings" ON public.ratings;
DROP POLICY IF EXISTS "Public Insert Prompts" ON public.prompts;
DROP POLICY IF EXISTS "Public Insert Photos" ON public.photos;
DROP POLICY IF EXISTS "Public Insert Comments" ON public.comments;
DROP POLICY IF EXISTS "Public Insert Ratings" ON public.ratings;
DROP POLICY IF EXISTS "Admin Delete Prompts" ON public.prompts;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public View" ON storage.objects;

-- 2. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Create Tables
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  use_case TEXT NOT NULL,
  prompt TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  avg_rating FLOAT DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0
);

-- Ensure column exists
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='prompts' AND column_name='comment_count') THEN
    ALTER TABLE public.prompts ADD COLUMN comment_count INTEGER DEFAULT 0;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  stars INTEGER CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Public Read Prompts" ON public.prompts FOR SELECT USING (true);
CREATE POLICY "Public Read Photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Public Read Comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public Read Ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Public Insert Prompts" ON public.prompts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Photos" ON public.photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Ratings" ON public.ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Delete Prompts" ON public.prompts FOR DELETE TO authenticated USING (true);

-- 6. Storage Policies (Allow anyone to upload to 'prompts' bucket)
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'prompts');
CREATE POLICY "Public View" ON storage.objects FOR SELECT USING (bucket_id = 'prompts');

-- 7. Functions
CREATE OR REPLACE FUNCTION public.increment_view_count(prompt_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.prompts SET view_count = view_count + 1 WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_prompt_rating_stats()
RETURNS TRIGGER AS $$
DECLARE target_id UUID;
BEGIN
  target_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.prompt_id ELSE NEW.prompt_id END;
  UPDATE public.prompts SET 
    avg_rating = COALESCE((SELECT AVG(stars) FROM public.ratings WHERE prompt_id = target_id), 0),
    rating_count = (SELECT COUNT(*) FROM public.ratings WHERE prompt_id = target_id)
  WHERE id = target_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_prompt_comment_count()
RETURNS TRIGGER AS $$
DECLARE target_id UUID;
BEGIN
  target_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.prompt_id ELSE NEW.prompt_id END;
  UPDATE public.prompts SET comment_count = (SELECT COUNT(*) FROM public.comments WHERE prompt_id = target_id) WHERE id = target_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Triggers
CREATE TRIGGER on_rating_change AFTER INSERT OR DELETE OR UPDATE ON public.ratings FOR EACH ROW EXECUTE FUNCTION public.update_prompt_rating_stats();
CREATE TRIGGER on_comment_change AFTER INSERT OR DELETE OR UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_prompt_comment_count();

-- 9. Initial Sync
UPDATE public.prompts p SET 
  comment_count = (SELECT COUNT(*) FROM public.comments c WHERE c.prompt_id = p.id),
  rating_count = (SELECT COUNT(*) FROM public.ratings r WHERE r.prompt_id = p.id),
  avg_rating = COALESCE((SELECT AVG(stars) FROM public.ratings r WHERE r.prompt_id = p.id), 0);
