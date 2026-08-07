'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Carrot, Milk, Zap, Sparkles, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getSocket } from '@/lib/socket';


export default function HeroSection() {
  const userData = useSelector((state: RootState) =>
    (state as any).userData || (state as any).auth?.user || null
  );


  const slides = [
    {
      id: 1,
      badge: "DAILY ESSENTIALS",
      title: "Farm-Fresh Organic",
      highlight: "Vegetables & Fruits",
      description: "Get crisp, hand-picked fruits and vegetables directly from local organic farms delivered to your doorstep within 30 minutes.",
      ctaText: "Shop Fresh Now",
      ctaLink: "/category/fresh-produce",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1200&auto=format&fit=crop",
      bgGradient: "from-emerald-950/90 via-slate-900 to-slate-950",
      accentColor: "text-emerald-400",
      badgeBorder: "border-emerald-500/30 bg-emerald-500/10",
      icon: Carrot
    },
    {
      id: 7,
    badge: "HEALTH & WELLNESS",
    title: "Gluten-Free &",
    highlight: "Keto Essentials",
    description: "Maintain your healthy lifestyle with sugar-free beverages, almond flour, protein bars, and plant-based milk alternatives.",
    ctaText: "Shop Healthy",
    ctaLink: "/category/healthy-living",
   image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200&auto=format&fit=crop",
    bgGradient: "from-teal-950/90 via-slate-900 to-slate-950",
    accentColor: "text-teal-400",
    badgeBorder: "border-teal-500/30 bg-teal-500/10",
    icon: Leaf
    },
    {
      id: 3,
      badge: "EXPRESS DELIVERY",
      title: "Instant Snacks &",
      highlight: "Refreshing Drinks",
      description: "Craving something quick? Explore our vast collection of chilled juices, sodas, chips, and quick munchies ready to ship.",
      ctaText: "Browse Snacks",
      ctaLink: "/category/snacks-drinks",
      image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=1200&auto=format&fit=crop",
      bgGradient: "from-cyan-950/90 via-slate-900 to-slate-950",
      accentColor: "text-cyan-400",
      badgeBorder: "border-cyan-500/30 bg-cyan-500/10",
      icon: Zap
    },
    {
      id: 4,
      badge: "PANTRY STAPLES",
      title: "Premium Spices &",
      highlight: "Organic Grains",
      description: "Elevate your daily cooking with 100% natural spices, aromatic basmati rice, lentils, and cold-pressed cooking oils.",
      ctaText: "Stock Your Pantry",
      ctaLink: "/category/pantry-staples",
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop",
      bgGradient: "from-rose-950/90 via-slate-900 to-slate-950",
      accentColor: "text-rose-400",
      badgeBorder: "border-rose-500/30 bg-rose-500/10",
      icon: Sparkles
    }
  ];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = Next, -1 = Prev

  // Auto-play interval
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const activeSlide = slides[current];
  const IconComponent = activeSlide.icon;

  // Animation variants for directional sliding
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] }
    })
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-6 font-sans">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950 h-[480px] sm:h-[460px] md:h-[420px] shadow-2xl shadow-slate-950/80">
        
        {/* Animated Slide Content */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={`absolute inset-0 bg-gradient-to-r ${activeSlide.bgGradient} flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 md:p-12 gap-6`}
          >
            {/* Text & Call to Action Container */}
            <div className="flex-1 space-y-3 sm:space-y-4 text-center md:text-left z-10 max-w-xl">
              
              {/* Animated Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase border ${activeSlide.badgeBorder} ${activeSlide.accentColor}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                  {activeSlide.badge}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
              >
                {activeSlide.title}{" "}
                <span className={activeSlide.accentColor}>
                  {activeSlide.highlight}
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-xs sm:text-sm text-slate-400 line-clamp-2 sm:line-clamp-3 leading-relaxed"
              >
                {activeSlide.description}
              </motion.p>

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="pt-2"
              >
                <Link
                  href={activeSlide.ctaLink}
                  className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {activeSlide.ctaText}
                </Link>
              </motion.div>
            </div>

            {/* Hero Banner Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="relative w-full md:w-1/2 h-40 sm:h-52 md:h-full rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl group shrink-0"
            >
              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:hidden" />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Prev Arrow Button */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 transition-all z-20 backdrop-blur-md cursor-pointer active:scale-90"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Arrow Button */}
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 transition-all z-20 backdrop-blur-md cursor-pointer active:scale-90"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators / Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > current ? 1 : -1);
                setCurrent(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                current === idx
                  ? "w-8 bg-emerald-400"
                  : "w-2 bg-slate-700 hover:bg-slate-500"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}