import { Art, type ArtProps, Eyes, OUTLINE, Smile } from "@/components/art/common";

export function Frog(props: ArtProps) {
  return (
    <Art {...props}>
      <ellipse cx={24} cy={78} rx={20} ry={11} fill="#4A9B45" stroke={OUTLINE} strokeWidth={3} />
      <ellipse cx={76} cy={78} rx={20} ry={11} fill="#4A9B45" stroke={OUTLINE} strokeWidth={3} />
      <ellipse cx={50} cy={65} rx={31} ry={27} fill="#63BE58" stroke={OUTLINE} strokeWidth={3.4} />
      <circle cx={34} cy={35} r={15} fill="#63BE58" stroke={OUTLINE} strokeWidth={3} />
      <circle cx={66} cy={35} r={15} fill="#63BE58" stroke={OUTLINE} strokeWidth={3} />
      <Eyes x1={34} x2={66} y={34} r={9} pupil={4.4} />
      <ellipse cx={50} cy={66} rx={21} ry={17} fill="#A8E078" opacity={0.8} />
      <Smile cx={50} cy={61} w={22} h={12} width={3} />
      <circle cx={31} cy={58} r={4.5} fill="#F58CA5" opacity={0.55} />
      <circle cx={69} cy={58} r={4.5} fill="#F58CA5" opacity={0.55} />
      <path d="M23 68 L9 57 M77 68 L91 57" stroke="#4A9B45" strokeWidth={8} strokeLinecap="round" />
    </Art>
  );
}

export function LilyPad({
  className,
  fill = "#65B853",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 100 45" className={className} aria-hidden>
      <path d="M6 27 Q13 4 51 4 Q88 4 95 27 Q80 45 48 43 Q17 45 6 27 Z" fill={fill} stroke={OUTLINE} strokeWidth={4} />
      <path d="M51 5 L67 26 L48 22 Z" fill="#78CDEF" />
      <path d="M20 25 Q43 18 70 29" fill="none" stroke="#9BE07A" strokeWidth={3} opacity={0.7} />
    </svg>
  );
}

export function FlowerGarden({
  stage,
  className,
}: {
  stage: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 180 190" className={className} role="img" aria-label="Growing flower">
      {stage >= 3 ? (
        <g className="anim-pop-in">
          <circle cx={145} cy={38} r={21} fill="#FFD84D" stroke={OUTLINE} strokeWidth={3} />
          {[0, 45, 90, 135].map((angle) => (
            <path
              key={angle}
              d="M145 7 V0 M145 76 V69 M114 38 H107 M183 38 H176"
              stroke="#FFD84D"
              strokeWidth={5}
              strokeLinecap="round"
              transform={`rotate(${angle} 145 38)`}
            />
          ))}
        </g>
      ) : null}

      <ellipse cx={90} cy={170} rx={63} ry={12} fill="#6A4330" opacity={0.22} />
      <path d="M42 112 H138 L127 176 H53 Z" fill="#F79420" stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" />
      <path d="M35 106 H145 V123 H35 Z" fill="#FFB25B" stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={90} cy={110} rx={49} ry={12} fill="#6D4934" />

      {stage >= 1 ? (
        <ellipse className="anim-pop-in" cx={90} cy={108} rx={8} ry={5} fill="#D8A34A" stroke={OUTLINE} strokeWidth={2} />
      ) : null}

      {stage >= 2 ? (
        <g className="anim-pop-in">
          <path d="M90 109 Q88 91 91 77" fill="none" stroke="#4A9B45" strokeWidth={6} strokeLinecap="round" />
          <path d="M89 94 Q70 84 67 97 Q80 105 90 99 Z" fill="#63BE58" stroke={OUTLINE} strokeWidth={2.5} />
          <path d="M106 48 Q114 58 106 65 Q98 58 106 48 Z M129 57 Q137 67 129 74 Q121 67 129 57 Z M119 27 Q127 37 119 44 Q111 37 119 27 Z" fill="#4F8FE0" opacity={0.85} />
        </g>
      ) : null}

      {stage >= 3 ? (
        <g className="anim-pop-in">
          <path d="M90 97 Q92 64 90 43" fill="none" stroke="#4A9B45" strokeWidth={7} strokeLinecap="round" />
          <path d="M91 75 Q111 61 118 76 Q106 88 91 84 Z" fill="#63BE58" stroke={OUTLINE} strokeWidth={2.5} />
        </g>
      ) : null}

      {stage >= 4 ? (
        <g className="anim-pop-in" transform="translate(90 37)">
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx={0}
              cy={-18}
              rx={10}
              ry={20}
              fill={angle % 120 === 0 ? "#FF8FB1" : "#E95E92"}
              stroke={OUTLINE}
              strokeWidth={2.5}
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx={0} cy={0} r={13} fill="#FFD84D" stroke={OUTLINE} strokeWidth={3} />
        </g>
      ) : null}
    </svg>
  );
}
