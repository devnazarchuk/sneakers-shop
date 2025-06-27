"use client";

import { Product } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Check, Trash2, Sparkles, Eye, Loader2 } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { toast } from "sonner";
import { useState } from "react";
import { ProductDialog } from "./ProductDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  viewMode?: 'cozy' | 'compact';
}

export function ProductCard({ product, priority = false, viewMode = 'cozy' }: ProductCardProps) {
  const { items, addToCart, removeFromCart } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isFavorite = favorites.some((fav: { id: number }) => fav.id === product.id);
  const [isRemovingFromCart, setIsRemovingFromCart] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const cartItem = items.find((item) => item.product.id === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const handleRemoveFromCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRemoveDialog(true);
  };

  const confirmRemove = () => {
    setIsRemovingFromCart(true);
    if (cartItem) {
      removeFromCart(Number(product.id), cartItem.selectedSize, cartItem.selectedColor);
    }
    toast.success("Removed from cart");
    setTimeout(() => {
      setIsRemovingFromCart(false);
      setShowRemoveDialog(false);
    }, 1000);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFromFavorites(product.id);
      toast.success("Removed from favorites");
    } else {
      addToFavorites(product);
      toast.success("Added to favorites");
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className={`group relative overflow-hidden bg-white/50 dark:bg-white/[0.01] premium-card transition-all duration-500 hover:border-primary/40 cursor-pointer ${viewMode === 'compact'
            ? 'rounded-[1.5rem] border border-black/5 dark:border-white/5'
            : 'rounded-[2.5rem] border border-black/5 dark:border-white/5'
          }`}
        onClick={() => setIsDialogOpen(true)}
      >
        {/* Background glow effect */}
        <div className="absolute -inset-10 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none" />

        <div className={viewMode === 'compact' ? 'p-2 space-y-2' : 'p-4 space-y-5'}>
          {/* Image container */}
          <div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-black/5 to-transparent dark:from-white/5 dark:to-transparent border border-black/5 dark:border-white/5 ${viewMode === 'compact' ? 'rounded-[1.2rem]' : 'rounded-[2rem]'
            }`}>
            <Image
              src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
              alt={product.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-black/80 via-transparent to-transparent opacity-40 dark:opacity-60 group-hover:opacity-20 transition-opacity duration-500" />

            {/* Action buttons overlay */}
            <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none ${viewMode === 'compact' ? 'scale-75 group-hover:scale-90' : 'scale-90 group-hover:scale-100'}`}>
              <Button
                size="icon"
                variant="premium"
                className={`rounded-full shadow-2xl shadow-primary/40 pointer-events-auto ${viewMode === 'compact' ? 'h-12 w-12' : 'h-16 w-16'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
              >
                <Eye className={viewMode === 'compact' ? 'h-5 w-5' : 'h-7 w-7'} />
              </Button>
            </div>

            {/* Top right corner badges */}
            <div className={`absolute flex flex-col gap-3 ${viewMode === 'compact' ? 'top-2 right-2' : 'top-4 right-4'}`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className={`glass transition-all duration-500 border border-black/10 dark:border-white/10 ${viewMode === 'compact' ? 'h-8 w-8 rounded-xl' : 'h-11 w-11 rounded-2xl'
                  } ${isFavorite
                    ? "bg-red-500/20 text-red-500 border-red-500/40"
                    : "text-foreground/40 dark:text-white/40 hover:text-foreground dark:hover:text-white"
                  }`}
              >
                <Heart className={viewMode === 'compact' ? 'h-3.5 w-3.5' : 'h-5 w-5'} fill={isFavorite ? "currentColor" : "none"} />
              </Button>
            </div>

            {/* Brand badge */}
            <div className={`absolute ${viewMode === 'compact' ? 'top-2 left-2' : 'top-4 left-4'}`}>
              <span className={`rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-3xl border border-black/10 dark:border-white/10 uppercase font-black tracking-[0.2em] text-foreground/90 dark:text-white/90 shadow-2xl ${viewMode === 'compact' ? 'px-2.5 py-1 text-[8px]' : 'px-4 py-1.5 text-[10px]'
                }`}>
                {product.brand}
              </span>
            </div>

            {/* Bottom info */}
            <div className={`absolute ${viewMode === 'compact' ? 'bottom-3 left-3 right-3' : 'bottom-6 left-6 right-6'}`}>
              <div className="flex flex-col gap-1">
                <span className={`font-black uppercase tracking-[0.3em] text-white/40 dark:text-white/40 italic ${viewMode === 'compact' ? 'text-[8px]' : 'text-[10px]'}`}>{product.category}</span>
                <p className={`font-black text-white dark:text-white tracking-tighter drop-shadow-sm dark:text-glow ${viewMode === 'compact' ? 'text-lg' : 'text-2xl'}`}>€{product.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 pb-2 space-y-5">
            <h3 className="font-black text-base uppercase tracking-tight text-foreground/90 dark:text-white/90 group-hover:text-primary transition-colors duration-300 truncate">
              {product.title}
            </h3>

            <Button
              size="lg"
              onClick={(e) => { e.stopPropagation(); isInCart ? handleRemoveFromCart(e) : handleAddToCart(e); }}
              disabled={isRemovingFromCart}
              variant={isInCart ? "destructive" : "premium"}
              className={`w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all duration-500 ${isInCart
                ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                : "shadow-primary/10"
                }`}
            >
              <AnimatePresence mode="wait">
                {isRemovingFromCart ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </motion.div>
                ) : isInCart ? (
                  <motion.div
                    key="incart"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                  >
                    <Check className="h-4 w-4" />
                    <span>In Cart</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add To Vault</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </motion.div>

      <ProductDialog
        product={product}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />

      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border border-black/5 dark:border-white/10">
          <DialogHeader>
            <DialogTitle>Remove Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this item from your cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 