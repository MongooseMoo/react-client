import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AccessibleList from './AccessibleList';
import Inventory from './inventory';
import type MudClient from '../client';
import { useItemsStore } from '../stores/itemsStore';

const initial = [{ id: 'a', name: 'Apple' }, { id: 'b', name: 'Apricot' }, { id: 'c', name: 'Banana' }];
const renderItem = (item: (typeof initial)[number]) => item.name;

describe('AccessibleList with the selection held by its caller', () => {
  const list = (selectedId: string | null, onSelect: (id: string) => void, items = initial) =>
    <AccessibleList items={items} renderItem={renderItem} listId="items" labelledBy="label" selectedId={selectedId} onSelect={onSelect} />;
  const selectedNames = () => screen.getAllByRole('option').filter((option) => option.getAttribute('aria-selected') === 'true').map((option) => option.textContent);

  it('shows the given selection and reports a choice without making it itself', () => {
    const onSelect = vi.fn();
    const { rerender } = render(list('b', onSelect));
    expect(selectedNames()).toEqual(['Apricot']);
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-activedescendant', 'items-item-b');
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
    expect(onSelect).toHaveBeenLastCalledWith('c');
    expect(selectedNames()).toEqual(['Apricot']);
    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(onSelect).toHaveBeenLastCalledWith('a');
    rerender(list('a', onSelect));
    expect(selectedNames()).toEqual(['Apple']);
  });

  it('selects nothing when the selection is elsewhere or gone, and never takes focus for a change it did not make', () => {
    const onSelect = vi.fn();
    const { rerender } = render(list('b', onSelect));
    rerender(list('elsewhere', onSelect));
    expect(selectedNames()).toEqual([]);
    rerender(list(null, onSelect, [initial[0], initial[2]]));
    expect(selectedNames()).toEqual([]);
    expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-activedescendant');
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).not.toHaveFocus();
  });

  it('on focus, or on Down, with nothing selected goes to the place it last held', () => {
    const onSelect = vi.fn();
    const { rerender } = render(list('b', onSelect));
    rerender(list(null, onSelect, [initial[0], initial[2]]));
    fireEvent.focus(screen.getByRole('listbox'));
    expect(onSelect).toHaveBeenLastCalledWith('c');
    onSelect.mockClear();
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
    expect(onSelect).toHaveBeenLastCalledWith('c');
  });
});

describe('AccessibleList task selection', () => {
  it('selects the clicked option when first entering the list with a pointer', () => {
    const selected = vi.fn();
    render(<AccessibleList items={initial} renderItem={renderItem} listId="items" labelledBy="label" onSelectedIndexChange={selected} />);
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
    expect(selected).toHaveBeenLastCalledWith(2);
  });

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

  it('keeps the inventory on the one shared selection, both ways', () => {
    useItemsStore.getState().reset();
    const a = { id: 'a', name: 'Apple', location: 'inv', verbs: [['drop', 'a']] };
    const b = { id: 'b', name: 'Banana', location: 'inv', verbs: [['drop', 'b']] };
    useItemsStore.getState().setLocationItems('inv', [a, b]);
    const client = { gmcp: { handlers: {} }, sendCommand: vi.fn() };
    render(<Inventory client={client as unknown as MudClient} />);
    expect(screen.queryByRole('button', { name: /^Drop/ })).toBeNull();

    act(() => useItemsStore.getState().select('b'));
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'Drop Banana' })).toBeTruthy();
    expect(screen.getByRole('listbox')).not.toHaveFocus();

    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(useItemsStore.getState().selected).toEqual({ id: 'a' });
    expect(screen.getByRole('button', { name: 'Drop Apple' })).toBeTruthy();
    expect(client.sendCommand).not.toHaveBeenCalled();
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
