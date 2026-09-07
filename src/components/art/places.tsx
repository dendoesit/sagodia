import { Art, ArtProps, OUTLINE } from "@/components/art/common";
import { SHAPE_PATHS } from "@/components/art/shapes";

export function BarnScene(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x={18} y={44} width={64} height={46} rx={5} fill="#E4574C" stroke={OUTLINE} strokeWidth={3.4} />
      <path d="M12 46 L50 16 L88 46 Z" fill="#C93F36" stroke={OUTLINE} strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M50 22 L50 40" stroke="#FFF3E2" strokeWidth={3} strokeLinecap="round" />
      <rect x={38} y={58} width={24} height={32} rx={3} fill="#FFF3E2" stroke={OUTLINE} strokeWidth={3} />
      <path d="M38 58 L62 90 M62 58 L38 90" stroke="#E4574C" strokeWidth={3} />
      <rect x={44} y={30} width={12} height={12} rx={2} fill="#FFD84D" stroke={OUTLINE} strokeWidth={2.6} />
      <circle cx={26} cy={58} r={5} fill="#FFF3E2" stroke={OUTLINE} strokeWidth={2.6} />
      <circle cx={74} cy={58} r={5} fill="#FFF3E2" stroke={OUTLINE} strokeWidth={2.6} />
    </Art>
  );
}

export function SnackCartScene(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x={16} y={46} width={68} height={34} rx={6} fill="#FFD84D" stroke={OUTLINE} strokeWidth={3.4} />
      <path
        d="M10 46 L90 46 L84 28 L16 28 Z"
        fill="#4FC3B4"
        stroke={OUTLINE}
        strokeWidth={3.4}
        strokeLinejoin="round"
      />
      <path d="M30 28 L26 46 M50 28 L50 46 M70 28 L74 46" stroke="#FFF3E2" strokeWidth={5} />
      <rect x={26} y={56} width={48} height={18} rx={4} fill="#FFF3E2" stroke={OUTLINE} strokeWidth={2.8} />
      <circle cx={40} cy={65} r={6} fill="#E4574C" stroke={OUTLINE} strokeWidth={2.4} />
      <circle cx={58} cy={65} r={6} fill="#F79420" stroke={OUTLINE} strokeWidth={2.4} />
      <circle cx={30} cy={86} r={7} fill="#4A4441" stroke={OUTLINE} strokeWidth={2.8} />
      <circle cx={70} cy={86} r={7} fill="#4A4441" stroke={OUTLINE} strokeWidth={2.8} />
      <path d="M50 24 q2 -10 12 -12" stroke="#5FAF4E" strokeWidth={4} fill="none" strokeLinecap="round" />
    </Art>
  );
}

export function PaintTentScene(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M22 88 L34 44 M78 88 L66 44" stroke="#8A5A3B" strokeWidth={5} strokeLinecap="round" />
      <rect x={22} y={16} width={56} height={48} rx={6} fill="#FFF3E2" stroke={OUTLINE} strokeWidth={3.4} />
      <path d="M32 52 q10 -28 22 -14 q8 10 16 2 L70 54 Z" fill="#8ED7FF" />
      <circle cx={40} cy={30} r={6} fill="#FFD84D" />
      <path d="M32 54 L70 54" stroke={OUTLINE} strokeWidth={2.6} />
      <path
        d="M62 74 q-18 0 -18 -10 q0 -12 16 -12 q16 0 16 10 q0 12 -14 12 Z"
        fill="#F79E52"
        stroke={OUTLINE}
        strokeWidth={2.8}
        strokeLinejoin="round"
      />
      <circle cx={53} cy={60} r={3} fill="#E4574C" />
      <circle cx={63} cy={58} r={3} fill="#4F8FE0" />
      <circle cx={70} cy={65} r={3} fill="#5FAF4E" />
      <circle cx={57} cy={68} r={3.4} fill="#FFF3E2" stroke={OUTLINE} strokeWidth={1.6} />
    </Art>
  );
}

export function BalloonCartScene(props: ArtProps) {
  const balloons = [
    [28, 34, "#E4574C"],
    [50, 24, "#4F8FE0"],
    [72, 34, "#FFD84D"],
    [38, 50, "#8E5BC4"],
    [62, 50, "#5FAF4E"],
  ] as const;
  return (
    <Art {...props}>
      <g stroke={OUTLINE} strokeWidth={2} fill="none">
        {balloons.map(([cx, cy]) => (
          <path key={`s-${cx}-${cy}`} d={`M${cx} ${cy + 15} Q ${cx + 4} ${cy + 30} 50 78`} />
        ))}
      </g>
      <g stroke={OUTLINE} strokeWidth={3}>
        {balloons.map(([cx, cy, fill]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={13} ry={15} fill={fill} />
        ))}
      </g>
      {balloons.map(([cx, cy]) => (
        <ellipse key={`h-${cx}-${cy}`} cx={cx - 4} cy={cy - 5} rx={3.4} ry={4.4} fill="#FFFFFF" opacity={0.55} />
      ))}
      <rect x={34} y={78} width={32} height={14} rx={4} fill="#8A5A3B" stroke={OUTLINE} strokeWidth={3} />
    </Art>
  );
}

export function ShapeWorkshopScene(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x={12} y={26} width={76} height={58} rx={8} fill="#F4E4CE" stroke={OUTLINE} strokeWidth={3.4} />
      <g strokeLinejoin="round" stroke={OUTLINE} strokeWidth={2.6}>
        <g transform="translate(20 34) scale(0.28)">
          <path d={SHAPE_PATHS.circle} fill="#E4574C" strokeWidth={9} />
        </g>
        <g transform="translate(52 34) scale(0.28)">
          <path d={SHAPE_PATHS.triangle} fill="#4F8FE0" strokeWidth={9} />
        </g>
        <g transform="translate(20 58) scale(0.28)">
          <path d={SHAPE_PATHS.star} fill="#FFD84D" strokeWidth={9} />
        </g>
        <g transform="translate(52 58) scale(0.28)">
          <path d={SHAPE_PATHS.heart} fill="#8E5BC4" strokeWidth={9} />
        </g>
      </g>
      <path d="M12 20 L88 20" stroke="#8A5A3B" strokeWidth={6} strokeLinecap="round" />
    </Art>
  );
}
