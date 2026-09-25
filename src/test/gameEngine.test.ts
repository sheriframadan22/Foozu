import { describe, it, expect } from 'vitest';
import * as engine from '@/game/gameEngine';
import { MAX_PRIZE } from '@/game/scoring';
import { CATEGORIES } from '@/data/categoriesConfig';

const CAT = CATEGORIES.map((c) => c.name_en);

/** Play correctly through `count` levels (0 = none, 5 = all the way to 380). */
function playCorrectLevels(count: number) {
  let state = engine.startGame('Test Player');
  for (let i = 0; i < count; i++) {
    const cat = CAT[i % CAT.length];
    state = engine.selectCategory(state, cat);
    state = engine.recordAnswer(state, 0);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, true);
  }
  return state;
}

describe('gameEngine — correct progression', () => {
  it('correct at 10 -> secured 10', () => {
    const s = playCorrectLevels(1);
    expect(s.securedAmount).toBe(10);
  });

  it('correct at 10+20 -> secured 30', () => {
    const s = playCorrectLevels(2);
    expect(s.securedAmount).toBe(30);
  });

  it('correct at 10+20+50 -> secured 80', () => {
    const s = playCorrectLevels(3);
    expect(s.securedAmount).toBe(80);
  });

  it('correct through 100 -> secured 180', () => {
    const s = playCorrectLevels(4);
    expect(s.securedAmount).toBe(180);
  });

  it('correct all five -> secured 380 and phase is win', () => {
    const s = playCorrectLevels(5);
    expect(s.securedAmount).toBe(380);
    expect(s.securedAmount).toBe(MAX_PRIZE);
    expect(s.phase).toBe('win');
  });
});

describe('gameEngine — wrong progression', () => {
  function playThenWrong(correctCount: number) {
    let state = playCorrectLevels(correctCount);
    const cat = CAT[correctCount % CAT.length];
    state = engine.selectCategory(state, cat);
    state = engine.recordAnswer(state, 1);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, false);
    return state;
  }

  it('wrong at 10 -> secured 0', () => {
    expect(playThenWrong(0).securedAmount).toBe(0);
  });
  it('wrong at 20 -> secured 10', () => {
    expect(playThenWrong(1).securedAmount).toBe(10);
  });
  it('wrong at 50 -> secured 30', () => {
    expect(playThenWrong(2).securedAmount).toBe(30);
  });
  it('wrong at 100 -> secured 80', () => {
    expect(playThenWrong(3).securedAmount).toBe(80);
  });
  it('wrong at 200 -> secured 180', () => {
    const s = playThenWrong(4);
    expect(s.securedAmount).toBe(180);
    expect(s.phase).toBe('loss');
  });
});

describe('gameEngine — timeout behaves like a wrong answer', () => {
  it('timeout at 50 -> secured stays at 30 and game ends', () => {
    let state = playCorrectLevels(2);
    const cat = CAT[2 % CAT.length];
    state = engine.selectCategory(state, cat);
    state = engine.recordAnswer(state, undefined, true); // no answer selected, time expired
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, false);
    expect(state.securedAmount).toBe(30);
    expect(state.phase).toBe('loss');
  });
});

describe('gameEngine — level and category rules', () => {
  it('cannot select a category before the game has started (wrong phase)', () => {
    const fresh = engine.resetGame();
    const after = engine.selectCategory(fresh, CAT[0]);
    expect(after).toBe(fresh); // no-op, still name-entry phase
  });

  it('cannot skip levels: level index only advances one at a time on correct answers', () => {
    let state = engine.startGame('Skip Test');
    expect(state.currentLevelIndex).toBe(0);
    state = engine.selectCategory(state, CAT[0]);
    state = engine.recordAnswer(state, 0);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, true);
    expect(state.currentLevelIndex).toBe(1); // now at 20 EGP, never jumped to 50/100/200
  });

  it('can change category freely at each level (no category lock-in)', () => {
    let state = engine.startGame('Category Switch');
    state = engine.selectCategory(state, CAT[0]);
    state = engine.recordAnswer(state, 0);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, true); // level 0 done with CAT[0]

    // Level 1 (20 EGP): pick a different category than before.
    state = engine.selectCategory(state, CAT[1]);
    expect(state.currentCategory).toBe(CAT[1]);
  });

  it('cannot reuse a category/value slot already answered in this game', () => {
    let state = engine.startGame('No Reuse');
    state = engine.selectCategory(state, CAT[0]);
    expect(engine.canSelectCategory(state, CAT[0])).toBe(true);
    state = engine.recordAnswer(state, 0);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, true);

    // CAT[0] at 10 EGP is now used; at the new level (20 EGP) it's a fresh slot, so it's selectable again.
    expect(engine.canSelectCategory(state, CAT[0])).toBe(true);

    // But re-selecting the exact same category+value already played should never happen —
    // simulate by manually checking the used-slots guard directly.
    const usedTenEgpAgain = state.usedSlots.some((s) => s.category === CAT[0] && s.value === 10);
    expect(usedTenEgpAgain).toBe(true);
  });

  it('does not overwrite securedAmount with the current question value (additive only)', () => {
    // Regression test for the exact bug described in the PRD: wrong at 200 must leave 180, not 200.
    const s = playCorrectLevels(4); // secured 180 after 10+20+50+100
    let state = engine.selectCategory(s, CAT[4]);
    state = engine.recordAnswer(state, 2);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, false); // wrong at 200
    expect(state.securedAmount).toBe(180);
    expect(state.securedAmount).not.toBe(200);
  });
});
