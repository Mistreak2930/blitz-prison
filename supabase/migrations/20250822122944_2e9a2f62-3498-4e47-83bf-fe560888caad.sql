-- Create news table for news posts
CREATE TABLE IF NOT EXISTS public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on news table
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create policies for news
CREATE POLICY "News are viewable by everyone" 
ON public.news 
FOR SELECT 
USING (true);

CREATE POLICY "News updaters and admins can create news" 
ON public.news 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'news_updater'::app_role)
  )
);

CREATE POLICY "News updaters and admins can update news" 
ON public.news 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'news_updater'::app_role)
);

CREATE POLICY "Admins can delete news" 
ON public.news 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create announcements table for announcement posts
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on announcements table
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policies for announcements
CREATE POLICY "Announcements are viewable by everyone" 
ON public.announcements 
FOR SELECT 
USING (true);

CREATE POLICY "Announcement managers and admins can create announcements" 
ON public.announcements 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'announcements_manager'::app_role)
  )
);

CREATE POLICY "Announcement managers and admins can update announcements" 
ON public.announcements 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'announcements_manager'::app_role)
);

CREATE POLICY "Admins can delete announcements" 
ON public.announcements 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();