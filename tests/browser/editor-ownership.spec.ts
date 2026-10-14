import { expect, test } from '@playwright/test';

const origin = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

test('two game sessions and reopened editors keep saves and shutdown with their owner', async ({ context }) => {
  // Exercise the actual manager and browser BroadcastChannels. The blank game
  // document supplies only the already-authenticated MCP boundary; editor
  // windows use the application's real route and channel handshake.
  await context.route('**/ownership-game', (route) => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><title>Game owner fixture</title>',
  }));
  const a = await context.newPage();
  const b = await context.newPage();
  await Promise.all([a.goto(`${origin}/ownership-game`), b.goto(`${origin}/ownership-game`)]);
  for (const page of [a, b]) {
    await page.evaluate(async () => {
      const { EditorManager } = await import('/src/EditorManager.ts');
      globalThis.saves = [];
      globalThis.manager = new EditorManager({ sendSet: (session) => globalThis.saves.push(session) });
    });
  }
  const open = async (page, label) => {
    const popup = page.waitForEvent('popup');
    await page.evaluate((name) => globalThis.manager.openEditorWindow({
      reference: '#1:shared', type: 'text/plain', name, contents: [name],
    }), label);
    return popup;
  };
  const editorA = await open(a, 'A');
  const editorB = await open(b, 'B');
  const ownerA = new URL(editorA.url()).searchParams.get('owner');
  const ownerB = new URL(editorB.url()).searchParams.get('owner');
  expect(ownerA).toBeTruthy();
  expect(ownerB).not.toBe(ownerA);
  await expect(editorA).toHaveTitle('A - Mongoose Editor');
  await expect(editorB).toHaveTitle('B - Mongoose Editor');
  // Use the real document's channel from another document, as the editor save
  // does, to avoid depending on Monaco's CDN or keyboard focus for routing.
  await editorA.evaluate((owner) => {
    const channel = new BroadcastChannel(`editor:${owner}`);
    channel.postMessage({ type: 'save', id: '#1:shared', session: {
      reference: '#1:shared', name: 'substitution', type: 'substitution', contents: ['A edited'],
    } });
    channel.close();
  }, ownerA);
  await expect.poll(() => a.evaluate(() => globalThis.saves.length)).toBe(1);
  expect(await b.evaluate(() => globalThis.saves)).toEqual([]);
  expect(await a.evaluate(() => globalThis.saves[0])).toEqual({
    reference: '#1:shared', name: 'A', type: 'text/plain', contents: ['A edited'],
  });
  await a.evaluate(() => globalThis.manager.reset());
  await expect.poll(() => editorA.isClosed()).toBe(true);
  expect(editorB.isClosed()).toBe(false);
  const reopened = await open(a, 'A resumed');
  expect(new URL(reopened.url()).searchParams.get('owner')).not.toBe(ownerA);
  await expect(reopened).toHaveTitle('A resumed - Mongoose Editor');
  await a.evaluate((owner) => {
    const channel = new BroadcastChannel(`editor:${owner}`);
    channel.postMessage({ type: 'save', id: '#1:shared', session: { reference: '#1:shared', contents: ['late'] } });
    channel.close();
  }, ownerA);
  await b.evaluate(() => globalThis.manager.shutdown());
  await expect.poll(() => editorB.isClosed()).toBe(true);
  expect(reopened.isClosed()).toBe(false);
  expect(await a.evaluate(() => globalThis.saves.length)).toBe(1);
});
