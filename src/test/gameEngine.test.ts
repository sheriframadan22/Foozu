import { describe, it, expect } from 'vitest';
import * as engine from '@/game/gameEngine';
import { MAX_PRIZE } from '@/game/scoring';
import { LEVELS } from '@/types/game';

/** Play correctly through `count` levels (0 = none, 5 = all the way to 210). */
function playCorrectLevels(count: number) {
  let state = engine.startGame('Test Player');
  for (let i = 0; i < count; i++) {
    state = engine.beginQuestion(state);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, true);
  }
  return state;
}

describe('gameEngine — correct progression', () => {
  it('matches the 10/20/30/50/100 ladder', () => {
    expect(LEVELS).toEqual([10, 20, 30, 50, 100]);
  });

  it('max prize is exactly 210', () => {
    expect(MAX_PRIZE).toBe(210);
  });

  it('correct at 10 -> secured 10', () => {
    expect(playCorrectLevels(1).securedAmount).toBe(10);
  });

  it('correct at 10+20 -> secured 30', () => {
    expect(playCorrectLevels(2).securedAmount).toBe(30);
  });

  it('correct at 10+20+30 -> secured 60', () => {
    expect(playCorrectLevels(3).securedAmount).toBe(60);
  });

  it('correct through 50 -> secured 110', () => {
    expect(playCorrectLevels(4).securedAmount).toBe(110);
  });

  it('correct all five -> secured 210 and phase is win', () => {
    const s = playCorrectLevels(5);
    expect(s.securedAmount).toBe(210);
    expect(s.securedAmount).toBe(MAX_PRIZE);
    expect(s.phase).toBe('win');
  });
});

describe('gameEngine — wrong progression', () => {
  function playThenWrong(correctCount: number) {
    let state = playCorrectLevels(correctCount);
    state = engine.beginQuestion(state);
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
  it('wrong at 30 -> secured 30', () => {
    expect(playThenWrong(2).securedAmount).toBe(30);
  });
  it('wrong at 50 -> secured 60', () => {
    expect(playThenWrong(3).securedAmount).toBe(60);
  });
  it('wrong at 100 -> secured 110', () => {
    const s = playThenWrong(4);
    expect(s.securedAmount).toBe(110);
    expect(s.phase).toBe('loss');
  });
});

describe('gameEngine — timeout behaves like a wrong answer', () => {
  it('timeout at 30 -> secured stays at 30 and game ends', () => {
    let state = playCorrectLevels(2);
    state = engine.beginQuestion(state);
    state = engine.markTimeUp(state);
    state = engine.confirmOutcome(state, false);
    expect(state.securedAmount).toBe(30);
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

  it('does not overwrite securedAmount with the current question value (additive only)', () => {
    // Regression test for the exact PRD bug: wrong at 100 must leave 110, not 100.
    const s = playCorrectLevels(4); // secured 110 after 10+20+30+50
    let state = engine.beginQuestion(s);
    state = engine.reveal(state);
    state = engine.confirmOutcome(state, false); // wrong at 100
    expect(state.securedAmount).toBe(110);
    expect(state.securedAmount).not.toBe(100);
  });
});
