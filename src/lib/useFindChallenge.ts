"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  sfxFanfare,
  sfxMiss,
  sfxSuccess,
  speakSequence,
  vibrate,
} from "@/lib/audio";
import { pickRandom, randomCheer } from "@/lib/content";

type Askable = { id: string; word: string };

/** What a tap meant: no round is running, or it was the answer, or it wasn't. */
export type Verdict = "idle" | "correct" | "wrong";

const HINT_AFTER_MS = 8000;
const NEXT_ROUND_MS = 2400;

/**
 * The gentle quiz layered on top of free play: "Where is the cow?".
 *
 * A wrong tap is never scored against the child and never blocks them. It
 * answers instead: the thing they touched introduces itself, the app says it
 * is not the one being looked for, the target speaks up, and the question is
 * asked again. Both taps teach a word, which is the whole point.
 */
export function useFindChallenge<T extends Askable>(
  items: T[],
  {
    rounds = 3,
    /** Extra sound the item itself makes, e.g. an animal's noise. */
    voice,
    /** How the round is asked. Each place phrases it in its own verb. */
    question = (word: string) => `Where is the ${word}?`,
    miss = (word: string) => `Not the ${word}!`,
  }: {
    rounds?: number;
    voice?: (item: T) => string[];
    question?: (word: string) => string;
    miss?: (word: string) => string;
  } = {},
) {
  const [target, setTarget] = useState<T | null>(null);
  const [hint, setHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [celebrate, setCelebrate] = useState(0);
  const [finale, setFinale] = useState(0);
  const scoreRef = useRef(0);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const ask = useCallback(
    (next: T) => {
      clearTimers();
      setTarget(next);
      setSolved(false);
      setHint(false);
      speakSequence([question(next.word.toLowerCase())]);
      timers.current.push(
        window.setTimeout(() => {
          setHint(true);
          speakSequence(["Try again.", question(next.word.toLowerCase())]);
        }, HINT_AFTER_MS),
      );
    },
    [clearTimers, question],
  );

  const start = useCallback(() => {
    scoreRef.current = 0;
    ask(pickRandom(items, target ?? undefined));
  }, [ask, items, target]);

  const stop = useCallback(() => {
    clearTimers();
    setTarget(null);
    setHint(false);
    setSolved(false);
  }, [clearTimers]);

  /**
   * `reaction` is what the tapped thing itself says — "Woof woof!", "Yellow!"
   * — and it is spoken first either way, so the child always hears the name
   * of whatever they actually touched.
   */
  const check = useCallback(
    (item: T, reaction: string[] = []): Verdict => {
      if (!target || solved) return "idle";
      const name = target.word.toLowerCase();

      if (item.id !== target.id) {
        clearTimers();
        sfxMiss();
        vibrate([10, 40, 10]);
        setHint(true);
        speakSequence([
          ...reaction,
          miss(name),
          ...(voice ? voice(target) : []),
          question(name),
        ]);
        return "wrong";
      }

      clearTimers();
      setSolved(true);
      setHint(false);
      scoreRef.current += 1;
      const done = scoreRef.current >= rounds;
      if (done) {
        sfxFanfare();
        setFinale((n) => n + 1);
        speakSequence([
          `${randomCheer()} ${target.word}!`,
          ...(voice ? voice(target) : []),
          "You found them all!",
        ]);
        timers.current.push(window.setTimeout(() => stop(), NEXT_ROUND_MS));
      } else {
        sfxSuccess();
        setCelebrate((n) => n + 1);
        speakSequence([
          `${randomCheer()} ${target.word}!`,
          ...(voice ? voice(target) : []),
        ]);
        timers.current.push(
          window.setTimeout(
            () => ask(pickRandom(items, target)),
            NEXT_ROUND_MS,
          ),
        );
      }
      return "correct";
    },
    [ask, clearTimers, items, miss, question, rounds, solved, stop, target, voice],
  );

  return {
    target,
    hint,
    solved,
    active: target !== null,
    celebrate,
    finale,
    prompt: target ? question(target.word.toLowerCase()) : null,
    start,
    stop,
    check,
  };
}
