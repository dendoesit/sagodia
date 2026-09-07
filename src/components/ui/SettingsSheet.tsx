"use client";

import { useEffect, useRef, useState } from "react";
import { sfxTap, speak } from "@/lib/audio";
import { isRecognitionSupported } from "@/lib/pronunciation";
import { updateSettings, useSettings } from "@/lib/settings";

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl bg-white/80 px-4 py-3 text-left shadow-sm transition-colors hover:bg-white"
    >
      <span>
        <span className="block text-lg font-semibold text-[#2F2A26]">
          {label}
        </span>
        <span className="block text-sm text-[#2F2A26]/60">{hint}</span>
      </span>
      <span
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
          value ? "bg-[#5FAF4E]" : "bg-[#2F2A26]/25"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
            value ? "left-7" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

/**
 * Parent controls. Opened with a press-and-hold so a toddler mashing the
 * screen cannot get in here.
 */
export function SettingsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const settings = useSettings();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
      <div className="anim-pop-in w-full max-w-md rounded-3xl bg-[#FFF7E8] p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2F2A26]">For grown-ups</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="grid h-11 w-11 place-items-center rounded-full bg-[#2F2A26]/10 text-2xl font-bold text-[#2F2A26]"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <Toggle
            label="Sound"
            hint="Spoken words and effects"
            value={!settings.muted}
            onChange={(next) => {
              updateSettings({ muted: !next });
              if (next) {
                sfxTap();
                speak("Sound on");
              }
            }}
          />
          <Toggle
            label="Show the written word"
            hint="Pairs the spoken word with print"
            value={settings.showWords}
            onChange={(next) => updateSettings({ showWords: next })}
          />
          <Toggle
            label="Slower voice"
            hint="Helpful for very young learners"
            value={settings.slowVoice}
            onChange={(next) => {
              updateSettings({ slowVoice: next });
              speak("Like this");
            }}
          />
          {isRecognitionSupported() ? (
            <Toggle
              label="Check pronunciation in Say it"
              hint="Sends speech to your browser's recognition service. Your child still earns a star for every try."
              value={settings.checkPronunciation}
              onChange={(next) => updateSettings({ checkPronunciation: next })}
            />
          ) : null}
        </div>
        <p className="mt-4 text-sm leading-snug text-[#2F2A26]/60">
          Everything is free play — there is no way to lose, no timer and no
          score. The ear button inside each place starts a gentle &ldquo;find
          it&rdquo; round. In <em>Say it</em> the microphone only measures how
          loudly your child speaks — nothing is recorded or uploaded.
        </p>
      </div>
    </div>
  );
}

/** Press-and-hold trigger used to reach the grown-up settings. */
export function HoldButton({
  onHold,
  holdMs = 900,
  label,
  className = "",
  children,
}: {
  onHold: () => void;
  holdMs?: number;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const ticker = useRef<number | undefined>(undefined);

  const stop = () => {
    window.clearTimeout(timer.current);
    window.clearInterval(ticker.current);
    setProgress(0);
  };

  useEffect(() => stop, []);

  const start = () => {
    stop();
    const startedAt = Date.now();
    ticker.current = window.setInterval(() => {
      setProgress(Math.min(1, (Date.now() - startedAt) / holdMs));
    }, 60);
    timer.current = window.setTimeout(() => {
      stop();
      onHold();
    }, holdMs);
  };

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(event) => event.preventDefault()}
      className={`relative grid place-items-center overflow-hidden rounded-full ${className}`}
    >
      <span
        className="absolute inset-0 bg-[#FFD22E] transition-transform"
        style={{
          transform: `scale(${progress})`,
          opacity: progress > 0 ? 0.9 : 0,
        }}
      />
      <span className="relative">{children}</span>
    </button>
  );
}
