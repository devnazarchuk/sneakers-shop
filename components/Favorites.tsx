"use client";
import { ProductDialog } from "./ProductDialog";
import { useFavorites } from "@/context/favorites-context";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Check, Trash2, Sparkles, Eye, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SheetClose } from "@/components/ui/sheet";

const Sparkle = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="absolute w-1 h-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full shadow-lg"
    style={{ left: x, top: y }}
  />
);

export function Favorites() {
  const { favorites, removeFromFavorites, clearFavorites, isHydrated } = useFavorites();
  const { items, addToCart, removeFromCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState<number | null>(null);
  const [isRemovingFromCart, setIsRemovingFromCart] = useState<number | null>(null);
  const [showSparkles, setShowSparkles] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Don't render favorites content until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <Heart className="h-8 w-8 text-pink-500" />
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-rose-500/10 rounded-full blur-sm" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Favorites
            </h2>
          </div>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (productId: number) => {
    const product = favorites.find((fav) => fav.id === productId);
    if (!product) return;
    setSelectedProduct(product);
    setIsDialogOpen(true);
    setIsAddingToCart(productId);
    setShowSparkles(productId);
    toast.success("Added to cart");
    setTimeout(() => {
      setIsAddingToCart(null);
      setShowSparkles(null);
    }, 1000);
  };

  const handleRemoveFromCart = async (productId: number) => {
    const cartItem = items.find((item) => String(item.product.id) === String(productId));
    if (!cartItem) return;
    setIsRemovingFromCart(productId);
    removeFromCart(productId, cartItem.selectedSize, cartItem.selectedColor);
    toast.success("Removed from cart");
    setTimeout(() => {
      setIsRemovingFromCart(null);
    }, 1000);
  };

  const handleRemoveFromFavorites = (productId: number) => {
    removeFromFavorites(productId);
    toast.success("Removed from favorites");
  };

  const handleClearAllFavorites = () => {
    clearFavorites();
    toast.success("All favorites cleared");
  };

  return (
    <div className={`flex h-full flex-col bg-background ${favorites.length === 0 ? 'overflow-hidden' : ''}`}>
      <div className={`flex-1 ${favorites.length === 0 ? '' : 'overflow-y-auto pb-48'} p-4 sm:p-6 md:p-8`}>
        <div className="flex flex-col gap-6 items-start sm:flex-row sm:items-center sm:justify-between mb-12 sm:mb-16">
          <div className="flex items-center gap-5">
            <div className="h-16 w-1.5 bg-gradient-to-b from-red-500 to-transparent rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter text-foreground leading-none">
                THE LOVED
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                {favorites.length} Masterpieces Saved
              </p>
            </div>
          </div>

          {favorites.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFavorites}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/20 hover:text-foreground dark:hover:text-white hover:bg-foreground/5 dark:hover:bg-white/5 transition-all border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10"
            >
              Reset Collection
            </Button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] md:h-[60vh] text-center px-4 md:px-10">
            <motion.div
              className="w-24 h-24 md:w-32 md:h-32 mb-8 md:mb-10 text-foreground/5 dark:text-white/5 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <Heart className="w-full h-full stroke-[0.3]" />
              <div className="absolute inset-0 bg-red-500/10 blur-[120px] rounded-full animate-pulse" />
            </motion.div>
            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-foreground/80 dark:text-white/80 mb-4">
              Purity in Silence
            </h3>
            <p className="text-xs md:text-sm text-foreground/20 dark:text-white/20 max-w-[280px] md:max-w-[320px] leading-relaxed mb-10 md:mb-12 font-medium">
              Your private collection is currently empty. Curate your signature style by marking your favorite pairs.
            </p>
            <SheetClose asChild>
              <Link href="/catalog">
                <Button variant="premium" size="lg" className="rounded-[2rem] h-16 md:h-20 px-10 md:px-12 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl">
                  Curate Now
                </Button>
              </Link>
            </SheetClose>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-8 pb-32">
            <AnimatePresence mode="popLayout">
              {favorites.map((product) => {
                const cartItem = items.find((item) => String(item.product.id) === String(product.id));
                const isInCart = !!cartItem;

                return (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group relative overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] premium-glass cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("button")) return;
                      setSelectedProduct(product);
                      setIsDialogOpen(true);
                    }}
                  >
                    <div className="flex gap-4 p-4 items-center">
                      {/* Image Section */}
                      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-2xl bg-white/5">
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 truncate">{product.brand}</span>
                        </div>
                        <h3 className="text-base font-black uppercase italic tracking-tighter text-foreground leading-tight mb-2 truncate">
                          {product.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-muted-foreground/50">€{product.price}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className={`h-8 rounded-lg font-bold text-[9px] uppercase tracking-wider ${isInCart
                                ? "bg-green-500 text-white"
                                : "bg-foreground text-background"
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product.id);
                              }}
                            >
                              {isInCart ? "In Cart" : "Buy"}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromFavorites(product.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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

        {
          selectedProduct && (
            <ProductDialog
              product={selectedProduct}
              isOpen={isDialogOpen}
              onClose={() => {
                setIsDialogOpen(false);
                setSelectedProduct(null);
              }}
            />
          )
        }
      </div >
    </div >
  )
}