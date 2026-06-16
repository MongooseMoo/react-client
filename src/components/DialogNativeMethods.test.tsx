import React from 'react';
import { act, render } from '@testing-library/react';
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
});
