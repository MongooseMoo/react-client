import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import PreferencesDialog, { type PreferencesDialogRef } from './PreferencesDialog';

const loading = vi.hoisted(() => {
  let resolve!: () => void;
  const ready = new Promise<void>(done => { resolve = done; });
  return { ready, resolve };
});

vi.mock('./preferences', async () => {
  await loading.ready;
  return { default: () => <button type="button" role="tab" aria-selected="true">General</button> };
});

afterEach(() => cleanup());

it('preserves user focus during loading and chooses the selected tab on a cached reopening', async () => {
  const ref = React.createRef<PreferencesDialogRef>();
  render(<PreferencesDialog ref={ref} />);
  await act(async () => ref.current?.open());
  const dialog = screen.getByRole('dialog');
  const close = screen.getByRole('button', { name: 'Close' });
  fireEvent.keyDown(close, { key: 'Tab' });
  close.focus();
  await act(async () => loading.resolve());
  await screen.findByRole('tab', { name: 'General' });
  expect(close).toHaveFocus();
  await act(async () => ref.current?.close());
  // Let the first showing's `close` event, which comes a task later, arrive.
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  expect(dialog).not.toHaveAttribute('open');
  await act(async () => ref.current?.open());
  await waitFor(() => expect(screen.getByRole('tab', { name: 'General' })).toHaveFocus());
  expect(dialog).toHaveAttribute('open');
  expect(dialog).not.toHaveAttribute('tabindex');
});

it('stays open when reopened before the previous close event has arrived', async () => {
  const ref = React.createRef<PreferencesDialogRef>();
  render(<PreferencesDialog ref={ref} />);
  await act(async () => ref.current?.open());
  const dialog = screen.getByRole('dialog');
  await act(async () => ref.current?.close());
  await act(async () => ref.current?.open());
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  expect(dialog).toHaveAttribute('open');
});

it('focuses settings once content is ready when the user has not started navigating', async () => {
  const ref = React.createRef<PreferencesDialogRef>();
  render(<PreferencesDialog ref={ref} />);
  await act(async () => ref.current?.open());
  await waitFor(() => expect(screen.getByRole('tab', { name: 'General' })).toHaveFocus());
});
