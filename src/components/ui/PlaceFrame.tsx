"use client";

import type { ReactNode } from "react";
import { EarGlyph, HomeGlyph } from "@/components/art/friends";
import { sfxTap, sfxWhoosh, vibrate } from "@/lib/audio";

export function RoundButton({
  onPress,
  children,
  label,
  className = "",
  active = false,
}: {
  onPress: () => void;
  children: ReactNode;
  label: string;
  className?: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        vibrate();
        onPress();
      }}
      className={`grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-white/80 shadow-lg transition-transform active:scale-90 sm:h-16 sm:w-16 ${
        active ? "bg-[#FFD22E]" : "bg-white/35 backdrop-blur-sm"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Chrome shared by every mini-game: a way home and the "listen and find"
 * button. Kept deliberately sparse so the play area stays the loudest thing
 * on screen.
 */
export function PlaceFrame({
  onHome,
  onAsk,
  asking,
  prompt,
  children,
}: {
  onHome: () => void;
  onAsk?: () => void;
  asking?: boolean;
  prompt?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3">
        <div className="pointer-events-auto">
          <RoundButton
            label="Back to town"
            onPress={() => {
              sfxWhoosh();
              onHome();
            }}
          >
            <HomeGlyph className="h-7 w-7 sm:h-8 sm:w-8" />
          </RoundButton>
        </div>

        {prompt ? (
          <div className="anim-pop-in mt-1 max-w-[55%] rounded-full bg-white/90 px-4 py-2 text-center text-lg font-semibold text-[#2F2A26] shadow-md sm:text-2xl">
            {prompt}
          </div>
        ) : null}

        {onAsk ? (
          <div className="pointer-events-auto">
            <RoundButton
              label="Listen and find"
              active={asking}
              onPress={() => {
                sfxTap();
                onAsk();
              }}
            >
              <EarGlyph className="h-7 w-7 sm:h-8 sm:w-8" />
            </RoundButton>
          </div>
        ) : (
          <div className="h-14 w-14 sm:h-16 sm:w-16" />
        )}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col pt-[4.75rem] sm:pt-[5.5rem]">{children}</div>
    </div>
  );
}
