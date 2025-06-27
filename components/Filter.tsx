"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface FilterProps {
  onFilterChange: (category: string) => void;
}

export default function Filter({ onFilterChange }: FilterProps) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Running", "Basketball", "Training", "Casual"];

  return (
    <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <motion.button
          key={filter}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setActiveFilter(filter);
            onFilterChange(filter);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${
              activeFilter === filter
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
        >
          {filter}
        </motion.button>
      ))}
    </div>
  );
} 