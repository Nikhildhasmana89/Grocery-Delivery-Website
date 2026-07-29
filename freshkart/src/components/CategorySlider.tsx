"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Apple,
  Milk,
  Croissant,
  Fish,
  CupSoda,
  Wheat,
  Snowflake,
  HeartPulse,
  Baby,
  Home,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", name: "All Items", icon: Sparkles, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { id: "fruits & vegetables", name: "Fruits & Veggies", icon: Apple, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: "dairy & eggs", name: "Dairy & Eggs", icon: Milk, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { id: "bakery & bread", name: "Bakery & Bread", icon: Croissant, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { id: "meat & seafood", name: "Meat & Seafood", icon: Fish, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { id: "snacks & beverages", name: "Snacks & Drinks", icon: CupSoda, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { id: "pantry & staples", name: "Pantry & Staples", icon: Wheat, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { id: "frozen foods", name: "Frozen Foods", icon: Snowflake, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  { id: "health & wellness", name: "Health & Care", icon: HeartPulse, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { id: "baby care", name: "Baby Care", icon: Baby, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { id: "household essentials", name: "Household", icon: Home, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
];

interface CategorySliderProps {
  onSelectCategory?: (categoryId: string) => void;
  selectedCategory?: string;
}

export default function CategorySlide({
  onSelectCategory,
  selectedCategory = "all",
}: CategorySliderProps) {
  const [active, setActive] = useState(selectedCategory);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleSelect = (id: string) => {
    setActive(id);
    if (onSelectCategory) onSelectCategory(id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4 select-none">
      {/* Header */}
      <div className="flex items-end justify-between mb-3 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Shop by Category
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Fresh groceries & daily necessities
          </p>
        </div>

        {/* Scroll Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 disabled:opacity-20 hover:bg-white/10 transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 disabled:opacity-20 hover:bg-white/10 transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto scrollbar-none py-2 px-1 touch-pan-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = active === cat.id;

            return (
              <motion.button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                className={`relative flex-shrink-0 flex sm:flex-col items-center justify-start sm:justify-center 
                  w-[130px] h-[48px] sm:w-[110px] sm:h-[105px] 
                  px-3 sm:px-2 py-2 sm:py-3 
                  rounded-2xl transition-all duration-300 backdrop-blur-md ${
                    isSelected
                      ? "bg-emerald-500/10 border border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : "bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-slate-300 hover:text-white hover:border-white/20"
                  }`}
              >
                {/* Minimal Active Bottom Bar Indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute bottom-0 left-4 right-4 h-[2px] bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon Container */}
                <div
                  className={`w-7 h-7 sm:w-10 sm:h-10 
                    mr-2.5 sm:mr-0 sm:mb-2 
                    rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-400"
                        : cat.color
                    }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>

                {/* Name Label */}
                <span className="text-xs sm:text-[11px] font-medium text-left sm:text-center leading-tight line-clamp-1">
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}