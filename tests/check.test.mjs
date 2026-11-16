// Drydock check scoring and copy (spec 2026-11-15 §2–6). Run: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const C = require('../check.js');

// Index of the first option of question `id` carrying `score`.
function pick(id, score) {
  const q = C.QUESTIONS.find((x) => x.id === id);
  const i = q.options.findIndex((o) => o.score === score);
  assert.ok(i >= 0, `${id} has no option scoring ${score}`);
  return i;
}
function answers(scores) {
  const a = {};
  for (const q of C.QUESTIONS) a[q.id] = pick(q.id, scores[q.id] || 0);
  return a;
}

test('eight questions, four of them double weight, max 24', () => {
  assert.equal(C.QUESTIONS.length, 8);
  assert.deepEqual(C.QUESTIONS.filter((q) => q.weight === 2).map((q) => q.id), ['q1', 'q2', 'q4', 'q7']);
  assert.equal(C.scoreAnswers(answers({})).max, 24);
});

test('all-zero answers are Low with no gaps', () => {
  const r = C.scoreAnswers(answers({}));
  assert.equal(r.total, 0);
  assert.equal(r.exposure, 'Low');
  assert.deepEqual(r.gaps, []);
});

test('total 5 without a double-weight full gap is Low', () => {
  const r = C.scoreAnswers(answers({ q3: 2, q5: 2, q6: 1 }));
  assert.equal(r.total, 5);
  assert.equal(r.exposure, 'Low');
});

test('total 6 is Medium', () => {
  const r = C.scoreAnswers(answers({ q3: 2, q5: 2, q6: 2 }));
  assert.equal(r.total, 6);
  assert.equal(r.exposure, 'Medium');
});

test('total 13 is Medium', () => {
  const r = C.scoreAnswers(answers({ q3: 2, q5: 2, q6: 2, q8: 1, q1: 1, q2: 1, q4: 1 }));
  assert.equal(r.total, 13);
  assert.equal(r.exposure, 'Medium');
});

test('total 14 is High', () => {
  const r = C.scoreAnswers(answers({ q3: 2, q5: 2, q6: 2, q8: 2, q1: 1, q2: 1, q4: 1 }));
  assert.equal(r.total, 14);
  assert.equal(r.exposure, 'High');
});

test('one double-weight full gap makes it at least Medium', () => {
  const r = C.scoreAnswers(answers({ q7: 2 }));
  assert.equal(r.total, 4);
  assert.equal(r.exposure, 'Medium');
});

test('all max is High, 8 gaps, double-weight questions first', () => {
  const all = Object.fromEntries(C.QUESTIONS.map((q) => [q.id, 2]));
  const r = C.scoreAnswers(answers(all));
  assert.equal(r.total, 24);
  assert.equal(r.exposure, 'High');
  assert.deepEqual(r.gaps.map((g) => g.id), ['q1', 'q2', 'q4', 'q7', 'q3', 'q5', 'q6', 'q8']);
  const g = r.gaps[0];
  for (const k of ['answerLabel', 'score', 'weight', 'why', 'how', 'link']) assert.ok(g[k] !== undefined, k);
});

test('changing an answer back to no-gap removes its card', () => {
  const a = answers({ q3: 2 });
  assert.deepEqual(C.scoreAnswers(a).gaps.map((g) => g.id), ['q3']);
  a.q3 = pick('q3', 0);
  assert.deepEqual(C.scoreAnswers(a).gaps, []);
});

test('pilot leads only when the next dock is within 3 months', () => {
  assert.equal(C.QUALIFIERS[0].options[0], 'Within 3 months');
  assert.equal(C.primaryCta(0), 'pilot');
  for (const i of [1, 2, 3]) assert.equal(C.primaryCta(i), 'demo');
});

test('assessment summary format', () => {
  const a = answers({});
  a.q1 = 3; // At close-out, or not at all
  a.q4 = pick('q4', 1); // Spot checks
  const r = C.scoreAnswers(a);
  const s = C.assessmentSummary(r, a, { dock: 0, fleet: 2 });
  assert.equal(s, 'Exposure: Medium (6/24) · Next dock: within 3 months · Ships: 6-20 · Q1 At close-out, or not at all · Q4 Spot checks');
});

test('assessment summary never exceeds 1000 characters', () => {
  const all = Object.fromEntries(C.QUESTIONS.map((q) => [q.id, 2]));
  const a = answers(all);
  assert.ok(C.assessmentSummary(C.scoreAnswers(a), a, { dock: 3, fleet: 3 }).length <= 1000);
});

test('exposure explanations are the agreed wording', () => {
  assert.ok(C.EXPOSURE_TEXT.High.startsWith('This is common: most docks still run on spreadsheets and paper'));
  assert.ok(C.EXPOSURE_TEXT.Medium.startsWith('Your process covers most of the ground.'));
  assert.equal(C.EXPOSURE_TEXT.Low, "You're running a well-controlled dock. PenLog would mainly save your team the admin of proving it.");
});

test('copy guard: no "free", no UR Z28, no draft stops; Verify card never claims the audit trail', () => {
  const all = JSON.stringify({ q: C.QUESTIONS, x: C.QUALIFIERS, e: C.EXPOSURE_TEXT, n: C.NO_GAPS_TEXT });
  assert.doesNotMatch(all, /\bfree\b/i);
  assert.doesNotMatch(all, /UR\s*Z28/i);
  assert.doesNotMatch(all, /draft stop/i);
  const q4 = C.QUESTIONS.find((q) => q.id === 'q4');
  assert.doesNotMatch(q4.gap.how, /audit trail/i);
  assert.match(q4.gap.how, /inside PenLog/);
});

test('cards claim only what the product does (review 2026-11-16)', () => {
  const how = (id) => C.QUESTIONS.find((q) => q.id === id).gap.how;
  // The Fire Status sheet names the contractor company, not the person.
  assert.match(how('q2'), /which contractor opened it/);
  // The close-out report summarises each query and when it was answered; it does not reprint the messages.
  assert.match(how('q4'), /close-out report shows each query and when it was answered/);
  assert.doesNotMatch(how('q4'), /appear in the close-out report/);
});

test('gap cards carry their picture, and the sample report is offered', () => {
  const all = Object.fromEntries(C.QUESTIONS.map((q) => [q.id, 2]));
  const gaps = C.scoreAnswers(answers(all)).gaps;
  for (const g of gaps) {
    assert.ok('image' in g, `${g.id} gap has no image key`);
    if (g.image) {
      assert.match(g.image.src, /^\/img\/check\/[a-z0-9-]+\.(png|jpg|webp)$/);
      assert.ok(g.image.alt && g.image.alt.length > 10, `${g.id} image needs real alt text`);
    }
  }
  assert.ok('SAMPLE_REPORT' in C);
});
