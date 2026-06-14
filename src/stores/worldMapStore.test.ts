import { beforeEach, describe, expect, it } from 'vitest';
import { useWorldMapStore } from './worldMapStore';

describe('worldMapStore', () => {
  beforeEach(() => {
    useWorldMapStore.getState().reset();
  });

  it('tracks current location and self id', () => {
    useWorldMapStore.getState().setLocation('#100');
    useWorldMapStore.getState().setSelf('#42');

    expect(useWorldMapStore.getState().locationId).toBe('#100');
    expect(useWorldMapStore.getState().selfId).toBe('#42');
  });

  it('sorts users and rooms by display name', () => {
    useWorldMapStore.getState().setUsers([
      { id: '#2', name: 'Bravo', locationId: '#20', idleSeconds: 0 },
      { id: '#1', name: 'Alpha', locationId: '#10', idleSeconds: null },
    ]);
    useWorldMapStore.getState().setRooms([
      { id: '#20', name: 'West Hall', exits: 'east #10' },
      { id: '#10', name: 'Atrium', exits: 'west #20' },
    ]);

    expect(useWorldMapStore.getState().users.map((user) => user.name)).toEqual([
      'Alpha',
      'Bravo',
    ]);
    expect(useWorldMapStore.getState().rooms.map((room) => room.name)).toEqual([
      'Atrium',
      'West Hall',
    ]);
  });
});
