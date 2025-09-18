// legacy adapter stub
// Minimal stub client to keep imports working after provider removal.
import { supabase } from '@/lib/supabaseClient';
export const legacyApi = {
  // stubbed entities with minimal async methods used by the dashboard
  entities: {
    Client: {
      async filter(_q) { return []; },
      async list() { return []; },
      async create() { return { id: 'mock-client' }; },
      async update() { return { ok: true }; },
      async delete() { return { ok: true }; },
    },
    VideoAsset: {
      async list() { return []; },
    },
    ScheduledPost: {
      async list(_sort, _limit) { return []; },
      async update() { return { ok: true }; },
    },
    Campaign: {},
    Analytics: {
      async list() { return []; },
    },
    UserRole: {},
  },
  // stubbed auth with a working me() to unblock dashboard
  auth: {
    async me() {
      try {
        // Ensure session and store access token for legacy consumers
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session ?? null;
        const accessToken = session?.access_token ?? null;
        if (accessToken) {
          try { localStorage.setItem('legacy_token', accessToken); } catch { /* ignore storage errors */ }
        }

        // Fetch user to get email and profile metadata
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user ?? session?.user ?? null;
        const email = user?.email ?? null;
        const fullName = (user?.user_metadata?.full_name || user?.user_metadata?.fullName || null);

        if (email) {
          return {
            id: user?.id || 'supabase-user',
            email,
            full_name: fullName || email,
          };
        }
      } catch { /* fall through to mock */ }
      // Fallback mock (UI-only)
      return { id: 'legacy-user', email: 'mock@example.com', full_name: 'mock@example.com' };
    },
    async logout() {
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
    }
  },
  // stubbed integrations
  integrations: {
    Core: {
      InvokeLLM: async () => { throw new Error('integration removed'); },
      SendEmail: async () => { throw new Error('integration removed'); },
      UploadFile: async () => { throw new Error('integration removed'); },
      GenerateImage: async () => { throw new Error('integration removed'); },
      ExtractDataFromUploadedFile: async () => { throw new Error('integration removed'); },
      CreateFileSignedUrl: async () => { throw new Error('integration removed'); },
      UploadPrivateFile: async () => { throw new Error('integration removed'); },
    },
  },
};
