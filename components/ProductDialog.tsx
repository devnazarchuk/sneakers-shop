"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Heart, ShoppingCart, Check, Sparkles, RotateCcw,
  Loader2, Eye, X
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { toast } from "sonner";
import { Product } from "@/lib/data";
import { useState, useEffect } from "react";

interface ProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  initialSize?: string;
  initialColor?: string;
  cartEditMode?: boolean;
  cartItemId?: string;
}

export function ProductDialog({ product, isOpen, onClose, initialSize, initialColor, cartEditMode, cartItemId }: ProductDialogProps) {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [selectedSize, setSelectedSize] = useState<string>(initialSize || "");
  const [selectedColor, setSelectedColor] = useState<string>(initialColor || "");
  const [isFavorite, setIsFavorite] = useState(favorites.some((fav: { id: number }) => fav.id === product?.id));
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (initialSize) setSelectedSize(initialSize);
    if (initialColor) setSelectedColor(initialColor);
    if (!initialSize && product) {
      const saved = localStorage.getItem(`lastSelection-${product.styleCode}`);
      if (saved) {
        const { size, color } = JSON.parse(saved);
        setSelectedSize(size);
        setSelectedColor(color);
      }
    }
  }, [initialSize, initialColor, isOpen, product]);

  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      localStorage.setItem(`lastSelection-${product.styleCode}`, JSON.stringify({ size: selectedSize, color: selectedColor }));
    }
  }, [product, selectedSize, selectedColor]);

  if (!product) return null;

  const cartItem = items.find((item) => item.product.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor);
  const isInCart = !!cartItem;

  const handleAddOrUpdateCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select size and color");
      return;
    }
    setIsAddingToCart(true);
    if (cartEditMode && isInCart && cartItem) {
      // Just update the item (do not increment)
      updateQuantity(product.id, selectedSize, selectedColor, cartItem.quantity);
      toast.success("Updated in cart");
    } else if (cartEditMode && cartItemId && initialSize && initialColor) {
      // Remove old item by productId + old size/color, add new with quantity 1
      removeFromCart(product.id, initialSize, initialColor);
      addToCart(product, selectedSize, selectedColor, 1);
      toast.success("Updated in cart");
    } else {
      addToCart(product, selectedSize, selectedColor, 1);
      toast.success("Added to cart");
    }
    setTimeout(() => {
      setIsAddingToCart(false);
      onClose();
    }, 1000);
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(product.id);
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      addToFavorites(product);
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1100px] p-0 overflow-hidden bg-background/80 dark:bg-black/80 backdrop-blur-[40px] border border-black/5 dark:border-white/10 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] w-[95vw] md:w-full max-h-[90vh]">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[90vh]">
          {/* Image Section */}
          <div className="relative aspect-square lg:aspect-auto h-full min-h-[300px] bg-gradient-to-br from-black/[0.03] dark:from-white/[0.03] to-transparent overflow-hidden border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImage}
                initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={product.images && product.images.length > 0 ? product.images[currentImage] : '/placeholder.jpg'}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 600px"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

            {/* Navigation Buttons */}
            {product.images.length > 1 && (
              <div className="absolute inset-x-4 md:inset-x-8 top-1/2 -translate-y-1/2 flex justify-between z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 md:h-16 md:w-16 rounded-[1.5rem] md:rounded-[2rem] glass text-foreground dark:text-white hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black transition-all duration-500 shadow-2xl"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); setCurrentImage((currentImage - 1 + product.images.length) % product.images.length); }}
                >
                  <span className="text-2xl md:text-3xl font-light">←</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 md:h-16 md:w-16 rounded-[1.5rem] md:rounded-[2rem] glass text-foreground dark:text-white hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black transition-all duration-500 shadow-2xl"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); setCurrentImage((currentImage + 1) % product.images.length); }}
                >
                  <span className="text-2xl md:text-3xl font-light">→</span>
                </Button>
              </div>
            )}

            {/* Image Indicators */}
            <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 flex gap-2 md:gap-4 z-20">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`h-1 md:h-1.5 transition-all duration-700 rounded-full ${idx === currentImage ? "w-8 md:w-12 bg-primary shadow-[0_0_20px_rgba(var(--primary),0.6)]" : "w-1 md:w-1.5 bg-foreground/10 dark:bg-white/10 hover:bg-foreground/30 dark:hover:bg-white/30"
                    }`}
                />
              ))}
            </div>

            {/* Favorite Badge */}
            <div className="absolute top-4 md:top-8 right-4 md:right-8 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className={`h-12 w-12 md:h-16 md:w-16 rounded-[1.5rem] md:rounded-[2rem] glass transition-all duration-500 border border-black/10 dark:border-white/10 ${isFavorite
                  ? "text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] bg-red-500/10 border-red-500/30"
                  : "text-foreground/40 dark:text-white/40 hover:text-foreground dark:hover:text-white"
                  }`}
              >
                <Heart className="h-5 w-5 md:h-7 md:w-7" fill={isFavorite ? "currentColor" : "none"} />
              </Button>
            </div>

            {/* Brand/Model Label */}
            <div className="absolute top-4 md:top-8 left-4 md:left-8">
              <div className="flex flex-col gap-2">
                <span className="px-4 md:px-5 py-2 md:py-2.5 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-black/10 dark:border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-foreground/90 dark:text-white/90 shadow-2xl w-fit">
                  {product.brand}
                </span>
              </div>
            </div>


          </div>

          {/* Content Section */}
          <div className="flex flex-col h-full bg-background overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 scrollbar-premium">
              <div className="space-y-6 md:space-y-10">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-col gap-1 md:gap-2">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 dark:text-white/20">{product.category} / Style: {product.styleCode}</span>
                    <h2 className="text-3xl md:text-5xl lg:text-5xl font-black uppercase italic tracking-tighter text-foreground dark:text-white leading-[0.9] dark:text-glow">
                      {product.title}
                    </h2>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-primary text-glow-primary">
                    €{product.price.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                  {/* Size Selection */}
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 dark:text-white/40">Refine Size (US)</h4>
                      <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer hover:underline">Size Chart</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`h-10 md:h-12 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black transition-all duration-500 border ${selectedSize === size
                            ? "bg-primary text-white border-primary shadow-[0_10px_30px_rgba(var(--primary),0.3)] scale-105"
                            : "bg-foreground/5 dark:bg-white/[0.02] text-foreground/30 dark:text-white/30 border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 hover:text-foreground dark:hover:text-white"
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="space-y-3 md:space-y-4">
                    <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 dark:text-white/40">Signature Color</h4>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border ${selectedColor === color
                            ? "bg-foreground dark:bg-white text-background dark:text-black border-foreground dark:border-white shadow-[0_10px_40px_rgba(var(--foreground),0.1)] dark:shadow-[0_10px_40px_rgba(255,255,255,0.1)] scale-105"
                            : "bg-foreground/5 dark:bg-white/[0.02] text-foreground/30 dark:text-white/30 border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 hover:text-foreground dark:hover:text-white"
                            }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 md:pt-8 border-t border-black/5 dark:border-white/5">
                  <p className="text-xs md:text-sm text-foreground/40 dark:text-white/30 font-medium leading-[1.6] tracking-tight">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Footer / Actions */}
            <div className="p-6 md:p-8 lg:px-10 border-t border-black/5 dark:border-white/5 bg-background/95 backdrop-blur-md flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="hidden lg:flex h-16 md:h-20 px-8 md:px-12 rounded-[2rem] md:rounded-[2.5rem] bg-foreground/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white transition-all duration-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-[11px] items-center gap-4"
                onClick={onClose}
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
                <span>Dismiss</span>
              </Button>

              <Button
                variant="premium"
                size="lg"
                className="flex-1 h-16 md:h-20 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_60px_rgba(var(--primary),0.3)] text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] group relative overflow-hidden"
                onClick={handleAddOrUpdateCart}
                disabled={isAddingToCart}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <AnimatePresence mode="wait">
                  {isAddingToCart ? (
                    <motion.div
                      key="adding"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex items-center gap-4"
                    >
                      <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                      <span>{cartEditMode ? "UPDATING..." : "SECURING..."}</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="normal"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="flex items-center gap-4"
                    >
                      <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 group-hover:-rotate-12 transition-transform" />
                      <span>{cartEditMode ? "UPDATE COLLECTION" : "ADD TO COLLECTION"}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}