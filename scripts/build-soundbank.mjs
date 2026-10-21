#!/usr/bin/env node
// Builds the client's sound bank from MuseScore_General.sf2 (MIT).
//
//   node scripts/build-soundbank.mjs <outDir> [--source-dir <dir>] [--quality <q>]
//
// Writes, into <outDir> (never the repo):
//   MuseScore_General.flac.sf3  the master: every sample FLAC-encoded, lossless
//   MuseScore_General.sf3       the bank the client fetches: Vorbis at each sample's own rate
//   MuseScore_General_License.md
// --source-dir reads MuseScore_General.sf2 and MuseScore_General_License.md from
// a directory instead of downloading them. Needs ffmpeg with libvorbis on PATH.
// Exits nonzero if any gate fails.
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SoundBankLoader, SpessaLog } from 'spessasynth_core';
import { StbVorbis } from 'stb-vorbis';

const SOURCE_URL = 'https://ftp.osuosl.org/pub/musescore/soundfont/MuseScore_General/';
const SOURCE = 'MuseScore_General.sf2';
const LICENSE = 'MuseScore_General_License.md';
const FLAC_OUT = 'MuseScore_General.flac.sf3';
const VORBIS_OUT = 'MuseScore_General.sf3';
const SEAM = 64; // samples either side of each loop point
const TOP = 20;

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i < 0 ? fallback : args.splice(i, 2)[1];
};
const sourceDir = option('--source-dir');
const quality = Number(option('--quality', '6'));
const outDir = args[0];
if (!outDir) {
  console.error('usage: node scripts/build-soundbank.mjs <outDir> [--source-dir <dir>] [--quality <q>]');
  process.exit(2);
}
SpessaLog.infoEnabled = false;

function run(command, commandArgs, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
    const out = [];
    const err = [];
    child.stdout.on('data', (chunk) => out.push(chunk));
    child.stderr.on('data', (chunk) => err.push(chunk));
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0
        ? resolve(Buffer.concat(out))
        : reject(new Error(`${command} exited ${code}: ${Buffer.concat(err).toString()}`)),
    );
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}
const ffmpeg = (ffArgs, input) => run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...ffArgs], input);
const pcmIn = (rate) => ['-f', 's16le', '-ar', String(rate), '-ac', '1', '-i', 'pipe:0'];

/** Core hands encoders float audio that it made from int16 / 32768, so this is exact. */
function toS16(audio) {
  const out = new Int16Array(audio.length);
  for (let i = 0; i < audio.length; i++) {
    const v = Math.round(audio[i] * 32768);
    out[i] = v > 32767 ? 32767 : v < -32768 ? -32768 : v;
  }
  return new Uint8Array(out.buffer);
}

async function fetchBytes(name) {
  if (sourceDir) return readFile(path.join(sourceDir, name));
  const response = await fetch(SOURCE_URL + name);
  if (!response.ok) throw new Error(`${SOURCE_URL + name}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
const load = (bytes) =>
  SoundBankLoader.fromArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));

/** One line per sample, instrument, preset, zone, generator and modulator, keyed by kind. */
function describe(bank) {
  const lines = [];
  const add = (kind, key, value) => lines.push({ kind, key, value: JSON.stringify(value) });
  const modulators = (owner, list) =>
    list.forEach((m, i) =>
      add('modulators', `${owner} mod ${i}`, [
        m.primarySource.toSourceEnum(),
        m.secondarySource.toSourceEnum(),
        m.destination,
        m.transformAmount,
        m.transformType,
      ]),
    );
  const zone = (owner, z, target) => {
    add('zones', owner, { key: z.keyRange, vel: z.velRange, target });
    z.generators.forEach((g, i) => add('generators', `${owner} gen ${i}`, [g.type, g.value]));
    modulators(owner, z.modulators);
  };
  modulators('default', bank.defaultModulators);
  bank.samples.forEach((s, i) => {
    const owner = `sample ${i} ${s.name}`;
    add('samples', owner, {
      rate: s.sampleRate,
      key: s.originalKey,
      cents: s.pitchCorrection,
      type: s.sampleType,
      link: s.linkedSample ? bank.samples.indexOf(s.linkedSample) : -1,
    });
    add('loop points', owner, [s.loopStart, s.loopEnd]);
  });
  bank.instruments.forEach((inst, i) => {
    const owner = `instrument ${i} ${inst.name}`;
    add('instruments', owner, { zones: inst.zones.length });
    zone(`${owner} global`, inst.globalZone, null);
    inst.zones.forEach((z, j) => zone(`${owner} zone ${j}`, z, bank.samples.indexOf(z.sample)));
  });
  bank.presets.forEach((p, i) => {
    const owner = `preset ${i} ${p.name}`;
    add('presets', owner, {
      name: p.name,
      program: p.program,
      msb: p.bankMSB,
      lsb: p.bankLSB,
      drum: p.isGMGSDrum,
      library: p.library,
      genre: p.genre,
      morphology: p.morphology,
      zones: p.zones.length,
    });
    zone(`${owner} global`, p.globalZone, null);
    p.zones.forEach((z, j) => zone(`${owner} zone ${j}`, z, bank.instruments.indexOf(z.instrument)));
  });
  return lines;
}

/** Compares structure; returns the number of mismatches and prints a count per kind. */
function compareStructure(label, source, output) {
  const a = describe(source);
  const b = describe(output);
  const counts = {};
  const mismatches = [];
  for (const line of a) counts[line.kind] = counts[line.kind] ?? { total: 0, bad: 0 };
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i];
    const y = b[i];
    if (x && y && x.kind === y.kind && x.key === y.key && x.value === y.value) {
      counts[x.kind].total++;
      continue;
    }
    const kind = x?.kind ?? y.kind;
    counts[kind] = counts[kind] ?? { total: 0, bad: 0 };
    counts[kind].total++;
    counts[kind].bad++;
    mismatches.push(`  ${x?.key ?? '(missing)'}: ${x?.value} != ${y?.key ?? '(missing)'} ${y?.value}`);
  }
  console.log(`${label} structure vs source:`);
  for (const [kind, { total, bad }] of Object.entries(counts))
    console.log(`  ${kind}: ${total - bad}/${total} match`);
  for (const line of mismatches.slice(0, 20)) console.log(line);
  if (mismatches.length > 20) console.log(`  ... ${mismatches.length - 20} more`);
  return mismatches.length;
}

/**
 * Whether every instrument zone playing `sample` loops without release (sampleModes 1) and
 * moves no end or loop-end point, so playback stays inside the loop
 * (core note_on.ts:349-350; only mode 3 leaves the loop, render_voice.ts:53-55).
 * A zone's value falls back to its instrument's global zone, then the default 0.
 */
function loopOnlyModes(bank, sample) {
  const zones = [];
  let ok = true;
  for (const inst of bank.instruments)
    for (const z of inst.zones) {
      if (z.sample !== sample) continue;
      const value = (type) => z.getGenerator(type, inst.globalZone.getGenerator(type, 0));
      const mode = value(54) & 3;
      const offsets = [1, 12, 3, 50].map(value);
      if (mode !== 1 || offsets.some((v) => v !== 0)) ok = false;
      zones.push(`${inst.name} mode ${mode} offsets ${offsets.join('/')}`);
    }
  return { ok: ok && zones.length > 0, zones };
}

function notCompressed(bank) {
  return bank.samples.filter((s) => !s.isCompressed).map((s) => s.name);
}

const dB = (x) => (x > 0 ? (20 * Math.log10(x)).toFixed(1) : '-inf');

async function main() {
  const failures = [];
  const gate = (name, ok, detail = '') => {
    console.log(`GATE ${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ` (${detail})` : ''}`);
    if (!ok) failures.push(name);
  };

  const sourceBytes = await fetchBytes(SOURCE);
  const license = await fetchBytes(LICENSE);
  const source = load(sourceBytes);
  console.log(
    `source: ${SOURCE} ${sourceBytes.length} bytes, ${source.presets.length} presets, ` +
      `${source.instruments.length} instruments, ${source.samples.length} samples`,
  );
  const sourcePcm = source.samples.map((s) => s.getRawData(false));

  const scratch = await mkdtemp(path.join(tmpdir(), 'soundbank-'));
  try {
    // (a) FLAC master. ffmpeg writes FLAC to a file so it can seek back and fill
    // in STREAMINFO (length and MD5); a pipe would leave them empty.
    let n = 0;
    const flacBank = load(sourceBytes);
    await flacBank.setSampleFormat({
      format: 'compressed',
      compressionFunction: async (audio, rate) => {
        const file = path.join(scratch, `${n++}.flac`);
        await ffmpeg([...pcmIn(rate), '-c:a', 'flac', '-compression_level', '8', file], toS16(audio));
        return new Uint8Array(await readFile(file));
      },
    });
    const flacUncompressed = notCompressed(flacBank);
    gate('every sample FLAC-encoded', flacUncompressed.length === 0, flacUncompressed.slice(0, 5).join(', '));
    await writeFile(path.join(outDir, FLAC_OUT), new Uint8Array(flacBank.writeSF2()));

    const flac = load(await readFile(path.join(outDir, FLAC_OUT)));
    let flacBad = 0;
    for (const [i, s] of flac.samples.entries()) {
      const pcm = await ffmpeg(['-i', 'pipe:0', '-f', 's16le', '-ac', '1', 'pipe:1'], s.getRawData(true));
      if (!s.isCompressed || Buffer.compare(pcm, Buffer.from(sourcePcm[i])) !== 0) {
        flacBad++;
        if (flacBad <= 5)
          console.log(`  FLAC mismatch: sample ${i} ${s.name}: ${pcm.length} vs ${sourcePcm[i].length} bytes`);
      }
    }
    gate(
      'FLAC master decodes byte-identical to source PCM',
      flacBad === 0 && flac.samples.length === source.samples.length,
      `${flac.samples.length - flacBad}/${source.samples.length} samples identical`,
    );
    gate('FLAC master structure matches source', compareStructure('FLAC master', source, flac) === 0);

    // (b) Vorbis SF3 at each sample's own rate.
    const vorbisBank = load(sourceBytes);
    await vorbisBank.setSampleFormat({
      format: 'compressed',
      compressionFunction: async (audio, rate) =>
        new Uint8Array(
          await ffmpeg([...pcmIn(rate), '-c:a', 'libvorbis', '-q:a', String(quality), '-f', 'ogg', 'pipe:1'], toS16(audio)),
        ),
    });
    const vorbisUncompressed = notCompressed(vorbisBank);
    gate('every sample Vorbis-encoded', vorbisUncompressed.length === 0, vorbisUncompressed.slice(0, 5).join(', '));
    await writeFile(path.join(outDir, VORBIS_OUT), new Uint8Array(vorbisBank.writeSF2()));

    const sf3 = load(await readFile(path.join(outDir, VORBIS_OUT)));
    gate('SF3 presets, generators, modulators and loop points match source', compareStructure('SF3', source, sf3) === 0);

    await StbVorbis.ready;
    const errors = [];
    const exceptions = [];
    let lengthBad = 0;
    for (const [i, s] of sf3.samples.entries()) {
      const decoded = StbVorbis.decode(s.getRawData(true)).channels[0] ?? new Float32Array(0);
      const pcm = new Int16Array(sourcePcm[i].buffer, sourcePcm[i].byteOffset, sourcePcm[i].byteLength / 2);
      const rmsAt = (offset) => {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, -offset); j < pcm.length && j + offset < decoded.length; j++) {
          const e = decoded[j + offset] - pcm[j] / 32768;
          sum += e * e;
          count++;
        }
        return Math.sqrt(sum / Math.max(1, count));
      };
      if (decoded.length !== pcm.length) {
        // stb-vorbis 0.0.6 sometimes skips the final-frame trim (wasm/stb_vorbis.c:3413-3443)
        // and returns extra tail. That is harmless only if playback never reaches the tail.
        const modes = loopOnlyModes(source, source.samples[i]);
        let best = 0;
        let bestRms = Infinity;
        if (decoded.length > pcm.length) {
          for (let offset = -SEAM; offset <= SEAM; offset++) {
            const rms = rmsAt(offset);
            if (offset !== 0 && rms < bestRms) [best, bestRms] = [offset, rms];
          }
        }
        const aligned = decoded.length > pcm.length && rmsAt(0) < bestRms;
        const detail =
          `sample ${i} ${s.name}: source ${pcm.length}, decoded ${decoded.length}, ` +
          `rms at offset 0 ${dB(rmsAt(0))} dBFS, best other offset ${best} ${dB(bestRms)} dBFS, ` +
          `zones (sampleModes, end/endloop offsets 1/12/3/50): ${modes.zones.join('; ') || 'none'}`;
        if (aligned && modes.ok) exceptions.push(detail);
        else {
          lengthBad++;
          console.log(`  length mismatch: ${detail}`);
          continue;
        }
      }
      let sum = 0;
      let peak = 0;
      for (let j = 0; j < pcm.length; j++) {
        const e = Math.abs(decoded[j] - pcm[j] / 32768);
        sum += e * e;
        if (e > peak) peak = e;
      }
      let seamSum = 0;
      let seamCount = 0;
      let seamPeak = 0;
      const src = source.samples[i];
      if (src.loopEnd - src.loopStart > 1) {
        for (const point of [src.loopStart, src.loopEnd]) {
          for (let j = Math.max(0, point - SEAM); j < Math.min(pcm.length, point + SEAM); j++) {
            const e = Math.abs(decoded[j] - pcm[j] / 32768);
            seamSum += e * e;
            seamCount++;
            if (e > seamPeak) seamPeak = e;
          }
        }
      }
      errors.push({
        name: `${i} ${s.name}`,
        rms: Math.sqrt(sum / Math.max(1, pcm.length)),
        peak,
        seamRms: seamCount ? Math.sqrt(seamSum / seamCount) : 0,
        seamPeak,
      });
    }
    for (const line of exceptions) console.log(`  allowed longer decode: ${line}`);
    gate(
      'every SF3 sample decodes (stb-vorbis) to the source length, or longer only where it is aligned and never played past the loop end',
      lengthBad === 0 && sf3.samples.length === source.samples.length,
      `${sf3.samples.length - lengthBad}/${source.samples.length} samples, ${exceptions.length} allowed longer`,
    );

    const table = (title, key, peakKey) => {
      console.log(`${title} (error in dBFS, rms / peak):`);
      for (const e of [...errors].sort((x, y) => y[key] - x[key]).slice(0, TOP))
        console.log(`  ${dB(e[key]).padStart(6)} / ${dB(e[peakKey]).padStart(6)}  ${e.name}`);
    };
    table(`top ${TOP} samples by error, whole sample`, 'rms', 'peak');
    table(`top ${TOP} samples by error, ${SEAM} samples either side of each loop point`, 'seamRms', 'seamPeak');

    await writeFile(path.join(outDir, LICENSE), license);
    for (const name of [FLAC_OUT, VORBIS_OUT, LICENSE]) {
      const { size } = await stat(path.join(outDir, name));
      console.log(`${path.join(outDir, name)}: ${size} bytes (${(size / 1048576).toFixed(2)} MiB)`);
    }
    console.log(`Vorbis quality ${quality}`);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
  if (failures.length) {
    console.log(`FAILED: ${failures.join('; ')}`);
    process.exitCode = 1;
  } else console.log('all gates passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
