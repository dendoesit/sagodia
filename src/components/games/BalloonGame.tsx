"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { WordBubble, useWordBubble } from "@/components/ui/WordBubble";
import { sfxFanfare, sfxPop, speak, vibrate } from "@/lib/audio";
import { NUMBER_WORDS } from "@/lib/content";

const BALLOON_COLORS = [
  "#E4574C",
  "#4F8FE0",
  "#FFD22E",
  "#5FAF4E",
  "#8E5BC4",
  "#FF8FB1",
  "#4FC3B4",
  "#F79420",
];

const GOAL = NUMBER_WORDS.length;
const SLOTS = 7;

type Balloon = {
  key: number;
  left: number;
  color: string;
  duration: number;
  delay: number;
  spin: number;
  size: number;
};

let nextKey = 1;

function makeBalloon(index: number): Balloon {
  return {
    key: nextKey++,
    left: 4 + ((index * 13 + Math.random() * 9) % 82),
    color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
    duration: 9 + Math.random() * 7,
    delay: Math.random() * 5,
    spin: (Math.random() - 0.5) * 24,
    size: 20 + Math.random() * 8,
  };
}

function BalloonArt({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 140" className="h-full w-full drop-shadow-md" aria-hidden>
      <path d="M50 104 q10 18 -4 34 q-2 -18 -8 -22" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={50} cy={54} rx={42} ry={50} fill={color} stroke="#00000022" strokeWidth={3} />
      <path d="M42 102 L58 102 L50 114 Z" fill={color} stroke="#00000022" strokeWidth={2} strokeLinejoin="round" />
      <ellipse cx={34} cy={34} rx={11} ry={15} fill="#FFFFFF" opacity={0.45} />
      <circle cx={38} cy={52} r={5} fill="#2F2A26" />
      <circle cx={62} cy={52} r={5} fill="#2F2A26" />
      <path d="M38 70 q12 12 24 0" fill="none" stroke="#2F2A26" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

export function BalloonGame({ onHome }: { onHome: () => void }) {
  const { bubble, showWord } = useWordBubble();
  const [balloons, setBalloons] = useState<Balloon[]>(() =>
    Array.from({ length: SLOTS }, (_, i) => makeBalloon(i)),
  );
  const [bursts, setBursts] = useState<{ key: number; x: number; y: number; color: string }[]>([]);
  const [count, setCount] = useState(0);
  const [party, setParty] = useState(0);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const replace = useCallback((key: number, index: number) => {
    setBalloons((current) =>
      current.map((balloon) =>
        balloon.key === key ? { ...makeBalloon(index), delay: 0 } : balloon,
      ),
    );
  }, []);

  const pop = (balloon: Balloon, index: number, rect: DOMRect) => {
    sfxPop();
    vibrate(20);
    setBursts((current) => [
      ...current,
      {
        key: balloon.key,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        color: balloon.color,
      },
    ]);
    window.setTimeout(
      () => setBursts((current) => current.filter((b) => b.key !== balloon.key)),
      520,
    );

    const next = count + 1;
    setCount(next);
    showWord(NUMBER_WORDS[next - 1]);

    if (next >= GOAL) {
      sfxFanfare();
      setParty((n) => n + 1);
      speak(`${NUMBER_WORDS[next - 1]}! You counted to ten!`);
      resetTimer.current = window.setTimeout(() => setCount(0), 3200);
    } else {
      speak(NUMBER_WORDS[next - 1]);
    }

    replace(balloon.key, index);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#BFF0EA] to-[#2FA9A0]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-14 w-28 rounded-full bg-white/60 blur-[2px]" />
        <div className="absolute right-[12%] top-[26%] h-10 w-24 rounded-full bg-white/50 blur-[2px]" />
      </div>

      <PlaceFrame
        onHome={onHome}
        prompt={
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold tabular-nums sm:text-4xl">{count}</span>
            <span className="flex max-w-40 flex-wrap gap-1">
              {Array.from({ length: GOAL }, (_, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full transition-colors sm:h-4 sm:w-4 ${
                    i < count ? "bg-[#F79420]" : "bg-[#2F2A26]/15"
                  }`}
                />
              ))}
            </span>
          </div>
        }
      >
        <div className="relative min-h-0 flex-1">
          {balloons.map((balloon, index) => (
            <button
              key={balloon.key}
              type="button"
              aria-label="Pop the balloon"
              onPointerDown={(event) => {
                event.preventDefault();
                pop(balloon, index, event.currentTarget.getBoundingClientRect());
              }}
              onAnimationEnd={() => replace(balloon.key, index)}
              className="absolute bottom-0 block"
              style={
                {
                  left: `${balloon.left}%`,
                  width: `${balloon.size}vmin`,
                  height: `${balloon.size * 1.4}vmin`,
                  animation: `rise ${balloon.duration}s linear ${balloon.delay}s forwards`,
                  "--spin": `${balloon.spin}deg`,
                } as React.CSSProperties
              }
            >
              <BalloonArt color={balloon.color} />
            </button>
          ))}
        </div>
        <WordBubble bubble={bubble} tone="#1F8880" />
      </PlaceFrame>

      {bursts.map((burst) => (
        <span
          key={burst.key}
          className="anim-burst pointer-events-none fixed z-40 block h-16 w-16 rounded-full"
          style={{
            left: burst.x - 32,
            top: burst.y - 32,
            border: `8px solid ${burst.color}`,
          }}
        />
      ))}

      <Celebration trigger={party} big />
    </div>
  );
}
