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
import { useUserTheme } from "@/context/ThemeContext";

export const CATEGORIES = [
  { id: "all", name: "All Items", icon: Sparkles, color: "text-emerald-400" },
  { id: "fruits & vegetables", name: "Fruits & Veggies", icon: Apple, color: "text-amber-400" },
  { id: "dairy & eggs", name: "Dairy & Eggs", icon: Milk, color: "text-blue-400" },
  { id: "bakery & bread", name: "Bakery & Bread", icon: Croissant, color: "text-yellow-400" },
  { id: "meat & seafood", name: "Meat & Seafood", icon: Fish, color: "text-rose-400" },
  { id: "snacks & beverages", name: "Snacks & Drinks", icon: CupSoda, color: "text-purple-400" },
  { id: "pantry & staples", name: "Pantry & Staples", icon: Wheat, color: "text-amber-500" },
  { id: "frozen foods", name: "Frozen Foods", icon: Snowflake, color: "text-sky-400" },
  { id: "health & wellness", name: "Health & Care", icon: HeartPulse, color: "text-emerald-400" },
  { id: "baby care", name: "Baby Care", icon: Baby, color: "text-pink-400" },
  { id: "household essentials", name: "Household", icon: Home, color: "text-indigo-400" },
];

interface CategorySliderProps {
  onSelectCategory?: (categoryId: string) => void;
  selectedCategory?: string;
  isCompactHeader?: boolean;
}

export default function CategorySlide({
  onSelectCategory,
  selectedCategory = "all",
  isCompactHeader = false,
}: CategorySliderProps) {
  const { theme } = useUserTheme();
  const isLight = theme === "light";
  const [active, setActive] = useState(selectedCategory);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setActive(selectedCategory);
    }
  }, [selectedCategory]);

  const handleScroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleSelect = (id: string) => {
    setActive(id);
    if (onSelectCategory) onSelectCategory(id);
  };

  return (
    <div className="w-full relative select-none">
      <div className="flex items-center justify-between relative group/slider">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll("left")}
            className={`hidden md:flex absolute left-0 z-20 p-1.5 rounded-full border shadow-md transition-all cursor-pointer ${
              isLight
                ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                : "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1.5 px-0.5 w-full touch-pan-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = active === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat.id)}
                className={`relative flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? isLight
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm shadow-emerald-500/10"
                      : "bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold shadow-sm shadow-emerald-500/20"
                    : isLight
                    ? "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300"
                    : "bg-slate-900/60 border-slate-800/70 text-slate-300 hover:bg-slate-800/80 hover:text-white hover:border-slate-700"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected
                      ? isLight
                        ? "text-emerald-600"
                        : "text-emerald-400"
                      : cat.color
                  }`}
                />
                <span>{cat.name}</span>

                {/* Active Indicator Bar */}
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryTab"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-emerald-500 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll("right")}
            className={`hidden md:flex absolute right-0 z-20 p-1.5 rounded-full border shadow-md transition-all cursor-pointer ${
              isLight
                ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                : "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}