"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, ShoppingBag, AlertTriangle, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createCancelledOrder, saveOrder } from "@/lib/orders";

function CancelPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Save cancelled order when page loads
    const saveCancelledOrder = () => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cart_guest') || '[]');
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        
        if (cartItems.length > 0) {
          const customerInfo = userProfile.name ? {
            name: userProfile.name,
            email: userProfile.email,
            phone: userProfile.phone,
            address: userProfile.address,
          } : undefined;

          const cancelledOrder = createCancelledOrder(
            cartItems,
            searchParams.get('session_id') || undefined,
            customerInfo,
            'cancelled'
          );

          saveOrder(cancelledOrder);
          console.log('Cancelled order saved:', cancelledOrder);
        }
      } catch (error) {
        console.error('Error saving cancelled order:', error);
      }
    };

    // Clear active checkout session
    const clearActiveCheckout = () => {
      try {
        localStorage.removeItem('active_checkout_session');
        localStorage.removeItem('checkout_started_at');
        localStorage.removeItem('checkout_url');
        localStorage.removeItem('checkout_items_count');
      } catch (error) {
        console.error('Error clearing active checkout session:', error);
      }
    };

    saveCancelledOrder();
    clearActiveCheckout();
  }, [searchParams]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/catalog');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleClearCart = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-4"
            >
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Payment Cancelled
            </CardTitle>
            <p className="text-muted-foreground">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span>What happened?</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• You cancelled the payment process</li>
                <li>• Your cart items are still available</li>
                <li>• No charges were made to your account</li>
                <li>• You can try again anytime</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/catalog">
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full rounded-xl border-white/20 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>

              <Button 
                variant="destructive" 
                className="w-full rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                onClick={handleClearCart}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Redirecting to catalog in {countdown} seconds...
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <CancelPageContent />
    </Suspense>
  );
} 