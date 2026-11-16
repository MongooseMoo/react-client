// Node test for onset.js on synthetic buffers. Run: node --test .github/safari-probe/onset_check.js
// (named *_check.js so the client's vitest run does not collect it)
const test = require("node:test");
const assert = require("node:assert/strict");
const { measureOnsets } = require("./onset.js");

function silenceThen(lead, values) {
  const a = new Float32Array(lead + values.length);
  a.set(values, lead);
  return a;
}

test("onsets at 0.01, 0.1*peak and 0.5*peak are first indices above each threshold", () => {
  const ch = silenceThen(1000, [0.005, 0.02, 0.05, 0.3, 0.6, -1.0, 0.2]);
  const r = measureOnsets([ch]);
  assert.equal(r.peak, 1);
  assert.deepEqual(r.onset, [1001, 1003, 1004]);
});

test("each frame takes the loudest channel by absolute value", () => {
  const left = silenceThen(500, [0, 0, 0, 0.45, 0]);
  const right = silenceThen(500, [0, -0.02, 0, 0, -0.8]);
  const r = measureOnsets([left, right]);
  assert.ok(Math.abs(r.peak - 0.8) < 1e-6);
  assert.deepEqual(r.onset, [501, 503, 503]);
});

test("a value equal to the threshold is not above it", () => {
  const r = measureOnsets([Float32Array.from([0.25, 0.5, 1])]);
  assert.deepEqual(r.onset, [0, 0, 2]);
});

test("a silent buffer has no onset", () => {
  const r = measureOnsets([new Float32Array(64)]);
  assert.equal(r.peak, 0);
  assert.deepEqual(r.onset, [null, null, null]);
  assert.equal(r.peakIndex, null);
});

test("peakIndex is the first frame holding the peak, over all channels", () => {
  const left = silenceThen(500, [0, 0.8, 0, 0.3, 0]);
  const right = silenceThen(500, [0, 0, 0, -0.8, 0]);
  assert.equal(measureOnsets([left, right]).peakIndex, 501);
});
