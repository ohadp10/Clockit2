// Path constants for API routes (relative to VITE_API_URL)

// Auth & OTP
export const AUTH_VERIFY_REQUEST = '/auth/verify/request';
export const AUTH_VERIFY_CONFIRM = '/auth/verify/confirm';
export const AUTH_REGISTER = '/auth/register';
export const AUTH_REGISTER_COMPLETE = '/auth/register/complete';
export const AUTH_LOGIN = '/auth/login';
export const AUTH_FORGOT_REQUEST = '/auth/forgot-password/request';
export const AUTH_FORGOT_CONFIRM = '/auth/forgot-password/confirm';
export const AUTH_ME = '/auth/me';

// Clients
export const CLIENTS = '/clients';
export const CLIENT = (clientId: string) => `/clients/${encodeURIComponent(clientId)}`;

// Accounts
export const ACCOUNTS = '/accounts';
export const ACCOUNT_UNLINK = (clientId: string, platform: string, externalId: string) =>
  `/accounts/${encodeURIComponent(clientId)}/${encodeURIComponent(platform)}/${encodeURIComponent(externalId)}`;

// Assets
export const ASSETS = '/assets';
export const UPLOADS_PRESIGN = '/uploads/presign';

// Scheduled Posts
export const SCHEDULED_POSTS = '/scheduled-posts';
export const SCHEDULED_POST = (postId: string) => `/scheduled-posts/${encodeURIComponent(postId)}`;

// Notifications
export const NOTIFICATIONS = '/notifications';
export const NOTIFICATION = (notifId: string) => `/notifications/${encodeURIComponent(notifId)}`;

// Billing
export const BILLING_CHECKOUT = '/billing/checkout';
export const BILLING_STATUS = '/billing/status';
export const BILLING_UPGRADE = '/billing/upgrade';
export const BILLING_DOWNGRADE = '/billing/downgrade';
export const BILLING_CANCEL = '/billing/cancel';
export const BILLING_RESUME = '/billing/resume';
export const BILLING_PORTAL = '/billing/portal';
export const BILLING_WEBHOOK = '/billing/webhook'; // server-only

// Analytics
export const ANALYTICS_DASHBOARD = '/analytics/dashboard';

