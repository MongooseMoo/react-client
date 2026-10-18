import type { Bus, Cacophony } from 'cacophony';
import type { SynthAudioOutput } from '../VirtualMidiService';

export interface MidiRoute {
  readonly chain?: string;
  readonly send?: number;
}

export function decodeMidiRoute(raw: unknown): MidiRoute {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new TypeError('Client.Midi.Route must be an object');
  const { chain, send } = raw as { chain?: unknown; send?: unknown };
  if (chain !== undefined && (typeof chain !== 'string' || chain.length > 128))
    throw new TypeError('Client.Midi.Route.chain must be a string of at most 128 characters');
  if (
    send !== undefined &&
    (typeof send !== 'number' || !Number.isFinite(send) || send < 0 || send > 1 || !chain)
  )
    throw new TypeError('Client.Midi.Route.send requires a chain and a number within 0..1');
  return {
    chain: typeof chain === 'string' ? chain || undefined : undefined,
    send: typeof send === 'number' ? send : undefined,
  };
}

/** One lazily allocated input for both browser synthesizers, owned by MediaService. */
export class MidiAudioRoute {
  private bus: Bus | undefined;
  private route: MidiRoute = {};
  private readonly connected = new Set<Bus>();
  constructor(
    private readonly cacophony: Cacophony,
    private readonly getChain: (id: string) => Bus | undefined,
  ) {}

  getOutput(): SynthAudioOutput {
    if (!this.bus) {
      this.bus = this.cacophony.createBus();
      const master = this.cacophony.getBus('master');
      if (master) this.connected.add(master); // createBus auto-connects to master.
      this.apply();
    }
    return {
      context: this.cacophony.context as unknown as BaseAudioContext,
      destination: this.bus.input as unknown as AudioNode,
    };
  }

  setRoute(route: MidiRoute): void {
    this.route = route;
    this.apply();
  }
  chainCreated(id: string): void {
    if (this.route.chain === id) this.apply();
  }
  chainDestroying(id: string): void {
    if (this.route.chain === id) this.apply(true);
  }

  private apply(dry = false): void {
    if (!this.bus) return;
    const master = this.cacophony.getBus('master');
    if (!master) return;
    const target = !dry && this.route.chain ? this.getChain(this.route.chain) : undefined;
    // Remove both previous paths before a chain is destroyed: an aux send
    // must never be drained onto master and double the dry signal.
    for (const bus of this.connected) this.bus.disconnect(bus);
    this.connected.clear();
    const connect = (bus: Bus, gain?: number) => {
      this.bus?.connect(bus, gain);
      this.connected.add(bus);
    };
    if (!target || target === master) connect(master);
    else if (this.route.send === undefined) connect(target);
    else {
      connect(master);
      connect(target, this.route.send);
    }
  }

  reset(): void {
    this.route = {};
    this.apply();
  }
  shutdown(): void {
    this.bus?.destroy();
    this.bus = undefined;
    this.route = {};
    this.connected.clear();
  }
}
