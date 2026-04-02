/**
 * Legacy styled-components exports for backward compatibility
 *
 * This file maintains the contentTextStyle export as a styled-components css fragment
 * to avoid breaking existing code that uses it. Once all call sites are migrated,
 * this file can be removed.
 *
 * The PageContent component itself has been migrated to plain CSS in PageContent.tsx
 */

import { css } from 'styled-components/macro';
import { contentTextWidth } from '../constants';

export const contentTextStyle = css`
  @media screen { /* full page width in print */
    max-width: ${contentTextWidth}rem;
    margin: 0 auto;
  }
`;
