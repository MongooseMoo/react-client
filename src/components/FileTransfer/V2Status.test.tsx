import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { OwnerService } from '../../fileSharing/ownerService';
import V2Status from './V2Status';
import PendingTransfer from './PendingTransfer';
describe('Phase 1 file consent and export accessibility', () => {
  it('includes the immutable file, sender, size and IP warning in the decision group', () => {
    render(
      <PendingTransfer
        filename="private.txt"
        size={42}
        senderLabel="Alice"
        onAccept={() => {}}
        onReject={() => {}}
        warning="Accepting exposes your IP address to this player."
      />,
    );
    expect(screen.getByRole('group', { name: /private.txt.*42.*Alice.*IP address/ })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Accept private.txt from Alice' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Reject private.txt from Alice' })).toBeVisible();
  });
  it('requires a named Save action and keeps a focused Save again action after qualified handoff', async () => {
    const listeners = new Set<() => void>();
    let details = [{ key: 'v2:offer', outcome: 'verified', canSave: true }];
    let notice = '';
    const discard = vi.fn(async () => {
      details = [];
      notice = 'private.txt: downloaded file discarded.';
      for (const f of listeners) f();
    });
    const save = vi.fn(async () => {
      details = [{ key: 'v2:offer', outcome: 'browser-download', canSave: true }];
      for (const f of listeners) f();
    });
    const service = {
      status: '',
      get retentionNotice() {
        return notice;
      },
      durable: true,
      details: () => details,
      transfers: () => [{ key: 'v2:offer', name: 'private.txt' }],
      save,
      discard,
      subscribeStatus: (f: () => void) => {
        listeners.add(f);
        return () => listeners.delete(f);
      },
    } as unknown as OwnerService;
    function Panel() {
      const heading = useRef<HTMLHeadingElement>(null);
      return (
        <>
          <h3 ref={heading} tabIndex={-1}>
            Files
          </h3>
          <V2Status service={service} refuge={heading} />
        </>
      );
    }
    render(<Panel />);
    expect(save).not.toHaveBeenCalled();
    const button = screen.getByRole('button', { name: 'Save private.txt' });
    button.focus();
    fireEvent.click(button);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save private.txt again' })).toHaveFocus(),
    );
    expect(screen.getByText(/private.txt: handed to the browser.*24 hours/)).toBeVisible();
    expect(save).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Save private.txt' })).not.toBeInTheDocument();
    const discardButton = screen.getByRole('button', { name: 'Discard private.txt' });
    discardButton.focus();
    fireEvent.click(discardButton);
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Save private.txt again' }),
      ).not.toBeInTheDocument(),
    );
    expect(discard).toHaveBeenCalledWith('v2:offer');
    expect(screen.getByRole('heading', { name: 'Files' })).toHaveFocus();
    expect(screen.getByText(notice)).toHaveAttribute('role', 'status');
  });
});
