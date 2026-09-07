"use client";

import { useCallback, useState } from "react";
import { useSettings } from "@/lib/settings";

export type Bubble = { text: string; n: number };

/** Re-shows the bubble even when the same word is repeated. */
export function useWordBubble() {
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const showWord = useCallback((text: string) => {
    setBubble((previous) => ({ text, n: (previous?.n ?? 0) + 1 }));
  }, []);
  return { bubble, showWord };
}

/**
 * The word that was just spoken, shown large. Three-year-olds cannot read it
 * yet, but pairing sound with print is how whole-word recognition starts, and
 * it lets a parent see what the app said.
 *
 * Rendered in the header strip rather than floating over the play area, so it
 * never covers something the child is about to tap.
 */
export function WordBubble({
  bubble,
  tone = "#2F2A26",
}: {
  bubble: Bubble | null;
  tone?: string;
}) {
  const { showWords } = useSettings();
  if (!showWords || !bubble) return null;
  return (
    <div
      key={bubble.n}
      className="anim-word max-w-full truncate rounded-full bg-white/95 px-5 py-1.5 text-2xl font-bold tracking-wide shadow-lg sm:px-7 sm:py-2 sm:text-4xl"
      style={{ color: tone }}
    >
      {bubble.text}
    </div>
  );
}
