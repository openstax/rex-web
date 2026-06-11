/**
 * Legacy styled-components wrappers for HighlightListElement
 *
 * This file provides backward-compatible styled-component wrappers around
 * the new plain CSS/React implementations. This allows existing code that
 * uses component selectors (e.g., ${HighlightContentWrapper}) to continue
 * working during the migration period.
 */

import styled from 'styled-components/macro';
import * as NewComponents from './HighlightListElement.new';

// Re-export the default component directly
export { default } from './HighlightListElement.new';

// Provide styled-component wrappers for named exports
export const HighlightOuterWrapper = styled(NewComponents.HighlightOuterWrapper)``;
export const HighlightContentWrapper = styled(NewComponents.HighlightContentWrapper)``;
export const HiddenLabel = styled(NewComponents.HiddenLabel)``;
