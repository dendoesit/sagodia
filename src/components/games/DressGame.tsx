"use client";

import { useEffect, useRef, useState } from "react";
import {
  ClothingGlyph,
  PipOutfit,
  type ClothingId,
} from "@/components/art/activities";
import { Pip } from "@/components/art/friends";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { useWordBubble } from "@/components/ui/WordBubble";
import {
  sfxFanfare,
  sfxSuccess,
  sfxTap,
  speakTapped,
  vibrate,
} from "@/lib/audio";

type Clothing = {
  id: ClothingId;
  word: string;
  color: string;
  request: string;
};

const CLOTHES: Clothing[] = [
  { id: "hat", word: "Hat", color: "Red", request: "Put on the red hat." },
  {
    id: "shirt",
    word: "Shirt",
    color: "Blue",
    request: "Put on the blue shirt.",
  },
  {
    id: "shoes",
    word: "Shoes",
    color: "Yellow",
    request: "Put on the yellow shoes.",
  },
];

export function DressGame({ onHome }: { onHome: () => void }) {
  const { bubble, showWord } = useWordBubble();
  const [targetIndex, setTargetIndex] = useState(0);
  const [worn, setWorn] = useState<Partial<Record<ClothingId, boolean>>>({});
  const [wrong, setWrong] = useState<ClothingId | null>(null);
  const [dressed, setDressed] = useState(0);
  const [party, setParty] = useState(0);
  const [locked, setLocked] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const wrongTimer = useRef<number | undefined>(undefined);
  const target = CLOTHES[targetIndex];

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(wrongTimer.current);
    },
    [],
  );

  const sayRequest = () => {
    showWord(target.word);
    speakTapped(`dress-${target.id}`, [target.request]);
  };

  const choose = (item: Clothing) => {
    if (locked || worn[item.id]) return;
    showWord(item.word);
    vibrate();

    if (item.id !== target.id) {
      sfxTap();
      speakTapped(item.id, [item.word]);
      setWrong(item.id);
      window.clearTimeout(wrongTimer.current);
      wrongTimer.current = window.setTimeout(() => setWrong(null), 520);
      return;
    }

    const nextWorn = { ...worn, [item.id]: true };
    const complete = CLOTHES.every((piece) => nextWorn[piece.id]);
    setWorn(nextWorn);
    setDressed((current) => current + 1);
    setLocked(true);
    speakTapped(item.id, [item.word]);
    sfxSuccess();

    window.clearTimeout(timer.current);
    if (complete) {
      setParty((current) => current + 1);
      sfxFanfare();
      timer.current = window.setTimeout(() => {
        setWorn({});
        setTargetIndex((current) => (current + 1) % CLOTHES.length);
        setLocked(false);
      }, 3000);
      return;
    }

    timer.current = window.setTimeout(() => {
      const next = CLOTHES.findIndex((piece) => !nextWorn[piece.id]);
      setTargetIndex(next);
      setLocked(false);
    }, 850);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#DCCEFF] via-[#B9A7F7] to-[#8C6DD1]">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:repeating-linear-gradient(90deg,transparent_0_42px,rgba(255,255,255,0.22)_42px_44px)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[23%] bg-[#7658B5]/45" />
      <div className="pointer-events-none absolute left-[8%] top-[18%] h-14 w-14 rounded-full bg-[#FFE066]/35 blur-xl" />
      <div className="pointer-events-none absolute right-[7%] top-[34%] h-20 w-20 rounded-full bg-white/25 blur-2xl" />
      <PlaceFrame
        onHome={onHome}
        onAsk={sayRequest}
        prompt={
          <span className="flex items-center gap-2">
            <ClothingGlyph item={target.id} className="h-10 w-10" />
            <span>
              Put on the {target.color.toLowerCase()} {target.word.toLowerCase()}.
            </span>
          </span>
        }
        bubble={bubble}
        bubbleTone="#6C4EB5"
      >
        <div className="flex min-h-0 flex-1 flex-col items-center gap-3 px-3 pb-3 landscape:flex-row landscape:justify-center landscape:gap-5">
          <button
            type="button"
            aria-label="Hear Pip's dressing request"
            onPointerDown={(event) => {
              event.preventDefault();
              sayRequest();
            }}
            className={`relative aspect-square min-h-0 flex-1 overflow-hidden rounded-[38px] border-4 border-white/45 bg-white/18 p-2 shadow-[inset_0_0_30px_rgba(255,255,255,0.18),0_10px_0_rgba(72,48,123,0.18)] transition-transform active:scale-95 landscape:h-full landscape:flex-none ${
              dressed > 0 ? "anim-wiggle" : "anim-bob"
            }`}
          >
            <span className="pointer-events-none absolute inset-x-[18%] bottom-[3%] h-[10%] rounded-[50%] bg-[#4B347C]/20 blur-sm" />
            <Pip className="h-full w-full drop-shadow-xl" title="Pip" />
            <PipOutfit worn={worn} className="pointer-events-none absolute inset-0 h-full w-full" />
          </button>

          <div className="grid h-[28%] min-h-24 w-full max-w-2xl shrink-0 grid-cols-3 gap-2 rounded-[30px] border-4 border-white/35 bg-[#65469E]/20 p-2 shadow-[inset_0_4px_14px_rgba(72,48,123,0.15)] landscape:h-full landscape:w-[44%] landscape:grid-cols-1">
            {CLOTHES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={`${item.color} ${item.word}`}
                disabled={locked || Boolean(worn[item.id])}
                onPointerDown={(event) => {
                  event.preventDefault();
                  choose(item);
                }}
                className={`relative grid min-h-0 place-items-center overflow-hidden rounded-[22px] border-4 border-white/80 bg-linear-to-br from-white/65 to-white/25 p-1 shadow-[0_6px_0_rgba(72,48,123,0.2)] transition-all active:translate-y-1 active:scale-90 active:shadow-none disabled:opacity-35 ${
                  wrong === item.id ? "anim-shake" : ""
                } ${target.id === item.id && !locked ? "anim-hint" : ""}`}
              >
                <span className="pointer-events-none absolute left-[12%] top-[8%] h-[18%] w-[42%] rounded-full bg-white/35 blur-sm" />
                <ClothingGlyph
                  item={item.id}
                  className="h-full max-h-28 w-full"
                  title={`${item.color} ${item.word}`}
                />
              </button>
            ))}
          </div>
        </div>
      </PlaceFrame>

      <Celebration trigger={dressed} />
      <Celebration trigger={party} big />
    </div>
  );
}
