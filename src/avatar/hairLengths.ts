/**
 * The game's hair length bands (`$appearance.hair_lengths`, read live 2026-11-16 with
 * `ops/moo-agent moo ';$appearance.hair_lengths'`): name, lowest and highest cm the game sets
 * for the band (0 means no upper end). The game names a length by the first band whose highest
 * it is under; 0.0 is bald, and the game then sends no `hair` at all. The figure, the portrait
 * and the tests all take the bands from here.
 */
export const HAIR_LENGTHS = [
  ["shaved", 0.5, 1.5],
  ["cropped", 2.5, 5.0],
  ["short", 8.0, 13.0],
  ["chin-length", 18.0, 24.0],
  ["shoulder-length", 30.0, 40.0],
  ["long", 50.0, 65.0],
  ["waist-length", 75.0, 0.0],
] as const;
