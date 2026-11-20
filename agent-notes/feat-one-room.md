# feat/one-room: the room picture, its things and its people in one Room tab

## Goal

Q asked: "How can we best integrate the text and visual worlds? I don't think the
map tab is the right answer", and approved this story with "Make it so!":

- The Room tab holds the room drawn at the top (Plan, Dollhouse, Your eyes), under
  it one list of things (the radio's row reads "portable radio, on the low table")
  and one list of people, each with portrait and label. The Map tab is only the
  area map and "Go to". For a screen-reader user one list replaces two.
- One selection, not three: clicking the radio in the picture outlines it, selects
  its row, and shows its card; the selection survives Plan/Dollhouse/Your eyes;
  interact mode's Tab selects the same thing.

Allowed changes (exactly these):

1. Move `RoomLayoutView` from the Map tab to the Room tab (one mount, three.js
   still lazy, works with no layout).
2. One things list and one people list in the Room tab, joined by id; duplicated
   lists removed from `RoomLayoutView`.
3. One shared selected target in `src/stores/itemsStore.ts`, replacing the private
   selections in `RoomInfoDisplay` and interact mode's `interactKey` for things.
4. The picture shows and sets that selection in Plan and both 3D views.
5. `docs/room-layout.md`, `scripts/` and `tests/` updated for the new place.

Not allowed: server/MOO changes, new GMCP messages, clickable transcript words,
Enlarge view, phone-layout redesign, avatar drawing changes, new dependencies,
new stores, a second action dispatcher, an old path kept beside the new one.

## State

Reading finished for: `docs/room-layout.md`, the interact section of
`docs/keystrokes.md`, the four earlier notes, PR #254's diff, `Keystrokes.ts`,
`itemsStore.ts`, `roomStore.ts`, `RoomInfoDisplay.tsx`, `RoomLayoutView.tsx`,
`RoomLayout3D.tsx`, `MapPanel.tsx`, `roomLayout.ts`, `gmcp/Room.ts`,
`gmcp/Char/Items.ts`, `inventory.tsx`, `itemActions.ts`, `ItemCard.tsx`,
`PlayerCard.tsx`, `AccessibleList.tsx`. No code changed yet.

Done and committed, each with tests passing by explicit path:

- Shared selection in `itemsStore.ts` (`itemsStore.test.ts`, new).
- Interact mode on the shared selection (`Keystrokes.ts`, three new tests in
  `Keystrokes.test.ts`; the existing interact tests pass unchanged).
- `AccessibleList` shows a caller-held selection; the inventory uses it
  (`AccessibleList.test.tsx`: three list tests, one inventory test; the two
  existing inventory focus tests pass unchanged).

Still to do: the Room tab's joined lists and cards, the room view's move out of
the Map tab, selection in the picture (Plan and 3D), docs, `scripts/`/`tests/`.

What the source said before this work:

- `itemsStore.ts` holds only `itemsByLocation` and `hasReceivedList`; no selection.
- `AccessibleList` keeps its own `selectedId` in component state and only reports
  an index upward (`onSelectedIndexChange`). It cannot be told what is selected,
  so a selection made in the picture or by interact mode cannot reach a list row
  until the list takes its selection from outside.
- Interact mode's `interactKey` (`Keystrokes.ts`) is both "the current thing" and
  "interact mode is on" (`null` means off). Exits use the key `exit <direction>`.
- PR #254 touches `Keystrokes.ts` at: the import block from `keystrokesStore`,
  a new `consume()` after `say()`, every `preventDefault/stopPropagation` pair in
  `handleKeydown` and `describeKey`, `toggleKeysMode`, and `removeLayer`. It does
  not touch `interactTargets`, `handleInteractKey`, `moveInteract`, `landOn`,
  `toggleInteractMode` or `endInteractMode` bodies.

## Decisions and why

- **The store's selection is `selected: { id, lifetime? } | null` with
  `select(id | null)`** in `itemsStore.ts`. `select` looks the lifetime up in the
  current layout itself, so no caller has to. The store drops the selection when
  its thing is no longer in the inventory list, the room list, the layout (same
  lifetime) or `Room.Players`, and when `Room.Info` names another room (an
  inventory item stays selected across rooms: it has not left its list, and
  interact mode keeps an inventory item across rooms today). `itemsStore` reads
  `roomStore` (one direction) through one `subscribe`; no new store.
- **`AccessibleList` takes its selection from outside when given `selectedId`**
  (with `onSelect`). Without those props it behaves as before, for its other
  callers (user list, menus, dialogs). Without this a row could not become
  selected from the picture or from interact mode.
- **The inventory is on the shared selection too.** The existing inventory test
  wants the next item's card after the selected item is dropped from its own
  card. The store clears the selection when the item leaves; the card unmounts;
  focus recovery returns focus to the list; a list whose caller-held selection
  is empty selects, on focus or on Down, the place it last held. So the person
  acting gets the same result as before, and someone not in the list sees the
  selection clear instead of jump to a neighbour nobody chose.
- **Parts and drawer controls sit with the selected thing's card, under the list,
  not inside the list rows.** My reading, not the assignment's literal words
  ("a thing row carries ... its parts/drawer controls"): a button inside a
  `role="option"` is not exposed as a button to a screen reader (an option's
  children are presentational), and the assignment forbids a tree or grid. Q's
  story puts the actions in "the card under the list". Clicking a part or drawer
  face in 3D selects its thing, then focuses and presses the same button as
  before.
- **A thing's row is `name, where`** (Q: "portable radio, on the low table").
  Where is the server's `relation.text` when sent, else the existing wall words,
  then the existing mounted/fixed/faces/open/lit/mode words. The class and
  material words ("(table, wood)") that the Map tab's list carried move to the
  selected thing's card, so they are not lost.
- **A person's row is portrait, name and label** as assigned; where they are is
  on their card. The old Map tab list said where in the row.
- **Interact mode keeps a private "on" flag and the exit it is on; a thing it is
  on is the shared selection.** Landing on an exit clears the shared selection,
  so the picture never outlines a thing while the mode is on an exit. Turning the
  mode on starts at the selected thing when it is an interact target, else at the
  first target as before (my choice, so one selection is not thrown away by
  turning the mode on). `interactKey` stays as a getter so PR #254's changed
  lines are not touched.
- **Headings in the Room tab are "Things" and "People"** (Q's words), replacing
  "Contents" and "Players in Room": the people list now also holds people who
  are not players, and you.

## Surprises

- `LayoutThing` in `src/gmcp/Room.ts` has no `holder` field. The assignment said
  the server sends `holder`; the type and `docs/room-layout.md` name only
  `relation` (`kind`, `target`, `text`) for support. To be checked against the
  recorded wire fixtures in `src/map/*.sample*.json` before any code relies on it.

## Next step

Read `docs/room-layout.md`, `docs/keystrokes.md`, the four earlier notes, the
named source files and `gh pr diff 254`; then install dependencies.
