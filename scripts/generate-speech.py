#!/usr/bin/env python3
"""Generate the small offline speech library used by Sunny Town.

The browser's speechSynthesis API is kept as a fallback, but it is not
dependable enough to be the primary voice on iOS.  These clips are generated
once, committed to public/audio, and then played with a regular <audio>
element.

Regenerate with:
    python3 -m pip install edge-tts==7.2.8
    python3 scripts/generate-speech.py
"""

from __future__ import annotations

import asyncio
import json
import re
from pathlib import Path

import edge_tts


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "audio"
MANIFEST = ROOT / "src" / "lib" / "speechClips.generated.ts"
OFFLINE_MANIFEST = OUTPUT / "manifest.json"
VOICE_CONFIG = OUTPUT / "voice.json"
# Libby is a friendly British voice. A near-natural pace avoids the stretched,
# robotic sound that the previous US voice developed on isolated words.
VOICE = "en-GB-LibbyNeural"
RATE = "-5%"
PITCH = "+2Hz"

ANIMALS = {
    "Cow": "Moo!",
    "Pig": "Oink oink!",
    "Sheep": "Baa!",
    "Duck": "Quack quack!",
    "Cat": "Meow!",
    "Dog": "Woof woof!",
    "Horse": "Neigh!",
    "Chicken": "Cluck cluck!",
}
FOODS = [
    "Apple",
    "Banana",
    "Orange",
    "Strawberry",
    "Carrot",
    "Broccoli",
    "Cookie",
    "Grapes",
]
COLORS = ["Red", "Blue", "Yellow", "Green", "Orange", "Purple", "Pink", "Brown"]
SHAPES = ["Circle", "Square", "Triangle", "Star", "Heart"]
DRESSING = [
    ("Hat", "Red"),
    ("Shirt", "Blue"),
    ("Shoes", "Yellow"),
    ("Rain hat", "Yellow"),
    ("Raincoat", "Green"),
    ("Boots", "Red"),
    ("Crown", "Purple"),
    ("Jacket", "Pink"),
    ("Party shoes", "Blue"),
]
TOY_CLEANUP = [
    ("Ball", "Blue"),
    ("Car", "Red"),
    ("Blocks", "Green"),
]
ACTIONS = ["Jump", "Spin", "Wave", "Stomp"]
FROG_COMMANDS = ["Jump", "Run", "Walk", "Stop", "Clap", "Sit", "Stand", "Turn"]
FLOWER_STEPS = ["Seed", "Water", "Sun", "Flower"]
NUMBERS = [
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
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
    "Twenty",
] + [str(value) for value in range(21, 101)]
PLACES = [
    "The farm. Tap an animal!",
    "The kitchen. Feed Munchy!",
    "The paint tent. Pick a color!",
    "The balloons. Pop and count!",
    "The workshop. Match the shapes!",
    "The station. Build the train!",
]


def key(text: str) -> str:
    return " ".join(re.sub(r"[^a-z0-9 ]", "", text.lower()).split())


def slug(text: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", key(text)).strip("-")
    return value[:90]


def build_lines() -> list[str]:
    lines = {
        "Hello! Welcome to Sunny Town. Let's learn some words!",
        "Sound on",
        "Like this",
        "Yum!",
        "Yummy!",
        "Try again!",
        "Now you say it.",
        "Here comes another train! Find number one.",
        "Four! One, two, three, four! All aboard!",
        "The train is leaving the station! Goodbye!",
        *PLACES,
        *FOODS,
        *COLORS,
        *SHAPES,
        *(item for item, _ in DRESSING),
        *(toy for toy, _ in TOY_CLEANUP),
        *ACTIONS,
        *FROG_COMMANDS,
        *FLOWER_STEPS,
        *NUMBERS,
    }

    for item, color in DRESSING:
        lines.add(f"Put on the {color.lower()} {item.lower()}.")

    for toy, color in TOY_CLEANUP:
        lines.add(f"Put the {toy.lower()} in the {color.lower()} box.")

    for action in ACTIONS:
        lines.add(f"Make Pip {action.lower()}.")

    for animal, sound in ANIMALS.items():
        lower = animal.lower()
        lines.update(
            {
                animal,
                sound,
                f"{animal}. Now you say it.",
                f"Touch the {lower}!",
                f"Not the {lower}!",
            }
        )

    for food in FOODS:
        lower = food.lower()
        article = (
            "some"
            if lower in {"broccoli", "grapes"}
            else "an"
            if lower[0] in "aeiou"
            else "a"
        )
        lines.update(
            {
                f"Give me the {lower}!",
                f"Munchie wants {article} {lower}.",
                f"Yummy, but I want the {lower}!",
            }
        )

    for color in COLORS:
        lower = color.lower()
        lines.update(
            {
                f"Find {lower}!",
                f"That is not {lower}.",
            }
        )

    for shape in SHAPES:
        lower = shape.lower()
        article = "an" if lower[0] in "aeiou" else "a"
        lines.update(
            {
                f"This is {article} {lower}.",
                f"That one is {article} {lower}.",
            }
        )

    return sorted(lines, key=key)


async def generate() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    entries: dict[str, str] = {}
    expected_config = {"voice": VOICE, "rate": RATE, "pitch": PITCH}
    try:
        current_config = json.loads(VOICE_CONFIG.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        current_config = None
    regenerate = current_config != expected_config
    if regenerate:
        print(f"Regenerating the library with {VOICE} at {RATE}, pitch {PITCH}")

    for index, text in enumerate(build_lines(), start=1):
        normalized = key(text)
        filename = f"{slug(text)}.mp3"
        destination = OUTPUT / filename
        entries[normalized] = f"/audio/{filename}"
        if regenerate or not destination.exists():
            print(f"[{index:03}] {text}")
            await edge_tts.Communicate(
                text=text,
                voice=VOICE,
                rate=RATE,
                pitch=PITCH,
            ).save(str(destination))

    source = (
        "/* Generated by scripts/generate-speech.py. Do not edit by hand. */\n"
        "export const SPEECH_CLIPS: Readonly<Record<string, string>> = "
        + json.dumps(entries, indent=2, ensure_ascii=False)
        + ";\n"
    )
    MANIFEST.write_text(source, encoding="utf-8")
    OFFLINE_MANIFEST.write_text(
        json.dumps(sorted(set(entries.values())), indent=2) + "\n",
        encoding="utf-8",
    )
    VOICE_CONFIG.write_text(
        json.dumps(expected_config, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    asyncio.run(generate())
