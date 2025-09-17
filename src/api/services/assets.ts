import { get, post } from '../http';
import {
  Asset,
  ListResponse,
  MediaType,
  PresignUploadRequest,
  PresignUploadResponse,
} from '../types';
import { ASSETS, UPLOADS_PRESIGN } from '../endpoints';

export async function listAssets(
  token: string,
  clientId: string,
  params?: { limit?: number; cursor?: string }
): Promise<ListResponse<Asset>> {
  const q = new URLSearchParams({ clientId });
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.cursor) q.set('cursor', params.cursor);
  return get<ListResponse<Asset>>(`${ASSETS}?${q.toString()}`, token);
}

export async function presignUpload(token: string, data: PresignUploadRequest): Promise<PresignUploadResponse> {
  return post<PresignUploadResponse>(UPLOADS_PRESIGN, data, token);
}

export async function createAsset(
  token: string,
  data: { clientId: string; media_key: string; original_filename: string; media_type: MediaType }
): Promise<{ id: string }>{
  return post<{ id: string }>(ASSETS, data, token);
}

