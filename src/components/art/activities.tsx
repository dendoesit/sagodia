import { Art, type ArtProps, OUTLINE } from "@/components/art/common";

export type ClothingId =
  | "hat"
  | "shirt"
  | "shoes"
  | "rain-hat"
  | "raincoat"
  | "boots"
  | "crown"
  | "jacket"
  | "party-shoes";
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

  if (item === "shoes") {
    return (
      <Art {...props}>
        <path d="M12 58 Q28 47 45 61 L42 78 Q22 91 10 75 Z" fill="#FFD84D" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M55 61 Q72 47 88 58 L90 75 Q78 91 58 78 Z" fill="#FFD84D" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M17 71 H39 M61 71 H83" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
      </Art>
    );
  }

  if (item === "rain-hat") {
    return (
      <Art {...props}>
        <path d="M24 56 Q50 20 76 56 L70 70 H30 Z" fill="#FFD84D" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M13 69 Q50 58 87 69 Q79 86 50 81 Q21 86 13 69 Z" fill="#FFE978" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M37 46 Q50 39 63 46" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
      </Art>
    );
  }

  if (item === "raincoat") {
    return (
      <Art {...props}>
        <path d="M31 24 Q50 10 69 24 L86 42 L75 56 L69 48 L76 90 H24 L31 48 L25 56 L14 42 Z" fill="#5FAF4E" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M38 25 Q50 38 62 25 M50 37 V88" fill="none" stroke="#E8FFD8" strokeWidth={4} />
        <circle cx={50} cy={51} r={4} fill="#FFD84D" />
        <circle cx={50} cy={68} r={4} fill="#FFD84D" />
        <path d="M28 70 H40 M60 70 H72" stroke="#E8FFD8" strokeWidth={4} strokeLinecap="round" />
      </Art>
    );
  }

  if (item === "boots") {
    return (
      <Art {...props}>
        <path d="M17 18 H43 V64 Q43 73 51 74 V88 H10 V72 H20 Z" fill="#E4574C" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M57 18 H83 L80 72 H90 V88 H49 V74 Q57 73 57 64 Z" fill="#E4574C" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M18 29 H42 M58 29 H82" stroke="#FFFFFF" strokeWidth={5} opacity={0.75} />
      </Art>
    );
  }

  if (item === "crown") {
    return (
      <Art {...props}>
        <path d="M13 30 L31 47 L50 15 L69 47 L87 30 L79 78 H21 Z" fill="#8E5BC4" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M22 68 H78" stroke="#FFD84D" strokeWidth={8} />
        <circle cx={31} cy={57} r={5} fill="#FF8FB1" />
        <circle cx={50} cy={51} r={6} fill="#FFD84D" />
        <circle cx={69} cy={57} r={5} fill="#4FC3B4" />
      </Art>
    );
  }

  if (item === "jacket") {
    return (
      <Art {...props}>
        <path d="M30 20 L12 38 L25 55 L31 48 L27 89 H73 L69 48 L75 55 L88 38 L70 20 L50 31 Z" fill="#FF8FB1" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
        <path d="M30 21 L50 54 L50 89 M70 21 L50 54" fill="none" stroke="#FFF3E2" strokeWidth={4} strokeLinejoin="round" />
        <circle cx={50} cy={68} r={4} fill="#FFD84D" />
      </Art>
    );
  }

  return (
    <Art {...props}>
      <path d="M11 59 Q27 45 45 61 L42 81 Q23 92 9 76 Z" fill="#4F8FE0" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
      <path d="M55 61 Q73 45 89 59 L91 76 Q77 92 58 81 Z" fill="#4F8FE0" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round" />
      <path d="M27 59 L30 66 L38 67 L32 72 L34 80 L27 76 L20 80 L22 72 L16 67 L24 66 Z M73 59 L76 66 L84 67 L78 72 L80 80 L73 76 L66 80 L68 72 L62 67 L70 66 Z" fill="#FFFFFF" />
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
      {worn.raincoat ? (
        <g className="anim-pop-in">
          <path d="M25 67 Q50 55 75 67 L79 96 Q50 103 21 96 Z" fill="#5FAF4E" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
          <path d="M50 64 V98" stroke="#E8FFD8" strokeWidth={2.5} />
          <circle cx={50} cy={75} r={2.2} fill="#FFD84D" />
          <circle cx={50} cy={85} r={2.2} fill="#FFD84D" />
        </g>
      ) : null}
      {worn.jacket ? (
        <g className="anim-pop-in">
          <path d="M26 67 Q50 56 74 67 L78 95 Q50 101 22 95 Z" fill="#FF8FB1" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
          <path d="M28 66 L50 84 L72 66 M50 84 V98" fill="none" stroke="#FFF3E2" strokeWidth={2.5} strokeLinejoin="round" />
          <circle cx={50} cy={91} r={2.2} fill="#FFD84D" />
        </g>
      ) : null}
      {worn.hat ? (
        <g className="anim-pop-in">
          <path d="M24 25 Q50 5 76 25 L70 34 Q50 24 30 34 Z" fill="#E4574C" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
          <path d="M19 34 Q50 28 81 34" fill="none" stroke={OUTLINE} strokeWidth={4.5} strokeLinecap="round" />
          <circle cx={50} cy={7} r={6} fill="#FFD84D" stroke={OUTLINE} strokeWidth={2.5} />
        </g>
      ) : null}
      {worn["rain-hat"] ? (
        <g className="anim-pop-in">
          <path d="M27 23 Q50 4 73 23 L70 33 H30 Z" fill="#FFD84D" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
          <path d="M20 32 Q50 25 80 32 Q73 41 50 37 Q27 41 20 32 Z" fill="#FFE978" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
        </g>
      ) : null}
      {worn.crown ? (
        <g className="anim-pop-in">
          <path d="M23 25 L34 13 L50 27 L66 13 L77 25 L72 39 H28 Z" fill="#8E5BC4" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
          <path d="M29 34 H71" stroke="#FFD84D" strokeWidth={4} />
          <circle cx={50} cy={30} r={3} fill="#FFD84D" />
        </g>
      ) : null}
      {worn.shoes ? (
        <g className="anim-pop-in">
          <ellipse cx={34} cy={94} rx={14} ry={7} fill="#FFD84D" stroke={OUTLINE} strokeWidth={3} />
          <ellipse cx={66} cy={94} rx={14} ry={7} fill="#FFD84D" stroke={OUTLINE} strokeWidth={3} />
        </g>
      ) : null}
      {worn.boots ? (
        <g className="anim-pop-in">
          <path d="M24 84 H43 V96 H47 V101 H22 Z M57 84 H76 L78 101 H53 V96 H57 Z" fill="#E4574C" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" />
          <path d="M26 89 H42 M58 89 H74" stroke="#FFFFFF" strokeWidth={2.5} opacity={0.75} />
        </g>
      ) : null}
      {worn["party-shoes"] ? (
        <g className="anim-pop-in">
          <ellipse cx={34} cy={94} rx={14} ry={7} fill="#4F8FE0" stroke={OUTLINE} strokeWidth={3} />
          <ellipse cx={66} cy={94} rx={14} ry={7} fill="#4F8FE0" stroke={OUTLINE} strokeWidth={3} />
          <circle cx={34} cy={94} r={2.5} fill="#FFFFFF" />
          <circle cx={66} cy={94} r={2.5} fill="#FFFFFF" />
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
