"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Locomotive, Track, Wagon } from "@/components/art/train";
import { Celebration } from "@/components/ui/Celebration";
import { PlaceFrame } from "@/components/ui/PlaceFrame";
import { useWordBubble } from "@/components/ui/WordBubble";
import {
  sfxChuffs,
  sfxCouple,
  sfxTap,
  sfxWhistle,
  speakTapped,
  vibrate,
} from "@/lib/audio";
import { numberWord } from "@/lib/content";

const WAGONS = [1, 2, 3, 4];
/** Let the final spoken number finish before the whistle. */
const COUNT_MS = 1100;
const DEPART_MS = 3000;

const COURSES = [
  {
    id: "meadow",
    name: "Meadow Line",
    sky: ["#BBD6F5", "#7F9DC9"],
    ground: "#7FB86A",
  },
  {
    id: "coast",
    name: "Coastal Line",
    sky: ["#8EDCFF", "#4F9FD8"],
    ground: "#E8C878",
  },
  {
    id: "mountain",
    name: "Mountain Line",
    sky: ["#D8E7F2", "#8298B2"],
    ground: "#78906C",
  },
  {
    id: "moonlight",
    name: "Moonlight Line",
    sky: ["#6677B8", "#293765"],
    ground: "#536D57",
  },
] as const;

type Course = (typeof COURSES)[number];

/** Each completed train moves to a visually distinct route. */
function CourseScenery({
  course,
  className,
}: {
  course: Course;
  className?: string;
}) {
  if (course.id === "coast") {
    return (
      <svg
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        className={className}
        aria-hidden
      >
        <path d="M0 30 Q25 22 50 30 T100 30 T150 30 T200 30 V60 H0 Z" fill="#4FC3D7" />
        <path d="M0 43 Q22 34 44 43 T88 43 T132 43 T176 43 T220 43 V60 H0 Z" fill="#2D9DB5" />
        <path d="M0 52 Q45 39 92 52 T200 48 V60 H0 Z" fill="#E8C878" />
        <path d="M36 27 l9 -16 l9 16 Z" fill="#FFFFFF" />
        <path d="M45 11 v20" stroke="#6B4A32" strokeWidth={2} />
      </svg>
    );
  }

  if (course.id === "mountain") {
    return (
      <svg
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        className={className}
        aria-hidden
      >
        <path d="M0 48 L34 9 L62 40 L96 3 L130 42 L164 13 L200 48 V60 H0 Z" fill="#65788B" />
        <path d="M21 24 L34 9 L45 25 L37 22 L32 27 L28 21 Z M78 23 L96 3 L112 22 L101 18 L95 25 L89 17 Z M151 29 L164 13 L177 29 L168 24 L162 30 L158 23 Z" fill="#F4F8FB" />
        <path d="M0 51 Q42 40 84 52 T168 50 T220 48 V60 H0 Z" fill="#78906C" />
      </svg>
    );
  }

  if (course.id === "moonlight") {
    return (
      <svg
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        className={className}
        aria-hidden
      >
        <g fill="#FFF1A8">
          {[18, 48, 82, 126, 174].map((x, index) => (
            <circle key={x} cx={x} cy={8 + (index % 3) * 7} r={1.5} />
          ))}
        </g>
        <path d="M0 48 Q28 17 58 43 Q86 10 116 42 Q150 16 200 45 V60 H0 Z" fill="#40594D" />
        <path d="M0 53 Q45 40 90 53 T180 51 T230 50 V60 H0 Z" fill="#536D57" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path d="M0 34 q26 -22 52 -2 q22 16 44 -6 q26 -20 50 2 q28 22 54 4 L200 60 L0 60 Z" fill="#8FBF6E" />
      <path d="M0 46 q34 -16 68 2 q30 16 62 -2 q36 -18 70 4 L200 60 L0 60 Z" fill="#7FB86A" />
      <g fill="#4F8B4A">
        {[18, 46, 92, 128, 168].map((x, i) => (
          <g key={x} transform={`translate(${x} ${44 + (i % 2) * 4})`}>
            <path d="M0 10 L5 -6 L10 10 Z" />
            <rect x={4} y={9} width={2} height={5} fill="#6B4A32" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Couple the wagons in order and the train leaves the station.
 *
 * Every wagon carries its numeral *and* that many dots, because the dots are
 * what a three-year-old can actually count — the digit only starts to mean
 * something once it has been seen next to four dots enough times.
 */
export function TrainGame({ onHome }: { onHome: () => void }) {
  const { bubble, showWord } = useWordBubble();
  const [yard, setYard] = useState(() => shuffle(WAGONS));
  const [coupled, setCoupled] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [party, setParty] = useState(0);
  const [courseIndex, setCourseIndex] = useState(0);
  const timers = useRef<number[]>([]);
  const course = COURSES[courseIndex];

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const reset = useCallback(() => {
    setLeaving(false);
    setCoupled(0);
    setWrong(null);
    setYard(shuffle(WAGONS));
    setCourseIndex((current) => (current + 1) % COURSES.length);
  }, []);

  const next = coupled + 1;

  const handleTap = (value: number) => {
    if (leaving) return;

    if (value !== next) {
      sfxTap();
      vibrate([10, 40, 10]);
      setWrong(value);
      window.setTimeout(() => setWrong((current) => (current === value ? null : current)), 500);
      showWord(numberWord(value));
      speakTapped(`wagon-${value}`, [numberWord(value)]);
      return;
    }

    sfxCouple();
    vibrate(20);
    setYard((current) => current.filter((item) => item !== value));
    setCoupled(value);
    showWord(numberWord(value));

    if (value < WAGONS.length) {
      speakTapped(`wagon-${value}`, [numberWord(value)]);
      return;
    }

    speakTapped(`wagon-${value}`, [numberWord(value)]);
    timers.current.push(
      window.setTimeout(() => {
        sfxWhistle();
        sfxChuffs();
        setLeaving(true);
        setParty((n) => n + 1);
      }, COUNT_MS),
    );
    timers.current.push(
      window.setTimeout(reset, COUNT_MS + DEPART_MS + 600),
    );
  };

  return (
    <div
      data-train-course={course.id}
      className="relative h-full w-full overflow-hidden transition-colors duration-700"
      style={{
        background: `linear-gradient(to bottom, ${course.sky[0]}, ${course.sky[1]})`,
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute right-[8%] top-[9%] h-24 w-24 rounded-full blur-[1px] ${
            course.id === "moonlight"
              ? "bg-[#FFF7CF]/90 shadow-[0_0_35px_rgba(255,247,207,0.5)]"
              : "bg-[#FFE082]/80"
          }`}
        />
        <div className="absolute left-[8%] top-[26%] h-12 w-28 rounded-full bg-white/60 blur-[2px]" />
        <div className="absolute right-[16%] top-[40%] h-9 w-20 rounded-full bg-white/50 blur-[2px]" />
      </div>

      <PlaceFrame
        onHome={onHome}
        prompt={
          leaving ? (
            `Bye bye, ${course.name}!`
          ) : (
            <span className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-2">
                <span>Next:</span>
                <Wagon
                  number={next}
                  label={`Next is wagon ${next}`}
                  className="h-8 w-auto sm:h-10"
                />
              </span>
              <span className="flex items-center gap-1 text-xs text-[#2F2A26]/65 sm:text-sm">
                {COURSES.map((item, index) => (
                  <span
                    key={item.id}
                    className={`h-2 w-2 rounded-full ${
                      index === courseIndex
                        ? "bg-[#F79420]"
                        : "bg-[#2F2A26]/20"
                    }`}
                  />
                ))}
                <span className="ml-1">{course.name}</span>
              </span>
            </span>
          )
        }
        bubble={bubble}
        bubbleTone="#3F5F8F"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <CourseScenery
            course={course}
            className="mt-auto h-[22%] min-h-16 w-full shrink-0"
          />

          {/* The train sits on its rails and slides off to the right; the rails
            stay put, so it reads as the train moving, not the world. */}
          <div className="relative w-full overflow-hidden px-3">
            <div
              className={`flex w-full items-end justify-start gap-[0.6%] ${
                leaving ? "anim-depart" : ""
              }`}
            >
              <div className="relative h-[min(13vw,20dvh)] shrink-0">
                <Locomotive className="h-full w-auto" title="The engine" />
                {leaving ? (
                  <span className="pointer-events-none absolute left-[16%] top-0 block">
                    {[0, 0.3, 0.6, 0.9].map((delay) => (
                      <span
                        key={delay}
                        className="anim-puff absolute block h-6 w-6 rounded-full bg-white/85"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </span>
                ) : null}
              </div>

              {WAGONS.slice(0, coupled).map((value) => (
                <Wagon
                  key={value}
                  number={value}
                  className="anim-couple h-[min(13vw,20dvh)] w-auto shrink-0"
                />
              ))}

              {!leaving &&
                WAGONS.slice(coupled).map((value) => (
                  <Wagon
                    key={value}
                    number={value}
                    ghost
                    className={`h-[min(13vw,20dvh)] w-auto shrink-0 ${
                      value === next ? "anim-hint" : "opacity-70"
                    }`}
                  />
                ))}
            </div>
            <Track className="h-3 w-full sm:h-4" />
          </div>

          {/* The grass starts where the rails are, so the yard of spare wagons
            sits beside the track rather than floating in the sky. */}
          <div
            className="grid shrink-0 grid-cols-2 gap-2 px-3 pb-3 pt-3 transition-colors duration-700 sm:gap-3 landscape:grid-cols-4"
            style={{ background: course.ground }}
          >
            {yard.map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Wagon number ${value}`}
                onPointerDown={(event) => {
                  event.preventDefault();
                  handleTap(value);
                }}
                className={`grid place-items-center rounded-[24px] border-4 border-white/50 bg-white/25 p-2 shadow-[0_6px_0_rgba(0,0,0,0.12)] transition-transform active:scale-95 ${
                  wrong === value ? "anim-shake" : ""
                }`}
              >
                <Wagon number={value} className="h-auto w-full" />
              </button>
            ))}
            {yard.length === 0 ? (
              <p className="col-span-2 py-6 text-center text-xl font-bold text-white drop-shadow landscape:col-span-4">
                All aboard!
              </p>
            ) : null}
          </div>
        </div>
      </PlaceFrame>

      <Celebration trigger={party} big />
    </div>
  );
}
