import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import { useInputStore } from '../stores/inputStore';
import { usePersonalDataStore } from '../stores/personalDataStore';
import { handleLaunchFiles, handleLaunchUrl, resetLaunchHandlingForTests, startLaunchHandling } from './launchHandling';
import { putLaunchItem } from './launchInbox';
import { finishStagedShare, offerSharedFiles, stageNextSharedFile, useLaunchStore } from './launchStore';
import { noteCommandSent, placeLaunchText } from './placeLaunchText';

const spoken = vi.hoisted(() => vi.fn());
vi.mock('@react-aria/live-announcer', () => ({ announce: spoken }));

const sendCommand = vi.fn();

function linkUrl(link: string): URL {
  const url = new URL('https://client.mongoose.world/');
  url.searchParams.set('protocol', link);
  return url;
}

function fileHandle(name: string, kind: FileSystemHandleKind = 'file'): FileSystemFileHandle {
  const file = new File(['moo'], name);
  return { kind, name, getFile: async () => file, isSameEntry: async () => false } as unknown as FileSystemFileHandle;
}

beforeEach(() => {
  spoken.mockClear();
  sendCommand.mockClear();
  window.mudClient = { sendCommand } as unknown as MudClient;
  useInputStore.setState({ text: '' });
  useLaunchStore.setState({ sharedFiles: [], filesRequest: 0, database: undefined, confirmedDatabase: undefined });
  usePersonalDataStore.setState({ owner: { runtime: 'live', playerUuid: 'p', playerRef: '#1' } });
});

afterEach(() => {
  resetLaunchHandlingForTests();
  window.history.replaceState(null, '', '/');
  window.launchQueue = undefined;
});

describe('protocol links', () => {
  it('drafts the link text without sending it', async () => {
    await handleLaunchUrl(linkUrl('web+mongoose:look%20at%20fountain'));
    expect(useInputStore.getState().text).toBe('look at fountain');
    expect(sendCommand).not.toHaveBeenCalled();
    expect(spoken).toHaveBeenCalledWith(expect.stringContaining('Not sent'), 'polite');
  });

  it('cannot smuggle a second command past the draft', async () => {
    await handleLaunchUrl(linkUrl('web+mongoose:look%0A%40quit'));
    expect(useInputStore.getState().text).toBe('look @quit');
    expect(sendCommand).not.toHaveBeenCalled();
  });

  it('says so when the link is malformed and leaves the draft alone', async () => {
    useInputStore.setState({ text: 'my draft' });
    await handleLaunchUrl(linkUrl('web+mongoose:%E0%A4%A'));
    expect(useInputStore.getState().text).toBe('my draft');
    expect(spoken).toHaveBeenCalledWith(expect.stringContaining('could not be read'), 'polite');
  });

  it('tells the player when their draft was replaced', () => {
    useInputStore.setState({ text: 'half-typed' });
    placeLaunchText('say hi');
    expect(spoken).toHaveBeenCalledWith(expect.stringMatching(/^Your draft was replaced/), 'polite');
  });
});

describe('drafts placed before sign-in', () => {
  const owner = { runtime: 'live', playerUuid: 'p', playerRef: '#1' };
  beforeEach(() => usePersonalDataStore.setState({ owner: undefined }));

  it('survive the clears of connecting and signing in, then are kept no longer', () => {
    placeLaunchText('look at fountain');
    usePersonalDataStore.getState().clearForConnect(); // client.connect()
    expect(useInputStore.getState().text).toBe('look at fountain');
    usePersonalDataStore.getState().confirm(owner);
    expect(useInputStore.getState().text).toBe('look at fountain');

    useInputStore.getState().clear();
    usePersonalDataStore.getState().clearForConnect();
    expect(useInputStore.getState().text).toBe('');
    expect(sendCommand).not.toHaveBeenCalled();
  });

  it('are discarded by a sign-out-style clear and stay gone', () => {
    placeLaunchText('private anonymous draft');
    usePersonalDataStore.getState().clear();
    expect(useInputStore.getState().text).toBe('');
    usePersonalDataStore.getState().clearForConnect();
    usePersonalDataStore.getState().confirm(owner);
    expect(useInputStore.getState().text).toBe('');
  });

  it.each([true, false])('are discarded when visitor mode turns %s and stay gone', (visitor) => {
    usePersonalDataStore.setState({ visitor: !visitor });
    placeLaunchText('private anonymous draft');
    usePersonalDataStore.getState().setVisitor(visitor);
    expect(useInputStore.getState().text).toBe('');
    usePersonalDataStore.getState().confirm(owner);
    expect(useInputStore.getState().text).toBe('');
    usePersonalDataStore.setState({ visitor: false });
  });

  it('are discarded when one owner gives way to another', () => {
    usePersonalDataStore.setState({ owner });
    placeLaunchText('mine');
    usePersonalDataStore.getState().confirm({ ...owner, playerUuid: 'someone-else' });
    expect(useInputStore.getState().text).toBe('');
  });

  it('are not put back once the player deleted them', () => {
    placeLaunchText('say unwanted');
    useInputStore.getState().setText(''); // select all, Delete
    usePersonalDataStore.getState().confirm(owner);
    expect(useInputStore.getState().text).toBe('');
  });

  it('are not put back once the player typed over them', () => {
    placeLaunchText('look at fountain');
    useInputStore.getState().setText('connect guest');
    useInputStore.getState().clear();
    usePersonalDataStore.getState().confirm(owner);
    expect(useInputStore.getState().text).toBe('');
  });

  it('are not put back once the player sent a command', () => {
    placeLaunchText('look at fountain');
    noteCommandSent();
    useInputStore.getState().clear();
    usePersonalDataStore.getState().clearForConnect();
    expect(useInputStore.getState().text).toBe('');
  });
});

describe('startLaunchHandling', () => {
  it('handles the page URL once and removes the launch from it', async () => {
    window.history.replaceState(null, '', `/?mode=host&${linkUrl('web+mongoose:say%20hi').searchParams}`);
    startLaunchHandling();
    await vi.waitFor(() => expect(useInputStore.getState().text).toBe('say hi'));
    expect(window.location.search).toBe('?mode=host');
  });

  it('takes later launches from the launch queue, skipping the one that loaded the page', async () => {
    const initial = linkUrl('web+mongoose:first');
    window.history.replaceState(null, '', initial.pathname + initial.search);
    let consumer: ((params: LaunchParams) => void) | undefined;
    window.launchQueue = { setConsumer: (next) => { consumer = next; } };
    startLaunchHandling();
    await vi.waitFor(() => expect(useInputStore.getState().text).toBe('first'));

    useInputStore.setState({ text: '' });
    consumer?.({ targetURL: new URL(initial.pathname + initial.search, window.location.origin).href, files: [] });
    await Promise.resolve();
    expect(useInputStore.getState().text).toBe('');

    consumer?.({ targetURL: linkUrl('web+mongoose:second').href, files: [] });
    await vi.waitFor(() => expect(useInputStore.getState().text).toBe('second'));
    expect(sendCommand).not.toHaveBeenCalled();
  });
});

describe('shares', () => {
  it('drafts shared text', async () => {
    const id = await putLaunchItem({ kind: 'share', text: 'look at map', files: [] });
    await handleLaunchUrl(new URL(`https://client.mongoose.world/?share=${id}`));
    expect(useInputStore.getState().text).toBe('look at map');
    expect(sendCommand).not.toHaveBeenCalled();
  });

  it('says so when a share has gone', async () => {
    await handleLaunchUrl(new URL('https://client.mongoose.world/?share=missing'));
    expect(spoken).toHaveBeenCalledWith(expect.stringContaining('no longer available'), 'polite');
  });

  it('queues shared files and asks for the file transfer panel', () => {
    const files = [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')];
    offerSharedFiles(files);
    expect(useLaunchStore.getState().filesRequest).toBe(1);
    expect(stageNextSharedFile()).toBe(files[0]);
    expect(stageNextSharedFile()).toBeUndefined(); // one at a time
    expect(useLaunchStore.getState()).toMatchObject({ stagedShare: files[0], sharedFiles: [files[1]] });
    finishStagedShare(files[1]); // not the staged one: nothing moves
    expect(stageNextSharedFile()).toBeUndefined();
    finishStagedShare(files[0]);
    expect(stageNextSharedFile()).toBe(files[1]);
    useLaunchStore.setState({ stagedShare: undefined });
  });

  it.each([
    ['too-many', 'at most 10 files'],
    ['too-large', 'at most 100 MB'],
    ['inbox-full', 'already waiting'],
    ['failed', 'could not be read'],
  ])('says why a share was refused (%s)', async (refusal, words) => {
    await handleLaunchUrl(new URL(`https://client.mongoose.world/?share=${refusal}`));
    expect(spoken).toHaveBeenCalledWith(expect.stringContaining(words), 'polite');
    expect(useInputStore.getState().text).toBe('');
  });
});

describe('shortcuts reaching an open window', () => {
  function startWithQueue(path: string) {
    window.history.replaceState(null, '', path);
    let consumer: ((params: LaunchParams) => void) | undefined;
    window.launchQueue = { setConsumer: (next) => { consumer = next; } };
    startLaunchHandling();
    return (target: string, files: readonly FileSystemHandle[] = []) =>
      consumer?.({ targetURL: new URL(target, window.location.origin).href, files });
  }

  afterEach(() => useLaunchStore.setState({ modeRequest: undefined }));

  it.each([['/?mode=host', 'host'], ['/?mode=local', 'local']] as const)('asks before opening %s in a window of its own', (target, mode) => {
    const launch = startWithQueue('/');
    launch(target);
    expect(useLaunchStore.getState().modeRequest).toEqual({ mode });
  });

  it('does nothing more when the window is already in that mode', () => {
    const launch = startWithQueue('/?mode=host');
    launch('/?mode=host');
    expect(useLaunchStore.getState().modeRequest).toBeUndefined();
  });

  it('leaves an opened database to its own dialog', async () => {
    const launch = startWithQueue('/');
    launch('/?mode=host', [fileHandle('World.db')]);
    await vi.waitFor(() => expect(useLaunchStore.getState().database?.name).toBe('World.db'));
    expect(useLaunchStore.getState().modeRequest).toBeUndefined();
  });
});

describe('opened files', () => {
  it('holds a MOO database for the player to confirm', async () => {
    await handleLaunchFiles([fileHandle('notes.txt'), fileHandle('LambdaCore.DB')]);
    expect(useLaunchStore.getState().database?.name).toBe('LambdaCore.DB');
    expect(useLaunchStore.getState().confirmedDatabase).toBeUndefined();
  });

  it('turns away other files', async () => {
    await handleLaunchFiles([fileHandle('notes.txt'), fileHandle('folder.db', 'directory')]);
    expect(useLaunchStore.getState().database).toBeUndefined();
    expect(spoken).toHaveBeenCalledWith(expect.stringContaining('.db'), 'polite');
  });
});
