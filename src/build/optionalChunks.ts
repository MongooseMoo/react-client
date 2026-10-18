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

export function optionalChunks(bundle: ChunkGraph): Set<string> {
  const startup = new Set<string>();
  function visit(name: string) {
    if (startup.has(name)) return;
    const chunk = bundle[name];
    if (chunk?.type !== 'chunk') return;
    startup.add(name);
    chunk.imports.forEach(visit);
  }
  for (const [name, chunk] of Object.entries(bundle)) {
    if (chunk.type !== 'chunk') continue;
    // The PWA registration helper imports Workbox dynamically during startup.
    const isRegistration = chunk.moduleIds.some((id) =>
      id.replaceAll('\\', '/').includes('/node_modules/workbox-window/'),
    );
    if (chunk.isEntry || isRegistration) visit(name);
  }

  const optional = new Set<string>();
  for (const [name, chunk] of Object.entries(bundle)) {
    if (chunk.type !== 'chunk' || startup.has(name)) continue;
    optional.add(name);
  }
  return optional;
}
