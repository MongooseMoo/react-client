// Explicit live acceptance: real ordinary guests, a private quest, real GMCP.
// No protocol packet or timer snapshot is fabricated by this probe.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import WebSocket from 'ws';

if (process.env.MONGOOSE_LIVE_TIMER_CHECK !== '1') throw new Error('Explicit live timer acceptance is required');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hub = process.env.MONGOOSE_HUB ?? 'C:/Users/Q/projects/mongoose';
const dist = process.env.BUNDLE_DIST ? resolve(process.env.BUNDLE_DIST) : resolve(root, 'dist');
const bundle = await mkdtemp(resolve(tmpdir(), 'mongoose-live-timers-'));
await cp(dist, bundle, { recursive: true });
const origin = 'https://client.mongoose.world';
const label = `Timer acceptance ${randomUUID().slice(0, 8)}`;
const guests = new Map();
let fixture;
let probePage;

function ops(statements) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.MONGOOSE_BASH ?? 'bash', ['ops/moo-agent', 'moo', '-u', '^TIMER_PROBE:', '-t', '15'], { cwd: hub, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    let output = '', error = '';
    child.stdout.on('data', bytes => { output += bytes; });
    child.stderr.on('data', bytes => { error += bytes; });
    child.on('error', reject);
    child.on('close', code => {
      const match = output.match(/TIMER_PROBE:(\{[^\r\n]*\})/);
      if (code !== 0 || !match) reject(new Error(`Live fixture operation failed (${code}): ${error || output}`));
      else resolve(JSON.parse(match[1]));
    });
    child.stdin.end(`;;${statements}\n`);
  });
}
const mooString = value => JSON.stringify(value);
const result = expression => `player:tell("TIMER_PROBE:",generate_json(${expression}));`;
const validRef = ref => { assert.match(ref, /^#[0-9]+$/); return ref; };
const browser = await chromium.launch({ channel: 'chromium', headless: true });
const upstreams = new Set();
const wire = { clockRequests: 0, timerRequests: 0, clocks: 0, timers: 0 };
try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.routeWebSocket('wss://mongoose.moo.mud.org:8765/**', socket => {
    const upstream = new WebSocket(socket.url(), { origin });
    upstreams.add(upstream);
    const pending = [];
    upstream.on('open', () => { for (const bytes of pending) upstream.send(bytes); pending.length = 0; });
    socket.onMessage(bytes => {
      const text = Buffer.from(bytes).toString();
      wire.clockRequests += (text.match(/Core\.Time\.Request /g) ?? []).length;
      wire.timerRequests += (text.match(/Char\.Status\.Timers\.Request /g) ?? []).length;
      if (upstream.readyState === WebSocket.OPEN) upstream.send(bytes); else pending.push(bytes);
    });
    upstream.on('message', (bytes, binary) => {
      const text = bytes.toString();
      wire.clocks += (text.match(/Core\.Time\.Reply /g) ?? []).length;
      wire.timers += (text.match(/Char\.Status\.Timers\.Update /g) ?? []).length;
      socket.send(binary ? bytes : text);
    });
    upstream.on('error', error => console.error('Live relay transport error:', error.code ?? error.name));
    upstream.on('close', () => { upstreams.delete(upstream); socket.close(); });
    socket.onClose(() => upstream.close());
  });
  await context.route(`${origin}/**`, async route => {
    const pathname = new URL(route.request().url()).pathname;
    const file = resolve(bundle, `.${pathname === '/' ? '/index.html' : pathname}`);
    assert(file.startsWith(bundle + sep));
    try {
      await route.fulfill({ path: file, contentType: file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream' });
    } catch { await route.abort(); }
  });
  async function login(page) {
    await page.goto(origin);
    await expect.poll(() => page.evaluate(() => !!window.mudClient?.connected), { timeout: 20000 }).toBe(true);
    await page.evaluate(() => window.mudClient.sendCommand('guest'));
    await expect.poll(() => page.evaluate(() => window.mudClient.gmcp.sessionReady), { timeout: 20000 }).toBe(true);
    const [ref, uuid] = await page.evaluate(() => JSON.parse(window.mudClient.gmcp.identity));
    validRef(ref);
    const metadata = await ops(`who=${ref};${result('["room"->tostr(who.location),"wizard"->who.wizard,"programmer"->who.programmer]')}`);
    assert.equal(metadata.wizard, 0);
    assert.equal(metadata.programmer, 0);
    if (!guests.has(ref)) guests.set(ref, { uuid, room: validRef(metadata.room) });
    return ref;
  }
  async function command(page, text) {
    const input = page.getByRole('textbox', { name: 'Command', exact: true });
    await input.fill(text); await input.press('Enter');
  }
  const page = await context.newPage();
  probePage = page;
  const first = await login(page);
  console.log('Timer probe: ordinary guest authenticated.');
  fixture = await ops(`room=$recycler:_create($room,#249);q=$recycler:_create($quest,#249);giver=$recycler:_create($thing,#249);item=$recycler:_create($thing,#249);room.name=${mooString(label)};giver.name="timer clerk";item.name="timer proof token";move(giver,room);move(item,room);q.name=${mooString(label)};q.giver=giver;q.time_limit=120;q.repeatable=1;q.roles=["item"->item];q.rewards={};q.eligible={};q.stages={["name"->"proof","text"->"Take the private proof token.","objectives"->{["event"->"moved","match"->{"item","*","@party"},"text"->"Token collected"]}]};${result('["room"->tostr(room),"quest"->tostr(q),"giver"->tostr(giver),"item"->tostr(item),"faults"->$quests:check(q)]')}`);
  for (const key of ['room', 'quest', 'giver', 'item']) validRef(fixture[key]);
  assert.deepEqual(fixture.faults, []);
  console.log(`Timer probe: private fixtures ${fixture.quest}, ${fixture.giver}, ${fixture.room}.`);
  await ops(`move(${first},${fixture.room});${result('["moved"->1]')}`);
  await page.getByRole('tab', { name: 'Timers', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.mudClient.gmcp.require('Char.Status.Timers').snapshot.received), { timeout: 15000 }).toBe(true);
  await command(page, `quest accept ${label}`);
  await expect(page.getByRole('list', { name: 'Active timers' })).toContainText(label, { timeout: 15000 });
  await expect.poll(() => page.evaluate(() => window.mudClient.sharedClock.estimate().status), { timeout: 15000 }).toBe('current');
  await expect(page.getByRole('list', { name: 'Active timers' })).toContainText('remaining', { timeout: 5000 });
  assert.ok(wire.clocks >= 3 && wire.timers >= 1, 'Actual server clock and timer messages must arrive');
  const initial = await ops(`runs={};for run in($quests:runs_of(${first}))if(run["quest"]==${fixture.quest})runs={@runs,run};endif endfor ${result('["count"->length(runs),"quest"->tostr(runs[1]["quest"]),"id"->runs[1]["id"],"status"->runs[1]["status"]]')}`);
  assert.equal(initial.count, 1); assert.equal(initial.quest, fixture.quest); assert.equal(initial.status, 'active');

  const stranger = await context.newPage();
  const second = await login(stranger);
  assert.notEqual(second, first);
  await stranger.getByRole('tab', { name: 'Timers', exact: true }).click();
  // Guest characters can retain unrelated quest journals. Check only our
  // private fixture, and never clear another quest to manufacture emptiness.
  await expect.poll(() => stranger.evaluate(() => window.mudClient.gmcp.require('Char.Status.Timers').snapshot.received), { timeout: 15000 }).toBe(true);
  await expect(stranger.getByRole('region', { name: 'Timers', exact: true })).not.toContainText(label);

  // Same-character recovery must request the real current snapshot again.
  await page.evaluate(() => window.mudClient.sharedClock.invalidate());
  await expect(page.getByRole('list', { name: 'Active timers' })).toContainText(label, { timeout: 15000 });
  await expect.poll(() => page.evaluate(() => window.mudClient.sharedClock.estimate().status), { timeout: 15000 }).toBe('current');
  await command(page, 'get timer proof token');
  await expect(page.getByRole('region', { name: 'Timers', exact: true })).not.toContainText(label, { timeout: 15000 });
  const completed = await ops(`count=0;for run in($quests:runs_of(${first}))if(run["quest"]==${fixture.quest})count=count+1;endif endfor ${result(`["runs"->count,"completed"->(${fixture.quest} in $quests:_value($quests.completed,${first},{}))]`)}`);
  assert.equal(completed.runs, 0); assert.ok(completed.completed);

  await command(page, `quest accept ${label}`);
  await expect(page.getByRole('list', { name: 'Active timers' })).toContainText(label, { timeout: 15000 });
  const active = await ops(`chosen=0;for run in($quests:runs_of(${first}))if(run["quest"]==${fixture.quest})chosen=run;endif endfor run=chosen;run["deadline"]=time()-2;$quests:_save(run);$gmcp_timers:refresh(${first});${result('["id"->run["id"],"status"->$quests:run_by_id(run["id"])["status"]]')}`);
  assert.equal(active.status, 'active');
  await expect(page.getByRole('list', { name: 'Active timers' })).toContainText('Time elapsed; waiting for the server.', { timeout: 10000 });
  const stillActive = await ops(`${result(`["status"->$quests:run_by_id(${active.id})["status"]]`)}`);
  assert.equal(stillActive.status, 'active');
  await ops(`$quests:_deadline(${active.id});${result(`["runs"->length($quests:runs_of(${first}))]`)}`);
  await expect(page.getByRole('region', { name: 'Timers', exact: true })).not.toContainText(label, { timeout: 15000 });

  await command(page, `quest accept ${label}`);
  await expect(page.getByRole('list', { name: 'Active timers' })).toContainText(label, { timeout: 15000 });
  const offline = await ops(`chosen=0;for run in($quests:runs_of(${first}))if(run["quest"]==${fixture.quest})chosen=run;endif endfor run=chosen;${result('["id"->run["id"]]')}`);

  // A new ordinary guest session must start with its own snapshot, not the
  // prior connection's list. Guest autologin deliberately stores no grant.
  await page.evaluate(() => window.mudClient.close());
  await ops(`run=$quests:run_by_id(${offline.id});run["deadline"]=time()-2;$quests:_save(run);$quests:_deadline(${offline.id});${result(`["runs"->length($quests:runs_of(${first}))]`)}`);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!window.mudClient?.connected), { timeout: 20000 }).toBe(true);
  await page.evaluate(() => window.mudClient.sendCommand('guest'));
  await expect.poll(() => page.evaluate(() => window.mudClient.gmcp.sessionReady), { timeout: 20000 }).toBe(true);
  await page.getByRole('tab', { name: 'Timers', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.mudClient.gmcp.require('Char.Status.Timers').snapshot.received), { timeout: 15000 }).toBe(true);
  await expect(page.getByRole('region', { name: 'Timers', exact: true })).not.toContainText(label);
  console.log('Live native timer journey passed: real ordinary guests; actual Core.Time and Char.Status.Timers; authoritative quest accept/get completion; private snapshots; clock recovery; expired pending-server state; server deadline settlement while connected and offline; clean reconnect snapshot.');
} catch (error) {
  console.error('Timer probe diagnostics:', { wire, client: probePage && !probePage.isClosed() ? await probePage.evaluate(() => ({ ready: window.mudClient.gmcp.ready, sessionReady: window.mudClient.gmcp.sessionReady, clock: window.mudClient.sharedClock.estimate(), timers: window.mudClient.gmcp.require('Char.Status.Timers').snapshot, panel: document.querySelector('[aria-label="Timers"]')?.textContent })) : undefined });
  throw error;
} finally {
  try { if (fixture) {
    const restore = [...guests].map(([ref, state]) => `if(valid(${ref}))for run in($quests:runs_of(${ref}))if(run["quest"]==${fixture.quest})$quests:_finish(run,"abandoned");endif endfor if(maphaskey($quests.completed,${ref}))v=setremove($quests.completed[${ref}],${fixture.quest});if(v)$quests.completed[${ref}]=v;else $quests.completed=mapdelete($quests.completed,${ref});endif endif move(${ref},${state.room});endif `).join(' ');
    await ops(`${restore}for obj in({${fixture.quest},${fixture.item},${fixture.giver},${fixture.room}})if(valid(obj))$recycler:recycle_now(obj);endif endfor ${result('["cleaned"->1]')}`);
  } } finally {
    for (const socket of upstreams) socket.close();
    await browser.close();
    assert(bundle.startsWith(resolve(tmpdir(), 'mongoose-live-timers-')));
    await rm(bundle, { recursive: true, force: true });
  }
}
