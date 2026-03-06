/**
 * Legacy styled-components exports for headings
 *
 * These exports maintain backward compatibility with existing code that uses
 * styled-components css fragments. They will be removed in a future phase
 * once all call sites have been migrated to use plain CSS.
 */

import { css } from 'styled-components/macro';
import theme from '../../theme';

// Export constants for backward compatibility
export const h3MobileFontSize = 1.6;
export const h3MobileLineHeight = 2;

// Base heading style helper
const headingStyle = (fontSize: string, lineHeight: string, topPadding: string) => css`
  color: ${theme.color.text.default};
  font-size: ${fontSize};
  line-height: ${lineHeight};
  letter-spacing: -0.02rem;
  padding: ${topPadding} 0 1rem 0;
  margin: 0;
`;

// Export styled-components css fragments for backward compatibility
// These maintain compatibility with existing code that interpolates them in styled-components
export const h3Style = css`
  ${headingStyle('2.4rem', '3rem', '1.5rem')}
  ${theme.breakpoints.mobile(css`
    font-size: ${h3MobileFontSize}rem;
    line-height: ${h3MobileLineHeight}rem;
  `)}
`;

export const h4DesktopStyle = css`
  ${headingStyle('1.8rem', '2.5rem', '1rem')}
`;

export const h4MobileStyle = css`
  ${headingStyle('1.6rem', '2rem', '1rem')}
`;

export const h4Style = css`
  ${h4DesktopStyle}
  ${theme.breakpoints.mobile(h4MobileStyle)}
`;
