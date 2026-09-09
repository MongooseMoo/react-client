/** The part of Rollup's output graph needed to distinguish startup code. */
export type ChunkGraph = Record<
  string,
  | { type: 'asset' }
  | {
      type: 'chunk';
      isEntry: boolean;
      imports: string[];
      moduleIds: string[];
    }
>;

export function optionalAudioChunks(bundle: ChunkGraph): Set<string> {
  const startup = new Set<string>();
  function visit(name: string) {
    if (startup.has(name)) return;
    const chunk = bundle[name];
    if (chunk?.type !== 'chunk') return;
    startup.add(name);
    chunk.imports.forEach(visit);
  }
  for (const [name, chunk] of Object.entries(bundle)) {
    if (chunk.type === 'chunk' && chunk.isEntry) visit(name);
  }

  const optional = new Set<string>();
  for (const [name, chunk] of Object.entries(bundle)) {
    if (chunk.type !== 'chunk' || startup.has(name)) continue;
    const containsAudio = chunk.moduleIds.some((id) => {
      const path = id.replaceAll('\\', '/');
      return (
        path.includes('/node_modules/mediabunny/') ||
        path.includes('/node_modules/cacophony/dist/bundles/') ||
        /\/node_modules\/cacophony\/dist\/webCodecsStream\.[cm]?js(?:\?|$)/.test(path)
      );
    });
    if (containsAudio) optional.add(name);
  }
  return optional;
}
