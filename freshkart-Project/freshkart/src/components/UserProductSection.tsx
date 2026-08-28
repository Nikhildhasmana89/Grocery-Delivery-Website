"use client";

import React, { useState, useMemo, useEffect } from "react";
import CategorySlide from "./CategorySlider";
import GroceryItemCard from "./GroceryItemCard";
import { PackageX, Sparkles } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface GroceryItem {
  _id: string;
  name: string;
  category: string;
  price: string | number;
  unit: string;
  image: string;
  stock?: number;
  minStock?: number;
  description?: string;
  rating?: number;
  isTemporary?: boolean;
}

interface UserProductSectionProps {
  initialGroceries: GroceryItem[];
}

/**
 * Robust Category Normalizer to handle display names, alternative slugs, casing, and spaces
 */
export const normalizeCategory = (cat: string): string => {
  if (!cat) return "";
  const trimmed = cat.trim().toLowerCase();

  // Mapping display names and alternative slugs to standard MongoDB categories
  if (
    trimmed === "fruits & veggies" ||
    trimmed === "fruits and veggies" ||
    trimmed === "fruits-and-vegetables"
  ) {
    return "fruits & vegetables";
  }
  if (
    trimmed === "snacks & drinks" ||
    trimmed === "snacks and drinks" ||
    trimmed === "snacks-and-beverages"
  ) {
    return "snacks & beverages";
  }
  if (trimmed === "health & care" || trimmed === "health-and-wellness") {
    return "health & wellness";
  }
  if (trimmed === "household" || trimmed === "household-essentials") {
    return "household essentials";
  }
  if (trimmed === "bakery-and-bread") {
    return "bakery & bread";
  }
  if (trimmed === "dairy-and-eggs") {
    return "dairy & eggs";
  }
  if (trimmed === "meat-and-seafood") {
    return "meat & seafood";
  }
  if (trimmed === "pantry-and-staples") {
    return "pantry & staples";
  }
  if (trimmed === "frozen-foods") {
    return "frozen foods";
  }
  if (trimmed === "baby-care") {
    return "baby care";
  }

  return trimmed;
};

export default function UserProductSection({
  initialGroceries,
}: UserProductSectionProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial category from URL query param if present
  const categoryQuery = searchParams.get("category");
  const initialCategory = categoryQuery
    ? normalizeCategory(categoryQuery)
    : "all";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  // Sync state if URL query param changes
  useEffect(() => {
    if (categoryQuery) {
      setSelectedCategory(normalizeCategory(categoryQuery));
    }
  }, [categoryQuery]);

  const handleSelectCategory = (catId: string) => {
    const normalized = normalizeCategory(catId);
    setSelectedCategory(normalized);

    // Update URL shallowly without triggering server re-fetches
    const params = new URLSearchParams(window.location.search);
    if (normalized === "all") {
      params.delete("category");
    } else {
      params.set("category", normalized);
    }
    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.history.pushState({}, "", newUrl);
  };

  // Read search query from URL query param if present
  const rawSearch = searchParams.get("q") || searchParams.get("search") || "";
  const searchQuery = rawSearch.trim().toLowerCase();

  // Filter products efficiently on client side (both Category & Search)
  const filteredGroceries = useMemo(() => {
    return initialGroceries.filter((item) => {
      // 1. Category Filter
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "all" ||
        normalizeCategory(item.category) === selectedCategory;

      // 2. Search Query Filter (Product name, category, or description)
      const nameMatch = (item.name || "").toLowerCase().includes(searchQuery);
      const catMatch = (item.category || "").toLowerCase().includes(searchQuery);
      const descMatch = (item.description || "").toLowerCase().includes(searchQuery);

      const matchesSearch = !searchQuery || nameMatch || catMatch || descMatch;

      return matchesCategory && matchesSearch;
    });
  }, [initialGroceries, selectedCategory, searchQuery]);

  const clearAllFilters = () => {
    setSelectedCategory("all");
    const params = new URLSearchParams(window.location.search);
    params.delete("category");
    params.delete("q");
    params.delete("search");
    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.history.pushState({}, "", newUrl);
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Section — Placed directly below Hero Banner and above Product Listing */}
      <section className="py-1">
        <CategorySlide
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      </section>

      {/* Grocery Items Section */}
      <section className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white capitalize flex items-center gap-2">
              {searchQuery
                ? `Results for "${rawSearch}"`
                : selectedCategory === "all"
                ? "Fresh Products"
                : selectedCategory}
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {filteredGroceries.length} Items
            </span>
          </div>

          {(selectedCategory !== "all" || searchQuery) && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Product Grid or Clean Empty State */}
        {filteredGroceries.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {filteredGroceries.map((item) => (
              <div
                key={item._id}
                className="transform transition-all duration-300 hover:-translate-y-1"
              >
                <GroceryItemCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3 shadow-inner">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PackageX className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-200">
              No products found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {searchQuery
                ? `We couldn't find any products matching "${rawSearch}". Try a different keyword or clear filters.`
                : `We don't have items listed under "${selectedCategory}" right now. Select another category or view all items.`}
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              Clear Search & Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
