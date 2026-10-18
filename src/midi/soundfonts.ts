/** MIDI.js sample collections; no samples or renderer code are imported here. */
export const soundfonts = [
  {
    id: 'MusyngKite',
    directory: 'MusyngKite',
    name: 'Musyng Kite',
    description: 'Rich, detailed acoustic instruments.',
  },
  {
    id: 'FluidR3',
    directory: 'FluidR3_GM',
    name: 'FluidR3',
    description: 'A balanced General MIDI collection.',
  },
  {
    id: 'FatBoy',
    directory: 'FatBoy',
    name: 'FatBoy',
    description: 'A bold, full-bodied instrument collection.',
  },
] as const;

export type SoundfontId = (typeof soundfonts)[number]['id'];
export const SOUNDFONT_OUTPUT = 'soundfont-synth';

export function getSoundfont(id: unknown) {
  return soundfonts.find((font) => font.id === id) ?? soundfonts[0];
}
