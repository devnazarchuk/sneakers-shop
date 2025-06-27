"use client";

import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, Heart, Trash, Check, ShoppingBag, Euro, Sparkles } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { saveOrder } from "@/lib/orders";
import { ProductDialog } from "./ProductDialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  X, 
  CreditCard,
  Loader2
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { v4 as uuidv4 } from 'uuid';
import { getUserProfile, updateProfileFromCheckout, hasUserProfile } from "@/lib/user-profile";
import Link from "next/link";
import { SheetClose } from "@/components/ui/sheet";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart, addToCart, isHydrated } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'success'>('form');
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    street: '', 
    city: '', 
    postalCode: '', 
    country: 'Germany' 
  });
  const [formError, setFormError] = useState('');
  const [editDialog, setEditDialog] = useState<{
    item: {
      product: {
        id: number;
        title: string;
        brand: string;
        price: number;
        images: string[];
        description: string;
        category: string;
        sizes: string[];
        colors: string[];
        styleCode: string;
      };
      quantity: number;
      selectedSize: string;
      selectedColor: string;
    };
    open: boolean;
  } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = total;
  const tax = subtotal * 0.19; // 19% VAT
  const shipping = subtotal >= 100 ? 0 : 9.99; // Free shipping over €100
  const finalTotal = subtotal + tax + shipping;
  
  // Calculate cart statistics
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = items.length;

  // Clear any stale active checkout sessions on component mount
  useEffect(() => {
    const clearStaleCheckoutSessions = () => {
      const activeSessionId = localStorage.getItem('active_checkout_session');
      const checkoutStartedAt = localStorage.getItem('checkout_started_at');
      
      if (activeSessionId && checkoutStartedAt) {
        const startTime = new Date(checkoutStartedAt).getTime();
        const timeDiff = Date.now() - startTime;
        
        // If more than 30 minutes have passed, clear the session
        if (timeDiff > 30 * 60 * 1000) {
          localStorage.removeItem('active_checkout_session');
          localStorage.removeItem('checkout_started_at');
          localStorage.removeItem(`order_${activeSessionId}`);
          console.log('Cleared stale checkout session');
        }
      }
    };

    // Check for navigation from checkout via cookies
    const checkNavigationFromCheckout = () => {
      try {
        const backFromCheckout = document.cookie.includes('back_from_checkout=true');
        const fromStripeCheckout = document.cookie.includes('from_stripe_checkout=true');
        
        if (backFromCheckout || fromStripeCheckout) {
          console.log('Detected navigation from checkout in Cart component');
          
          const activeSessionId = localStorage.getItem('active_checkout_session');
          const checkoutStartedAt = localStorage.getItem('checkout_started_at');
          
          if (activeSessionId && checkoutStartedAt) {
            const startTime = new Date(checkoutStartedAt).getTime();
            const timeDiff = Date.now() - startTime;
            
            if (timeDiff < 10 * 60 * 1000) {
              const orderData = localStorage.getItem(`order_${activeSessionId}`);
              if (orderData) {
                const order = JSON.parse(orderData);
                
                if (order.status === 'pending') {
                  const { createCancelledOrder, saveOrder } = require("@/lib/orders");
                  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                  
                  const customerInfo = userProfile.name ? {
                    name: userProfile.name,
                    email: userProfile.email,
                    phone: userProfile.phone,
                    address: userProfile.address,
                  } : undefined;

                  const cancelledOrder = createCancelledOrder(
                    order.items || [],
                    activeSessionId,
                    customerInfo,
                    'cancelled'
                  );

                  saveOrder(cancelledOrder);
                  console.log('Order cancelled due to navigation (Cart component):', cancelledOrder);
                }
              }
              
              // Clean up
              localStorage.removeItem('active_checkout_session');
              localStorage.removeItem('checkout_started_at');
              localStorage.removeItem(`order_${activeSessionId}`);
            }
          }
          
          // Clear cookies
          document.cookie = 'back_from_checkout=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'from_stripe_checkout=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'checkout_navigation_time=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      } catch (error) {
        console.error('Error checking navigation from checkout:', error);
      }
    };

    clearStaleCheckoutSessions();
    checkNavigationFromCheckout();
  }, []);

  // Handle beforeunload event to track when user leaves checkout
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const activeSessionId = localStorage.getItem('active_checkout_session');
      const checkoutStartedAt = localStorage.getItem('checkout_started_at');
      
      if (activeSessionId && checkoutStartedAt) {
        const startTime = new Date(checkoutStartedAt).getTime();
        const timeDiff = Date.now() - startTime;
        
        // If checkout was started recently (within 10 minutes), mark as cancelled
        if (timeDiff < 10 * 60 * 1000) {
          try {
            const orderData = localStorage.getItem(`order_${activeSessionId}`);
            if (orderData) {
              const order = JSON.parse(orderData);
              
              if (order.status === 'pending') {
                // Mark order as cancelled
                const { createCancelledOrder, saveOrder } = require("@/lib/orders");
                const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                
                const customerInfo = userProfile.name ? {
                  name: userProfile.name,
                  email: userProfile.email,
                  phone: userProfile.phone,
                  address: userProfile.address,
                } : undefined;

                const cancelledOrder = createCancelledOrder(
                  order.items || [],
                  activeSessionId,
                  customerInfo,
                  'cancelled'
                );

                saveOrder(cancelledOrder);
                console.log('Order cancelled due to page unload:', cancelledOrder);
              }
            }
          } catch (error) {
            console.error('Error handling beforeunload:', error);
          }
        }
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      const activeSessionId = localStorage.getItem('active_checkout_session');
      const checkoutStartedAt = localStorage.getItem('checkout_started_at');
      
      if (activeSessionId && checkoutStartedAt) {
        const startTime = new Date(checkoutStartedAt).getTime();
        const timeDiff = Date.now() - startTime;
        
        // If checkout was started recently (within 10 minutes), mark as cancelled
        if (timeDiff < 10 * 60 * 1000) {
          try {
            const orderData = localStorage.getItem(`order_${activeSessionId}`);
            if (orderData) {
              const order = JSON.parse(orderData);
              
              if (order.status === 'pending') {
                // Mark order as cancelled
                const { createCancelledOrder, saveOrder } = require("@/lib/orders");
                const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                
                const customerInfo = userProfile.name ? {
                  name: userProfile.name,
                  email: userProfile.email,
                  phone: userProfile.phone,
                  address: userProfile.address,
                } : undefined;

                const cancelledOrder = createCancelledOrder(
                  order.items || [],
                  activeSessionId,
                  customerInfo,
                  'cancelled'
                );

                saveOrder(cancelledOrder);
                console.log('Order cancelled due to back navigation:', cancelledOrder);
                
                // Clean up active checkout session
                localStorage.removeItem('active_checkout_session');
                localStorage.removeItem('checkout_started_at');
                localStorage.removeItem(`order_${activeSessionId}`);
              }
            }
          } catch (error) {
            console.error('Error handling popstate:', error);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Load user profile data on component mount
  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      const formData = {
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        street: profile.address?.street || '',
        city: profile.address?.city || '',
        postalCode: profile.address?.postalCode || '',
        country: profile.address?.country || 'Germany',
      };
      setForm(formData);
    }
  }, []);

  // Check if user returned from successful checkout and clear cart
  useEffect(() => {
    // Clean up any duplicate orders on mount
    const cleanupOrders = () => {
      try {
        const { cleanupDuplicateOrders, checkAndUpdateExpiredOrders } = require("@/lib/orders");
        cleanupDuplicateOrders();
        checkAndUpdateExpiredOrders();
      } catch (error) {
        console.error('Error cleaning up orders:', error);
      }
    };

    cleanupOrders();

    const checkReturnFromCheckout = () => {
      // Check for active checkout session
      const activeSessionId = localStorage.getItem('active_checkout_session');
      const checkoutStartedAt = localStorage.getItem('checkout_started_at');
      
      if (activeSessionId && checkoutStartedAt) {
        const startTime = new Date(checkoutStartedAt).getTime();
        const timeDiff = Date.now() - startTime;
        
        // If more than 5 minutes have passed since checkout started, mark as cancelled
        if (timeDiff > 5 * 60 * 1000) {
          try {
            const orderData = localStorage.getItem(`order_${activeSessionId}`);
            if (orderData) {
              const order = JSON.parse(orderData);
              
              // Only mark as cancelled if it's still pending
              if (order.status === 'pending') {
                const { createCancelledOrder, saveOrder } = require("@/lib/orders");
                const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                
                const customerInfo = userProfile.name ? {
                  name: userProfile.name,
                  email: userProfile.email,
                  phone: userProfile.phone,
                  address: userProfile.address,
                } : undefined;

                // Create cancelled order
                const cancelledOrder = createCancelledOrder(
                  order.items || [],
                  activeSessionId,
                  customerInfo,
                  'cancelled'
                );

                saveOrder(cancelledOrder);
                console.log('Checkout session timed out, order marked as cancelled:', cancelledOrder);
              }
            }
            
            // Clean up active checkout session
            localStorage.removeItem('active_checkout_session');
            localStorage.removeItem('checkout_started_at');
            localStorage.removeItem(`order_${activeSessionId}`);
          } catch (error) {
            console.error('Error handling timed out checkout session:', error);
          }
        }
      }

      // Check if we have a recent order in localStorage
      const orderKeys = Object.keys(localStorage).filter(key => key.startsWith('order_'));
      const recentOrders = orderKeys
        .map(key => {
          try {
            const order = JSON.parse(localStorage.getItem(key) || '{}');
            return { key, order, timestamp: new Date(order.createdAt || Date.now()) };
          } catch {
            return null;
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Note: Removed automatic cart clearing for recent orders
      // Users should manually clear their cart if needed

      // Check for pending orders that might have been abandoned
      const pendingOrders = recentOrders.filter(item => 
        item.order.status === 'pending' && 
        Date.now() - item.timestamp.getTime() > 30 * 60 * 1000 // 30 minutes
      );

      // Mark abandoned orders as cancelled
      pendingOrders.forEach(item => {
        try {
          const { createCancelledOrder, saveOrder } = require("@/lib/orders");
          const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
          
          const customerInfo = userProfile.name ? {
            name: userProfile.name,
            email: userProfile.email,
            phone: userProfile.phone,
            address: userProfile.address,
          } : undefined;

          // Create cancelled order from the pending order data
          const cancelledOrder = createCancelledOrder(
            item.order.items || [],
            item.order.sessionId,
            customerInfo,
            'cancelled'
          );

          saveOrder(cancelledOrder);
          console.log('Abandoned order marked as cancelled:', cancelledOrder);
          
          // Remove the pending order from localStorage
          localStorage.removeItem(item.key);
        } catch (error) {
          console.error('Error marking abandoned order as cancelled:', error);
        }
      });
    };

    checkReturnFromCheckout();
  }, [items.length, clearCart]);

  // Periodic check for expired orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const { checkAndUpdateExpiredOrders } = require("@/lib/orders");
        checkAndUpdateExpiredOrders();
      } catch (error) {
        console.error('Error checking expired orders:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Don't render cart content until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-sm" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Cart
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  const handleRemove = (productId: number, selectedSize: string, selectedColor: string) => {
    removeFromCart(productId, selectedSize, selectedColor);
    toast.success("Item removed from cart");
  };

  const handleQuantityChange = (productId: number, selectedSize: string, selectedColor: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove(productId, selectedSize, selectedColor);
    } else {
      updateQuantity(productId, selectedSize, selectedColor, newQuantity);
    }
  };

  const handleToggleFavorite = (productId: number, product: {
    id: number;
    title: string;
    brand: string;
    price: number;
    images: string[];
    description: string;
    category: string;
    sizes: string[];
    colors: string[];
    styleCode: string;
  }) => {
    if (favorites.some(fav => fav.id === productId)) {
      removeFromFavorites(productId);
      toast.success("Removed from favorites");
    } else {
      addToFavorites(product);
      toast.success("Added to favorites");
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
    setShowClearDialog(false);
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);
    
    try {
      // Check if Stripe is configured
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        // Fallback to form-based checkout
        setShowCheckoutDialog(true);
        setIsCheckingOut(false);
        return;
      }

      // Get current URL for success/cancel URLs
      const currentOrigin = window.location.origin;

      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          successUrl: `${currentOrigin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${currentOrigin}/cancel?session_id={CHECKOUT_SESSION_ID}`,
        }),
      });

      const { sessionId, url, error, details } = await response.json();

      if (error) {
        console.error('Stripe API error:', { error, details, response: response.status });
        
        // If Stripe fails, fallback to form-based checkout
        if (error.includes('Stripe configuration error') || 
            error.includes('Invalid URL configuration') ||
            error.includes('Not a valid URL')) {
          console.warn('Stripe not configured, falling back to form checkout:', error);
          setShowCheckoutDialog(true);
          setIsCheckingOut(false);
          return;
        }
        throw new Error(details || error);
      }

      // Create and save order
      const { createOrderFromCart } = await import("@/lib/orders");
      const order = createOrderFromCart(items, sessionId);
      const { saveOrder, checkAndUpdateExpiredOrders } = await import("@/lib/orders");
      saveOrder(order);
      
      // Check and update expired orders
      checkAndUpdateExpiredOrders();

      // Redirect to Stripe Checkout
      if (sessionId && url) {
        // Save order to localStorage for success page with enhanced data
        const orderData = {
          ...order, // Use the same order object
          items: items.map(item => ({
            productId: item.product.id,
            title: item.product.title,
            brand: item.product.brand,
            category: item.product.category,
            size: item.selectedSize,
            color: item.selectedColor,
            quantity: item.quantity,
            price: item.product.price,
            images: item.product.images,
          })),
          total: finalTotal,
          subtotal: subtotal,
          tax: tax,
          shipping: shipping,
          currency: 'EUR',
          checkoutStartedAt: new Date().toISOString(), // Track when checkout started
        };
        localStorage.setItem(`order_${sessionId}`, JSON.stringify(orderData));

        // Also save a flag to track active checkout
        localStorage.setItem('active_checkout_session', sessionId);
        localStorage.setItem('checkout_started_at', new Date().toISOString());
        localStorage.setItem('checkout_url', url); // Save the Stripe URL
        localStorage.setItem('checkout_items_count', items.length.toString());

        // Redirect to Stripe Checkout
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      
      // If Stripe checkout fails, offer form-based checkout as fallback
      if (error instanceof Error && (
        error.message.includes('Stripe') || 
        error.message.includes('Invalid API key') ||
        error.message.includes('Not a valid URL')
      )) {
        toast.error("Online payment not available. Using form checkout instead.");
        setShowCheckoutDialog(true);
      } else {
        toast.error("Failed to start checkout. Please try again.");
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleConfirmOrder = () => {
    // Basic validation
    if (!form.name || !form.email || !form.phone || !form.street || !form.city || !form.postalCode || !form.country) {
      setFormError('Please fill in all fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError('Invalid email');
      return;
    }
    setFormError('');
    
    // Save user profile data
    updateProfileFromCheckout({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: `${form.street}, ${form.city}, ${form.postalCode}, ${form.country}`,
    });
    
    // Create order using the proper function
    const { createOrderFromCart } = require("@/lib/orders");
    const order = createOrderFromCart(items, undefined, {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: {
        street: form.street,
        city: form.city,
        postalCode: form.postalCode,
        country: form.country,
      },
    });
    
    const { saveOrder } = require("@/lib/orders");
    saveOrder(order);
    
    // Clear cart first, then show success
    clearCart();
    setCheckoutStep('success');
    toast.success('Order placed!');
    setTimeout(() => setShowCheckoutDialog(false), 2000);
  };

  return (
    <>
      <div className={`flex h-full flex-col${items.length === 0 ? ' overflow-hidden' : ''}`}>
        <div className={`flex-1 ${items.length === 0 ? '' : 'overflow-y-auto pb-32'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Shopping Cart</h2>
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-700"
              >
                Clear Cart
              </Button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <motion.div 
                className="w-24 h-24 mb-6 text-muted-foreground relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <ShoppingBag className="w-full h-full" />
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full blur-lg" />
              </motion.div>
              <motion.h3 
                className="text-xl font-semibold mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Your cart is empty
              </motion.h3>
              <motion.p 
                className="text-muted-foreground max-w-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Add some items to your cart to see them here. You can browse our catalog to find amazing sneakers!
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <SheetClose asChild>
                  <Link href="/catalog">
                    <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                      Browse Products
                    </Button>
                  </Link>
                </SheetClose>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item) => {
                  const isFavorite = favorites.some((fav) => fav.id === item.product.id);
                  return (
                    <motion.div
                      key={item.product.id + '-' + item.selectedSize + '-' + item.selectedColor}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 hover:shadow-xl"
                      onClick={e => {
                        // Only open dialog if not clicking a button
                        if ((e.target as HTMLElement).closest('button')) return;
                        setEditDialog({ item, open: true });
                      }}
                    >
                      {/* Background gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative p-4">
                        <div className="flex flex-col md:flex-row items-stretch gap-4">
                          {/* Image */}
                          <div className="relative h-[143px] w-full md:h-[123px] md:w-[123px] flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-muted/50 to-muted/30 mb-2 md:mb-0 mx-auto md:mx-0">
                        <Image
                          src={item.product.images && item.product.images.length > 0 ? item.product.images[item.product.images.length - 1] : '/placeholder.jpg'}
                          alt={item.product.title}
                          fill
                              className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 123px"
                        />
                      </div>
                          
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                                <h3 className="font-semibold truncate max-w-[60%] group-hover:text-primary transition-colors">
                                  {item.product.title}
                                </h3>
                                <motion.p 
                                  className="font-bold text-right text-lg md:text-xl min-w-[70px] bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                  €{(item.product.price * item.quantity).toFixed(2)}
                                </motion.p>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                  Size: {item.selectedSize}
                                </span>
                                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                  Color: {item.selectedColor}
                                </span>
                          </div>
                        </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mt-3 w-full">
                          <div className="flex items-center gap-2">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="icon"
                                    className="h-8 w-8 md:h-10 md:w-10 rounded-xl border-white/20 bg-background/50 backdrop-blur-sm"
                              onClick={e => { e.stopPropagation(); handleQuantityChange(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1); }}
                            >
                                    <Minus className="h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                                </motion.div>
                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="icon"
                                    className="h-8 w-8 md:h-10 md:w-10 rounded-xl border-white/20 bg-background/50 backdrop-blur-sm"
                              onClick={e => { e.stopPropagation(); handleQuantityChange(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1); }}
                            >
                                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                                </motion.div>
                              </div>
                              
                            <div className="flex gap-2 flex-row justify-end w-full md:w-auto">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                                    className={`h-8 w-8 md:h-10 md:w-10 rounded-xl backdrop-blur-sm transition-all duration-200 ${
                                      isFavorite 
                                        ? "bg-red-500/90 text-white hover:bg-red-600/90" 
                                        : "bg-white/90 text-gray-700 hover:bg-white hover:text-red-500"
                                    }`}
                              onClick={e => { e.stopPropagation(); handleToggleFavorite(item.product.id, item.product); }}
                            >
                                    <Heart className="h-4 w-4 md:h-5 md:w-5" fill={isFavorite ? "currentColor" : "none"} />
                            </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                                    className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-red-500/90 text-white hover:bg-red-600/90 backdrop-blur-sm"
                              onClick={e => { e.stopPropagation(); handleRemove(item.product.id, item.selectedSize, item.selectedColor); }}
                            >
                                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                                </motion.div>
                              </div>
                          </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
        {items.length > 0 && (
          <motion.div 
            className="sticky bottom-0 border-t border-white/10 p-6 bg-background/95 backdrop-blur-xl shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Order Summary */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items ({totalItems})</span>
                <span>{uniqueProducts} product{uniqueProducts !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (19%)</span>
                <span>€{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : `€${shipping.toFixed(2)}`}</span>
              </div>
              {shipping > 0 && (
                <div className="text-xs text-muted-foreground text-center py-2 bg-primary/10 rounded-lg">
                  Add €{(100 - subtotal).toFixed(2)} more for free shipping
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <div className="flex items-center gap-1">
                  <Euro className="h-5 w-5 text-primary" />
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl h-12 text-lg font-semibold" 
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Checkout
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog} aria-label="Clear cart dialog">
        <DialogContent className="bg-background/95 backdrop-blur-xl border border-white/10">
          <DialogHeader>
            <DialogTitle>Clear Cart</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove all items from your cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearCart}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl"
            >
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog} aria-label="Checkout dialog">
        <DialogContent className="bg-background/95 backdrop-blur-xl border border-white/10">
          {checkoutStep === 'form' ? (
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Checkout</DialogTitle>
                <DialogDescription>
                  Please fill in your details to complete your order.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <input
                  className="w-full border border-white/20 rounded-xl p-3 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleFormChange}
                />
                <input
                  className="w-full border border-white/20 rounded-xl p-3 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleFormChange}
                  type="email"
                />
                <input
                  className="w-full border border-white/20 rounded-xl p-3 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  name="phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleFormChange}
                />
                <input
                  className="w-full border border-white/20 rounded-xl p-3 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  name="street"
                  placeholder="Street"
                  value={form.street}
                  onChange={handleFormChange}
                />
                <input
                  className="w-full border border-white/20 rounded-xl p-3 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleFormChange}
                />
                <input
                  className="w-full border border-white/20 rounded-xl p-3 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={form.postalCode}
                  onChange={handleFormChange}
                />
                <input
                  className="w-full border border-white/20 rounded-xl p-3 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  name="country"
                  placeholder="Country"
                  value={form.country}
                  onChange={handleFormChange}
                />
                {formError && <div className="text-red-500 text-sm">{formError}</div>}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="w-full mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl h-12" 
                    onClick={handleConfirmOrder}
                  >
                    Confirm Order
                  </Button>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Check className="h-16 w-16 text-green-500 mb-4" />
              </motion.div>
              <motion.div 
                className="text-xl font-bold mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Thank you for your order!
              </motion.div>
              <motion.div 
                className="text-muted-foreground mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                We will contact you soon.
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
              <Button 
                onClick={() => {
                  setShowCheckoutDialog(false);
                  window.location.href = '/profile';
                }}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl"
              >
                Go to Profile
              </Button>
              </motion.div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit ProductDialog for cart item */}
      {editDialog && (
        <ProductDialog
          product={editDialog.item.product}
          isOpen={editDialog.open}
          onClose={() => setEditDialog(null)}
          initialSize={editDialog.item.selectedSize}
          initialColor={editDialog.item.selectedColor}
          cartEditMode
          cartItemId={editDialog.item.product.id + '-' + editDialog.item.selectedSize + '-' + editDialog.item.selectedColor}
          aria-label="Product details dialog"
        />
      )}
    </>
  );
} 