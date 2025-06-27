"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
// Optionally import Clerk for user ID
// import { useUser } from "@clerk/nextjs";
import type { Product } from "@/lib/data";

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: number) => void;
  isInFavorites: (productId: number) => boolean;
  clearFavorites: () => void;
  isHydrated: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // const { user } = useUser();
  // const userId = user?.id || "guest";
  const userId = "guest"; // Replace with Clerk user ID if available
  const storageKey = `favorites_${userId}`;

  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize favorites from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse favorites data:', error);
        setFavorites([]);
    }
    }
    setIsHydrated(true);
  }, [storageKey]);

  // Save favorites to localStorage
  useEffect(() => {
    if (isHydrated) {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
    }
  }, [favorites, storageKey, isHydrated]);

  const addToFavorites = (product: Product) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromFavorites = (productId: number) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== productId));
  };

  const isInFavorites = (productId: number) => favorites.some((fav) => fav.id === productId);

  const clearFavorites = () => setFavorites([]);

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isInFavorites, clearFavorites, isHydrated }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
} 