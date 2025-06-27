"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Check, Sparkles, Eye } from "lucide-react";
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
  const [isFavorite, setIsFavorite] = useState(favorites.some((fav) => fav.id === product?.id));
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
      <DialogContent className="sm:max-w-[700px] p-0 bg-background/95 backdrop-blur-xl border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative aspect-square flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
            {product.images.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/20"
                  onClick={e => { e.stopPropagation(); setCurrentImage((currentImage - 1 + product.images.length) % product.images.length); }}
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                >
                  <span className="text-gray-700 font-bold">‹</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/20"
                  onClick={e => { e.stopPropagation(); setCurrentImage((currentImage + 1) % product.images.length); }}
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                >
                  <span className="text-gray-700 font-bold">›</span>
                </motion.button>
              </>
            )}
            <Image
              src={product.images && product.images.length > 0 ? product.images[currentImage] : '/placeholder.jpg'}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
            
            {/* Image indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((img, idx) => (
                <motion.span
                  key={img}
                  className={`inline-block w-3 h-3 rounded-full transition-all duration-200 ${
                    idx === currentImage ? 'bg-primary shadow-lg' : 'bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            {/* Favorite button overlay (десктоп) */}
            <motion.div
              className="absolute top-3 right-3 hidden md:block"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className={`h-12 w-12 rounded-full backdrop-blur-sm transition-all duration-200 ${
                  isFavorite 
                    ? "bg-red-500/90 text-white hover:bg-red-600/90" 
                    : "bg-white/90 text-gray-700 hover:bg-white hover:text-red-500"
                }`}
              >
                <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
              </Button>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="flex items-center justify-between md:block">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {product.title}
                </DialogTitle>
                {/* Favorite button (мобілка) */}
                <motion.div
                  className="ml-2 md:hidden"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
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
                    <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
                  </Button>
                </motion.div>
              </div>
              <DialogDescription className="text-muted-foreground font-medium">
                {product.brand} • {product.category}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Size Selection */}
              <div>
                <h4 className="font-semibold mb-3 text-lg">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <motion.div
                      key={size}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedSize(size);
                        localStorage.setItem(`lastSelection-${product.styleCode}`, JSON.stringify({ size: size, color: selectedColor }));
                      }}
                        className={`rounded-xl transition-all duration-200 ${
                          selectedSize === size 
                            ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                            : "border-white/20 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                        }`}
                    >
                      {size}
                    </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h4 className="font-semibold mb-3 text-lg">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <motion.div
                      key={color}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                      variant={selectedColor === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedColor(color);
                        localStorage.setItem(`lastSelection-${product.styleCode}`, JSON.stringify({ size: selectedSize, color: color }));
                      }}
                        className={`rounded-xl transition-all duration-200 ${
                          selectedColor === color 
                            ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                            : "border-white/20 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                        }`}
                    >
                      {color}
                    </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.p 
                    className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    €{product.price.toFixed(2)}
                  </motion.p>
                  {isInCart && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium"
                    >
                      {cartItem.quantity} in cart
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {cartEditMode ? (
                <div className="flex gap-3">
                  {/* Update existing item */}
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                  <Button
                      className="w-full gap-2 relative h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onClick={handleAddOrUpdateCart}
                    disabled={isAddingToCart}
                  >
                    <AnimatePresence mode="wait">
                      {isAddingToCart ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Check className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="update"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingCart className="h-5 w-5" />
                          Update Item
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                  </motion.div>
                  
                  {/* Add as new item */}
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                  <Button
                      className="w-full gap-2 h-12 rounded-xl border-white/20 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                    variant="outline"
                    onClick={async () => {
                      if (!selectedSize || !selectedColor) {
                        toast.error("Please select size and color");
                        return;
                      }
                      setIsAddingToCart(true);
                      addToCart(product, selectedSize, selectedColor, 1);
                      toast.success("Added as new item");
                      setTimeout(() => {
                        setIsAddingToCart(false);
                        onClose();
                      }, 1000);
                    }}
                    disabled={isAddingToCart}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add as New
                  </Button>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                <Button
                    className="w-full gap-2 relative h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  onClick={handleAddOrUpdateCart}
                  disabled={isAddingToCart}
                >
                  <AnimatePresence mode="wait">
                    {isAddingToCart ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Check className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cart"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        {isInCart ? "In Cart" : "Add to Cart"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
                </motion.div>
              )}
              
              {/* Description */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 