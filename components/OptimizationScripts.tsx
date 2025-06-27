"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function OptimizationScripts() {
    useEffect(() => {
        // 1. Remove browser extension attributes that cause hydration mismatches
        function removeExtensionAttributes() {
            const elements = document.querySelectorAll('[bis_skin_checked]');
            elements.forEach(el => {
                el.removeAttribute('bis_skin_checked');
            });
        }

        removeExtensionAttributes();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                    (mutation.target as HTMLElement).removeAttribute('bis_skin_checked');
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['bis_skin_checked'],
            subtree: true
        });

        // 2. Checkout Navigation Handler
        function handleCheckoutNavigation() {
            const activeSessionId = localStorage.getItem('active_checkout_session');
            const checkoutStartedAt = localStorage.getItem('checkout_started_at');
            const checkoutUrl = localStorage.getItem('checkout_url');

            if (activeSessionId && checkoutStartedAt) {
                const startTime = new Date(checkoutStartedAt).getTime();
                const timeDiff = Date.now() - startTime;

                if (timeDiff < 15 * 60 * 1000) {
                    try {
                        const orderData = localStorage.getItem('order_' + activeSessionId);
                        if (orderData) {
                            const order = JSON.parse(orderData);

                            if (order.status === 'pending') {
                                const referrer = document.referrer;
                                const isFromStripe = referrer.includes('checkout.stripe.com') ||
                                    referrer.includes('stripe.com') ||
                                    (checkoutUrl && referrer.includes(checkoutUrl));

                                if (isFromStripe || timeDiff < 5 * 60 * 1000) {
                                    order.status = 'cancelled';
                                    order.updatedAt = new Date().toISOString();
                                    order.cancellationReason = 'navigation_away';

                                    localStorage.setItem('order_' + activeSessionId, JSON.stringify(order));

                                    import('@/lib/orders').then(({ saveOrder }) => {
                                        saveOrder(order);
                                    }).catch(console.error);

                                    toast.info('Your order was cancelled due to navigation away from checkout');
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error handling checkout navigation:', error);
                    }
                }

                localStorage.removeItem('active_checkout_session');
                localStorage.removeItem('checkout_started_at');
                localStorage.removeItem('checkout_url');
                localStorage.removeItem('checkout_items_count');
            }
        }

        window.addEventListener('beforeunload', handleCheckoutNavigation);
        window.addEventListener('popstate', handleCheckoutNavigation);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handleCheckoutNavigation();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        const handleFocus = () => {
            const activeSessionId = localStorage.getItem('active_checkout_session');
            if (activeSessionId) {
                const referrer = document.referrer;
                if (referrer.includes('checkout.stripe.com') || referrer.includes('stripe.com')) {
                    handleCheckoutNavigation();
                }
            }
        };
        window.addEventListener('focus', handleFocus);

        // 3. Auto-update orders
        const autoUpdateOrderStatuses = () => {
            try {
                const ordersString = localStorage.getItem('orders');
                if (!ordersString) return;

                const orders = JSON.parse(ordersString);
                const now = new Date();
                let hasUpdates = false;

                const updatedOrders = orders.map((order: any) => {
                    const orderDate = new Date(order.date);
                    const minutesSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60);
                    const lastUpdate = order.updatedAt ? new Date(order.updatedAt) : orderDate;
                    const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
                    const hoursSinceOrder = minutesSinceOrder / 60;

                    if (minutesSinceOrder < 10 || minutesSinceUpdate < 10) return order;

                    let newStatus = order.status;
                    let newTracking = order.tracking;

                    const generateTrackingNumber = () => 'TRK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();

                    if (order.status === 'paid' && minutesSinceOrder >= 10) {
                        newStatus = 'processing';
                        newTracking = {
                            currentStatus: 'processing',
                            trackingNumber: order.tracking?.trackingNumber || generateTrackingNumber(),
                            carrier: 'Express Shipping',
                            estimatedDelivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                            lastUpdate: now.toISOString(),
                            events: [
                                ...(order.tracking?.events || []),
                                {
                                    date: now.toISOString(),
                                    status: 'Order Confirmed',
                                    location: 'Warehouse',
                                    description: 'Order has been confirmed and is being prepared for shipment'
                                }
                            ]
                        };
                        hasUpdates = true;
                    } else if (order.status === 'processing' && hoursSinceOrder >= 4) {
                        newStatus = 'shipped';
                        newTracking = {
                            ...order.tracking,
                            currentStatus: 'shipped',
                            lastUpdate: now.toISOString(),
                            events: [
                                ...(order.tracking?.events || []),
                                {
                                    date: now.toISOString(),
                                    status: 'Shipped',
                                    location: 'Distribution Center',
                                    description: 'Package has been shipped and is in transit'
                                }
                            ]
                        };
                        hasUpdates = true;
                    } else if (order.status === 'shipped' && hoursSinceOrder >= 72) {
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
                        return { ...order, status: newStatus, tracking: newTracking, updatedAt: now.toISOString() };
                    }
                    return order;
                });

                if (hasUpdates) {
                    localStorage.setItem('orders', JSON.stringify(updatedOrders));
                    window.dispatchEvent(new CustomEvent('orderUpdate', { detail: { orders: updatedOrders } }));
                }
            } catch (error) {
                console.error('Error auto-updating order statuses:', error);
            }
        };

        const interval = setInterval(autoUpdateOrderStatuses, 15 * 60 * 1000);

        return () => {
            observer.disconnect();
            window.removeEventListener('beforeunload', handleCheckoutNavigation);
            window.removeEventListener('popstate', handleCheckoutNavigation);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            clearInterval(interval);
        };
    }, []);

    return null;
}
