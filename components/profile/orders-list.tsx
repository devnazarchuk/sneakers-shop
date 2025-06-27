import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/card";
import { motion, AnimatePresence } from "framer-motion";
import { useOrderUpdates, Order as LibOrder } from "@/lib/orders";
import { Skeleton } from "@/lib/components/ui/skeleton";

interface Order {
  id: string;
  items: Array<{
    id: number;
    title: string;
    price: number;
    imageUrl: string;
  }>;
  createdAt: string;
  total: number;
}

interface OrdersListProps {
  userId: string;
}

export function OrdersList({ userId }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app, you would fetch orders from your backend
        // For now, we'll use localStorage
        const storedOrders = localStorage.getItem(`orders-${userId}`);
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  // Listen for order updates (hook must be called at top level)
  const cleanup = useOrderUpdates((updatedOrders: LibOrder[]) => {
    // Filter orders for this specific user and map to local Order interface
    const userOrders = updatedOrders
      .filter((order: LibOrder) => {
        // In a real app, you'd filter by actual user ID
        // For now, we'll show all orders
        return true;
      })
      .map((order: LibOrder) => ({
        id: order.id,
        createdAt: order.date,
        total: order.total,
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
          id: item.productId,
          title: item.title,
          price: item.price,
          imageUrl: item.images?.[0] || '/placeholder.jpg'
        }))
      }));
    setOrders(userOrders);
    setIsLoading(false);
  });

  useEffect(() => {
    // Clean-up subscription on unmount or userId change
    return cleanup;
  }, [userId, cleanup]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-700/80 bg-gradient-to-br from-white/80 via-white/60 to-white/90 dark:from-zinc-900/80 dark:via-zinc-800/80 dark:to-zinc-900/80 backdrop-blur-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 10}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="h-6 w-48 bg-gradient-to-r from-gray-300/60 via-gray-400/40 to-gray-300/60 rounded-xl mb-8 animate-pulse" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: itemIndex * 0.2, duration: 0.4 }}
                    className="aspect-square bg-gradient-to-br from-gray-300/40 via-gray-400/30 to-gray-300/40 rounded-2xl animate-pulse border border-white/10"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-700/80 bg-gradient-to-br from-white/80 via-white/60 to-white/90 dark:from-zinc-900/80 dark:via-zinc-800/80 dark:to-zinc-900/80 backdrop-blur-2xl p-16 text-center shadow-2xl hover:shadow-3xl transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-pink-500/15" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-blue-500/5 to-transparent" />
        
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 p-[1px]">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl" />
        </div>

        <motion.div
          className="absolute top-4 left-4 w-3 h-3 bg-blue-400/60 rounded-full"
          animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-8 right-8 w-2 h-2 bg-purple-400/60 rounded-full"
          animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-6 left-12 w-2.5 h-2.5 bg-pink-400/60 rounded-full"
          animate={{ y: [0, -12, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />

        <div className="relative z-10">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
          >
            No orders yet
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-zinc-800 dark:text-zinc-300 text-lg"
          >
            When you place an order, it will appear here with amazing details!
          </motion.p>
        </div>
      </motion.div>
    );
  }

  const placeholder = {
    images: ["/placeholder.jpg"],
    description: "No description",
    category: "Unknown",
    brand: "Unknown",
    sizes: ["EU 42"],
    colors: ["Black"],
    styleCode: "N/A"
  };

  return (
    <AnimatePresence>
      <div className="space-y-10" role="region" aria-label="Orders list">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.15, 
              duration: 0.7, 
              ease: "easeOut",
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            className="group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-700/80 bg-gradient-to-br from-white/80 via-white/60 to-white/90 dark:from-zinc-900/80 dark:via-zinc-800/80 dark:to-zinc-900/80 backdrop-blur-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500"
            role="article"
            aria-label={`Order #${order.id}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/8 to-pink-500/10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent" />
            
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl" />
            </div>

            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
                  style={{
                    left: `${10 + i * 10}%`,
                    top: `${20 + i * 8}%`,
                  }}
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-6 mb-8">
                <div>
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    Order #{order.id}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-zinc-800 dark:text-zinc-300 text-sm mt-2"
                  >
                    {format(new Date(order.createdAt), "PPP")}
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-right min-w-[120px]"
                >
                  <p className="font-medium text-sm sm:text-base text-zinc-700 dark:text-zinc-300 mb-1">Total</p>
                  <p className="text-xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {order.total} €
                  </p>
                </motion.div>
              </div>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {order.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ 
                      delay: itemIndex * 0.1 + 0.5, 
                      duration: 0.5,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 5,
                      transition: { duration: 0.3 }
                    }}
                    className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-gradient-to-br from-white/80 via-white/60 to-white/90 dark:from-zinc-900/80 dark:via-zinc-800/80 dark:to-zinc-900/80 backdrop-blur-xl hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-all duration-300 group/item"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                    
                    <Card {...placeholder} {...item} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
} 