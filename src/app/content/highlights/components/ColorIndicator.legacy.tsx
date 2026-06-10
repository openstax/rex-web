import styled from 'styled-components/macro';
import ColorIndicatorPlain, { TrashButton as TrashButtonPlain } from './ColorIndicator.new';

/**
 * Legacy styled-components exports for backward compatibility
 *
 * These wrap the plain CSS versions with styled() to maintain compatibility
 * with existing code that may use component selectors.
 */
export const ColorIndicator = styled(ColorIndicatorPlain)``;

export const TrashButton = styled(TrashButtonPlain)``;

export default ColorIndicator;
