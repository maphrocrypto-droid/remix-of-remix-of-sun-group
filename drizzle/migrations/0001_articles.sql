CREATE TYPE public.article_status AS ENUM ('draft','published');
CREATE TYPE public.article_category AS ENUM ('guide','news','market');
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  lang text NOT NULL DEFAULT 'fa',
  category public.article_category NOT NULL DEFAULT 'guide',
  status public.article_status NOT NULL DEFAULT 'draft',
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  cover_url text,
  instagram_url text,
  author_id uuid,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published articles" ON public.articles FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Team reads all articles" ON public.articles FOR SELECT TO authenticated USING (public.is_team(auth.uid()));
CREATE POLICY "Team adds articles" ON public.articles FOR INSERT TO authenticated WITH CHECK (public.is_team(auth.uid()));
CREATE POLICY "Team edits articles" ON public.articles FOR UPDATE TO authenticated USING (public.is_team(auth.uid())) WITH CHECK (public.is_team(auth.uid()));
CREATE POLICY "Team deletes articles" ON public.articles FOR DELETE TO authenticated USING (public.is_team(auth.uid()));
CREATE INDEX articles_pub_idx ON public.articles (status, published_at DESC);
CREATE OR REPLACE FUNCTION public.touch_article() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN NEW.published_at := now(); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER articles_touch BEFORE INSERT OR UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.touch_article();
CREATE POLICY "Public reads article covers" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'article-covers');
CREATE POLICY "Team uploads article covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-covers' AND public.is_team(auth.uid()));
CREATE POLICY "Team deletes article covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'article-covers' AND public.is_team(auth.uid()));