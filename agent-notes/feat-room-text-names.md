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

Started 2026-11-20. Done and committed so far, each test written first and
seen failing:

1. Sanitizer (`src/components/serverHtml.tsx`, tests in
   `serverHtml.test.tsx`): `data-thing` kept only on `a.thing` with a value of
   the id-list form; kept names get `href="#"`.
2. `src/boundNames.ts` (tests `boundNames.test.ts`): `selectFirstHere(ids)`
   selects the first id that is here and returns which list holds it
   (`things`, `people`, `inventory`) or null; `HOLDING_LISTS` names each
   list's tab and listbox element id, used by `RoomInfoDisplay.tsx` and
   `inventory.tsx` for their list ids.
3. `src/components/output.tsx` `handleOutputClick`: the `a.thing[data-thing]`
   branch, calling the new optional prop `onShowHoldingList(list)` or
   announcing "<name>: no longer here". Tests in `output.test.tsx`
   ("Output bound names").

Left: `tabs.tsx` / `sidebar.tsx` / `App.tsx` so the list gets focus; docs.

What the source did before this work:

- Exit links come only from ANSI lines: `src/ansiParser.tsx:74` makes
  `<a data-exit class="exit" href="#">`. The `href="#"` is what makes it a
  real link: Tab reaches it and Enter fires the browser's click, which
  `output.tsx` `handleOutputClick` handles by delegation.
- `handleOutputKeyDown` (`output.tsx:876`) returns at once when the key's
  target is not the output region itself, so keys on a link inside it are the
  browser's.
- Server HTML `a.command[data-text]` gets nothing added by the client; it is
  only keyboard-reachable when the server's own markup carries an `href`.
- Frozen (older) lines are static markup built from source by
  `renderLineMarkup`; restored lines are rebuilt from saved source by
  `lineElements`. Both go through `renderServerHtml`, so whatever the
  sanitizer produces is what every line shows.
- App focuses a sidebar tab with `setSidebarFocusRequest({ index })`, which
  calls `Sidebar.switchToTab(index)` -> `Tabs.selectTab(id, 'panel')`, which
  focuses the panel's FIRST control. Nothing today can focus a named element
  in a panel.

## Decisions and why

- The server sends no `href`, so an `a.thing` as sent is not a link to a
  screen reader and Tab skips it. The sanitizer adds `href="#"` to each bound
  name it keeps, the same thing the exit link has, so it is a native link:
  role link, name is its text, Tab reaches it, Enter activates it. No aria
  label, no extra words.

- Landing in a named list needs one new thing in the existing focus path:
  `Tabs.selectTab(id, { elementId })` focuses that element of the panel
  instead of the panel's first control; `Sidebar.switchToTab(index,
  elementId?)` and App's focus request carry it. No second path to the
  sidebar.
- Which list holds an id is decided by the same `roomContents` join the Room
  tab draws from, so a bound name can never land in a list that does not show
  it.
- The brief counts a carried thing as "here" but only names the Things and
  People lists. A carried thing is in neither (the Room tab lists room items
  and layout things). For an id that is only carried, the link shows the
  Inventory tab and focuses its list, which is the list that holds it and
  shows its card. An id in a Room tab list is preferred over this only by
  order in `data-thing` (first one here wins). To be reported to the lead.
- The plan for where code goes: sanitizer rule in `serverHtml.tsx`; click
  branch in `output.tsx` `handleOutputClick`; "which id is here and in which
  list" in `src/map/roomContents.ts` beside the join; App maps the list to
  the tab and element.

## Surprises

- The brief says exit and command links are both "made focusable". Only the
  exit link is (by `href="#"`); the client adds nothing to command links.

## Next step

Read `src/components/output.tsx`, `src/components/serverHtml.tsx`,
`src/stores/itemsStore.ts`, `src/components/RoomInfoDisplay.tsx`,
`src/components/sidebar.tsx`, `src/App.tsx`, `docs/room-layout.md`,
`docs/GMCP/`.
