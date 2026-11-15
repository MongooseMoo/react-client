# Player avatars in the web client

## Goal

Q, 2026-11-14: "Great-looking player avatars, driven from a system in the moo for automatic descriptions, except revised and made much more comprehensive?" On short labels computed against the people present: "yes I do absolutely think we should compute the labels against those in the room". The server computes the label; the client shows it as text.

This branch is the client half: draw each person from the `appearance` map the MOO will send in GMCP `Room.Layout` (a 3D figure, an SVG portrait, coloured plan tokens) and show the server's `label`. The wire contract is in `docs/room-layout.md` (`things[].appearance`). The MOO side (`$appearance`, `#3964:layout_data`) is separate work in the hub.

## State

- `src/gmcp/Room.ts`: `LayoutThing.appearance` and its types.
- `src/avatar/` (no three.js): `colour.ts` (hex checks, WCAG contrast, outline ink), `figure.ts` (appearance to figure parameters, plan token colours, label), `portrait.tsx` (decorative SVG head and shoulders).
- `src/map/figureMesh.ts`: the 3D figure, primitives merged into one mesh with vertex colours; imported only by `roomScene.ts` (lazy 3D chunk).
- `roomScene.ts` builds every person, arrivals included, with it; `RoomLayoutView` passes each entity's Client.Spatial forward (`facings`) to the 3D view.
- Plan tokens: `rl-dressed` class and `--rl-body`/`--rl-head` custom properties on the person's group; forced-colors rules extended.
- People list: portrait plus `name (label), place`. `PlayerCard`: portrait and label, the layout person found by name (`layoutPersonNamed`).
- Tests: `src/avatar/figure.test.ts`, `portrait.test.tsx`, twelve invented characters in `characters.fixture.ts`; updated `roomScene.test.ts`, `RoomLayoutView.test.tsx`, `PlayerCard.test.tsx`, `roomLayout.test.ts`. The fixture player once named after a real character is now "Ondine"; the same name in `RoomInfoDisplay.test.tsx`, `createConfiguredClient.test.ts` and `spatialStore.test.ts` is now "Marlow". Other test files still use it (AppsPanel, userlist, useChannelHistory, Spatial, sessionStore, roomStore, messages, userlist MCP); not asked for in this round.
- Measured in Vitest (node, jsdom): 40 figures built in about 145-150 ms; 1,802 to 2,702 triangles per figure, 80,266 for 40.
- Figure geometry is reused between rebuilds: `FigureCache` in `figureMesh.ts`, keyed by the figure parameters, owned by the 3D view's stage. Position and facing are on the mesh. Meshes with a kept geometry carry `userData.keptGeometry`, so `disposeRoomScene` leaves the geometry to the cache. Each build ends with `sweep()`, which frees figures nobody used (a person who left or changed), and the stage disposes the cache on unmount. Rebuild with unchanged appearances: 8 people 27.5-28.3 ms before, 1.25-1.30 ms after; 40 people 134-137 ms before, 2.25-2.37 ms after.

## Decisions and why

- Merged primitives, one mesh and one draw call per person, no downloaded models: zero assets, no licences, cheap draw calls (research report section 2).
- Every fill is a colour the appearance supplied, except: the person/you colour when skin is missing, plain cloth grey for a garment without a colour, and the outline ink. No colour is computed (no greying by age), so words and picture cannot disagree.
- A seam between two different colours under 3:1 gets a thin outline band (3D); the portrait outlines every region in the ink.
- Facing defaults to south without a forward, so faces show in the dollhouse's starting view.
- Portrait in the People list and `PlayerCard` only; `aria-hidden`, `focusable="false"`, no focus stop. The label is plain text.
- `features` is in the MOO record but not in the Contract's Wire list, so it is not in the type; the portrait's features come from `face`.

## Surprises

- `npm ci` in a fresh worktree fails with `EALLOWSCRIPTS` while preparing the git dependency `@xrnavigation/webaudio-tinysynth` (user-level npm `allow-scripts` is passed to the nested install). `node_modules` was copied from a worktree with an identical lockfile.
- The 3D room is rebuilt on every animation frame while anyone moves (`RoomLayout3D.tsx` rebuild effect), so figure build time was paid per frame: about 3.7 ms per figure in node. Fixed by reusing figure geometry (above); the rest of the room is still rebuilt.

## Next step

PR review and CI. Then `appearance.features` (team-lead, 2026-11-14). The MOO must send `appearance` before anything changes for players.
