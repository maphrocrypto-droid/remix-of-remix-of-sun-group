-- Roles and statuses
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');
CREATE TYPE public.inquiry_status AS ENUM ('new', 'reviewing', 'quoted');

-- Team member profiles (one per sign-in account)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Roles live in their own table so nobody can grant themselves access
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_team(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin', 'staff'))
$$;

CREATE POLICY "Own profile or admin can view" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Own roles or admin can view" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins add roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins remove roles except their own admin role" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND NOT (user_id = auth.uid() AND role = 'admin'));

-- New account: create profile; the very first account becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'));
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Price inquiries from the website form (inserted only by server code)
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text NOT NULL UNIQUE,
  status public.inquiry_status NOT NULL DEFAULT 'new',
  lang text NOT NULL DEFAULT 'fa' CHECK (lang IN ('fa', 'en')),
  service smallint NOT NULL,
  china_city smallint,
  shipping_mode smallint,
  volume smallint,
  goods text NOT NULL CHECK (char_length(goods) BETWEEN 2 AND 300),
  contact_name text NOT NULL CHECK (char_length(contact_name) BETWEEN 2 AND 120),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 8 AND 20),
  note text CHECK (note IS NULL OR char_length(note) <= 2000),
  internal_note text CHECK (internal_note IS NULL OR char_length(internal_note) <= 5000),
  file_count smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status_changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inquiries_created_at_idx ON public.inquiries (created_at DESC);
CREATE INDEX inquiries_phone_idx ON public.inquiries (phone);

GRANT SELECT ON public.inquiries TO authenticated;
GRANT UPDATE (status, internal_note) ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view inquiries" ON public.inquiries
  FOR SELECT TO authenticated USING (public.is_team(auth.uid()));
CREATE POLICY "Team can update inquiries" ON public.inquiries
  FOR UPDATE TO authenticated USING (public.is_team(auth.uid())) WITH CHECK (public.is_team(auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_inquiry()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER inquiries_touch
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.touch_inquiry();

-- Weekly counts; weeks start on Saturday, Tehran time. RLS applies (invoker).
CREATE OR REPLACE FUNCTION public.inquiry_weekly_stats(_weeks int DEFAULT 8)
RETURNS TABLE (week_start date, total bigint, quoted bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  WITH base AS (
    SELECT (date_trunc('week', (now() AT TIME ZONE 'Asia/Tehran') + interval '2 days') - interval '2 days')::date AS this_week
  ), weeks AS (
    SELECT (b.this_week - n * 7) AS week_start FROM base b, generate_series(0, GREATEST(_weeks, 1) - 1) AS n
  )
  SELECT w.week_start,
         count(i.id) AS total,
         count(i.id) FILTER (WHERE i.status = 'quoted') AS quoted
  FROM weeks w
  LEFT JOIN public.inquiries i
    ON (date_trunc('week', (i.created_at AT TIME ZONE 'Asia/Tehran') + interval '2 days') - interval '2 days')::date = w.week_start
  GROUP BY w.week_start
  ORDER BY w.week_start;
$$;
GRANT EXECUTE ON FUNCTION public.inquiry_weekly_stats(int) TO authenticated;

-- Files attached to inquiries: only the team can read them
CREATE POLICY "Team can read inquiry files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'inquiry-files' AND public.is_team(auth.uid()));