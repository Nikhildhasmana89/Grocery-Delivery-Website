import { useEffect, useRef, useState } from "react";

/**
 * Returns true for a brief blink window, on a randomized interval, so
 * the character doesn't blink like a metronome. Pass `enabled = false`
 * to pause blinking (e.g. while the mascot is hidden).
 */
export function useBlink(enabled: boolean, minMs: number = 2200, maxMs: number = 5200): boolean {
  const [isBlinking, setIsBlinking] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsBlinking(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const scheduleNext = () => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      timeoutRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNext();
        }, 140);
      }, delay);
    };

    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, minMs, maxMs]);

  return isBlinking;
}