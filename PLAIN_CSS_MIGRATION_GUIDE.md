# Plain CSS Migration Guide

This guide provides instructions for migrating from styled-components to plain CSS in the REX codebase.

## Table of Contents

1. [Overview](#overview)
2. [Why Plain CSS?](#why-plain-css)
3. [Theme Usage](#theme-usage)
4. [Component Migration Patterns](#component-migration-patterns)
5. [Testing](#testing)
6. [Common Pitfalls](#common-pitfalls)

## Overview

We are migrating from styled-components to plain CSS to:
- Remove runtime CSS-in-JS overhead
- Improve build performance
- Simplify code review (CSS is more familiar than template literals)
- Reduce bundle size
- Use standard, familiar CSS without additional abstractions

## Why Plain CSS?

Plain CSS provides:
- **No build config changes**: Works out of the box with React Scripts
- **Better performance**: Static CSS with no runtime overhead
- **Familiar syntax**: Standard CSS that every developer knows
- **Simple mental model**: Direct CSS files imported for side effects
- **Easy debugging**: Standard browser DevTools work perfectly

## Theme Usage

### Before (styled-components)

```typescript
import styled, { css } from 'styled-components/macro';
import theme from '../theme';

const Button = styled.button`
  background-color: ${theme.color.primary.orange.base};
  padding: ${theme.padding.page.desktop}rem;

  ${theme.breakpoints.mobile(css`
    padding: ${theme.padding.page.mobile}rem;
  `)}
`;
```

### After (Plain CSS)

```typescript
// Button.tsx
import './Button.css';

export function Button({ children }) {
  return (
    <button className="button">{children}</button>
  );
}
```

```css
/* Button.css */
.button {
  background-color: var(--color-primary-orange-base);
  padding: var(--padding-page-desktop);
}

@media screen and (max-width: 75em) {
  .button {
    padding: var(--padding-page-mobile);
  }
}
```

## Component Migration Patterns

### Pattern 1: Simple Styled Component

**Before:**
```typescript
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
`;
```

**After:**
```typescript
// Component.tsx
import './Component.css';

function Wrapper({ children }) {
  return <div className="component-wrapper">{children}</div>;
}
```

```css
/* Component.css */
.component-wrapper {
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
```

**Naming Convention:** Use component-specific prefixes to avoid global class name conflicts (e.g., `component-wrapper` instead of just `wrapper`).

### Pattern 2: Component with Props/Variants

**Before:**
```typescript
const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;

  ${props => props.variant === 'primary' && `
    background-color: ${theme.color.primary.orange.base};
    color: ${theme.color.text.white};
  `}

  ${props => props.variant === 'secondary' && `
    background-color: ${theme.color.neutral.base};
    color: ${theme.color.text.default};
  `}
`;
```

**After:**
```typescript
// Button.tsx
import './Button.css';
import classNames from 'classnames';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

function Button({ variant = 'primary', children }: ButtonProps) {
  return (
    <button className={classNames('button', `button-${variant}`)}>
      {children}
    </button>
  );
}
```

```css
/* Button.css */
.button {
  padding: 1rem 2rem;
}

.button-primary {
  background-color: var(--color-primary-orange-base);
  color: var(--color-text-white);
}

.button-secondary {
  background-color: var(--color-neutral-base);
  color: var(--color-text-default);
}
```

### Pattern 3: Animations

**Before:**
```typescript
const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const Component = styled.div`
  animation: ${fadeIn} 200ms ease-out;
`;
```

**After:**
```css
/* Component.css */
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.component {
  animation: fadeIn 200ms ease-out;
}
```

### Pattern 4: Nested Selectors

**Before:**
```typescript
const Dropdown = styled.div`
  position: relative;

  &:focus-within ${Toggle} {
    display: none;
  }
`;
```

**After:**
```css
/* Dropdown.css */
.dropdown {
  position: relative;
}

.dropdown:focus-within .dropdown-toggle {
  display: none;
}
```

### Pattern 5: Conditional Classes

**Before:**
```typescript
const Button = styled.button<{ isActive?: boolean }>`
  ${props => props.isActive && `
    background-color: blue;
  `}
`;
```

**After:**
```typescript
import './Button.css';
import classNames from 'classnames';

function Button({ isActive, children }) {
  return (
    <button className={classNames('button', { 'button-active': isActive })}>
      {children}
    </button>
  );
}
```

```css
/* Button.css */
.button {
  background-color: gray;
}

.button-active {
  background-color: blue;
}
```

## Testing

### Snapshot Tests

Plain CSS uses global class names, so snapshots will show the actual class names you defined (e.g., `button`, `button-primary`). Update snapshots after migration:

```bash
yarn test:unit -- -u
```

### Visual Regression Tests

After migrating a component, run screenshot tests to ensure no visual changes:

```bash
yarn test:screenshots
```

If there are intentional visual changes, update the screenshots:

```bash
make screenshots
```

### Testing Class Names

```typescript
import { render } from '@testing-library/react';
import Component from './Component';

test('applies correct class', () => {
  const { container } = render(<Component />);
  expect(container.firstChild).toHaveClass('component-wrapper');
});
```

## Common Pitfalls

### 1. Global Class Name Conflicts

**Problem:** Plain CSS class names are global and can conflict.

**Solution:** Use component-specific prefixes:

```css
/* Good - component-specific prefix */
.search-button { }
.search-input { }

/* Bad - too generic */
.button { }
.input { }
```

### 2. Accessing Theme in CSS

**Problem:** Can't access theme object from JavaScript.

**Solution:** Use CSS custom properties defined in `theme.css`:

```css
.component {
  background: var(--color-primary-orange-base);
  padding: var(--padding-page-desktop);
  z-index: var(--z-index-toolbar);
}
```

### 3. Media Queries

**Problem:** Styled-components breakpoint helpers not available.

**Solution:** Use standard CSS media queries with CSS custom properties:

```css
.component {
  padding: var(--padding-page-desktop);
}

@media screen and (max-width: 75em) {
  .component {
    padding: var(--padding-page-mobile);
  }
}
```

### 4. Dynamic Class Names

**Problem:** Need to apply classes conditionally.

**Solution:** Use the `classnames` utility:

```typescript
import classNames from 'classnames';

// ✅ Good - uses component-prefixed class names
className={classNames('my-component-button', { 'my-component-button--active': isActive })}

// ✅ Also good - template literal
className={`my-component-button ${isActive ? 'my-component-button--active' : ''}`}

// ✅ Also good - array filter
className={['my-component-button', isActive && 'my-component-button--active'].filter(Boolean).join(' ')}
```

### 5. Specificity Management

**Problem:** CSS specificity can cause unexpected overrides.

**Solution:** Keep selectors simple and use single class names when possible:

```css
/* Good - simple, single class */
.button-primary { }

/* Avoid - high specificity */
.form .buttons .button.primary { }
```

## Migration Checklist

When migrating a component:

- [ ] Create `Component.css` file in the same directory as the component
- [ ] Convert styled-components to CSS classes with component-specific prefixes
- [ ] Replace theme object references with CSS variables
- [ ] Convert breakpoint helpers to media queries
- [ ] Convert keyframes to CSS @keyframes
- [ ] Update component to use `className` with plain strings
- [ ] Import CSS file: `import './Component.css'`
- [ ] Run unit tests and update snapshots if needed
- [ ] Run screenshot tests to verify visual consistency
- [ ] Remove unused styled-component imports

## Resources

- [CSS Custom Properties (CSS Variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Migration Plan Jira Epic](https://openstax.atlassian.net/browse/CORE-1685)
- [classnames library](https://github.com/JedWatson/classnames)

## Questions?

If you have questions about migrating a specific component, please:
1. Check this guide for similar patterns
2. Look at already-migrated components for examples (e.g., `HiddenLink.tsx`)
3. Ask in the team chat or create a comment on the Jira epic
