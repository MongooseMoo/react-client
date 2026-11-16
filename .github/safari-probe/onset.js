// Onset of a decoded buffer, defined as in the ffmpeg reference numbers:
// per frame the largest absolute value over all channels; an onset at x is
// the first frame whose value exceeds x. Thresholds: 0.01, 0.1*peak, 0.5*peak.
// peakIndex is the first frame holding the peak (null for a silent buffer).
// Loaded by probe.html as a plain script and by onset_check.js under Node.
function measureOnsets(channels) {
  const n = channels.length ? channels[0].length : 0;
  const m = new Float32Array(n);
  for (const d of channels) {
    for (let i = 0; i < n; i++) {
      const a = Math.abs(d[i]);
      if (a > m[i]) m[i] = a;
    }
  }
  let peak = 0;
  let peakIndex = null;
  for (let i = 0; i < n; i++) {
    if (m[i] > peak) {
      peak = m[i];
      peakIndex = i;
    }
  }
  const first = (t) => {
    for (let i = 0; i < n; i++) if (m[i] > t) return i;
    return null;
  };
  return { peak, peakIndex, onset: [first(0.01), first(0.1 * peak), first(0.5 * peak)] };
}

if (typeof module !== "undefined") module.exports = { measureOnsets };
