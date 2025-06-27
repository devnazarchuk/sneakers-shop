"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/5 bg-background/40 backdrop-blur-3xl"
    >
      <div className="container mx-auto flex h-20 md:h-24 items-center justify-between px-4 md:px-8">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 md:gap-5 group">
          <div className="relative">
            <div className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-2xl bg-primary text-white shadow-[0_0_30px_rgba(var(--primary),0.3)] group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
              <Sparkles className="h-5 w-5 md:h-7 md:w-7" />
            </div>
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-opacity duration-700 pointer-events-none" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-2xl font-black uppercase tracking-tighter text-foreground leading-none">
              SNEAKERS<span className="hidden sm:inline"><span className="text-primary italic">.</span>VAULT</span>
            </span>
            <span className="hidden sm:block text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mt-1">Official Dealer</span>
          </div>
        </Link>

        {/* Search/Nav Section Hidden on mobile */}
        <nav className="hidden xl:flex items-center gap-12">
          {[
            { name: 'Home', href: '/' },
            { name: 'Shop', href: '/#collection' },
            { name: 'Collections', href: '/collections' },
            { name: 'About', href: '/about' }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group relative py-2"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-foreground transition-colors duration-300">{item.name}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary transition-all duration-500 group-hover:w-full group-hover:shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            </Link>
          ))}
        </nav>

        {/* Right Section Actions */}
        <div className="flex items-center gap-2 md:space-x-5">
          <ModeToggle />



          {/* Favorites */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/5 hover:border-primary/20 transition-all duration-300 group"
              >
                <Heart className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-hover:text-red-500 transition-colors" />
                {isFavoritesHydrated && favorites.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 md:h-6 md:w-6 items-center justify-center rounded-full bg-red-500 text-[8px] md:text-[10px] font-black text-white border-2 border-background shadow-lg shadow-red-500/20">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md lg:max-w-lg border-l border-black/5 dark:border-white/5 bg-background/95 backdrop-blur-3xl p-0">
              <div className="h-full flex flex-col">
                <SheetHeader className="p-8 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                  <SheetTitle className="text-3xl font-black uppercase italic text-foreground tracking-tighter">THE VAULT</SheetTitle>
                  <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Saved Items Collection</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  <Favorites />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Cart */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="premium"
                size="lg"
                className="relative h-10 md:h-14 px-4 md:px-8 rounded-xl md:rounded-2xl shadow-2xl shadow-primary/20 group"
              >
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 md:mr-4 group-hover:-rotate-12 transition-transform" />
                <span className="hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em]">View Cart</span>
                {isCartHydrated && items.length > 0 && (
                  <span className="absolute -top-1 -right-1 md:static md:ml-4 flex h-4 w-4 md:h-6 md:px-2.5 items-center justify-center rounded-full md:rounded-lg bg-red-500 md:bg-black/20 dark:md:bg-black/30 text-[8px] md:text-[10px] font-black md:border border-white/10 text-white shadow-lg md:shadow-none">
                    {items.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md lg:max-w-lg xl:max-w-xl border-l border-black/5 dark:border-white/5 bg-background/95 backdrop-blur-3xl p-0">
              <div className="h-full flex flex-col">
                <SheetHeader className="p-8 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                  <SheetTitle className="text-3xl font-black uppercase italic text-foreground tracking-tighter">YOUR CART</SheetTitle>
                  <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Secure Checkout Ready</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                  <Cart />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Menu */}
          <div className="xl:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/5 hover:border-primary/20 transition-all duration-300"
                >
                  <Menu className="h-6 w-6 text-muted-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-md border-r border-black/5 dark:border-white/5 bg-background/95 backdrop-blur-3xl p-0">
                <div className="h-full flex flex-col">
                  <SheetHeader className="p-8 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                    <SheetTitle className="text-3xl font-black uppercase italic text-foreground tracking-tighter">MENU</SheetTitle>
                    <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Navigation</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Navigation</p>
                      <div className="flex flex-col">
                        {[
                          { name: 'Home', href: '/', icon: Home },
                          { name: 'Shop', href: '/#collection' },
                          { name: 'Collections', href: '/collections' },
                          { name: 'About', href: '/about' }
                        ].map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="group relative py-4 flex items-center gap-4"
                          >
                            {item.icon && <item.icon className="h-6 w-6 text-primary" />}
                            <span className="text-2xl font-black uppercase tracking-tighter text-muted-foreground group-hover:text-foreground transition-colors duration-300">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 mt-auto border-t border-black/5 dark:border-white/5 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Account</p>
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center gap-6 p-6 rounded-3xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all duration-300"
                      >
                        <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                          <User className="h-7 w-7" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-black uppercase tracking-tight text-foreground">My Profile</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Manage Account</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Profile Desktop */}
          <Link href="/profile" className="hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/5 hover:border-primary/20 transition-all duration-300"
            >
              <User className="h-6 w-6 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}