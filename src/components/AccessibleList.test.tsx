import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AccessibleList from './AccessibleList';
import Inventory from './inventory';
import type MudClient from '../client';
import { useItemsStore } from '../stores/itemsStore';

const initial = [{ id: 'a', name: 'Apple' }, { id: 'b', name: 'Apricot' }, { id: 'c', name: 'Banana' }];
const renderItem = (item: (typeof initial)[number]) => item.name;

describe('AccessibleList task selection', () => {
  it('retains identity during reorder and selects the sole survivor on replacement', () => {
    const selected = vi.fn();
    const { rerender } = render(<AccessibleList items={initial.slice(0, 2)} renderItem={renderItem} listId="items" labelledBy="label" onSelectedIndexChange={selected} />);
    screen.getByRole('listbox').focus();
    fireEvent.focus(screen.getByRole('listbox'));
    rerender(<AccessibleList items={[initial[1], initial[0]]} renderItem={renderItem} listId="items" labelledBy="label" onSelectedIndexChange={selected} />);
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
    expect(selected).toHaveBeenLastCalledWith(1);
    rerender(<AccessibleList items={[initial[1]]} renderItem={renderItem} listId="items" labelledBy="label" onSelectedIndexChange={selected} />);
    expect(screen.getByRole('option', { name: 'Apricot' })).toHaveAttribute('aria-selected', 'true');
    expect(selected).toHaveBeenLastCalledWith(0);
  });

  it('finds a buffered prefix while preserving repeated-letter cycling', () => {
    render(<AccessibleList items={initial} renderItem={renderItem} listId="items" labelledBy="label" />);
    const list = screen.getByRole('listbox');
    fireEvent.focus(list);
    fireEvent.keyDown(list, { key: 'a' });
    fireEvent.keyDown(list, { key: 'p' });
    fireEvent.keyDown(list, { key: 'p' });
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(list, { key: 'Home' });
    fireEvent.keyDown(list, { key: 'a' });
    expect(screen.getByRole('option', { name: 'Apricot' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(list, { key: 'a' });
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
  });

  it('synchronizes inventory actions and recovers focus when its focused action disappears', async () => {
    useItemsStore.getState().reset();
    const a = { id: 'a', name: 'Apple', location: 'inv', verbs: [['drop', 'a']] };
    const b = { id: 'b', name: 'Banana', location: 'inv', verbs: [['drop', 'b']] };
    useItemsStore.getState().setLocationItems('inv', [a, b]);
    render(<Inventory client={{ gmcp: { handlers: {} }, sendCommand: vi.fn() } as unknown as MudClient} />);
    const list = screen.getByRole('listbox');
    fireEvent.focus(list);
    screen.getByRole('button', { name: 'Drop Apple' }).focus();
    useItemsStore.getState().setLocationItems('inv', [b]);
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Drop Banana' })).toBeTruthy());
    await vi.waitFor(() => expect(list).toHaveFocus());
    screen.getByRole('button', { name: 'Drop Banana' }).focus();
    useItemsStore.getState().setLocationItems('inv', []);
    await vi.waitFor(() => expect(screen.getByRole('heading', { name: 'Inventory' })).toHaveFocus());
  });

  it('does not move surviving focus during a background inventory reorder', async () => {
    useItemsStore.getState().reset();
    const a = { id: 'a', name: 'Apple', location: 'inv', verbs: [['drop', 'a']] };
    const b = { id: 'b', name: 'Banana', location: 'inv', verbs: [['drop', 'b']] };
    useItemsStore.getState().setLocationItems('inv', [a, b]);
    render(<Inventory client={{ gmcp: { handlers: {} }, sendCommand: vi.fn() } as unknown as MudClient} />);
    fireEvent.focus(screen.getByRole('listbox'));
    const action = screen.getByRole('button', { name: 'Drop Apple' });
    action.focus();
    useItemsStore.getState().setLocationItems('inv', [b, a]);
    await vi.waitFor(() => expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true'));
    expect(action).toHaveFocus();
  });
});
