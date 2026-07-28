import { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
}

/**
 * Tracks the mouse (or last touch point) relative to the center of the
 * given element, clamped to [-1, 1] on each axis. Returns {x: 0, y: 0}
 * when the pointer hasn't moved yet or on touch-only devices with no
 * active touch, so callers can safely use it to offset pupils.
 */
export function useMousePosition(
  containerRef: React.RefObject<HTMLElement>,
  enabled: boolean = true
): Point {
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setPosition({ x: 0, y: 0 });
      return;
    }

    const updateFromClient = (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;

      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (clientX - cx) / (rect.width / 2 || 1);
        const dy = (clientY - cy) / (rect.height / 2 || 1);
        setPosition({
          x: Math.max(-1, Math.min(1, dx)),
          y: Math.max(-1, Math.min(1, dy)),
        });
      });
    };

    const onMouseMove = (e: MouseEvent) => updateFromClient(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) updateFromClient(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [containerRef, enabled]);

  return position;
}