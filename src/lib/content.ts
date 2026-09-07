import type { AnimalId } from "@/components/art/animals";
import type { FoodId } from "@/components/art/foods";
import type { ShapeId } from "@/components/art/shapes";

export type PlaceId = "farm" | "kitchen" | "paint" | "balloons" | "shapes";

export type PlaceInfo = {
  id: PlaceId;
  /** Spoken when the child taps the place, and announced on entry. */
  word: string;
  invitation: string;
  gradient: string;
  ring: string;
};

export const PLACES: PlaceInfo[] = [
  {
    id: "farm",
    word: "The farm",
    invitation: "Tap an animal!",
    gradient: "from-[#9BE07A] to-[#4F9E52]",
    ring: "#3E7F41",
  },
  {
    id: "kitchen",
    word: "The kitchen",
    invitation: "Feed Munchy!",
    gradient: "from-[#FFE08A] to-[#F79420]",
    ring: "#D97C10",
  },
  {
    id: "paint",
    word: "The paint tent",
    invitation: "Pick a color!",
    gradient: "from-[#C7B2F5] to-[#8E5BC4]",
    ring: "#6F43A3",
  },
  {
    id: "balloons",
    word: "The balloons",
    invitation: "Pop and count!",
    gradient: "from-[#9BE7DC] to-[#2FA9A0]",
    ring: "#1F8880",
  },
  {
    id: "shapes",
    word: "The workshop",
    invitation: "Match the shapes!",
    gradient: "from-[#FFB3C1] to-[#E4574C]",
    ring: "#C93F36",
  },
];

export type AnimalWord = {
  id: AnimalId;
  word: string;
  sound: string;
  tint: string;
};

export const ANIMALS: AnimalWord[] = [
  { id: "cow", word: "Cow", sound: "Moo!", tint: "#BFE7A8" },
  { id: "pig", word: "Pig", sound: "Oink oink!", tint: "#FFD3E0" },
  { id: "sheep", word: "Sheep", sound: "Baa!", tint: "#E7E2D6" },
  { id: "duck", word: "Duck", sound: "Quack quack!", tint: "#FFEFB0" },
  { id: "cat", word: "Cat", sound: "Meow!", tint: "#FFD9B8" },
  { id: "dog", word: "Dog", sound: "Woof woof!", tint: "#E8CDB4" },
  { id: "horse", word: "Horse", sound: "Neigh!", tint: "#D9C0A6" },
  { id: "chicken", word: "Chicken", sound: "Cluck cluck!", tint: "#FFE3D1" },
];

export type FoodWord = {
  id: FoodId;
  word: string;
  tint: string;
};

export const FOODS: FoodWord[] = [
  { id: "apple", word: "Apple", tint: "#FFD2CE" },
  { id: "banana", word: "Banana", tint: "#FFF0B8" },
  { id: "orange", word: "Orange", tint: "#FFDDB8" },
  { id: "strawberry", word: "Strawberry", tint: "#FFCFCC" },
  { id: "carrot", word: "Carrot", tint: "#FFE0C2" },
  { id: "broccoli", word: "Broccoli", tint: "#D3EDC5" },
  { id: "cookie", word: "Cookie", tint: "#F0DEC4" },
  { id: "grapes", word: "Grapes", tint: "#E2D2F5" },
];

export type ColorWord = {
  id: string;
  word: string;
  hex: string;
};

export const COLORS: ColorWord[] = [
  { id: "red", word: "Red", hex: "#E4574C" },
  { id: "blue", word: "Blue", hex: "#4F8FE0" },
  { id: "yellow", word: "Yellow", hex: "#FFD22E" },
  { id: "green", word: "Green", hex: "#5FAF4E" },
  { id: "orange", word: "Orange", hex: "#F79420" },
  { id: "purple", word: "Purple", hex: "#8E5BC4" },
  { id: "pink", word: "Pink", hex: "#FF8FB1" },
  { id: "brown", word: "Brown", hex: "#A0703F" },
];

export type ShapeWord = {
  id: ShapeId;
  word: string;
  hex: string;
};

export const SHAPES: ShapeWord[] = [
  { id: "circle", word: "Circle", hex: "#E4574C" },
  { id: "square", word: "Square", hex: "#4F8FE0" },
  { id: "triangle", word: "Triangle", hex: "#5FAF4E" },
  { id: "star", word: "Star", hex: "#FFD22E" },
  { id: "heart", word: "Heart", hex: "#FF6F91" },
];

export const NUMBER_WORDS = [
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

export const CHEERS = [
  "Yes!",
  "Well done!",
  "Great job!",
  "You did it!",
  "Hooray!",
  "Amazing!",
];

export function randomCheer() {
  return CHEERS[Math.floor(Math.random() * CHEERS.length)];
}

export function pickRandom<T>(items: T[], exclude?: T): T {
  const pool = exclude === undefined ? items : items.filter((item) => item !== exclude);
  const source = pool.length > 0 ? pool : items;
  return source[Math.floor(Math.random() * source.length)];
}
