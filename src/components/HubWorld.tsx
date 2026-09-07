"use client";

import { useState } from "react";
import { Pip } from "@/components/art/friends";
import {
  BalloonCartScene,
  BarnScene,
  PaintTentScene,
  ShapeWorkshopScene,
  SnackCartScene,
} from "@/components/art/places";
import { HoldButton, SettingsSheet } from "@/components/ui/SettingsSheet";
import { sfxDoor, sfxSparkle, speak, vibrate } from "@/lib/audio";
import { PLACES, type PlaceId, pickRandom } from "@/lib/content";
import { useSettings } from "@/lib/settings";

const SCENES: Record<PlaceId, React.ComponentType<{ className?: string; title?: string }>> = {
  farm: BarnScene,
  kitchen: SnackCartScene,
  paint: PaintTentScene,
  balloons: BalloonCartScene,
  shapes: ShapeWorkshopScene,
};

const PIP_LINES = [
  "Hello! I am Pip.",
  "Let's play!",
  "Where shall we go?",
  "You are doing great!",
  "Pick a place!",
];

function Cloud({ top, duration, scale }: { top: string; duration: number; scale: number }) {
  return (
    <div
      className="pointer-events-none absolute -left-40 opacity-80"
      style={{ top, animation: `drift ${duration}s linear infinite`, transform: `scale(${scale})` }}
    >
      <svg viewBox="0 0 160 70" className="h-16 w-40" aria-hidden>
        <g fill="#FFFFFF">
          <circle cx={45} cy={40} r={26} />
          <circle cx={80} cy={30} r={30} />
          <circle cx={115} cy={42} r={24} />
          <rect x={40} y={40} width={80} height={26} rx={13} />
        </g>
      </svg>
    </div>
  );
}

export function HubWorld({ onOpen }: { onOpen: (place: PlaceId) => void }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pipTaps, setPipTaps] = useState(0);
  const { showWords } = useSettings();

  const openPlace = (id: PlaceId) => {
    const place = PLACES.find((item) => item.id === id);
    if (!place) return;
    sfxDoor();
    vibrate();
    speak(`${place.word}. ${place.invitation}`);
    onOpen(id);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#7FD0F5] via-[#A9E4FF] to-[#CFF3B0]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#FFE066] shadow-[0_0_70px_rgba(255,224,102,0.95)]" />
        <Cloud top="8%" duration={54} scale={1} />
        <Cloud top="26%" duration={78} scale={0.7} />
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-[26%] w-full"
          aria-hidden
        >
          <path d="M0 18 Q 22 2 46 14 T 100 8 L100 40 L0 40 Z" fill="#8FD673" />
          <path d="M0 28 Q 30 16 58 26 T 100 22 L100 40 L0 40 Z" fill="#6FBF5C" />
        </svg>
      </div>

      <div className="relative flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-2 px-3 pt-2">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="Say hello to Pip"
              onPointerDown={(event) => {
                event.preventDefault();
                setPipTaps((n) => n + 1);
                vibrate();
                speak(pickRandom(PIP_LINES));
              }}
              className="h-14 w-14 shrink-0 sm:h-16 sm:w-16"
            >
              <span
                key={pipTaps}
                className={`block h-full w-full ${pipTaps > 0 ? "anim-wiggle" : "anim-bob"}`}
              >
                <Pip waving className="h-full w-full drop-shadow" title="Pip the fox" />
              </span>
            </button>
            <h1 className="truncate text-2xl font-bold text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.18)] sm:text-3xl">
              Sunny Town
            </h1>
          </div>
          <HoldButton
            label="Grown-up settings (press and hold)"
            onHold={() => {
              sfxSparkle();
              setSettingsOpen(true);
            }}
            className="h-12 w-12 border-4 border-white/70 bg-white/30 backdrop-blur-sm"
          >
            <svg viewBox="0 0 100 100" className="h-6 w-6" aria-hidden>
              <path
                d="M50 32 a18 18 0 1 0 0.1 0 Z M42 6 h16 l3 13 a34 34 0 0 1 10 6 l13 -5 8 14 -10 9 a34 34 0 0 1 0 12 l10 9 -8 14 -13 -5 a34 34 0 0 1 -10 6 l-3 13 h-16 l-3 -13 a34 34 0 0 1 -10 -6 l-13 5 -8 -14 10 -9 a34 34 0 0 1 0 -12 l-10 -9 8 -14 13 5 a34 34 0 0 1 10 -6 Z"
                fill="#FFFFFF"
                stroke="#2F2A26"
                strokeWidth={4}
                strokeLinejoin="round"
                fillRule="evenodd"
              />
            </svg>
          </HoldButton>
        </header>

        <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-2.5 p-3 landscape:grid-cols-5 landscape:grid-rows-1">
          {PLACES.map((place, index) => {
            const Scene = SCENES[place.id];
            const wide = index === PLACES.length - 1;
            return (
              <button
                key={place.id}
                type="button"
                aria-label={place.word}
                onPointerDown={(event) => {
                  event.preventDefault();
                  openPlace(place.id);
                }}
                className={`anim-pop-in relative flex min-h-0 flex-col items-center justify-center gap-1 rounded-[30px] border-4 border-white/80 bg-linear-to-br ${place.gradient} p-2 shadow-[0_8px_0_rgba(0,0,0,0.14)] transition-transform active:scale-95 ${
                  wide ? "col-span-2 landscape:col-span-1" : ""
                }`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <Scene className="h-full min-h-0 w-auto max-w-[86%] flex-1" title={place.word} />
                {showWords ? (
                  <span className="shrink-0 rounded-full bg-white/85 px-3 py-0.5 text-base font-bold text-[#2F2A26] sm:text-lg">
                    {place.word.replace(/^The /, "")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

      </div>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
