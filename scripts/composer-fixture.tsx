import { h, render } from 'preact';
import JZZ from 'jzz';
import { Cacophony } from 'cacophony';
import MusicComposer from '../src/components/MusicComposer';
import { midiService } from '../src/MidiService';
import { virtualMidiService } from '../src/VirtualMidiService';
import { GMCPClientMidi } from '../src/gmcp/Client/Midi';
import { usePreferences } from '../src/stores/preferencesStore';
import { usePersonalDataStore } from '../src/stores/personalDataStore';
import type MudClient from '../src/client';

// A public JZZ software input exercises the real MidiService receipt path.
// Audio uses the real selected TinySynth backend and one existing engine context.
await JZZ({ engine: 'none' });
const keyboard = JZZ.Widget();
JZZ.addMidiIn('Composer browser keyboard', keyboard);
const context = new AudioContext();
const engine = new Cacophony(context);
const analyser = context.createAnalyser(); analyser.fftSize = 1024;
engine.getBus('master')!.input.connect(analyser);
const frames = new Float32Array(analyser.fftSize);
const sent: Array<[string, string]> = [];
const client = {
  gmcp: { handlers: {}, send: (name: string, body: string) => sent.push([name, body]) },
  media: { cacophony: engine, paused: false, subscribePlayback: () => () => {}, panicSequences: () => {},
    getMidiAudioOutput: () => ({ context, destination: engine.getBus('master')!.input }),
  },
} as unknown as MudClient;
const midi = new GMCPClientMidi(client);
client.gmcp.handlers['Client.Midi'] = midi;
usePreferences.getState().setMidi({ enabled: true, outputTimingCorrectionMs: 0 });
const probeOwner={ runtime: 'browser-probe', playerUuid: 'composer', playerRef: '#1' };
usePersonalDataStore.setState({ owner: probeOwner, policyReady: true, visitor: false });
await virtualMidiService.setAudioOutput({ context, destination: engine.getBus('master')!.input as unknown as AudioNode });
await midi.ensureInitialized();
if (!await midi.connectInputDevice('Composer browser keyboard') || !await midi.connectOutputDevice('virtual-synth')) throw new Error('Browser MIDI setup failed');
const target = document.createElement('main'); document.body.append(target);
render(h(MusicComposer, { client }), target);
Object.assign(window, { composerProbe: {
  context, engine, sent, keyboard,
  // Models connect()'s actual owner-clear and GMCP reset; this fixture opens no game socket.
  networkReset() { usePersonalDataStore.getState().clear(); midi.reset(); },
  confirmOwner() { usePersonalDataStore.getState().confirm(probeOwner); },
  manual(note:number,on:boolean) { midi.sendManualNote(note,on?100:0,on); },
  amplitude() { analyser.getFloatTimeDomainData(frames); return Math.max(...frames.map(Math.abs)); },
  destroy() { render(null, target); midi.shutdown(); return context.close(); },
} });
