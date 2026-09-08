"use client";

import { useEffect, useRef, useState } from "react";
import { ShapeGlyph, ShapeHole } from "@/components/art/shapes";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { useWordBubble } from "@/components/ui/WordBubble";
import {
  sfxFanfare,
  sfxPop,
  sfxSuccess,
  sfxTap,
  speakTapped,
  vibrate,
} from "@/lib/audio";
import { SHAPES, type ShapeWord } from "@/lib/content";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Tap-to-pick then tap-to-place rather than drag: small fingers lose a drag
 * halfway across the screen, and two taps always land.
 */
export function ShapesGame({ onHome }: { onHome: () => void }) {
  const { bubble, showWord } = useWordBubble();
  const [layout, setLayout] = useState(() => ({
    holes: shuffle(SHAPES),
    tray: shuffle(SHAPES),
  }));
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<ShapeWord | null>(null);
  const [wrongHole, setWrongHole] = useState<string | null>(null);
  const [party, setParty] = useState(0);
  const resetTimer = useRef<number | undefined>(undefined);

  const { holes, tray } = layout;
  const remaining = SHAPES.filter((shape) => !placed[shape.id]);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const pickShape = (shape: ShapeWord) => {
    sfxTap();
    vibrate();
    setSelected(shape);
    showWord(shape.word);
    speakTapped(shape.id, [shape.word]);
  };

  const dropInto = (hole: ShapeWord) => {
    if (!selected) {
      sfxTap();
      showWord(hole.word);
      speakTapped(`hole-${hole.id}`, [hole.word]);
      return;
    }
    if (hole.id !== selected.id) {
      sfxTap();
      setWrongHole(hole.id);
      window.setTimeout(() => setWrongHole(null), 500);
      showWord(hole.word);
      speakTapped(`hole-${hole.id}`, [hole.word]);
      return;
    }

    const next = { ...placed, [hole.id]: true };
    setPlaced(next);
    setSelected(null);
    showWord(hole.word);
    sfxPop();

    if (Object.keys(next).length === SHAPES.length) {
      sfxFanfare();
      setParty((n) => n + 1);
      resetTimer.current = window.setTimeout(() => {
        setPlaced({});
        setLayout({ holes: shuffle(SHAPES), tray: shuffle(SHAPES) });
      }, 3200);
    } else {
      sfxSuccess();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#FFD3D8] to-[#E4574C]">
      <PlaceFrame onHome={onHome} bubble={bubble} bubbleTone="#C93F36">
        <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-2">
          <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 place-items-center gap-2 rounded-[32px] border-4 border-white/70 bg-[#C99B6B] p-2 shadow-inner sm:gap-4 landscape:grid-cols-5 landscape:grid-rows-1">
            {holes.map((hole) => (
              <button
                key={hole.id}
                type="button"
                aria-label={`${hole.word} hole`}
                onPointerDown={(event) => {
                  event.preventDefault();
                  dropInto(hole);
                }}
                className={`grid h-full w-full place-items-center transition-transform ${
                  wrongHole === hole.id ? "anim-wiggle" : ""
                } ${selected?.id === hole.id ? "anim-bob" : ""}`}
              >
                {placed[hole.id] ? (
                  <span className="anim-pop-in block h-full w-full">
                    <ShapeGlyph
                      shape={hole.id}
                      fill={hole.hex}
                      className="h-full w-full"
                    />
                  </span>
                ) : (
                  <ShapeHole shape={hole.id} className="h-full w-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex h-[22%] min-h-20 shrink-0 items-center justify-center gap-2 rounded-[28px] border-4 border-white/70 bg-white/40 px-2 sm:gap-4">
            {remaining.length === 0 ? (
              <p className="text-2xl font-bold text-white drop-shadow">
                All done!
              </p>
            ) : (
              tray
                .filter((shape) => !placed[shape.id])
                .map((shape) => (
                  <button
                    key={shape.id}
                    type="button"
                    aria-label={shape.word}
                    aria-pressed={selected?.id === shape.id}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      pickShape(shape);
                    }}
                    className={`h-full max-w-24 flex-1 transition-transform active:scale-90 ${
                      selected?.id === shape.id
                        ? "-translate-y-1 scale-110 drop-shadow-[0_0_12px_#fff]"
                        : ""
                    }`}
                  >
                    <ShapeGlyph
                      shape={shape.id}
                      fill={shape.hex}
                      className="h-full w-full"
                    />
                  </button>
                ))
            )}
          </div>
        </div>
      </PlaceFrame>

      <Celebration trigger={party} big />
    </div>
  );
}
