# Task: Visual Polish Phase 2 — Toolbar Overhaul

## Context
We're on branch `visual-polish`. Dev server is running at `http://localhost:5173/`. Phase 1 (design tokens) is committed. This phase overhauls the toolbar to use ghost buttons with grouped layout.

## Objective
Restyle the toolbar: all buttons ghost by default, connect/disconnect get colored treatment, group buttons with separators, style volume range and autosay toggle.

## Pre-work: Capture "before" screenshot
```bash
node scripts/take-screenshot.mjs phase2-before
```
Verify `screenshots/phase2-before-desktop.png` exists.

## Files to Read First
- `src/components/toolbar.css` — current toolbar styles
- `src/components/toolbar.tsx` — current toolbar markup/logic

## CSS Changes (`src/components/toolbar.css`)

### Ghost button base style
All toolbar buttons should default to ghost style. Add/modify:

```css
.toolbar button,
.toolbar .toolbar-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: background 0.15s, color 0.15s;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.toolbar button:hover,
.toolbar .toolbar-btn:hover {
  background: rgba(255,255,255,0.06);
  color: var(--color-text);
}
```

### Connect button (blue/primary)
```css
.toolbar .btn-connect {
  background: var(--color-primary);
  color: white;
  border-color: transparent;
  font-weight: 600;
}

.toolbar .btn-connect:hover {
  background: var(--color-primary-hover);
  color: white;
}
```

### Disconnect button (red/danger)
```css
.toolbar .btn-disconnect {
  background: var(--color-danger, #dc3545);
  color: white;
  border-color: transparent;
  font-weight: 600;
}

.toolbar .btn-disconnect:hover {
  background: color-mix(in srgb, var(--color-danger, #dc3545) 85%, black);
  color: white;
}
```

### Toolbar grouping
```css
.toolbar-group {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.toolbar-separator {
  width: 1px;
  height: 20px;
  background: var(--color-separator);
  margin: 0 var(--space-2);
  flex-shrink: 0;
}

.toolbar-spacer {
  flex: 1;
}
```

### Volume range styling
```css
.toolbar-volume {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.toolbar-volume input[type="range"] {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
  outline: none;
}

.toolbar-volume input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-text-secondary);
  cursor: pointer;
}

.toolbar-volume input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-text-secondary);
  cursor: pointer;
  border: none;
}
```

### Autosay toggle switch
```css
.toolbar-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.toolbar-toggle input[type="checkbox"] {
  position: relative;
  width: 32px;
  height: 18px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255,255,255,0.15);
  border-radius: 9px;
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
}

.toolbar-toggle input[type="checkbox"]::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: var(--color-text-secondary);
  border-radius: 50%;
  transition: transform 0.2s;
}

.toolbar-toggle input[type="checkbox"]:checked {
  background: var(--color-primary);
}

.toolbar-toggle input[type="checkbox"]:checked::after {
  transform: translateX(14px);
  background: white;
}
```

### Reduce toolbar padding
Find the main `.toolbar` rule and ensure padding is compact:
```css
padding: var(--space-1) var(--space-3);
```

## TSX Changes (`src/components/toolbar.tsx`)

Read the file first to understand the current structure. Then make these changes:

1. **Wrap button groups** in `<div className="toolbar-group">`:
   - Log buttons (Save Log, Copy Log, Clear Log) → one group
   - Preferences → its own group (or with nearby controls)
   - Mute + Volume → one group
   - Autosay → its own group
   - Connect/Disconnect → its own group

2. **Add separators** between groups: `<div className="toolbar-separator" />`

3. **Connect/Disconnect button**: Add dynamic className:
   ```tsx
   className={connected ? 'btn-disconnect' : 'btn-connect'}
   ```
   (Find the existing connection button and add this class — keep any existing className, just add the new one)

4. **Add spacer** before the sidebar toggle button:
   ```tsx
   <div className="toolbar-spacer" />
   ```

5. **Wrap volume** controls in:
   ```tsx
   <label className="toolbar-volume">
   ```

6. **Wrap autosay** checkbox in:
   ```tsx
   <label className="toolbar-toggle">
   ```

**IMPORTANT**: Be careful with the TSX changes. Read the file thoroughly first. Don't break any existing functionality — event handlers, state, refs must all be preserved. Only add wrapper divs and classNames.

## Verify
```bash
npx vite build
```
Must complete with no errors.

## Post-work: Capture "after" screenshot
```bash
node scripts/take-screenshot.mjs phase2-after
```
Verify `screenshots/phase2-after-desktop.png` exists.

## Commit
```bash
git add src/components/toolbar.css src/components/toolbar.tsx
git commit -m "style: overhaul toolbar with ghost buttons and grouped layout"
```
Record the commit hash.

## Output
Write your report to `./reports/visual-polish-phase-2-report.md` with:
- What changed (CSS additions, TSX structural changes)
- Screenshot file sizes (before and after)
- Build result (pass/fail)
- Commit hash
- Any issues encountered

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
