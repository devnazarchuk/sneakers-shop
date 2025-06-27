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
    <div className={`flex h-full flex-col${favorites.length === 0 ? ' overflow-hidden' : ''}`}>
      <div className={`flex-1 ${favorites.length === 0 ? '' : 'overflow-y-auto'} p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto w-full`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
          <div className="relative">
            <Heart className="h-8 w-8 text-pink-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-rose-500/10 rounded-full blur-sm" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            Favorites
          </h2>
            {/* {favorites.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {favorites.length}
              </Badge>
            )} */}
          </div>
          
          {favorites.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllFavorites}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
        
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div 
              className="w-24 h-24 mb-6 text-muted-foreground relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Heart className="w-full h-full" />
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/10 to-rose-500/5 rounded-full blur-lg" />
            </motion.div>
            <motion.h3 
              className="text-xl font-semibold mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              No favorites yet
            </motion.h3>
            <motion.p 
              className="text-muted-foreground max-w-md mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Add some items to your favorites to see them here
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <SheetClose asChild>
                <Button asChild className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                  <Link href="/catalog">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Browse Products
                  </Link>
                </Button>
              </SheetClose>
            </motion.div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:gap-8"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(260px, 30vw, 380px), 1fr))',
            }}
          >
            <AnimatePresence mode="popLayout">
              {favorites.map((product) => {
                const cartItem = items.find((item) => String(item.product.id) === String(product.id));
                const isInCart = !!cartItem;

                return (
                  <motion.div
                    key={String(product.id)}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("button")) return;
                      setSelectedProduct(product);
                      setIsDialogOpen(true);
                    }}
                  >
                    {/* Background gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30">
                      <Image
                        src={product.images && product.images.length > 0 ? product.images[product.images.length - 1] : '/placeholder.jpg'}
                        alt={product.title}
                        fill
                        className="object-cover transition-all duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Action buttons overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-5 w-5 text-gray-700" />
                          </Button>
                        </motion.div>
                    </div>

                      {/* Top right corner badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {/* Favorite button */}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFromFavorites(product.id)}
                            className="h-10 w-10 rounded-full bg-pink-500/90 text-white hover:bg-pink-600/90 backdrop-blur-sm"
                        >
                            <Heart className="h-4 w-4" fill="currentColor" />
                        </Button>
                        </motion.div>

                        {/* Cart status indicator */}
                        {isInCart && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-10 w-10 rounded-full bg-green-500/90 backdrop-blur-sm flex items-center justify-center"
                          >
                            <Check className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </div>

                      {/* Brand badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 shadow-sm">
                          {product.brand}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-pink-500 transition-colors duration-200">
                          {product.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.category}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <motion.p 
                            className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            €{product.price.toFixed(2)}
                          </motion.p>
                          {isInCart && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"
                            >
                              {cartItem.quantity} in cart
                            </motion.span>
                          )}
                        </div>
                        
                        <div className="relative">
                          <AnimatePresence>
                            {showSparkles === product.id && (
                              <>
                                <Sparkle x={-10} y={-10} delay={0} />
                                <Sparkle x={10} y={-10} delay={0.1} />
                                <Sparkle x={-10} y={10} delay={0.2} />
                                <Sparkle x={10} y={10} delay={0.3} />
                              </>
                            )}
                          </AnimatePresence>
                          <motion.div
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <Button
                              size="icon"
                              onClick={() => isInCart ? handleRemoveFromCart(product.id) : handleAddToCart(product.id)}
                              disabled={!!isAddingToCart || !!isRemovingFromCart}
                              variant={isInCart ? "destructive" : "default"}
                              className={`relative overflow-hidden h-10 w-10 rounded-xl transition-all duration-200 ${
                                isInCart 
                                  ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600" 
                                  : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                              }`}
                            >
                              <AnimatePresence mode="wait">
                                {isAddingToCart === product.id ? (
                                  <motion.div
                                    key="check"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 180 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                  >
                                    <Check className="h-4 w-4" />
                                  </motion.div>
                                ) : isRemovingFromCart === product.id ? (
                                  <motion.div
                                    key="removing"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 180 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="cart"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    className="flex items-center justify-center"
                                  >
                                    {isInCart ? (
                                      <Trash2 className="h-4 w-4" />
                                    ) : (
                                      <ShoppingCart className="h-4 w-4" />
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Button>
                          </motion.div>
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
      <ProductDialog
  product={selectedProduct}
  isOpen={isDialogOpen}
  onClose={() => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  }}
  aria-label="Product details dialog"
/>
    </div>
  );
} 