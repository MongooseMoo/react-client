# Task: Visual Polish Phases 4 & 5 — Input Area & Output Area

## Context
We're on branch `visual-polish`. Dev server at `http://localhost:5173/`. These are two small CSS-only changes to separate files.

## Pre-work: Capture "before" screenshot
```bash
node scripts/take-screenshot.mjs phase4-5-before
```

## Files to Read First
- `src/components/input.css`
- `src/components/output.css`

## Phase 4: Input Area (`src/components/input.css`)

Find the input container and textarea styles. Make these changes:

1. **Container** — remove any `border` and `border-radius` on the input container/wrapper (the div that wraps the textarea + send button). The input area should blend into the layout, not have a box around it.

2. **Textarea** — change border to transparent by default, only show on focus:
   - Default: `border: 1px solid transparent`
   - Background: `var(--color-bg-deep)` (if this token exists; if not, use something darker than the main bg like `rgba(0,0,0,0.3)` or check App.css for a suitable deep/dark token)
   - Focus: `border-color: transparent` and `box-shadow: 0 0 0 2px var(--color-success-subtle)` (if `--color-success-subtle` doesn't exist, use `rgba(74, 222, 128, 0.2)` or similar soft green glow matching the Send button's color family)

3. **Be careful**: Don't break the Send button styling. Only change the textarea/input and its container.

## Phase 5: Output Area (`src/components/output.css`)

Find the output container/wrapper. Make these changes:

1. **Remove `border`** — find any `border: 1px solid var(--color-border)` or similar and remove it
2. **Remove `border-radius`** — find any `border-radius: var(--radius-lg)` or similar and remove it

The output should be full-bleed with no box around it.

## Verify
```bash
npx vite build
```

## Post-work: Capture and VISUALLY VERIFY
```bash
node scripts/take-screenshot.mjs phase4-5-after
```

READ both screenshots with the Read tool. Confirm:
1. **Input area** — does it blend more into the layout? Is the border gone from the container? Does the textarea look clean without a visible border in its resting state?
2. **Output area** — is the border gone? Does the output area flow edge-to-edge without a visible box around it?
3. **No regressions** — everything else still looks fine?

Describe what you see. If something looks broken, DO NOT commit.

## Commits (two separate commits, one per phase)

First commit (Phase 4):
```bash
git add src/components/input.css
git commit -m "style: clean up input area borders"
```

Second commit (Phase 5):
```bash
git add src/components/output.css
git commit -m "style: remove output area border and radius"
```

Record both commit hashes.

## Output
Write your report to `./reports/visual-polish-phase-4-5-report.md` with:
- What changed per file
- Before/after screenshot descriptions
- Build result
- Both commit hashes
- Any issues

## CRITICAL: Verify CSS imports exist
Before making changes, check that `input.css` is imported in the input component TSX file and `output.css` is imported in the output component TSX file. If an import is missing, add it (we learned this lesson from Phase 2).

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
