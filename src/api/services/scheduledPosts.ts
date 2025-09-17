import { del, get, patch, post } from '../http';
import { ListResponse, ScheduledPost, Platform } from '../types';
import { SCHEDULED_POSTS, SCHEDULED_POST } from '../endpoints';

export async function listScheduledPosts(
  token: string,
  clientId: string,
  params?: { status?: 'scheduled'|'publishing'|'published'|'failed'; from?: string; to?: string; limit?: number; cursor?: string }
): Promise<ListResponse<ScheduledPost>> {
  const q = new URLSearchParams({ clientId });
  if (params?.status) q.set('status', params.status);
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.cursor) q.set('cursor', params.cursor);
  return get<ListResponse<ScheduledPost>>(`${SCHEDULED_POSTS}?${q.toString()}`, token);
}

export async function createScheduledPost(
  token: string,
  data: { clientId: string; platform: Platform; caption: string; media_asset_id: string; scheduled_at: string }
): Promise<{ id: string }>{
  return post<{ id: string }>(SCHEDULED_POSTS, data, token);
}

export async function updateScheduledPost(
  token: string,
  postId: string,
  data: { caption?: string; scheduled_at?: string; cancel?: boolean }
): Promise<{ ok: true }>{
  return patch<{ ok: true }>(SCHEDULED_POST(postId), data, token);
}

export async function deleteScheduledPost(token: string, postId: string): Promise<{ ok: true }>{
  return del<{ ok: true }>(SCHEDULED_POST(postId), token);
}

