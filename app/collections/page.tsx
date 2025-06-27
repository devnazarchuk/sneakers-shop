"use client";

export const dynamic = 'force-dynamic';

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Layers, History, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const collections = [
    {
        title: "The OG Classics",
        description: "The silhouettes that started it all. Undisputed legends of concrete and court.",
        icon: History,
        color: "from-orange-500/20 to-transparent",
        href: "/#collection",
        count: 12
    },
    {
        title: "Performance Lab",
        description: "Cutting-edge technology meets elite design. Built for those who never slow down.",
        icon: Zap,
        color: "from-blue-500/20 to-transparent",
        href: "/#collection",
        count: 8
    },
    {
        title: "Future Relics",
        description: "A curation of modern masterpieces and experimental collaborations.",
        icon: Sparkles,
        color: "from-primary/20 to-transparent",
        href: "/#collection",
        count: 15
    },
    {
        title: "Limited Drops",
        description: "Exclusive releases and high-profile collaborations. Secure the rare.",
        icon: Layers,
        color: "from-purple-500/20 to-transparent",
        href: "/#collection",
        count: 6
    }
];

export default function CollectionsPage() {
    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 backdrop-blur-md">
                            <Layers className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Curated Series</span>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                            THE <span className="text-primary text-glow-primary">COLLECTIONS</span>
                        </h1>

                        <p className="text-sm md:text-lg text-muted-foreground/40 dark:text-white/40 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
                            A deep dive into the vault&apos;s most prestigious series.
                            Each collection is a testament to heritage, innovation, and style.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Grid Section */}
            <section className="container mx-auto px-4 pb-40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {collections.map((collection, index) => (
                        <motion.div
                            key={collection.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={collection.href} className="group block h-full">
                                <div className={`relative h-full p-8 md:p-12 rounded-[3rem] border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden transition-all duration-500 hover:border-primary/20 flex flex-col justify-between min-h-[400px]`}>
                                    {/* Decorative background gradient */}
                                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${collection.color} blur-[100px] group-hover:opacity-100 opacity-50 transition-opacity duration-700`} />

                                    <div className="space-y-6 relative z-10">
                                        <div className="h-16 w-16 rounded-[1.5rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                            <collection.icon className="h-8 w-8" />
                                        </div>

                                        <div>
                                            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{collection.title}</h3>
                                            <p className="text-sm text-muted-foreground/50 dark:text-white/40 leading-relaxed font-medium">
                                                {collection.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-12 relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Volume</span>
                                            <span className="text-xl font-bold">{collection.count} Grails</span>
                                        </div>

                                        <div className="h-14 w-14 rounded-full border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                            <ArrowRight className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-32 text-center p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-black/5 dark:border-white/5 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] -z-10" />
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-8 leading-none">
                        LOOKING FOR SOMETHING <br /> SPECIFIC?
                    </h2>
                    <Link href="/#collection">
                        <Button size="lg" variant="premium" className="h-20 px-12 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
                            Explore All Sneakers
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </main>
    );
}
