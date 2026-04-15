/**
 * Legacy styled-components exports for backward compatibility
 *
 * This file provides styled-components css fragments that are still used elsewhere in the codebase.
 * These will be removed in a future migration phase once all consumers are updated.
 */

import { css } from 'styled-components/macro';
import { contentTextWidth } from '../constants';

/**
 * contentTextStyle - Legacy css fragment for content text width constraint
 *
 * Used by: Attribution.tsx
 *
 * @deprecated Use plain CSS with .content-text-style class or CSS variables instead
 */
export const contentTextStyle = css`
  @media screen { /* full page width in print */
    max-width: ${contentTextWidth}rem;
    margin: 0 auto;
  }
`;
