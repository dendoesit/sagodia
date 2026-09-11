import { Art, type ArtProps, OUTLINE } from "@/components/art/common";

export type ClothingId = "hat" | "shirt" | "shoes";
export type ToyId = "ball" | "car" | "blocks";
export type ActionId = "jump" | "spin" | "wave" | "stomp";

export function ClothingGlyph({
  item,
  ...props
}: ArtProps & { item: ClothingId }) {
  if (item === "hat") {
    return (
      <Art {...props}>
        <path
          d="M18 58 Q50 24 82 58 L72 70 Q50 57 28 70 Z"
          fill="#E4574C"
          stroke={OUTLINE}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        <path d="M12 71 Q50 61 88 71" fill="none" stroke={OUTLINE} strokeWidth={7} strokeLinecap="round" />
        <circle cx={50} cy={24} r={10} fill="#FFD84D" stroke={OUTLINE} strokeWidth={4} />
      </Art>
    );
  }

  if (item === "shirt") {
    return (
      <Art {...props}>
        <path
          d="M31 19 L12 34 L23 53 L32 47 L28 88 H72 L68 47 L77 53 L88 34 L69 19 Q50 35 31 19 Z"
          fill="#4F8FE0"
          stroke={OUTLINE}
          strokeWidth={5}
          strokeLinejoin="round"
        />
        <path d="M42 24 Q50 34 58 24" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
        <circle cx={50} cy={48} r={4} fill="#FFD84D" />
        <circle cx={50} cy={64} r={4} fill="#FFD84D" />
      </Art>
    );
  }

  return (
    <Art {...props}>
      <path d="M12 58 Q28 47 45 61 L42 78 Q22 91 10 75 Z" fill="#FFD84D" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
      <path d="M55 61 Q72 47 88 58 L90 75 Q78 91 58 78 Z" fill="#FFD84D" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
      <path d="M17 71 H39 M61 71 H83" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
    </Art>
  );
}

export function PipOutfit({
  worn,
  className,
}: {
  worn: Partial<Record<ClothingId, boolean>>;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden overflow="visible">
      {worn.shirt ? (
        <path
          className="anim-pop-in"
          d="M28 67 Q50 58 72 67 L76 91 Q50 101 24 91 Z"
          fill="#4F8FE0"
          stroke={OUTLINE}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      ) : null}
      {worn.hat ? (
        <g className="anim-pop-in">
          <path d="M24 25 Q50 5 76 25 L70 34 Q50 24 30 34 Z" fill="#E4574C" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
          <path d="M19 34 Q50 28 81 34" fill="none" stroke={OUTLINE} strokeWidth={4.5} strokeLinecap="round" />
          <circle cx={50} cy={7} r={6} fill="#FFD84D" stroke={OUTLINE} strokeWidth={2.5} />
        </g>
      ) : null}
      {worn.shoes ? (
        <g className="anim-pop-in">
          <ellipse cx={34} cy={94} rx={14} ry={7} fill="#FFD84D" stroke={OUTLINE} strokeWidth={3} />
          <ellipse cx={66} cy={94} rx={14} ry={7} fill="#FFD84D" stroke={OUTLINE} strokeWidth={3} />
        </g>
      ) : null}
    </svg>
  );
}

export function ToyGlyph({
  toy,
  ...props
}: ArtProps & { toy: ToyId }) {
  if (toy === "ball") {
    return (
      <Art {...props}>
        <circle cx={50} cy={50} r={37} fill="#E4574C" stroke={OUTLINE} strokeWidth={5} />
        <path d="M14 50 H86 M50 14 V86 M24 24 Q50 50 76 76 M76 24 Q50 50 24 76" fill="none" stroke="#FFD84D" strokeWidth={4} />
      </Art>
    );
  }

  if (toy === "car") {
    return (
      <Art {...props}>
        <path d="M15 55 L25 35 H67 L82 51 L90 55 V75 H10 V58 Z" fill="#5FAF4E" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M31 39 H52 V54 H25 Z M57 39 H65 L77 54 H57 Z" fill="#BDEBFF" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={29} cy={76} r={10} fill="#444B55" stroke={OUTLINE} strokeWidth={4} />
        <circle cx={72} cy={76} r={10} fill="#444B55" stroke={OUTLINE} strokeWidth={4} />
      </Art>
    );
  }

  return (
    <Art {...props}>
      <rect x={12} y={48} width={36} height={36} rx={5} fill="#FFD84D" stroke={OUTLINE} strokeWidth={5} />
      <rect x={52} y={48} width={36} height={36} rx={5} fill="#4F8FE0" stroke={OUTLINE} strokeWidth={5} />
      <rect x={32} y={10} width={36} height={36} rx={5} fill="#F79420" stroke={OUTLINE} strokeWidth={5} />
      <circle cx={50} cy={28} r={7} fill="#FFFFFF" opacity={0.75} />
    </Art>
  );
}

export function ToyBox({
  color,
  toy,
  className,
  title,
}: {
  color: string;
  toy?: ToyId;
  className?: string;
  title?: string;
}) {
  return (
    <Art className={className} title={title}>
      {toy ? (
        <g transform="translate(31 20) scale(0.38)" className="anim-pop-in">
          <ToyGlyph toy={toy} className="h-full w-full" />
        </g>
      ) : null}
      <path d="M13 39 L87 39 L81 89 H19 Z" fill={color} stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" />
      <path d="M9 34 H91 V47 H9 Z" fill={color} stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" />
      <path d="M38 61 H62" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
    </Art>
  );
}

export function ActionGlyph({
  action,
  ...props
}: ArtProps & { action: ActionId }) {
  if (action === "jump") {
    return (
      <Art {...props}>
        <path d="M50 83 V20 M28 42 L50 18 L72 42" fill="none" stroke="#FFFFFF" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
      </Art>
    );
  }
  if (action === "spin") {
    return (
      <Art {...props}>
        <path d="M75 35 A31 31 0 1 0 77 65" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
        <path d="M68 18 L80 38 L57 40" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={4} strokeLinejoin="round" />
      </Art>
    );
  }
  if (action === "wave") {
    return (
      <Art {...props}>
        <path d="M28 78 Q20 57 27 42 Q32 31 39 46 V21 Q39 12 47 17 V42 V13 Q47 5 55 12 V41 V18 Q55 9 63 17 V45 Q68 34 75 39 Q84 46 72 64 Q62 82 45 84 Z" fill="#FFFFFF" stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" />
      </Art>
    );
  }
  return (
    <Art {...props}>
      <path d="M25 19 V65 M75 19 V65 M10 51 L25 69 L40 51 M60 51 L75 69 L90 51" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 84 H36 M64 84 H86" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" />
    </Art>
  );
}
