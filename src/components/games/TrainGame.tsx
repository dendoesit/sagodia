"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Locomotive, Track, Wagon } from "@/components/art/train";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { useWordBubble } from "@/components/ui/WordBubble";
import {
  sfxChuffs,
  sfxCouple,
  sfxTap,
  sfxWhistle,
  speakTapped,
  vibrate,
} from "@/lib/audio";
import { numberWord } from "@/lib/content";

const WAGONS = [1, 2, 3, 4];
/** Let the final spoken number finish before the whistle. */
const COUNT_MS = 1100;
const DEPART_MS = 3000;

/** A horizon right behind the train, so the sky is scenery and not dead space. */
function Hills({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path d="M0 34 q26 -22 52 -2 q22 16 44 -6 q26 -20 50 2 q28 22 54 4 L200 60 L0 60 Z" fill="#8FBF6E" />
      <path d="M0 46 q34 -16 68 2 q30 16 62 -2 q36 -18 70 4 L200 60 L0 60 Z" fill="#7FB86A" />
      <g fill="#4F8B4A">
        {[18, 46, 92, 128, 168].map((x, i) => (
          <g key={x} transform={`translate(${x} ${44 + (i % 2) * 4})`}>
            <path d="M0 10 L5 -6 L10 10 Z" />
            <rect x={4} y={9} width={2} height={5} fill="#6B4A32" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Couple the wagons in order and the train leaves the station.
 *
 * Every wagon carries its numeral *and* that many dots, because the dots are
 * what a three-year-old can actually count — the digit only starts to mean
 * something once it has been seen next to four dots enough times.
 */
export function TrainGame({ onHome }: { onHome: () => void }) {
  const { bubble, showWord } = useWordBubble();
  const [yard, setYard] = useState(() => shuffle(WAGONS));
  const [coupled, setCoupled] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [party, setParty] = useState(0);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const reset = useCallback(() => {
    setLeaving(false);
    setCoupled(0);
    setWrong(null);
    setYard(shuffle(WAGONS));
  }, []);

  const next = coupled + 1;

  const handleTap = (value: number) => {
    if (leaving) return;

    if (value !== next) {
      sfxTap();
      vibrate([10, 40, 10]);
      setWrong(value);
      window.setTimeout(() => setWrong((current) => (current === value ? null : current)), 500);
      showWord(numberWord(value));
      speakTapped(`wagon-${value}`, [numberWord(value)]);
      return;
    }

    sfxCouple();
    vibrate(20);
    setYard((current) => current.filter((item) => item !== value));
    setCoupled(value);
    showWord(numberWord(value));

    if (value < WAGONS.length) {
      speakTapped(`wagon-${value}`, [numberWord(value)]);
      return;
    }

    speakTapped(`wagon-${value}`, [numberWord(value)]);
    timers.current.push(
      window.setTimeout(() => {
        sfxWhistle();
        sfxChuffs();
        setLeaving(true);
        setParty((n) => n + 1);
      }, COUNT_MS),
    );
    timers.current.push(
      window.setTimeout(reset, COUNT_MS + DEPART_MS + 600),
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#BBD6F5] to-[#7F9DC9]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[8%] top-[9%] h-24 w-24 rounded-full bg-[#FFE082]/80 blur-[1px]" />
        <div className="absolute left-[8%] top-[26%] h-12 w-28 rounded-full bg-white/60 blur-[2px]" />
        <div className="absolute right-[16%] top-[40%] h-9 w-20 rounded-full bg-white/50 blur-[2px]" />
      </div>

      <PlaceFrame
        onHome={onHome}
        prompt={
          leaving ? (
            "Bye bye, train!"
          ) : (
            <span className="flex items-center gap-2">
              <span>Next:</span>
              <Wagon
                number={next}
                label={`Next is wagon ${next}`}
                className="h-8 w-auto sm:h-10"
              />
            </span>
          )
        }
        bubble={bubble}
        bubbleTone="#3F5F8F"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <Hills className="mt-auto h-[22%] min-h-16 w-full shrink-0" />

          {/* The train sits on its rails and slides off to the right; the rails
            stay put, so it reads as the train moving, not the world. */}
          <div className="relative w-full overflow-hidden px-3">
            <div
              className={`flex w-full items-end justify-start gap-[0.6%] ${
                leaving ? "anim-depart" : ""
              }`}
            >
              <div className="relative h-[min(13vw,20dvh)] shrink-0">
                <Locomotive className="h-full w-auto" title="The engine" />
                {leaving ? (
                  <span className="pointer-events-none absolute left-[16%] top-0 block">
                    {[0, 0.3, 0.6, 0.9].map((delay) => (
                      <span
                        key={delay}
                        className="anim-puff absolute block h-6 w-6 rounded-full bg-white/85"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </span>
                ) : null}
              </div>

              {WAGONS.slice(0, coupled).map((value) => (
                <Wagon
                  key={value}
                  number={value}
                  className="anim-couple h-[min(13vw,20dvh)] w-auto shrink-0"
                />
              ))}

              {!leaving &&
                WAGONS.slice(coupled).map((value) => (
                  <Wagon
                    key={value}
                    number={value}
                    ghost
                    className={`h-[min(13vw,20dvh)] w-auto shrink-0 ${
                      value === next ? "anim-hint" : "opacity-70"
                    }`}
                  />
                ))}
            </div>
            <Track className="h-3 w-full sm:h-4" />
          </div>

          {/* The grass starts where the rails are, so the yard of spare wagons
            sits beside the track rather than floating in the sky. */}
          <div className="grid shrink-0 grid-cols-2 gap-2 bg-[#7FB86A] px-3 pb-3 pt-3 sm:gap-3 landscape:grid-cols-4">
            {yard.map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Wagon number ${value}`}
                onPointerDown={(event) => {
                  event.preventDefault();
                  handleTap(value);
                }}
                className={`grid place-items-center rounded-[24px] border-4 border-white/50 bg-white/25 p-2 shadow-[0_6px_0_rgba(0,0,0,0.12)] transition-transform active:scale-95 ${
                  wrong === value ? "anim-shake" : ""
                }`}
              >
                <Wagon number={value} className="h-auto w-full" />
              </button>
            ))}
            {yard.length === 0 ? (
              <p className="col-span-2 py-6 text-center text-xl font-bold text-white drop-shadow landscape:col-span-4">
                All aboard!
              </p>
            ) : null}
          </div>
        </div>
      </PlaceFrame>

      <Celebration trigger={party} big />
    </div>
  );
}
