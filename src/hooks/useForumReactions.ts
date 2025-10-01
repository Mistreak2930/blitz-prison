import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type ReactionType = 'like' | 'helpful' | 'funny' | 'love';

interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

interface ReactionCounts {
  like: number;
  helpful: number;
  funny: number;
  love: number;
}

export const useForumReactions = (postId: string) => {
  const [reactions, setReactions] = useState<PostReaction[]>([]);
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_reactions')
        .select('*')
        .eq('post_id', postId);
      
      if (error) throw error;
      
      // Type the data properly
      const typedReactions = (data || []).map(item => ({
        ...item,
        reaction_type: item.reaction_type as ReactionType
      }));
      
      setReactions(typedReactions);
      
      if (user) {
        const userReactionTypes = typedReactions
          .filter(r => r.user_id === user.id)
          .map(r => r.reaction_type);
        setUserReactions(userReactionTypes);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReaction = async (reactionType: ReactionType) => {
    if (!user) return;
    
    const hasReaction = userReactions.includes(reactionType);
    
    if (hasReaction) {
      // Remove reaction
      const { error } = await supabase
        .from('forum_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);
      
      if (error) throw error;
    } else {
      // Add reaction
      const { error } = await supabase
        .from('forum_reactions')
        .insert([{
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType
        }]);
      
      if (error) throw error;
    }
    
    await fetchReactions(); // Refresh
  };

  const getReactionCounts = (): ReactionCounts => {
    return {
      like: reactions.filter(r => r.reaction_type === 'like').length,
      helpful: reactions.filter(r => r.reaction_type === 'helpful').length,
      funny: reactions.filter(r => r.reaction_type === 'funny').length,
      love: reactions.filter(r => r.reaction_type === 'love').length,
    };
  };

  useEffect(() => {
    fetchReactions();
  }, [postId, user?.id]);

  return {
    reactions,
    userReactions,
    loading,
    toggleReaction,
    getReactionCounts,
    fetchReactions
  };
};