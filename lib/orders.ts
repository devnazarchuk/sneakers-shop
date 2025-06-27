export interface OrderItem {
  productId: number;
  title: string;
  brand: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  images: string[];
}

export interface TrackingInfo {
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  currentStatus?: 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered';
  lastUpdate?: string;
  trackingUrl?: string;
  events?: Array<{
    date: string;
    status: string;
    location?: string;
    description: string;
  }>;
}

export interface Order {
  id: string;
  sessionId?: string;
  date: string;
  updatedAt?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed' | 'expired';
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  cancellationReason?: 'navigation_away' | 'page_unload' | 'back_navigation' | 'timeout';
  tracking?: TrackingInfo;
}

// Custom event for order updates
const ORDER_UPDATE_EVENT = 'orderUpdate';

// Generate unique ID
const generateUniqueId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Save order to localStorage
export const saveOrder = (order: Order): void => {
  try {
    const existingOrders = getOrders();
    
    // Check if order with same ID already exists
    const existingOrderById = existingOrders.find(o => o.id === order.id);
    if (existingOrderById) {
      // Update existing order
      const updatedOrders = existingOrders.map(o => 
        o.id === order.id ? { ...o, ...order } : o
      );
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      // Dispatch custom event to notify components about order update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(ORDER_UPDATE_EVENT, { detail: { orders: updatedOrders } }));
      }
      return;
    }
    
    // Check if order with same sessionId already exists
    const existingOrderIndex = existingOrders.findIndex(o => o.sessionId === order.sessionId);
    
    let updatedOrders: Order[];
    if (existingOrderIndex !== -1) {
      // Update existing order
      updatedOrders = existingOrders.map((o, index) => 
        index === existingOrderIndex ? order : o
      );
    } else {
      // Add new order
      updatedOrders = [order, ...existingOrders];
    }
    
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Dispatch custom event to notify components about order update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ORDER_UPDATE_EVENT, { detail: { orders: updatedOrders } }));
    }
  } catch (error) {
    console.error('Error saving order:', error);
  }
};

// Get all orders from localStorage
export const getOrders = (): Order[] => {
  try {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

// Get order by ID
export const getOrderById = (id: string): Order | null => {
  const orders = getOrders();
  return orders.find(order => order.id === id) || null;
};

// Get order by session ID
export const getOrderBySessionId = (sessionId: string): Order | null => {
  const orders = getOrders();
  return orders.find(order => order.sessionId === sessionId) || null;
};

// Update order status
export const updateOrderStatus = (id: string, status: Order['status']): void => {
  try {
    const orders = getOrders();
    const updatedOrders = orders.map(order => 
      order.id === id ? { ...order, status } : order
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Dispatch custom event to notify components about order update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ORDER_UPDATE_EVENT, { detail: { orders: updatedOrders } }));
    }
  } catch (error) {
    console.error('Error updating order status:', error);
  }
};

// Calculate order totals
export const calculateOrderTotals = (items: OrderItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.19; // 19% VAT
  const shipping = subtotal >= 100 ? 0 : 9.99; // Free shipping over €100
  const total = subtotal + tax + shipping;
  
  return { subtotal, tax, shipping, total };
};

// Create order items from cart items with proper typing
const createOrderItems = (cartItems: Array<{
  product: {
    id: number;
    title: string;
    brand: string;
    price: number;
    images?: string[];
  };
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}>): OrderItem[] => {
  return cartItems.map(item => ({
    productId: item.product.id,
    title: item.product.title,
    brand: item.product.brand,
    size: item.selectedSize,
    color: item.selectedColor,
    quantity: item.quantity,
    price: item.product.price,
    images: Array.isArray(item.product.images) 
      ? item.product.images.filter((img: string) => img && img.trim() !== '' && img !== 'undefined' && img !== 'null')
      : [],
  }));
};

// Create order from cart items
export const createOrderFromCart = (
  cartItems: Array<{
    product: {
      id: number;
      title: string;
      brand: string;
      price: number;
      images?: string[];
    };
    selectedSize: string;
    selectedColor: string;
    quantity: number;
  }>, 
  sessionId?: string,
  customerInfo?: Order['customerInfo']
): Order => {
  const orderItems = createOrderItems(cartItems);
  const { subtotal, tax, shipping, total } = calculateOrderTotals(orderItems);

  return {
    id: sessionId || generateUniqueId(),
    sessionId,
    date: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: orderItems,
    subtotal,
    tax,
    shipping,
    total,
    status: 'pending',
    customerInfo,
  };
};

// Create cancelled order from cart items
export const createCancelledOrder = (
  cartItems: Array<{
    product: {
      id: number;
      title: string;
      brand: string;
      price: number;
      images?: string[];
    };
    selectedSize: string;
    selectedColor: string;
    quantity: number;
  }>, 
  sessionId?: string,
  customerInfo?: Order['customerInfo'],
  reason: 'cancelled' | 'failed' = 'cancelled'
): Order => {
  const orderItems = createOrderItems(cartItems);
  const { subtotal, tax, shipping, total } = calculateOrderTotals(orderItems);

  return {
    id: sessionId || generateUniqueId(),
    sessionId,
    date: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: orderItems,
    subtotal,
    tax,
    shipping,
    total,
    status: reason,
    customerInfo,
  };
};

// Hook to listen for order updates
export function useOrderUpdates(callback: (orders: Order[]) => void) {
  if (typeof window === 'undefined') return;
  
  const handleOrderUpdate = (event: CustomEvent) => {
    callback(event.detail.orders);
  };

  window.addEventListener(ORDER_UPDATE_EVENT, handleOrderUpdate as EventListener);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(ORDER_UPDATE_EVENT, handleOrderUpdate as EventListener);
  };
}

// Clean up duplicate orders
export const cleanupDuplicateOrders = (): void => {
  try {
    const orders = getOrders();
    const uniqueOrders = new Map<string, Order>();
    
    // Keep the most recent order for each ID
    orders.forEach(order => {
      const existing = uniqueOrders.get(order.id);
      if (!existing || new Date(order.date) > new Date(existing.date)) {
        uniqueOrders.set(order.id, order);
      }
    });
    
    const cleanedOrders = Array.from(uniqueOrders.values());
    
    if (cleanedOrders.length !== orders.length) {
      localStorage.setItem('orders', JSON.stringify(cleanedOrders));
      console.log(`Cleaned up ${orders.length - cleanedOrders.length} duplicate orders`);
      
      // Dispatch custom event to notify components about order update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(ORDER_UPDATE_EVENT, { detail: { orders: cleanedOrders } }));
      }
    }
  } catch (error) {
    console.error('Error cleaning up duplicate orders:', error);
  }
};

// Check and update expired pending orders (older than 5 minutes)
export const checkAndUpdateExpiredOrders = (): void => {
  try {
    const orders = getOrders();
    const now = new Date();
    let hasUpdates = false;
    
    const updatedOrders = orders.map(order => {
      if (order.status === 'pending') {
        const orderDate = new Date(order.date);
        const timeDiff = now.getTime() - orderDate.getTime();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        if (timeDiff > fiveMinutes) {
          hasUpdates = true;
          return {
            ...order,
            status: 'expired' as const,
            updatedAt: now.toISOString(),
          };
        }
      }
      return order;
    });
    
    if (hasUpdates) {
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      console.log('Updated expired pending orders to expired status');
      
      // Dispatch custom event to notify components about order update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(ORDER_UPDATE_EVENT, { detail: { orders: updatedOrders } }));
      }
    }
  } catch (error) {
    console.error('Error checking expired orders:', error);
  }
};

// Generate tracking number
const generateTrackingNumber = (): string => {
  const prefix = 'TRK';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Generate tracking info for an order
export const generateTrackingInfo = (orderId: string): TrackingInfo => {
  const trackingNumber = generateTrackingNumber();
  const carriers = ['DHL Express', 'DHL Express', 'DHL Express', 'FedEx', 'UPS', 'DPD', 'GLS']; // Make DHL more common
  const carrier = carriers[Math.floor(Math.random() * carriers.length)];
  
  // Generate estimated delivery date (3-7 days from now)
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + Math.floor(Math.random() * 5) + 3);
  
  // Generate tracking events based on order status
  const events = [
    {
      date: new Date().toISOString(),
      status: 'Order Confirmed',
      location: 'Warehouse',
      description: 'Order has been confirmed and is being prepared for shipment'
    }
  ];
  
  // Only add shipping event if order is actually shipped or delivered
  const order = getOrderById(orderId);
  if (order && order.status === 'shipped') {
    events.push({
      date: new Date().toISOString(),
      status: 'Shipped',
      location: 'Distribution Center',
      description: 'Package has been shipped and is in transit'
    });
  }
  
  // Add delivery event if order is delivered
  if (order && order.status === 'delivered') {
    events.push({
      date: new Date().toISOString(),
      status: 'Delivered',
      location: 'Customer Address',
      description: 'Package has been delivered successfully'
    });
  }
  
  return {
    trackingNumber,
    carrier,
    estimatedDelivery: estimatedDate.toISOString(),
    currentStatus: order?.status === 'paid' ? 'processing' : 
                   order?.status === 'shipped' ? 'shipped' : 
                   order?.status === 'delivered' ? 'delivered' : 'processing',
    lastUpdate: new Date().toISOString(),
    trackingUrl: `https://tracking.${carrier.toLowerCase().replace(' ', '')}.com/track/${trackingNumber}`,
    events
  };
};

// Update order tracking info
export const updateOrderTracking = (orderId: string, trackingInfo: TrackingInfo): void => {
  try {
    const orders = getOrders();
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, tracking: trackingInfo } : order
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Dispatch custom event to notify components about order update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ORDER_UPDATE_EVENT, { detail: { orders: updatedOrders } }));
    }
  } catch (error) {
    console.error('Error updating order tracking:', error);
  }
};

// Get or create tracking info for an order
export const getOrderTracking = (orderId: string): TrackingInfo | null => {
  const order = getOrderById(orderId);
  if (!order) return null;
  
  // If tracking info doesn't exist, generate it
  if (!order.tracking) {
    const trackingInfo = generateTrackingInfo(orderId);
    updateOrderTracking(orderId, trackingInfo);
    return trackingInfo;
  }
  
  return order.tracking;
};

// Simulate tracking update (for demo purposes)
export const simulateTrackingUpdate = (orderId: string): void => {
  const order = getOrderById(orderId);
  if (!order || !order.tracking) return;
  
  const tracking = { ...order.tracking };
  const now = new Date();
  
  // Check if enough time has passed since last update (minimum 30 minutes)
  if (tracking.lastUpdate) {
    const lastUpdateTime = new Date(tracking.lastUpdate).getTime();
    const timeSinceLastUpdate = now.getTime() - lastUpdateTime;
    const minimumInterval = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    if (timeSinceLastUpdate < minimumInterval) {
      // Not enough time has passed, don't update
      return;
    }
  }
  
  // Calculate realistic time intervals based on current status
  const getNextEventTime = (currentStatus: string) => {
    const baseTime = now.getTime();
    switch (currentStatus) {
      case 'processing':
        return new Date(baseTime - 2 * 60 * 60 * 1000); // 2 hours ago
      case 'shipped':
        return new Date(baseTime - 4 * 60 * 60 * 1000); // 4 hours ago
      case 'in_transit':
        return new Date(baseTime - 6 * 60 * 60 * 1000); // 6 hours ago
      case 'out_for_delivery':
        return new Date(baseTime - 1 * 60 * 60 * 1000); // 1 hour ago
      default:
        return new Date(baseTime - 2 * 60 * 60 * 1000); // Default 2 hours ago
    }
  };
  
  // Simulate different tracking updates based on current status
  switch (tracking.currentStatus) {
    case 'processing':
      tracking.currentStatus = 'shipped';
      tracking.events?.push({
        date: getNextEventTime('processing').toISOString(),
        status: 'Shipped',
        location: 'Distribution Center',
        description: 'Package has been shipped and is in transit'
      });
      break;
    case 'shipped':
      tracking.currentStatus = 'in_transit';
      tracking.events?.push({
        date: getNextEventTime('shipped').toISOString(),
        status: 'In Transit',
        location: 'Sorting Facility',
        description: 'Package is being sorted and routed to destination'
      });
      break;
    case 'in_transit':
      tracking.currentStatus = 'out_for_delivery';
      tracking.events?.push({
        date: getNextEventTime('in_transit').toISOString(),
        status: 'Out for Delivery',
        location: 'Local Facility',
        description: 'Package is out for delivery with local courier'
      });
      break;
    case 'out_for_delivery':
      tracking.currentStatus = 'delivered';
      tracking.events?.push({
        date: getNextEventTime('out_for_delivery').toISOString(),
        status: 'Delivered',
        location: 'Customer Address',
        description: 'Package has been successfully delivered'
      });
      break;
  }
  
  tracking.lastUpdate = now.toISOString();
  updateOrderTracking(orderId, tracking);
  
  // Update order status if delivered
  if (tracking.currentStatus === 'delivered') {
    updateOrderStatus(orderId, 'delivered');
  } else if (tracking.currentStatus === 'shipped' || tracking.currentStatus === 'in_transit' || tracking.currentStatus === 'out_for_delivery') {
    updateOrderStatus(orderId, 'shipped');
  }
};

// Auto-update order statuses based on time intervals
export const autoUpdateOrderStatuses = (): void => {
  try {
    const orders = getOrders();
    const now = new Date();
    let hasUpdates = false;
    
    const updatedOrders = orders.map(order => {
      const orderDate = new Date(order.date);
      const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
      const minutesSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60);
      const lastUpdate = order.updatedAt ? new Date(order.updatedAt) : orderDate;
      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      
      // Skip orders that are too recent (less than 10 minutes old)
      if (minutesSinceOrder < 10) {
        return order;
      }
      
      let newStatus = order.status;
      let newTracking = order.tracking;
      
      // Realistic auto-update logic with proper sequence
      if (order.status === 'paid' && minutesSinceOrder >= 10 && hoursSinceUpdate >= 0.1) {
        // After 10 minutes, start processing
        newStatus = 'processing';
        
        // Generate initial tracking info if it doesn't exist
        if (!order.tracking) {
          newTracking = generateTrackingInfo(order.id);
        } else {
          // Keep existing tracking data and just update status and events
          newTracking = {
            ...order.tracking,
            currentStatus: 'processing',
            lastUpdate: now.toISOString(),
            events: [
              {
                date: now.toISOString(),
                status: 'Order Confirmed',
                location: 'Warehouse',
                description: 'Order has been confirmed and is being prepared for shipment'
              }
            ]
          };
        }
        hasUpdates = true;
      } else if (order.status === 'processing' && hoursSinceOrder >= 4 && hoursSinceUpdate >= 4) {
        // After 4 hours, ship the order
        newStatus = 'shipped';
        
        // Ensure we have tracking info with all required data
        if (!order.tracking || !order.tracking.trackingNumber) {
          newTracking = generateTrackingInfo(order.id);
          newTracking.currentStatus = 'shipped';
          newTracking.lastUpdate = now.toISOString();
          newTracking.events = [
            {
              date: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
              status: 'Order Confirmed',
              location: 'Warehouse',
              description: 'Order has been confirmed and is being prepared for shipment'
            },
            {
              date: now.toISOString(),
              status: 'Shipped',
              location: 'Distribution Center',
              description: 'Package has been shipped and is in transit'
            }
          ];
        } else {
          // Keep existing tracking data and add shipping event
          const existingEvents = order.tracking.events || [];
          newTracking = {
            ...order.tracking,
            currentStatus: 'shipped',
            lastUpdate: now.toISOString(),
            events: [
              ...existingEvents,
              {
                date: now.toISOString(),
                status: 'Shipped',
                location: 'Distribution Center',
                description: 'Package has been shipped and is in transit'
              }
            ]
          };
        }
        hasUpdates = true;
      } else if (order.status === 'shipped' && hoursSinceOrder >= 24 && hoursSinceUpdate >= 12) {
        // After 24 hours, update to in transit
        newTracking = {
          ...order.tracking,
          currentStatus: 'in_transit',
          lastUpdate: now.toISOString(),
          events: [
            ...(order.tracking?.events || []),
            {
              date: now.toISOString(),
              status: 'In Transit',
              location: 'Distribution Hub',
              description: 'Package is in transit to destination'
            }
          ]
        };
        hasUpdates = true;
      } else if (order.status === 'shipped' && hoursSinceOrder >= 48 && hoursSinceUpdate >= 24) {
        // After 48 hours, out for delivery
        newTracking = {
          ...order.tracking,
          currentStatus: 'out_for_delivery',
          lastUpdate: now.toISOString(),
          events: [
            ...(order.tracking?.events || []),
            {
              date: now.toISOString(),
              status: 'Out for Delivery',
              location: 'Local Facility',
              description: 'Package is out for delivery'
            }
          ]
        };
        hasUpdates = true;
      } else if (order.status === 'shipped' && hoursSinceOrder >= 72 && hoursSinceUpdate >= 24) {
        // After 72 hours (3 days), delivered
        newStatus = 'delivered';
        newTracking = {
          ...order.tracking,
          currentStatus: 'delivered',
          lastUpdate: now.toISOString(),
          events: [
            ...(order.tracking?.events || []),
            {
              date: now.toISOString(),
              status: 'Delivered',
              location: 'Customer Address',
              description: 'Package has been delivered successfully'
            }
          ]
        };
        hasUpdates = true;
      }
      
      if (hasUpdates) {
        return {
          ...order,
          status: newStatus,
          tracking: newTracking,
          updatedAt: now.toISOString()
        };
      }
      
      return order;
    });
    
    if (hasUpdates) {
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      // Dispatch custom event to notify components about order update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(ORDER_UPDATE_EVENT, { detail: { orders: updatedOrders } }));
      }
      
      console.log('Auto-updated order statuses based on time intervals');
    }
  } catch (error) {
    console.error('Error auto-updating order statuses:', error);
  }
};

// Start auto-update interval
export const startAutoUpdateInterval = (): (() => void) => {
  // Update every 30 minutes
  const interval = setInterval(autoUpdateOrderStatuses, 30 * 60 * 1000);
  
  // Also update immediately on start
  autoUpdateOrderStatuses();
  
  // Return cleanup function
  return () => clearInterval(interval);
}; 