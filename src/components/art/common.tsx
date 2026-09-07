import type { ReactNode } from "react";

export type ArtProps = {
  className?: string;
  title?: string;
};

export function Art({
  children,
  className,
  title,
  viewBox = "0 0 100 100",
}: ArtProps & { children: ReactNode; viewBox?: string }) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label={title}
      overflow="visible"
    >
      {children}
    </svg>
  );
}

export function Eyes({
  x1,
  x2,
  y,
  r = 6.5,
  pupil = 3.2,
  delay = 0,
}: {
  x1: number;
  x2: number;
  y: number;
  r?: number;
  pupil?: number;
  delay?: number;
}) {
  return (
    <g className="anim-blink" style={{ animationDelay: `${delay}s` }}>
      {[x1, x2].map((x) => (
        <g key={x}>
          <circle cx={x} cy={y} r={r} fill="#FFFFFF" stroke="#2F2A26" strokeWidth={2} />
          <circle cx={x} cy={y + 0.6} r={pupil} fill="#2F2A26" />
          <circle cx={x + pupil * 0.5} cy={y - pupil * 0.6} r={pupil * 0.38} fill="#FFFFFF" />
        </g>
      ))}
    </g>
  );
}

export function Cheeks({
  x1,
  x2,
  y,
  r = 5,
  fill = "#FF9EB5",
}: {
  x1: number;
  x2: number;
  y: number;
  r?: number;
  fill?: string;
}) {
  return (
    <g opacity={0.55}>
      <ellipse cx={x1} cy={y} rx={r} ry={r * 0.7} fill={fill} />
      <ellipse cx={x2} cy={y} rx={r} ry={r * 0.7} fill={fill} />
    </g>
  );
}

export function Smile({
  cx,
  cy,
  w = 16,
  h = 8,
  stroke = "#2F2A26",
  width = 2.6,
}: {
  cx: number;
  cy: number;
  w?: number;
  h?: number;
  stroke?: string;
  width?: number;
}) {
  return (
    <path
      d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + h} ${cx + w / 2} ${cy}`}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
    />
  );
}

export const OUTLINE = "#2F2A26";
