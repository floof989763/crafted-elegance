import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AdminAuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
};

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    loading: true,
    session: null,
    user: null,
    isAdmin: false,
  });

  useEffect(() => {
    let active = true;

    const checkAdmin = async (user: User | null): Promise<boolean> => {
      if (!user) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    };

    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setState((s) => ({ ...s, session, user: session?.user ?? null }));
      // Defer Supabase call to avoid recursion warnings
      setTimeout(async () => {
        const isAdmin = await checkAdmin(session?.user ?? null);
        if (!active) return;
        setState({
          loading: false,
          session,
          user: session?.user ?? null,
          isAdmin,
        });
      }, 0);
    });

    // Then load existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      const isAdmin = await checkAdmin(session?.user ?? null);
      if (!active) return;
      setState({
        loading: false,
        session,
        user: session?.user ?? null,
        isAdmin,
      });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
