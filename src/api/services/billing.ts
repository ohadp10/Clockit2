import { get, post } from '../http';
import { BillingStatus } from '../types';
import {
  BILLING_CANCEL,
  BILLING_CHECKOUT,
  BILLING_DOWNGRADE,
  BILLING_PORTAL,
  BILLING_RESUME,
  BILLING_STATUS,
  BILLING_UPGRADE,
} from '../endpoints';

export async function checkout(token: string, data: { planId: string; quantity?: number }): Promise<{ checkoutUrl: string }>{
  return post(BILLING_CHECKOUT, data, token);
}

export async function status(token: string): Promise<BillingStatus>{
  return get<BillingStatus>(BILLING_STATUS, token);
}

export async function upgrade(token: string, data: { planId: string; quantity?: number }): Promise<{ ok: true }>{
  return post(BILLING_UPGRADE, data, token);
}

export async function downgrade(token: string, data: { planId: string; quantity?: number; when: 'period_end' }): Promise<{ ok: true; effectiveOn: string }>{
  return post(BILLING_DOWNGRADE, data, token);
}

export async function cancel(token: string, data: { mode: 'period_end'|'immediate' }): Promise<{ ok: true; effectiveOn?: string }>{
  return post(BILLING_CANCEL, data, token);
}

export async function resume(token: string): Promise<{ ok: true }>{
  return post(BILLING_RESUME, {}, token);
}

export async function portal(token: string): Promise<{ portalUrl: string }>{
  return post(BILLING_PORTAL, {}, token);
}

