import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PrivateMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_profile?: {
    username: string;
    avatar_url?: string;
  };
  recipient_profile?: {
    username: string;
    avatar_url?: string;
  };
}

export const useMessages = () => {
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (recipientId: string, subject: string, content: string) => {
    if (!user) throw new Error('Must be logged in');
    
    const { data, error } = await supabase
      .from('private_messages')
      .insert([{
        sender_id: user.id,
        recipient_id: recipientId,
        subject,
        content
      }])
      .select()
      .single();
    
    if (error) throw error;
    await fetchMessages(); // Refresh messages
    return data;
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('private_messages')
      .update({ read: true })
      .eq('id', messageId)
      .eq('recipient_id', user.id);
    
    if (error) throw error;
    await fetchMessages(); // Refresh messages
  };

  const getUnreadCount = () => {
    if (!user) return 0;
    return messages.filter(msg => msg.recipient_id === user.id && !msg.read).length;
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    getUnreadCount,
    fetchMessages
  };
};