import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AutoLogDialog, { type AutoLogDialogRef } from './AutoLogDialog';

vi.mock('../logging/AutoLogStore', () => ({
  autoLogStore: {
    deleteAll: vi.fn(async () => {}),
    deleteSession: vi.fn(async () => {}),
    getEntries: vi.fn(async () => []),
    listSessions: vi.fn(async () => []),
  },
}));

describe('native dialog methods in tests', () => {
  it('polyfills the native dialog methods jsdom does not implement', () => {
    expect(typeof HTMLDialogElement.prototype.showModal).toBe('function');
    expect(typeof HTMLDialogElement.prototype.close).toBe('function');
  });

  it('opens AutoLogDialog through the jsdom dialog polyfill', async () => {
    const ref = React.createRef<AutoLogDialogRef>();

    render(<AutoLogDialog ref={ref} />);

    await expect(
      act(async () => {
        ref.current?.open();
      })
    ).resolves.toBeUndefined();
  });

  it('fires close in a later task, as browsers do', async () => {
    const dialog = document.createElement('dialog');
    const closed = vi.fn();
    dialog.addEventListener('close', closed);
    dialog.showModal();
    dialog.close();
    expect(dialog.open).toBe(false);
    expect(closed).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(closed).toHaveBeenCalledOnce();
  });

  it('keeps AutoLogDialog open when reopened before the previous close event has arrived', async () => {
    const ref = React.createRef<AutoLogDialogRef>();
    render(<AutoLogDialog ref={ref} />);
    await act(async () => ref.current?.open());
    const dialog = screen.getByRole('dialog', { name: 'Autologs' });
    await act(async () => ref.current?.close());
    await act(async () => ref.current?.open());
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(dialog).toHaveAttribute('open');
  });
});
