# Task: Update App.css Design System Foundation

## Objective
Expand the CSS variables in App.css to create a modern design system foundation.

## File to Modify
`src/App.css`

## Changes Required

### 1. Add/Update Spacing Scale
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

### 2. Update Border Radius (more rounded)
```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 20px;
--radius-full: 9999px;

/* Legacy aliases for compatibility */
--border-radius: var(--radius-md);
--border-radius-sm: var(--radius-sm);
--border-radius-small: var(--radius-sm);
```

### 3. Update Transitions
```css
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;

--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Legacy aliases */
--transition-fast: var(--duration-fast) var(--ease-default);
--transition-base: var(--duration-base) var(--ease-default);
--transition-smooth: var(--duration-slow) var(--ease-default);
```

### 4. Update Dark Theme Colors (bolder, more vibrant)
```css
/* Backgrounds - layered depth system */
--color-bg-deepest: #0a0a0f;
--color-bg-deep: #0f0f14;
--color-bg: #14141a;
--color-bg-elevated: #1a1a22;
--color-bg-surface: #22222d;
--color-bg-hover: #2a2a38;
--color-bg-active: #333345;

/* Legacy aliases */
--color-bg-secondary: var(--color-bg-elevated);
--color-bg-tertiary: var(--color-bg-surface);

/* Text hierarchy */
--color-text: #e8e8ed;
--color-text-secondary: #a0a0b0;
--color-text-tertiary: #707080;
--color-text-muted: #606070;
--color-text-inverse: #14141a;

/* Borders */
--color-border: #2a2a38;
--color-border-light: #22222d;
--color-border-strong: #3a3a4a;

/* Primary - Electric Blue */
--color-primary: #5ba0ff;
--color-primary-hover: #4590f0;
--color-primary-active: #3580e0;
--color-primary-subtle: rgba(91, 160, 255, 0.12);

/* Legacy alias */
--color-accent: var(--color-primary);
--color-accent-hover: var(--color-primary-hover);

/* Success - Vibrant Green */
--color-success: #4ade80;
--color-success-hover: #3acd70;
--color-success-subtle: rgba(74, 222, 128, 0.12);

/* Warning - Warm Amber */
--color-warning: #fbbf24;
--color-warning-hover: #f5a623;
--color-warning-subtle: rgba(251, 191, 36, 0.12);

/* Danger - Coral Red */
--color-danger: #f87171;
--color-danger-hover: #ef5050;
--color-danger-subtle: rgba(248, 113, 113, 0.12);

/* Info - Purple */
--color-info: #a78bfa;
--color-info-hover: #9070f0;
--color-info-subtle: rgba(167, 139, 250, 0.12);

/* Focus ring */
--color-focus-ring: var(--color-primary);

/* Selected state */
--color-selected-bg: var(--color-primary-subtle);
--color-selected-text: var(--color-primary);
```

### 5. Add Shadow System
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.35);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.4);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.45);

/* Glow effects */
--shadow-glow-primary: 0 0 20px rgba(91, 160, 255, 0.3);
--shadow-glow-success: 0 0 20px rgba(74, 222, 128, 0.3);
--shadow-glow-danger: 0 0 20px rgba(248, 113, 113, 0.3);
```

### 6. Add Gradients
```css
--gradient-surface: linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg) 100%);
--gradient-panel: linear-gradient(135deg, var(--color-bg-surface) 0%, var(--color-bg-elevated) 100%);
--gradient-primary: linear-gradient(135deg, var(--color-primary) 0%, #4580e0 100%);
--gradient-success: linear-gradient(135deg, var(--color-success) 0%, #2abc60 100%);
```

### 7. Add Button System (at end of :root or in separate section)
```css
/* === BUTTON SYSTEM === */
.btn {
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium, 500);
  line-height: 1;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-primary {
  background: var(--gradient-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-glow-primary);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-bg-surface);
  color: var(--color-text);
  border-color: var(--color-border-strong);
}

.btn-secondary:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
}

.btn-success {
  background: var(--gradient-success);
  color: #ffffff;
  border-color: var(--color-success);
}

.btn-success:hover {
  background: var(--color-success-hover);
  box-shadow: var(--shadow-glow-success);
  transform: translateY(-1px);
}

.btn-danger {
  background: var(--color-danger);
  color: #ffffff;
  border-color: var(--color-danger);
}

.btn-danger:hover {
  background: var(--color-danger-hover);
  box-shadow: var(--shadow-glow-danger);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
}

.btn-ghost:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

### 8. Add Input System
```css
/* === INPUT SYSTEM === */
input[type="text"],
input[type="email"],
input[type="password"],
input[type="search"],
textarea,
select {
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-deep);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

input::placeholder,
textarea::placeholder {
  color: var(--color-text-tertiary);
}
```

### 9. Add Panel System
```css
/* === PANEL SYSTEM === */
.panel {
  background: var(--gradient-panel);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

.panel-elevated {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-md);
}

.panel-header {
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border-light);
}
```

## Important
- Keep existing variables that are used elsewhere (add aliases where needed)
- Don't break existing functionality
- Update the body styles to use new background color

## Output
Write status to `./reports/phase1-app-css-foundation.md`

## CRITICAL: File Modified Error Workaround
If Edit/Write fails: Read file again, retry Edit. Try path formats. NEVER use bash.
