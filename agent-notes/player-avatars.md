# Player avatars in the web client

## Goal

Q, 2026-11-14: "Great-looking player avatars, driven from a system in the moo for automatic descriptions, except revised and made much more comprehensive?" On short labels computed against the people present: "yes I do absolutely think we should compute the labels against those in the room". The server computes the label; the client shows it as text.

This branch is the client half: draw each person from the `appearance` map the MOO will send in GMCP `Room.Layout` (a 3D figure, an SVG portrait, coloured plan tokens) and show the server's `label`. The wire contract is in `docs/room-layout.md` (`things[].appearance`). The MOO side (`$appearance`, `#3964:layout_data`) is separate work in the hub.

## State

Built and on pull request 237 (MongooseMoo/react-client), CI pending at the last push. Client work is complete; nothing changes for players until the MOO sends `appearance` in `Room.Layout`.

- `src/gmcp/Room.ts`: `LayoutThing.appearance` and its types, `features` included.
- `src/avatar/` (no three.js): `colour.ts` (hex checks, WCAG contrast, outline ink), `figure.ts` (appearance to figure parameters, plan token colours, label), `portrait.tsx` (decorative SVG head and shoulders).
- `src/map/figureMesh.ts`: the 3D figure, primitives merged into one mesh with vertex colours; imported only by `roomScene.ts` (lazy 3D chunk).
- `roomScene.ts` builds every person, arrivals included, with it; `RoomLayoutView` passes each entity's Client.Spatial forward (`facings`) to the 3D view.
- Plan tokens: `rl-dressed` class and `--rl-body`/`--rl-head` custom properties on the person's group; forced-colors rules extended.
- People list: portrait plus `name (label), place`. `PlayerCard`: portrait and label, the layout person found by name (`layoutPersonNamed`).
- Tests: `src/avatar/figure.test.ts`, `portrait.test.tsx`, twelve invented characters in `characters.fixture.ts`; updated `roomScene.test.ts`, `RoomLayoutView.test.tsx`, `PlayerCard.test.tsx`, `roomLayout.test.ts`. The fixture player once named after a real character is now "Ondine"; the same name in `RoomInfoDisplay.test.tsx`, `createConfiguredClient.test.ts` and `spatialStore.test.ts` is now "Marlow". The eight other test files that used it (AppsPanel, userlist, useChannelHistory, Client/Spatial, sessionStore, roomStore, protocol/messages, MCP userlist) now use "Marlow" too. Then, at team-lead's word: the other MCP userlist names became "Wayfarer Guest", "Pellam" and "Corvin", the same names in `AppsPanel.test.tsx` and `userlist.test.tsx` changed with them, and `#249`/`players/249/#` became `#7741`/`players/7741/#` (`TasksPanel.test.tsx` too, whose owner "q" became "marlow"). The owner "daiverd" in `TasksPanel.test.tsx` is now "tamsin". Left as they are, by team-lead's decision: the other object numbers in the userlist fixture (#2280, #2261, #3487, the friends list) and the example "#249" in the doc comment at `src/mcp/packages/userlist.ts:13`.
- Measured in Vitest (node, jsdom): 40 figures built in about 145-150 ms; 1,802 to 2,702 triangles per figure, 80,266 for 40.
- Figure geometry is reused between rebuilds: `FigureCache` in `figureMesh.ts`, keyed by the figure parameters, owned by the 3D view's stage. Position and facing are on the mesh. Meshes with a kept geometry carry `userData.keptGeometry`, so `disposeRoomScene` leaves the geometry to the cache. Each build ends with `sweep()`, which frees figures nobody used (a person who left or changed), and the stage disposes the cache on unmount. Rebuild with unchanged appearances: 8 people 27.5-28.3 ms before, 1.25-1.30 ms after; 40 people 134-137 ms before, 2.25-2.37 ms after.

## Decisions and why

- Merged primitives, one mesh and one draw call per person, no downloaded models: zero assets, no licences, cheap draw calls (research report section 2).
- Every fill is a colour the appearance supplied, except: the person/you colour when skin is missing, plain cloth grey for a garment without a colour, and the outline ink. No colour is computed (no greying by age), so words and picture cannot disagree.
- A seam between two different colours under 3:1 gets a thin outline band (3D); the portrait outlines every region in the ink.
- Facing defaults to south without a forward, so faces show in the dollhouse's starting view.
- Portrait in the People list and `PlayerCard` only; `aria-hidden`, `focusable="false"`, no focus stop. The label is plain text.
- `appearance.features` (a list of string keys) was added to the wire by team-lead on 2026-11-14, after the first commit. The portrait draws freckles, glasses, sunglasses, eyepatch, earrings, mole and dimples in the outline ink (features carry no colour); other keys are ignored, and a hidden face shows none. Follow-up branch `avatar-followup`: the 3D figure draws glasses, sunglasses, an eyepatch and earrings in the same ink, inside the one merged mesh (features are in the parameters, so in the cache key); freckles, mole and dimples are too small at figure size and stay portrait-only (said in `docs/room-layout.md`).

## Surprises

- `npm ci` in a fresh worktree fails with `EALLOWSCRIPTS` while preparing the git dependency `@xrnavigation/webaudio-tinysynth`. Cause on this machine, not in the repo: `~/.npmrc` sets `allow-scripts`; npm 11.19.1 exports every non-default config to child processes as `npm_config_*` (`@npmcli/config/lib/set-envs.js`), and the git dependency's nested `npm install` reads that env value as the `--allow-scripts` flag, which `lib/utils/resolve-allow-scripts.js` refuses in project installs. CI has no user config. Stopgap: copy `node_modules` from a checkout with byte-identical `package.json` and `package-lock.json`.
- The 3D room is rebuilt on every animation frame while anyone moves (`RoomLayout3D.tsx` rebuild effect), so figure build time was paid per frame: about 3.7 ms per figure in node. Fixed by reusing figure geometry (above); the rest of the room is still rebuilt.

## Next step

PR 237 merged. Follow-up branch `avatar-followup` (work log `reports/player-avatars-client-followup-2026-11-14.md` in the hub): features on the 3D figure (done), then a build check that three.js stays out of the startup chunk, a browser measurement of frame cost, and looking at the figures by eye.
