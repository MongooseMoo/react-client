import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type MudClient from './client';
import { isSoundFile, soundFileName, uploadSounds } from './soundUpload';

let fetchMock: ReturnType<typeof vi.fn>;
let token: string | null;
const client = { gmcp: { require: () => ({ requestToken: async () => token }) } } as unknown as MudClient;
const rain = new File(['r'], 'rain.wav', { type: 'audio/wav' });
const none = () => {};

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

it('puts a sound into the sounds folder under its own name with the push token', async () => {
  expect(await uploadSounds(client, [rain], none)).toBe('Sound sent. The game will tell you when it is in the sound library.');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/dav\/sounds\/rain\.wav$/);
  expect(init.method).toBe('PUT');
  // Only the two headers the CORS preflight allows.
  expect(init.headers).toEqual({ Authorization: 'Bearer synthetic-push', 'Content-Type': 'audio/wav' });
  expect(init.body).toBe(rain);
});

it('sends several sounds one after another and reports progress', async () => {
  const files = [rain, new File(['b'], 'bell.mp3', { type: 'audio/mpeg' })];
  const seen: string[] = [];
  expect(await uploadSounds(client, files, (index, count) => seen.push(`${index}/${count}`))).toBe(
    'Sounds sent. The game will tell you when each is in the sound library.',
  );
  expect(seen).toEqual(['1/2', '2/2']);
  expect(fetchMock.mock.calls.map(([url]) => (url as string).slice((url as string).indexOf('/dav/')))).toEqual([
    '/dav/sounds/rain.wav',
    '/dav/sounds/bell.mp3',
  ]);
});

it("passes on the game's reason for refusing, such as wizards only", async () => {
  fetchMock.mockResolvedValueOnce(reply(403, 'Uploading sounds is for wizards for now.'));
  expect(await uploadSounds(client, [rain], none)).toBe('Could not send rain.wav: Uploading sounds is for wizards for now.');
});

it("names the server's size refusal", async () => {
  fetchMock.mockResolvedValueOnce(reply(413, 'Too big'));
  expect(await uploadSounds(client, [rain], none)).toBe('Could not send rain.wav: the sound is too large');
});

it('stops at the first sound refused and says which one', async () => {
  fetchMock.mockResolvedValueOnce(reply(201)).mockResolvedValueOnce(reply(500));
  const files = [rain, new File(['b'], 'bell.mp3', { type: 'audio/mpeg' }), new File(['c'], 'c.ogg', { type: 'audio/ogg' })];
  expect(await uploadSounds(client, files, none)).toBe('Sound 2 of 3: Could not send bell.mp3: the server answered 500');
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it('sends nothing without a token, or when a file is not a sound', async () => {
  token = null;
  expect(await uploadSounds(client, [rain], none)).toBe('Could not send the sound: connect to the game first.');
  token = 'synthetic-push';
  const notes = new File(['x'], 'notes.txt', { type: 'text/plain' });
  expect(await uploadSounds(client, [rain, notes], none)).toBe("Could not send notes.txt: it isn't a sound file.");
  expect(fetchMock).not.toHaveBeenCalled();
});

it('knows a sound by its type, or by its ending when the browser gives no type', () => {
  expect(isSoundFile(rain)).toBe(true);
  expect(isSoundFile(new File(['x'], 'loop.FLAC'))).toBe(true);
  expect(isSoundFile(new File(['x'], 'notes.txt'))).toBe(false);
});

it('lets a zip of sounds through whole, for the game to unpack', async () => {
  const pack = new File(['z'], 'pack.zip', { type: 'application/zip' });
  expect(isSoundFile(pack)).toBe(true);
  expect(isSoundFile(new File(['z'], 'pack.ZIP'))).toBe(true);
  expect(await uploadSounds(client, [pack], none)).toBe('Sound sent. The game will tell you when it is in the sound library.');
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/dav\/sounds\/pack\.zip$/);
  expect(init.headers).toEqual({ Authorization: 'Bearer synthetic-push', 'Content-Type': 'application/zip' });
});

it('stores a sound under a safe version of its name', () => {
  expect(soundFileName('C:\\music\\a:b?.wav')).toBe('a-b-.wav');
  expect(soundFileName('folder/rain.wav')).toBe('rain.wav');
  expect(soundFileName('..')).toMatch(/^sound-[0-9a-f-]{36}$/);
});
