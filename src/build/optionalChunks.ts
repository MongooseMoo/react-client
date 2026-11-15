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

/** Chunks every page load runs: the entries, the PWA registration helper and what they import statically. */
function startupChunks(bundle: ChunkGraph): Set<string> {
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
  return startup;
}

/** Packages that must only ever load on first use: three.js is for the 3D room view. */
export const LAZY_PACKAGES = ['three'];

/** `chunk: module` for each module of a lazy package that a startup chunk carries. */
export function lazyPackagesAtStartup(bundle: ChunkGraph, packages: readonly string[] = LAZY_PACKAGES): string[] {
  const leaks: string[] = [];
  for (const name of startupChunks(bundle)) {
    const chunk = bundle[name];
    if (chunk.type !== 'chunk') continue;
    for (const id of chunk.moduleIds) {
      const path = id.replaceAll('\\', '/');
      if (packages.some((p) => path.includes(`/node_modules/${p}/`))) leaks.push(`${name}: ${id}`);
    }
  }
  return leaks;
}

export function optionalChunks(bundle: ChunkGraph): Set<string> {
  const startup = startupChunks(bundle);
  const optional = new Set<string>();
  for (const [name, chunk] of Object.entries(bundle)) {
    if (chunk.type !== 'chunk' || startup.has(name)) continue;
    optional.add(name);
  }
  return optional;
}
