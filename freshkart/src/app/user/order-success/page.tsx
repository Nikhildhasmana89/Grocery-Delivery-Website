"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  Package,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Calendar,
} from "lucide-react";

export default function OrderSuccess() {
  // Estimated delivery time calculation (10 minutes from now)
  const deliveryTime = new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex items-center justify-center p-4 md:p-8">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl w-full my-8">
        {/* Main Glassmorphic Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 md:p-10 shadow-2xl shadow-slate-950/80 backdrop-blur-xl relative overflow-hidden space-y-8"
        >
          {/* Top Subtle Accent Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400" />

          {/* Animated Header Section */}
          <div className="text-center space-y-4">
            
            {/* Pulsing Animated Checkmark Badge */}
            <div className="relative inline-flex items-center justify-center">
              {/* Outer Glow Ring */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-emerald-500/20 rounded-full blur-lg"
              />

              {/* Icon Container */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay: 0.1,
                }}
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 shadow-xl shadow-emerald-500/20 flex items-center justify-center"
              >
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 md:w-12 md:h-12 text-emerald-400 stroke-[3]" />
                </div>
              </motion.div>

              {/* Sparkle Icons */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
              </motion.div>
            </div>

            {/* Title & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-1.5"
            >
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Order <span className="text-emerald-400">Confirmed!</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 max-w-sm mx-auto font-medium">
                Thank you for your purchase! Your fresh groceries are being packed right now.
              </p>
            </motion.div>
          </div>

          {/* Delivery Guarantee Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <Clock className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Estimated Delivery
                </p>
                <p className="text-sm font-black text-white">
                  Expected by {deliveryTime} <span className="text-xs text-slate-400 font-normal">(10 Mins)</span>
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Express</span>
            </div>
          </motion.div>

          {/* Order Progress Timeline Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Order Progress
            </p>
            <div className="grid grid-cols-3 gap-2 relative">
              {[
                { label: "Order Placed", icon: Check, active: true },
                { label: "Packing", icon: Package, active: true },
                { label: "Out for Delivery", icon: Truck, active: false },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                      step.active
                        ? "bg-slate-950 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/5"
                        : "bg-slate-950/40 border-slate-800/80 text-slate-600"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl ${
                        step.active ? "bg-emerald-500/10" : "bg-slate-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold leading-tight">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Details Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 md:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3 text-xs"
          >
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/60 pb-2.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Date & Time
              </span>
              <span className="font-bold text-white">
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/60 pb-2.5">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Delivery Address
              </span>
              <span className="font-bold text-white text-right max-w-[200px] truncate">
                Saved Primary Location
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400 pt-0.5">
              <span className="flex items-center gap-1.5 font-medium">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> Payment Status
              </span>
              <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                SUCCESSFUL
              </span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <Link
              href="/"
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}