"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkle } from "@/components/art/friends";

const CONFETTI_COLORS = [
  "#E4574C",
  "#FFD22E",
  "#4F8FE0",
  "#5FAF4E",
  "#8E5BC4",
  "#FF8FB1",
  "#4FC3B4",
];

type Piece = {
  id: number;
  left: number;
  drift: number;
  spin: number;
  delay: number;
  duration: number;
  color: string;
  round: boolean;
  size: number;
};

function buildPieces(count: number, seed: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: seed * 1000 + i,
    left: Math.random() * 100,
    drift: (Math.random() - 0.5) * 220,
    spin: 360 + Math.random() * 720,
    delay: Math.random() * 0.5,
    duration: 1.8 + Math.random() * 1.4,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: Math.random() > 0.5,
    size: 10 + Math.random() * 14,
  }));
}

/**
 * Full-screen praise. `trigger` is a counter so the same celebration can fire
 * again immediately.
 */
export function Celebration({ trigger, big = false }: { trigger: number; big?: boolean }) {
  const [finished, setFinished] = useState(0);
  const visible = trigger !== 0 && trigger !== finished;

  useEffect(() => {
    if (trigger === 0) return;
    const timer = window.setTimeout(() => setFinished(trigger), big ? 3400 : 2600);
    return () => window.clearTimeout(timer);
  }, [trigger, big]);

  const pieces = useMemo(() => buildPieces(big ? 60 : 34, trigger), [trigger, big]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="anim-confetti absolute top-0 block"
          style={
            {
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.size * (piece.round ? 1 : 0.5),
              background: piece.color,
              borderRadius: piece.round ? "9999px" : "3px",
              animationDelay: `${piece.delay}s`,
              "--drift": `${piece.drift}px`,
              "--spin": `${piece.spin}deg`,
              "--dur": `${piece.duration}s`,
            } as React.CSSProperties
          }
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkle className="anim-burst h-32 w-32" />
      </div>
    </div>
  );
}
