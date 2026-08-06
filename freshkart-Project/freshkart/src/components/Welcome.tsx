"use client";

import React, { useState } from "react";
import { motion,Variants } from "framer-motion";
import { FruitMascotButton } from "../WelcomeAnimation/FruitMascot";




type PropType = {
  nextStep: (s: number) => void;
};

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const FLOATING_PRODUCE = [
  { emoji: "🥑", top: "14%", left: "10%", delay: 0 },
  { emoji: "🍓", top: "70%", left: "8%", delay: 0.6 },
  { emoji: "🥕", top: "20%", left: "88%", delay: 0.3 },
  { emoji: "🍋", top: "72%", left: "90%", delay: 0.9 },
];

export default function Welcome({ nextStep }: PropType): React.JSX.Element {
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  const handleStartShopping = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    // Give the mascot a moment to land, wave, and say hi before we move on
    setTimeout(() => {
      nextStep(2);
    }, 6000);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Subtle floating produce, ambient only, ignored by screen readers */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {FLOATING_PRODUCE.map((p, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl sm:text-4xl opacity-20 select-none"
            style={{ top: p.top, left: p.left }}
            animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </div>

      {/* Main glass hero card */}
      <div className="relative z-10 max-w-2xl w-full my-auto text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative bg-slate-900/80 backdrop-blur-2xl border border-emerald-500/30 rounded-[32px] p-8 sm:p-12 shadow-[0_0_60px_rgba(16,185,129,0.15)] overflow-hidden"
        >
          {/* Eyebrow pill */}
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-bold tracking-widest uppercase mb-6"
          >
            🌾 Farm to door, daily
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={item}
            className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none mb-4"
          >
            <span className="text-white">Fresh</span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Kart
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={item}
            className="text-slate-300 text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-4"
          >
            Groceries picked this morning, at your door before the kettle boils.
          </motion.p>

          {/* Small feature row */}
          <motion.div
            variants={item}
            className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400 mb-8"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Same-day delivery
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              No hidden fees
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              100% freshness guarantee
            </span>
          </motion.div>

          {/* Mascot start button */}
         <motion.div variants={item} className="flex justify-center my-2">
         <FruitMascotButton
    label={isNavigating ? "Let's go! 🛒" : "Start Shopping"}
    onSequenceComplete={() => nextStep(2)}
    timings={{
      idleMinMs: 1600,
      idleMaxMs: 2000,
      goodbyeMs: 450,
      retreatMs: 350,
    }}
  />
</motion.div>

          {/* Accent note */}
          <motion.p variants={item} className="mt-4 text-emerald-400 text-lg font-semibold italic">
            picked fresh, packed with care ✍️
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}