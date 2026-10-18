// Manual live gate: real production client, ordinary disposable accounts and native GMCP/HTTP.
// Do not run until the dispatcher confirms the reviewed authoring backend is enabled.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import WebSocket from 'ws';

const selfTest = process.argv.includes('--self-test');
const deployedClient = process.env.MONGOOSE_WORLD_DEPLOYED_CLIENT === '1';
if (!selfTest && process.env.MONGOOSE_LIVE_WORLD_MUSIC_CHECK !== '1')
  throw new Error('Explicit live world music acceptance is required');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hub = process.env.MONGOOSE_HUB ?? 'C:/Users/Q/projects/mongoose';
const origin = 'https://client.mongoose.world';
const label = `World music acceptance ${randomUUID()}`;
const credentials = []; // Generated plaintext lives only in this Node process and the login exchange.
const actors = [];
const sockets = new Set();
const contexts = [];
const documents = new Map();
let fixtureRoom, browser, bundle;
let failure;
let observedClientRevision;
const ascii = (value) =>
  JSON.stringify(value).replace(
    /[~\u007f-\uffff]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const ref = (value) => {
  assert.match(value, /^#[0-9]+$/);
  return value;
};
const result = (value) => `player:tell("WORLD_PROBE:",generate_json(${value}));`;
function ops(source) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(
      process.env.MONGOOSE_BASH ?? 'bash',
      ['ops/moo-agent', 'moo', '-u', '^WORLD_PROBE:', '-t', '20'],
      { cwd: hub, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true },
    );
    let output = '';
    child.stdout.on('data', (bytes) => {
      if (output.length < 65536) output += bytes;
    });
    child.stderr.on('data', () => {}); // Never copy an evaluator diagnostic containing fixture input.
    child.on('error', () => reject(new Error('Fixture transport failed')));
    child.on('close', (code) => {
      const match = output.match(/WORLD_PROBE:(\{[^\r\n]*\})/);
      if (code !== 0 || !match)
        reject(new Error(`Fixture operation failed (${code}); inspect only the owned fixture`));
      else resolveResult(JSON.parse(match[1]));
    });
    child.stdin.end(`;;${source}\n`);
  });
}

/** Changes only WS framing; bytes remain exact, except the explicitly selected lost acknowledgement. */
function telnetFilter(observe) {
  let pending = Buffer.alloc(0);
  return (bytes) => {
    const input = Buffer.concat([pending, Buffer.from(bytes)]),
      output = [];
    let index = 0,
      emitted = 0;
    while (index < input.length) {
      if (input[index] !== 255) {
        index++;
        continue;
      }
      if (index + 1 >= input.length) break;
      const command = input[index + 1];
      if (command === 250) {
        let end = index + 2;
        while (end + 1 < input.length) {
          if (input[end] !== 255) {
            end++;
            continue;
          }
          if (input[end + 1] === 255) {
            end += 2;
            continue;
          }
          if (input[end + 1] === 240) break;
          end++;
        }
        if (end + 1 >= input.length) break;
        let drop = false;
        if (input[index + 2] === 201) {
          const payload = input.subarray(index + 3, end).toString('utf8');
          const split = payload.indexOf(' '),
            name = payload.slice(0, split);
          // Auth packages may contain secrets. Do not parse, retain or diagnose them.
          if (
            split > 0 &&
            (name === 'Core.Hello' ||
              /^(Client\.Midi\.Editor|Client\.Media\.(Play|Update|Stop)|Core\.Time\.)/.test(name))
          ) {
            const data = JSON.parse(payload.slice(split + 1));
            drop = observe(name, data, payload) === false;
          }
        }
        if (drop) {
          output.push(input.subarray(emitted, index));
          emitted = end + 2;
        }
        index = end + 2;
      } else {
        const width = command >= 251 && command <= 254 ? 3 : 2;
        if (index + width > input.length) break;
        index += width;
      }
    }
    output.push(input.subarray(emitted, index));
    pending = input.subarray(index);
    if (pending.length > 65536) throw new Error('Live protocol frame exceeds the probe budget');
    return Buffer.concat(output);
  };
}
function wireState() {
  const state = {
    requests: new Map(),
    replies: new Map(),
    uploads: new Map(),
    plays: [],
    clocks: 0,
    grants: 0,
    chunks: 0,
    preflights: 0,
    dropPublish: false,
    dropped: undefined,
    transport: undefined,
    clientRevision: undefined,
  };
  state.outbound = telnetFilter((name, data, payload) => {
    if (name === 'Core.Hello') {
      // This public build identifier comes from the running bundle's virtual:commit-hash.
      if (
        data?.client === 'Mongoose Client' &&
        typeof data.version === 'string' &&
        /^[a-zA-Z0-9._%+-]{1,256}$/.test(data.version)
      )
        state.clientRevision = data.version;
      return;
    }
    if (!name.startsWith('Client.Midi.Editor')) return;
    let request = state.requests.get(data.requestId);
    if (!request) {
      if (state.requests.size >= 1024) throw new Error('Probe request observation budget exceeded');
      request = {
        name,
        digest: hash(payload),
        count: 0,
        libraryId: data.libraryId,
        operation: data.operation,
        contentId: data.contentId,
      };
      state.requests.set(data.requestId, request);
    }
    assert.equal(
      request.digest,
      hash(payload),
      'A retried editor request must retain its exact bytes',
    );
    request.count++;
    if (name.endsWith('EditorPublish') && state.dropPublish) {
      state.dropPublish = false;
      state.dropped = data.requestId;
    }
    if (name.endsWith('EditorCreate') || name.endsWith('EditorSave')) {
      if (data.scoreJson) documents.set(JSON.parse(data.scoreJson).contentId, data.scoreJson);
    }
    if (name.endsWith('EditorUploadBegin'))
      request.begin = {
        contentId: data.contentId,
        sha256: data.sha256,
        byteLength: data.byteLength,
      };
    if (name.endsWith('EditorUploadChunk')) {
      const upload = state.uploads.get(data.uploadId);
      assert.ok(upload, 'Chunk must belong to an observed upload');
      if (upload.chunks[data.index] !== undefined)
        assert.equal(upload.chunks[data.index], data.data);
      upload.chunks[data.index] = data.data;
      state.chunks++;
    }
    if (name.endsWith('EditorUploadCommit')) {
      const upload = state.uploads.get(data.uploadId),
        text = upload.chunks.join('');
      assert.equal(text.length, upload.byteLength);
      assert.equal(hash(text), upload.sha256);
      documents.set(upload.contentId, text);
    }
  });
  state.inbound = telnetFilter((name, data) => {
    if (name === 'Core.Time.Reply') state.clocks++;
    if (name === 'Client.Media.Play' && data.midi) {
      state.plays.push({
        key: data.key,
        contentId: data.contentId,
        sourceId: data.transport?.sourceId,
        revision: data.transport?.revision,
        asset: !!data.midi.content,
      });
      assert.equal(
        data.midi.content?.bearer,
        undefined,
        'Media payload must never carry a read bearer',
      );
    }
    if (name !== 'Client.Midi.EditorReply') return;
    const request = state.requests.get(data.requestId);
    if (!request) return;
    const safe = Object.fromEntries(
      [
        'status',
        'libraryId',
        'contentId',
        'libraryRevision',
        'deviceHandle',
        'deviceRevision',
        'sourceId',
        'sourceRevision',
        'effectiveServerMs',
        'replaceFromTick',
      ]
        .filter((key) => data[key] !== undefined)
        .map((key) => [key, data[key]]),
    );
    const replies = state.replies.get(data.requestId) ?? [];
    replies.push(safe);
    state.replies.set(data.requestId, replies);
    if (data.status === 'ok') {
      if (request.name.endsWith('EditorAssetGrant')) state.grants++;
      if (request.name.endsWith('EditorTransport')) state.transport = safe;
      if (request.name.endsWith('EditorUploadBegin'))
        state.uploads.set(data.uploadId, { ...request.begin, chunks: [] });
    }
    if (data.requestId === state.dropped && replies.length === 1) return false;
  });
  return state;
}

async function newPage() {
  const context = await browser.newContext({ serviceWorkers: 'block' }),
    wire = wireState();
  contexts.push(context);
  await context.routeWebSocket('wss://mongoose.moo.mud.org:8765/**', (socket) => {
    const upstream = new WebSocket(socket.url(), { origin }),
      queued = [];
    sockets.add(upstream);
    upstream.on('open', () => {
      for (const bytes of queued) upstream.send(bytes);
      queued.length = 0;
    });
    socket.onMessage((bytes) => {
      try {
        const forwarded = wire.outbound(bytes);
        if (upstream.readyState === WebSocket.OPEN) upstream.send(forwarded);
        else queued.push(forwarded);
      } catch {
        wire.error = 'Outbound protocol observation failed';
        upstream.close();
        socket.close();
      }
    });
    upstream.on('message', (bytes) => {
      try {
        const forwarded = wire.inbound(bytes);
        if (forwarded.length) socket.send(forwarded);
      } catch {
        wire.error = 'Inbound protocol observation failed';
        upstream.close();
        socket.close();
      }
    });
    upstream.on('error', () => socket.close());
    upstream.on('close', () => {
      sockets.delete(upstream);
      socket.close();
    });
    socket.onClose(() => upstream.close());
  });
  await configureClientAssets(context, deployedClient);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  cdp.on('Network.requestWillBeSent', (event) => {
    if (
      event.request.method === 'OPTIONS' &&
      event.request.url.startsWith('https://mongoose.world/api/midi/')
    )
      wire.preflights++;
  });
  await page.goto(origin);
  await expect
    .poll(() => page.evaluate(() => !!window.mudClient?.connected), { timeout: 20000 })
    .toBe(true);
  return { page, wire, context };
}

function reportClientRevision(wire) {
  const revision = wire.clientRevision ?? 'unavailable';
  if (observedClientRevision === undefined) {
    observedClientRevision = revision;
    console.log(
      `World music client: ${JSON.stringify({ mode: deployedClient ? 'deployed' : 'built', origin, revision })}`,
    );
  } else {
    assert.equal(revision, observedClientRevision, 'Client build changed between browser contexts');
  }
}

async function configureClientAssets(context, useDeployedClient) {
  if (useDeployedClient) return;
  await context.route(`${origin}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const file = resolve(bundle, `.${pathname === '/' ? '/index.html' : pathname}`);
    assert(file.startsWith(bundle + sep));
    try {
      await route.fulfill({
        path: file,
        contentType: file.endsWith('.html')
          ? 'text/html'
          : file.endsWith('.js')
            ? 'text/javascript'
            : file.endsWith('.css')
              ? 'text/css'
              : 'application/octet-stream',
      });
    } catch {
      await route.abort();
    }
  });
}
async function ready(actor) {
  await expect
    .poll(() => actor.page.evaluate(() => window.mudClient.gmcp.sessionReady), { timeout: 20000 })
    .toBe(true);
  reportClientRevision(actor.wire);
  const identity = await actor.page.evaluate(() => JSON.parse(window.mudClient.gmcp.identity));
  actor.ref = ref(identity[0]);
  actor.uuid = identity[1];
  await actor.page.getByRole('tab', { name: 'Music', exact: true }).click();
  const enable = actor.page.getByRole('checkbox', { name: 'Enable MIDI', exact: true });
  await enable.check();
  await actor.page.evaluate(() => {
    window.worldProbe = {
      raw: async (operation, fields = {}) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const midi = window.mudClient.gmcp.require('Client.Midi'),
          requestId = fields.requestId ?? crypto.randomUUID();
        return new Promise((resolve, reject) => {
          const timer = setTimeout(
            () => {
              release();
              reject(new Error('Live editor request timed out'));
            },
            operation === 'EditorUploadCommit' ? 31000 : 6000,
          );
          const release = midi.on('editorReply', (reply) => {
            if (reply.requestId === requestId) {
              clearTimeout(timer);
              release();
              resolve(reply);
            }
          });
          const payload = JSON.stringify({ ...fields, requestId }).replace(
            /[~\u007f-\uffff]/g,
            (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`,
          );
          window.mudClient.gmcp.send(`Client.Midi.${operation}`, payload);
        });
      },
    };
  });
}
const raw = (actor, operation, fields = {}) =>
  actor.page.evaluate(({ operation, fields }) => window.worldProbe.raw(operation, fields), {
    operation,
    fields,
  });
async function checked(actor, operation, fields = {}) {
  const reply = await raw(actor, operation, fields);
  assert.equal(reply.status, 'ok', `${operation} must succeed`);
  return reply;
}
function midiFile(count) {
  const variable = (value) => {
    const result = [value & 127];
    while ((value >>>= 7)) result.unshift((value & 127) | 128);
    return result;
  };
  const trackName = Buffer.from('~ ~7E ~0A café 🎹 \\uD800 \\~', 'utf8');
  const events = [
    0,
    255,
    3,
    ...variable(trackName.length),
    ...trackName,
    0,
    255,
    81,
    3,
    7,
    161,
    32,
  ];
  for (let index = 0; index < count; index++)
    events.push(
      ...variable(index ? 240 : 0),
      144,
      60 + (index % 12),
      90,
      ...variable(240),
      128,
      60 + (index % 12),
      0,
    );
  events.push(0, 255, 47, 0);
  const header = Buffer.from([
    77, 84, 104, 100, 0, 0, 0, 6, 0, 0, 0, 1, 3, 192, 77, 84, 114, 107, 0, 0, 0, 0,
  ]);
  header.writeUInt32BE(events.length, 18);
  return Buffer.concat([header, Buffer.from(events)]);
}

async function createActor(room) {
  const username = `worldmusic${randomBytes(8).toString('hex')}`,
    password = randomBytes(32).toString('base64url');
  credentials.push(password);
  // Fixture account references live only on the fresh fixture room, permitting precise cleanup
  // even if a later allocation fails. No plaintext credential is written to a property.
  const metadata = await ops(
    `set_task_perms(#249);root=${ref(fixtureRoom)};account=$account:new();root.world_music_accounts={@root.world_music_accounts,account};account.username=${ascii(username)};account.manager=$account_manager;account.email_address="";account.email_verified=1;account.temp_password="";account:set_password(${ascii(password)});$account_manager:is_username_available(account.username)||raise(E_INVARG);$account_manager.accounts[account.username]=account;who=$account_manager:create_player(${ascii(username)});root.world_music_players={@root.world_music_players,{who,who.uuid,who.incarnation_id}};who.account=account;account.players={who};account.default_player=who;account.recent_player=who;who.home=${ref(room)};move(who,${ref(room)});${result('["ref"->tostr(who),"uuid"->who.uuid,"incarnation"->who.incarnation_id,"wizard"->who.wizard,"programmer"->who.programmer,"temporary"->who.temp_player]')}`,
  );
  assert.equal(metadata.wizard, 0);
  assert.equal(metadata.programmer, 0);
  assert.equal(metadata.temporary, 0);
  const actor = { ...metadata, username, password };
  actors.push(actor);
  await loginActor(actor);
  return actor;
}
async function loginActor(actor) {
  Object.assign(actor, await newPage());
  await actor.page.evaluate(
    ({ username, password }) => {
      // Raw transport avoids command history/output echo and does not create remembered credentials.
      window.mudClient.send(`${username}\r\n${password}\r\n`);
    },
    { username: actor.username, password: actor.password },
  );
  const expected = actor.ref;
  await ready(actor);
  assert.equal(actor.ref, expected);
  await actor.page.getByRole('tab', { name: 'MIDI', exact: true }).click();
  await actor.page
    .getByRole('combobox', { name: 'Output device', exact: true })
    .selectOption('virtual-synth', { timeout: 20000 });
  await actor.page.getByRole('button', { name: 'Connect output device', exact: true }).click();
  await expect(
    actor.page.getByRole('button', { name: 'Disconnect output device', exact: true }),
  ).toBeVisible({ timeout: 20000 });
  await actor.page.getByRole('tab', { name: 'Music', exact: true }).click();
  await actor.page.getByRole('button', { name: 'World library', exact: true }).click();
  await expect(
    actor.page.getByRole('region', { name: 'World music library', exact: true }),
  ).toBeVisible();
}
const panel = (actor) =>
  actor.page.getByRole('region', { name: 'World music library', exact: true });
async function saveImported(actor, count, name) {
  await actor.page
    .getByLabel('Import MIDI file', { exact: true })
    .setInputFiles({ name: `${name}.mid`, mimeType: 'audio/midi', buffer: midiFile(count) });
  await expect(
    actor.page.getByRole('region', { name: 'Music composer', exact: true }),
  ).toContainText('MIDI imported.', { timeout: 20000 });
  await panel(actor).getByRole('textbox', { name: 'World name (ASCII)', exact: true }).fill(name);
  await panel(actor)
    .getByRole('button', { name: 'Save as new private composition', exact: true })
    .click();
  await expect(panel(actor).getByRole('status')).toContainText('Saved privately', {
    timeout: 90000,
  });
  const libraryId = await panel(actor)
    .getByRole('combobox', { name: 'Saved composition', exact: true })
    .inputValue();
  const list = await checked(actor, 'EditorList', { scope: 'mine' });
  const entry = list.entries.find((entry) => entry.libraryId === libraryId);
  assert.ok(entry);
  assert.equal(entry.published, false);
  assert.equal(entry.canEdit, true);
  const text = documents.get(entry.contentId);
  assert.ok(text, 'The real inline/upload wire must contain the saved exact canonical document');
  const decoded = JSON.parse(text);
  assert.equal(
    decoded.parts.reduce((sum, part) => sum + part.notes.length, 0),
    count,
  );
  assert.equal(decoded.parts[0].name, '~ ~7E ~0A café 🎹 \\uD800 \\~');
  assert(!/[~\u007f-\uffff]/.test(text));
  return entry;
}
async function checkPrivateHttp(actor, entry) {
  // Bearer remains scoped to this evaluation, never assigned to window, a URL, or a result.
  const evidence = await actor.page.evaluate(
    async ({ libraryId, contentId }) => {
      const load = await window.worldProbe.raw('EditorLoad', { libraryId });
      if (load.status !== 'ok' || !load.asset)
        throw new Error('Large load must return an authenticated asset');
      let asset = load.asset;
      if (!asset.bearer) {
        const grant = await window.worldProbe.raw('EditorAssetGrant', {
          operation: 'read',
          contentId,
        });
        if (grant.status !== 'ok') throw new Error('Private grant denied');
        asset = grant.asset;
      }
      if (!asset.bearer || asset.contentId !== contentId)
        throw new Error('Private asset identity mismatch');
      const url = new URL(asset.url, 'https://mongoose.world');
      if (url.href !== `https://mongoose.world/api/midi/content/${contentId}`)
        throw new Error('Unexpected private path');
      const options = {
        signal: AbortSignal.timeout(10000),
        headers: { Authorization: `Bearer ${asset.bearer}` },
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
      };
      const response = await fetch(url, options),
        head = await fetch(url, { ...options, method: 'HEAD' });
      const bytes = new Uint8Array(await response.arrayBuffer());
      const digest = Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
        (byte) => byte.toString(16).padStart(2, '0'),
      ).join('');
      const absent = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
      });
      const wrong = await fetch(url, {
        ...options,
        headers: { Authorization: 'Bearer invalid-score-read-grant' },
      });
      return {
        status: response.status,
        headStatus: head.status,
        headLength: head.headers.get('Content-Length'),
        headBody: (await head.arrayBuffer()).byteLength,
        length: bytes.length,
        sha256: digest,
        expectedSha256: asset.sha256,
        expectedLength: asset.byteLength,
        text: new TextDecoder().decode(bytes),
        absent: absent.status,
        wrong: wrong.status,
        cache: response.headers.get('Cache-Control'),
      };
    },
    { libraryId: entry.libraryId, contentId: entry.contentId },
  );
  assert.equal(evidence.status, 200);
  assert.equal(evidence.headStatus, 200);
  assert.equal(evidence.headBody, 0);
  assert.equal(evidence.length, evidence.expectedLength);
  assert.equal(evidence.headLength, String(evidence.length));
  assert.equal(evidence.sha256, evidence.expectedSha256);
  assert.equal(evidence.text, `${documents.get(entry.contentId)}\r\n`);
  assert.match(evidence.cache ?? '', /no-store/i);
  assert([401, 403, 404].includes(evidence.absent));
  assert([401, 403, 404].includes(evidence.wrong));
  assert.ok(actor.wire.preflights > 0, 'A real browser Authorization preflight must have occurred');
}
async function transport(actor, button, status) {
  await panel(actor).getByRole('button', { name: button, exact: true }).click();
  await expect(panel(actor).getByRole('status')).toContainText(status, { timeout: 15000 });
  return actor.wire.transport;
}
async function rendererReady(actor, contentId) {
  await expect
    .poll(
      () =>
        actor.page.evaluate((contentId) => {
          const service = window.mudClient.media.sequences;
          return (
            service &&
            [...service.sources.values()].some(
              (source) =>
                source.ready && source.active.contentId === contentId && source.submitted.size > 0,
            )
          );
        }, contentId),
      { timeout: 20000 },
    )
    .toBe(true);
}

if (selfTest) {
  const frame = (name, data) =>
    Buffer.concat([
      Buffer.from([255, 250, 201]),
      Buffer.from(`${name} ${JSON.stringify(data)}`),
      Buffer.from([255, 240]),
    ]);
  const expected = Buffer.concat([
    Buffer.from('prefix'),
    Buffer.from([255, 251, 201, 255, 255]),
    frame('Client.Midi.EditorReply', { requestId: 'r', status: 'ok' }),
    Buffer.from('suffix'),
  ]);
  let assetRoutes = 0;
  const fakeContext = {
    route: async () => {
      assetRoutes++;
    },
  };
  await configureClientAssets(fakeContext, true);
  assert.equal(assetRoutes, 0, 'Deployed mode must leave site assets on the real network');
  await configureClientAssets(fakeContext, false);
  assert.equal(assetRoutes, 1, 'Built mode must retain its local asset interception');
  const revisionWire = wireState();
  revisionWire.outbound(
    frame('Core.Hello', { client: 'Mongoose Client', version: 'abc123-dirty' }),
  );
  assert.equal(revisionWire.clientRevision, 'abc123-dirty');
  revisionWire.outbound(frame('Core.Hello', { client: 'Other', version: 'not-a-build' }));
  revisionWire.outbound(frame('Core.Hello', { client: 'Mongoose Client', version: 'bad\nvalue' }));
  assert.equal(
    revisionWire.clientRevision,
    'abc123-dirty',
    'Untrusted diagnostic text is not retained',
  );
  assert.equal(revisionWire.requests.size, 0, 'Build observation must not create editor requests');
  const hello = frame('Core.Hello', { client: 'Mongoose Client', version: 'abc123-dirty' });
  for (let split = 0; split <= hello.length; split++) {
    const wire = wireState();
    assert.deepEqual(
      Buffer.concat([wire.outbound(hello.subarray(0, split)), wire.outbound(hello.subarray(split))]),
      hello,
      'Build observation must preserve every byte across transport splits',
    );
    assert.equal(wire.clientRevision, 'abc123-dirty');
  }
  for (let split = 0; split <= expected.length; split++) {
    let seen = 0;
    const filter = telnetFilter(() => {
      seen++;
    });
    assert.deepEqual(
      Buffer.concat([filter(expected.subarray(0, split)), filter(expected.subarray(split))]),
      expected,
    );
    assert.equal(seen, 1);
  }
  const dropped = telnetFilter(() => false);
  assert.equal(
    dropped(
      Buffer.concat([
        Buffer.from('a'),
        frame('Client.Midi.EditorReply', { requestId: 'r', status: 'ok' }),
        Buffer.from('b'),
      ]),
    ).toString(),
    'ab',
  );
  let observed = 0;
  telnetFilter(() => {
    observed++;
  })(frame('Auth.Autologin.Session', { unobserved: 'dummy' }));
  assert.equal(observed, 0);
  const smf = midiFile(2000);
  assert.equal(smf.toString('ascii', 0, 4), 'MThd');
  assert.equal(smf.readUInt32BE(18), smf.length - 22);
  console.log(
    'World music probe offline framing, deliberate lost-ack filter and SMF fixture checks passed. No live connection or fixture created.',
  );
  process.exit(0);
}

try {
  if (!deployedClient) {
    bundle = await mkdtemp(resolve(tmpdir(), 'mongoose-live-world-'));
    await cp(
      process.env.BUNDLE_DIST ? resolve(process.env.BUNDLE_DIST) : resolve(root, 'dist'),
      bundle,
      { recursive: true },
    );
  }
  browser = await chromium.launch({ channel: 'chromium', headless: true });
  const guest = await newPage();
  await guest.page.evaluate(() => window.mudClient.send('guest\r\n'));
  await ready(guest);
  // This read-only gate precedes every fixture allocation. Unavailable is a failure, never a pass.
  await checked(guest, 'EditorList', { scope: 'public' });
  const tiny = {
    version: 1,
    contentId: randomUUID(),
    ppq: 960,
    durationTicks: 3840,
    tempos: [{ tick: 0, bpm: 120 }],
    meters: [{ tick: 0, numerator: 4, denominator: 4 }],
    parts: [
      {
        id: 'p',
        name: '~7E café 🎹 \\~',
        kind: 'melodic',
        program: 0,
        notes: [[0, 480, 60, 90]],
        controls: [],
        programs: [],
      },
    ],
  };
  assert.equal(
    (await raw(guest, 'EditorCreate', { name: 'Denied guest', scoreJson: ascii(tiny) })).status,
    'denied',
  );
  const json = ascii({ ...tiny, contentId: randomUUID() });
  assert.equal(
    (
      await raw(guest, 'EditorUploadBegin', {
        contentId: JSON.parse(json).contentId,
        byteLength: json.length,
        sha256: hash(json),
      })
    ).status,
    'denied',
  );
  console.log('World music: real guest read and write-denial gate passed.');

  const rooms = await ops(
    `set_task_perms(#249);room=$recycler:_create($room,#249);room.name=${ascii(label)};add_property(room,"world_music_accounts",{},{#249,""});add_property(room,"world_music_players",{},{#249,""});add_property(room,"world_music_rooms",{room},{#249,""});remote=$recycler:_create($room,#249);remote.name=${ascii(`${label} remote`)};room.world_music_rooms={room,remote};${result('["room"->tostr(room),"remote"->tostr(remote)]')}`,
  );
  fixtureRoom = ref(rooms.room);
  const owner = await createActor(fixtureRoom),
    listener = await createActor(ref(rooms.remote));
  let inline = await saveImported(owner, 2, `Inline ${randomBytes(3).toString('hex')} ~7E`);
  const previousInline = inline;
  await owner.page
    .getByRole('checkbox', { name: 'Mute part in private audition', exact: true })
    .check();
  await panel(owner)
    .getByRole('button', { name: 'Save selected composition', exact: true })
    .click();
  await expect(panel(owner).getByRole('status')).toContainText('Saved privately', {
    timeout: 15000,
  });
  inline = (await checked(owner, 'EditorList', { scope: 'mine' })).entries.find(
    (entry) => entry.libraryId === inline.libraryId,
  );
  assert.ok(inline);
  assert.notEqual(inline.contentId, previousInline.contentId);
  assert(inline.libraryRevision > previousInline.libraryRevision);
  assert.equal(
    JSON.parse(documents.get(inline.contentId)).parts[0].notes.length,
    2,
    'Audition mute must preserve authored notes on a real save',
  );
  const inlineLoad = await checked(owner, 'EditorLoad', { libraryId: inline.libraryId });
  if (typeof inlineLoad.scoreJson === 'string')
    assert.equal(inlineLoad.scoreJson, documents.get(inline.contentId));
  else await checkPrivateHttp(owner, inline);
  await panel(owner).getByRole('button', { name: 'Copy to my library', exact: true }).click();
  await expect(panel(owner).getByRole('status')).toContainText(
    'Copied to your private world library.',
    { timeout: 15000 },
  );
  const copiedId = await panel(owner)
    .getByRole('combobox', { name: 'Saved composition', exact: true })
    .inputValue();
  assert.notEqual(copiedId, inline.libraryId);
  await panel(owner)
    .getByRole('button', { name: 'Delete selected composition', exact: true })
    .click();
  await expect(panel(owner).getByRole('status')).toContainText('Deleted your library reference.', {
    timeout: 15000,
  });
  assert(
    !(await checked(owner, 'EditorList', { scope: 'mine' })).entries.some(
      (entry) => entry.libraryId === copiedId,
    ),
  );
  let large = await saveImported(owner, 2000, `Large ${randomBytes(3).toString('hex')} ~7E`);
  assert.ok(owner.wire.chunks > 1, 'Large save must use actual multi-chunk GMCP upload');
  await checkPrivateHttp(owner, large);
  const loaded = await owner.page.evaluate(async (libraryId) => {
    const result = await window.mudClient.gmcp.require('Client.Midi').world.load({ libraryId });
    return {
      contentId: result.score.contentId,
      notes: result.score.parts.reduce((sum, part) => sum + part.notes.length, 0),
    };
  }, large.libraryId);
  assert.deepEqual(loaded, { contentId: large.contentId, notes: 2000 });
  await panel(owner).getByRole('button', { name: 'Load into composer', exact: true }).click();
  await expect(panel(owner).getByRole('status')).toContainText('Loaded into the local composer', {
    timeout: 15000,
  });

  for (const operation of ['EditorLoad', 'EditorCopy', 'EditorPublish']) {
    const fields =
      operation === 'EditorLoad'
        ? { libraryId: large.libraryId }
        : operation === 'EditorCopy'
          ? { libraryId: large.libraryId, name: 'Denied copy' }
          : {
              libraryId: large.libraryId,
              expectedLibraryRevision: large.libraryRevision,
              published: true,
            };
    assert.equal((await raw(listener, operation, fields)).status, 'denied');
  }
  assert.equal(
    (await raw(listener, 'EditorAssetGrant', { operation: 'read', contentId: large.contentId }))
      .status,
    'denied',
  );
  const staleScore = { ...tiny, contentId: randomUUID() };
  assert.equal(
    (
      await raw(owner, 'EditorSave', {
        libraryId: inline.libraryId,
        expectedLibraryRevision: 0,
        name: inline.name,
        scoreJson: ascii(staleScore),
      })
    ).status,
    'stale',
  );

  owner.wire.dropPublish = true;
  await transport(owner, 'Publish selected composition', 'Published to the public library.');
  const dropped = owner.wire.dropped,
    request = owner.wire.requests.get(dropped),
    duplicateReplies = owner.wire.replies.get(dropped);
  assert.equal(request.count, 2, 'Lost acknowledgement must retry with the same request identity');
  assert.equal(duplicateReplies.length, 2);
  assert.deepEqual(duplicateReplies[0], duplicateReplies[1]);
  const publicLoad = await checked(listener, 'EditorLoad', { contentId: large.contentId });
  assert.ok(publicLoad.asset && !publicLoad.asset.bearer);
  const publicResponse = await fetch(new URL(publicLoad.asset.url, 'https://mongoose.world'), {
    signal: AbortSignal.timeout(10000),
    redirect: 'error',
  });
  assert.equal(publicResponse.status, 200);
  assert.equal(await publicResponse.text(), `${documents.get(large.contentId)}\r\n`);
  const publicBrowser = await listener.page.evaluate(async (contentId) => {
    const loaded = await window.mudClient.gmcp.require('Client.Midi').world.load({ contentId });
    return {
      contentId: loaded.score.contentId,
      notes: loaded.score.parts.reduce((sum, part) => sum + part.notes.length, 0),
    };
  }, large.contentId);
  assert.deepEqual(publicBrowser, { contentId: large.contentId, notes: 2000 });
  await transport(owner, 'Unpublish selected composition', 'Removed from the public library.');
  assert.equal(
    (
      await fetch(`https://mongoose.world/api/midi/published/${large.contentId}`, {
        signal: AbortSignal.timeout(10000),
        cache: 'no-store',
        redirect: 'error',
      })
    ).status,
    404,
  );
  assert.equal(
    (await raw(listener, 'EditorAssetGrant', { operation: 'read', contentId: large.contentId }))
      .status,
    'denied',
  );

  await listener.page.evaluate(() =>
    window.mudClient.gmcp.require('Client.Midi').world.assets.clear(),
  );
  await ops(`move(${ref(listener.ref)},${ref(fixtureRoom)});${result('["moved"->1]')}`);
  await transport(
    owner,
    'Connect personal performance',
    'Personal performance controls connected.',
  );
  const grantsBefore = listener.wire.grants;
  const started = await transport(
    owner,
    'Perform selected composition',
    'Performing the saved composition',
  );
  await rendererReady(owner, large.contentId);
  await rendererReady(listener, large.contentId);
  assert.ok(
    listener.wire.grants > grantsBefore,
    'The current private listener must obtain its own grant',
  );
  assert.ok(listener.wire.plays.some((play) => play.contentId === large.contentId && play.asset));
  const performedKey = listener.wire.plays.find((play) => play.contentId === large.contentId).key;
  assert.ok(owner.wire.clocks >= 3 && listener.wire.clocks >= 3);
  const apply = panel(owner).getByRole('button', {
    name: 'Apply selected composition to performance',
    exact: true,
  });
  let applyAccepted = false;
  if (await apply.isEnabled()) {
    const oldContentId = large.contentId;
    await panel(owner)
      .getByRole('button', { name: 'Save selected composition', exact: true })
      .click();
    await expect(panel(owner).getByRole('status')).toContainText('Saved privately', {
      timeout: 90000,
    });
    large = (await checked(owner, 'EditorList', { scope: 'mine' })).entries.find(
      (entry) => entry.libraryId === large.libraryId,
    );
    assert.ok(large);
    assert.notEqual(large.contentId, oldContentId);
    const before = await owner.page.evaluate(() => window.mudClient.sharedClock.getServerNow());
    const applied = await transport(
      owner,
      'Apply selected composition to performance',
      'Performance apply accepted.',
    );
    assert.equal(applied.sourceId, started.sourceId);
    assert(applied.sourceRevision > started.sourceRevision);
    assert(applied.effectiveServerMs >= before + 1900);
    assert(Number.isSafeInteger(applied.replaceFromTick));
    applyAccepted = true;
  }
  await transport(owner, 'Pause performance', 'Performance pause accepted.');
  await panel(owner)
    .getByRole('spinbutton', { name: 'Performance position (score ticks)', exact: true })
    .fill('7680');
  await transport(owner, 'Seek performance', 'Performance seek accepted.');
  await transport(owner, 'Resume performance', 'Performance resume accepted.');
  const redeemAfterStop = listener.page
    .evaluate(
      async (fields) => {
        const reply = await window.worldProbe.raw('EditorAssetGrant', {
          operation: 'read',
          ...fields,
        });
        if (reply.status !== 'ok' || !reply.asset?.bearer)
          throw new Error('Current listener read must be authorized');
        const asset = reply.asset;
        const url = new URL(asset.url, 'https://mongoose.world');
        if (url.href !== `https://mongoose.world/api/midi/content/${fields.contentId}`)
          throw new Error('Unexpected read path');
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            window.removeEventListener('world-probe-redeem', ready);
            reject(new Error('Read revocation synchronization timed out'));
          }, 15000);
          const ready = () => {
            clearTimeout(timer);
            resolve();
          };
          window.addEventListener('world-probe-redeem', ready, { once: true });
          window.worldProbe.redemptionReady = true;
        });
        delete window.worldProbe.redemptionReady;
        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000),
          headers: { Authorization: `Bearer ${asset.bearer}` },
          credentials: 'omit',
          redirect: 'error',
          cache: 'no-store',
        });
        return response.status;
      },
      { contentId: large.contentId, sourceId: started.sourceId, mediaKey: performedKey },
    )
    .catch(() => 0);
  await expect
    .poll(() => listener.page.evaluate(() => window.worldProbe.redemptionReady === true), {
      timeout: 10000,
    })
    .toBe(true);
  await transport(owner, 'Stop performance', 'Performance stop accepted.');
  await listener.page.evaluate(() => window.dispatchEvent(new Event('world-probe-redeem')));
  assert(
    [401, 403, 404].includes(await redeemAfterStop),
    'An already-issued audience bearer must fail redemption after Stop',
  );
  assert.equal(
    (
      await raw(listener, 'EditorAssetGrant', {
        operation: 'read',
        contentId: large.contentId,
        sourceId: started.sourceId,
        mediaKey: performedKey,
      })
    ).status,
    'denied',
  );

  // A real delayed load must not replace local edits committed while HTTP is in flight.
  await owner.page.evaluate(() =>
    window.mudClient.gmcp.require('Client.Midi').world.assets.clear(),
  );
  let releaseEditLoad, enteredEditLoad;
  const editHeld = new Promise((resolve) => {
      releaseEditLoad = resolve;
    }),
    editEntered = new Promise((resolve) => {
      enteredEditLoad = resolve;
    });
  const editPattern = `https://mongoose.world/api/midi/content/${large.contentId}`;
  await owner.context.route(editPattern, async (route) => {
    enteredEditLoad();
    await editHeld;
    await route.continue().catch(() => {});
  });
  try {
    await panel(owner).getByRole('button', { name: 'Load into composer', exact: true }).click();
    await Promise.race([
      editEntered,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Delayed UI load did not reach HTTP')), 15000),
      ),
    ]);
    const name = owner.page.getByRole('textbox', { name: 'Composition name', exact: true });
    await name.fill('Newer local edit');
    await name.press('Tab');
    releaseEditLoad();
    await expect(panel(owner).getByRole('alert')).toContainText('draft changed', {
      timeout: 15000,
    });
    await expect(name).toHaveValue('Newer local edit');
  } finally {
    releaseEditLoad();
    await owner.context.unroute(editPattern);
  }

  // Delay a genuine HTTP request, then lose its connection/identity. No response is synthesized.
  await owner.page.evaluate(() =>
    window.mudClient.gmcp.require('Client.Midi').world.assets.clear(),
  );
  let releaseHttp, startedHttp;
  const held = new Promise((resolve) => {
      releaseHttp = resolve;
    }),
    entered = new Promise((resolve) => {
      startedHttp = resolve;
    });
  const pattern = `https://mongoose.world/api/midi/content/${large.contentId}`;
  await owner.context.route(pattern, async (route) => {
    startedHttp();
    await held;
    await route.continue().catch(() => {});
  });
  const cancelling = owner.page.evaluate(async (libraryId) => {
    try {
      await window.mudClient.gmcp.require('Client.Midi').world.load({ libraryId });
      return 'resolved';
    } catch (error) {
      return error.name;
    }
  }, large.libraryId);
  try {
    await Promise.race([
      entered,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Private load did not reach HTTP')), 15000),
      ),
    ]);
    await owner.page.evaluate(() => window.mudClient.close());
    assert.equal(await cancelling, 'AbortError');
  } finally {
    releaseHttp();
    await owner.context.unroute(pattern);
  }
  await loginActor(owner);
  for (const actor of [owner, listener]) {
    const leaked = await actor.page.evaluate(
      (password) =>
        document.body.textContent.includes(password) ||
        Object.values(localStorage).some((value) => String(value).includes(password)),
      actor.password,
    );
    assert.equal(leaked, false, 'Generated credentials must not reach UI or browser storage');
    assert.equal(actor.wire.error, undefined);
  }
  console.log(
    `World music: real inline/large/muted save, copy/delete and Unicode roundtrip; private GET/HEAD/hash/preflight; guest/cross-owner denial; lost-ack dedup and CAS; public lifecycle; two native private renderers; pause/seek/resume/stop, intervening-edit preservation and disconnected-load cancellation passed. Future apply ${applyAccepted ? 'passed' : 'explicitly unavailable on this backend'}.`,
  );
} catch (error) {
  failure = error;
} finally {
  const cleanupErrors = [];
  // Reopen only our own registered actor when the cancellation journey closed its transport.
  for (const actor of actors) {
    try {
      if (
        !actor.page ||
        actor.page.isClosed() ||
        !(await actor.page.evaluate(() => window.mudClient.connected))
      )
        await loginActor(actor);
      for (let pass = 0; pass < 3; pass++) {
        const listing = await checked(actor, 'EditorList', { scope: 'mine' });
        if (!listing.entries.length) break;
        for (const entry of listing.entries)
          await checked(actor, 'EditorDelete', {
            libraryId: entry.libraryId,
            expectedLibraryRevision: entry.libraryRevision,
          });
      }
      assert.equal((await checked(actor, 'EditorList', { scope: 'mine' })).entries.length, 0);
      for (const uploadId of actor.wire.uploads.keys()) {
        const cancelled = await raw(actor, 'EditorUploadCancel', { uploadId });
        assert(['ok', 'stale', 'invalid'].includes(cancelled.status));
      }
    } catch {
      cleanupErrors.push('Owned editor references/staging need inspection');
    }
  }
  for (const context of contexts) await context.close().catch(() => {});
  for (const socket of sockets) socket.close();
  if (browser) await browser.close();
  if (fixtureRoom) {
    try {
      const clean = await ops(
        `set_task_perms(#249);root=${ref(fixtureRoom)};equal(root.name,${ascii(label)})||raise(E_PERM);for row in(root.world_music_players)who=row[1];if(valid(who))equal(who.uuid,row[2])&&equal(who.incarnation_id,row[3])&&(who.account in root.world_music_accounts)||raise(E_PERM);for sound in(who.sounds)if(typeof(sound)==WAIF&&sound.store_owner==who)sound:stop();endif endfor endif endfor for account in(root.world_music_accounts)$gmcp_autologin:clear_tokens_for(account);endfor ${cleanupErrors.length ? '' : `for row in(root.world_music_players)who=row[1];key=row[2];if(maphaskey($account_manager.uuid_index,key)&&equal($account_manager.uuid_index[key],{who,row[3]}))$account_manager.uuid_index=mapdelete($account_manager.uuid_index,key);endif if(valid(who))if(who in connected_players())boot_player(who);endif who.account:delete_character(who);endif endfor for account in(root.world_music_accounts)if(maphaskey($account_manager.accounts,account.username))equal($account_manager.accounts[account.username],account)||raise(E_PERM);$account_manager:delete_account(account);endif endfor rooms=root.world_music_rooms;for room in(rooms)if(room!=root&&valid(room))$recycler:recycle_now(room);endif endfor $recycler:recycle_now(root);`} ${result(`["cleaned"->${cleanupErrors.length ? 0 : 1}]`)}`,
      );
      if (!clean.cleaned)
        cleanupErrors.push(`Retained owned fixture ${fixtureRoom} for dispatcher cleanup`);
    } catch {
      cleanupErrors.push(
        `Owned fixture ${fixtureRoom} cleanup failed; dispatcher inspection required`,
      );
    }
  }
  if (bundle) {
    assert(bundle.startsWith(resolve(tmpdir(), 'mongoose-live-world-')));
    await rm(bundle, { recursive: true, force: true });
  }
  if (cleanupErrors.length) failure = new Error(cleanupErrors.join('; '));
}
if (failure) {
  let message = failure instanceof Error ? failure.message : 'Live world acceptance failed';
  for (const password of credentials)
    message = message.replaceAll(password, '[redacted fixture credential]');
  throw new Error(message.slice(0, 1500));
}
