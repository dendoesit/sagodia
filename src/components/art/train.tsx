import { Eyes, OUTLINE, Smile } from "@/components/art/common";

const RAIL = "#3F464F";
const HUB = "#D8DEE6";

/** Distinct colours per number so the wagons are also told apart by sight. */
export const WAGON_TINTS = ["#E4574C", "#4F8FE0", "#FFD22E", "#5FAF4E"];

function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={RAIL}
        stroke={OUTLINE}
        strokeWidth={3}
      />
      <circle cx={cx} cy={cy} r={r * 0.42} fill={HUB} />
    </g>
  );
}

/**
 * A friendly face on the front makes the engine a character rather than a
 * machine, which is what gets a toddler to care whether it leaves.
 */
export function Locomotive({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 110 76"
      className={className}
      role="img"
      aria-label={title ?? "Engine"}
    >
      <rect
        x={2}
        y={46}
        width={106}
        height={9}
        rx={3}
        fill="#6B4A32"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
      <rect
        x={12}
        y={0}
        width={23}
        height={8}
        rx={3}
        fill="#3F464F"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
      <rect
        x={16}
        y={5}
        width={15}
        height={20}
        rx={3}
        fill="#4F5661"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
      <rect
        x={54}
        y={0}
        width={52}
        height={9}
        rx={4}
        fill="#C93F36"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
      <rect
        x={58}
        y={7}
        width={44}
        height={41}
        rx={6}
        fill="#E4574C"
        stroke={OUTLINE}
        strokeWidth={2.8}
      />
      <rect
        x={68}
        y={14}
        width={25}
        height={19}
        rx={4}
        fill="#BFF0EA"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
      <rect
        x={4}
        y={22}
        width={58}
        height={26}
        rx={13}
        fill="#E4574C"
        stroke={OUTLINE}
        strokeWidth={2.8}
      />
      <circle
        cx={46}
        cy={22}
        r={7}
        fill="#FFD22E"
        stroke={OUTLINE}
        strokeWidth={2.4}
      />
      <circle
        cx={10}
        cy={30}
        r={5.5}
        fill="#FFF3E2"
        stroke={OUTLINE}
        strokeWidth={2.4}
      />
      <Eyes x1={18} x2={34} y={38} r={6} pupil={3} />
      <Smile cx={26} cy={44} w={13} h={5} width={2.4} />
      <Wheel cx={22} cy={62} r={12} />
      <Wheel cx={52} cy={64} r={9} />
      <Wheel cx={86} cy={62} r={12} />
      <rect x={104} y={49} width={6} height={5} rx={2} fill={RAIL} />
    </svg>
  );
}

/**
 * The numeral and that many dots, together: a three-year-old reads the dots
 * long before the digit, and seeing both is how the digit starts to mean
 * something.
 */
export function Wagon({
  number,
  className,
  ghost = false,
  label,
}: {
  number: number;
  className?: string;
  ghost?: boolean;
  label?: string;
}) {
  const tint = WAGON_TINTS[(number - 1) % WAGON_TINTS.length];
  const pips = Array.from(
    { length: number },
    (_, i) => 50 + (i - (number - 1) / 2) * 11,
  );

  if (ghost) {
    return (
      <svg
        viewBox="0 0 100 76"
        className={className}
        role="img"
        aria-label={label ?? `Wagon ${number} goes here`}
      >
        <rect
          x={6}
          y={4}
          width={88}
          height={46}
          rx={8}
          fill="#FFFFFF"
          fillOpacity={0.22}
          stroke="#FFFFFF"
          strokeOpacity={0.8}
          strokeWidth={3}
          strokeDasharray="7 6"
        />
        <text
          x={50}
          y={24}
          fontSize={22}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FFFFFF"
          fillOpacity={0.75}
        >
          {number}
        </text>
        {pips.map((x) => (
          <circle
            key={x}
            cx={x}
            cy={39}
            r={3.4}
            fill="#FFFFFF"
            fillOpacity={0.6}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 76"
      className={className}
      role="img"
      aria-label={label ?? `Wagon number ${number}`}
    >
      <rect
        x={4}
        y={48}
        width={92}
        height={8}
        rx={3}
        fill="#6B4A32"
        stroke={OUTLINE}
        strokeWidth={2.6}
      />
      <rect
        x={6}
        y={4}
        width={88}
        height={46}
        rx={8}
        fill={tint}
        stroke={OUTLINE}
        strokeWidth={2.8}
      />
      <rect
        x={14}
        y={10}
        width={72}
        height={34}
        rx={5}
        fill="#FFF9EE"
        stroke={OUTLINE}
        strokeWidth={2.4}
      />
      <text
        x={50}
        y={23}
        fontSize={24}
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="central"
        fill={OUTLINE}
      >
        {number}
      </text>
      {pips.map((x) => (
        <circle key={x} cx={x} cy={38} r={3.6} fill={tint} stroke={OUTLINE} strokeWidth={1.6} />
      ))}
      <Wheel cx={26} cy={62} r={12} />
      <Wheel cx={74} cy={62} r={12} />
      <rect x={0} y={49} width={7} height={5} rx={2} fill={RAIL} />
      <rect x={93} y={49} width={7} height={5} rx={2} fill={RAIL} />
    </svg>
  );
}

/** Rails with sleepers, stretched to whatever width it is given. */
export function Track({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <g fill="#8A5A3B">
        {Array.from({ length: 25 }, (_, i) => (
          <rect key={i} x={i * 8} y={4} width={5} height={8} rx={1} />
        ))}
      </g>
      <rect y={1} width={200} height={4} rx={2} fill="#9AA3AE" />
      <rect y={1} width={200} height={1.6} fill="#C8CFD8" />
    </svg>
  );
}
