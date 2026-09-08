"use client";

import { FOODS, type FoodWord, pickRandom } from "@/lib/content";

let currentRequest = FOODS[1];

export function foodWithArticle(word: string): string {
  const lower = word.toLowerCase();
  if (lower === "broccoli" || lower === "grapes") return `some ${lower}`;
  return `${/^[aeiou]/.test(lower) ? "an" : "a"} ${lower}`;
}

/** Pick once in the place-card tap so iOS can speak the matching request. */
export function chooseKitchenRequest(): FoodWord {
  currentRequest = pickRandom(FOODS, currentRequest);
  return currentRequest;
}

export function getKitchenRequest(): FoodWord {
  return currentRequest;
}
