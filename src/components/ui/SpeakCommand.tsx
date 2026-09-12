"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StarGlyph } from "@/components/art/friends";
import {
  sfxSuccess,
  speak,
  stopSpeaking,
  vibrate,
} from "@/lib/audio";
import {
  isRecognitionSupported,
  listenForWord,
  matchesWord,
  warmRecognitionPermission,
} from "@/lib/pronunciation";
import { useSettings } from "@/lib/settings";

type Phase = "idle" | "prompt" | "listening" | "timeout" | "manual" | "success";

const RESPONSE_MS = 3200;
const PROMPT_FALLBACK_MS = 3200;

export function SpeakCommand({
  word,
  onSuccess,
}: {
  word: string;
  onSuccess: () => void;
}) {
  const { checkPronunciation } = useSettings();
  const recognitionSupported = isRecognitionSupported();
  const strict = checkPronunciation && recognitionSupported;
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const alive = useRef(true);
  const timers = useRef<number[]>([]);
  const stopRecognition = useRef<(() => void) | null>(null);
  const successRef = useRef(onSuccess);

  useEffect(() => {
    successRef.current = onSuccess;
  }, [onSuccess]);

  const moveTo = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearTurn = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    stopRecognition.current?.();
    stopRecognition.current = null;
  }, []);

  const succeed = useCallback(() => {
    if (
      !alive.current ||
      !["listening", "manual", "timeout"].includes(phaseRef.current)
    )
      return;
    clearTurn();
    moveTo("success");
    sfxSuccess();
    vibrate(30);
    successRef.current();
  }, [clearTurn, moveTo]);

  const start = useCallback(() => {
    if (!alive.current || phaseRef.current === "prompt") return;
    clearTurn();
    stopSpeaking();
    moveTo("prompt");

    const permission = strict
      ? warmRecognitionPermission()
      : Promise.resolve(false);
    let listeningStarted = false;

    const beginListening = async () => {
      if (listeningStarted || !alive.current) return;
      listeningStarted = true;
      const canRecognize = strict && (await permission);
      if (!alive.current) return;

      if (!canRecognize) {
        moveTo("manual");
        return;
      }

      moveTo("listening");
      const stop = listenForWord(
        ({ transcript }) => {
          if (matchesWord(transcript, word)) succeed();
        },
        ({ error }) => {
          stopRecognition.current = null;
          if (!alive.current || phaseRef.current !== "listening") return;
          moveTo(
            error && error !== "no-speech" && error !== "aborted"
              ? "manual"
              : "timeout",
          );
        },
      );

      if (!stop) {
        moveTo("manual");
        return;
      }
      stopRecognition.current = stop;
      timers.current.push(
        window.setTimeout(() => {
          if (!alive.current || phaseRef.current !== "listening") return;
          stopRecognition.current?.();
          stopRecognition.current = null;
          moveTo("timeout");
        }, RESPONSE_MS),
      );
    };

    speak(word, { onEnd: beginListening });
    timers.current.push(
      window.setTimeout(beginListening, PROMPT_FALLBACK_MS),
    );
  }, [clearTurn, moveTo, strict, succeed, word]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTurn();
      stopSpeaking();
    };
  }, [clearTurn]);

  const waiting = phase === "prompt" || phase === "listening";

  return (
    <div
      data-command-phase={phase}
      className="flex min-h-20 items-center justify-center gap-3"
    >
      {phase === "timeout" || phase === "manual" ? (
        <>
          <button
            type="button"
            aria-label={`Say ${word} again`}
            onPointerDown={(event) => {
              event.preventDefault();
              start();
            }}
            className="grid h-20 w-20 place-items-center rounded-full border-[5px] border-white bg-[#4F8FE0] text-white shadow-[0_7px_0_rgba(47,42,38,0.17)] transition-transform active:translate-y-1 active:scale-90 active:shadow-none"
          >
            <svg viewBox="0 0 100 100" className="h-10 w-10" aria-hidden>
              <path d="M25 39 H40 L58 24 V76 L40 61 H25 Z" fill="currentColor" />
              <path d="M68 36 Q83 50 68 64" fill="none" stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={`I said ${word}`}
            onPointerDown={(event) => {
              event.preventDefault();
              succeed();
            }}
            className="grid h-20 w-20 place-items-center rounded-full border-[5px] border-white bg-[#5FAF4E] text-white shadow-[0_7px_0_rgba(47,42,38,0.17)] transition-transform active:translate-y-1 active:scale-90 active:shadow-none"
          >
            <svg viewBox="0 0 100 100" className="h-11 w-11" aria-hidden>
              <path d="M18 52 L41 74 L83 27" fill="none" stroke="currentColor" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      ) : phase === "success" ? (
        <StarGlyph filled className="anim-pop-in h-20 w-20 drop-shadow-lg" />
      ) : (
        <button
          type="button"
          aria-label={waiting ? `Waiting for ${word}` : `Say ${word}`}
          disabled={waiting}
          onPointerDown={(event) => {
            event.preventDefault();
            start();
          }}
          className={`grid h-24 w-24 place-items-center rounded-full border-[6px] border-white text-white shadow-[0_8px_0_rgba(47,42,38,0.17)] transition-all active:translate-y-1 active:scale-90 active:shadow-none ${
            phase === "listening"
              ? "bg-[#5FAF4E]"
              : phase === "prompt"
                ? "bg-[#FFD22E]"
                : "bg-[#F79420]"
          }`}
        >
          {phase === "listening" ? (
            <span className="flex h-12 items-center gap-1.5" aria-hidden>
              {[0, 1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className="anim-listen-bar w-2 rounded-full bg-white"
                  style={{ animationDelay: `${bar * 100}ms` }}
                />
              ))}
            </span>
          ) : (
            <svg viewBox="0 0 100 100" className="h-12 w-12" aria-hidden>
              <rect x={34} y={18} width={32} height={48} rx={16} fill="currentColor" />
              <path d="M22 52 Q22 78 50 78 Q78 78 78 52 M50 78 V91 M35 91 H65" fill="none" stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
