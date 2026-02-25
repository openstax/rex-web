# CSS Modules Migration Guide

This guide provides instructions for migrating from styled-components to CSS Modules in the REX codebase.

## Table of Contents

1. [Overview](#overview)
2. [Why CSS Modules?](#why-css-modules)
3. [Theme Usage](#theme-usage)
4. [Component Migration Patterns](#component-migration-patterns)
5. [TypeScript Support](#typescript-support)
6. [Testing](#testing)
7. [Common Pitfalls](#common-pitfalls)

## Overview

We are migrating from styled-components to CSS Modules to:
- Remove runtime CSS-in-JS overhead
- Improve build performance
- Simplify code review (CSS is more familiar than template literals)
- Reduce bundle size
- Maintain scoped styles without the complexity of styled-components

## Why CSS Modules?

CSS Modules provide:
- **Automatic scoping**: Class names are automatically scoped to avoid conflicts
- **TypeScript support**: Generate `.d.ts` files for type-safe class name imports
- **No build config changes**: Already supported by React Scripts
- **Better performance**: Static CSS with no runtime overhead
- **Familiar syntax**: Standard CSS with better tooling support

## Theme Usage

### Before (styled-components)

```typescript
import styled from 'styled-components/macro';
import theme from '../theme';

const Button = styled.button`
  background-color: ${theme.color.primary.orange.base};
  padding: ${theme.padding.page.desktop}rem;

  ${theme.breakpoints.mobile(css`
    padding: ${theme.padding.page.mobile}rem;
  `)}
`;
```

### After (CSS Modules)

```typescript
// Button.tsx
import styles from './Button.module.css';

export const Button: React.FC = ({ children }) => (
  <button className={styles.button}>{children}</button>
);
```

```css
/* Button.module.css */
@import '../../app/theme.css';

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
import styles from './Component.module.css';

const Wrapper: React.FC = ({ children }) => (
  <div className={styles.wrapper}>{children}</div>
);
```

```css
/* Component.module.css */
.wrapper {
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
```

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
import styles from './Button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children }) => (
  <button className={`${styles.button} ${styles[variant]}`}>
    {children}
  </button>
);
```

```css
/* Button.module.css */
.button {
  padding: 1rem 2rem;
}

.primary {
  background-color: var(--color-primary-orange-base);
  color: var(--color-text-white);
}

.secondary {
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
/* Component.module.css */
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
/* Dropdown.module.css */
.dropdown {
  position: relative;
}

.dropdown:focus-within .toggle {
  display: none;
}
```

### Pattern 5: Extending Components

**Before:**
```typescript
const BaseButton = styled.button`
  padding: 1rem;
`;

const PrimaryButton = styled(BaseButton)`
  background-color: orange;
`;
```

**After:**
```css
/* Button.module.css */
.base {
  padding: 1rem;
}

.primary {
  composes: base;
  background-color: orange;
}
```

```typescript
import styles from './Button.module.css';

// Use styles.primary directly - it includes base styles
```

### Pattern 6: Conditional Classes

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
import styles from './Button.module.css';
import classNames from 'classnames'; // or implement a simple helper

const Button = ({ isActive }) => (
  <button className={classNames(styles.button, { [styles.active]: isActive })}>
    Click me
  </button>
);
```

```css
/* Button.module.css */
.button {
  background-color: gray;
}

.active {
  background-color: blue;
}
```

## TypeScript Support

CSS Modules automatically generate TypeScript declaration files (`.module.css.d.ts`) for type safety.

### Manual Type Generation (if needed)

If type declarations aren't generated automatically, you can use `typed-css-modules`:

```bash
npm install --save-dev typed-css-modules
```

Add to package.json scripts:
```json
{
  "scripts": {
    "generate-css-types": "tcm src"
  }
}
```

### Using Generated Types

```typescript
import styles from './Button.module.css'; // TypeScript knows all available class names

// ✅ This works
<button className={styles.button} />

// ❌ TypeScript error: 'nonexistent' doesn't exist
<button className={styles.nonexistent} />
```

## Testing

### Snapshot Tests

CSS Modules will generate unique class names in the format `ComponentName_className__hash`. Update snapshots after migration:

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
import styles from './Component.module.css';

test('applies correct class', () => {
  const { container } = render(<Component />);
  expect(container.firstChild).toHaveClass(styles.wrapper);
});
```

## Common Pitfalls

### 1. Global Styles Leaking

**Problem:** CSS Modules scope everything by default.

**Solution:** Use `:global` for intentionally global selectors:

```css
.wrapper :global(.some-global-class) {
  color: red;
}
```

### 2. Dynamic Class Names

**Problem:** Can't use template literals for class names.

**Solution:** Use the `classnames` utility or array joining:

```typescript
// ✅ Good
className={`${styles.button} ${styles[variant]}`}

// ✅ Also good
className={[styles.button, variant && styles[variant]].filter(Boolean).join(' ')}

// ❌ Bad - won't work
className={styles[`button-${variant}`]}
```

### 3. Sharing Styles Between Files

**Problem:** Need to reuse styles across components.

**Solution:** Use CSS `composes` or extract to shared utility classes:

```css
/* shared.module.css */
.flexCenter {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Component.module.css */
.wrapper {
  composes: flexCenter from './shared.module.css';
  padding: 2rem;
}
```

### 4. Accessing Theme in CSS

**Problem:** Can't access theme object from JavaScript.

**Solution:** Use CSS custom properties defined in `theme.css`:

```css
@import '../../app/theme.css';

.component {
  background: var(--color-primary-orange-base);
  padding: var(--padding-page-desktop);
  z-index: var(--z-index-toolbar);
}
```

### 5. Media Queries

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

## Migration Checklist

When migrating a component:

- [ ] Create `Component.module.css` file
- [ ] Convert styled-components to CSS classes
- [ ] Replace theme object references with CSS variables
- [ ] Convert breakpoint helpers to media queries
- [ ] Convert keyframes to CSS @keyframes
- [ ] Update component to use `className` instead of styled components
- [ ] Update imports (remove styled-components, add CSS Module)
- [ ] Run unit tests and update snapshots if needed
- [ ] Run screenshot tests to verify visual consistency
- [ ] Remove unused styled-component imports
- [ ] Update any tests that reference styled component names

## Resources

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [React Scripts CSS Modules Support](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/)
- [CSS Custom Properties (CSS Variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Migration Plan Jira Epic](https://openstax.atlassian.net/browse/CORE-1685)

## Questions?

If you have questions about migrating a specific component, please:
1. Check this guide for similar patterns
2. Look at already-migrated components for examples
3. Ask in the team chat or create a comment on the Jira epic
