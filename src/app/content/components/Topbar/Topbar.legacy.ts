/**
 * Legacy styled-components exports for backward compatibility.
 *
 * This file provides styled-components css fragments that are still
 * used by other parts of the codebase. These exports allow consumers to continue
 * using the old API while the Topbar component itself has been migrated to plain CSS.
 *
 * Files that import from this module:
 * - AssignedTopBar.tsx (shadow)
 *
 * NOTE: This file should be removed in a future phase when all consumers
 * have been migrated to use plain CSS or alternative patterns.
 */

import { css } from 'styled-components';

export const shadow = css`
  box-shadow: 0 0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
`;
