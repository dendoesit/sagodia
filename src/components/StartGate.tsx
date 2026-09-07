"use client";

import { Pip, Sparkle } from "@/components/art/friends";
import { sfxSparkle, speak, unlockAudio } from "@/lib/audio";

/**
 * iOS refuses to speak or play audio unless it starts inside a real user
 * gesture, so the whole app waits behind one big tap.
 */
export function StartGate({ onStart }: { onStart: () => void }) {
  const begin = () => {
    unlockAudio();
    sfxSparkle();
    speak("Hello! Welcome to Sunny Town. Let's learn some words!");
    onStart();
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden bg-linear-to-b from-[#7FD0F5] to-[#CFF3B0] px-6 text-center">
      <Sparkle className="pointer-events-none absolute -left-10 top-10 h-32 w-32 opacity-40" />
      <Sparkle
        className="pointer-events-none absolute -right-8 bottom-16 h-24 w-24 opacity-30"
        fill="#FF8FB1"
      />

      <Pip
        waving
        className="h-40 w-40 drop-shadow-xl sm:h-52 sm:w-52"
        title="Pip the fox"
      />

      <div>
        <h1 className="text-4xl font-bold text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.18)] sm:text-6xl">
          Sunny Town
        </h1>
        <p className="mt-1 text-lg font-semibold text-white/95 drop-shadow sm:text-2xl">
          First English words
        </p>
      </div>

      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault();
          begin();
        }}
        className="anim-bob grid h-32 w-32 place-items-center rounded-full border-8 border-white bg-[#5FAF4E] shadow-[0_10px_0_rgba(0,0,0,0.18)] transition-transform active:scale-90 sm:h-40 sm:w-40"
        aria-label="Start playing"
      >
        <svg
          viewBox="0 0 100 100"
          className="h-16 w-16 sm:h-20 sm:w-20"
          aria-hidden
        >
          <path
            d="M30 18 L82 50 L30 82 Z"
            fill="#FFFFFF"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <p className="max-w-sm text-sm font-medium text-[#2F2A26]/70">
        Turn the sound on — this game is played with ears and fingers, no
        reading needed.
      </p>
    </div>
  );
}
