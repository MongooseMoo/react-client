import { clearBrowserAwaySession } from '../awayV2';
import { readEnrollmentState } from '../browserInstallation';
import { currentBrowserPurpose, initializeBrowserPolicy, useBrowserPolicy } from '../browserPolicy';
import { revokeBrowserSession } from '../browserSessionLogout';
import { inbound, outbound } from '../protocol/messages';
import { useConnectionStore } from '../stores/connectionStore';
import { usePersonalDataStore } from '../stores/personalDataStore';
import { createTabSession, isSessionGrant, type SessionGrant } from '../tabSession';
import { gmcpJsonMessage } from './messages';
import { GMCPPackage } from './package';

const legacyToken = gmcpJsonMessage<'Token', string>('Token');
const legacyLogin = gmcpJsonMessage<'Login', never, string>('Login');
const sessionToken = gmcpJsonMessage<'SessionToken', unknown>('SessionToken');
const sessionStatus = gmcpJsonMessage<'SessionStatus', unknown>('SessionStatus');
interface SessionRequest {
  purpose: 'owner' | 'visitor';
  version: 2;
  sessionId: string;
  installationId: string;
  requestId: string;
  subscription?: PushSubscriptionJSON;
}
interface ResumeRequest extends SessionRequest { token: string; playerUuid: string; }
const session = gmcpJsonMessage<'Session', never, SessionRequest>('Session');
const resume = gmcpJsonMessage<'Resume', never, ResumeRequest>('Resume');
const logout = gmcpJsonMessage<'SessionLogout', never, ResumeRequest>('SessionLogout');

const GMCPAutoLoginBase = GMCPPackage.with({
  packageName: 'Auth.Autologin',
  messages: [inbound(legacyToken), outbound(legacyLogin), inbound(sessionToken),
    inbound(sessionStatus), outbound(session), outbound(resume), outbound(logout)] as const,
});

export class GMCPAutoLogin extends GMCPAutoLoginBase {
  override readonly packageVersion = 2;
  private readonly tab = createTabSession('https://mongoose.world');
  private epoch = 0;
  private pending?: { requestId: string; playerUuid: string; epoch: number };
  private confirmedUuid = '';
  private readonly unsubscribePolicy: () => void;

  constructor(client: ConstructorParameters<typeof GMCPAutoLoginBase>[0]) {
    super(client);
    // Legacy browser-wide refresh tokens remain unattributed and are not reused.
    this.on('sessionToken', (data) => this.handleSessionToken(data));
    this.on('sessionStatus', (data) => this.handleSessionStatus(data));
    this.unsubscribePolicy = useBrowserPolicy.subscribe((state, previous) => {
      if (!state.ready || state.policy.phase !== 'owner' || previous.policy.phase === 'owner') return;
      if (this.tab.grant?.purpose === 'visitor') this.signOut();
      else if (!this.confirmedUuid && this.client.connected) this.sendStoredLogin();
    });
  }

  sendStoredLogin(): void {
    if (!this.client.liveServer) return;
    const epoch = this.epoch;
    void this.tab.prepare().then(async () => {
      await initializeBrowserPolicy(this.tab.sessionId);
      if (epoch !== this.epoch || !this.client.liveServer || !this.client.connected || this.confirmedUuid) return;
      const grant = this.tab.grant;
      if (!grant) return;
      const policy = useBrowserPolicy.getState().policy;
      if (policy.phase === 'owner-paused' ||
          (policy.phase === 'visitor' && (policy.visitorSessionId !== this.tab.sessionId || grant.purpose !== 'visitor')) ||
          (policy.phase === 'owner' && grant.purpose === 'visitor')) return;
      const requestId = crypto.randomUUID();
      this.pending = { requestId, playerUuid: grant.playerUuid, epoch };
      this.sendResume({ ...this.request(requestId), token: grant.token, playerUuid: grant.playerUuid });
    }).catch(() => {
      useConnectionStore.getState().setStatusText('Sign in to choose a character');
    });
  }

  confirmPlayer(playerUuid: string): void {
    if (this.confirmedUuid === playerUuid || !playerUuid || !this.client.liveServer) return;
    this.confirmedUuid = playerUuid;
    // A successful resume names the character before returning its rotated grant.
    if (this.pending?.playerUuid === playerUuid) return;
    this.pending = undefined;
    const epoch = ++this.epoch;
    void this.tab.prepare().then(async () => {
      await initializeBrowserPolicy(this.tab.sessionId);
      if (epoch !== this.epoch || !this.client.connected || !this.client.liveServer || !this.tab.installationId) return;
      if (this.tab.grant && this.tab.grant.playerUuid !== playerUuid) this.tab.forgetGrant();
      const saved = await readEnrollmentState('https://mongoose.world', this.tab.installationId);
      if (epoch !== this.epoch || !this.client.connected || this.confirmedUuid !== playerUuid) return;
      const requestId = crypto.randomUUID();
      this.pending = { requestId, playerUuid, epoch };
      const request = this.request(requestId);
      this.sendSession({ ...request, ...(saved && request.purpose === 'owner' ? { subscription: saved.subscription } : {}) });
    }).catch(() => {
      useConnectionStore.getState().setStatusText('Connected; automatic resume is unavailable');
    });
  }

  private request(requestId: string): SessionRequest {
    return { version: 2, purpose: currentBrowserPurpose(this.tab.sessionId), sessionId: this.tab.sessionId, installationId: this.tab.installationId, requestId };
  }

  private handleSessionToken(data: unknown): void {
    const pending = this.pending;
    if (!pending || pending.epoch !== this.epoch || !isSessionGrant(data) ||
        data.requestId !== pending.requestId || data.playerUuid !== pending.playerUuid ||
        data.expires_at * 1000 <= Date.now() || !this.tab.save(data)) return;
    this.pending = undefined;
  }

  private handleSessionStatus(data: unknown): void {
    if (typeof data !== 'object' || data === null || !('requestId' in data) ||
        data.requestId !== this.pending?.requestId || !('status' in data)) return;
    this.pending = undefined;
    if (data.status === 'expired') this.tab.forgetGrant();
    useConnectionStore.getState().setStatusText(data.status === 'unavailable'
      ? 'Guest session; sign in to an account to remember this character'
      : data.status === 'connected'
      ? 'That character is already connected. Choose a character or reconnect deliberately.'
      : 'Sign in to choose a character');
  }

  get currentGrant(): SessionGrant | undefined {
    return this.confirmedUuid && this.tab.grant?.playerUuid !== this.confirmedUuid ? undefined : this.tab.grant;
  }
  get sessionId(): string { return this.tab.sessionId; }

  signOut(): void {
    const grant = this.tab.grant;
    if (grant && this.client.liveServer) void revokeBrowserSession(grant).catch(() => {
      useConnectionStore.getState().setStatusText('Signed out here; server sign-out could not be confirmed');
    });
    try {
      if (grant && this.client.connected && this.client.liveServer) {
        this.sendSessionLogout({ ...this.request(crypto.randomUUID()), token: grant.token, playerUuid: grant.playerUuid });
      }
    } finally {
      if (grant) void clearBrowserAwaySession('https://mongoose.world', grant.installationId, grant.playerUuid, grant.sessionId)
        .catch(() => console.error('Browser tab credentials could not be cleared'));
      usePersonalDataStore.getState().clear();
      this.tab.forgetGrant();
      this.reset();
      this.client.close();
    }
  }

  override reset(): void {
    this.epoch++;
    this.pending = undefined;
    this.confirmedUuid = '';
  }

  override shutdown(): void {
    this.unsubscribePolicy();
    this.reset();
    this.tab.dispose();
  }
}
