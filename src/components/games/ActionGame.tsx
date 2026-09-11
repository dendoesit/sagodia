"use client";

import { useEffect, useRef, useState } from "react";
import {
  ActionGlyph,
  type ActionId,
} from "@/components/art/activities";
import { Pip, StarGlyph } from "@/components/art/friends";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { useWordBubble } from "@/components/ui/WordBubble";
import {
  sfxSparkle,
  sfxSuccess,
  speakTapped,
  vibrate,
} from "@/lib/audio";

type Action = {
  id: ActionId;
  word: string;
  request: string;
  color: string;
  animation: string;
};

const ACTIONS: Action[] = [
  {
    id: "jump",
    word: "Jump",
    request: "Make Pip jump.",
    color: "#4F8FE0",
    animation: "anim-action-jump",
  },
  {
    id: "spin",
    word: "Spin",
    request: "Make Pip spin.",
    color: "#8E5BC4",
    animation: "anim-action-spin",
  },
  {
    id: "wave",
    word: "Wave",
    request: "Make Pip wave.",
    color: "#5FAF4E",
    animation: "anim-action-wave",
  },
  {
    id: "stomp",
    word: "Stomp",
    request: "Make Pip stomp.",
    color: "#E4574C",
    animation: "anim-action-stomp",
  },
];

export function ActionGame({ onHome }: { onHome: () => void }) {
  const { bubble, showWord } = useWordBubble();
  const [targetIndex, setTargetIndex] = useState(0);
  const [moving, setMoving] = useState<Action | null>(null);
  const [motionKey, setMotionKey] = useState(0);
  const [right, setRight] = useState(false);
  const [wins, setWins] = useState(0);
  const [party, setParty] = useState(0);
  const nextTimer = useRef<number | undefined>(undefined);
  const target = ACTIONS[targetIndex];

  useEffect(
    () => () => {
      window.clearTimeout(nextTimer.current);
    },
    [],
  );

  const sayRequest = () => {
    showWord(target.word);
    speakTapped(`action-${target.id}`, [target.request]);
  };

  const act = (action: Action) => {
    vibrate();
    showWord(action.word);
    speakTapped(action.id, [action.word]);
    setMoving(action);
    setMotionKey((current) => current + 1);

    if (action.id !== target.id) return;

    setRight(true);
    setWins((current) => current + 1);
    sfxSuccess();
    sfxSparkle();
    if ((wins + 1) % 5 === 0) setParty((current) => current + 1);

    window.clearTimeout(nextTimer.current);
    nextTimer.current = window.setTimeout(() => {
      setTargetIndex((current) => (current + 1) % ACTIONS.length);
      setRight(false);
    }, 1000);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#FFE9A8] via-[#FFD67A] to-[#F18A45]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[#79C967]" />
      <PlaceFrame
        onHome={onHome}
        onAsk={sayRequest}
        prompt={
          <span className="flex items-center gap-2">
            <span
              className="grid h-10 w-10 place-items-center rounded-full"
              style={{ background: target.color }}
            >
              <ActionGlyph action={target.id} className="h-8 w-8" />
            </span>
            <span>{target.request}</span>
          </span>
        }
        bubble={bubble}
        bubbleTone="#B85C26"
      >
        <div className="relative flex min-h-0 flex-1 flex-col items-center gap-2 px-3 pb-3 landscape:flex-row landscape:justify-center landscape:gap-6">
          <button
            type="button"
            aria-label="Hear Pip's action"
            onPointerDown={(event) => {
              event.preventDefault();
              sayRequest();
            }}
            className="relative aspect-square min-h-0 flex-1 transition-transform active:scale-95 landscape:h-full landscape:flex-none"
          >
            <div
              key={motionKey}
              data-pip-action={moving?.id ?? "ready"}
              onAnimationEnd={() => setMoving(null)}
              className={`h-full w-full ${
                moving?.animation ?? "anim-bob"
              }`}
            >
              <Pip
                waving={moving?.id === "wave"}
                className="h-full w-full drop-shadow-xl"
                title="Pip"
              />
            </div>
            {right ? (
              <StarGlyph
                filled
                className="anim-pop-in absolute right-[4%] top-[5%] h-16 w-16 drop-shadow-lg"
              />
            ) : null}
          </button>

          <div className="grid h-[34%] min-h-36 w-full max-w-2xl shrink-0 grid-cols-4 gap-2 landscape:h-full landscape:w-[42%] landscape:grid-cols-2 landscape:grid-rows-2">
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                aria-label={action.word}
                onPointerDown={(event) => {
                  event.preventDefault();
                  act(action);
                }}
                className={`grid min-h-0 place-items-center rounded-[24px] border-4 border-white/80 p-1 shadow-[0_6px_0_rgba(0,0,0,0.15)] transition-transform active:scale-90 ${
                  target.id === action.id ? "anim-hint" : ""
                }`}
                style={{ background: action.color }}
              >
                <ActionGlyph
                  action={action.id}
                  className="h-full max-h-24 w-full"
                  title={action.word}
                />
              </button>
            ))}
          </div>
        </div>
      </PlaceFrame>

      <Celebration trigger={wins} />
      <Celebration trigger={party} big />
    </div>
  );
}
