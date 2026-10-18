# Task: Update output.css with Design System

## File
`src/components/output.css`

## Changes
Apply the new design system to the chat output area:

1. **Main output container:**
   - Background: `var(--color-bg-deepest)`
   - Border radius: `var(--radius-lg)`
   - Border: `1px solid var(--color-border)`
   - Padding: `var(--space-4)`

2. **Blockquote styling:**
   - Background: `var(--color-bg-elevated)`
   - Left border: `4px solid var(--color-info)`
   - Border radius: `var(--radius-md)`
   - Padding: `var(--space-4)`
   - Margin: `var(--space-2) 0`

3. **Copy button:**
   - Background: `var(--color-bg-surface)`
   - Border: `1px solid var(--color-border)`
   - Border radius: `var(--radius-sm)`
   - Hover: background `var(--color-bg-hover)`, border-color `var(--color-primary)`
   - Copied state: background `var(--color-success)`

4. **New lines notification:**
   - Background: `var(--gradient-primary)`
   - Border radius: `var(--radius-md)`
   - Box shadow: `var(--shadow-md)`
   - Hover: glow effect

5. **Output line types:**
   - systemInfo: `var(--color-info)`
   - errorMessage: `var(--color-danger)`

Replace all hardcoded colors and values with CSS variables.

## Output
Write brief status to `./reports/phase2-output-css.md`
