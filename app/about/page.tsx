"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl space-y-8"
      >
        <h1 className="text-4xl font-bold">About Us</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to Sneakers Shop, your premier destination for high-quality
          sneakers. We are passionate about bringing you the latest trends and
          timeless classics in footwear fashion.
        </p>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Our Mission</h2>
          <p className="text-muted-foreground">
            Our mission is to provide sneaker enthusiasts with a curated
            collection of premium footwear that combines style, comfort, and
            quality. We believe that the right pair of sneakers can elevate your
            style and boost your confidence.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Why Choose Us?</h2>
          <ul className="list-inside list-disc space-y-2 text-muted-foreground">
            <li>Curated selection of premium sneakers</li>
            <li>Authentic products from top brands</li>
            <li>Competitive prices and regular discounts</li>
            <li>Fast and reliable shipping</li>
            <li>Excellent customer service</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p className="text-muted-foreground">
            Have questions or need assistance? We&apos;re here to help! Reach out to us
            through our contact form or email us directly at{" "}
            <a
              href="mailto:support@sneakersshop.com"
              className="text-primary hover:underline"
            >
              support@sneakersshop.com
            </a>
            .
          </p>
        </div>
      </motion.div>
    </main>
  );
} 