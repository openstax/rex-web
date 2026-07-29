/**
 * Typography Module Entry Point
 *
 * This module exports:
 * 1. Plain CSS components (H1-H6) - no styled-components dependencies
 * 2. Constants that were previously in legacy files - preserved for backward compatibility
 */

import { css } from 'styled-components/macro';
import theme from '../../theme';

// Export plain CSS components (no styled-components dependencies)
export * from './Headings';

// Export link color constants (from Links.constants.ts)
export { linkColor, linkHover } from './Links.constants';

// Export constants that were previously in legacy files for backward compatibility
export const h3MobileLineHeight = 2;
export const textRegularLineHeight = 2.5;

// Export styled-components css fragments for backward compatibility
export const textStyle = css`
  color: ${theme.color.text.default};
`;
