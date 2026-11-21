# Room text names: bound names in the transcript are links

## Goal

Q approved ("Make it so!"): in a room description sent as an HTML line, a name
the server has bound to a thing (`<a class="thing" data-thing="#29612">portable
radio</a>`, or several ids for a grouped phrase) is a link in the transcript.
Activating it selects the thing (items store `select`), shows the Room tab and
moves focus to the list (Things or People) holding it. It never sends a command
and never changes the input. If none of its ids is here any more, nothing is
selected, focus stays, and the app's announcer says it is no longer here.
Telnet is unchanged. Client only; the server side is switched on after this is
deployed.

## State

Built and committed on `feat/room-text-names` (2026-11-20), not pushed. Each
test was written first and seen failing. Run locally: only the test files
below, by path, and `npx tsc --noEmit` (clean). The whole suite, Playwright,
the visual harness and the `scripts/check-*.mjs` checks were NOT run; they are
CI's. No browser was started, so nothing here was tried in a real browser or
with a screen reader.

What was changed:

1. Sanitizer, `src/components/serverHtml.tsx` (tests `serverHtml.test.tsx`):
   `data-thing` is kept only on `a.thing` and only when the whole value is
   `#digits` ids separated by single spaces; a kept name gets `href="#"` and
   loses any `target`. Done with two DOMPurify hooks that are added and
   removed around each server-HTML sanitize, because DOMPurify is one shared
   object and `src/logging/AutoLogExport.ts` uses it too. `data-exit` is still
   removed (existing tests kept, one added for a bound name carrying it).
2. `src/boundNames.ts` (tests `boundNames.test.ts`): `boundNameIds(value)`,
   `selectFirstHere(ids)` (selects the first id that is here; returns
   `things`, `people`, `inventory` or null), and `HOLDING_LISTS`, each list's
   tab id and listbox element id. `RoomInfoDisplay.tsx` and `inventory.tsx`
   take their list ids from it.
3. `src/map/roomContents.ts`: `layoutOfRoom(layout, info)`, the "is this
   layout this room's" expression that was inline in `RoomInfoDisplay.tsx`,
   now used by both.
4. `src/components/output.tsx` `handleOutputClick`: the `a.thing[data-thing]`
   branch. New optional prop `onShowHoldingList(list)`. None here: announces
   "<link text>: no longer here", politely. Tests: `output.test.tsx`, "Output
   bound names".
5. Focus path: `tabs.tsx` `selectTab(id, { elementId })`; `sidebar.tsx`
   `switchToTab(index, elementId?)`; `App.tsx` `showHoldingList` and
   `elementId` on the sidebar focus request. Tests in `tabs.test.tsx`,
   `sidebar.test.tsx`, `App.test.tsx`.
6. `src/components/AccessibleList.tsx`: on focus, the row that was selected
   before focus arrived is scrolled into view, except when a mouse press
   brought the focus. Test in `AccessibleList.test.tsx`.
7. Docs: `docs/room-layout.md` ("Names in the room's text", under the Room
   tab section) and `docs/GMCP/packages/client-html-file-speech.md`.

What the tests do not cover: the whole chain in one test (the real `App` with
the real `Output` and `Sidebar`); it is covered in three pieces (click handler
-> callback; App -> `switchToTab(index, listId)`; Sidebar -> the list focused
with the selection intact). Enter on the link is the browser's own link
activation, which jsdom does not do; the test shows the link is a focusable
`a[href]`, that the transcript's key handler leaves Enter alone on it, and
that the click it becomes is handled.

What the source did before this work:

- Exit links come only from ANSI lines: `src/ansiParser.tsx:74` makes
  `<a data-exit class="exit" href="#">`. The `href="#"` is what makes it a
  real link: Tab reaches it and Enter fires the browser's click, which
  `output.tsx` `handleOutputClick` handles by delegation.
- `handleOutputKeyDown` returns at once when the key's target is not the
  output region itself, so keys on a link inside it are the browser's.
- Server HTML `a.command[data-text]` gets nothing added by the client; it is
  only keyboard-reachable when the server's own markup carries an `href`.
- Frozen (older) lines are static markup built from source by
  `renderLineMarkup`; restored lines are rebuilt from saved source by
  `lineElements`. Both go through `renderServerHtml`, so whatever the
  sanitizer produces is what every line shows.
- App focuses a sidebar tab with `setSidebarFocusRequest({ index })`, which
  called `Sidebar.switchToTab(index)` -> `Tabs.selectTab(id, 'panel')`, which
  focuses the panel's FIRST control. Nothing could focus a named element.

## Decisions and why

- The server sends no `href`, so an `a.thing` as sent is not a link to a
  screen reader and Tab skips it. The sanitizer adds `href="#"` to each bound
  name it keeps, the same thing the exit link has, so it is a native link:
  role link, name is its text, Tab reaches it, Enter activates it. No aria
  label, no extra words.
- Landing in a named list needed one new thing in the existing focus path
  (the `elementId` target), not a second path to the sidebar.
- Which list holds an id is decided by the same `roomContents` join the Room
  tab draws from, so a bound name cannot land in a list that does not show it.
- Carried things. The brief counts a carried thing as "here" but only names
  the Things and People lists, and a carried thing is in neither. For an id
  that is only carried, the link shows the Inventory tab and focuses its
  list, which holds it and shows its card. This is my reading, not the
  lead's words; reported to the lead. To drop it: remove `inventory` from
  `HoldingList`/`HOLDING_LISTS` and the `inv` line in `selectFirstHere`.
- The announcement is "<name>: no longer here" so it reads right for one
  thing and for a plural phrase ("four biscuits: no longer here").
- When none is here, the selection there was is left alone (the brief says
  "select nothing"; I read that as "do not select", not "clear").
- The list scroll on focus (item 6): the selection is made before focus
  reaches the list, and the list only scrolled its selected row into view
  when the selection changed while it had focus, so in a long list the named
  row could be off screen for a sighted player. A mouse press is excluded
  because a press focuses the list before the click selects the pressed row,
  and scrolling then would move the list under the pointer.
- No CSS added: a bound name takes the transcript's existing link style
  (`.output a`).

## Surprises

- The brief says exit and command links are both "made focusable". Only the
  exit link is (by `href="#"`); the client adds nothing to command links.
- jsdom has no `onpointerdown` property, so Preact does not deliver
  `onPointerDown` there; the list uses `onMouseDown`, which touch also sends
  before focus.
- `toHaveBeenCalledWith(0)` in the existing App test does not match a call
  `(0, undefined)`, so App calls `switchToTab(index)` with one argument when
  there is no element to name.

## Next step

Lead: push, open the pull request, watch CI (the full suite, Playwright and
the accessibility script have not run). Decide on the carried-thing reading
above. After deploy, the server switches on the `a.thing` markup; then try it
live: Tab to a name in a room description, Enter, and hear the list and row.
