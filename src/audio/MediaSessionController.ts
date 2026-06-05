/**
 * Bridges playing media to the browser's Media Session API
 * (`navigator.mediaSession`), which is what drives OS-level "now playing"
 * surfaces: the lock screen, notification-shade transport controls, hardware
 * media keys, smartwatch remotes, and car head units.
 *
 * The controller owns NO audio. It is a presentation surface: callers tell it
 * what is playing and supply callbacks the OS controls invoke, and it relays
 * those to the platform. Everything is feature-detected, so on a browser (or
 * test environment) without the API every method is a silent no-op.
 */

/** Lock-screen track info. `title` is the only required field. */
export interface MediaSessionTrack {
  title: string;
  artist?: string;
  album?: string;
  artwork?: MediaImage[];
}

/**
 * Callbacks the OS transport controls invoke. The controller never decides what
 * these do — it forwards the user's lock-screen gesture to the owner, which acts
 * on whatever it currently considers "now playing".
 */
export interface MediaSessionActions {
  play(): void;
  pause(): void;
  stop(): void;
  seekTo(time: number): void;
  seekBackward(offset: number): void;
  seekForward(offset: number): void;
}

/** Default jump (seconds) for seek-forward/backward when the OS omits an offset. */
const DEFAULT_SEEK_OFFSET_SECONDS = 10;

export class MediaSessionController {
  /** Active forwarding target; null when nothing is playing. */
  private actions: MediaSessionActions | null = null;
  /** Platform action handlers are registered once, then re-target via `actions`. */
  private handlersBound = false;

  /** The live MediaSession, or null where the API is unavailable. */
  private get session(): MediaSession | null {
    if (typeof navigator === 'undefined') {
      return null;
    }
    return navigator.mediaSession ?? null;
  }

  /**
   * Announce a new now-playing track and bind the OS controls to `actions`.
   * Re-targets the (once-registered) platform handlers so the controls always
   * drive the most recently started track.
   */
  setNowPlaying(track: MediaSessionTrack, actions: MediaSessionActions): void {
    const session = this.session;
    if (!session) {
      return;
    }
    this.actions = actions;
    this.bindHandlers(session);
    session.metadata = this.buildMetadata(track);
    session.playbackState = 'playing';
  }

  /** Reflect play/pause state so the OS shows the right transport icon. */
  setPlaybackState(state: MediaSessionPlaybackState): void {
    const session = this.session;
    if (session) {
      session.playbackState = state;
    }
  }

  /**
   * Report the scrubber position. The OS extrapolates position from
   * `playbackRate`, so this only needs calling on play/pause/seek — not on a
   * timer. Skipped entirely when the duration is unknown (NaN/0), which is the
   * common case for open-ended streams.
   */
  setPositionState(duration: number, position: number, playbackRate = 1): void {
    const session = this.session;
    if (!session || typeof session.setPositionState !== 'function') {
      return;
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }
    const clamped = Math.min(Math.max(position, 0), duration);
    session.setPositionState({ duration, position: clamped, playbackRate: playbackRate || 1 });
  }

  /** Tear down the now-playing surface (track ended/stopped). */
  clear(): void {
    const session = this.session;
    if (!session) {
      return;
    }
    this.actions = null;
    session.metadata = null;
    session.playbackState = 'none';
    if (typeof session.setPositionState === 'function') {
      session.setPositionState();
    }
  }

  private buildMetadata(track: MediaSessionTrack): MediaMetadata | null {
    if (typeof MediaMetadata === 'undefined') {
      return null;
    }
    return new MediaMetadata({
      title: track.title,
      artist: track.artist ?? '',
      album: track.album ?? '',
      artwork: track.artwork ?? [],
    });
  }

  private bindHandlers(session: MediaSession): void {
    if (this.handlersBound) {
      return;
    }
    this.handlersBound = true;

    const set = (action: MediaSessionAction, handler: MediaSessionActionHandler): void => {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // The browser doesn't support this action — expected; nothing to do.
      }
    };

    set('play', () => this.actions?.play());
    set('pause', () => this.actions?.pause());
    set('stop', () => this.actions?.stop());
    set('seekto', (details) => {
      if (typeof details.seekTime === 'number') {
        this.actions?.seekTo(details.seekTime);
      }
    });
    set('seekbackward', (details) => {
      this.actions?.seekBackward(details.seekOffset ?? DEFAULT_SEEK_OFFSET_SECONDS);
    });
    set('seekforward', (details) => {
      this.actions?.seekForward(details.seekOffset ?? DEFAULT_SEEK_OFFSET_SECONDS);
    });
  }
}
