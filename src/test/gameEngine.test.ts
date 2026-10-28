import { describe, it, expect } from 'vitest';
import * as engine from '@/game/gameEngine';
import { MAX_PRIZE } from '@/game/scoring';
import { LEVELS } from '@/types/game';

/** Play correctly through `count` levels (0 = none, 5 = all the way to the top). */
function playCorrectLevels(count: number) {
  let state = engine.startGame('Test Player');
  for (let i = 0; i < count; i++) {
    state = engine.beginQuestion(state);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, true);
  }
  return state;
}

describe('gameEngine — prize is the last correct answer, not a cumulative sum', () => {
  it('matches the 10/20/30/50/100 ladder', () => {
    expect(LEVELS).toEqual([10, 20, 30, 50, 100]);
  });

  it('max prize is exactly 100', () => {
    expect(MAX_PRIZE).toBe(100);
  });

  it('correct at 10 only -> prize is 10', () => {
    expect(playCorrectLevels(1).securedAmount).toBe(10);
  });

  it('correct at 10 then 20 -> prize is 20 (not 30)', () => {
    expect(playCorrectLevels(2).securedAmount).toBe(20);
  });

  it('correct at 10, 20, 30 -> prize is 30 (not 60)', () => {
    expect(playCorrectLevels(3).securedAmount).toBe(30);
  });

  it('correct through 50 -> prize is 50 (not 110)', () => {
    expect(playCorrectLevels(4).securedAmount).toBe(50);
  });

  it('correct all five -> prize is 100 and phase is win', () => {
    const s = playCorrectLevels(5);
    expect(s.securedAmount).toBe(100);
    expect(s.securedAmount).toBe(MAX_PRIZE);
    expect(s.phase).toBe('win');
  });
});

describe('gameEngine — a wrong answer keeps only the last correct value', () => {
  function playThenWrong(correctCount: number) {
    let state = playCorrectLevels(correctCount);
    state = engine.beginQuestion(state);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, false);
    return state;
  }

  it('wrong at 10 (no prior correct) -> prize is 0', () => {
    expect(playThenWrong(0).securedAmount).toBe(0);
  });
  it('wrong at 20 (correct at 10) -> prize is 10', () => {
    expect(playThenWrong(1).securedAmount).toBe(10);
  });
  it('wrong at 30 (correct at 20) -> prize is 20', () => {
    expect(playThenWrong(2).securedAmount).toBe(20);
  });
  it('wrong at 50 (correct at 30) -> prize is 30', () => {
    expect(playThenWrong(3).securedAmount).toBe(30);
  });
  it('wrong at 100 (correct at 50) -> prize is 50', () => {
    const s = playThenWrong(4);
    expect(s.securedAmount).toBe(50);
    expect(s.phase).toBe('loss');
  });
});

describe('gameEngine — timeout behaves like a wrong answer', () => {
  it('timeout at 30 -> prize stays at 20 (the last correct level) and game ends', () => {
    let state = playCorrectLevels(2); // correct at 10, 20 -> prize 20
    state = engine.beginQuestion(state);
    state = engine.markTimeUp(state);
    state = engine.confirmOutcome(state, false);
    expect(state.securedAmount).toBe(20);
    expect(state.phase).toBe('loss');
  });
});

describe('gameEngine — level rules', () => {
  it('cannot begin a question before the game has started (wrong phase)', () => {
    const fresh = engine.resetGame();
    const after = engine.beginQuestion(fresh);
    expect(after).toBe(fresh); // no-op, still name-entry phase
  });

  it('cannot skip levels: level index only advances one at a time on correct answers', () => {
    let state = engine.startGame('Skip Test');
    expect(state.currentLevelIndex).toBe(0);
    state = engine.beginQuestion(state);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, true);
    expect(state.currentLevelIndex).toBe(1); // now at 20 EGP
  });

  it('does not reuse a question within the same game', () => {
    let state = engine.startGame('No Repeat');
    state = engine.beginQuestion(state);
    const firstId = state.currentQuestion?.id;
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, true); // moves to level 2
    expect(state.usedQuestionIds).toContain(firstId);
  });

  it('a later correct answer overwrites (not adds to) the previously secured amount', () => {
    // Regression test for the explicit rule change: prize is the LAST correct answer,
    // never a running sum of every level cleared.
    let state = playCorrectLevels(3); // correct at 10, 20, 30 -> prize 30
    expect(state.securedAmount).toBe(30);
    state = engine.beginQuestion(state);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, true); // correct at 50
    expect(state.securedAmount).toBe(50);
    expect(state.securedAmount).not.toBe(30 + 50);
  });
});
