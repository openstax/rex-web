/**
 * Re-export shim for backward-compatible import paths
 *
 * This file maintains the original import path while delegating to the
 * legacy styled-components wrappers. This ensures existing imports continue
 * to work without modification.
 *
 * Migration path:
 * - HighlightListElement.new.tsx: Plain CSS/React implementation
 * - HighlightListElement.legacy.tsx: Styled-components wrappers
 * - HighlightListElement.tsx: This re-export shim (current file)
 */

export { default, HighlightOuterWrapper, HighlightContentWrapper } from './HighlightListElement.legacy';
