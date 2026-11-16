import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import type MudClient from '../client';
import { TEST_CHARACTERS } from '../avatar/characters.fixture';
import PlayerCard from './PlayerCard';
import Toolbar from './toolbar';
import CommandInput from './input';

it('keeps player shortcuts distinct from application actions and prefills named commands', () => {
  const inputRef = React.createRef<HTMLTextAreaElement>();
  const client = { media: { muted: false, paused: false, subscribePlayback: () => () => {}, setGlobalMute: vi.fn(), setGlobalVolume: vi.fn() } } as unknown as MudClient;
  const { container } = render(<>
    <Toolbar client={client} onClearLog={vi.fn()} onSaveLog={vi.fn()} onCopyLog={vi.fn()} onToggleSidebar={vi.fn()} onOpenPrefs={vi.fn()} />
    <PlayerCard player={{ name: 'alice', fullname: 'Alice' }} onLook={vi.fn()} onFollow={vi.fn()} />
    <CommandInput onSend={vi.fn()} inputRef={inputRef} />
  </>);
  const bindings = Array.from(container.querySelectorAll('[accesskey]')).map((element) => element.getAttribute('accesskey')!.toLowerCase());
  expect(new Set(bindings).size).toBe(bindings.length);
  // Alt+H, M, V and T read status aloud.
  expect(bindings.filter((key) => 'hmvt'.includes(key))).toEqual([]);
  fireEvent.click(screen.getByRole('button', { name: 'Page Alice' }));
  expect(screen.getByRole('textbox', { name: 'Command' })).toHaveValue('page alice ');
  expect(screen.getByRole('textbox', { name: 'Command' })).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Say to Alice' }));
  expect(screen.getByRole('textbox', { name: 'Command' })).toHaveValue('-alice ');
  expect(screen.getByRole('textbox', { name: 'Command' })).toHaveFocus();
});

it('shows the layout portrait as decoration and the server label as text, adding no focus stop', () => {
  const plain = render(<PlayerCard player={{ name: 'alice', fullname: 'Alice' }} onLook={vi.fn()} onFollow={vi.fn()} />);
  expect(plain.container.querySelector('svg')).toBeNull();
  plain.unmount();

  const { container } = render(
    <PlayerCard player={{ name: 'alice', fullname: 'Alice' }} appearance={TEST_CHARACTERS[0].appearance} onLook={vi.fn()} onFollow={vi.fn()} />,
  );
  const portrait = container.querySelector('svg.player-portrait');
  expect(portrait?.getAttribute('aria-hidden')).toBe('true');
  expect(portrait?.getAttribute('focusable')).toBe('false');
  expect(screen.getByText('the red-haired woman')).toBeTruthy();
  expect(container.querySelectorAll('button, [tabindex]')).toHaveLength(4);
});
