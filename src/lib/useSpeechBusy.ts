"use client";

import { useSyncExternalStore } from "react";
import {
  isSpeechBusy,
  subscribeSpeechBusy,
} from "@/lib/speech";

/**
 * Reactive form of the speech lock for controls that should visibly wait
 * until a teaching phrase has finished.
 */
export function useSpeechBusy(): boolean {
  return useSyncExternalStore(
    subscribeSpeechBusy,
    isSpeechBusy,
    () => false,
  );
}
