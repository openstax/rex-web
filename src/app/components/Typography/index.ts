/**
 * Typography Module Entry Point
 *
 * This module exports plain CSS components (H1-H6) with no styled-components dependencies.
 */

// Export plain CSS components (no styled-components dependencies)
export * from './Headings';

export const textRegularLineHeight = 2.5;

// Export link color constants (dependency-free module)
export { linkColor, linkHover } from './Links.constants';
