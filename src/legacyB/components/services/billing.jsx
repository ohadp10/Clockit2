import { addDays, formatISO } from 'date-fns';

// --- MOCK CONSTANTS ---
const CLIENT_PRICING = { 1: 50, 5: 70, 10: 160, 15: 260, 20: 300 };
const BUSINESS_PLAN_PRICE = 400;

// --- MOCK API SERVICE ---
// This service simulates the backend API calls described in the mission.

const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms + Math.random() * 400));

/**
 * Simulates creating a checkout session.
 * @param {string} planId - e.g., "clients_10", "business"
 * @param {number} [quantity] - The number of clients for flexible plans.
 * @returns {Promise<{checkoutUrl: string}>}
 */
export async function createCheckoutSession(planId, quantity) {
  await mockDelay();
  console.log(`[Billing Service] Creating checkout for plan: ${planId}, quantity: ${quantity}`);
  // In a real app, this would be a URL from PayPlus/Stripe.
  // We redirect to our own mock success page.
  return { checkoutUrl: `/billing/success?planId=${planId}` };
}

/**
 * Simulates fetching the user's current subscription status.
 * This mock will cycle through different states for testing purposes.
 * @returns {Promise<object>}
 */
export async function getSubscriptionStatus() {
  await mockDelay(500);
  console.log("[Billing Service] Fetching subscription status.");

  const states = [
    { status: "trialing", planId: "clients_5", quantity: 5, trial_end: addDays(new Date(), 4).toISOString(), current_period_end: addDays(new Date(), 7).toISOString() },
    { status: "active", planId: "clients_10", quantity: 10, current_period_end: addDays(new Date(), 20).toISOString() },
    { status: "past_due", planId: "business", quantity: 1, current_period_end: addDays(new Date(), -5).toISOString() },
    { status: "canceled", planId: "clients_1", quantity: 1, current_period_end: addDays(new Date(), 15).toISOString(), effectiveOn: addDays(new Date(), 15).toISOString() },
    { status: "active", planId: "business", quantity: 1, current_period_end: addDays(new Date(), 25).toISOString(), pending_downgrade: { planId: "clients_20", effectiveOn: addDays(new Date(), 25).toISOString() } },
    { status: "free" } // No subscription
  ];

  // Return a consistent state for now to avoid UI flicker on hot-reload. 
  // Change the index to test different states.
  const currentState = states[1]; 
  
  console.log("[Billing Service] Returning status: ", currentState);
  return currentState;
}

/**
 * Simulates an immediate upgrade.
 * @param {string} planId
 * @param {number} [quantity]
 * @returns {Promise<{ok: boolean}>}
 */
export async function upgradeSubscription(planId, quantity) {
  await mockDelay();
  console.log(`[Billing Service] Upgrading to plan: ${planId}, quantity: ${quantity}`);
  return { ok: true };
}

/**
 * Simulates scheduling a downgrade for the end of the period.
 * @param {string} planId
 * @param {number} [quantity]
 * @returns {Promise<{ok: boolean, effectiveOn: string}>}
 */
export async function downgradeSubscription(planId, quantity) {
  await mockDelay();
  console.log(`[Billing Service] Downgrading to plan: ${planId}, quantity: ${quantity}`);
  return { ok: true, effectiveOn: addDays(new Date(), 20).toISOString() }; // Mock effective date
}

/**
 * Simulates canceling a subscription.
 * @param {'period_end' | 'immediate'} mode
 * @returns {Promise<{ok: boolean, effectiveOn?: string}>}
 */
export async function cancelSubscription(mode) {
  await mockDelay();
  console.log(`[Billing Service] Canceling subscription with mode: ${mode}`);
  if (mode === 'period_end') {
    return { ok: true, effectiveOn: addDays(new Date(), 20).toISOString() };
  }
  return { ok: true };
}

/**
 * Simulates resuming a canceled-at-period-end subscription.
 * @returns {Promise<{ok: boolean}>}
 */
export async function resumeSubscription() {
  await mockDelay();
  console.log("[Billing Service] Resuming subscription.");
  return { ok: true };
}

/**
 * Simulates getting a URL to the customer billing portal.
 * @returns {Promise<{portalUrl: string}>}
 */
export async function getPortalUrl() {
  await mockDelay();
  console.log("[Billing Service] Generating portal URL.");
  // In a real app, this URL is provided by the payment provider.
  return { portalUrl: "https://billing.example.com/portal/123" };
}