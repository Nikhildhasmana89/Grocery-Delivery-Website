"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, ShoppingBag, Sparkles } from "lucide-react";
import mongoose from "mongoose";

interface IGrocery {
  _id?: mongoose.Types.ObjectId | string;
  name: string;
  category?: string;
  price: string | number;
  unit?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function GroceryItemCard({ item }: { item: IGrocery }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 p-2.5 shadow-md shadow-slate-950/60 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/15 transition-all duration-300 h-full"
    >
      {/* Top Ambient Glow Effect on Hover */}
      <motion.div 
        className="absolute -top-16 -right-16 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/25 transition-all duration-300 pointer-events-none" 
      />

      {/* Main Content Wrap */}
      <div>
        {/* Reduced Height Image Container (Aspect [4/3]) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-950/80 border border-slate-800/60 mb-2.5 flex items-center justify-center">
          
          {/* Category Chip */}
          {item.category && (
            <span className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wide uppercase bg-slate-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              {item.category}
            </span>
          )}

          {/* Product Image with Smooth Hover Scale */}
          {item.image ? (
            <motion.img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-600">
              <ShoppingBag className="w-6 h-6 opacity-40" />
              <span className="text-[10px] font-semibold">No Image</span>
            </div>
          )}

          {/* Dynamic Light Sweep Animation across Image */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"
          />
        </div>

        {/* Compact Item Title & Unit */}
        <div className="space-y-0.5 px-0.5">
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
            {item.name}
          </h3>
          
          {item.unit && (
            <p className="text-[10px] font-medium text-slate-400">
              {item.unit}
            </p>
          )}
        </div>
      </div>

      {/* Footer / Price & Compact Add Button */}
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 px-0.5">
        <div className="flex items-baseline gap-0.5">
          <span className="text-[10px] font-black text-emerald-400">₹</span>
          <span className="text-sm sm:text-base font-black text-white tracking-tight">
            {item.price}
          </span>
        </div>

        {/* Animated Add Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-[11px] shadow-sm hover:shadow-emerald-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-3 h-3 stroke-[3]" />
          <span>Add</span>
        </motion.button>
      </div>
    </motion.div>
  );
}