import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  minecraft_username?: string;
  discord_username?: string;
  last_seen: string;
  post_count: number;
  reputation: number;
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error('Must be logged in');
    
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', user.id);
    
    if (error) throw error;
    await fetchProfiles(); // Refresh profiles
  };

  const updateLastSeen = async () => {
    if (!user) return;
    
    await supabase
      .from('profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('user_id', user.id);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Update last seen when component mounts
  useEffect(() => {
    updateLastSeen();
  }, [user]);

  return {
    profiles,
    loading,
    fetchProfiles,
    getProfile,
    updateProfile,
    updateLastSeen
  };
};