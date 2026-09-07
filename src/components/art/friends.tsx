import {
  Art,
  ArtProps,
  Cheeks,
  Eyes,
  OUTLINE,
  Smile,
} from "@/components/art/common";

/** Pip the fox greets children in the town square. */
export function Pip({
  waving = false,
  ...props
}: ArtProps & { waving?: boolean }) {
  return (
    <Art {...props}>
      <ellipse
        cx={50}
        cy={78}
        rx={26}
        ry={20}
        fill="#F79E52"
        stroke={OUTLINE}
        strokeWidth={3}
      />
      <ellipse cx={50} cy={84} rx={16} ry={12} fill="#FFF3E2" />
      <path
        d="M18 84 q-14 -4 -12 -14 q10 -4 16 4 Z"
        fill="#F79E52"
        stroke={OUTLINE}
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
      <g
        className={waving ? "anim-wave" : undefined}
        style={{ transformOrigin: "78px 76px" }}
      >
        <path
          d="M76 82 q14 -6 14 -16 q-10 -6 -16 2 Z"
          fill="#F79E52"
          stroke={OUTLINE}
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M22 30 L18 6 L42 20 Z"
        fill="#F79E52"
        stroke={OUTLINE}
        strokeWidth={2.8}
        strokeLinejoin="round"
      />
      <path
        d="M78 30 L82 6 L58 20 Z"
        fill="#F79E52"
        stroke={OUTLINE}
        strokeWidth={2.8}
        strokeLinejoin="round"
      />
      <path d="M25 25 L23 12 L36 20 Z" fill="#4A3524" />
      <path d="M75 25 L77 12 L64 20 Z" fill="#4A3524" />
      <circle
        cx={50}
        cy={46}
        r={28}
        fill="#FBAF63"
        stroke={OUTLINE}
        strokeWidth={3}
      />
      <path
        d="M50 46 q-22 2 -20 14 q3 14 20 14 q17 0 20 -14 q2 -12 -20 -14 Z"
        fill="#FFF3E2"
      />
      <Eyes x1={39} x2={61} y={42} r={7} pupil={3.6} />
      <Cheeks x1={28} x2={72} y={54} r={5.5} fill="#FF8FA0" />
      <path d="M44 58 L56 58 L50 64 Z" fill="#2F2A26" strokeLinejoin="round" />
      <Smile cx={50} cy={66} w={16} h={7} />
    </Art>
  );
}

export type MunchyMouth = "smile" | "open" | "chew";

/** Munchy lives in the snack kitchen and eats whatever the child feeds it. */
export function Munchy({
  mouth = "smile",
  ...props
}: ArtProps & { mouth?: MunchyMouth }) {
  return (
    <Art {...props}>
      <path
        d="M32 20 L26 4"
        stroke={OUTLINE}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M68 20 L74 4"
        stroke={OUTLINE}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle
        cx={26}
        cy={4}
        r={5}
        fill="#FFD84D"
        stroke={OUTLINE}
        strokeWidth={2.4}
      />
      <circle
        cx={74}
        cy={4}
        r={5}
        fill="#FF8FB1"
        stroke={OUTLINE}
        strokeWidth={2.4}
      />
      <path
        d="M50 14 q34 0 34 34 q0 38 -34 38 q-34 0 -34 -38 q0 -34 34 -34 Z"
        fill="#4FC3B4"
        stroke={OUTLINE}
        strokeWidth={3.2}
        strokeLinejoin="round"
      />
      <path
        d="M30 36 q6 -12 18 -12"
        stroke="#9BE7DC"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
        opacity={0.7}
      />
      <Eyes x1={38} x2={62} y={40} r={9} pupil={4.4} />
      <Cheeks x1={26} x2={74} y={56} r={6} fill="#FF7FA6" />
      {mouth === "open" ? (
        <ellipse cx={50} cy={64} rx={16} ry={15} fill="#2F2A26" />
      ) : mouth === "chew" ? (
        <ellipse cx={50} cy={64} rx={13} ry={7} fill="#2F2A26" />
      ) : (
        <Smile cx={50} cy={60} w={26} h={13} width={3.4} />
      )}
      {mouth === "open" ? (
        <ellipse cx={50} cy={74} rx={8} ry={5} fill="#FF7FA6" />
      ) : null}
    </Art>
  );
}

export function Sparkle({
  className,
  fill = "#FFD84D",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M50 4 q8 34 46 46 q-38 12 -46 46 q-8 -34 -46 -46 q38 -12 46 -46 Z"
        fill={fill}
      />
    </svg>
  );
}

export function HomeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M50 14 L92 50 L80 50 L80 88 L58 88 L58 62 L42 62 L42 88 L20 88 L20 50 L8 50 Z"
        fill="#FFFFFF"
        stroke={OUTLINE}
        strokeWidth={5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EarGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M30 44 L30 56 L46 56 L64 74 L64 26 L46 44 Z"
        fill="#FFFFFF"
        stroke={OUTLINE}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path
        d="M72 36 q10 14 0 28 M82 26 q18 24 0 48"
        stroke="#FFFFFF"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
