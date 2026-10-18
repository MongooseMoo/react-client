import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { chromium, expect } from '@playwright/test';

const vite = await createViteServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
const server = createServer((request, response) => {
  if (request.url === '/probe') {
    response.setHeader('Content-Type', 'text/html');
    response.end('<!doctype html><title>Composer browser probe</title><script type="module" src="/scripts/composer-fixture.tsx"></script>');
  } else vite.middlewares(request, response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/probe`);
  await expect(page.getByRole('button', { name: 'Record selected pattern' })).toBeEnabled({ timeout: 15000 });
  const partName=page.getByRole('textbox',{name:'Part name'});
  await partName.fill('One complete keyboard edit');
  await page.keyboard.press('Enter');
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  await expect(partName).toHaveValue('Piano');
  await page.getByRole('textbox',{name:'Composition name'}).fill('Reconnect kept unsaved draft');
  await page.keyboard.press('Enter');
  // Native keyboard submission, followed by editable linear note and undo controls.
  await page.getByRole('spinbutton', { name: 'Start beat', exact: true }).fill('0.25');
  await page.getByRole('spinbutton', { name: 'Velocity', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('list', { name: 'Pattern notes' })).toContainText('Beat 0.25');
  await page.getByRole('button', { name: 'Copy pattern' }).focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('textbox', { name: 'Pattern name' })).toHaveValue('Pattern 1 copy');
  await page.getByRole('button', { name: 'Delete note 1' }).click();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByRole('list', { name: 'Pattern notes' })).toContainText('C4 (60)');

  // Stop before the future anchor; observe native samples through its old onset.
  await page.getByRole('button', { name: 'Audition pattern', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Private audition playing.');
  await page.getByRole('button', { name: 'Stop private playback or recording' }).click();
  const cancelled = await page.evaluate(async () => {
    let peak = 0; const until = performance.now() + 2400;
    while (performance.now() < until) { peak = Math.max(peak, window.composerProbe.amplitude()); await new Promise(resolve => setTimeout(resolve, 15)); }
    return peak;
  });
  assert.ok(cancelled < 1e-6, `Cancelled future audition emitted ${cancelled}`);
  await page.getByRole('button', { name: 'Audition pattern', exact: true }).click();
  const audible = await page.evaluate(async () => {
    const until = performance.now() + 3500;
    while (performance.now() < until) { if (window.composerProbe.amplitude() > 0.001) return true; await new Promise(resolve => setTimeout(resolve, 15)); }
    return false;
  });
  assert.equal(audible, true, 'Private audition must produce real audio');
  await page.getByRole('button', { name: 'Stop private playback or recording' }).click();

  // Timestamped capture uses the real software keyboard; explicit sharing stays off.
  await page.getByRole('combobox', { name: 'Count-in beats' }).selectOption('0');
  await page.getByRole('button', { name: 'Record selected pattern' }).click();
  await expect(page.getByRole('status')).toHaveText('Recording armed.');
  await page.evaluate(async () => {
    await new Promise(resolve => setTimeout(resolve, 1650));
    window.composerProbe.networkReset();
    window.composerProbe.manual(70,true);window.composerProbe.manual(70,false);
    window.composerProbe.keyboard.emit([0x90, 64, 100]);
    await new Promise(resolve => setTimeout(resolve, 180));
    window.composerProbe.keyboard.emit([0x80, 64, 0]);
  });
  await expect(page.getByRole('button',{name:'Save locally'})).toBeDisabled();
  await expect(page.getByRole('textbox',{name:'Composition name'})).toHaveValue('Reconnect kept unsaved draft');
  await expect(page.getByRole('button',{name:'Stop private playback or recording'})).toBeEnabled();
  await page.getByRole('button', { name: 'Stop private playback or recording' }).click();
  await expect(page.getByRole('button',{name:'Save locally'})).toBeDisabled();
  await page.evaluate(()=>window.composerProbe.confirmOwner());
  await expect(page.getByRole('button',{name:'Save locally'})).toBeEnabled();
  await expect(page.getByText('1 original recording takes retained.')).toBeVisible();
  await expect(page.getByRole('list', { name: 'Pattern notes' })).toContainText('E4 (64)');
  assert.equal(await page.evaluate(() => window.composerProbe.sent.filter(([name]) => name === 'Client.Midi.Note').length), 0);

  // A real module worker exports and reimports the shared dependency's SMF codec.
  const worker = await page.evaluate(async () => {
    const { SmfWorkerClient } = await import('/src/composition/SmfWorkerClient.ts');
    const { compileComposition, newComposition } = await import('/src/composition/model.ts');
    const service = new SmfWorkerClient();
    const original = compileComposition(newComposition());
    const bytes = await service.export(original);
    const imported = await service.import(bytes);
    const abort = new AbortController(); abort.abort();
    let cancelled = false;
    try { await service.export(original, undefined, abort.signal); } catch (error) { cancelled = error.name === 'AbortError'; }
    service.dispose();
    return { duration: imported.score.durationTicks, program: imported.score.parts[0].program, cancelled };
  });
  assert.deepEqual(worker, { duration: 3840, program: 0, cancelled: true });
  await page.evaluate(() => window.composerProbe.destroy());
  assert.deepEqual(errors, []);
  console.log('Composer: native keyboard editing, audible private audition, future cancellation, timestamped private capture and real SMF worker roundtrip passed');
} finally {
  await browser.close(); await new Promise(resolve => server.close(resolve)); await vite.close();
}
