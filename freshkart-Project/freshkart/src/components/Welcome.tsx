"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  ShoppingBag,
  Leaf,
  Zap,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Truck,
  Sparkles,
  CheckCircle2,
  Package,
} from "lucide-react";

type PropType = {
  nextStep: (s: number) => void;
};

// Container stagger animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Child item fade + slide up animation variants
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

// Visual container slide in from right animation
const visualVariants: Variants = {
  hidden: { opacity: 0, x: 40, scale: 0.95 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: 0.2,
    },
  },
};

export default function Welcome({ nextStep }: PropType): React.JSX.Element {
  const [isClicking, setIsClicking] = useState(false);

  const handleStartShopping = () => {
    if (isClicking) return;
    setIsClicking(true);
    nextStep(2);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#FBFDFB] text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Background ambient glows & soft organic gradient shapes */}
      <div
        aria-hidden="true"
        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[140px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/3 -right-20 w-[550px] h-[550px] bg-teal-100/50 rounded-full blur-[130px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Subtle background grid pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none"
      />

      {/* Header Bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            <span className="text-emerald-950">Fresh</span>
            <span className="text-emerald-600">Kart</span>
          </span>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Grocery Delivery
        </div>
      </header>

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="lg:col-span-6 xl:col-span-6 space-y-6 text-left"
        >
          {/* Brand Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-300/80 bg-emerald-100/70 text-emerald-800 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-xs">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              FARM TO DOOR, DAILY
            </span>
          </motion.div>

          {/* Main Hero Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]"
          >
            Fresh groceries,{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent block sm:inline">
              delivered to you.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-slate-600 text-base sm:text-lg lg:text-lg max-w-xl font-medium leading-relaxed"
          >
            From farm-fresh produce to daily essentials, everything you need —
            delivered fast, fresh and with care.
          </motion.p>

          {/* Key Benefits */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 pb-1"
          >
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-slate-100 shadow-sm backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">
                  Fast Delivery
                </h4>
                <p className="text-[11px] font-medium text-slate-500 leading-snug">
                  Delivered to your doorstep
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-slate-100 shadow-sm backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">
                  100% Fresh
                </h4>
                <p className="text-[11px] font-medium text-slate-500 leading-snug">
                  Quality products you trust
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-slate-100 shadow-sm backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">
                  No Hidden Fees
                </h4>
                <p className="text-[11px] font-medium text-slate-500 leading-snug">
                  What you see is what you pay
                </p>
              </div>
            </div>
          </motion.div>

          {/* Primary CTA */}
          <motion.div variants={itemVariants} className="pt-2">
            <button
              type="button"
              onClick={handleStartShopping}
              disabled={isClicking}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base sm:text-lg shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer w-full sm:w-auto"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </motion.div>
        </motion.div>

        {/* Right Column: Hero Grocery Visual & Info Cards Stack (Strictly constrained within 6 columns) */}
        <motion.div
          variants={visualVariants}
          initial="hidden"
          animate="show"
          className="lg:col-span-6 xl:col-span-6 flex flex-col items-center lg:items-end space-y-4"
        >
          {/* Main Grocery Image Container */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-full max-w-md aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden border border-emerald-100/90 bg-white/80 shadow-2xl shadow-emerald-900/10 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between"
          >
            {/* Background Soft Glow Inside Visual */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/50 via-teal-50/30 to-emerald-200/40 pointer-events-none" />

            {/* Top Visual Banner */}
            <div className="relative z-10 flex items-center justify-between border-b border-emerald-100/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-slate-800">
                  FreshKart Express
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                Daily Essentials
              </span>
            </div>

            {/* Central Graphic Composition */}
            <div className="relative z-10 my-auto py-3 flex items-center justify-center">
              <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden shadow-md border border-white">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
                  alt="Fresh Organic Produce Bag"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-3.5">
                  <div className="text-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Handpicked Quality
                    </p>
                    <p className="text-sm font-black">
                      Farm Fresh Fruits & Vegetables
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Visual Bar */}
            <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-emerald-100/80 text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Freshness
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Truck className="w-3.5 h-3.5" />
                Doorstep Delivery
              </span>
            </div>
          </motion.div>

          {/* Info Cards Stack — Positioned cleanly under main card, 100% within right column bounds */}
          <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {/* Card 1: Fast Delivery */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
              className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-lg shadow-slate-200/50 rounded-2xl p-3.5 flex items-center gap-3.5 hover:shadow-xl transition-shadow"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-900 leading-tight">
                  Fast Delivery
                </p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  Same-day Shipping
                </p>
              </div>
            </motion.div>

            {/* Card 2: Packed with Care */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
              className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-lg shadow-slate-200/50 rounded-2xl p-3.5 flex items-center gap-3.5 hover:shadow-xl transition-shadow"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-900 leading-tight">
                  Packed with Care
                </p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  Safe & Hygienic
                </p>
              </div>
            </motion.div>

            {/* Card 3: 100% Fresh Guarantee */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 4.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-lg shadow-slate-200/50 rounded-2xl p-3.5 flex items-center gap-3.5 hover:shadow-xl transition-shadow"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-900 leading-tight">
                  100% Fresh Guarantee
                </p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  Quality Guaranteed
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}