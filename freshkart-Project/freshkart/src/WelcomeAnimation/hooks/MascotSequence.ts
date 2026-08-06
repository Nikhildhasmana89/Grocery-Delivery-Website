import { useCallback, useEffect, useRef, useState } from "react";

export type MascotPhase =
  | "hidden" // only a sliver (one eye / leaf tip) peeking from the button
  | "compress" // button squashes on click (anticipation)
  | "peek" // fruit slowly peeks out further
  | "jump" // fruit leaps out from behind the button
  | "land" // fruit lands on top of the button, settles
  | "idle" // fully out: waving, blinking, speech bubble, eyes track cursor
  | "goodbye" // waves goodbye, speech bubble swaps to the goodbye line
  | "retreat"; // jumps backward and slides behind the button

interface SequenceTimings {
  compressMs: number;
  peekMs: number;
  jumpMs: number;
  landMs: number;
  /** idle window is randomized between these two bounds */
  idleMinMs: number;
  idleMaxMs: number;
  goodbyeMs: number;
  retreatMs: number;
}

const DEFAULT_TIMINGS: SequenceTimings = {
  compressMs: 150,
  peekMs: 300,
  jumpMs: 500,
  landMs: 300,
  idleMinMs: 6000,
  idleMaxMs: 8000,
  goodbyeMs: 700,
  retreatMs: 450,
};

/**
 * Drives the mascot through its full lifecycle:
 * hidden -> compress -> peek -> jump -> land -> idle -> goodbye -> retreat -> hidden
 *
 * Only `trigger()` while phase === "hidden" starts a run; calls during
 * any other phase are ignored so rapid clicking can't desync the timeline.
 */
export function useMascotSequence(timings: Partial<SequenceTimings> = {}) {
  const t = { ...DEFAULT_TIMINGS, ...timings };
  const [phase, setPhase] = useState<MascotPhase>("hidden");
  const [runId, setRunId] = useState(0);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = () => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
  };

  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timeoutIds.current.push(id);
  };

  const trigger = useCallback(() => {
    setPhase((current) => {
      if (current !== "hidden") return current;
      return "compress";
    });
  }, []);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  useEffect(() => {
    clearAllTimeouts();

    if (phase === "compress") {
      after(t.compressMs, () => setPhase("peek"));
    } else if (phase === "peek") {
      after(t.peekMs, () => setPhase("jump"));
    } else if (phase === "jump") {
      after(t.jumpMs, () => setPhase("land"));
    } else if (phase === "land") {
      after(t.landMs, () => setPhase("idle"));
    } else if (phase === "idle") {
      const idleDuration = t.idleMinMs + Math.random() * (t.idleMaxMs - t.idleMinMs);
      after(idleDuration, () => setPhase("goodbye"));
    } else if (phase === "goodbye") {
      after(t.goodbyeMs, () => setPhase("retreat"));
    } else if (phase === "retreat") {
      after(t.retreatMs, () => {
        setPhase("hidden");
        setRunId((n) => n + 1); // lets consumers reset per-run state (e.g. particles)
      });
    }

    return () => clearAllTimeouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const isOut = phase !== "hidden" && phase !== "compress";
  const isIdle = phase === "idle" || phase === "goodbye";
  const showSpeechBubble = phase === "idle" || phase === "goodbye";

  return { phase, trigger, runId, isOut, isIdle, showSpeechBubble };
}