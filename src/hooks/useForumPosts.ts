import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ForumPost {
  id: string;
  user_id: string;
  category_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export const useForumPosts = (categoryId?: number) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (title: string, content: string, categoryId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if profile exists, create if not
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous';
        await supabase
          .from('profiles')
          .insert([{ 
            user_id: user.id, 
            username 
          }]);
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .insert([{
          user_id: user.id,
          category_id: categoryId,
          title,
          content
        }])
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error } as { error: any };
    }
  };

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscription
    const channel = supabase
      .channel('forum-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryId]);

  return {
    posts,
    loading,
    fetchPosts,
    createPost,
    deletePost
  };
};