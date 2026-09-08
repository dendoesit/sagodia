"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import {
  enqueueSpeech,
  sfxFanfare,
  sfxMiss,
  sfxPop,
  stopSpeaking,
  vibrate,
} from "@/lib/audio";
import { numberWord } from "@/lib/content";
import { useSettings } from "@/lib/settings";

const COLORS = [
  "#E4574C",
  "#4F8FE0",
  "#FFD22E",
  "#5FAF4E",
  "#8E5BC4",
  "#FF8FB1",
  "#4FC3B4",
  "#F79420",
];
const SLOTS = 6;
const MILESTONE = 10;
const RESPAWN_MIN_MS = 4500;
const RESPAWN_JITTER_MS = 3500;
const INTERACTIVE_PROGRESS = 0.36;

type Balloon = {
  id: number;
  slot: number;
  left: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  launchDepth: number;
  drift: number;
  spin: number;
  /** Initial balloons may already be near the top when the game opens. */
  grace: boolean;
};

type Burst = {
  id: number;
  x: number;
  y: number;
  color: string;
};

let nextId = 1;

/**
 * Six independent launch lanes keep balloons spread out without making their
 * motion predictable. Respawn waiting happens before a balloon exists in the
 * DOM, so a popped balloon cannot look parked along the bottom edge.
 */
function createBalloon(slot: number, initial = false): Balloon {
  const duration = 12 + Math.random() * 5;
  const lane = (slot * 31 + Math.random() * 8) % 82;
  return {
    id: nextId++,
    slot,
    left: 2 + lane,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 20 + Math.random() * 7,
    duration,
    delay: initial
      ? -(slot / SLOTS) * duration * 0.78
      : 0,
    launchDepth: 80 + Math.random() * 100,
    drift: (Math.random() - 0.5) * 18,
    spin: (Math.random() - 0.5) * 22,
    grace: initial,
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
      <ellipse
        cx={34}
        cy={34}
        rx={11}
        ry={15}
        fill="#FFFFFF"
        opacity={0.45}
      />
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

function FlyingBalloon({
  balloon,
  onPop,
  onEscape,
}: {
  balloon: Balloon;
  onPop: (rect: DOMRect) => void;
  onEscape: () => void;
}) {
  const elapsedMs = Math.max(0, -balloon.delay * 1000);
  const armAfterMs = Math.max(
    0,
    balloon.duration * 1000 * INTERACTIVE_PROGRESS - elapsedMs,
  );
  const [ready, setReady] = useState(armAfterMs === 0);

  useEffect(() => {
    if (armAfterMs === 0) return;
    const timer = window.setTimeout(() => setReady(true), armAfterMs);
    return () => window.clearTimeout(timer);
  }, [armAfterMs]);

  return (
    <button
      type="button"
      aria-label={ready ? "Pop balloon" : "Balloon rising"}
      disabled={!ready}
      data-balloon-ready={ready ? "true" : "false"}
      onPointerDown={(event) => {
        event.preventDefault();
        if (!ready) return;
        onPop(event.currentTarget.getBoundingClientRect());
      }}
      onAnimationEnd={onEscape}
      className="absolute bottom-0 block opacity-100 transition-opacity duration-500 will-change-transform disabled:pointer-events-none disabled:opacity-0"
      style={
        {
          left: `${balloon.left}%`,
          width: `${balloon.size}vmin`,
          height: `${balloon.size * 1.4}vmin`,
          animationName: "balloon-flight",
          animationDuration: `${balloon.duration}s`,
          animationDelay: `${balloon.delay}s`,
          animationTimingFunction: "linear",
          animationFillMode: "both",
          "--launch-depth": `${balloon.launchDepth}px`,
          "--drift": `${balloon.drift}vw`,
          "--spin": `${balloon.spin}deg`,
        } as React.CSSProperties
      }
    >
      <BalloonArt color={balloon.color} />
    </button>
  );
}

export function BalloonGame({ onHome }: { onHome: () => void }) {
  const { showWords } = useSettings();
  const [balloons, setBalloons] = useState(() =>
    Array.from({ length: SLOTS }, (_, slot) =>
      createBalloon(slot, true),
    ),
  );
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [count, setCount] = useState(0);
  const [best, setBest] = useState(0);
  const [missed, setMissed] = useState(0);
  const [party, setParty] = useState(0);

  const countRef = useRef(0);
  const retiring = useRef(new Set<number>());
  const burstTimers = useRef<number[]>([]);
  const respawnTimers = useRef<number[]>([]);

  useEffect(
    () => () => {
      burstTimers.current.forEach((timer) => window.clearTimeout(timer));
      respawnTimers.current.forEach((timer) => window.clearTimeout(timer));
      stopSpeaking();
    },
    [],
  );

  const retire = useCallback((balloon: Balloon) => {
    if (retiring.current.has(balloon.id)) return false;
    retiring.current.add(balloon.id);
    setBalloons((current) =>
      current.filter((item) => item.id !== balloon.id),
    );
    respawnTimers.current.push(
      window.setTimeout(() => {
        setBalloons((current) => [
          ...current,
          createBalloon(balloon.slot),
        ]);
        retiring.current.delete(balloon.id);
      }, RESPAWN_MIN_MS + Math.random() * RESPAWN_JITTER_MS),
    );
    return true;
  }, []);

  const pop = (balloon: Balloon, rect: DOMRect) => {
    if (!retire(balloon)) return;

    const next = countRef.current + 1;
    countRef.current = next;
    setCount(next);
    setBest((current) => Math.max(current, next));

    // FIFO narration: even three quick pops are spoken as one, two, three.
    enqueueSpeech([numberWord(next)], { rate: 1.08 });
    sfxPop();
    vibrate(20);

    if (next % MILESTONE === 0) {
      sfxFanfare();
      setParty((current) => current + 1);
    }

    const burst: Burst = {
      id: balloon.id,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      color: balloon.color,
    };
    setBursts((current) => [...current, burst]);
    burstTimers.current.push(
      window.setTimeout(() => {
        setBursts((current) =>
          current.filter((item) => item.id !== burst.id),
        );
      }, 520),
    );
  };

  const escape = (balloon: Balloon) => {
    if (!retire(balloon)) return;
    if (balloon.grace || countRef.current === 0) return;

    // A miss starts a new counting sequence. Old queued numbers are cleared so
    // they cannot continue after the visible counter has returned to zero.
    stopSpeaking();
    sfxMiss();
    countRef.current = 0;
    setCount(0);
    setMissed((current) => current + 1);
  };

  const dots =
    count === 0
      ? 0
      : count % MILESTONE === 0
        ? MILESTONE
        : count % MILESTONE;

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#BFF0EA] to-[#2FA9A0]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-8 top-[9%] h-32 w-32 rounded-full bg-[#FFE27A]/75" />
        <div className="absolute left-[7%] top-[17%] h-12 w-28 rounded-full bg-white/60 blur-[2px]" />
        <div className="absolute right-[14%] top-[34%] h-10 w-24 rounded-full bg-white/50 blur-[2px]" />
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[14%] w-full opacity-40"
          aria-hidden
        >
          <path d="M0 24 Q20 8 42 22 T100 16 V30 H0 Z" fill="#137E76" />
        </svg>
      </div>

      <PlaceFrame
        onHome={onHome}
        prompt={
          <div className="flex items-center gap-2">
            <span
              key={`${count}-${missed}`}
              className={`text-3xl font-bold tabular-nums sm:text-4xl ${
                count === 0 && missed > 0
                  ? "anim-wiggle text-[#E4574C]"
                  : ""
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
              {Array.from({ length: MILESTONE }, (_, index) => (
                <span
                  key={index}
                  className={`h-2.5 w-2.5 rounded-full transition-colors sm:h-4 sm:w-4 ${
                    index < dots
                      ? "bg-[#F79420]"
                      : "bg-[#2F2A26]/15"
                  }`}
                />
              ))}
            </span>
            {best > 0 ? (
              <span className="flex items-center gap-0.5 text-base font-bold text-[#F79420] tabular-nums sm:text-xl">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  aria-hidden
                >
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
        {/* New balloons are created only after their respawn timer, then begin
          below this clipping plane and rise into the play area. */}
        <div
          data-balloon-field
          className="relative mb-[12dvh] min-h-0 flex-1 overflow-hidden"
        >
          {balloons.map((balloon) => (
            <FlyingBalloon
              key={balloon.id}
              balloon={balloon}
              onPop={(rect) => pop(balloon, rect)}
              onEscape={() => escape(balloon)}
            />
          ))}
        </div>
      </PlaceFrame>

      {bursts.map((burst) => (
        <span
          key={burst.id}
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
