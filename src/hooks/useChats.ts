import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ChatConversation {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  created_by: string;
  created_at: string;
  updated_at: string;
  participants?: ChatParticipant[];
  last_message?: ChatMessage;
}

interface ChatParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  is_admin: boolean;
  profile?: {
    username: string;
    avatar_url?: string;
  };
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  reply_to_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  sender_profile?: {
    username: string;
    avatar_url?: string;
  };
  reactions?: MessageReaction[];
}

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
  profile?: {
    username: string;
  };
}

interface ChatRequest {
  id: string;
  sender_id: string;
  recipient_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  sender_profile?: {
    username: string;
    avatar_url?: string;
  };
}

export const useChats = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First get conversations where user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from('chat_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantError) throw participantError;
      
      const conversationIds = participantData?.map(p => p.conversation_id) || [];
      
      if (conversationIds.length === 0) {
        setConversations([]);
        return;
      }

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch participants for each conversation
      const conversationsWithParticipants = await Promise.all(
        (data || []).map(async (conversation: any) => {
          const { data: participants } = await supabase
            .from('chat_participants')
            .select('*')
            .eq('conversation_id', conversation.id);

          // Fetch profile for each participant
          const participantsWithProfiles = await Promise.all(
            (participants || []).map(async (participant: any) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('user_id', participant.user_id)
                .single();

              return {
                ...participant,
                profile
              };
            })
          );

          return {
            ...conversation,
            participants: participantsWithProfiles
          };
        })
      );

      setConversations(conversationsWithParticipants as ChatConversation[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDirectChat = async (recipientId: string) => {
    if (!user) return null;

    try {
      // Check if direct chat already exists
      const { data: existingConversations, error: existingError } = await supabase
        .from('chat_participants')
        .select(`
          conversation_id,
          chat_conversations!inner(
            id,
            type,
            name,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (existingError) throw existingError;

      // Check if any existing conversation is a direct chat with this recipient
      for (const conv of existingConversations || []) {
        if (conv.chat_conversations.type === 'direct') {
          const { data: participants } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id);

          const userIds = participants?.map(p => p.user_id) || [];
          if (userIds.length === 2 && userIds.includes(user.id) && userIds.includes(recipientId)) {
            return conv.chat_conversations;
          }
        }
      }

      // Create new conversation
      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .insert({
          type: 'direct',
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add participants
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { conversation_id: conversation.id, user_id: user.id, is_admin: true },
          { conversation_id: conversation.id, user_id: recipientId, is_admin: false }
        ]);

      if (participantsError) throw participantsError;

      await fetchConversations();
      return conversation;
    } catch (error) {
      console.error('Error creating direct chat:', error);
      throw error;
    }
  };

  const createGroupChat = async (name: string, participantIds: string[]) => {
    if (!user) return null;

    try {
      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .insert({
          name,
          type: 'group',
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator and participants
      const participants = [
        { conversation_id: conversation.id, user_id: user.id, is_admin: true },
        ...participantIds.map(id => ({ 
          conversation_id: conversation.id, 
          user_id: id, 
          is_admin: false 
        }))
      ];

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      await fetchConversations();
      return conversation;
    } catch (error) {
      console.error('Error creating group chat:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_conversations'
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [user]);

  return {
    conversations,
    loading,
    createDirectChat,
    createGroupChat,
    refetch: fetchConversations
  };
};

export const useChatMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMessages = async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch sender profiles and reactions for each message
      const messagesWithDetails = await Promise.all(
        (data || []).map(async (message: any) => {
          // Fetch sender profile
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', message.sender_id)
            .single();

          // Fetch reactions
          const { data: reactions } = await supabase
            .from('message_reactions')
            .select('*')
            .eq('message_id', message.id);

          // Fetch profile for each reaction
          const reactionsWithProfiles = await Promise.all(
            (reactions || []).map(async (reaction: any) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('user_id', reaction.user_id)
                .single();

              return {
                ...reaction,
                profile
              };
            })
          );

          return {
            ...message,
            sender_profile: senderProfile,
            reactions: reactionsWithProfiles || []
          };
        })
      );

      setMessages(messagesWithDetails as ChatMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, replyToId?: string) => {
    if (!user || !conversationId) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          reply_to_id: replyToId
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  const addReaction = async (messageId: string, reaction: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          reaction
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };

  const removeReaction = async (messageId: string, reaction: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction', reaction);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // Set up real-time subscriptions for messages
  useEffect(() => {
    if (!conversationId) return;

    const messagesChannel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, () => {
        fetchMessages();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions'
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [conversationId]);

  return {
    messages,
    loading,
    sendMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    refetch: fetchMessages
  };
};

export const useChatRequests = () => {
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_requests')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch sender profiles for each request
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request: any) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', request.sender_id)
            .single();

          return {
            ...request,
            sender_profile: senderProfile
          };
        })
      );

      setRequests(requestsWithProfiles as ChatRequest[]);
    } catch (error) {
      console.error('Error fetching chat requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendChatRequest = async (recipientId: string, message?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_requests')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          message
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Chat request already sent to this user');
        }
        throw error;
      }
    } catch (error) {
      console.error('Error sending chat request:', error);
      throw error;
    }
  };

  const respondToRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_requests')
        .update({ status })
        .eq('id', requestId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      if (status === 'accepted') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          // Create direct chat when request is accepted
          try {
            // Create new conversation directly
            const { data: conversation, error: convError } = await supabase
              .from('chat_conversations')
              .insert({
                type: 'direct',
                created_by: user.id
              })
              .select()
              .single();

            if (convError) throw convError;

            // Add participants
            const { error: participantsError } = await supabase
              .from('chat_participants')
              .insert([
                { conversation_id: conversation.id, user_id: user.id, is_admin: true },
                { conversation_id: conversation.id, user_id: request.sender_id, is_admin: false }
              ]);

            if (participantsError) throw participantsError;
          } catch (error) {
            console.error('Error creating direct chat from request:', error);
          }
        }
      }

      await fetchRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const requestsChannel = supabase
      .channel('chat-requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_requests',
        filter: `recipient_id=eq.${user.id}`
      }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
    };
  }, [user]);

  return {
    requests,
    loading,
    sendChatRequest,
    respondToRequest,
    refetch: fetchRequests
  };
};