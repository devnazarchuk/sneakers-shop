"use client";

import { motion } from "framer-motion";
import { useFavorites } from "@/context/favorites-context";
import { Card } from "@/components/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useFavorites();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Favorites</h1>
        {favorites.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFavorites}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center text-center">
          <div>
            <h3 className="text-lg font-semibold">No favorites yet</h3>
            <p className="text-sm text-muted-foreground">
              Add some products to your favorites to see them here.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {favorites.map((product) => (
            <Card key={product.id} {...product} />
          ))}
        </motion.div>
      )}
    </main>
  );
} 