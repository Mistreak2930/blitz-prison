import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  pinned: boolean;
}

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (id: string, pinned: boolean) => {
    const { error } = await supabase
      .from('announcements')
      .update({ pinned: !pinned })
      .eq('id', id);
    
    if (error) throw error;
    await fetchAnnouncements(); // Refresh the list
  };

  const createAnnouncement = async (title: string, content: string) => {
    if (!user) throw new Error('Must be logged in to create announcements');
    
    const { data, error } = await supabase
      .from('announcements')
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
    await fetchAnnouncements(); // Refresh the list
    return data;
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await fetchAnnouncements(); // Refresh the list
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    loading,
    createAnnouncement,
    deleteAnnouncement,
    fetchAnnouncements,
    togglePin
  };
};