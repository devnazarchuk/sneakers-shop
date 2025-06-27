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
      <div className="flex h-full flex-col bg-background overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-premium px-2 py-6 sm:p-6 md:p-8">
          <div className="flex flex-col gap-6 items-start sm:flex-row sm:items-center sm:justify-between mb-12 sm:mb-16">
            <div className="flex items-center gap-5">
              <div className="h-16 w-1.5 bg-gradient-to-b from-primary to-transparent rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
              <div className="space-y-1">
                <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter text-foreground leading-none">
                  YOUR CART
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 whitespace-nowrap">
                    {totalItems} Items Secured
                  </p>
                  <div className="hidden sm:block h-1 w-1 rounded-full bg-foreground/10 dark:bg-white/10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 whitespace-nowrap">
                    {uniqueProducts} Signature Styles
                  </p>
                </div>
              </div>
            </div>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="w-full sm:w-auto h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-black/5 dark:border-white/5 hover:border-red-500/20"
              >
                Reset Vault
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
              <motion.div
                className="w-32 h-32 mb-10 text-foreground/10 dark:text-white/10 relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <ShoppingBag className="w-full h-full stroke-[0.5]" />
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              </motion.div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-foreground/90 dark:text-white/90 mb-4">
                Vault is Empty
              </h3>
              <p className="text-sm text-foreground/40 dark:text-white/40 max-w-[280px] leading-relaxed mb-10 font-medium">
                Your collection awaits. Secure your first grail and start building your legacy.
              </p>
              <SheetClose asChild>
                <Link href="/catalog">
                  <Button variant="premium" size="lg" className="rounded-2xl h-16 px-10 text-[10px] font-black uppercase tracking-[0.2em]">
                    Browse Collection
                  </Button>
                </Link>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  const isFavorite = favorites.some((fav: { id: number }) => fav.id === item.product.id);
                  return (
                    <motion.div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.9 }}
                      className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-500 hover:border-black/10 dark:hover:border-white/10"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button')) return;
                        setEditDialog({ item, open: true });
                      }}
                    >
                      <div className="p-3 sm:p-5 flex gap-4 md:gap-6 items-center">
                        {/* Image Container */}
                        <div className="relative h-20 w-20 md:h-28 md:w-28 flex-shrink-0 overflow-hidden rounded-[1.2rem] md:rounded-[1.8rem] bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent border border-black/5 dark:border-white/5">
                          <Image
                            src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/placeholder.jpg'}
                            alt={item.product.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="112px"
                          />
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h3 className="text-sm font-black uppercase tracking-tight text-foreground/90 dark:text-white/90 truncate group-hover:text-primary transition-colors">
                                {item.product.title}
                              </h3>
                              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 dark:text-white/30">
                                {item.product.brand} • {item.product.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-foreground/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                              US {item.selectedSize}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-foreground/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                              {item.selectedColor}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-4 bg-foreground/[0.03] dark:bg-white/[0.03] rounded-2xl p-1 border border-black/5 dark:border-white/5">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1); }}
                                className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-foreground/10 dark:hover:bg-white/10 text-muted-foreground/40 hover:text-foreground dark:hover:text-white transition-all"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-xs font-black text-foreground dark:text-white w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1); }}
                                className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-foreground/10 dark:hover:bg-white/10 text-muted-foreground/40 hover:text-foreground dark:hover:text-white transition-all"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-xl font-bold text-foreground dark:text-white tracking-tighter">
                              €{(item.product.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item.product.id, item.product); }}
                            className={`h-10 w-10 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-xl ${isFavorite ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-muted-foreground/40 hover:text-foreground dark:hover:text-white hover:bg-foreground/5 dark:hover:bg-white/5'}`}
                          >
                            <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleRemove(item.product.id, item.selectedSize, item.selectedColor); }}
                            className="h-10 w-10 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-xl text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {items.length > 0 && (
          <div className="p-6 md:p-10 bg-background/80 dark:bg-black/80 backdrop-blur-3xl border-t border-black/5 dark:border-white/5 space-y-6 md:space-y-8 premium-glass">
            <div className="grid grid-cols-2 gap-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Market Value</span>
              <span className="text-right text-xs font-black text-foreground/60 dark:text-white/60">€{subtotal.toFixed(2)}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Priority Logistics</span>
              <span className="text-right text-xs font-black text-green-500/80">{shipping === 0 ? 'COMPLIMENTARY' : `€${shipping.toFixed(2)}`}</span>
              <div className="col-span-2 pt-6 mt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/30 leading-none">Investment Total</span>
                  <div className="text-[10px] font-bold text-foreground/10 dark:text-white/10 uppercase tracking-widest italic leading-none">Inc. Import Duties & VAT</div>
                </div>
                <span className="text-4xl font-black text-primary tracking-tighter text-glow-primary">€{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="premium"
              size="lg"
              className="w-full h-20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(var(--primary),0.3)] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 group relative overflow-hidden"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>NEGOTIATING...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-6 w-6 group-hover:-rotate-6 transition-transform" />
                  <span>SECURE YOUR GRAILS</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 rounded-[2.5rem] overflow-hidden p-8">
          <DialogHeader className="space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-red-500/10 border border-border flex items-center justify-center mx-auto">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tight text-center">Empty Vault?</DialogTitle>
            <DialogDescription className="text-center text-foreground/40 dark:text-white/40 font-medium">
              Are you sure you want to clear your current selection? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-8">
            <Button variant="ghost" className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest" onClick={() => setShowClearDialog(false)}>
              Keep Items
            </Button>
            <Button variant="destructive" className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20" onClick={handleClearCart}>
              Clear Vault
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="bg-[#0a0a0a]/95 backdrop-blur-3xl border-white/10 rounded-[3rem] p-10 max-w-xl">
          {checkoutStep === 'form' ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-black uppercase italic tracking-tight text-foreground dark:text-white">Guest Checkout</DialogTitle>
                <DialogDescription className="text-foreground/40 dark:text-white/40 font-medium">Please provide your details for delivery.</DialogDescription>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Input placeholder="FULL NAME" name="name" value={form.name} onChange={handleFormChange} className="h-14 rounded-2xl bg-white/5 border-white/5 focus:border-primary/50 transition-all font-bold text-[10px] tracking-widest uppercase px-6" />
                <Input placeholder="EMAIL ADDRESS" type="email" name="email" value={form.email} onChange={handleFormChange} className="h-14 rounded-2xl bg-white/5 border-white/5 focus:border-primary/50 transition-all font-bold text-[10px] tracking-widest uppercase px-6" />
                <Input placeholder="PHONE NUMBER" name="phone" value={form.phone} onChange={handleFormChange} className="h-14 rounded-2xl bg-white/5 border-white/5 focus:border-primary/50 transition-all font-bold text-[10px] tracking-widest uppercase px-6" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="CITY" name="city" value={form.city} onChange={handleFormChange} className="h-14 rounded-2xl bg-white/5 border-white/5 focus:border-primary/50 transition-all font-bold text-[10px] tracking-widest uppercase px-6" />
                  <Input placeholder="POSTAL CODE" name="postalCode" value={form.postalCode} onChange={handleFormChange} className="h-14 rounded-2xl bg-white/5 border-white/5 focus:border-primary/50 transition-all font-bold text-[10px] tracking-widest uppercase px-6" />
                </div>
                <Input placeholder="STREET ADDRESS" name="street" value={form.street} onChange={handleFormChange} className="h-14 rounded-2xl bg-white/5 border-white/5 focus:border-primary/50 transition-all font-bold text-[10px] tracking-widest uppercase px-6" />
              </div>
              {formError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{formError}</p>}
              <Button variant="premium" className="w-full h-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em]" onClick={handleConfirmOrder}>
                Place Secure Order
              </Button>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-6">
              <div className="h-24 w-24 rounded-[2rem] bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Check className="h-12 w-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase italic tracking-tight text-foreground dark:text-white">Order Confirmed</h3>
                <p className="text-foreground/40 dark:text-white/40 font-medium">Your request for the latest grails has been processed.</p>
              </div>
              <SheetClose asChild>
                <Button variant="outline" className="h-14 rounded-2xl px-10 text-[10px] font-black uppercase tracking-widest border-black/10 dark:border-white/10 hover:bg-foreground dark:hover:bg-white hover:text-background dark:hover:text-black transition-all" onClick={() => setShowCheckoutDialog(false)}>
                  Continue Shopping
                </Button>
              </SheetClose>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Edit Dialog */}
      {editDialog && (
        <ProductDialog
          product={editDialog.item.product}
          isOpen={editDialog.open}
          onClose={() => setEditDialog(null)}
          cartEditMode={true}
          cartItemId={`${editDialog.item.product.id}-${editDialog.item.selectedSize}-${editDialog.item.selectedColor}`}
          initialSize={editDialog.item.selectedSize}
          initialColor={editDialog.item.selectedColor}
        />
      )}
    </>
  );
}
