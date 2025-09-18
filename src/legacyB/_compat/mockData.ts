// Minimal mock data providers for legacy dashboard
// Shapes match what the dashboard expects to read.

export const User = {
  async me() {
    return { id: 'mock-user', email: 'mock@example.com', full_name: 'mock@example.com' } as any;
  },
  async logout() {
    try { localStorage.removeItem('legacy_token'); } catch { /* ignore */ }
    return { ok: true } as any;
  },
};

export const Client = {
  async filter(_q: Record<string, any>) {
    return [] as any[];
  },
};

export const VideoAsset = {
  async list() {
    return [] as any[];
  },
};

export const ScheduledPost = {
  async list(_sort?: string, _limit?: number) {
    return [] as any[];
  },
};

export const Analytics = {
  async list() {
    // example: [{ client_id, date, metrics: { views, likes, comments, engagement_rate } }]
    return [] as any[];
  },
};
