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
- Measured in headless Chromium (follow-up branch): the rebuild disposed the old room's materials before drawing the new room, so three.js deleted every shared shader program and compiled them all again each frame: 25 ms of work per frame for 8 people on a GTX 1050 Ti (30 fps), almost all in `getProgramInfoLog`. The effect now disposes the old room after the new one is drawn: 2.2 ms for 8 people, 3.3 ms for 40, 60 fps. Harness: `tests/visual/avatars/` (`node tests/visual/avatars/shoot.mjs <dir> [--gpu]`), tests only, not in the build.

- Looked at by eye (follow-up branch, headless screenshots in the hub's `reports/player-avatars-shots/`). Bugs fixed: the 3D hair cap leaned forward and covered the face for curly/coily hair; it was shifted back so straight hair let the forehead poke through; the hairline outline was a level ring across the eyes; earrings floated beside the head and strap/temple ends poked out; the portrait drew pupils, nose, mouth, marks and features in the seam ink, which was white on fair skin when the clothes were dark (now `colours.faceInk`, black or white against the skin); portrait earrings hung below the ear over the page background; a cheek scar touched the glasses; medium/long hair behind the portrait head was a box (now rounded); black hair vanished on the dark page (portraits now sit on a fixed mid-grey disc, `PORTRAIT_BACKDROP`, 3:1 against black and white hair). Tests in `src/map/figureMesh.test.ts` and `portrait.test.tsx`. Matters of taste listed for Q in the work log, unchanged.

## Looks round (branch `avatar-looks`, work log `reports/player-avatars-client-looks-2026-11-15.md` in the hub)

- Live records send hair, eyes, build and label but no skin and no garments. A described person without them is drawn in `NEUTRAL_SKIN` (#b9b0a6) and `NEUTRAL_CLOTHING` (#4b5262), in portrait, figure and plan token alike (`figure.ts`); only a person with no appearance map keeps the plain base-colour figure (`FigureParams.described`). `tokenColours` returns the figure's own torso and head colours.
- Player card: wraps its buttons below name and label in the narrow side panel.
- 3D zoom: OrbitControls' `dollyIn(s)` multiplies distance by `s`; `+` uses `ZOOM_STEP` 0.87. `dollhouseMaxDistance` fits large rooms; the wheel zooms to the pointer; Your eyes zooms by field of view (`zoomedFov`). Keyboard `+`/`-` in the Dollhouse slide to your own face and step closer (`panTo`, `zoomFocus`); nothing else can be chosen from the keyboard.
- Portrait crops to the head below 48 px. 3D faces: mouth (face ink), brows (hair colour), eyes seated. Facial hair cut from the head ellipsoid (`shell`); stubble is `overlayHex(skin, hair, STUBBLE_OPACITY)`. Medium/long hair is a two-sided falling shell; wavy/curly/coily raise the hair surface (`textured`), the hairline outline follows it. Eyepatch strap is a ring on the head. Portrait hides ears under a head garment. Every seam between two different colours under 3:1 is outlined, whatever the hues (a hue test was tried and removed: hue-only differences fail for red-green colour blindness); bands are thin lines close to the body (`BAND_HEIGHT` 6 mm, 3% out), and there is a new `jawline` seam for beards. Wings are an extruded wing outline; horns and antlers `HORN_TONE` (the wire has no colour for traits).
- Parts carry names (`figureParts(p)`), so tests find parts by name rather than colour. Face strokes use 1x6 capsules (`stroke`) to stay under the 5,000-triangle budget.
- Frame cost after the round (GTX 1050 Ti): 8 people 2.1 ms, 40 people 3.5 ms per frame (2.3 / 3.7 before).
- npm ci in a new worktree: `npm ci --userconfig <file containing min-release-age=14>` (Q's allowed method, 2026-11-14), when no checkout has an identical lockfile to copy from.

## Next step

Looks round committed on `avatar-looks` (PR 241); CI on it. Open for Q (work log): hood vs hat needs a garment kind on the wire; wings and tails have no wire colour; choosing another person from the keyboard does not exist yet.

Earlier: PR 237 merged. Follow-up branch `avatar-followup` (work log `reports/player-avatars-client-followup-2026-11-14.md` in the hub): features on the 3D figure (done); a build check that three.js stays out of startup (done: `lazyPackagesAtStartup` in `src/build/optionalChunks.ts`, called by the `optional-feature-precache` plugin in `vite.config.ts`, fails the build; the production build had three.js only in the lazy `RoomLayout3D` chunk); browser frame cost (done, fixed a per-frame shader recompile); looking by eye (done, bugs fixed). Remaining: CI on the follow-up PR; Q's taste decisions in the work log.
