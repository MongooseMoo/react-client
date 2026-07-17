import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import HistorySearch from './HistorySearch';

describe('HistorySearch', () => {
  const history = ['look north', 'say hello', 'look south'];
  // Most recent first, like CommandHistory.search
  const search = vi.fn((query: string) =>
    [...history].reverse().filter((c) => c.toLowerCase().includes(query.toLowerCase())),
  );
  const onAccept = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSearch = () =>
    render(<HistorySearch search={search} onAccept={onAccept} onCancel={onCancel} />);

  it('renders a labeled combobox with a listbox of matches and takes focus', () => {
    renderSearch();

    const combobox = screen.getByRole('combobox', { name: 'Search command history' });
    expect(document.activeElement).toBe(combobox);
    expect(combobox.getAttribute('aria-expanded')).toBe('true');
    expect(combobox.getAttribute('aria-autocomplete')).toBe('list');

    const listbox = screen.getByRole('listbox');
    expect(combobox.getAttribute('aria-controls')).toBe(listbox.id);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('marks the first match active via aria-activedescendant and aria-selected', () => {
    renderSearch();

    const combobox = screen.getByRole('combobox');
    const options = screen.getAllByRole('option');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(options[0].id);
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(options[1].getAttribute('aria-selected')).toBe('false');
  });

  it('filters matches as the user types and announces the count', () => {
    renderSearch();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'look' } });

    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['look south', 'look north']);
    expect(screen.getByText('2 matching commands')).toBeTruthy();
  });

  it('announces when nothing matches and collapses the popup', () => {
    renderSearch();

    const combobox = screen.getByRole('combobox');
    fireEvent.change(combobox, { target: { value: 'zzz' } });

    expect(combobox.getAttribute('aria-expanded')).toBe('false');
    expect(combobox.getAttribute('aria-activedescendant')).toBeNull();
    expect(screen.getByText('No matching commands')).toBeTruthy();
  });

  it('moves the highlight with ArrowDown and ArrowUp, wrapping at the ends', () => {
    renderSearch();

    const combobox = screen.getByRole('combobox');
    const options = screen.getAllByRole('option');

    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(combobox.getAttribute('aria-activedescendant')).toBe(options[1].id);

    fireEvent.keyDown(combobox, { key: 'ArrowUp' });
    fireEvent.keyDown(combobox, { key: 'ArrowUp' });
    expect(combobox.getAttribute('aria-activedescendant')).toBe(options[2].id);
  });

  it('cycles to the next match on repeated Ctrl+R', () => {
    renderSearch();

    const combobox = screen.getByRole('combobox');
    const options = screen.getAllByRole('option');

    fireEvent.keyDown(combobox, { key: 'r', ctrlKey: true });
    expect(combobox.getAttribute('aria-activedescendant')).toBe(options[1].id);
  });

  it('accepts the highlighted match on Enter', () => {
    renderSearch();

    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'Enter' });

    expect(onAccept).toHaveBeenCalledWith('say hello');
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels instead of accepting when Enter is pressed with no matches', () => {
    renderSearch();

    const combobox = screen.getByRole('combobox');
    fireEvent.change(combobox, { target: { value: 'zzz' } });
    fireEvent.keyDown(combobox, { key: 'Enter' });

    expect(onAccept).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it('cancels on Escape', () => {
    renderSearch();

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('accepts a match on mouse selection', () => {
    renderSearch();

    fireEvent.mouseDown(screen.getAllByRole('option')[2]);

    expect(onAccept).toHaveBeenCalledWith('look north');
  });

  it('keeps the highlight in range when the match list shrinks', () => {
    renderSearch();

    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.change(combobox, { target: { value: 'say' } });

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(combobox.getAttribute('aria-activedescendant')).toBe(options[0].id);
  });
});
