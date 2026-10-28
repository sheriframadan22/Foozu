import type { CompletedGame } from '@/types/player';
import { formatRaffleNumber } from './storage';

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function gamesToCsv(games: CompletedGame[]): string {
  const header = [
    'Raffle #',
    'Name',
    'Phone',
    'Age',
    'Prize',
    'Start Time',
    'End Time',
    'Duration (s)',
    'Highest Level',
    'Result',
    'Categories Played'
  ];
  const rows = games.map((g) => [
    formatRaffleNumber(g.raffleNumber),
    g.playerName,
    g.phoneNumber,
    g.age,
    g.prize,
    g.startTime,
    g.endTime,
    g.durationSeconds,
    g.highestLevel,
    g.result,
    g.selections.map((s) => `${s.category}(${s.value})${s.correct ? '✓' : '✗'}`).join('; ')
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
