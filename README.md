# FOOZU — Football Quiz Game

A *Who Wants to Be a Millionaire*-style football trivia game built for a live Foozu activation. An usher runs the game from a tablet while a contestant plays in front of them, climbing five ascending money levels — **10 → 20 → 30 → 50 → 100 EGP** — for a maximum payout of **210 EGP**.

It's football only — no category board. Every question blends five angles: Egyptian football, international football, football history, guess-the-player, and general football knowledge, at a noticeably harder curve than a typical easy-to-hard trivia game.

## Quick start

```bash
npm install
npm run validate   # checks the question bank before you trust it
npm test            # game-engine unit tests
npm run dev          # local dev server, tablet-landscape optimized
```

Build for the activation (fully offline once loaded, installable as a PWA):

```bash
npm run build
npm run preview     # serve the production build locally to sanity-check offline mode
```

Open `/` for the game screen and `/#/admin` for the operator dashboard (default PIN **1234**, see `src/pages/Admin/AdminPage.tsx`).

## How the game works

- Every question is worth its level's value; a correct answer **adds** that value to `securedAmount` — it is never overwritten (see `src/game/scoring.ts` for the exact rule this prevents: showing 100 EGP instead of the accumulated 210 EGP).
- One attempt per question, 20-second timer (`src/game/timer.ts`, `QUESTION_SECONDS`). A wrong answer *or* a timeout ends the game immediately; the contestant keeps whatever was already secured.
- Not multiple choice on screen: the contestant answers verbally, the usher taps **REVEAL ANSWER**, then calls it CORRECT or WRONG.
- The contestant enters their name, phone number, and age before playing. The phone number is checked against a "played before" registry (`src/utils/storage.ts`, `playerRegistryStore`) — a number that already played is a hard block (no override), so nobody can play twice.
- At every level the usher taps **GET QUESTION** to draw a random unused question from the single football pool for that level (`src/game/questionSelector.ts`) — no category to pick, since it's all one pillar.
- The correct answer is never rendered in the DOM until the usher taps **REVEAL ANSWER** — see "Answer security" below.

Progression is exactly:

| Level | Value | Secured if correct |
| ----- | ----: | ------------------: |
| 1 | 10 EGP | 10 EGP |
| 2 | 20 EGP | 30 EGP |
| 3 | 30 EGP | 60 EGP |
| 4 | 50 EGP | 110 EGP |
| 5 | 100 EGP | **210 EGP** |

## Project structure

```
data/
  football-pillar/<value>.json   50 questions per level x 5 levels (250 total)
scripts/
  validate-football-pillar.mjs  question-bank validator (run via `npm run validate`)
src/
  components/              BrandHeader, QuestionCard, Timer, MoneyLadder, RevealPanel,
                            WinnerScreen, GameOverScreen, NameEntry, BackButton, …
  game/                     gameEngine.ts, scoring.ts, questionSelector.ts, timer.ts
  types/                    question.ts, game.ts, player.ts
  utils/                    storage.ts (localStorage repo), exportCsv.ts
  pages/Game, pages/Admin
  test/                     vitest suite for the game engine
```

## Question bank

- 5 levels x 50 questions = **250 questions**, bilingual (English + Egyptian Masri), stored as plain JSON under `data/football-pillar/<value>.json` — not hard-coded into any component. Every question blends the five angles (Egyptian football, international football, football history, guess-the-player, football knowledge) rather than separating them into categories.
- Adding more questions later is just adding objects to those arrays (or new files) — `src/data/questionBank.ts` bundles everything at build time via `import.meta.glob`, no code changes required.
- Run `npm run validate` before every release. It checks: exactly 50 questions per level, no duplicate IDs or questions, 4 options with exactly 1 correct answer, both languages present, valid values/difficulty, and flags the banned "Foozy" misspelling anywhere in the data.

### Question schema

```json
{
  "id": "FBP-030-014",
  "category": "Football",
  "category_ar": "كرة قدم",
  "value": 30,
  "difficulty": 3,
  "question_en": "…",
  "question_ar": "…",
  "options": [{ "en": "…", "ar": "…" }, ...],
  "correctAnswer": 2,
  "explanation_en": "…",
  "explanation_ar": "…",
  "verified_as_of": "2025-06"
}
```

## Answer security

The usher's tablet is the only device in play, so perfect DOM-hiding isn't required — but the correct answer is still never sent to the screen ahead of time: nothing renders the options at all before the reveal (the contestant answers verbally), and `RevealPanel` only receives the correct option once the game phase is `reveal`, at which point the usher has already tapped **REVEAL ANSWER**.

## Data storage & future backend

V1 persists completed games, the "played before" phone-number registry, the raffle counter/winner, and per-question analytics in `localStorage` (`src/utils/storage.ts`), behind a small repository-style API (`gameStore`, `playerRegistryStore`, `raffleStore`, `questionStatsStore`). Swapping this for IndexedDB or a real backend (cloud leaderboard, multi-tablet sync, centralized dashboard) later means reimplementing that one file — no other code depends on the storage mechanism.

## Raffle

Every contestant who starts a game is handed the next sequential raffle number (`raffleStore.next()`), shown throughout play in the header and prominently on their final win/loss screen ("keep this number for the draw"). It's recorded on their `CompletedGame` entry and included in CSV export. At the end of the day, the operator dashboard's **Raffle Draw** panel picks a uniformly random winner from that day's completed games (button re-draws if needed) — no separate physical raffle-ticket system required.

## Operator dashboard (`/#/admin`)

- PIN-gated (default `1234`).
- Today's players, total/average payout, 210 EGP winners, 100 EGP attempts, 50 EGP eliminations.
- **Raffle Draw** panel: draws a random winner (raffle #, name, phone) from today's contestants for the end-of-day prize.
- Full leaderboard (prize desc, ties broken by earlier completion time) with each contestant's raffle #, searchable by name or phone number, flags repeat phone numbers.
- **EXPORT CSV** (raffle #, name, phone, age, prize, start/end time, duration, highest level, result).
- **RESET RESULTS** clears today's local leaderboard, the "played before" registry, and the raffle counter/winner, so everyone could play again starting from raffle #001 (confirmation required).
- Question analytics table: times shown / correct / wrong per question ID.

## Testing

`npm test` runs the Vitest suite in `src/test/`: correct progression to 10/30/60/110/210, wrong-answer payouts at every level, timeout-as-wrong, "cannot skip levels", and "cannot reuse a question in the same game".

## Offline / PWA

Vite PWA (`vite-plugin-pwa`, `autoUpdate`) precaches the built app, so once loaded it keeps working without a network connection — no external fonts or images are required at runtime (`@fontsource/baloo-2` and `@fontsource/tajawal` are bundled locally). Icons live in `public/icons/`.

## Brand notes

The brand is **FOOZU** — never "Foozy". The only place that misspelling may legitimately appear is the original supplied reference filename (`FOOZY BANNER 3.5X1.5 pdf.pdf`), which is not part of this repository.
