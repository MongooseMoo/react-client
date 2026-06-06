import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EditorToolbar from './toolbar';

describe('EditorToolbar access keys', () => {
  it('keeps Alt+S / Alt+R / Alt+D bound to Save, Revert, and Download', () => {
    render(<EditorToolbar onSave={vi.fn()} onRevert={vi.fn()} onDownload={vi.fn()} />);

    const save = screen.getByRole('button', { name: /save/i });
    const revert = screen.getByRole('button', { name: /revert/i });
    const download = screen.getByRole('button', { name: /download/i });

    expect(save.getAttribute('accesskey')).toBe('s');
    expect(revert.getAttribute('accesskey')).toBe('r');
    expect(download.getAttribute('accesskey')).toBe('d');

    // Titles advertise the shortcut so the binding is discoverable.
    expect(save.getAttribute('title')).toBe('Save (Alt+S)');
    expect(revert.getAttribute('title')).toBe('Revert (Alt+R)');
    expect(download.getAttribute('title')).toBe('Download (Alt+D)');
  });
});
