import { del, get, post } from '../http';
import { AccountLink, ListResponse, Platform } from '../types';
import { ACCOUNTS, ACCOUNT_UNLINK } from '../endpoints';

export async function listAccounts(token: string, clientId: string): Promise<ListResponse<AccountLink>> {
  const q = new URLSearchParams({ clientId });
  return get<ListResponse<AccountLink>>(`${ACCOUNTS}?${q.toString()}`, token);
}

export async function linkAccount(
  token: string,
  data: { clientId: string; platform: Platform; authPayload?: any }
): Promise<{ ok: true }>{
  return post<{ ok: true }>(ACCOUNTS + '/link', data, token);
}

export async function unlinkAccount(
  token: string,
  clientId: string,
  platform: Platform,
  externalId: string
): Promise<{ ok: true }>{
  return del<{ ok: true }>(ACCOUNT_UNLINK(clientId, platform, externalId), token);
}

