# Plain CSS Migration - Learnings & Best Practices

This document captures key learnings from the styled-components to plain CSS migration, documenting issues encountered and resolutions to help guide future migration phases.

## Table of Contents
1. [Migration Strategy](#migration-strategy)
2. [Module Structure & Dependencies](#module-structure--dependencies)
3. [CSS Variables & Theming](#css-variables--theming)
4. [Responsive Design & Media Queries](#responsive-design--media-queries)
5. [Testing Requirements](#testing-requirements)
6. [Code Organization](#code-organization)
7. [Checklist for Future Phases](#checklist-for-future-phases)

---

## Migration Strategy

### Hybrid Approach is Essential

**Issue**: Initially attempted to migrate everything at once, which would have broken hundreds of call sites across the codebase.

**Resolution**: Adopted a hybrid approach:
- **New component implementations** use plain CSS + React (no styled-components)
- **Legacy exports** temporarily retain styled-components `css` fragments for backward compatibility
- This allows incremental migration without breaking existing code

**Key Insight**: For large codebases, incremental migration beats "big bang" refactoring. The hybrid approach allows:
- Component implementation to be migrated first
- Call sites to be migrated gradually in future phases
- Legacy code to be clearly isolated and eventually removed

### Separate Legacy Code into `.legacy.ts` Files

**Issue**: Initially mixed legacy styled-components exports with new plain CSS components in the same files, forcing all consumers to pull in styled-components dependencies.

**Resolution**: Created separate `.legacy.ts` files:
- `Headings.legacy.ts` - Legacy heading styles (h3Style, h4Style, etc.)
- `Typography.legacy.ts` - Legacy text/link styles (textStyle, linkStyle, etc.)
- `Links.constants.ts` - Side-effect-free constants module

**Benefits**:
- ✅ Consumers of new components avoid styled-components dependencies
- ✅ Enables better tree-shaking (if importing from submodules)
- ✅ Creates clear boundary for legacy code removal in future phases
- ✅ Reduces module side effects

**For Future Phases**: Always separate legacy exports into dedicated `.legacy.ts` files when migrating components with existing styled-components usage.

---

## Module Structure & Dependencies

### Avoid Module Side Effects in Legacy Modules

**Issue**: `Typography.legacy.ts` initially imported from `Links.tsx`, which pulled in React and CSS imports as side effects. This defeated the purpose of isolating legacy code.

**Resolution**: Created `Links.constants.ts` as a side-effect-free constants module that both `Links.tsx` and `Typography.legacy.ts` can import from.

**Pattern**:
```typescript
// Links.constants.ts - No React, no CSS imports, just constants
export const linkColor = '#027EB5';
export const linkHover = '#0064A0';

// Links.tsx - Imports constants, has React/CSS
import { linkColor, linkHover } from './Links.constants';

// Typography.legacy.ts - Imports constants, no React/CSS side effects
import { linkColor, linkHover } from './Links.constants';
```

**For Future Phases**: When constants need to be shared between legacy and new code, extract them into a dedicated `.constants.ts` file with no side effects.

### Watch for Duplicate Export Conflicts

**Issue**: Using `export * from './Links'` and `export * from './Typography.legacy'` in `index.ts` caused duplicate exports of `linkColor`/`linkHover`, creating TypeScript build errors (TS2308).

**Resolution**: Use selective exports instead:
```typescript
// ❌ Bad - causes duplicate export conflicts
export * from './Links';
export * from './Typography.legacy';

// ✅ Good - selective exports avoid conflicts
export { DecoratedLink } from './Links';
export * from './Typography.legacy';
```

**For Future Phases**: Always use selective exports when multiple modules export the same names. Prefer explicit exports over `export *` when there's any risk of conflicts.

---

## CSS Variables & Theming

### CSS Variable Ordering Matters

**Issue**: CSS variables were set **after** spreading `...style`, preventing style prop from overriding them:
```typescript
// ❌ Bad - style prop can't override CSS variables
style={{
  ...style,
  '--text-color': theme.color.text.default,
}}
```

**Resolution**: Set CSS variables **before** spreading style prop:
```typescript
// ✅ Good - style prop can override CSS variables
style={{
  '--text-color': theme.color.text.default,
  ...style,
}}
```

**For Future Phases**: Always set CSS variables before `...style` to allow prop-based overrides for testing and theming.

### Always Provide CSS Variable Fallbacks

**Issue**: CSS variables without fallbacks can inherit unexpected values:
```css
/* ❌ Bad - no fallback */
.heading {
  color: var(--heading-text-color);
}
```

**Resolution**: Always provide fallbacks that match the theme:
```css
/* ✅ Good - fallback matches theme.color.text.default */
.heading {
  color: var(--heading-text-color, #424242);
}
```

**For Future Phases**: Every CSS variable reference should have a fallback value that matches the intended theme value.

### Single Source of Truth for Constants

**Issue**: Color constants were duplicated between TypeScript and CSS files:
```css
/* Links.css */
.link-style {
  color: #027EB5; /* ❌ Duplicated literal */
}
```

**Resolution**: Define constants in TypeScript, bind as CSS variables:
```typescript
// Links.constants.ts - Single source of truth
export const linkColor = '#027EB5';

// Links.tsx - Bind as CSS variable
style={{
  '--link-color': linkColor,
  ...style,
}}

// Links.css - Use CSS variable with fallback
.link-style {
  color: var(--link-color, #027EB5);
}
```

**For Future Phases**: Never duplicate constant values between TypeScript and CSS. Use the TypeScript → CSS variable binding pattern.

---

## CSS Best Practices

### Media Queries Must Be Top-Level in Plain CSS

**Issue (Phase 1.3)**: Nested `@media` rules inside class selectors are invalid in plain CSS and will be ignored by the browser.

**Problem**:
```css
/* ❌ Bad - nested @media is invalid in plain CSS */
.disable-print {
  @media print {
    display: none;
  }
}
/* This rule will be completely ignored! */
```

**Resolution**: Move media queries to the top level:
```css
/* ✅ Good - media query at top level */
@media print {
  .disable-print {
    display: none;
  }
}
```

**Note**: While CSS preprocessors (Sass, Less) and CSS-in-JS libraries (styled-components) support nested media queries, plain CSS does not. During migration, always restructure nested media queries to be top-level.

**For Future Phases**: When converting from styled-components, watch for nested media queries and restructure them to be top-level in plain CSS.

### Import Global CSS from App Entry, Not from Theme Module

**Issue (Phase 1.3)**: Importing CSS files from the theme module (`theme.ts`) creates global side effects that affect all consumers of the theme, including tests and SSR contexts.

**Problem**:
```typescript
// theme.ts
// ❌ Bad - creates side effects when importing theme
import './content/components/utils/utilities.css';

export const theme = { ... };
```

**Why This Is Problematic**:
- Makes `theme.ts` have global side effects
- Pulls CSS into test environments unnecessarily
- Can cause SSR rendering issues
- Violates separation of concerns (theme should be pure values)

**Resolution**: Import global CSS from the app entry point (`src/app/index.tsx`):
```typescript
// src/app/index.tsx
// ✅ Good - global CSS imported at app bootstrap
import './content/components/utils/utilities.css';

// ... rest of app setup
```

**Benefits**:
- ✅ `theme.ts` remains a pure values module
- ✅ CSS only loaded in browser/app context
- ✅ Tests can import theme without side effects
- ✅ Clear separation between values and global styles

**For Future Phases**: Always import global CSS files from the app entry point, not from shared modules like `theme.ts`.

### Avoid Duplicate CSS Imports Across Modules

**Issue (Phase 1.3)**: Importing the same CSS file from multiple modules creates redundant side effects and can lead to confusion about where CSS is actually loaded.

**Problem**:
```typescript
// utilities.css imported in both places:
// src/app/index.tsx
import './content/components/utils/utilities.css';

// src/app/content/components/utils/disablePrint.ts
// ❌ Bad - duplicate CSS import
import './utilities.css';

export const disablePrintClass = 'disable-print';
```

**Why This Is Problematic**:
- Creates confusion about where CSS is actually loaded
- Makes modules have unnecessary side effects
- Can pull CSS into test environments unexpectedly
- Violates the single import point principle

**Resolution**: Remove duplicate CSS imports from utility modules and rely on the app entry point:
```typescript
// src/app/index.tsx
// ✅ Good - single CSS import point
import './content/components/utils/utilities.css';

// src/app/content/components/utils/disablePrint.ts
// ✅ Good - no CSS import, pure module
// Note in comment that CSS is imported globally
/**
 * Note: The utilities.css file (which defines this class) is imported globally
 * from src/app/index.tsx. Do not import it here to avoid side effects.
 */
export const disablePrintClass = 'disable-print';
```

**For Future Phases**: Never import CSS files from utility modules that export constants. Import CSS once from the app entry point and document this in comments.

---

## React Component Patterns

### Implement Reference Counting for Global State Changes

**Issue (Phase 1.3)**: When migrating from styled-components `createGlobalStyle` to manual DOM manipulation with `useEffect`, multiple component instances can conflict with each other.

**Problem**: The original `ScrollLock` component used `createGlobalStyle` which automatically handled multiple instances. After migration to `useEffect` with body class manipulation, when multiple `ScrollLock` instances mount (e.g., modal + vertical nav), unmounting one instance removes the body class even though another is still active.

**Example of the Problem**:
```typescript
// ❌ Bad - breaks with multiple instances
function ScrollLock({ mediumScreensOnly }) {
  useEffect(() => {
    const className = mediumScreensOnly ? 'scroll-lock-medium' : 'scroll-lock';
    document.body.classList.add(className);

    return () => {
      // When ANY instance unmounts, class is removed!
      document.body.classList.remove(className);
    };
  }, [mediumScreensOnly]);
}
```

**Resolution**: Implement reference counting at module scope:
```typescript
// ✅ Good - tracks instances with reference counting
const scrollLockRefCounts = {
  standard: 0,
  mediumScreensOnly: 0,
};

function ScrollLock({ mediumScreensOnly }) {
  useEffect(() => {
    const lockType = mediumScreensOnly ? 'mediumScreensOnly' : 'standard';
    const className = mediumScreensOnly ? 'scroll-lock-medium' : 'scroll-lock';

    // Increment ref count and add class
    scrollLockRefCounts[lockType]++;
    document.body.classList.add(className);

    return () => {
      // Only remove class when last instance unmounts
      scrollLockRefCounts[lockType]--;
      if (scrollLockRefCounts[lockType] === 0) {
        document.body.classList.remove(className);
      }
    };
  }, [mediumScreensOnly]);
}
```

**Benefits**:
- ✅ Multiple instances can coexist safely
- ✅ Global state only cleaned up when truly no longer needed
- ✅ Matches behavior of `createGlobalStyle`
- ✅ Prevents scroll re-enabling bugs

**For Future Phases**: When migrating from `createGlobalStyle` or other global state management, consider whether multiple component instances can exist simultaneously. If so, implement reference counting to match the original behavior.

---

## Responsive Design & Media Queries

### Understanding rem vs em in Media Queries

**Issue (Phase 1.2)**: Initial breakpoint values were incorrect because raw `rem` values were used directly in media queries instead of converting to `em` units.

**Background**: The rex-web codebase uses a custom base font size:
- The `html` element has `font-size: 62.5%`, making `1rem = 10px` (62.5% of 16px default)
- However, media queries use `em` units based on the browser's default font size (typically 16px)
- This means `1rem = 10px` but `1em = 16px` in media query contexts

**Resolution**: Always use the `remsToEms()` conversion function when converting layout dimensions from `rem` to `em` for media queries:

```typescript
// Conversion formula
remsToEms = (rems) => rems * 10 / 16

// Example
contentWrapperMaxWidth = 128 // rem
breakpoint = remsToEms(128) = 128 * 10/16 = 80 // em
```

**Common Mistakes**:
```css
/* ❌ Bad - using rem value directly as em */
@media screen and (max-width: 128em) {
  /* This is actually 2048px, not 1280px! */
}

/* ✅ Good - converted using remsToEms() */
@media screen and (max-width: 80em) {
  /* Correctly evaluates to 1280px (80 * 16) */
}
```

**For Future Phases**: Always convert rem dimensions to em for media queries using the `remsToEms()` formula. Never use rem values directly as em values.

### Document Hard-Coded Breakpoint Calculations

**Issue (Phase 1.2)**: Media query breakpoints in CSS files are static values derived from TypeScript constants. If the constants change, the CSS breakpoints won't automatically update.

**Resolution**: Add comprehensive inline documentation in CSS files explaining:
1. The source constants from TypeScript
2. The step-by-step calculation
3. The conversion formula (rems * 10/16 = ems)
4. References to exported constant names
5. An explicit warning about maintenance

**Example Documentation Pattern**:
```css
/* Responsive breakpoints for sidebar width adjustment
 *
 * IMPORTANT: These breakpoint values are derived from constants in constants.ts:
 *
 * 90em = remsToEms(contentWrapperMaxWidth + verticalNavbarMaxWidth * 2)
 *      = remsToEms(128 + 8 * 2) = remsToEms(144) = 144 * 10/16 = 90em
 *      (exported as contentWrapperAndNavWidthBreakpoint)
 *
 * 80em = remsToEms(contentWrapperMaxWidth)
 *      = remsToEms(128) = 128 * 10/16 = 80em
 *      (exported as contentWrapperWidthBreakpoint)
 *
 * If constants.ts values change, these breakpoints MUST be updated accordingly.
 * The conversion formula is: rems * 10 / 16 = ems (because 1rem = 10px, 1em = 16px in media queries)
 */
@media screen and (max-width: 90em) {
  /* ... */
}

@media screen and (max-width: 80em) {
  /* ... */
}
```

**Why Not CSS Variables?**: CSS variables cannot be used in media query breakpoints because the CSS specification requires them to be static values. The TypeScript exports are still maintained for use elsewhere in the codebase.

**For Future Phases**: When using calculated breakpoints in CSS files, always add comprehensive documentation showing the derivation from TypeScript constants.

### Verify Breakpoint Constants Match Theme

**Issue (Phase 1.2)**: Easy to accidentally use incorrect breakpoint values when migrating from theme.breakpoints to plain CSS.

**Resolution**: Always verify breakpoint values against the original theme definitions:
- `theme.breakpoints.mobile()` → `@media screen and (max-width: 75em)`
- `theme.breakpoints.mobileMedium()` → `@media screen and (max-width: 50em)`

Cross-reference the original styled-components code to ensure the media query logic is identical.

**For Future Phases**: Create a table mapping all theme.breakpoints values to their CSS equivalents and verify each migration against it.

---

## Redux Integration Patterns

### Upgrade from connect() HOC to Hooks

**Issue (Phase 1.2)**: When migrating components that use Redux's `connect()` HOC, the HOC passes a `dispatch` prop that can leak to DOM elements when using `...props` spreading.

**Warning Signs**:
- React warnings about invalid DOM props (e.g., "Warning: React does not recognize the `dispatch` prop on a DOM element")
- TypeScript errors about unused parameters
- Unexpected props appearing on DOM elements

**Resolution**: Replace `connect()` HOC with Redux hooks (`useSelector`, `useDispatch`):

**Before (connect HOC)**:
```typescript
import { connect } from 'react-redux';

const Wrapper = ({ hasQuery, verticalNavOpen, children, ...props }) => (
  <div {...props}> {/* dispatch leaks to DOM here */}
    {children}
  </div>
);

export default connect(
  (state: AppState) => ({
    hasQuery: !!selectSearch.query(state),
    verticalNavOpen: contentSelectors.mobileMenuOpen(state),
  })
)(Wrapper);
```

**After (hooks)**:
```typescript
import { useSelector } from 'react-redux';

// Named export for testing - accepts props directly
export const Wrapper = ({ verticalNavOpen, children, ...props }) => (
  <div {...props}>
    {children}
  </div>
);

// Default export with Redux hooks - selects state internally
const WrapperConnected = ({ children, ...props }) => {
  const verticalNavOpen = useSelector((state: AppState) =>
    contentSelectors.mobileMenuOpen(state)
  );

  return <Wrapper verticalNavOpen={verticalNavOpen} {...props}>{children}</Wrapper>;
};

export default WrapperConnected;
```

**Benefits**:
- ✅ No `dispatch` prop leaking to DOM elements
- ✅ Cleaner separation of concerns (state selection vs presentation)
- ✅ Easier to test (named export accepts props directly)
- ✅ Modern React patterns (hooks are the recommended approach)
- ✅ Better TypeScript inference

**For Future Phases**: Whenever you edit a component that uses `connect()`, take the opportunity to upgrade it to hooks. This is especially important when migrating to plain CSS, as you're already touching the component structure.

---

## Testing Requirements

### Wrap Migrated Components with styled() for Component Selector Compatibility

**Issue (Phase 1.4)**: When migrating icon components from `styled-icons` to inline SVG components, snapshot tests failed with `PrettyFormatPluginError: undefined:342:115: missing '}'` and warnings like "DotMenuIcon is not a styled component and cannot be referred to via component selector."

**Root Cause**: Many existing styled-components use **component selectors** to target icons and other components in their CSS:

```typescript
// Example from ContextMenu.tsx
const StyledContextMenu = styled.div`
  ${MenuToggle} {
    float: right;
    margin-right: 0.2rem;
  }
`;

// Example from TableOfContents
const StyledSummary = styled(Summary)`
  &[data-expanded] > div ${ExpandIcon} {
    display: none;
  }
`;
```

Component selectors (`${Component}`) only work when the component is created with `styled()` or is a styled-component. When we migrated icons to plain React function components, these selectors broke, causing:
1. Runtime warnings: "Component is not a styled component"
2. Test failures: The `jest-styled-components` snapshot serializer failed to parse the generated CSS

**Resolution**: Wrap migrated components with `styled()` using an empty template literal:

```typescript
// ❌ Bad - Plain function component breaks component selectors
export function DotMenuIcon({ className, ...props }: React.SVGAttributes<SVGSVGElement>) {
  return <svg className={className} {...props}>...</svg>;
}

// ✅ Good - Wrapped with styled() for component selector compatibility
function DotMenuIconBase({ className, ...props }: React.SVGAttributes<SVGSVGElement>) {
  return <svg className={className} {...props}>...</svg>;
}

export const DotMenuIcon = styled(DotMenuIconBase)``;
```

The empty template literal (` `` `) means no additional styles are added - the component retains its original implementation but becomes a styled-component that can be referenced in component selectors.

**Components Fixed in Phase 1.4**:
- `DotMenuIcon` and `DotMenuToggle` in `DotMenu.tsx`
- `ExpandIcon` and `CollapseIcon` in `Details.tsx`
- `Checkbox` in `Checkbox.tsx`

**Benefits**:
- ✅ Eliminates styled-components warnings
- ✅ Fixes snapshot test failures
- ✅ Preserves existing CSS selector behavior
- ✅ No visual changes
- ✅ No breaking changes to API
- ✅ Maintains goal of migrating away from `styled-icons` while preserving compatibility with existing codebase patterns

**For Future Phases**: Before migrating a component, search the codebase for component selector usage (search for `${ComponentName}`). If the component is used in any component selectors, wrap it with `styled()` using an empty template literal to maintain compatibility.

### Filter Transient Props to Prevent DOM Attribute Leakage

**Issue (Phase 2.1)**: When migrating button components, styled-components using **transient props** (props prefixed with `$`) would pass those props to the underlying plain React component, which would then spread them to the DOM as invalid HTML attributes, causing React warnings and potentially breaking functionality.

**Root Cause**: Styled-components automatically filters out transient props (any prop starting with `$`) to prevent them from being forwarded to the DOM. However, when a plain React component is wrapped with `styled()`, the component still receives all props including the transient ones. If the component spreads `{...props}` directly to a DOM element, the transient props leak through as invalid HTML attributes.

**Example Problem**:
```typescript
// CloseButton styled component with transient prop
export const CloseButton = styled(PlainButton)<{ $variant?: ToastVariant }>`
  color: ${({ $variant }) => $variant === 'warning' ? warningColor : defaultColor};
`;

// PlainButton implementation (BEFORE fix)
export const PlainButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function PlainButton({ className, ...props }, ref) {
    return (
      <button
        {...props}  // ❌ This spreads $variant to the DOM!
        ref={ref}
        className={classNames('plain-button', className)}
      />
    );
  }
);

// Result: <button $variant="warning">Close</button> ❌ Invalid HTML attribute!
```

**Resolution**: Filter out transient props (any prop starting with `$`) before spreading to DOM elements:

```typescript
// PlainButton implementation (AFTER fix)
export const PlainButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function PlainButton({ className, ...props }, ref) {
    // Filter out transient props (starting with $) to prevent them from being forwarded to the DOM
    // Styled-components uses transient props for style-only props that shouldn't appear as HTML attributes
    const safeProps = Object.keys(props).reduce((acc, key) => {
      if (!key.startsWith('$')) {
        acc[key] = props[key];
      }
      return acc;
    }, {} as Record<string, any>) as React.ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button
        {...safeProps}  // ✅ Only safe props are spread to DOM
        ref={ref}
        className={classNames('plain-button', className)}
      />
    );
  }
);
```

**Important Note - ES2017 Compatibility**: The example above uses `Object.keys().reduce()` instead of `Object.fromEntries()` for ES2017 compatibility. While `Object.fromEntries()` is cleaner and was suggested by Copilot, it requires ES2019+ and will cause TypeScript compilation errors if your `tsconfig.json` targets ES2017 or ES2018. The `reduce` approach achieves the same result while maintaining compatibility with older ES targets.

**Impact**:
- ✅ Prevents invalid HTML attributes in the DOM
- ✅ Eliminates React warnings about unknown DOM properties
- ✅ Maintains full styled-components compatibility for wrapped components
- ✅ Follows styled-components best practices for transient props

**When to Apply This Pattern**:
- Any plain React component that spreads `{...props}` to a native DOM element (`<button>`, `<div>`, `<input>`, etc.)
- Components that are wrapped with `styled()` for component selector compatibility
- Base components that may be used by styled-components with transient props

**For Future Phases**: When migrating components that spread props to DOM elements, always filter out transient props (keys starting with `$`) to prevent DOM attribute leakage. This is especially important for "base" components that are designed to be wrapped with styled-components.

### Test All Heading Levels

**Issue**: Initial tests only covered H1-H3, missing H4-H6.

**Resolution**: Added comprehensive tests for all heading components (H1-H6) with:
- Snapshot tests for basic rendering
- Custom className tests
- Custom style tests
- Additional HTML attributes (id, data-testid, role, aria-label, etc.)

**For Future Phases**: When migrating components with variations (like H1-H6), ensure test coverage for ALL variations, not just a subset.

### Test All Branching Logic

**Issue**: `DecoratedLink` component's `handleClick` method had multiple branches, all initially untested.

**Resolution**: Created comprehensive tests covering:
- onClick behavior (with/without onClick prop)
- Disabled state behavior (preventDefault, no navigation)
- Disabled state attributes (href removal, tabIndex, aria-disabled)
- className composition
- Style prop merging
- Props spreading

**Pattern for Testing Event Handlers**:
```typescript
it('prevents default and does not call onClick when disabled', () => {
  const onClick = jest.fn();
  const component = renderer.create(
    <DecoratedLink onClick={onClick} disabled>Test</DecoratedLink>
  );

  const mockEvent = { preventDefault: jest.fn() };

  renderer.act(() => {
    component.root.findByType('a').props.onClick(mockEvent);
  });

  expect(onClick).not.toHaveBeenCalled();
  expect(mockEvent.preventDefault).toHaveBeenCalled();
});
```

**For Future Phases**: For components with conditional logic, create tests that explicitly verify each branch. Use jest mocks to verify function calls and event handling.

---

## TypeScript and React Best Practices

### Use classnames Package for className Composition

**Issue (Phase 1.3)**: Using string template literals or concatenation for className composition can produce trailing whitespace and makes the code less clean.

**Problem with String Concatenation**:
```typescript
// ❌ Bad - produces trailing whitespace when className is undefined
<div className={`base-class ${className || ''}`}>
  {/* className will be "base-class " with trailing space */}
</div>

// ❌ Also bad - harder to read with conditionals
<div className={`base-class ${isActive ? 'active' : ''} ${className || ''}`}>
</div>
```

**Resolution**: Use the `classnames` package (already a dependency in rex-web) for clean className composition:

```typescript
import classNames from 'classnames';

// ✅ Good - no trailing whitespace, clean syntax
<div className={classNames('base-class', className)}>
  {/* className will be "base-class" when className is undefined */}
</div>

// ✅ Good - supports conditionals cleanly
<div className={classNames('base-class', { active: isActive }, className)}>
</div>

// ✅ Good - supports arrays
<div className={classNames(['base-class', 'another-class'], className)}>
</div>
```

**Benefits**:
- ✅ No trailing whitespace in rendered output
- ✅ Cleaner snapshot tests
- ✅ Better support for conditional classes
- ✅ More maintainable code
- ✅ Already a dependency in the project

**For Future Phases**: Always use `classNames` from the `classnames` package for className composition instead of string concatenation or template literals.

### Prefer Normal Functions Over React.FC

**Issue (Phase 1.3)**: Using `React.FC` (React.FunctionComponent) for component definitions is no longer recommended in the React community.

**Resolution**: Use normal function declarations with TypeScript type annotations:

**Before (React.FC)**:
```typescript
// ❌ Avoid - React.FC is no longer recommended
export const MyComponent: React.FC<MyProps> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};
```

**After (normal function)**:
```typescript
// ✅ Preferred - Normal function with type annotations
export function MyComponent({ prop1, prop2 }: MyProps) {
  return <div>{prop1}</div>;
}
```

**Benefits**:
- ✅ Simpler and more idiomatic TypeScript
- ✅ Better matches modern React documentation
- ✅ Easier to refactor and maintain
- ✅ No implicit `children` prop (more explicit typing)
- ✅ Better support for generic components

**For Future Phases**: Always use normal function declarations instead of `React.FC` when creating or migrating React components.

### Use React.forwardRef for Components That Receive Refs

**Issue (Phase 1.3)**: When converting components from `React.FC` to normal functions, components that receive refs must use `React.forwardRef`.

**Context**: Function components require `React.forwardRef` to accept refs in React versions through 18. Rex-web uses React 16, which definitely requires this wrapper. (Note: React 19+ introduces experimental ref-as-prop behavior, but this is not yet stable or widely adopted.)

**Warning Signs**:
- Test warnings: "Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?"
- Components used with `ref={...}` prop in styled-components wrappers
- Components that need to expose DOM element references to parent components

**Resolution**: Use `React.forwardRef` wrapper for components that receive refs:

**Before (no forwardRef)**:
```typescript
// ❌ Causes warning when ref is passed
export function Details({
  children,
  className,
  ...props
}: React.DetailsHTMLAttributes<HTMLDetailsElement>) {
  return (
    <details className={className} {...props}>
      {children}
    </details>
  );
}
```

**After (with forwardRef)**:
```typescript
// ✅ Properly forwards ref to DOM element
export const Details = React.forwardRef<
  HTMLDetailsElement,
  React.DetailsHTMLAttributes<HTMLDetailsElement>
>(function Details({ children, className, ...props }, ref) {
  return (
    <details ref={ref} className={className} {...props}>
      {children}
    </details>
  );
});
```

**Pattern Notes**:
- The display name function (`function Details`) helps with debugging and DevTools
- Generic types: `React.forwardRef<RefType, PropsType>`
- First parameter is the ref type (e.g., `HTMLDetailsElement`)
- Second parameter is the props type
- Always pass `ref` to the appropriate DOM element

**For Future Phases**: When migrating components, check if they're used with refs anywhere in the codebase. If so, use `React.forwardRef` wrapper to avoid warnings and ensure proper ref forwarding.

### Always Import HTML Element Types Explicitly

**Issue (Phase 1.3)**: When using specific HTML element types (like `HTMLDetailsElement`, `HTMLDivElement`, etc.) in TypeScript, our environment requires explicit imports.

**Resolution**: Import HTML element types from `@openstax/types/lib.dom`:

```typescript
// ✅ Good - Explicit import of HTML element type
import { HTMLDetailsElement } from '@openstax/types/lib.dom';

export function Details({
  children,
  className,
  ...props
}: React.DetailsHTMLAttributes<HTMLDetailsElement>) {
  return (
    <details className={className} {...props}>
      {children}
    </details>
  );
}
```

**Why This Matters**:
- Our TypeScript environment requires these imports to be explicit
- All HTML element type imports should be grouped together at the top of the file
- This ensures proper type checking and IDE support

**For Future Phases**: When using specific HTML element types in component props, always import them explicitly from `@openstax/types/lib.dom`.

### Extend HTML Attributes for Form Components

**Issue (Phase 1.4)**: When creating form components like `Checkbox`, defining a restrictive props interface prevents consumers from passing standard HTML input attributes like `aria-label`, `aria-selected`, `name`, `id`, `data-*`, etc.

**Problem**:
```typescript
// ❌ Bad - Too restrictive, doesn't allow standard input attributes
interface CheckboxProps {
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  children?: React.ReactNode;
}

// This causes TypeScript errors at call sites:
<Checkbox
  checked={selected}
  disabled={disabled}
  onChange={handleChange}
  aria-label={ariaLabel}  // ❌ Type error!
  aria-selected={selected} // ❌ Type error!
/>
```

**Resolution**: Extend `React.InputHTMLAttributes<HTMLInputElement>` and omit only the attributes you want to override or prevent:

```typescript
// ✅ Good - Extends all standard input attributes
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children?: React.ReactNode;
}

// Now all standard input attributes work:
<Checkbox
  checked={selected}
  disabled={disabled}
  onChange={handleChange}
  aria-label={ariaLabel}      // ✅ Works!
  aria-selected={selected}     // ✅ Works!
  name="myCheckbox"            // ✅ Works!
  id="checkbox-1"              // ✅ Works!
  data-testid="my-checkbox"    // ✅ Works!
/>
```

**Why Omit `type`**: We omit `type` from the base `InputHTMLAttributes` because the component always renders `type="checkbox"` and we don't want consumers to override this.

**Benefits**:
- ✅ Supports all standard HTML input attributes out of the box
- ✅ Better TypeScript experience for consumers
- ✅ Reduces need to update the interface when new attributes are needed
- ✅ Matches React best practices for form components
- ✅ Enables proper accessibility attributes (ARIA)

**For Future Phases**: When creating form components (checkboxes, radio buttons, text inputs, etc.), always extend the appropriate `React.*HTMLAttributes` type and only omit attributes you explicitly want to prevent or override.

### Remove Unused State Variables and Effects

**Issue (Phase 1.3)**: During migration from class components to functional components, sometimes state variables are converted but never actually used.

**Example - Unused State**:
```typescript
// ❌ Bad - componentMounted is set but never used
const [componentMounted, setComponentMounted] = useState(false);

useEffect(() => {
  // ... setup code ...
  setComponentMounted(true); // Set but never read
}, []);
```

**Resolution**: Remove unused state variables:
```typescript
// ✅ Good - No unused state
useEffect(() => {
  // ... setup code ...
  // No need to track mounted state if it's not used
}, []);
```

**For Future Phases**: After converting class components to functional components, review all state variables and ensure they're actually being used. Remove any that are set but never read.

---

## Code Organization

### Eliminate Duplication Through Base Components

**Issue**: H1-H6 components had 69 lines of nearly identical code, differing only in tag name and CSS class.

**Resolution**: Created a base `Heading` component that accepts `tag` and `cssClass` parameters:
```typescript
function Heading({
  tag: Tag,
  cssClass,
  children,
  className,
  style,
  ...props
}: HeadingProps & {
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  cssClass: string;
}) {
  return (
    <Tag
      {...props}
      className={classNames('typography-heading', cssClass, className)}
      style={{
        '--heading-text-color': theme.color.text.default,
        ...style,
      } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

export function H1(props: HeadingProps) {
  return <Heading tag="h1" cssClass="typography-h1" {...props} />;
}
```

**For Future Phases**: When you find yourself copy-pasting component code with only minor variations, create a base component that accepts the varying parts as parameters.

### Clean Up Unused CSS

**Issue**: `TextStyles.css` defined utility classes that were never referenced in the codebase.

**Resolution**: Removed unused classes and added a clear comment explaining:
- Why the classes were removed
- Where the legacy equivalents are located
- Why the file still exists (to prevent import errors)

**For Future Phases**: During migration, actively search for and remove dead CSS. If a CSS file becomes empty, keep it with a comment to prevent import errors until all references can be updated.

### Comment Tree-Shaking Implications

**Issue**: Comments about tree-shaking benefits were misleading when all exports were re-exported through the main entry point.

**Resolution**: Added clear comments explaining the actual tree-shaking behavior:
```typescript
// Export legacy styled-components css fragments for backward compatibility.
// NOTE: These are kept in separate files to make it *possible* for consumers
// to avoid pulling in styled-components by importing only the non-legacy
// submodules (e.g., `./Headings`, `./Links`) and/or relying on tree-shaking.
```

**For Future Phases**: Be explicit about module loading behavior. Don't claim tree-shaking benefits unless they're actually achievable by consumers.

---

## Checklist for Future Phases

Use this checklist when migrating additional components from styled-components to plain CSS:

### Planning
- [ ] Identify all components to migrate
- [ ] Identify all existing styled-components exports (css fragments, style utilities)
- [ ] Identify all call sites that use these exports
- [ ] Plan hybrid approach: new implementations + legacy exports

### Implementation
- [ ] Create plain CSS files for component styles
- [ ] Ensure all `@media` queries are at the top level, not nested inside class selectors
- [ ] Create React components that use plain CSS classes
- [ ] Use `classnames` package for all className composition (no string concatenation)
- [ ] Use normal function declarations instead of `React.FC` for all components
- [ ] Use `React.forwardRef` for components that receive refs (check for `ref={...}` usage in codebase)
- [ ] Import HTML element types explicitly from `@openstax/types/lib.dom` when needed
- [ ] Bind theme values as CSS variables (set before `...style`)
- [ ] Add CSS variable fallbacks in CSS files
- [ ] Import global CSS files from app entry point (`src/app/index.tsx`), not from `theme.ts` or utility modules
- [ ] Avoid duplicate CSS imports across multiple modules
- [ ] When migrating `createGlobalStyle`, implement reference counting if multiple instances can coexist
- [ ] Extract shared constants into `.constants.ts` files (no side effects)
- [ ] Create `.legacy.ts` files for backward-compatible styled-components exports
- [ ] Use selective exports in index files to avoid conflicts
- [ ] Upgrade Redux `connect()` to hooks (`useSelector`, `useDispatch`) when editing connected components
- [ ] Remove unused state variables and effects after converting from class components

### Testing
- [ ] Add snapshot tests for all component variations
- [ ] Test all conditional logic branches
- [ ] Test disabled states (if applicable)
- [ ] Test className composition
- [ ] Test style prop merging
- [ ] Test props spreading
- [ ] Verify tests run with correct Node version (14.x for rex-web)

### Code Quality
- [ ] Eliminate code duplication (consider base components)
- [ ] Remove unused CSS classes
- [ ] Add clear comments explaining legacy code and tree-shaking
- [ ] Verify no duplicate exports
- [ ] Ensure CSS variables are set before style spread
- [ ] Verify single source of truth for constants

### Documentation
- [ ] Update PR description with hybrid approach explanation
- [ ] Document what was migrated vs. what remains for future phases
- [ ] Note any pre-existing issues that were fixed
- [ ] Update this learnings document with new insights

### CI/CD
- [ ] Verify TypeScript compilation succeeds
- [ ] Run unit tests
- [ ] Run browser tests
- [ ] Run screenshot tests for visual regression
- [ ] Check for linter errors

---

## Icon Migration from styled-icons to Inline SVG

### Always Wrap Icon Components with styled()

**Issue (Phase 1.4)**: Components that use styled-components component selectors (e.g., `${Checkbox} { padding: 0.8rem; }`) will break if the referenced component is not a styled-component.

**Problem**: After migrating a component to plain CSS/React, existing styled-components that reference it with component selectors will fail with snapshot test errors or runtime errors.

**Resolution**: Wrap all migrated icon components with `styled()`, even if they have no styles:

```typescript
// Icon base component
function ChevronLeftIconBase({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="..." />
    </svg>
  );
}

// ✅ Wrap with styled() to enable component selector references
export const ChevronLeftIcon = styled(ChevronLeftIconBase)``;
```

**Benefits**:
- ✅ Maintains compatibility with existing component selector usage
- ✅ Allows gradual migration without breaking existing styled-components
- ✅ Empty template literal adds no runtime overhead

**For Future Phases**: Always wrap migrated components with `styled()` if they're referenced in component selectors anywhere in the codebase.

### Establish Consistent Icon Component Pattern

**Pattern (Phases 1.4 & 1.5)**: All icon components follow the same structure to ensure consistency:

```typescript
interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
  size?: number | string; // Optional, if needed
}

/**
 * [Icon name] icon component.
 * SVG path from [Font Awesome/Boxicons] (https://[source] - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function IconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="..." // Appropriate viewBox for the icon
      aria-hidden="true"
      {...props}
    >
      <path fill="currentColor" d="..." />
    </svg>
  );
}

export const Icon = styled(IconBase)``;
```

**Key Elements**:
1. **IconProps interface** - Extends `React.SVGAttributes<SVGSVGElement>` for full SVG prop support
2. **Documentation comment** - Includes icon source and MIT license attribution
3. **aria-hidden="true"** - Icons are decorative, hidden from screen readers
4. **fill="currentColor"** - Inherits text color from parent element
5. **{...props}** spread - Allows custom SVG attributes
6. **styled() wrapper** - Enables component selector compatibility

**For Future Phases**: Follow this exact pattern for all icon migrations to ensure consistency across the codebase.

### Handle .ts Files That Need JSX

**Issue (Phase 1.5)**: TypeScript `.ts` files cannot contain JSX syntax. Attempting to add inline SVG components to a `.ts` file will cause compilation errors.

**Problem**: When migrating icons in utility files with `.ts` extension, you cannot create JSX components inline.

**Resolution Options**:

1. **Re-use existing icon components** (preferred):
```typescript
// NudgeStudyTools/styles.ts
import Times from '../../../components/Times';  // ✅ Import existing icon
```

2. **Convert file to `.tsx`** (if appropriate):
- Only if the file's purpose justifies having JSX
- Update all imports across the codebase

3. **Create separate icon file**:
```typescript
// icons/TimesIcon.tsx - New file
export const TimesIcon = styled(TimesIconBase)``;

// styles.ts - Import from icon file
import { TimesIcon } from './icons/TimesIcon';
```

**For Future Phases**: Before creating new icon components, check if an equivalent already exists in the `src/assets/` or `src/app/components/` directories. Re-use existing icons when possible.

### MIT-Licensed Icon Sources

**Icon Sources (Phases 1.4 & 1.5)**: All icons are sourced from MIT-licensed libraries:

- **Font Awesome Free** (https://fontawesome.com) - MIT License
  - Used for: Print, Edit, ExternalLinkAlt, TrashAlt, Check, Times, Hamburger, AngleLeft, AngleDown, TimesCircle, social media icons
- **Boxicons** (https://boxicons.com) - MIT License
  - Used for: ChevronLeft, ChevronRight

**Pattern for Attribution**:
```typescript
/**
 * [Icon name] icon component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 */
```

**For Future Phases**: Always include source attribution in comments and verify the license is MIT-compatible before using icon SVG paths.

---

## Summary

The styled-components to plain CSS migration has successfully migrated Typography (Phase 1.1) and Container/Layout (Phase 1.2) components while maintaining backward compatibility. Key success factors:

1. **Hybrid Approach** - Incremental migration without breaking existing code
2. **Clear Separation** - Legacy code isolated in `.legacy.ts` files
3. **Comprehensive Testing** - All variations and branches covered
4. **Module Hygiene** - Side-effect-free constants, no duplicate exports
5. **CSS Best Practices** - Variables with fallbacks, single source of truth
6. **Code Quality** - Eliminated duplication through base components
7. **Responsive Design** - Proper rem/em conversion, documented breakpoint calculations

### Phase-Specific Highlights

**Phase 1.1 (Typography)**: Established the hybrid migration pattern, module structure, and CSS variable binding approach.

**Phase 1.2 (Container/Layout)**: Addressed responsive design complexities, particularly the rem/em conversion requirement for media queries and the importance of documenting hard-coded breakpoint values.

**Phase 1.3 (Utility Components)**: Established TypeScript and React best practices, including preferring normal functions over React.FC, using the classnames package for className composition, ensuring media queries are top-level in CSS, importing global CSS from app entry point instead of theme module or utility modules, implementing reference counting for components that manipulate global state (to handle multiple instances), explicitly importing HTML element types, and removing unused state variables during class-to-functional component conversions.

**Phase 1.4 (Icons - Part 1)**: Migrated Details component icons (CaretRight, CaretDown), Checkbox, DotMenu, and GoToTopButton from styled-icons to inline SVG. Established the icon migration pattern: create inline SVG components with proper TypeScript types, wrap with `styled()` for component selector compatibility, use `currentColor` for fill to inherit text color, and maintain `aria-hidden` for accessibility. Learned that components used with styled-components component selectors (e.g., `${Checkbox}`) must be wrapped with `styled()`, even if they don't have styles themselves. Addressed styled-components testing compatibility by wrapping migrated inline SVG components with `styled()` to support component selectors used throughout the codebase. Established the pattern of extending `React.*HTMLAttributes` for form components to ensure all standard HTML attributes are supported without manually defining each one.

**Phase 1.5 (Icons - Part 2)**: Completed icon migration by migrating all remaining icons (navigation, UI, highlights, footer) from styled-icons to inline SVG. Key learning: `.ts` files cannot contain JSX/TSX code—either convert to `.tsx` or re-use existing icon components. Successfully migrated 11 files covering 20+ icon components while maintaining backward compatibility through Details.legacy.ts. Created shared icon components (e.g., Times icon) to avoid duplication across the codebase.

**Phase 2.1 (Button System)**: Addressed transient prop filtering to prevent DOM attribute leakage when plain React components are wrapped with styled-components. Established the pattern of filtering props starting with `$` before spreading to DOM elements, which is critical for base components designed to be wrapped with styled-components. Also improved polymorphic typing for components that accept a `component` prop for rendering as different element types.

These patterns and practices should serve as a foundation for future migration phases, helping to avoid the issues encountered and streamlining the migration process.
