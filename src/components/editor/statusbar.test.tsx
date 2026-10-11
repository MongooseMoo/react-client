import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { EditorStatusBar } from './statusbar';

it('keeps changing feedback concise while reference and type stay visible outside the live region', () => {
  render(<EditorStatusBar id="editor-statusbar" docstate="Changed" diagnosticsSummary="2 MOO errors"
    session={{ reference: '#1:test', type: 'moo-code' }} />);
  const status = screen.getByRole('status');
  expect(status).toHaveTextContent('Changed');
  expect(status).toHaveTextContent('2 MOO errors');
  expect(status).not.toHaveTextContent('#1:test');
  expect(status).not.toHaveTextContent('moo-code');
  expect(screen.getByText('#1:test')).toBeInTheDocument();
});
