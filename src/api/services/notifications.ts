import { get, patch } from '../http';
import { ListResponse, Notification } from '../types';
import { NOTIFICATIONS, NOTIFICATION } from '../endpoints';

export async function listNotifications(
  token: string,
  params?: { limit?: number; cursor?: string }
): Promise<ListResponse<Notification>> {
  const q = new URLSearchParams();
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.cursor) q.set('cursor', params.cursor);
  return get<ListResponse<Notification>>(`${NOTIFICATIONS}${q.toString() ? `?${q.toString()}` : ''}`, token);
}

export async function updateNotification(token: string, notifId: string, data: { read: boolean }): Promise<{ ok: true }>{
  return patch<{ ok: true }>(NOTIFICATION(notifId), data, token);
}

