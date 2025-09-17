// Shared TypeScript types for API contracts

export type UUID = string;

export type Platform = 'instagram'|'youtube'|'facebook'|'tiktok'|'x'|'linkedin'|'threads';

export type MediaType = 'video'|'image';

export interface User {
  id: string; // userId without prefix
  username: string;
  email: string;
  full_name?: string;
  email_verified_at?: string; // ISO
}

export interface TokenResponse {
  token: string;
  user: User;
}

export interface Client {
  id: string;
  name: string;
  created_at: string;
}

export interface ListResponse<T> {
  items: T[];
  nextCursor?: string;
}

export interface AccountLink {
  platform: Platform;
  external_id: string;
  provider: 'ayrshare';
  connected_at: string;
}

export interface AssetMetadata {
  duration_sec?: number;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  thumbnail_url?: string;
}

export interface Asset {
  id: string;
  clientId: string;
  owner_user_id: string;
  filename?: string;
  original_filename: string;
  media_key: string;
  file_url?: string;
  media_type: MediaType;
  upload_status: 'pending'|'completed'|'failed';
  processing_status: 'pending'|'completed'|'failed';
  metadata?: AssetMetadata;
  created_at: string;
}

export interface PresignUploadRequest {
  filename: string;
  contentType: string;
  size: number;
  clientId: string;
}
export interface PresignUploadResponse {
  putUrl: string;
  media_key: string;
  publicUrl?: string;
}

export interface ScheduledPost {
  id: string;
  clientId: string;
  owner_user_id: string;
  platform: Platform;
  caption: string;
  media_asset_id: string;
  status: 'scheduled'|'publishing'|'published'|'failed';
  scheduled_at: string;
  published_at?: string;
  error?: string;
  retries?: number;
  ayrshare_post_id?: string;
}

export interface Notification {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  created_at: string;
}

export type SubscriptionStatus = 'trialing'|'active'|'past_due'|'canceled';

export interface BillingStatus {
  status: SubscriptionStatus;
  planId: string;
  quantity?: number;
  trial_end?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  pending_change?: { plan_id: string; quantity?: number; effective_on: string };
}

export interface AnalyticsTimeseriesPoint {
  date: string; // yyyymmdd or ISO date
  views?: number; likes?: number; comments?: number; shares?: number;
}

export interface AnalyticsDashboardResponse {
  range: '7d'|'30d'|'90d';
  from: string;
  to: string;
  totals: { views?: number; likes?: number; comments?: number; shares?: number; posts?: number; engagement_rate?: number };
  perPlatform: Record<string, { views?: number; likes?: number; comments?: number; shares?: number; posts?: number; engagement_rate?: number }>;
  timeseries: AnalyticsTimeseriesPoint[];
  lastCollectedAt?: string;
}

