/**
 * Legacy styled-components exports for text styles
 *
 * These exports maintain backward compatibility with existing code that uses
 * styled-components css fragments. They will be removed in a future phase
 * once all call sites have been migrated to use plain CSS.
 */

import { css } from 'styled-components/macro';
import theme from '../../theme';

// Export styled-components css fragments for backward compatibility
// These maintain compatibility with existing code that interpolates them in styled-components
export const textStyle = css`
  color: ${theme.color.text.default};
`;
