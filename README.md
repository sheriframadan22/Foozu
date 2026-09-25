# FOOZU — On-Ground Quiz Game

A Jeopardy × *Who Wants to Be a Millionaire* hybrid built for a live Foozu activation. An usher runs the game from a tablet while a contestant plays in front of them, climbing five ascending money levels — **10 → 20 → 50 → 100 → 200 EGP** — for a maximum payout of **380 EGP**.

## Quick start

```bash
npm install
npm run validate   # checks the whole question bank before you trust it
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

- Every question is worth its level's value; a correct answer **adds** that value to `securedAmount` — it is never overwritten (see `src/game/scoring.ts` for the exact rule this prevents: showing 200 EGP instead of the accumulated 380 EGP).
- One attempt per question, 20-second timer (`src/game/timer.ts`, `QUESTION_SECONDS`). A wrong answer *or* a timeout ends the game immediately; the contestant keeps whatever was already secured.
- The contestant enters their name, phone number, and age before playing. The phone number is checked against a "played before" registry (`src/utils/storage.ts`, `playerRegistryStore`) so the same person can't play twice — the usher sees a flag with their previous result and can override with the admin PIN if needed (e.g. a shared family phone).
- At every level the contestant may choose any of the 10 categories, as long as that category hasn't already been played at the *current* value in this game (`src/game/questionSelector.ts`).
- The correct answer is never rendered in the DOM until the usher taps **REVEAL ANSWER** — see "Answer security" below.

Progression is exactly:

| Level | Value | Secured if correct |
| ----- | ----: | ------------------: |
| 1 | 10 EGP | 10 EGP |
| 2 | 20 EGP | 30 EGP |
| 3 | 50 EGP | 80 EGP |
| 4 | 100 EGP | 180 EGP |
| 5 | 200 EGP | **380 EGP** |

## Project structure

```
data/
  categories.json          10 categories, 5 money values, questions-per-slot
  questions/<key>/<value>.json   50 questions per category × value (2,500 total)
scripts/
  validate-questions.mjs   question-bank validator (run via `npm run validate`)
src/
  components/              BrandHeader, CategoryBoard, QuestionCard, Timer, MoneyLadder,
                            AnswerOptions, RevealPanel, WinnerScreen, GameOverScreen, …
  game/                     gameEngine.ts, scoring.ts, questionSelector.ts, timer.ts
  types/                    question.ts, game.ts, player.ts
  utils/                    storage.ts (localStorage repo), exportCsv.ts
  pages/Game, pages/Admin
  test/                     vitest suite for the game engine
```

## Question bank

- 10 categories × 5 values × 50 questions = **2,500 questions**, bilingual (English + Egyptian Masri), stored as plain JSON under `data/questions/<category>/<value>.json` — not hard-coded into any component.
- Adding more questions later is just adding objects to those arrays (or new files) — `src/data/questionBank.ts` bundles everything at build time via `import.meta.glob`, no code changes required.
- Run `npm run validate` (optionally `npm run validate -- <category-key>` for one category) before every release. It checks: exactly 10 categories, exactly 50 questions per category/value, no duplicate IDs or questions, 4 options with exactly 1 correct answer, both languages present, valid values, and flags the banned "Foozy" misspelling anywhere in the data.

### Question schema

```json
{
  "id": "MOV-050-001",
  "category": "Movies",
  "category_ar": "افلام",
  "value": 50,
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

The usher's tablet is the only device in play, so perfect DOM-hiding isn't required — but the correct answer is still never sent to the screen ahead of time: `AnswerOptions`/`QuestionCard` never receive a `correctIndex` until the game phase is `reveal`, at which point the usher has already tapped **REVEAL ANSWER**. Before that, `correctAnswer` simply isn't part of any rendered prop.

## Data storage & future backend

V1 persists completed games, the "played before" phone-number registry, the raffle counter/winner, and per-question analytics in `localStorage` (`src/utils/storage.ts`), behind a small repository-style API (`gameStore`, `playerRegistryStore`, `raffleStore`, `questionStatsStore`). Swapping this for IndexedDB or a real backend (cloud leaderboard, multi-tablet sync, centralized dashboard) later means reimplementing that one file — no other code depends on the storage mechanism.

## Raffle

Every contestant who starts a game is handed the next sequential raffle number (`raffleStore.next()`), shown throughout play in the header and prominently on their final win/loss screen ("keep this number for the draw"). It's recorded on their `CompletedGame` entry and included in CSV export. At the end of the day, the operator dashboard's **Raffle Draw** panel picks a uniformly random winner from that day's completed games (button re-draws if needed) — no separate physical raffle-ticket system required.

## Operator dashboard (`/#/admin`)

- PIN-gated (default `1234`).
- Today's players, total/average payout, 380 EGP winners, 200 EGP attempts, 100 EGP eliminations.
- **Raffle Draw** panel: draws a random winner (raffle #, name, phone) from today's contestants for the end-of-day prize.
- Full leaderboard (prize desc, ties broken by earlier completion time) with each contestant's raffle #, searchable by name or phone number, flags repeat phone numbers.
- **EXPORT CSV** (raffle #, name, phone, age, prize, start/end time, duration, highest level, categories played).
- **RESET RESULTS** clears today's local leaderboard, the "played before" registry, and the raffle counter/winner, so everyone could play again starting from raffle #001 (confirmation required).
- Question analytics table: times shown / correct / wrong per question ID.

## Testing

`npm test` runs the Vitest suite in `src/test/`, covering the scoring rules called out in the brief: correct progression to 10/30/80/180/380, wrong-answer payouts at every level, timeout-as-wrong, "cannot skip levels", and "cannot reuse a category+value slot in the same game".

## Offline / PWA

Vite PWA (`vite-plugin-pwa`, `autoUpdate`) precaches the built app, so once loaded it keeps working without a network connection — no external fonts or images are required at runtime (`@fontsource/baloo-2` and `@fontsource/tajawal` are bundled locally). Icons live in `public/icons/`.

## Brand notes

The brand is **FOOZU** — never "Foozy". The only place that misspelling may legitimately appear is the original supplied reference filename (`FOOZY BANNER 3.5X1.5 pdf.pdf`), which is not part of this repository.
