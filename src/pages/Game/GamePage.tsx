import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandHeader from '@/components/BrandHeader';
import NameEntry from '@/components/NameEntry';
import CategoryBoard from '@/components/CategoryBoard';
import QuestionCard from '@/components/QuestionCard';
import RevealPanel from '@/components/RevealPanel';
import MoneyLadder from '@/components/MoneyLadder';
import WinnerScreen from '@/components/WinnerScreen';
import GameOverScreen from '@/components/GameOverScreen';
import { LEVELS, type GameState } from '@/types/game';
import * as engine from '@/game/gameEngine';
import { gameStore, questionStatsStore, playerRegistryStore } from '@/utils/storage';
import type { CategorySelection, CompletedGame } from '@/types/player';

const AUTO_ADVANCE_MS = 1600;

export default function GamePage() {
  const [state, setState] = useState<GameState>(engine.resetGame());
  const selectionsRef = useRef<CategorySelection[]>([]);
  const autoTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(autoTimeoutRef.current), []);

  const currentValue = state.currentQuestion?.value ?? LEVELS[state.currentLevelIndex];

  const finalizeGame = (finalState: GameState, prize: number, result: 'win' | 'loss') => {
    const startTime = finalState.startTime ?? new Date().toISOString();
    const endTime = new Date().toISOString();
    const highestLevel =
      selectionsRef.current.length > 0 ? selectionsRef.current[selectionsRef.current.length - 1].value : 0;
    const completed: CompletedGame = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      playerName: finalState.playerName,
      phoneNumber: finalState.phoneNumber,
      age: finalState.age,
      prize,
      startTime,
      endTime,
      durationSeconds: Math.max(0, Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)),
      highestLevel,
      result,
      selections: selectionsRef.current
    };
    gameStore.add(completed);
    playerRegistryStore.recordPrize(finalState.phoneNumber, prize);
  };

  const handleSelectCategory = (category: string) => {
    setState((s) => engine.selectCategory(s, category));
  };

  const handleReveal = () => {
    setState((s) => engine.reveal(s));
  };

  const handleTimeExpire = () => {
    // Timeout = automatic wrong answer; the game ends immediately (per PRD §5/§42).
    setState((s) => {
      const withAnswer = engine.recordAnswer(s, undefined, true);
      return engine.reveal(withAnswer);
    });
    autoTimeoutRef.current = window.setTimeout(() => {
      finishOutcome(false);
    }, AUTO_ADVANCE_MS);
  };

  const finishOutcome = (correct: boolean) => {
    setState((prev) => {
      if (prev.phase !== 'reveal' || !prev.currentQuestion || !prev.currentCategory) return prev;
      selectionsRef.current = [
        ...selectionsRef.current,
        { category: prev.currentCategory, value: currentValue, correct, questionId: prev.currentQuestion.id }
      ];
      questionStatsStore.record(prev.currentQuestion.id, prev.currentCategory, currentValue, correct);

      const next = engine.confirmOutcome(prev, correct);

      if (next.phase === 'win') finalizeGame(next, next.securedAmount, 'win');
      if (next.phase === 'loss') finalizeGame(next, next.securedAmount, 'loss');

      return next;
    });
  };

  const handleCorrect = () => finishOutcome(true);
  const handleWrong = () => finishOutcome(false);

  const handleStart = (name: string, phoneNumber: string, age: number) => {
    selectionsRef.current = [];
    const next = engine.startGame(name, phoneNumber, age);
    playerRegistryStore.register(phoneNumber, name, age);
    setState(next);
  };

  const handlePlayAgain = () => {
    selectionsRef.current = [];
    setState(engine.resetGame());
  };

  /** From the category board: ends the current attempt without recording it (nothing was won yet to lose). */
  const handleBackToStart = () => {
    if (state.securedAmount > 0 && !confirm('Go back and end this game? The secured amount will not be awarded.')) {
      return;
    }
    selectionsRef.current = [];
    setState(engine.resetGame());
  };

  /** From a question/reveal screen: discards the in-flight question (never recorded) and returns to the board. */
  const handleBackToBoard = () => {
    setState((s) => ({
      ...s,
      phase: 'category-board',
      currentCategory: undefined,
      currentQuestion: undefined,
      selectedAnswerIndex: undefined,
      timeUp: false
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BrandHeader
        playerName={state.phase !== 'name-entry' ? state.playerName : undefined}
        securedAmount={state.phase !== 'name-entry' ? state.securedAmount : undefined}
        onBack={
          state.phase === 'category-board'
            ? handleBackToStart
            : state.phase === 'question' || state.phase === 'reveal'
              ? handleBackToBoard
              : state.phase === 'win' || state.phase === 'loss'
                ? handlePlayAgain
                : undefined
        }
      />

      <main className="flex-1 px-4 sm:px-6 pb-8">
        {state.phase === 'name-entry' && <NameEntry onStart={handleStart} />}

        {(state.phase === 'category-board' || state.phase === 'question' || state.phase === 'reveal') && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 lg:gap-8 items-start">
            <div>
              {state.phase === 'category-board' && (
                <CategoryBoard currentValue={currentValue} usedSlots={state.usedSlots} onSelect={handleSelectCategory} />
              )}
              {(state.phase === 'question' || state.phase === 'reveal') && state.currentQuestion && (
                <>
                  <QuestionCard
                    question={state.currentQuestion}
                    onTimeExpire={handleTimeExpire}
                    timerActive={state.phase === 'question' && !state.timeUp}
                  />
                  {state.phase === 'question' && (
                    <div className="max-w-3xl mx-auto mt-5 flex justify-center">
                      <button
                        onClick={handleReveal}
                        className="touch-target px-8 py-3.5 rounded-2xl bg-foozu-orange font-display font-bold text-lg active:scale-95 hover:brightness-110 transition"
                      >
                        REVEAL ANSWER
                      </button>
                    </div>
                  )}
                  {state.phase === 'reveal' && !state.timeUp && (
                    <RevealPanel question={state.currentQuestion} onCorrect={handleCorrect} onWrong={handleWrong} />
                  )}
                  {state.phase === 'reveal' && state.timeUp && (
                    <div className="max-w-3xl mx-auto mt-6 text-center animate-popIn">
                      <div className="font-display font-bold text-2xl text-foozu-red">⏱ TIME'S UP</div>
                      <p dir="rtl" className="font-arabic text-white/70 mt-1">خلص الوقت!</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="lg:sticky lg:top-4">
              <MoneyLadder currentLevelIndex={state.currentLevelIndex} securedAmount={state.securedAmount} />
            </div>
          </div>
        )}

        {state.phase === 'win' && <WinnerScreen playerName={state.playerName} onPlayAgain={handlePlayAgain} />}
        {state.phase === 'loss' && (
          <GameOverScreen playerName={state.playerName} prize={state.securedAmount} onPlayAgain={handlePlayAgain} />
        )}
      </main>

      <footer className="text-center pb-3">
        <Link to="/admin" className="text-[11px] text-white/25 hover:text-white/50 transition">
          usher / admin
        </Link>
      </footer>
    </div>
  );
}
