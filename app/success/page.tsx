"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, ShoppingBag, ArrowLeft, Loader2, CreditCard, Truck, Mail, Calendar, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface OrderItem {
  productId: number;
  title: string;
  brand: string;
  category?: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  images?: string[];
}

interface OrderData {
  id: string;
  sessionId?: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  customerEmail?: string;
  customerName?: string;
  customerInfo?: {
    email?: string;
    name?: string;
  };
  createdAt?: string;
  date?: string;
  status?: string;
  updatedAt?: string;
}

// Type guard to check if object is OrderData
function isOrderData(obj: unknown): obj is OrderData {
  return obj !== null && typeof obj === 'object' && 'items' in obj;
}

// Convert Order to OrderData
function convertOrderToOrderData(order: {
  id: string;
  sessionId?: string;
  items: Array<{
    productId: number;
    title: string;
    brand: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    images?: string[];
  }>;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: string;
  date: string;
}): OrderData {
  return {
    id: order.id,
    sessionId: order.sessionId || order.id,
    items: order.items.map((item: {
      productId: number;
      title: string;
      brand: string;
      size: string;
      color: string;
      quantity: number;
      price: number;
      images?: string[];
    }) => ({
      productId: item.productId,
      title: item.title,
      brand: item.brand,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price,
      images: item.images || [],
    })),
    total: order.total,
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    status: order.status,
    date: order.date,
  };
}

// Merge order data from webhook with localStorage data (to get images)
function mergeOrderData(webhookOrder: {
  id?: string;
  sessionId?: string;
  items: Array<{
    productId: number;
    title: string;
    brand: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }>;
  total?: number;
  customerInfo?: {
    email?: string;
    name?: string;
  };
  date?: string;
  createdAt?: string;
  status?: string;
  updatedAt?: string;
}, localStorageOrder: {
  id?: string;
  sessionId?: string;
  items: Array<{
    productId: number;
    title: string;
    brand: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    images?: string[];
  }>;
  total?: number;
  customerEmail?: string;
  customerName?: string;
  date?: string;
  createdAt?: string;
  status?: string;
  updatedAt?: string;
}): OrderData {
  const mergedItems = webhookOrder.items.map((webhookItem: {
    productId: number;
    title: string;
    brand: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }) => {
    const localStorageItem = localStorageOrder?.items?.find((item: {
      productId: number;
      size: string;
      color: string;
      images?: string[];
    }) =>
      item.productId === webhookItem.productId && 
      item.size === webhookItem.size && 
      item.color === webhookItem.color
    );
    
    return {
      ...webhookItem,
      images: localStorageItem?.images || [],
    };
  });

  return {
    id: webhookOrder.id || localStorageOrder?.id || 'unknown',
    sessionId: webhookOrder.sessionId || webhookOrder.id || localStorageOrder?.sessionId || 'unknown',
    items: mergedItems,
    total: webhookOrder.total || localStorageOrder?.total || 0,
    customerEmail: webhookOrder.customerInfo?.email || localStorageOrder?.customerEmail,
    customerName: webhookOrder.customerInfo?.name || localStorageOrder?.customerName,
    customerInfo: webhookOrder.customerInfo,
    createdAt: webhookOrder.date || webhookOrder.createdAt || localStorageOrder?.createdAt,
    date: webhookOrder.date || localStorageOrder?.date,
    status: webhookOrder.status || localStorageOrder?.status,
    updatedAt: webhookOrder.updatedAt || localStorageOrder?.updatedAt,
  };
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clean up any duplicate orders on mount
    const cleanupOrders = () => {
      try {
        const { cleanupDuplicateOrders, checkAndUpdateExpiredOrders, autoUpdateOrderStatuses } = require("@/lib/orders");
        cleanupDuplicateOrders();
        checkAndUpdateExpiredOrders();
        autoUpdateOrderStatuses();
      } catch (error) {
        console.error('Error cleaning up orders:', error);
      }
    };

    cleanupOrders();

    const clearCart = () => {
      try {
        localStorage.removeItem('cart_guest');
        // Dispatch custom event to notify cart context
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('clearCart'));
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    };

    // Clear active checkout session
    const clearActiveCheckout = () => {
      try {
        localStorage.removeItem('active_checkout_session');
        localStorage.removeItem('checkout_started_at');
        
        // Також очищаємо всі pending orders з localStorage які починаються з 'order_'
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('order_') && key !== `order_${sessionId}`) {
            try {
              const orderData = localStorage.getItem(key);
              if (orderData) {
                const order = JSON.parse(orderData);
                if (order.status === 'pending') {
                  localStorage.removeItem(key);
                }
              }
            } catch (e) {
              console.error('Error cleaning up order key:', key, e);
            }
          }
        });
      } catch (error) {
        console.error('Error clearing active checkout session:', error);
      }
    };

    clearCart();
    clearActiveCheckout();

    if (sessionId) {
      // Try to get order from localStorage first (for immediate display)
      const savedOrder = localStorage.getItem(`order_${sessionId}`);
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          // Якщо order pending — міняємо на paid і зберігаємо
          if (parsedOrder.status === 'pending') {
            parsedOrder.status = 'paid';
            parsedOrder.updatedAt = new Date().toISOString();
            localStorage.setItem(`order_${sessionId}`, JSON.stringify(parsedOrder));
            // Також оновлюємо orders використовуючи saveOrder
            import("@/lib/orders").then(({ saveOrder }) => {
              saveOrder(parsedOrder);
            }).catch(error => {
              console.error('Error importing saveOrder:', error);
            });
          }
        } catch (e) {
          console.error('Error updating order status to paid:', e);
        }
      }

      // Try to get order from order management system
      const fetchOrderData = async () => {
        try {
          const { getOrderBySessionId } = await import("@/lib/orders");
          const webhookOrder = getOrderBySessionId(sessionId);
          
          // Get localStorage order data (contains images)
          const localStorageOrder = savedOrder ? JSON.parse(savedOrder) : null;
          
          if (webhookOrder) {
            // Якщо order pending — міняємо на paid і зберігаємо
            if (webhookOrder.status === 'pending') {
              webhookOrder.status = 'paid';
              webhookOrder.updatedAt = new Date().toISOString();
              const { saveOrder } = await import("@/lib/orders");
              saveOrder(webhookOrder);
            }
            
            // Merge webhook data with localStorage data to get images
            const mergedOrderData = mergeOrderData(webhookOrder, localStorageOrder);
            setOrderData(mergedOrderData);
            
            // Update localStorage with merged data
            localStorage.setItem(`order_${sessionId}`, JSON.stringify(mergedOrderData));
          } else if (localStorageOrder) {
            // Fallback to localStorage data if webhook data not available
            if (localStorageOrder.status === 'pending') {
              localStorageOrder.status = 'paid';
              localStorageOrder.updatedAt = new Date().toISOString();
              localStorage.setItem(`order_${sessionId}`, JSON.stringify(localStorageOrder));
              
              // Also update in orders system
              const { saveOrder } = await import("@/lib/orders");
              saveOrder(localStorageOrder);
            }
            setOrderData(convertOrderToOrderData(localStorageOrder));
          }
        } catch (e) {
          console.error('Error fetching order:', e);
          setError('Could not load order details');
        } finally {
          setLoading(false);
        }
      };

      fetchOrderData();
    } else {
      // Fallback: шукаємо останній pending order
      console.log('No session ID provided, looking for recent pending order...');
      try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const pendingOrders = orders.filter((order: {
          status: string;
          date: string;
        }) => order.status === 'pending');
        
        if (pendingOrders.length > 0) {
          // Беремо найновіший pending order
          const latestPendingOrder = pendingOrders[0];
          latestPendingOrder.status = 'paid';
          latestPendingOrder.updatedAt = new Date().toISOString();
          
          // Оновлюємо в orders використовуючи saveOrder
          import("@/lib/orders").then(({ saveOrder }) => {
            saveOrder(latestPendingOrder);
          }).catch(error => {
            console.error('Error importing saveOrder:', error);
          });
          
          // Встановлюємо orderData для відображення
          const orderData = convertOrderToOrderData(latestPendingOrder);
          setOrderData(orderData);
          
          // Очищаємо активні checkout сесії
          localStorage.removeItem('active_checkout_session');
          localStorage.removeItem('checkout_started_at');
          setLoading(false);
        } else {
          setError('No pending orders found');
          setLoading(false);
        }
      } catch (e) {
        console.error('Error in fallback order search:', e);
        setError('Could not load order details');
        setLoading(false);
      }
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Your payment was processed successfully. {error && `(${error})`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="w-full sm:w-auto">
                <Package className="w-4 h-4 mr-2" />
                View Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { items, total, customerEmail, customerName, createdAt, status } = orderData;
  const orderNumber = orderData.id || sessionId?.slice(-8) || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Success Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-muted-foreground">
              <span>Order #: {orderNumber}</span>
              {createdAt && (
                <span>• {new Date(createdAt).toLocaleDateString()}</span>
              )}
              {status && (
                <span>• Status: {status}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-primary" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {items.length > 0 ? (
                      <div className="space-y-4">
                        {items.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-white/10"
                          >
                            {/* Product Image */}
                            {item.images && item.images.length > 0 && (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={item.images[0]}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">
                                {item.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {item.brand} {item.category && `• ${item.category}`} • Size: {item.size} • Color: {item.color}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold">
                                €{(item.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                €{item.price.toFixed(2)} each
                              </p>
                            </div>
                          </motion.div>
                        ))}

                        <div className="border-t border-white/10 pt-4 mt-6 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>€{(total / 1.19).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tax (19%)</span>
                            <span>€{((total / 1.19) * 0.19).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Shipping</span>
                            <span>Free</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-white/10">
                            <span className="text-lg font-semibold">Total</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                              €{total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Order details not available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Payment & Shipping Info */}
            <div className="space-y-6">
              {/* Customer Info */}
              {(customerName || customerEmail) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Card className="bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        Customer Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {customerName && (
                          <p><strong>Name:</strong> {customerName}</p>
                        )}
                        {customerEmail && (
                          <p><strong>Email:</strong> {customerEmail}</p>
                        )}
                        {createdAt && (
                          <p><strong>Order Date:</strong> {new Date(createdAt).toLocaleString()}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-sm"></div>
                        <span className="text-sm">Card Payment</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Payment processed securely via Stripe
                      </p>
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Payment confirmed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-primary" />
                      Shipping Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Order Confirmed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Processing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        <span className="text-sm text-muted-foreground">Shipped</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        <span className="text-sm text-muted-foreground">Delivered</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Estimated delivery: 3-7 business days
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Card className="bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Order confirmation email sent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span>Track your order in profile</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange-500" />
                        <span>Contact support if needed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
          >
            <Link href="/catalog">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto rounded-xl border-white/20 bg-background/50 backdrop-blur-sm hover:bg-background/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl">
                <Package className="w-4 h-4 mr-2" />
                View Orders
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function SuccessPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessPageFallback />}>
      <SuccessPageContent />
    </Suspense>
  );
} 