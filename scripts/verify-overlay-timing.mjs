/**
 * Asserts the overlay timing contract from the brief, against the same pure
 * module the component uses. Node 22+ strips the TypeScript annotations.
 *
 *   node scripts/verify-overlay-timing.mjs
 */
import assert from 'node:assert/strict'
import { BLOCK_TIMINGS, blockStyleAt } from '../lib/overlay-timing.ts'

const [hero, one, two] = BLOCK_TIMINGS
const at = (timing, p) => blockStyleAt(timing, p)
const results = []

function check(label, fn) {
  try {
    fn()
    results.push(`  ok    ${label}`)
  } catch (error) {
    results.push(`  FAIL  ${label}\n        ${error.message}`)
    process.exitCode = 1
  }
}

// ── Block 1: hero, 0-10%, fades out drifting 20vh up ─────────────────────────
check('hero fully visible at rest (0%)', () => {
  assert.equal(at(hero, 0).opacity, 1)
  assert.equal(at(hero, 0).translateVh, 0)
})
check('hero half gone mid-window', () => {
  assert.ok(at(hero, 0.05).opacity > 0 && at(hero, 0.05).opacity < 1)
})
check('hero fully gone by 10%', () => {
  assert.equal(at(hero, 0.1).opacity, 0)
  assert.equal(at(hero, 0.1).visible, false)
})
check('hero drifted exactly 20vh up at 10%', () => {
  assert.equal(at(hero, 0.1).translateVh, -20)
})

// ── Block 2: 15-45%, in / pinned at 35% / out, 15vh down → 20vh up ───────────
check('statement one hidden before 15%', () => {
  assert.equal(at(one, 0.14).opacity, 0)
  assert.equal(at(one, 0.14).visible, false)
})
check('statement one enters from +15vh', () => {
  assert.equal(at(one, 0.15).translateVh, 15)
})
check('statement one fully opaque and pinned at 35%', () => {
  assert.equal(at(one, 0.35).opacity, 1)
})
check('statement one gone by 45%, ending at -20vh', () => {
  assert.equal(at(one, 0.45).opacity, 0)
  assert.equal(at(one, 0.45).translateVh, -20)
})

// ── Block 3: 50-85%, same drift pattern ──────────────────────────────────────
check('statement two hidden before 50%', () => {
  assert.equal(at(two, 0.49).opacity, 0)
})
check('statement two enters from +15vh', () => {
  assert.equal(at(two, 0.5).translateVh, 15)
})
check('statement two fully opaque and pinned at 75%', () => {
  assert.equal(at(two, 0.75).opacity, 1)
})
check('statement two gone by 85%, ending at -20vh', () => {
  assert.equal(at(two, 0.85).opacity, 0)
  assert.equal(at(two, 0.85).translateVh, -20)
})

// ── Zero overlap: never two blocks visible at the same progress ──────────────
check('no two blocks ever visible simultaneously', () => {
  for (let step = 0; step <= 1000; step++) {
    const p = step / 1000
    const visible = BLOCK_TIMINGS.filter((t) => at(t, p).visible).length
    assert.ok(visible <= 1, `${visible} blocks visible at p=${p.toFixed(3)}`)
  }
})

// ── Monotonic drift: a visible block is always travelling upward ─────────────
check('drift is monotonically upward across each window', () => {
  for (const timing of BLOCK_TIMINGS) {
    let previous = Number.POSITIVE_INFINITY
    for (let step = 0; step <= 200; step++) {
      const p = timing.fadeIn[0] + ((timing.fadeOut[1] - timing.fadeIn[0]) * step) / 200
      const y = at(timing, p).translateVh
      assert.ok(y <= previous + 1e-9, `drift reversed at p=${p.toFixed(3)}`)
      previous = y
    }
  }
})

console.log('\n  overlay timing contract\n' + results.join('\n') + '\n')
