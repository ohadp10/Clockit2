// Minimal legacy adapter for VideoAsset to satisfy legacy calls
// without changing any UI. Returns empty arrays by default.

export const VideoAsset = {
  async list(..._args: any[]) {
    return [] as any[];
  },
  async filter(_q?: Record<string, any>) {
    return [] as any[];
  },
};

