"use client";

import { useEffect, useRef, useState } from "react";
import {
  ToyBox,
  ToyGlyph,
  type ToyId,
} from "@/components/art/activities";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { useWordBubble } from "@/components/ui/WordBubble";
import {
  sfxFanfare,
  sfxSuccess,
  sfxTap,
  speakSequence,
  speakTapped,
  vibrate,
} from "@/lib/audio";

type BoxId = "blue" | "red" | "green";

type Box = {
  id: BoxId;
  word: string;
  color: string;
};

type Toy = {
  id: ToyId;
  word: string;
  box: BoxId;
  request: string;
};

const BOXES: Box[] = [
  { id: "blue", word: "Blue", color: "#4F8FE0" },
  { id: "red", word: "Red", color: "#E4574C" },
  { id: "green", word: "Green", color: "#5FAF4E" },
];

const TOYS: Toy[] = [
  {
    id: "ball",
    word: "Ball",
    box: "blue",
    request: "Put the ball in the blue box.",
  },
  {
    id: "car",
    word: "Car",
    box: "red",
    request: "Put the car in the red box.",
  },
  {
    id: "blocks",
    word: "Blocks",
    box: "green",
    request: "Put the blocks in the green box.",
  },
];

export function CleanupGame({ onHome }: { onHome: () => void }) {
  const { bubble, showWord } = useWordBubble();
  const [targetIndex, setTargetIndex] = useState(0);
  const [selected, setSelected] = useState<Toy | null>(null);
  const [placed, setPlaced] = useState<Partial<Record<ToyId, boolean>>>({});
  const [wrongToy, setWrongToy] = useState<ToyId | null>(null);
  const [wrongBox, setWrongBox] = useState<BoxId | null>(null);
  const [locked, setLocked] = useState(false);
  const [tidied, setTidied] = useState(0);
  const [party, setParty] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const wrongTimer = useRef<number | undefined>(undefined);
  const target = TOYS[targetIndex];
  const targetBox = BOXES.find((box) => box.id === target.box) ?? BOXES[0];

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(wrongTimer.current);
    },
    [],
  );

  const sayRequest = () => {
    showWord(target.word);
    speakTapped(`cleanup-${target.id}`, [target.request]);
  };

  const markWrong = (toy?: ToyId, box?: BoxId) => {
    setWrongToy(toy ?? null);
    setWrongBox(box ?? null);
    window.clearTimeout(wrongTimer.current);
    wrongTimer.current = window.setTimeout(() => {
      setWrongToy(null);
      setWrongBox(null);
    }, 520);
  };

  const chooseToy = (toy: Toy) => {
    if (locked || placed[toy.id]) return;
    vibrate();
    showWord(toy.word);
    speakTapped(toy.id, [toy.word]);

    if (toy.id !== target.id) {
      sfxTap();
      setSelected(null);
      markWrong(toy.id);
      return;
    }

    sfxSuccess();
    setSelected(toy);
  };

  const chooseBox = (box: Box) => {
    if (locked) return;
    vibrate();

    if (!selected) {
      sfxTap();
      showWord(box.word);
      speakTapped(box.id, [box.word]);
      markWrong(undefined, box.id);
      return;
    }

    if (box.id !== selected.box) {
      sfxTap();
      showWord(box.word);
      speakTapped(box.id, [box.word]);
      markWrong(undefined, box.id);
      return;
    }

    const nextPlaced = { ...placed, [selected.id]: true };
    const complete = TOYS.every((toy) => nextPlaced[toy.id]);
    setPlaced(nextPlaced);
    setSelected(null);
    setLocked(true);
    setTidied((current) => current + 1);
    sfxSuccess();
    showWord(`${selected.word} · ${box.word}`);
    speakSequence([selected.word, box.word]);

    window.clearTimeout(timer.current);
    if (complete) {
      setParty((current) => current + 1);
      sfxFanfare();
      timer.current = window.setTimeout(() => {
        setPlaced({});
        setTargetIndex((current) => (current + 1) % TOYS.length);
        setLocked(false);
      }, 3000);
      return;
    }

    timer.current = window.setTimeout(() => {
      const next = TOYS.findIndex((toy) => !nextPlaced[toy.id]);
      setTargetIndex(next);
      setLocked(false);
    }, 900);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#C7F5EE] via-[#8FE0D3] to-[#35A89B]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[68%] opacity-45 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.18)_0_30px,transparent_30px_60px)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[36%] bg-[#4B9D83]/55" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[36%] h-3 bg-white/30 shadow-[0_4px_0_rgba(47,42,38,0.08)]" />
      <PlaceFrame
        onHome={onHome}
        onAsk={sayRequest}
        prompt={
          <span className="flex items-center gap-1.5">
            <ToyGlyph toy={target.id} className="h-9 w-9" />
            <span aria-hidden>→</span>
            <ToyBox color={targetBox.color} className="h-10 w-10" />
            <span className="hidden sm:inline">{target.request}</span>
          </span>
        }
        bubble={bubble}
        bubbleTone="#217B72"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-3">
          <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 rounded-[32px] border-[5px] border-white/70 bg-white/35 p-2 shadow-[inset_0_5px_18px_rgba(34,111,102,0.1),0_9px_0_rgba(34,111,102,0.16)] backdrop-blur-[2px] sm:gap-4">
            {TOYS.map((toy) => (
              <button
                key={toy.id}
                type="button"
                aria-label={toy.word}
                aria-pressed={selected?.id === toy.id}
                disabled={locked || Boolean(placed[toy.id])}
                onPointerDown={(event) => {
                  event.preventDefault();
                  chooseToy(toy);
                }}
                className={`relative grid min-h-0 place-items-center overflow-hidden rounded-[24px] border-4 bg-linear-to-br from-white/90 to-[#E5FAF6]/65 p-1 shadow-[0_6px_0_rgba(34,111,102,0.16)] transition-all active:translate-y-1 active:scale-90 active:shadow-none disabled:opacity-25 ${
                  selected?.id === toy.id
                    ? "-translate-y-2 border-[#FFD22E]"
                    : "border-white"
                } ${wrongToy === toy.id ? "anim-shake" : ""} ${
                  target.id === toy.id && !selected && !locked
                    ? "anim-hint"
                    : ""
                }`}
              >
                <span className="pointer-events-none absolute left-[10%] top-[8%] h-[18%] w-[45%] rounded-full bg-white/70 blur-sm" />
                <ToyGlyph
                  toy={toy.id}
                  className="h-full max-h-40 w-full"
                  title={toy.word}
                />
              </button>
            ))}
          </div>

          <div className="grid h-[34%] min-h-32 shrink-0 grid-cols-3 gap-2 rounded-[32px] border-[5px] border-white/65 bg-[#2C7568]/28 p-2 shadow-[inset_0_5px_16px_rgba(28,94,84,0.2),0_9px_0_rgba(28,94,84,0.16)] sm:gap-4">
            {BOXES.map((box) => {
              const stored = TOYS.find(
                (toy) => toy.box === box.id && placed[toy.id],
              );
              return (
                <button
                  key={box.id}
                  type="button"
                  aria-label={`${box.word} toy box`}
                  disabled={locked}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    chooseBox(box);
                  }}
                  className={`grid min-h-0 place-items-center rounded-[24px] border-2 border-white/20 bg-white/8 transition-transform active:scale-90 ${
                    wrongBox === box.id ? "anim-shake" : ""
                  } ${
                    selected?.box === box.id ? "anim-hint" : ""
                  }`}
                >
                  <ToyBox
                    color={box.color}
                    toy={stored?.id}
                    className="h-full w-full"
                    title={`${box.word} toy box`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </PlaceFrame>

      <Celebration trigger={tidied} />
      <Celebration trigger={party} big />
    </div>
  );
}
