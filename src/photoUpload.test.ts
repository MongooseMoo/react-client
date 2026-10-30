import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type MudClient from './client';
import { jpegStart, uploadPhoto } from './photoUpload';

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
  expect(await uploadPhoto(client, jpeg)).toBe('Photo sent. The game will tell you when it has been read.');
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/api\/photos\/upload$/);
  expect(init.method).toBe('POST');
  expect(init.headers).toEqual({ Authorization: 'Bearer synthetic-push', 'Content-Type': 'image/jpeg' });
  expect(init.body).toBe(jpeg);
});

it("passes on the MOO's reason for refusing", async () => {
  fetchMock.mockResolvedValueOnce(reply(403, { error: 'Photo import is for builders.' }));
  expect(await uploadPhoto(client, jpeg)).toBe('Could not send the photo: Photo import is for builders.');
});

it('names a size refusal that has no body', async () => {
  fetchMock.mockResolvedValueOnce(reply(413));
  expect(await uploadPhoto(client, jpeg)).toBe('Could not send the photo: the photo is too large');
});

it('sends nothing without a token', async () => {
  token = null;
  expect(await uploadPhoto(client, jpeg)).toBe('Could not send the photo: connect to the game first.');
  expect(fetchMock).not.toHaveBeenCalled();
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
