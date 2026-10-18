import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { useEffect } from 'react';
import { expect, it, vi } from 'vitest';
import Tabs, { type TabsRef } from './tabs';

it('moves focus to the first control Tab can reach when asked to focus the panel', () => {
  const ref = React.createRef<TabsRef>();
  render(<Tabs ref={ref} tabs={[
    { id: 'main', label: 'Main', content: <span>Main content</span> },
    { id: 'files', label: 'Files', content: <>
      <button type="button" disabled>Disabled</button>
      <button type="button" tabIndex={-1}>Skipped</button>
      <div hidden><button type="button">Hidden</button></div>
      <input aria-label="Filter" />
      <button type="button">Send</button>
    </> },
  ]} />);
  act(() => { ref.current?.selectTab('files', 'panel'); });
  expect(screen.getByRole('textbox', { name: 'Filter' })).toHaveFocus();
  screen.getByRole('button', { name: 'Send' }).focus();
  act(() => { ref.current?.selectTab('files', 'panel'); });
  expect(screen.getByRole('textbox', { name: 'Filter' })).toHaveFocus();
});

it('moves focus from the panel to its first control when lazy content arrives', async () => {
  const ref = React.createRef<TabsRef>();
  let resolve!: () => void;
  const loaded = new Promise<void>((done) => { resolve = done; });
  const Lazy = React.lazy(async () => {
    await loaded;
    return { default: () => <button type="button">Pause</button> };
  });
  render(<Tabs ref={ref} tabs={[
    { id: 'main', label: 'Main', content: <button type="button">Refresh</button> },
    { id: 'diag', label: 'Diagnostics', mountOnSelect: true,
      content: <React.Suspense fallback={<span>Loading</span>}><Lazy /></React.Suspense> },
  ]} />);
  act(() => { ref.current?.selectTab('diag', 'panel'); });
  expect(screen.getByRole('tabpanel')).toHaveFocus();
  await act(async () => { resolve(); await loaded; });
  await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Pause' })).toHaveFocus());
});

it('leaves focus alone when it moves away before lazy content arrives', async () => {
  const ref = React.createRef<TabsRef>();
  let resolve!: () => void;
  const loaded = new Promise<void>((done) => { resolve = done; });
  const Lazy = React.lazy(async () => {
    await loaded;
    return { default: () => <button type="button">Pause</button> };
  });
  render(<><button type="button">Elsewhere</button><Tabs ref={ref} tabs={[
    { id: 'main', label: 'Main', content: <button type="button">Refresh</button> },
    { id: 'diag', label: 'Diagnostics', mountOnSelect: true,
      content: <React.Suspense fallback={<span>Loading</span>}><Lazy /></React.Suspense> },
  ]} /></>);
  act(() => { ref.current?.selectTab('diag', 'panel'); });
  screen.getByRole('button', { name: 'Elsewhere' }).focus();
  await act(async () => { resolve(); await loaded; });
  await screen.findByRole('button', { name: 'Pause' });
  expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
});

it('focuses a panel with no controls itself, and keeps tab focus for clicks', () => {
  const ref = React.createRef<TabsRef>();
  render(<Tabs ref={ref} tabs={[
    { id: 'main', label: 'Main', content: <button type="button">Refresh</button> },
    { id: 'info', label: 'Info', content: <span>Room information</span> },
  ]} />);
  act(() => { ref.current?.selectTab('info', 'panel'); });
  expect(screen.getByRole('tabpanel')).toHaveFocus();
  fireEvent.click(screen.getByRole('tab', { name: 'Main' }));
  expect(screen.getByRole('tab', { name: 'Main' })).toHaveFocus();
});

it('preserves selected panel and focus when earlier tabs arrive or disappear', () => {
  const users = { id: 'users', label: 'Users', content: <button type="button">User action</button> };
  const room = { id: 'room', label: 'Room', content: <span>Room information</span> };
  const audio = { id: 'audio', label: 'Audio', content: <span>Audio content</span> };
  const { rerender } = render(<Tabs tabs={[users, audio]} />);
  screen.getByRole('button', { name: 'User action' }).focus();
  rerender(<Tabs tabs={[room, users, audio]} />);
  expect(screen.getByRole('tab', { name: 'Users' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('button', { name: 'User action' })).toHaveFocus();
  fireEvent.click(screen.getByRole('tab', { name: 'Audio' }));
  rerender(<Tabs tabs={[users, audio]} />);
  expect(screen.getByRole('tab', { name: 'Audio' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
});

it('selects a surviving tab and restores meaningful focus when the selected tab is removed', async () => {
  const first = { id: 'first', label: 'First', content: <span>First content</span> };
  const optional = { id: 'optional', label: 'Optional', content: <button type="button">Optional action</button> };
  const { rerender } = render(<Tabs tabs={[first, optional]} />);
  fireEvent.click(screen.getByRole('tab', { name: 'Optional' }));
  screen.getByRole('button', { name: 'Optional action' }).focus();
  rerender(<Tabs tabs={[first]} />);
  expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('tabindex', '0');
  await vi.waitFor(() => expect(screen.getByRole('tab', { name: 'First' })).toHaveFocus());
});

it('makes static panel text reachable without adding a stop before existing controls', async () => {
  const { rerender } = render(<Tabs tabs={[{ id: 'main', label: 'Main', content: <span>Room information</span> }]} />);
  expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0');
  rerender(<Tabs tabs={[{ id: 'main', label: 'Main', content: <button type="button">Refresh</button> }]} />);
  await vi.waitFor(() => expect(screen.getByRole('tabpanel')).not.toHaveAttribute('tabindex'));
});

it('mounts optional panels on first selection and keeps them mounted when hidden', () => {
  const mounted = vi.fn();
  const unmounted = vi.fn();
  function Feature() {
    useEffect(() => { mounted(); return unmounted; }, []);
    return <span>Transfer controls</span>;
  }
  render(<Tabs tabs={[
    { id: 'main', label: 'Main', content: <span>Main content</span> },
    { id: 'files', label: 'Files', content: <Feature />, mountOnSelect: true },
  ]} />);
  expect(mounted).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
  expect(mounted).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole('tab', { name: 'Main' }));
  expect(unmounted).not.toHaveBeenCalled();
  expect(screen.getByText('Transfer controls')).not.toBeVisible();
});
