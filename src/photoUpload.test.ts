import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type MudClient from './client';
import { jpegStart, uploadPhoto, uploadPhotos } from './photoUpload';

let fetchMock: ReturnType<typeof vi.fn>;
let token: string | null;
const client = { gmcp: { require: () => ({ requestToken: async () => token }) } } as unknown as MudClient;
const jpeg = new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/jpeg' });

function reply(status: number, body?: unknown) {
  const headers = new Headers(body === undefined ? {} : { 'Content-Type': 'application/json' });
  return { status, headers, json: async () => body };
}

beforeEach(() => {
  token = 'synthetic-push';
  fetchMock = vi.fn(async () => reply(202, { status: 'reading' }));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

it('posts the JPEG with the push token and says the game will report back', async () => {
  expect(await uploadPhoto(client, jpeg)).toEqual({ sent: true, message: 'Photo sent. The game will tell you when it has been read.' });
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/api\/photos\/upload$/);
  expect(init.method).toBe('POST');
  expect(init.headers).toEqual({ Authorization: 'Bearer synthetic-push', 'Content-Type': 'image/jpeg' });
  expect(init.body).toBe(jpeg);
});

it("passes on the MOO's reason for refusing", async () => {
  fetchMock.mockResolvedValueOnce(reply(403, { error: 'Photo import is for builders.' }));
  expect(await uploadPhoto(client, jpeg)).toEqual({ sent: false, message: 'Could not send the photo: Photo import is for builders.' });
});

it('names a size refusal that has no body', async () => {
  fetchMock.mockResolvedValueOnce(reply(413));
  expect(await uploadPhoto(client, jpeg)).toEqual({ sent: false, message: 'Could not send the photo: the photo is too large' });
});

it('sends nothing without a token', async () => {
  token = null;
  expect(await uploadPhoto(client, jpeg)).toEqual({ sent: false, message: 'Could not send the photo: connect to the game first.' });
  expect(fetchMock).not.toHaveBeenCalled();
});

it('sends several pictures in order as one set, naming the set and its size on each', async () => {
  const files = [new Blob(['a']), new Blob(['b']), new Blob(['c'])];
  const seen: string[] = [];
  const message = await uploadPhotos(client, files, (index, count) => seen.push(`${index}/${count}`), async (file) => file);
  expect(message).toBe('Photos sent. The game will tell you when they have been read.');
  expect(seen).toEqual(['1/3', '2/3', '3/3']);
  expect(fetchMock.mock.calls.map(([, init]) => init.body)).toEqual(files);
  const sets = fetchMock.mock.calls.map(([, init]) => init.headers['X-Photo-Set']);
  expect(new Set(sets).size).toBe(1);
  expect(sets[0]).toMatch(/^[0-9a-f-]{36}$/);
  expect(fetchMock.mock.calls.every(([, init]) => init.headers['X-Photo-Count'] === '3')).toBe(true);
});

it('stops a set at the first picture refused and says which one', async () => {
  fetchMock.mockResolvedValueOnce(reply(202, { status: 'waiting' })).mockResolvedValueOnce(reply(415, { error: 'Send a JPEG, PNG, GIF or WebP image.' }));
  const files = [new Blob(['a']), new Blob(['b']), new Blob(['c'])];
  expect(await uploadPhotos(client, files, () => {}, async (file) => file)).toBe('Photo 2 of 3: Could not send the photo: Send a JPEG, PNG, GIF or WebP image.');
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it('sends one picture on its own, with no set', async () => {
  await uploadPhotos(client, [jpeg], () => {}, async (file) => file);
  expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer synthetic-push', 'Content-Type': 'image/jpeg' });
});

it('finds the JPEG inside a camera frame saved with its stream header', async () => {
  // The start of Q's doorbell.jpg: a multipart boundary and headers before the image.
  const header = new TextEncoder().encode('--frameboundary\r\nContent-Type: image/jpeg\r\n\r\n');
  const frame = new Blob([header, new Uint8Array([0xff, 0xd8, 0xff, 0xe0])]);
  expect(await jpegStart(frame)).toBe(header.length);
});

it('starts an ordinary JPEG at its first byte, and anything else too', async () => {
  expect(await jpegStart(jpeg)).toBe(0);
  expect(await jpegStart(new Blob([new TextEncoder().encode('GIF89a')]))).toBe(0);
});
