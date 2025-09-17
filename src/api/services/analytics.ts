import { get } from '../http';
import { AnalyticsDashboardResponse, Platform } from '../types';
import { ANALYTICS_DASHBOARD } from '../endpoints';

export async function dashboard(
  token: string,
  params: { clientId: string; platform: 'all'|Platform; range: '7d'|'30d'|'90d' }
): Promise<AnalyticsDashboardResponse> {
  const q = new URLSearchParams({
    clientId: params.clientId,
    platform: params.platform,
    range: params.range,
  });
  return get<AnalyticsDashboardResponse>(`${ANALYTICS_DASHBOARD}?${q.toString()}`, token);
}

