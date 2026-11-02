import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type MudClient from './client';
import { jpegStart, uploadPhotos } from './photoUpload';

let fetchMock: ReturnType<typeof vi.fn>;
let token: string | null;
const client = { gmcp: { require: () => ({ requestToken: async () => token }) } } as unknown as MudClient;
const jpeg = new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/jpeg' });
const asIs = async (file: Blob) => file;

function reply(status: number, text?: string) {
  const headers = new Headers(text === undefined ? {} : { 'Content-Type': 'text/plain' });
  return { status, headers, text: async () => text ?? '' };
}

beforeEach(() => {
  token = 'synthetic-push';
  fetchMock = vi.fn(async () => reply(201));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

it('puts one picture into the photos folder with the push token and says the game will report back', async () => {
  expect(await uploadPhotos(client, [jpeg], () => {}, asIs)).toBe('Photo sent. The game will tell you when it has been read.');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/dav\/photos\/[0-9a-f-]{36}\.jpg$/);
  expect(init.method).toBe('PUT');
  // Only the two headers the CORS preflight allows.
  expect(init.headers).toEqual({ Authorization: 'Bearer synthetic-push', 'Content-Type': 'image/jpeg' });
  expect(init.body).toBe(jpeg);
});

it('puts several pictures into one new subfolder, in order, so they become one album', async () => {
  const files = [new Blob(['a']), new Blob(['b']), new Blob(['c'])];
  const seen: string[] = [];
  const message = await uploadPhotos(client, files, (index, count) => seen.push(`${index}/${count}`), asIs);
  expect(message).toBe('Photos sent. The game will tell you when they have been read.');
  expect(seen).toEqual(['1/3', '2/3', '3/3']);
  const [made, ...puts] = fetchMock.mock.calls;
  expect(made[1].method).toBe('MKCOL');
  const folder = (made[0] as string).match(/\/dav\/photos\/([0-9a-f-]{36})\/$/)?.[1];
  expect(folder).toBeDefined();
  expect(puts.map(([url]) => url as string).map((url) => url.slice(url.indexOf('/dav/')))).toEqual(
    ['001', '002', '003'].map((n) => `/dav/photos/${folder}/${n}.jpg`),
  );
  expect(puts.map(([, init]) => init.body)).toEqual(files);
});

it('prepares every picture before sending any, so an album arrives without gaps', async () => {
  const order: string[] = [];
  fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
    order.push(init.method as string);
    return reply(201);
  });
  await uploadPhotos(client, [new Blob(['a']), new Blob(['b'])], () => {}, async (file) => {
    order.push('prepare');
    return file;
  });
  expect(order).toEqual(['prepare', 'prepare', 'MKCOL', 'PUT', 'PUT']);
});

it("passes on the game's reason for refusing", async () => {
  fetchMock.mockResolvedValueOnce(reply(403, 'Uploading photos and sounds is for builders.'));
  expect(await uploadPhotos(client, [jpeg], () => {}, asIs)).toBe('Could not send the photo: Uploading photos and sounds is for builders.');
});

it('names a size refusal', async () => {
  fetchMock.mockResolvedValueOnce(reply(413, 'Too big'));
  expect(await uploadPhotos(client, [jpeg], () => {}, asIs)).toBe('Could not send the photo: the photo is too large');
});

it('sends nothing without a token', async () => {
  token = null;
  expect(await uploadPhotos(client, [jpeg], () => {}, asIs)).toBe('Could not send the photo: connect to the game first.');
  expect(fetchMock).not.toHaveBeenCalled();
});

it('stops an album at the first picture refused and says which one', async () => {
  fetchMock
    .mockResolvedValueOnce(reply(201))
    .mockResolvedValueOnce(reply(201))
    .mockResolvedValueOnce(reply(500));
  const files = [new Blob(['a']), new Blob(['b']), new Blob(['c'])];
  expect(await uploadPhotos(client, files, () => {}, asIs)).toBe('Photo 2 of 3: Could not send the photo: the server answered 500');
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

it('says so when the album folder cannot be made', async () => {
  fetchMock.mockResolvedValueOnce(reply(401));
  expect(await uploadPhotos(client, [jpeg, jpeg], () => {}, asIs)).toBe('Could not send the photos: the server answered 401');
  expect(fetchMock).toHaveBeenCalledTimes(1);
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
