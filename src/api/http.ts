// Shared HTTP utilities for API calls
export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export function getBaseUrl(): string {
  // Default to '/api' so local mocks/proxies work without env.
  // In production, set VITE_API_URL to your API Gateway URL.
  const base = (import.meta as any)?.env?.VITE_API_URL;
  return base && typeof base === 'string' && base.length > 0 ? base : '/api';
}

export function authHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function fetchJson<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const body = isJson && text ? JSON.parse(text) : (text || undefined);

  if (!res.ok) {
    const code = (body && (body.code || body.error)) || 'http_error';
    const message = (body && (body.message || body.error_description)) || res.statusText || 'Request failed';
    throw new ApiError(message, code, res.status, body);
  }
  return body as T;
}

export async function get<T = unknown>(path: string, token?: string): Promise<T> {
  return fetchJson<T>(path, { method: 'GET', headers: { ...authHeader(token) } });
}

export async function post<T = unknown>(path: string, data?: any, token?: string, extraHeaders?: Record<string, string>): Promise<T> {
  return fetchJson<T>(path, {
    method: 'POST',
    headers: { ...authHeader(token), ...(extraHeaders || {}) },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

export async function patch<T = unknown>(path: string, data?: any, token?: string): Promise<T> {
  return fetchJson<T>(path, {
    method: 'PATCH',
    headers: { ...authHeader(token) },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

export async function del<T = unknown>(path: string, token?: string): Promise<T> {
  return fetchJson<T>(path, { method: 'DELETE', headers: { ...authHeader(token) } });
}

