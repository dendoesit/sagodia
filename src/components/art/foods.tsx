import { Art, ArtProps, OUTLINE } from "@/components/art/common";

export function Apple(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M50 26 q3 -12 14 -14 q1 11 -10 15 Z" fill="#5FAF4E" stroke={OUTLINE} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M50 24 q-2 -8 -6 -12" stroke="#7B5230" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path
        d="M50 28 q-10 -8 -22 0 q-12 9 -6 30 q6 21 18 22 q4 0 10 -3 q6 3 10 3 q12 -1 18 -22 q6 -21 -6 -30 q-12 -8 -22 0 Z"
        fill="#E4574C"
        stroke={OUTLINE}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M36 44 q-4 8 -2 16" stroke="#FFFFFF" strokeWidth={4} opacity={0.5} fill="none" strokeLinecap="round" />
    </Art>
  );
}

export function Banana(props: ArtProps) {
  return (
    <Art {...props}>
      <path
        d="M20 30 q-4 42 30 52 q34 10 34 -14 q-2 8 -14 6 q-30 -6 -34 -46 Z"
        fill="#FFD84D"
        stroke={OUTLINE}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M20 30 q-6 -6 2 -8 q8 -2 14 6" fill="#E7B93A" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M84 68 q4 6 -2 8" fill="#8A6A2E" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M32 44 q4 26 26 34" stroke="#FFEFA8" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
    </Art>
  );
}

export function Orange(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M52 22 q10 -12 22 -10 q-2 12 -18 14 Z" fill="#5FAF4E" stroke={OUTLINE} strokeWidth={2.4} strokeLinejoin="round" />
      <circle cx={50} cy={57} r={32} fill="#F79420" stroke={OUTLINE} strokeWidth={3} />
      <g fill="#E07C10" opacity={0.7}>
        <circle cx={36} cy={46} r={2.4} />
        <circle cx={62} cy={42} r={2.4} />
        <circle cx={70} cy={62} r={2.4} />
        <circle cx={44} cy={72} r={2.4} />
        <circle cx={30} cy={62} r={2.4} />
        <circle cx={56} cy={62} r={2.4} />
      </g>
      <path d="M32 40 q-6 8 -4 16" stroke="#FFD9A8" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.8} />
    </Art>
  );
}

export function Strawberry(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M50 20 L50 30" stroke="#5FAF4E" strokeWidth={4} strokeLinecap="round" />
      <path
        d="M50 30 q-24 0 -26 22 q-2 20 26 40 q28 -20 26 -40 q-2 -22 -26 -22 Z"
        fill="#E2453C"
        stroke={OUTLINE}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path
        d="M50 24 q-14 2 -20 8 q10 2 12 6 q3 -8 8 -8 q5 0 8 8 q2 -4 12 -6 q-6 -6 -20 -8 Z"
        fill="#5FAF4E"
        stroke={OUTLINE}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <g fill="#FFE9A8">
        {[
          [40, 46],
          [58, 46],
          [50, 56],
          [34, 60],
          [66, 60],
          [42, 70],
          [58, 70],
        ].map(([cx, cy]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={2} ry={3} />
        ))}
      </g>
    </Art>
  );
}

export function Carrot(props: ArtProps) {
  return (
    <Art {...props}>
      <g fill="#5FAF4E" stroke={OUTLINE} strokeWidth={2.4} strokeLinejoin="round">
        <path d="M50 30 q-4 -18 -18 -20 q0 16 12 22 Z" />
        <path d="M50 28 q0 -22 4 -24 q10 10 6 26 Z" />
        <path d="M52 30 q10 -16 22 -14 q-4 16 -18 18 Z" />
      </g>
      <path
        d="M36 32 q14 -6 28 0 q-4 30 -14 58 q-10 -28 -14 -58 Z"
        fill="#F58A2E"
        stroke={OUTLINE}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <g stroke="#D96F16" strokeWidth={2.6} strokeLinecap="round">
        <path d="M40 44 L58 42" />
        <path d="M43 58 L57 56" />
        <path d="M46 72 L54 70" />
      </g>
    </Art>
  );
}

export function Broccoli(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M40 58 q10 -6 20 0 q2 22 -2 30 q-8 4 -16 0 q-4 -8 -2 -30 Z" fill="#A8D08D" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
      <g stroke={OUTLINE} strokeWidth={2.6}>
        <circle cx={32} cy={42} r={15} fill="#4F9E52" />
        <circle cx={68} cy={42} r={15} fill="#4F9E52" />
        <circle cx={50} cy={30} r={17} fill="#4F9E52" />
        <circle cx={40} cy={52} r={13} fill="#4F9E52" />
        <circle cx={60} cy={52} r={13} fill="#4F9E52" />
      </g>
      <g fill="#4F9E52">
        <circle cx={32} cy={42} r={14} />
        <circle cx={68} cy={42} r={14} />
        <circle cx={50} cy={30} r={16} />
        <circle cx={40} cy={52} r={12} />
        <circle cx={60} cy={52} r={12} />
      </g>
      <g fill="#3E7F41" opacity={0.6}>
        <circle cx={44} cy={30} r={3} />
        <circle cx={58} cy={36} r={3} />
        <circle cx={32} cy={44} r={3} />
        <circle cx={66} cy={46} r={3} />
      </g>
    </Art>
  );
}

export function Cookie(props: ArtProps) {
  return (
    <Art {...props}>
      <circle cx={50} cy={52} r={32} fill="#D9A15B" stroke={OUTLINE} strokeWidth={3} />
      <circle cx={50} cy={50} r={28} fill="#E5B478" />
      <g fill="#6B4423">
        <circle cx={38} cy={38} r={5} />
        <circle cx={62} cy={44} r={4.4} />
        <circle cx={46} cy={60} r={5.2} />
        <circle cx={66} cy={66} r={4} />
        <circle cx={30} cy={56} r={3.6} />
      </g>
    </Art>
  );
}

export function Grapes(props: ArtProps) {
  const berries = [
    [50, 30],
    [38, 42],
    [62, 42],
    [50, 46],
    [30, 56],
    [70, 56],
    [42, 60],
    [58, 60],
    [50, 74],
  ] as const;
  return (
    <Art {...props}>
      <path d="M50 28 q2 -12 -6 -16" stroke="#7B5230" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M46 16 q10 -8 18 -2 q-10 6 -18 2 Z" fill="#5FAF4E" stroke={OUTLINE} strokeWidth={2.2} strokeLinejoin="round" />
      <g stroke={OUTLINE} strokeWidth={2.4}>
        {berries.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={11} fill="#8E5BC4" />
        ))}
      </g>
      {berries.map(([cx, cy]) => (
        <circle key={`i-${cx}-${cy}`} cx={cx - 3} cy={cy - 3} r={3} fill="#C9A6E8" opacity={0.8} />
      ))}
    </Art>
  );
}

export const FOOD_ART = {
  apple: Apple,
  banana: Banana,
  orange: Orange,
  strawberry: Strawberry,
  carrot: Carrot,
  broccoli: Broccoli,
  cookie: Cookie,
  grapes: Grapes,
} as const;

export type FoodId = keyof typeof FOOD_ART;
