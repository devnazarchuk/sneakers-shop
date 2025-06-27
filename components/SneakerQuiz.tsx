import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Check, X, RefreshCw } from "lucide-react";
import { Product } from "@/lib/data";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { toast } from "sonner";

interface SneakerQuizProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
}

type Question = {
    id: string;
    question: string;
    options: { label: string; value: string; icon?: React.ReactNode }[];
};

const QUESTIONS: Question[] = [
    {
        id: "vibe",
        question: "What's your vibe today?",
        options: [
            { label: "Streetwear", value: "streetwear" },
            { label: "Sporty", value: "sport" },
            { label: "Casual", value: "casual" },
            { label: "High Fashion", value: "luxury" },
        ],
    },
    {
        id: "color",
        question: "Pick a color palette",
        options: [
            { label: "Neutral / Clean", value: "neutral" },
            { label: "Dark / Stealth", value: "dark" },
            { label: "Bold / Colorful", value: "colorful" },
        ],
    },
    {
        id: "price",
        question: "What's the budget?",
        options: [
            { label: "Under €120", value: "low" },
            { label: "€120 - €180", value: "mid" },
            { label: "No Limit", value: "high" },
        ],
    },
];

export function SneakerQuiz({ isOpen, onClose, products }: SneakerQuizProps) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<Product | null>(null);
    const [isanalyzing, setIsAnalyzing] = useState(false);
    const { addToCart } = useCart();

    const handleAnswer = (value: string) => {
        const currentQuestion = QUESTIONS[step];
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));

        if (step < QUESTIONS.length - 1) {
            setStep((prev) => prev + 1);
        } else {
            findMatch({ ...answers, [currentQuestion.id]: value });
        }
    };

    const findMatch = (finalAnswers: Record<string, string>) => {
        setIsAnalyzing(true);

        // Simulate thinking time for effect
        setTimeout(() => {
            // Simple scoring algorithm based on answers
            // This is a mock implementation, ideally you'd have tagging on products
            // For now, we'll randomize a bit based on price to make it feel dynamic but valid

            let filtered = products;

            // Filter by price first (most objective)
            if (finalAnswers.price === "low") {
                filtered = filtered.filter(p => p.price < 120);
            } else if (finalAnswers.price === "mid") {
                filtered = filtered.filter(p => p.price >= 120 && p.price <= 180);
            }
            // "high" keeps all

            // If filtering emptied the list, fallback to all products
            if (filtered.length === 0) filtered = products;

            // Select a random match from the filtered list
            const randomMatch = filtered[Math.floor(Math.random() * filtered.length)];
            setResult(randomMatch);
            setIsAnalyzing(false);
        }, 1500);
    };

    const resetQuiz = () => {
        setStep(0);
        setAnswers({});
        setResult(null);
        setIsAnalyzing(false);
    };

    const handleAddToCart = () => {
        if (result) {
            addToCart(result, "EU 42", "Default"); // Default valus for potential quick add
            toast.success("Added to cart!");
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background/80 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[2.5rem] shadow-2xl">
                <div className="relative min-h-[500px] flex flex-col p-8">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Style Finder</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <AnimatePresence mode="wait">
                        {isanalyzing ? (
                            <motion.div
                                key="analyzing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
                                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Analyzing Your Vibe...</h3>
                            </motion.div>
                        ) : result ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 flex flex-col"
                            >
                                <div className="text-center mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block">Perfect Match Found</span>
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{result.title}</h2>
                                </div>

                                <div className="relative aspect-square w-full mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-black/5 to-transparent dark:from-white/5 border border-black/5 dark:border-white/5">
                                    <Image
                                        src={result.images[0]}
                                        alt={result.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="mt-auto space-y-3">
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-sm font-bold text-muted-foreground">{result.brand}</span>
                                        <span className="text-xl font-black">€{result.price}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={handleAddToCart} variant="premium" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs">
                                            Secure Pair
                                        </Button>
                                        <Button onClick={resetQuiz} variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-black/10 dark:border-white/10">
                                            <RefreshCw className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 flex flex-col"
                            >
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2 leading-none">
                                    {QUESTIONS[step].question}
                                </h2>
                                <div className="h-1 w-12 bg-primary rounded-full mb-8" />

                                <div className="flex flex-col gap-3">
                                    {QUESTIONS[step].options.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleAnswer(option.value)}
                                            className="group relative flex items-center justify-between p-5 rounded-2xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-[0.98] text-left"
                                        >
                                            <span className="font-bold uppercase tracking-wider text-sm">{option.label}</span>
                                            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-auto flex justify-center gap-2">
                                    {QUESTIONS.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? "w-8 bg-primary" : "w-1.5 bg-primary/20"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </DialogContent>
        </Dialog>
    );
}
