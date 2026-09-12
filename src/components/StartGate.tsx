"use client";

import { Pip, Sparkle } from "@/components/art/friends";
import { sfxSparkle, unlockAudio } from "@/lib/audio";
import packageInfo from "../../package.json";

/**
 * iOS refuses to speak or play audio unless it starts inside a real user
 * gesture, so the whole app waits behind one big tap.
 */
export function StartGate({ onStart }: { onStart: () => void }) {
  const begin = () => {
    unlockAudio();
    sfxSparkle();
    onStart();
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden bg-linear-to-b from-[#6FCBF3] via-[#AEE8FA] to-[#DDF7C7] px-6 text-center">
      <div className="pointer-events-none absolute right-[8%] top-[7%] h-24 w-24 rounded-full border-8 border-[#FFF2A1]/50 bg-[#FFE066] shadow-[0_0_55px_rgba(255,224,102,0.65)]" />
      <div className="pointer-events-none absolute left-[8%] top-[20%] h-10 w-24 rounded-full bg-white/55 blur-[1px]" />
      <svg
        viewBox="0 0 100 35"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] w-full"
        aria-hidden
      >
        <path d="M0 16 Q22 1 47 15 T100 9 L100 35 L0 35 Z" fill="#8FD673" />
        <path d="M0 27 Q30 14 58 26 T100 20 L100 35 L0 35 Z" fill="#6FBF5C" />
      </svg>
      <Sparkle className="pointer-events-none absolute -left-10 top-10 h-32 w-32 opacity-40" />
      <Sparkle
        className="pointer-events-none absolute -right-8 bottom-16 h-24 w-24 opacity-30"
        fill="#FF8FB1"
      />

      <div className="relative grid h-44 w-44 place-items-center rounded-full border-4 border-white/45 bg-white/20 shadow-[0_12px_35px_rgba(47,42,38,0.12)] backdrop-blur-[2px] sm:h-56 sm:w-56">
        <div className="absolute inset-3 rounded-full bg-[#FFE8A3]/35" />
        <Pip
          waving
          className="relative h-40 w-40 drop-shadow-xl sm:h-52 sm:w-52"
          title="Pip the fox"
        />
      </div>

      <div className="relative rounded-[26px] border-2 border-white/35 bg-white/15 px-6 py-2 shadow-[0_6px_18px_rgba(47,42,38,0.08)] backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.18)] sm:text-6xl">
          Sunny Town
        </h1>
        <p className="mt-1 text-lg font-semibold text-white/95 drop-shadow sm:text-2xl">
          First English words
        </p>
        <p className="mt-1 text-sm font-bold text-[#2F2A26]/60 sm:text-base">
          v{packageInfo.version}
        </p>
      </div>

      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault();
          begin();
        }}
        className="anim-bob relative grid h-32 w-32 place-items-center overflow-hidden rounded-full border-8 border-white bg-linear-to-br from-[#72C95F] to-[#4A9E40] shadow-[0_11px_0_rgba(47,42,38,0.18),0_18px_32px_rgba(47,42,38,0.12)] transition-transform active:translate-y-1 active:scale-90 sm:h-40 sm:w-40"
        aria-label="Start playing"
      >
        <span className="pointer-events-none absolute left-[18%] top-[12%] h-[22%] w-[40%] rounded-full bg-white/25 blur-sm" />
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

      <p className="relative max-w-sm rounded-full border border-white/45 bg-white/40 px-4 py-2 text-sm font-medium text-[#2F2A26]/70 shadow-sm backdrop-blur-sm">
        Turn the sound on — this game is played with ears and fingers, no
        reading needed.
      </p>
    </div>
  );
}
