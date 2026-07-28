"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Music, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES & FRUIT CONFIGURATIONS ---
type FruitType = "avocado" | "banana" | "apple" | "strawberry" | "mango" | "pineapple" | "orange";

interface FruitConfig {
  name: FruitType;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  greetingText: string;
  exitText: string;
  shapeType: "pear" | "round" | "heart" | "crescent" | "oval";
}

const FRUIT_CONFIGS: Record<FruitType, FruitConfig> = {
  avocado: {
    name: "avocado",
    primaryColor: "#568203",
    secondaryColor: "#C1E1C1",
    accentColor: "#4A2F13",
    greetingText: "👋 Thank you for visiting me!",
    exitText: "See you again! 🥑",
    shapeType: "pear",
  },
  banana: {
    name: "banana",
    primaryColor: "#FFE135",
    secondaryColor: "#FFF3A7",
    greetingText: "👋 Hey there! Let's party!",
    exitText: "Catch ya later! 🍌",
    shapeType: "crescent",
  },
  apple: {
    name: "apple",
    primaryColor: "#FF0800",
    secondaryColor: "#FF6B6B",
    greetingText: "👋 You're awesome to the core!",
    exitText: "Bye bye! 🍎",
    shapeType: "heart",
  },
  strawberry: {
    name: "strawberry",
    primaryColor: "#FC5A8D",
    secondaryColor: "#FF8DA1",
    greetingText: "👋 Berry sweet to meet you!",
    exitText: "See ya soon! 🍓",
    shapeType: "heart",
  },
  mango: {
    name: "mango",
    primaryColor: "#FF8225",
    secondaryColor: "#FFB200",
    greetingText: "👋 Have a mango-nificent day!",
    exitText: "Until next time! 🥭",
    shapeType: "oval",
  },
  pineapple: {
    name: "pineapple",
    primaryColor: "#E6B800",
    secondaryColor: "#FFD700",
    greetingText: "👋 Stand tall & sweet!",
    exitText: "Aloha! 🍍",
    shapeType: "oval",
  },
  orange: {
    name: "orange",
    primaryColor: "#FFA500",
    secondaryColor: "#FFC04D",
    greetingText: "👋 Squeeze the day!",
    exitText: "Zest wishes! 🍊",
    shapeType: "round",
  },
};

// --- MASCOT SVG COMPONENT ---
const MascotSVG: React.FC<{
  fruit: FruitConfig;
  mousePos: { x: number; y: number };
  isWaving: boolean;
  isBlinking: boolean;
}> = ({ fruit, mousePos, isWaving, isBlinking }) => {
  const eyeX = Math.min(Math.max((mousePos.x - (typeof window !== "undefined" ? window.innerWidth / 2 : 0)) / 40, -6), 6);
  const eyeY = Math.min(Math.max((mousePos.y - (typeof window !== "undefined" ? window.innerHeight / 2 : 0)) / 40, -5), 5);

  return (
    <svg viewBox="0 0 120 140" className="w-28 h-32 overflow-visible select-none drop-shadow-lg">
      <defs>
        <radialGradient id={`grad-${fruit.name}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={fruit.secondaryColor} />
          <stop offset="100%" stopColor={fruit.primaryColor} />
        </radialGradient>
      </defs>

      <motion.g animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
        {/* Body Shapes */}
        {fruit.shapeType === "pear" && (
          <path d="M 60 20 C 40 20, 25 45, 25 75 C 25 105, 40 120, 60 120 C 80 120, 95 105, 95 75 C 95 45, 80 20, 60 20 Z" fill={`url(#grad-${fruit.name})`} />
        )}
        {fruit.shapeType === "round" && <circle cx="60" cy="70" r="45" fill={`url(#grad-${fruit.name})`} />}
        {fruit.shapeType === "heart" && (
          <path d="M 60 115 C 20 85, 20 40, 45 35 C 58 35, 60 45, 60 45 C 60 45, 62 35, 75 35 C 100 40, 100 85, 60 115 Z" fill={`url(#grad-${fruit.name})`} />
        )}
        {fruit.shapeType === "crescent" && (
          <path d="M 45 25 C 25 55, 30 100, 75 115 C 60 100, 50 65, 65 30 Z" fill={`url(#grad-${fruit.name})`} />
        )}
        {fruit.shapeType === "oval" && <ellipse cx="60" cy="70" rx="38" ry="48" fill={`url(#grad-${fruit.name})`} />}

        {/* Avocado Seed */}
        {fruit.name === "avocado" && <circle cx="60" cy="85" r="18" fill={fruit.accentColor} />}

        {/* Leaf */}
        <path d="M 60 22 C 50 10, 60 0, 60 0 C 60 0, 70 10, 60 22 Z" fill="#4CAF50" />

        {/* Face Group */}
        <g transform={`translate(${eyeX}, ${eyeY})`}>
          <ellipse cx="46" cy="60" rx="5" ry={isBlinking ? "0.5" : "7"} fill="#1A1A1A" />
          {!isBlinking && <circle cx="48" cy="57" r="2" fill="white" />}
          <ellipse cx="74" cy="60" rx="5" ry={isBlinking ? "0.5" : "7"} fill="#1A1A1A" />
          {!isBlinking && <circle cx="76" cy="57" r="2" fill="white" />}
          <ellipse cx="40" cy="68" rx="4" ry="2.5" fill="#FF8A8A" opacity="0.6" />
          <ellipse cx="80" cy="68" rx="4" ry="2.5" fill="#FF8A8A" opacity="0.6" />
          <path d="M 52 68 Q 60 76 68 68" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Arms */}
        <path d="M 28 72 Q 15 70 20 82" fill="none" stroke={fruit.primaryColor} strokeWidth="4" strokeLinecap="round" />
        <motion.path
          d="M 92 72 Q 105 70 100 82"
          fill="none"
          stroke={fruit.primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          animate={isWaving ? { d: ["M 92 72 Q 105 70 100 82", "M 92 65 Q 110 40 105 55", "M 92 65 Q 115 50 100 60", "M 92 72 Q 105 70 100 82"] } : {}}
          transition={{ duration: 0.8 }}
        />

        {/* Legs */}
        <path d="M 48 118 L 48 128 M 72 118 L 72 128" stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="45" cy="128" rx="5" ry="3" fill="#1A1A1A" />
        <ellipse cx="75" cy="128" rx="5" ry="3" fill="#1A1A1A" />
      </motion.g>
    </svg>
  );
};

// --- MAIN COMPONENT ---
interface AvocadoDanceProps {
  onExploreClick?: () => void;
}

export default function AvocadoDance({ onExploreClick }: AvocadoDanceProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [danceSpeed, setDanceSpeed] = useState<number>(0.6);

  // Mascot States
  const [fruitType, setFruitType] = useState<FruitType>("avocado");
  const [stage, setStage] = useState<"peek" | "jump" | "active" | "exit" | "hidden">("peek");
  const [isWaving, setIsWaving] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Randomize mascot on mount
  useEffect(() => {
    const keys = Object.keys(FRUIT_CONFIGS) as FruitType[];
    setFruitType(keys[Math.floor(Math.random() * keys.length)]);
  }, []);

  const activeFruit = FRUIT_CONFIGS[fruitType];

  // Track mouse cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Mascot idle behavior
  useEffect(() => {
    if (stage !== "active") return;

    const waveInterval = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 800);
    }, 2000);

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3200);

    const hideTimer = setTimeout(() => {
      setStage("exit");
      setTimeout(() => setStage("hidden"), 1400);
    }, 7000);

    return () => {
      clearInterval(waveInterval);
      clearInterval(blinkInterval);
      clearTimeout(hideTimer);
    };
  }, [stage]);

  const handleStartParty = () => {
    if (onExploreClick) onExploreClick();

    if (stage === "peek" || stage === "hidden") {
      setStage("jump");
      setTimeout(() => setStage("active"), 600);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white overflow-hidden flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Dynamic CSS Styles */}
      <style>{`
        .tile {
          background: linear-gradient(135deg, #ff6b9d, #6b5bff, #3ad6c9, #ffd23f);
          background-size: 400% 400%;
          animation: tileShift 2.4s ease-in-out infinite;
          opacity: 0.55;
        }
        @keyframes tileShift {
          0%, 100% { background-position: 0% 50%; opacity: 0.35; }
          50% { background-position: 100% 50%; opacity: 0.75; }
        }
        .glow {
          position: absolute;
          bottom: 70px;
          left: 50%;
          width: 260px;
          height: 260px;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(255,210,63,0.35) 0%, rgba(255,107,157,0.18) 45%, transparent 75%);
          border-radius: 50%;
          animation: pulse 1.6s ease-in-out infinite;
          filter: blur(2px);
        }
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(0.92); }
          50% { transform: translateX(-50%) scale(1.08); }
        }
        .avo-rig {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: bodyBounce ${danceSpeed}s ease-in-out infinite;
          animation-play-state: ${isPlaying ? "running" : "paused"};
          transform-origin: bottom center;
        }
        @keyframes bodyBounce {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          25%      { transform: translateY(-18px) rotate(0deg); }
          50%      { transform: translateY(0) rotate(4deg); }
          75%      { transform: translateY(-10px) rotate(0deg); }
        }
        .avo {
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 10px 14px rgba(0,0,0,0.35));
        }
        .arm-left {
          transform-origin: 70px 140px;
          animation: swingLeft ${danceSpeed}s ease-in-out infinite;
          animation-play-state: ${isPlaying ? "running" : "paused"};
        }
        .arm-right {
          transform-origin: 150px 140px;
          animation: swingRight ${danceSpeed}s ease-in-out infinite;
          animation-play-state: ${isPlaying ? "running" : "paused"};
        }
        @keyframes swingLeft {
          0%, 100% { transform: rotate(-25deg); }
          50%      { transform: rotate(35deg); }
        }
        @keyframes swingRight {
          0%, 100% { transform: rotate(25deg); }
          50%      { transform: rotate(-35deg); }
        }
        .glasses {
          transform-origin: 110px 145px;
          animation: glassesGroove ${danceSpeed}s ease-in-out infinite;
          animation-play-state: ${isPlaying ? "running" : "paused"};
        }
        @keyframes glassesGroove {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          50%      { transform: rotate(3deg) translateY(-2px); }
        }
        .legs {
          position: relative;
          width: 120px;
          height: 34px;
          margin-top: -14px;
          z-index: 1;
        }
        .leg {
          position: absolute;
          bottom: 0;
          width: 16px;
          height: 30px;
          background: #33501C;
          border-radius: 8px;
          transform-origin: top center;
        }
        .leg-left {
          left: 30px;
          animation: kickLeft ${danceSpeed}s ease-in-out infinite;
          animation-play-state: ${isPlaying ? "running" : "paused"};
        }
        .leg-right {
          right: 30px;
          animation: kickRight ${danceSpeed}s ease-in-out infinite;
          animation-play-state: ${isPlaying ? "running" : "paused"};
        }
        @keyframes kickLeft {
          0%, 100% { transform: rotate(18deg) translateY(0); }
          50%      { transform: rotate(-18deg) translateY(-4px); }
        }
        @keyframes kickRight {
          0%, 100% { transform: rotate(-18deg) translateY(-4px); }
          50%      { transform: rotate(18deg) translateY(0); }
        }
        .shadow {
          position: absolute;
          bottom: -8px;
          left: 50%;
          width: 110px;
          height: 20px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%);
          animation: shadowPulse ${danceSpeed}s ease-in-out infinite;
          animation-play-state: ${isPlaying ? "running" : "paused"};
          z-index: 0;
        }
        @keyframes shadowPulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.5; }
          25%      { transform: translateX(-50%) scale(0.72); opacity: 0.3; }
          50%      { transform: translateX(-50%) scale(1); opacity: 0.5; }
        }
        .note {
          position: absolute;
          font-size: 26px;
          font-weight: 700;
          opacity: 0;
          animation: floatUp 2.4s ease-in infinite;
          animation-play-state: ${isPlaying ? "running" : "paused"};
          z-index: 3;
        }
        .note1 { left: 18%; top: 45%; animation-delay: 0s; color: #FF6B9D; }
        .note2 { right: 16%; top: 40%; animation-delay: 0.8s; color: #3AD6C9; }
        .note3 { left: 8%; top: 60%; animation-delay: 1.6s; color: #FFD23F; }
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(0) rotate(-10deg) scale(0.8); }
          15%  { opacity: 1; }
          70%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-90px) rotate(12deg) scale(1.1); }
        }
      `}</style>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            GuacStar Studio
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 my-auto flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto w-full gap-12 py-8">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-6">
            <Music className="w-3.5 h-3.5" />
            Ultimate Groove Experience
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6">
            One guac-star, <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              dancing all night long.
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
            Welcome to the grooviest corner of the web! Interactive rhythm, custom disco beats, and pure good vibes built for your platform.
          </p>

          {/* Interactive Start Button Stage */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-8">
            <div className="relative inline-flex flex-col items-center">
              
              {/* Speech Bubble */}
              <AnimatePresence>
                {(stage === "active" || stage === "exit") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: -10 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute -top-20 bg-white px-4 py-2 rounded-2xl shadow-xl text-xs font-black text-slate-900 whitespace-nowrap z-30 pointer-events-none"
                  >
                    {stage === "exit" ? activeFruit.exitText : activeFruit.greetingText}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Peeking & Jumping Mascot Container */}
              <div className="relative flex items-center justify-center">
                <AnimatePresence>
                  {stage !== "hidden" && (
                    <motion.div
                      initial={{ y: 55, opacity: 0.9 }}
                      animate={
                        stage === "peek"
                          ? { y: 55, rotate: [0, 2, -2, 0] }
                          : stage === "jump"
                          ? { y: [55, -110, 0], scaleX: [0.8, 1.25, 0.9, 1], scaleY: [1.2, 0.75, 1.1, 1] }
                          : stage === "exit"
                          ? { y: 65, opacity: 0 }
                          : { y: 0 }
                      }
                      transition={
                        stage === "jump"
                          ? { duration: 0.6, times: [0, 0.5, 1], ease: "easeOut" }
                          : stage === "peek"
                          ? { rotate: { repeat: Infinity, duration: 3 } }
                          : { type: "spring", stiffness: 300, damping: 20 }
                      }
                      className="absolute -top-28 z-20 cursor-pointer pointer-events-none"
                    >
                      <MascotSVG
                        fruit={activeFruit}
                        mousePos={mousePos}
                        isWaving={isWaving}
                        isBlinking={isBlinking}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Action Button */}
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleStartParty}
                  className="relative z-10 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-extrabold text-base shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all cursor-pointer"
                >
                  Start The Party ➔
                </motion.button>
              </div>
            </div>

            {/* Tempo Selector Controls */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-full">
              <span className="text-xs font-semibold px-2 text-slate-400">Tempo:</span>
              <button
                onClick={() => setDanceSpeed(0.8)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${danceSpeed === 0.8 ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
              >
                Chill
              </button>
              <button
                onClick={() => setDanceSpeed(0.6)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${danceSpeed === 0.6 ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
              >
                Groove
              </button>
              <button
                onClick={() => setDanceSpeed(0.35)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${danceSpeed === 0.35 ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"}`}
              >
                Hyper
              </button>
            </div>
          </div>
        </div>

        {/* Disco Stage Right Column */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-[340px] h-[380px] flex items-end justify-center">
            <div 
              className="absolute bottom-0 left-1/2 w-[340px] h-[160px] grid grid-cols-6 grid-rows-4 gap-[3px] rounded-xl overflow-hidden pointer-events-none"
              style={{ transform: "translateX(-50%) perspective(400px) rotateX(55deg)" }}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="tile"
                  style={{ animationDelay: `${(i % 6) * 0.18}s`, animationPlayState: isPlaying ? "running" : "paused" }}
                />
              ))}
            </div>

            <div className="glow" style={{ animationPlayState: isPlaying ? "running" : "paused" }} />

            {/* Dancing Disco Avocado */}
            <div className="avo-rig">
              <svg className="avo" viewBox="0 0 220 260" width="220" height="260" xmlns="http://www.w3.org/2000/svg">
                <g className="arm-left">
                  <path d="M70 140 C 30 130, 10 150, 4 178" stroke="#5C7A3B" strokeWidth="16" strokeLinecap="round" fill="none" />
                  <circle cx="4" cy="178" r="10" fill="#5C7A3B" />
                </g>
                <g className="arm-right">
                  <path d="M150 140 C 190 130, 210 150, 216 178" stroke="#5C7A3B" strokeWidth="16" strokeLinecap="round" fill="none" />
                  <circle cx="216" cy="178" r="10" fill="#5C7A3B" />
                </g>
                <path
                  d="M110 10 C 45 10, 22 95, 30 150 C 37 205, 68 250, 110 250 C 152 250, 183 205, 190 150 C 198 95, 175 10, 110 10 Z"
                  fill="url(#skinGradient)"
                  stroke="#3F5C26"
                  strokeWidth="4"
                />
                <path
                  d="M110 26 C 58 26, 40 98, 47 148 C 53 196, 78 232, 110 232 C 142 232, 167 196, 173 148 C 180 98, 162 26, 110 26 Z"
                  fill="url(#fleshGradient)"
                />
                <ellipse cx="110" cy="148" rx="40" ry="42" fill="url(#pitGradient)" />
                <ellipse cx="96" cy="132" rx="10" ry="7" fill="#B98A4E" opacity="0.6" />
                <g className="face">
                  <g className="glasses">
                    <rect x="82" y="138" width="24" height="14" rx="6" fill="#1A1A1A" />
                    <rect x="114" y="138" width="24" height="14" rx="6" fill="#1A1A1A" />
                    <rect x="106" y="142" width="8" height="4" fill="#1A1A1A" />
                    <line x1="82" y1="142" x2="70" y2="138" stroke="#1A1A1A" strokeWidth="3" />
                    <line x1="138" y1="142" x2="150" y2="138" stroke="#1A1A1A" strokeWidth="3" />
                  </g>
                  <path d="M96 168 Q110 180 124 168" stroke="#3F2B14" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <circle cx="86" cy="162" r="5" fill="#E8A57A" opacity="0.6" />
                  <circle cx="134" cy="162" r="5" fill="#E8A57A" opacity="0.6" />
                </g>
                <defs>
                  <linearGradient id="skinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4E7A2E" />
                    <stop offset="100%" stopColor="#33501C" />
                  </linearGradient>
                  <linearGradient id="fleshGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C8E08C" />
                    <stop offset="100%" stopColor="#9FC35F" />
                  </linearGradient>
                  <radialGradient id="pitGradient" cx="35%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#C79A5B" />
                    <stop offset="100%" stopColor="#8A5A2B" />
                  </radialGradient>
                </defs>
              </svg>
              <div className="legs">
                <div className="leg leg-left" />
                <div className="leg leg-right" />
              </div>
              <div className="shadow" />
            </div>

            <span className="note note1">♪</span>
            <span className="note note2">♫</span>
            <span className="note note3">♪</span>
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center py-4 border-t border-slate-900 text-slate-500 text-xs font-medium">
        © {new Date().getFullYear()} GuacStar Studio. Built with React, Framer Motion & Tailwind CSS.
      </footer>
    </div>
  );
}