#!/usr/bin/env node
/**
 * Foozu question bank validator.
 *
 * Usage:
 *   node scripts/validate-questions.mjs              # validate the whole bank
 *   node scripts/validate-questions.mjs movies       # validate one category only
 *
 * Source layout: data/questions/<categoryKey>/<value>.json  (JSON array of questions)
 * Exits with code 1 if any error is found.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(ROOT, 'data/categories.json'), 'utf8'));
const { values: VALUES, questionsPerSlot: PER_SLOT, categories: CATEGORIES } = config;
const DIFFICULTY = { 10: 1, 20: 2, 50: 3, 100: 4, 200: 5 };
const ARABIC = /[؀-ۿ]/;
const LATIN_OR_DIGIT = /[A-Za-z0-9]/;
const BANNED_BRAND = /foozy/i;

const onlyKey = process.argv[2];
const errors = [];
const warnings = [];
const seenIds = new Map();
const seenQuestionsEn = new Map();
const seenQuestionsAr = new Map();
const answerPositions = [0, 0, 0, 0];
const summary = [];

const norm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const isNonEmptyString = (s) => typeof s === 'string' && s.trim().length > 0;

if (CATEGORIES.length !== 10) errors.push(`Expected exactly 10 categories, found ${CATEGORIES.length}`);

for (const cat of CATEGORIES) {
  if (onlyKey && cat.key !== onlyKey) continue;
  const row = { category: cat.name_en, total: 0 };
  const dir = join(ROOT, 'data/questions', cat.key);
  if (!existsSync(dir)) {
    errors.push(`[${cat.key}] missing directory data/questions/${cat.key}`);
    summary.push(row);
    continue;
  }
  const stray = readdirSync(dir).filter((f) => !VALUES.map((v) => `${v}.json`).includes(f));
  if (stray.length) warnings.push(`[${cat.key}] unexpected files ignored: ${stray.join(', ')}`);

  for (const value of VALUES) {
    const file = join(dir, `${value}.json`);
    const where = `${cat.key}/${value}.json`;
    if (!existsSync(file)) {
      errors.push(`[${where}] file missing`);
      row[value] = 0;
      continue;
    }
    let list;
    try {
      list = JSON.parse(readFileSync(file, 'utf8'));
    } catch (e) {
      errors.push(`[${where}] invalid JSON: ${e.message}`);
      row[value] = 0;
      continue;
    }
    if (!Array.isArray(list)) {
      errors.push(`[${where}] must be a JSON array`);
      continue;
    }
    row[value] = list.length;
    row.total += list.length;
    if (list.length !== PER_SLOT) {
      errors.push(`[${where}] expected exactly ${PER_SLOT} questions, found ${list.length}`);
    }

    list.forEach((q, i) => {
      const at = `[${where} #${i + 1}${q && q.id ? ` ${q.id}` : ''}]`;
      if (!q || typeof q !== 'object') return errors.push(`${at} not an object`);

      // IDs
      const idRe = new RegExp(`^${cat.prefix}-${String(value).padStart(3, '0')}-\\d{3}$`);
      if (!isNonEmptyString(q.id)) errors.push(`${at} missing id`);
      else {
        if (!idRe.test(q.id)) errors.push(`${at} id should look like ${cat.prefix}-${String(value).padStart(3, '0')}-001`);
        if (seenIds.has(q.id)) errors.push(`${at} duplicate id (also in ${seenIds.get(q.id)})`);
        seenIds.set(q.id, where);
      }

      // Category / value / difficulty
      if (q.category !== cat.name_en) errors.push(`${at} category should be "${cat.name_en}", got "${q.category}"`);
      if (q.category_ar !== cat.name_ar) errors.push(`${at} category_ar should be "${cat.name_ar}", got "${q.category_ar}"`);
      if (!VALUES.includes(q.value)) errors.push(`${at} value must be one of ${VALUES.join(', ')}`);
      else if (q.value !== value) errors.push(`${at} value ${q.value} does not match file ${value}`);
      if (q.difficulty !== DIFFICULTY[value]) errors.push(`${at} difficulty should be ${DIFFICULTY[value]} for ${value} EGP`);

      // Text
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
      if (isNonEmptyString(q.question_en) && q.question_en.length > 180) warnings.push(`${at} English question is long (${q.question_en.length} chars) — may not be readable in 10s`);

      // Options
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
            errors.push(`${at} "all/none of the above" options are not allowed (options are shuffled)`);
          }
        });
        if (en.size !== 4) errors.push(`${at} duplicate English options`);
        if (ar.size !== 4) errors.push(`${at} duplicate Arabic options`);
      }
      if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
        errors.push(`${at} correctAnswer must be an integer 0–3 (exactly one correct answer)`);
      } else answerPositions[q.correctAnswer]++;

      // Optional fields
      for (const f of ['explanation_en', 'explanation_ar', 'verified_as_of']) {
        if (f in q && !isNonEmptyString(q[f])) errors.push(`${at} ${f} is present but empty`);
      }
      if ('verified_as_of' in q && !/^\d{4}-\d{2}(-\d{2})?$/.test(q.verified_as_of)) errors.push(`${at} verified_as_of must be YYYY-MM or YYYY-MM-DD`);
      if (BANNED_BRAND.test(JSON.stringify(q))) errors.push(`${at} contains the wrong brand spelling`);
      const known = new Set(['id', 'category', 'category_ar', 'value', 'difficulty', 'question_en', 'question_ar', 'options', 'correctAnswer', 'explanation_en', 'explanation_ar', 'verified_as_of', 'tags']);
      for (const k of Object.keys(q)) if (!known.has(k)) warnings.push(`${at} unknown field "${k}"`);
    });
  }
  summary.push(row);
}

// ---- Report ---------------------------------------------------------------
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
console.log('\nFOOZU QUESTION BANK — VALIDATION REPORT');
console.log('='.repeat(72));
console.log(pad('Category', 20) + VALUES.map((v) => lpad(`${v}`, 7)).join('') + lpad('Total', 9));
console.log('-'.repeat(72));
let grand = 0;
for (const r of summary) {
  grand += r.total;
  console.log(pad(r.category, 20) + VALUES.map((v) => lpad(r[v] ?? 0, 7)).join('') + lpad(r.total, 9));
}
console.log('-'.repeat(72));
console.log(pad('TOTAL', 20) + ' '.repeat(VALUES.length * 7) + lpad(grand, 9));
console.log(`\nCategories: ${CATEGORIES.length}   Unique IDs: ${seenIds.size}   Required per slot: ${PER_SLOT}`);
const totalAns = answerPositions.reduce((a, b) => a + b, 0) || 1;
console.log(`Correct-answer position spread (source order, shuffled at runtime): ${answerPositions.map((n, i) => `${'ABCD'[i]}=${Math.round((n / totalAns) * 100)}%`).join(' ')}`);

if (warnings.length) {
  console.log(`\n⚠️  ${warnings.length} warning(s):`);
  warnings.slice(0, 50).forEach((w) => console.log('  - ' + w));
  if (warnings.length > 50) console.log(`  … and ${warnings.length - 50} more`);
}
if (errors.length) {
  console.log(`\n❌ ${errors.length} error(s):`);
  errors.slice(0, 200).forEach((e) => console.log('  - ' + e));
  if (errors.length > 200) console.log(`  … and ${errors.length - 200} more`);
  console.log('\nVALIDATION FAILED\n');
  process.exit(1);
}
console.log('\n✅ VALIDATION PASSED\n');
