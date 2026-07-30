/**
 * Typography Module Entry Point
 *
 * This module exports plain CSS components (H1-H6) with no styled-components dependencies.
 *
 * For legacy styled-components css fragments and constants, import from:
 * - './Typography.legacy' for textStyle, textRegularLineHeight
 * - './Links.constants' for linkColor, linkHover (dependency-free)
 */

// Export plain CSS components (no styled-components dependencies)
export * from './Headings';

// Export link color constants (dependency-free module)
export { linkColor, linkHover } from './Links.constants';

// Re-export legacy constants and css fragments for backward compatibility
// These are kept in separate .legacy files to avoid pulling styled-components
// into modules that only need the plain CSS components
export { textRegularLineHeight, textStyle } from './Typography.legacy';
