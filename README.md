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
| **Farm**         | cow, pig, sheep, duck, cat, dog, horse, chicken | Tap an animal — the app says its name once, then visibly listens while a ring breathes with the child's voice. The recognised word must match before a star is awarded. There is no separate microphone button. |
| **Kitchen**      | apple, banana, orange, strawberry, carrot, broccoli, cookie, grapes | Match the food pictured in “Munchie wants a banana.” Tap Munchie to hear the request. A wrong snack is named, then gently spat back while Munchie shakes his head. |
| **Paint tent**   | red, blue, yellow, green, orange, purple, pink, brown | Pick a colour, tap a part of the picture to fill it. Eleven pictures, and the yellow arrow moves on to the next one. |
| **Balloons**     | counting, with no upper limit     | Pop balloons drifting up from below the screen. The count keeps climbing and cheers every ten; letting one escape off the top starts it over. |
| **Workshop**     | circle, square, triangle, star, heart | Tap a shape, tap its matching hole.                                  |
| **Station**      | one, two, three, four             | Couple the wagons in order and the train pulls out of the station. Each wagon carries its numeral *and* that many dots, because the dots are what a three-year-old can already count. |
| **Listen & find** | animals and colours              | The ear button starts a gentle three-round listening game in the farm or paint tent. |

### Design rules

- **No reading required.** Place cards do not narrate names or generic
  instructions. Relevant taps speak the learning word; pictures and large
  labels provide the visual prompt, and parents can hide the labels.
- **No failure, but never silence either.** A wrong tap during a "find it"
  round is answered rather than judged: the thing they touched introduces
  itself, the app says it is not the one being looked for, the target speaks
  up, and the question is asked again. Tap the dog while looking for the cat
  and you get "Woof woof! Not the cat! Meow! Touch the cat!" — two words
  learned from a mistake, and nothing is ever blocked or scored. Hand Munchy
  the wrong food and he shakes his head and spits it back out.
- **Huge targets, instant feedback.** Interactions fire on `pointerdown`, not
  click, because toddlers drag their finger while pressing.
- **One teaching phrase at a time.** A three-year-old taps far faster than a
  word takes to say. Interactive choices such as the fruit tray briefly lock
  until the complete “Orange … Yum” response and a short cooldown finish.
  Spoken parts have a 220 ms pause between them, so words never collide.
  Fast-action play such as balloon popping stays responsive: the current
  number finishes, then stale queued numbers collapse to the latest score.
- **Speech uses an unlocked Web Audio context.** Bundled clips avoid both the
  unreliable `speechSynthesis` timing path and an iOS audio-session conflict
  that can stall the following pronunciation check.
- **Small, offline assets.** Characters, food and scenery are hand-written
  SVG. The learning vocabulary uses a small library of bundled neural-voice
  clips; browser speech is only a fallback for an unusual dynamic sentence.
  Sound effects are synthesised with the Web Audio API.

### Grown-up settings

Press **and hold** the gear in the top-right of the town for about a second —
long enough that a child mashing the screen will not get in. You can mute the
app, hide the written words and slow the voice down.

After an animal is tapped, the listening display shows when it is the
child's turn. Pronunciation checking is on by default and uses the browser's
speech recognition service; only a tolerant match for the displayed animal
awards a star. It can be disabled in grown-up settings. If recognition is
unavailable or stalls, a large green tick lets a grown-up confirm the attempt
manually instead of trapping the game.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:43127. Other scripts: `npm run build`, `npm run lint`,
`npm run typecheck`, and `npm run icons` to re-render the home-screen icons
from `scripts/generate-icons.mjs`.

The checked-in voice clips are ready to use. To regenerate them with the same
warm, slightly slowed voice:

```bash
python3 -m pip install edge-tts==7.2.8
python3 scripts/generate-speech.py
```

## Deploy to Vercel and install on an iPhone

It is a stock Next.js app with no environment variables, no database and no
API keys, so Vercel needs no configuration — import the repo and deploy.

To install it on an iPhone:

1. Open the deployed URL in **Safari** (Chrome on iOS cannot install web apps).
2. Tap the Share button, then **Add to Home Screen**.
3. Launch it from the home screen. It opens full screen with no browser chrome,
   and works without a connection after the first visit.

### About the sound on iOS

iOS refuses to start media unless it begins inside a real user gesture, which
is why the app opens on a splash screen with one large play button. That tap
unlocks the speech audio context. Vocabulary then sounds identical on iOS,
Android and desktop because it comes from the checked-in voice clips, not the
device's speech synthesiser. Dynamic sentences without a bundled clip fall
back to a preferred English device voice.

## Tech

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Web Speech · Web Audio
API · a hand-rolled service worker for offline play.

```
src/
  app/          layout, page, web app manifest
  components/
    art/        every character, animal, food and building as inline SVG
    games/      the six mini-games
    ui/         shared chrome: game frame, word bubble, confetti, settings
  lib/          audio engine, settings store, word lists, find-it challenge
```
