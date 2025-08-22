import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'moderator' | 'user' | 'dev' | 'news_updater' | 'announcements_manager';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

interface ProfileWithRoles {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  roles: AppRole[];
}

export const useRoles = () => {
  const [profiles, setProfiles] = useState<ProfileWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfilesWithRoles = async () => {
    try {
      // Get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('username');
      
      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const profilesWithRoles = profilesData.map(profile => {
        const userRoles = rolesData
          .filter(role => role.user_id === profile.user_id)
          .map(role => role.role);
        
        return {
          ...profile,
          roles: userRoles
        };
      });

      setProfiles(profilesWithRoles);
    } catch (error) {
      console.error('Error fetching profiles with roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .insert([
        {
          user_id: userId,
          role: role
        }
      ]);
    
    if (error) throw error;
    await fetchProfilesWithRoles(); // Refresh the list
  };

  const removeRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
    
    if (error) throw error;
    await fetchProfilesWithRoles(); // Refresh the list
  };

  const hasRole = (userId: string, role: AppRole): boolean => {
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.roles.includes(role) || false;
  };

  const getUserRoles = (userId: string): AppRole[] => {
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.roles || [];
  };

  useEffect(() => {
    fetchProfilesWithRoles();
  }, []);

  return {
    profiles,
    loading,
    assignRole,
    removeRole,
    hasRole,
    getUserRoles,
    fetchProfilesWithRoles
  };
};