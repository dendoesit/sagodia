# Sunny Town — first English words

A Sago Mini World–style play space for toddlers who cannot read yet. Everything
is driven by **pictures and sound**: tap a thing, hear its English name in a
clear voice, and something delightful happens. There is no text to read, no
timer, no score and no way to lose.

Built for a three-year-old holding an iPhone, and installable to the home
screen so it opens full screen like a native app.

## What's in the town

Tap Pip the fox in the corner for a greeting, then pick a place:

| Place            | Words taught                      | How you play                                                            |
| ---------------- | --------------------------------- | ----------------------------------------------------------------------- |
| **Farm**         | cow, pig, sheep, duck, cat, dog, horse, chicken | Tap an animal — it wiggles, says its name and makes its sound. |
| **Kitchen**      | apple, banana, orange, strawberry, carrot, broccoli, cookie, grapes | Tap food to fly it into Munchy's mouth. |
| **Paint tent**   | red, blue, yellow, green, orange, purple, pink, brown | Pick a colour, tap a part of the picture to fill it. Five pictures. |
| **Balloons**     | one … ten                         | Pop floating balloons and count along to ten.                            |
| **Workshop**     | circle, square, triangle, star, heart | Tap a shape, tap its matching hole.                                  |
| **Listen & find** | all of the above                 | The ear button starts a gentle "Where is the cow?" round — three finds, then it ends itself. |

### Design rules

- **No reading required.** Every instruction is spoken. Written words appear
  only as a large label under the picture, which parents can turn off.
- **No failure.** A wrong tap during a "find it" round is never called wrong —
  the app just says the name of whatever was tapped, so the child still learns.
- **Huge targets, instant feedback.** Interactions fire on `pointerdown`, not
  click, because toddlers drag their finger while pressing.
- **No assets to load.** All characters, food and scenery are hand-written SVG,
  the voice is the browser's speech synthesiser, and every sound effect is
  synthesised with the Web Audio API. The whole game works offline.

### Grown-up settings

Press **and hold** the gear in the top-right of the town for about a second —
long enough that a child mashing the screen will not get in. You can mute the
app, hide the written words and slow the voice down.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:43127. Other scripts: `npm run build`, `npm run lint`,
`npm run typecheck`, and `npm run icons` to re-render the home-screen icons
from `scripts/generate-icons.mjs`.

## Deploy to Vercel and install on an iPhone

It is a stock Next.js app with no environment variables, no database and no
API keys, so Vercel needs no configuration — import the repo and deploy.

To install it on an iPhone:

1. Open the deployed URL in **Safari** (Chrome on iOS cannot install web apps).
2. Tap the Share button, then **Add to Home Screen**.
3. Launch it from the home screen. It opens full screen with no browser chrome,
   and works without a connection after the first visit.

### About the sound on iOS

iOS refuses to play audio or speech unless it starts inside a real user
gesture, which is why the app opens on a splash screen with one big play
button — that first tap unlocks the speech synthesiser for the session. If the
phone is on **silent**, spoken words still play but sound effects may not;
switch the ringer on for the full experience.

The voice comes from the device, so it sounds different on iOS, Android and
desktop. The app asks for a warm en-US voice (Samantha on Apple devices) and
falls back to whatever English voice is available.

## Tech

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Web Speech API · Web
Audio API · a hand-rolled service worker for offline play.

```
src/
  app/          layout, page, web app manifest
  components/
    art/        every character, animal, food and building as inline SVG
    games/      the five mini-games
    ui/         shared chrome: game frame, word bubble, confetti, settings
  lib/          audio engine, settings store, word lists, find-it challenge
```
