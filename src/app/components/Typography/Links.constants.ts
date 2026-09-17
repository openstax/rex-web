/**
 * Link Color Constants
 *
 * Re-exported from `app/themeData`, which is the single source of truth and the
 * origin of the `--color-link-*` CSS tokens. This module remains the import site
 * for JS consumers:
 * - Button.tsx (ButtonLink component) binds them as CSS variables
 * - Typography.legacy.ts uses them in styled-components css fragments
 * - NavBar/index.tsx uses linkFocusOutline for its focus outline color
 *
 * Stylesheets must not hand-copy these values; use var(--color-link),
 * var(--color-link-hover) or var(--color-link-focus-outline) instead.
 *
 * This module has no side effects (no React, no CSS imports).
 */
import { linkColors } from '../../themeData';

export const linkColor = linkColors.base;
export const linkHover = linkColors.hover;
export const linkFocusOutline = linkColors.focusOutline;
