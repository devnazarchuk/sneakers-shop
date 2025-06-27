"use client";
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Truck, 
  Package, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  RefreshCw,
  CheckCircle,
  Clock,
  Navigation,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getOrderTracking, simulateTrackingUpdate, type TrackingInfo, getOrderById } from "@/lib/orders";
import { toast } from "sonner";
import { format } from "date-fns";

interface TrackingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-500 text-white';
    case 'out_for_delivery':
      return 'bg-blue-500 text-white';
    case 'in_transit':
      return 'bg-yellow-500 text-white';
    case 'shipped':
      return 'bg-purple-500 text-white';
    case 'processing':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="h-4 w-4" />;
    case 'out_for_delivery':
      return <Truck className="h-4 w-4" />;
    case 'in_transit':
      return <Navigation className="h-4 w-4" />;
    case 'shipped':
      return <Package className="h-4 w-4" />;
    case 'processing':
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export function TrackingDialog({ isOpen, onClose, orderId }: TrackingDialogProps) {
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const loadTracking = useCallback(() => {
    const trackingInfo = getOrderTracking(orderId);
    setTracking(trackingInfo);
  }, [orderId]);

  const loadOrder = useCallback(() => {
    const orderData = getOrderById(orderId);
    setOrder(orderData);
  }, [orderId]);

  useEffect(() => {
    if (isOpen && orderId) {
      loadTracking();
      loadOrder();
    }
  }, [isOpen, orderId, loadTracking, loadOrder]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if tracking was actually updated
      const trackingBefore = getOrderTracking(orderId);
      const lastUpdateBefore = trackingBefore?.lastUpdate;
      
      // Simulate tracking update
      simulateTrackingUpdate(orderId);
      
      // Reload tracking info
      loadTracking();
      
      // Check if tracking was updated
      const trackingAfter = getOrderTracking(orderId);
      const lastUpdateAfter = trackingAfter?.lastUpdate;
      
      if (lastUpdateBefore === lastUpdateAfter) {
        // No update occurred (minimum interval not met)
        toast.info('No new updates available. Please wait at least 30 minutes between refresh attempts.');
      } else {
        // Update occurred
        toast.success('Tracking information updated');
      }
    } catch (error) {
      toast.error('Failed to update tracking information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExternalTracking = () => {
    if (tracking?.carrier?.toLowerCase().includes('dhl') && tracking?.trackingNumber) {
      // Link to DHL tracking
      const dhlTrackingUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${tracking.trackingNumber}`;
      window.open(dhlTrackingUrl, '_blank');
    }
  };

  const isDhlCarrier = tracking?.carrier?.toLowerCase().includes('dhl');

  const getNextRefreshTime = () => {
    if (!tracking?.lastUpdate) return null;
    
    const lastUpdate = new Date(tracking.lastUpdate);
    const nextRefresh = new Date(lastUpdate.getTime() + 30 * 60 * 1000); // 30 minutes later
    const now = new Date();
    
    if (nextRefresh > now) {
      const timeDiff = nextRefresh.getTime() - now.getTime();
      const minutes = Math.ceil(timeDiff / (1000 * 60));
      return minutes;
    }
    
    return 0; // Can refresh now
  };

  const nextRefreshMinutes = getNextRefreshTime();
  const canRefresh = nextRefreshMinutes === 0;

  if (!tracking) return null;

  // Show message for cancelled/expired orders
  if (order && ['cancelled', 'expired'].includes(order.status)) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Order Status
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Expired'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {order.status === 'cancelled' 
                ? 'This order was cancelled and no delivery will be made.'
                : 'This order has expired and no delivery will be made.'
              }
            </p>
            {order.cancellationReason && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-muted-foreground">
                  Reason: {order.cancellationReason.replace('_', ' ')}
                </p>
              </div>
            )}
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show message for pending orders
  if (order && order.status === 'pending') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Order Status
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Order in Pending
            </h3>
            <p className="text-muted-foreground mb-4">
              Your order is currently pending payment confirmation. No delivery tracking is available yet.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Once payment is confirmed, you&apos;ll be able to track your order here.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show message for paid orders that haven't started processing yet
  if (order && order.status === 'paid' && (!tracking || !tracking.events || tracking.events.length === 0)) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Order Status
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Payment Confirmed
            </h3>
            <p className="text-muted-foreground mb-4">
              Your payment has been confirmed and your order is being prepared for processing.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Tracking information will be available once your order starts processing (usually within 10-15 minutes).
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Order Tracking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tracking Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="font-mono font-bold text-lg">{tracking.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Carrier</p>
                  <p className="font-semibold">{tracking.carrier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <Badge className={`mt-1 ${getStatusColor(tracking.currentStatus || 'processing')}`}>
                    {getStatusIcon(tracking.currentStatus || 'processing')}
                    <span className="ml-1 capitalize">
                      {tracking.currentStatus?.replace('_', ' ') || 'Processing'}
                    </span>
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  <p className="font-semibold">
                    {tracking.estimatedDelivery 
                      ? format(new Date(tracking.estimatedDelivery), 'MMM dd, yyyy')
                      : 'TBD'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tracking Timeline</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading || !canRefresh}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Refreshing...' : 
                   canRefresh ? 'Refresh' : 
                   `Refresh in ${nextRefreshMinutes}m`}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await new Promise(r => setTimeout(r, 500));
                      
                      // Force simulate next step with future date
                      const order = getOrderById(orderId);
                      if (order && order.tracking) {
                        const tracking = { ...order.tracking };
                        const now = new Date();
                        
                        // Calculate time intervals for events with randomization
                        const getEventTime = (baseHours: number = 0, baseDays: number = 0, hourJitter: number = 0, minuteJitter: number = 59) => {
                          const hours = baseHours + getRandomInt(-hourJitter, hourJitter);
                          const minutes = getRandomInt(0, minuteJitter);
                          return new Date(now.getTime() + baseDays * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000);
                        };
                        
                        // Add next event based on current status
                        switch (tracking.currentStatus) {
                          case 'processing':
                            tracking.currentStatus = 'shipped';
                            tracking.events?.push({
                              date: getEventTime(6, 0, 1, 59).toISOString(), // +6h ±1h, random min
                              status: 'Shipped',
                              location: 'Distribution Center',
                              description: 'Package has been shipped and is in transit'
                            });
                            break;
                          case 'shipped':
                            tracking.currentStatus = 'in_transit';
                            tracking.events?.push({
                              date: getEventTime(0, 1, 2, 59).toISOString(), // +1d ±2h, random min
                              status: 'In Transit',
                              location: 'Distribution Hub',
                              description: 'Package is in transit to destination'
                            });
                            break;
                          case 'in_transit':
                            tracking.currentStatus = 'out_for_delivery';
                            tracking.events?.push({
                              date: getEventTime(0, 2, 2, 59).toISOString(), // +2d ±2h, random min
                              status: 'Out for Delivery',
                              location: 'Local Facility',
                              description: 'Package is out for delivery'
                            });
                            break;
                          case 'out_for_delivery':
                            tracking.currentStatus = 'delivered';
                            tracking.events?.push({
                              date: getEventTime(0, 3, 2, 59).toISOString(), // +3d ±2h, random min
                              status: 'Delivered',
                              location: 'Customer Address',
                              description: 'Package has been delivered successfully'
                            });
                            break;
                        }
                        
                        tracking.lastUpdate = now.toISOString();
                        
                        // Update order tracking
                        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
                        const updatedOrders = orders.map((o: any) => 
                          o.id === orderId ? { ...o, tracking, updatedAt: now.toISOString() } : o
                        );
                        localStorage.setItem('orders', JSON.stringify(updatedOrders));
                        
                        // Dispatch event to notify components
                        window.dispatchEvent(new CustomEvent('orderUpdate', { detail: { orders: updatedOrders } }));
                      }
                      
                      loadTracking();
                      toast.success('Next step simulated successfully!');
                    } catch (error) {
                      toast.error('Failed to simulate next step');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  Next Step
                </Button>
                {isDhlCarrier && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExternalTracking}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Track on Website
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {tracking.events?.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className="relative">
                        <div className="w-4 h-4 bg-primary rounded-full mt-2"></div>
                        {index < (tracking.events?.length || 0) - 1 && (
                          <div className="absolute top-6 left-2 w-0.5 h-32 bg-gray-300 dark:bg-gray-600"></div>
                        )}
                      </div>

                      {/* Event content */}
                      <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{event.status}</h4>
                              {event.location && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(event.date), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Last Update */}
          {tracking.lastUpdate && (
            <div className="text-center text-sm text-muted-foreground">
              Last updated: {format(new Date(tracking.lastUpdate), 'MMM dd, yyyy HH:mm')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 