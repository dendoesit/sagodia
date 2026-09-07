export type Region =
  | { id: string; kind: "path"; d: string }
  | { id: string; kind: "circle"; cx: number; cy: number; r: number }
  | { id: string; kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { id: string; kind: "rect"; x: number; y: number; width: number; height: number; rx?: number };

export type Paintable = {
  id: string;
  word: string;
  regions: Region[];
  /** Stroke-only flourishes drawn on top; not paintable. */
  decor?: string[];
};

const petal = (id: string, cx: number, cy: number): Region => ({ id, kind: "circle", cx, cy, r: 13 });

export const PAINTABLES: Paintable[] = [
  {
    id: "flower",
    word: "Flower",
    regions: [
      { id: "stem", kind: "rect", x: 45, y: 40, width: 10, height: 52, rx: 4 },
      { id: "leaf-left", kind: "path", d: "M46 64 q-22 -16 -28 4 q22 14 28 -4 Z" },
      { id: "leaf-right", kind: "path", d: "M54 76 q22 -16 28 4 q-22 14 -28 -4 Z" },
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
      { id: "body", kind: "path", d: "M6 66 q0 -18 18 -18 h52 q18 0 18 18 v8 q0 6 -6 6 H12 q-6 0 -6 -6 Z" },
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
      { id: "chimney", kind: "rect", x: 66, y: 16, width: 11, height: 20, rx: 2 },
      { id: "wall", kind: "rect", x: 18, y: 44, width: 64, height: 46, rx: 4 },
      { id: "roof", kind: "path", d: "M6 46 L50 12 L94 46 Z" },
      { id: "door", kind: "rect", x: 40, y: 62, width: 21, height: 28, rx: 4 },
      { id: "window-left", kind: "rect", x: 24, y: 52, width: 14, height: 14, rx: 3 },
      { id: "window-right", kind: "rect", x: 63, y: 52, width: 14, height: 14, rx: 3 },
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
];
