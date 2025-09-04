-- Create chat system tables for real-time messaging

-- Chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT, -- For group chats
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat participants table
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

-- Chat messages table  
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  reply_to_id UUID REFERENCES public.chat_messages(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Chat requests table
CREATE TABLE public.chat_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sender_id, recipient_id)
);

-- Message reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL, -- emoji or reaction type
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, reaction)
);

-- Enable RLS on all tables
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view conversations they participate in"
ON public.chat_conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_conversations.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations"
ON public.chat_conversations FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Conversation admins can update conversations"
ON public.chat_conversations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_conversations.id 
    AND user_id = auth.uid() 
    AND is_admin = true
  )
);

-- RLS Policies for chat_participants
CREATE POLICY "Users can view participants in their conversations"
ON public.chat_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants cp2
    WHERE cp2.conversation_id = chat_participants.conversation_id 
    AND cp2.user_id = auth.uid()
  )
);

CREATE POLICY "Conversation admins can add participants"
ON public.chat_participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_participants.conversation_id 
    AND user_id = auth.uid() 
    AND is_admin = true
  ) OR (
    -- Allow adding yourself when creating direct chat
    user_id = auth.uid()
  )
);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their conversations"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations"
ON public.chat_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages"
ON public.chat_messages FOR UPDATE
USING (sender_id = auth.uid());

-- RLS Policies for chat_requests
CREATE POLICY "Users can view their own requests"
ON public.chat_requests FOR SELECT
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send chat requests"
ON public.chat_requests FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update requests"
ON public.chat_requests FOR UPDATE
USING (recipient_id = auth.uid());

-- RLS Policies for message_reactions
CREATE POLICY "Users can view reactions in their conversations"
ON public.message_reactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_messages cm
    JOIN public.chat_participants cp ON cm.conversation_id = cp.conversation_id
    WHERE cm.id = message_reactions.message_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add their own reactions"
ON public.message_reactions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions"
ON public.message_reactions FOR DELETE
USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_chat_participants_conversation_user ON public.chat_participants(conversation_id, user_id);
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at DESC);
CREATE INDEX idx_chat_requests_recipient ON public.chat_requests(recipient_id, status);
CREATE INDEX idx_message_reactions_message ON public.message_reactions(message_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_requests_updated_at
  BEFORE UPDATE ON public.chat_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();