"use client";

import Link from "next/link";
import { ShoppingCart, Heart, Menu, User, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Cart } from "@/components/Cart";
import { Favorites } from "@/components/Favorites";
import { motion } from "framer-motion";

export function Header() {
  const { items, isHydrated: isCartHydrated } = useCart();
  const { favorites, isHydrated: isFavoritesHydrated } = useFavorites();

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <motion.div 
          className="flex items-center space-x-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
        <div className="mr-4 hidden md:flex">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Sparkles className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent cursor-pointer">
              Sneakers Shop
            </span>
          </Link>
        </div>
          
          {/* Mobile Home Icon */}
          <div className="flex md:hidden">
            <Link href="/" className="flex items-center p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <Home className="h-6 w-6 text-primary" />
            <span className="sr-only">Home</span>
          </Link>
        </div>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="mr-2"
          >
            <ModeToggle />
          </motion.div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {/* Cart */}
            <Sheet>
              <SheetTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                <Button
                  variant="ghost"
                  size="icon"
                    className="relative h-12 w-12 rounded-xl hover:bg-accent/50 transition-all duration-200"
                  aria-label="Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isCartHydrated && items.length > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-lg"
                      >
                      {items.length}
                      </motion.span>
                  )}
                </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg border-l border-white/10 bg-background/95 backdrop-blur-xl">
                <SheetHeader>
                  <SheetTitle>
                    {/* Shopping Cart */}
                    </SheetTitle>
                  <SheetDescription>
                    {/* Review and manage your cart items */}
                  </SheetDescription>
                </SheetHeader>
                <Cart />
              </SheetContent>
            </Sheet>

            {/* Favorites */}
            <Sheet>
              <SheetTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                <Button
                  variant="ghost"
                  size="icon"
                    className="relative h-12 w-12 rounded-xl hover:bg-accent/50 transition-all duration-200"
                  aria-label="Favorites"
                >
                  <Heart className="h-5 w-5" />
                  {isFavoritesHydrated && favorites.length > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[10px] font-bold text-white shadow-lg"
                      >
                      {favorites.length}
                      </motion.span>
                  )}
                </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg border-l border-white/10 bg-background/95 backdrop-blur-xl">
                <SheetHeader>
                  <SheetTitle>
                    {/* Favorites */}
                    </SheetTitle>
                  <SheetDescription>
                    {/* Your saved favorite items */}
                  </SheetDescription>
                </SheetHeader>
                <Favorites />
              </SheetContent>
            </Sheet>

            {/* Profile */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                  className="relative h-12 w-12 rounded-xl hover:bg-accent/50 transition-all duration-200"
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
            </motion.div>
          </nav>
        </div>
      </div>
    </motion.header>
  );
} 