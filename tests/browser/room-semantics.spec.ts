import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';
import { build } from 'esbuild';

test('native room semantics survive physical updates without acoustic membership or focus changes', async ({ context }) => {
  const compiled = await build({ bundle: true, write: false, format: 'esm', platform: 'browser',
    stdin: { resolveDir: resolve('.'), loader: 'tsx', contents: `
      import { createElement } from 'react';
      import { createRoot } from 'react-dom/client';
      import RoomLayoutView from './src/components/RoomLayoutView';
      import { GMCPRoom } from './src/gmcp/Room';
      import { GMCPClientSpatial } from './src/gmcp/Client/Spatial';
      import { useRoomStore } from './src/stores/roomStore';
      import { livingRoomLayout } from './src/map/roomLayout.fixture';
      const client = { gmcp: { send() {}, handlers: {} }, media: { sceneChanged() {} } };
      const room = new GMCPRoom(client);
      const spatial = new GMCPClientSpatial(client);
      const layout = livingRoomLayout();
      layout.room_lifetime = 'room-fixture';
      layout.finishes = { floor: 'oak', wall: 'drywall' };
      layout.things = layout.things.map(t => ({ ...t, lifetime: 'body-fixture' }));
      const seat = layout.things.find(t => t.id === '#2');
      seat.relation = { kind: 'on', target: '#1', text: 'on coffee table' };
      seat.state = { opened: false, mode: 'offline' };
      function View() {
        const current = useRoomStore(s => s.roomLayout);
        return current && createElement(RoomLayoutView, { layout: current, roomName: 'Semantic room', onExit() {} });
      }
      room.receive('Layout', layout);
      createRoot(document.getElementById('root')).render(createElement(View));
      globalThis.fixture = { room, spatial, seat, layout };
    ` } });
  await context.route('**/room-semantics', route => route.fulfill({ contentType: 'text/html',
    body: '<!doctype html><button id="focus">Keep focus</button><div id="root"></div><script type="module" src="/room-semantics.js"></script>' }));
  await context.route('**/room-semantics.js', route => route.fulfill({ contentType: 'text/javascript', body: compiled.outputFiles[0].text }));
  const page = await context.newPage();
  await page.goto(`${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173'}/room-semantics`);
  const things = page.getByRole('list', { name: 'Things in the layout' });
  await expect(things).toContainText('on coffee table, faces south, closed, offline');
  await expect(page.getByText('oak', { exact: true })).toBeVisible();
  await page.locator('#focus').focus();
  await page.evaluate(() => {
    const { room, spatial, seat, layout } = globalThis.fixture;
    spatial.receive('EntityEnter', { entity: { id: '#unseen', position: [0, 0, 0], name: 'Hidden newcomer' } });
    spatial.receive('EntityLeave', { entityId: seat.id });
    const moved = { id: seat.id, lifetime: seat.lifetime,
      pose: { ...seat.pose, centre_m: [0, 0, 0.45], body_quaternion: [0, 0, 0, 1] },
      shapes: [{ box: [[-1, 1], [-0.45, 0.45], [0, 0.9]] }],
      front: { axis: [0, -1, 0], yaw: Math.PI, direction: 'north' } };
    room.receive('LayoutUpdate', { num: layout.num, room_lifetime: layout.room_lifetime, bodies: [moved] });
    room.receive('LayoutUpdate', { num: layout.num, room_lifetime: 'retired-room', bodies: [{ ...moved, front: { ...moved.front, direction: 'west' } }] });
  });
  await expect(things).toContainText('faces north, closed, offline');
  await expect(things).not.toContainText('on coffee table');
  await expect(things).not.toContainText('Hidden newcomer');
  await expect(page.locator('#focus')).toBeFocused();
  await expect(page.locator('[aria-live]')).toHaveCount(0);
});
