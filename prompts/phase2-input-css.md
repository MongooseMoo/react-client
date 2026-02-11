# Task: Update input.css with Design System

## File
`src/components/input.css`

## Changes
Apply the new design system to the command input:

1. **Input container:**
   - Background: `var(--color-bg-deepest)`
   - Border: `1px solid var(--color-border)`
   - Border radius: `var(--radius-lg)`
   - Padding: `var(--space-2)`
   - Gap: `var(--space-2)`

2. **Textarea:**
   - Background: `var(--color-bg-deepest)`
   - Border: `1px solid var(--color-border)`
   - Border radius: `var(--radius-md)`
   - Padding: `var(--space-2) var(--space-3)`
   - Color: `var(--color-text)`
   - Font family: `var(--font-family-mono)`
   - Transition: `border-color var(--transition-fast), box-shadow var(--transition-fast)`

3. **Textarea focus:**
   - Border-color: `var(--color-success)`
   - Box-shadow: `0 0 0 3px var(--color-success-subtle)`

4. **Send button:**
   - Background: `var(--gradient-success)`
   - Color: `#ffffff`
   - Border: `none`
   - Border radius: `var(--radius-md)`
   - Font size: `var(--font-size-base)`
   - Font weight: `var(--font-weight-medium, 500)`
   - Transition: `all var(--transition-fast)`

5. **Send button hover:**
   - Background: `var(--color-success-hover)`
   - Box-shadow: `var(--shadow-glow-success)`
   - Transform: `translateY(-1px)`

Replace all hardcoded colors with CSS variables.

## Output
Write brief status to `./reports/phase2-input-css.md`
