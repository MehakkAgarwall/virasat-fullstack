// Kalā Trail visual system: numerical movement is calm, informative, and optional for visitors who prefer reduced motion.
import { useEffect, useState } from "react";

export function animatedNumberAt(value: number, elapsed: number, duration = 800) {
  const progress = Math.max(0, Math.min(1, elapsed / duration));
  return Math.round(value * (1 - Math.pow(1 - progress, 3)));
}

export function AnimatedNumber({ value, className = "" }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDisplay(value); return; } let frame = 0; const started = performance.now(); const tick = (now: number) => { const elapsed = now - started; const progress = Math.max(0, Math.min(1, elapsed / 800)); setDisplay(animatedNumberAt(value, elapsed)); if (progress < 1) frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [value]);
  return <span className={className}>{new Intl.NumberFormat("en-IN").format(display)}</span>;
}
