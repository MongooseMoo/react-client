import type { Bus, Cacophony } from 'cacophony';
import { describe, expect, it, vi } from 'vitest';
import { decodeMidiRoute, MidiAudioRoute } from './MidiAudioRoute';

function setup() {
  const master = { name: 'master' } as Bus;
  const target = { name: 'room' } as Bus;
  const bus = { input: {}, connect: vi.fn(), disconnect: vi.fn(), destroy: vi.fn() };
  const engine = { context: {}, createBus: vi.fn(() => bus), getBus: () => master };
  const chains = new Map([['room', target]]);
  const route = new MidiAudioRoute(engine as unknown as Cacophony, (id) => chains.get(id));
  return { route, master, target, bus, engine, chains };
}

describe('MIDI effects routing', () => {
  it('does not create an audio graph until MIDI needs it', () => {
    const { route, engine, bus, target } = setup();
    route.setRoute({ chain: 'room' });
    expect(engine.createBus).not.toHaveBeenCalled();
    route.getOutput();
    expect(bus.connect).toHaveBeenLastCalledWith(target, undefined);
  });

  it('routes through a named chain and restores one dry path when it is removed', () => {
    const { route, bus, target, master, chains } = setup();
    route.getOutput();
    route.setRoute({ chain: 'room' });
    expect(bus.disconnect).toHaveBeenCalledWith(master);
    expect(bus.connect).toHaveBeenLastCalledWith(target, undefined);
    route.chainDestroying('room');
    expect(bus.disconnect).toHaveBeenLastCalledWith(target);
    expect(bus.connect).toHaveBeenLastCalledWith(master, undefined);
    chains.delete('room');
    chains.set('room', target);
    route.chainCreated('room');
    expect(bus.connect).toHaveBeenLastCalledWith(target, undefined);
  });

  it('removes an aux send before chain destruction so its drain cannot double dry audio', () => {
    const { route, bus, target, master } = setup();
    route.getOutput();
    route.setRoute({ chain: 'room', send: 0.4 });
    expect(bus.connect).toHaveBeenLastCalledWith(target, 0.4);
    route.chainDestroying('room');
    expect(bus.disconnect).toHaveBeenCalledWith(target);
    expect(bus.connect).toHaveBeenLastCalledWith(master, undefined);
    route.reset();
    route.shutdown();
    expect(bus.destroy).toHaveBeenCalledOnce();
  });

  it('waits dry for a late chain and automatically joins it', () => {
    const { route, chains, bus, master, target } = setup();
    chains.clear();
    route.getOutput();
    route.setRoute({ chain: 'room' });
    expect(bus.connect).toHaveBeenLastCalledWith(master, undefined);
    chains.set('room', target);
    route.chainCreated('room');
    expect(bus.connect).toHaveBeenLastCalledWith(target, undefined);
  });

  it('validates the GMCP boundary before anything reaches the graph', () => {
    expect(decodeMidiRoute({ chain: 'room', send: 0 })).toEqual({ chain: 'room', send: 0 });
    expect(decodeMidiRoute({})).toEqual({ chain: undefined, send: undefined });
    for (const raw of [
      null,
      [],
      'room',
      { chain: 12 },
      { send: 0.5 },
      { chain: 'room', send: NaN },
      { chain: 'room', send: 2 },
    ])
      expect(() => decodeMidiRoute(raw)).toThrow();
  });
});
