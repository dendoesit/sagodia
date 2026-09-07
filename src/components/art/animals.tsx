import { Art, ArtProps, Cheeks, Eyes, OUTLINE, Smile } from "@/components/art/common";

export function Cow(props: ArtProps) {
  return (
    <Art {...props}>
      <ellipse cx={20} cy={40} rx={11} ry={8} fill="#F6F2EA" stroke={OUTLINE} strokeWidth={2.5} />
      <ellipse cx={80} cy={40} rx={11} ry={8} fill="#F6F2EA" stroke={OUTLINE} strokeWidth={2.5} />
      <ellipse cx={32} cy={22} rx={6} ry={7} fill="#EBD3A3" stroke={OUTLINE} strokeWidth={2.5} />
      <ellipse cx={68} cy={22} rx={6} ry={7} fill="#EBD3A3" stroke={OUTLINE} strokeWidth={2.5} />
      <rect x={22} y={24} width={56} height={56} rx={26} fill="#FBF8F2" stroke={OUTLINE} strokeWidth={3} />
      <ellipse cx={34} cy={36} rx={9} ry={7} fill="#4A4441" />
      <ellipse cx={70} cy={31} rx={6} ry={4.5} fill="#4A4441" />
      <Eyes x1={38} x2={62} y={45} r={7} />
      <rect x={31} y={55} width={38} height={25} rx={12} fill="#FFB6C8" stroke={OUTLINE} strokeWidth={2.5} />
      <ellipse cx={42} cy={64} rx={3.4} ry={4.4} fill="#E07C99" />
      <ellipse cx={58} cy={64} rx={3.4} ry={4.4} fill="#E07C99" />
      <Smile cx={50} cy={71} w={14} h={6} stroke="#E07C99" />
    </Art>
  );
}

export function Pig(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M22 30 L20 12 L40 22 Z" fill="#FFA6C0" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M78 30 L80 12 L60 22 Z" fill="#FFA6C0" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={50} cy={54} r={30} fill="#FFB9CE" stroke={OUTLINE} strokeWidth={3} />
      <Eyes x1={38} x2={62} y={45} r={6.5} />
      <Cheeks x1={26} x2={74} y={58} fill="#FF7FA6" />
      <ellipse cx={50} cy={65} rx={15} ry={11} fill="#FF8FB1" stroke={OUTLINE} strokeWidth={2.5} />
      <ellipse cx={44} cy={65} rx={3} ry={4} fill="#C9527A" />
      <ellipse cx={56} cy={65} rx={3} ry={4} fill="#C9527A" />
    </Art>
  );
}

export function Sheep(props: ArtProps) {
  const puffs = [
    [30, 34, 13],
    [50, 26, 15],
    [70, 34, 13],
    [24, 52, 13],
    [76, 52, 13],
    [34, 66, 14],
    [66, 66, 14],
    [50, 60, 18],
  ] as const;
  return (
    <Art {...props}>
      <g stroke={OUTLINE} strokeWidth={2.5}>
        {puffs.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#FFFDF7" />
        ))}
      </g>
      {puffs.map(([cx, cy, r]) => (
        <circle key={`f-${cx}-${cy}`} cx={cx} cy={cy} r={r - 1.4} fill="#FFFDF7" />
      ))}
      <ellipse cx={26} cy={50} rx={8} ry={5.5} fill="#C8B7A6" stroke={OUTLINE} strokeWidth={2.5} />
      <ellipse cx={74} cy={50} rx={8} ry={5.5} fill="#C8B7A6" stroke={OUTLINE} strokeWidth={2.5} />
      <ellipse cx={50} cy={54} rx={20} ry={19} fill="#E8DCCF" stroke={OUTLINE} strokeWidth={2.8} />
      <Eyes x1={42} x2={58} y={50} r={6} />
      <ellipse cx={50} cy={62} rx={4} ry={3} fill="#8B7B6B" />
      <Smile cx={50} cy={67} w={12} h={5} />
    </Art>
  );
}

export function Duck(props: ArtProps) {
  return (
    <Art {...props}>
      <ellipse cx={52} cy={68} rx={30} ry={24} fill="#FFD84D" stroke={OUTLINE} strokeWidth={3} />
      <path d="M70 62 q14 6 6 18 q-10 6 -18 -2 Z" fill="#FFC61A" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
      <ellipse cx={44} cy={70} rx={13} ry={10} fill="#FFC61A" stroke={OUTLINE} strokeWidth={2.5} />
      <circle cx={40} cy={36} r={20} fill="#FFE066" stroke={OUTLINE} strokeWidth={3} />
      <path d="M22 34 q-14 3 -14 8 q0 5 14 6 Z" fill="#F79420" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
      <Eyes x1={36} x2={50} y={31} r={5.5} pupil={2.8} />
      <Cheeks x1={32} x2={54} y={42} r={4} fill="#FF9B6A" />
    </Art>
  );
}

export function Cat(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M24 34 L20 10 L44 22 Z" fill="#F79E52" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M76 34 L80 10 L56 22 Z" fill="#F79E52" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M27 29 L26 17 L38 23 Z" fill="#FFC0CB" />
      <path d="M73 29 L74 17 L62 23 Z" fill="#FFC0CB" />
      <circle cx={50} cy={54} r={30} fill="#FBB061" stroke={OUTLINE} strokeWidth={3} />
      <path d="M36 28 q6 6 12 2" stroke="#E08434" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Eyes x1={38} x2={62} y={49} r={7} pupil={3.4} />
      <path d="M46 62 L54 62 L50 67 Z" fill="#E06A82" stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M50 67 q-5 6 -10 1 M50 67 q5 6 10 1" stroke={OUTLINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <g stroke={OUTLINE} strokeWidth={2} strokeLinecap="round">
        <path d="M28 58 L14 55 M28 63 L14 65" />
        <path d="M72 58 L86 55 M72 63 L86 65" />
      </g>
    </Art>
  );
}

export function Dog(props: ArtProps) {
  return (
    <Art {...props}>
      <ellipse cx={20} cy={52} rx={11} ry={20} fill="#8A5A3B" stroke={OUTLINE} strokeWidth={2.5} />
      <ellipse cx={80} cy={52} rx={11} ry={20} fill="#8A5A3B" stroke={OUTLINE} strokeWidth={2.5} />
      <circle cx={50} cy={50} r={30} fill="#C68A5E" stroke={OUTLINE} strokeWidth={3} />
      <ellipse cx={36} cy={36} rx={11} ry={9} fill="#8A5A3B" opacity={0.5} />
      <Eyes x1={39} x2={61} y={46} r={6.5} />
      <ellipse cx={50} cy={64} rx={16} ry={12} fill="#F2DCC4" stroke={OUTLINE} strokeWidth={2.5} />
      <ellipse cx={50} cy={58} rx={6} ry={4.6} fill="#2F2A26" />
      <path d="M50 62 L50 68" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M50 68 q-6 6 -11 0 M50 68 q6 6 11 0" stroke={OUTLINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d="M50 72 q6 2 8 8 q-8 2 -8 -8 Z" fill="#F2879C" />
    </Art>
  );
}

export function Horse(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M28 26 L26 8 L42 20 Z" fill="#A86B3C" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M72 26 L74 8 L58 20 Z" fill="#A86B3C" stroke={OUTLINE} strokeWidth={2.5} strokeLinejoin="round" />
      <rect x={26} y={20} width={48} height={62} rx={24} fill="#C08552" stroke={OUTLINE} strokeWidth={3} />
      <path d="M28 32 q-8 -18 8 -24 q-4 12 4 18 Z" fill="#4A3524" stroke={OUTLINE} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M72 32 q8 -18 -8 -24 q4 12 -4 18 Z" fill="#4A3524" stroke={OUTLINE} strokeWidth={2.4} strokeLinejoin="round" />
      <Eyes x1={38} x2={62} y={42} r={6.5} />
      <ellipse cx={50} cy={68} rx={18} ry={13} fill="#E0B489" stroke={OUTLINE} strokeWidth={2.5} />
      <ellipse cx={43} cy={65} rx={3} ry={4} fill="#7A5637" />
      <ellipse cx={57} cy={65} rx={3} ry={4} fill="#7A5637" />
      <Smile cx={50} cy={74} w={14} h={5} stroke="#7A5637" />
    </Art>
  );
}

export function Chicken(props: ArtProps) {
  return (
    <Art {...props}>
      <path
        d="M38 22 q2 -12 8 -6 q4 -10 9 -2 q6 -6 7 6 Z"
        fill="#E4574C"
        stroke={OUTLINE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <ellipse cx={50} cy={58} rx={30} ry={28} fill="#FFFDF5" stroke={OUTLINE} strokeWidth={3} />
      <ellipse cx={66} cy={60} rx={13} ry={16} fill="#F1E7D6" stroke={OUTLINE} strokeWidth={2.4} />
      <Eyes x1={40} x2={57} y={48} r={6} pupil={3} />
      <path d="M40 58 L26 63 L40 68 Z" fill="#F79420" stroke={OUTLINE} strokeWidth={2.2} strokeLinejoin="round" />
      <ellipse cx={44} cy={74} rx={4} ry={6} fill="#E4574C" stroke={OUTLINE} strokeWidth={2} />
      <path d="M40 86 L36 96 M58 86 L62 96" stroke="#F79420" strokeWidth={4} strokeLinecap="round" />
    </Art>
  );
}

export const ANIMAL_ART = {
  cow: Cow,
  pig: Pig,
  sheep: Sheep,
  duck: Duck,
  cat: Cat,
  dog: Dog,
  horse: Horse,
  chicken: Chicken,
} as const;

export type AnimalId = keyof typeof ANIMAL_ART;
