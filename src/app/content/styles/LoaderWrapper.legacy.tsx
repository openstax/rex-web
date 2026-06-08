import styled from 'styled-components/macro';
import { LoaderWrapper as LoaderWrapperPlain } from './LoaderWrapper.new';

/**
 * Legacy styled-components export for backward compatibility
 *
 * This wraps the plain CSS version with styled() to maintain compatibility
 * with existing code that may use component selectors.
 */
const LoaderWrapper = styled(LoaderWrapperPlain)``;

export default LoaderWrapper;
