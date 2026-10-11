import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DbUploadDialog from './DbUploadDialog';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('database selection', () => {
  it('provides a keyboard button for choosing a custom database', () => {
    const { container } = render(<DbUploadDialog onDbSelected={vi.fn()} />);
    const input = container.querySelector('input[type=file]') as HTMLInputElement;
    const open = vi.spyOn(input, 'click');
    fireEvent.click(screen.getByRole('button', { name: 'Choose database' }));
    expect(open).toHaveBeenCalledOnce();
  });

  it('preserves the focused action and prevents repeat submission until boot finishes', async () => {
    let finish!: () => void;
    const onDbSelected = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
    render(<DbUploadDialog onDbSelected={onDbSelected} />);
    const action = screen.getByRole('button', { name: /Use default database/ });
    action.focus();
    fireEvent.click(action);
    await waitFor(() => expect(onDbSelected).toHaveBeenCalledOnce());
    expect(action).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Loading database');
    fireEvent.click(action);
    expect(onDbSelected).toHaveBeenCalledOnce();
    await act(async () => finish());
  });

  it('keeps selection available and explains a boot rejection', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
    render(<DbUploadDialog onDbSelected={async () => { throw new Error('Broken database'); }} />);
    const action = screen.getByRole('button', { name: /Use default database/ });
    action.focus();
    fireEvent.click(action);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Broken database'));
    expect(action).toHaveFocus();
    expect(action).toHaveAttribute('aria-disabled', 'false');
  });
});
