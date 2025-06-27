import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { CartProvider } from '@/context/cart-context'
import { FavoritesProvider } from '@/context/favorites-context'
import { Header } from '@/components/header'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sneakers Shop',
  description: 'Your ultimate destination for premium sneakers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
          <Script id="fix-hydration" strategy="afterInteractive">
            {`
              // Remove browser extension attributes that cause hydration mismatches
              function removeExtensionAttributes() {
                const elements = document.querySelectorAll('[bis_skin_checked]');
                elements.forEach(el => {
                  el.removeAttribute('bis_skin_checked');
                });
              }
              
              // Run immediately and also on DOM changes
              removeExtensionAttributes();
              
              // Use MutationObserver to catch dynamically added attributes
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                    mutation.target.removeAttribute('bis_skin_checked');
                  }
                });
              });
              
              observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['bis_skin_checked'],
                subtree: true
              });
            `}
          </Script>
          <Script id="checkout-navigation-handler" strategy="afterInteractive">
            {`
              // Global handler for checkout navigation
              function handleCheckoutNavigation() {
                const activeSessionId = localStorage.getItem('active_checkout_session');
                const checkoutStartedAt = localStorage.getItem('checkout_started_at');
                const checkoutUrl = localStorage.getItem('checkout_url');
                
                if (activeSessionId && checkoutStartedAt) {
                  const startTime = new Date(checkoutStartedAt).getTime();
                  const timeDiff = Date.now() - startTime;
                  
                  // If checkout was started recently (within 15 minutes), mark as cancelled
                  if (timeDiff < 15 * 60 * 1000) {
                    try {
                      const orderData = localStorage.getItem('order_' + activeSessionId);
                      if (orderData) {
                        const order = JSON.parse(orderData);
                        
                        if (order.status === 'pending') {
                          // Check if we're coming from Stripe
                          const referrer = document.referrer;
                          const isFromStripe = referrer.includes('checkout.stripe.com') || 
                                             referrer.includes('stripe.com') ||
                                             checkoutUrl && referrer.includes(checkoutUrl);
                          
                          if (isFromStripe || timeDiff < 5 * 60 * 1000) { // Within 5 minutes or from Stripe
                            // Mark order as cancelled
                            order.status = 'cancelled';
                            order.updatedAt = new Date().toISOString();
                            order.cancellationReason = 'navigation_away';
                            
                            // Save updated order
                            localStorage.setItem('order_' + activeSessionId, JSON.stringify(order));
                            
                            // Update in orders array using saveOrder function
                            import('/lib/orders.js').then(({ saveOrder }) => {
                              saveOrder(order);
                              console.log('Order cancelled due to navigation from Stripe:', order);
                            }).catch(error => {
                              console.error('Error importing saveOrder:', error);
                            });
                            
                            // Show notification if possible
                            if (typeof window !== 'undefined' && window.toast) {
                              window.toast.info('Your order was cancelled due to navigation away from checkout');
                            }
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error handling checkout navigation:', error);
                    }
                  }
                  
                  // Clean up active checkout session
                  localStorage.removeItem('active_checkout_session');
                  localStorage.removeItem('checkout_started_at');
                  localStorage.removeItem('checkout_url');
                  localStorage.removeItem('checkout_items_count');
                }
              }

              // Handle beforeunload (page close/refresh)
              window.addEventListener('beforeunload', handleCheckoutNavigation);
              
              // Handle popstate (back/forward navigation)
              window.addEventListener('popstate', handleCheckoutNavigation);
              
              // Handle visibility change (tab switch)
              document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                  handleCheckoutNavigation();
                }
              });
              
              // Handle page focus (when returning to tab)
              window.addEventListener('focus', () => {
                const activeSessionId = localStorage.getItem('active_checkout_session');
                if (activeSessionId) {
                  const referrer = document.referrer;
                  if (referrer.includes('checkout.stripe.com') || referrer.includes('stripe.com')) {
                    handleCheckoutNavigation();
                  }
                }
              });
            `}
          </Script>
          <Script id="auto-update-orders" strategy="afterInteractive">
            {`
              // Auto-update order statuses based on time intervals
              function autoUpdateOrderStatuses() {
                try {
                  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
                  const now = new Date();
                  let hasUpdates = false;
                  
                  const updatedOrders = orders.map(order => {
                    const orderDate = new Date(order.date);
                    const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
                    const minutesSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60);
                    const lastUpdate = order.updatedAt ? new Date(order.updatedAt) : orderDate;
                    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
                    const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
                    
                    // Skip orders that are too recent (less than 10 minutes old)
                    if (minutesSinceOrder < 10) {
                      return order;
                    }
                    
                    // Skip if last update was too recent (less than 10 minutes ago)
                    if (minutesSinceUpdate < 10) {
                      return order;
                    }
                    
                    let newStatus = order.status;
                    let newTracking = order.tracking;
                    
                    // Generate tracking number if needed
                    function generateTrackingNumber() {
                      return 'TRK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
                    }
                    
                    // Realistic auto-update logic with proper sequence
                    if (order.status === 'paid' && minutesSinceOrder >= 10 && minutesSinceUpdate >= 10) {
                      // After 10 minutes, start processing
                      newStatus = 'processing';
                      
                      // Generate initial tracking info if it doesn't exist
                      if (!order.tracking) {
                        newTracking = {
                          currentStatus: 'processing',
                          trackingNumber: generateTrackingNumber(),
                          carrier: 'Express Shipping',
                          estimatedDelivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
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
                        newTracking = {
                          currentStatus: 'shipped',
                          trackingNumber: generateTrackingNumber(),
                          carrier: 'Express Shipping',
                          estimatedDelivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                          lastUpdate: now.toISOString(),
                          events: [
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
                          ]
                        };
                      } else {
                        // Keep existing tracking data and add shipping event
                        newTracking = {
                          ...order.tracking,
                          currentStatus: 'shipped',
                          lastUpdate: now.toISOString(),
                          events: [
                            ...(order.tracking.events || []),
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
                    window.dispatchEvent(new CustomEvent('orderUpdate', { detail: { orders: updatedOrders } }));
                    
                    console.log('Auto-updated order statuses based on time intervals');
                  }
                } catch (error) {
                  console.error('Error auto-updating order statuses:', error);
                }
              }

              // Start auto-update interval (every 15 minutes)
              const autoUpdateInterval = setInterval(autoUpdateOrderStatuses, 15 * 60 * 1000);
              
              // Don't run immediately on page load - let orders settle first
              // autoUpdateOrderStatuses();
              
              // Cleanup on page unload
              window.addEventListener('beforeunload', () => {
                clearInterval(autoUpdateInterval);
              });
            `}
          </Script>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CartProvider>
              <FavoritesProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
                  <Toaster />
              </FavoritesProvider>
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
  )
}
