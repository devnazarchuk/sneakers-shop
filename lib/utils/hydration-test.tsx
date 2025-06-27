"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";

/**
 * Test component to verify hydration is working correctly
 * This component can be temporarily added to any page to test hydration
 */
export function HydrationTest() {
  const { isHydrated: isCartHydrated, items } = useCart();
  const { isHydrated: isFavoritesHydrated, favorites } = useFavorites();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 text-xs z-50">
      <div>Mounted: {mounted ? "✅" : "❌"}</div>
      <div>Cart Hydrated: {isCartHydrated ? "✅" : "❌"}</div>
      <div>Favorites Hydrated: {isFavoritesHydrated ? "✅" : "❌"}</div>
      <div>Cart Items: {items.length}</div>
      <div>Favorites: {favorites.length}</div>
    </div>
  );
} 