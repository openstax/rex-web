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
- [ ] Create React components that use plain CSS classes
- [ ] Bind theme values as CSS variables (set before `...style`)
- [ ] Add CSS variable fallbacks in CSS files
- [ ] Extract shared constants into `.constants.ts` files (no side effects)
- [ ] Create `.legacy.ts` files for backward-compatible styled-components exports
- [ ] Use selective exports in index files to avoid conflicts
- [ ] Upgrade Redux `connect()` to hooks (`useSelector`, `useDispatch`) when editing connected components

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

These patterns and practices should serve as a foundation for future migration phases, helping to avoid the issues encountered and streamlining the migration process.
