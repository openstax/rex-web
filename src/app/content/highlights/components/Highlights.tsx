/**
 * Re-export shim for backward-compatible import paths
 *
 * This file maintains the original import path while delegating to the
 * legacy styled-components wrapper. This ensures existing imports continue
 * to work without modification.
 *
 * Migration path:
 * - Highlights.new.tsx: Plain React implementation (no styled-components)
 * - Highlights.legacy.tsx: Styled wrapper with print styles
 * - Highlights.tsx: This re-export shim (current file)
 *
 * Note: The legacy wrapper is still needed because it uses component selectors
 * to target HighlightWrapper from SectionHighlights.tsx, which is still a
 * styled component. Once SectionHighlights is migrated, the print styles can
 * move to plain CSS.
 */

export { default } from './Highlights.legacy';
