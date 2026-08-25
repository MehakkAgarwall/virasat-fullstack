// Virāsat dimensional interaction: camera-like parallax keeps cultural imagery tactile and refined, never game-like.
import { useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

export function VirasatDepthSurface({ children, className = "", intensity = 5 }: { children: ReactNode; className?: string; intensity?: number }) {
  const [style, setStyle] = useState<CSSProperties>({});
  const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || reduceMotion()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setStyle({
      transform: `perspective(1100px) rotateX(${(0.5 - y) * intensity}deg) rotateY(${(x - 0.5) * intensity}deg) translateZ(0)`,
      "--virasat-glint-x": `${x * 100}%`,
      "--virasat-glint-y": `${y * 100}%`,
    } as CSSProperties);
  };
  return <div className={`virasat-depth-surface ${className}`} style={style} onPointerMove={handleMove} onPointerLeave={() => setStyle({})}>{children}</div>;
}
