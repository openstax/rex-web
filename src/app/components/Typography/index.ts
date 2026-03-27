/**
 * Typography Module Entry Point
 *
 * This module exports:
 * 1. Plain CSS components (H1-H6) - no styled-components dependencies
 * 2. Legacy styled-components css fragments for backward compatibility
 *
 * The legacy exports will be removed in a future phase once all call sites
 * have been migrated to use plain CSS.
 */

// Export plain CSS components (no styled-components dependencies)
export * from './Headings';

// Export legacy styled-components css fragments for backward compatibility.
// NOTE: These are kept in separate files to make it *possible* for consumers
// to avoid pulling in styled-components by importing only the non-legacy
// submodules (e.g., `./Headings`, `./Links`) and/or relying on tree-shaking.
export * from './Headings.legacy';
export * from './Typography.legacy';
