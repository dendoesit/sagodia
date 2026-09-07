import { OUTLINE } from "@/components/art/common";

export const SHAPE_PATHS = {
  circle: "M92 50 A42 42 0 1 1 8 50 A42 42 0 1 1 92 50 Z",
  square: "M14 14 H86 V86 H14 Z",
  triangle: "M50 10 L90 84 L10 84 Z",
  star: "M50 8 L60.6 35.4 L89.9 37 L67.1 55.6 L74.7 84 L50 68 L25.3 84 L32.9 55.6 L10.1 37 L39.4 35.4 Z",
  heart:
    "M50 88 C8 60 10 22 32 18 C43 16 50 25 50 32 C50 25 57 16 68 18 C90 22 92 60 50 88 Z",
} as const;

export type ShapeId = keyof typeof SHAPE_PATHS;

export function ShapeGlyph({
  shape,
  fill,
  className,
  outline = OUTLINE,
  strokeWidth = 4,
}: {
  shape: ShapeId;
  fill: string;
  className?: string;
  outline?: string;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d={SHAPE_PATHS[shape]}
        fill={fill}
        stroke={outline}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The cut-out on the puzzle board that a shape drops into. */
export function ShapeHole({
  shape,
  className,
}: {
  shape: ShapeId;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d={SHAPE_PATHS[shape]}
        fill="#00000026"
        stroke="#FFFFFF"
        strokeWidth={4}
        strokeDasharray="9 7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
