"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ShoppingBag, Tag } from "lucide-react";

export interface IGroceryItem {
  _id?: string;
  name: string;
  category: string;
  price: string | number;
  unit: string;
  image: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface GroceryItemCardProps {
  item?: IGroceryItem;
  onAddToCart?: (item: IGroceryItem, quantity: number) => void;
}

export default function GroceryItemCard({ item, onAddToCart }: GroceryItemCardProps) {
  const [quantity, setQuantity] = useState(0);

  // Guard clause: if no item object is passed, don't crash
  if (!item) return null;

  const handleIncrement = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    if (onAddToCart) onAddToCart(item, newQty);
  };

  const handleDecrement = () => {
    const newQty = Math.max(0, quantity - 1);
    setQuantity(newQty);
    if (onAddToCart) onAddToCart(item, newQty);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/40 p-3.5 backdrop-blur-md transition-colors duration-300 shadow-lg hover:shadow-emerald-500/10"
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400 capitalize">
          <Tag className="w-2.5 h-2.5" />
          {item.category || "General"}
        </span>
        <span className="text-[11px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
          {item.unit || "unit"}
        </span>
      </div>

      {/* Product Image Container */}
      <div className="relative w-full h-36 sm:h-40 my-1 rounded-xl overflow-hidden bg-slate-900/60 flex items-center justify-center">
        {item.image ? (
          <motion.img
            src={item.image}
            alt={item.name || "Grocery Item"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <ShoppingBag className="w-10 h-10 text-slate-600" />
        )}

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Item Details */}
      <div className="mt-2 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
          {item.name || "Unnamed Product"}
        </h3>

        {/* Price & Add to Cart Section */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Price</p>
            <p className="text-base font-bold text-white flex items-baseline gap-0.5">
              <span className="text-emerald-400 text-xs font-semibold">₹</span>
              {item.price ?? 0}
            </p>
          </div>

          {/* Interactive Animated Add Button / Counter */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add-btn"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleIncrement}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all duration-200 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD</span>
                </motion.button>
              ) : (
                <motion.div
                  key="counter-btn"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 px-2 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 border border-emerald-400/30"
                >
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={handleDecrement}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </motion.button>

                  <motion.span
                    key={quantity}
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-4 text-center text-xs"
                  >
                    {quantity}
                  </motion.span>

                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={handleIncrement}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}