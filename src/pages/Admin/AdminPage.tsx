import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameStore, questionStatsStore, playerRegistryStore, raffleStore, formatRaffleNumber } from '@/utils/storage';
import type { RaffleWinner } from '@/utils/storage';
import { gamesToCsv, downloadCsv } from '@/utils/exportCsv';
import { MAX_PRIZE } from '@/game/scoring';
import type { CompletedGame } from '@/types/player';
import BackButton from '@/components/BackButton';
import Confetti from '@/components/Confetti';

const ADMIN_PIN = '1234';

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const submit = () => {
    if (pin === ADMIN_PIN) onUnlock();
    else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative">
      <div className="absolute top-4 left-4">
        <BackButton onClick={() => navigate('/')} label="Back to game" />
      </div>
      <div className="flex items-center gap-1 font-display font-extrabold text-3xl text-white mb-6">
        <span>FOO</span>
        <img src="./brand/foozu-z-mark.png" alt="Z" className="h-7 w-auto" />
        <span>U</span> <span className="text-white/50 text-xl ml-1">Operator</span>
      </div>
      <input
        autoFocus
        type="password"
        inputMode="numeric"
        maxLength={8}
        value={pin}
        onChange={(e) => {
          setError(false);
          setPin(e.target.value);
        }}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Enter PIN"
        className={`w-48 text-center text-2xl tracking-[0.4em] rounded-2xl bg-white/10 border-2 ${
          error ? 'border-foozu-red animate-shake' : 'border-white/20'
        } focus:border-foozu-pink outline-none px-4 py-3 touch-target`}
      />
      <button
        onClick={submit}
        className="touch-target mt-4 rounded-2xl bg-foozu-pink px-8 py-3 font-display font-bold active:scale-95 transition"
      >
        UNLOCK
      </button>
    </div>
  );
}

function RaffleDraw({ entries }: { entries: CompletedGame[] }) {
  const [winner, setWinner] = useState<RaffleWinner | null>(() => raffleStore.getWinner());

  const draw = () => {
    if (entries.length === 0) return;
    const picked = entries[Math.floor(Math.random() * entries.length)];
    const result: RaffleWinner = {
      raffleNumber: picked.raffleNumber,
      playerName: picked.playerName,
      phoneNumber: picked.phoneNumber,
      drawnAt: new Date().toISOString()
    };
    raffleStore.setWinner(result);
    setWinner(result);
  };

  const clear = () => {
    raffleStore.clearWinner();
    setWinner(null);
  };

  return (
    <div className="relative bg-white/6 border border-foozu-cyan/40 rounded-2xl p-5 sm:p-6 mb-8 text-center overflow-hidden">
      {winner && <Confetti pieces={50} />}
      <div className="text-xs uppercase tracking-widest text-foozu-cyan mb-1">🎧 Raffle Draw — JBL Speaker</div>
      <p className="text-sm text-white/50 mb-4">{entries.length} contestant{entries.length === 1 ? '' : 's'} eligible today</p>

      {winner ? (
        <div className="animate-popIn">
          <div className="text-xs uppercase tracking-widest text-white/50">Winner</div>
          <div className="font-display font-black text-3xl sm:text-4xl text-foozu-yellow mt-1">
            #{formatRaffleNumber(winner.raffleNumber)}
          </div>
          <div className="font-bold text-lg mt-1">{winner.playerName}</div>
          <div className="text-white/60 text-sm">{winner.phoneNumber}</div>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={clear}
              className="touch-target px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-semibold text-sm active:scale-95 transition"
            >
              CLEAR
            </button>
            <button
              onClick={draw}
              disabled={entries.length === 0}
              className="touch-target px-4 py-2.5 rounded-xl bg-foozu-cyan/80 hover:brightness-110 font-semibold text-sm active:scale-95 transition disabled:opacity-40"
            >
              DRAW AGAIN
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={draw}
          disabled={entries.length === 0}
          className="touch-target px-8 py-4 rounded-2xl bg-foozu-cyan font-display font-bold text-lg active:scale-95 hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🎉 DRAW WINNER
        </button>
      )}
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-white/6 border border-white/10 rounded-2xl p-4 text-center">
      <div className="text-[11px] uppercase tracking-widest text-white/50">{label}</div>
      <div className={`font-display font-extrabold text-2xl sm:text-3xl mt-1 ${accent ?? 'text-white'}`}>{value}</div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tick, setTick] = useState(0); // bump to force re-read from storage
  // `tick` isn't read inside these — it's a deliberate cache-buster so this component
  // re-reads localStorage after an export/reset action, since the store itself isn't reactive.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const games = useMemo(() => gameStore.getAll(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const leaderboard = useMemo(() => gameStore.leaderboard(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => Object.values(questionStatsStore.getAll()), [tick]);

  const todayGames = games.filter((g) => isToday(g.endTime));
  const totalPayout = todayGames.reduce((sum, g) => sum + g.prize, 0);
  const avgPayout = todayGames.length ? Math.round(totalPayout / todayGames.length) : 0;
  const maxWinners = todayGames.filter((g) => g.prize === MAX_PRIZE).length;
  const attempts200 = todayGames.filter((g) => g.highestLevel === 200).length;
  const eliminated100 = todayGames.filter((g) => g.result === 'loss' && g.highestLevel === 100).length;

  const filteredLeaderboard = leaderboard.filter((g) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return g.playerName.toLowerCase().includes(q) || g.phoneNumber.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
  });

  const handleExport = () => {
    downloadCsv(`foozu-results-${new Date().toISOString().slice(0, 10)}.csv`, gamesToCsv(games));
  };

  const handleResetToday = () => {
    if (
      !confirm(
        "Reset today's results? This clears the whole local leaderboard, the \"played before\" phone number list, and the raffle counter/winner, so everyone could play again starting from raffle #001. This cannot be undone."
      )
    )
      return;
    gameStore.clearAll();
    playerRegistryStore.clearAll();
    raffleStore.reset();
    raffleStore.clearWinner();
    setTick((t) => t + 1);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate('/')} label="Back to game" />
          <div className="flex items-center gap-1 font-display font-extrabold text-2xl text-white">
            <span>FOO</span>
            <img src="./brand/foozu-z-mark.png" alt="Z" className="h-6 w-auto" />
            <span>U</span> <span className="text-white/50 text-base ml-1">Activation Dashboard</span>
          </div>
        </div>
      </div>

      <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Today</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatTile label="Players" value={todayGames.length} />
        <StatTile label="Total Payout" value={`${totalPayout} EGP`} accent="text-foozu-yellow" />
        <StatTile label="Average Payout" value={`${avgPayout} EGP`} />
        <StatTile label={`${MAX_PRIZE} EGP Winners`} value={maxWinners} accent="text-foozu-teal" />
        <StatTile label="200 EGP Attempts" value={attempts200} />
        <StatTile label="100 EGP Eliminations" value={eliminated100} accent="text-foozu-red" />
      </div>

      <RaffleDraw entries={todayGames} />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or phone…"
          className="flex-1 min-w-[180px] rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 outline-none focus:border-foozu-pink"
        />
        <button
          onClick={handleExport}
          className="touch-target px-5 py-2.5 rounded-xl bg-foozu-teal/90 font-semibold hover:brightness-110 active:scale-95 transition"
        >
          EXPORT CSV
        </button>
        <button
          onClick={handleResetToday}
          className="touch-target px-5 py-2.5 rounded-xl bg-foozu-red/80 font-semibold hover:brightness-110 active:scale-95 transition"
        >
          RESET RESULTS
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 mb-10">
        <table className="w-full text-sm">
          <thead className="bg-white/10 text-white/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Raffle #</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-right px-4 py-3">Age</th>
              <th className="text-right px-4 py-3">Prize</th>
              <th className="text-right px-4 py-3">Highest Level</th>
              <th className="text-right px-4 py-3">Duration</th>
              <th className="text-right px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaderboard.map((g: CompletedGame, i: number) => {
              const record = playerRegistryStore.find(g.phoneNumber);
              const playedMoreThanOnce = (record?.timesPlayed ?? 0) > 1;
              return (
                <tr key={g.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-2.5 text-white/50">{i + 1}</td>
                  <td className="px-4 py-2.5 font-mono text-foozu-cyan">#{formatRaffleNumber(g.raffleNumber)}</td>
                  <td className="px-4 py-2.5 font-semibold">
                    {g.playerName}
                    {playedMoreThanOnce && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide bg-foozu-red/25 text-foozu-red px-1.5 py-0.5 rounded-full align-middle">
                        played before
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-white/70">{g.phoneNumber || '—'}</td>
                  <td className="px-4 py-2.5 text-right text-white/70">{g.age || '—'}</td>
                  <td className="px-4 py-2.5 text-right font-display font-bold text-foozu-yellow">{g.prize} EGP</td>
                  <td className="px-4 py-2.5 text-right text-white/70">{g.highestLevel || '—'}</td>
                  <td className="px-4 py-2.5 text-right text-white/50">{g.durationSeconds}s</td>
                  <td className="px-4 py-2.5 text-right text-white/50">
                    {new Date(g.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              );
            })}
            {filteredLeaderboard.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-white/40">
                  No completed games yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Question Analytics</div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/10 text-white/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Question ID</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-right px-4 py-3">Value</th>
              <th className="text-right px-4 py-3">Shown</th>
              <th className="text-right px-4 py-3">Correct</th>
              <th className="text-right px-4 py-3">Wrong</th>
            </tr>
          </thead>
          <tbody>
            {stats
              .sort((a, b) => b.timesShown - a.timesShown)
              .map((s) => (
                <tr key={s.questionId} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-2.5 font-mono text-xs text-white/70">{s.questionId}</td>
                  <td className="px-4 py-2.5">{s.category}</td>
                  <td className="px-4 py-2.5 text-right">{s.value}</td>
                  <td className="px-4 py-2.5 text-right">{s.timesShown}</td>
                  <td className="px-4 py-2.5 text-right text-green-400">{s.timesCorrect}</td>
                  <td className="px-4 py-2.5 text-right text-foozu-red">{s.timesWrong}</td>
                </tr>
              ))}
            {stats.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                  No question data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? <Dashboard /> : <PinGate onUnlock={() => setUnlocked(true)} />;
}
