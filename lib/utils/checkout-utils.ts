import { Order } from '@/lib/orders';

export interface CheckoutSession {
  sessionId: string;
  startedAt: string;
  url?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const CHECKOUT_SESSION_KEY = 'active_checkout_session';
export const CHECKOUT_STARTED_KEY = 'checkout_started_at';
export const CHECKOUT_URL_KEY = 'checkout_url';

export function getActiveCheckoutSession(): CheckoutSession | null {
  try {
    const sessionId = localStorage.getItem(CHECKOUT_SESSION_KEY);
    const startedAt = localStorage.getItem(CHECKOUT_STARTED_KEY);
    const url = localStorage.getItem(CHECKOUT_URL_KEY);

    if (!sessionId || !startedAt) {
      return null;
    }

    return {
      sessionId,
      startedAt,
      url: url || undefined,
    };
  } catch (error) {
    console.error('Error getting active checkout session:', error);
    return null;
  }
}

export function setActiveCheckoutSession(sessionId: string, url?: string): void {
  try {
    localStorage.setItem(CHECKOUT_SESSION_KEY, sessionId);
    localStorage.setItem(CHECKOUT_STARTED_KEY, new Date().toISOString());
    if (url) {
      localStorage.setItem(CHECKOUT_URL_KEY, url);
    }
  } catch (error) {
    console.error('Error setting active checkout session:', error);
  }
}

export function clearActiveCheckoutSession(): void {
  try {
    const sessionId = localStorage.getItem(CHECKOUT_SESSION_KEY);
    if (sessionId) {
      localStorage.removeItem(`order_${sessionId}`);
    }
    localStorage.removeItem(CHECKOUT_SESSION_KEY);
    localStorage.removeItem(CHECKOUT_STARTED_KEY);
    localStorage.removeItem(CHECKOUT_URL_KEY);
  } catch (error) {
    console.error('Error clearing active checkout session:', error);
  }
}

export function isCheckoutSessionExpired(session: CheckoutSession, maxAgeMinutes: number = 30): boolean {
  const startTime = new Date(session.startedAt).getTime();
  const timeDiff = Date.now() - startTime;
  return timeDiff > maxAgeMinutes * 60 * 1000;
}

export function isNavigationFromStripe(referrer: string): boolean {
  return referrer.includes('checkout.stripe.com') || referrer.includes('stripe.com');
}

export function createCancelledOrderData(
  order: Order,
  reason: 'navigation_away' | 'page_unload' | 'back_navigation' | 'timeout' = 'navigation_away'
): Order {
  return {
    ...order,
    status: 'cancelled',
    updatedAt: new Date().toISOString(),
    cancellationReason: reason,
  };
} 