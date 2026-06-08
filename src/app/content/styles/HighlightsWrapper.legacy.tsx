import styled from 'styled-components/macro';
import { HighlightsWrapper as HighlightsWrapperPlain } from './HighlightsWrapper.new';

/**
 * Legacy styled-components export for backward compatibility
 *
 * This wraps the plain CSS version with styled() to maintain compatibility
 * with existing code that may use component selectors.
 */
const HighlightsWrapper = styled(HighlightsWrapperPlain)``;

export default HighlightsWrapper;
