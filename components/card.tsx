"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ProductDialog } from "./ProductDialog";
import { useState } from "react";

interface CardProps extends Product {
  loading?: boolean;
}

export function Card({ loading, ...product }: CardProps) {
  const { addToCart, isInCart } = useCart();
  const { addToFavorites, isInFavorites } = useFavorites();
  const [showDialog, setShowDialog] = useState(false);

  if (loading) {
    return (
      <div className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all hover:shadow-lg">
        <div className="aspect-square animate-pulse bg-muted" />
        <div className="p-4">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="mt-4 flex items-center justify-between">
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all hover:shadow-lg"
      >
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images && product.images.length > 0 ? product.images[product.images.length - 1] : '/placeholder.jpg'}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute right-2 top-2 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/90 text-black hover:bg-white hover:text-black"
              onClick={() => addToFavorites(product)}
            >
              <Heart
                className={`h-4 w-4 ${
                  isInFavorites(product.id) ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-1 text-sm text-muted-foreground">
            {product.brand}
          </div>
          <h3 className="mb-2 font-medium">{product.title}</h3>
          <div className="flex items-center justify-between">
            <div className="font-semibold">€{product.price}</div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${
                isInCart(product.id, '', '')
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-white/90 text-black hover:bg-white"
              }`}
              onClick={() => setShowDialog(true)}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
      <ProductDialog
        product={product}
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </>
  );
} 