"use client";

export const dynamic = 'force-dynamic';

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
import { Search, Filter, X, RotateCcw, Sparkles, ShoppingCart, LayoutGrid, Grid2X2, StretchHorizontal, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { SneakerQuiz } from "@/components/SneakerQuiz";

function HomeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'cozy' | 'compact'>('compact');
  const [showQuiz, setShowQuiz] = useState(false);
  const [sortOption, setSortOption] = useState("newest");

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
  const [isToolbarCompact, setIsToolbarCompact] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll detection for compact toolbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // On mobile, consider toolbar compact if we've scrolled down a bit
      if (currentScrollY > 400) {
        if (currentScrollY > lastScrollY && !showFilters) {
          setIsToolbarCompact(true);
        } else {
          setIsToolbarCompact(false);
        }
      } else {
        setIsToolbarCompact(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, showFilters]);

  // Update URL when filters change
  const updateURL = useCallback((newParams: Record<string, string>) => {
    if (isResetting) return;

    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname, isResetting]);

  // Debounced search update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL({ search: searchQuery });
    }, 500); // 500ms delay for debouncing

    return () => clearTimeout(timeoutId);
  }, [searchQuery, updateURL]);

  // Update URL for other filters
  useEffect(() => {
    updateURL({ category, brand, filterSize, filterColor, price_min: priceMin, price_max: priceMax });
  }, [category, brand, filterSize, filterColor, priceMin, priceMax, updateURL]);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchSneakerProducts();
      setProducts(data);
      setIsLoading(false);

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

  // Handle hash scroll (Shop button)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#collection' && !isLoading) {
      const element = document.getElementById('collection');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [isLoading]);

  const resetFilters = () => {
    setIsResetting(true);
    setSearchQuery("");
    setCategory("");
    setBrand("");
    setFilterSize("");
    setFilterColor("");
    setPriceMin("");
    setPriceMax("");
    router.replace(pathname);
    setTimeout(() => setIsResetting(false), 100);
  };

  const activeFiltersCount = [category, brand, filterSize, filterColor, priceMin, priceMax].filter(Boolean).length;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px]"
          />
          <motion.div
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -60, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-12"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 backdrop-blur-md shadow-2xl">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 dark:text-white/70">Spring Collection 2026</span>
            </div>

            <h1 className="text-5xl md:text-[10rem] font-black tracking-tighter leading-[0.9] md:leading-[0.8] uppercase italic text-glow text-foreground">
              REDEFINE
              <br />
              <span className="bg-gradient-to-b from-foreground to-foreground/20 dark:from-white dark:to-white/20 bg-clip-text text-transparent">
                YOUR STYLE
              </span>
            </h1>

            <p className="text-sm md:text-xl text-muted-foreground/40 dark:text-white/40 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight px-4">
              A curated collection of the most extraordinary sneakers.
              <br className="hidden md:block" />
              Built for speed, styled for impact, crafted for the bold.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 pt-6 px-4">
              <Button
                size="lg"
                variant="premium"
                onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto h-16 md:h-20 px-8 md:px-12 rounded-3xl text-xs md:text-sm font-black uppercase tracking-widest shadow-primary/20 shadow-2xl"
              >
                Explore Shop
                <ShoppingCart className="ml-4 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setShowQuiz(true)}
                className="w-full sm:w-auto h-16 md:h-20 px-8 md:px-12 rounded-3xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 backdrop-blur-xl hover:bg-black/[0.05] dark:hover:bg-white/10 transition-all text-xs md:text-sm font-black uppercase tracking-widest"
              >
                Style Quiz
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Toolbar */}
      <div className={`sticky top-20 md:top-24 z-40 container mx-auto px-2 md:px-4 -mt-10 md:-mt-12 mb-12 md:mb-20 transition-all duration-500 ease-in-out ${isToolbarCompact ? 'opacity-0 -translate-y-10 pointer-events-none scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
        <motion.div
          layout
          className="premium-glass rounded-[1.5rem] md:rounded-[3rem] p-2 md:p-5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]"
        >
          <div className="flex flex-col xl:flex-row gap-2 md:gap-5">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 md:left-6 top-1/2 h-3.5 w-3.5 md:h-6 md:w-6 -translate-y-1/2 text-muted-foreground/20 dark:text-white/20 group-focus-within:text-primary transition-all duration-300" />
              <Input
                type="text"
                placeholder="SEARCH..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 md:pl-16 h-10 md:h-20 bg-foreground/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 focus:bg-foreground/[0.04] dark:focus:bg-white/[0.04] focus:border-primary/40 rounded-[1rem] md:rounded-[2rem] text-[10px] md:text-lg font-bold tracking-tight transition-all placeholder:text-muted-foreground/10 dark:placeholder:text-white/10 text-foreground"
              />
            </div>
            <div className="flex flex-row xl:flex-nowrap gap-2 md:gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 xl:flex-none h-10 md:h-20 px-3 md:px-10 rounded-[1rem] md:rounded-[2rem] border-black/5 dark:border-white/5 font-black uppercase tracking-widest transition-all text-[9px] md:text-sm ${showFilters ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-foreground/[0.05] dark:bg-white/5 shadow-inner'}`}
              >
                <Filter className="mr-1.5 md:mr-3 h-3 w-3 md:h-5 md:w-5" />
                Refine
                {activeFiltersCount > 0 && (
                  <span className="ml-1.5 md:ml-4 flex h-4 w-4 md:h-7 md:w-7 items-center justify-center rounded-full bg-primary text-[7px] md:text-[11px] text-white font-black shadow-lg shadow-primary/40">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {/* Sorting Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="flex-1 xl:flex-none h-10 md:h-20 px-3 md:px-8 rounded-[1rem] md:rounded-[2rem] bg-foreground/[0.05] dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[9px] md:text-sm"
                  >
                    <ArrowUpDown className="mr-1.5 md:mr-3 h-3 w-3 md:h-5 md:w-5" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl bg-background/80 backdrop-blur-xl border-black/5 dark:border-white/10">
                  <DropdownMenuItem onClick={() => setSortOption("newest")} className="rounded-xl font-bold cursor-pointer px-4 py-3">Newest Arrivals</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("price_asc")} className="rounded-xl font-bold cursor-pointer px-4 py-3">Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("price_desc")} className="rounded-xl font-bold cursor-pointer px-4 py-3">Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("name_asc")} className="rounded-xl font-bold cursor-pointer px-4 py-3">Name: A to Z</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={resetFilters}
                  className="h-10 w-10 md:h-20 md:w-20 rounded-[1rem] md:rounded-[2rem] bg-foreground/[0.05] dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-black/5 dark:border-white/5 transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5 md:h-6 md:w-6" />
                </Button>
              )}
            </div>




            {/* View Toggle */}
            <div className="hidden md:flex bg-foreground/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-1.5 rounded-[1.5rem] h-20 items-center">
              <Button
                variant={viewMode === 'cozy' ? 'premium' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('cozy')}
                className={`h-16 w-16 rounded-[1.2rem] transition-all ${viewMode === 'cozy' ? 'shadow-lg' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <LayoutGrid className="h-6 w-6" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'premium' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('compact')}
                className={`h-16 w-16 rounded-[1.2rem] transition-all ${viewMode === 'compact' ? 'shadow-lg' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <Grid2X2 className="h-6 w-6" />
              </Button>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-foreground/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 p-1 rounded-[1rem] h-12 items-center">
              <Button
                variant={viewMode === 'cozy' ? 'premium' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('cozy')}
                className={`h-10 w-10 rounded-xl transition-all ${viewMode === 'cozy' ? 'shadow-lg' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <StretchHorizontal className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'premium' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('compact')}
                className={`h-10 w-10 rounded-xl transition-all ${viewMode === 'compact' ? 'shadow-lg' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 p-6 md:p-12 mt-4 md:mt-6 rounded-[2rem] md:rounded-[2.5rem] bg-foreground/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5">
                  <div className="space-y-4 md:space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 dark:text-white/20">Category</h3>
                    <div className="flex flex-wrap gap-2 md:gap-2.5">
                      <Button
                        variant={!category ? "default" : "premium"}
                        size="sm"
                        onClick={() => setCategory("")}
                        className={`rounded-xl h-9 md:h-10 px-4 md:px-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${!category ? 'bg-primary' : 'opacity-40 hover:opacity-100 dark:hover:text-white'}`}
                      >
                        All
                      </Button>
                      {categories.map((cat) => (
                        <Button
                          key={cat}
                          variant={category === cat ? "default" : "premium"}
                          size="sm"
                          onClick={() => setCategory(cat)}
                          className={`rounded-xl h-9 md:h-10 px-4 md:px-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${category === cat ? 'bg-primary border-primary' : 'opacity-40 hover:opacity-100 dark:hover:text-white hover:border-black/20 dark:hover:border-white/20'}`}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 dark:text-white/20">Brand</h3>
                    <div className="flex flex-wrap gap-2 md:gap-2.5">
                      <Button
                        variant={!brand ? "default" : "premium"}
                        size="sm"
                        onClick={() => setBrand("")}
                        className={`rounded-xl h-9 md:h-10 px-4 md:px-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${!brand ? 'bg-primary' : 'opacity-40 hover:opacity-100 dark:hover:text-white'}`}
                      >
                        All
                      </Button>
                      {brands.map((b: string) => (
                        <Button
                          key={b}
                          variant={brand === b ? "default" : "premium"}
                          size="sm"
                          onClick={() => setBrand(b)}
                          className={`rounded-xl h-9 md:h-10 px-4 md:px-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${brand === b ? 'bg-primary border-primary' : 'opacity-40 hover:opacity-100 dark:hover:text-white hover:border-black/20 dark:hover:border-white/20'}`}
                        >
                          {b}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 dark:text-white/20">Size</h3>
                    <div className="flex flex-wrap gap-2 md:gap-2.5">
                      <Button
                        variant={!filterSize ? "default" : "premium"}
                        size="sm"
                        onClick={() => setFilterSize("")}
                        className={`rounded-xl h-9 md:h-10 px-3 md:px-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${!filterSize ? 'bg-primary' : 'opacity-40 hover:opacity-100 dark:hover:text-white'}`}
                      >
                        All
                      </Button>
                      {sizes.slice(0, 10).map((s: string) => (
                        <Button
                          key={s}
                          variant={filterSize === s ? "default" : "premium"}
                          size="sm"
                          onClick={() => setFilterSize(s)}
                          className={`rounded-xl h-9 md:h-10 w-10 md:w-12 p-0 text-[9px] md:text-[10px] font-black ${filterSize === s ? 'bg-primary border-primary' : 'opacity-40 hover:opacity-100 dark:hover:text-white hover:border-black/20 dark:hover:border-white/20'}`}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 dark:text-white/20">Price Range</h3>
                    <div className="flex gap-3 md:gap-4">
                      <div className="relative flex-1 group">
                        <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/10 dark:text-white/10 group-focus-within:text-primary transition-colors">€</span>
                        <Input
                          type="number"
                          placeholder="MIN"
                          value={priceMin}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceMin(e.target.value)}
                          className="pl-6 md:pl-8 h-12 md:h-14 bg-foreground/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-primary/30 transition-all text-foreground"
                        />
                      </div>
                      <div className="relative flex-1 group">
                        <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/10 dark:text-white/10 group-focus-within:text-primary transition-colors">€</span>
                        <Input
                          type="number"
                          placeholder="MAX"
                          value={priceMax}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceMax(e.target.value)}
                          className="pl-6 md:pl-8 h-12 md:h-14 bg-foreground/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-primary/30 transition-all text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Products Grid Section */}
      <section id="collection" className="container mx-auto px-4 pb-40">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <ProductGrid
            searchQuery={searchQuery}
            category={category}
            brand={brand}
            size={filterSize}
            color={filterColor}
            priceMin={priceMin ? parseFloat(priceMin) : undefined}
            priceMax={priceMax ? parseFloat(priceMax) : undefined}
            viewMode={viewMode}
            sortOption={sortOption}
          />
        </motion.div>
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

      {/* Sneaker Quiz */}
      <SneakerQuiz
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        products={products}
      />
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