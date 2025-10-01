-- Update forum_posts table to match expected schema
ALTER TABLE public.forum_posts 
  DROP COLUMN category,
  ADD COLUMN category_id integer NOT NULL DEFAULT 1;

ALTER TABLE public.forum_posts 
  RENAME COLUMN view_count TO views;

ALTER TABLE public.forum_posts 
  DROP COLUMN reply_count,
  ADD COLUMN likes integer DEFAULT 0;