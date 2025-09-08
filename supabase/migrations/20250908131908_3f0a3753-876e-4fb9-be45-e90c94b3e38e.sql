-- Fix the chat_participants policy to allow conversation creators to add participants
DROP POLICY IF EXISTS "Users can add themselves to conversations" ON chat_participants;

CREATE POLICY "Users can add participants to conversations" 
ON chat_participants 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 
    FROM chat_conversations 
    WHERE id = conversation_id 
    AND created_by = auth.uid()
  )
);

-- Make sure we have a proper unique constraint to prevent duplicate pending requests
-- This will prevent duplicate pending requests between the same users
DROP INDEX IF EXISTS unique_pending_chat_request;
CREATE UNIQUE INDEX unique_pending_chat_request 
ON chat_requests (sender_id, recipient_id) 
WHERE status = 'pending';