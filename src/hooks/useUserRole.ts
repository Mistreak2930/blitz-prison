import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const checkRole = async () => {
      try {
        if (!user) {
          if (!cancelled) {
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        if (!cancelled) {
          if (error) {
            setIsAdmin(false);
          } else {
            setIsAdmin(Boolean(data));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    checkRole();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { isAdmin, loading };
};
