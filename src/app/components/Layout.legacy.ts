// Legacy styled-components exports for backward compatibility
// These will be removed in a future migration phase

import { css } from 'styled-components/macro';
import { layoutPadding } from './Layout.constants';
import theme from '../theme';

/**
 * @deprecated Use plain CSS with layout-body class instead.
 * This styled-components fragment is kept for backward compatibility only.
 */
export const wrapperPadding = css`
  padding: 0 ${layoutPadding.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${layoutPadding.mobile}rem;
  `)}
`;
