"use client";

import { Product } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Check, Trash2, Sparkles, Eye } from "lucide-react";
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
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addToCart, removeFromCart } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isFavorite = favorites.some((fav) => fav.id === product.id);
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
      <div 
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted/30">
          <Image
            src={
              product.images && product.images.length > 0
                ? product.images[product.images.length - 1]
                : '/placeholder.jpg'
            }
            alt={product.title}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={product.id === 1}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Action buttons overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              size="icon"
              variant="secondary"
              className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setIsDialogOpen(true);
              }}
            >
              <Eye className="h-5 w-5 text-gray-700" />
            </Button>
          </div>

          {/* Top right corner badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {/* Favorite button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className={`h-10 w-10 rounded-full backdrop-blur-sm transition-all duration-200 ${
                isFavorite 
                  ? "bg-red-500/90 text-white hover:bg-red-600/90" 
                  : "bg-white/90 text-gray-700 hover:bg-white hover:text-red-500"
              }`}
            >
              <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
            </Button>

            {/* Cart status indicator */}
            {isInCart && (
              <div className="h-10 w-10 rounded-full bg-green-500/90 backdrop-blur-sm flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Brand badge */}
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 shadow-sm">
              {product.brand}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {product.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {product.category}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                €{product.price.toFixed(2)}
              </p>
              {isInCart && (
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  {cartItem.quantity} in cart
                </span>
              )}
            </div>

            {/* Action button */}
            <Button
              size="sm"
              onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
              disabled={isRemovingFromCart}
              variant={isInCart ? "destructive" : "default"}
              className={`relative overflow-hidden rounded-xl transition-all duration-200 ${
                isInCart 
                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600" 
                  : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              }`}
            >
              <AnimatePresence mode="wait">
                {isRemovingFromCart ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trash2 className="h-4 w-4" />
                  </div>
                ) : isInCart ? (
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden min-[701px]:inline">Remove</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      <ProductDialog
        product={product}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />

      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border border-white/10">
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