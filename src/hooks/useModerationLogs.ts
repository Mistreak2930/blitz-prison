import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ModerationLog {
  id: string;
  moderator_id: string;
  target_user_id?: string;
  action_type: string;
  reason: string;
  details?: any;
  created_at: string;
  moderator_profile?: {
    username: string;
  };
  target_profile?: {
    username: string;
  };
}

export const useModerationLogs = () => {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('moderation_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching moderation logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (
    targetUserId: string | null,
    actionType: string,
    reason: string,
    details?: any
  ) => {
    if (!user) throw new Error('Must be logged in');
    
    const { error } = await supabase
      .from('moderation_logs')
      .insert([{
        moderator_id: user.id,
        target_user_id: targetUserId,
        action_type: actionType,
        reason,
        details
      }]);
    
    if (error) throw error;
    await fetchLogs(); // Refresh logs
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    logAction,
    fetchLogs
  };
};