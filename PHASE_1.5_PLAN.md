# Phase 1.5: Remaining Icon Components Migration

This PR continues the icon migration work started in Phase 1.4 (#2818).

## Scope

Migrate the remaining icon components from `styled-icons` to inline SVG components with plain CSS styling.

## Components to Migrate

Based on the original Phase 1.4 plan, the following components still need migration:

### Toolbar Icons
- [ ] `Toolbar` component icons (print, search, highlights, etc.)
- Files: `src/app/content/components/Toolbar/`

### Topbar Icons
- [ ] `Topbar` navigation icons
- Files: `src/app/components/Topbar/`

### Navigation Icons
- [ ] `PrevNextBar` navigation arrows
- Files: `src/app/content/components/PrevNextBar/`

### Content Icons
- [ ] `BookBanner` icons
- Files: `src/app/content/components/BookBanner/`

### Highlights Icons
- [ ] Highlights feature icons (beyond DotMenu already migrated)
- Files: `src/app/content/highlights/components/`

### Filter Icons
- [ ] Filter components icons
- Files: `src/app/content/components/popUp/`

### Footer Icons
- [ ] Social media icons (Facebook, Instagram, LinkedIn)
- Files: `src/app/components/Footer/` or similar

## Migration Pattern

Following the established pattern from Phase 1.4:

1. **Create inline SVG components** - Extract SVG paths from Font Awesome/Boxicons (MIT licensed)
2. **Wrap with styled()** - Use `styled(ComponentBase)` with empty template to support component selectors
3. **Create CSS files** - Define styles using CSS custom properties with fallback values
4. **Maintain backward compatibility** - Ensure no breaking changes to existing consumers

## Key Learnings from Phase 1.4

1. **Wrap all migrated components with `styled()`** to support component selector usage throughout the codebase
2. **Extend `React.*HTMLAttributes`** for form/interactive components to support all standard HTML attributes
3. **Verify TypeScript compilation** before committing to catch type errors early
4. **Document pattern changes** in PLAIN_CSS_MIGRATION_LEARNINGS.md

## Success Criteria

- [ ] All remaining icon components migrated to inline SVG + CSS
- [ ] No `styled-icons` imports remaining in content/component files
- [ ] All TypeScript compilation passes
- [ ] All unit tests pass
- [ ] All snapshot tests pass
- [ ] Visual regression tests show no changes
- [ ] PLAIN_CSS_MIGRATION_LEARNINGS.md updated with Phase 1.5 insights

## Dependencies

This PR depends on Phase 1.4 (#2818) being merged first.
