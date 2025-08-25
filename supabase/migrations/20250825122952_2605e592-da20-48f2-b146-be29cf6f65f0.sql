-- Add pinned column to news and announcements tables
ALTER TABLE public.news 
ADD COLUMN pinned boolean NOT NULL DEFAULT false;

ALTER TABLE public.announcements 
ADD COLUMN pinned boolean NOT NULL DEFAULT false;

-- Create indexes for better performance when ordering by pinned status
CREATE INDEX idx_news_pinned_created ON public.news (pinned DESC, created_at DESC);
CREATE INDEX idx_announcements_pinned_created ON public.announcements (pinned DESC, created_at DESC);

-- Add some forum enhancements - reactions and view count
ALTER TABLE public.forum_posts 
ADD COLUMN views integer NOT NULL DEFAULT 0,
ADD COLUMN likes integer NOT NULL DEFAULT 0,
ADD COLUMN pinned boolean NOT NULL DEFAULT false;

-- Create index for forum posts ordering
CREATE INDEX idx_forum_posts_pinned_created ON public.forum_posts (pinned DESC, created_at DESC);

-- Add reactions table for forum posts
CREATE TABLE public.post_reactions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'funny', 'love')),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(post_id, user_id, reaction_type)
);

-- Enable RLS on post reactions
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for post reactions
CREATE POLICY "Anyone can view reactions" 
ON public.post_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can add their own reactions" 
ON public.post_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.post_reactions 
FOR DELETE 
USING (auth.uid() = user_id);