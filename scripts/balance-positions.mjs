#!/usr/bin/env node
/**
 * Re-shuffles each question's options + correctAnswer index deterministically-randomly
 * so the on-disk correct-answer position isn't lopsided (defense in depth — the app
 * shuffles again at runtime anyway, but a balanced source file is healthier for auditing).
 *
 * Usage: node scripts/balance-positions.mjs [categoryKey]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const onlyKey = process.argv[2];
const dirs = readdirSync(join(ROOT, 'data/questions')).filter((d) => !onlyKey || d === onlyKey);

function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// simple deterministic PRNG so re-runs are reproducible
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let totalChanged = 0;
for (const dir of dirs) {
  const catDir = join(ROOT, 'data/questions', dir);
  for (const file of readdirSync(catDir)) {
    if (!file.endsWith('.json')) continue;
    const path = join(catDir, file);
    const list = JSON.parse(readFileSync(path, 'utf8'));
    let changed = false;
    const rand = mulberry32([...`${dir}/${file}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7));
    for (const q of list) {
      const order = shuffle([0, 1, 2, 3], rand);
      const newOptions = order.map((i) => q.options[i]);
      const newCorrect = order.indexOf(q.correctAnswer);
      if (newCorrect !== q.correctAnswer) changed = true;
      q.options = newOptions;
      q.correctAnswer = newCorrect;
    }
    if (changed) {
      writeFileSync(path, JSON.stringify(list, null, 2) + '\n');
      totalChanged++;
    }
  }
}
console.log(`Rebalanced option order in ${totalChanged} file(s).`);
