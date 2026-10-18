# Task: Update sidebar.css with Design System

## File
`src/components/sidebar.css`

## Changes
Apply the new design system to the sidebar:

1. **Main sidebar container:**
   - Background: `var(--gradient-surface)`
   - Border-left: `1px solid var(--color-border)`
   - Box shadow: `-4px 0 16px rgba(0, 0, 0, 0.2)`
   - Width: `var(--sidebar-width)` (already exists)

2. **Collapsed state:**
   - Width: `var(--sidebar-width-collapsed, 50px)`
   - Reduced shadow

3. **Collapse button:**
   - Background: `var(--color-bg-surface)`
   - Border: `1px solid var(--color-border)`
   - Border radius: `var(--radius-md)`
   - Padding: `var(--space-3) var(--space-4)`
   - Margin: `var(--space-2)`
   - Hover: background `var(--color-bg-hover)`, border-color `var(--color-primary)`, shadow

4. **Sidebar content:**
   - Ensure proper spacing with `var(--space-*)` variables

Replace all hardcoded colors and values with CSS variables.

## Output
Write brief status to `./reports/phase2-sidebar-css.md`
