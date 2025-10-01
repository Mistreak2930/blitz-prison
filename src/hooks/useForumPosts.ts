import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ForumPost {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  reply_count: number;
  locked: boolean;
  pinned: boolean;
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
      const query = supabase
        .from('forum_posts')
        .select(`
          *,
          profiles!forum_posts_user_id_fkey (
            username,
            avatar_url
          )
        `);

      if (categoryId) {
        query.eq('category', categoryId.toString());
      }

      const { data, error } = await query
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

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
          category: categoryId.toString(),
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
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    await fetchPosts(); // Refresh the list
  };

  const togglePin = async (postId: string, pinned: boolean) => {
    const { error } = await supabase
      .from('forum_posts')
      .update({ pinned: !pinned })
      .eq('id', postId);
    
    if (error) throw error;
    await fetchPosts(); // Refresh the list
  };

  const incrementViews = async (postId: string) => {
    // Get current view count and increment
    const { data: post } = await supabase
      .from('forum_posts')
      .select('view_count')
      .eq('id', postId)
      .single();
    
    if (post) {
      const { error } = await supabase
        .from('forum_posts')
        .update({ view_count: (post.view_count || 0) + 1 })
        .eq('id', postId);
      
      if (error) console.error('Error incrementing views:', error);
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
    deletePost,
    togglePin,
    incrementViews
  };
};