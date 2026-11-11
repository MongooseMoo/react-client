import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserlistStore } from '../../stores/userlistStore';
import { McpSession } from '../session';
import { McpVmooUserlist } from './userlist';

// Captured from mongoose.world as a guest on 2026-11-11 (channels-todo/wire_proof.py).
const LOGIN = [
  '#$#dns-com-vmoo-userlist-you k1 nr: #2280',
  '#$#dns-com-vmoo-userlist k1 icons*: "" fields*: "" d*: "" _data-tag: 577658545885034478036875',
  '#$#dns-com-vmoo-userlist-menu k1 menu: "{{\\"&Look at $(2)\\", \\"look $(1)\\"}, {\\"&Page $(2)\\", \\"page $(1) \\"}, {\\"&Wave at $(2)\\", \\"wave $(1)\\"}, 0, {\\"&Join $(2)\\", \\"@join $(1)\\"}, {\\"&Invite $(2)\\", \\"@invite $(1)\\"}, 0, {\\"W&ho $(2)\\", \\"@who $(1)\\"}}"',
  '#$#dns-com-vmoo-userlist-friends k1 friends: "{#2, #180, #133, #733, #729, #2030, #2032, #2262, #249, #2259, #2298, #2299}"',
  '#$#* 577658545885034478036875 fields: {"Object", "Name", "Icon", "FirstConnectTime", "LastConnectTime", "Idle"}',
  '#$#* 577658545885034478036875 icons: {"Guest", "Player", "Programmer", "Schooled", "President", "Builder", "Wizard"}',
  '#$#* 577658545885034478036875 d: ={{#2280, "Solaris Guest", 1, 2147483647, 2147483647, 12}, {#249, "Q", 7, 1128798341, 1794432191, 12}, {#2261, "Zemmi", 3, 1150690530, 1794429456, 1524}, {#3487, "Talon", 7, 1674296735, 1794401742, 35445}}',
  '#$#* 577658545885034478036875 d: <{#2261, #3487}',
];
const TAG = '577658545885034478036875';
const NOW = 1794433000_000;

function loggedIn() {
  const session = new McpSession({ sendLine: () => {} }, () => 'k1');
  session.registerPackage(McpVmooUserlist);
  session.receiveLine('#$#MCP version: 2.1 to: 2.1');
  for (const line of LOGIN) session.receiveLine(line);
  return session;
}

const player = (id: string) => useUserlistStore.getState().players.find((p) => p.id === id);

describe('dns-com-vmoo-userlist', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
    useUserlistStore.getState().reset();
  });

  it('reads the login list: names, roles, idle marks, idle time and connect time', () => {
    loggedIn();
    const state = useUserlistStore.getState();
    expect(state.you).toBe('#2280');
    expect(state.players.map((p) => p.id)).toEqual(['#2280', '#249', '#2261', '#3487']);
    expect(player('#249')).toEqual({
      id: '#249', name: 'Q', role: 'Wizard', rank: 7, idle: false, away: false,
      lastActive: NOW - 12_000, connectedAt: 1794432191_000,
    });
    expect(player('#3487')).toMatchObject({ idle: true, lastActive: NOW - 35445_000 });
    expect(player('#2280')).toMatchObject({ role: 'Guest', connectedAt: null });
  });

  it('reads the menu without separators or shortcut marks', () => {
    loggedIn();
    expect(useUserlistStore.getState().menu).toEqual([
      { label: 'Look at $(2)', command: 'look $(1)' },
      { label: 'Page $(2)', command: 'page $(1) ' },
      { label: 'Wave at $(2)', command: 'wave $(1)' },
      { label: 'Join $(2)', command: '@join $(1)' },
      { label: 'Invite $(2)', command: '@invite $(1)' },
      { label: 'Who $(2)', command: '@who $(1)' },
    ]);
  });

  it('keeps idle and away through a changed entry, as the server sends one before marking idle', () => {
    const session = loggedIn();
    session.receiveLine(`#$#* ${TAG} d: [{#3487}`);
    session.receiveLine(`#$#* ${TAG} d: *{#3487, "Talon the Bold", 7, 1674296735, 1794401742, 35500}`);
    expect(player('#3487')).toMatchObject({ name: 'Talon the Bold', idle: true, away: true, lastActive: NOW - 35500_000 });
  });

  it('marks a returning player active from now', () => {
    const session = loggedIn();
    vi.setSystemTime(NOW + 5_000);
    session.receiveLine(`#$#* ${TAG} d: >{#2261}`);
    expect(player('#2261')).toMatchObject({ idle: false, lastActive: NOW + 5_000 });
  });

  it('adds a connecting player once, even if they were already listed', () => {
    const session = loggedIn();
    session.receiveLine(`#$#* ${TAG} d: +{#249, "Q", 7, 1128798341, 1794432999, 0}`);
    session.receiveLine(`#$#* ${TAG} d: +{#7576, "Saeed", 3, 1684986628, 1794096537, 0}`);
    const ids = useUserlistStore.getState().players.map((p) => p.id);
    expect(ids.filter((id) => id === '#249')).toHaveLength(1);
    expect(ids).toContain('#7576');
  });

  it('removes players who leave or cloak', () => {
    const session = loggedIn();
    session.receiveLine(`#$#* ${TAG} d: -{#2261}`);
    session.receiveLine(`#$#* ${TAG} d: ({#3487}`);
    expect(useUserlistStore.getState().players.map((p) => p.id)).toEqual(['#2280', '#249']);
  });
});
