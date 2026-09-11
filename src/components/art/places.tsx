import { Art, ArtProps, OUTLINE } from "@/components/art/common";
import { SHAPE_PATHS } from "@/components/art/shapes";

export function BarnScene(props: ArtProps) {
  return (
    <Art {...props}>
      <rect
        x={18}
        y={44}
        width={64}
        height={46}
        rx={5}
        fill="#E4574C"
        stroke={OUTLINE}
        strokeWidth={3.4}
      />
      <path
        d="M12 46 L50 16 L88 46 Z"
        fill="#C93F36"
        stroke={OUTLINE}
        strokeWidth={3.4}
        strokeLinejoin="round"
      />
      <path
        d="M50 22 L50 40"
        stroke="#FFF3E2"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <rect
        x={38}
        y={58}
        width={24}
        height={32}
        rx={3}
        fill="#FFF3E2"
        stroke={OUTLINE}
        strokeWidth={3}
      />
      <path d="M38 58 L62 90 M62 58 L38 90" stroke="#E4574C" strokeWidth={3} />
      <rect
        x={44}
        y={30}
        width={12}
        height={12}
        rx={2}
        fill="#FFD84D"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
      <circle
        cx={26}
        cy={58}
        r={5}
        fill="#FFF3E2"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
      <circle
        cx={74}
        cy={58}
        r={5}
        fill="#FFF3E2"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
    </Art>
  );
}

export function SnackCartScene(props: ArtProps) {
  return (
    <Art {...props}>
      <rect
        x={16}
        y={46}
        width={68}
        height={34}
        rx={6}
        fill="#FFD84D"
        stroke={OUTLINE}
        strokeWidth={3.4}
      />
      <path
        d="M10 46 L90 46 L84 28 L16 28 Z"
        fill="#4FC3B4"
        stroke={OUTLINE}
        strokeWidth={3.4}
        strokeLinejoin="round"
      />
      <path
        d="M30 28 L26 46 M50 28 L50 46 M70 28 L74 46"
        stroke="#FFF3E2"
        strokeWidth={5}
      />
      <rect
        x={26}
        y={56}
        width={48}
        height={18}
        rx={4}
        fill="#FFF3E2"
        stroke={OUTLINE}
        strokeWidth={2.8}
      />
      <circle
        cx={40}
        cy={65}
        r={6}
        fill="#E4574C"
        stroke={OUTLINE}
        strokeWidth={2.4}
      />
      <circle
        cx={58}
        cy={65}
        r={6}
        fill="#F79420"
        stroke={OUTLINE}
        strokeWidth={2.4}
      />
      <circle
        cx={30}
        cy={86}
        r={7}
        fill="#4A4441"
        stroke={OUTLINE}
        strokeWidth={2.8}
      />
      <circle
        cx={70}
        cy={86}
        r={7}
        fill="#4A4441"
        stroke={OUTLINE}
        strokeWidth={2.8}
      />
      <path
        d="M50 24 q2 -10 12 -12"
        stroke="#5FAF4E"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </Art>
  );
}

export function PaintTentScene(props: ArtProps) {
  return (
    <Art {...props}>
      <path
        d="M22 88 L34 44 M78 88 L66 44"
        stroke="#8A5A3B"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <rect
        x={22}
        y={16}
        width={56}
        height={48}
        rx={6}
        fill="#FFF3E2"
        stroke={OUTLINE}
        strokeWidth={3.4}
      />
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
      <circle
        cx={57}
        cy={68}
        r={3.4}
        fill="#FFF3E2"
        stroke={OUTLINE}
        strokeWidth={1.6}
      />
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
          <path
            key={`s-${cx}-${cy}`}
            d={`M${cx} ${cy + 15} Q ${cx + 4} ${cy + 30} 50 78`}
          />
        ))}
      </g>
      <g stroke={OUTLINE} strokeWidth={3}>
        {balloons.map(([cx, cy, fill]) => (
          <ellipse
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            rx={13}
            ry={15}
            fill={fill}
          />
        ))}
      </g>
      {balloons.map(([cx, cy]) => (
        <ellipse
          key={`h-${cx}-${cy}`}
          cx={cx - 4}
          cy={cy - 5}
          rx={3.4}
          ry={4.4}
          fill="#FFFFFF"
          opacity={0.55}
        />
      ))}
      <rect
        x={34}
        y={78}
        width={32}
        height={14}
        rx={4}
        fill="#8A5A3B"
        stroke={OUTLINE}
        strokeWidth={3}
      />
    </Art>
  );
}

export function StationScene(props: ArtProps) {
  return (
    <Art {...props}>
      <rect
        x={10}
        y={20}
        width={46}
        height={44}
        rx={5}
        fill="#FFF3E2"
        stroke={OUTLINE}
        strokeWidth={3.2}
      />
      <path
        d="M4 22 L33 6 L62 22 Z"
        fill="#C93F36"
        stroke={OUTLINE}
        strokeWidth={3.2}
        strokeLinejoin="round"
      />
      <circle
        cx={33}
        cy={32}
        r={8}
        fill="#FFFFFF"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
      <path
        d="M33 32 L33 27 M33 32 L37 34"
        stroke={OUTLINE}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <rect
        x={18}
        y={44}
        width={14}
        height={20}
        rx={2}
        fill="#8ED7FF"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
      <rect
        x={38}
        y={44}
        width={14}
        height={20}
        rx={2}
        fill="#8ED7FF"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
      <rect
        x={58}
        y={40}
        width={22}
        height={24}
        rx={5}
        fill="#E4574C"
        stroke={OUTLINE}
        strokeWidth={3}
      />
      <rect
        x={78}
        y={30}
        width={18}
        height={34}
        rx={5}
        fill="#4F8FE0"
        stroke={OUTLINE}
        strokeWidth={3}
      />
      <rect
        x={82}
        y={36}
        width={10}
        height={10}
        rx={2}
        fill="#BFF0EA"
        stroke={OUTLINE}
        strokeWidth={2.2}
      />
      <g fill="#8A5A3B">
        {[8, 22, 36, 50, 64, 78].map((x) => (
          <rect key={x} x={x} y={72} width={7} height={10} rx={1} />
        ))}
      </g>
      <rect x={2} y={68} width={96} height={5} rx={2.5} fill="#9AA3AE" />
      <circle cx={64} cy={68} r={7} fill="#3F464F" stroke={OUTLINE} strokeWidth={2.6} />
      <circle cx={88} cy={68} r={7} fill="#3F464F" stroke={OUTLINE} strokeWidth={2.6} />
    </Art>
  );
}

export function ShapeWorkshopScene(props: ArtProps) {
  return (
    <Art {...props}>
      <rect
        x={12}
        y={26}
        width={76}
        height={58}
        rx={8}
        fill="#F4E4CE"
        stroke={OUTLINE}
        strokeWidth={3.4}
      />
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
      <path
        d="M12 20 L88 20"
        stroke="#8A5A3B"
        strokeWidth={6}
        strokeLinecap="round"
      />
    </Art>
  );
}

export function DressUpScene(props: ArtProps) {
  return (
    <Art {...props}>
      <circle cx={50} cy={46} r={23} fill="#FBAF63" stroke={OUTLINE} strokeWidth={3} />
      <path d="M28 32 L23 10 L42 25 Z M72 32 L77 10 L58 25 Z" fill="#F79E52" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={42} cy={44} r={3.5} fill={OUTLINE} />
      <circle cx={58} cy={44} r={3.5} fill={OUTLINE} />
      <path d="M43 57 Q50 63 57 57" fill="none" stroke={OUTLINE} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M24 28 Q50 10 76 28 L70 35 Q50 25 30 35 Z" fill="#E4574C" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M31 65 L69 65 L77 90 L23 90 Z" fill="#4F8FE0" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={50} cy={74} r={3} fill="#FFD84D" />
    </Art>
  );
}

export function ToyCleanupScene(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M14 43 L86 43 L80 90 L20 90 Z" fill="#4F8FE0" stroke={OUTLINE} strokeWidth={3.5} strokeLinejoin="round" />
      <path d="M10 36 H90 V49 H10 Z" fill="#77B5F3" stroke={OUTLINE} strokeWidth={3.5} strokeLinejoin="round" />
      <circle cx={34} cy={31} r={14} fill="#E4574C" stroke={OUTLINE} strokeWidth={3} />
      <path d="M21 31 H47 M34 18 V44" stroke="#FFD84D" strokeWidth={3} />
      <rect x={52} y={18} width={18} height={18} rx={3} fill="#FFD84D" stroke={OUTLINE} strokeWidth={3} />
      <rect x={68} y={27} width={16} height={16} rx={3} fill="#5FAF4E" stroke={OUTLINE} strokeWidth={3} />
      <path d="M34 68 H66" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
    </Art>
  );
}

export function ActionPlaygroundScene(props: ArtProps) {
  return (
    <Art {...props}>
      <path d="M17 72 Q50 88 83 72" fill="none" stroke="#5FAF4E" strokeWidth={6} strokeLinecap="round" />
      <circle cx={50} cy={40} r={20} fill="#FBAF63" stroke={OUTLINE} strokeWidth={3} />
      <path d="M33 26 L29 9 L43 23 Z M67 26 L71 9 L57 23 Z" fill="#F79E52" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={43} cy={39} r={3} fill={OUTLINE} />
      <circle cx={57} cy={39} r={3} fill={OUTLINE} />
      <path d="M43 50 Q50 56 57 50" fill="none" stroke={OUTLINE} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M38 58 Q50 52 62 58 L67 78 H33 Z" fill="#F79E52" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M30 61 L14 48 M70 61 L86 48 M39 77 L31 91 M61 77 L69 91" fill="none" stroke={OUTLINE} strokeWidth={6} strokeLinecap="round" />
      <path d="M10 24 L19 18 M82 18 L91 24 M12 38 H3 M88 38 H97" stroke="#FFD84D" strokeWidth={4} strokeLinecap="round" />
    </Art>
  );
}
