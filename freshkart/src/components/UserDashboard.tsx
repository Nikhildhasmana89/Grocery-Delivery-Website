"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sparkles } from "lucide-react";
import Nav from "./Nav";
import HeroSection from "./HeroSection";
import CategorySlide from "./CategorySlider";
import GroceryItemCard, { IGroceryItem } from "./GroceryItemCard";

interface UserDashboardProps {
  user: {
    _id: string;
    name?: string;
    email?: string;
    mobile?: string;
    role?: string;
    [key: string]: any;
  };
  groceries?: IGroceryItem[];
}

export default function UserDashboard({ user, groceries = [] }: UserDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Helper function to normalize category strings for comparison
  const normalizeCategory = (catStr: string = "") => {
    return catStr
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, ""); // removes spaces, hyphens, and special characters
  };

  // Filter items safely using memoization to prevent unnecessary recalculations
  const filteredGroceries = useMemo(() => {
    if (!Array.isArray(groceries)) return [];
    if (selectedCategory === "all") return groceries;

    const normalizedSelected = normalizeCategory(selectedCategory);

    return groceries.filter((item) => {
      if (!item.category) return false;
      const normalizedItemCat = normalizeCategory(item.category);

      return (
        normalizedItemCat === normalizedSelected ||
        normalizedItemCat.includes(normalizedSelected) ||
        normalizedSelected.includes(normalizedItemCat)
      );
    });
  }, [groceries, selectedCategory]);

  const handleAddToCart = (item: IGroceryItem, quantity: number) => {
    console.log(`Cart action: ${item.name} -> Quantity: ${quantity}`);
    // Connect your global state (Redux/Zustand/Context) or Server Action here
  };

  return (
    <div className="relative min-h-screen bg-[#07090E] text-white flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#07090E]/80 backdrop-blur-md border-b border-white/10">
        <Nav user={user} />
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 py-6">
        {/* Hero Section Banner */}
        <HeroSection />

        {/* Category Filter Slider */}
        <section className="w-full">
          <CategorySlide
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => setSelectedCategory(catId)}
          />
        </section>

        {/* Grocery Product Grid Section */}
        <section className="w-full space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>
                {selectedCategory === "all"
                  ? "Fresh Recommendations"
                  : selectedCategory.toUpperCase()}
              </span>
            </h2>
            <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              {filteredGroceries.length} {filteredGroceries.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          {/* Development Debug Banner (Helps spot DB data issues instantly) */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-[11px] text-emerald-400/80 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-mono">
              DEBUG: Received {groceries?.length || 0} items from Server | Showing {filteredGroceries.length} for filter "{selectedCategory}"
            </div>
          )}

          {/* Animated Product Grid / Empty State */}
          <AnimatePresence mode="wait">
            {filteredGroceries.length > 0 ? (
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5"
              >
                {filteredGroceries.map((item, index) => (
                  <GroceryItemCard
                    key={item._id ? String(item._id) : `item-${index}-${item.name}`}
                    item={item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-16 rounded-3xl bg-white/[0.02] border border-white/5 text-center px-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-3">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-slate-200">
                  No items found in this category
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  We currently don&apos;t have any products available under &quot;{selectedCategory}&quot;.
                </p>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
                >
                  View All Products
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}