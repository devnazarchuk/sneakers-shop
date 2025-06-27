"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/data";
import { fetchSneakerProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Sparkles, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { productGridStyles } from "@/lib/utils/styles";
import { PAGE_SIZE } from "@/lib/utils/constants";

interface ProductGridProps {
  searchQuery?: string;
  category?: string;
  brand?: string;
  size?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  viewMode?: 'cozy' | 'compact';
  sortOption?: string;
}

export function ProductGrid({
  searchQuery: searchQueryProp = "",
  category = "",
  brand: brandProp = "",
  size = "",
  color = "",
  priceMin,
  priceMax,
  viewMode = 'cozy',
  sortOption = "newest",
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [brand, setBrand] = useState<string>(brandProp);
  const [searchQuery, setSearchQuery] = useState<string>(searchQueryProp);
  const [allBrands, setAllBrands] = useState<string[]>([]);

  // Update local state when props change (for URL sync)
  useEffect(() => {
    setBrand(brandProp);
  }, [brandProp]);

  useEffect(() => {
    setSearchQuery(searchQueryProp);
  }, [searchQueryProp]);

  useEffect(() => {
    setLoading(true);
    fetchSneakerProducts().then((data) => {
      setProducts(data);
      setLoading(false);
      setAllBrands(Array.from(new Set(data.map((p) => p.brand))));
    }).catch((error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!products.length) {
      return;
    }

    let filtered = products.filter((product) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = !category || product.category === category;

      // Brand filter
      const matchesBrand = !brand || product.brand === brand;

      // Size filter - check if any of the product's sizes match
      const matchesSize = !size || product.sizes.includes(size);

      // Color filter - check if any of the product's colors match
      const matchesColor = !color || product.colors.includes(color);

      // Price range filter
      const matchesPriceMin = !priceMin || product.price >= priceMin;
      const matchesPriceMax = !priceMax || product.price <= priceMax;

      return matchesSearch && matchesCategory && matchesBrand && matchesSize && matchesColor && matchesPriceMin && matchesPriceMax;
    });

    // Sorting Logic
    if (sortOption === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === "name_asc") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default / Newest (assuming ID tracks newness or just preserving order)
      filtered.sort((a, b) => b.id - a.id);
    }

    setFilteredProducts(filtered);
    setPage(1); // Reset to first page on filter/search change
  }, [searchQuery, category, brand, size, color, priceMin, priceMax, products, sortOption]);

  const paginated = filteredProducts.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filteredProducts.length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-6">
            <Skeleton className="aspect-[4/5] w-full rounded-[2.5rem]" />
            <div className="space-y-3 px-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center pt-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Results count */}
      <div className="mb-8 md:mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-transparent rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-foreground leading-none">THE COLLECTION</h2>
            <p className="text-[9px] md:text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] mt-1">
              {filteredProducts.length} Exclusive Pairs Available
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {paginated.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex h-[400px] md:h-[500px] items-center justify-center text-center rounded-[3rem] md:rounded-[4rem] bg-foreground/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 backdrop-blur-3xl premium-glass"
        >
          <div className="space-y-6 md:space-y-8 p-6 md:p-10">
            <div className="relative inline-block">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2rem] md:rounded-[2.5rem] bg-foreground/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-center shadow-2xl">
                <Search className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground/10 dark:text-white/10" />
              </div>
              <div className="absolute -inset-6 bg-primary/10 rounded-full blur-[80px] animate-pulse" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight text-foreground/80 dark:text-white/80">
                Vault Empty
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground/30 dark:text-white/30 max-w-xs mx-auto font-medium leading-relaxed">
                No grails found matching your criteria. Try adjusting your signature refinement settings.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()} className="h-12 md:h-14 px-6 md:px-8 rounded-2xl border-black/10 dark:border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-foreground dark:hover:bg-white hover:text-background dark:hover:text-black transition-all">
              <RotateCcw className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              Reset All
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className={`grid gap-6 md:gap-10 ${viewMode === 'compact' ? 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          <AnimatePresence mode="popLayout">
            {paginated.map((product, index) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
              >
                <ProductCard product={product} priority={index < 4} viewMode={viewMode} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {
        hasMore && (
          <div className="flex justify-center mt-24">
            <Button
              size="lg"
              variant="premium"
              className="h-20 px-16 rounded-[2rem] shadow-[0_20px_50px_rgba(var(--primary),0.3)] group relative overflow-hidden"
              onClick={() => setPage((p) => p + 1)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Sparkles className="h-5 w-5 mr-4 group-hover:rotate-12 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Unlock More Pairs</span>
            </Button>
          </div>
        )
      }
    </>
  );
}
