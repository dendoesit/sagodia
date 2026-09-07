export type Region =
  | { id: string; kind: "path"; d: string }
  | { id: string; kind: "circle"; cx: number; cy: number; r: number }
  | {
      id: string;
      kind: "ellipse";
      cx: number;
      cy: number;
      rx: number;
      ry: number;
    }
  | {
      id: string;
      kind: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
    };

export type Paintable = {
  id: string;
  word: string;
  regions: Region[];
  /** Stroke-only flourishes drawn on top; not paintable. */
  decor?: string[];
};

const petal = (id: string, cx: number, cy: number): Region => ({
  id,
  kind: "circle",
  cx,
  cy,
  r: 13,
});

export const PAINTABLES: Paintable[] = [
  {
    id: "flower",
    word: "Flower",
    regions: [
      { id: "stem", kind: "rect", x: 45, y: 40, width: 10, height: 52, rx: 4 },
      {
        id: "leaf-left",
        kind: "path",
        d: "M46 64 q-22 -16 -28 4 q22 14 28 -4 Z",
      },
      {
        id: "leaf-right",
        kind: "path",
        d: "M54 76 q22 -16 28 4 q-22 14 -28 -4 Z",
      },
      petal("petal-1", 50, 14),
      petal("petal-2", 67, 24),
      petal("petal-3", 67, 44),
      petal("petal-4", 50, 54),
      petal("petal-5", 33, 44),
      petal("petal-6", 33, 24),
      { id: "middle", kind: "circle", cx: 50, cy: 34, r: 14 },
    ],
  },
  {
    id: "car",
    word: "Car",
    regions: [
      {
        id: "body",
        kind: "path",
        d: "M6 66 q0 -18 18 -18 h52 q18 0 18 18 v8 q0 6 -6 6 H12 q-6 0 -6 -6 Z",
      },
      { id: "roof", kind: "path", d: "M26 48 L37 24 H63 L74 48 Z" },
      { id: "window", kind: "path", d: "M39 44 L46 30 H58 L65 44 Z" },
      { id: "wheel-left", kind: "circle", cx: 27, cy: 80, r: 12 },
      { id: "wheel-right", kind: "circle", cx: 73, cy: 80, r: 12 },
    ],
  },
  {
    id: "house",
    word: "House",
    regions: [
      {
        id: "chimney",
        kind: "rect",
        x: 66,
        y: 16,
        width: 11,
        height: 20,
        rx: 2,
      },
      { id: "wall", kind: "rect", x: 18, y: 44, width: 64, height: 46, rx: 4 },
      { id: "roof", kind: "path", d: "M6 46 L50 12 L94 46 Z" },
      { id: "door", kind: "rect", x: 40, y: 62, width: 21, height: 28, rx: 4 },
      {
        id: "window-left",
        kind: "rect",
        x: 24,
        y: 52,
        width: 14,
        height: 14,
        rx: 3,
      },
      {
        id: "window-right",
        kind: "rect",
        x: 63,
        y: 52,
        width: 14,
        height: 14,
        rx: 3,
      },
    ],
  },
  {
    id: "butterfly",
    word: "Butterfly",
    regions: [
      { id: "wing-top-left", kind: "ellipse", cx: 30, cy: 36, rx: 21, ry: 19 },
      { id: "wing-top-right", kind: "ellipse", cx: 70, cy: 36, rx: 21, ry: 19 },
      { id: "wing-low-left", kind: "ellipse", cx: 33, cy: 68, rx: 17, ry: 16 },
      { id: "wing-low-right", kind: "ellipse", cx: 67, cy: 68, rx: 17, ry: 16 },
      { id: "body", kind: "ellipse", cx: 50, cy: 52, rx: 7, ry: 28 },
      { id: "head", kind: "circle", cx: 50, cy: 20, r: 8 },
    ],
    decor: ["M46 14 q-8 -10 -14 -10", "M54 14 q8 -10 14 -10"],
  },
  {
    id: "fish",
    word: "Fish",
    regions: [
      { id: "tail", kind: "path", d: "M76 50 L96 28 L96 72 Z" },
      { id: "fin-top", kind: "path", d: "M44 26 q10 -18 22 -8 Z" },
      { id: "fin-low", kind: "path", d: "M44 74 q10 18 22 8 Z" },
      { id: "body", kind: "ellipse", cx: 46, cy: 50, rx: 34, ry: 26 },
      { id: "eye", kind: "circle", cx: 26, cy: 42, r: 7 },
    ],
    decor: ["M18 58 q10 8 20 0"],
  },
  {
    id: "boat",
    word: "Boat",
    regions: [
      { id: "mast", kind: "rect", x: 47, y: 18, width: 6, height: 48, rx: 3 },
      { id: "sail-big", kind: "path", d: "M44 24 L44 62 L16 62 Z" },
      { id: "sail-small", kind: "path", d: "M56 28 L56 58 L82 58 Z" },
      { id: "flag", kind: "path", d: "M53 12 L74 19 L53 26 Z" },
      { id: "hull", kind: "path", d: "M12 66 H88 L74 84 H26 Z" },
    ],
    decor: ["M6 90 q7 -7 14 0 t14 0 t14 0 t14 0 t14 0 t14 0"],
  },
  {
    id: "tree",
    word: "Tree",
    regions: [
      { id: "trunk", kind: "rect", x: 44, y: 54, width: 12, height: 38, rx: 4 },
      { id: "crown-left", kind: "circle", cx: 30, cy: 48, r: 19 },
      { id: "crown-right", kind: "circle", cx: 70, cy: 48, r: 19 },
      { id: "crown-top", kind: "circle", cx: 50, cy: 30, r: 21 },
      { id: "apple-left", kind: "circle", cx: 34, cy: 36, r: 6 },
      { id: "apple-right", kind: "circle", cx: 64, cy: 54, r: 6 },
    ],
  },
  {
    id: "ice-cream",
    word: "Ice cream",
    regions: [
      { id: "cone", kind: "path", d: "M32 56 H68 L50 94 Z" },
      { id: "scoop-low", kind: "circle", cx: 50, cy: 50, r: 19 },
      { id: "scoop-top", kind: "circle", cx: 50, cy: 30, r: 16 },
      { id: "cherry", kind: "circle", cx: 50, cy: 11, r: 7 },
    ],
    decor: ["M38 66 L54 82", "M50 62 L64 76"],
  },
  {
    id: "rocket",
    word: "Rocket",
    regions: [
      { id: "flame", kind: "path", d: "M40 72 q10 26 20 0 q-4 14 -10 20 q-6 -6 -10 -20 Z" },
      { id: "fin-left", kind: "path", d: "M38 56 L20 80 L38 74 Z" },
      { id: "fin-right", kind: "path", d: "M62 56 L80 80 L62 74 Z" },
      { id: "body", kind: "rect", x: 38, y: 28, width: 24, height: 46, rx: 7 },
      { id: "nose", kind: "path", d: "M38 30 q12 -26 24 0 Z" },
      { id: "window", kind: "circle", cx: 50, cy: 44, r: 8 },
    ],
  },
  {
    id: "cat",
    word: "Cat",
    regions: [
      { id: "ear-left", kind: "path", d: "M24 34 L18 6 L46 22 Z" },
      { id: "ear-right", kind: "path", d: "M76 34 L82 6 L54 22 Z" },
      { id: "head", kind: "circle", cx: 50, cy: 54, r: 31 },
      { id: "muzzle", kind: "ellipse", cx: 50, cy: 66, rx: 19, ry: 13 },
      { id: "nose", kind: "path", d: "M43 60 H57 L50 67 Z" },
    ],
    decor: [
      "M34 46 q7 -9 14 0",
      "M52 46 q7 -9 14 0",
      "M32 64 H14",
      "M32 70 H16",
      "M68 64 H86",
      "M68 70 H84",
    ],
  },
  {
    id: "cake",
    word: "Cake",
    regions: [
      { id: "plate", kind: "rect", x: 8, y: 86, width: 84, height: 8, rx: 4 },
      { id: "base", kind: "rect", x: 20, y: 58, width: 60, height: 28, rx: 4 },
      { id: "top", kind: "rect", x: 27, y: 40, width: 46, height: 20, rx: 4 },
      {
        id: "frosting",
        kind: "path",
        d: "M27 40 H73 V46 q-6 8 -11.5 0 q-6 8 -11.5 0 q-6 8 -11.5 0 q-6 8 -11.5 0 Z",
      },
      { id: "candle", kind: "rect", x: 47, y: 18, width: 6, height: 22, rx: 2 },
      { id: "flame", kind: "path", d: "M50 4 q8 8 0 15 q-8 -7 0 -15 Z" },
    ],
  },
];
