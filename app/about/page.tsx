"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Globe, Zap, Users, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const missions = [
  {
    title: "Uncompromising Quality",
    description: "Every pair in our vault undergoes a rigorous multi-point inspection process by our in-house specialists.",
    icon: ShieldCheck
  },
  {
    title: "Global Reach",
    description: "Connecting the global sneaker community with localized service and priority logistics.",
    icon: Globe
  },
  {
    title: "Innovation First",
    description: "Bridging the gap between traditional retail and the digital future of collectible footwear.",
    icon: Zap
  }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden border-b border-black/5 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Our Legacy</span>
              </div>

              <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85]">
                DEFINING THE <br />
                <span className="text-primary text-glow-primary">CULTURE.</span>
              </h1>

              <p className="text-lg md:text-2xl text-muted-foreground/60 dark:text-white/40 font-medium leading-relaxed tracking-tight max-w-2xl">
                Sneakers Vault is more than a store. It&apos;s a curated ecosystem for enthusiasts,
                investors, and the fashion-forward.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 bg-black/[0.02] dark:bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[4rem] overflow-hidden border border-black/5 dark:border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-3xl group">
                <div className="text-center p-12">
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4">THE MISSION</h3>
                  <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6" />
                  <p className="text-muted-foreground font-medium">To provide unprecedented access to the world&apos;s rarest footwear through a secure, premium experience.</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-12">
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Core Values</p>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">BUILT ON TRUST.</h2>
              </div>

              <div className="grid gap-8">
                {missions.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-6 p-8 rounded-[2.5rem] bg-background/50 border border-black/5 dark:border-white/5 hover:border-primary/20 transition-all group"
                  >
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-black uppercase italic tracking-tight">{item.title}</h4>
                      <p className="text-sm text-muted-foreground/60 leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-40 bg-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto space-y-12"
          >
            <div className="flex justify-center gap-4">
              <div className="h-20 w-20 rounded-[2rem] bg-foreground/5 dark:bg-white/5 flex items-center justify-center">
                <Heart className="h-10 w-10 text-red-500" />
              </div>
              <div className="h-20 w-20 rounded-[2rem] bg-foreground/5 dark:bg-white/5 flex items-center justify-center">
                <Users className="h-10 w-10 text-primary" />
              </div>
            </div>

            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9]">
              JOIN THE <br />
              <span className="text-primary">ELITE.</span>
            </h2>

            <p className="text-lg md:text-2xl text-muted-foreground/40 font-medium leading-relaxed max-w-2xl mx-auto">
              Over 50,000 collectors worldwide trust Sneakers Vault for their most valuable acquisitions.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-12">
              <Link href="/#collection">
                <Button size="lg" variant="premium" className="h-20 px-12 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em]">
                  Start Your Collection
                </Button>
              </Link>
              <Button size="lg" variant="ghost" className="h-20 px-12 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] border border-black/5 dark:border-white/10">
                Read Our Blog
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}