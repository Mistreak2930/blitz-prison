-- Add foreign key constraint between forum_posts and profiles
ALTER TABLE public.forum_posts 
ADD CONSTRAINT fk_forum_posts_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);