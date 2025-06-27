"use client";
import { useEffect, useState } from "react";
import { getOrders, type Order, createCancelledOrder, saveOrder } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderItemDisplay } from "@/components/profile/order-items-display";
import { TrackingDialog } from "@/components/profile/tracking-dialog";
import { ProductDialog } from "@/components/ProductDialog";
import { useFavorites } from "@/context/favorites-context";
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import { 
  Package, 
  Calendar, 
  Euro, 
  ShoppingBag, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Heart,
  Settings,
  LogOut,
  Star,
  TrendingUp,
  Award,
  Shield,
  Gift,
  Trash2,
  Eye,
  ShoppingCart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

export default function ProfilePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'favorites' | 'settings'>('overview');
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCart } = useCart();

  useEffect(() => {
    // Check for back navigation from checkout
    const checkBackFromCheckout = () => {
      try {
        // Check for cookies set by middleware
        const backFromCheckout = document.cookie.includes('back_from_checkout=true');
        const fromStripeCheckout = document.cookie.includes('from_stripe_checkout=true');
        
        if (backFromCheckout || fromStripeCheckout) {
          // Get active checkout session
          const activeSessionId = localStorage.getItem('active_checkout_session');
          const checkoutStartedAt = localStorage.getItem('checkout_started_at');
          
          if (activeSessionId && checkoutStartedAt) {
            const startTime = new Date(checkoutStartedAt).getTime();
            const timeDiff = Date.now() - startTime;
            
            // Check if this is a recent checkout (within 5 minutes)
            if (timeDiff < 5 * 60 * 1000) {
              // Get order data from localStorage
              const orderData = localStorage.getItem(`order_${activeSessionId}`);
              if (orderData) {
                const order = JSON.parse(orderData);
                
                // Only mark as cancelled if it's still pending
                if (order.status === 'pending') {
                  order.status = 'cancelled';
                  order.updatedAt = new Date().toISOString();
                  order.cancellationReason = 'navigation_away';
                  
                  // Save updated order
                  localStorage.setItem(`order_${activeSessionId}`, JSON.stringify(order));
                  
                  // Update in orders array using saveOrder function
                  const { saveOrder } = require("@/lib/orders");
                  saveOrder(order);
                  
                  console.log('Order cancelled due to back navigation from Stripe:', order);
                  
                  // Show notification
                  toast.info('Your pending order has been cancelled due to navigation away from checkout');
                }
              }
            }
            
            // Clean up active checkout session
            localStorage.removeItem('active_checkout_session');
            localStorage.removeItem('checkout_started_at');
          }
          
          // Clear cookies
          document.cookie = 'back_from_checkout=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'from_stripe_checkout=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      } catch (error) {
        console.error('Error checking back navigation:', error);
      }
    };

    checkBackFromCheckout();

    // Load orders from localStorage
    const loadOrders = () => {
      try {
        const { getOrders, cleanupDuplicateOrders, checkAndUpdateExpiredOrders } = require("@/lib/orders");
        
        // Clean up any duplicate orders first
        cleanupDuplicateOrders();
        
        // Check and update expired orders
        checkAndUpdateExpiredOrders();
        
        const orders = getOrders();
        
        // Merge orders with localStorage data to get images
        const mergedOrders = orders.map(mergeOrderWithLocalStorage);
        
        setOrders(mergedOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Add small delay for loading animation
    const timer = setTimeout(() => {
      loadOrders();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Periodic check for expired orders every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const { checkAndUpdateExpiredOrders, autoUpdateOrderStatuses } = require("@/lib/orders");
        checkAndUpdateExpiredOrders();
        autoUpdateOrderStatuses();
        
        // Reload orders to reflect any changes
        const { getOrders } = require("@/lib/orders");
        const updatedOrders = getOrders();
        
        // Merge orders with localStorage data to get images
        const mergedOrders = updatedOrders.map(mergeOrderWithLocalStorage);
        
        setOrders(mergedOrders);
      } catch (error) {
        console.error('Error checking expired orders:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Auto-update order statuses every 30 minutes
  useEffect(() => {
    const autoUpdateInterval = setInterval(() => {
      try {
        const { autoUpdateOrderStatuses } = require("@/lib/orders");
        autoUpdateOrderStatuses();
        
        // Reload orders to reflect any changes
        const { getOrders } = require("@/lib/orders");
        const updatedOrders = getOrders();
        
        // Merge orders with localStorage data to get images
        const mergedOrders = updatedOrders.map(mergeOrderWithLocalStorage);
        
        setOrders(mergedOrders);
      } catch (error) {
        console.error('Error auto-updating order statuses:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(autoUpdateInterval);
  }, []);

  // Listen for order updates in real-time
  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent) => {
      try {
        const updatedOrders = event.detail.orders;
        
        // Merge orders with localStorage data to get images
        const mergedOrders = updatedOrders.map(mergeOrderWithLocalStorage);
        
        setOrders(mergedOrders);
      } catch (error) {
        console.error('Error handling order update:', error);
      }
    };

    // Add event listener for order updates
    window.addEventListener('orderUpdate', handleOrderUpdate as EventListener);

    return () => {
      window.removeEventListener('orderUpdate', handleOrderUpdate as EventListener);
    };
  }, []);

  // Function to merge order data with localStorage data to get images
  const mergeOrderWithLocalStorage = (order: Order): Order => {
    try {
      // Try to get localStorage data for this order
      const localStorageOrder = localStorage.getItem(`order_${order.id}`);
      if (localStorageOrder) {
        const parsedLocalStorageOrder = JSON.parse(localStorageOrder);
        
        // Merge items with images from localStorage
        const mergedItems = order.items.map(orderItem => {
          const localStorageItem = parsedLocalStorageOrder.items?.find((item: {
            productId: number;
            size: string;
            color: string;
            images?: string[];
          }) => 
            item.productId === orderItem.productId && 
            item.size === orderItem.size && 
            item.color === orderItem.color
          );
          
          return {
            ...orderItem,
            images: localStorageItem?.images || orderItem.images || [], // Use images from localStorage if available
          };
        });
        
        return {
          ...order,
          items: mergedItems,
        };
      }
    } catch (error) {
      console.error('Error merging order with localStorage:', error);
    }
    
    return order;
  };

  // Shared function to create cart items from order items
  const createCartItemsFromOrder = (order: Order) => {
    return order.items.map(item => ({
      product: {
        id: item.productId,
        title: item.title,
        brand: item.brand,
        price: item.price,
        images: Array.isArray(item.images) 
          ? item.images.filter((img: string) => img && img.trim() !== '' && img !== 'undefined' && img !== 'null')
          : [],
        category: 'Sneakers',
        sizes: [item.size],
        colors: [item.color],
        styleCode: `${item.productId}`,
        description: `${item.brand} ${item.title} - ${item.color}`,
      },
      quantity: item.quantity,
      selectedSize: item.size,
      selectedColor: item.color,
    }));
  };

  // Function to buy again from order
  const buyAgainFromOrder = (order: Order) => {
    // Don't allow buying again for cancelled, failed, or expired orders
    if (['cancelled', 'failed', 'expired'].includes(order.status)) {
      toast.error(`Cannot buy again from ${order.status} order`);
      return;
    }

    try {
      // Clear current cart
      localStorage.removeItem('cart_guest');
      window.dispatchEvent(new CustomEvent('clearCart'));
      
      // Add items from order to cart with images
      const cartItems = createCartItemsFromOrder(order);
      
      localStorage.setItem('cart_guest', JSON.stringify(cartItems));
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdate'));
      
      // Show success message with item count
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const uniqueProducts = cartItems.length;
      
      if (uniqueProducts === 1) {
        toast.success(`${totalItems} item added to cart!`);
      } else {
        toast.success(`${totalItems} items from ${uniqueProducts} products added to cart!`);
      }
      
    } catch (error) {
      console.error('Error buying again:', error);
      toast.error('Failed to add items to cart');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderForTracking(orderId);
    setTrackingDialogOpen(true);
  };

  const handleCloseTrackingDialog = () => {
    setTrackingDialogOpen(false);
    setSelectedOrderForTracking(null);
  };

  const handleBuyAgain = (order: Order) => {
    // Clear current cart and add order items back
    if (typeof window !== 'undefined') {
      // Clear cart
      localStorage.removeItem('cart_guest');
      window.dispatchEvent(new CustomEvent('clearCart'));
      
      // Add order items to cart with images
      const cartItems = createCartItemsFromOrder(order);
      
      localStorage.setItem('cart_guest', JSON.stringify(cartItems));
      
      // Notify cart context
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: cartItems } }));
      
      // Show success message with item count
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const uniqueProducts = cartItems.length;
      
      if (uniqueProducts === 1) {
        toast.success(`${totalItems} item added to cart!`);
      } else {
        toast.success(`${totalItems} items from ${uniqueProducts} products added to cart!`);
      }
    }
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'paid' || order.status === 'delivered').length;
  const totalSpent = orders
    .filter(order => order.status === 'paid' || order.status === 'delivered')
    .reduce((sum, order) => sum + order.total, 0);
  const favoriteBrand = orders.length > 0 
    ? orders
        .flatMap(order => order.items)
        .reduce((acc, item) => {
          acc[item.brand] = (acc[item.brand] || 0) + item.quantity;
          return acc;
        }, {} as Record<string, number>)
    : {};

  const topBrand = Object.entries(favoriteBrand)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nike';

  // Get user profile data
  const userProfile = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('userProfile') || '{}')
    : {};

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'shipped':
      case 'in_transit':
      case 'out_for_delivery':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'paid':
        return 'default';
      case 'pending':
        return 'outline';
      case 'cancelled':
      case 'failed':
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeClassName = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'shipped':
      case 'in_transit':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cancelled':
      case 'failed':
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Get display status (tracking status or order status)
  const getDisplayStatus = (order: Order) => {
    // For cancelled/expired/failed orders, always show the order status
    if (['cancelled', 'expired', 'failed'].includes(order.status)) {
      return order.status;
    }
    // If order has tracking info and current status, use that
    if (order.tracking?.currentStatus) {
      return order.tracking.currentStatus;
    }
    // Otherwise use order status
    return order.status;
  };

  // Get display status text (formatted for display)
  const getDisplayStatusText = (order: Order) => {
    const status = getDisplayStatus(order);
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAddToCart = async (product: any) => {
    setIsAddingToCart(product.id);
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
    toast.success("Added to cart");
    setTimeout(() => {
      setIsAddingToCart(null);
    }, 1000);
  };

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleCloseProductDialog = () => {
    setIsProductDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleEditProfile = () => {
    setEditedProfile({
      name: userProfile.name || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
      avatar: userProfile.avatar || ''
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(editedProfile));
    
    // Update the userProfile state by reloading
    window.location.reload();
    
    toast.success('Profile updated successfully');
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditedProfile({
      name: '',
      email: '',
      phone: '',
      avatar: ''
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedProfile(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Clear sessionStorage if any
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Dispatch events to clear contexts
    window.dispatchEvent(new CustomEvent('clearCart'));
    window.dispatchEvent(new CustomEvent('clearFavorites'));
    
    // Show logout message
    toast.success('Logged out successfully');
    
    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Welcome back! Manage your orders and preferences
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')} className="flex-1 sm:flex-none">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex-1 sm:flex-none">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* User Info Card */}
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative mb-2 sm:mb-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center overflow-hidden">
                    {userProfile.avatar ? (
                      <Image
                        src={userProfile.avatar}
                        alt="Profile Avatar"
                        width={80}
                        height={80}
                        sizes="80px"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    {userProfile.name || 'Guest User'}
                  </h2>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1 justify-center sm:justify-start text-xs sm:text-base">
                    <Mail className="h-4 w-4" />
                    {userProfile.email || 'guest@example.com'}
                  </p>
                  {userProfile.phone && (
                    <p className="text-muted-foreground flex items-center gap-2 mt-1 justify-center sm:justify-start text-xs sm:text-base">
                      <Phone className="h-4 w-4" />
                      {userProfile.phone}
                    </p>
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <Badge variant="secondary" className="mb-2">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified Customer
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Member since {format(new Date(), 'MMM yyyy')}
                  </p>
                </div>
              </div>
              {/* Show badge and member since below on mobile */}
              <div className="block sm:hidden mt-2 text-center">
                <Badge variant="secondary" className="mb-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified Customer
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Member since {format(new Date(), 'MMM yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex overflow-x-auto no-scrollbar space-x-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 shadow-lg">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md dark:bg-background dark:text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-700/50 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                        <p className="text-3xl font-bold">{totalOrders}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Completed</p>
                        <p className="text-3xl font-bold">{completedOrders}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Total Spent</p>
                        <p className="text-3xl font-bold">€{totalSpent.toFixed(2)}</p>
                      </div>
                      <Euro className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Top Brand</p>
                        <p className="text-3xl font-bold">{topBrand}</p>
                      </div>
                      <Award className="h-8 w-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.slice(0, 3).length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id}>
                          <div
                            className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-white/20 cursor-pointer hover:shadow-lg transition-all duration-200"
                            onClick={() => toggleOrderExpansion(order.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Order #{order.id.slice(-8)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(order.date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={getStatusBadgeVariant(getDisplayStatus(order))}
                                className={getStatusBadgeClassName(getDisplayStatus(order)) + ' mb-1 text-xs px-2 py-0.5'}
                              >
                                {getDisplayStatusText(order)}
                              </Badge>
                              <div className="w-7 h-7 flex items-center justify-center">
                                {expandedOrder === order.id ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Order Details */}
                          <AnimatePresence>
                            {expandedOrder === order.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-2"
                              >
                                <Card className="bg-white/30 dark:bg-slate-700/30 border border-white/20">
                                  <CardContent className="p-3 sm:p-6">
                                    {/* Order Items */}
                                    <div className="space-y-4 mb-6">
                                      {order.items.map((item, itemIndex) => (
                                        <OrderItemDisplay
                                          key={`${item.productId}-${item.size}-${item.color}-${itemIndex}`}
                                          item={item}
                                          compact={true}
                                        />
                                      ))}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-base">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span>€{order.subtotal.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax:</span>
                                        <span>€{order.tax.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping:</span>
                                        <span>€{order.shipping.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between font-semibold text-base sm:text-lg border-t pt-2 sm:pt-3">
                                        <span>Total:</span>
                                        <span>€{order.total.toFixed(2)}</span>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <Button
                                        className="w-full h-9 text-xs sm:h-11 sm:text-base"
                                        disabled={['cancelled', 'failed', 'expired'].includes(order.status)}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          buyAgainFromOrder(order);
                                        }}
                                      >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Buy Again
                                      </Button>
                                      {['cancelled', 'expired'].includes(order.status) ? (
                                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                            {order.status === 'cancelled' 
                                              ? 'Order was cancelled - no delivery'
                                              : 'Order expired - no delivery'
                                            }
                                          </p>
                                        </div>
                                      ) : (
                                        <Button 
                                          variant="outline" 
                                          className="w-full h-9 text-xs sm:h-11 sm:text-base"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleTrackOrder(order.id);
                                          }}
                                        >
                                          <Truck className="h-4 w-4 mr-2" />
                                          Track Order
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders yet</p>
                      <Button className="mt-4" asChild>
                        <Link href="/catalog">Start Shopping</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Orders List */}
              {orders.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {orders.map((order, index) => (
                    <Card
                      key={order.id}
                      className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      <CardContent className="p-3 sm:p-6">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm sm:text-lg">Order #{order.id.slice(-8)}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {formatDate(order.date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Badge
                              variant={getStatusBadgeVariant(getDisplayStatus(order))}
                              className={getStatusBadgeClassName(getDisplayStatus(order)) + ' mb-1 text-xs px-2 py-0.5'}
                            >
                              {getDisplayStatusText(order)}
                            </Badge>
                            <div className="w-7 h-7 flex items-center justify-center">
                              {expandedOrder === order.id ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order Details */}
                        <AnimatePresence>
                          {expandedOrder === order.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3 sm:p-6 bg-white/30 dark:bg-slate-700/30">
                                {/* Order Items */}
                                <div className="space-y-4 mb-6">
                                  {order.items.map((item, itemIndex) => (
                                    <OrderItemDisplay
                                      key={`${item.productId}-${item.size}-${item.color}-${itemIndex}`}
                                      item={item}
                                      compact={true}
                                    />
                                  ))}
                                </div>

                                {/* Order Summary */}
                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-base">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span>€{order.subtotal.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax:</span>
                                    <span>€{order.tax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping:</span>
                                    <span>€{order.shipping.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold text-base sm:text-lg border-t pt-2 sm:pt-3">
                                    <span>Total:</span>
                                    <span>€{order.total.toFixed(2)}</span>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <Button
                                    className="w-full h-9 text-xs sm:h-11 sm:text-base"
                                    disabled={['cancelled', 'failed', 'expired'].includes(order.status)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      buyAgainFromOrder(order);
                                    }}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Buy Again
                                  </Button>
                                  {['cancelled', 'expired'].includes(order.status) ? (
                                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                        {order.status === 'cancelled' 
                                          ? 'Order was cancelled - no delivery'
                                          : 'Order expired - no delivery'
                                        }
                                      </p>
                                    </div>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      className="w-full h-9 text-xs sm:h-11 sm:text-base"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTrackOrder(order.id);
                                      }}
                                    >
                                      <Truck className="h-4 w-4 mr-2" />
                                      Track Order
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="text-center py-8 sm:py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start shopping to see your order history here
                    </p>
                    <Button asChild>
                      <Link href="/catalog">Browse Products</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Favorites Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <h2 className="text-2xl font-bold">My Favorites</h2>
                  <p className="text-muted-foreground">
                    {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
                  </p>
                </div>
                {favorites.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearFavorites();
                      toast.success('All favorites cleared');
                    }}
                    className="flex items-center gap-2 mt-2 sm:mt-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Favorites List */}
              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {favorites.map((product) => (
                    <Card
                      key={product.id}
                      className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 group cursor-pointer"
                      onClick={() => handleViewProduct(product)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        {/* Product Image */}
                        <div className="relative h-28 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              width={400}
                              height={192}
                              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* Overlay with action buttons */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-12 w-12 rounded-full bg-white/90 text-gray-700 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProduct(product);
                              }}
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                          </div>
                          
                          {/* Remove Button */}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromFavorites(product.id);
                              toast.success('Removed from favorites');
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Product Info */}
                        <div className="p-3 sm:p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                                {product.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mb-2">
                                {product.brand}
                              </p>
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-base sm:text-lg">€{product.price}</span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProduct(product);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                disabled={isAddingToCart === product.id}
                              >
                                {isAddingToCart === product.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                ) : (
                                  <>
                                    <ShoppingCart className="h-3 w-3 mr-1" />
                                    Add to Cart
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Sizes and Colors */}
                          <div className="mt-3 space-y-2">
                            {product.sizes && product.sizes.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Sizes:</p>
                                <div className="flex flex-wrap gap-1">
                                  {product.sizes.slice(0, 3).map((size, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {size}
                                    </Badge>
                                  ))}
                                  {product.sizes.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{product.sizes.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {product.colors && product.colors.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Colors:</p>
                                <div className="flex flex-wrap gap-1">
                                  {product.colors.slice(0, 3).map((color, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {color}
                                    </Badge>
                                  ))}
                                  {product.colors.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{product.colors.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="text-center py-8 sm:py-12">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start adding products to your favorites for quick access
                    </p>
                    <Button asChild>
                      <Link href="/catalog">Browse Products</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Settings Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <h2 className="text-2xl font-bold">Settings</h2>
                  <p className="text-muted-foreground">
                    Manage your account preferences and profile
                  </p>
                </div>
                {!isEditingProfile && (
                  <Button onClick={handleEditProfile} className="mt-2 sm:mt-0">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Profile Settings */}
              <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="relative">
                      {isEditingProfile ? (
                        <div className="relative">
                          <label className="cursor-pointer">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                              {editedProfile.avatar ? (
                                <Image
                                  src={editedProfile.avatar}
                                  alt="Avatar"
                                  width={96}
                                  height={96}
                                  sizes="96px"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-12 w-12 text-white" />
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                          </label>
                          <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary/70 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                            <Settings className="h-4 w-4 text-white" />
                          </label>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center overflow-hidden">
                          {userProfile.avatar ? (
                            <Image
                              src={userProfile.avatar}
                              alt="Avatar"
                              width={96}
                              height={96}
                              sizes="96px"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-12 w-12 text-white" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full text-center sm:text-left">
                      <h3 className="text-lg font-semibold mb-2">Profile Picture</h3>
                      <p className="text-sm text-muted-foreground">
                        {isEditingProfile 
                          ? 'Click the icon to upload a new profile picture'
                          : 'Your profile picture will appear across the app'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={editedProfile.name}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          {userProfile.name || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      {isEditingProfile ? (
                        <input
                          type="email"
                          value={editedProfile.email}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your email"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          {userProfile.email || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      {isEditingProfile ? (
                        <input
                          type="tel"
                          value={editedProfile.phone}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          {userProfile.phone || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Member Since</label>
                      <p className="text-sm text-muted-foreground py-2">
                        {format(new Date(), 'MMM yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditingProfile && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button onClick={handleSaveProfile} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div>
                      <h4 className="font-semibold text-red-700 dark:text-red-300">Danger Zone</h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        This will permanently delete all your data
                      </p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout} className="mt-2 sm:mt-0">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout & Clear Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tracking Dialog */}
        {selectedOrderForTracking && (
          <TrackingDialog
            isOpen={trackingDialogOpen}
            onClose={handleCloseTrackingDialog}
            orderId={selectedOrderForTracking}
          />
        )}

        {/* Product Dialog */}
        {selectedProduct && (
          <ProductDialog
            product={selectedProduct}
            isOpen={isProductDialogOpen}
            onClose={handleCloseProductDialog}
            aria-label="Product details dialog"
          />
        )}
      </div>
    </div>
  );
} 