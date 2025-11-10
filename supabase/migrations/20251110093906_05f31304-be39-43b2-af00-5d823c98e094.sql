-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create pages table
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create page_translations table
CREATE TABLE public.page_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (page_id, language)
);

ALTER TABLE public.page_translations ENABLE ROW LEVEL SECURITY;

-- Create content_blocks table
CREATE TABLE public.content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  block_type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- Create content_block_translations table
CREATE TABLE public.content_block_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES public.content_blocks(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (block_id, language)
);

ALTER TABLE public.content_block_translations ENABLE ROW LEVEL SECURITY;

-- RLS policies for pages (public read, admin write)
CREATE POLICY "Anyone can view published pages"
ON public.pages FOR SELECT
USING (published = true);

CREATE POLICY "Admins can manage pages"
ON public.pages FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for page_translations
CREATE POLICY "Anyone can view published page translations"
ON public.page_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pages
    WHERE pages.id = page_translations.page_id AND pages.published = true
  )
);

CREATE POLICY "Admins can manage page translations"
ON public.page_translations FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for content_blocks
CREATE POLICY "Anyone can view content blocks of published pages"
ON public.content_blocks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pages
    WHERE pages.id = content_blocks.page_id AND pages.published = true
  )
);

CREATE POLICY "Admins can manage content blocks"
ON public.content_blocks FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for content_block_translations
CREATE POLICY "Anyone can view content block translations of published pages"
ON public.content_block_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.content_blocks
    JOIN public.pages ON pages.id = content_blocks.page_id
    WHERE content_blocks.id = content_block_translations.block_id AND pages.published = true
  )
);

CREATE POLICY "Admins can manage content block translations"
ON public.content_block_translations FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_translations_updated_at
BEFORE UPDATE ON public.page_translations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at
BEFORE UPDATE ON public.content_blocks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_block_translations_updated_at
BEFORE UPDATE ON public.content_block_translations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();