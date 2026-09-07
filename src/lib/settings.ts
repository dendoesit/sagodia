"use client";

import { useSyncExternalStore } from "react";
import { setMuted } from "@/lib/audio";
import { setSpeechRate } from "@/lib/speech";

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

const STORAGE_KEY = "sunny-town-settings-v2";
const LEGACY_STORAGE_KEY = "sunny-town-settings";

let current: Settings = DEFAULTS;
let hydrated = false;
const listeners = new Set<() => void>();

function apply(settings: Settings) {
  setMuted(settings.muted);
  setSpeechRate(settings.slowVoice ? 0.82 : 1);
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function hydrateSettings() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      current = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
    } else {
      const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        // The previous speech engine could leave testers believing sound was
        // broken while a stale persisted mute was still active. Preserve the
        // useful preferences, but turn sound back on once for this migration.
        current = {
          ...DEFAULTS,
          ...(JSON.parse(legacy) as Partial<Settings>),
          muted: false,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      }
    }
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
