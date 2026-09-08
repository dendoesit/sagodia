"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import {
  sfxFanfare,
  sfxMiss,
  sfxPop,
  speakExclusive,
  vibrate,
} from "@/lib/audio";
import { numberWord } from "@/lib/content";
import { useSettings } from "@/lib/settings";

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

/** One row of dots per ten pops, so the counter reads as progress, not a cap. */
const STEP = 10;
const SLOTS = 5;

type Balloon = {
  key: number;
  left: number;
  color: string;
  duration: number;
  delay: number;
  spin: number;
  size: number;
  /** Escaping does not cost anything: true for the balloons already mid-air
   *  when the game opens, which nobody had a fair chance to pop. */
  grace: boolean;
};

let nextKey = 1;

/**
 * `spread` gives the first batch a negative delay so the balloons are already
 * scattered up the screen when the child arrives, instead of piled at the
 * bottom waiting to launch.
 */
function makeBalloon(index: number, spread = false): Balloon {
  // Slow: a missed balloon now resets the count, so every balloon has to be
  // reachable by a three-year-old who spots it late.
  const duration = 13 + Math.random() * 7;
  return {
    key: nextKey++,
    // Stride 29 keeps consecutive slots apart, so the staggered start does not
    // line the balloons up in a diagonal.
    left: 3 + ((index * 29 + Math.random() * 10) % 78),
    color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
    duration,
    delay: spread ? -(index / SLOTS) * duration : Math.random() * 1.5,
    spin: (Math.random() - 0.5) * 24,
    size: 20 + Math.random() * 8,
    grace: spread,
  };
}

function BalloonArt({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 100 140"
      className="h-full w-full drop-shadow-md"
      aria-hidden
    >
      <path
        d="M50 104 q10 18 -4 34 q-2 -18 -8 -22"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <ellipse
        cx={50}
        cy={54}
        rx={42}
        ry={50}
        fill={color}
        stroke="#00000022"
        strokeWidth={3}
      />
      <path
        d="M42 102 L58 102 L50 114 Z"
        fill={color}
        stroke="#00000022"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <ellipse cx={34} cy={34} rx={11} ry={15} fill="#FFFFFF" opacity={0.45} />
      <circle cx={38} cy={52} r={5} fill="#2F2A26" />
      <circle cx={62} cy={52} r={5} fill="#2F2A26" />
      <path
        d="M38 70 q12 12 24 0"
        fill="none"
        stroke="#2F2A26"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BalloonGame({ onHome }: { onHome: () => void }) {
  const { showWords } = useSettings();
  const [balloons, setBalloons] = useState<Balloon[]>(() =>
    Array.from({ length: SLOTS }, (_, i) => makeBalloon(i, true)),
  );
  const [bursts, setBursts] = useState<
    { key: number; x: number; y: number; color: string }[]
  >([]);
  const [count, setCount] = useState(0);
  const [best, setBest] = useState(0);
  const [missed, setMissed] = useState(0);
  const [party, setParty] = useState(0);
  const burstTimers = useRef<number[]>([]);

  useEffect(
    () => () => burstTimers.current.forEach((id) => window.clearTimeout(id)),
    [],
  );

  const replace = useCallback((key: number, index: number) => {
    setBalloons((current) =>
      current.map((balloon) =>
        balloon.key === key ? makeBalloon(index) : balloon,
      ),
    );
  }, []);

  const pop = (balloon: Balloon, index: number, rect: DOMRect) => {
    const next = count + 1;
    const word = numberWord(next);
    const milestone = next % STEP === 0;
    // Narration may skip a number when the child pops very quickly, but play
    // never freezes behind the voice. The old early return made every balloon
    // ignore taps until the previous number had finished.
    speakExclusive(
      milestone ? [`${word}!`, "Wow!"] : [word],
    );

    sfxPop();
    vibrate(20);
    if (milestone) {
      sfxFanfare();
      setParty((n) => n + 1);
    }
    setCount(next);
    setBest((current) => Math.max(current, next));

    setBursts((current) => [
      ...current,
      {
        key: balloon.key,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        color: balloon.color,
      },
    ]);
    burstTimers.current.push(
      window.setTimeout(
        () => setBursts((current) => current.filter((b) => b.key !== balloon.key)),
        520,
      ),
    );

    replace(balloon.key, index);
  };

  /** A balloon reaching the top ends the streak and starts the count over. */
  const escape = (balloon: Balloon, index: number) => {
    replace(balloon.key, index);
    if (balloon.grace) return;
    if (count > 0) {
      sfxMiss();
      setMissed((n) => n + 1);
      speakExclusive(count >= 5 ? ["Oh! Let's count again."] : ["Try again!"]);
    }
    setCount(0);
  };

  const dots = count === 0 ? 0 : count % STEP === 0 ? STEP : count % STEP;

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
            <span
              key={`${count}-${missed}`}
              className={`text-3xl font-bold tabular-nums sm:text-4xl ${
                count === 0 && missed > 0 ? "anim-wiggle text-[#E4574C]" : ""
              }`}
            >
              {count}
            </span>
            {showWords && count > 0 ? (
              <span
                key={count}
                className="anim-word text-xl font-bold text-[#1F8880] sm:text-2xl"
              >
                {numberWord(count)}
              </span>
            ) : null}
            <span className="flex flex-nowrap gap-0.5 sm:gap-1">
              {Array.from({ length: STEP }, (_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition-colors sm:h-4 sm:w-4 ${
                    i < dots ? "bg-[#F79420]" : "bg-[#2F2A26]/15"
                  }`}
                />
              ))}
            </span>
            {best > 0 ? (
              <span className="flex items-center gap-0.5 text-base font-bold text-[#F79420] tabular-nums sm:text-xl">
                <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden>
                  <path
                    d="M12 2.6 L14.9 9 L21.6 9.7 L16.6 14.2 L18 20.8 L12 17.4 L6 20.8 L7.4 14.2 L2.4 9.7 L9.1 9 Z"
                    fill="#F79420"
                  />
                </svg>
                {best}
              </span>
            ) : null}
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
              onAnimationEnd={() => escape(balloon, index)}
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
