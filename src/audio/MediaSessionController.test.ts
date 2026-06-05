import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MediaSessionController } from './MediaSessionController';

type ActionHandlers = Record<string, MediaSessionActionHandler>;

function installMockSession() {
  const handlers: ActionHandlers = {};
  const session = {
    metadata: null as MediaMetadata | null,
    playbackState: 'none' as MediaSessionPlaybackState,
    setActionHandler: vi.fn((action: string, handler: MediaSessionActionHandler | null) => {
      if (handler) {
        handlers[action] = handler;
      } else {
        delete handlers[action];
      }
    }),
    setPositionState: vi.fn(),
  };
  Object.defineProperty(navigator, 'mediaSession', {
    value: session,
    configurable: true,
    writable: true,
  });
  // jsdom has no MediaMetadata constructor — provide a minimal stand-in.
  (globalThis as unknown as { MediaMetadata: unknown }).MediaMetadata = class {
    title?: string;
    artist?: string;
    album?: string;
    artwork?: MediaImage[];
    constructor(init: MediaMetadataInit = {}) {
      this.title = init.title;
      this.artist = init.artist;
      this.album = init.album;
      this.artwork = init.artwork as MediaImage[] | undefined;
    }
  };
  return { session, handlers };
}

function removeMockSession() {
  Reflect.deleteProperty(navigator, 'mediaSession');
  Reflect.deleteProperty(globalThis as object, 'MediaMetadata');
}

function makeActions() {
  return {
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    seekTo: vi.fn(),
    seekBackward: vi.fn(),
    seekForward: vi.fn(),
  };
}

describe('MediaSessionController', () => {
  afterEach(() => {
    removeMockSession();
    vi.restoreAllMocks();
  });

  describe('with a Media Session available', () => {
    let session: ReturnType<typeof installMockSession>['session'];
    let handlers: ActionHandlers;
    let controller: MediaSessionController;
    let actions: ReturnType<typeof makeActions>;

    beforeEach(() => {
      ({ session, handlers } = installMockSession());
      controller = new MediaSessionController();
      actions = makeActions();
    });

    it('publishes track metadata and a playing state on setNowPlaying', () => {
      controller.setNowPlaying(
        { title: 'Cantina Band', artist: 'Figrin D’an', album: 'Mos Eisley' },
        actions,
      );
      expect(session.metadata?.title).toBe('Cantina Band');
      expect(session.metadata?.artist).toBe('Figrin D’an');
      expect(session.playbackState).toBe('playing');
    });

    it('routes OS transport actions to the supplied callbacks', () => {
      controller.setNowPlaying({ title: 'Track' }, actions);

      handlers.play?.({ action: 'play' });
      handlers.pause?.({ action: 'pause' });
      handlers.stop?.({ action: 'stop' });
      expect(actions.play).toHaveBeenCalledOnce();
      expect(actions.pause).toHaveBeenCalledOnce();
      expect(actions.stop).toHaveBeenCalledOnce();
    });

    it('forwards seekto with the OS-supplied time', () => {
      controller.setNowPlaying({ title: 'Track' }, actions);
      handlers.seekto?.({ action: 'seekto', seekTime: 42 });
      expect(actions.seekTo).toHaveBeenCalledWith(42);
    });

    it('falls back to a default offset for seekforward/backward', () => {
      controller.setNowPlaying({ title: 'Track' }, actions);
      handlers.seekforward?.({ action: 'seekforward' });
      handlers.seekbackward?.({ action: 'seekbackward', seekOffset: 5 });
      expect(actions.seekForward).toHaveBeenCalledWith(10);
      expect(actions.seekBackward).toHaveBeenCalledWith(5);
    });

    it('re-targets the once-registered handlers to the latest track', () => {
      controller.setNowPlaying({ title: 'First' }, actions);
      const second = makeActions();
      controller.setNowPlaying({ title: 'Second' }, second);

      // Handlers are registered exactly once per action (6 actions total).
      expect(session.setActionHandler).toHaveBeenCalledTimes(6);

      handlers.pause?.({ action: 'pause' });
      expect(second.pause).toHaveBeenCalledOnce();
      expect(actions.pause).not.toHaveBeenCalled();
    });

    it('reports a finite position to the scrubber', () => {
      controller.setPositionState(120, 30, 1);
      expect(session.setPositionState).toHaveBeenCalledWith({
        duration: 120,
        position: 30,
        playbackRate: 1,
      });
    });

    it('clamps position into [0, duration]', () => {
      controller.setPositionState(100, 250, 1);
      expect(session.setPositionState).toHaveBeenCalledWith({
        duration: 100,
        position: 100,
        playbackRate: 1,
      });
    });

    it('skips position reporting when the duration is unknown', () => {
      controller.setPositionState(NaN, 10);
      controller.setPositionState(0, 10);
      expect(session.setPositionState).not.toHaveBeenCalled();
    });

    it('clears metadata, state, and position on clear', () => {
      controller.setNowPlaying({ title: 'Track' }, actions);
      controller.clear();
      expect(session.metadata).toBeNull();
      expect(session.playbackState).toBe('none');
      expect(session.setPositionState).toHaveBeenLastCalledWith();
    });
  });

  describe('without a Media Session (unsupported browser / SSR)', () => {
    it('no-ops on every method instead of throwing', () => {
      // No installMockSession(): navigator.mediaSession is undefined.
      const controller = new MediaSessionController();
      const actions = makeActions();
      expect(() => {
        controller.setNowPlaying({ title: 'Track' }, actions);
        controller.setPlaybackState('paused');
        controller.setPositionState(100, 10);
        controller.clear();
      }).not.toThrow();
    });
  });
});
