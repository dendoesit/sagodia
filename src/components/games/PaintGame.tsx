"use client";

import { useState } from "react";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { WordBubble, useWordBubble } from "@/components/ui/WordBubble";
import { sfxPop, sfxSparkle, sfxTap, speak, vibrate } from "@/lib/audio";
import { COLORS, type ColorWord } from "@/lib/content";
import { PAINTABLES, type Region } from "@/lib/paintables";
import { useFindChallenge } from "@/lib/useFindChallenge";

const BLANK = "#FFFFFF";

function RegionShape({
  region,
  fill,
  onPaint,
}: {
  region: Region;
  fill: string;
  onPaint: () => void;
}) {
  const shared = {
    fill,
    stroke: "#2F2A26",
    strokeWidth: 2.4,
    strokeLinejoin: "round" as const,
    onPointerDown: (event: React.PointerEvent) => {
      event.preventDefault();
      onPaint();
    },
    style: { cursor: "pointer" },
  };
  switch (region.kind) {
    case "circle":
      return <circle cx={region.cx} cy={region.cy} r={region.r} {...shared} />;
    case "ellipse":
      return <ellipse cx={region.cx} cy={region.cy} rx={region.rx} ry={region.ry} {...shared} />;
    case "rect":
      return (
        <rect
          x={region.x}
          y={region.y}
          width={region.width}
          height={region.height}
          rx={region.rx ?? 0}
          {...shared}
        />
      );
    default:
      return <path d={region.d} {...shared} />;
  }
}

export function PaintGame({ onHome }: { onHome: () => void }) {
  const { bubble, showWord } = useWordBubble();
  const challenge = useFindChallenge(COLORS);
  const [pictureIndex, setPictureIndex] = useState(0);
  const [color, setColor] = useState<ColorWord>(COLORS[0]);
  const [fills, setFills] = useState<Record<string, string>>({});

  const picture = PAINTABLES[pictureIndex];

  const pickColor = (next: ColorWord) => {
    sfxTap();
    vibrate();
    setColor(next);
    showWord(next.word);
    if (!challenge.check(next)) speak(next.word);
  };

  const paint = (regionId: string) => {
    sfxPop();
    vibrate();
    setFills((current) => ({ ...current, [regionId]: color.hex }));
    showWord(color.word);
    speak(color.word);
  };

  const nextPicture = () => {
    sfxSparkle();
    const next = (pictureIndex + 1) % PAINTABLES.length;
    setPictureIndex(next);
    setFills({});
    speak(`A ${PAINTABLES[next].word.toLowerCase()}! Let's paint.`);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#E7DCFB] to-[#B79BE8]">
      <PlaceFrame
        onHome={onHome}
        onAsk={challenge.start}
        asking={challenge.active}
        prompt={challenge.prompt}
      >
        <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-1">
          <div className="grid h-full w-full max-w-2xl place-items-center rounded-[32px] border-4 border-white/80 bg-white/70 p-2 shadow-lg">
            <svg viewBox="0 0 100 100" className="h-full max-h-full w-auto" aria-label={picture.word}>
              {picture.regions.map((region) => (
                <RegionShape
                  key={region.id}
                  region={region}
                  fill={fills[region.id] ?? BLANK}
                  onPaint={() => paint(region.id)}
                />
              ))}
              {picture.decor?.map((d) => (
                <path
                  key={d}
                  d={d}
                  fill="none"
                  stroke="#2F2A26"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-1.5 px-2 pb-3 pt-1 sm:gap-3">
          {COLORS.map((item) => {
            const selected = item.id === color.id;
            const hinted = challenge.hint && challenge.target?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.word}
                aria-pressed={selected}
                onPointerDown={(event) => {
                  event.preventDefault();
                  pickColor(item);
                }}
                className={`h-12 w-12 rounded-full border-4 shadow-md transition-transform active:scale-90 sm:h-16 sm:w-16 ${
                  selected ? "-translate-y-2 scale-110 border-white" : "border-white/60"
                } ${hinted ? "anim-hint" : ""}`}
                style={{ background: item.hex }}
              />
            );
          })}
          <button
            type="button"
            aria-label="New picture"
            onPointerDown={(event) => {
              event.preventDefault();
              nextPicture();
            }}
            className="ml-1 grid h-12 w-12 place-items-center rounded-full border-4 border-white/80 bg-white/40 shadow-md transition-transform active:scale-90 sm:h-16 sm:w-16"
          >
            <svg viewBox="0 0 100 100" className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden>
              <path
                d="M82 40 A34 34 0 1 0 84 62"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={12}
                strokeLinecap="round"
              />
              <path d="M84 14 L88 44 L58 40 Z" fill="#FFFFFF" />
            </svg>
          </button>
        </div>

        <WordBubble bubble={bubble} tone="#5B3A9E" />
      </PlaceFrame>

      <Celebration trigger={challenge.celebrate} />
      <Celebration trigger={challenge.finale} big />
    </div>
  );
}
