import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { expect, it, vi } from 'vitest';
import Tabs from './tabs';

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
