"use client";

import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import LoadingScreen from "@/components/LoadingScreen";
import { fetchSneakerProducts, Product } from "@/lib/data";
import { ProductDialog } from "@/components/ProductDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, RotateCcw } from "lucide-react";

function HomeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const styleCode = searchParams.get('styleCode');
  const size = searchParams.get('size');
  const color = searchParams.get('color');
  
  // Filter states from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState<string>(searchParams.get("category") || "");
  const [brand, setBrand] = useState<string>(searchParams.get("brand") || "");
  const [filterSize, setFilterSize] = useState<string>(searchParams.get("filterSize") || "");
  const [filterColor, setFilterColor] = useState<string>(searchParams.get("filterColor") || "");
  const [priceMin, setPriceMin] = useState<string>(searchParams.get("price_min") || "");
  const [priceMax, setPriceMax] = useState<string>(searchParams.get("price_max") || "");
  const [isResetting, setIsResetting] = useState(false);

  // Update URL when filters change
  const updateURL = useCallback((newParams: Record<string, string>) => {
    if (isResetting) return; // Skip URL updates during reset
    
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname, isResetting]);

  // Debounced search update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL({ search: searchQuery });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, updateURL]);

  // Update URL for other filters
  useEffect(() => {
    updateURL({ category });
  }, [category, updateURL]);

  useEffect(() => {
    updateURL({ brand });
  }, [brand, updateURL]);

  useEffect(() => {
    updateURL({ filterSize });
  }, [filterSize, updateURL]);

  useEffect(() => {
    updateURL({ filterColor });
  }, [filterColor, updateURL]);

  useEffect(() => {
    updateURL({ price_min: priceMin });
  }, [priceMin, updateURL]);

  useEffect(() => {
    updateURL({ price_max: priceMax });
  }, [priceMax, updateURL]);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchSneakerProducts();
      setProducts(data);
      setIsLoading(false);

      // Extract unique values for filters
      const uniqueBrands = Array.from(new Set(data.map((p) => p.brand)));
      const uniqueCategories = Array.from(new Set(data.map((p) => p.category)));
      const uniqueSizes = Array.from(new Set(data.flatMap((p) => p.sizes)));
      const uniqueColors = Array.from(new Set(data.flatMap((p) => p.colors)));
      
      setBrands(uniqueBrands);
      setCategories(uniqueCategories);
      setSizes(uniqueSizes.sort());
      setColors(uniqueColors.sort());

      if (styleCode) {
        const product = data.find(p => p.styleCode === styleCode);
        if (product) {
          setSelectedProduct(product);
        }
      }
    };

    loadProducts();
  }, [styleCode]);

  // Reset all filters
  const resetFilters = () => {
    setIsResetting(true);
    
    // Clear all filter states
    setSearchQuery("");
    setCategory("");
    setBrand("");
    setFilterSize("");
    setFilterColor("");
    setPriceMin("");
    setPriceMax("");
    
    // Clear URL completely
    router.replace(pathname);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      setIsResetting(false);
    }, 100);
  };

  // Get active filters count
  const activeFiltersCount = [category, brand, filterSize, filterColor, priceMin, priceMax].filter(Boolean).length;

  // Remove specific filter
  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case "category":
        setCategory("");
        break;
      case "brand":
        setBrand("");
        break;
      case "filterSize":
        setFilterSize("");
        break;
      case "filterColor":
        setFilterColor("");
        break;
      case "price_min":
        setPriceMin("");
        break;
      case "price_max":
        setPriceMax("");
        break;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="container mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Discover Your Perfect
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Sneaker Collection
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore our curated selection of premium sneakers from top brands. 
            Find your perfect fit and style with our extensive collection.
          </p>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Products Section with Filters */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mb-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Our Collection</h2>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {category}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("category")} />
                </Badge>
              )}
              {brand && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Brand: {brand}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("brand")} />
                </Badge>
              )}
              {filterSize && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Size: {filterSize}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("filterSize")} />
                </Badge>
              )}
              {filterColor && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Color: {filterColor}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("filterColor")} />
                </Badge>
              )}
              {(priceMin || priceMax) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Price: €{priceMin || "0"} - €{priceMax || "∞"}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => { removeFilter("price_min"); removeFilter("price_max"); }} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Clear all
              </Button>
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-muted/30 rounded-lg border">
              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-2">Category</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategory("")}
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={category === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="font-semibold mb-2">Brand</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!brand ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBrand("")}
                  >
                    All
                  </Button>
                  {brands.map((b) => (
                    <Button
                      key={b}
                      variant={brand === b ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBrand(b)}
                    >
                      {b}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="font-semibold mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!filterSize ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterSize("")}
                  >
                    All
                  </Button>
                  {sizes.map((s) => (
                    <Button
                      key={s}
                      variant={filterSize === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterSize(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div>
                <h3 className="font-semibold mb-2">Color</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!filterColor ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterColor("")}
                  >
                    All
                  </Button>
                  {colors.map((c) => (
                    <Button
                      key={c}
                      variant={filterColor === c ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterColor(c)}
                    >
                      {c}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="md:col-span-2 lg:col-span-1">
                <h3 className="font-semibold mb-2">Price Range</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min €"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    placeholder="Max €"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <ProductGrid
          searchQuery={searchQuery}
          category={category}
          brand={brand}
          size={filterSize}
          color={filterColor}
          priceMin={priceMin ? parseFloat(priceMin) : undefined}
          priceMax={priceMax ? parseFloat(priceMax) : undefined}
        />
      </section>

      {/* Product Dialog */}
      {selectedProduct && (
        <ProductDialog
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          initialSize={size || ""}
          initialColor={color || ""}
        />
      )}
    </main>
  );
}

// Export default page wrapped in Suspense for useSearchParams
export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  );
} 