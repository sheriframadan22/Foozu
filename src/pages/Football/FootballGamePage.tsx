import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandHeader from '@/components/BrandHeader';
import NameEntry from '@/components/NameEntry';
import QuestionCard from '@/components/QuestionCard';
import RevealPanel from '@/components/RevealPanel';
import MoneyLadder from '@/components/MoneyLadder';
import WinnerScreen from '@/components/WinnerScreen';
import GameOverScreen from '@/components/GameOverScreen';
import { FOOTBALL_LEVELS, FOOTBALL_MAX_PRIZE, type FootballGameState } from '@/types/footballGame';
import * as engine from '@/game/footballEngine';
import { gameStore, questionStatsStore, playerRegistryStore, raffleStore } from '@/utils/storage';
import type { CategorySelection, CompletedGame } from '@/types/player';

const AUTO_ADVANCE_MS = 1600;

/**
 * Football-only "pro" game: a single pillar (no category board — Egyptian football,
 * international football, football history, guess-the-player and football knowledge
 * are all blended into one pool), 5 harder levels (10/20/30/50/100 EGP),
 * max prize 210 EGP. Shares the classic game's storage (leaderboard, "one play per
 * phone number", raffle numbering) so the activation has a single unified contestant
 * pool and raffle draw regardless of which game someone played.
 */
export default function FootballGamePage() {
  const [state, setState] = useState<FootballGameState>(engine.resetFootballGame());
  const selectionsRef = useRef<CategorySelection[]>([]);
  const autoTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(autoTimeoutRef.current), []);

  const currentValue = state.currentQuestion?.value ?? FOOTBALL_LEVELS[state.currentLevelIndex];

  const finalizeGame = (finalState: FootballGameState, prize: number, result: 'win' | 'loss') => {
    const startTime = finalState.startTime ?? new Date().toISOString();
    const endTime = new Date().toISOString();
    const highestLevel =
      selectionsRef.current.length > 0 ? selectionsRef.current[selectionsRef.current.length - 1].value : 0;
    const completed: CompletedGame = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      playerName: finalState.playerName,
      phoneNumber: finalState.phoneNumber,
      age: finalState.age,
      raffleNumber: finalState.raffleNumber,
      prize,
      startTime,
      endTime,
      durationSeconds: Math.max(0, Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)),
      highestLevel,
      result,
      selections: selectionsRef.current,
      mode: 'football'
    };
    gameStore.add(completed);
    playerRegistryStore.recordPrize(finalState.phoneNumber, prize);
  };

  const handleBeginQuestion = () => {
    setState((s) => engine.beginFootballQuestion(s));
  };

  const handleReveal = () => {
    setState((s) => engine.revealFootball(s));
  };

  const handleTimeExpire = () => {
    setState((s) => engine.markFootballTimeUp(s));
    autoTimeoutRef.current = window.setTimeout(() => {
      finishOutcome(false);
    }, AUTO_ADVANCE_MS);
  };

  const finishOutcome = (correct: boolean) => {
    setState((prev) => {
      if (prev.phase !== 'reveal' || !prev.currentQuestion) return prev;
      selectionsRef.current = [
        ...selectionsRef.current,
        { category: 'Football', value: currentValue, correct, questionId: prev.currentQuestion.id }
      ];
      questionStatsStore.record(prev.currentQuestion.id, 'Football', currentValue, correct);

      const next = engine.confirmFootballOutcome(prev, correct);

      if (next.phase === 'win') finalizeGame(next, next.securedAmount, 'win');
      if (next.phase === 'loss') finalizeGame(next, next.securedAmount, 'loss');

      return next;
    });
  };

  const handleCorrect = () => finishOutcome(true);
  const handleWrong = () => finishOutcome(false);

  const handleStart = (name: string, phoneNumber: string, age: number) => {
    selectionsRef.current = [];
    const raffleNumber = raffleStore.next();
    const next = engine.startFootballGame(name, phoneNumber, age, raffleNumber);
    playerRegistryStore.register(phoneNumber, name, age);
    setState(next);
  };

  const handlePlayAgain = () => {
    selectionsRef.current = [];
    setState(engine.resetFootballGame());
  };

  /** From the level-ready screen: ends the current attempt without recording it (nothing was won yet to lose). */
  const handleBackToStart = () => {
    if (state.securedAmount > 0 && !confirm('Go back and end this game? The secured amount will not be awarded.')) {
      return;
    }
    selectionsRef.current = [];
    setState(engine.resetFootballGame());
  };

  /** From a question/reveal screen: discards the in-flight question (never recorded) and returns to level-ready. */
  const handleBackToReady = () => {
    setState((s) => ({ ...s, phase: 'level-ready', currentQuestion: undefined, timeUp: false }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <BrandHeader
        playerName={state.phase !== 'name-entry' ? state.playerName : undefined}
        securedAmount={state.phase !== 'name-entry' ? state.securedAmount : undefined}
        raffleNumber={state.phase !== 'name-entry' ? state.raffleNumber : undefined}
        onBack={
          state.phase === 'level-ready'
            ? handleBackToStart
            : state.phase === 'question' || state.phase === 'reveal'
              ? handleBackToReady
              : state.phase === 'win' || state.phase === 'loss'
                ? handlePlayAgain
                : undefined
        }
      />

      <main className="flex-1 px-4 sm:px-6 pb-8">
        {state.phase === 'name-entry' && <NameEntry onStart={handleStart} />}

        {(state.phase === 'level-ready' || state.phase === 'question' || state.phase === 'reveal') && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 lg:gap-8 items-start">
            <div>
              {state.phase === 'level-ready' && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                  <div className="text-5xl mb-3">⚽</div>
                  <div className="text-xs uppercase tracking-widest text-white/50">Level {state.currentLevelIndex + 1}</div>
                  <div className="font-display font-extrabold text-4xl sm:text-5xl text-foozu-yellow mb-6">
                    {currentValue} EGP
                  </div>
                  <button
                    onClick={handleBeginQuestion}
                    className="touch-target px-10 py-5 rounded-2xl bg-foozu-pink font-display font-bold text-xl active:scale-95 hover:brightness-110 transition"
                  >
                    GET QUESTION
                  </button>
                </div>
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
              <MoneyLadder currentLevelIndex={state.currentLevelIndex} securedAmount={state.securedAmount} levels={FOOTBALL_LEVELS} />
            </div>
          </div>
        )}

        {state.phase === 'win' && (
          <WinnerScreen
            playerName={state.playerName}
            raffleNumber={state.raffleNumber}
            maxPrize={FOOTBALL_MAX_PRIZE}
            onPlayAgain={handlePlayAgain}
          />
        )}
        {state.phase === 'loss' && (
          <GameOverScreen
            playerName={state.playerName}
            prize={state.securedAmount}
            raffleNumber={state.raffleNumber}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>

      <footer className="text-center pb-3 flex items-center justify-center gap-4">
        <Link to="/" className="text-[11px] text-white/25 hover:text-white/50 transition">
          ← full game
        </Link>
        <Link to="/admin" className="text-[11px] text-white/25 hover:text-white/50 transition">
          usher / admin
        </Link>
      </footer>
    </div>
  );
}
