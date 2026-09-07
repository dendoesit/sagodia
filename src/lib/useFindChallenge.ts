"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sfxFanfare, sfxSuccess, speak } from "@/lib/audio";
import { pickRandom, randomCheer } from "@/lib/content";

type Askable = { id: string; word: string };

const HINT_AFTER_MS = 8000;
const NEXT_ROUND_MS = 2400;

/**
 * The gentle quiz layered on top of free play: "Where is the cow?".
 *
 * Deliberately failure-free — a wrong tap is never called wrong, it just does
 * the normal thing (says that word), so the child keeps learning either way.
 * The round ends itself after a few finds so there is no button to escape.
 */
export function useFindChallenge<T extends Askable>(items: T[], rounds = 3) {
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
      speak(`Where is the ${next.word.toLowerCase()}?`);
      timers.current.push(
        window.setTimeout(() => {
          setHint(true);
          speak(`Can you find the ${next.word.toLowerCase()}?`);
        }, HINT_AFTER_MS),
      );
    },
    [clearTimers],
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

  /** Returns true when this tap was the answer, so callers can skip their own feedback. */
  const check = useCallback(
    (item: T) => {
      if (!target || solved || item.id !== target.id) return false;
      clearTimers();
      setSolved(true);
      setHint(false);
      scoreRef.current += 1;
      const done = scoreRef.current >= rounds;
      if (done) {
        sfxFanfare();
        setFinale((n) => n + 1);
        speak(`${randomCheer()} ${target.word}! You found them all!`);
        timers.current.push(window.setTimeout(() => stop(), NEXT_ROUND_MS));
      } else {
        sfxSuccess();
        setCelebrate((n) => n + 1);
        speak(`${randomCheer()} ${target.word}!`);
        timers.current.push(
          window.setTimeout(() => ask(pickRandom(items, target)), NEXT_ROUND_MS),
        );
      }
      return true;
    },
    [ask, clearTimers, items, rounds, solved, stop, target],
  );

  return {
    target,
    hint,
    solved,
    active: target !== null,
    celebrate,
    finale,
    prompt: target ? `Where is the ${target.word.toLowerCase()}?` : null,
    start,
    stop,
    check,
  };
}
