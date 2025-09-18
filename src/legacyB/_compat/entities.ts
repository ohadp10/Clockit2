// Conditional re-export for legacy dashboard data providers
// When VITE_LEGACY_MOCK === '1', use local mocks; otherwise try real API.

const useMock = ((import.meta as any)?.env?.VITE_LEGACY_MOCK === '1');

let Client: any;
let VideoAsset: any;
let ScheduledPost: any;
let Analytics: any;
let User: any;

if (useMock) {
  const m = await import('./mockData');
  Client = m.Client;
  VideoAsset = m.VideoAsset;
  ScheduledPost = m.ScheduledPost;
  Analytics = m.Analytics;
  User = m.User;
} else {
  try {
    // Prefer legacy clients adapter for Clients entity
    const ca: any = await import('./clientsAdapter');
    const r: any = await import('../api/entities.js');
    const va: any = await import('./videoAssetsAdapter');
    Client = ca.Client;
    VideoAsset = va.VideoAsset; // ensure filter/list exist
    ScheduledPost = r.ScheduledPost;
    Analytics = r.Analytics;
    User = r.User;
  } catch {
    // Fallback to mocks if real entities are unavailable
    const m = await import('./mockData');
    Client = m.Client;
    VideoAsset = m.VideoAsset;
    ScheduledPost = m.ScheduledPost;
    Analytics = m.Analytics;
    User = m.User;
  }
}

export { Client, VideoAsset, ScheduledPost, Analytics, User };
