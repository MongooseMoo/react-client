# Task: Update tabs.css with Design System

## File
`src/components/tabs.css`

## Changes
Apply the new design system to tabs:

1. **Tab list container:**
   - Background: `var(--color-bg-elevated)`
   - Border-bottom: `1px solid var(--color-border)`
   - Padding: `var(--space-3)`
   - Gap between tabs: `var(--space-1)`

2. **Tab buttons:**
   - Background: `transparent`
   - Border-bottom: `3px solid transparent`
   - Padding: `var(--space-2) var(--space-4)`
   - Font size: `var(--font-size-sm)`
   - Font weight: `var(--font-weight-medium, 500)`
   - Color: `var(--color-text-secondary)`
   - Border radius top: `var(--radius-sm)`
   - Transition: `all var(--transition-fast)`

3. **Selected tab:**
   - Color: `var(--color-primary)`
   - Background: `var(--color-bg)`
   - Border-bottom-color: `var(--color-primary)`
   - Font weight: `var(--font-weight-semibold, 600)`

4. **Tab hover:**
   - Background: `var(--color-bg-hover)`
   - Color: `var(--color-text)`

5. **Tab panel:**
   - Background: `var(--color-bg)`
   - Padding: `var(--space-3) var(--space-4)`
   - Line height: `var(--line-height-relaxed, 1.75)`

6. **Focus state:**
   - Outline: `2px solid var(--color-focus-ring)`

Replace all hardcoded values with CSS variables.

## Output
Write brief status to `./reports/phase2-tabs-css.md`
