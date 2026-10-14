import { useEffect, useState } from 'react';
import type MudClient from '../client';
import { changeBrowserPolicy, disposeBrowserPolicy, initializeBrowserPolicy, refreshBrowserPolicy, useBrowserPolicy } from '../browserPolicy';
import { enrollBrowserNotifications, manageBrowserNotifications, MONGOOSE_SERVER_KEY, useBrowserNotifications,
  type BrowserNotificationContext } from '../browserNotifications';
import { getBrowserInstallationId, readEnrollmentState } from '../browserInstallation';
import { findBrowserAwayGrant, recipientMetadata } from '../awayV2';
import { refreshBrowserAwayGrant } from '../browserAway';
import { usePersonalDataStore } from '../stores/personalDataStore';

export default function BrowserSessions({ client }: { client?: MudClient }) {
  const state = useBrowserNotifications();
  const { policy, ready, error: policyError } = useBrowserPolicy();
  const visitorWindow = usePersonalDataStore(value => value.visitorWindow);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    void initializeBrowserPolicy().catch(() => setError('Browser session storage is unavailable; saved data stays paused'));
    return () => disposeBrowserPolicy();
  }, []);

  const run = (work: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError('');
    void work().catch(value => setError(value instanceof Error ? value.message : 'Browser session could not be updated'))
      .finally(() => setBusy(false));
  };
  const control = async (operation: string, kind?: string) => {
    const context = state.context;
    if (!context) throw new Error('Sign in to update this character’s browser settings');
    const next = await manageBrowserNotifications(context, operation, kind);
    if (useBrowserNotifications.getState().context === context) {
      useBrowserNotifications.setState({ context: next });
      if (operation === 'forget') client?.gmcp.require('Auth.Autologin').signOut();
    }
  };
  const beginVisit = async () => {
    if (!client?.connected || !client.liveServer) throw new Error('Connect and sign in before starting a visit');
    const auth = client.gmcp.require('Auth.Autologin');
    const grant = auth.currentGrant;
    if (!grant || grant.purpose === 'visitor') throw new Error('Sign in as the owner before starting a visit');
    const installationId = await getBrowserInstallationId();
    let context = useBrowserNotifications.getState().context;
    const saved = await readEnrollmentState(MONGOOSE_SERVER_KEY, installationId);
    if (!context && saved && !saved.profile.quiet) {
      const candidate = saved.profile.bindings.find(binding => binding.playerUuid === grant.playerUuid && binding.mode !== 'forgotten');
      if (candidate) {
        const authority = await findBrowserAwayGrant(candidate) ?? await refreshBrowserAwayGrant(candidate);
        if (authority) context = { recipient: recipientMetadata(authority), grant: authority,
          sessionId: authority.sessionId, profile: (await readEnrollmentState(MONGOOSE_SERVER_KEY, installationId))?.profile ?? saved.profile };
      }
      if (!context && saved.profile.bindings.some(binding => binding.enabled)) throw new Error('Reconnect a saved character to pause browser notifications before the visit');
    }
    if (context && !context.profile.quiet) await manageBrowserNotifications(context, 'quiet');
    const ownerPlayers = [...new Set([grant.playerUuid, ...(saved?.profile.bindings.map(binding => binding.playerUuid) ?? [])])];
    const sessionId = auth.sessionId;
    auth.signOut();
    await changeBrowserPolicy(policy, { phase: 'visitor', visitorSessionId: sessionId, ownerPlayers });
    client.connect();
  };
  const endVisit = async () => {
    if (client && visitorWindow) client.gmcp.require('Auth.Autologin').signOut();
    await changeBrowserPolicy(policy, { ...policy, phase: 'owner-paused' });
    if (client && visitorWindow) client.connect();
  };
  const resumeOwner = async () => {
    if (!client?.connected || !client.liveServer) throw new Error('Sign in as an owner to resume this browser');
    const grant = client.gmcp.require('Auth.Autologin').currentGrant;
    if (!grant || grant.purpose === 'visitor' || !policy.ownerPlayers.includes(grant.playerUuid)) throw new Error('Sign in as a previously saved character to resume this browser');
    await enrollBrowserNotifications(client, false, true);
    const context = useBrowserNotifications.getState().context;
    const saved = await readEnrollmentState(MONGOOSE_SERVER_KEY, grant.installationId);
    if (!context && saved?.profile.quiet && saved.profile.bindings.some(binding => binding.mode !== 'forgotten')) {
      throw new Error('Browser notifications are still paused. Allow notifications and reconnect this character before resuming');
    }
    if (context?.profile.quiet) {
      const next = await manageBrowserNotifications(context, 'resume');
      useBrowserNotifications.setState({ context: next });
    }
    await changeBrowserPolicy(policy, { phase: 'owner', visitorSessionId: '', ownerPlayers: policy.ownerPlayers });
    client.setBrowserNotificationContext(useBrowserNotifications.getState().context);
  };
  const binding = state.context?.profile.bindings.find(row => row.bindingId === state.context?.recipient.bindingId);
  const primary = state.context?.profile.bindings.find(row => row.primary);
  return <details className="browser-sessions">
    <summary>Browser sessions</summary>
    {(!ready || busy || state.busy) && <p role="status">Updating browser session…</p>}
    {(error || state.error || policyError) && <p role="alert">{error || state.error || policyError}</p>}
    {policyError && <button type="button" disabled={busy} onClick={() => run(async () => {
      await refreshBrowserPolicy();
      if (client) await enrollBrowserNotifications(client);
    })}>Retry browser storage</button>}
    {policy.phase === 'visitor' && <>
      <p>{visitorWindow ? 'Temporary visit: saved owner data and browser notifications are paused.' : 'A temporary visit is active in another tab. Saved data stays paused.'}</p>
      <button type="button" disabled={busy || !ready} onClick={() => run(endVisit)}>End temporary visit</button>
    </>}
    {policy.phase === 'owner-paused' && <>
      <p>The visit has ended. Sign in as an owner, then resume saved data and notifications.</p>
      <button type="button" disabled={busy || !ready} onClick={() => run(resumeOwner)}>Resume owner</button>
    </>}
    {policy.phase === 'owner' && <>
      <p>New tabs ask you to choose a character. Reloads resume the character selected in that tab.</p>
      {primary && <p>Primary notification character: {primary.label}</p>}
      <button type="button" disabled={!client?.connected || busy || state.busy || !ready} onClick={() => run(async () => { if (client) await enrollBrowserNotifications(client, true); })}>Enable browser notifications</button>
      {state.context && <fieldset disabled={busy}>
        <legend>This character’s browser notifications</legend>
        <label><input type="checkbox" checked={binding?.mode === 'retained'} onChange={event => run(() => control(event.currentTarget.checked ? 'retain' : 'unretain'))} />Keep receiving this character while I play another</label>
        <label><input type="checkbox" checked={!!state.context.profile.quiet} onChange={event => run(() => control(event.currentTarget.checked ? 'quiet' : 'resume'))} />Pause notifications in this browser</label>
        {binding?.stoppedKinds.includes('room') && <button type="button" onClick={() => run(() => control('resume-kind', 'room'))}>Resume room notifications</button>}
        <button type="button" onClick={() => run(() => control('forget'))}>Forget this character in this browser</button>
      </fieldset>}
      <button type="button" disabled={!client?.connected || busy || !ready} onClick={() => run(beginVisit)}>Begin temporary visit</button>
      <button type="button" disabled={!client || busy} onClick={() => client?.gmcp.require('Auth.Autologin').signOut()}>Sign out this tab</button>
    </>}
  </details>;
}
