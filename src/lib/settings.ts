"use client";

import { useSyncExternalStore } from "react";
import { setMuted, setSpeechRate } from "@/lib/audio";

export type Settings = {
  muted: boolean;
  showWords: boolean;
  slowVoice: boolean;
  /** Off by default: see src/lib/pronunciation.ts. */
  checkPronunciation: boolean;
};

const DEFAULTS: Settings = {
  muted: false,
  showWords: true,
  slowVoice: false,
  checkPronunciation: false,
};

const STORAGE_KEY = "sunny-town-settings";

let current: Settings = DEFAULTS;
let hydrated = false;
const listeners = new Set<() => void>();

function apply(settings: Settings) {
  setMuted(settings.muted);
  setSpeechRate(settings.slowVoice ? 0.65 : 0.85);
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function hydrateSettings() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw)
      current = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    current = DEFAULTS;
  }
  apply(current);
  emit();
}

export function updateSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch };
  apply(current);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    /* storage can be unavailable in private mode */
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => DEFAULTS,
  );
}
