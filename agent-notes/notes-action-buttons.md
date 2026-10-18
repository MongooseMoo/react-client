# Action buttons: orange outline + icons (Kael's request)

## Ask
- Kael: item action buttons should look more "actioney", maybe orange. Icons?
- Q (2026-10-05): outline version, do the icons, PR it.

## State (uncommitted on master working tree)
- `src/tokens.css`: added `--color-text-button` (was undefined, fell back to #fff: white on green 1.74:1) and `--color-action` / `-hover` / `-active` (#fb923c / #f97316 / #ea580c).
- `src/components/ItemCard.css`: outline style, orange border + text, fills on hover/active, inline-flex with gap for icon.
- `src/itemActions.ts`: `ItemAction.verb` (bare first verb name) added.
- `src/components/ItemCard.tsx`: `ACTION_ICONS` Map (sit, lie, take, remove, put, open, close, give, drop, bolt, unbolt) from `react-icons/fa`, `aria-hidden`.
- Tests updated: `src/itemActions.test.ts`, `src/components/ItemCard.test.tsx` (new icon test).

## Observed
- Contrast: dark #14141a on #fb923c 8.11, on hover 6.54, on active 5.15; orange on card bg #1a1a22 7.64.
- `--color-text-button` is also used by PlayerCard buttons; their text went white -> dark (6.7-11:1).
- Live app as guest (Chrome, localhost:5173/?username=guest&password=guest): Room tab, The Parlor, coffee table sends 18 verbs: Sit, Lie, Stand_on, Step_off, Put … on, Take … from, Close, Open, Remove … from, Bolt, Unbolt, Toss, Give to …, Drop, Take, Offer to …, Explain, Commands.
- George Street, East George Street, Chain-Link Perimeter: nothing on ground. Guest inventory empty.
- Player card: Follow looked clipped at sidebar edge, "Say To" wraps. Not caused by this change (layout untouched).
- Playwright run earlier ended "Not connected"; cause not found. Chrome worked first try.
- `claudio.exe` PostToolUse hook crashed once: `fatal error: pageAlloc: out of memory`.

## Done (2026-10-05)
- vitest on the two test files: 8 passed. `tsc --noEmit` clean.
- Live check caught a missing outline: `.item-actions button` (transparent border) outranked `.item-action-button`; selectors changed to `.item-actions .item-action-button`. Re-checked live: 18 outlined buttons, 12 with icons, hover fills.
- Branch `feat/action-buttons`, commit ad967351, PR https://github.com/MongooseMoo/react-client/pull/169. Main checkout is back on master, so the dev server on 5173 shows the old green buttons again.
- Biome warns (not errors) on two `import type` lines in ItemCard.tsx that were already there; left alone.
