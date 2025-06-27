// Pagination
export const PAGE_SIZE = 12;

// Tax and shipping
export const VAT_RATE = 0.19; // 19% VAT
export const FREE_SHIPPING_THRESHOLD = 100; // €100
export const SHIPPING_COST = 9.99; // €9.99

// Checkout session
export const CHECKOUT_SESSION_TIMEOUT = 30; // minutes
export const CHECKOUT_NAVIGATION_TIMEOUT = 10; // minutes

// Local storage keys
export const STORAGE_KEYS = {
  CART: 'cart',
  FAVORITES: 'favorites',
  ORDERS: 'orders',
  USER_PROFILE: 'userProfile',
  ACTIVE_CHECKOUT_SESSION: 'active_checkout_session',
  CHECKOUT_STARTED_AT: 'checkout_started_at',
  CHECKOUT_URL: 'checkout_url',
  LAST_SELECTION: 'lastSelection',
} as const;

// Product defaults
export const DEFAULT_SIZES = ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"];
export const DEFAULT_COLORS = ["Black", "White", "Red", "Blue", "Green", "Grey", "Yellow"];

// Order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  EXPIRED: 'expired',
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const; 