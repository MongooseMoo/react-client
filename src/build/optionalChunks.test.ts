import { describe, expect, it } from 'vitest';
import { type ChunkGraph, optionalChunks } from './optionalChunks';

function chunk(moduleIds: string[], imports: string[] = [], isEntry = false) {
  return { type: 'chunk' as const, moduleIds, imports, isEntry };
}

describe('optional feature precaching', () => {
  it('excludes every non-startup chunk without relying on filenames or packages', () => {
    const bundle: ChunkGraph = {
      'assets/main-123.js': chunk(['/app/src/index.tsx'], [], true),
      'assets/decoder-456.js': chunk(['/app/node_modules/mediabunny/dist/modules/src/input.js']),
      'assets/reverb-789.js': chunk([
        '/app/node_modules/cacophony/dist/bundles/dattorro-reverb-bundle.js_url.mjs',
      ]),
      'assets/stream-abc.js': chunk([
        'C:\\app\\node_modules\\cacophony\\dist\\webCodecsStream.mjs',
      ]),
      'assets/editor-def.js': chunk(['/app/node_modules/monaco-editor/index.js']),
      'logo.svg': { type: 'asset' },
    };
    expect([...optionalChunks(bundle)].sort()).toEqual([
      'assets/decoder-456.js',
      'assets/editor-def.js',
      'assets/reverb-789.js',
      'assets/stream-abc.js',
    ]);
  });

  it('preserves audio code statically required by any entry, including shared chunks', () => {
    const bundle: ChunkGraph = {
      'main.js': chunk(['/app/src/main.ts'], ['shared.js'], true),
      'shared.js': chunk(['/app/src/shared.ts'], ['media.js']),
      'media.js': chunk(['/app/node_modules/mediabunny/dist/index.js'], ['shared.js']),
      'secondary.js': chunk(['/app/node_modules/cacophony/dist/webCodecsStream.mjs'], [], true),
    };
    expect([...optionalChunks(bundle)]).toEqual([]);
  });

  it('preserves the dynamically imported PWA registration helper and its dependencies', () => {
    const bundle: ChunkGraph = {
      'main.js': chunk(['/app/src/main.ts'], [], true),
      'register.js': chunk(['C:\\app\\node_modules\\workbox-window\\build\\workbox-window.prod.es5.mjs'], ['shared.js']),
      'shared.js': chunk(['/app/src/shared.ts']),
      'feature.js': chunk(['/app/src/feature.ts'], ['shared.js']),
    };
    expect([...optionalChunks(bundle)]).toEqual(['feature.js']);
  });
});
