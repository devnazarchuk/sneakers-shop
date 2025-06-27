"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
// Optionally import Clerk for user ID
// import { useUser } from "@clerk/nextjs";
import type { Product } from "@/lib/data";
import type { CartItem, CartContextType } from "@/lib/types/cart";
import { createCartItemId } from "@/lib/types/cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // const { user } = useUser();
  // const userId = user?.id || "guest";
  const userId = "guest"; // Replace with Clerk user ID if available
  const storageKey = `cart_${userId}`;

  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize cart from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    console.log('Cart context: Loading from localStorage:', { storageKey, stored });
    if (stored) {
      try {
        const parsedItems = JSON.parse(stored);
        console.log('Cart context: Parsed items:', parsedItems);
        setItems(parsedItems);
      } catch (error) {
        console.error('Failed to parse cart data:', error);
        setItems([]);
    }
    } else {
      console.log('Cart context: No stored cart data found');
      setItems([]);
    }
    setIsHydrated(true);
  }, [storageKey]);

  // Listen for clearCart custom event
  useEffect(() => {
    const handleClearCart = () => {
      console.log('Cart context: Received clearCart event');
      setItems([]);
    };

    const handleCartUpdate = () => {
      console.log('Cart context: Received cartUpdate event');
      // Reload cart from localStorage
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsedItems = JSON.parse(stored);
          console.log('Cart context: Updated from localStorage:', parsedItems);
          setItems(parsedItems);
        } catch (error) {
          console.error('Failed to parse cart data:', error);
          setItems([]);
        }
      } else {
        console.log('Cart context: No stored data found during update');
        setItems([]);
      }
    };

    const handleCartUpdated = (event: CustomEvent) => {
      console.log('Cart context: Received cartUpdated event with data:', event.detail);
      if (event.detail?.items) {
        setItems(event.detail.items);
      }
    };

    window.addEventListener('clearCart', handleClearCart);
    window.addEventListener('cartUpdate', handleCartUpdate);
    window.addEventListener('cartUpdated', handleCartUpdated as EventListener);
    
    return () => {
      window.removeEventListener('clearCart', handleClearCart);
      window.removeEventListener('cartUpdate', handleCartUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdated as EventListener);
    };
  }, [storageKey]);

  // Save cart to localStorage
  useEffect(() => {
    if (isHydrated) {
      console.log('Cart context: Saving to localStorage:', { items, storageKey });
    localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, storageKey, isHydrated]);

  const addToCart = useCallback((product: Product, selectedSize: string, selectedColor: string, quantity: number = 1) => {
    console.log('Adding to cart:', { product: product.id, selectedSize, selectedColor, quantity });
    
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && 
                item.selectedSize === selectedSize && 
                item.selectedColor === selectedColor
      );

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        console.log('Updated existing item quantity:', updatedItems[existingItemIndex]);
        return updatedItems;
      } else {
        // Add new item
        const newItem = {
          product,
          quantity,
          selectedSize,
          selectedColor,
        };
        console.log('Added new item to cart:', newItem);
        return [...prevItems, newItem];
      }
    });
  }, []);

  const removeFromCart = (productId: number, selectedSize: string, selectedColor: string) => {
    console.log('Cart context: Removing from cart:', { productId, selectedSize, selectedColor });
    setItems((prev) => {
      const itemId = createCartItemId({ productId, selectedSize, selectedColor });
      const filtered = prev.filter((item) => 
        createCartItemId({ productId: item.product.id, selectedSize: item.selectedSize, selectedColor: item.selectedColor }) !== itemId
      );
      console.log('Cart context: Removed item, new count:', filtered.length);
      return filtered;
    });
  };

  const updateQuantity = (productId: number, selectedSize: string, selectedColor: string, quantity: number) => {
    console.log('Cart context: Updating quantity:', { productId, selectedSize, selectedColor, quantity });
    setItems((prev) => {
      const itemId = createCartItemId({ productId, selectedSize, selectedColor });
      const updated = prev.map((item) => {
        const currentItemId = createCartItemId({ 
          productId: item.product.id, 
          selectedSize: item.selectedSize, 
          selectedColor: item.selectedColor 
        });
        if (currentItemId === itemId) {
          console.log('Cart context: Updated item quantity:', { ...item, quantity });
          return { ...item, quantity };
        }
        return item;
      });
      return updated;
    });
  };

  const clearCart = () => {
    console.log('Cart context: Clearing cart');
    setItems([]);
  };

  const isInCart = (productId: number, selectedSize: string, selectedColor: string) => {
    const itemId = createCartItemId({ productId, selectedSize, selectedColor });
    return items.some((item) => 
      createCartItemId({ 
        productId: item.product.id, 
        selectedSize: item.selectedSize, 
        selectedColor: item.selectedColor 
      }) === itemId
    );
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isInCart, total, isHydrated }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
} 