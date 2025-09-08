-- Drop existing problematic policies for chat_participants
DROP POLICY IF EXISTS "Conversation admins can add participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON chat_participants;

-- Create new, simpler policies that don't cause recursion
CREATE POLICY "Users can add themselves to conversations" 
ON chat_participants 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view all participants" 
ON chat_participants 
FOR SELECT 
USING (true);

-- Also fix the chat_conversations policy that might have issues
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON chat_conversations;

CREATE POLICY "Users can view conversations they participate in" 
ON chat_conversations 
FOR SELECT 
USING (
  created_by = auth.uid() OR 
  id IN (
    SELECT conversation_id 
    FROM chat_participants 
    WHERE user_id = auth.uid()
  )
);