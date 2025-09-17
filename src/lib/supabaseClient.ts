// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

// Lazy initialize Supabase client to avoid crashing at import time
// when env vars are missing or when index.html is opened directly.
let _client: any = null;

function resolveEnv() {
  let viteEnv: any = undefined;
  try {
    // import.meta is valid syntax in ESM; guard just in case
    viteEnv = (import.meta as any)?.env;
  } catch {
    viteEnv = undefined;
  }

  let winEnv: any = undefined;
  try {
    winEnv = typeof window !== 'undefined' ? (window as any).__ENV__ : undefined;
  } catch {
    winEnv = undefined;
  }

  const url = (viteEnv?.VITE_SUPABASE_URL as string | undefined) ?? (winEnv?.VITE_SUPABASE_URL as string | undefined);
  const anon = (viteEnv?.VITE_SUPABASE_ANON_KEY as string | undefined) ?? (winEnv?.VITE_SUPABASE_ANON_KEY as string | undefined);
  return { url, anon } as { url?: string; anon?: string };
}

function debugEnvOnce(reason: string) {
  // Dev-only, do not leak secrets. Logs presence booleans only.
  try {
    // Avoid spamming: tie to reason and once per page
    const key = `__supabase_env_debugged__${reason}`;
    if ((window as any)[key]) return;
    (window as any)[key] = true;
  } catch { /* no window */ }

  try {
    let viteEnv: any = undefined;
    let winEnv: any = undefined;
    try { viteEnv = (import.meta as any)?.env; } catch { /* ignore */ }
    try { winEnv = typeof window !== 'undefined' ? (window as any).__ENV__ : undefined; } catch { /* ignore */ }

    const info = {
      reason,
      hasImportMetaEnv: !!viteEnv,
      viteDev: !!viteEnv?.DEV,
      viteProd: !!viteEnv?.PROD,
      hasViteUrl: !!viteEnv?.VITE_SUPABASE_URL,
      hasViteAnon: !!viteEnv?.VITE_SUPABASE_ANON_KEY,
      hasRuntimeEnv: !!winEnv,
      hasRuntimeUrl: !!winEnv?.VITE_SUPABASE_URL,
      hasRuntimeAnon: !!winEnv?.VITE_SUPABASE_ANON_KEY,
    };
    // Only print in dev to keep prod console clean
    if (info.viteDev || !info.hasImportMetaEnv) {
      // eslint-disable-next-line no-console
      console.debug('[supabase][env-debug]', info);
    }
  } catch {
    // ignore
  }
}

export function getSupabase() {
  if (_client) return _client;

  const { url, anon } = resolveEnv();

  if (!url || !anon) {
    debugEnvOnce('missing');
    // Throw only when actually used, so the app UI can render
    // and handlers can show a friendly message instead of a white screen.
    throw new Error('[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
  }

  _client = createClient(url, anon);
  return _client;
}

// Backwards-compatible export: a proxy that forwards to the lazy client
export const supabase: any = new Proxy(
  {},
  {
    get(_t, prop) {
      const client = getSupabase();
      // @ts-ignore dynamic prop
      return client[prop];
    },
  }
);

export async function getSession() {
  const { data } = await getSupabase().auth.getSession();
  return data.session ?? null;
}

export async function getUser() {
  const { data } = await getSupabase().auth.getUser();
  return data.user ?? null;
}
