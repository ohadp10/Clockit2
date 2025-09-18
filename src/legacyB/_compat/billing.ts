// Minimal billing compatibility layer for legacy layout/pages
// Returns stable shapes so UI can render without backend.

type Subscription = {
  status: 'free' | 'active' | 'past_due' | 'canceled';
  planId?: string;
  quantity?: number;
};

export async function getSubscriptionStatus(): Promise<Subscription> {
  return { status: 'free' };
}

export async function createCheckoutSession(_planId: string, _quantity?: number): Promise<{ checkoutUrl: string }>{
  // Point to a placeholder when backend isn’t wired
  return { checkoutUrl: '/' };
}

export async function cancelSubscription(_mode?: string): Promise<{ ok: true }>{
  return { ok: true };
}

export async function resumeSubscription(): Promise<{ ok: true }>{
  return { ok: true };
}

export async function getPortalUrl(): Promise<{ portalUrl: string }>{
  return { portalUrl: '/' };
}
