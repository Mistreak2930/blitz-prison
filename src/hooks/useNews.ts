import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  pinned: boolean;
}

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (id: string, pinned: boolean) => {
    const { error } = await supabase
      .from('news')
      .update({ pinned: !pinned })
      .eq('id', id);
    
    if (error) throw error;
    await fetchNews(); // Refresh the list
  };

  const createNews = async (title: string, content: string) => {
    if (!user) throw new Error('Must be logged in to create news');
    
    const { data, error } = await supabase
      .from('news')
      .insert([
        {
          title,
          content,
          user_id: user.id
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    await fetchNews(); // Refresh the list
    return data;
  };

  const deleteNews = async (id: string) => {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await fetchNews(); // Refresh the list
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return {
    news,
    loading,
    createNews,
    deleteNews,
    fetchNews,
    togglePin
  };
};