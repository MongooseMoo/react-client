import { create } from 'zustand';
import { readBrowserPolicy, saveBrowserPolicy, type BrowserPolicy } from './browserInstallation';
import { usePersonalDataStore } from './stores/personalDataStore';

interface BrowserPolicyState {
  ready: boolean;
  policy: BrowserPolicy;
  error: string;
}
export const useBrowserPolicy = create<BrowserPolicyState>(() => ({ ready: false, error: '',
  policy: { revision: 0, phase: 'owner', visitorSessionId: '', ownerPlayers: [] } }));
let channel: BroadcastChannel | undefined;
let starting: Promise<void> | undefined;
let sessionId = '';
let generation = 0;

function apply(policy: BrowserPolicy): void {
  const current = useBrowserPolicy.getState();
  if (current.ready && policy.revision < current.policy.revision) return;
  useBrowserPolicy.setState({ policy, ready: true, error: '' });
  usePersonalDataStore.getState().setVisitor(policy.phase !== 'owner');
  usePersonalDataStore.setState({ policyReady: true, visitorWindow: policy.phase === 'visitor' && policy.visitorSessionId === sessionId });
}

export async function initializeBrowserPolicy(tabSessionId = ''): Promise<void> {
  const initializingGeneration = generation;
  if (tabSessionId) sessionId = tabSessionId;
  if (tabSessionId) usePersonalDataStore.setState({ gameSessionId: tabSessionId });
  if (!starting) {
    const epoch = generation;
    starting = (async () => {
      const policy = await readBrowserPolicy();
      if (epoch !== generation) return;
      apply(policy);
      if (typeof BroadcastChannel !== 'undefined' && !channel) {
        channel = new BroadcastChannel('mongoose:browser-policy:v1');
        channel.onmessage = () => { void refreshBrowserPolicy().catch(() => {}); };
      }
    })().catch(error => { if (epoch === generation) starting = undefined; throw error; });
  }
  await starting;
  if (initializingGeneration !== generation) return;
  apply(useBrowserPolicy.getState().policy);
}

export async function refreshBrowserPolicy(): Promise<void> {
  const epoch = generation;
  try {
    const policy = await readBrowserPolicy();
    if (epoch === generation) apply(policy);
  } catch (error) {
    if (epoch === generation) {
      useBrowserPolicy.setState({ ready: false, error: 'Browser session policy could not be refreshed; saved data stays paused' });
      usePersonalDataStore.setState({ policyReady: false, visitor: true, visitorWindow: false });
    }
    throw error;
  }
}

export function disposeBrowserPolicy(): void {
  generation++;
  channel?.close(); channel = undefined; starting = undefined; sessionId = '';
  useBrowserPolicy.setState({ ready: false, error: '' });
  usePersonalDataStore.setState({ policyReady: false });
}

export async function changeBrowserPolicy(expected: BrowserPolicy, next: Omit<BrowserPolicy, 'revision'>): Promise<void> {
  const epoch = generation;
  const saved = await saveBrowserPolicy(expected.revision, next);
  if (epoch !== generation) return;
  apply(saved);
  channel?.postMessage({ revision: saved.revision });
}

/** Editor purpose is immutable: an owner's dirty editor never becomes a
 * visitor editor merely because the game tab reuses its session identifier. */
export function canUseBrowserWindow(policy: BrowserPolicy, tabSessionId: string, purpose: 'owner' | 'visitor'): boolean {
  return purpose === 'visitor'
    ? policy.phase === 'visitor' && !!tabSessionId && policy.visitorSessionId === tabSessionId
    : policy.phase === 'owner';
}

export function currentBrowserPurpose(tabSessionId: string): 'owner' | 'visitor' {
  const policy = useBrowserPolicy.getState().policy;
  return policy.phase === 'visitor' && policy.visitorSessionId === tabSessionId ? 'visitor' : 'owner';
}
