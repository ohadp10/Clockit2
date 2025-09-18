import { supabase } from '@/lib/supabaseClient';

// Global auth listener: redirects to /auth when user signs out or session disappears.
// No UI changes; imported for side-effects only.
try {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
      if (path !== '/auth' && path !== '/auth/') {
        try { window.location.assign('/auth'); } catch { /* ignore */ }
      }
    }
  });
} catch {
  // ignore listener errors in non-browser environments
}

