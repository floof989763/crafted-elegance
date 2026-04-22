import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type CustomerAuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
};

/**
 * Lightweight auth hook for the storefront.
 * Tracks session only — no admin role check (use useAdminAuth for that).
 */
export function useCustomerAuth(): CustomerAuthState {
  const [state, setState] = useState<CustomerAuthState>({
    loading: true,
    session: null,
    user: null,
  });

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setState({ loading: false, session, user: session?.user ?? null });
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setState({ loading: false, session, user: session?.user ?? null });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}