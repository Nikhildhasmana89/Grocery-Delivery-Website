"use client";

import React, { useEffect, useRef, useState } from "react";
import { MASCOTS, Mascot, pickRandomMascot } from "./mascots";
import FruitFace from "./FruitFace";
import SpeechBubble from "./SpeechBubble";
import { useMascotSequence } from "../hooks/MascotSequence";
import { useMousePosition } from "../hooks/MousePosition";
import { useBlink } from "../hooks/Blink";
import { useParticleBurst } from "../hooks/ParticleBurst";

export interface FruitMascotTimings {
  compressMs?: number;
  peekMs?: number;
  jumpMs?: number;
  landMs?: number;
  idleMinMs?: number;
  idleMaxMs?: number;
  goodbyeMs?: number;
  retreatMs?: number;
}

export interface FruitMascotButtonProps {
  /** Button label. Defaults to "Start". */
  label?: string;
  /** Fires the moment the button is clicked (animation plays independently). */
  onStart?: () => void;
  /** Fires once the whole reveal -> idle -> hide sequence finishes. */
  onSequenceComplete?: () => void;
  /** Force a specific mascot instead of a random one per mount. */
  species?: Mascot["id"];
  /** Override any phase duration — handy to shorten "idle" if you navigate away shortly after click. */
  timings?: FruitMascotTimings;
  className?: string;
}

export default function FruitMascotButton({
  label = "Start",
  onStart,
  onSequenceComplete,
  species,
  timings,
  className = "",
}: FruitMascotButtonProps) {
  const [mascot] = useState<Mascot>(() => (species ? MASCOTS[species] : pickRandomMascot()));
  const rigRef = useRef<HTMLDivElement>(null);
  const [isWaving, setIsWaving] = useState(false);

  const { phase, trigger, runId, isOut, showSpeechBubble } = useMascotSequence(timings);

  const pupilOffset = useMousePosition(rigRef as React.RefObject<HTMLElement>, phase !== "hidden");
  const isBlinking = useBlink(isOut);
  const particles = useParticleBurst(phase === "jump", runId);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (phase !== "hidden") hasStarted.current = true;
    else if (hasStarted.current) {
      hasStarted.current = false;
      onSequenceComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Wave every ~2 seconds while fully idle (not during the goodbye wave)
  useEffect(() => {
    if (phase !== "idle") {
      setIsWaving(false);
      return;
    }
    const waveLoop = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 800);
    }, 2000);
    return () => clearInterval(waveLoop);
  }, [phase]);

  const handleClick = () => {
    trigger();
    onStart?.();
  };

  const { personality, palette } = mascot;

  const waveTuning =
    personality.waveStyle === "big"
      ? { amplitude: "-46deg", iterations: 3 }
      : personality.waveStyle === "double"
      ? { amplitude: "-38deg", iterations: 4 }
      : { amplitude: "-26deg", iterations: 2 };

  const rigStyle: React.CSSProperties = {
    ["--jump-height" as any]: `${personality.jumpHeight}px`,
    ["--bounce-amount" as any]: `${personality.bounceAmount}px`,
    ["--wave-speed" as any]: `${personality.waveSpeed}s`,
    ["--wave-amplitude" as any]: waveTuning.amplitude,
    ["--wave-iterations" as any]: waveTuning.iterations,
    ["--accent-color" as any]: palette.accent,
  };

  return (
    <div className={`fruit-mascot-wrap ${className}`}>
      <style>{`
        .fruit-mascot-wrap {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          isolation: isolate;
        }

        .fruit-mascot-stage {
          position: relative;
          width: clamp(160px, 40vw, 220px);
          height: clamp(120px, 30vw, 165px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .fruit-shadow {
          position: absolute;
          bottom: -6px;
          left: 50%;
          width: 90px;
          height: 16px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 72%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
          pointer-events: none;
        }
        [data-phase="peek"] .fruit-shadow,
        [data-phase="jump"] .fruit-shadow,
        [data-phase="land"] .fruit-shadow,
        [data-phase="idle"] .fruit-shadow,
        [data-phase="goodbye"] .fruit-shadow,
        [data-phase="retreat"] .fruit-shadow {
          opacity: 1;
        }

        .fruit-rig {
          position: absolute;
          bottom: 46px;
          left: 50%;
          width: 150px;
          height: 165px;
          transform: translate(-50%, 40px) scale(0.25);
          opacity: 0;
          transform-origin: bottom center;
          pointer-events: none;
          z-index: 3;
        }

        [data-phase="peek"] .fruit-rig {
          animation: mascotPeek 0.3s ease-out forwards;
        }
        [data-phase="jump"] .fruit-rig {
          animation: mascotJump 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        [data-phase="land"] .fruit-rig {
          animation: mascotLand 0.3s ease-out forwards;
        }
        [data-phase="idle"] .fruit-rig {
          animation: mascotIdleBounce 2.2s ease-in-out infinite;
        }
        [data-phase="goodbye"] .fruit-rig {
          animation: mascotIdleBounce 2.2s ease-in-out infinite;
        }
        [data-phase="retreat"] .fruit-rig {
          animation: mascotRetreat 0.45s ease-in forwards;
        }

        @keyframes mascotPeek {
          0%   { transform: translate(-50%, 40px) scale(0.25); opacity: 0; }
          100% { transform: translate(-50%, 18px) scale(0.55) rotate(-3deg); opacity: 1; }
        }
        @keyframes mascotJump {
          0%   { transform: translate(-50%, 18px) scale(0.55, 0.6); opacity: 1; }
          35%  { transform: translate(-50%, calc(-1 * var(--jump-height) * 1.15)) scale(0.95, 1.12); opacity: 1; }
          65%  { transform: translate(-50%, calc(-1 * var(--jump-height) * 0.85)) scale(1.05, 0.94); opacity: 1; }
          100% { transform: translate(-50%, 0) scale(1, 1); opacity: 1; }
        }
        @keyframes mascotLand {
          0%   { transform: translate(-50%, 0) scale(1.08, 0.88); opacity: 1; }
          50%  { transform: translate(-50%, -6px) scale(0.96, 1.05); opacity: 1; }
          100% { transform: translate(-50%, 0) scale(1, 1); opacity: 1; }
        }
        @keyframes mascotIdleBounce {
          0%, 100% { transform: translate(-50%, 0) scale(1, 1); opacity: 1; }
          50%      { transform: translate(-50%, calc(-1 * var(--bounce-amount))) scale(1.015, 0.99); opacity: 1; }
        }
        @keyframes mascotRetreat {
          0%   { transform: translate(-50%, 0) scale(1, 1); opacity: 1; }
          40%  { transform: translate(-50%, -22px) scale(0.85, 1.1); opacity: 1; }
          100% { transform: translate(-50%, 34px) scale(0.2, 0.3); opacity: 0; }
        }

        .fruit-svg { display: block; overflow: visible; }

        .mascot-body { position: relative; }

        .eye { transform-origin: center; transform-box: fill-box; transition: transform 0.08s ease; }
        .eye-blink { transform: scaleY(0.08); }

        .arm-left { transform-origin: 56px 128px; }
        .arm-right { transform-origin: 144px 128px; }

        [data-phase="idle"] .mascot-body .arm-left,
        [data-phase="goodbye"] .mascot-body .arm-left {
          animation: armIdleSway calc(var(--wave-speed) * 3.4) ease-in-out infinite;
        }
        @keyframes armIdleSway {
          0%, 100% { transform: rotate(-4deg); }
          50%      { transform: rotate(4deg); }
        }

        [data-phase="idle"] .mascot-body .arm-right {
          animation: armIdleSway calc(var(--wave-speed) * 3.6) ease-in-out infinite;
          animation-delay: 0.15s;
        }
        [data-phase="idle"] .mascot-body.waving .arm-right,
        [data-phase="goodbye"] .mascot-body .arm-right {
          animation-name: armWave;
          animation-duration: var(--wave-speed);
          animation-timing-function: ease-in-out;
          animation-iteration-count: var(--wave-iterations, 3);
        }
        @keyframes armWave {
          0%, 100% { transform: rotate(0deg); }
          50%      { transform: rotate(var(--wave-amplitude, -42deg)); }
        }

        [data-phase="idle"] .mascot-body.mascot-rig--big-wave.waving .arm-left,
        [data-phase="goodbye"] .mascot-rig--big-wave .arm-left {
          animation-name: armWave !important;
          animation-duration: var(--wave-speed) !important;
          animation-timing-function: ease-in-out !important;
          animation-iteration-count: var(--wave-iterations, 3) !important;
        }

        [data-phase="idle"] .legs .leg,
        [data-phase="goodbye"] .legs .leg {
          animation: legIdleSway 1.8s ease-in-out infinite;
        }
        .leg-left { animation-delay: 0s; }
        .leg-right { animation-delay: 0.3s; }
        @keyframes legIdleSway {
          0%, 100% { transform: rotate(-3deg); }
          50%      { transform: rotate(3deg); }
        }

        .legs {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 26px;
          z-index: 2;
        }
        .leg {
          position: absolute;
          bottom: 0;
          width: 14px;
          height: 24px;
          background: var(--accent-color);
          border-radius: 7px;
          transform-origin: top center;
        }
        .leg-left { left: 22px; }
        .leg-right { right: 22px; }

        .peek-indicator {
          position: absolute;
          bottom: 44px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          opacity: 0;
          transition: opacity 0.15s ease;
          pointer-events: none;
          z-index: 2;
        }
        [data-phase="hidden"] .peek-indicator {
          opacity: 1;
          animation: peekCurious 2.6s ease-in-out infinite;
        }
        @keyframes peekCurious {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(-3px); }
        }

        .fruit-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 4;
        }
        .fruit-particle {
          position: absolute;
          left: 50%;
          bottom: 50px;
          font-size: var(--p-size, 16px);
          transform: translate(-50%, 0);
          animation: particleFly var(--p-duration, 0.8s) ease-out var(--p-delay, 0s) forwards;
        }
        @keyframes particleFly {
          0%   { opacity: 0; transform: translate(-50%, 0) rotate(0deg) scale(0.4); }
          15%  { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--p-tx)), var(--p-ty)) rotate(var(--p-rot)) scale(1); }
        }

        .fruit-start-btn {
          position: relative;
          z-index: 2;
          padding: 0.9rem 2.2rem;
          border-radius: 999px;
          border: none;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          color: #1a1a1a;
          background: linear-gradient(135deg, ${palette.skinFrom}, ${palette.skinTo});
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
          transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease;
        }
        .fruit-start-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.22); }
        .fruit-start-btn:active,
        [data-phase="compress"] .fruit-start-btn {
          transform: scale(0.92);
          box-shadow: 0 4px 10px rgba(0,0,0,0.18);
        }
        .fruit-start-btn:disabled { cursor: default; opacity: 0.9; }

        .speech-bubble {
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translate(-50%, -100%);
          background: #ffffff;
          color: #1a1a1a;
          padding: 0.55rem 0.9rem;
          border-radius: 14px;
          font-size: 0.82rem;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 6px 16px rgba(0,0,0,0.18);
          z-index: 5;
          animation: bubblePop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both,
                     bubbleFloat 2.6s ease-in-out 0.3s infinite;
        }
        .speech-bubble__tail {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 12px;
          height: 12px;
          background: #ffffff;
        }
        @keyframes bubblePop {
          0%   { opacity: 0; transform: translate(-50%, -80%) scale(0.4); }
          70%  { opacity: 1; transform: translate(-50%, -104%) scale(1.05); }
          100% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
        }
        @keyframes bubbleFloat {
          0%, 100% { margin-top: 0px; }
          50%      { margin-top: -4px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .fruit-rig, .arm-left, .arm-right, .leg, .fruit-particle, .speech-bubble, .peek-indicator, .fruit-start-btn {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="fruit-mascot-stage" data-phase={phase} ref={rigRef}>
        <div className="fruit-shadow" />

        {/* Sliver peeking from behind the button while hidden */}
        <div className="peek-indicator" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="20" height="20">
            <circle cx="10" cy="10" r="9" fill={palette.skinFrom} stroke={palette.accent} strokeWidth="1.5" />
            <circle cx="10" cy="10" r="4" fill="#241C10" />
          </svg>
        </div>

        {phase === "jump" && (
          <div className="fruit-particles">
            {particles.map((p) => (
              <span
                key={p.id}
                className="fruit-particle"
                style={
                  {
                    "--p-tx": `${p.tx}px`,
                    "--p-ty": `${p.ty}px`,
                    "--p-rot": `${p.rot}deg`,
                    "--p-delay": `${p.delay}s`,
                    "--p-duration": `${p.duration}s`,
                    "--p-size": `${p.size}px`,
                  } as React.CSSProperties
                }
              >
                {p.symbol}
              </span>
            ))}
          </div>
        )}

        <div className="fruit-rig" style={rigStyle}>
          {showSpeechBubble && (
            <SpeechBubble
              text={phase === "goodbye" ? personality.goodbye : personality.greeting}
              variant={phase === "goodbye" ? "goodbye" : "greeting"}
            />
          )}

          <div
            className={
              personality.waveStyle === "big" && isWaving
                ? "mascot-body mascot-rig--big-wave waving"
                : isWaving
                ? "mascot-body waving"
                : "mascot-body"
            }
          >
            <FruitFace
              mascot={mascot}
              isBlinking={isBlinking}
              pupilOffset={isOut ? pupilOffset : { x: 0, y: 0 }}
              isSmiling={isOut}
            />
            <div className="legs">
              <div className="leg leg-left" />
              <div className="leg leg-right" />
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="fruit-start-btn"
        onClick={handleClick}
        disabled={phase !== "hidden"}
        aria-label={`${label} — a ${mascot.label.toLowerCase()} mascot is hiding behind this button`}
      >
        {label}
      </button>
    </div>
  );
}