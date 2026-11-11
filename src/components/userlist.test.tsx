import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserlistPlayer } from '../mcp';
import { useUserlistStore } from '../stores/userlistStore';
import Userlist, { presenceText, shortDuration } from './userlist';

const NOW = 1794433000_000;

function person(id: string, name: string, extra: Partial<UserlistPlayer> = {}): UserlistPlayer {
  return { id, name, role: 'Player', rank: 2, idle: false, away: false, lastActive: NOW, connectedAt: null, ...extra };
}

describe('Players panel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
    useUserlistStore.getState().reset();
  });

  it('lists active players first, then idle, then away, each with role and status as text', () => {
    useUserlistStore.setState({
      you: '#1',
      players: [
        person('#3', 'Talon', { role: 'Wizard', idle: true, lastActive: NOW - 9 * 3_600_000 }),
        person('#4', 'Saeed', { away: true }),
        person('#2', 'zemmi'),
        person('#1', 'Q', { role: 'Wizard' }),
      ],
    });
    render(<Userlist client={{ sendCommand: vi.fn() }} />);
    expect(screen.getByRole('heading', { name: 'Players: 4 online, 2 active' })).toBeTruthy();
    const options = within(screen.getByRole('listbox', { name: 'Players: 4 online, 2 active' })).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'Q (you), Wizard, active',
      'zemmi, Player, active',
      'Talon, Wizard, idle 9 h',
      'Saeed, Player, away',
    ]);
  });

  it('keeps idle times current while open', () => {
    useUserlistStore.setState({ players: [person('#3', 'Talon', { idle: true, lastActive: NOW - 3 * 60_000 })] });
    render(<Userlist client={{ sendCommand: vi.fn() }} />);
    expect(screen.getByRole('option').textContent).toBe('Talon, Player, idle 3 min');
    act(() => { vi.advanceTimersByTime(2 * 60_000); });
    expect(screen.getByRole('option').textContent).toBe('Talon, Player, idle 5 min');
  });

  it("offers the server's actions on the selected player; a trailing space leaves the command to finish", () => {
    const sendCommand = vi.fn();
    useUserlistStore.setState({
      you: '#1',
      players: [person('#7', 'Saeed')],
      menu: [
        { label: 'Look at $(2)', command: 'look $(1)' },
        { label: 'Page $(2)', command: 'page $(1) ' },
      ],
    });
    render(<Userlist client={{ sendCommand }} />);
    fireEvent.focus(screen.getByRole('listbox'));
    const card = screen.getByRole('region', { name: 'Saeed' });
    fireEvent.click(within(card).getByRole('button', { name: 'Look at Saeed' }));
    expect(sendCommand).toHaveBeenCalledWith('look #7');
    fireEvent.click(within(card).getByRole('button', { name: 'Page Saeed' }));
    expect(sendCommand).toHaveBeenCalledTimes(1);
  });

  it('says plainly when nobody is listed', () => {
    render(<Userlist client={{ sendCommand: vi.fn() }} />);
    expect(screen.getByText('Nobody else is connected.')).toBeTruthy();
  });
});

describe('presence wording', () => {
  it('reads durations in the largest whole unit', () => {
    expect(shortDuration(59_000)).toBe('0 min');
    expect(shortDuration(3_600_000)).toBe('1 h');
    expect(shortDuration(24 * 3_600_000)).toBe('1 day');
    expect(shortDuration(50 * 3_600_000)).toBe('2 days');
  });

  it('says idle without a time when the server never said how long', () => {
    expect(presenceText(person('#1', 'A', { idle: true, lastActive: null }), NOW)).toBe('idle');
    expect(presenceText(person('#1', 'A', { idle: true, away: true, lastActive: NOW - 600_000 }), NOW)).toBe('away, idle 10 min');
  });
});
