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

-- Clear any duplicate/problematic chat requests by updating the constraint
-- First, let's clean up any duplicate requests that might exist
DELETE FROM chat_requests 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM chat_requests 
  GROUP BY sender_id, recipient_id, status
);

-- Make sure we have a proper unique constraint to prevent duplicates
DROP INDEX IF EXISTS unique_pending_chat_request;
CREATE UNIQUE INDEX unique_pending_chat_request 
ON chat_requests (sender_id, recipient_id) 
WHERE status = 'pending';