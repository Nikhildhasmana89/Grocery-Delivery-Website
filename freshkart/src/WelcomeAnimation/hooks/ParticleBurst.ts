import { useEffect, useState } from "react";

export interface Particle {
  id: string;
  symbol: string;
  tx: number; // end x offset in px
  ty: number; // end y offset in px
  rot: number; // end rotation in deg
  delay: number; // seconds
  duration: number; // seconds
  size: number; // px
}

const SPARKLE_SYMBOLS = ["\u2728", "\u2b50"]; // ✨ ⭐
const LEAF_SYMBOLS = ["\ud83c\udf43"]; // 🍃
const HEART_SYMBOLS = ["\ud83d\udc95", "\ud83d\udc96"]; // 💕 💖

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function buildBurst(seed: number): Particle[] {
  const count = 10 + Math.floor(Math.random() * 5); // 10-14 particles
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = randomBetween(0, Math.PI * 2);
    const distance = randomBetween(46, 108);
    const pool =
      i % 5 === 0 ? HEART_SYMBOLS : i % 2 === 0 ? SPARKLE_SYMBOLS : LEAF_SYMBOLS;
    particles.push({
      id: `${seed}-${i}`,
      symbol: pool[Math.floor(Math.random() * pool.length)],
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance - 20,
      rot: randomBetween(-160, 160),
      delay: randomBetween(0, 0.12),
      duration: randomBetween(0.6, 1.0),
      size: randomBetween(14, 22),
    });
  }

  return particles;
}

/**
 * Produces a fresh particle burst every time `active` flips from
 * false -> true, and clears itself once the longest particle animation
 * would have finished.
 */
export function useParticleBurst(active: boolean, runId: number): Particle[] {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const burst = buildBurst(runId);
    setParticles(burst);

    const maxLifetime = Math.max(...burst.map((p) => p.delay + p.duration)) * 1000;
    const clearTimer = setTimeout(() => setParticles([]), maxLifetime + 100);

    return () => clearTimeout(clearTimer);
  }, [active, runId]);

  return particles;
}