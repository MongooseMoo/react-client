# Task: Visual Polish Phases 6 & 7 — Status Bar & Cards

## Context
We're on branch `visual-polish`. Dev server at `http://localhost:5173/`. Phase 6 involves TSX+CSS changes to the status bar. Phase 7 is a tiny CSS change to card components.

## Pre-work: Capture "before" screenshot
```bash
node scripts/take-screenshot.mjs phase6-7-before
```

## Files to Read First
- `src/components/statusbar.tsx`
- `src/components/statusbar.css`
- `src/components/PlayerCard.css`
- `src/components/ItemCard.css`

## Phase 6: Status Bar

### TSX Changes (`src/components/statusbar.tsx`)

Read the file first to understand the current structure. Then:

1. **Add a colored dot before the status text** — a small circle that indicates connection state:
   ```tsx
   <span className={`status-dot ${connectionState}`} />
   ```
   Where `connectionState` is derived from whatever prop/state indicates connected/disconnected/connecting. Read the component to find how connection state is tracked.

2. **HP color function** — if there are HP/vitals displayed, wrap them in colored spans:
   - HP ratio > 0.66 → `className="vital-good"` (green)
   - HP ratio > 0.33 → `className="vital-warning"` (yellow)
   - HP ratio ≤ 0.33 → `className="vital-danger"` (red)

   If there are no HP/vitals displayed in the status bar, skip this part and note it in the report.

### CSS Changes (`src/components/statusbar.css`)

1. **Status dot styles:**
   ```css
   .status-dot {
     display: inline-block;
     width: 8px;
     height: 8px;
     border-radius: 50%;
     margin-right: var(--space-2);
     flex-shrink: 0;
   }

   .status-dot.connected {
     background: var(--color-success, #4ade80);
   }

   .status-dot.disconnected {
     background: var(--color-danger, #ef4444);
   }

   .status-dot.connecting {
     background: var(--color-warning, #f59e0b);
     animation: pulse 1.5s ease-in-out infinite;
   }

   @keyframes pulse {
     0%, 100% { opacity: 1; }
     50% { opacity: 0.4; }
   }
   ```

2. **Vital color classes** (only if HP/vitals exist):
   ```css
   .vital-good { color: var(--color-success, #4ade80); }
   .vital-warning { color: var(--color-warning, #f59e0b); }
   .vital-danger { color: var(--color-danger, #ef4444); }
   ```

### IMPORTANT for Phase 6
- Read the TSX carefully to understand what state/props are available
- The connection state might be called `connected`, `isConnected`, `connectionStatus`, or something else — use what exists
- Don't break any existing status bar content
- If vitals/HP aren't in the status bar, just add the connection dot and skip the vitals coloring

## Phase 7: Card Components

### `src/components/PlayerCard.css`
Find any `transform: translateY(-1px)` in hover states and remove it. Keep any hover shadow changes, just remove the vertical lift.

### `src/components/ItemCard.css`
Same — find and remove `transform: translateY(-1px)` from hover states. Keep shadows.

If either file doesn't have `translateY` in hover states, note it and skip.

## Verify
```bash
npx vite build
```

## Post-work: Capture and VISUALLY VERIFY
```bash
node scripts/take-screenshot.mjs phase6-7-after
```

READ both screenshots. Confirm:
1. **Status bar** — is there a colored dot visible before the status text? What color is it?
2. **Cards** — these may not be visible in the default screenshot view. If the Inventory or Users tab needs to be active to see cards, note that we can't test this visually from the default screenshot. Just confirm the CSS change was made correctly.
3. **No regressions** — everything else still intact?

## Commits (two separate commits)

Phase 6:
```bash
git add src/components/statusbar.tsx src/components/statusbar.css
git commit -m "style: add connection dot and HP color coding to status bar"
```

Phase 7:
```bash
git add src/components/PlayerCard.css src/components/ItemCard.css
```
Only add files that were actually modified.
```bash
git commit -m "style: remove hover lift from card components"
```

## CRITICAL: Verify CSS imports exist
Check that statusbar.css is imported in statusbar.tsx. Check that PlayerCard.css and ItemCard.css are imported in their respective components.

## Output
Write your report to `./reports/visual-polish-phase-6-7-report.md` with:
- What changed per file
- Before/after screenshot descriptions
- Build result
- Both commit hashes
- Any issues

## CRITICAL: Parallel Swarm Awareness
**FORBIDDEN GIT COMMANDS - NEVER USE THESE:**
- `git stash`, `git restore`, `git checkout` (for files), `git reset`, `git clean`

## CRITICAL: File Modified Error Workaround
If Edit/Write fails with "file unexpectedly modified":
1. Read the file again with Read tool
2. Retry the Edit
3. Try path formats: `./relative`, `C:/forward/slashes`, `C:\back\slashes`
4. NEVER use cat, sed, echo - always Read/Edit/Write
5. If all formats fail, STOP and report
