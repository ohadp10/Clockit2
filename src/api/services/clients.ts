import { del, get, patch, post } from '../http';
import { Client, ListResponse } from '../types';
import { CLIENTS, CLIENT } from '../endpoints';

export async function listClients(token: string, params?: { limit?: number; cursor?: string }): Promise<ListResponse<Client>> {
  const q = new URLSearchParams();
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.cursor) q.set('cursor', params.cursor);
  return get<ListResponse<Client>>(`${CLIENTS}${q.toString() ? `?${q.toString()}` : ''}`, token);
}

export async function createClient(token: string, data: { name: string }): Promise<{ id: string }>{
  return post<{ id: string }>(CLIENTS, data, token);
}

export async function updateClient(token: string, clientId: string, data: { name?: string }): Promise<{ ok: true }>{
  return patch<{ ok: true }>(CLIENT(clientId), data, token);
}

export async function deleteClient(token: string, clientId: string): Promise<{ ok: true }>{
  return del<{ ok: true }>(CLIENT(clientId), token);
}

