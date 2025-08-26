-- Fix profile creation for new users and add enhanced profile features
-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add enhanced profile fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS minecraft_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0;

-- Create private messages table
CREATE TABLE IF NOT EXISTS public.private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on private messages
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for private messages
CREATE POLICY "Users can view their own messages" ON public.private_messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.private_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their received messages" ON public.private_messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- Create user activity log table
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'login', 'post_created', 'comment_added', etc.
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user activity
CREATE POLICY "Admins can view all activity" ON public.user_activity
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own activity" ON public.user_activity
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert activity" ON public.user_activity
  FOR INSERT WITH CHECK (true);

-- Create moderation logs table
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'warn', 'mute', 'ban', 'delete_post', etc.
  reason TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on moderation logs
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for moderation logs
CREATE POLICY "Moderators and admins can view moderation logs" ON public.moderation_logs
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'moderator'::app_role)
  );

CREATE POLICY "Moderators and admins can create moderation logs" ON public.moderation_logs
  FOR INSERT WITH CHECK (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
    AND moderator_id = auth.uid()
  );

-- Add updated_at triggers for new tables
CREATE TRIGGER update_private_messages_updated_at
  BEFORE UPDATE ON public.private_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update user post count
CREATE OR REPLACE FUNCTION public.update_user_post_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET post_count = post_count + 1 
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET post_count = GREATEST(0, post_count - 1) 
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to update post count when forum posts are created/deleted
CREATE OR REPLACE TRIGGER forum_posts_update_count
  AFTER INSERT OR DELETE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_user_post_count();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_private_messages_recipient ON public.private_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_sender ON public.private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderator ON public.moderation_logs(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_target ON public.moderation_logs(target_user_id);