"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/data";
import { fetchSneakerProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { Loader2, Search, Sparkles } from "lucide-react";
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
}

export function ProductGrid({
  searchQuery: searchQueryProp = "",
  category = "",
  brand: brandProp = "",
  size = "",
  color = "",
  priceMin,
  priceMax,
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
    
    const filtered = products.filter((product) => {
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
    
    setFilteredProducts(filtered);
    setPage(1); // Reset to first page on filter/search change
  }, [searchQuery, category, brand, size, color, priceMin, priceMax, products]);

  const paginated = filteredProducts.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filteredProducts.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-6">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-lg" />
        </div>
        <div className="text-xl font-semibold">
          Generating sneakers...
        </div>
        <div className="text-muted-foreground">
          Please wait while we load the latest collection
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Results count */}
      <div className="mb-6 text-sm text-muted-foreground">
        Showing {paginated.length} of {filteredProducts.length} products
        {(searchQuery || category || brand || size || color || priceMin || priceMax) && (
          <span className="ml-2">
            (filtered)
          </span>
        )}
      </div>
      
      {/* Products */}
      {paginated.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center text-center">
          <div className="space-y-4">
            <div className="relative">
              <Search className="h-16 w-16 text-muted-foreground mx-auto" />
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full blur-lg" />
            </div>
            <h3 className="text-xl font-semibold">
              No products found
            </h3>
            <p className="text-muted-foreground max-w-md">
              Try adjusting your search or filter to find what you&apos;re looking for.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={productGridStyles.container}>
          {paginated.map((product, index) => (
            <div key={product.id} style={productGridStyles.card}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg transition-all duration-200"
            onClick={() => setPage((p) => p + 1)}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
            Load more
            </div>
          </button>
        </div>
      )}
    </>
  );
} 