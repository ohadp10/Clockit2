import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [ready, setReady] = React.useState(false);
  const [isAuthed, setIsAuthed] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        try { await supabase.auth.signOut(); } catch { /* ignore */ }
      }
      setIsAuthed(!!data.session);
      setReady(true);
    })();
  }, []);

  if (!ready) return null; // no spinners; do not alter UI
  if (!isAuthed) return <Navigate to="/auth" state={{ from: location }} replace />;
  return <>{children}</>;
}
