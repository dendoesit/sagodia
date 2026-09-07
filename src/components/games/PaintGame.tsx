"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame, RoundButton } from "@/components/ui/PlaceFrame";
import { useWordBubble } from "@/components/ui/WordBubble";
import {
  sfxFanfare,
  sfxPop,
  sfxSparkle,
  sfxTap,
  speak,
  speakExclusive,
  vibrate,
} from "@/lib/audio";
import { COLORS, type ColorWord } from "@/lib/content";
import { PAINTABLES, type Region, withArticle } from "@/lib/paintables";
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
      return (
        <ellipse
          cx={region.cx}
          cy={region.cy}
          rx={region.rx}
          ry={region.ry}
          {...shared}
        />
      );
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
  const [finished, setFinished] = useState(false);
  const [party, setParty] = useState(0);
  const swapTimer = useRef<number | undefined>(undefined);

  const picture = PAINTABLES[pictureIndex];

  useEffect(() => () => window.clearTimeout(swapTimer.current), []);

  const goToPicture = useCallback((index: number, announce: boolean) => {
    window.clearTimeout(swapTimer.current);
    setPictureIndex(index);
    setFills({});
    setFinished(false);
    if (announce) {
      speak(`${withArticle(PAINTABLES[index].word)}! Let's paint.`);
    }
  }, []);

  const nextPicture = () => {
    sfxSparkle();
    goToPicture((pictureIndex + 1) % PAINTABLES.length, true);
  };

  const pickColor = (next: ColorWord) => {
    sfxTap();
    vibrate();
    setColor(next);
    showWord(next.word);
    if (!challenge.check(next)) speakExclusive([next.word]);
  };

  const paint = (regionId: string) => {
    if (finished) return;
    if (fills[regionId] === color.hex) return;

    const updated = { ...fills, [regionId]: color.hex };
    setFills(updated);
    sfxPop();
    vibrate();
    showWord(color.word);

    // Finishing the whole picture is the reward, so it takes over the audio
    // instead of politely waiting behind the colour word.
    const complete = picture.regions.every((region) => updated[region.id]);
    if (!complete) {
      speakExclusive([color.word]);
      return;
    }

    const upcoming = (pictureIndex + 1) % PAINTABLES.length;
    setFinished(true);
    setParty((n) => n + 1);
    sfxFanfare();
    speak(
      `Beautiful ${picture.word.toLowerCase()}! Now let's paint ${withArticle(
        PAINTABLES[upcoming].word,
      )}.`,
    );
    swapTimer.current = window.setTimeout(() => goToPicture(upcoming, false), 3600);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-b from-[#E7DCFB] to-[#B79BE8]">
      <PlaceFrame
        onHome={onHome}
        onAsk={challenge.start}
        asking={challenge.active}
        prompt={challenge.prompt}
        bubble={bubble}
        bubbleTone="#5B3A9E"
        extraButton={
          // Yellow arrow, not another white outline: the one control a child
          // has to discover on their own has to look different from the rest.
          <RoundButton
            label="Next picture"
            active
            onPress={nextPicture}
            className={finished ? "anim-hint" : ""}
          >
            <svg
              viewBox="0 0 100 100"
              className="h-8 w-8 sm:h-9 sm:w-9"
              aria-hidden
            >
              <path
                d="M18 50 H72 M50 26 L76 50 L50 74"
                fill="none"
                stroke="#2F2A26"
                strokeWidth={11}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </RoundButton>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-3 landscape:flex-row landscape:items-center">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            {/* Square canvas in both orientations: a wide card would leave the
              drawing marooned in the middle of a lot of empty white. */}
            <div className="grid aspect-square max-h-full w-full max-w-2xl place-items-center rounded-[32px] border-4 border-white/80 bg-white/70 p-2 shadow-lg landscape:h-full landscape:w-auto">
              <svg
                viewBox="0 0 100 100"
                className="h-full w-full"
                aria-label={picture.word}
              >
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

          {/* Four across on a phone, a two-wide column beside the canvas in
            landscape — never small enough that a three-year-old misses. */}
          <div className="mx-auto grid w-full max-w-2xl shrink-0 grid-cols-4 justify-items-center gap-2 landscape:mx-0 landscape:w-36 landscape:grid-cols-2 landscape:content-center">
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
                  className={`aspect-square w-full max-w-16 rounded-full border-4 shadow-md transition-transform active:scale-90 ${
                    selected
                      ? "-translate-y-1 scale-110 border-white"
                      : "border-white/60"
                  } ${hinted ? "anim-hint" : ""}`}
                  style={{ background: item.hex }}
                />
              );
            })}
          </div>
        </div>
      </PlaceFrame>

      <Celebration trigger={challenge.celebrate} />
      <Celebration trigger={challenge.finale} big />
      <Celebration trigger={party} big />
    </div>
  );
}
