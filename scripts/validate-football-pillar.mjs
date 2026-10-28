#!/usr/bin/env node
/**
 * Validator for the standalone "Football Pillar" bank (the harder, football-only
 * second game). Separate from scripts/validate-questions.mjs because this bank lives
 * outside data/questions/ (so it never collides with the classic Football category)
 * and uses its own value/difficulty ladder: 10/20/30/50/100 -> difficulty 1-5.
 *
 * Usage: node scripts/validate-football-pillar.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VALUES = [10, 20, 30, 50, 100];
const PER_SLOT = 50;
const DIFFICULTY = { 10: 1, 20: 2, 30: 3, 50: 4, 100: 5 };
const ARABIC = /[؀-ۿ]/;
const LATIN_OR_DIGIT = /[A-Za-z0-9]/;
const BANNED_BRAND = /foozy/i;

const errors = [];
const warnings = [];
const seenIds = new Set();
const seenQuestionsEn = new Map();
const seenQuestionsAr = new Map();
const answerPositions = [0, 0, 0, 0];
let grandTotal = 0;

const norm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const isNonEmptyString = (s) => typeof s === 'string' && s.trim().length > 0;

for (const value of VALUES) {
  const file = join(ROOT, 'data/football-pillar', `${value}.json`);
  const where = `football-pillar/${value}.json`;
  if (!existsSync(file)) {
    errors.push(`[${where}] file missing`);
    continue;
  }
  let list;
  try {
    list = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    errors.push(`[${where}] invalid JSON: ${e.message}`);
    continue;
  }
  if (!Array.isArray(list)) {
    errors.push(`[${where}] must be a JSON array`);
    continue;
  }
  grandTotal += list.length;
  if (list.length !== PER_SLOT) {
    errors.push(`[${where}] expected exactly ${PER_SLOT} questions, found ${list.length}`);
  }

  list.forEach((q, i) => {
    const at = `[${where} #${i + 1}${q && q.id ? ` ${q.id}` : ''}]`;
    if (!q || typeof q !== 'object') return errors.push(`${at} not an object`);

    const idRe = new RegExp(`^FBP-${String(value).padStart(3, '0')}-\\d{3}$`);
    if (!isNonEmptyString(q.id)) errors.push(`${at} missing id`);
    else {
      if (!idRe.test(q.id)) errors.push(`${at} id should look like FBP-${String(value).padStart(3, '0')}-001`);
      if (seenIds.has(q.id)) errors.push(`${at} duplicate id`);
      seenIds.add(q.id);
    }

    if (q.category !== 'Football') errors.push(`${at} category should be "Football", got "${q.category}"`);
    if (q.category_ar !== 'كرة قدم') errors.push(`${at} category_ar should be "كرة قدم", got "${q.category_ar}"`);
    if (!VALUES.includes(q.value)) errors.push(`${at} value must be one of ${VALUES.join(', ')}`);
    else if (q.value !== value) errors.push(`${at} value ${q.value} does not match file ${value}`);
    if (q.difficulty !== DIFFICULTY[value]) errors.push(`${at} difficulty should be ${DIFFICULTY[value]} for ${value} EGP`);

    for (const f of ['question_en', 'question_ar']) {
      if (!isNonEmptyString(q[f])) errors.push(`${at} empty ${f}`);
    }
    if (isNonEmptyString(q.question_ar) && !ARABIC.test(q.question_ar)) errors.push(`${at} question_ar contains no Arabic`);
    if (isNonEmptyString(q.question_en) && !LATIN_OR_DIGIT.test(q.question_en)) errors.push(`${at} question_en looks empty of English`);
    if (isNonEmptyString(q.question_en)) {
      const k = norm(q.question_en);
      if (seenQuestionsEn.has(k)) errors.push(`${at} duplicate English question (also ${seenQuestionsEn.get(k)})`);
      seenQuestionsEn.set(k, q.id);
    }
    if (isNonEmptyString(q.question_ar)) {
      const k = norm(q.question_ar);
      if (seenQuestionsAr.has(k)) errors.push(`${at} duplicate Arabic question (also ${seenQuestionsAr.get(k)})`);
      seenQuestionsAr.set(k, q.id);
    }
    if (isNonEmptyString(q.question_en) && q.question_en.length > 180) warnings.push(`${at} English question is long (${q.question_en.length} chars)`);

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`${at} must have exactly 4 options`);
    } else {
      const en = new Set();
      const ar = new Set();
      q.options.forEach((o, j) => {
        if (!o || !isNonEmptyString(o.en)) errors.push(`${at} option ${j} missing en`);
        if (!o || !isNonEmptyString(o.ar)) errors.push(`${at} option ${j} missing ar`);
        if (o && isNonEmptyString(o.en)) en.add(norm(o.en) || o.en.trim());
        if (o && isNonEmptyString(o.ar)) ar.add(norm(o.ar) || o.ar.trim());
        if (o && /all of the above|none of the above|كل ما سبق|لا شيء مما سبق/i.test(`${o.en} ${o.ar}`)) {
          errors.push(`${at} "all/none of the above" options are not allowed`);
        }
      });
      if (en.size !== 4) errors.push(`${at} duplicate English options`);
      if (ar.size !== 4) errors.push(`${at} duplicate Arabic options`);
    }
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
      errors.push(`${at} correctAnswer must be an integer 0-3`);
    } else answerPositions[q.correctAnswer]++;

    for (const f of ['explanation_en', 'explanation_ar', 'verified_as_of']) {
      if (f in q && !isNonEmptyString(q[f])) errors.push(`${at} ${f} is present but empty`);
    }
    if ('verified_as_of' in q && !/^\d{4}-\d{2}(-\d{2})?$/.test(q.verified_as_of)) errors.push(`${at} verified_as_of must be YYYY-MM or YYYY-MM-DD`);
    if (BANNED_BRAND.test(JSON.stringify(q))) errors.push(`${at} contains the wrong brand spelling`);
    const known = new Set(['id', 'category', 'category_ar', 'value', 'difficulty', 'question_en', 'question_ar', 'options', 'correctAnswer', 'explanation_en', 'explanation_ar', 'verified_as_of']);
    for (const k of Object.keys(q)) if (!known.has(k)) warnings.push(`${at} unknown field "${k}"`);
  });
}

console.log('\nFOOZU — FOOTBALL PILLAR BANK — VALIDATION REPORT');
console.log('='.repeat(60));
console.log(`Total questions: ${grandTotal} (expected ${VALUES.length * PER_SLOT})`);
console.log(`Unique IDs: ${seenIds.size}`);
const totalAns = answerPositions.reduce((a, b) => a + b, 0) || 1;
console.log(`Answer position spread: ${answerPositions.map((n, i) => `${'ABCD'[i]}=${Math.round((n / totalAns) * 100)}%`).join(' ')}`);

if (warnings.length) {
  console.log(`\n⚠️  ${warnings.length} warning(s):`);
  warnings.slice(0, 50).forEach((w) => console.log('  - ' + w));
}
if (errors.length) {
  console.log(`\n❌ ${errors.length} error(s):`);
  errors.slice(0, 200).forEach((e) => console.log('  - ' + e));
  console.log('\nVALIDATION FAILED\n');
  process.exit(1);
}
console.log('\n✅ VALIDATION PASSED\n');
