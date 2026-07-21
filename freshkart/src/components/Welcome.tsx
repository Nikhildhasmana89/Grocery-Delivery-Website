"use client";

import { motion } from "framer-motion";
import React from "react";

type PropType = {
  nextStep: (s: number) => void;
};

function Welcome({ nextStep }: PropType): React.JSX.Element {
  const stickers = [
    {
      id: "organic",
      icon: "🥬",
      label: "100% Organic",
      shape: "circle",
      bg: "rgba(16, 185, 129, 0.2)",
      ring: "#10B981",
      glow: "rgba(16, 185, 129, 0.4)",
      position: "-top-9 -left-10 md:-top-12 md:-left-16",
      rotate: -14,
      delay: 0.15,
      size: "w-24 h-24 md:w-28 md:h-28",
    },
    {
      id: "delivery",
      icon: "🚀",
      label: "10 MIN",
      sub: "DELIVERY",
      shape: "burst",
      bg: "#F59E0B",
      ring: "#FBBF24",
      glow: "rgba(245, 158, 11, 0.5)",
      position: "-top-10 -right-8 md:-top-14 md:-right-14",
      rotate: 10,
      delay: 0.3,
      size: "w-24 h-24 md:w-28 md:h-28",
    },
    {
      id: "fresh",
      icon: "🍅",
      label: "Farm Fresh",
      shape: "circle",
      bg: "rgba(239, 68, 68, 0.2)",
      ring: "#EF4444",
      glow: "rgba(239, 68, 68, 0.4)",
      position: "top-1/2 -left-14 md:-left-20",
      rotate: -8,
      delay: 0.45,
      size: "w-20 h-20 md:w-24 md:h-24",
    },
    {
      id: "prices",
      icon: "⚡",
      label: "Best Prices",
      shape: "tape",
      bg: "rgba(30, 41, 59, 0.8)",
      ring: "#06B6D4",
      glow: "rgba(6, 182, 212, 0.4)",
      position: "-bottom-7 -left-8 md:-bottom-9 md:-left-14",
      rotate: -6,
      delay: 0.6,
      size: "w-28 md:w-32",
    },
    {
      id: "waste",
      icon: "🌱",
      label: "Zero Waste",
      shape: "circle",
      bg: "rgba(34, 197, 94, 0.2)",
      ring: "#22C55E",
      glow: "rgba(34, 197, 94, 0.4)",
      position: "bottom-1/3 -right-14 md:-right-20",
      rotate: 12,
      delay: 0.75,
      size: "w-20 h-20 md:w-24 md:h-24",
    },
    {
      id: "homes",
      icon: "❤️",
      label: "50k+ Happy",
      sub: "Homes",
      shape: "peel",
      bg: "rgba(15, 23, 42, 0.9)",
      ring: "#EC4899",
      glow: "rgba(236, 72, 153, 0.4)",
      position: "-bottom-8 -right-8 md:-bottom-10 md:-right-12",
      rotate: 8,
      delay: 0.9,
      size: "w-24 h-24 md:w-28 md:h-28",
    },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#07090E] flex items-center justify-center p-6 text-white">
      <style>{`
        @keyframes grain { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-1.5%,1%)} }
        .fk-grain::before{
          content:"";position:absolute;inset:-10%;
          background-image:radial-gradient(rgba(255,255,255,0.15) 0.8px, transparent 0.8px);
          background-size:16px 16px;opacity:0.08;
          animation:grain 9s steps(2) infinite;
        }
        .fk-peel{
          clip-path: polygon(0 0, 100% 0, 100% 78%, 78% 100%, 0 100%);
        }
        .fk-peel-fold{
          clip-path: polygon(100% 78%, 78% 100%, 100% 100%);
        }
      `}</style>

      {/* Textured grain background */}
      <div className="fk-grain absolute inset-0 pointer-events-none z-0" />

      {/* Ambient Glowing Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-emerald-500/20 blur-[130px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-cyan-500/20 blur-[130px] pointer-events-none"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 max-w-xl w-full">
        {/* Stacked card effect behind main card */}
        <div className="absolute inset-0 rounded-[28px] bg-slate-900/40 border border-emerald-500/20 rotate-[3deg] blur-[1px]" />
        <div className="absolute inset-0 rounded-[28px] bg-slate-900/60 border border-cyan-500/20 -rotate-[2deg]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative bg-slate-950/80 backdrop-blur-xl border-2 border-emerald-500/40 rounded-[28px] px-8 py-12 md:px-12 md:py-16 text-center shadow-[0_0_50px_rgba(16,185,129,0.15)] -rotate-1"
        >
          {/* Stickers */}
          {stickers.map((s) => (
            <motion.div
              key={s.id}
              initial={{ scale: 0, opacity: 0, y: -30, rotate: 0 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: s.rotate }}
              whileHover={{ scale: 1.12, rotate: s.rotate * 0.4 }}
              transition={{
                delay: s.delay,
                type: "spring",
                stiffness: 260,
                damping: 14,
              }}
              className={`absolute ${s.position} ${s.size} z-20 hidden sm:block cursor-default`}
            >
              {/* Tape sticker */}
              {s.shape === "tape" && (
                <div
                  className="relative px-4 py-2.5 border-2 flex items-center gap-2 rounded-lg backdrop-blur-md"
                  style={{
                    background: s.bg,
                    borderColor: s.ring,
                    boxShadow: `0 0 15px ${s.glow}`,
                  }}
                >
                  <span
                    className="absolute -top-2.5 left-3 w-8 h-4 rotate-[-8deg] opacity-70"
                    style={{ background: "#334155" }}
                  />
                  <span className="text-lg">{s.icon}</span>
                  <span className="font-semibold text-sm text-cyan-300 whitespace-nowrap">
                    {s.label}
                  </span>
                </div>
              )}

              {/* Circle sticker */}
              {s.shape === "circle" && (
                <div
                  className="w-full h-full rounded-full flex flex-col items-center justify-center border-2 text-center px-1 backdrop-blur-md"
                  style={{
                    background: s.bg,
                    borderColor: s.ring,
                    boxShadow: `0 0 20px ${s.glow}`,
                  }}
                >
                  <span className="text-xl md:text-2xl leading-none">{s.icon}</span>
                  <span className="mt-1 text-[10px] md:text-xs font-bold text-white leading-tight">
                    {s.label}
                  </span>
                </div>
              )}

              {/* Starburst price-tag sticker */}
              {s.shape === "burst" && (
                <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: s.bg,
                      clipPath:
                        "polygon(50% 0%,61% 14%,78% 6%,80% 25%,98% 28%,90% 45%,100% 60%,84% 68%,86% 87%,68% 82%,58% 98%,50% 82%,32% 96%,26% 78%,8% 82%,14% 64%,0% 52%,16% 40%,10% 22%,29% 24%,34% 6%)",
                    }}
                  />
                  <div className="relative flex flex-col items-center justify-center text-center z-10">
                    <span className="text-lg leading-none">{s.icon}</span>
                    <span className="text-[10px] font-black text-slate-950 leading-tight">
                      {s.label}
                    </span>
                    <span className="text-[8px] font-bold text-slate-900 tracking-wide">
                      {s.sub}
                    </span>
                  </div>
                </div>
              )}

              {/* Peeling die-cut sticker */}
              {s.shape === "peel" && (
                <div className="relative w-full h-full">
                  <div
                    className="fk-peel w-full h-full border-2 flex flex-col items-center justify-center backdrop-blur-md"
                    style={{
                      background: s.bg,
                      borderColor: s.ring,
                      boxShadow: `0 0 18px ${s.glow}`,
                    }}
                  >
                    <span className="text-xl leading-none">{s.icon}</span>
                    <span className="text-[10px] font-bold text-pink-300 leading-tight">
                      {s.label}
                    </span>
                    <span className="text-[10px] font-bold text-pink-300 leading-tight">
                      {s.sub}
                    </span>
                  </div>
                  <div
                    className="fk-peel-fold absolute inset-0"
                    style={{ background: "#334155" }}
                  />
                </div>
              )}
            </motion.div>
          ))}

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs md:text-sm font-bold tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            🌾 Farm to door, daily
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-5xl md:text-7xl leading-none tracking-tight"
            style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 600 }}
          >
            <span className="text-white">Fresh</span>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Kart
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-slate-300 mt-4 text-base md:text-lg max-w-md mx-auto leading-relaxed font-normal"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Groceries picked this morning, at your door before the kettle boils.
          </motion.p>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
          >
            <motion.button
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ y: 1 }}
              onClick={() => nextStep(2)}
              className="mt-9 px-9 py-4 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold text-base shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Start Shopping ➔
            </motion.button>
          </motion.div>

          {/* Handwritten note accent */}
          <motion.p
            initial={{ opacity: 0, rotate: -4, y: 10 }}
            animate={{ opacity: 1, rotate: -4, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-6 text-emerald-400 text-xl font-semibold"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            picked fresh, packed with care ✍️
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

export default Welcome;