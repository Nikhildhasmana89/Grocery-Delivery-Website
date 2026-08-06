"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, LogIn, ShoppingBag, Apple, Carrot } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 overflow-hidden relative">
      {/* Background Decorative Circles */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-lime-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Animated Cart & Fresh Items Graphic */}
        <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
          {/* Pulsing Backglow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 bg-emerald-200/50 rounded-full blur-xl"
          />

          {/* Floating Grocery Icons around Cart */}
          <motion.div
            initial={{ y: 0, rotate: 0 }}
            animate={{ y: [-6, 6, -6], rotate: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-1 left-4 text-emerald-600 bg-white p-2.5 rounded-full shadow-md border border-emerald-100"
          >
            <Apple className="w-6 h-6" />
          </motion.div>

          <motion.div
            initial={{ y: 0, rotate: 0 }}
            animate={{ y: [6, -6, 6], rotate: [10, -10, 10] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-4 right-2 text-orange-500 bg-white p-2.5 rounded-full shadow-md border border-orange-100"
          >
            <Carrot className="w-6 h-6" />
          </motion.div>

          {/* Center Shopping Bag with Lock Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative bg-white p-6 rounded-3xl shadow-xl border border-slate-100 text-emerald-600"
          >
            <ShoppingBag className="w-16 h-16 stroke-[1.5]" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2 rounded-full shadow-lg border-2 border-white"
            >
              <ShieldAlert className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </div>

        {/* Text Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Brand Name Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Freshkart Security
          </span>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Access Restricted
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
            Oops! You need proper permissions or an admin account to view this section of <span className="font-semibold text-emerald-600">Freshkart</span>.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-medium text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.button>
          </Link>

          <Link href="/login" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Switch Account
            </motion.button>
          </Link>
        </motion.div>

        {/* Footer Support Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-slate-400 mt-10"
        >
          Think this is a mistake? Contact your Freshkart administrator.
        </motion.p>
      </div>
    </div>
  );
}