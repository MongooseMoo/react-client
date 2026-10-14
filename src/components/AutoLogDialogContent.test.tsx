import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import AutoLogDialogContent from './AutoLogDialogContent';
import type { AutoLogSession } from '../logging/AutoLogTypes';
import { usePersonalDataStore } from '../stores/personalDataStore';

const mocks = vi.hoisted(() => ({
  sessions: [] as AutoLogSession[],
  getEntries: vi.fn().mockResolvedValue([]),
  deleteSession: vi.fn(),
  deleteAll: vi.fn(),
}));

vi.mock('../logging/AutoLogStore', () => ({ autoLogStore: {
  listSessions: async () => [...mocks.sessions],
  getEntries: mocks.getEntries,
  deleteSession: mocks.deleteSession,
  deleteAll: mocks.deleteAll,
} }));

beforeEach(() => {
  const owner = { runtime: 'fixture', playerUuid: 'a', playerRef: '#1' };
  usePersonalDataStore.setState({ policyReady: true, owner, visitor: false });
  mocks.sessions = Array.from({ length: 20 }, (_, index) => ({
    id: `session-${index}`, title: `Log ${index + 1}`, startedAt: index + 1000,
    owner,
    endedAt: index + 2000, lineCount: 0, byteEstimate: 0, sanitizedUrl: 'https://example.test', mode: 'default',
  } as AutoLogSession));
  mocks.getEntries.mockClear();
  mocks.getEntries.mockResolvedValue([]);
  mocks.deleteSession.mockImplementation(async (id: string) => { mocks.sessions = mocks.sessions.filter(session => session.id !== id); });
  mocks.deleteAll.mockImplementation(async () => { mocks.sessions = []; });
});

it('does not display an old request under a newly selected log', async () => {
  let finishFirst!: (entries: unknown[]) => void;
  mocks.getEntries.mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve; }))
    .mockResolvedValueOnce([{ sessionId: 'session-19', sequence: 0, timestamp: 1000,
      type: 'serverMessage', sourceType: 'system', sourceContent: 'Newest entries' }]);
  render(<AutoLogDialogContent isOpen />);
  const selector = await screen.findByRole('listbox', { name: 'Autolog sessions' });
  await act(async () => selector.focus());
  await act(async () => fireEvent.keyDown(selector, { key: 'End' }));
  await screen.findByText('Newest entries', { exact: false });
  await act(async () => finishFirst([{ sessionId: 'session-0', sequence: 0, timestamp: 1000,
    type: 'serverMessage', sourceType: 'system', sourceContent: 'Stale entries' }]));
  expect(screen.queryByText('Stale entries', { exact: false })).not.toBeInTheDocument();
  expect(screen.getByText('Newest entries', { exact: false })).toBeInTheDocument();
});
afterEach(() => cleanup());

it('hides foreign and unassigned archives until a deliberate legacy selection', async () => {
  const legacy = { ...mocks.sessions[0], id: 'legacy', title: 'Older unassigned', owner: undefined };
  const foreign = { ...mocks.sessions[0], id: 'foreign', title: 'Other character', owner: { runtime: 'fixture', playerUuid: 'b', playerRef: '#2' } };
  mocks.sessions = [mocks.sessions[0], legacy, foreign];
  render(<AutoLogDialogContent isOpen />);
  await screen.findByRole('listbox', { name: 'Autolog sessions' });
  expect(screen.queryByText('Other character')).not.toBeInTheDocument();
  expect(screen.queryByText('Older unassigned')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Show older unassigned logs' }));
  await screen.findByRole('option', { name: /Older unassigned/ });
  await act(async () => usePersonalDataStore.getState().setVisitor(true));
  expect(screen.queryByText('Older unassigned')).not.toBeInTheDocument();
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});

it('reaches the twentieth log with End and Enter without row-action Tab stops', async () => {
  render(<AutoLogDialogContent isOpen />);
  const selector = await screen.findByRole('listbox', { name: 'Autolog sessions' });
  await act(async () => selector.focus());
  await act(async () => fireEvent.keyDown(selector, { key: 'End' }));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Log 20' })).toBeInTheDocument());
  expect(screen.getAllByRole('button')).toHaveLength(6);
  fireEvent.keyDown(selector, { key: 'Enter' });
  expect(screen.getByRole('heading', { name: 'Log 20' })).toHaveFocus();
});

it('returns to the surviving selector after deleting the current log', async () => {
  render(<AutoLogDialogContent isOpen />);
  const selector = await screen.findByRole('listbox', { name: 'Autolog sessions' });
  await act(async () => selector.focus());
  const remove = await screen.findByRole('button', { name: 'Delete log "Log 1"' });
  remove.focus();
  fireEvent.click(remove);
  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));
  await waitFor(() => expect(screen.queryByRole('option', { name: /Log 1 / })).not.toBeInTheDocument());
  await waitFor(() => expect(selector).toHaveFocus());
  expect(screen.getByRole('heading', { name: 'Log 2' })).toBeInTheDocument();
});

it('returns to Refresh after deleting the last log and leaves cancellation nondestructive', async () => {
  mocks.sessions = mocks.sessions.slice(0, 1);
  render(<AutoLogDialogContent isOpen />);
  const selector = await screen.findByRole('listbox', { name: 'Autolog sessions' });
  await act(async () => selector.focus());
  const remove = await screen.findByRole('button', { name: 'Delete log "Log 1"' });
  fireEvent.click(remove);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(mocks.sessions).toHaveLength(1);
  fireEvent.click(remove);
  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Refresh' })).toHaveFocus());
  expect(screen.getByText('No autolog sessions have been saved.')).toBeInTheDocument();
});
