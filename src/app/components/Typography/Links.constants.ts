/**
 * Link Color Constants
 *
 * Single source of truth for link colors used across Typography components.
 * These constants are:
 * - Imported by Button.tsx (ButtonLink component) and bound as CSS variables
 * - Imported by Typography.legacy.ts for styled-components css fragments
 * - Imported by NavBar/index.tsx for focus outline color
 *
 * This module has no side effects (no React, no CSS imports).
 */

export const linkColor = '#027EB5';
export const linkHover = '#0064A0';
export const linkFocusOutline = '#007297';
